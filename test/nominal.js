"use strict";
var g = require('../index.js');
g.debug = true;
var assert = require('assert');

// create a promise function for testing purpose
var promiseFunction = function(param) {
    if (param > 200) throw new Error(param);
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            // all parameter up to 100 will generate awill be rejected
            if (param > 100 && param < 200) return reject(param);

            resolve(param);
        }, 1);
    });
};

describe('Nominal Use Case:', function() {
    it('nominal_test_1: should execute all next of the generator', function(done) {
        // nominal
        var mustExecuteAllNextIfNoError = function * () {

            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(5);
            assert.equal(5, v2);

            return v1 + v2;
        };

        g(mustExecuteAllNextIfNoError)
            .then(function(res) {
                assert.equal(9, res);
                done();
            })
            .catch(done);
    });

    it('nominal_test_2: should catch error if a promise throw an error', function(done) {
        // throw
        var mustCatchAnErrorIfOnePromiseThrow = function * () {
            try {

                var v1 = yield promiseFunction(4);
                assert.equal(4, v1);

                var v2 = yield promiseFunction(500);
                assert(false);

                return v1 + v2;
            } catch (err) {

                return 999;
            }
        };
        g(mustCatchAnErrorIfOnePromiseThrow)
            .then(function(res) {
                assert.equal(999, res);
                done();
            })
            .catch(done);
    });
    
    it('nominal_test_3: should stop generator execution if a promise throw an error', function(done) {
        var mustStopExecutionIfOnePromiseThrow = function * () {


            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(500);
            assert(false);

            return v1 + v2;

        };

        g(mustStopExecutionIfOnePromiseThrow)
            .then(function(res) {

                done('must stop and generator an error');
            })
            .catch(function(err) {
                assert.equal(500, err.message);

                done();
            });

    });

    it('nominal_test_4: should catch error if a promise reject error', function(done) {
        // reject
        var mustCatchAnErrorIfOnePromiseReject = function * () {
            try {

                var v1 = yield promiseFunction(4);
                assert.equal(4, v1);

                var v2 = yield promiseFunction(150);
                assert(false);

                return v1 + v2;
            } catch (err) {
                return 999;
            }
        };

        g(mustCatchAnErrorIfOnePromiseReject)
            .then(function(res) {
                assert.equal(999, res);
                done();
            })
            .catch(done);
    });

    it('nominal_test_5: should stop generator execution if a promise reject error', function(done) {
        var mustStopExecutionIfOnePromiseReject = function * () {

            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(150);
            assert(false);

            return v1 + v2;

        };

        g(mustStopExecutionIfOnePromiseReject)
            .then(function(res) {
                done('must stop and generator an error');
            })
            .catch(function(err) {
                assert.equal(150, err);
                done();
            });
    });




    it('nominal_test_6: should manage yield *', function(done) {


        var genMethod = function * (initValue) {

            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(5);
            assert.equal(5, v2);

            return v1 + v2 + initValue;
        };


        g(function * () {
            var res = yield * genMethod(10);
            assert.equal(19, res);

            res = yield * genMethod(20);
            assert.equal(29, res);

            return 200;
        })
            .then(function(res) {
                assert.equal(200, res);
                done();
            })
            .catch(done);
    });

    it('nominal_test_7: should pass argument to the generator', function(done) {

        g(function * (arg1, arg2) {

            assert.equal(3, arg1);
            assert.equal(7, arg2);
            yield done();
        }, 3, 7);

    });

     it('nominal_test_1: try 1000x', function(done) {
        // nominal
        var mustExecuteAllNextIfNoError = function * () {
            for(let index=0;index<1000;index++){
                var v1 = yield promiseFunction(4);
            }
            assert.equal(4, v1);

            var v2 = yield promiseFunction(5);
            assert.equal(5, v2);

            return v1 + v2;
        };

        g(mustExecuteAllNextIfNoError)
            .then(function(res) {
                assert.equal(9, res);
                done();
            })
            .catch(done);
    });

});
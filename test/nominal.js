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
        }, 100);
    });
};

// nominal
var mustExecuteAllNextIfNoError = function * () {

    var v1 = yield promiseFunction(4);
    assert.equal(4, v1);

    var v2 = yield promiseFunction(5);
    assert.equal(5, v2);

    return v1 + v2;
};

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

var mustStopExecutionIfOnePromiseThrow = function * () {


    var v1 = yield promiseFunction(4);
    assert.equal(4, v1);

    var v2 = yield promiseFunction(500);
    assert(false);

    return v1 + v2;

};

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

var mustStopExecutionIfOnePromiseReject = function * () {

    var v1 = yield promiseFunction(4);
    assert.equal(4, v1);

    var v2 = yield promiseFunction(150);
    assert(false);

    return v1 + v2;

};

describe('Nominal Use Case:', function() {
    it('test_1: should execute all next of the generator', function(done) {
        g(mustExecuteAllNextIfNoError)
            .then(function(res) {
                assert.equal(9, res);
                done();
            })
            .catch(done);
    });

    it('test_2: should catch error if a promise throw an error', function(done) {
        g(mustCatchAnErrorIfOnePromiseThrow)
            .then(function(res) {
                assert.equal(999, res);
                done();
            })
            .catch(done);
    });
    it('test_3: should stop generator execution if a promise throw an error', function(done) {

        g(mustStopExecutionIfOnePromiseThrow)
            .then(function(res) {

                done('must stop and generator an error');
            })
            .catch(function(err) {
                assert.equal(500, err.message);

                done();
            });

    });

    it('test_4: should catch error if a promise reject error', function(done) {
        g(mustCatchAnErrorIfOnePromiseReject)
            .then(function(res) {
                assert.equal(999, res);
                done();
            })
            .catch(done);
    });

    it('test_5: should stop generator execution if a promise reject error', function(done) {
        g(mustStopExecutionIfOnePromiseReject)
            .then(function(res) {
                done('must stop and generator an error');
            })
            .catch(function(err) {
                assert.equal(150, err);
                done();
            });
    });




    it('test_6: should manage yield *', function(done) {

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

            var res = yield * genMethod(20);
            assert.equal(29, res);

            return 200;
        })
            .then(function(res) {
                assert.equal(200, res);
                done();
            })
            .catch(done);
    });
});
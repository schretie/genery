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
        }, 100);
    });
};


describe('All Use Case:', function() {
    it('all_test_1: should execute all generator in parralel', function(done) {

        var generator1 = function * () {

            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(5);
            assert.equal(5, v2);

            return v1 + v2;
        };

        var generator2 = function * () {

            var v1 = yield promiseFunction(10);
            assert.equal(10, v1);

            var v2 = yield promiseFunction(20);
            assert.equal(20, v2);

            return v1 + v2;
        };

        g.all([generator1, generator2])
            .then(function(res) {
                assert.equal(9, res[0]);
                assert.equal(30, res[1]);
                done();
            })
            .catch(done);

    });

     it('all_test_2: should execute all generator in parralel from a generator', function(done) {

        var generator1 = function * () {

            var v1 = yield promiseFunction(4);
            assert.equal(4, v1);

            var v2 = yield promiseFunction(5);
            assert.equal(5, v2);

            return v1 + v2;
        };

        var generator2 = function * () {

            var v1 = yield promiseFunction(10);
            assert.equal(10, v1);

            var v2 = yield promiseFunction(20);
            assert.equal(20, v2);

            return v1 + v2;
        };

        g(function * (){
            var res = yield g.all([generator1, generator2]);
                assert.equal(9, res[0]);
                assert.equal(30, res[1]);
                done();
        });
        
    });


});
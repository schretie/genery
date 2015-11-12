"use strict";
var g = require('../index.js');
g.debug = true;
var assert = require('assert');
var _ = require('lodash');

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
    it('map_test_1: should yield on each item of the list', function(done) {

        var mapper = function * (value) {

            var v1 = yield promiseFunction(value);

            v1 = v1 + 1;

            var v2 = yield promiseFunction(v1);

            v2 = v2 + 1;

            return v2;
        };

        var expected = [3, 4, 5, 6, 7, 8, 9, 10, 11];
        g.map([1, 2, 3, 4, 5, 6, 7, 8, 9], mapper)
            .then(function(res) {

                assert(_.difference(expected, res), res + ' is not equal to ' + expected);
                done();
            })
            .catch(done);

    });



    it('reduce_test_2: should call reduce generator', function(done) {

        var mapper = function * (value) {

            var v1 = yield promiseFunction(value);

            v1 = v1 + 1;

            var v2 = yield promiseFunction(v1);

            v2 = v2 + 1;

            return v2;
        };

        var reducer = function * (currentResult, value) {
            
            var v1 = yield promiseFunction(value);
            return currentResult + v1;
        };


        g(function * () {
            var mapResult = yield g.map([1, 2, 3, 4, 5, 6, 7, 8, 9], mapper);
            var result = yield g.reduce(mapResult, reducer,0);
            assert.equal(63,result);
            done();

        }).catch(done);
    });


});
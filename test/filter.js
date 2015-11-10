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
    it('filter_test_1: should filter using the predicate generator', function(done) {

        var filter = function * (value) {

            var v1 = yield promiseFunction(value);

            return (v1 > 4);
        };

        var expected = [10, 13, 14, 16, 7, 9];
        g.filter([10, 2, 13, 14, 3, 16, 7, 0, 9], filter)
            .then(function(res) {

                assert(_.difference(expected, res), res + ' is not equal to ' + expected);
                done();
            })
            .catch(done);

    });




});
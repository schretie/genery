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


describe('Call Use Case:', function() {
    it('cal_test_1: should call within the given context', function(done) {

        var generator1 = function * () {

            var v1 = yield promiseFunction(this.valueToReturn);
            assert.equal(17, v1);

            return this.valueToReturn;
        };

        var context = {
            valueToReturn: 17
        };

        g.call(context, generator1)
            .then(function(res) {
                assert.equal(17, res);
                done();
            })
            .catch(done);

    });

    it('call_test_2: should call within the given context with master generator', function(done) {

        var generator1 = function * () {

            var v1 = yield g.call(this, subGenerator1);

            assert.equal(17, v1);

            return this.valueToReturn;
        };

        var subGenerator1 = function * () {

            var v1 = yield promiseFunction(this.valueToReturn);
            assert.equal(17, v1);

            return this.valueToReturn;
        };

        var context = {
            valueToReturn: 17
        };

        g.call(context, generator1)
            .then(function(res) {
                assert.equal(17, res);
                done();
            })
            .catch(done);

    });

    it('call_test_3: should call within the given context with yield *', function(done) {

        var generator1 = function * () {

            var v1 = yield * subGenerator1.call(this);

            assert.equal(17, v1);

            return this.valueToReturn;
        };

        var subGenerator1 = function * () {

            var v1 = yield promiseFunction(this.valueToReturn);
            assert.equal(17, v1);

            return this.valueToReturn;
        };

        var context = {
            valueToReturn: 17
        };

        g.call(context, generator1)
            .then(function(res) {
                assert.equal(17, res);
                done();
            })
            .catch(done);
    });

    it('call_test_4: should manage current context', function(done) {
        this.timeout(5000);
        g.traceContext = true;
        var generator1 = function * () {

            var v1 = yield * subGenerator1();

            return g.currentContext.valueToReturn;
        };

        var subGenerator1 = function * () {

            var v1 = yield promiseFunction(g.currentContext.valueToReturn);

            return g.currentContext.valueToReturn;
        };

        g(function * () {
            for (let index = 1; index < 20; index++) {
                let context = {
                    valueToReturn: index
                };

                yield g.call(context, generator1)
                    .then(function(res) {
                        assert.equal(index, res);
                    });
            }
        })
            .then(function(res) {

                g.traceContext = false;
                done();
            })
            .catch(done);

    });

});
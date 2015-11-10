"use strict";
var g = require('../index.js');
g.debug = true;
var assert = require('assert');
var _ = require('lodash');

// dummy promise
var promiseFunction = function(param) {
    return new Promise(function(resolve, reject) {
        resolve(param);
    });
};



describe('Doc Example:', function() {
    it('example_1', function(done) {

        g(function * () {
            var result1 = yield promiseFunction('hello');

            var result2 = yield promiseFunction(' genery');

            return result1 + result2;
        }).then(function(value) {
            // log 'hello genery'
            assert.equal('hello genery', value);
            done();
        });


    });

    it('example_2', function(done) {
        var generatorFct = function * (arg1, arg2) {
            var result1 = yield promiseFunction(arg1);

            var result2 = yield promiseFunction(arg2);

            return result1 + ' ' + result2;
        };

        g(generatorFct, 'hello', 'genery')
            .then(function(value) {
                // log 'hello genery'
                assert.equal('hello genery', value);
                done()
            });
    });

    it('example_3', function(done) {
        var generatorFct = function * (arg1, arg2) {
            var result1 = yield promiseFunction(arg1);

            var result2 = yield promiseFunction(arg2);

            return result1 + ' ' + result2;
        };

        g(function * () {
            var value = yield * generatorFct('hello', 'genery');
            // log 'hello genery'
            assert.equal('hello genery', value);
            done()
        });
    });

    it('example_4_1', function(done) {
        var generatorFct1 = function * () {
            var result = yield promiseFunction('hello');

            return result;
        };

        var generatorFct2 = function * () {
            var result = yield promiseFunction('genery');

            return result;
        };

        g(function * () {
            var value = yield g.all([generatorFct1, generatorFct2]);
            // log 'hello genery'
            assert.equal('hello genery', (value[0] + ' ' + value[1]));
            done();
        });



    });
    it('example_4_2', function(done) {
        var generatorFct1 = function * () {
            var result = yield promiseFunction('hello');

            return result;
        };

        var generatorFct2 = function * () {
            var result = yield promiseFunction('genery');

            return result;
        };

        // or
        g.all([generatorFct1, generatorFct2])
            .then(function(value) {
                // log 'hello genery'
                assert.equal('hello genery', (value[0] + ' ' + value[1]));
                done();
            });

    });

    it('example_5_map_reduce', function(done) {
        var promiseFunction = function(param) {
            return new Promise(function(resolve, reject) {
                resolve(param * param);
            });
        };

        var otherPromiseFunction = function(current, value) {
            return new Promise(function(resolve, reject) {
                resolve(current + value);
            });
        };

        var mapper = function * (value) {
            var result = yield promiseFunction(value);
            return result;
        };

        var reducer = function * (currentResult, value) {
            var result = yield otherPromiseFunction(currentResult, value);
            return result;
        }

        g(function * () {
            var mapResult = yield g.map([1, 2, 3, 4, 5, 6, 7, 8, 9], mapper);
            var initialValue = 0;
            var result = yield g.reduce(mapResult, reducer, initialValue);
            assert.equal(285, result);
            done();
        })
    });

    it('example_6_call', function(done) {
        var context = {
            param1: 'hello',
            param2: ' genery'
        }

        g.call(context, function * () {
            var result1 = yield promiseFunction(this.param1);

            var result2 = yield promiseFunction(this.param2);

            return result1 + result2;
        }).then(function(value) {
            // log 'hello genery'
            assert.equal('hello genery', value);
            done();
        }).catch(done);


    });

    it('example_7_filter', function(done) {

        var filterPromise = function(param) {
            return new Promise(function(resolve, reject) {
                if (param > 4) resolve(true);
                else resolve(false);
            });
        };

        var filter = function * (value) {

            var v1 = yield filterPromise(value);

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

    it('example_8_currentContext', function(done) {
        var logger = {
            info: function(message) {
                console.log('[INFO] ' + JSON.stringify(g.currentContext.logInfo) + ' ' + message);
            }
        };

        var process = function() {
            logger.info('process');
            return new Promise(function(resolve, reject) {
                resolve();
            });
        };

        var generator = function * () {
            logger.info('call sub generator 1');
            yield * subGenerator();
            yield process();
            logger.info('call sub generator 2');
            yield * subGenerator();
        };

        var subGenerator = function * () {
            logger.info('call sub-sub generator ');
            yield * subSubGenerator();
        };

        var subSubGenerator = function * () {
            logger.info('call process');
            yield process();
        };

        g.map([1, 2, 3, 4, 5, 6, 7], function * (index) {

            let context = {
                logInfo: {
                    sessionId: index,
                    event: 'PROCESS'
                }
            }

            yield g.call(context, generator);

        }).then(function() {
            done()
        }).catch(done)
    });
});



"use strict";
var util = require('util');

var currentContext;

var run = function(generatorFct) {

    var context = this;
    // retrieve args
    var generatorArgument = Array.prototype.slice.call(arguments, 1);

    // call the generator
    var generator = generatorFct.apply(context, generatorArgument);

    // build the function that chain the next
    // isError is true if must throw an error on the generator
    var next = function(param, isError) {

        return new Promise(function(resolve, reject) {

            var result;
            try {
                // assign current context 
                exports.currentContext = context;

                // check if genery must hande an error
                if (isError) {
                    if (exports.debug === true) {
                        console.log('[GENERY] thorw ');
                        if (exports.traceContext === true) console.log(context);
                    }
                    result = generator.throw(param);
                } else {
                       
                      if (exports.traceContext === true) console.log(context);
                    
                    result = generator.next(param);
                    if (exports.trace === true) console.log('[GENERY] result=' + util.inspect(result));
                }


                // means end of the execution chain
                if (result.done === true)
                    return resolve(result.value);

                // check if the value to process 
                if (result.value && result.value.then) {

                    resolve(result.value
                        .then(function(value) {
                            return next(value);
                        }, function(err) {
                            return next(err, true);
                        }));

                }
                // is it an array of promises
                else if (Array.isArray(result.value)) {
                    resolve(Promise.all(result.value)
                        .then(function(value) {
                            return next(value);
                        }, function(err) {
                            return next(err, true);
                        }));


                }
                // if it is simply a js object or empty
                else {
                    return next(result.value);
                }

            } catch (err) {
                if (exports.debug === true) {
                    console.log('[GENERY] catch error ' + err);
                    console.log('[GENERY] catch error stack ' + err.stack);
                    if (exports.traceContext === true) console.log(context);
                }

                return reject(err);
            }
        });
    };

    return next();
};

// ToDo : add list of parameter for each generator
var all = function(generatorList) {
    var deffered = [];
    generatorList.forEach(function(gen) {
        deffered.push(run(gen));
    });
    return Promise.all(deffered);
};

var call = function() {
    var runArgument = Array.prototype.slice.call(arguments, 1);
    return run.apply(arguments[0], runArgument);
};

// ToDo : add list of parameter to inject to each generator:
// map([1,2,3],param2,param3,theWorker)
var reduce = function(list, generator, initialValue) {
    return run(function * () {

        let result = initialValue;
        for (let index = 0; index < list.length; index++) {
            // Todo: check it is a promise 
            result = yield * generator(result, list[index]);
        }
        return result;
    });
};

var map = function(list, generator) {
    var deffered = [];
    var results = [];
    for (let index = 0; index < list.length; index++) {
        // Todo: check if it is a promise 
        deffered.push(run(generator, list[index])
            .then(function(result) {
                results[index] = result;
            }));
    }

    return Promise.all(deffered).then(function() {
        return results;
    });

};

var filter = function(list, filterGenerator) {
    var deffered = [];
    var results = [];
    for (let index = 0; index < list.length; index++) {
        // Todo: check if it is a promise 
        deffered.push(run(filterGenerator, list[index])
            .then(function(result) {
                if (result)
                    results.push(list[index]);
            }));
    }

    return Promise.all(deffered).then(function() {
        return results;
    });
};


module.exports = exports = run;
exports.all = all;
exports.debug = false;
exports.trace = false;
exports.traceContext = false;
exports.call = call;
exports.currentContext = null;
exports.reduce = reduce;
exports.map = map;
exports.filter = filter;
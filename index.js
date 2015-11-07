"use strict";

module.exports = function(generatorFct) {
    // retrieve args
    var generatorArgument = Array.prototype.slice.call(arguments,1);

    // call the generator
    var generator = generatorFct.apply(this,generatorArgument);

    // build the function that chain the next
    // isError is true if must throw an error on the generator
    var next = function(param, isError) {

        return new Promise(function(resolve, reject) {

            var result;
            try {
                if (isError) {
                    result = generator.throw(param);
                } else {
                    result = generator.next(param);
                }

                // means end of the execution chain
                if (result.done === true)
                    return resolve(result.value);

                resolve(result.value
                    .then(function(value) {
                        return next(value);
                    }, function(err) {
                        return next(err, true);
                    }));

            } catch (err) {
                if (exports.debug===true) console.log('[GENERY] catch error '+err);
                return reject(err);
            }
        });
    };

    return next();
};

exports.debug =false;

exports.all = function(generatorList){



};
"use strict";
var g=require('./genery');

exports.it = function(name, generator){
    it(name,function(done){
        g(generator,done).catch(done);
    });
};


exports.before = function( generator){
    before(function(done){
        g(generator,done).catch(done);
    });
};

exports.after = function( generator){
    after(function(done){
        g(generator,done).catch(done);
    });
};
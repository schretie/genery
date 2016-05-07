"use strict";
var g = require('./genery');

exports.it = function(name, generator) {
    it(name, function(done) {
        g.call(this, generator).then(function() {
            done();
        }).catch(done);
    });
};


exports.before = function(generator) {
    before(function(done) {
        g.call(this, generator).then(function() {
            done();
        }).catch(done);
    });
};

exports.after = function(generator) {
    after(function(done) {
        g.call(this, generator).then(function() {
        	console.log('after')
            done();
        }).catch(done);
    });
};
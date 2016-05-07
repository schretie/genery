"use strict";

var g = require('./genery');
var methods = require('methods');
var DI = require('./di');
methods.push('all');
methods.push('engine');

var util = require('util');

// missing:
// param('id', function (req, res, next, id) 
// render(view, [locals], function(err, html))
// use([path,] function [, function...])
class App extends DI {
    constructor(app) {
        super();
        this.expressApp = app;
    }

    get app() {
        return this.expressApp;
    }

    set app(value) {
        this.expressApp = value;
    }

    //port, [hostname], [backlog], [callback]
    listen(port, hostname, backlog) {
        let self = this;
        return new Promise(function(resolve, reject) {

            let server = self.expressApp.listen(port, hostname, backlog, function(err) {

                if (err) reject(err);
                else resolve(server);
            });
        });
    }

    close() {
        let self = this;
        return new Promise(function(resolve, reject) {

            self.expressApp.close(function(err) {

                if (err) reject(err);
                else resolve();
            });
        });
    }

    on(event, gen) {
        this.expressApp.on(event, function(parent) {
            g(gen, parent);
        });
    }
}


// app.get('/test',function *(req,res,next){
//      ...
//      yield *next(); -->
//})
var buildNextGenerator = function(fct, req, res, next) {
    return function * () {
        yield * fct(req, res, next);
    };
};

function wrapper(app) {

    var newApp = new App(app);


    for (let method in app) {
        if (method !== 'on' && method !== 'listen' && method !== 'close')
            newApp[method] = app[method];
    }

    methods.forEach(function(method) {
        newApp[method] = function() {

            let args = arguments;
            let pathOrName = args[0];

            if (method === 'get' && args[1] === undefined) return app.get(pathOrName);
            // if there is q list of dependency
            //TODO manage array of callback also...

            app[method](pathOrName, function(req, res) {
                let ctx = {
                    req, res
                };

                let index = 1;

                let _next = function * () {

                    if (args[index] === undefined)
                        return;

                    if (Array.isArray(args[index]))
                        yield * newApp.injectTo(args[index++], ctx);

                    if (args[index] === undefined)
                        return;

                    yield * args[index++].call(ctx, req, res, _next);
                };

                g.call(ctx, _next);
            });

        };
    });



    return newApp;
}


module.exports = wrapper;
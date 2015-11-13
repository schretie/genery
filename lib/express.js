"use strict";
var g = require('./genery');
var methods = require('methods');

methods.push('all');
methods.push('engine');
// missing:
// param('id', function (req, res, next, id) 
// render(view, [locals], function(err, html))
// use([path,] function [, function...])
module.exports = function(app) {


    var newApp = {app:app};
    for(let method in app){
    	newApp[method] = app[app];
    }


    // app.get('/test',function *(req,res,next){
    //		...
    //      yield *next(); -->
    //})
    var buildNextGenerator = function(fct, req, res, next) {
        return function * () {
            yield * fct(req, res, next);
        };
    };


    methods.forEach(function(method) {
        newApp[method] = function() {
            let args = arguments;
            let pathOrName = args[0];
            if (method === 'get' && args[1] === undefined) return app.get(pathOrName);

            // TODO manage array of callback also...

            app[method](pathOrName, function(req, res) {
                let index = 1;

                let next = function * () {

                    if (args[index] === undefined) {
                        return;
                    }

                    yield * args[index++](req, res, next);
                };
                g(next);
            });

        };
    });

    //port, [hostname], [backlog], [callback]
    newApp.listen = function(port, hostname, backlog) {

        return new Promise(function(resolve, reject) {

            let server = app.listen(port, hostname, backlog, function(err) {

                if (err) reject(err);
                else resolve(server);
            });
        });
    };

    newApp.on = function(event,gen){
    	app.on(event,function(parent){
    		g(gen,parent);
    	});
    };

    return newApp;
};
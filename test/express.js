"use strict";
var g = require('../index.js');
g.debug = false;
var assert = require('assert');
var express = require('express');
var rp = require('request-promise');
var bodyParser = require('body-parser');
var mocha = g.mocha;
var services = require('./services');
var util = require('util');

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

describe('express', function() {
    var app, server;

    mocha.before(function * () {
        this.timeout(5000);
        console.log('start');
        // start express
        app = g.express(express());

        app.app.use(bodyParser.json());

        server = yield app.listen(3000);

        var host = server.address().address;
        var port = server.address().port;

        console.log('listening at http://%s:%s', host, port);


    });

    mocha.it('express_test_1_get: ', function * () {
        app.get('/test1', function * (req, res) {
            var response = yield promiseFunction(req.query.value);

            res.send(response);
        });

        var response = yield rp({
            method: 'GET',
            uri: 'http://localhost:3000/test1?value=12'
        });

        assert.equal('12', response);


    });

    mocha.it('express_test_5_delete: ', function * () {
        app.delete('/test5', function * (req, res) {
            var response = yield promiseFunction(req.query.value);

            res.send(response);
        });

        var response = yield rp({
            method: 'DELETE',
            uri: 'http://localhost:3000/test5?value=12'
        });

        assert.equal('12', response);

    });

    mocha.it('express_test_2_put: ', function * () {
        app.put('/test2', function * (req, res) {

            var response = yield promiseFunction(req.body.value);

            res.send({
                value: response
            });
        });

        var response = yield rp({
            method: 'PUT',
            uri: 'http://localhost:3000/test2',
            json: true,
            body: {
                value: 12
            },
            contentType: 'application/json'
        });

        assert.equal('12', response.value);


    });

    mocha.it('express_test_3_post: ', function * () {
        app.post('/test3', function * (req, res) {

            var response = yield promiseFunction(req.body.value);

            res.send({
                value: response
            });
        });

        var response = yield rp({
            method: 'POST',
            uri: 'http://localhost:3000/test3',
            json: true,
            body: {
                value: 12
            },
            contentType: 'application/json'
        });

        assert.equal('12', response.value);


    });

    mocha.it('express_test_6_get_next: ', function * () {
        var value;
        app.get('/test6',
            function * (req, res, next) {
                value = req.query.value;
                yield * next();
            },
            function * (req, res) {
                var response = yield promiseFunction(value);

                res.send(response);
            });

        var response = yield rp({
            method: 'GET',
            uri: 'http://localhost:3000/test6?value=12'
        });

        assert.equal('12', response);


    });


    mocha.it('express_test_7_register_service: ', function * () {

        // register all expected services
        app.register(services.Logger, 'logger', 'singleton');
        app.register(services.config1, 'config', 'static');
        app.register(services.DBKeyValueStore, 'db', 'singleton');


        app.get('/test7', ['db'], function * (req, res) {
            var response = yield * this.db.get(req.query.key);

            res.send(response);
        });

        app.put('/test7', ['db'], function * (req, res) {
            let status = yield * this.db.set(req.query.key, req.query.value);

            res.send(status);
        });

        var response = yield rp({
            method: 'PUT',
            uri: 'http://localhost:3000/test7?key=counter&value=12'
        });

        assert.equal('true', response);
        response = yield rp({
            method: 'GET',
            uri: 'http://localhost:3000/test7?key=counter'
        });

        assert.equal('12', response);


    });

    mocha.after(function * () {

        server.close();
        console.log('closed')

    });
});
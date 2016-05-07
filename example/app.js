"use strict";

let g = require('../index.js');
let express = require('express');
let bodyParser = require('body-parser');
let Logger = require('./logger');
let DB = require('./db');
let config = require('./config');
let Todos = require('./todosModel');
let configTest = require('./configTest');

g(function * () {
    // start express
    let gapp = g.express(express());

    gapp.app.use(bodyParser.json());

    // register services
    gapp.register(Logger, 'logger', 'singleton');
    gapp.register(config, 'config', 'static');
    gapp.register(DB, 'db', 'singleton');
    gapp.register(Todos, 'Todo', 'static');

    let server = yield gapp.listen(3000);

    console.log('listening');

    gapp.app.use(bodyParser.json());

    // gestion de session, ...

    gapp.put('/todos', ['Todo'],function * () {
    	console.log('put /todos')
        try {
            let todo = new this.Todo();
            todo.name = this.req.body.name;
            todo.content = this.req.body.content;
            yield todo.save().exec();

            this.res.send({
                status: 'ok'
            });
        } catch (err) {
            this.res.send({
                status: 'nok',
                message: err
            });
        }
    });

    gapp.get('/todos',['Todo'], function * () {
    	console.log('get /todos')
        try {
            let list = yield this.Todo.find({}).exec();

            if (list === null || list.length === 0) {
                this.res.send({
                    status: 'nok',
                    message: 'No Todo'
                });
            } else {
                this.res.send({
                    status: 'ok',
                    todos: list
                });
            }
        } catch (err) {
            this.res.send({
                status: 'nok',
                message: err
            });
        }
    });

    gapp.get('/todos/:name',['Todo'], function * () {
        try {
            let todo = yield this.Todo.findOne({
                name: this.req.params.name
            }).exec();

            if (todo === null) {
                this.res.send({
                    status: 'nok',
                    message: 'Unknown Todo'
                });
            } else {
                this.res.send({
                    status: 'ok',
                    todo: todo
                });
            }
        } catch (err) {
            this.res.send({
                status: 'nok',
                message: err
            });
        }
    });

    gapp.delete('/todos/:name',['Todo'], function * () {
        try {
            yield this.Todo.delete({
                name: this.req.params.name
            }).exec();

            this.res.send({
                status: 'ok'
            });
        } catch (err) {
            this.res.send({
                status: 'nok',
                message: err
            });
        }
    });
}).catch(console.log);


//let session = require('cookie-session');
/* gapp.app.use(session({
        secret: 'mySecret'
    }));
*/
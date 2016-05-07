"use strict";



exports.genConstructor() = function * {
    console.log('Model')
    let TodoSchema = this.db.Schema({
        name: String,
        content: String
    });

    Todo = this.db.model('Todo', TodoSchema);
    this.logger.info('mongodb connection ok');

 	return Todo;
}

Model.$inject = ['logger', 'db'];

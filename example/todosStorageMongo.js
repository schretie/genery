let mongoose = require('mongoose');
// use native promise
mongoose.Promise = Promise;

class Storage {

    * genConstructor() {

        let TodoSchema = this.db.Schema({
            name: String,
            content: String
        });

        this.Todo = this.db.model('Todo', TodoSchema);
        this.logger.info('mongodb connection ok');
    }

    get(name) {
        return Todo.findOne({
            name: name
        }).exec();
    }

    set(name, content) {
        let todo = new Todo();
        todo.name = name;
        todo.content = content;
        return todo.save().exec();
    }

    getAll() {
        return Todo.find({
            name: name
        }).exec();
    }

    delete(name) {
        return Todo.remove({
            name: name
        }).exec();
    }

}

Storage.$inject = ['config', 'logger', 'db'];

module.exports = Storage;
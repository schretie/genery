"use strict";

let mongoose = require('mongoose');
// use native promise
mongoose.Promise = Promise;

class DB {

    * genConstructor() {
        if (this.config.dbUrl === undefined) throw new Error('dbUrl is missing');
        mongoose.connect(this.config.dbUrl);

        this.db = mongoose.connection;
        let p = new Promise(function(resolve, reject) {
            db.once('open', resolve);
            db.on('error', reject);
        });
        yield p;
    }

    model(){
    	this.db.apply(this.db,arguments);
    }

}

DB.$inject = ['config', 'logger'];

module.exports = DB;
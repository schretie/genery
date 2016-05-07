"use strict";

// REDIS MOCK IMPLEMENTATION
class Mock { 

	* genConstructor() {
        this.data = {};
    }

    get(key) {
        return  this.data[key];
    }

     set(key, value) {
        this.data[key] = value;

        return true;
    }

     getAll() {
    	return this.data;
    }

     delete(key) {
    	 this.data[key] = undefined;
    }

}

Mock.$inject = ['config','logger'];

module.exports = Mock;
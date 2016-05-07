"use strict";
// LOGGER SERVICE
class Logger {
    info(message) {
        console.log('[INFO] ' + this.config.name + ' ' + message);
    }
}

Logger.$inject = ['config'];

// CONFIG 1
exports.config1 = {
    name: 'unitMochaTest',
    dbUrl: 'http;//localhost:1234'
};

// CONFIG 2
exports.config2 = {
    name: 'unitMochaTest',
    dbUrl: 'http;//localhost:2878'
};

// DB key store service
class DBKeyValueStore {

    * genConstructor() {
        if (this.config.dbUrl === undefined) throw new Error(1435);
        yield this.logger.info('Connect ot the fake DB ' + this.config.dbUrl);
        this.data = {};
    }

    * get(key) {
        let value = yield this.data[key];
        return value;
    }

    * set(key, value) {
        this.data[key] = value;

        // fake yield
        yield value;

        return true;
    }

}
DBKeyValueStore.$inject = ['logger', 'config'];

// Another DB Key store service
class AnotherDBKeyValueStore {

    * genConstructor() {
        if (this.config.dbUrl === undefined) throw new Error(1435);
        yield logger.info('Connect ot the fake Another DB ' + this.config.dbUrl);
        this.data = {};
    }

    * get(key) {
        
        return yield this.data[key];
    }

    * set(key, value) {
        
        this.data[key] = value;
        // fake yield
        yield value;
        return true;
    }

}

AnotherDBKeyValueStore.$inject = ['logger', 'config'];

// exports
exports.Logger = Logger;
exports.DBKeyValueStore = DBKeyValueStore;
exports.AnotherDBKeyValueStore = AnotherDBKeyValueStore;
"use strict";
// LOGGER SERVICE
class Logger {
    info(message) {
        console.log('[INFO ' + this.config.appName + '] ' + message);
    }

    debug(message) {
        console.log('[DEBUG ' + this.config.appName + '] ' + message);
    }
}

Logger.$inject = ['config'];

module.ex
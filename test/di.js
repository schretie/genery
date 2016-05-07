"use strict";

var g = require('../index.js');
var assert = require('assert');
var mocha = g.mocha;
var DI = g.DI;

var promiseFunction = function(param) {
    return new Promise(function(resolve, reject) {
        resolve(param);
    });
};



describe('Dependency_Injection', function() {

    mocha.it('di_test_1_nominal', function * () {
        class Logger {
            info(message) {
                console.log('[INFO] ' + this.config.name + ' ' + message);
            }
        }
        Logger.$inject = ['config'];

        class ASyncDep {

            * genMethod(value) {
                this.logger.info('ASyncDep.genMethod');
                return yield promiseFunction(value);
            }
        }

        ASyncDep.$inject = ['logger'];

        class AService {

            * genConstructor() {
                this.logger.info('AService.genConstructor');
                this.value = yield * this.aSyncDep.genMethod(14);
            }

            * genMethod(param) {
                this.logger.info('AService.genMethod');
                return yield promiseFunction(this.value + param);
            }
        }

        AService.$inject = ['aSyncDep', 'logger'];
        var container = new DI();
        container.register({
            name: 'test'
        }, 'config', 'static');
        container.register(Logger, 'logger', 'singleton');
        container.register(ASyncDep, 'aSyncDep');
        container.register(AService, 'aservice');

        let service = yield * container.require('aservice');
        let result = yield * service.genMethod(4);
        assert.equal(18, result);

    });


    mocha.it('di_test_2_static', function * () {
        var container = new DI();
        container.register({
            name: 'test'
        }, 'config', 'static');
        container.register(class {
            test() {
                return 43;
            }
        }, 'AClass', 'static');

        var config = yield * container.require('config');

        assert.equal('test', config.name);
        let AClass = yield * container.require('AClass');
        let aClass = new AClass();

        assert.equal(43, aClass.test());
 
    });

    mocha.it('di_test_3_singleton', function * () {
        var container = new DI();
        container.register(class {
            getValue() {
                return this.value;
            }

            setValue(newValue) {
                this.value = newValue;
            }
        }, 'AClass', 'singleton');

        let aClass = yield * container.require('AClass');
        assert.equal(undefined, aClass.getValue());
        aClass.setValue(10);
        assert.equal(10, aClass.getValue());
        let anOtherClass = yield * container.require('AClass');
        assert.equal(10, anOtherClass.getValue());
        anOtherClass.setValue(14);
        assert.equal(14, anOtherClass.getValue());
        assert.equal(14, aClass.getValue());
        assert.equal(aClass, anOtherClass);
       
    });

    mocha.it('di_test_4_factory', function * () {

        var container = new DI();
        container.register(class {
            getValue() {
                return this.value;
            }

            setValue(newValue) {
                this.value = newValue;
            }
        }, 'AClass', 'factory');

        let aClass = yield * container.require('AClass');
        let anOtherClass = yield * container.require('AClass');

        assert.notEqual(aClass, anOtherClass);
        aClass.setValue(10);
        anOtherClass.setValue(14);
        assert.equal(10, aClass.getValue());
        assert.equal(14, anOtherClass.getValue());
       
    });


    mocha.it('di_test_5_injectTo', function * () {
        var container = new DI();

        var self = {};

        container.register(class {
            getValue() {
                return this.value;
            }

            setValue(newValue) {
                this.value = newValue;
            }
        }, 'aClass', 'singleton');


        yield * container.injectTo(['aClass'], self);
        assert.equal(undefined, self.aClass.getValue());
        self.aClass.setValue(10);
        assert.equal(10, self.aClass.getValue());
  
    });

});
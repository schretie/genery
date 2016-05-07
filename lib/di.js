"use strict";

class DI {
    constructor() {
        this.services = {};
    }

    /**
     * resolve all dependency and inject it in the instance
     */

    * injectDependency(dependencies, instance, trace) {

        if (dependencies) {
            for (let index in dependencies) {
                let name = dependencies[index];
                if (exports.isTrace) console.log(trace + '=>inject ' + name);
                let dependency = this.services[name];

                if (dependency) {
                    let dependencyInstance = yield * this.buildService(dependency, trace + '=>' + name);
                    // inject
                    instance[name] = dependencyInstance;
                    // and call the generator constructor if any

                    if (dependency.Service.prototype &&
                        dependency.Service.prototype.genConstructor) {
                        yield * dependencyInstance.genConstructor();
                    }
                } else {
                    throw new Error('unresolved ' + name);
                }
            }
        } else
        if (exports.isTrace) console.log(trace + '=> no dependency');
    }

    * instanciateService(service) {
        let instance;
        if (service.Service.genConstructor) {
            yield * this.injectDependency(service.$inject, instance, trace);
            instance = yield * service.Service.genConstructor.call(instance);
        } else {
            instance = new service.Service();
            yield * this.injectDependency(service.$inject, instance, trace);
            if (service.Service.prototype && service.Service.prototype.genConstructor)
                yield * instance.genConstructor();
        }
        return instance;
    }



    /**
     * build a service and resolve dependency
     */
    * buildService(service, trace) {
        trace = trace || service.name;
        if (exports.isTrace) console.log(trace + '=>build service ' + service.name);

        var instance;

        if (service.type === 'factory') {
            instance = new service.Service();
            yield * this.injectDependency(service.$inject, instance, trace);
            if (service.Service.prototype && service.Service.prototype.genConstructor)
                yield * instance.genConstructor();

        } else if (service.type === 'singleton') {
            instance = service.singleton;
            if (instance === undefined) {
                instance = new service.Service();
                service.singleton = instance;
                yield * this.injectDependency(service.$inject, instance, trace);
                if (service.Service.prototype && service.Service.prototype.genConstructor)
                    yield * instance.genConstructor();
            }
        } else if (service.type === 'static') {
            instance = service.Service;
            if (instance.genConstructor)
                yield * instance.genConstructor();
        } else {
            throw new Error(' unknown type ' + service);
        }

        return instance;
    }

    register(service, serviceName, type) {
        if (exports.isTrace)
            console.log('register ' + serviceName);

        if (typeof service === 'string') {
            service = require(); ///
        }
        // push the new service
        this.services[serviceName] = {
            name: serviceName || service.$name,
            type: type || service.$type || 'factory',
            Service: service,
            singleton: undefined,
            $inject: service.$inject
        };

    }

    * require(serviceName) {
        if (exports.isTrace) console.log('require ' + serviceName);

        var service = this.services[serviceName];

        if (service === undefined) throw new Error('service ' + serviceName + ' is unavailable');
        let instance = yield * this.buildService(service);

        return instance;
    }

    * injectTo(listOfService, self) {
        if (exports.isTrace) console.log('inject ' + listOfService);
        for (let index in listOfService) {
            let name = listOfService[index];
            var service = yield * this.require(name);
            self[name] = service;

        }
        if (exports.isTrace) console.log('inject ' + self);
    }
}

module.exports = DI;
exports.isTrace = true;
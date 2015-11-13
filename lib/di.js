"use strict";

class DI {
    constructor() {
        this.services = {};
    }

    register(service) {
        var generatorArgument = Array.prototype.slice.call(arguments, 1);
        console.log(service);
        this.services[service.name] = {
            type: service.type,
            Service: service,
            singleton:undefined
        };

        service.$inject
            .forEach(function(name) {
                let service = this.services[name];
                if (service) {
                    var dependency;
                    if (service.type === 'factory') {
                        dependency = new service.Service();
                    } else if (service.type === 'singleton') {
                        dependency = service.instance;
                        if (dependency === undefined) {
                            dependency = new service.Service();
                            service.singleton = dependency;
                        }
                    } else if (service.type === 'static') {
                        dependency = service.Service;
                    } else {
                        throw new Error(name + ' unknown type ' + service);
                    }
                    service[name] = dependency;
                } else {
                    throw new Error('unresolved ' + name);
                }
            });
    }

    registerStatic(name, service) {
        this.services[service.name] = {
            type: 'static',
            Service: service
        };
    }

    require(name) {
        var service = this.services[name];
        if (service === undefined) throw new Error('service ' + name + ' is unavailable');
        return service;
    }

}

module.exports = DI;

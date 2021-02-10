"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var constants_1 = require("./constants");
var Registry_1 = require("./Registry");
var resolver_1 = require("./resolver");
var utils_1 = require("./utils");
var Container = (function () {
    function Container() {
        this.registeries = new Map();
        this.registeries.set(constants_1.NO_NAMESPACE.toLowerCase(), new Registry_1.Registry(this));
    }
    Container.prototype.bind = function (name, safe, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        var value = this.registeries.get(namespace.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeRegistry(value)) {
            return;
        }
        return value.bind(name, safe);
    };
    Container.prototype.unbind = function (name, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        var value = this.registeries.get(namespace.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeRegistry(value)) {
            return;
        }
        value.unbind(name);
    };
    Container.prototype.rebind = function (name, safe, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        this.unbind(name, namespace);
        return this.bind(name, safe, namespace);
    };
    Container.prototype.addNamespace = function (name, func) {
        if (this.registeries.has(name.toLowerCase())) {
            throw new Error("Cannot replace a namespace");
        }
        this.registeries.set(name.toLowerCase(), func !== null && func !== void 0 ? func : new Registry_1.Registry(this));
    };
    Container.prototype.getNamespace = function (name) {
        var value = this.registeries.get(name.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeRegistry(value)) {
            return;
        }
        return value;
    };
    Container.prototype.removeNamespace = function (name) {
        if (name.toLowerCase() === constants_1.NO_NAMESPACE.toLowerCase()) {
            throw new Error("Default namespace cant be removed");
        }
        var value = this.registeries.get(name.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeRegistry(value) && !value.canBeRemoved()) {
            throw new Error("Namespace not empty");
        }
        if (utils_1.isNativeRegistry(value) && !value.empty) {
            throw new Error("Namespace not empty");
        }
        this.registeries.delete(name);
    };
    Container.prototype.resolve = function (injectionEntry) {
        var resolve = injectionEntry.split(":");
        if (resolve.length < 2) {
            resolve.unshift(constants_1.NO_NAMESPACE.toLowerCase());
        }
        var namespace = this.getNamespace(resolve[0]);
        if (!namespace) {
            var customRegistry = this.registeries.get(resolve[0].toLowerCase());
            if (!customRegistry) {
                throw new Error("Invalid namespace");
            }
            resolve.shift();
            if (resolve.length !== 1) {
                throw new Error("Invalid resolve string");
            }
            var value = customRegistry.getter(resolve.join(""));
            if (typeof value === "undefined") {
                throw new Error("Invalid resolve dependency");
            }
            return value;
        }
        resolve.shift();
        if (resolve.length !== 1) {
            throw new Error("Invalid resolve string");
        }
        return namespace.resolve(resolve.join(""));
    };
    Container.prototype.create = function (clazz, parameters) {
        return resolver_1.resolve(clazz, this, parameters);
    };
    return Container;
}());
exports.Container = Container;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.afterConstruct = exports.lazyInject = exports.bindLazyInject = exports.inject = void 0;
var constants_1 = require("./constants");
function inject(name, namespace, filter, array) {
    namespace = namespace === null || namespace === void 0 ? void 0 : namespace.toLowerCase();
    return function (target, key, index) {
        if (index && !key) {
            throw new Error("Parameter injection without name");
        }
        var injections;
        if (typeof index === "undefined") {
            if (Reflect.hasMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.PROPERTY_INJECT, target.constructor)) {
                injections = Reflect.getMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.PROPERTY_INJECT, target.constructor);
            }
            else {
                injections = new Map();
                Reflect.defineMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.PROPERTY_INJECT, injections, target.constructor);
            }
        }
        else {
            if (Reflect.hasMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.CONSTRUCTOR_INJECT, target)) {
                injections = Reflect.getMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.CONSTRUCTOR_INJECT, target);
            }
            else {
                injections = new Map();
                Reflect.defineMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.CONSTRUCTOR_INJECT, injections, target);
            }
        }
        injections.set(index !== null && index !== void 0 ? index : key, {
            name: name !== null && name !== void 0 ? name : key.toString(),
            namespace: namespace,
            filter: filter,
            array: array,
        });
    };
}
exports.inject = inject;
function bindLazyInject(container) {
    return lazyInject.bind(this, container);
}
exports.bindLazyInject = bindLazyInject;
function lazyInject(container, name, namespace, filter, array, cache) {
    if (cache === void 0) { cache = true; }
    return function (target, key) {
        var injectionValue = "" + (namespace ? namespace + ":" : "") + (name !== null && name !== void 0 ? name : key.toString());
        var cached;
        var getter = function () {
            if (cached) {
                return cached;
            }
            var v = container.resolve(injectionValue, filter, array);
            if (cache) {
                cached = v;
            }
            return v;
        };
        var setter = function (v) {
            cached = v;
        };
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get: getter,
            set: setter,
        });
    };
}
exports.lazyInject = lazyInject;
function afterConstruct() {
    return function (target, key) {
        Reflect.defineMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.AFTER_CONSTRUCT, key, target.constructor);
    };
}
exports.afterConstruct = afterConstruct;

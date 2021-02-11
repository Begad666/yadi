"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithObject = exports.ToObject = exports.Namespace = void 0;
var resolver_1 = require("./resolver");
var Namespace = (function () {
    function Namespace(parent) {
        this.parent = parent;
        this.interfaces = new Map();
    }
    Namespace.prototype.bind = function (name) {
        var _this = this;
        if (!this.interfaces.has(name)) {
            this.interfaces.set(name, {
                name: name,
                implementations: [],
            });
        }
        var object = {};
        return new ToObject(object, function () {
            return _this.interfaces
                .get(name)
                .implementations.push(object);
        });
    };
    Namespace.prototype.unbind = function (name) {
        this.interfaces.delete(name);
    };
    Namespace.prototype.rebind = function (name) {
        this.unbind(name);
        return this.bind(name);
    };
    Namespace.prototype.resolve = function (dependency, filter, array) {
        var e_1, _a;
        var interfacee = this.interfaces.get(dependency);
        if (!interfacee) {
            throw new Error("Invalid dependency");
        }
        var impls = resolver_1.resolveImplementations(interfacee.implementations, filter);
        if (!array) {
            if (impls.length > 1) {
                throw new Error("More than one dependency found. Make sure you apply different with* functions to different dependencies");
            }
            var foundImpl = impls[0];
            if (!foundImpl) {
                if (!interfacee.implementations.length) {
                    throw new Error("Dependency not binded. You called bind without calling any of to* functions");
                }
                else {
                    throw new Error("Dependency not found");
                }
            }
            switch (foundImpl.type) {
                case "class": {
                    if (foundImpl.singleton && foundImpl.instance) {
                        return foundImpl.instance;
                    }
                    var impl = foundImpl.class;
                    var instance = this.parent.create(impl);
                    if (foundImpl.singleton) {
                        foundImpl.instance = instance;
                    }
                    return instance;
                }
                case "value": {
                    var value = void 0;
                    if (foundImpl.subType === "constant") {
                        value = foundImpl.value;
                    }
                    else {
                        value = foundImpl.valueFunc();
                    }
                    return value;
                }
            }
        }
        else {
            var deps = [];
            if (!impls.length) {
                if (!interfacee.implementations.length) {
                    throw new Error("Dependency not binded. You called bind without calling any of the to* functions");
                }
                else {
                    throw new Error("Dependency not found");
                }
            }
            try {
                for (var _b = __values(impls.slice(0, filter === null || filter === void 0 ? void 0 : filter.arrayMaxSize)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var foundImpl = _c.value;
                    switch (foundImpl.type) {
                        case "class": {
                            if (foundImpl.singleton && foundImpl.instance) {
                                return foundImpl.instance;
                            }
                            var impl = foundImpl.class;
                            var instance = this.parent.create(impl);
                            if (foundImpl.singleton) {
                                foundImpl.instance = instance;
                            }
                            deps.push(instance);
                            break;
                        }
                        case "value": {
                            var value = void 0;
                            if (foundImpl.subType === "constant") {
                                value = foundImpl.value;
                            }
                            else {
                                value = foundImpl.valueFunc();
                            }
                            deps.push(value);
                            break;
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return deps;
        }
    };
    Object.defineProperty(Namespace.prototype, "empty", {
        get: function () {
            return this.interfaces.size <= 0;
        },
        enumerable: false,
        configurable: true
    });
    return Namespace;
}());
exports.Namespace = Namespace;
var ToObject = (function () {
    function ToObject(implementation, adder) {
        this.implementation = implementation;
        this.adder = adder;
        this.with = new WithObject(this.implementation);
    }
    ToObject.prototype.ensureAdded = function () {
        if (!this.added) {
            this.adder();
            this.added = true;
        }
        else {
            throw new Error("Already bound");
        }
    };
    ToObject.prototype.toConstantValue = function (value) {
        this.ensureAdded();
        var impl = this.implementation;
        impl.type = "value";
        impl.subType = "constant";
        impl.value = value;
        return this.with;
    };
    ToObject.prototype.toDynamicValue = function (value) {
        this.ensureAdded();
        var impl = this.implementation;
        impl.type = "value";
        impl.subType = "dynamic";
        impl.valueFunc = value;
        return this.with;
    };
    ToObject.prototype.toClass = function (clazz, singleton) {
        this.ensureAdded();
        var impl = this.implementation;
        impl.type = "class";
        impl.class = clazz;
        impl.singleton = !!singleton;
        return this.with;
    };
    return ToObject;
}());
exports.ToObject = ToObject;
var WithObject = (function () {
    function WithObject(implementation) {
        this.implementation = implementation;
    }
    WithObject.prototype.ensureAttributes = function () {
        if (!("attributes" in this.implementation)) {
            this.implementation.attributes = {};
        }
    };
    WithObject.prototype.withSubName = function (name) {
        this.ensureAttributes();
        this.implementation.attributes.subName = name;
        return this;
    };
    WithObject.prototype.withTag = function (tag) {
        this.ensureAttributes();
        if (!("tags" in this.implementation.attributes)) {
            this.implementation.attributes.tags = new Set();
        }
        this.implementation.attributes.tags.add(tag);
        return this;
    };
    return WithObject;
}());
exports.WithObject = WithObject;

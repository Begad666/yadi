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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
var constants_1 = require("./constants");
var Namespace_1 = require("./Namespace");
var resolver_1 = require("./resolver");
var utils_1 = require("./utils");
var Container = (function () {
    function Container(options, parent) {
        this.options = options;
        this.parent = parent;
        this.namespaces = new Map();
        this.namespaces.set(constants_1.NO_NAMESPACE.toLowerCase(), new Namespace_1.Namespace(this));
    }
    Container.prototype.addChild = function (name, options) {
        if (!this.children) {
            this.children = new Map();
        }
        if (this.children.has(name)) {
            throw new Error("Already used");
        }
        this.children.set(name, new Container(options, this));
    };
    Container.prototype.getChild = function (name) {
        if (!this.children) {
            return undefined;
        }
        return this.children.get(name);
    };
    Container.prototype.removeChild = function (name) {
        if (!this.children) {
            return;
        }
        if (!this.children.has(name)) {
            return;
        }
        var v = this.children.get(name);
        if (!v.empty) {
            throw new Error("Container not empty");
        }
        this.children.delete(name);
    };
    Container.prototype.bind = function (name, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        var value = this.namespaces.get(namespace.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeNamespace(value)) {
            return;
        }
        return value.bind(name);
    };
    Container.prototype.unbind = function (name, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        var value = this.namespaces.get(namespace.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeNamespace(value)) {
            return;
        }
        value.unbind(name);
    };
    Container.prototype.rebind = function (name, namespace) {
        if (namespace === void 0) { namespace = constants_1.NO_NAMESPACE; }
        this.unbind(name, namespace);
        return this.bind(name, namespace);
    };
    Container.prototype.addNamespace = function (name, func) {
        if (this.namespaces.has(name.toLowerCase())) {
            throw new Error("Cannot replace a namespace");
        }
        this.namespaces.set(name.toLowerCase(), func !== null && func !== void 0 ? func : new Namespace_1.Namespace(this));
    };
    Container.prototype.getNamespace = function (name) {
        var value = this.namespaces.get(name.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeNamespace(value)) {
            return;
        }
        return value;
    };
    Container.prototype.removeNamespace = function (name) {
        if (name.toLowerCase() === constants_1.NO_NAMESPACE.toLowerCase()) {
            throw new Error("Default namespace cant be removed");
        }
        var value = this.namespaces.get(name.toLowerCase());
        if (!value) {
            throw new Error("Invalid namespace");
        }
        if (!utils_1.isNativeNamespace(value) && !value.canBeRemoved()) {
            throw new Error("Namespace not empty");
        }
        if (utils_1.isNativeNamespace(value) && !value.empty) {
            throw new Error("Namespace not empty");
        }
        this.namespaces.delete(name);
    };
    Container.prototype.resolve = function (injectionEntry, filter, array) {
        var e_1, _a, e_2, _b, e_3, _c;
        var injection = injectionEntry.split(":");
        if (injection.length < 2) {
            injection.unshift(constants_1.NO_NAMESPACE.toLowerCase());
        }
        var namespacePart = injection[0];
        var dependencyPart = injection[1];
        var namespace;
        try {
            namespace = this.getNamespace(namespacePart);
        }
        catch (e) {
            if (e.message === "Invalid namespace") {
                if (this.options.resolveParent ||
                    this.options.resolveChildren) {
                    if (this.options.resolveParent && this.parent) {
                        try {
                            return this.parent.resolve(namespacePart + ":" + dependencyPart, filter, array);
                        }
                        catch (e) { }
                    }
                    if (this.options.resolveChildren && this.children) {
                        var returnValue = void 0;
                        try {
                            for (var _d = __values(this.children.values()), _e = _d.next(); !_e.done; _e = _d.next()) {
                                var container = _e.value;
                                try {
                                    returnValue = container.resolve(namespacePart + ":" + dependencyPart, filter, array);
                                    break;
                                }
                                catch (e) { }
                            }
                        }
                        catch (e_1_1) { e_1 = { error: e_1_1 }; }
                        finally {
                            try {
                                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                            }
                            finally { if (e_1) throw e_1.error; }
                        }
                        if (returnValue) {
                            return returnValue;
                        }
                    }
                }
            }
            throw e;
        }
        if (!namespace) {
            var customNamespace = this.namespaces.get(namespacePart.toLowerCase());
            if (!customNamespace) {
                throw new Error("Invalid namespace");
            }
            var value = customNamespace.getter(dependencyPart, filter, array);
            if (typeof value === "undefined") {
                if (this.options.resolveParent ||
                    this.options.resolveChildren) {
                    if (this.options.resolveParent && this.parent) {
                        try {
                            return this.parent.resolve(namespacePart + ":" + dependencyPart, filter, array);
                        }
                        catch (e) { }
                    }
                    if (this.options.resolveChildren && this.children) {
                        var returnValue = void 0;
                        try {
                            for (var _f = __values(this.children.values()), _g = _f.next(); !_g.done; _g = _f.next()) {
                                var container = _g.value;
                                try {
                                    returnValue = container.resolve(namespacePart + ":" + dependencyPart, filter, array);
                                    break;
                                }
                                catch (e) { }
                            }
                        }
                        catch (e_2_1) { e_2 = { error: e_2_1 }; }
                        finally {
                            try {
                                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                            }
                            finally { if (e_2) throw e_2.error; }
                        }
                        if (returnValue) {
                            return returnValue;
                        }
                    }
                }
                throw new Error("Invalid dependency");
            }
            return value;
        }
        try {
            return namespace.resolve(dependencyPart, filter, array);
        }
        catch (e) {
            if (e.message === "Invalid dependency") {
                if (this.options.resolveParent ||
                    this.options.resolveChildren) {
                    if (this.options.resolveParent && this.parent) {
                        try {
                            return this.parent.resolve(namespacePart + ":" + dependencyPart, filter, array);
                        }
                        catch (e) { }
                    }
                    if (this.options.resolveChildren && this.children) {
                        var returnValue = void 0;
                        try {
                            for (var _h = __values(this.children.values()), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var container = _j.value;
                                try {
                                    returnValue = container.resolve(namespacePart + ":" + dependencyPart, filter, array);
                                    break;
                                }
                                catch (e) { }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        if (returnValue) {
                            return returnValue;
                        }
                    }
                }
            }
            throw e;
        }
    };
    Container.prototype.create = function (clazz, parameters) {
        return resolver_1.resolveClass(clazz, this, parameters);
    };
    Object.defineProperty(Container.prototype, "empty", {
        get: function () {
            var namespacesNotEmpty = __spreadArray([], __read(this.namespaces.values())).some(function (v) { return !(utils_1.isNativeNamespace(v) ? v.empty : v.canBeRemoved()); });
            var childrenNotEmpty = this.children
                ? __spreadArray([], __read(this.children.values())).some(function (v) { return !v.empty; })
                : false;
            return !(namespacesNotEmpty && childrenNotEmpty);
        },
        enumerable: false,
        configurable: true
    });
    return Container;
}());
exports.Container = Container;

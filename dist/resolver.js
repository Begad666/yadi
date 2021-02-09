"use strict";
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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
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
exports.resolve = exports.resolvePropertyDeps = exports.resolveConstructorDeps = void 0;
var constants_1 = require("./constants");
function resolveConstructorDeps(constructor, container) {
    var e_1, _a;
    var constructorDeps = Reflect.getMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.CONSTRUCTOR_INJECT, constructor);
    if (!constructorDeps) {
        return undefined;
    }
    else {
        var deps = __spread(constructorDeps.entries());
        var parameters = new Array(deps.length);
        try {
            for (var deps_1 = __values(deps), deps_1_1 = deps_1.next(); !deps_1_1.done; deps_1_1 = deps_1.next()) {
                var _b = __read(deps_1_1.value, 2), index = _b[0], injection = _b[1];
                var value = container.resolve(injection);
                parameters[index] = value;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (deps_1_1 && !deps_1_1.done && (_a = deps_1.return)) _a.call(deps_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return parameters;
    }
}
exports.resolveConstructorDeps = resolveConstructorDeps;
function resolvePropertyDeps(constructor, container) {
    var e_2, _a;
    var propertyDeps = Reflect.getMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.PROPERTY_INJECT, constructor);
    if (!propertyDeps) {
        return undefined;
    }
    else {
        var deps = __spread(propertyDeps.entries());
        var properties = new Map();
        try {
            for (var deps_2 = __values(deps), deps_2_1 = deps_2.next(); !deps_2_1.done; deps_2_1 = deps_2.next()) {
                var _b = __read(deps_2_1.value, 2), property = _b[0], injection = _b[1];
                var value = container.resolve(injection);
                properties.set(property, value);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (deps_2_1 && !deps_2_1.done && (_a = deps_2.return)) _a.call(deps_2);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return properties;
    }
}
exports.resolvePropertyDeps = resolvePropertyDeps;
function resolve(constructor, container, additonalParameters) {
    var e_3, _a;
    var _b;
    var parameters = __spread(((_b = resolveConstructorDeps(constructor, container)) !== null && _b !== void 0 ? _b : []), (additonalParameters !== null && additonalParameters !== void 0 ? additonalParameters : []));
    var properties = resolvePropertyDeps(constructor, container);
    var instance = new (constructor.bind.apply(constructor, __spread([void 0], parameters)))();
    if (properties) {
        try {
            for (var _c = __values(properties.entries()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var _e = __read(_d.value, 2), property = _e[0], value = _e[1];
                instance[property] = value;
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }
    if (Reflect.hasMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.AFTER_CONSTRUCT, constructor)) {
        instance[Reflect.getMetadata(constants_1.MAIN_KEY + constants_1.INJECTION + constants_1.AFTER_CONSTRUCT, constructor)]();
    }
    return instance;
}
exports.resolve = resolve;

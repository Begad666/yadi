"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registry = void 0;
var Registry = (function () {
    function Registry(parent) {
        this.parent = parent;
        this.interfaces = new Map();
    }
    Registry.prototype.bind = function (name, safe) {
        var _this = this;
        if (!safe) {
            if (this.interfaces.has(name)) {
                throw new Error("Already bound");
            }
            return {
                toConstantValue: function (value) {
                    _this.interfaces.set(name, {
                        name: name,
                        implementation: {
                            type: "value",
                            subType: "constant",
                            value: value,
                        },
                    });
                },
                toDynamicValue: function (value) {
                    _this.interfaces.set(name, {
                        name: name,
                        implementation: {
                            type: "value",
                            subType: "dynamic",
                            valueFunc: value,
                        },
                    });
                },
                toImplementation: function (impl, singleton) {
                    _this.interfaces.set(name, {
                        name: name,
                        implementation: {
                            type: "class",
                            class: impl,
                            singleton: !!singleton,
                        },
                    });
                },
                toEmpty: function () {
                    _this.interfaces.set(name, { name: name, implementation: null });
                },
            };
        }
        else {
            return {
                toConstantValue: function (value) {
                    if (!_this.interfaces.has(name)) {
                        _this.interfaces.set(name, {
                            name: name,
                            implementation: {
                                type: "value",
                                subType: "constant",
                                value: value,
                            },
                        });
                    }
                    else {
                        if (_this.interfaces.get(name).implementation) {
                            throw new Error("Cannot replace an implementation");
                        }
                        _this.interfaces.get(name).implementation = {
                            type: "value",
                            subType: "constant",
                            value: value,
                        };
                    }
                },
                toImplementation: function (impl, singleton) {
                    if (!_this.interfaces.has(name)) {
                        _this.interfaces.set(name, {
                            name: name,
                            implementation: {
                                type: "class",
                                class: impl,
                                singleton: !!singleton,
                            },
                        });
                    }
                    else {
                        if (_this.interfaces.get(name).implementation) {
                            throw new Error("Cannot replace an implementation");
                        }
                        _this.interfaces.get(name).implementation = {
                            type: "class",
                            class: impl,
                            singleton: !!singleton,
                        };
                    }
                },
                toDynamicValue: function (value) {
                    if (!_this.interfaces.has(name)) {
                        _this.interfaces.set(name, {
                            name: name,
                            implementation: {
                                type: "value",
                                subType: "dynamic",
                                valueFunc: value,
                            },
                        });
                    }
                    else {
                        if (_this.interfaces.get(name).implementation) {
                            throw new Error("Cannot replace an implementation");
                        }
                        _this.interfaces.get(name).implementation = {
                            type: "value",
                            subType: "dynamic",
                            valueFunc: value,
                        };
                    }
                },
                toEmpty: function () {
                    if (!_this.interfaces.has(name)) {
                        _this.interfaces.set(name, {
                            name: name,
                            implementation: null,
                        });
                    }
                    else {
                        if (_this.interfaces.get(name).implementation) {
                            throw new Error("Cannot replace an implementation");
                        }
                        _this.interfaces.get(name).implementation = null;
                    }
                },
            };
        }
    };
    Registry.prototype.unbind = function (name) {
        this.interfaces.delete(name);
    };
    Registry.prototype.rebind = function (name, safe) {
        this.unbind(name);
        return this.bind(name, safe);
    };
    Registry.prototype.resolve = function (resolveString) {
        var interfacee = this.interfaces.get(resolveString);
        if (!interfacee) {
            throw new Error("Invalid resolve dependency");
        }
        switch (interfacee.implementation.type) {
            case "class": {
                if (interfacee.implementation.singleton &&
                    interfacee.implementation.instance) {
                    return interfacee.implementation.instance;
                }
                var impl = interfacee.implementation.class;
                var instance = this.parent.create(impl);
                if (interfacee.implementation.singleton) {
                    interfacee.implementation.instance = instance;
                }
                return instance;
            }
            case "value": {
                var value = void 0;
                if (interfacee.implementation.subType === "constant") {
                    value = interfacee.implementation.value;
                }
                else {
                    value = interfacee.implementation.valueFunc();
                }
                return value;
            }
        }
    };
    Object.defineProperty(Registry.prototype, "empty", {
        get: function () {
            return this.interfaces.size <= 0;
        },
        enumerable: false,
        configurable: true
    });
    return Registry;
}());
exports.Registry = Registry;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNativeNamespace = void 0;
function isNativeNamespace(namespace) {
    return !("getter" in namespace && "canBeRemoved" in namespace);
}
exports.isNativeNamespace = isNativeNamespace;

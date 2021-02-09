"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNativeRegistry = void 0;
function isNativeRegistry(registry) {
    return !("getter" in registry && "canBeRemoved" in registry);
}
exports.isNativeRegistry = isNativeRegistry;

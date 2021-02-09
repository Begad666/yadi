export interface Class<T = unknown, A = unknown> {
    new (...args: A[]): T;
}
export interface Interface {
    name: string;
    implementation: Implementation;
}
export declare type Implementation = ClassImplementation | DynamicValueImplementation | ConstantValueImplementation;
export interface DynamicValueImplementation extends BaseImplementation {
    type: "value";
    subType: "dynamic";
    valueFunc: () => unknown;
}
export interface ConstantValueImplementation extends BaseImplementation {
    type: "value";
    subType: "constant";
    value: unknown;
}
export interface ClassImplementation extends BaseImplementation {
    type: "class";
    class: Class;
    instance?: unknown;
    singleton: boolean;
}
export interface BaseImplementation {
    type: string;
}
export declare function isNativeRegistry(registry: import("./Registry").RegistryUnion): registry is import("./Registry").Registry;

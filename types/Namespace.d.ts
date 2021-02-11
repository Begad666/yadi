import { Class, Implementation } from "./utils";
export declare class Namespace {
    private parent;
    private interfaces;
    constructor(parent: import("./Container").Container);
    bind<I>(name: string): ToObject<I>;
    unbind(name: string): void;
    rebind<I>(name: string): ToObject<I>;
    resolve(dependency: string, filter?: Filter): unknown;
    resolve(dependency: string, filter?: Filter, array?: boolean): unknown[];
    get empty(): boolean;
}
export declare type Filter = {
    subName?: string;
    tags?: string[];
    arrayMaxSize?: number;
};
export declare type NamespaceUnion = Namespace | CustomNamespace;
export interface CustomNamespace {
    canBeRemoved(): boolean;
    getter(dependency: string, filter?: Filter, array?: boolean): unknown;
}
export declare class ToObject<I> {
    private implementation;
    private adder;
    private with;
    private added;
    constructor(implementation: Implementation, adder: () => void);
    private ensureAdded;
    toConstantValue(value: I): WithObject;
    toDynamicValue(value: () => I): WithObject;
    toClass(clazz: Class<I>, singleton?: boolean): WithObject;
}
export declare class WithObject {
    private implementation;
    constructor(implementation: Implementation);
    private ensureAttributes;
    withSubName(name: string): WithObject;
    withTag(tag: string): WithObject;
}

import { Class } from "./utils";
export declare class Registry {
    private parent;
    private interfaces;
    constructor(parent: import("./Container").Container);
    bind<I>(name: string, safe?: boolean): BindObject<I>;
    unbind(name: string): void;
    rebind<I>(name: string, safe?: boolean): BindObject<I>;
    resolve(resolveString: string): unknown;
    get empty(): boolean;
}
export declare type BindObject<I> = {
    toConstantValue: (value: I) => void;
    toDynamicValue: (value: () => I) => void;
    toImplementation: (impl: Class<I>, singleton?: boolean) => void;
    toEmpty: () => void;
};
export declare type RegistryUnion = Registry | CustomRegistry;
export interface CustomRegistry {
    canBeRemoved: () => boolean;
    getter: (dependency: string) => unknown;
}

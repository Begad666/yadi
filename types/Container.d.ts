import { ToObject, Namespace, CustomNamespace, Filter } from "./Namespace";
import { Class } from "./utils";
export declare class Container {
    private options;
    private parent?;
    private namespaces;
    private children;
    constructor(options: ContainerOptions, parent?: Container);
    addChild(name: string, options: ContainerOptions): void;
    getChild(name: string): Container;
    removeChild(name: string): void;
    bind<I>(name: string, namespace?: string): ToObject<I>;
    unbind(name: string, namespace?: string): void;
    rebind<I>(name: string, namespace?: string): ToObject<I>;
    addNamespace(name: string, func?: CustomNamespace): void;
    getNamespace(name: string): Namespace;
    removeNamespace(name: string): void;
    resolve(injectionEntry: string, filter?: Filter): unknown;
    resolve(injectionEntry: string, filter?: Filter, array?: boolean): unknown[] | unknown;
    create<I>(clazz: Class<I>, parameters?: unknown[]): I;
    get empty(): boolean;
}
export declare type ContainerOptions = {
    resolveParent: boolean;
    resolveChildren: boolean;
};

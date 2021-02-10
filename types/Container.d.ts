import { BindObject, Registry, CustomRegistry } from "./Registry";
import { Class } from "./utils";
export declare class Container {
    private registeries;
    constructor();
    bind<I>(name: string, safe?: boolean, namespace?: string): BindObject<I>;
    unbind(name: string, namespace?: string): void;
    rebind<I>(name: string, safe?: boolean, namespace?: string): BindObject<I>;
    addNamespace(name: string, func?: CustomRegistry): void;
    getNamespace(name: string): Registry;
    removeNamespace(name: string): void;
    resolve(injectionEntry: string): unknown;
    create<I>(clazz: Class<I>, parameters?: unknown[]): I;
}

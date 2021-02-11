import { Class, Implementation } from "./utils";
export declare function resolveConstructorDeps(constructor: Class, container: import("./Container").Container): Array<unknown>;
export declare function resolvePropertyDeps(constructor: Class, container: import("./Container").Container): Map<string | symbol, unknown>;
export declare function resolveClass<I>(constructor: Class<I>, container: import("./Container").Container, additonalParameters: unknown[]): I;
export declare function resolveImplementations(implementations: Implementation[], filter: import("./Namespace").Filter): Implementation[];

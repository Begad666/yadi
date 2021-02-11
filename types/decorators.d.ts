export declare function inject(name?: string, namespace?: string, filter?: import("./Namespace").Filter, array?: boolean): PropertyDecorator & ParameterDecorator;
export declare function bindLazyInject(container: import("./Container").Container): (name?: string, namespace?: string, filter?: import("./Namespace").Filter, cache?: boolean) => PropertyDecorator;
export declare function lazyInject(container: import("./Container").Container, name?: string, namespace?: string, filter?: import("./Namespace").Filter, array?: boolean, cache?: boolean): PropertyDecorator;
export declare function afterConstruct(): PropertyDecorator;

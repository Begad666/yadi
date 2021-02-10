export declare function inject(name?: string, namespace?: string): PropertyDecorator & ParameterDecorator;
export declare function bindLazyInject(container: import("./Container").Container): (name?: string, namespace?: string, cache?: boolean) => PropertyDecorator;
export declare function lazyInject(container: import("./Container").Container, name?: string, namespace?: string, cache?: boolean): PropertyDecorator;
export declare function afterConstruct(): PropertyDecorator;

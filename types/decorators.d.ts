export declare function inject(name?: string, namespace?: string): (target: unknown, key: string | symbol, index?: number) => void;
export declare function bindLazyInject(container: import("./Container").Container): (name?: string, namespace?: string, cache?: boolean) => (target: unknown, key: string | symbol) => void;
export declare function lazyInject(container: import("./Container").Container, name?: string, namespace?: string, cache?: boolean): (target: unknown, key: string | symbol) => void;
export declare function afterConstruct(): (target: unknown, key: string | symbol) => void;

export interface Class<T = unknown, A = unknown> {
	new (...args: A[]): T;
}

export interface Interface {
	name: string;
	implementations: Implementation[];
}

export type Implementation =
	| ClassImplementation
	| DynamicValueImplementation
	| ConstantValueImplementation;

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
	attributes?: ImplementationAttributes;
}

export interface ImplementationAttributes {
	subName?: string;
	tags?: Set<string>;
}

export interface Injection {
	namespace: string;
	name: string;
	filter: import("./namespace.js").Filter;
	array: boolean;
}

/**
 * @private
 */
export function isNativeNamespace(
	namespace: import("./namespace.js").NamespaceUnion,
): namespace is import("./namespace.js").Namespace {
	return !("resolve" in namespace && "canBeRemoved" in namespace);
}

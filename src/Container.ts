import { NO_NAMESPACE } from "./constants";
import {
	BindObject,
	Registry,
	CustomRegistry,
	RegistryUnion,
} from "./Registry";
import { resolve } from "./resolver";
import { Class, isNativeRegistry } from "./utils";
/**
 * A container manages a map of registeries
 */
export class Container {
	private registeries: Map<string, RegistryUnion> = new Map();

	/**
	 * Creates a new Container
	 */
	public constructor() {
		this.registeries.set(NO_NAMESPACE.toLowerCase(), new Registry(this));
	}

	/**
	 * Check {@link Registry.bind}
	 * @param namespace The namespace to use
	 * @typeParam I Check {@link Registry.bind}
	 */
	public bind<I>(
		name: string,
		safe?: boolean,
		namespace: string = NO_NAMESPACE
	): BindObject<I> {
		const value = this.registeries.get(namespace.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeRegistry(value)) {
			return;
		}
		return value.bind<I>(name, safe);
	}

	/**
	 * Check {@link Registry.unbind}
	 * @param namespace The namespace to use
	 */
	public unbind(name: string, namespace: string = NO_NAMESPACE): void {
		const value = this.registeries.get(namespace.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeRegistry(value)) {
			return;
		}
		value.unbind(name);
	}

	/**
	 * Check {@link Registry.rebind}
	 * @param namespace The namespace to use
	 * @typeParam I Check {@link Registry.rebind}
	 */
	public rebind<I>(
		name: string,
		safe?: boolean,
		namespace = NO_NAMESPACE
	): BindObject<I> {
		this.unbind(name, namespace);
		return this.bind<I>(name, safe, namespace);
	}

	/**
	 * Adds a new namespace
	 * @param name The namespace name
	 * @param func If provided, uses this object as a namespace resolver
	 */
	public addNamespace(name: string, func?: CustomRegistry): void {
		if (this.registeries.has(name.toLowerCase())) {
			throw new Error("Cannot replace a namespace");
		}
		this.registeries.set(name.toLowerCase(), func ?? new Registry(this));
	}

	/**
	 * Returns a namespace, or undefined if the namespace is custom (e.g. invoked {@link Container.addNamespace} with second parameter)
	 * @param name The namespace to get
	 */
	public getNamespace(name: string): Registry {
		const value = this.registeries.get(name.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeRegistry(value)) {
			return;
		}
		return value;
	}

	/**
	 * Removes a custom namespace if the {@link CustomRegistry.canBeRemoved | canBeRemoved} function returns true or a native one if its not empty
	 * @param name The namespace to remove
	 */
	public removeNamespace(name: string): void {
		if (name.toLowerCase() === NO_NAMESPACE.toLowerCase()) {
			throw new Error("Default namespace cant be removed");
		}
		const value = this.registeries.get(name.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeRegistry(value) && !value.canBeRemoved()) {
			throw new Error("Namespace not empty");
		}
		if (isNativeRegistry(value) && !value.empty) {
			throw new Error("Namespace not empty");
		}
		this.registeries.delete(name);
	}

	/**
	 * Resolves a injection entry
	 * @param injectionEntry An injection entry (e.g. "house:SmallHouse")
	 */
	public resolve(injectionEntry: string): unknown {
		const resolve = injectionEntry.split(":");
		if (resolve.length < 2) {
			resolve.unshift(NO_NAMESPACE.toLowerCase());
		}
		const namespace = this.getNamespace(resolve[0]);
		if (!namespace) {
			const customRegistry = this.registeries.get(
				resolve[0].toLowerCase()
			) as CustomRegistry;
			if (!customRegistry) {
				throw new Error("Invalid namespace");
			}
			resolve.shift();
			if (resolve.length !== 1) {
				throw new Error("Invalid injection string");
			}
			const value = customRegistry.getter(resolve.join(""));
			if (typeof value === "undefined") {
				throw new Error("Invalid dependency");
			}
			return value;
		}
		resolve.shift();
		if (resolve.length !== 1) {
			throw new Error("Invalid injection string");
		}
		return namespace.resolve(resolve.join(""));
	}

	/**
	 * Resolves all dependencies required by clazz and then creates a new instance
	 * @param clazz The class to resolve dependencies and create a new instance from
	 * @param parameters Additional parameters to be passed to the constructor
	 * @typeParam I Return value of clazz (Which is an instance)
	 */
	public create<I>(clazz: Class<I>, parameters?: unknown[]): I {
		return resolve<I>(clazz, this, parameters);
	}
}

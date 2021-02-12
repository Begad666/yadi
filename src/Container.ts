import { NO_NAMESPACE } from "./constants";
import {
	ToObject,
	Namespace,
	NamespaceUnion,
	CustomNamespace,
	Filter,
} from "./Namespace";
import { resolveClass } from "./resolver";
import { Class, isNativeNamespace } from "./utils";
/**
 * A container manages a map of namespaces
 */
export class Container {
	private namespaces: Map<string, NamespaceUnion> = new Map();
	private children: Map<string, Container>;

	/**
	 * Creates a new Container
	 * @param options The container options
	 * @param parent Specifies the parent. Should be provided using {@link Container.addChild}
	 */
	public constructor(
		private options: ContainerOptions,
		private parent?: Container
	) {
		this.namespaces.set(NO_NAMESPACE.toLowerCase(), new Namespace(this));
	}

	/**
	 * Adds a child container to this container
	 * @param name The child container name
	 * @param options Options for child container
	 */
	public addChild(name: string, options: ContainerOptions): void {
		if (!this.children) {
			this.children = new Map();
		}
		if (this.children.has(name)) {
			throw new Error("Already used");
		}
		this.children.set(name, new Container(options, this));
	}

	/**
	 * Returns a child container
	 * @param name The child container name
	 */
	public getChild(name: string): Container {
		if (!this.children) {
			return undefined;
		}
		return this.children.get(name);
	}

	/**
	 * Removes a child container only if its empty
	 * @param name The child container name
	 */
	public removeChild(name: string): void {
		if (!this.children) {
			return;
		}
		if (!this.children.has(name)) {
			return;
		}
		const v = this.children.get(name);
		if (!v.empty) {
			throw new Error("Container not empty");
		}
		this.children.delete(name);
	}

	/**
	 * Check {@link Namespace.bind}
	 * @param namespace The namespace to use
	 * @typeParam I Check {@link Namespace.bind}
	 */
	public bind<I>(
		name: string,
		namespace: string = NO_NAMESPACE
	): ToObject<I> {
		const value = this.namespaces.get(namespace.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeNamespace(value)) {
			return;
		}
		return value.bind<I>(name);
	}

	/**
	 * Check {@link Namespace.unbind}
	 * @param namespace The namespace to use
	 */
	public unbind(name: string, namespace: string = NO_NAMESPACE): void {
		const value = this.namespaces.get(namespace.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeNamespace(value)) {
			return;
		}
		value.unbind(name);
	}

	/**
	 * Check {@link Namespace.rebind}
	 * @param namespace The namespace to use
	 * @typeParam I Check {@link Namespace.rebind}
	 */
	public rebind<I>(name: string, namespace = NO_NAMESPACE): ToObject<I> {
		this.unbind(name, namespace);
		return this.bind<I>(name, namespace);
	}

	/**
	 * Adds a new namespace
	 * @param name The namespace name
	 * @param func If provided, uses this object as a namespace resolver
	 */
	public addNamespace(name: string, func?: CustomNamespace): void {
		if (this.namespaces.has(name.toLowerCase())) {
			throw new Error("Cannot replace a namespace");
		}
		this.namespaces.set(name.toLowerCase(), func ?? new Namespace(this));
	}

	/**
	 * Returns a namespace, or undefined if the namespace is custom (e.g. invoked {@link Container.addNamespace} with second parameter)
	 * @param name The namespace to get
	 */
	public getNamespace(name: string): Namespace {
		const value = this.namespaces.get(name.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeNamespace(value)) {
			return;
		}
		return value;
	}

	/**
	 * Removes a custom namespace if the {@link CustomNamespace.canBeRemoved | canBeRemoved} function returns true or a native one if its not empty
	 * @param name The namespace to remove
	 */
	public removeNamespace(name: string): void {
		if (name.toLowerCase() === NO_NAMESPACE.toLowerCase()) {
			throw new Error("Default namespace cant be removed");
		}
		const value = this.namespaces.get(name.toLowerCase());
		if (!value) {
			throw new Error("Invalid namespace");
		}
		if (!isNativeNamespace(value) && !value.canBeRemoved()) {
			throw new Error("Namespace not empty");
		}
		if (isNativeNamespace(value) && !value.empty) {
			throw new Error("Namespace not empty");
		}
		this.namespaces.delete(name);
	}

	/**
	 * Resolves an injection entry
	 * @param injectionEntry An injection entry (e.g. "house:SmallHouse")
	 * @param filter Filter passed to {@link Namespace.resolve}
	 */
	public resolve(injectionEntry: string, filter?: Filter): unknown;

	/**
	 * Resolves an injection entry and returns an array
	 * @param injectionEntry An injection entry (e.g. "house:SmallHouse")
	 * @param filter Filter passed to {@link Namespace.resolve}
	 * @param array If true, this will resolve an array. The array size can be controlled using {@link Filter.arrayMaxSize}
	 */
	public resolve(
		injectionEntry: string,
		filter?: Filter,
		array?: boolean
	): unknown[];

	public resolve(
		injectionEntry: string,
		filter?: Filter,
		array?: boolean
	): unknown | unknown[] {
		const injection = injectionEntry.split(":");
		if (injection.length < 2) {
			injection.unshift(NO_NAMESPACE.toLowerCase());
		}
		const namespacePart = injection[0];
		const dependencyPart = injection[1];
		let namespace: Namespace;
		try {
			namespace = this.getNamespace(namespacePart);
		} catch (e) {
			if (e.message === "Invalid namespace") {
				if (
					this.options.resolveParent ||
					this.options.resolveChildren
				) {
					if (this.options.resolveParent && this.parent) {
						try {
							return this.parent.resolve(
								namespacePart + ":" + dependencyPart,
								filter,
								array
							);
						} catch (e) {}
					}
					if (this.options.resolveChildren && this.children) {
						let returnValue: unknown;
						for (const container of this.children.values()) {
							try {
								returnValue = container.resolve(
									namespacePart + ":" + dependencyPart,
									filter,
									array
								);
								break;
							} catch (e) {}
						}
						if (returnValue) {
							return returnValue;
						}
					}
				}
			}
			throw e;
		}
		if (!namespace) {
			const customNamespace = this.namespaces.get(
				namespacePart.toLowerCase()
			) as CustomNamespace;
			if (!customNamespace) {
				throw new Error("Invalid namespace");
			}
			const value = customNamespace.getter(dependencyPart, filter, array);
			if (typeof value === "undefined") {
				if (
					this.options.resolveParent ||
					this.options.resolveChildren
				) {
					if (this.options.resolveParent && this.parent) {
						try {
							return this.parent.resolve(
								namespacePart + ":" + dependencyPart,
								filter,
								array
							);
						} catch (e) {}
					}
					if (this.options.resolveChildren && this.children) {
						let returnValue: unknown;
						for (const container of this.children.values()) {
							try {
								returnValue = container.resolve(
									namespacePart + ":" + dependencyPart,
									filter,
									array
								);
								break;
							} catch (e) {}
						}
						if (returnValue) {
							return returnValue;
						}
					}
				}
				throw new Error("Invalid dependency");
			}
			return value;
		}
		try {
			return namespace.resolve(dependencyPart, filter, array);
		} catch (e) {
			if (e.message === "Invalid dependency") {
				if (
					this.options.resolveParent ||
					this.options.resolveChildren
				) {
					if (this.options.resolveParent && this.parent) {
						try {
							return this.parent.resolve(
								namespacePart + ":" + dependencyPart,
								filter,
								array
							);
						} catch (e) {}
					}
					if (this.options.resolveChildren && this.children) {
						let returnValue: unknown;
						for (const container of this.children.values()) {
							try {
								returnValue = container.resolve(
									namespacePart + ":" + dependencyPart,
									filter,
									array
								);
								break;
							} catch (e) {}
						}
						if (returnValue) {
							return returnValue;
						}
					}
				}
			}
			throw e;
		}
	}

	/**
	 * Resolves all dependencies required by clazz and then creates a new instance
	 * @param clazz The class to resolve dependencies and create a new instance from
	 * @param parameters Additional parameters to be passed to the constructor
	 * @typeParam I Return value of clazz (Which is an instance)
	 */
	public create<I>(clazz: Class<I>, parameters?: unknown[]): I {
		return resolveClass<I>(clazz, this, parameters);
	}

	/**
	 * Returns if this container is empty
	 */
	public get empty(): boolean {
		const namespacesNotEmpty = [...this.namespaces.values()].some(
			(v) => !(isNativeNamespace(v) ? v.empty : v.canBeRemoved())
		);
		const childrenNotEmpty = this.children
			? [...this.children.values()].some((v) => !v.empty)
			: false;
		return !(namespacesNotEmpty && childrenNotEmpty);
	}
}

/**
 * Options for {@link Container}
 */
export type ContainerOptions = {
	/**
	 * If the container cant resolve a dependency and it has a parent, should it check the parent?
	 */
	resolveParent: boolean;
	/**
	 * If the container cant resolve a dependency and it has children, should it check them in order until it finds one?
	 */
	resolveChildren: boolean;
};

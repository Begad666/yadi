import { resolveImplementations } from "./resolver";
import {
	Class,
	ClassImplementation,
	ConstantValueImplementation,
	DynamicValueImplementation,
	Implementation,
	Interface,
} from "./utils";
/**
 * A namespace stores all dependencies
 */
export class Namespace {
	private interfaces: Map<string, Interface> = new Map();
	/**
	 * Creates a new namespace
	 */
	public constructor(private parent: import("./Container").Container) {}

	/**
	 * Starts a dependency bind and returns an object to bind various values
	 * @param name The dependency name
	 * @typeParam I Passed to {@link BindObject}
	 */
	public bind<I>(name: string): ToObject<I> {
		if (!this.interfaces.has(name)) {
			this.interfaces.set(name, {
				name,
				implementations: [],
			});
		}
		const object = {};
		return new ToObject<I>(object as Implementation, () =>
			this.interfaces
				.get(name)
				.implementations.push(object as Implementation)
		);
	}

	/**
	 * Unbinds a dependency
	 * @param name The dependency name
	 */
	public unbind(name: string): void {
		this.interfaces.delete(name);
	}

	/**
	 * Rebinds a dependency. Check {@link Namespace.bind}
	 * @typeParam I Check {@link Namespace.bind}
	 */
	public rebind<I>(name: string): ToObject<I> {
		this.unbind(name);
		return this.bind<I>(name);
	}
	/**
	 * Resolves a dependency
	 * @param dependency A dependency name (e.g. "SmallHouse")
	 * @param filter Filter dependencies
	 */
	public resolve(dependency: string, filter?: Filter): unknown;

	/**
	 * Resolves a dependency array
	 * @param dependency A dependency name (e.g. "SmallHouse")
	 * @param filter Filter dependencies
	 * @param array If true, this will resolve an array. The array size can be controlled using {@link Filter.arrayMaxSize}
	 */
	public resolve(
		dependency: string,
		filter?: Filter,
		array?: boolean
	): unknown[];

	public resolve(
		dependency: string,
		filter?: Filter,
		array?: boolean
	): unknown[] | unknown {
		const interfacee = this.interfaces.get(dependency);
		if (!interfacee) {
			throw new Error("Invalid dependency");
		}
		const impls = resolveImplementations(
			interfacee.implementations,
			filter
		);
		if (!array) {
			if (impls.length > 1) {
				throw new Error(
					"More than one dependency found. Make sure you apply different with* functions to different dependencies"
				);
			}
			const foundImpl = impls[0];
			if (!foundImpl) {
				if (!interfacee.implementations.length) {
					throw new Error(
						"Dependency not binded. You called bind without calling any of to* functions"
					);
				} else {
					throw new Error("Dependency not found");
				}
			}
			switch (foundImpl.type) {
				case "class": {
					if (foundImpl.singleton && foundImpl.instance) {
						return foundImpl.instance;
					}
					const impl = foundImpl.class;
					const instance = this.parent.create(impl);
					if (foundImpl.singleton) {
						foundImpl.instance = instance;
					}
					return instance;
				}
				case "value": {
					let value: unknown;
					if (foundImpl.subType === "constant") {
						value = foundImpl.value;
					} else {
						value = foundImpl.valueFunc();
					}
					return value;
				}
			}
		} else {
			const deps: unknown[] = [];
			if (!impls.length) {
				if (!interfacee.implementations.length) {
					throw new Error(
						"Dependency not binded. You called bind without calling any of the to* functions"
					);
				} else {
					throw new Error("Dependency not found");
				}
			}
			for (const foundImpl of impls.slice(0, filter?.arrayMaxSize)) {
				switch (foundImpl.type) {
					case "class": {
						if (foundImpl.singleton && foundImpl.instance) {
							return foundImpl.instance;
						}
						const impl = foundImpl.class;
						const instance = this.parent.create(impl);
						if (foundImpl.singleton) {
							foundImpl.instance = instance;
						}
						deps.push(instance);
						break;
					}
					case "value": {
						let value: unknown;
						if (foundImpl.subType === "constant") {
							value = foundImpl.value;
						} else {
							value = foundImpl.valueFunc();
						}
						deps.push(value);
						break;
					}
				}
			}
			return deps;
		}
	}

	/**
	 * Returns if this Namespace is empty or not
	 */
	public get empty(): boolean {
		return this.interfaces.size <= 0;
	}
}
/**
 * Used by {@link Namespace.resolve} to filter implementations
 */
export type Filter = {
	/**
	 * Filter by subName
	 */
	subName?: string;
	/**
	 * Filter by tags
	 */
	tags?: string[];
	/**
	 * If used with array: true with {@link Namespace.resolve} or {@link Container.resolve}, will limit the amount the array provides
	 */
	arrayMaxSize?: number;
};
/**
 * An union that specifies {@link Namespace} and {@link CustomNamespace}
 */
export type NamespaceUnion = Namespace | CustomNamespace;
/**
 * A custom namespace
 */
export interface CustomNamespace {
	/**
	 * Returns if the this custom namespace can be removed
	 */
	canBeRemoved(): boolean;
	/**
	 * Same as {@link Namespace.resolve}
	 */
	getter(dependency: string, filter?: Filter, array?: boolean): unknown;
}

/**
 * An object returned by {@link Namespace.bind} used to bind the values. Must atleast use one of the functions
 * @typeParam I Type parameter that specifies parameter types
 */
export class ToObject<I> {
	private with: WithObject;
	private added: boolean;
	public constructor(
		private implementation: Implementation,
		private adder: () => void
	) {
		this.with = new WithObject(this.implementation);
	}

	private ensureAdded(): void {
		if (!this.added) {
			this.adder();
			this.added = true;
		} else {
			throw new Error("Already bound");
		}
	}
	/**
	 * Binds the dependency to a constant value
	 * @param value The constant value to bind
	 */
	public toConstantValue(value: I): WithObject {
		this.ensureAdded();
		const impl = this.implementation as ConstantValueImplementation;
		impl.type = "value";
		impl.subType = "constant";
		impl.value = value;
		return this.with;
	}
	/**
	 * Binds the dependency to a dynamic value
	 * @param value The dynamic value to bind
	 */
	public toDynamicValue(value: () => I): WithObject {
		this.ensureAdded();
		const impl = this.implementation as DynamicValueImplementation;
		impl.type = "value";
		impl.subType = "dynamic";
		impl.valueFunc = value;
		return this.with;
	}
	/**
	 * Binds the dependency to a class
	 * @param clazz The class to bind
	 * @param singleton Mark this as singleton
	 */
	public toClass(clazz: Class<I>, singleton?: boolean): WithObject {
		this.ensureAdded();
		const impl = this.implementation as ClassImplementation;
		impl.type = "class";
		impl.class = clazz;
		impl.singleton = !!singleton;
		return this.with;
	}
}

/**
 * An object returned by {@link BindObject} used to add attributes to the current bind. Does not need to be used
 */
export class WithObject {
	public constructor(private implementation: Implementation) {}

	private ensureAttributes() {
		if (!("attributes" in this.implementation)) {
			this.implementation.attributes = {};
		}
	}
	/**
	 * Adds a sub name
	 * @param name The name
	 */
	public withSubName(name: string): WithObject {
		this.ensureAttributes();
		this.implementation.attributes.subName = name;
		return this;
	}
	/**
	 * Adds a tag
	 * @param tag The tag
	 */
	public withTag(tag: string): WithObject {
		this.ensureAttributes();
		if (!("tags" in this.implementation.attributes)) {
			this.implementation.attributes.tags = new Set();
		}
		this.implementation.attributes.tags.add(tag);
		return this;
	}
}

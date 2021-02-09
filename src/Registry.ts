import { Class, Interface } from "./utils";
/**
 * A registry stores all dependencies
 */
export class Registry {
	private interfaces: Map<string, Interface> = new Map();
	/**
	 * Creates a new Registry
	 */
	public constructor(private parent: import("./Container").Container) {}

	/**
	 * Starts a dependency bind and returns an object to bind various values
	 * @param name The dependency name
	 * @param safe Don't throw if a dependency exists
	 * @typeParam I Passed to {@link BindObject}
	 */
	public bind<I>(name: string, safe?: boolean): BindObject<I> {
		if (!safe) {
			if (this.interfaces.has(name)) {
				throw new Error("Already bound");
			}
			return {
				toConstantValue: (value: I) => {
					this.interfaces.set(name, {
						name,
						implementation: {
							type: "value",
							subType: "constant",
							value,
						},
					});
				},
				toDynamicValue: (value: () => I) => {
					this.interfaces.set(name, {
						name,
						implementation: {
							type: "value",
							subType: "dynamic",
							valueFunc: value,
						},
					});
				},
				toImplementation: (impl: Class<I>, singleton?: boolean) => {
					this.interfaces.set(name, {
						name,
						implementation: {
							type: "class",
							class: impl,
							singleton: !!singleton,
						},
					});
				},
				toEmpty: () => {
					this.interfaces.set(name, { name, implementation: null });
				},
			};
		} else {
			return {
				toConstantValue: (value: I) => {
					if (!this.interfaces.has(name)) {
						this.interfaces.set(name, {
							name,
							implementation: {
								type: "value",
								subType: "constant",
								value,
							},
						});
					} else {
						if (this.interfaces.get(name).implementation) {
							throw new Error("Cannot replace an implementation");
						}
						this.interfaces.get(name).implementation = {
							type: "value",
							subType: "constant",
							value,
						};
					}
				},
				toImplementation: (impl: Class<I>, singleton?: boolean) => {
					if (!this.interfaces.has(name)) {
						this.interfaces.set(name, {
							name,
							implementation: {
								type: "class",
								class: impl,
								singleton: !!singleton,
							},
						});
					} else {
						if (this.interfaces.get(name).implementation) {
							throw new Error("Cannot replace an implementation");
						}
						this.interfaces.get(name).implementation = {
							type: "class",
							class: impl,
							singleton: !!singleton,
						};
					}
				},
				toDynamicValue: (value: () => I) => {
					if (!this.interfaces.has(name)) {
						this.interfaces.set(name, {
							name,
							implementation: {
								type: "value",
								subType: "dynamic",
								valueFunc: value,
							},
						});
					} else {
						if (this.interfaces.get(name).implementation) {
							throw new Error("Cannot replace an implementation");
						}
						this.interfaces.get(name).implementation = {
							type: "value",
							subType: "dynamic",
							valueFunc: value,
						};
					}
				},
				toEmpty: () => {
					if (!this.interfaces.has(name)) {
						this.interfaces.set(name, {
							name,
							implementation: null,
						});
					} else {
						if (this.interfaces.get(name).implementation) {
							throw new Error("Cannot replace an implementation");
						}
						this.interfaces.get(name).implementation = null;
					}
				},
			};
		}
	}

	/**
	 * Unbinds a dependency
	 * @param name The dependency name
	 */
	public unbind(name: string): void {
		this.interfaces.delete(name);
	}

	/**
	 * Rebinds a dependency. Check {@link Registry.bind}
	 * @typeParam I Check {@link Registry.bind}
	 */
	public rebind<I>(name: string, safe?: boolean): BindObject<I> {
		this.unbind(name);
		return this.bind<I>(name, safe);
	}
	/**
	 * Resolves a dependency
	 * @param resolveString A dependency name (e.g. "SmallHouse")
	 */
	public resolve(resolveString: string): unknown {
		const interfacee = this.interfaces.get(resolveString);
		if (!interfacee) {
			throw new Error("Invalid resolve dependency");
		}
		switch (interfacee.implementation.type) {
			case "class": {
				if (
					interfacee.implementation.singleton &&
					interfacee.implementation.instance
				) {
					return interfacee.implementation.instance;
				}
				const impl = interfacee.implementation.class;
				const instance = this.parent.create(impl);
				if (interfacee.implementation.singleton) {
					interfacee.implementation.instance = instance;
				}
				return instance;
			}
			case "value": {
				let value: unknown;
				if (interfacee.implementation.subType === "constant") {
					value = interfacee.implementation.value;
				} else {
					value = interfacee.implementation.valueFunc();
				}
				return value;
			}
		}
	}

	/**
	 * Returns if this Registry is empty or not
	 */
	public get empty(): boolean {
		return this.interfaces.size <= 0;
	}
}
/**
 * Bind object returned by {@link Registry.bind}
 * @typeParam I Type parameter that specifies parameter types
 */
export type BindObject<I> = {
	/**
	 * Binds the dependency to a constant value
	 */
	toConstantValue: (value: I) => void;
	/**
	 * Binds the dependency to a dynamic value
	 */
	toDynamicValue: (value: () => I) => void;
	/**
	 * Binds the dependency to a class
	 */
	toImplementation: (impl: Class<I>, singleton?: boolean) => void;
	/**
	 * Binds the dependency to be binded using the safe parameter
	 */
	toEmpty: () => void;
};
/**
 * An union that specifies {@link Registry} and {@link RegistryGetter}
 */
export type RegistryUnion = Registry | CustomRegistry;

export interface CustomRegistry {
	canBeRemoved: () => boolean;
	getter: (dependency: string) => unknown;
}

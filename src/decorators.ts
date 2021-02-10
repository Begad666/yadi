import {
	PROPERTY_INJECT,
	INJECTION,
	MAIN_KEY,
	CONSTRUCTOR_INJECT,
	AFTER_CONSTRUCT,
} from "./constants";
/**
 * A decorator to add an injection entry. Can be used on parameters or properties
 * @param name The dependency name
 * @param namespace The namespace
 */
export function inject(
	name?: string,
	namespace?: string
): (target: unknown, key: string | symbol, index?: number) => void {
	namespace = namespace?.toLowerCase();
	return function (
		target: unknown,
		key: string | symbol,
		index?: number
	): void {
		if (index && !key) {
			throw new Error("Parameter injection without name");
		}
		const injectionValue = `${namespace ? namespace + ":" : ""}${
			name ?? key.toString()
		}`;
		let injections: Map<string | number | symbol, string>;
		if (typeof index === "undefined") {
			if (
				Reflect.hasMetadata(
					MAIN_KEY + INJECTION + PROPERTY_INJECT,
					target.constructor
				)
			) {
				injections = Reflect.getMetadata(
					MAIN_KEY + INJECTION + PROPERTY_INJECT,
					target.constructor
				) as Map<string | symbol, string>;
			} else {
				injections = new Map();
				Reflect.defineMetadata(
					MAIN_KEY + INJECTION + PROPERTY_INJECT,
					injections,
					target.constructor
				);
			}
		} else {
			if (
				Reflect.hasMetadata(
					MAIN_KEY + INJECTION + CONSTRUCTOR_INJECT,
					target
				)
			) {
				injections = Reflect.getMetadata(
					MAIN_KEY + INJECTION + CONSTRUCTOR_INJECT,
					target
				) as Map<number, string>;
			} else {
				injections = new Map();
				Reflect.defineMetadata(
					MAIN_KEY + INJECTION + CONSTRUCTOR_INJECT,
					injections,
					target
				);
			}
		}
		injections.set(index ?? key, injectionValue);
	};
}

/**
 * Utility method to bind lazy inject to a container
 * @param container The container to use
 */
export function bindLazyInject(
	container: import("./Container").Container
): (
	name?: string,
	namespace?: string,
	cache?: boolean
) => (target: unknown, key: string | symbol) => void {
	return lazyInject.bind(this, container);
}

/**
 * A decorator that injects a dependency lazily using container. Mostly used for classes where you can't control the creation of it. Can only be used on properties
 * @param container The container to use
 * @param name The dependency name
 * @param namespace The namespace
 * @param cache Cache return values, can be invalidated by setting the property to undefined
 */
export function lazyInject(
	container: import("./Container").Container,
	name?: string,
	namespace?: string,
	cache = true
): (target: unknown, key: string | symbol) => void {
	return function (target: unknown, key: string | symbol) {
		const injectionValue = `${namespace ? namespace + ":" : ""}${
			name ?? key.toString()
		}`;
		let cached: unknown;
		const getter = () => {
			if (cached) {
				return cached;
			}
			const v = container.resolve(injectionValue);
			if (cache) {
				cached = v;
			}
			return v;
		};
		const setter = (v: unknown) => {
			cached = v;
		};
		Object.defineProperty(target, key, {
			configurable: true,
			enumerable: true,
			get: getter,
			set: setter,
		});
	};
}

/**
 * Decorates a method to be called after constructing the class using {@link Container.create}
 */
export function afterConstruct(): (
	target: unknown,
	key: string | symbol
) => void {
	return function (target: unknown, key: string | symbol) {
		Reflect.defineMetadata(
			MAIN_KEY + INJECTION + AFTER_CONSTRUCT,
			key,
			target.constructor
		);
	};
}

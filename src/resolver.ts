import {
	MAIN_KEY,
	INJECTION,
	PROPERTY_INJECT,
	CONSTRUCTOR_INJECT,
	AFTER_CONSTRUCT,
} from "./constants.js";
import { Class, Implementation, Injection } from "./utils.js";

/**
 * @private
 */
export function resolveConstructorDeps(
	constructor: Class,
	container: import("./container.js").Container,
): Array<unknown> {
	const constructorDeps = Reflect.getMetadata(
		MAIN_KEY + INJECTION + CONSTRUCTOR_INJECT,
		constructor,
	) as Map<number, Injection>;
	if (!constructorDeps) {
		return undefined;
	} else {
		const deps = [...constructorDeps.entries()];
		const parameters = new Array<unknown>(deps.length);
		for (const [index, injection] of deps) {
			const value = container.resolve(
				(injection.namespace ? injection.namespace + ":" : "") +
					injection.name,
				injection.filter,
				injection.array,
			);
			parameters[index] = value;
		}
		return parameters;
	}
}

/**
 * @private
 */
export function resolvePropertyDeps(
	constructor: Class,
	container: import("./container.js").Container,
): Map<string | symbol, unknown> {
	const propertyDeps = Reflect.getMetadata(
		MAIN_KEY + INJECTION + PROPERTY_INJECT,
		constructor,
	) as Map<string, Injection>;
	if (!propertyDeps) {
		return undefined;
	} else {
		const deps = [...propertyDeps.entries()];
		const properties = new Map<string | symbol, unknown>();
		for (const [property, injection] of deps) {
			const value = container.resolve(
				(injection.namespace ? injection.namespace + ":" : "") +
					injection.name,
				injection.filter,
				injection.array,
			);
			properties.set(property, value);
		}
		return properties;
	}
}

/**
 * @private
 */
export function resolveClass<I>(
	constructor: Class<I>,
	container: import("./container.js").Container,
	additionalParameters: unknown[],
): I {
	const parameters = [
		...(resolveConstructorDeps(constructor, container) ?? []),
		...(additionalParameters ?? []),
	];
	const properties = resolvePropertyDeps(constructor, container);
	const instance: I = new constructor(...parameters);
	if (properties) {
		for (const [property, value] of properties.entries()) {
			instance[property] = value;
		}
	}
	if (
		Reflect.hasMetadata(MAIN_KEY + INJECTION + AFTER_CONSTRUCT, constructor)
	) {
		instance[
			Reflect.getMetadata(
				MAIN_KEY + INJECTION + AFTER_CONSTRUCT,
				constructor,
			)
		]();
	}
	return instance;
}

/**
 * @private
 */
export function resolveImplementations(
	implementations: Implementation[],
	filter: import("./namespace.js").Filter,
): Implementation[] {
	if (!filter) {
		return implementations;
	}
	return implementations.filter((v) => {
		if ("subName" in filter && "subName" in v.attributes) {
			if (!(v.attributes.subName === filter.subName)) {
				return false;
			}
		}
		if ("tags" in filter && "tags" in v.attributes) {
			if (filter.tags.some((tag) => !v.attributes.tags.has(tag))) {
				return false;
			}
		}
		return true;
	});
}

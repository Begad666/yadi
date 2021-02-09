import { Container } from "../src";
import { NO_NAMESPACE } from "../src/constants";
import "reflect-metadata";

let container: Container;

describe("Container", () => {
	beforeEach(() => (container = new Container()));

	describe("namespaces", () => {
		test("addNamespace", () => {
			container.addNamespace("test");
			expect(container.getNamespace("test")).not.toEqual(undefined);
		});

		test("addNamespace with a function", () => {
			const v = {
				canBeRemoved: () => true,
				getter: (service: string) =>
					service === "test" ? 1 : undefined,
			};
			container.addNamespace("test", v);
			expect(container.getNamespace("test")).toEqual(undefined);
			expect(container.resolve("test:test")).toEqual(1);
			expect(() => container.resolve("test:test1")).toThrow(
				"Invalid resolve dependency"
			);
		});

		test("getNamespace and resolve throw if a container doesn't have a certain namespace", () => {
			expect(() => container.getNamespace("test")).toThrow(
				"Invalid namespace"
			);
			expect(() => container.resolve("test:test")).toThrow(
				"Invalid namespace"
			);
		});

		test("removeNamespace", () => {
			container.addNamespace("test");
			container.removeNamespace("test");
			expect(() => container.getNamespace("test")).toThrow(
				"Invalid namespace"
			);
		});

		test("removeNamespace with a function namespace", () => {
			container.addNamespace("test", {
				canBeRemoved: () => false,
				getter: undefined,
			});

			expect(() => container.removeNamespace("test")).toThrow(
				"Namespace not empty"
			);
		});
		test("removeNamespace with a non empty namespace", () => {
			container.addNamespace("test");

			container.bind("test", false, "test").toConstantValue(1);

			expect(() => container.removeNamespace("test")).toThrow(
				"Namespace not empty"
			);
		});
	});

	describe("binding", () => {
		test("bind", () => {
			container.bind("test").toConstantValue(1);
			expect(container.resolve("test")).toEqual(1);
		});

		test("unbind", () => {
			container.bind("test").toConstantValue(1);
			container.unbind("test");
			expect(() => container.resolve("test")).toThrow(
				"Invalid resolve dependency"
			);
		});

		test("rebind", () => {
			container.bind("test").toConstantValue(1);
			container.rebind("test").toConstantValue(2);
			expect(
				container.getNamespace(NO_NAMESPACE).resolve("test")
			).toEqual(2);
		});
	});
});

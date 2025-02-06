import "reflect-metadata";
import { Container } from "../src/index.js";
import { NO_NAMESPACE } from "../src/constants.js";

let container: Container;

describe("Container", () => {
	beforeEach(
		() =>
			(container = new Container({
				resolveChildren: false,
				resolveParent: false,
			})),
	);

	describe("namespaces", () => {
		test("addNamespace", () => {
			container.addNamespace("test");
			expect(container.getNamespace("test")).not.toBeNull();
		});

		test("addNamespace with a function", () => {
			const v = {
				canBeRemoved: () => true,
				resolve: (service: string) =>
					service === "test" ? 1 : undefined,
			};
			container.addNamespace("test", v);
			expect(container.getNamespace("test")).toBeUndefined();
			expect(container.resolve("test:test")).toBe(1);
			expect(() => container.resolve("test:test1")).toThrow(
				"Invalid dependency",
			);
		});

		test("getNamespace and resolve throw if a container doesn't have a certain namespace", () => {
			expect(() => container.getNamespace("test")).toThrow(
				"Invalid namespace",
			);
			expect(() => container.resolve("test:test")).toThrow(
				"Invalid namespace",
			);
		});

		test("removeNamespace", () => {
			container.addNamespace("test");
			container.removeNamespace("test");
			expect(() => container.getNamespace("test")).toThrow(
				"Invalid namespace",
			);
		});

		test("removeNamespace with a function namespace", () => {
			container.addNamespace("test", {
				canBeRemoved: () => false,
				resolve: undefined,
			});

			expect(() => container.removeNamespace("test")).toThrow(
				"Namespace not empty",
			);
		});

		test("removeNamespace with a function namespace allowing removes", () => {
			container.addNamespace("test", {
				canBeRemoved: () => true,
				resolve: undefined,
			});

			expect(() => container.removeNamespace("test")).not.toThrow();
		});

		test("removeNamespace with a non empty namespace", () => {
			container.addNamespace("test");

			container.bind("test", "test").toConstantValue(1);

			expect(() => container.removeNamespace("test")).toThrow(
				"Namespace not empty",
			);
		});
	});

	describe("binding", () => {
		test("bind", () => {
			container.bind("test").toConstantValue(1);
			expect(container.resolve("test")).toBe(1);
		});

		test("bind throws if used more than one time", () => {
			const bindObject = container.bind("test");
			bindObject.toConstantValue(1);
			expect(() => bindObject.toDynamicValue(() => 2)).toThrow(
				"Already bound",
			);
		});

		test("unbind", () => {
			container.bind("test").toConstantValue(1);
			container.unbind("test");
			expect(() => container.resolve("test")).toThrow(
				"Invalid dependency",
			);
		});

		test("rebind", () => {
			container.bind("test").toConstantValue(1);
			container.rebind("test").toConstantValue(2);
			expect(container.getNamespace(NO_NAMESPACE).resolve("test")).toBe(
				2,
			);
		});
	});

	describe("with and filters", () => {
		describe("with", () => {
			test("works", () => {
				container.bind("test").toConstantValue(1).withSubName("test1");
				expect(
					container
						.getNamespace(NO_NAMESPACE)
						["interfaces"].get("test").implementations[0].attributes
						.subName,
				).toEqual("test1");
			});

			test("doesn't pollute if not called", () => {
				container.bind("test").toConstantValue(1);
				expect(
					container
						.getNamespace(NO_NAMESPACE)
						["interfaces"].get("test").implementations[0]
						.attributes,
				).toBeUndefined();
			});
		});

		describe("filters", () => {
			test("works", () => {
				container.bind("test").toConstantValue(2).withSubName("test2");
				container.bind("test").toConstantValue(1).withSubName("test1");
				expect(container.resolve("test", { subName: "test1" })).toEqual(
					1,
				);
			});
		});
	});
	describe("arrays", () => {
		test("works", () => {
			container.bind("test").toConstantValue(1).withSubName("test");
			container.bind("test").toConstantValue(2).withSubName("test");
			container.bind("test").toConstantValue(3).withSubName("test");
			expect(
				container.resolve("test", { subName: "test" }, true),
			).toEqual([1, 2, 3]);
		});
		test("filter works", () => {
			container.bind("test").toConstantValue(1).withSubName("test");
			container.bind("test").toConstantValue(2).withSubName("test");
			container.bind("test").toConstantValue(3).withSubName("test");
			expect(
				container.resolve(
					"test",
					{ subName: "test", arrayMaxSize: 2 },
					true,
				),
			).toEqual([1, 2]);
		});
	});
});

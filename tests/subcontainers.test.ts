import "reflect-metadata";
import { Container } from "../src/index.js";

let container: Container;
let container1: Container;
let container2: Container;
describe("Sub containers", () => {
	beforeEach(() => {
		container = new Container({
			resolveChildren: true,
			resolveParent: false,
		});
		container.addChild("container1", {
			resolveChildren: false,
			resolveParent: true,
		});
		container.addChild("container2", {
			resolveChildren: false,
			resolveParent: true,
		});
		container1 = container.getChild("container1");
		container2 = container.getChild("container2");
	});
	test("works", () => {
		container1.bind("test1").toConstantValue(1);
		container2.bind("test2").toConstantValue(2);

		expect(container.resolve("test1")).toBe(1);
		expect(container.resolve("test2")).toBe(2);
		expect(container2.resolve("test1")).toBe(1);
		expect(container1.resolve("test2")).toBe(2);
	});
	test("works with custom namespaces", () => {
		container1.addNamespace("test");
		container2.addNamespace("test");
		container1.bind("test1", "test").toConstantValue(1);
		container2.bind("test2", "test").toConstantValue(2);

		expect(container.resolve("test:test1")).toBe(1);
		expect(container.resolve("test:test2")).toBe(2);
		expect(container2.resolve("test:test1")).toBe(1);
		expect(container1.resolve("test:test2")).toBe(2);
	});
	test("works with custom registries", () => {
		const v1 = {
			canBeRemoved: () => true,
			resolve: (dep: string) => (dep !== "test1" ? undefined : 1),
		};
		const v2 = {
			canBeRemoved: () => true,
			resolve: (dep: string) => (dep !== "test2" ? undefined : 2),
		};
		container1.addNamespace("test", v1);
		container2.addNamespace("test", v2);
		expect(container.resolve("test:test1")).toBe(1);
		expect(container.resolve("test:test2")).toBe(2);
		expect(container2.resolve("test:test1")).toBe(1);
		expect(container1.resolve("test:test2")).toBe(2);
	});
});

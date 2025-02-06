import "reflect-metadata";
import {
	afterConstruct,
	bindLazyInject,
	Container,
	inject,
	lazyInject,
} from "../src/index.js";

let container: Container;
describe("Decorators", () => {
	beforeEach(
		() =>
			(container = new Container({
				resolveChildren: false,
				resolveParent: false,
			})),
	);

	describe("inject", () => {
		test("property", () => {
			class Test {
				@inject()
				test: number;
			}
			container.bind("test").toConstantValue(1);
			const instance = container.create(Test);
			expect(instance.test).toBe(1);
		});

		test("property with resolve", () => {
			class Test {
				@inject()
				test: number;
			}
			container.bind("test").toConstantValue(1);
			container.bind("testclass").toClass(Test);
			const instance = container.resolve("testclass") as Test;
			expect(instance.test).toBe(1);
		});

		test("property array injection", () => {
			class Test {
				@inject(undefined, undefined, undefined, true)
				test: number[];
			}
			container.bind("test").toConstantValue(1);
			container.bind("test").toConstantValue(2);
			container.bind("test").toConstantValue(3);
			const instance = container.create(Test);
			expect(instance.test).toEqual([1, 2, 3]);
		});

		test("constructor", () => {
			class Test {
				public constructor(@inject("test") public test: number) {}
			}
			container.bind("test").toConstantValue(1);
			const instance = container.create(Test);
			expect(instance.test).toBe(1);
		});

		test("constructor with resolve", () => {
			class Test {
				public constructor(@inject("test") public test: number) {}
			}
			container.bind("test").toConstantValue(1);
			container.bind("testclass").toClass(Test);
			const instance = container.resolve("testclass") as Test;
			expect(instance.test).toBe(1);
		});

		test("constructor array injection", () => {
			class Test {
				public constructor(
					@inject("test", undefined, undefined, true)
					public test: number[],
				) {}
			}
			container.bind("test").toConstantValue(1);
			container.bind("test").toConstantValue(2);
			container.bind("test").toConstantValue(3);
			const instance = container.create(Test);
			expect(instance.test).toEqual([1, 2, 3]);
		});
	});

	describe("lazyInject", () => {
		test("not binded", () => {
			class Test {
				@lazyInject(container)
				test: number;
			}
			container.bind("test").toConstantValue(1);
			const instance = new Test();
			expect(instance.test).toBe(1);
		});
		test("not binded array injection", () => {
			class Test {
				@lazyInject(container, undefined, undefined, undefined, true)
				test: number;
			}
			container.bind("test").toConstantValue(1);
			container.bind("test").toConstantValue(2);
			container.bind("test").toConstantValue(3);
			const instance = new Test();
			expect(instance.test).toEqual([1, 2, 3]);
		});
		test("binded", () => {
			const lazy = bindLazyInject(container);
			class Test {
				@lazy()
				test: number;
			}
			container.bind("test").toConstantValue(1);
			const instance = new Test();
			expect(instance.test).toBe(1);
		});
		test("binded array injection", () => {
			const lazy = bindLazyInject(container);
			class Test {
				@lazy(undefined, undefined, undefined, true)
				test: number;
			}
			container.bind("test").toConstantValue(1);
			container.bind("test").toConstantValue(2);
			container.bind("test").toConstantValue(3);
			const instance = new Test();
			expect(instance.test).toEqual([1, 2, 3]);
		});
	});

	test("afterConstruct", () => {
		class Test {
			test: number;
			@inject()
			test2: number;

			@afterConstruct()
			public method() {
				this.test = 1;
			}
		}
		container.bind("test2").toConstantValue(2);
		const instance = container.create(Test);
		expect(instance.test).toBe(1);
		expect(instance.test2).toBe(2);
	});
});

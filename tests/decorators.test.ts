import "reflect-metadata";
import {
	afterConstruct,
	bindLazyInject,
	Container,
	inject,
	lazyInject,
} from "../src";

let container: Container;
describe("Decorators", () => {
	beforeEach(() => (container = new Container()));

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

		test("constructor", () => {
			class Test {
				public constructor(@inject("test") public test: number) {}
			}
			container.bind("test").toConstantValue(1);
			const instance = container.create(Test);
			expect(instance.test).toBe(1);
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
	});

	test("afterConstruct", () => {
		class Test {
			test: number;

			@afterConstruct()
			public method() {
				this.test = 2;
			}
		}
		const instance = container.create(Test);
		expect(instance.test).toBe(2);
	});
});

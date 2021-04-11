# yadi
## Yet Another Dependency Injection library
yadi is a simple and small dependency injection library.
yadi can inject dependencies using constructor injection and property injection
## Installation
Installing yadi is easy like running
```bash
$ npm install Begad666/yadi reflect-metadata --save
```
or
```bash
$ yarn add Begad666/yadi reflect-metadata
```
You will need a transpiler that supports decorators

To enable decorator support in typescript, add "experimentalDecorators": true in your tsconfig.json like:
```json
{
	// ...
	"compilerOptions": {
		// ...
		"experimentalDecorators": true,
		// ...
	}
	// ...
}
```
yadi also requires support for [Map](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map). If you need to support a JavaScript engine that doesn't support Map, you will need to import a polyfill.
## Usage
Import [reflect-metadata](https://github.com/rbuckton/reflect-metadata) and yadi in your entry point like:
```ts
// src/index.ts
import "reflect-metadata";
import { Container, inject } from "yadi";
// ...
```
Create a new container:
```ts
const container = new Container();
```
Optional: Add a new namespace:
```ts
container.addNamespace("papers")
```
Bind dependencies:
```ts
// If using property injection
class VeryTallPaper {
	@inject()
	private ruler: Ruler;
	get height() {
		return this.ruler.measure();
	}
}
// Or if using constructor injection
class VeryTallPaper {
	public constructor(@inject("ruler") private ruler: Ruler) {}
	get height() {
		return this.ruler.measure();
	}
}
class Ruler {
	public measure() {
		return 10;
	}
}
container.bind("ruler")
		 .toClass(Ruler);
container.bind("verytallpaper") // or container.bind("verytallpaper", "papers") if using namespaces
		 .toClass(VeryTallPaper);
```
Resolve it!
```ts
const paper = container.resolve("verytallpaper") // or container.resolve("papers:verytallpaper") if using namespaces
paper.height // 10
```
If you don't want to inject everything into the container use the create method of container like:
```ts
container.unbind("verytallpaper"); // Or don't bind it at all
const paper = container.create(VeryTallPaper)
paper.height // 10
```
## API Docs
The API docs is available at https://begad666.github.io/yadi
import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import gulpClean from "gulp-clean";
import gulpLint from "gulp-eslint";
import gulpPrettier from "gulp-prettier";
import gulpSourceMaps from "gulp-sourcemaps";
import gulpTypeDocs from "gulp-typedoc";
import yargs from "yargs";
const argv = yargs.argv;
const tsProject = gulpTypescript.createProject("tsconfig.json");
const tsProdProject = gulpTypescript.createProject("tsconfig.prod.json");

export function clean(): NodeJS.ReadableStream {
	return gulp.src("dist/**/*.*", { read: false }).pipe(gulpClean());
}

clean["description"] = "Cleans the dist directory";

export function prettier(): NodeJS.ReadableStream {
	return gulp.src("src/**/*.ts").pipe(gulpPrettier.check());
}

prettier["description"] = "Runs prettier on the src directory";

export function lint(): NodeJS.ReadableStream {
	return gulp
		.src("src/**/*.ts")
		.pipe(gulpLint(".eslintrc.json"))
		.pipe(gulpLint.format())
		.pipe(gulpLint.failAfterError());
}

lint["description"] = "Runs eslint on the src directory";

export function build(): NodeJS.ReadableStream {
	if (!argv.prod) {
		return gulp
			.src("src/**/*.ts")
			.pipe(gulpSourceMaps.init())
			.pipe(tsProject())
			.pipe(
				gulpSourceMaps.write(".", {
					includeContent: false,
					sourceRoot: "../src",
				})
			)
			.pipe(gulp.dest("dist"));
	} else {
		return gulp
			.src("src/**/*.ts")
			.pipe(tsProdProject())
			.js.pipe(gulp.dest("dist"));
	}
}

build["description"] = "Builds the src directory";
build["flags"] = {
	prod: "To build production build",
};

export function types(): NodeJS.ReadableStream {
	return gulp
		.src("src/**/*.ts")
		.pipe(tsProject())
		.dts.pipe(gulp.dest("types"));
}

types["description"] = "Generates types";

export function docs(): NodeJS.ReadableStream {
	return gulp
		.src("src/**/*.ts")
		.pipe(gulpTypeDocs(require("./typedoc.json")));
}

docs["description"] = "Generates docs";

export const compile = gulp.series(prettier, lint, build);

compile["description"] = "Runs prettier, lint and then builds it";

export function watch(): void {
	gulp.watch(tsProject.projectDirectory, compile);
}

watch["description"] = "Watches the files for changes";

export default gulp.series(clean, compile);

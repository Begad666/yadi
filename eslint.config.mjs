// TODO: rewrite this
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{
		ignores: ["**/node_modules", "**/types", "**/dist"],
	},
	...compat.extends("plugin:@typescript-eslint/recommended", "prettier"),
	{
		plugins: {
			"@typescript-eslint": typescriptEslint,
		},

		languageOptions: {
			globals: {
				...globals.node,
			},

			parser: tsParser,
			ecmaVersion: 11,
			sourceType: "module",
		},

		rules: {
			"@typescript-eslint/no-var-requires": "off",
			"@typescript-eslint/no-extra-parens": "off",
			"no-console": "error",
			"no-extra-parens": "off",
			eqeqeq: ["error", "smart"],
			"array-bracket-spacing": "off",
			"brace-style": "off",
			"comma-dangle": "off",
			"comma-spacing": "off",
			"comma-style": "off",
			quotes: "off",
			indent: "off",
			semi: "off",
			"semi-style": "off",
			"semi-spacing": "off",
			"@typescript-eslint/no-unused-vars": "warn",
		},
	},
];

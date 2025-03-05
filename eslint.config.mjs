import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";
import prettierPlugin from "eslint-plugin-prettier";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import jestPlugin from "eslint-plugin-jest";
export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,js}"],
    ignores: ["node_modules/", "dist/"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        describe: "readonly",
        beforeEach: "readonly",
        it: "readonly",
        expect: "readonly",
        jest: "readonly",
        Buffer: "readonly",
        atob: "readonly",
        process: "readonly",
        __dirname: "readonly"
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      n: nodePlugin,
      prettier: prettierPlugin,
      jest: jestPlugin,
    },
    rules: {
      "prettier/prettier": "error",
      "no-console": "warn",
      "n/no-unsupported-features/es-syntax": "off",
      "n/no-missing-import": "off",
      "n/no-unpublished-import": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
          "caughtErrors": "all",
          "caughtErrorsIgnorePattern": "^_",
          "destructuredArrayIgnorePattern": "^_",
          "varsIgnorePattern": "^(this\\.)?_(.*)$",
          "ignoreRestSiblings": true
        }
      ],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "eqeqeq": ["error", "always"],
      "curly": "error",
      "semi": ["error", "always"],
      "quotes": ["error", "single"],
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];

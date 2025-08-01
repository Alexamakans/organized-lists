import js from "@eslint/js";
import jsdoc from "eslint-plugin-jsdoc";
import jest from "eslint-plugin-jest";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
  },
  { rules: { "jsdoc/no-undefined-types": 1 }, plugins: { jsdoc } },
  {
    files: ["**/*.test.mjs", "**/__tests__/**/*.mjs"],
    plugins: { jest: jest },
    languageOptions: {
      globals: jest.environments.globals.globals,
    },
    rules: {
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/prefer-to-have-length": "warn",
      "jest/valid-expect": "error",
    },
  },
]);

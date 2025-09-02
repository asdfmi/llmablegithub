import tseslint from "typescript-eslint";
import globals from "globals";
import pluginImportX from "eslint-plugin-import-x";
import pluginPromise from "eslint-plugin-promise";
import pluginSimpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  {
    ignores: ["dist/**", ".wrangler/**", "vitest.config.ts"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: new URL('.', import.meta.url).pathname,
        allowDefaultProject: true,
      },
      globals: { ...globals.serviceworker },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "import-x": pluginImportX,
      promise: pluginPromise,
      "simple-import-sort": pluginSimpleImportSort,
    },
    rules: {
      "max-len": ["error", {code: 100}],
      "no-restricted-imports": ["error", { patterns: ["node:*", "fs", "path"] }],
      "no-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      "import-x/no-duplicates": "error",
      "require-await": "error",
      "promise/catch-or-return": "error",
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      parserOptions: { projectService: false },
    },
    rules: {
      "no-restricted-imports": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
);

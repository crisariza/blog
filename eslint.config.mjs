import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": typescriptEslint,
      react: react,
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...typescriptEslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      complexity: ["warn", 15],
      "max-depth": ["warn", 5],
      "max-params": ["warn", 6],
      "max-lines": [
        "warn",
        { max: 600, skipBlankLines: true, skipComments: true },
      ],
      "no-else-return": "warn",
      "no-magic-numbers": "off",
      camelcase: [
        "warn",
        {
          properties: "always",
          ignoreDestructuring: true,
          ignoreImports: true,
          ignoreGlobals: false,
        },
      ],
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variableLike",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
      ],
      "spaced-comment": ["warn", "always"],
      "no-warning-comments": [
        "warn",
        {
          terms: ["todo", "fixme", "xxx", "hack"],
          location: "anywhere",
        },
      ],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/jsx-key": "error",
      "react/no-array-index-key": "warn",
      "react/self-closing-comp": "warn",
      "react/jsx-no-bind": [
        "warn",
        {
          allowArrowFunctions: true,
          allowBind: false,
          allowFunctions: false,
        },
      ],
      "no-duplicate-imports": "warn",
      "no-useless-rename": "warn",
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-debugger": "error",
      "no-alert": "warn",
      "prefer-const": "warn",
      "no-var": "error",
      "prefer-arrow-callback": "warn",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "prefer-destructuring": [
        "warn",
        {
          array: false,
          object: true,
        },
      ],
      eqeqeq: ["warn", "always"],
      curly: ["warn", "all"],
      "no-trailing-spaces": "warn",
      "eol-last": ["warn", "always"],
      "no-multiple-empty-lines": ["warn", { max: 2, maxEOF: 0 }],
    },
  },
  prettier,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "dist/**",
      "build/**",
      "*.config.js",
      "*.config.ts",
      "*.config.mjs",
      "package-lock.json",
      "tsconfig.tsbuildinfo",
      "public/**",
      "*.min.js",
      "*.min.css",
    ],
  },
];

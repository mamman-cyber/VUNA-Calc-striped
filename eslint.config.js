const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    ignores: ["assets/js/bootstrap.min.js"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      ecmaVersion: "latest",
      sourceType: "script",
    },
    rules: {
      "no-unused-vars": ["warn", { args: "none", vars: "local", caughtErrors: "none" }],
      "no-undef": "error",
      "no-console": "off",
    },
  },
];

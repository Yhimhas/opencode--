export default [
  {
    files: ["opencode-harness-kit/scripts/**/*.mjs", "opencode-harness-kit/test/**/*.mjs", "scripts/**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-undef": "error",
      "no-constant-condition": "error",
    },
  },
]

import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: [
      "./coverage/*",
    ]
  },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: [
      "./coverage/*",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-unused-vars": "off", // because we want to allow all unused vars that start with "_"
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ],
      "react/display-name": "off",
      "react/prop-types": "off", // TODO,
      "@typescript-eslint/no-unused-expressions": "off", // TODO
      "@typescript-eslint/ban-ts-comment": "off", // TODO
      "react/no-children-prop": "off", // TODO,
    }
  },
];

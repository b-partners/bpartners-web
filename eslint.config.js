import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: ['./coverage/*', './test/*', './cypress.config.ts'],
  },
  { languageOptions: { globals: globals.browser } },
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: [
      './coverage/*',
      './test/*',
      './src/operations/annotator/components/3d-renderer/annotator-3d.tsx',
      './src/operations/annotator/components/3d-renderer/point-measure-line.tsx',
      './src/operations/annotator/components/3d-renderer/polygon-measure-line.tsx',
    ],
    rules: {
      'react/no-unescaped-entities': 'off',
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': 'off', // because we want to allow all unused vars that start with "_"
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/display-name': 'off',
      'react/prop-types': 'off', // TODO,
      '@typescript-eslint/no-unused-expressions': 'off', // TODO
      '@typescript-eslint/ban-ts-comment': 'off', // TODO
      'react/no-children-prop': 'off', // TODO,
    },
  },
];

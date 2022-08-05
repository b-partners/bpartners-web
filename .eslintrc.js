module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: ['plugin:react/recommended', 'prettier', 'airbnb'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react'],
  rules: {
    'import/prefer-default-export': 'off',
    'react/no-unescaped-entities': 'off',
    'max-len': ['error', { 'code': 120 }],
  },
};

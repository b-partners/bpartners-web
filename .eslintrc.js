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
        ecmaVersion: 6,
        sourceType: 'module',
    },
    plugins: ['react'],
    rules: {
        'import/prefer-default-export': 'off',
        'react/no-unescaped-entities': 'off',
        'max-len': ['error', { 'code': 120 }],
        "react/jsx-props-no-spreading": "off",
        "react/prop-types": "off"
    },
    settings: {
        'import/resolver': {
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                moduleDirectory: ['node_modules', 'src/'],
            },
        },
    }
};
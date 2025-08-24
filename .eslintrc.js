module.exports = {
    env: {
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended'
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'no-unused-vars': 'warn',
        'no-console': 'warn',
        'max-len': ['warn', { code: 120 }],
        'complexity': ['warn', 10],
        'no-var': 'error',
        'prefer-const': 'error',
        'eqeqeq': 'error',
        'no-eval': 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'coverage/',
        'public/',
        '*.log'
    ]
};
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                console: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                global: 'readonly',
                setTimeout: 'readonly',
                setInterval: 'readonly',
                clearTimeout: 'readonly',
                clearInterval: 'readonly'
            }
        },
        rules: {
            'indent': ['error', 4],
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
        ignores: [
            'node_modules/',
            'coverage/',
            'public/',
            '*.log',
            'package-lock.json'
        ]
    }
];
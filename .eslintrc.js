module.exports = {
    root: true,
    env: {
        node: true,
    },
    globals: {
        gapi: true,
    },
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/typescript/recommended',
        '@vue/eslint-config-airbnb',
        'prettier',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'vue/no-deprecated-slot-attribute': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
    },
    overrides: [
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            env: {
                jest: true,
            },
        },
        {
            files: ['src/utils/GoogleAuthorization.ts'],
            rules: {
                '@typescript-eslint/camelcase': 'off',
            },
        },
        {
            files: ['src/utils/ValidationErrorTransform.ts'],
            rules: {
                'no-plusplus': 'off',
                'class-methods-use-this': 'off',
            },
        },
        {
            files: ['src/views/VocabularyList.vue'],
            rules: {
                'no-param-reassign': 'off',
                'no-unused-expressions': 'off',
            },
        },
        {
            files: ['src/utils/Transformer.ts'],
            rules: {
                'class-methods-use-this': 'off',
            },
        },
    ],
};

module.exports = {
    root: true,
    env: {
        node: true,
    },
    globals: {
        gapi: true,
        google: true,
    },
    extends: [
        'plugin:vue/vue3-essential',
        'plugin:vuejs-accessibility/recommended',
        'eslint:recommended',
        '@vue/typescript/recommended',
        '@vue/eslint-config-airbnb',
        'prettier',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        parser: '@typescript-eslint/parser',
    },
    rules: {
        'no-console': 'off',
        'no-debugger': 'off',
        'no-unused-vars': 'off',
        'vue/no-deprecated-slot-attribute': 'off',
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-function-return-type': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        'no-shadow': 'off',
        'no-use-before-define': 'error',
        'vue/multi-word-component-names': 'off',
        // The recommended set leaves both of these off; every rule the plugin ships is on.
        'vuejs-accessibility/accessible-emoji': 'error',
        'vuejs-accessibility/no-onchange': 'error',
        'vue/no-unused-components': 'error',
    },
    overrides: [
        {
            files: ['tests/**/*.ts'],
            env: {
                jest: true,
            },
            rules: {
                'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
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
            files: ['src/views/VocabularyList.vue', 'src/views/LeitnerBoxItems.vue'],
            rules: {
                'no-param-reassign': 'off',
                'no-unused-expressions': 'off',
            },
        },
        {
            files: ['src/views/Settings.vue'],
            rules: {
                '@typescript-eslint/camelcase': 'off',
            },
        },
    ],
};

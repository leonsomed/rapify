module.exports = {
    env: {
        node: true,
        mocha: true
    },
    extends: [
        'airbnb'
    ],
    parserOptions: {
        ecmaFeatures: {
            experimentalObjectRestSpread: true,
            jsx: true
        },
        sourceType: 'module'
    },
    plugins: [
        'react',
        'jsx-a11y',
        'import'
    ],
    rules: {
        'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
        indent: [
            'error',
            4,
            { SwitchCase: 1 }
        ],
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'linebreak-style': [
            'error',
            'unix'
        ],
        quotes: [
            'error',
            'single'
        ],
        semi: [
            'error',
            'always'
        ],
        'no-underscore-dangle': [
            'error',
            { allow: ['_id', '_getData', '_condition', '_endpoint', '__has_children'] }
        ],
        'no-restricted-syntax': [0, 'ForOfStatement'],
        'default-case': [0],
        'no-console': ['error', { allow: ['log', 'warn', 'error'] }],
    }
};
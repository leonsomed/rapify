const path = require('path');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './test.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'tests.js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
        ],
    },
};

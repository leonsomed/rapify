const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
    target: 'node',
    mode: 'production',
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        library: 'rapify',
        libraryTarget: 'umd',
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
    plugins: [
        new CleanWebpackPlugin(['lib']),
    ],
};

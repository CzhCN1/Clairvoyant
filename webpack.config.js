const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const config = {
    entry: path.resolve(__dirname + '/src/app.ts'),
    // entry: path.resolve(__dirname + '/src/utils/index.ts'),
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname + '/dist'),
        library: 'KyeeMonitor',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" }
        ]
    },
    plugins: [
        new UglifyJsPlugin()
    ]
};

module.exports = config;


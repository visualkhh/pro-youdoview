const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin({
            cleanAfterEveryBuildPatterns: ['dist']
        }),
        new CopyPlugin({
            patterns: [
                { from: "resources", to: "resources" },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@src': path.resolve(__dirname, 'src'),
        },
        extensions: [ '.tsx', '.ts', '.js', '.mp4' ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        inline: true,
        hot:true
        // contentBase: './dist'
    }
};

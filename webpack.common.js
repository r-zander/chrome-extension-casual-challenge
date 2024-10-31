const path = require('path');

const webpack = require('webpack');
const DotenvPlugin = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const packageJson = require('./package.json');
const baseManifest = require('./src/manifest.json');

function modify(buffer) {
    let manifestOverrides = JSON.parse(buffer.toString());
    manifestOverrides = Object.assign({}, baseManifest, manifestOverrides)
    manifestOverrides.version = packageJson.version;
    return JSON.stringify(manifestOverrides, null, 2);
}

module.exports = env => {
    return {
        entry: {
            'service-worker': './src/background/serviceWorker.ts',
            'content-script': './src/content-script/index.ts',
            'popup': './src/popup/index.ts',
            'deck-builder-website-script': './src/website-script/deckBuilder.ts'
        },
        module: {
            rules: [
                {
                    test: /\.(js|ts)x?$/,
                    use: ['babel-loader'],
                    exclude: /node_modules/,
                },
                {
                    test: /\.(scss|css)$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
                },
            ],
        },
        optimization: {
            minimizer: [
                new CssMinimizerPlugin(),
                '...'
            ],
        },
        resolve: {
            extensions: ['.ts', '.js'],
        },
        output: {
            filename: '[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        plugins: [
            new DotenvPlugin(),
            new ESLintPlugin({
                extensions: ['js', 'ts'],
                overrideConfigFile: path.resolve(__dirname, '.eslintrc'),
            }),
            new MiniCssExtractPlugin({
                filename: 'styles/[name].css',
            }),
            new CopyPlugin({
                patterns: [
                    {from: 'static'},
                    {
                        from: env.manifest,
                        to: "manifest.json",
                        transform(content) {
                            return modify(content)
                        }
                    }
                ],
            }),
            new webpack.DefinePlugin({
                __EXTENSION_ID__: JSON.stringify(env.extId),
                __BROWSER__: JSON.stringify(env.browser)
            }),
        ],
    };
};

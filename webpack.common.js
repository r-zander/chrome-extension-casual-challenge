const path = require('path');

const DotenvPlugin = require('dotenv-webpack');
const ESLintPlugin = require('eslint-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const packageJson = require('./package.json');
const baseManifest = require('./src/manifest.json');

function modify(buffer) {
    var manifestOverrides = JSON.parse(buffer.toString());
    manifestOverrides = Object.assign({}, baseManifest, manifestOverrides)
    manifestOverrides.version = packageJson.version;
    return JSON.stringify(manifestOverrides, null, 2);
}

module.exports = env => {
    return {
        entry: {
            'serviceWorker': './src/serviceWorker.ts',
            'decklist-content-script': './src/content-script/decklist/index.ts',
            'single-card-content-script': './src/content-script/single-card/index.ts',
            'popup': './src/popup.ts',
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
        ],
    };
};

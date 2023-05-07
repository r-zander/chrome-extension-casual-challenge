const {merge} = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = module.exports = env => {
    return merge(common(env), {
        mode: 'development',
        devtool: 'inline-source-map',
        devServer: {
            static: './dist',
        },
    });
}

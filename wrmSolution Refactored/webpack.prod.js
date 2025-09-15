const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'production',
    devtool: 'source-map', // keine Maps, minimiertes Bundle
    optimization: {
        minimize: true,
    },
});

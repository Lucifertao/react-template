const merge = require('webpack-merge');
const base = require('./webpack.base');
const prod = require('./webpack.prod');
const dev = require('./webpack.dev');
const NODE_ENV = process.env.NODE_ENV;
let config;
if (NODE_ENV === 'development') {
    config = dev
} else {
    config = prod
}
module.exports = merge(base, config);
const path = require('path');
const webpack = require('webpack');
const dllConfig = {
    mode: 'production',
    entry: {
        react: [
            'react', 'react-dom'
        ],
    },
    output: {
        filename: '[name]_dll.min.js',
        path: path.resolve(__dirname, './dll'),
        library: '[name]', // 指定导出全局变量的名称，要和dllPlugin中的name保持一直，其他模块会从此模块上获取对应的模块(react,react-dom)
        // 如何使用library webpack会输出 var ['name'] = lib_code 使用的时候 ['name'].do.... lib_code为对应导出库的代码
        libraryTarget: 'umd', // 指定库文件的模块化规范
        umdNamedDefine: true,
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]',
            path: path.resolve(__dirname, './dll/[name].manifest.json'),
        }),
    ]
};

module.exports = dllConfig;
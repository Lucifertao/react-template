const webpack = require('webpack');
const merge = require('webpack-merge');
const base = require('./webpack.base');
const path = require('path');
const getStylesLoaders = (cssOptions = {}, preProcessor) => {
  const loaders = [
    require.resolve('style-loader'),
    {
      loader: 'css-loader',
      options: cssOptions,
    },
    {
      loader: require.resolve('postcss-loader'),
      options: {
        plugins: [
          require('postcss-plugin-px2rem')({
            rootValue: 108,
            exclude: /(node_module)/,
            minPixelValue: 3,
            selectorBlackList: ['.animate', '.fail'],
          })
        ]
      }
    }
  ]
  if (preProcessor) {
    loaders.push({
      loader: preProcessor,
      options: {
        sourceMap: false,
      },
    });
  }
  return loaders;
}
const getCommonModuleRule = ({exclude = /node_modules/, include = path.resolve(__dirname, './src')} = {}) => {
  return {
    exclude,
    include,
  }
}

const config = {
  devtool: "source-map",
  devServer: {
    contentBase: './dist', // 根目录
    host: '0.0.0.0',
    port: 8080,
    compress: true, //是否启动gzi压缩
    hot: true, // 模块热替换
    hotOnly: true,
    inline: true // 自动注入websocket
  },
  watch: true, //源文件改变自动重新打包
  module: {
    rules: [
      {
        test: /\.css?$/,
        sideEffects: true, ...getCommonModuleRule(),
        loader: getStylesLoaders({importLoaders: 1})
      },
      {
        test: /\.scss?$/,
        sideEffects: true, ...getCommonModuleRule(),
        loader: getStylesLoaders({importLoaders: 1}, 'sass-loader')
      },
      {
        test: /\.less?$/,
        sideEffects: true, ...getCommonModuleRule(),
        loader: getStylesLoaders({importLoaders: 1}, 'less-loader')
      },
    ]
  },
  watchOptions: {
    ignored: /node_modules/,
    // poll: 1000, // 每1s查询一次是否变更
    // aggregateTimeout: 500, // 500ms内如果没有第二次修改，那么才会重新编译
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(), // 使用模块热加载插件
    new webpack.NamedModulesPlugin() // 用名称代替id
  ]
}
module.exports = merge(base, config);
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path')
const getStylesLoaders = (cssOptions = {}, preProcessor) => {
  const loaders = [
    {
      loader: require.resolve(MiniCssExtractPlugin.loader),
    },
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
};
const getCommonModuleRule = ({exclude = /node_modules/, include = path.resolve(__dirname, './src')} = {}) => {
  return {
    exclude,
    include,
  }
}
const cssExtract = new MiniCssExtractPlugin({
  filename: './static/css/[name].[contenthash:8].css',
  chunkFilename: './static/css/[name].[contenthash:8].css',
});

const config = {
  devtool: "source-map",
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
  plugins: [
    cssExtract,
  ]
}
module.exports = config;
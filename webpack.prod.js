const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const WebpackParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

const cssExtract = new MiniCssExtractPlugin({
  filename: 'static/css/[name].[contenthash:8].css',
  chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
});
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
          }),
        ],
      },
    },
  ];
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
const getCommonModuleRule = ({
  exclude = /node_modules/,
  include = path.resolve(__dirname, './src'),
} = {}) => ({
  exclude,
  include,
});
module.exports = {
  module: {
    rules: [
      {
        test: /\.css?$/,
        sideEffects: true,
        ...getCommonModuleRule(),
        loader: getStylesLoaders({ importLoaders: 1 }),
      },
      {
        test: /\.scss?$/,
        sideEffects: true,
        ...getCommonModuleRule(),
        loader: getStylesLoaders({ importLoaders: 1 }, 'sass-loader'),
      },
      {
        test: /\.less?$/,
        sideEffects: true,
        ...getCommonModuleRule(),
        loader: getStylesLoaders({ importLoaders: 1 }, 'less-loader'),
      },
    ],
  },
  plugins: [
    // 开启 css提取
    cssExtract,
    // 线上开启css压缩
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.css$/g, // 一个正则表达式，指示应优化/最小化的资产的名称。提供的正则表达式针对配置中ExtractTextPlugin实例导出的文件的文件名运行，而不是源CSS文件的文件名。默认为/\.css$/g
      cssProcessor: require('cssnano'), // 用于优化\最小化CSS的CSS处理器，默认为cssnano
      cssProcessorOptions: { safe: true, discardComments: { removeAll: true } }, // 传递给cssProcessor的选项，默认为{}
      canPrint: true, // 一个布尔值，指示插件是否可以将消息打印到控制台，默认为true
    }),
    // 线上开启代码压缩
    new WebpackParallelUglifyPlugin({
      /*
        是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用
        不大的警告
       */
      warnings: false,
      // workerCount:'4',
      uglifyJS: {
        output: {
          /*
           是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，
           可以设置为false
          */
          beautify: false,
          /*
           是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
          */
          comments: false,
        },
        compress: {
          /*
           是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
          */
          drop_console: true,

          /*
           是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不
           转换，为了达到更好的压缩效果，可以设置为false
          */
          collapse_vars: true,

          /*
           是否提取出现了多次但是没有定义的变量
          */
          reduce_vars: true,
        },
      },
    }), // 并行压缩文件
    // 使用dll库，不去打包react等包
    // [1]delegated ./node_modules/react/cjs/react.production.min.js from dll-reference bundle 42 bytes {0} [built]
    // [2] delegated ./node_modules/react-dom/cjs/react-dom.production.min.js from dll-reference bundle 42 bytes {0} [built]
  ],
};

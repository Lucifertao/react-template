const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HappyPack = require("happypack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const ModuleConcatenationPlugin = require("webpack/lib/optimize/ModuleConcatenationPlugin");
// webpack内联功能
const pathConfig = {
  NODE_ENV: '"production"',
  assetLibPublicPath: "./static/js",
  assetOutPutPath: "../lib"
};
const AddAssetHtmlWebpackPlugin = require("add-asset-html-webpack-plugin");

const makePlugins = configs => {
  const plugins = [];
  Object.keys(configs.entry).forEach(item => {
    plugins.push(
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, "./public/index.html"), // 模板
        filename: `./${item}.html`, // 输出的文件名称，保存在output目录
        minify: {
          removeAttributeQuotes: true // 移除属性的双引号
        },
        chunks: [
          item,
          "runtime~main",
          "commons",
          "react",
          "methods",
          "bundle",
          "vendors"
        ]
      })
    );
  });
  const files = fs.readdirSync(path.resolve(__dirname, "./dll"));
  files.forEach(file => {
    if (/.*\.min.js/.test(file)) {
      plugins.push(
        new AddAssetHtmlWebpackPlugin({
          filepath: path.resolve(__dirname, "./dll", file),
          publicPath: pathConfig.assetLibPublicPath,
          outputPath: "./static/js",
          includeSourcemap: false
        })
      );
    }
    if (/.*\.manifest.json/.test(file)) {
      plugins.push(
        new webpack.DllReferencePlugin({
          manifest: path.resolve(__dirname, "./dll", file),
          context: "."
        })
      );
    }
  });
  return plugins;
};
const getHappyPackModuleRule = ({
  test,
  id,
  exclude = /node_modules/,
  include = path.resolve(__dirname, "./src"),
  ...rest
}) => ({
  test,
  use: `happypack/loader?id=${id}`,
  exclude,
  include,
  ...rest
});

const config = {
  entry: {
    main: ["./public/viewport.js", "./src/index.jsx"]
  },
  output: {
    path: path.join(__dirname, "./dist"),
    filename: "./static/js/[name].[hash:10].js",
    chunkFilename: "./static/js/[name].[hash:8].chunk.js"
  },
  resolve: {
    alias: {
      react: path.resolve(
        require.resolve("react"),
        "../",
        "./umd/react.production.min.js"
      ),
      "react-dom": path.resolve(
        require.resolve("react-dom"),
        "../",
        "./umd/react-dom.production.min.js"
      )
    },
    extensions: [".js", ".jsx"],
    mainFields: ["main", "node", "browser"],
    modules: [path.resolve(__dirname, "node_modules")]
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      maxInitialRequests: 6,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          name: "vendors"
        },
        commons: {
          test: /\/src/,
          minChunks: 2,
          priority: 10,
          minSize: 0,
          name: "commons",
          reuseExistingChunk: true
        }
      }
    },
    runtimeChunk: true
  },
  module: {
    noParse: [/react\.production\.min\.js/],
    rules: [
      getHappyPackModuleRule({ test: /\.jsx?$/, id: "babel" }),
      {
        test: /\.(png|jpg|git|svg|bmp)/,
        use: {
          loader: "url-loader",
          options: {
            limit: 80 * 1024,
            outputPath: "images/"
          }
        }
      },
      {
        test: /\.html/,
        use: "html-withimg-loader"
      }
    ]
  },
  plugins: [
    new HappyPack({
      id: "babel",
      loaders: ["babel-loader"]
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      RUN_MODE: JSON.stringify(process.env.NODE_ENV)
    }),
    new ModuleConcatenationPlugin()
  ]
};
config.plugins = [...config.plugins, ...makePlugins(config)];
module.exports = config;

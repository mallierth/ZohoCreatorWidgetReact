const path = require("path");
const WebpackBundleAnalyzer = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  //entry: ['babel-polyfill', "./app/src/index.js"],
  entry: ['babel-polyfill', "./src/index.js"],
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/preset-react"],
          plugins: [
            [
              'babel-plugin-import',
              {
                libraryName: '@material-ui/core',
                libraryDirectory: '',
                camel2DashComponentName: false,
              },
              'core',
            ],
            [
              'babel-plugin-import',
              {
                libraryName: '@material-ui/icons',
                libraryDirectory: '',
                camel2DashComponentName: false,
              },
              'icons',
            ],
          ]
        },
      },
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-typescript"],
          plugins: ["@babel/plugin-proposal-class-properties"]
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|@mui)[\\/]/, //|@material-ui
          name: 'react',
          chunks: 'all',
        },
        xlsx: {
          test: /[\\/]node_modules[\\/](xlsx)[\\/]/,
          name: 'xlsx',
          chunks: 'all',
        },
        vendors: {
          test: /[\\/]node_modules[\\/]((?!(react|react-dom|@mui|xlsx)).*)[\\/]/, ///< put all used node_modules modules in this chunk //|@material-ui
          name: "vendors", ///< name of bundle
          chunks: "all" ///< type of code to put in this bundle
        },
      }
    }
  },
  resolve: { extensions: ["*", ".js", ".jsx", ".ts", ".tsx"] },
  output: {
    path: path.resolve(__dirname, "app/public/"),
    publicPath: "./app/public/",
    filename: "[name].js",
    sourceMapFilename: "[name].js.map",
    chunkFilename: "[id].[chunkhash].js",
  },
  devtool: "source-map", //development
  //devtool: "eval", //production
  //plugins: [new WebpackBundleAnalyzer()]
};
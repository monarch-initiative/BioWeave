var webpack = require('webpack');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

var path = require('path');
var dist = path.join(__dirname, 'docs');
var app = path.join(__dirname, 'app');
var bs = path.join(__dirname, 'node_modules/bootstrap');

var production = process.env.BUILD === 'production';
var debugMode = false;

var entryFile = './app.js';
var outputPath = dist;
var outputFile = './bundle.js';
var indexFile = 'index.ejs';
var baseURL = production ? '/bioweave/' : '/';

var config = {
  context: app,
  entry: entryFile,
  output: {
    path: outputPath,
    filename: outputFile
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
     {
        // Reference: https://github.com/babel/babel-loader
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          // https://github.com/babel/babel-loader#options
          cacheDirectory: false,
          presets: ['latest'],
          compact: false
        },
        // exclude: /node_modules/,
        include: [app, /sweet\.js\/browser\/scripts\/sweet.js/]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|txt|ico)$/,
        loader: 'file-loader',
        include: [bs]
      }
    ]
  },
  // node: {
  //   // fs: 'empty'
  //   console: false,
  //   global: true,
  //   process: true,
  //   Buffer: false,
  //   __filename: "mock",
  //   __dirname: "mock",
  //   setImmediate: true
  // },
  devServer: {
    inline: false,
    contentBase: outputPath,
    historyApiFallback: true
  },
  resolve: {
    modules: [
      app,
      'node_modules'
    ]
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './index.ejs',
      inject: 'head',
      baseUrl: baseURL
    }),
    new CopyWebpackPlugin([
        { from: 'ZFINToWikidata/ZFINgene.txt' },
        { from: 'ZFINToWikidata/ZFINwildtypes_fish.txt' }
    ])
  ]
};

if (production) {
  config.output.filename = '[name].js';

  config.devtool = 'source-map';

  config.entry = {
    bundle: entryFile,
    vendor: ['angular', 'lodash']
  };
  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({name: 'vendor', minChunks: Infinity}));

 config.plugins.push(
   // https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
   new UglifyJSPlugin({
     sourceMap: false,
     debug: false,
     compact: true,
     mangle: debugMode ?
               false :
               {
                 // mangle options here
               },
     compress: {
       warnings: false
     }
   })
 );
}

module.exports = config;

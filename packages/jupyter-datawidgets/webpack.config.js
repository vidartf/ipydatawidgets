var loaders = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.json$/, loader: 'json-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
];

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: __dirname + '/../../ipydatawidgets/nbextension/static',
    libraryTarget: 'amd'
  },
  module: {
    loaders: loaders
  },
  devtool: 'source-map',
  externals: ['@jupyter-widgets/base', 'jupyter-scales'],
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  }
};

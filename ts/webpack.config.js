var loaders = [
  { test: /\.ts$/, loader: 'ts-loader' },
  { test: /\.json$/, loader: 'json-loader' },
  { test: /\.js$/, loader: "source-map-loader" },
];

module.exports = {
  // Notebook extension
  entry: './src/nbextension.ts',
  output: {
    filename: 'extension.js',
    path: __dirname + '/../ipydatawidgets/nbextension/static',
    libraryTarget: 'amd'
  },
  module: {
    loaders: loaders
  },
  devtool: 'source-map',
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".webpack.js", ".web.js", ".ts", ".js"]
  }
};

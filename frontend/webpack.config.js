module.exports = {
    mode: 'production',
    entry: './src/js/index.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(png|jpe?g|gif)$/i,
        loader: 'file-loader'
        }
      ]
    }
}
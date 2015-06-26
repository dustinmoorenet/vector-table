module.exports = {
    entry: {
        app: './client/js/index.js',
        worker: './client/js/libs/packageWorker.js'
    },
    output: {
        path: './client',
        filename: '[name].bundle.js',
        chunkFilename: '[id].bundle.js',
        sourceMapFilename: '[file].map'
    },
    module: {
        loaders: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.html$/,
                loader: 'html-loader?minimize=false'
            }
        ]
    }
};

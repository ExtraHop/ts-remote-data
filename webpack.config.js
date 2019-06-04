module.exports = {
    entry: './index.ts',
    output: {
        filename: 'index.js',
        path: __dirname + '/lib',
    },
    mode: 'none',
    module: {
        rules: [{ test: /\.ts$/, loader: 'babel-loader' }],
    },
};

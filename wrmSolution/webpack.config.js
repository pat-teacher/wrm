// webpack.config.js
const path = require('path');

module.exports = {
    entry: {
        account_form: './WebResources/src/account/account.form.ts',
        contact_form: './WebResources/src/contact/contact.form.ts',
        kyc_approval_form: './WebResources/src/wrmr_risksummaryandapproval/kyc_approval.form.ts',
        testfile: './WebResources/src/test/testfile.ts'
    },
    output: {
        path: path.resolve(__dirname, 'WebResources/dist'),
        filename: '[name].js',
        library: ['WRM', '[name]'],
        libraryTarget: 'window',
        clean: true,
        // Optional: schönere Pfade im DevTools "Sources"-Baum
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/')
    },
    // Für echtes Debugging:
    mode: 'development',        // kein Minify, bessere Stacktraces
    devtool: 'inline-source-map',// Maps inline in die JS-Datei
    module: {
        rules: [{ test: /\.ts$/, use: 'ts-loader', exclude: /node_modules/ }]
    },
    resolve: { extensions: ['.ts', '.js'] }
};

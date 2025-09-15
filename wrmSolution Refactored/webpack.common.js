const path = require('path');

module.exports = {
    entry: {
        entities: './WebResources/src/entities/index.ts',
        crmCore: './WebResources/src/core/crm.core.ts',
        kyc_approval_form: './WebResources/src/form/kyc_approval.form.ts',
        dynamicMandatoryEngine: './WebResources/src/features/dynamicMandatory/dynamicMandatoryEngine.ts',
    },
    output: {
        path: path.resolve(__dirname, 'WebResources/dist'),
        filename: '[name].js',
        library: { name: ['WRM', '[name]'], type: 'window' },
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                    options: {
                        compilerOptions: {
                            sourceMap: true, // wichtig für Debugging
                        },
                    },
                },
                exclude: /node_modules/,
            },
        ],
    },
    resolve: { extensions: ['.ts', '.js'] },
};

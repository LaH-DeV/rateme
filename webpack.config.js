const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const getCommonConfig = () => {
    return {
        context: __dirname,
        module: {
            rules: [
                {
                    test: /\.ts?$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        mode: "production",
        devtool: false,
        target: ["web"],
        resolve: {
            extensions: [".ts", ".js"],
        },
    };
};
const cjmConfig = {
    ...getCommonConfig(),
    entry: {
        index: {
            import: "./src/index.ts",
            library: {
                name: "RateMe",
                type: "umd",
                umdNamedDefine: true,
                export: "default",
            },
        },
    },
    plugins: [new webpack.SourceMapDevToolPlugin({
        filename: 'sourcemaps/[file].map',
        append: false
    })],
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist", "cjm"),
    },
};

const esmConfig = {
    ...getCommonConfig(),
    entry: {
        index: {
            import: "./src/index.ts",
            library: {
                type: "module",
            },
        },
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        ],
    },
    experiments: {
        outputModule: true,
    },
    plugins: [new webpack.SourceMapDevToolPlugin({
        filename: 'sourcemaps/[file].map',
        append: false
    })],
    output: {
        module: true,
        filename: "[name].js",
        path: path.resolve(__dirname, "dist", "es")
    },
};

module.exports = [esmConfig, cjmConfig];

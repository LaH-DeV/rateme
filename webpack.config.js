import path from "path";
import { fileURLToPath } from 'url';
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";

const SourceMapDevToolPlugin = webpack.SourceMapDevToolPlugin;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    plugins: [new SourceMapDevToolPlugin({
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
    plugins: [new SourceMapDevToolPlugin({
        filename: 'sourcemaps/[file].map',
        append: false
    })],
    output: {
        module: true,
        filename: "[name].js",
        path: path.resolve(__dirname, "dist", "es")
    },
};

export default [esmConfig, cjmConfig];

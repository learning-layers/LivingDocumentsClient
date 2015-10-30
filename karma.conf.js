var path = require("path");
var webpack = require("webpack");
var node_modules = path.resolve(__dirname, "node_modules");
var pathToReact = path.resolve(node_modules, "react/dist/react-with-addons.js");
var pathToJQuery = path.resolve(node_modules, "jquery/dist/jquery.min.js");
var pathToReactIntl = path.resolve(node_modules, "react-intl/dist/react-intl-with-locales.min.js");
var pathToSweetAlert = path.resolve(node_modules, "sweetalert");

var webpackConfig = require('./webpack.config.js');
webpackConfig.devtool = 'inline-source-map';

module.exports = function (config) {
    config.set({
        browsers: [ "PhantomJS" ],
        // karma only needs to know about the test bundle
        files: [
            "test/tests.bundle.js"
        ],
        frameworks: [ "jasmine", "chai", "mocha" ],
        plugins: [
            "karma-phantomjs-launcher",
            "karma-jasmine",
            //"karma-chrome-launcher",
            "karma-chai",
            "karma-mocha",
            "karma-sourcemap-loader",
            "karma-webpack",
            "karma-coverage"
        ],
        // run the bundle through the webpack and sourcemap plugins
        preprocessors: {
            "test/tests.bundle.js": [ "webpack", "sourcemap", "coverage" ]
        },
        reporters: [ "dots", "coverage" ],
        singleRun: true,
        // webpack config object
        webpack: {
            resolve: {
                alias: {
                    "react/lib": path.resolve(node_modules, "react/lib"),
                    "jquery": pathToJQuery,
                    "react-intl": pathToReactIntl,
                    "underscore": path.resolve(node_modules, "underscore"),
                    "_": "underscore",
                    "griddle-react": path.resolve(__dirname, "app/custom-libs/griddle/griddle.js"),
                    "sweetalert": pathToSweetAlert
                },
                modulesDirectories: ["node_modules", "bower_components"]
            },
            output: {
                path: path.resolve(__dirname, "build"),
                filename: "bundle.js"
            },
            devtool: 'inline-source-map', //just do inline source maps instead of the default
            module: {
                loaders: [
                    {
                        test: /.+\.spec\.jsx?$/,
                        include: path.resolve(__dirname, "app"),
                        loader: "babel-loader"
                    },
                    {
                        test: /\.jpe?g$|\.json$|\.ico$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$|\.wav$|\.mp3$/,
                        loader: "file-loader"
                    }, {
                        test: /\.jsx?$/,
                        exclude: /node_modules/,
                        loaders: ["babel"]
                    }, {
                        test: /\.js$/,
                        include: path.resolve(__dirname, "app"),
                        loaders: ["babel"]
                    }, {
                        test: /\.css$/, // Only .css files
                        loader: "style!css" // Run both loaders
                    },
                    // LESS
                    {
                        test: /\.less$/,
                        loader: "style!css!less"
                    },

                    // SASS
                    {
                        test: /\.scss$/,
                        loader: "style!css!sass"
                    },  { test: /\.woff([\?]?.*)$/, loader: "url-loader?limit=10000&mimetype=application/font-woff" },
                    { test: /\.ttf([\?]?.*)$/,  loader: "url-loader?limit=10000&mimetype=application/octet-stream" },
                    { test: /\.eot([\?]?.*)$/,  loader: "file-loader" },
                    { test: /\.svg([\?]?.*)$/,  loader: "url-loader?limit=10000&mimetype=image/svg+xml" }
                ],
                noParse: [pathToReact, pathToJQuery, pathToReactIntl, pathToSweetAlert]
            },
            plugins: [
                new webpack.ProvidePlugin({
                    $: "jquery",
                    jQuery: "jquery",
                    _: "underscore",
                    React: "react",
                    ReactIntl: "react-intl"
                })
            ]
        },
        webpackMiddleware: {
            noInfo: true
        },
        coverageReporter: {
            // specify a common output directory
            dir: 'coverage',
            subdir: '.',
            reporters: [
                // reporters not supporting the `file` property
                { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' },
                // reporters supporting the `file` property, use `subdir` to directly
                // output them in the `dir` directory
                { type: 'cobertura', subdir: '.', file: 'cobertura.txt' },
                { type: 'lcovonly', subdir: '.', file: 'report-lcovonly.txt' },
                { type: 'teamcity', subdir: '.', file: 'teamcity.txt' },
                { type: 'text', subdir: '.', file: 'text.txt' },
                { type: 'text-summary', subdir: '.', file: 'text-summary.txt' }
            ]
        }
    });
};
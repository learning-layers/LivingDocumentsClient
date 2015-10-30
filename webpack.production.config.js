var path = require("path");
var webpack = require("webpack");
var node_modules = path.resolve(__dirname, "node_modules");
var pathToReact = path.resolve(node_modules, "react/dist/react.js");
var pathToJQuery = path.resolve(node_modules, "jquery/dist/jquery.min.js");
var pathToReactIntl = path.resolve(node_modules, "react-intl/dist/react-intl.js");
var pathToSweetAlert = path.resolve(node_modules, "sweetalert");

function random(low, high) {
    return Math.random() * (high - low) + low;
}

var randomInt = random(0, Number.MAX_SAFE_INTEGER);

var uglifyJsOptions = {
    minimize: false,
    mangle: false,
    preserveComments: false,
    compress: {
        warnings: false,
        drop_console: true,
        hoist_vars: true,
        unsafe: false
    },
    output: {
        comments: false
    },
    sourceMap: false
};

module.exports = {
    node: {
        fs: "empty"
    },
    entry: [
        path.resolve(__dirname, "app/main.js")
    ],
    debug: true,
    resolve: {
        alias: {
            "react/lib": path.resolve(node_modules, "react/lib"),
            "jquery": pathToJQuery,
            "react-intl": pathToReactIntl,
            "underscore": path.resolve(node_modules, "lodash"),
            "_": "underscore",
            "griddle-react": path.resolve(__dirname, "app/custom-libs/griddle/griddle.js"),
            "react-hot-loader/Injection": path.resolve(node_modules, "empty-module")
        },
        modulesDirectories: ["node_modules", "bower_components"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "app-" + randomInt + ".js"
    },
    module: {
        preLoaders: [
            {
                test: /\.jsx?/,
                // define an include so we check just the files we need
                include: path.resolve(__dirname, "app"),
                loader: "jsxhint-loader"
            },
            {
                test: /\.js$/,
                // define an include so we check just the files we need
                include: path.resolve(__dirname, "app"),
                loader: "jshint-loader"
            }
        ],
        loaders: [
        {
            test: /\.jpe?g$|\.json$|\.ico$|\.gif$|\.png$|\.woff$|\.ttf$|\.wav$|\.mp3$/, //|\.svg$
            loader: "file-loader"
        }, {
            test: /\.jsx?$/,
            include: path.resolve(__dirname, "app"),
            exclude: /.spec.jsx/,
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
            {
                test: /\.svg([\?]?.*)$/,
                loader: 'file-loader'
            }
            /*{ test: /\.svg([\?]?.*)$/,  loader: "url-loader?limit=10000&mimetype=image/svg+xml" }*/],
        noParse: [pathToJQuery, pathToReactIntl]
    },
    plugins: [
        /*new webpack.DefinePlugin({
            // This has effect on the react lib size.
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        }),*/
        new webpack.PrefetchPlugin("react"),
        new webpack.PrefetchPlugin("react/lib/ReactComponentBrowserEnvironment"),
        new webpack.ProvidePlugin({
            $: "jquery",
            _: "underscore",
            React: "react"
        }),
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.UglifyJsPlugin(uglifyJsOptions),
        new webpack.optimize.AggressiveMergingPlugin(),
        new webpack.DefinePlugin({
            // This has effect on the react lib size.
            "process.env": {
                NODE_ENV: JSON.stringify("production")
            }
        })
    ]
};
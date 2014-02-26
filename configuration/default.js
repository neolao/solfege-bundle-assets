module.exports = {
    // The base of the public URL
    // Example:
    // - '/:bundleId/'
    // - '/assets/:bundleId/'
    baseUrl: '/:bundleId/',

    // The destination of the computed files
    destination: {
        type: 'directory',
        path: __dirname + '/../public'
    },

    // The dump sequence
    dump: [
    ],

    // The available files
    files: [
        '@this:resources/**/*'
    ],

    // The javascript packages
    javascripts: {
        // The default filters for each package
        filters: [],

        // Package named "demo"
        demo: {
            // Files of the package
            files: [
                '@this:resources/javascripts/common.js',
                '@this:resources/javascripts/header.js'
            ],

            // The public URL of the package (optional)
            baseUrl: '/',

            // Override the default filters (optional)
            filters: []
        }
    },

    // The stylesheet packages
    stylesheets: {
        // The default filters for each package
        filters: [],

        // Package named "homepage"
        homepage: {
            // Files of the package
            files: [
                '@this:resources/stylesheets/common.css',
                '@this:resources/stylesheets/homepage.css'
            ],

            // The public URL of the package (optional)
            baseUrl: '/',

            // Override the default filters (optional)
            filters: []
        }
    }
};

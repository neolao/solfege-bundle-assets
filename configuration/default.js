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
        filters: [
            '@this.filters.combine'
        ],

        // Package named "demo"
        demo: {
            // Files of the package
            files: [
                '@this:resources/javascripts/common.js',
                '@this:resources/javascripts/header.js'
            ],

            // Base of the public URL of the package (optional)
            baseUrl: '/assets/javascripts/package/',

            // Override the default filters (optional)
            filters: null
        }
    },

    // The stylesheet packages
    stylesheets: {
        // The default filters for each package
        filters: [
            '@this.filters.combine'
        ],

        // Package named "homepage"
        homepage: {
            // Files of the package
            files: [
                '@this:resources/stylesheets/common.css',
                '@this:resources/stylesheets/homepage.css'
            ],

            // Base of the public URL of the package (optional)
            baseUrl: '/assets/stylesheets/package/',

            // Override the default filters (optional)
            filters: null
        }
    }
};

var solfege = require('solfegejs');
var co = require('co');
var expect = require('chai').expect;
var should = require('chai').should();

/**
 * Test the Manager class
 */
describe('Manager', function()
{
    var Application = solfege.kernel.Application;
    var Manager = require('../bundle/Manager');
    var application;
    var manager;

    /**
     * Initialize the test suite
     */
    before(function()
    {
        // Initialize the application
        application = new Application(__dirname);

        // Add the manager as a bundle
        manager = new Manager();
        application.addBundle('static', {__dirname: __dirname + '/static'});
        application.addBundle('assets', manager);

        // Override the configuration
        application.overrideConfiguration({

            assets: {
                // The available files
                files: [
                    '@static:resources/**/*'
                ],

                // Stylesheet packages
                stylesheets: {
                    // Default filters
                    filters: [
                        manager.filters.nop,
                        function*(files, contents) {
                            return contents.map(function(content) {
                                return content.replace('blue', 'red');
                            });
                        },
                        function*(files, contents) {
                            return contents.map(function(content) {
                                return content.replace('red', 'yellow');
                            });
                        }
                    ],

                    // Package "a"
                    a: {
                        files: [
                            __dirname + '/stylesheets/a.css'
                        ]
                    },

                    // Package "b"
                    b: {
                        files: [
                            __dirname + '/stylesheets/b.css'
                        ],
                        filters: [
                            function*(files, contents) {
                                return contents.map(function(content) {
                                    return content.replace('blue', 'green');
                                });
                            }
                        ]
                    },

                    // Package "c"
                    c: {
                        files: [
                            __dirname + '/stylesheets/a.css',
                            __dirname + '/stylesheets/b.css'
                        ]
                    },

                    // Package "d"
                    d: {
                        files: [
                            __dirname + '/stylesheets/a.css',
                            __dirname + '/stylesheets/b.css'
                        ],
                        baseUrl: '/css-package/'
                    },

                    // Package "e"
                    e: {
                        files: [
                            __dirname + '/stylesheets/a.css',
                            __dirname + '/stylesheets/b.css'
                        ],
                        filters: [manager.filters.combine],
                        baseUrl: '/css-combined/'
                    }

                },

                // Javascript packages
                javascripts: {
                    // Default filters
                    filters: [
                        manager.filters.nop
                    ],

                    // Package "a"
                    a: {
                        files: [
                            __dirname + '/javascripts/a.js'
                        ]
                    },

                    // Package "b"
                    b: {
                        files: [
                            __dirname + '/javascripts/b.js'
                        ],
                        filters: [
                            function*(files, contents) {
                                return contents.map(function(content) {
                                    return content + '\nconsole.log("ok");';
                                });
                            }
                        ]
                    },

                    // Package "c"
                    c: {
                        files: [
                            __dirname + '/javascripts/a.js',
                            __dirname + '/javascripts/b.js'
                        ]
                    },

                    // Package "d"
                    d: {
                        files: [
                            __dirname + '/javascripts/a.js',
                            __dirname + '/javascripts/b.js'
                        ],
                        baseUrl: '/js-package/'
                    },

                    // Package "e"
                    e: {
                        files: [
                            __dirname + '/javascripts/a.js',
                            __dirname + '/javascripts/b.js'
                        ],
                        filters: ['combine'],
                        baseUrl: '/js-combined/'
                    }
                }
            }
        });

        // Start the application
        application.start();
    });

    /**
     * Filters
     */
    describe('filters', function()
    {
        /**
         * The filter that no nothing
         */
        describe('#nop()', function()
        {
            it('should do nothing', co(function*()
            {
                var files = ['a', 'b'];
                var contents = ['c', 'd'];
                newContents = yield manager.filters.nop(files, contents);
                expect(files).to.deep.equal(['a', 'b']);
                expect(newContents).to.deep.equal(['c', 'd']);
            }));
        });

        /**
         * The filter that combine
         */
        describe('#combine()', function()
        {
            it('should combine', co(function*()
            {
                var files = ['a', 'b'];
                var contents = ['c', 'd'];
                newContents = yield manager.filters.combine(files, contents);
                expect(files).to.deep.equal(['a', 'b']);
                expect(newContents).to.have.length(1);
                expect(newContents).to.deep.equal(['cd']);
            }));
        });

    });

    /**
     * Test the getAssetUrl() function
     */
    describe('#getAssetUrl()', function()
    {
        // Fallback
        it('should return the URI if it is not a Solfege URI', co(function*()
        {
            var url = manager.getAssetUrl('/path/to/file');
            expect(url).to.equal('/path/to/file');
        }));

        // Handle Solfege URI
        it('should resolve the Solfege URI', co(function*()
        {
            var url = manager.getAssetUrl('@static:resources/robots.txt');
            expect(url).to.equal('/static/resources/robots.txt');
        }));

        // Handle glob Solfege URI
        it('should resolve the Solfege URI with wildcard', co(function*()
        {
            var url = manager.getAssetUrl('@static:resources/icons/*.png');
            expect(url).to.deep.equal(['/static/resources/icons/a.png', '/static/resources/icons/b.png']);
        }));


    });


    /**
     * Test the getStylesheetContent() function
     */
    describe('#getStylesheetContent()', function()
    {
        // Apply default filters
        it('should apply default filters', co(function*()
        {
            var content = yield manager.getStylesheetContent('a');
            expect(content).to.equal('body {\n    color: yellow;\n}\n');
        }));

        // Override filters
        it('should apply package filters', co(function*()
        {
            var content = yield manager.getStylesheetContent('b');
            expect(content).to.equal('a {\n    color: green;\n}\n');
        }));

    });

    /**
     * Test the getStylesheetUrls() function
     */
    describe('#getStylesheetUrls()', function()
    {
        // Package with 1 file
        it('should return the URLs of a package with 1 file', co(function*()
        {
            var urls = yield manager.getStylesheetUrls('a');
            expect(urls).to.deep.equal(['/a.css']);
        }));

        // Package with several files
        it('should return the URLs of a package with several files', co(function*()
        {
            var urls = yield manager.getStylesheetUrls('c');
            expect(urls).to.deep.equal(['/c-0.css', '/c-1.css']);
        }));

        // Custom base URL
        it('should return a custom base URL', co(function*()
        {
            var urls = yield manager.getStylesheetUrls('d');
            expect(urls).to.deep.equal(['/css-package/d-0.css', '/css-package/d-1.css']);
        }));

        // Combine
        it('should return a single URL if the filter "combine" is used', co(function*()
        {
            var urls = yield manager.getStylesheetUrls('e');
            expect(urls).to.deep.equal(['/css-combined/e.css']);
        }));
    });


    /**
     * Test the getJavascriptContent() function
     */
    describe('#getJavascriptContent()', function()
    {
        // Apply default filters
        it('should apply default filters', co(function*()
        {
            var content = yield manager.getJavascriptContent('a');
            expect(content).to.equal('function a() {\n}\n');
        }));

        // Override filters
        it('should apply package filters', co(function*()
        {
            var content = yield manager.getJavascriptContent('b');
            expect(content).to.equal('function b() {\n}\n\nconsole.log("ok");');
        }));
    });

    /**
     * Test the getJavascriptUrls() function
     */
    describe('#getJavascriptUrls()', function()
    {
        // Package with 1 file
        it('should return the URLs of a package with 1 file', co(function*()
        {
            var urls = yield manager.getJavascriptUrls('a');
            expect(urls).to.deep.equal(['/a.js']);
        }));

        // Package with several files
        it('should return the URLs of a package with several files', co(function*()
        {
            var urls = yield manager.getJavascriptUrls('c');
            expect(urls).to.deep.equal(['/c-0.js', '/c-1.js']);
        }));

        // Custom base URL
        it('should return a custom base URL', co(function*()
        {
            var urls = yield manager.getJavascriptUrls('d');
            expect(urls).to.deep.equal(['/js-package/d-0.js', '/js-package/d-1.js']);
        }));

        // Combine
        it('should return a single URL if the filter "combine" is used', co(function*()
        {
            var urls = yield manager.getJavascriptUrls('e');
            expect(urls).to.deep.equal(['/js-combined/e.js']);
        }));
    });


});

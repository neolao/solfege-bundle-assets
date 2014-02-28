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
        application.addBundle('assets', manager);

        // Override the configuration
        application.overrideConfiguration({
            assets: {
                // Stylesheet package
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
                expect(files[0]).to.equal('a');
                expect(files[1]).to.equal('b');
                expect(newContents.length).to.equal(contents.length);
                expect(newContents[0]).to.equal(contents[0]);
                expect(newContents[1]).to.equal(contents[1]);
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
                expect(files[0]).to.equal('a');
                expect(files[1]).to.equal('b');
                expect(newContents.length).to.equal(1);
                expect(newContents[0]).to.equal(contents[0] + contents[1]);
            }));
        });

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
});

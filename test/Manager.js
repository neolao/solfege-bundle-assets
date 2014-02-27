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
    before(co(function*()
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
                        function*(content) {
                            return content.replace('blue', 'red');
                        },
                        function*(content) {
                            return content.replace('red', 'yellow');
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
                            function*(content) {
                                return content.replace('blue', 'green');
                            }
                        ]
                    }

                }
            }
        });

        // Start the application
        application.start();
    }));


    /**
     * Test the getStylesheetContent() function
     */
    describe('#getStylesheetContent()', co(function*()
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

    }));
});

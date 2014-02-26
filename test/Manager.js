var solfege = require('solfegejs');
var co = require('co');
var expect = require('chai').expect;
var should = require('chai').should();

/**
 * Test the Manager class
 */
describe('Manager', function()
{
    var Manager = require('../bundle/Manager');
    var manager;

    /**
     * Initialize the test suite
     */
    before(co(function*()
    {
        manager = new Manager();
    }));


    /**
     * Test the filters
     */
    describe('filters)', co(function*()
    {
    }));
});

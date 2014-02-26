var solfege = require('solfegejs');

/**
 * The asset manager
 */
var Manager = solfege.util.Class.create(function()
{
    // Set the default configuration
    this.configuration = require('../configuration/default.js');

    // Initialize the available files
    this.availableFiles = [];

    // Bind public methods to this instance
    this.getAssetUrl = this.getAssetUrl.bind(this);

}, 'solfege.bundle.assets.Manager');
var proto = Manager.prototype;


/**
 * The application instance
 *
 * @type {solfege.kernel.Application}
 * @api private
 */
proto.application;

/**
 * The configuration
 *
 * @type {Object}
 * @api private
 */
proto.configuration;

/**
 * Available files
 *
 * @type {Array}
 * @api private
 */
proto.availableFiles;

/**
 * Set the application
 *
 * @param   {solfege.kernel.Application}    application     Application instance
 * @api     public
 */
proto.setApplication = function*(application)
{
    this.application = application;

    // Set listeners
    var bindGenerator = solfege.util.Function.bindGenerator;
    this.application.on(solfege.kernel.Application.EVENT_BUNDLES_INITIALIZED, bindGenerator(this, this.onBundlesInitialized));
};


/**
 * Override the current configuration
 *
 * @param   {Object}    customConfiguration     The custom configuration
 * @api     public
 */
proto.overrideConfiguration = function*(customConfiguration)
{
    this.configuration = solfege.util.Object.merge(this.configuration, customConfiguration);
};

/**
 * Get the URL of an asset
 *
 * @param   {String}    assetUri    The asset uri
 * @api     public
 */
proto.getAssetUrl = function(assetUri)
{
    // Handle Solfege URI
    var isSolfegeUri = this.application.isSolfegeUri(assetUri);
    if (isSolfegeUri) {
        return this.getPublicUrlFromSolfegeUri(assetUri);
    }

    // Finally, return the original URI
    return assetUri;
};

/**
 * Get the URL of a javascript package
 *
 * @param   {String}    packageName     The package name
 * @api     public
 */
proto.getJavascriptUrl = function(packageName)
{
};

/**
 * Get the URL of a stylesheet package
 *
 * @param   {String}    packageName     The package name
 * @api     public
 */
proto.getStylesheetUrl = function(packageName)
{
};

/**
 * The server middleware
 *
 * @param   {solfege.bundle.server.Request}     request     The request
 * @param   {solfege.bundle.server.Response}    response    The response
 * @param   {GeneratorFunction}                 next        The next function
 * @api     public
 */
proto.middleware = function*(request, response, next)
{
    var url = require('url');
    var fs = require('fs');
    var urlInfo = url.parse(request.url);
    var publicUrl = urlInfo.pathname;

    // Get the server path from the public path
    var filePath = this.getFilePathFromPublicUrl(publicUrl);

    // Check if the file exists
    var fileExists = false;
    if (filePath) {
        try {
            var fileStats = yield solfege.util.Node.fs.stat(filePath);
            if (fileStats.isFile()) {
                fileExists = true;
            }
        } catch (error) {
        }
    }

    // Serve the file
    if (fileExists) {
        response.statusCode = 200;
        response.body = fs.createReadStream(filePath);
        return;
    }

    // Handle the next middleware
    yield *next;
};

/**
 * Executed when the bundles of the application are initialized
 *
 * @api private
 */
proto.onBundlesInitialized = function*()
{
    var self = this;

    // Populate the available files
    this.availableFiles = [];
    this.configuration.files.forEach(function(item) {
        var files = self.application.resolveSolfegeUri(item);
        if (files instanceof Array) {
            self.availableFiles = self.availableFiles.concat(files);
        } else if (typeof files === 'string') {
            self.availableFiles.push(files);
        } else {
            self.availableFiles.push(item);
        }
    });
};

/**
 * Get the public URL from a solfege URI
 *
 * @param   {String}    uri     The Solfege URI
 * @return  {String}            The public URL
 */
proto.getPublicUrlFromSolfegeUri = function(uri)
{
    var parts = this.application.parseSolfegeUri(uri);
    var bundleId = parts.bundleId;
    var relativeFilePaths = parts.relativeFilePaths;
    var publicUrls = [];

    if (relativeFilePaths instanceof Array === false) {
        return publicUrls;
    }

    relativeFilePaths.forEach(function(relativeFilePath) {
        publicUrls.push('/' + bundleId + '/' + relativeFilePath);
    });

    return publicUrls;
};

/**
 * Get the file path from a public URL
 *
 * @param   {String}    publicPath      The public URL of a file
 * @return  {String}                    The file path
 */
proto.getFilePathFromPublicUrl = function(publicUrl)
{
    var regexp = /^\/([^\/]+)\/(.+)$/;
    var parts = regexp.exec(publicUrl);

    if (parts && parts.length === 3) {
        var bundleId = parts[1];
        var path = parts[2];
        var solfegeUri = '@' + bundleId + ':' + path;
        var filePath;

        try {
            filePath = this.application.resolveSolfegeUri(solfegeUri);
        } catch (error) {
        }

        if (this.availableFiles.indexOf(filePath) === -1) {
            return false;
        }

        return filePath;
    }

    return false;
};

module.exports = Manager;


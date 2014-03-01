var solfege = require('solfegejs');

/**
 * The asset manager
 */
var Manager = solfege.util.Class.create(function()
{
    // Set the default configuration
    this.configuration = require('../configuration/default.js');

    // Initialize properties
    this.filters = require('./filters');

    // Initialize the available files
    this.availableFiles = [];

    // Bind public methods to this instance
    var bindGenerator = solfege.util.Function.bindGenerator;
    this.getAssetUrl = this.getAssetUrl.bind(this);
    this.getJavascriptContent = bindGenerator(this, this.getJavascriptContent);
    this.getJavascriptUrls = this.getJavascriptUrls.bind(this);
    this.getStylesheetContent = bindGenerator(this, this.getStylesheetContent);
    this.getStylesheetUrls = this.getStylesheetUrls.bind(this);

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
 * The available filters
 *
 * @type {Object}
 * @api public
 */
proto.filters;

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
 * Get the content of a javascript package
 *
 * @param   {String}    packageName     The package name
 * @return  {String}                    The content
 * @api     public
 */
proto.getJavascriptContent = function*(packageName)
{
    var self = this;

    // Get the package object
    var packageObject = this.configuration.javascripts[packageName];
    if (!packageObject) {
        return null;
    }

    // Get the files to filter
    var packageFiles = packageObject.files || [];
    var files = [];
    packageFiles.forEach(function(packageFile) {
        if (self.application.isSolfegeUri(packageFile)) {
            var resolved = self.application.resolveSolfegeUri(packageFile);
            if (resolved instanceof Array) {
                files.concat(resolved);
            } else {
                files.push(resolved);
            }
            return;
        }

        files.push(packageFile);
    });

    // Get the content of each file
    var contents = [];
    var fileCount = files.length;
    var content;
    for (var fileIndex = 0; fileIndex < fileCount; ++fileIndex) {
        var filePath = files[fileIndex];
        content = yield solfege.util.Node.fs.readFile(filePath, 'utf8');
        contents.push(content);
    }

    // Get the filters
    var defaultFilters = this.configuration.stylesheets.filters;
    var filters = packageObject.filters || defaultFilters;

    // Filter the contents
    var filterCount = filters.length;
    for (var filterIndex = 0; filterIndex < filterCount; ++filterIndex) {
        var filter = filters[filterIndex];
        contents = yield filter(files, contents);
    }


    // Return the content
    if (contents.length === 0) {
        return '';
    } else if (contents.length === 1) {
        return contents[0];
    } else {
        return contents;
    }

};

/**
 * Get the URL of a javascript package
 *
 * @param   {String}    packageName     The package name
 * @param   {Array}                     The file URLs
 * @api     public
 */
proto.getJavascriptUrls = function(packageName)
{
    // Get the package object
    var packageObject = this.configuration.javascripts[packageName];
    if (!packageObject) {
        return null;
    }

    // Set the base URL
    var baseUrl = '/';
    if (packageObject.baseUrl) {
        baseUrl = packageObject.baseUrl;
    }

    // Return multiple file names
    var total = packageObject.files.length
    if (total > 1) {
        var fileNames = [];
        for (var index = 0; index < total; ++index) {
            fileNames.push(baseUrl + packageName + '-' + index + '.css');
        }
        return fileNames;
    }

    // Return single file name
    return [baseUrl + packageName + '.css'];

};

/**
 * Get the content of a stylesheet package
 *
 * @param   {String}    packageName     The package name
 * @return  {String}                    The content
 * @api     public
 */
proto.getStylesheetContent = function*(packageName)
{
    var self = this;

    // Get the package object
    var packageObject = this.configuration.stylesheets[packageName];
    if (!packageObject) {
        return null;
    }

    // Get the files to filter
    var packageFiles = packageObject.files || [];
    var files = [];
    packageFiles.forEach(function(packageFile) {
        if (self.application.isSolfegeUri(packageFile)) {
            var resolved = self.application.resolveSolfegeUri(packageFile);
            if (resolved instanceof Array) {
                files.concat(resolved);
            } else {
                files.push(resolved);
            }
            return;
        }

        files.push(packageFile);
    });

    // Get the content of each file
    var contents = [];
    var fileCount = files.length;
    var content;
    for (var fileIndex = 0; fileIndex < fileCount; ++fileIndex) {
        var filePath = files[fileIndex];
        content = yield solfege.util.Node.fs.readFile(filePath, 'utf8');
        contents.push(content);
    }

    // Get the filters
    var defaultFilters = this.configuration.stylesheets.filters;
    var filters = packageObject.filters || defaultFilters;

    // Filter the contents
    var filterCount = filters.length;
    for (var filterIndex = 0; filterIndex < filterCount; ++filterIndex) {
        var filter = filters[filterIndex];
        contents = yield filter(files, contents);
    }


    // Return the content
    if (contents.length === 0) {
        return '';
    } else if (contents.length === 1) {
        return contents[0];
    } else {
        return contents;
    }
};


/**
 * Get the URLs of a stylesheet package
 *
 * @param   {String}    packageName     The package name
 * @return  {Array}                     The file URLs
 * @api     public
 */
proto.getStylesheetUrls = function(packageName)
{
    // Get the package object
    var packageObject = this.configuration.stylesheets[packageName];
    if (!packageObject) {
        return null;
    }

    // Set the base URL
    var baseUrl = '/';
    if (packageObject.baseUrl) {
        baseUrl = packageObject.baseUrl;
    }

    // Return multiple file names
    var total = packageObject.files.length
    if (total > 1) {
        var fileNames = [];
        for (var index = 0; index < total; ++index) {
            fileNames.push(baseUrl + packageName + '-' + index + '.css');
        }
        return fileNames;
    }

    // Return single file name
    return [baseUrl + packageName + '.css'];
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

    // Check each javascript packages
    var javascripts = this.configuration.javascripts;
    for (var javascriptName in javascripts) {
        if (javascriptName === 'filters') {
            continue;
        }

        var javascript = javascripts[javascriptName];
        var javascriptUrls = this.getJavascriptUrls(javascriptName);
        if (javascriptUrls.indexOf(publicUrl) !== -1) {
            var javascriptContent = yield this.getJavascriptContent(javascriptName);
            response.statusCode = 200;
            response.body = javascriptContent;
            return;
        }
    }

    // Check each stylesheet packages
    var stylesheets = this.configuration.stylesheets;
    for (var stylesheetName in stylesheets) {
        if (stylesheetName === 'filters') {
            continue;
        }

        var stylesheet = stylesheets[stylesheetName];
        var stylesheetUrls = this.getStylesheetUrls(stylesheetName);
        if (stylesheetUrls.indexOf(publicUrl) !== -1) {
            var stylesheetContent = yield this.getStylesheetContent(stylesheetName);
            response.statusCode = 200;
            response.body = stylesheetContent;
            return;
        }
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
    var packageName;

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

    // The function used by forEach method
    var resolveSolfegeFilter = function(filter, index, list) {
        if (typeof filter === 'string' && self.application.isSolfegeUri(filter)) {
            list[index] = self.application.resolveSolfegeUri(filter, self);
        }
    };

    // Parse the javascript filters
    // If there are Solfege URIs, then resolve them
    if (!this.configuration.javascripts) {
        this.configuration.javascripts = {};
    }
    var javascripts = this.configuration.javascripts;
    if (!javascripts.filters) {
        javascripts.filters = [];
    }
    javascripts.filters.forEach(resolveSolfegeFilter);
    for (packageName in javascripts) {
        if (packageName === 'filters') {
            continue;
        }
        if (javascripts[packageName].filters) {
            javascripts[packageName].filters.forEach(resolveSolfegeFilter);
        }
    }

    // Parse the stylesheet filters
    // If there are Solfege URIs, then resolve them
    if (!this.configuration.stylesheets) {
        this.configuration.stylesheets = {};
    }
    var stylesheets = this.configuration.stylesheets;
    if (!stylesheets.filters) {
        stylesheets.filters = [];
    }
    stylesheets.filters.forEach(resolveSolfegeFilter);
    for (packageName in stylesheets) {
        if (packageName === 'filters') {
            continue;
        }
        if (stylesheets[packageName].filters) {
            stylesheets[packageName].filters.forEach(resolveSolfegeFilter);
        }
    }
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


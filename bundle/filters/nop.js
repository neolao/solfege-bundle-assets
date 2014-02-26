/**
 * A filter that do nothing
 *
 * @param   {String}    filePath    The file path
 * @return  {String}                The new content of the file
 */
module.exports = function*(filePath)
{
    var fs = require('fs');
    var content = yield function(done) {
        fs.readFile(filePath, done);
    };

    return content;
};

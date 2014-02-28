/**
 * Combine contents
 *
 * @param   {Array}     files       The file list
 * @param   {Array}     contents    The content list
 */
module.exports = function*(files, contents)
{
    var combined = '';
    contents.forEach(function(content) {
        combined += content;
    });

    return [combined];
};

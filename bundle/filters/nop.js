/**
 * A filter that do nothing
 *
 * @param   {Array}     files       The file list
 * @param   {Array}     contents    The content list
 */
module.exports = function*(files, contents)
{
    return contents;
};

/**
 * System facility to manage files and directories.
 */

/* global sails:false */
/* global QbicLib:false */

var fs = require('fs');
var path = require('path');

module.exports = {

    /**
     * [exists description]
     * @param  {[type]} filePath [description]
     * @return {[type]}          [description]
     */
    exists: function (filePath) {
        return fs.existsSync(filePath);
    },

    /**
     * Read a JSON file and return a javascript object.
     * @param {String} filePath Full path of file to read.
     */
    loadJSON: function (filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        catch (e) {
            sails.log.error('File not found: ' + filePath);
            return ErrExcp.create(e);
        }
    },

    /**
     * [getFilesFromDir description]
     * @param {[type]}   directory [description]
     * @param {Function} callback  [description]
     */
    getFilesFromDir: function (directory, callback) {
        var result = [];
        var p = path.join(__dirname, directory);

        fs.readdir(p, function (err, files) {
            if (err) {
                throw err;
            }

            files.map(function (file) {
                return path.join(p, file);
            }).filter(function (file) {
                return fs.statSync(file).isFile();
            }).forEach(function (file) {
                result.push(file);
            });

            callback(result);
        });
    },

    /**
     * [createSymLink description]
     * @param {[type]} filePath [description]
     * @param {[type]} linkPath [description]
     */
    createSymLink: function (filePath, linkPath) {
        fs.symlinkSync(filePath, linkPath);
    }
};

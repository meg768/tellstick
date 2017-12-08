var Path = require('path');
var sprintf = require('yow/sprintf');
var fileExists = require('yow/fs').fileExists;
var readJSON = require('yow/fs').readJSON;
var telldus = require('telldus');



var Module = new function() {


    function defineArgs(args) {

        args.wrap(null);

    }

    function run(argv) {

        var parser = require('tellstick.conf-parser');

        try {
            parser.parse('/etc/tellstick.conf').then((config) => {
                console.log(JSON.stringify(config, null, '  '));
            });
        }
        catch (error) {
            console.log(error.stack);
        }


    }


    module.exports.command = 'parser';
    module.exports.describe = 'Parse /etc/tellstick.conf';
    module.exports.builder = defineArgs;
    module.exports.handler = run;



};

var Path = require('path');
var sprintf = require('yow/sprintf');
var fileExists = require('yow/fs').fileExists;
var readJSON = require('yow/fs').readJSON;
var telldus = require('telldus');



var Module = new function() {


    function defineArgs(args) {

        args.option('duration', {
            alias: 'd',
            describe: 'Scan for the specified number of seconds',
            default: 120
        });
        args.wrap(null);

    }

    function run(argv) {

        try {
            console.log(sprintf('Scanning for %d seconds...', argv.duration));

            telldus.addSensorEventListener(function(deviceId, protocol, model, type, value, timestamp) {
                console.log('New sensor event received: ', deviceId, protocol, model, type, value, timestamp);
            });

            setTimeout(function() {}, argv.duration * 1000);


        } catch (error) {
            console.log(error.stack);
        }


    }


    module.exports.command = 'sensors';
    module.exports.describe = 'Listen for sensors';
    module.exports.builder = defineArgs;
    module.exports.handler = run;



};

var Path = require('path');
var sprintf = require('yow/sprintf');
var fileExists = require('yow/fs').fileExists;
var readJSON = require('yow/fs').readJSON;
var telldus = require('telldus');



var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}


	function run(argv)
	{
		var listener = telldus.addSensorEventListener(function(deviceId,protocol,model,type,value,timestamp) {
		  console.log('New sensor event received: ',deviceId,protocol,model,type,value,timestamp);
		});
	}

	module.exports.command  = 'sensors';
	module.exports.describe = 'Listen for sensors';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

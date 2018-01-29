var sprintf = require('yow/sprintf');
var telldus = require('telldus');


var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}

	function run(argv) {

		try {
			console.log(sprintf('Scanning for %d seconds...', argv.duration));

			telldus.addRawDeviceEventListener(function(id, data) {
				console.log(id, data);
			});

			setTimeout(function(){}, argv.duration * 1000);


		}
		catch(error) {
			console.log(error.stack);
		}


	}

	module.exports.command  = 'test [options]';
	module.exports.describe = 'Test script for debugging';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

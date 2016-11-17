var sprintf = require('yow/sprintf');
var telldus = require('telldus');
var helper  = require('../scripts/helper.js');

var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}

	function run(argv) {

		try {
			var device = helper.getDevice(argv.device);

			console.log(sprintf('Turning device %s ON.', device.name));
			telldus.turnOnSync(device.id);
		}
		catch(error) {
			console.log(error.message);
		}
	}

	module.exports.command  = 'on <device>';
	module.exports.describe = 'Turn on the specified device';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

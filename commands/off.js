var sprintf = require('yow').sprintf;
var telldus = require('telldus');
var helper  = require('../scripts/helper.js');

var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}

	function run(argv) {

		try {
			var device = helper.getDevice(argv.device);

			console.log(sprintf('Turning device %s OFF.', device.name));
			telldus.turnOffSync(device.id);
		}
		catch(error) {
			console.log(error);
		}
	}

	module.exports.command  = 'off <device>';
	module.exports.describe = 'Turn off the specified device';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

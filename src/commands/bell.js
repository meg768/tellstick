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

			console.log(sprintf('Ringing doorbell %s.', device.name));
			telldus.bellSync(device.id);
		}
		catch(error) {
			console.log(error.message);
		}
	}

	module.exports.command  = 'bell <device>';
	module.exports.describe = 'Rings a doorbell';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

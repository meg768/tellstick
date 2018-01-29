var sprintf = require('yow/sprintf');
var telldus = require('telldus');


var Module = new function() {

	function defineArgs(args) {

		args.option('duration', {alias: 'd', describe:'Scan for the specified number of seconds', default:120});
		args.wrap(null);

	}

	function run(argv) {

		try {
			console.log(sprintf('Scanning for %d seconds...', argv.duration));

			telldus.addRawDeviceEventListener(function(id, data) {

				var packet = {};
				data.split(';').forEach((item) => {
					var split = item.split(':');
					if (split.length == 2) {
						packet[split[0]] = split[1];
					}
				});
				console.log(packet);
			});

			setTimeout(function(){}, argv.duration * 1000);


		}
		catch(error) {
			console.log(error.stack);
		}


	}

	module.exports.command  = 'scan [options]';
	module.exports.describe = 'Scan the 433 MHz band for registerred devices';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

var Path = require('path');
var sprintf = require('yow').sprintf;
var fileExists = require('yow').fileExists;
var readJSON = require('yow').readJSON;
var telldus = require('telldus');


var Module = new function() {

	function defineArgs(args) {

		args.option('duration', {alias: 'd', describe:'Scan for the specified number of seconds', default:120});
		args.wrap(null);

	}


	function registerDevices() {


		function getConfig() {
			var fileName = Path.join(__dirname, '../devices.json');

			if (!fileExists(fileName)) {
				throw new Error(sprintf('File \'%s\' not found.', fileName));
			}

			return readJSON(fileName);
		}

		var config = getConfig();
		var devices = config.devices;

		if (devices == undefined)
			throw new Error('Devices section missing in file.');


		devices.sort(function(a, b) {
			return a.name.localeCompare(b.name);
		});

		telldus.getDevicesSync().forEach(function(device) {
			telldus.removeDeviceSync(device.id);
		});

		for (var index in devices) {
			var device = devices[index];

			var id = telldus.addDeviceSync();

			console.log(sprintf('Registering device \'%s\'...', device.name));

			telldus.setNameSync(id, device.name);
			telldus.setProtocolSync(id, device.protocol);
			telldus.setModelSync(id, device.model);

			for (var parameterName in device.parameters) {
				telldus.setDeviceParameterSync(id, parameterName, device.parameters[parameterName].toString());

			}
		}

	}


	function run(argv) {

		registerDevices();
	}

	module.exports.command  = 'register';
	module.exports.describe = 'Registers devices specified in devices.json';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

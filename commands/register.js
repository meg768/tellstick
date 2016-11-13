var Path = require('path');
var sprintf = require('yow').sprintf;
var fileExists = require('yow').fileExists;
var readJSON = require('yow').readJSON;
var telldus = require('telldus');

var getConfig = require('../scripts/helper.js').getConfig;


var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}


	function registerDevices() {

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

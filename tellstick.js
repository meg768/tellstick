#!/usr/bin/env node

var Path = require('path');
var sprintf = require('yow').sprintf;
var fileExists = require('yow').fileExists;
var telldus = require('telldus');
var isObject = require('yow').isObject;
var isString = require('yow').isString;
var readJSON = require('yow').readJSON;
var redirectLogs = require('yow').redirectLogs;
var prefixLogs = require('yow').prefixLogs;

var App = function() {


	function registerDevices() {


		function getConfig() {
			var fileName = Path.join(__dirname, 'devices.json');

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

			telldus.setNameSync(id, device.name);
			telldus.setProtocolSync(id, device.protocol);
			telldus.setModelSync(id, device.model);

			for (var parameterName in device.parameters) {
				telldus.setDeviceParameterSync(id, parameterName, device.parameters[parameterName].toString());

			}
		}

	}

	function run() {
		try {
			registerDevices();

			var args = require('yargs');

			args.usage('Usage: $0 <command> [options]')

			args.command(require('./commands/off.js'));
			args.command(require('./commands/on.js'));
			args.command(require('./commands/scan.js'));
			args.command(require('./commands/list.js'));
			args.command(require('./commands/server.js'));

			args.help();

			args.argv;

		}
		catch(error) {
			console.log(error.message);
			process.exit(-1);
		}

	};

	run();
};

new App();

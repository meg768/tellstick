#!/usr/bin/env node

var fs = require('fs');
var Path = require('path');
var mkpath = require('yow').mkpath;
var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var isString = require('yow').isString;
var fileExists = require('yow').fileExists;
var readJSON = require('yow').readJSON;
var redirectLogs = require('yow').redirectLogs;
var prefixLogs = require('yow').prefixLogs;
var cmd = require('commander');
var telldus = require('telldus');

var App = function() {


	cmd.version('1.0.0');
	cmd.option('-l --log', 'redirect logs to file');
	cmd.option('-p --port <port>', 'connect to specified port (3002)', 3002);
	cmd.option('-1 --on <device>', 'turn on specified device');
	cmd.option('-0 --off <device>', 'turn off specified device');
	cmd.option('-s --scan', 'scan the 433 MHz band for all inputs');
	cmd.parse(process.argv);

	var _devices = undefined;

	function getDevices() {
		if (_devices == undefined) {

			_devices = {};

			telldus.getDevicesSync().forEach(function(device) {
				_devices[device.name] = device;
				_devices[device.id] = device;
			});
		}

		return _devices;
	}

	function findDevice(deviceName) {
		var devices = getDevices();

		return devices[deviceName];

	}

	function getConfig() {
		var fileName = Path.join(__dirname, 'devices.json');

		if (!fileExists(fileName)) {
			throw new Error(sprintf('File \'%s\' not found.', fileName));
		}

		return readJSON(fileName);
	}

	function registerDevices() {

		var config = getConfig();
		var devices = config.devices;

		if (devices == undefined)
			throw new Error('Devices section missing in file.');

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

	function scan() {
		console.log('Scanning for two minutes...');

		telldus.addRawDeviceEventListener(function(id, data) {
			console.log(id, data);
		});

		setTimeout(function(){}, 120 * 1000);
	}

	function run(port) {

		var app = require('http').createServer(function(){});
		var io = require('socket.io')(app);

		app.listen(port, function() {
			console.log('Listening on port', port, '...');
		});

		var namespace = io.of('/tellstick');

		telldus.addDeviceEventListener(function(id, status) {

			var device = findDevice(id);

			if (device != undefined) {
				var params = {};
				params.id = id;
				params.name = device.name;
				params.state = status.name;
				params.type = device.type;

				setTimeout(function() {
					console.log(params);
					namespace.emit('status', params);
				}, 0);

			}
			else {
				console.log('Device', id, 'not found.');
			}
		});


		namespace.on('connection', function(socket) {

			console.log('A connection arrived...', socket.id);

			socket.on('disconnect', function() {
				console.log('Disconnect from', socket.id);
			});

			socket.on('getDevices', function(emitName) {

				if (emitName == undefined)
					emitName = 'devices';

				var config = getConfig();
				var devices = config.devices;

				socket.emit(emitName, devices);
			})

			socket.on('turnOff', function(deviceName) {
				if (deviceName) {
					console.log('Turning off %s...', deviceName);
					var device = findDevice(deviceName);

					if (device != undefined) {
						telldus.turnOffSync(device.id);
					}
					else {
						console.log('Device %s not found.', deviceName);
					}

				}
			});

			socket.on('turnOn', function(deviceName) {
				if (deviceName) {
					console.log('Turning on %s...', deviceName);
					var device = findDevice(deviceName);

					if (device != undefined) {
						telldus.turnOnSync(device.id);
					}
					else {
						console.log('Device %s not found.', deviceName);
					}

				}
			})


		});
/*
		setInterval(function(){
			var params = {};
			params.id = 34;
			params.name = 'MEG';
			params.state = 'ON';
			params.type = 'DEVICE';
			namespace.emit('tellstick', params);
			console.log(params);

		}, 1000);
*/


	}



	prefixLogs();

	if (cmd.log) {
		var date = new Date();
		var path = sprintf('%s/logs', __dirname);
		var name = sprintf('%04d-%02d-%02d-%02d-%02d-%02d.log', date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());

		mkpath(path);
		redirectLogs(Path.join(path, name));
	}

	registerDevices();

	if (isString(cmd.on)) {
		var device = findDevice(cmd.on);
		console.log('Turning on', device.name);
		telldus.turnOnSync(device.id);
	}
	else if (isString(cmd.off)) {
		var device = findDevice(cmd.off);
		console.log('Turning off', device.name);
		telldus.turnOffSync(device.id);
	}
	else if (cmd.scan) {
		scan();
	}
	else {
		run(cmd.port);
	}


};

new App();

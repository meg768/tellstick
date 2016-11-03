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
		if (_devices == undefined)
			_devices = telldus.getDevicesSync();

		return _devices;
	}

	function findDevice(id) {
		var devices = getDevices();

		if (isObject(id) && id.id != undefined)
			id = id.id;

		id = isNaN(parseInt(id, 10)) ? id: parseInt(id, 10);

		for(var i = 0; i < devices.length; i++) {
			var device = devices[i];

			if (device.id === id || device.name === id) {
				return device;
			}
		}

	}

	function registerDevices() {


		var fileName = Path.join(__dirname, 'devices.json');

		if (fileExists(fileName)) {

			var devices = readJSON(fileName).devices;

			if (devices == undefined) {
				throw new Error('Devices section missing in file.');
			}

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
		else {
			throw new Error(sprintf('File \'%s\' not found.', fileName));
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
		//var app = require('http').createServer();
		var SocketIO = require('socket.io');
		//var io = new SocketIO({ rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] });
		var io = new SocketIO(); //{ rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] });

		io.listen(port);
		//var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] }).listen(8080);
		//var io = require('socket.io', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling'] }).listen(port);


		io.on('connection', function(socket) {

			console.log('A connection arrived...', socket.id);

			socket.on('disconnect', function() {
				console.log('Disconnect from', socket.id);
			});

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
			})

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

		telldus.addDeviceEventListener(function(id, status) {

			var device = findDevice(id);

			var params = {};
			params.id = id;
			params.name = device.name;
			params.state = status.name;
			params.type = device.type;

			console.log(params);
			io.emit('tellstick', params);
		});



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

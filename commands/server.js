#!/usr/bin/env node

var sprintf = require('yow').sprintf;
var isObject = require('yow').isObject;
var isString = require('yow').isString;
var telldus = require('telldus');

var Module = new function() {

	var _devices = undefined;

	function defineArgs(args) {

		args.option('port', {alias: 'p', describe:'Listen to specified port', default:3002});
		args.wrap(null);

	}

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

	function run(argv) {

		var app = require('http').createServer(function(){});
		var io = require('socket.io')(app);

		app.listen(argv.port, function() {
			console.log('Listening on port', argv.port, '...');
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


	}


	module.exports.command  = 'server [options]';
	module.exports.describe = 'Run as a server using socket.io';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;


};

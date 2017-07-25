#!/usr/bin/env node

var sprintf = require('yow/sprintf');
var range = require('yow/range');
var Path = require('path');
var isObject = require('yow/is').isObject;
var isString = require('yow/is').isString;
var logs = require('yow/logs');

var Schedule = require('node-schedule');
var telldus = require('telldus');

var getConfig = require('../scripts/helper.js').getConfig;


var Module = new function() {

	var _devices = undefined;
	var _pingTime = new Date();
	var _pingDeviceName = 'PS-01';

	function defineArgs(args) {

		args.option('log', {alias: 'l', describe:'Log output to file'});
		args.option('ping', {alias: 'P', describe:'Check status by pinging itself', default:true});
		args.wrap(null);

	}

	function reboot() {

	}
	function enablePing() {
		var timeout = 10000;
		var rule    = new Schedule.RecurrenceRule();
		rule.minute = range(0, 60, 5);

		Schedule.scheduleJob(rule, function() {
			var device = findDevice(_pingDeviceName);

			if (device != undefined) {
				console.log(sprintf('Pinging device %s.', _pingDeviceName));

				_pingTime = new Date();
				telldus.turnOnSync(device.id);

				setTimeout(function() {
					var now = new Date();
					var delta = now - _pingTime;

					if (delta >= timeout) {
						console.log('Tellstick not responding.');
					}

				}, timeout);
			}
			else {
				console.log('Ping device not found.');
			}
		});

	}

	function reboot() {
		console.log('Reboot is needed!!');
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

		var socket = require('socket.io-client')('http://app-o.se/services');

		logs.prefix();

		if (argv.ping)
			enablePing();

		telldus.addDeviceEventListener(function(id, status) {

			var device = findDevice(id);

			if (device != undefined) {
				var params = {};
				params.id    = id;
				params.name  = device.name;
				params.state = status.name;
				params.type  = device.type;

				_pingTime = new Date();

				setTimeout(function() {
					console.log(params);
					socket.emit('notify', 'status', params);
				}, 0);

			}
			else {
				console.log('Device', id, 'not found.');
			}
		});


		socket.on('connect', function() {

			console.log('Connected!');

			// Register the service
			console.log('Registering service');

			socket.emit('service', 'tellstick', ['devices', 'bell', 'turnOn', 'turnOff'], {timeout:4000});
		});

		socket.on('disconnect', function() {
			console.log('Disconnect from', socket.id);
		});

		socket.on('devices', function(params, fn) {

			var config = getConfig();
			var devices = config.devices;

			fn(devices);
		})

		socket.on('bell', function(deviceName, fn) {
			fn({status:'OK'});

			if (deviceName) {
				console.log('Ringing %s...', deviceName);
				var device = findDevice(deviceName);

				if (device != undefined) {
					telldus.bellSync(device.id);
				}
				else {
					console.log('Device %s not found.', deviceName);
				}


			}
		});

		socket.on('turnOff', function(deviceName, fn) {

			fn({status:'OK'});

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

		socket.on('turnOn', function(deviceName, fn) {
			fn({status:'OK'});

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

	}


	module.exports.command  = 'server [options]';
	module.exports.describe = 'Run as a server using socket.io';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;


};

#!/usr/bin/env node

var Path = require('path');
var sprintf = require('yow/sprintf');
var range = require('yow/range');
var isObject = require('yow/is').isObject;
var isString = require('yow/is').isString;
var isInteger = require('yow/is').isInteger;
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

		var socket = require('socket.io-client')('http://app-o.se/tellstick');

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
					socket.emit('status', params);
				}, 0);

			}
			else {
				console.log('Device', id, 'not found.');
			}
		});


		socket.on('connect', function() {

			console.log('Connected to socket server.');

			socket.emit('i-am-the-provider');
		});

		socket.on('disconnect', function() {
			console.log('Disconnected from socket server');
		});

		socket.on('devices', function(params, fn) {

			var config = getConfig();
			var devices = config.devices;

			fn(devices);
		})

		socket.on('bell', function(params, fn) {
			fn({status:'OK'});

			var deviceName = undefined;

			if (isString(params))
				deviceName = params;

			if (isObject(params))
				deviceName = params.device;

			if (isString(deviceName)) {
				console.log('Ringing %s...', deviceName);
				var device = findDevice(deviceName);

				if (device != undefined) {
					telldus.bellSync(device.id);
				}
				else {
					console.log('Device %s not found.', deviceName);
				}
			}
			else {
				console.log('Invalid device:', deviceName);

			}

		});


		socket.on('turnOff', function(params, fn) {

			fn({status:'OK'});

			var deviceName = undefined;

			if (isString(params))
				deviceName = params;

			if (isObject(params))
				deviceName = params.device;

			if (isString(deviceName)) {
				console.log('Turning off %s...', deviceName);
				var device = findDevice(deviceName);

				if (device != undefined) {
					telldus.turnOffSync(device.id);
				}
				else {
					console.log('Device %s not found.', deviceName);
				}

			}
			else {
				console.log('Invalid device:', deviceName);

			}
		});

		socket.on('turnOn', function(params, fn) {
			fn({status:'OK'});

			var deviceName = undefined;

			if (isString(params))
				deviceName = params;

			if (isObject(params))
				deviceName = params.device;

			if (isString(deviceName)) {
				console.log('Turning on %s...', deviceName);
				var device = findDevice(deviceName);

				if (device != undefined) {
					telldus.turnOnSync(device.id);
				}
				else {
					console.log('Device %s not found.', deviceName);
				}

			}
			else {
				console.log('Invalid device:', deviceName);

			}
		});

		socket.on('setState', function(params, fn) {

			try {
				var device = findDevice(params.device);
				var state  = undefined;

				if (device == undefined)
					throw new Error(sprintf('Invalid device name "%s".', params.device));

				if (isString(params.state)) {
					if (params.state.toUpperCase() == 'ON') {
						state = 1;
					}
					else if (params.state.toUpperCase() == 'OFF') {
						state = 0;
					}
					else {
						state = parseInt(params.state);
					}
				}
				else {
					state = parseInt(params.state);
				}

				if (!isInteger(state))
					throw new Error(sprintf('Invalid state "%s"', state));

				if (state) {
					console.log('Turning on %s...', device.name);
					telldus.turnOnSync(device.id);
				}
				else {
					console.log('Turning off %s...', device.name);
					telldus.turnOffSync(device.id);
				}

				fn({status:'OK'});

			}
			catch(error) {
				fn({error:error.message});

			}
		});
	}


	module.exports.command  = 'server [options]';
	module.exports.describe = 'Run as a server using socket.io';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;


};

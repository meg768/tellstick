#!/usr/bin/env node



var App = function() {
	//  	var socket = io('http://85.24.190.138:3002');

	var io = require('socket.io-client');
	//var socket = io('http://10.0.1.54:3002');
	var socket = io('http://localhost:3002/tellstick');
	//var socket = io.connect('http://10.0.1.54:3002', { rememberTransport: false, transports: ['WebSocket', 'Flash Socket', 'AJAX long-polling']});

	socket.on('connect', function(args) {
		console.log('Connected.');
	});

	socket.on('tellstick', function(args) {
		console.log(args);
	});


};

new App();

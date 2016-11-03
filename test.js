#!/usr/bin/env node



var App = function() {

	var io = require('socket.io-client');
  	var socket = io('http://85.24.190.138:3002');

	socket.on('status', function(args) {
		console.log(args);
	});


};

new App();

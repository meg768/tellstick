#!/usr/bin/env node

var sprintf = require('yow').sprintf;

var App = function() {


	this.fileName = __filename;

	function run() {
		try {
			var args = require('yargs');

			args.usage('Usage: $0 <command> [options]')

			args.command(require('./src/commands/off.js'));
			args.command(require('./src/commands/on.js'));
			args.command(require('./src/commands/bell.js'));
			args.command(require('./src/commands/scan.js'));
			args.command(require('./src/commands/list.js'));
			args.command(require('./src/commands/server.js'));
			args.command(require('./src/commands/register.js'));

			args.help();

			args.check(function(argv) {
				return true;
			});

			args.demand(1);

			args.argv;

		}
		catch(error) {
			console.log(error.stack);
			process.exit(-1);
		}

	};

	run();
};

module.exports = new App();

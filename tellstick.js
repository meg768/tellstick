#!/usr/bin/env node

var sprintf = require('yow').sprintf;

var App = function() {


	function run() {
		try {
			var args = require('yargs');

			args.usage('Usage: $0 <command> [options]')

			args.command(require('./commands/off.js'));
			args.command(require('./commands/on.js'));
			args.command(require('./commands/bell.js'));
			args.command(require('./commands/scan.js'));
			args.command(require('./commands/list.js'));
			args.command(require('./commands/server.js'));
			args.command(require('./commands/register.js'));

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

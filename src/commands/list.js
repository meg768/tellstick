var sprintf = require('yow').sprintf;
var telldus = require('telldus');
var helper  = require('../scripts/helper.js');

var Module = new function() {

	function defineArgs(args) {

		args.wrap(null);

	}

	function run(argv) {

		try {
			var table = require('text-table');

			var list = [];
			var header = [];

			header.push(['id', 'name', 'model', 'protocol', 'type', 'status']);
			header.push(['--', '----', '-----', '--------', '----', '------']);

			var devices = telldus.getDevicesSync();

			devices.forEach(function(device) {
				list.push([device.id, device.name, device.model, device.protocol, device.type, device.status.name]);
			});

			list.sort(function(a, b) {
				return a[1].localeCompare(b[1]);
			});

			console.log(table(header.concat(list), {align:['r','l']}));
		}
		catch(error) {
			console.log(error);
		}
	}

	module.exports.command  = 'list';
	module.exports.describe = 'List all devices';
	module.exports.builder  = defineArgs;
	module.exports.handler  = run;



};

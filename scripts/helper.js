var sprintf = require('yow').sprintf;
var fileExists = require('yow').fileExists;
var readJSON = require('yow').readJSON;
var telldus = require('telldus');


var findDevice = module.exports.findDevice = function(id) {

	var devices = telldus.getDevicesSync();

	for (var i = 0; i < devices.length; i++) {
		var device = devices[i];

		if (id == device.id)
			return device;

		if (id == device.name) {
			return device;

		}
	};
}

var getDevice = module.exports.getDevice = function(id) {

	var device = findDevice(id);

	if (device == undefined)
		throw new Error(sprintf('Device %s not defined.', id.toString()));
	else
		return device;
}


var getConfig = module.exports.getConfig = function() {
	var Path = require('path');
	var fileName = Path.join(__dirname, '../tellstick.json');

	if (!fileExists(fileName)) {
		throw new Error(sprintf('File \'%s\' not found.', fileName));
	}

	return readJSON(fileName);
}

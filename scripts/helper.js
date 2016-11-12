var sprintf = require('yow').sprintf;
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

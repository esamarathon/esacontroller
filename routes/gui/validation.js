

exports.validateCrosspointForm = function (body) {
	const res = {};
	res.rack = isRack(body.rack);
	res.preset = isNotEmpty(body.preset, "Preset is not set, so no change to be done.");
	return res;
}

exports.validateIN1606Form = function (body) {
	const res = {};
	res.rack = isRack(body.rack);

	res.input = isNumber(body.input, 1, 6);
	res.width = isNumberOpt(body.width, 10, 4096);
	res.height = isNumberOpt(body.height, 10, 2400);
	res.hshift = isNumberOpt(body.hshift, -2048, 2048);
	res.vshift = isNumberOpt(body.vshift, -1200, 1200);

	return res;
}

function isRack(value) {
	value = value.toLowerCase();
	if (value === 'all') {
		return value;
	}

	return isNumber(value);
}

function isNumber(value, min, max) {
	num = Number(value || Number.NaN);
	if (Number.isNaN(rack) || rack > max || rack < min) {
		throw `Value is out of range (${min}-${max}).`;
	}

	return num;
}

function isNumberOpt(value, min, max) {
	num = Number(value || Number.NaN);
	if (Number.isNaN(rack) || rack > max || rack < min) {
		return null;
	}

	return num;
}

function isNotEmpty(value, onerror) {
	value = (value || "").toLowerCase();
	if (value == "") {
		throw onerror || "No value";
	}
}

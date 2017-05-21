exports.validateCrosspointForm = function (body) {
	const res = {};
	res.rack = isRack(body.rack);
	res.preset = isNotEmpty(body.preset, "Preset is not set, so no change to be done.");
	return res;
}

exports.validateCrosspointDangerousForm = function (body) {
	const res = {};
	res.rack = isRack(body.rack);
	res.resetTies = isBoolean(body.resetTies);
	return res;
}

exports.validateIN1606Form = function (body) {
	const res = {};
	res.rack = isRack(body.rack);

	res.input = isNumberOpt(body.input, 1, 6);
	res.width = isNumberOpt(body.width, 10, 4096);
	res.height = isNumberOpt(body.height, 10, 2400);
	res.horizontalShift = isNumberOpt(body.horizontalShift, -2048, 2048);
	res.verticalShift = isNumberOpt(body.verticalShift, -1200, 1200);

	if (!(res.input || res.width || res.height || res.horizontalShift || res.verticalShift)) {
		throw "No change."
	}

	return res;
}

exports.validateOSSCForm = function (body) {
	const res = {};
	res.rack = isRack(body.rack);

	res.input = isString(body.input);
	res.interlacePassthrough = isBoolean(body.interlacePassthrough);
	res.lineMultiplier = isNumberOpt(body.lineMultiplier, 1, 5);

	if (!(res.input || res.interlacePassthrough || res.lineMultiplier)) {
		throw "No change."
	}

	return res;

}

exports.validateVP50Form = function (body) {
	const res = {};
	res.rack = isRack(body.rack);

	res.preset = isNumberOpt(body.preset);
	res.input = isString(body.input);

	if (!(res.preset || res.input)) {
		throw "No change."
	}

	return res;
}

function isRack(value) {
	value = value.toLowerCase();
	if (value === 'all') {
		return value;
	}

	return isNumber(value);
}

function isString(value) {
	if (typeof value === "string") {
		return value;
	} else {
		throw "Not a valid string.";
	}
}

function isNumber(value, min, max) {
	const num = Number(value || Number.NaN);
	if (Number.isNaN(value) || value > (max || 999999) || value < (min || -999999)) {
		throw `Value is out of range (${min}-${max}).`;
	}

	return num;
}

function isNumberOpt(value, min, max) {
	num = Number(value || Number.NaN);
	if (Number.isNaN(value) || value > (max || 999999) || value < (min || -999999)) {
		return null;
	}

	return num;
}

function isNotEmpty(value, onerror) {
	value = (value || "").toLowerCase();
	if (value == "") {
		throw onerror || "No value";
	}
	return value;
}

function isBoolean(value) {
	return !!value;
}

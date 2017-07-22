exports.Crosspoint = body => {
	if (typeof body === 'undefined') return undefined;
	const res = {};
	if (typeof body.preset != 'undefined' && body.preset != null) {
		res.preset = body.preset;
	}
	res.resetTies = isBoolean(body.resetTies);
	return res;
}

exports.IN1606 = body => {
	if (typeof body === 'undefined') return undefined;
	const res = {};
	if (typeof body.preset != 'undefined' && body.preset != null) {
		res.preset = body.preset;
	}

	if (body.input != undefined) {
		res.input = isNumberOpt(body.input, 1, 6);
	}
	if (body.autoimage != undefined) {
		res.autoimage = isBoolean(body.autoimage);
	}
	if (body.width != undefined) {
		res.width = isNumberOpt(body.width, 10, 4096);
	}
	if (body.height != undefined) {
		res.height = isNumberOpt(body.height, 10, 2400);
	}
	if (body.horizontalShift != undefined) {
		res.horizontalShift = isNumberOpt(body.horizontalShift, -2048, 2048);
	}
	if (body.verticalShift != undefined) {
		res.verticalShift = isNumberOpt(body.verticalShift, -1200, 1200);
	}

	return res;
}

exports.OSSC = body => {
	if (typeof body === 'undefined') return undefined;
	const res = {};
	if (body.input != undefined) {
		res.input = isString(body.input);
	}
	if (body.interlacePassthrough != undefined) {
		res.interlacePassthrough = isBoolean(body.interlacePassthrough);
	}
	if (body.lineMultiplier != undefined) {
		res.lineMultiplier = isNumberOpt(body.lineMultiplier, 1, 5);
	}
	return res;

}

exports.VP50 = body => {
	if (typeof body === 'undefined') return undefined;
	const res = {};
	if (body.preset != undefined) {
		res.preset = isNumberOpt(body.preset);
	}
	if (body.input != undefined) {
		res.input = isString(body.input);
	}
	return res;
}

function isString(value) {
	if (typeof value === "string") {
		return value;
	} else {
		throw "Not a valid string.";
	}
}

function isNumberOpt(value, min, max) {
	num = Number(value || 0);
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

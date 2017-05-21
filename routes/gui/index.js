const router = require('express').Router();
const expressLayouts = require('express-ejs-layouts');
const body_parser = require('body-parser');
var config = require('config');
const ESARack = require('../../esarack');

const validation = require('./validation.js')

router.use(expressLayouts);

router.get("/", function (req, res) {
	res.render('index.html', {
		presets: getPresets(),
		current: currentStatus()
	});
})

router.use(body_parser.urlencoded({
    extended: true
}));

router.post("/rack/crosspoint", deviceForm("Crosspoint", validation.validateCrosspointForm));

router.post("/rack/crosspoint/reset", function(req, res) {
	let params;
	try {
		params = validation.validateCrosspointDangerousForm(req.body);
	} catch (msg) {
		error(res, msg);
		return;
	}

	sendToRacks(
		params.rack, 
		"/api/crosspoint", 
		{resetTies: true});

	res.render('index.html', {
		current: currentStatus(),
		success: `Successfully reset crosspoint ties.`
	});
})

router.post("/rack/in1606", deviceForm("IN1606", validation.validateIN1606Form));

router.post("/rack/ossc", deviceForm("OSSC", validation.validateOSSCForm));

router.post("/rack/vp50", deviceForm("VP50", validation.validateVP50Form));


function deviceForm(device, validation) {
	return function(req, res) {
		let params;
		try {
			params = validation(req.body);
		} catch (msg) {
			error(res, msg);
			return;
		}

		const rack = params.rack;
		delete params["rack"]; //Cleanup to play nicer with later functions.

		// Send command to relevant rack (s).
		sendToRacks(
			rack, 
			"/api/" + device.toLowerCase(), 
			params);

		updateStatusCache(device, params)

		res.render('index.html', {
			presets: getPresets(),
			current: currentStatus(),
			success: `Successfully changed ${device} settings.`
		});

	};
}

/**
	Sends the parameters to the specified route on the specified rack.
	If rack is "all", the call will go out to all racks instead of just one.
*/
function sendToRacks(rack, route, params) {
	
	const esarack = new ESARack(config.get('esarack'));
	if (rack == "all") {
		for (let i = 0; i < 4; i++) {
			esarack.command(i, route, params);
		}
	} else {
		esarack.command(rack-1, route, params);
	}
}

function error(res, msg) {
	res.render('index.html', {
		error: msg,
		current: currentStatus()
	});
}

const statusCache = {
	rackSelection: {
		rack: 1,
		all: false
	},
	crosspoint: {
		preset: 0
	},
	in1606: {
		input: 0,
		width: 10,
		height: 10,
		horizontalShift: 0,
		verticalShift: 0
	},
	ossc: {
		input: "RGBs",
		interlacePassthrough: true,
		lineMultiplier: 2
	},
	vp50: {
		preset: "",
		input: "HDMI1"
	}
}


function currentStatus() {
	//TODO periodically ask rack for latest values.
	return statusCache;
}

function updateStatusCache(device, params) {
	device = device.toLowerCase();
	statusCache[device] = Object.assign(statusCache[device] || {}, params);
}


function getPresets() {
	//Temporary list.
	return [
		"NES",
		"NTSC SNES", 
		"PAL SNES", 
		"Genesis", 
		"Mega Drive", 
		"Wii", 
		"PS3", 
		"PC"
	]
}


module.exports = router;

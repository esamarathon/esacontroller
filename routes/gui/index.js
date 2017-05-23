const router = require('express').Router();
const expressLayouts = require('express-ejs-layouts');
const body_parser = require('body-parser');
var config = require('config');
const fs = require('fs');
const ESARack = require('../../esarack');

const validation = require('./validation.js')

router.use(expressLayouts);

router.get("/", function (req, res) {
	getPresets(presets => {
		res.render('index.html', {
			presets: presets,
			current: currentStatus()
		});
	});
})

const jsonencoded = body_parser.json();
const urlencoded = body_parser.urlencoded({
    extended: true
});

router.post("/rack/crosspoint", urlencoded, deviceForm("Crosspoint", validation.validateCrosspointForm));

router.post("/rack/crosspoint/reset", urlencoded, function(req, res) {
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

router.post("/rack/in1606", urlencoded, deviceForm("IN1606", validation.validateIN1606Form));

router.post("/rack/ossc", urlencoded, deviceForm("OSSC", validation.validateOSSCForm));

router.post("/rack/vp50", urlencoded, deviceForm("VP50", validation.validateVP50Form));

router.post("/rack/preset", jsonencoded, function( req, res) {
	var name = req.body.name
	if (typeof name == 'undefined' || name == "") {
		res.status(400);
		res.json({error: 'invalid name'});
		return;
	}
	fs.writeFile(
		"presets/" + req.body.name, 
		JSON.stringify(req.body), 
		() => {
			res.json({
				success: true,
				name: name
			})
		});
})


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


function getPresets(callback) {
	fs.readdir("presets", function(err, files) {
		if (err != null) {
			callback([]);
			return;
		}

		var pattern = /^(.*)\.json$/

		callback(files.map( file => {
			const match = pattern.exec(file);
			if (match != null && match.length > 1) return match[1]
			else return null;
		}).filter(file => file != null));


	});
}


module.exports = router;

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
			current: currentStatus(),
			racks: config.esarack.racks.map((x, i) => i+1)
		});
	});
})

const jsonencoded = body_parser.json();
const urlencoded = body_parser.urlencoded({
    extended: true
});

// Replace all of these with a single route for applying any setting to any device.
// Allows more flexible controls.

router.post("/rack/:rack(\\d|all)", jsonencoded, function (req, res) {
	let params;
	try {
		params =  {
			crosspoint: validation.Crosspoint(req.body.crosspoint),
			in1606: validation.IN1606(req.body.in1606),
			ossc: validation.OSSC(req.body.ossc),
			vp50: validation.VP50(req.body.vp50)
		}
	} catch (msg) {
		res.status(400);
		res.json({
			error: msg, 
			body: req.body,
			rack: req.params.rack
		});
		console.log("Validation error.", msg, req.body)
		return;
	}

	for (const i in params) {
		if (typeof params[i] == 'undefined' || params[i] == null) {
			delete params[i];
		}
	}

	const rack = req.params.rack === "all" 
		? "all" 
		: Number.parseInt(req.params.rack, 10);
	if (Number.isNaN(rack)) {
		res.status(400);
		res.json({
			error: "Invalid rack definition. ( 1-9 | all )", 
			body: req.body,
			rack: req.params.rack
		});
		console.log("Rack Validation error.", msg, req.body)
		return;
	}


	for (const device in params) {
		if (typeof params[device] == 'undefined') continue;
		sendToRacks(
			rack, 
			"/api/" + device, 
			params[device]);
	}

	updateStatusCache(params);

	res.json({
		body: params,
	});
});

/** 
*  Read preset from file.
**/
router.post("/rack/preset/:rack(\\d|all)", jsonencoded, function( req, res) {
	var name = req.body.name;
	console.log(req.body);
	if (typeof name == 'undefined' || name == "") {
		res.status(400);
		res.json({error: 'invalid name', body: req.body});
		return;
	}

	const rack = req.params.rack === "all" 
		? "all" 
		: Number.parseInt(req.params.rack, 10);
	if (Number.isNaN(rack)) {
		res.status(400);
		res.json({
			error: "Invalid rack definition. ( 1-9 | all )", 
			body: req.body,
			rack: req.params.rack
		});
		console.log("Rack Validation error.", msg, req.body)
		return;
	}

	fs.readFile("presets/" + name + ".json", (err, data) => {
		if (err) {
			res.json({
				success: false,
				name: name,
				error: err
			});
			return
		}

		const presetObj = JSON.parse(data);

		for (const device in presetObj) {
			if (typeof presetObj[device] == 'undefined') continue;
			sendToRacks(
				rack, 
				"/api/" + device, 
				presetObj[device]);
		}

		updateStatusCache(presetObj);

		res.json({
			success: true,
			name: name,
			values: presetObj
		});
	});
});

router.post("/rack/preset", jsonencoded, function( req, res) {
	var name = req.body.name;
	console.log(req.body);
	if (typeof name == 'undefined' || name == "") {
		res.status(400);
		res.json({error: 'invalid name', body: req.body});
		return;
	}
	fs.writeFile(
		"presets/" + name + ".json", 
		JSON.stringify(req.body, null, '  '), 
		() => {
			res.json({
				success: true,
				name: name
			});
		});
})

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

var statusCache = {
	rackSelection: {
		rack: 1,
		all: false
	},
	crosspoint: {
		preset: 0
	},
	in1606: {
		input: 0,
		width: 4096,
		height: 2400,
		horizontalShift: 0,
		verticalShift: 0
	},
	ossc: {
		input: "",
		interlacePassthrough: true,
		lineMultiplier: 2
	},
	vp50: {
		preset: "",
		input: ""
	}
};


function currentStatus() {
	//TODO periodically ask rack for latest values.
	return statusCache;
}

function updateStatusCache(params) {
	var cache = currentStatus();
		for (const device in params) {
			cache[device] = Object.assign(cache[device] || {}, params[device]);
		}
	statusCache = cache;
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

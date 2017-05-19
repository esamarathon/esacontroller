const router = require('express').Router();
const expressLayouts = require('express-ejs-layouts');
const body_parser = require('body-parser');
var config = require('config');
const ESARack = require('../../esarack');

const validation = require('./validation.js')

router.use(expressLayouts);

router.get("/", function (req, res) {
	res.render('index.html', {
		current: currentStatus()
	});
})

router.use(body_parser.urlencoded({
    extended: true
}));

router.post("/rack/crosspoint", function(req, res) {
	let params;
	try {
		params = validation.validateCrosspointForm(req.body);
	} catch (msg) {
		error(res, msg);
		return;
	}

	esarack = new ESARack(config.get('esarack'))

	// Send command to relevant rack (s).
	if (params.rack == "all") {
		for (let rack = 0; rack < 4; rack++) {
			esarack.command(rack, "/api/crosspoint", {
				preset: params.preset
			});
		}
	} else {
		esarack.command(params.rack-1, "/api/crosspoint", {
			preset: params.preset
		});
	}

	res.render('index.html', {
		current: currentStatus(),
		success: "Successfully changed crosspoint settings.",
		error: "No errors here!"
	});
});

function error(res, msg) {
	res.render('index.html', {
		error: msg,
		current: currentStatus()
	});
}

function currentStatus() {
	return {
			crosspoint: {
				preset: 0
			},
			in1696: {
				input: 2,
				width: 450,
				height: 356,
				hshift: 11,
				vshift: 90
			},
			ossc: {
				input: "RGBs",
				interlacePassthrough: true,
				lineMultiplier: 2
			},
			vp50: {
				preset: 12,
				input: 2
			}
		}
}



module.exports = router;

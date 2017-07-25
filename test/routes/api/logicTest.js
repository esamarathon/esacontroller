assert = require("assert");
var sinon = require('sinon');

logic = require("../../../routes/api/logic.js");


describe("API Logic", function() {
	describe('getRunData', function() {
		it('should return the old run from the event data', function() {
			const expected = {
				start: 150000003,
				end:   150000089,
			}
			const actual = logic.getRunData({
				oldrun: {
					start: 150000003,
					end:   150000089,
				}
			});
			assert.deepEqual(actual, expected);
		});
		it('except for the start time of the new run.', function() {
			const event = { 
				event: 'runStarted',
				data:{ 
					game: 'Sly Cooper and the Thievius Raccoonus',
					category: 'All Keys / Any%',
					time: '00:00:00',
					start: 1500996071.615,
					end: 1500996071.615 },
				oldrun: { 
			   		game: 'Final Fantasy VIII',
					category: 'PSX Disc US Any%',
					time: '08:57:37',
					start: 1500962357.529,
					end: 1500995101.179 
				}
			};

			const expected = { 
		   		game: 'Final Fantasy VIII',
				category: 'PSX Disc US Any%',
				time: '08:57:37',
				start: 1500962357.529,
				end: 1500996071.615 
			}

			const actual = logic.getRunData(event);
			assert.deepEqual(actual, expected);
		});
	});

	describe("speedcontrol-event", function() {
		it('should validate the speedcontrol API-key from the configuration.');
		it('should respond with 200: OK for any event except "runStarted"')
		it('should call getRunData with the event request body.');
		it('should reject run data where start time is <= 0');
		it('should call Youtube.simplify on the run data');
		it('should call youtube.uploadToYoutube with the simplified runData if enabled in config');
		it('should respond with 400 and the error message if youtube upload fails.');
	});

	describe("bigredbutton", function() {

	});

	describe("unimplemented", function() {
		it('Always respond with JSON message: "NOT IMPLEMENTED"');
	})
})

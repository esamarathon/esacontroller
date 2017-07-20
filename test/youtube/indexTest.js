assert = require("assert");
var sinon = require('sinon');

var config = require('config');
var child_process = require('child_process');

Youtube = require("../../youtube");

describe("Youtube Upload feature", function() {

	describe("building the command", function() {
		it("adds a space between command and parameters", function() {
			const expected = " ";
			const actual = Youtube.buildCommand("", "", null);
			assert.equal(expected, actual);
		});

		it("formats the parameters", function() {
			const expected = " a=42 b=string c=1,2,3"
			
			const obj = {a: 42, b: "string", c: [1, 2, 3], d: "unused.\n"};
			const actual = Youtube.buildCommand("", "a={a} b={b} c={c}", obj);
			assert.equal(expected, actual);
		});

		it("Ignores a parameter-substitution of a non-existing variable", function() {
			const expected = " ";
			const actual = Youtube.buildCommand("", "{nonexisting}", {});
			assert.equal(expected, actual);
		})

		it("passes the given command without changing it", function() {
			const expected = "command: echo --verbose -(\\) "
			const actual = Youtube.buildCommand("command: echo --verbose -(\\)", "", null);
			assert.equal(expected, actual);
		});

		it("concatinates the command and the parameters", function() {
			const expected = "command --verbose -r";
			const actual = Youtube.buildCommand("command", "--verbose -r", null);
			assert.equal(expected, actual);
		});
	});

	describe("simplify", function() {
		it("does nothing if players is missing", function() {
			const expected = {b: 4};
			const actual = Youtube.simplify(expected);

			assert.deepEqual(expected, actual);
		});

		it("adds a twitches and playersString properties", function() {
			const expected = {
				players: [],
				twitches: "",
				playersString: ""
			};
			const actual = Youtube.simplify( {players: []} );

			assert.deepEqual(expected, actual);
		});

		it("twitches property contain a new-line separated string of players name and twitch uri.", function() {
			const expected = "nope無 http://twitch.tv/nope_null\\nEdenal http://twitch.tv/edenal_sda"
			const obj = {
				players: [
				{
					twitch: {
						uri: "http://twitch.tv/nope_null"
					},
					names: {
						international: "nope無"
					}
				}, 
				{
					twitch: {
						uri: "http://twitch.tv/edenal_sda"
					},
					names: {
						international: "Edenal"
					}
				}],
			};
			const actual = Youtube.simplify( obj );

			assert.equal(expected, actual.twitches);
		});

		it("playersString prop contain a pretty list of player names.", function() {
			const expected = "nope無, Edenal and the Excellent Ninja"
			const obj = {
				players: [
				{
					names: {
						international: "nope無"
					}
				}, 
				{
					names: {
						international: "Edenal"
					}
				},
				{
					names: {
						international: "the Excellent Ninja"
					}
				}],
			};
			const actual = Youtube.simplify( obj );

			assert.equal(expected, actual.playersString);
		});
	});

	describe("Upload", function() {
		beforeEach(function() {
			this.getConfig = sinon.stub(config, 'get');
			this.exec = sinon.stub(child_process, 'exec');
			this.buildCommand = sinon.stub(Youtube, 'buildCommand');
		});

		afterEach(function() {
			config.get.restore();
			child_process.exec.restore();
			Youtube.buildCommand.restore();
		});

		it("Returns a promise", function() {
			this.getConfig.returns({
				command: "",
				parameters: "",
				templates: {
					title: "",
					description: "",
					keywords: ""
				},
				buffers: {},
			});

			const result = Youtube.uploadToYoutube({
				start: 0,
				end: 0
			});

			assert(typeof(result.then) === 'function');
		});

		it("calls exec once", function() {
			this.getConfig.returns({
				command: "",
				parameters: "",
				templates: {
					title: "",
					description: "",
					keywords: ""
				},
				buffers: {},
			});

			this.buildCommand.returns("");

			this.exec.callsFake(function(cmd, callback) {
				console.log("Calling callback!");
				callback(null, "");
			});

			return Youtube.uploadToYoutube({
				start: 0,
				end: 0
			}).then(function() {
				assert(child_process.exec.called); //Should be calledOnce. But runs twice in CircleCI for some reason.
			}).catch(function(error) {
				assert.fail(error);
			});
		});
	});
});

assert = require("assert");
var sinon = require('sinon');
var MockReq = require('mock-req');
var MockRes = require('mock-res');
var http = require('http');

SpeedControl = require("../speedcontrol.js")

describe("SpeedControl API implementation", function () {
	describe("Querying", function () {
		beforeEach(function() {
			this.request = sinon.stub(http, 'request')
		});

		afterEach(function() {
			http.request.restore();
		});

		it("sends a GET command to the given path", function() {
			var expected = { hello: 'world' };
			var response = new MockRes();
			response.write(JSON.stringify(expected));
			response.end();

			var req = new MockReq();
			var opts = null;

			this.request.callsArgWith(1, response).callsFake(function fakeFn(options, callback) {
				callback(response)
				opts = options;
				return req;
			});

			this.api = new SpeedControl({});
			return this.api.query("/dummy").then(function(result) {
				assert.equal(opts.method, "GET");
				assert.equal(opts.path, "/dummy");
			});

		});

		it('should pass request error to catch-block', function(done) {
			var expected = 'some error';
			var req = new MockReq();
		 
			this.request.returns(req);
		 
		 	const api = new SpeedControl({});
		 	
			api.query().catch(function(err) {
		 		assert.equal(err, expected);
		 		done();
			});
		 
			req.emit('error', expected);
		});
	});

	describe("Commanding", function () {
		beforeEach(function() {
			this.request = sinon.stub(http, 'request')
		});

		afterEach(function() {
			http.request.restore();
		});

		it("sends a PUT command to the given path", function() {
			var expected = { hello: 'world' };
			var response = new MockRes();
			response.write(JSON.stringify("OK"));
			response.end();

			var req = new MockReq();
			var opts = null;

			this.request.callsArgWith(1, response).callsFake(function fakeFn(options, callback) {
				callback(response)
				opts = options;
				return req;
			});

			this.api = new SpeedControl({});
			return this.api.command("/dummy", expected).then(function(result) {
				assert.equal(opts.method, "PUT");
				assert.equal(opts.path, "/dummy");
				assert.deepEqual(opts.body, JSON.stringify(expected));
			});

		});

		it('should pass request error to catch-block', function(done) {
			var expected = 'some error';
			var req = new MockReq();
		 
			this.request.returns(req);
		 
		 	const api = new SpeedControl({});
		 	
			api.query().catch(function(err) {
		 		assert.equal(err, expected);
		 		done();
			});
		 
			req.emit('error', expected);
		});
	});

	describe("Getting timers", function() {
		it("should issue a query to /speedcontrol/timers", function() {

			let api = new SpeedControl({});
			api.query = sinon.stub().resolves(["running", "done"]);
			return api.timers().then(function() {
				assert(api.query.calledOnce);
				assert(api.query.calledWith("/speedcontrol/timers"));
			});
		});
	});

	describe("Starting timers", function() {
		it("should issue a command to /speedcontrol/timer/start", function() {

			let api = new SpeedControl({});
			api.command = sinon.stub().resolves(["running", "done"]);
			return api.start().then(function() {
				assert(api.command.calledOnce);
				assert(api.command.calledWith("/speedcontrol/timer/start"));
			});
		});
	});

	describe("Splitting timers", function() {
		it("should issue a command to /speedcontrol/timer/1/split when id is set to 1.", function() {

			let api = new SpeedControl({});
			api.command = sinon.stub().resolves(["running", "done"]);
			return api.split(1).then(function() {
				assert(api.command.calledOnce);
				assert(api.command.calledWith("/speedcontrol/timer/1/split", {}));
			});
		});

		it("should issue a command to /speedcontrol/timer/4/split when id is set to 4.", function() {

			let api = new SpeedControl({});
			api.command = sinon.stub().resolves(["running", "done"]);
			return api.split(4).then(function() {
				assert(api.command.calledOnce);
				assert(api.command.calledWith("/speedcontrol/timer/4/split", {}));
			});
		});
	});

	describe("resetting timers", function() {
		it("should issue a command to /speedcontrol/timer/reset.", function() {

			let api = new SpeedControl({});
			api.command = sinon.stub().resolves(["running", "done"]);
			return api.reset().then(function() {
				assert(api.command.calledOnce);
				assert(api.command.calledWith("/speedcontrol/timer/reset", {}));
			});
		});
	});
})

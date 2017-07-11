OSSC = (function ($, ESAController) {
	function setInput(val) {
		ESAController.deviceForm(() => {return {
			ossc: {
				input: val
			}
		}})();
	}

	function setPreset(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}
		ESAController.deviceForm(() => {return {
			ossc: {
				preset: val
			}
		}})();
	}

	return {
		setInput: setInput,
		setPreset: setPreset
	}
})(jQuery, ESAController)

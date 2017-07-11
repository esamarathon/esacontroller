VP50 = (function ($, ESAController) {
	function setInput(val) {
		ESAController.deviceForm(() => {return {
			vp50: {
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
			vp50: {
				preset: val
			}
		}})();
	}

	return {
		setInput: setInput,
		setPreset: setPreset
	}
})(jQuery, ESAController)

Crosspoint = (function($, ESAController) {
	function setPreset(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}
		ESAController.deviceForm(() => {return {
			crosspoint: {
				preset: val
			}
		}})();
	}

	function resetTies() {
		ESAController.deviceForm(() => {return {
			crosspoint: {
				resetTies: true
			}
		}})();
	}

	return {
		setPreset: setPreset,
		resetTies: resetTies
	}
})(jQuery, ESAController)

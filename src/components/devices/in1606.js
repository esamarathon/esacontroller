IN1606 = (function($, ESAController) {

	function setInput(input) {
		ESAController.deviceForm(() => {return {
			in1606: {
				input: input
			}
		}})();
	}

	function setWidth(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}

		ESAController.deviceForm(() => {return {
			in1606: {
				width: val
			}
		}})();
	}

	function setHeight(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}

		ESAController.deviceForm(() => {return {
			in1606: {
				height: val
			}
		}})();
	}

	function setHPoz(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}

		ESAController.deviceForm(() => {return {
			in1606: {
				horizontalShift: val
			}
		}})();
	}

	function setVPoz(val) {
		if (typeof(val) === 'string') {
			val = Number.parseInt(val, 10);
		}

		if (typeof(val) !== 'number') {
			throw "Value must be a number."
		}

		ESAController.deviceForm(() => {return {
			in1606: {
				verticalShift: val
			}
		}})();
	}

	function autoImage() {
		ESAController.deviceForm(() => {return {
			in1606: {
				executeAutoImage: true
			}
		}})();
	}

	return {
		setInput: setInput,
		setWidth: setWidth,
		setHeight: setHeight,
		setHPoz: setHPoz,
		setVPoz: setVPoz,
		autoImage: autoImage
	}
})(jQuery, ESAController)

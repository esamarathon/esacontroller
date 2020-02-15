IN1606 = (function($, ESAController) {

	function setInput(input) {
		ESAController.deviceForm(() => {return {
			in1606: {
				input: input
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
		autoImage: autoImage
	}
})(jQuery, ESAController)

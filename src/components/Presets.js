Presets = (function ($, ESAController) {

	function recall(name) {
		if (typeof(name) !== 'string') {
			throw "Name must be a string."
		}

		if (name === "") {
			return; //Do nothing since no preset selected.
		}

		$.ajax("/rack/preset/" + $("input[name='rack']:checked").val(), {
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify({
				name: name
			})
		})
		.done(data => {
			console.log(data);
			ESAController.updateUI(data.values);
		})
		.fail( data => {
			$('#messages')
				.append(ESAController.callout('alert', "Failed to recall the preset."))
				.foundation();
		})

	}

	function store(name, values) {
		if (typeof(name) !== 'string') {
			throw "Name must be a string."
		}

		return $.ajax("/rack/preset", {
			type: 'POST',
			contentType: "application/json",
			data: JSON.stringify({
				name: name, 
				crosspoint: values["crosspoint"],
				in1606: values["in1606"],
				ossc: values["ossc"],
				vp50: values["vp50"],
			})
		});
	}

	return {
		recall: recall,
		store: store
	}
})(jQuery, ESAController)

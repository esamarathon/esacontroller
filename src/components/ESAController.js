ESAController = (function($) {

	function updateUI(newValues) {
		const mappings = [
		{
			path: "#crosspoint select[name=preset]",
			value: newValues.crosspoint ? newValues.crosspoint.preset : null
		},
		{
			path: "#ossc select[name=input]",
			value: newValues.ossc ? newValues.ossc.input : null
		},
		{
			path: "#ossc select[name=preset]",
			value: newValues.ossc ? newValues.ossc.preset : null
		},
		{
			path: "#in1606 select[name=input]",
			value: newValues.in1606 ? newValues.in1606.input : null
		},
		{
			path: "#in1606 input[name=width]",
			value: newValues.in1606 ? newValues.in1606.width : null
		},
		{
			path: "#in1606 input[name=height]",
			value: newValues.in1606 ? newValues.in1606.height : null
		},
		{
			path: "#in1606 input[name=horizontalShift]",
			value: newValues.in1606 ? newValues.in1606.horizontalShift : null
		},
		{
			path: "#in1606 input[name=verticalShift]",
			value: newValues.in1606 ? newValues.in1606.verticalShift : null
		},
		]
		for (const mapping of mappings)
			if (mapping.value)
				$(mapping.path).val(mapping.value)
	}

	function callout(className, message) {
		return $(`
		<div class="${className} callout" data-closable>
		  <h5>Success!</h5>
		  <p>${message}</p>
		  <button class="close-button" aria-label="Dismiss alert" type="button" data-close>
		    <span aria-hidden="true">&times;</span>
		  </button>
		</div>`);
	}


	function deviceForm(dataFn) {
		return () => $.ajax("/rack/" + $("input[name='rack']:checked").val(), {
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(dataFn())
		})
		.fail( data => {
			$('#messages')
				.append(callout('alert', "Failed to update the device."))
				.foundation();
		})
	}


	return {
		updateUI: updateUI,
		callout: callout,
		deviceForm: deviceForm
	}

})(jQuery)

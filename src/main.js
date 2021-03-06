(function($) {
	/** 
		Getter functions for each device 
	**/

	function getCrosspointValues() {
		return {
			preset: Number.parseInt($('#crosspoint select[name=preset]').val())
		}
	}

	function getIN1606Values() {
		return {
			input: $('#in1606 select[name=input]').val(),
			preset: $('#in1606 select[name=preset]').val(),
		}
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

	/** Form submit handlers **/

	function storePreset() {
		const presetName = $('#preset_name').val();
		$.ajax("/rack/preset", {
			type: 'POST',
			contentType: "application/json",
			data: JSON.stringify({
				name: presetName, 
				crosspoint: getCrosspointValues(),
				in1606: getIN1606Values(),
			})
		}).always(function() {
			$('#rack_store_modal').foundation('close');
		})
		.fail(function(data) {
			console.log('Failed to store preset.');
			console.log(data)
		})
		.done( function(data, textStatus) {
			console.log('Successfully stored the preset.');
			console.log(textStatus);
			console.log(data);
		});
	}

	function deviceForm(dataFn) {
		return () => $.ajax("/rack/" + $("input[name='rack']:checked").val(), {
			type: 'POST',
			contentType: 'application/json',
			data: JSON.stringify(dataFn())
		}).fail( data => {
			$('#messages')
				.append(callout('alert', "Failed to update the device."))
				.foundation();
		})
	}


	$("#rack_store_btn").click(storePreset);
	$("#crosspoint_form_submit")
		.click(
			deviceForm(() => { return {
				crosspoint: getCrosspointValues()
			}
		})
	);
})(jQuery);

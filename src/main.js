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
			width: Number.parseInt($('#in1606 input[name=width]').val(), 10),
			height: Number.parseInt($('#in1606 input[name=height]').val(), 10),
			horizontalShift: Number.parseInt($('#in1606 input[name=horizontalShift]').val(), 10),
			verticalShift: Number.parseInt($('#in1606 input[name=verticalShift]').val(), 10),
		}
	}

	function getOSSCValues() {
		return {
			input: $('#ossc select[name=input]').val(),
			interlacePassthrough: $('#ossc input[name=interlacePassthrough]').is(':checked'),
			lineMultiplier: Number.parseInt($('#ossc input[name=lineMultiplier]:checked').val(), 10)
		}
	}

	function getVP50Values() {
		return {
			preset: $('#vp50 select[name=preset]').val(),
			input: $('#vp50 select[name=input]').val(),
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
				ossc: getOSSCValues(),
				vp50: getVP50Values(),
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
		//}).done(data => {
		//	$('#messages')
		//		.append(callout('success', ""))
		//		.foundation();
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

	/*
	Cropper.setOnChange( () => {
		const bounds = Cropper.getBounds();
		const in1606Params = {
			width: Math.round(bounds.width),
			height: Math.round(bounds.height),
			horizontalShift: Math.round(bounds.startX),
			verticalShift: Math.round(bounds.startY)
		};

		$('#in1606 input[name=width]').val(in1606Params.width);
		$('#in1606 input[name=height]').val(in1606Params.height);
		$('#in1606 input[name=horizontalShift]').val(in1606Params.horizontalShift);
		$('#in1606 input[name=verticalShift]').val(in1606Params.verticalShift);

		deviceForm(() => { return {
			in1606: in1606Params
		}})();
		console.log(in1606Params);
	});
	*/
})(jQuery);

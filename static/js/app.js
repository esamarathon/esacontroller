(function($) {
	console.log("IT IS ALIVE!");

	function setRackValue() {
		const setting = $("#rack-selector-all").is(':checked');
		if (setting) {
			$("form input[name=rack]").val("all");
			$("#rack-selector").attr('disabled', 'disabled');
			return;
		}

		$("#rack-selector").removeAttr('disabled');

		value = Number($("#rack-selector").val());
		if (Number.isNaN(value) || value < 1 )  {
			$("#rack-selector").val(1);
		} else if (value > 4) {
			$("#rack-selector").val(4);
		}
			
		$("form input[name=rack]").val($("#rack-selector").val())
	}

	function storePreset() {
		const presetName = $('#preset_name').val();
		$.post("/rack/preset", JSON.stringify({
			name: presetName, 
			crosspoint: {
				preset: 7
			},
			ossc: {
				lineMultiplier: 3
			}
		})).always(function() {
			$('#rack_store_modal').foundation('close');
		})
		.fail(function() {
			console.log('Failed to store preset.');
		})
		.done( function(data, textStatus) {
			console.log('Successfully stored the preset.');
			console.log(textStatus);
			console.log(data);
		});
	}



	$("#rack-selector").change(setRackValue);

	$("#rack-selector-all").change(setRackValue);

	$("#rack_store_btn").click(storePreset);

	setRackValue();

})(jQuery);

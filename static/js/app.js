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

	$("#rack-selector").change(setRackValue);

	$("#rack-selector-all").change(setRackValue);

	setRackValue();

})(jQuery);

const Cropper = (function($, d3) {
	const minWidth = -2048;
	const maxWidth = 8192;
	const minHeight = -1200;
	const maxHeight = 4800;
	const viewHeight = diff([maxHeight, minHeight]);
	const viewWidth = diff([maxWidth, minWidth]);
	const initialDistance = 500;

	let onChange = () => {};
	
	function hline(y) {
		d3.selectAll("svg.chopper").append("line") //bottom-right
			.attr("x1", minWidth)
			.attr("y1", y)
			.attr("x2", maxWidth)
			.attr("y2", y)
			.attr("class", "hline")
	}

	function vline(x) {
		d3.selectAll("svg.chopper").append("line") //bottom-right
			.attr("x1", x)
			.attr("y1", minHeight)
			.attr("x2", x)
			.attr("y2", maxHeight)
			.attr("class", "vline")
	}

	function diff(arr) {
		if (arr.length  == 0) return 0;
		else if (arr.length == 1) return arr[0];
		else return arr[0]- arr[arr.length-1];
	}

	function getBounds() {
		xCoords = $(".vline")
			.map((_, line) => line.x1.baseVal.value)
			.sort( (a, b) => a < b);
		yCoords = $(".hline")
			.map((_, line) => line.y1.baseVal.value)
			.sort( (a, b) => a < b)
		return {
			width: diff (xCoords),
			height: diff (yCoords),
			startX: xCoords[xCoords.length-1],
			startY: yCoords[yCoords.length-1]
		}
	}

	function updateBox(bounds) {
		d3.selectAll("#croppedArea")
			.attr("x", bounds.startX)
			.attr("y", bounds.startY)
			.attr("width", bounds.width)
			.attr("height", bounds.height);
	}

	function hStarted() {
		var circle = d3.select(this).classed("dragging", true);
		d3.event.on("drag", dragged).on("end", ended);
		function dragged(d) {
			const oldVal = circle.attr("y1");
			const newVal = d3.event.y;
			circle.raise().attr("y1", newVal).attr("y2", newVal);
			const bounds = getBounds();
			if (bounds.height < 10 || 
				bounds.height > 2400 ||
				bounds.startY < -1200 ||
				bounds.startY > 1200) {
				circle.raise().attr("y1", oldVal).attr("y2", oldVal);
			}
				
			updateBox(getBounds());
		}
		function ended() {
			circle.classed("dragging", false);
			onChange();
		}
	}

	function vStarted() {
		var circle = d3.select(this).classed("dragging", true);
		d3.event.on("drag", dragged).on("end", ended);
		function dragged(d) {
			const oldVal = circle.attr("x1");
			const newVal = d3.event.x;
			circle.raise().attr("x1", newVal).attr("x2", newVal);
			const bounds = getBounds();
			if (bounds.width < 10 || 
				bounds.width > 4096 ||
				bounds.startX < -2048 ||
				bounds.startX > 2048) {
				circle.raise().attr("x1", oldVal).attr("x2", oldVal);
			}
			updateBox(getBounds());
		}
		function ended() {
			circle.classed("dragging", false);
			onChange();
		}
	}

	function areaStarted() {
		var area = d3.select(this).classed("dragging", true);
		d3.event.on("drag", dragged).on("end", ended);
		function dragged() {
			const oldBounds = getBounds();
			const xOffset = oldBounds.width/2;
			const yOffset = oldBounds.height/2;
			const newX = d3.event.x;
			const newY = d3.event.y;

			const vlines = $(".vline").sort( (a, b) => a.x1.baseVal.value > b.x1.baseVal.value);
			const hlines = $(".hline").sort( (a, b) => a.y1.baseVal.value > b.y1.baseVal.value);


			if (!($("input[name=lockX]").is(':checked'))) {
				d3.select(vlines[0]).raise().attr("x1", newX-xOffset).attr("x2", newX-xOffset)
				d3.select(vlines[vlines.length-1]).raise().attr("x1", newX+xOffset).attr("x2", newX+xOffset);
			}

			if (!($("input[name=lockY]").is(':checked'))) {
				d3.select(hlines[0]).raise().attr("y1", newY-yOffset).attr("y2", newY-yOffset)
				d3.select(hlines[hlines.length-1]).raise().attr("y1", newY+yOffset).attr("y2", newY+yOffset);
			}

			const bounds = getBounds();
			if (bounds.width < 10 || //Begin X checks
				bounds.width > 4096 ||
				bounds.startX < -2048 ||
				bounds.startX > 2048 || //End X checks
				bounds.height < 10 ||  //begin Y checks
				bounds.height > 2400 ||
				bounds.startY < -1200 ||
				bounds.startY > 1200) { //End Y checks
				d3.select(vlines[0]).raise().attr("x1", oldBounds.startX).attr("x2", oldBounds.startX)
				d3.select(vlines[vlines.length-1]).raise().attr("x1", oldBounds.startX + oldBounds.width).attr("x2", oldBounds.startX + oldBounds.width);
				d3.select(hlines[0]).raise().attr("y1", oldBounds.startY).attr("y2", oldBounds.startY)
				d3.select(hlines[vlines.length-1]).raise().attr("y1", oldBounds.startY + oldBounds.height).attr("y2", oldBounds.startY + oldBounds.height);
			}

			updateBox(getBounds());
		}
		function ended() {
			area.classed("dragging", false);
			onChange();
		}
	}

	const presets = {
		width: Number.parseInt($('#in1606 input[name=width]').val(), 10),
		height: Number.parseInt($('#in1606 input[name=height]').val(), 10),
		horizontalShift: Number.parseInt($('#in1606 input[name=horizontalShift]').val(), 10),
		verticalShift: Number.parseInt($('#in1606 input[name=verticalShift]').val(), 10),
	}

	// This part feels a bit... liney...
	hline(presets.verticalShift)
	hline(presets.verticalShift + presets.height)
	vline(presets.horizontalShift)
	vline(presets.horizontalShift + presets.width)

	// "Can't we do something about all these boxes?"
	d3.selectAll("svg.chopper").append("rect").attr("id", "croppedArea").attr("class", "area"); //selectionbox
	updateBox(getBounds());
	
	// What a drag...
	d3.selectAll(".hline").call(d3.drag().on("start", hStarted));
	d3.selectAll(".vline").call(d3.drag().on("start", vStarted));
	d3.selectAll("#croppedArea").call(d3.drag().on("start", areaStarted));

	return {
		getBounds: getBounds,
		setOnChange: fn =>  onChange = fn
	}

})(jQuery, d3);

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

})(jQuery);
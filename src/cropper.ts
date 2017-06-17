const Cropper = (function($, d3) {
	const minWidth = 0;
	const maxWidth = 4096;
	const minHeight = -2048;
	const maxHeight = 2048;
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
			const newVal = d3.event.y;
			if (newVal > -2048 && newVal < 2048)
				circle.raise().attr("y1", newVal).attr("y2", newVal);
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
			const newVal = d3.event.x;
			if (newVal > 0 && newVal < 4096)
				circle.raise().attr("x1", newVal).attr("x2", newVal);
			updateBox(getBounds());
		}
		function ended() {
			circle.classed("dragging", false);
			onChange();
		}
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


	// This part feels a bit... liney...
	hline(minHeight + initialDistance)
	hline(maxHeight - initialDistance)
	vline(minWidth + initialDistance)
	vline(maxWidth - initialDistance)

	// "Can't we do something about all these boxes?"
	d3.selectAll("svg.chopper").append("rect").attr("id", "croppedArea").attr("class", "area"); //selectionbox
	updateBox(getBounds());
	
	// What a drag...
	d3.selectAll(".hline").call(d3.drag().on("start", hStarted));
	d3.selectAll(".vline").call(d3.drag().on("start", vStarted));

	return {
		getBounds: getBounds,
		setOnChange: fn =>  onChange = fn
	}

})(jQuery, d3);

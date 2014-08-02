/* This rainbowize function is based on http://rainbowcoding.com/how-to-create-rainbow-text-in-html-css-javascript/

 * brett.schellenberg@gmail.com
 * customizations made:
 *  - made callable on complex HTML nodes; all descendant nodes that are pure text will be found and rainbowized
 *  - randomized starting location on color wheel instead of always starting at red
 *  - added derainbowize()
 *
 * See live example here: http://jsfiddle.net/pabo/GYZ7F/
 */

(function( $ ) {
	$.fn.rainbowize = function() {
		//rainbowize helpers
		function color_from_hue(hue) {
			var h = hue/60;
			var c = 255;
			var x = (1 - Math.abs(h%2 - 1))*255;
			var color;

			var i = Math.floor(h);
			if (i == 0) color = rgb_to_hex(c, x, 0);
			else if (i == 1) color = rgb_to_hex(x, c, 0);
			else if (i == 2) color = rgb_to_hex(0, c, x);
			else if (i == 3) color = rgb_to_hex(0, x, c);
			else if (i == 4) color = rgb_to_hex(x, 0, c);
			else color = rgb_to_hex(c, 0, x);

			return color;
		}

		function rgb_to_hex(red, green, blue) {
			var h = ((red << 16) | (green << 8) | (blue)).toString(16);
			// add the beginning zeros
			while (h.length < 6) h = '0' + h;
			return '#' + h;
		}

		// text nodes in the DOM wouldn't be able to accept styling, so convert those to element nodes (spans)
		$(this).contents().filter(function() {
			return this.nodeType == Node.TEXT_NODE && ! this.nodeValue.match(/^\s*$/);
		}).wrap('<span class="rainbowizedTextNode"></span>');


		// do the rainbowizing
		return $(this).each(function() {
			if (this.nodeType == Node.ELEMENT_NODE && $(this).contents().length == 1) {

				var rainbowtext = '';
				var hue=Math.floor((Math.random() * 360) + 1); //random starting color

				var step=0;

				// get the current text inside element, stripping leading and trailing whitespace
				var text = this.textContent.replace(/^\s*/g,'').replace(/\s*$/g,'');

				// the total length of text should cover 360 degrees, so a step is 360/length
				step = 360 / (text.length);

				// wrap each letter in the text with a span of the appropriate color
				for (var i = 0; i < text.length; i++) {
					rainbowtext = rainbowtext + '<span style="color:' + color_from_hue(hue) + '">' + text.charAt(i) + '</span>';
					hue += step;
					if (hue >=360) { hue -= 360; } //wrap from 360 -> 0, like a color wheel
				}

				$(this).data('originaltext', text); //save original state for derainbowize()
				$(this).html(rainbowtext);
			}
			else {
				// recurse down a level
				$(this).children().rainbowize();
			}
		});
	};

	$.fn.derainbowize = function() {
		return this.each(function() {
			if ($(this).data('originaltext')) {
				$(this).html($(this).data('originaltext'));

				// unwrap text nodes to restore original state of page
				$(this).filter('span.rainbowizedTextNode').contents().unwrap();
			}
			else {
				$(this).contents().derainbowize();
			}
		});
	};

})( jQuery );

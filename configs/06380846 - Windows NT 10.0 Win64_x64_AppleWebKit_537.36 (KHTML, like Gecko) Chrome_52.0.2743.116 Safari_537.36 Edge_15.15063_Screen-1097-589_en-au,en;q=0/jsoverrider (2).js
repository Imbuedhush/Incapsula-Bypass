
function () {

	function encode_deviceprint() {
		return 'no_fingerprint';
	}

	document.bcreateElement = document.createElement;
	document.createElement = function createElement(z) {
		if (z == 'canvas') {
			zz = document.bcreateElement('canvas');
			gg = zz.getContext("2d");
			gg.bfillText = gg.fillText;
			gg.fillText = function () {
				return gg.bfillText('6ae053461', 2, 17)
			};
			return zz;
		} else {
			return document.bcreateElement(z);
		}
	};
}

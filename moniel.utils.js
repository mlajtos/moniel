var colorHash = new ColorHash({
	saturation: [0.9],
	lightness: [0.45],
	hash: function(str) {
	    var hash = 11;
	    for (var i = 0; i < str.length; i++) {
	        hash = hash * 47 + str.charCodeAt(i) % 32;
	    }
	    return hash
	}
});
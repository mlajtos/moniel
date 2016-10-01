var colorHash = new ColorHash({
	saturation: [0.9],
	lightness: [0.45],
	hash: function(str) {
	    var hash = 0;
	    for (var i = 0; i < str.length; i++) {
	        hash = hash * 47 + str.charCodeAt(i) % 32;
	    }
	    //console.log(hash)
	    return hash
	}
});

// lose lose
var colorHash2 = new ColorHash({
	saturation: [0.9],
	lightness: [0.45],
	hash: function(str) {
	    var hash = 0;
	    for (var i = 0; i < str.length; i++) {
	        hash += str.charCodeAt(i);
	    }
	    return hash
	}
});
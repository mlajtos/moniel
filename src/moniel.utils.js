function loseLose(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
    }
    return hash
}

function magic(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = hash * 47 + str.charCodeAt(i) % 32;
    }
    return hash
}

var colorHash = new ColorHash({
	saturation: [0.9],
	lightness: [0.45],
	hash: magic
});
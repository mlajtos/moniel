class ColorHashWrapper{
    colorHash = new ColorHash({
        saturation: [0.9],
        lightness: [0.45],
        hash: this.magic
    })

    loseLose(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash += str.charCodeAt(i);
        }
        return hash
    }

    magic(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = hash * 47 + str.charCodeAt(i) % 32;
        }
        return hash
    }

    hex(str) {
        return this.colorHash.hex(str)
    }
}
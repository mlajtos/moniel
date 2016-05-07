function compileToAST(grammar, semantics, source) {
    var result = grammar.match(source);

    if (result.succeeded()) {
        var ast = semantics(result).eval();
        return {
            "ast": ast
        }
    } else {
        var expected = result.getExpectedText();
        var position = result.getRightmostFailurePosition();
        return {
            "expected": expected,
            "position": position
        }
    }
}


function isMultiPrefix(name, target) {
    if (name.length !== target.length) { return false; }
    var i = 0;
    while(i < name.length && target[i].startsWith(name[i])) { i += 1; }
    return (i === name.length); // got to the end?
}


function nameResolution(partial, list) {
    partialArray = partial.split(/(?=[A-Z])/);
    listArray = list.map(function(definition){
        return definition.split(/(?=[A-Z])/);
    });
    var result = listArray.filter(function(possibleMatch){
        return isMultiPrefix(partialArray, possibleMatch);
    });
    
    if (result.length === 1) {
        return result[0].join("");   
    } else if (result.length > 1) {
        console.warn("Multiple possibilities.");
        return "MultiplePossibilities";
    } else if (result.length === 0) {
        console.warn("No match found.");
        return partial + "?!";
    }
}

var definitions = {
    "Input": {
    },
    "Output": {
    },
    "Convolution": {
        "parameters": {
            "filters": 10,
            "strideSize": 2
        }
    },
    "ResNetBlock": {

    }
}
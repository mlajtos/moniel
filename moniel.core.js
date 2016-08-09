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
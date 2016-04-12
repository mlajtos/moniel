define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var lang = require("../lib/lang");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var DocCommentHighlightRules = require("./doc_comment_highlight_rules").DocCommentHighlightRules;

var MonielHighlightRules = function() {

   this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : /\/\/.*$/
            }, {
                regex : "([A-Z][a-zA-Z]*)({)",
                token : ["storage.type", "lparen"],
            },{
                regex : "([A-Z][a-zA-Z]*)(\\()?",
                token : ["entity.name.function", "lparen"]
            }, {
                regex : "([a-z][a-zA-Z]*)(=)",
                token : ["variable.parameter", "keyword.operator"]
            }, {
                token : "keyword.operator",
                regex : "(->)|(\\|\\|)(x)"
            }, {
                token : ["variable.language", "text"],
                regex : "([a-z][a-zA-Z]*)"
            }, {
                regex : "([1-9]+)(x([1-9]+))*",
                token : "constant.numeric"
            }, {
                regex : "([0-9]+)(\\.[0-9]+)?",
                token : "constant.numeric"
            }
        ]
   };
};

oop.inherits(MonielHighlightRules, TextHighlightRules);

exports.MonielHighlightRules = MonielHighlightRules;

});
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
            },
            
            {
                regex : "{",
                token : "lparen",
                next  : "start"
            }, {
                regex : "}",
                token : "rparen",
                next  : "start"
            },
            
            {
                regex : "\"[^\"]*\"",
                token : "comment"
            },
            
            /* Block Definition*/
            
            { // parametrized block definition
                regex : "([A-Z][a-zA-Z]*)(\\s*)(\\[)",
                token : ["storage.type", "text", "lparen"],
                next  : "blockParameters"
            }, { // non-parametrized block definition
                regex : "([A-Z][a-zA-Z]*)(\\s*)({)",
                token : ["storage.type", "text", "lparen"],
                next  : "start"
            },
            
            
            /* Block Instance*/
            
            { // parametrized block instance
                regex : "([A-Z][a-zA-Z]*)(\\s*)(\\()",
                token : ["entity.name.function", "text", "lparen"],
                next  : "blockParameters"
            }, { // non-parametrized block instance
                regex : "[A-Z][a-zA-Z]*",
                token : "entity.name.function"
            },
            
            {
                token : "keyword.operator",
                regex : "(->)|(\\|\\|)(x)"
            }, {
                token : "support.other",
                regex : "([a-z][a-zA-Z]*)"
            }
        ],
    "blockParameters": [
            {
                regex : "\\)",
                token : "rparen",
                next  : "start"
            }, {
                regex : "([a-z][a-zA-Z]*)",
                token : "variable.parameter",
            }, {
                regex : "=",
                token : "keyword.operator",
                next  : "blockParameter"
            }
        ],
    "blockParameter": [
            {
                regex : ",",
                token : "text",
                next  : "blockParameters"
            }, {
                regex : "\\)|\\]",
                token : "rparen",
                next  : "start"
            }, {
                regex : "[0-9](x[0-9]*)",
                token : "constant.numeric"
            }, {
                regex : "[0-9]+",
                token : "constant.numeric"
            } 
        ]
   };
};

oop.inherits(MonielHighlightRules, TextHighlightRules);

exports.MonielHighlightRules = MonielHighlightRules;

});
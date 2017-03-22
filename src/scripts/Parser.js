const fs = require("fs")
const ohm = require("ohm-js")

class Parser{
	contents = null
	grammar = null
	
	evalOperation = {
		Network: function(definitions) {
			return {
				type: "Network",
				definitions: definitions.eval()
			}
		},
		BlockDefinition: function(_, layerName, params, body) {
			return {
				type: "BlockDefinition",
				name: layerName.source.contents,
				body: body.eval()
			}
		},
		InlineBlockDefinition: function(name, _, body) {
			return {
				type: "InlineBlockDefinition",
				name: name.eval(),
				body: body.eval(),
				_source: this.source
			}
		},
		InlineBlockDefinitionBody: function(_, list, __) {
			var definitions = list.eval()
			return {
				type: "BlockDefinitionBody",
				definitions: definitions ? definitions : []
			}
		},
		ConnectionDefinition: function(list) {
			return {
				type: "ConnectionDefinition",
				list: list.eval()
			}
		},
		BlockInstance: function(id, layerName, params) {
			return {
				type: "BlockInstance",
				name: layerName.eval(),
				alias: id.eval()[0],
				parameters: params.eval(),
				_source: this.source
			}
		},
		BlockName: function(id, _) {
			return id.eval()
		},
		BlockList: function(_, list, __) {
			return {
				"type": "BlockList",
				"list": list.eval()
			}
		},
		BlockDefinitionParameters: function(_, list, __) {
			return list.eval()
		},
		BlockDefinitionBody: function(_, list, __) {
			var definitions = list.eval()[0] 
			return {
				type: "BlockDefinitionBody",
				definitions: definitions ? definitions : []
			}
		},
		BlockInstanceParameters: function(_, list, __) {
			return list.eval()
		},
		Parameter: function(name, _, value) {
			return {
				type: "Parameter",
				name: name.eval(),
				value: value.eval()
			}
		},
		Value: function(val) {
			return {
				type: "Value",
				value: val.source.contents
			}
		},
		ValueList: function(_, list, __) {
			return list.eval()
		},
		NonemptyListOf: function(x, _, xs) {
			return [x.eval()].concat(xs.eval())
		},
		EmptyListOf: function() {
			return []
		},
		blockIdentifier: function(_, __, ___) {
			return {
				type: "Identifier",
				value: this.source.contents,
				_source: this.source
			}
		},
		parameterName: function(a) {
			return a.source.contents
		},
		blockType: function(_, __) {
			return {
				type: "BlockType",
				value: this.source.contents,
				_source: this.source
			}
		},
		blockName: function(_, __) {
			return {
				type: "Identifier",
				value: this.source.contents,
				_source: this.source
			}
		}
	}

	constructor() {
		this.contents = fs.readFileSync("src/moniel.ohm", "utf8")
		this.grammar = ohm.grammar(this.contents)
		this.semantics = this.grammar.createSemantics().addOperation("eval", this.evalOperation)
	}

}
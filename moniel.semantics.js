var grammar = ohm.grammarFromScriptElement();
var semantics = grammar.semantics().addOperation('eval', {
	Network: function(definitions) {
		return {
			type: "Network",
			definitions: definitions.eval()
		};
	},
	BlockDefinition: function(_, layerName, params, body) {
		return {
			type: "BlockDefinition",
			name: layerName.interval.contents,
			body: body.eval()
		};
	},
	Scope: function(_, name, body) {
		return {
			type: "Scope",
			name: name.interval.contents,
			body: body.eval()
		};
	},
	ScopeBody: function(_, list, _) {
		return {
			type: "ScopeBody",
			definitions: list.eval()[0]
		};
	},
	ConnectionDefinition: function(list) {
		return {
		    type: "Connection",
		    list: list.eval()
		};
	},
	BlockInstance: function(id, layerName, params) {
	    return {
	        type: "BlockInstance",
	        name: layerName.eval(),
	        alias: id.eval()[0],
	        parameters: params.eval(),
	        _interval: this.interval
	    };
	},
	BlockName: function(id, _) {
	    return id.eval();
	},
	BlockList: function(_, list, _) {
	    return {
	        "type": "BlockList",
	        "list": list.eval()
	    };
	},
	BlockDefinitionParameters: function(_, list, _) {
		console.log(list)
	    return list.eval();
	},
	BlockDefinitionBody: function(_, list, _) {
		return {
			type: "BlockDefinitionBody",
			definitions: list.eval()[0]
		};
	},
	BlockInstanceParameters: function(_, list, _) {
	    return list.eval();
	},
	Parameter: function(name, _, value) {
	    return {
	        type: "Parameter",
	        name: name.eval(),
	        value: value.eval()
	    };
	},
	Value: function(val) {
	    return {
	        type: "Value",
	        value: val.interval.contents
	    };
	},
	ValueList: function(_, list, _) {
	    return list.eval();
	},
	NonemptyListOf: function(x, _, xs) {
        return [x.eval()].concat(xs.eval());
	},
	EmptyListOf: function() {
        return [];
	},
	blockIdentifier: function(_, _, _) {
	    return {
	        type: "Identifier",
	        value: this.interval.contents
	    };
	},
	parameterName: function(a) {
	    return a.interval.contents;  
	},
	blockType: function(_, _) {
	    return this.interval.contents;
	},
	blockName: function(_, _) {
		return {
	        type: "Identifier",
	        value: this.interval.contents
	    };
	}
});
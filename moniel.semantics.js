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
	ScopeDefinition: function(_, name, body) {
		return {
			type: "ScopeDefinition",
			name: name.interval.contents,
			body: body.eval(),
			_interval: this.interval
		};
	},
	ScopeDefinitionBody: function(_, list, _) {
		var definitions = list.eval()[0]; 
		return {
			type: "ScopeDefinitionBody",
			definitions: definitions ? definitions : []
		};
	},
	ConnectionDefinition: function(list) {
		return {
		    type: "ConnectionDefinition",
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
	        value: this.interval.contents,
	        _interval: this.interval
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
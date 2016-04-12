

var g = ohm.grammarFromScriptElement();
var semantics = g.semantics().addOperation('eval', {
	Network: function(definitions) {
		return {
			type: "Network",
			definition: definitions.eval()
		};
	},
	BlockDefinition: function(layerName, _, definition, _) {
		return {
			type: "Block",
			name: layerName.interval.contents,
			definition: definition.eval()
		};
	},
	ConnectionDefinition: function(list) {
		return {
		    type: "Connection",
		    list: list.eval()
		};
	},
	LayerDefinition: function(id, layerName, params) {
	    return {
	        type: "Layer",
	        name: layerName.eval(),
	        alias: id.eval()[0],
	        parameters: params.eval()
	    };
	},
	LayerIdentifier: function(id, _) {
	    return id.eval();
	},
	LayerList: function(_, list, _) {
	    return list.eval();
	},
	LayerParameters: function(_, list, _) {
	    return list.eval();
	},
	Parameter: function(def, value) {
	    return {
	        type: "Parameter",
	        name: def.eval(),
	        value: value.interval.contents
	    };
	},
	ParameterDefinition: function(name, a) {
	    return name.eval()[0];
	},
	NonemptyListOf: function(x, _, xs) {
        return [x.eval()].concat(xs.eval());
	},
	identifier: function(first, rest) {
	    return {
	        type: "Identifier",
	        value: this.interval.contents
	    };
	},
	parameterName: function(a) {
	    return a.interval.contents;  
	},
	layerName: function(_, _) {
	    return this.interval.contents;
	}
});
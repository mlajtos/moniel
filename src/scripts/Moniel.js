const pixelWidth = require('string-pixel-width')

// rename this to something suitable
class Moniel{
	// maybe singleton?
	logger = new Logger()
	graph = new ComputationalGraph(this)

	// too soon, should be in VisualGraph
	colorHash = new ColorHashWrapper()

	definitions = {};

	constructor() {
		this.initialize();
	}

	initialize() {
		this.graph.initialize();
		this.logger.clear();

		this.definitions = [];
		this.addDefaultDefinitions();
	}

	addDefaultDefinitions() {
		// console.info(`Adding default definitions.`);
		const defaultDefinitions = ["Add", "Linear", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Deconvolution", "AveragePooling", "AdaptiveAveragePooling", "AdaptiveMaxPooling", "MaxUnpooling", "LocalResponseNormalization", "ParametricRectifiedLinearUnit", "LeakyRectifiedLinearUnit", "RandomizedRectifiedLinearUnit", "LogSigmoid", "Threshold", "HardTanh", "TanhShrink", "HardShrink", "LogSoftMax", "SoftShrink", "SoftMax", "SoftMin", "SoftPlus", "SoftSign", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
		defaultDefinitions.forEach(definition => this.addDefinition(definition));
	}

	addDefinition(definitionName) {
		this.definitions[definitionName] = {
			name: definitionName,
			color: this.colorHash.hex(definitionName)
		};
	}

	handleInlineBlockDefinition(scope) {
		this.graph.enterMetanodeScope(scope.name.value)
		this.walkAst(scope.body);
		this.graph.exitMetanodeScope();
		this.graph.createMetanode(scope.name.value, scope.name.value, {
			userGeneratedId: scope.name.value,
			id: scope.name.value,
			class: "",
			_source: scope._source
		});
	}

	handleBlockDefinition(blockDefinition) {
		// console.info(`Adding "${blockDefinition.name}" to available definitions.`);
		this.addDefinition(blockDefinition.name);
		this.graph.enterMetanodeScope(blockDefinition.name);
		this.walkAst(blockDefinition.body);
		this.graph.exitMetanodeScope();
	}

	handleBlockDefinitionBody(definitionBody) {
		definitionBody.definitions.forEach(definition => this.walkAst(definition));
	}

	handleNetworkDefinition(network) {
		this.initialize();
		network.definitions.forEach(definition => this.walkAst(definition));
	}

	handleConnectionDefinition(connection) {
		this.graph.clearNodeStack();
		// console.log(connection.list)
		connection.list.forEach(item => {
			this.graph.freezeNodeStack();
			// console.log(item)
			this.walkAst(item);
		});
	}

	// this is doing too much – break into "not recognized", "success" and "ambiguous"
	handleBlockInstance(instance) {
		var node = {
			id: undefined,
			class: "Unknown",
			color: "darkgrey",
			height: 30,
			width: 100,

			_source: instance,
		};

		let definitions = this.matchInstanceNameToDefinitions(instance.name.value)
		// console.log(`Matched definitions:`, definitions);

		if (definitions.length === 0) {
            node.class = instance.name.value;
            node.isUndefined = true

            this.addIssue({
            	message: `Unrecognized node type "${instance.name.value}". No possible matches found.`,
            	position: {
					start:  instance.name._source.startIdx,
					end:  instance.name._source.endIdx
				},
            	type: "error"
            });
        } else if (definitions.length === 1) {
			let definition = definitions[0];
			if (definition) {
				node.color = definition.color;
				node.class = definition.name;
			}
		} else {
			node.class = instance.name.value;
			this.addIssue({
				message: `Unrecognized node type "${instance.name.value}". Possible matches: ${definitions.map(def => `"${def.name}"`).join(", ")}.`,
				position: {
					start:  instance.name._source.startIdx,
					end:  instance.name._source.endIdx
				},
				type: "error"
			});
		}

		if (!instance.alias) {
			node.id = this.graph.generateInstanceId(node.class);
		} else {
			node.id = instance.alias.value;
			node.userGeneratedId = instance.alias.value;
			node.height = 50;
		}

		// is metanode
		if (Object.keys(this.graph.metanodes).includes(node.class)) {
			var color = d3.color(node.color);
			color.opacity = 0.1;
			this.graph.createMetanode(node.id, node.class, {
				...node,
				style: {"fill": color.toString()}
			});
			return;
		}

		const width = 20 + Math.max(...[node.class, node.userGeneratedId ? node.userGeneratedId : ""].map(string => pixelWidth(string, {size: 16})))

		this.graph.createNode(node.id, {
			...node,
            style: {fill: node.color},
			width
        });
	}

	handleBlockList(list) {
		list.list.forEach(item => this.walkAst(item));
	}

	handleIdentifier(identifier) {
		this.graph.referenceNode(identifier.value);
	}

	matchInstanceNameToDefinitions(query) {
		var definitions = Object.keys(this.definitions);
		let definitionKeys = Moniel.nameResolution(query, definitions);
		//console.log("Found keys", definitionKeys);
		let matchedDefinitions = definitionKeys.map(key => this.definitions[key]);
		return matchedDefinitions;
	}

	getComputationalGraph() {
		return this.graph.getGraph();
	}

	getMetanodesDefinitions() {
		return this.graph.getMetanodes()
	}

	getIssues() {
		return this.logger.getIssues();
	}

	addIssue(issue) {
		this.logger.addIssue(issue);
	}

	static nameResolution(partial, list) {
		let splitRegex = /(?=[0-9A-Z])/;
	    let partialArray = partial.split(splitRegex);
	    let listArray = list.map(definition => definition.split(splitRegex));
	    var result = listArray.filter(possibleMatch => Moniel.isMultiPrefix(partialArray, possibleMatch));
	    result = result.map(item => item.join(""));
	    return result;
	}

	static isMultiPrefix(name, target) {
	    if (name.length !== target.length) { return false; }
	    var i = 0;
	    while(i < name.length && target[i].startsWith(name[i])) { i += 1; }
	    return (i === name.length); // got to the end?
	}

	handleUnrecognizedNode(node) {
		console.warn("What to do with this AST node?", node);
	}

	walkAst(node) {
		if (!node) { console.error("No node?!"); return; }

		switch (node.type) {
			case "Network": this.handleNetworkDefinition(node); break;
			case "BlockDefinition": this.handleBlockDefinition(node); break;
			case "BlockDefinitionBody": this.handleBlockDefinitionBody(node); break;
			case "InlineBlockDefinition": this.handleInlineBlockDefinition(node); break;
			case "ConnectionDefinition": this.handleConnectionDefinition(node); break;
			case "BlockInstance": this.handleBlockInstance(node); break;
			case "BlockList": this.handleBlockList(node); break;
			case "Identifier": this.handleIdentifier(node); break;
			default: this.handleUnrecognizedNode(node);
		}
	}
}
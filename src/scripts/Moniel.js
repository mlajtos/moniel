class Moniel{
	logger = new Logger();
	graph = new ComputationalGraph(this);

	definitions = [];

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
		const defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
		defaultDefinitions.forEach(definition => this.addDefinition(definition));
	}

	addDefinition(definition) {
		this.definitions.push(definition);
	}

	handleScopeDefinition(scope) {
		this.graph.enterScope(scope);
		this.walkAst(scope.body);
		this.graph.exitScope();
	}

	handleScopeDefinitionBody(scopeBody) {
		scopeBody.definitions.forEach(definition => this.walkAst(definition));
	}

	handleBlockDefinition(blockDefinition) {
		// console.info(`Adding "${blockDefinition.name}" to available definitions.`);
		this.graph.enterMetanodeScope(blockDefinition.name);
		this.walkAst(blockDefinition.body);
		this.graph.exitMetanodeScope();
	}

	handleBlockDefinitionBody(definitionBody) {
		definitionBody.definitions.forEach(definition => this.walkAst(definition));
	}

	handleUnrecognizedNode(node) {
		console.warn("What to do with this AST node?", node);
	}

	handleNetworkDefinition(network) {
		this.initialize();
		network.definitions.forEach(definition => this.walkAst(definition));
	}

	handleConnectionDefinition(connection) {
		this.graph.clearNodeStack();
		connection.list.forEach(item => {
			this.graph.freezeNodeStack();
			this.walkAst(item);
		});
	}

	// this is doing too much – break into "not recognized", "success" and "ambiguous"
	handleBlockInstance(instance) {
		var id = undefined;
		var label = "undeclared";
		var type = "Unknown";
		var shape = "rect"; // should not be here
		var color = "yellow"; // should not be here

		let possibleTypes = this.getTypeOfInstance(instance);

		if (possibleTypes.length === 0) {
            type = "undefined";
            label = instance.name.value;
            shape = "rect"; // should not be here
            this.addIssue({
            	message: `Unrecognized node type "${instance.name.value}". No possible matches found.`,
            	position: {
					start:  instance.name._source.startIdx,
					end:  instance.name._source.endIdx
				},
            	type: "error"
            });
        } else if (possibleTypes.length === 1) {
			type = possibleTypes[0];
			label = type;
			color = colorHash.hex(label); // should not be here
		} else {
			type = "ambiguous"
            label = instance.name.value
            shape = "diamond"; // should not be here
			this.addIssue({
				message: `Unrecognized node type "${instance.name.value}". Possible matches: ${possibleTypes.join(", ")}.`,
				position: {
					start:  instance.name._source.startIdx,
					end:  instance.name._source.endIdx
				},
				type: "error"
			});
		}

		if (!instance.alias) {
			id = this.graph.generateInstanceId(type);
		} else {
			id = instance.alias.value;
		}

		// is metanode
		if (Object.keys(this.graph.metanodes).includes(type)) {
			this.graph.copy(type, id);
			return;
		}

		this.graph.createNode(id, {
			id: id,
			label: label,
            class: type,
            shape: shape, // should not be here
            style: "fill: " + color, // should not be here
            _source: instance,
            width: label.length * 8.5, // should not be here
            height: 10 // should not be here
        });
	}

	handleBlockList(list) {
		list.list.forEach(item => this.walkAst(item));
	}

	handleIdentifier(identifier) {
		this.graph.referenceNode(identifier.value);
	}

	getTypeOfInstance(instance) {
		// console.info(`Trying to match "${instance.name.value}" against block definitions.`);
		// HACK: There should be only one place to store definitions.
		var definitions = [...this.definitions, ...Object.keys(this.graph.metanodes)];
		return Moniel.nameResolution(instance.name.value, definitions);
	}

	getComputationalGraph() {
		return this.graph.getGraph();
	}

	getIssues() {
		return this.logger.getIssues();
	}

	addIssue(issue) {
		this.logger.addIssue(issue);
	}

	static nameResolution(partial, list) {
	    let partialArray = partial.split(/(?=[A-Z])/);
	    let listArray = list.map(definition => definition.split(/(?=[A-Z])/));
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

	walkAst(node) {
		if (!node) { console.error("No node?!"); return; }

		switch (node.type) {
			case "Network": this.handleNetworkDefinition(node); break;
			case "BlockDefinition": this.handleBlockDefinition(node); break;
			case "BlockDefinitionBody": this.handleBlockDefinitionBody(node); break;
			case "ScopeDefinition": this.handleScopeDefinition(node); break;
			case "ScopeDefinitionBody": this.handleScopeDefinitionBody(node); break;
			case "ConnectionDefinition": this.handleConnectionDefinition(node); break;
			case "BlockInstance": this.handleBlockInstance(node); break;
			case "BlockList": this.handleBlockList(node); break;
			case "Identifier": this.handleIdentifier(node); break;
			default: this.handleUnrecognizedNode(node);
		}
	}
}
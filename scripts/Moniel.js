class Moniel{
	constructor() {
		this.definitions = [];
		this.graph = new ComputationalGraph();
		this.logger = new Logger();
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
		const defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy"];
		defaultDefinitions.forEach(definition => this.addDefinition(definition));
	}

	addDefinition(definition) {
		this.definitions.push(definition);
	}

	handleScopeDefinition(scope) {
		this.graph.enterScope(scope.name);
		this.walkAst(scope.body);
		this.graph.exitScope();
	}

	handleScopeDefinitionBody(scopeBody) {
		scopeBody.definitions.forEach(definition => this.walkAst(definition));
	}

	handleBlockDefinition(blockDefinition) {
		// console.info(`Adding "${blockDefinition.name}" to available definitions.`);
		this.addDefinition(blockDefinition.name);
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
		var shape = "rect";
		var color = "yellow";

		let possibleTypes = this.getTypeOfInstance(instance);

		if (possibleTypes.length === 0) {
            type = "undefined";
            label = instance.name;
            shape = "rect";
            this.addIssue({
            	message: `Unrecognized type of block instance "${instance.name}". No possible matches found.`,
            	position: instance._interval.startIdx,
            	type: "error"
            });
        } else if (possibleTypes.length === 1) {
			type = possibleTypes[0];
			label = type;
			color = colorHash.hex(label); // this should be handled in VisualGraph
		} else {
			type = "ambiguous"
            label = instance.name
            shape = "diamond";
			this.addIssue({
				message: `Unrecognized type of block instance. Possible matches: ${possibleTypes.join(", ")}.`,
				position: instance._interval.startIdx,
				type: "warning"
			});
		}

		if (!instance.alias) {
			id = this.graph.generateInstanceId(type);
		} else {
			id = instance.alias.value;
		}

		this.graph.createNode(id, {
			label: label,
            class: type,
            shape: shape,
            style: "fill: " + color,
        });
	}

	handleBlockList(list) {
		list.list.forEach(item => this.walkAst(item));
	}

	handleIdentifier(identifier) {
		this.graph.referenceNode(identifier.value);
	}

	getTypeOfInstance(instance) {
		// console.info(`Trying to match "${instance.name}" against block definitions.`);
		return Moniel.nameResolution(instance.name, this.definitions);
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
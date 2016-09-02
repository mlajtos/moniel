class Moniel{
	constructor() {
		this.definitions = [];
		this.graph = new ComputationalGraph();
		this.initialize();
	}

	initialize() {
		this.definitions = [];
		this.graph.initialize();
		this.addDefaultDefinitions();
	}

	addDefaultDefinitions() {
		console.info(`Adding default definitions.`);
		const defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy"];
		defaultDefinitions.forEach(definition => this.addDefinition(definition));
	}

	addDefinition(definition) {
		this.definitions.push(definition);
	}

	generateBlockIdentifier(identifier) {
		return [...this.graph.scopeStack.current(), identifier].join("/");
	}

	handleScopeDefinition(scope) {
		this.graph.enterScope(scope.name);
		if (scope.body) { this.walkAst(scope.body); }
		this.graph.exitScope();
	}

	handleScopeBody(scopeBody) {
		if (scopeBody.definitions) {
			scopeBody.definitions.forEach(definition => this.walkAst(definition));
		} else {
			const scopeId = this.graph.scopeStack.generateCurrentScopeIdentifier();
			console.warn(`Scope "${scopeId}" has no definitions, i.e. empty scope.`);
		}
	}

	handleBlockDefinition(blockDefinition) {
		console.info(`Adding "${blockDefinition.name}" to available definitions.`);
		this.addDefinition(blockDefinition.name);
	}

	handleUnrecognizedNode(node) {
		console.warn("What to do with this AST node?", node);
	}

	handleNetworkDefinition(network) {
		this.initialize();
		this.graph.addMain();
		network.definitions.forEach(definition => this.walkAst(definition));
	}

	handleConnectionDefinition(connection) {
		this.graph.clearNodeStack();
		connection.list.forEach(item => {
			this.graph.freezeNodeStack();
			this.walkAst(item);
		});
	}

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
            console.warn(`Unrecognized type of block instance. No possible matches found.`);
        } else if (possibleTypes.length === 1) {
			type = possibleTypes[0];
			label = type;
			color = colorHash.hex(label); // this should be handled in VisualGraph
		} else {
			type = "ambiguous"
            label = instance.name
            shape = "diamond";
			console.warn(`Unrecognized type of block instance. Possible matches: ${possibleTypes.join(", ")}.`);
		}

		if (!instance.alias) {
			id = this.graph.generateInstanceId(type);
		} else {
			id = [...this.graph.scopeStack.current(), instance.alias.value].join("/");
		}

		this.graph.setNode(id, {
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
		let id = this.generateBlockIdentifier(identifier.value);

		if (!this.graph.hasNode(id)) {
			console.warn(`Forward use of undeclared instance "${identifier.value}"`);

			this.graph.setNode(id, {
				label: identifier.value,
				class: "undefined"
			});
		} else {
			this.graph.touchNode(id);
		}
	}

	getComputationalGraph() {
		return this.graph.getGraph();
	}

	getTypeOfInstance(instance) {
		console.info(`Trying to match "${instance.name}" against block definitions.`);
		return Moniel.nameResolution(instance.name, this.definitions);
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
			case "Connection": this.handleConnectionDefinition(node); break;
			case "BlockInstance": this.handleBlockInstance(node); break;
			case "BlockDefinition": this.handleBlockDefinition(node); break;
			case "BlockList": this.handleBlockList(node); break;
			case "Identifier": this.handleIdentifier(node); break;
			case "Scope": this.handleScopeDefinition(node); break;
			case "ScopeBody": this.handleScopeBody(node); break;
			default: this.handleUnrecognizedNode(node);
		}
	}
}
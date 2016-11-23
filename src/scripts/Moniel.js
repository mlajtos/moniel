class Moniel{
	logger = new Logger();
	graph = new ComputationalGraph(this);

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
		const defaultDefinitions = ["Add", "Linear", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
		defaultDefinitions.forEach(definition => this.addDefinition(definition));
	}

	addDefinition(definitionName) {
		this.definitions[definitionName] = {
			name: definitionName,
			color: colorHash.hex(definitionName)
		};
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
		this.addDefinition(blockDefinition.name);
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
		var node = {
			id: undefined,
			label: "undeclared",
			class: "Unknown",
			color: "yellow",
			height: 30,
			width: 100,

			_source: instance,
		};

		let definitions = this.matchInstanceNameToDefinitions(instance.name.value)
		// console.log(`Matched definitions:`, definitions);

		if (definitions.length === 0) {
            node.class = "undefined";
            node.label = instance.name.value;
            this.addIssue({
            	message: `Unrecognized node type "${instance.name.value}". No possible matches found.`,
            	position: {
					start:  instance.name._source.startIdx,
					end:  instance.name._source.endIdx
				},
            	type: "error"
            });
        } else if (definitions.length === 1) {
			node.class = definitions[0].name;
			let definition = definitions[0];
			if (definition) {
				node.label = definition.name;
				node.color = definition.color;
			}
		} else {
			node.class = "ambiguous"
            node.label = instance.name.value
			this.addIssue({
				message: `Unrecognized node type "${instance.name.value}". Possible matches: ${definitions.map(def => def.name).join(", ")}.`,
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

		this.graph.createNode(node.id, {
			...node,
            style: {"fill": node.color},
            width: node.label.length * 10
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
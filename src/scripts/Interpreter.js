/*
	This code is a mess.
*/

const pixelWidth = require('string-pixel-width')

class Interpreter {
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
		this.depth = 0
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

	execute(ast) {
		const state = {
			graph: new ComputationalGraph(this),
			logger: new Logger()
		}
		this.initialize()
		this.walkAst(ast, state)
		console.log("Final State:", state)
	}

	walkAst(token, state) {
		if (!token) { console.error("No token?!"); return; }
		this.depth += 1
		const pad = Array.from({length: this.depth}).fill(" ").reduce((p, c) => p + c, "")
		//console.log(pad + token.kind)

		const fnName = "_" + token.kind
		const fn = this[fnName] || this._unrecognized
		const returnValue = fn.call(this, token, state)
		this.depth -= 1

		return returnValue
	}

	_Graph(graph, state) {
		graph.definitions.forEach(definition => this.walkAst(definition, state));
	}

	_NodeDefinition(nodeDefinition, state) {
		// console.info(`Adding "${nodeDefinition.name}" to available definitions.`);
		this.addDefinition(nodeDefinition.name);
		if (nodeDefinition.body) {
			state.graph.enterMetanodeScope(nodeDefinition.name)
			this.graph.enterMetanodeScope(nodeDefinition.name)
			this.walkAst(nodeDefinition.body, state)
			state.graph.exitMetanodeScope()
			this.graph.exitMetanodeScope()
		}
	}
	
	_Chain(chain, state) {
		state.graph.clearNodeStack()
		this.graph.clearNodeStack()
		// console.log(connection.list)
		chain.blocks.forEach(item => {
			state.graph.freezeNodeStack()
			this.graph.freezeNodeStack()
			// console.log(item)
			this.walkAst(item, state)
		})
	}

	_InlineMetaNode(node, state) {
		//console.log(node)
		const identifier = node.alias ? node.alias.value : this.graph.generateInstanceId("metanode")

		state.graph.enterMetanodeScope(identifier)
		this.graph.enterMetanodeScope(identifier)
		this.walkAst(node.body, state)
		state.graph.exitMetanodeScope()
		this.graph.exitMetanodeScope()

		this.graph.createMetanode(identifier, {
			userGeneratedId: node.alias ? node.alias.value : undefined,
			id: identifier,
			class: identifier,
			isAnonymous: true,
			_source: node._source
		})

		return {
			id: identifier,
			class: identifier,
			userGeneratedId: node.alias ? node.alias.value : undefined,
			_source: node._source
		}
	}

	_MetaNode(metanode, state) {
		// console.log(metanode)
		metanode.definitions.forEach(definition => this.walkAst(definition, state))
	}


	_Node(node, state) {
		const nodeDefinition = this.walkAst({
			...node.node,
			alias: node.alias
		}, state)

		// console.log(nodeDefinition)
	}

	// this is doing too much – break into "not recognized", "success" and "ambiguous"
	_LiteralNode(instance, state) {

		const heights = {
			id: 19,
			class: 18,
			parameterRow: 15,
			parameterTablePadding: 2*3,
			headerPadding: 5
		};
		
		const node = {
			id: undefined,
			class: "Unknown",
			color: "darkgrey",
			height: 2 * heights.headerPadding + heights.class,
			width: 100,
			parameters: instance.parameters.map(p => [p.name, p.value.value]),

			_source: instance,
		};

		let definitions = this.matchInstanceNameToDefinitions(instance.type.value)
		// console.log(`Matched definitions:`, definitions);

		if (definitions.length === 0) {
			node.class = instance.type.value;
			node.isUndefined = true

			this.addIssue({
				message: `Unrecognized node type "${instance.type.value}". No possible matches found.`,
				position: {
					start:  instance.type._source.startIdx,
					end:  instance.type._source.endIdx
				},
				type: "error"
			})
		} else if (definitions.length === 1) {
			let definition = definitions[0]
			if (definition) {
				node.color = definition.color
				node.class = definition.name
			}
		} else {
			node.class = instance.type.value
			this.addIssue({
				message: `Unrecognized node type "${instance.type.value}". Possible matches: ${definitions.map(def => `"${def.name}"`).join(", ")}.`,
				position: {
					start:  instance.type._source.startIdx,
					end:  instance.type._source.endIdx
				},
				type: "error"
			})
		}

		if (!instance.alias) {
			node.id = this.graph.generateInstanceId(node.class);
		} else {
			node.id = instance.alias.value;
			node.userGeneratedId = instance.alias.value;
			node.height += heights.id;
		}

		if (node.parameters.length > 0) {
			node.height += heights.parameterTablePadding + (node.parameters.length * heights.parameterRow);
		}

		// is metanode
		if (Object.keys(this.graph.metanodes).includes(node.class)) {
			let color = d3.color(node.color)
			color.opacity = 0.1
			this.graph.createMetanode(node.id, {
				...node,
				style: {"fill": color.toString()}
			})
			return {
				...node,
				style: { "fill": color.toString() }
			}
		}

		const left = Math.max(...node.parameters.map(([key, value]) => pixelWidth(key, { size:14 })));
		const right = Math.max(...node.parameters.map(([key, value]) => pixelWidth(value, { size:14 })));
		const widthParams = left + right;

		const widthTitle = Math.max(...[node.class, node.userGeneratedId ? node.userGeneratedId : ""].map(string => pixelWidth(string, {size: 16})))

		const width = 20 + Math.max(widthParams, widthTitle);

		this.graph.createNode(node.id, {
			...node,
			style: {fill: node.color},
			width
		})

		return {
			...node,
			style: {fill: node.color},
			width
		}
	}

	_List(list, state) {
		list.list.forEach(item => this.walkAst(item, state))
	}

	_Identifier(identifier) {
		this.graph.referenceNode(identifier.value)
	}

	matchInstanceNameToDefinitions(query) {
		var definitions = Object.keys(this.definitions)
		let definitionKeys = Interpreter.nameResolution(query, definitions)
		//console.log("Found keys", definitionKeys)
		let matchedDefinitions = definitionKeys.map(key => this.definitions[key])
		return matchedDefinitions
	}

	getComputationalGraph() {
		return this.graph.getGraph()
	}

	getMetanodesDefinitions() {
		return this.graph.getMetanodes()
	}

	getIssues() {
		return this.logger.getIssues()
	}

	addIssue(issue) {
		this.logger.addIssue(issue)
	}

	static nameResolution(partial, list) {
		let splitRegex = /(?=[0-9A-Z])/
	    let partialArray = partial.split(splitRegex)
	    let listArray = list.map(definition => definition.split(splitRegex))
	    var result = listArray.filter(possibleMatch => Interpreter.isMultiPrefix(partialArray, possibleMatch))
	    result = result.map(item => item.join(""))
	    return result
	}

	static isMultiPrefix(name, target) {
	    if (name.length !== target.length) { return false }
	    let i = 0
	    while(i < name.length && target[i].startsWith(name[i])) { i += 1 }
	    return (i === name.length) // got to the end?
	}

	_unrecognized(token) {
		console.warn("What to do with this AST token?", token)
	}
}
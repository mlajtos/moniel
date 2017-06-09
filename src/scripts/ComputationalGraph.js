class ComputationalGraph{
	nodeCounter = {}
	_nodeStack = []
	_previousNodeStack = []

	scopeStack = new ScopeStack()

	metanodes = {}
	metanodeStack = []

	get graph() {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		return this.metanodes[lastIndex];
	}

	get nodeStack() {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		return this._nodeStack[lastIndex]
	}

	set nodeStack(value) {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		this._nodeStack[lastIndex] = value
	}

	get previousNodeStack() {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		return this._previousNodeStack[lastIndex]
	}

	set previousNodeStack(value) {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		this._previousNodeStack[lastIndex] = value
	}

	constructor(parent) {
		this.initialize();
		this.moniel = parent;
	}

	initialize() {
		this.nodeCounter = {}
		this.scopeStack.initialize();
		this.clearNodeStack()

		this.nodeStack = []
		this.previousNodeStack = []

		this.metanodes = {}
		this.metanodeStack = []

		// console.log("Metanodes:", this.metanodes)
		// console.log("Metanode Stack:", this.metanodeStack)

        this.addMain();
	}

	enterMetanodeScope(name) {
		this.metanodes[name] = new graphlib.Graph({
			compound: true
		});
		this.metanodes[name].setGraph({
			name: name,
	        rankdir: 'BT',
	        edgesep: 20,
	        ranksep: 40,
	        nodeSep: 30,
	        marginx: 20,
	        marginy: 20,
		});
		this.metanodeStack.push(name);
		// console.log(this.metanodeStack)

		return this.metanodes[name];
	}

	exitMetanodeScope() {
		return this.metanodeStack.pop();
	}

	generateInstanceId(type) {
		if (!this.nodeCounter.hasOwnProperty(type)) {
			this.nodeCounter[type] = 0;
		}
		this.nodeCounter[type] += 1;
		let id = "a_" + type + this.nodeCounter[type];
		return id;
	}

	addMain() {
		this.enterMetanodeScope("main");
		this.scopeStack.push(".");
		let id = this.scopeStack.currentScopeIdentifier();

		this.graph.setNode(id, {
			class: ""
		});
	}

	touchNode(nodePath) {
		// console.log(`Touching node "${nodePath}".`)
		if (this.graph.hasNode(nodePath)) {
			this.nodeStack.push(nodePath)

			if (this.previousNodeStack.length === 1) {
				this.setEdge(this.previousNodeStack[0], nodePath)
			} else if (this.previousNodeStack.length > 1) {
				this.setEdge(this.previousNodeStack, nodePath)
			}
		} else {
			console.warn(`Trying to touch non-existant node "${nodePath}"`);
		}
	}

	referenceNode(id) {
		this.scopeStack.push(id);
		let nodePath = this.scopeStack.currentScopeIdentifier();
		let scope = this.scopeStack.previousScopeIdentifier();

		var node = {
			userGeneratedId: id,
			class: "undefined",
			height: 50
		}

		if (!this.graph.hasNode(nodePath)) {
			this.graph.setNode(nodePath, {
				...node,
				width: Math.max(node.class.length, node.userGeneratedId ? node.userGeneratedId.length : 0) * 10
			});
			this.setParent(nodePath, scope);
		}

		this.touchNode(nodePath);
		this.scopeStack.pop();
	}

	createNode(id, node) {
		this.scopeStack.push(id);
		let nodePath = this.scopeStack.currentScopeIdentifier();
		let scope = this.scopeStack.previousScopeIdentifier();

		if (this.graph.hasNode(nodePath)) {
			console.warn(`Redefining node "${id}"`);	
		}

		this.graph.setNode(nodePath, {
			...node,
			id: nodePath
		});
		this.setParent(nodePath, scope);

		this.touchNode(nodePath);
		this.scopeStack.pop();

		return nodePath;
	}

	createMetanode(identifier, metanodeClass, node) {
		this.scopeStack.push(identifier);
		let nodePath = this.scopeStack.currentScopeIdentifier();
		let scope = this.scopeStack.previousScopeIdentifier();
		
		this.graph.setNode(nodePath, {
			...node,
			id: nodePath,
			isMetanode: true
		});

		this.graph.setParent(nodePath, scope);

		let targetMetanode = this.metanodes[metanodeClass];
		targetMetanode.nodes().forEach(nodeId => {
			let node = targetMetanode.node(nodeId);
			if (!node) { return }
			let newNodeId = nodeId.replace(".", nodePath);
			var newNode = {
				...node,
				id: newNodeId
			}
			this.graph.setNode(newNodeId, newNode);

			let newParent = targetMetanode.parent(nodeId).replace(".", nodePath);
			this.graph.setParent(newNodeId, newParent);
		});

		targetMetanode.edges().forEach(edge => {
			const e = targetMetanode.edge(edge)
			this.graph.setEdge(edge.v.replace(".", nodePath), edge.w.replace(".", nodePath), {});
		});

		this.scopeStack.pop();

		this.touchNode(nodePath);
	}

	clearNodeStack() {
		this.previousNodeStack = [];
		this.nodeStack = [];
	}

	freezeNodeStack() {
		this.previousNodeStack = [...this.nodeStack];
		this.nodeStack = [];
	}

	setParent(childPath, parentPath) {
		return this.graph.setParent(childPath, parentPath);
	}

	isInput(nodePath) {
		return this.graph.node(nodePath).class === "Input";
	}

	isOutput(nodePath) {
		return this.graph.node(nodePath).class === "Output";
	}

	isMetanode(nodePath) {
		// console.log("isMetanode:", nodePath)
		return this.graph.node(nodePath).isMetanode === true;
	}

	getOutputNodes(scopePath) {
		let scope = this.graph.node(scopePath);
		let outputNodes = this.graph.children(scopePath).filter(node => { return this.isOutput(node) });

		if (outputNodes.length === 0) {
			this.moniel.logger.addIssue({
				message: `Metanode "${scope.id}" doesn't have any Output node.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end: scope._source ? scope._source.endIdx : 0
				}
			});
			return null;	
		}

		return outputNodes;
	}

	getInputNodes(scopePath) {
		let scope = this.graph.node(scopePath);
		let inputNodes = this.graph.children(scopePath).filter(node => { return this.isInput(node)});

		if (inputNodes.length === 0) {
			this.moniel.logger.addIssue({
				message: `Metanode "${scope.id}" doesn't have any Input nodes.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end:  scope._source ? scope._source.endIdx : 0
				}
			});
		}

		return inputNodes;
	}

	setEdge(fromPath, toPath) {
		// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)
		var sourcePaths

		if (typeof fromPath === "string") {
			if (this.isMetanode(fromPath)) {
				sourcePaths = this.getOutputNodes(fromPath)
			} else {
				sourcePaths = [fromPath]
			}
		} else if (Array.isArray(fromPath)) {
			sourcePaths = fromPath
		}

		var targetPaths

		if (typeof toPath === "string") {
			if (this.isMetanode(toPath)) {
				targetPaths = this.getInputNodes(toPath)
			} else {
				targetPaths = [toPath]
			}
		} else if (Array.isArray(toPath)) {
			targetPaths = toPath
		}

		this.setMultiEdge(sourcePaths, targetPaths)
	}

	setMultiEdge(sourcePaths, targetPaths) {

		if (sourcePaths === null || targetPaths === null) {
			return
		}

		if (sourcePaths.length === targetPaths.length) {
			for (var i = 0; i < sourcePaths.length; i++) {
				if (sourcePaths[i] && targetPaths[i]) {
					this.graph.setEdge(sourcePaths[i], targetPaths[i], {});	
				}
			}
		} else {
			if (targetPaths.length === 1) {
				sourcePaths.forEach(sourcePath => this.setEdge(sourcePath, targetPaths[0]))
			} else if (sourcePaths.length === 1) {
				targetPaths.forEach(targetPath => this.setEdge(sourcePaths[0], targetPath,))
			} else {
				this.moniel.logger.addIssue({
					message: `Number of nodes does not match. [${sourcePaths.length}] -> [${targetPaths.length}]`,
					type: "error",
					position: {
						// start: scope._source ? scope._source.startIdx : 0,
						// end:  scope._source ? scope._source.endIdx : 0
					}
				});
			}
		}

	}

	hasNode(nodePath) {
		return this.graph.hasNode(nodePath);
	}

	getGraph() {
		// console.log(this.graph)
		return this.graph;
	}

	getMetanodes() {
		return this.metanodes
	}
}
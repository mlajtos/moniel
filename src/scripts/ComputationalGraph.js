class ComputationalGraph{
	defaultEdge = {}

	nodeCounter = {}
	nodeStack = []
	previousNodeStack = []
	scopeStack = new ScopeStack()

	metanodes = {}
	metanodeStack = []

	get graph() {
		let lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
		return this.metanodes[lastIndex];
	}

	constructor(parent) {
		this.initialize();
		this.moniel = parent;
	}

	initialize() {
		this.nodeCounter = {}
		this.scopeStack.initialize();

		this.metanodes = {}
		this.metanodeStack = []

        this.addMain();
	}

	enterScope(scope) {
		this.scopeStack.push(scope.name.value);
		let currentScopeId = this.scopeStack.currentScopeIdentifier();
		let previousScopeId = this.scopeStack.previousScopeIdentifier();

		this.graph.setNode(currentScopeId, {
			userGeneratedId: scope.name.value,
            class: "Metanode",
            isMetanode: true,
            _source: scope.name._source
		});

		this.graph.setParent(currentScopeId, previousScopeId);
	}

	exitScope() {
		this.scopeStack.pop();
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
		if (this.graph.hasNode(nodePath)) {
			this.nodeStack.push(nodePath);
			this.previousNodeStack.forEach(fromPath => {
				this.setEdge(fromPath, nodePath)	
			});
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
			console.warn(`Redifining node "${id}"`);	
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
			this.graph.setEdge(edge.v.replace(".", nodePath), edge.w.replace(".", nodePath), targetMetanode.edge(edge));
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
		return this.graph.node(nodePath).isMetanode === true;
	}

	getOutputNode(scopePath) {
		let scope = this.graph.node(scopePath);
		let outs = this.graph.children(scopePath).filter(node => { return this.isOutput(node) });
		if (outs.length === 1) {
			return outs[0];	
		} else  if (outs.length === 0) {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.id}" doesn't have any Output node.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end: scope._source ? scope._source.endIdx : 0
				}
			});
			return null;
		} else {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.id}" has more than one Output node.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end: scope._source ? scope._source.endIdx : 0
				}
			});
			return null;
		}
	}

	getInputNode(scopePath) {
		let scope = this.graph.node(scopePath);
		let ins = this.graph.children(scopePath).filter(node => { return this.isInput(node) });
		if (ins.length === 1) {
			return ins[0];	
		} else  if (ins.length === 0) {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.id}" doesn't have any Input node.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end:  scope._source ? scope._source.endIdx : 0
				}
			});
			return null;
		} else {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.id}" has more than one Input node.`,
				type: "error",
				position: {
					start: scope._source ? scope._source.startIdx : 0,
					end:  scope._source ? scope._source.endIdx : 0
				}
			});
			return null;
		}	
	}

	setEdge(fromPath, toPath) {
		// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)

		if (this.isMetanode(fromPath)) {
			fromPath = this.getOutputNode(fromPath);
		}

		if (this.isMetanode(toPath)) {
			toPath = this.getInputNode(toPath);
		}
		
		if (fromPath && toPath) {
			this.graph.setEdge(fromPath, toPath, {...this.defaultEdge});	
		}
	}

	hasNode(nodePath) {
		return this.graph.hasNode(nodePath);
	}

	getGraph() {
		return this.graph;
	}
}
class ComputationalGraph{
	constructor() {
		this.initialize();
	}

	initialize() {
		this.graph = new dagreD3.graphlib.Graph({
			compound:true
		});
        this.graph.setGraph({});

		this.nodeCounter = {};

		this.nodeStack = [];
		this.previousNodeStack = [];

		this.scopeStack = new ScopeStack();
		this.scopeStack.initialize();

		this.defaultEdge = {
            arrowhead: "vee",
            lineInterpolate: "basis"
        }

        this.addMain();
	}

	enterScope(name) {
		this.scopeStack.push(name);
		let currentScopeId = this.scopeStack.currentScopeIdentifier();

		this.graph.setNode(currentScopeId, {
			label: name,
			clusterLabelPos: "top",
            class: "Scope"
		});

		let previousScopeId = this.scopeStack.previousScopeIdentifier();
		this.graph.setParent(currentScopeId, previousScopeId);
	}

	exitScope() {
		this.scopeStack.pop();
	}

	generateInstanceId(type) {
		if (!this.nodeCounter.hasOwnProperty(type)) {
			this.nodeCounter[type] = 0;
		}
		this.nodeCounter[type] += 1;
		let id = type + this.nodeCounter[type];
		return id;
	}

	addMain() {
		this.scopeStack.push(".");
		let id = this.scopeStack.currentScopeIdentifier();

		this.graph.setNode(id, {
			class: "Network"
		});
	}

	touchNode(nodePath) {
		if (this.graph.hasNode(nodePath)) {
			this.nodeStack.push(nodePath);
			this.previousNodeStack.forEach(fromPath => this.setEdge(fromPath, nodePath));
		} else {
			console.warn(`Trying to touch non-existant node "${nodePath}"`);
		}
	}

	referenceNode(id) {
		this.scopeStack.push(id);
		let nodePath = this.scopeStack.currentScopeIdentifier();
		let scope = this.scopeStack.previousScopeIdentifier();

		if (!this.graph.hasNode(nodePath)) {
			this.graph.setNode(nodePath, {
				label: id,
				class: "undefined"
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

		if (!this.graph.hasNode(nodePath)) {
			this.graph.setNode(nodePath, node);
			this.setParent(nodePath, scope);
		} else {
			console.warn(`Redifining node "${id}"`);
			this.graph.setNode(nodePath, node);
			this.setParent(nodePath, scope);
		}
		
		this.touchNode(nodePath);
		this.scopeStack.pop();
	}

	clearNodeStack() {
		this.previousNodeStack = [];
		this.nodeStack = [];
	}

	freezeNodeStack() {
		// console.log(`Freezing node stack. Content: ${JSON.stringify(this.nodeStack)}`);
		this.previousNodeStack = [...this.nodeStack];
		this.nodeStack = [];
	}

	setParent(childPath, parentPath) {
		return this.graph.setParent(childPath, parentPath);
	}

	setEdge(fromPath, toPath) {
		// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)
		this.graph.setEdge(fromPath, toPath, {...this.defaultEdge});
	}

	hasNode(nodePath) {
		return this.graph.hasNode(nodePath);
	}

	getGraph() {
		return this.graph;
	}
}
class ComputationalGraph{
	graph = null

	defaultEdge = {
        arrowhead: "vee",
        lineInterpolate: "basis"
    }

	nodeCounter = {}
	nodeStack = []
	previousNodeStack = []
	scopeStack = new ScopeStack()

	constructor(parent) {
		this.initialize();
		this.moniel = parent;
	}

	initialize() {
		this.graph = new graphlib.Graph({
			compound:true
		});
        this.graph.setGraph({});
		this.scopeStack.initialize();

        this.addMain();
	}

	enterScope(scope) {
		this.scopeStack.push(scope.name);
		let currentScopeId = this.scopeStack.currentScopeIdentifier();

		this.graph.setNode(currentScopeId, {
			label: scope.name,
			clusterLabelPos: "top",
            class: "Scope",
            _source: scope._source
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

	isInput(nodePath) {
		return this.graph.node(nodePath).class === "Input";
	}

	isOutput(nodePath) {
		return this.graph.node(nodePath).class === "Output";
	}

	isScope(nodePath) {
		return this.graph.node(nodePath).class === "Scope";	
	}

	getScopeOutput(scopePath) {
		let scope = this.graph.node(scopePath);
		let outs = this.graph.children(scopePath).filter(node => { return this.isOutput(node) });
		if (outs.length === 1) {
			return outs[0];	
		} else  if (outs.length === 0) {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.label}" doesn't have any Output node.`,
				type: "error",
				position: scope._source.startIdx
			});
			return null;
		} else {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.label}" has more than one Output node.`,
				type: "error",
				position: scope._source.startIdx
			});
			return null;
		}
	}

	getScopeInput(scopePath) {
		let scope = this.graph.node(scopePath);
		let ins = this.graph.children(scopePath).filter(node => { return this.isInput(node) });
		if (ins.length === 1) {
			return ins[0];	
		} else  if (ins.length === 0) {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.label}" doesn't have any Input node.`,
				type: "error",
				position: scope._source.startIdx
			});
			return null;
		} else {
			this.moniel.logger.addIssue({
				message: `Scope "${scope.label}" has more than one Input node.`,
				type: "error",
				position: scope._source.startIdx
			});
			return null;
		}	
	}

	setEdge(fromPath, toPath) {
		// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)

		if (this.isScope(fromPath)) {
			fromPath = this.getScopeOutput(fromPath);
		}

		if (this.isScope(toPath)) {
			toPath = this.getScopeInput(toPath);
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
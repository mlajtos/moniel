class ScopeStack{
	scopeStack = []

	constructor(scope = []) {
		if (Array.isArray(scope)) {
			this.scopeStack = scope;
		} else {
			console.error("Invalid initialization of scope stack.", scope);
		}
	}

	initialize() {
		this.clear();
	}

	push(scope) {
		this.scopeStack.push(scope);
	}

	pop() {
		return this.scopeStack.pop();
	}

	clear() {
		this.scopeStack = [];
	}

	currentScopeIdentifier() {
		return this.scopeStack.join("/");
	}

	previousScopeIdentifier() {
		let copy = Array.from(this.scopeStack);
		copy.pop();
		return copy.join("/");
	}
}
class ScopeStack{
	constructor(scope = []) {
		if (Array.isArray(scope)) {
			this.scopeStack = scope;
		} else {
			console.error("Invalid initialization of scope stack.", scope);
		}
	}

	push(scope) {
		console.info(`Scope "${scope}" pushed to scope stack.`);
		this.scopeStack.push(scope);
	}

	pop() {
		const scope = this.scopeStack.pop();
		console.info(`Scope "${scope}" popped from scope stack.`);
		return scope;
	}

	clear() {
		this.scopeStack = [];
	}

	initialize() {
		this.clear();
		this.push(".");
	}

	currentScopeIdentifier() {
		return this.scopeStack.join("/");
	}

	toString() {
		return this.scopeStack.join("/");	
	}

	generateCurrentScopeIdentifier() {
		return this.scopeStack.join("/");
	}

	current() {
		return Array.from(this.scopeStack);
	}

	toString() {
		return this.scopeStack.join("/");
	}
}
class Logger{
	constructor() {
		this.issues = [];
	}

	clear() {
		this.issues = [];
	}
	
	getIssues() {
		return this.issues;
	}

	addIssue(issue) {
		var f = null;
		switch(issue.type) {
			case "error": f = console.error; break;
			case "warning": f = console.warn; break;
			case "info": f = console.info; break;
			default: f = console.log; break;
		}
		f(issue.message);
		this.issues.push(issue);
	}
}
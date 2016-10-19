class IDE extends React.Component{
	moniel = new Moniel();

	lock = null

	constructor(props) {
		super(props);

		this.state = {
			"grammar": grammar,
			"semantics": semantics,
			"networkDefinition": "",
			"ast": null,
			"issues": null
		};
		this.updateNetworkDefinition = this.updateNetworkDefinition.bind(this);
		this.delayedUpdateNetworkDefinition = this.delayedUpdateNetworkDefinition.bind(this);
	}

	componentDidMount() {
		this.loadExample("VGG16");
	}

	delayedUpdateNetworkDefinition(value) {
		if (this.lock) { clearTimeout(this.lock); }
		this.lock = setTimeout(() => { this.updateNetworkDefinition(value); }, 100);
	}

	updateNetworkDefinition(value){
		console.time("updateNetworkDefinition");
		var result = this.compileToAST(this.state.grammar, this.state.semantics, value);
		if (result.ast) {
			this.moniel.walkAst(result.ast);
			var graph = this.moniel.getComputationalGraph();
			this.setState({
				networkDefinition: value,
				ast: result.ast,
				graph: graph,
				issues: this.moniel.getIssues()
			});
		} else {
			// console.error(result);
			this.setState({
				networkDefinition: value,
				ast: null,
				graph: null,
				issues: [{
					position: {
						start: result.position - 1,
						end: result.position
					},
					message: "Expected " + result.expected + ".",
					type: "error"
				}]
			});
		}
		console.timeEnd("updateNetworkDefinition");
	}

	loadExample(id) {
		var callback = function(value) {
			this.editor.setValue(value);
			this.setState({
				networkDefinition: value
			});
		};

		$.ajax({
			url: `/examples/${id}.mon`,
			data: null,
			success: callback.bind(this),
			dataType: "text"
		});
	}

	// into Moniel? or Parser
	compileToAST(grammar, semantics, source) {
		console.log("compileToAST");
	    var result = grammar.match(source);

	    if (result.succeeded()) {
	        var ast = semantics(result).eval();
	        return {
	            "ast": ast
	        }
	    } else {
	    	// console.error(result);
	        var expected = result.getExpectedText();
	        var position = result.getRightmostFailurePosition();
	        return {
	            "expected": expected,
	            "position": position
	        }
	    }
	}

	render() {
		//console.log("IDE.render");
    	return <div id="container">
    		<Panel title="Definition">
    			<Editor
    				ref={(ref) => this.editor = ref}
    				mode="moniel"
    				theme="monokai"
    				issues={this.state.issues}
    				onChange={this.delayedUpdateNetworkDefinition}
    				defaultValue={this.state.networkDefinition}
    				highlightRange={this.state.highlightRange}
    			/>
    		</Panel>
    		
    		<Panel title="Visualization">
    			<VisualGraph graph={this.state.graph} />
    		</Panel>

    		{/*
    		<Panel title="AST">
    			<Editor
    				mode="json"
    				theme="monokai"
    				value={JSON.stringify(this.state.ast, null, 2)}
    			/>
    		</Panel>
    	*/}
    		
    	</div>;
  	}
}
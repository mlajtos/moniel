class Hello extends React.Component{

	constructor(props) {
		super(props);
		this.state = {
			"grammar": grammar,
			"semantics": semantics,
			"networkDefinition": "",
			"ast": null,
			"annotations": null,
			"definitions": [],
			"highlightRange": {
				startIdx: 0,
				endIdx: 0
			}
		};
		this.updateNetworkDefinition = this.updateNetworkDefinition.bind(this);
		this.delayedUpdateNetworkDefinition = this.delayedUpdateNetworkDefinition.bind(this);
		this.onHighlight = this.onHighlight.bind(this);
		this.lock = null;
	}

	componentDidMount() {
	}

	delayedUpdateNetworkDefinition(value) {
		if (this.lock) {
			clearTimeout(this.lock);
		}
		this.lock = setTimeout(() => { this.updateNetworkDefinition(value); }, 250);
	}

	updateNetworkDefinition(value){
		console.log("update")
		console.time("dataflow");
		var result = this.compileToAST(this.state.grammar, this.state.semantics, value);
		if (result.ast) {
			this.setState({
				ast: result.ast,
				annotations: null
			});
		} else {
			this.setState({
				ast: null,
				annotations: {
					position: result.position,
					message: "Expected " + result.expected + "."
				}
			});
		}
	}

	onHighlight(range) {
		this.setState({
			highlightRange: range
		})
	}

	compileToAST(grammar, semantics, source) {
	    var result = grammar.match(source);

	    if (result.succeeded()) {
	        var ast = semantics(result).eval();
	        return {
	            "ast": ast
	        }
	    } else {
	        var expected = result.getExpectedText();
	        var position = result.getRightmostFailurePosition();
	        return {
	            "expected": expected,
	            "position": position
	        }
	    }
	}

	render() {
		var style = {
	  		position: "absolute",
	  		display: "flex",
	  		flexDirection: "row",
	  		bottom: 0,
	    	top: 0,
	    	left: 0,
	    	right: 0
	  	}

	  	var model = `/conv1{
    in:Input(shape=28x28)
    
    filters:Tensor(shape=10x3x3)
    biases:Tensor(shape=10x1)
    
    [in,filters] -> conv:Convolution
    [conv, biases] -> BiasAdd -> ReLU -> out
    
    out:Output
}

/conv2{
    in:Input(shape=28x28)
    
    filters:Tensor(shape=10x3x3)
    biases:Tensor(shape=10x1)
    
    [in,filters] -> conv:Convolution
    [conv, biases] -> BiasAdd -> ReLU -> out
    
    out:Output
}

image:Input -> conv1/in
conv1/out -> conv2/in
conv2/out -> Out`;
    	return <div style={style}>
    		<Panel title="Definition">
    			<Editor
    				name="network"
    				mode="moniel"
    				theme="monokai"
    				annotations={this.state.annotations}
    				onChange={this.delayedUpdateNetworkDefinition}
    				/*defaultValue="In -> conv1:C -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out  conv1 -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out"*/
    				defaultValue={model}
    				highlightRange={this.state.highlightRange}
    			/>
    		</Panel>
    		
    		<Panel title="Schema">
    			<VisualGraph ast={this.state.ast} onHighlight={this.onHighlight} />
    		</Panel>

    		{/*
    		<Panel title="AST">
    			<Editor
    				name="ast"
    				mode="json"
    				theme="monokai"
    				value={JSON.stringify(this.state.ast, null, 2)}
    			/>
    		</Panel>
    	*/}
    		
    	</div>;
  	}
}
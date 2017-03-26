const ipc = require("electron").ipcRenderer
const fs = require("fs")

class IDE extends React.Component{
	moniel = new Moniel()
	parser = new Parser()
	generator = new PyTorchGenerator()

	lock = null

	constructor(props) {
		super(props);

		this.state = {
			// these are no longer needed here
			// "grammar": this.parser.grammar,
			// "semantics": this.parser.semantics,
			"networkDefinition": "",
			"ast": null,
			"issues": null,
			"layout": "columns",
			"generatedCode": ""
		};

		ipc.on('save', function(event, message) {
			fs.writeFile(message.folder + "/source.mon", this.state.networkDefinition, function(err) {
			  if (err) throw errs
			});
			fs.writeFile(message.folder + "/source.ast.json", JSON.stringify(this.state.ast, null, 2), function(err) {
			  if (err) throw errs
			});

			let saveNotification = new Notification('Sketch saved', {
            	body: `Sketch was successfully saved in the "sketches" folder.`,
				silent: true
            })
		}.bind(this));

		ipc.on("toggleLayout", (e, m) => {
			this.toggleLayout()
		});

		let layout = window.localStorage.getItem("layout")
		if (layout) {
			if (layout == "columns" || layout == "rows") {
				this.state.layout = layout
			} else {
				this.moniel.logger.addIssue({
					type: "warning",
					message: `Value for "layout" can be only "columns" or "rows".`
				});
			}
		}

		this.updateNetworkDefinition = this.updateNetworkDefinition.bind(this);
		this.delayedUpdateNetworkDefinition = this.delayedUpdateNetworkDefinition.bind(this);

		// this.loadExample("ConvolutionalLayer")
	}

	loadExample(id) {
		let fileContent = fs.readFileSync(`./examples/${id}.mon`, "utf8")
		this.editor.setValue(fileContent) // this has to be here, I don't know why
		this.setState({
			networkDefinition: fileContent
		})
	}

	componentDidMount() {
		this.loadExample("ConvolutionalLayer")
	}

	delayedUpdateNetworkDefinition(value) {
		if (this.lock) { clearTimeout(this.lock); }
		this.lock = setTimeout(() => { this.updateNetworkDefinition(value); }, 100);
	}

	updateNetworkDefinition(value){
		console.time("updateNetworkDefinition");
		var result = this.parser.make(value)

		if (result.ast) {
			this.moniel.walkAst(result.ast);
			var graph = this.moniel.getComputationalGraph();
			this.setState({
				networkDefinition: value,
				ast: result.ast,
				graph: graph,
				generatedCode: this.generator.generateCode(graph),
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

	toggleLayout() {
		this.setState({
			layout: (this.state.layout === "columns") ? "rows" : "columns"
		})
	}

	render() {
		let containerLayout = this.state.layout
		let graphLayout = this.state.layout === "columns" ? "BT" : "LR"

    	return <div id="container" className={`container ${containerLayout}`}>
    		<Panel id="definition">
    			<Editor
    				ref={(ref) => this.editor = ref}
    				mode="moniel"
    				theme="monokai"
    				issues={this.state.issues}
    				onChange={this.delayedUpdateNetworkDefinition}
    				defaultValue={this.state.networkDefinition}
    			/>
    		</Panel>
    		
    		<Panel id="visualization">
    			<VisualGraph graph={this.state.graph} layout={graphLayout} />
    		</Panel>

			<Panel title="Generated Code">
    			<Editor
    				mode="python"
    				theme="monokai"
    				value={this.state.generatedCode}
    			/>
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
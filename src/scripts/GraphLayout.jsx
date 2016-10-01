class GraphLayout{
	worker = new Worker("src/scripts/GraphLayoutWorker.js");
	callback = function(){}

    constructor() {
		this.worker.addEventListener("message", this.receive.bind(this));
    }

    encode(graph) {
    	return JSON.stringify(graphlib.json.write(graph));
    }

    decode(json) {
    	return graphlib.json.read(JSON.parse(json));
    }

    layout(graph, callback) {
    	console.log("GraphLayout.layout", graph, callback);
    	this.callback = callback;
    	this.worker.postMessage({
    		graph: this.encode(graph)
    	});
    }

    receive(data) {
    	var graph = this.decode(data.data.graph);
    	this.callback(graph);
    }
}
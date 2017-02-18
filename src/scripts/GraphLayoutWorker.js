importScripts("../../node_modules/dagre/dist/dagre.js");

addEventListener("message", function(event) {
	console.time("graph layout");
	var request = JSON.parse(event.data.graph);
	var graph = dagre.graphlib.json.read(request);
	dagre.layout(graph);
	var obj = dagre.graphlib.json.write(graph);
	var response = JSON.stringify(obj);
	postMessage({
		graph: response
	});
	console.timeEnd("graph layout");
});
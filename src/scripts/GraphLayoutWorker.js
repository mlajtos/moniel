importScripts("../../lib/dagre/dist/dagre.js");

addEventListener("message", function(event) {
	console.time("graph layout");
	var request = JSON.parse(event.data.graph);
	var graph = dagre.graphlib.json.read(request);
	graph.setGraph({
        rankdir: 'BT',
        edgesep: 20,
        ranksep: 40,
        nodeSep: 30,
        marginx: 20,
        marginy: 20
	});
	dagre.layout(graph);
	var obj = dagre.graphlib.json.write(graph);
	var response = JSON.stringify(obj);
	postMessage({
		graph: response
	});
	console.timeEnd("graph layout");
});
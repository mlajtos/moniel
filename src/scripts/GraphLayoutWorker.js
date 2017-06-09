importScripts("../../node_modules/dagre/dist/dagre.js");

addEventListener("message", function(message) {
	console.time("graph layout")
	const graph = dagre.graphlib.json.read(message.data)
	dagre.layout(graph)
	const response = dagre.graphlib.json.write(graph)
	console.timeEnd("graph layout")
	postMessage(response)
});
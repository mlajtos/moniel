var blockDefinitions = ["Input", "Output", "Convolution", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Summation", "PeterHuba"];

state.objects = {};
state.objects.currentScope = [];
state.objects.path = [];
state.objects.definitions = [];

function copy(obj) { return JSON.parse(JSON.stringify(obj))}

var level = 0;
function indent(level) { var space = ""; for(var i=0;i<level;i++) {space += "  "} return space;}

function walk(node){
    state.objects.path.push(indent(level) + node.type);
    level += 1;
    switch (node.type) {
        case "Network":
            node.definitions.forEach(function(definition) {
                walk(definition);
            });
            break;
        case "Connection":
            node.list.forEach(function(list){
                walk(list);
            });
            break;
        case "BlockDefinition":
            state.objects.currentScope.push(node.name);
            state.objects.definitions.push(copy(state.objects.currentScope));
            node.definitions.forEach(function(definition) {
                walk(definition);
            });
            break;
    }
    level -= 1;
}
walk(state.ast);

var previous = null;

function walk2(node, g) {
    switch (node.type) {
        case "Network":
            node.definitions.forEach(function(meh) {
                walk2(meh, g);
            });
            break;
        case "Connection":
            node.list.forEach(function(meh){
                walk2(meh, g);
                previous = meh;
            });
            previous = null;
            break;
        case "BlockInstance":
            var blockName = nameResolution(node.name, blockDefinitions);
            console.log(blockName)
            g.setNode(node.name, {label: blockName, class: "type-" + blockName});
            //console.log("previous", previous);
            
            if (previous) {
                
                if (previous.type == "BlockInstance") {
                    g.setEdge(previous.name, node.name);   
                } else if (previous.type == "BlockList") {
                    previous.list.forEach(function(hu) {
                        g.setEdge(hu.name, node.name);
                    });
                }
            }
            break;
        case "BlockList":
            node.list.forEach(function(meh){
                walk2(meh, g);
            });
            break;
    }
}

var g2 = new dagreD3.graphlib.Graph()
  .setGraph({})
  .setDefaultEdgeLabel(function() { return {}; });

walk2(state.ast, g2);

g2.nodes().forEach(function(v) {
  var node = g2.node(v);
  node.rx = node.ry = 5; // Round the corners of the nodes
});

// Create the renderer
var render = new dagreD3.render();

// Set up an SVG group so that we can translate the final graph.
var svg = d3.select("svg#viz"),
    svgGroup = d3.select("svg#viz g#group");

// Run the renderer. This is what draws the final graph.
render(svgGroup, g2);

// Center the graph
var xCenterOffset = (svg.node().getBoundingClientRect().width - g2.graph().width) / 2;
svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
svg.attr("height", g2.graph().height + 40);

/*
// Custom transition function
function transition(selection) {
  return selection.transition().duration(500);
}

renderer.transition(transition);
*/
class VisualGraph extends React.Component{

    constructor(props) {
        console.log("constructor");
        super(props);
        this.dagreRenderer = new dagreD3.render();
        this.moniel = new Moniel();

        this.colorHash = new ColorHash({
            saturation: [0.9],
            lightness: [0.45],
            hash: function(str) {
                var hash = 11;
                for (var i = 0; i < str.length; i++) {
                    hash = hash * 47 + str.charCodeAt(i) % 32;
                }
                return hash
            }
        });
    }

    componentDidMount() {

        /*
        this.zoom = d3.behavior.zoom().on("zoom", function() {
            //console.log(d3.event.translate, d3.event.scale);
            console.log(d3.select(this.svgGroup));
                d3.select(this.svgGroup).attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
            });

        d3.select(this.svg).call(this.zoom);
        */
    }

    generateGraph(ast) {
        this.moniel.walkAst(ast);
        return this.moniel.getComputationalGraph();
    }

    render() {
        if (this.svg && this.props.ast) {
            var graph = this.generateGraph(this.props.ast);
            var svg = d3.select(this.svg)
            var group = d3.select(this.svgGroup)

            graph.graph().transition = function(selection) {
                return selection.transition().duration(250);
            };

            graph.setGraph({
                rankdir: 'BT',
                edgesep: 20,
                ranksep: 40,
                nodeSep: 20,
                marginx: 20,
                marginy: 20
            })
            // dagre.layout(graph);

            this.dagreRenderer(d3.select(this.svgGroup), graph);

            var nodes = group.selectAll("g.node");

            nodes.on("click", function(d) {
                var node = graph.node(d);
                this.props.onHighlight({
                    startIdx: node._interval.startIdx,
                    endIdx: node._interval.endIdx
                });
            }.bind(this));


            var graphWidth = graph.graph().width;
            var graphHeight = graph.graph().height;
            var width = this.svg.getBoundingClientRect().width
            var height = this.svg.getBoundingClientRect().height
            var zoomScale = Math.min(width / graphWidth, height / graphHeight);
            var translate = [((width/2) - ((graphWidth*zoomScale)/2)), ((height/2) - (graphHeight*zoomScale)/2)];

            //group.translate(translate);
            //group.scale(zoomScale);

            // center
            d3.select(this.svgGroup).transition().duration(250).attr("transform", "translate(" + translate + ")scale(" + zoomScale + ")");
        }

        var style = {flex: 1}

        console.timeEnd("dataflow");

        return <svg id="vizualization" style={style} ref={(ref) => this.svg = ref}>
            <g id="group" ref={(ref) => this.svgGroup = ref}></g>
        </svg>;
    }
}
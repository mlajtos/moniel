class VisualGraph extends React.Component{

    constructor(props) {
        console.log("VisualGraph.constructor");
        super(props);
        this.dagreRenderer = new dagreD3.render();
        this.graphLayout = new GraphLayout();
        this.state = {
            graph: null
        };
    }

    componentDidMount() {
        console.log("VisualGraph.componentDidMount");
        /*
        this.zoom = d3.behavior.zoom().on("zoom", function() {
            //console.log(d3.event.translate, d3.event.scale);
            console.log(d3.select(this.svgGroup));
                d3.select(this.svgGroup).attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
            });

        d3.select(this.svg).call(this.zoom);
        */
    }

    renderGraph(graph) {
        console.log("VisualGraph.renderGraph");
        var svg = d3.select(this.svg);
        var group = d3.select(this.svgGroup);

        this.dagreRenderer(d3.select(this.svgGroup), graph);

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

    saveGraph(graph) {
        console.log("VisualGraph.setState")
        this.setState({
            graph: graph
        });
    }

    componentWillReceiveProps(nextProps) {
        console.log("VisualGraph.componentWillReceiveProps", nextProps);
        if (nextProps.graph) {
            this.graphLayout.layout(nextProps.graph, this.saveGraph.bind(this));
        }
    }

    render() {
        console.log("VisualGraph.render");
        if (this.state.graph) {
            this.renderGraph(this.state.graph);
        }

        return <svg id="visualization" ref={(ref) => this.svg = ref}>
            <g id="group" ref={(ref) => this.svgGroup = ref}></g>
        </svg>;
    }
}
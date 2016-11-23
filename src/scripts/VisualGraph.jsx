class VisualGraph extends React.Component{

    constructor(props) {
        console.log("VisualGraph.constructor");
        super(props);
        this.graphLayout = new GraphLayout();
        this.state = {
            graph: null
        };
    }

    saveGraph(graph) {
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

    handleClick(node) {
        console.log("Clicked", node);
        this.setState({
            selectedNode: node.id
        })
    }

    mount(domNode) {
        if (domNode) {
            domNode.beginElement()
        }
    }

    render() {
        console.log(this.state.graph);

        if (!this.state.graph) {
            return <div>No data yet!</div>
        }

        let g = this.state.graph;

        let nodes = g.nodes().map(nodeName => {
            let graph = this;
            let n = g.node(nodeName);
            let node = null;
            let props = {
                key: nodeName,
                node: n,
                onClick: graph.handleClick.bind(graph)
            }

            if (n.isMetanode === true) {
                node = <Metanode {...props} />;
            } else {
                if (n.userGeneratedId) {
                    node = <IdentifiedNode {...props} />;
                } else {
                    node = <AnonymousNode {...props} />
                }
            }

            return node;
        });

        let edges = g.edges().map(edgeName => {
            let e = g.edge(edgeName);
            return <Edge key={`${edgeName.v}->${edgeName.w}`} edge={e}/>
        });

        //console.log(edges);

        var viewBox = `0 0 ${g.graph().width} ${g.graph().height}`;
        var transformView = `translate(0px,0px)` + `scale(${g.graph().width / g.graph().width},${g.graph().height / g.graph().height})`;
        
        let selectedNode = this.state.selectedNode;
        if (selectedNode) {
            let n = g.node(selectedNode);
            console.log(n.x, n.y, n.width, n.height);
            //viewBox = `${n.x - n.width / 2} ${n.y - n.height / 2} ${n.width} ${n.height}`
            let scale = [g.graph().width / n.width, g.graph().height / n.height];
            let maxScale = Math.max(...scale);
            console.log(scale, maxScale)
            var transformView = `scale(${maxScale})` + `translate(${g.graph().width / n.x}px,${g.graph().height / n.y}px)`;
        }

        console.log(transformView);

        return <svg id="visualization">
            <animate ref={this.mount} attributeName="viewBox" to={viewBox} begin="0s" dur="0.25s" fill="freeze" repeatCount="1"></animate>
            <defs>
                <marker id="vee" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="7.5" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 L 3 5 z" className="arrow"></path>
                </marker>
            </defs>
            <g id="graph" style={{transform: transformView}}>
                <g id="nodes">
                    {nodes}
                </g>
                <g id="edges">
                    {edges}
                </g>
            </g>
        </svg>;
    }
}

class Edge extends React.Component{
    line = d3.line()
        .curve(d3.curveBasis)
        .x(d => d.x)
        .y(d => d.y)

    constructor(props) {
        super(props);
        this.state = {
            previousPoints: []
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            previousPoints: this.props.edge.points
        });
    }

    mount(domNode) {
        if (domNode) {
            domNode.beginElement()    
        }
    }

    render() {
        let e = this.props.edge;
        let l = this.line;
        return (
            <g className="edgePath" markerEnd="url(#vee)">
                <path d={l(e.points)}>
                    <animate ref={this.mount} key={Math.random()} restart="always" from={l(this.state.previousPoints)} to={l(e.points)} begin="0s" dur="0.25s" fill="freeze" repeatCount="1" attributeName="d" />
                </path>
            </g>
        );
    }
}

class Node extends React.Component{
    constructor(props) {
        super(props);
    }
}

class Metanode extends Node{
    handleClick() {
        this.props.onClick(this.props.node);
    }
    render() {
        let n = this.props.node;
        return (
            <g className={`node ${n.class}`} onClick={this.handleClick.bind(this)} style={{transform: `translate(${n.x -(n.width/2)}px,${n.y -(n.height/2)}px)`}}>
                <rect width={n.width} height={n.height} rx="15px" ry="15px" style={n.style}></rect>
                <text transform={`translate(10,0)`} textAnchor="start" style={{dominantBaseline: "ideographic"}}>
                    <tspan x="0" className="id">{n.userGeneratedId}</tspan>
                    <tspan x="0" dy="1.2em">{n.class}</tspan>
                </text>
            </g>
        );
    }
}

class AnonymousNode extends Node{
    constructor(props) {
        super(props);
    }
    handleClick() {
        this.props.onClick(this.props.node);
    }
    render() {
        let n = this.props.node;
        return (
            <g className={`node ${n.class}`} onClick={this.handleClick.bind(this)} style={{transform: `translate(${n.x -(n.width/2)}px,${n.y -(n.height/2)}px)`}}>
                <rect width={n.width} height={n.height} rx="15px" ry="15px" style={n.style}> </rect>
                <text transform={`translate(${(n.width/2) },${(n.height/2)})`} textAnchor="middle">
                    <tspan>{n.class}</tspan>
                </text>
            </g>
        );
    }
}

class IdentifiedNode extends Node{
    handleClick() {
        this.props.onClick(this.props.node);
    }
    render() {
        let n = this.props.node;
        return (
            <g className={`node ${n.class}`} onClick={this.handleClick.bind(this)} style={{transform: `translate(${n.x -(n.width/2)}px,${n.y -(n.height/2)}px)`}}>
                <rect width={n.width} height={n.height} rx="15px" ry="15px" style={n.style}></rect>
                <text transform={`translate(${(n.width/2) },${(n.height/2)})`} textAnchor="middle" style={{dominantBaseline: "ideographic"}}>
                    <tspan x="0" className="id">{n.userGeneratedId}</tspan>
                    <tspan x="0" dy="1.2em">{n.class}</tspan>
                </text>
            </g>
        );
    }
}
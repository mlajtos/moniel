const zoom = require("d3-zoom")

class VisualGraph extends React.Component{
    constructor(props) {
        super(props)

        this.graphLayout = new GraphLayout(this.saveGraph.bind(this));
        this.state = {
            graph: null
        }

        this.svg = null
        this.group = null

        this.currentZoom = null
    }

    saveGraph(graph) {
        this.setState({ graph })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.graph) {
            nextProps.graph._label.rankdir = nextProps.layout
            this.graphLayout.layout(nextProps.graph)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (this.state !== nextState)
    }

    handleClick(node) {
        const selectedNode = node.id
        this.setState({ selectedNode })

        const { width, height } = this.state.graph.graph()

        const idealSize = (width, height, maxWidth, maxHeight) => {
            const widthRatio = width / maxWidth
            const heightRatio = height / maxHeight
            const idealSize = (widthRatio < heightRatio ? width : height)
            // console.log(`[${width}, ${height}], [${maxWidth}, ${maxHeight}], ${widthRatio}, ${heightRatio}, ideal = ${idealSize}`)
            return idealSize
        }

        if (this.currentZoom === null) {
            this.currentZoom = [ width / 2, height / 2, idealSize(width, height, width, height)]
        }
        const target = [node.x, node.y, idealSize(node.width, node.height, width, height)]

        this.transition(this.currentZoom, target, node)

        this.currentZoom = target
    }

    transition(start, end, node) {
        const { width, height } = this.state.graph.graph()

        const center = {
            x: width / 2,
            y: height / 2
        }
        const i = d3.interpolateZoom(start, end)

        const transform = ([x, y, size]) => {
            const scale = width / size
            const translateX = center.x - x * scale
            const translateY = center.y - y * scale
            return `translate(${translateX},${translateY})scale(${scale})`
        }

        d3.select(this.group)
            .attr("transform", transform(start))
          .transition()
            .duration(i.duration)
            .attrTween("transform", () => ( (t) => transform(i(t)) ))
      }

    render() {
        if (!this.state.graph) {
            // console.log(this.state.graph)
            return null
        }

        const g = this.state.graph

        const nodes = g.nodes().map(nodeName => {
            const n = g.node(nodeName)
            const props = {
                key: nodeName,
                node: n,
                onClick: this.handleClick.bind(this)
            }

            const Type = nodeDispatch(n)

            return <Type {...props} />
        })

        const edges = g.edges().map(edgeName => {
            const e = g.edge(edgeName);
            return <Edge key={`${edgeName.v}->${edgeName.w}`} edge={e}/>
        })

        const { width, height } = g.graph()

        return (
            <svg ref={ el => { this.svg = el } } id="visualization" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox={`0 0 ${width} ${height}`}>
                <style>
                    {
                        fs.readFileSync(__dirname + "/src/bundle.css", "utf-8", (err) => {console.log(err)})
                    }
                </style>
                <defs>
                    <Arrow />
                </defs>
                <g id="graph" ref={el => { this.group = el }}>
                    <g id="nodes">
                        {nodes}
                    </g>
                    <g id="edges">
                        {edges}
                    </g>
                </g>
            </svg>
        );
    }
}

const Arrow = () => (
    <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5" markerUnits="strokeWidth" markerWidth="10" markerHeight="7.5" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 L 3 5 z" className="arrow" />
    </marker>
)

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
            <g className="edge" markerEnd="url(#arrow)">
                <path d={l(e.points)}>
                    <animate ref={this.mount} key={Math.random()} restart="always" from={l(this.state.previousPoints)} to={l(e.points)} begin="0s" dur="0.25s" fill="freeze" repeatCount="1" attributeName="d" />
                </path>
            </g>
        );
    }
}

const nodeDispatch = (n) => {
    let Type = null
    if (n.isMetanode === true) {
        if (n.isAnonymous) {
            Type = AnonymousMetanode
        } else {
            Type = Metanode
        }
    } else {
        if (n.userGeneratedId) {
            Type = IdentifiedNode
        } else {
            Type = AnonymousNode
        }
    }
    return Type
}

class Node extends React.Component {
    render() {
        const n = this.props.node
        const type = n.isMetanode ? "metanode" : "node"

        const translateX = Math.floor(n.x -(n.width / 2))
        const translateY = Math.floor(n.y -(n.height / 2))

        return (
            <g
                className={`${type} ${n.class}`}
                onClick={this.props.onClick.bind(this, this.props.node)}
                transform={`translate(${translateX},${translateY})`}
            >
                <rect width={n.width} height={n.height} rx="15px" ry="15px" style={n.style} />
                {this.props.children}
            </g>
        );
    }
}

class Metanode extends Node {
    render() {
        const n = this.props.node
        return (
            <Node {...this.props}>
                <text transform={`translate(10,0)`} textAnchor="start" style={{dominantBaseline: "ideographic"}}>
                    <tspan x="0" className="id">{n.userGeneratedId}</tspan>
                    <tspan x="0" dy="1.2em">{n.class}</tspan>
                </text>
            </Node>
        )
    }
}

class AnonymousMetanode extends Node {
    render() {
        const n = this.props.node
        return (
            <Node {...this.props}>
                <text transform={`translate(10,0)`} textAnchor="start" style={{dominantBaseline: "ideographic"}}>
                    <tspan x="0" className="id">{n.userGeneratedId}</tspan>
                </text>
            </Node>
        )
    }
}

class AnonymousNode extends Node {
    render() {
        const n = this.props.node
        return (
            <Node {...this.props}>
                <text transform={`translate(${(n.width/2) },${(n.height/2)})`} textAnchor="middle">
                    <tspan>{n.class}</tspan>
                </text>
            </Node>
        )
    }
}

class IdentifiedNode extends Node {
    render() {
        const n = this.props.node
        return (
            <Node {...this.props}>
                <text transform={`translate(${(n.width/2) },${(n.height/2)})`} textAnchor="middle" style={{dominantBaseline: "ideographic"}}>
                    <tspan x="0" className="id">{n.userGeneratedId}</tspan>
                    <tspan x="0" dy="1.2em">{n.class}</tspan>
                </text>
            </Node>
        )
    }
}
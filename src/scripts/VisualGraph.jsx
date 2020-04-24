const zoom = require("d3-zoom");

class VisualGraph extends React.Component {
  constructor(props) {
    super(props);

    this.graphLayout = new GraphLayout(this.saveGraph.bind(this));
    this.state = {
      graph: null,
    };

    this.svg = null;
    this.group = null;

    this.currentZoom = null;
  }

  saveGraph(graph) {
    this.setState({ graph });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.graph) {
      nextProps.graph._label.rankdir = nextProps.layout;
      this.graphLayout.layout(nextProps.graph);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return this.state !== nextState;
  }

  handleClick(node) {
    const selectedNode = node.id;
    this.setState({ selectedNode });

    const { width, height } = this.state.graph.graph();

    const idealSize = (width, height, maxWidth, maxHeight) => {
      const widthRatio = width / maxWidth;
      const heightRatio = height / maxHeight;
      const idealSize = widthRatio < heightRatio ? width : height;
      // console.log(`[${width}, ${height}], [${maxWidth}, ${maxHeight}], ${widthRatio}, ${heightRatio}, ideal = ${idealSize}`)
      return idealSize;
    };

    if (this.currentZoom === null) {
      this.currentZoom = [
        width / 2,
        height / 2,
        idealSize(width, height, width, height),
      ];
    }
    const target = [
      node.x,
      node.y,
      idealSize(node.width, node.height, width, height),
    ];

    this.transition(this.currentZoom, target, node);

    this.currentZoom = target;
  }

  transition(start, end, node) {
    const { width, height } = this.state.graph.graph();

    const center = {
      x: width / 2,
      y: height / 2,
    };
    const i = d3.interpolateZoom(start, end);

    const transform = ([x, y, size]) => {
      const scale = width / size;
      const translateX = center.x - x * scale;
      const translateY = center.y - y * scale;
      return `translate(${translateX},${translateY})scale(${scale})`;
    };

    d3.select(this.group)
      .attr("transform", transform(start))
      .transition()
      .duration(i.duration)
      .attrTween("transform", () => (t) => transform(i(t)));
  }

  render() {
    if (!this.state.graph) {
      // console.log(this.state.graph)
      return null;
    }

    const g = this.state.graph;

    const nodes = g.nodes().map((nodeName) => {
      const n = g.node(nodeName);
      const props = {
        key: nodeName,
        node: n,
        onClick: this.handleClick.bind(this),
      };

      const Type = nodeDispatch(n);

      return <Type {...props} />;
    });

    const edges = g.edges().map((edgeName) => {
      const e = g.edge(edgeName);
      return <Edge key={`${edgeName.v}->${edgeName.w}`} edge={e} />;
    });

    const { width, height } = g.graph();

    return (
      <svg
        ref={(el) => {
          this.svg = el;
        }}
        id="visualization"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox={`0 0 ${width} ${height}`}
      >
        <style>
          {fs.readFileSync(__dirname + "/src/bundle.css", "utf-8", (err) => {
            console.log(err);
          })}
        </style>
        <defs>
          <Arrow />
        </defs>
        <g
          id="graph"
          ref={(el) => {
            this.group = el;
          }}
        >
          <g id="nodes">{nodes}</g>
          <g id="edges">{edges}</g>
        </g>
      </svg>
    );
  }
}

const Arrow = () => (
  <marker
    id="arrow"
    viewBox="0 0 10 10"
    refX="10"
    refY="5"
    markerUnits="strokeWidth"
    markerWidth="10"
    markerHeight="7.5"
    orient="auto"
  >
    <path d="M 0 0 L 10 5 L 0 10 L 3 5 z" className="arrow" />
  </marker>
);

class Edge extends React.Component {
  line = d3
    .line()
    .curve(d3.curveBasis)
    .x((d) => d.x)
    .y((d) => d.y);

  constructor(props) {
    super(props);
    this.state = {
      previousPoints: [],
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      previousPoints: this.props.edge.points,
    });
  }

  mount(domNode) {
    if (domNode) {
      domNode.beginElement();
    }
  }

  render() {
    let e = this.props.edge;
    let l = this.line;
    return (
      <g className="edge" markerEnd="url(#arrow)">
        <path d={l(e.points)}>
          <animate
            ref={this.mount}
            key={Math.random()}
            restart="always"
            from={l(this.state.previousPoints)}
            to={l(e.points)}
            begin="0s"
            dur="0.25s"
            fill="freeze"
            repeatCount="1"
            attributeName="d"
          />
        </path>
      </g>
    );
  }
}

const nodeDispatch = (n) => {
  let Type = null;
  if (n.isMetanode === true) {
    if (n.isAnonymous) {
      Type = AnonymousMetanode;
    } else {
      Type = Metanode;
    }
  } else {
    Type = AtomNode;
  }
  return Type;
};

const Node = (props) => {
  const n = props.node;
  const type = n.isMetanode ? "metanode" : "node";

  const translateX = Math.floor(n.x - n.width / 2);
  const translateY = Math.floor(n.y - n.height / 2);

  return (
    <g
      className={`${type} ${n.class}`}
      // TODO: fix zooming
      // onClick={props.onClick.bind(this, props.node)}
      transform={`translate(${translateX},${translateY})`}
    >
      <foreignObject width={props.node.width} height={props.node.height}>
        <section
          style={{
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            backgroundColor: props.node.style
              ? props.node.style.fill
              : undefined,
            boxShadow: "0px 0px 0px 1px white",
          }}
        >
          {props.children}
        </section>
      </foreignObject>
    </g>
  );
};

const Metanode = (props) => (
  <Node {...props}>
    muuuu
    {/* <text
      transform={`translate(10,0)`}
      textAnchor="start"
      style={{ dominantBaseline: "ideographic" }}
    >
      <tspan x="0" className="id">
        {props.node.userGeneratedId}
      </tspan>
      <tspan x="0" dy="1.2em">
        {props.node.class}
      </tspan>
    </text> */}
  </Node>
);

const AnonymousMetanode = (props) => (
  <Node {...props}>
    {/* <text
      transform={`translate(10,0)`}
      textAnchor="start"
      style={{ dominantBaseline: "ideographic" }}
    >
      <tspan x="0" className="id">
        {props.node.userGeneratedId}
      </tspan>
    </text> */}
  </Node>
);

const AtomNode = (props) => (
  <Node {...props}>
    <NodeContent node={props.node} />
  </Node>
);

const NodeContent = ({ node }) => {
  const id = node.userGeneratedId;
  if (!node.hasOwnProperty("parameters")) {
    console.warn("WTF", node);
    return null;
  }

  const params =
    node.parameters.length !== 0 ? (
      <div
        style={{
          background: "rgba(0, 0, 0, 0.2)",
          fontSize: "0.8em",
          maxWidth: "100%",
          width: "100%",
          paddingTop: "3px",
          paddingBottom: "3px",
        }}
      >
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            lineHeight: "14px",
          }}
        >
          <tbody>
            {node.parameters.map(([key, value], i) => (
              <tr key={key}>
                <td
                  style={{
                    paddingRight: "0.25em",
                    fontWeight: "bold",
                    textAlign: "right",
                  }}
                >
                  {key}
                </td>
                <td style={{ paddingLeft: "0.25em" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : null;

  return (
    <React.Fragment>
      <header
        style={{
          padding: "3px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {id && (
          <div className="id" style={{ fontWeight: "bold" }}>
            {id}
          </div>
        )}
        <div>{node.class}</div>
      </header>
      {params}
    </React.Fragment>
  );
};

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Graph = (function (_React$Component) {
    _inherits(Graph, _React$Component);

    function Graph(props) {
        _classCallCheck(this, Graph);

        console.log("constructor");
        _get(Object.getPrototypeOf(Graph.prototype), "constructor", this).call(this, props);

        this.dagreRenderer = new dagreD3.render();

        this.walkAst = this.walkAst.bind(this);
        this.defaultEdge = {
            arrowhead: "vee",
            lineInterpolate: "basis"
        };
    }

    _createClass(Graph, [{
        key: "getDefaultEdge",
        value: function getDefaultEdge() {
            return JSON.parse(JSON.stringify(this.defaultEdge));
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {

            /*
            this.zoom = d3.behavior.zoom().on("zoom", function() {
                //console.log(d3.event.translate, d3.event.scale);
                console.log(d3.select(this.svgGroup));
                    d3.select(this.svgGroup).attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
                });
             d3.select(this.svg).call(this.zoom);
            */
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            // console.log("componentWillReceiveProps");
            this.ast = nextProps.ast;
        }
    }, {
        key: "generateGraph",
        value: function generateGraph(ast) {
            // console.log("generateGraph")
            var graph = new dagreD3.graphlib.Graph({ compound: true }).setGraph({}).setDefaultEdgeLabel(function () {
                return {};
            });

            this.nodeCounter = {};
            this.previousItem = null;

            this.scopeStack = [];

            this.blockDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy"];
            extractDefinitionsFromAST(this.ast, this.blockDefinitions);

            this.walkAst(this.ast, graph);

            return graph;
        }
    }, {
        key: "generateIdentifier",
        value: function generateIdentifier(scopeStack, node, type) {
            var scope = scopeStack.join("/");
            var id = scope + "/" + type;

            if (node.type === "BlockInstance") {
                if (!node.alias) {
                    if (this.nodeCounter.hasOwnProperty(id)) {
                        this.nodeCounter[id] += 1;
                    } else {
                        this.nodeCounter[id] = 1;
                    }
                    id = scope + "/" + type + this.nodeCounter[id];
                } else {
                    id = scope + "/" + node.alias.value;
                }
            } else if (node.type === "Identifier") {
                id = scope + "/" + node.value;
            } else if (node.type === "Scope") {
                id = scope;
            } else {
                console.warn("uf!", node);
            }

            //console.log("nove ID:", id);

            return id;
        }
    }, {
        key: "walkAst",
        value: function walkAst(node, graph) {
            // console.log(node.type);
            if (!node) {
                return;
            }
            switch (node.type) {
                case "Network":
                    this.scopeStack.push(".");
                    graph.setNode(this.scopeStack.join("/"), { "class": "Network" });
                    node.definitions.forEach(function (definition) {
                        this.walkAst(definition, graph);
                    }, this);
                    break;
                case "Connection":
                    node.list.forEach(function (item) {
                        this.walkAst(item, graph);
                        this.previousItem = item;
                    }, this);
                    this.previousItem = null;
                    break;
                case "BlockInstance":
                    var block = nameResolution(node.name, this.blockDefinitions);
                    var type, label, shape, color, id;

                    if (block.length === 0) {
                        type = "undefined";
                        label = node.name;
                        shape = "rect";
                        console.log("Unknown block type");
                    } else if (block.length === 1) {
                        type = block[0];
                        label = block[0];
                        shape = "rect";
                        color = colorHash.hex(label);
                    } else {
                        type = "ambiguous";
                        label = node.name;
                        shape = "diamond";
                        console.log("ambiguous block type; possible matches:", block);
                    }

                    var id = this.generateIdentifier(this.scopeStack, node, type);

                    if (!node.alias) {
                        node.alias = {
                            "type": "Identifier",
                            "value": id,
                            "autogenerated": true
                        };
                    } else {
                        node.alias.value = id;
                        label = node.alias.value;
                    }

                    graph.setNode(node.alias.value, {
                        label: label,
                        "class": type,
                        shape: shape,
                        style: "fill: " + color,
                        _interval: node._interval
                    });
                    graph.setParent(node.alias.value, this.scopeStack.join("/"));

                    if (this.previousItem) {

                        if (this.previousItem.type === "Identifier") {
                            graph.setEdge(this.previousItem.value, node.alias.value, this.getDefaultEdge());
                        } else if (this.previousItem.type === "BlockInstance") {
                            graph.setEdge(this.previousItem.alias.value, node.alias.value, this.getDefaultEdge());
                        } else if (this.previousItem.type === "BlockList") {
                            this.previousItem.list.forEach(function (item) {
                                if (item.type === "BlockInstance") {
                                    graph.setEdge(item.alias.value, node.alias.value, this.getDefaultEdge());
                                } else if (item.type === "Identifier") {
                                    graph.setEdge(item.value, node.alias.value, this.getDefaultEdge());
                                }
                            }, this);
                        }
                    }
                    break;
                case "BlockList":
                    node.list.forEach(function (item) {
                        this.walkAst(item, graph);
                    }, this);
                    break;
                case "Identifier":
                    var id = this.generateIdentifier(this.scopeStack, node, null);
                    if (!graph.hasNode(id)) {
                        console.warn("Unresolved identifier - ", id, node);
                        node.value = id;

                        graph.setNode(id, {
                            label: node.value,
                            rx: 5, ry: 5,
                            "class": "undefined"
                        });
                        graph.setParent(node.value, this.scopeStack.join("/"));
                    } else {
                        node.value = id;
                    }

                    if (this.previousItem) {

                        if (this.previousItem.type === "Identifier") {
                            graph.setEdge(this.previousItem.value, node.value, this.getDefaultEdge());
                        } else if (this.previousItem.type === "BlockInstance") {
                            graph.setEdge(this.previousItem.alias.value, node.value, this.getDefaultEdge());
                        } else if (this.previousItem.type === "BlockList") {
                            this.previousItem.list.forEach(function (item) {
                                if (item.type === "BlockInstance") {
                                    graph.setEdge(item.alias.value, node.value, this.getDefaultEdge());
                                } else if (item.type === "Identifier") {
                                    graph.setEdge(item.value, node.value, this.getDefaultEdge());
                                }
                            }, this);
                        }
                    }

                    break;
                case "BlockDefinition":
                    if (!this.blockDefinitions.includes(node.name)) {
                        this.blockDefinitions.push(node.name);
                    }
                    break;
                case "Scope":
                    console.log(node.type, node);

                    var previousScopeId = this.generateIdentifier(this.scopeStack, node, null);
                    this.scopeStack.push(node.name);
                    var scopeId = this.generateIdentifier(this.scopeStack, node, null);

                    graph.setNode(scopeId, {
                        label: node.name,
                        clusterLabelPos: 'top',
                        "class": "Scope"
                    });
                    graph.setParent(scopeId, previousScopeId);

                    if (node.body) {
                        this.walkAst(node.body, graph);
                    }

                    this.scopeStack.pop();
                    break;
                case "ScopeBody":
                    console.log(node.type, node);
                    if (node.definitions) {
                        node.definitions.forEach(function (definition) {
                            this.walkAst(definition, graph);
                        }, this);
                    } else {
                        console.info("Empty scope.");
                    }
                    break;
                default:
                    console.warn("Unrecognized Block", node);
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this = this;

            // console.log("rendering", this.props.ast);
            if (this.svg && this.props.ast) {
                var graph = this.generateGraph(this.props.ast);
                var svg = d3.select(this.svg);
                var group = d3.select(this.svgGroup);

                graph.graph().transition = function (selection) {
                    return selection.transition().duration(250);
                };

                graph.setGraph({
                    rankdir: 'BT',
                    edgesep: 20,
                    ranksep: 40,
                    nodeSep: 20,
                    marginx: 20,
                    marginy: 20
                });
                dagre.layout(graph);

                this.dagreRenderer(d3.select(this.svgGroup), graph);

                var nodes = group.selectAll("g.node");

                nodes.on("click", (function (d) {
                    var node = graph.node(d);
                    this.props.onHighlight({
                        startIdx: node._interval.startIdx,
                        endIdx: node._interval.endIdx
                    });
                }).bind(this));

                var graphWidth = graph.graph().width;
                var graphHeight = graph.graph().height;
                var width = this.svg.getBoundingClientRect().width;
                var height = this.svg.getBoundingClientRect().height;
                var zoomScale = Math.min(width / graphWidth, height / graphHeight);
                var translate = [width / 2 - graphWidth * zoomScale / 2, height / 2 - graphHeight * zoomScale / 2];

                //group.translate(translate);
                //group.scale(zoomScale);

                // center
                d3.select(this.svgGroup).transition().duration(250).attr("transform", "translate(" + translate + ")scale(" + zoomScale + ")");
            }

            var style = { flex: 1 };

            return React.createElement(
                "svg",
                { id: "vizualization", style: style, ref: function (ref) {
                        return _this.svg = ref;
                    } },
                React.createElement("g", { id: "group", ref: function (ref) {
                        return _this.svgGroup = ref;
                    } })
            );
        }
    }]);

    return Graph;
})(React.Component);
// import Hello from './Hello';

'use strict';

function run() {
  ReactDOM.render(React.createElement(Hello, { name: 'Moniel' }), document.getElementById('moniel'));
}

var loadedStates = ['complete', 'loaded', 'interactive'];

if (loadedStates.includes(document.readyState) && document.body) {
  run();
} else {
  window.addEventListener('DOMContentLoaded', run, false);
}
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Editor = (function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        _get(Object.getPrototypeOf(Editor.prototype), "constructor", this).call(this, props);
        this.onChange = this.onChange.bind(this);
        this.marker = null;
    }

    _createClass(Editor, [{
        key: "onChange",
        value: function onChange() {
            if (this.props.onChange) {
                var newValue = this.editor.getValue();
                this.props.onChange(newValue);
            }
        }
    }, {
        key: "init",
        value: function init(element) {
            this.container = element;
        }
    }, {
        key: "componentDidMount",
        value: function componentDidMount() {
            this.editor = ace.edit(this.container);
            this.editor.getSession().setMode("ace/mode/" + this.props.mode);
            this.editor.setTheme("ace/theme/" + this.props.theme);
            this.editor.setShowPrintMargin(false);
            this.editor.setOptions({
                enableBasicAutocompletion: true,
                enableSnippets: true,
                enableLiveAutocompletion: false,
                wrap: true,
                autoScrollEditorIntoView: true,
                fontFamily: "Fira  Code"
            });
            //showLineNumbers: false,
            //showGutter: false
            this.editor.$blockScrolling = Infinity;
            this.editor.on("change", this.onChange);
            if (this.props.defaultValue) {
                this.editor.setValue(this.props.defaultValue, -1);
            }
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var anno = nextProps.annotations;

            if (nextProps.annotations) {
                var position = this.editor.session.doc.indexToPosition(anno.position);
                var message = anno.message;

                this.editor.session.setAnnotations([{
                    row: position.row,
                    column: position.column,
                    text: message,
                    type: "error" // also warning and information
                }]);
                this.editor.execCommand("goToNextError");
            } else {
                this.editor.session.clearAnnotations();
                this.editor.execCommand("goToNextError");
            }

            if (nextProps.value) {
                this.editor.setValue(nextProps.value, -1);
            }

            if (nextProps.highlightRange) {
                this.editor.getSession().removeMarker(this.marker);
                //console.log("highlightRange", nextProps.highlightRange);
                var Range = require('ace/range').Range;
                var start = this.editor.session.doc.indexToPosition(nextProps.highlightRange.startIdx);
                var end = this.editor.session.doc.indexToPosition(nextProps.highlightRange.endIdx);
                var range = new Range(start.row, start.column, end.row, end.column);
                //console.log(range);
                this.marker = this.editor.getSession().addMarker(range, "highlight", "text");
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this = this;

            return React.createElement("div", {
                id: this.props.name,
                ref: function (element) {
                    return _this.init(element);
                }
            });
        }
    }]);

    return Editor;
})(React.Component);
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Hello = (function (_React$Component) {
	_inherits(Hello, _React$Component);

	function Hello(props) {
		_classCallCheck(this, Hello);

		_get(Object.getPrototypeOf(Hello.prototype), "constructor", this).call(this, props);
		this.state = {
			"grammar": grammar,
			"semantics": semantics,
			"networkDefinition": "",
			"ast": null,
			"annotations": null,
			"definitions": [],
			"highlightRange": {
				startIdx: 0,
				endIdx: 0
			}
		};
		this.updateNetworkDefinition = this.updateNetworkDefinition.bind(this);
		this.delayedUpdateNetworkDefinition = this.delayedUpdateNetworkDefinition.bind(this);
		this.onHighlight = this.onHighlight.bind(this);
		this.lock = null;
	}

	_createClass(Hello, [{
		key: "componentDidMount",
		value: function componentDidMount() {}
	}, {
		key: "delayedUpdateNetworkDefinition",
		value: function delayedUpdateNetworkDefinition(value) {
			var _this = this;

			if (this.lock) {
				clearTimeout(this.lock);
			}
			this.lock = setTimeout(function () {
				_this.updateNetworkDefinition(value);
			}, 250);
		}
	}, {
		key: "updateNetworkDefinition",
		value: function updateNetworkDefinition(value) {
			console.log("update");
			var result = compileToAST(this.state.grammar, this.state.semantics, value);
			if (result.ast) {
				this.setState({
					ast: result.ast,
					annotations: null
				});
			} else {
				this.setState({
					ast: null,
					annotations: {
						position: result.position,
						message: "Expected " + result.expected + "."
					}
				});
			}
		}
	}, {
		key: "onHighlight",
		value: function onHighlight(range) {
			this.setState({
				highlightRange: range
			});
		}
	}, {
		key: "render",
		value: function render() {
			var style = {
				position: "absolute",
				display: "flex",
				flexDirection: "row",
				bottom: 0,
				top: 0,
				left: 0,
				right: 0
			};
			return React.createElement(
				"div",
				{ style: style },
				React.createElement(
					Panel,
					{ title: "Definition" },
					React.createElement(Editor, {
						name: "network",
						mode: "moniel",
						theme: "monokai",
						annotations: this.state.annotations,
						onChange: this.delayedUpdateNetworkDefinition,
						defaultValue: "In -> conv1:C -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out  conv1 -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out",
						highlightRange: this.state.highlightRange
					})
				),
				React.createElement(
					Panel,
					{ title: "Schema" },
					React.createElement(Graph, { ast: this.state.ast, onHighlight: this.onHighlight })
				)
			);
		}
	}]);

	return Hello;
})(React.Component);

/*
<Panel title="AST">
<Editor
	name="ast"
	mode="json"
	theme="monokai"
	value={JSON.stringify(this.state.ast, null, 2)}
/>
</Panel>
*/
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Panel = (function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel() {
    _classCallCheck(this, Panel);

    _get(Object.getPrototypeOf(Panel.prototype), "constructor", this).apply(this, arguments);
  }

  _createClass(Panel, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { className: "panel" },
        React.createElement(
          "div",
          { className: "header" },
          this.props.title
        ),
        this.props.children
      );
    }
  }]);

  return Panel;
})(React.Component);

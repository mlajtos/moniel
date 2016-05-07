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

        this.graph = new dagreD3.graphlib.Graph().setGraph({}).setDefaultEdgeLabel(function () {
            return {};
        });

        this.dagreRenderer = new dagreD3.render();

        this.walkAst = this.walkAst.bind(this);
        var customHash = function customHash(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i) % 47;
            }
            return hash;
        };

        var customHash = function customHash(str) {
            var hash = 11;
            for (var i = 0; i < str.length; i++) {
                hash = hash * 47 + str.charCodeAt(i) % 32;
            }
            return hash;
        };
        this.colorHash = new ColorHash({ saturation: [0.9], lightness: [0.45], hash: customHash });
        this.lineInterpolate = "basis";
    }

    _createClass(Graph, [{
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
            var graph = new dagreD3.graphlib.Graph().setGraph({}).setDefaultEdgeLabel(function () {
                return {};
            });

            this.nodeCounter = {};
            this.previousItem = null;

            this.blockDefinitions = ["Input", "KatarinaLajtosova", "Output", "Convolution", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Summation", "Dropout"];
            extractDefinitionsFromAST(this.ast, this.blockDefinitions);

            this.walkAst(this.ast, graph);

            return graph;
        }
    }, {
        key: "generateIdentifier",
        value: function generateIdentifier(blockName) {
            if (this.nodeCounter.hasOwnProperty(blockName)) {
                this.nodeCounter[blockName] += 1;
            } else {
                this.nodeCounter[blockName] = 1;
            }
            return blockName + this.nodeCounter[blockName];
        }
    }, {
        key: "walkAst",
        value: function walkAst(node, graph) {
            if (!node) {
                return;
            }
            switch (node.type) {
                case "Network":
                    // node.definitions.map(definition => console.log(definition, graph));
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
                    var type, label, shape;

                    if (block.length === 0) {
                        type = "undefined";
                        label = node.name;
                        shape = "rect";
                        // annotate source -> unrecognized block type
                    } else if (block.length === 1) {
                            type = block[0];
                            label = block[0];
                            shape = "rect";
                        } else {
                            type = "ambiguous";
                            label = node.name;
                            shape = "diamond";
                            // annotate source -> ambiguous block name, show possible matches
                        }

                    if (!node.alias) {
                        node.alias = {
                            "type": "Identifier",
                            "value": this.generateIdentifier(label),
                            "autogenerated": true
                        };
                    }

                    var color = this.colorHash.hex(label);

                    graph.setNode(node.alias.value, { label: label, rx: 5, ry: 5, "class": type, shape: shape, labelStyle: "fill: white", style: "fill: " + color });

                    if (this.previousItem) {

                        if (this.previousItem.type === "Identifier") {
                            graph.setEdge(this.previousItem.value, node.alias.value, { lineInterpolate: this.lineInterpolate });
                        } else if (this.previousItem.type === "BlockInstance") {
                            graph.setEdge(this.previousItem.alias.value, node.alias.value, { lineInterpolate: this.lineInterpolate });
                        } else if (this.previousItem.type === "BlockList") {
                            this.previousItem.list.forEach(function (item) {
                                if (item.type === "BlockInstance") {
                                    graph.setEdge(item.alias.value, node.alias.value, { lineInterpolate: this.lineInterpolate });
                                } else if (item.type === "Identifier") {
                                    graph.setEdge(item.value, node.alias.value, { lineInterpolate: this.lineInterpolate });
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
                    //

                    if (!graph.hasNode(node.value)) {
                        console.warn("Unresolved identifier - ", node.value);
                        var color = this.colorHash.hex(node.value);

                        graph.setNode(node.value, { label: node.value, "class": "type-identifier", style: "fill: " + color });
                    }

                    if (this.previousItem) {

                        if (this.previousItem.type === "Identifier") {
                            graph.setEdge(this.previousItem.value, node.value, { lineInterpolate: this.lineInterpolate });
                        } else if (this.previousItem.type === "BlockInstance") {
                            graph.setEdge(this.previousItem.alias.value, node.value, { lineInterpolate: this.lineInterpolate });
                        } else if (this.previousItem.type === "BlockList") {
                            this.previousItem.list.forEach(function (item) {
                                if (item.type === "BlockInstance") {
                                    graph.setEdge(item.alias.value, node.value, { lineInterpolate: this.lineInterpolate });
                                } else if (item.type === "Identifier") {
                                    graph.setEdge(item.value, node.value, { lineInterpolate: this.lineInterpolate });
                                }
                            }, this);
                        }
                    }

                    break;
                case "BlockDefinition":
                    console.log(node);
                    if (!this.blockDefinitions.includes(node.name)) {
                        this.blockDefinitions.push(node.name);
                    }
                    break;
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
                    return selection.transition().duration(500);
                };

                this.dagreRenderer(d3.select(this.svgGroup), graph);

                group.selectAll("g.node").on("mouseover", function (d) {
                    console.log(d);
                });

                var graphWidth = graph.graph().width + 20;
                var graphHeight = graph.graph().height + 20;
                var width = this.svg.getBoundingClientRect().width;
                var height = this.svg.getBoundingClientRect().height;
                var zoomScale = Math.min(width / graphWidth, height / graphHeight);
                var translate = [width / 2 - graphWidth * zoomScale / 2, height / 2 - graphHeight * zoomScale / 2];

                //group.translate(translate);
                //group.scale(zoomScale);

                // center
                d3.select(this.svgGroup).transition().duration(250).attr("transform", "translate(" + translate + ")scale(" + zoomScale + ")");
            }

            var style = { flex: 1, margin: "1em" };

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
                wrap: true,
                autoScrollEditorIntoView: true
            });
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
			"definitions": []
		};
		this.updateNetworkDefinition = this.updateNetworkDefinition.bind(this);
		this.delayedUpdateNetworkDefinition = this.delayedUpdateNetworkDefinition.bind(this);
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
						defaultValue: "In -> conv1:C -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out  conv1 -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out"
					})
				),
				React.createElement(
					Panel,
					{ title: "Schema" },
					React.createElement(Graph, { ast: this.state.ast })
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

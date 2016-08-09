"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComputationalGraph = (function () {
	function ComputationalGraph() {
		_classCallCheck(this, ComputationalGraph);

		this.initialize();
	}

	_createClass(ComputationalGraph, [{
		key: "initialize",
		value: function initialize() {
			this.graph = new dagreD3.graphlib.Graph({
				compound: true
			});
			this.graph.setGraph({});

			this.nodeCounter = {};

			this.nodeStack = [];
			this.previousNodeStack = [];

			this.scopeStack = new ScopeStack();
			this.scopeStack.initialize();

			this.defaultEdge = {
				arrowhead: "vee",
				lineInterpolate: "basis"
			};
		}
	}, {
		key: "enterScope",
		value: function enterScope(name) {
			var previousScopeId = this.scopeStack.currentScopeIdentifier();
			this.scopeStack.push(name);
			var currentScopeId = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(currentScopeId, {
				label: name,
				clusterLabelPos: "top",
				"class": "Scope"
			});

			this.graph.setParent(currentScopeId, previousScopeId);
		}
	}, {
		key: "exitScope",
		value: function exitScope() {
			this.scopeStack.pop();
		}
	}, {
		key: "generateInstanceId",
		value: function generateInstanceId(scope, type) {
			var typedId = [].concat(_toConsumableArray(scope), [type]).join("/");

			if (!this.nodeCounter.hasOwnProperty(typedId)) {
				this.nodeCounter[typedId] = 0;
			}

			this.nodeCounter[typedId] += 1;

			return [].concat(_toConsumableArray(scope), [type]).join("/") + this.nodeCounter[typedId];
		}
	}, {
		key: "addMain",
		value: function addMain() {
			var id = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(id, {
				"class": "Network"
			});
		}
	}, {
		key: "touchNode",
		value: function touchNode(id) {
			var _this = this;

			this.nodeStack.push(id);
			this.previousNodeStack.forEach(function (from) {
				return _this.setEdge(from, id);
			});
		}
	}, {
		key: "setNode",
		value: function setNode(id, node) {
			this.touchNode(id);
			this.setParent(id, this.scopeStack.currentScopeIdentifier());
			return this.graph.setNode(id, node);
		}
	}, {
		key: "clearNodeStack",
		value: function clearNodeStack() {
			this.previousNodeStack = [];
			this.nodeStack = [];
		}
	}, {
		key: "freezeNodeStack",
		value: function freezeNodeStack() {
			console.log("Freezing node stack. Content: " + JSON.stringify(this.nodeStack));
			this.previousNodeStack = [].concat(_toConsumableArray(this.nodeStack));
			this.nodeStack = [];
		}
	}, {
		key: "setParent",
		value: function setParent(node1, node2) {
			return this.graph.setParent(node1, node2);
		}
	}, {
		key: "setEdge",
		value: function setEdge(from, to) {
			console.log("Creating edge from \"" + from + "\" to \"" + to + "\".");
			this.graph.setEdge(from, to, _extends({}, this.defaultEdge));
		}
	}, {
		key: "hasNode",
		value: function hasNode(id) {
			return this.graph.hasNode(id);
		}
	}, {
		key: "getGraph",
		value: function getGraph() {
			return this.graph;
		}
	}, {
		key: "graph",
		value: function graph() {
			return this.graph;
		}
	}]);

	return ComputationalGraph;
})();
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
        this.moniel = new Moniel();
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
            this.moniel.walkAst(this.ast);
            return this.moniel.getComputationalGraph();
        }
    }, {
        key: "render",
        value: function render() {
            var _this = this;

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
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Moniel = (function () {
	function Moniel() {
		_classCallCheck(this, Moniel);

		this.definitions = [];
		this.graph = new ComputationalGraph();
		this.initialize();
	}

	_createClass(Moniel, [{
		key: "initialize",
		value: function initialize() {
			this.definitions = [];
			this.graph.initialize();
			this.addDefaultDefinitions();
		}
	}, {
		key: "addDefaultDefinitions",
		value: function addDefaultDefinitions() {
			var _this = this;

			console.info("Adding default definitions.");
			var defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy"];
			defaultDefinitions.forEach(function (definition) {
				return _this.addDefinition(definition);
			});
		}
	}, {
		key: "addDefinition",
		value: function addDefinition(definition) {
			this.definitions.push(definition);
		}
	}, {
		key: "generateBlockIdentifier",
		value: function generateBlockIdentifier(identifier) {
			return [].concat(_toConsumableArray(this.graph.scopeStack.current()), [identifier]).join("/");
		}
	}, {
		key: "handleScopeDefinition",
		value: function handleScopeDefinition(scope) {
			this.graph.enterScope(scope.name);
			if (scope.body) {
				this.walkAst(scope.body);
			}
			this.graph.exitScope();
		}
	}, {
		key: "handleScopeBody",
		value: function handleScopeBody(scopeBody) {
			var _this2 = this;

			if (scopeBody.definitions) {
				scopeBody.definitions.forEach(function (definition) {
					return _this2.walkAst(definition);
				});
			} else {
				var scopeId = this.graph.scopeStack.generateCurrentScopeIdentifier();
				console.warn("Scope \"" + scopeId + "\" has no definitions, i.e. empty scope.");
			}
		}
	}, {
		key: "handleBlockDefinition",
		value: function handleBlockDefinition(blockDefinition) {
			console.info("Adding \"" + blockDefinition.name + "\" to available definitions.");
			this.addDefinition(blockDefinition.name);
		}
	}, {
		key: "handleUnrecognizedNode",
		value: function handleUnrecognizedNode(node) {
			console.warn("What to do with this AST node?", node);
		}
	}, {
		key: "handleNetworkDefinition",
		value: function handleNetworkDefinition(network) {
			var _this3 = this;

			this.initialize();
			this.graph.addMain();
			network.definitions.forEach(function (definition) {
				return _this3.walkAst(definition);
			});
		}
	}, {
		key: "handleConnectionDefinition",
		value: function handleConnectionDefinition(connection) {
			var _this4 = this;

			this.graph.clearNodeStack();
			connection.list.forEach(function (item) {
				_this4.graph.freezeNodeStack();
				_this4.walkAst(item);
			});
		}
	}, {
		key: "handleBlockInstance",
		value: function handleBlockInstance(instance) {
			var id = undefined;
			var label = "undeclared";
			var type = "Unknown";
			var shape = "rect";
			var color = "yellow";

			var possibleTypes = this.getTypeOfInstance(instance);

			if (possibleTypes.length === 0) {
				type = "undefined";
				label = instance.name;
				shape = "rect";
				console.warn("Unrecognized type of block instance. No possible matches found.");
			} else if (possibleTypes.length === 1) {
				type = possibleTypes[0];
				label = type;
				color = colorHash.hex(label);
			} else {
				type = "ambiguous";
				label = instance.name;
				shape = "diamond";
				console.warn("Unrecognized type of block instance. Possible matches: " + possibleTypes.join(", ") + ".");
			}

			if (!instance.alias) {
				id = this.graph.generateInstanceId(this.graph.scopeStack, type);
			} else {
				id = [].concat(_toConsumableArray(this.graph.scopeStack.current()), [instance.alias.value]).join("/");
			}

			this.graph.setNode(id, {
				label: label,
				"class": type,
				shape: shape,
				style: "fill: " + color
			});
		}
	}, {
		key: "handleBlockList",
		value: function handleBlockList(list) {
			var _this5 = this;

			list.list.forEach(function (item) {
				return _this5.walkAst(item);
			});
		}
	}, {
		key: "handleIdentifier",
		value: function handleIdentifier(identifier) {
			var id = this.generateBlockIdentifier(identifier.value);

			if (!this.graph.hasNode(id)) {
				console.warn("Forward use of undeclared instance \"" + identifier.value + "\"");

				this.graph.setNode(id, {
					label: identifier.value,
					"class": "undefined"
				});
			} else {
				this.graph.touchNode(id);
			}
		}
	}, {
		key: "getComputationalGraph",
		value: function getComputationalGraph() {
			console.log(this.graph.getGraph());
			return this.graph.getGraph();
		}
	}, {
		key: "getTypeOfInstance",
		value: function getTypeOfInstance(instance) {
			console.info("Trying to match \"" + instance.name + "\" against block definitions.");
			return Moniel.nameResolution(instance.name, this.definitions);
		}
	}, {
		key: "walkAst",
		// got to the end?
		value: function walkAst(node) {
			if (!node) {
				console.error("No node?!");return;
			}

			switch (node.type) {
				case "Network":
					this.handleNetworkDefinition(node);break;
				case "Connection":
					this.handleConnectionDefinition(node);break;
				case "BlockInstance":
					this.handleBlockInstance(node);break;
				case "BlockDefinition":
					this.handleBlockDefinition(node);break;
				case "BlockList":
					this.handleBlockList(node);break;
				case "Identifier":
					this.handleIdentifier(node);break;
				case "Scope":
					this.handleScopeDefinition(node);break;
				case "ScopeBody":
					this.handleScopeBody(node);break;
				default:
					this.handleUnrecognizedNode(node);
			}
		}
	}], [{
		key: "nameResolution",
		value: function nameResolution(partial, list) {
			var partialArray = partial.split(/(?=[A-Z])/);
			var listArray = list.map(function (definition) {
				return definition.split(/(?=[A-Z])/);
			});
			var result = listArray.filter(function (possibleMatch) {
				return Moniel.isMultiPrefix(partialArray, possibleMatch);
			});
			result = result.map(function (item) {
				return item.join("");
			});
			return result;
		}
	}, {
		key: "isMultiPrefix",
		value: function isMultiPrefix(name, target) {
			if (name.length !== target.length) {
				return false;
			}
			var i = 0;
			while (i < name.length && target[i].startsWith(name[i])) {
				i += 1;
			}
			return i === name.length;
		}
	}]);

	return Moniel;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeStack = (function () {
	function ScopeStack() {
		var scope = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

		_classCallCheck(this, ScopeStack);

		if (Array.isArray(scope)) {
			this.scopeStack = scope;
		} else {
			console.error("Invalid initialization of scope stack.", scope);
		}
	}

	_createClass(ScopeStack, [{
		key: "push",
		value: function push(scope) {
			console.info("Scope \"" + scope + "\" pushed to scope stack.");
			this.scopeStack.push(scope);
		}
	}, {
		key: "pop",
		value: function pop() {
			var scope = this.scopeStack.pop();
			console.info("Scope \"" + scope + "\" popped from scope stack.");
			return scope;
		}
	}, {
		key: "clear",
		value: function clear() {
			this.scopeStack = [];
		}
	}, {
		key: "initialize",
		value: function initialize() {
			this.clear();
			this.push(".");
		}
	}, {
		key: "currentScopeIdentifier",
		value: function currentScopeIdentifier() {
			return this.scopeStack.join("/");
		}
	}, {
		key: "toString",
		value: function toString() {
			return this.scopeStack.join("/");
		}
	}, {
		key: "generateCurrentScopeIdentifier",
		value: function generateCurrentScopeIdentifier() {
			return this.scopeStack.join("/");
		}
	}, {
		key: "current",
		value: function current() {
			return Array.from(this.scopeStack);
		}
	}, {
		key: "toString",
		value: function toString() {
			return this.scopeStack.join("/");
		}
	}]);

	return ScopeStack;
})();
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Test = (function () {
	function Test(actualValue, targetValue) {
		var name = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];

		_classCallCheck(this, Test);

		this.name = name;
		this.test(actualValue, targetValue);
	}

	_createClass(Test, [{
		key: "test",
		value: function test(actualValue, targetValue) {
			if (actualValue === targetValue) {
				// pass
			} else {
					console.error("Test Failed: \"" + actualValue + "\" should be \"" + targetValue + "\"");
				}
		}
	}]);

	return Test;
})();
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

			var model = "/conv1{\n    in:Input(shape=28x28)\n    \n    filters:Tensor(shape=10x3x3)\n    biases:Tensor(shape=10x1)\n    \n    [in,filters] -> conv:Convolution\n    [conv, biases] -> BiasAdd -> ReLU -> out\n    \n    out:Output\n}\n\n/conv2{\n    in:Input(shape=28x28)\n    \n    filters:Tensor(shape=10x3x3)\n    biases:Tensor(shape=10x1)\n    \n    [in,filters] -> conv:Convolution\n    [conv, biases] -> BiasAdd -> ReLU -> out\n    \n    out:Output\n}\n\nimage:Input -> conv1/in\nconv1/out -> conv2/in\nconv2/out -> Out";
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
						/*defaultValue="In -> conv1:C -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out  conv1 -> ReLU -> C -> [ReLU,Id] -> [C,C,C] -> out:Out"*/
						defaultValue: model,
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

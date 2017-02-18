"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComputationalGraph = function () {
	_createClass(ComputationalGraph, [{
		key: "graph",
		get: function get() {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			return this.metanodes[lastIndex];
		}
	}]);

	function ComputationalGraph(parent) {
		_classCallCheck(this, ComputationalGraph);

		this.defaultEdge = {};
		this.nodeCounter = {};
		this.nodeStack = [];
		this.previousNodeStack = [];
		this.scopeStack = new ScopeStack();
		this.metanodes = {};
		this.metanodeStack = [];

		this.initialize();
		this.moniel = parent;
	}

	_createClass(ComputationalGraph, [{
		key: "initialize",
		value: function initialize() {
			this.nodeCounter = {};
			this.scopeStack.initialize();

			this.metanodes = {};
			this.metanodeStack = [];

			this.addMain();
		}
	}, {
		key: "enterScope",
		value: function enterScope(scope) {
			this.scopeStack.push(scope.name.value);
			var currentScopeId = this.scopeStack.currentScopeIdentifier();
			var previousScopeId = this.scopeStack.previousScopeIdentifier();

			this.graph.setNode(currentScopeId, {
				userGeneratedId: scope.name.value,
				class: "Metanode",
				isMetanode: true,
				_source: scope.name._source
			});

			this.graph.setParent(currentScopeId, previousScopeId);
		}
	}, {
		key: "exitScope",
		value: function exitScope() {
			this.scopeStack.pop();
		}
	}, {
		key: "enterMetanodeScope",
		value: function enterMetanodeScope(name) {
			this.metanodes[name] = new graphlib.Graph({
				compound: true
			});
			this.metanodes[name].setGraph({
				name: name,
				rankdir: 'BT',
				edgesep: 20,
				ranksep: 40,
				nodeSep: 30,
				marginx: 20,
				marginy: 20
			});
			this.metanodeStack.push(name);

			return this.metanodes[name];
		}
	}, {
		key: "exitMetanodeScope",
		value: function exitMetanodeScope() {
			return this.metanodeStack.pop();
		}
	}, {
		key: "generateInstanceId",
		value: function generateInstanceId(type) {
			if (!this.nodeCounter.hasOwnProperty(type)) {
				this.nodeCounter[type] = 0;
			}
			this.nodeCounter[type] += 1;
			var id = "a_" + type + this.nodeCounter[type];
			return id;
		}
	}, {
		key: "addMain",
		value: function addMain() {
			this.enterMetanodeScope("main");
			this.scopeStack.push(".");
			var id = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(id, {
				class: ""
			});
		}
	}, {
		key: "touchNode",
		value: function touchNode(nodePath) {
			var _this = this;

			if (this.graph.hasNode(nodePath)) {
				this.nodeStack.push(nodePath);
				this.previousNodeStack.forEach(function (fromPath) {
					_this.setEdge(fromPath, nodePath);
				});
			} else {
				console.warn("Trying to touch non-existant node \"" + nodePath + "\"");
			}
		}
	}, {
		key: "referenceNode",
		value: function referenceNode(id) {
			this.scopeStack.push(id);
			var nodePath = this.scopeStack.currentScopeIdentifier();
			var scope = this.scopeStack.previousScopeIdentifier();

			var node = {
				userGeneratedId: id,
				class: "undefined",
				height: 50
			};

			if (!this.graph.hasNode(nodePath)) {
				this.graph.setNode(nodePath, _extends({}, node, {
					width: Math.max(node.class.length, node.userGeneratedId ? node.userGeneratedId.length : 0) * 10
				}));
				this.setParent(nodePath, scope);
			}

			this.touchNode(nodePath);
			this.scopeStack.pop();
		}
	}, {
		key: "createNode",
		value: function createNode(id, node) {
			this.scopeStack.push(id);
			var nodePath = this.scopeStack.currentScopeIdentifier();
			var scope = this.scopeStack.previousScopeIdentifier();

			if (this.graph.hasNode(nodePath)) {
				console.warn("Redifining node \"" + id + "\"");
			}

			this.graph.setNode(nodePath, _extends({}, node, {
				id: nodePath
			}));
			this.setParent(nodePath, scope);

			this.touchNode(nodePath);
			this.scopeStack.pop();

			return nodePath;
		}
	}, {
		key: "createMetanode",
		value: function createMetanode(identifier, metanodeClass, node) {
			var _this2 = this;

			this.scopeStack.push(identifier);
			var nodePath = this.scopeStack.currentScopeIdentifier();
			var scope = this.scopeStack.previousScopeIdentifier();

			this.graph.setNode(nodePath, _extends({}, node, {
				id: nodePath,
				isMetanode: true
			}));

			this.graph.setParent(nodePath, scope);

			var targetMetanode = this.metanodes[metanodeClass];
			targetMetanode.nodes().forEach(function (nodeId) {
				var node = targetMetanode.node(nodeId);
				if (!node) {
					return;
				}
				var newNodeId = nodeId.replace(".", nodePath);
				var newNode = _extends({}, node, {
					id: newNodeId
				});
				_this2.graph.setNode(newNodeId, newNode);

				var newParent = targetMetanode.parent(nodeId).replace(".", nodePath);
				_this2.graph.setParent(newNodeId, newParent);
			});

			targetMetanode.edges().forEach(function (edge) {
				_this2.graph.setEdge(edge.v.replace(".", nodePath), edge.w.replace(".", nodePath), targetMetanode.edge(edge));
			});

			this.scopeStack.pop();

			this.touchNode(nodePath);
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
			// console.log(`Freezing node stack. Content: ${JSON.stringify(this.nodeStack)}`);
			this.previousNodeStack = [].concat(_toConsumableArray(this.nodeStack));
			this.nodeStack = [];
		}
	}, {
		key: "setParent",
		value: function setParent(childPath, parentPath) {
			return this.graph.setParent(childPath, parentPath);
		}
	}, {
		key: "isInput",
		value: function isInput(nodePath) {
			return this.graph.node(nodePath).class === "Input";
		}
	}, {
		key: "isOutput",
		value: function isOutput(nodePath) {
			return this.graph.node(nodePath).class === "Output";
		}
	}, {
		key: "isMetanode",
		value: function isMetanode(nodePath) {
			return this.graph.node(nodePath).isMetanode === true;
		}
	}, {
		key: "getOutputNode",
		value: function getOutputNode(scopePath) {
			var _this3 = this;

			var scope = this.graph.node(scopePath);
			var outs = this.graph.children(scopePath).filter(function (node) {
				return _this3.isOutput(node);
			});
			if (outs.length === 1) {
				return outs[0];
			} else if (outs.length === 0) {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.id + "\" doesn't have any Output node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			} else {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.id + "\" has more than one Output node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			}
		}
	}, {
		key: "getInputNode",
		value: function getInputNode(scopePath) {
			var _this4 = this;

			var scope = this.graph.node(scopePath);
			var ins = this.graph.children(scopePath).filter(function (node) {
				return _this4.isInput(node);
			});
			if (ins.length === 1) {
				return ins[0];
			} else if (ins.length === 0) {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.id + "\" doesn't have any Input node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			} else {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.id + "\" has more than one Input node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			}
		}
	}, {
		key: "setEdge",
		value: function setEdge(fromPath, toPath) {
			// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)

			if (this.isMetanode(fromPath)) {
				fromPath = this.getOutputNode(fromPath);
			}

			if (this.isMetanode(toPath)) {
				toPath = this.getInputNode(toPath);
			}

			if (fromPath && toPath) {
				this.graph.setEdge(fromPath, toPath, _extends({}, this.defaultEdge));
			}
		}
	}, {
		key: "hasNode",
		value: function hasNode(nodePath) {
			return this.graph.hasNode(nodePath);
		}
	}, {
		key: "getGraph",
		value: function getGraph() {
			return this.graph;
		}
	}]);

	return ComputationalGraph;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Editor = function (_React$Component) {
    _inherits(Editor, _React$Component);

    function Editor(props) {
        _classCallCheck(this, Editor);

        var _this = _possibleConstructorReturn(this, (Editor.__proto__ || Object.getPrototypeOf(Editor)).call(this, props));

        _this.onChange = _this.onChange.bind(_this);
        _this.marker = null;
        _this.markers = [];
        return _this;
    }

    _createClass(Editor, [{
        key: "onChange",
        value: function onChange() {
            this.removeMarkers();

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
        key: "setValue",
        value: function setValue(value) {
            this.editor.setValue(value, -1);
        }
    }, {
        key: "removeMarkers",
        value: function removeMarkers() {
            var _this2 = this;

            this.markers.map(function (marker) {
                return _this2.editor.session.removeMarker(marker);
            });
            this.markers = [];
        }
    }, {
        key: "onCursorPositionChanged",
        value: function onCursorPositionChanged(event, selection) {
            var m = this.editor.session.getMarkers();
            var c = selection.getCursor();
            var markers = this.markers.map(function (id) {
                return m[id];
            });
            var cursorOverMarker = markers.map(function (marker) {
                return marker.range.inside(c.row, c.column);
            }).reduce(function (prev, curr) {
                return prev || curr;
            }, false);

            if (cursorOverMarker) {
                this.editor.execCommand("goToNextError");
            }
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
                fontFamily: "Fira  Code",
                showLineNumbers: true,
                showGutter: true
            });
            this.editor.$blockScrolling = Infinity;
            this.editor.container.style.lineHeight = 1.7;

            if (this.props.defaultValue) {
                this.editor.setValue(this.props.defaultValue, -1);
            }

            this.editor.on("change", this.onChange);
            this.editor.selection.on("changeCursor", this.onCursorPositionChanged.bind(this));
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var _this3 = this;

            if (nextProps.issues) {
                var annotations = nextProps.issues.map(function (issue) {
                    var position = _this3.editor.session.doc.indexToPosition(issue.position.start);
                    return {
                        row: position.row,
                        column: position.column,
                        text: issue.message,
                        type: issue.type
                    };
                });

                this.editor.session.setAnnotations(annotations);
                //this.editor.execCommand("goToNextError");

                var Range = require('ace/range').Range;

                this.removeMarkers();

                var markers = nextProps.issues.map(function (issue) {
                    var position = {
                        start: _this3.editor.session.doc.indexToPosition(issue.position.start),
                        end: _this3.editor.session.doc.indexToPosition(issue.position.end)
                    };

                    var range = new Range(position.start.row, position.start.column, position.end.row, position.end.column);

                    _this3.markers.push(_this3.editor.session.addMarker(range, "marker_error", "text"));
                });
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
            var _this4 = this;

            return React.createElement("div", { ref: function ref(element) {
                    return _this4.init(element);
                } });
        }
    }]);

    return Editor;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GraphLayout = function () {
  function GraphLayout() {
    _classCallCheck(this, GraphLayout);

    this.worker = new Worker("src/scripts/GraphLayoutWorker.js");

    this.callback = function () {};

    this.worker.addEventListener("message", this.receive.bind(this));
  }

  _createClass(GraphLayout, [{
    key: "encode",
    value: function encode(graph) {
      return JSON.stringify(graphlib.json.write(graph));
    }
  }, {
    key: "decode",
    value: function decode(json) {
      return graphlib.json.read(JSON.parse(json));
    }
  }, {
    key: "layout",
    value: function layout(graph, callback) {
      //console.log("GraphLayout.layout", graph, callback);
      this.callback = callback;
      this.worker.postMessage({
        graph: this.encode(graph)
      });
    }
  }, {
    key: "receive",
    value: function receive(data) {
      var graph = this.decode(data.data.graph);
      this.callback(graph);
    }
  }]);

  return GraphLayout;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IDE = function (_React$Component) {
	_inherits(IDE, _React$Component);

	function IDE(props) {
		_classCallCheck(this, IDE);

		var _this = _possibleConstructorReturn(this, (IDE.__proto__ || Object.getPrototypeOf(IDE)).call(this, props));

		_this.moniel = new Moniel();
		_this.lock = null;


		_this.state = {
			"grammar": grammar,
			"semantics": semantics,
			"networkDefinition": "",
			"ast": null,
			"issues": null
		};
		_this.updateNetworkDefinition = _this.updateNetworkDefinition.bind(_this);
		_this.delayedUpdateNetworkDefinition = _this.delayedUpdateNetworkDefinition.bind(_this);
		return _this;
	}

	_createClass(IDE, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			this.loadExample("ConvolutionalLayer");
		}
	}, {
		key: "delayedUpdateNetworkDefinition",
		value: function delayedUpdateNetworkDefinition(value) {
			var _this2 = this;

			if (this.lock) {
				clearTimeout(this.lock);
			}
			this.lock = setTimeout(function () {
				_this2.updateNetworkDefinition(value);
			}, 100);
		}
	}, {
		key: "updateNetworkDefinition",
		value: function updateNetworkDefinition(value) {
			console.time("updateNetworkDefinition");
			var result = this.compileToAST(this.state.grammar, this.state.semantics, value);
			if (result.ast) {
				this.moniel.walkAst(result.ast);
				var graph = this.moniel.getComputationalGraph();
				this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					issues: this.moniel.getIssues()
				});
			} else {
				// console.error(result);
				this.setState({
					networkDefinition: value,
					ast: null,
					graph: null,
					issues: [{
						position: {
							start: result.position - 1,
							end: result.position
						},
						message: "Expected " + result.expected + ".",
						type: "error"
					}]
				});
			}
			console.timeEnd("updateNetworkDefinition");
		}
	}, {
		key: "loadExample",
		value: function loadExample(id) {
			var callback = function callback(value) {
				this.editor.setValue(value);
				this.setState({
					networkDefinition: value
				});
			};

			$.ajax({
				url: "./examples/" + id + ".mon",
				data: null,
				success: callback.bind(this),
				dataType: "text"
			});
		}

		// into Moniel? or Parser

	}, {
		key: "compileToAST",
		value: function compileToAST(grammar, semantics, source) {
			var result = grammar.match(source);

			if (result.succeeded()) {
				var ast = semantics(result).eval();
				return {
					"ast": ast
				};
			} else {
				// console.error(result);
				var expected = result.getExpectedText();
				var position = result.getRightmostFailurePosition();
				return {
					"expected": expected,
					"position": position
				};
			}
		}
	}, {
		key: "render",
		value: function render() {
			var _this3 = this;

			return React.createElement(
				"div",
				{ id: "container" },
				React.createElement(
					Panel,
					{ id: "definition" },
					React.createElement(Editor, {
						ref: function ref(_ref) {
							return _this3.editor = _ref;
						},
						mode: "moniel",
						theme: "monokai",
						issues: this.state.issues,
						onChange: this.delayedUpdateNetworkDefinition,
						defaultValue: this.state.networkDefinition,
						highlightRange: this.state.highlightRange
					})
				),
				React.createElement(
					Panel,
					{ id: "visualization" },
					React.createElement(VisualGraph, { graph: this.state.graph })
				)
			);
		}
	}]);

	return IDE;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Logger = function () {
	function Logger() {
		_classCallCheck(this, Logger);

		this.issues = [];
	}

	_createClass(Logger, [{
		key: "clear",
		value: function clear() {
			this.issues = [];
		}
	}, {
		key: "getIssues",
		value: function getIssues() {
			return this.issues;
		}
	}, {
		key: "addIssue",
		value: function addIssue(issue) {
			var f = null;
			switch (issue.type) {
				case "error":
					f = console.error;break;
				case "warning":
					f = console.warn;break;
				case "info":
					f = console.info;break;
				default:
					f = console.log;break;
			}
			f(issue.message);
			this.issues.push(issue);
		}
	}]);

	return Logger;
}();
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Moniel = function () {
	function Moniel() {
		_classCallCheck(this, Moniel);

		this.logger = new Logger();
		this.graph = new ComputationalGraph(this);
		this.definitions = {};

		this.initialize();
	}

	_createClass(Moniel, [{
		key: "initialize",
		value: function initialize() {
			this.graph.initialize();
			this.logger.clear();

			this.definitions = [];
			this.addDefaultDefinitions();
		}
	}, {
		key: "addDefaultDefinitions",
		value: function addDefaultDefinitions() {
			var _this = this;

			// console.info(`Adding default definitions.`);
			var defaultDefinitions = ["Add", "Linear", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
			defaultDefinitions.forEach(function (definition) {
				return _this.addDefinition(definition);
			});
		}
	}, {
		key: "addDefinition",
		value: function addDefinition(definitionName) {
			this.definitions[definitionName] = {
				name: definitionName,
				color: colorHash.hex(definitionName)
			};
		}
	}, {
		key: "handleScopeDefinition",
		value: function handleScopeDefinition(scope) {
			this.graph.enterScope(scope);
			this.walkAst(scope.body);
			this.graph.exitScope();
		}
	}, {
		key: "handleScopeDefinitionBody",
		value: function handleScopeDefinitionBody(scopeBody) {
			var _this2 = this;

			scopeBody.definitions.forEach(function (definition) {
				return _this2.walkAst(definition);
			});
		}
	}, {
		key: "handleBlockDefinition",
		value: function handleBlockDefinition(blockDefinition) {
			// console.info(`Adding "${blockDefinition.name}" to available definitions.`);
			this.addDefinition(blockDefinition.name);
			this.graph.enterMetanodeScope(blockDefinition.name);
			this.walkAst(blockDefinition.body);
			this.graph.exitMetanodeScope();
		}
	}, {
		key: "handleBlockDefinitionBody",
		value: function handleBlockDefinitionBody(definitionBody) {
			var _this3 = this;

			definitionBody.definitions.forEach(function (definition) {
				return _this3.walkAst(definition);
			});
		}
	}, {
		key: "handleUnrecognizedNode",
		value: function handleUnrecognizedNode(node) {
			console.warn("What to do with this AST node?", node);
		}
	}, {
		key: "handleNetworkDefinition",
		value: function handleNetworkDefinition(network) {
			var _this4 = this;

			this.initialize();
			network.definitions.forEach(function (definition) {
				return _this4.walkAst(definition);
			});
		}
	}, {
		key: "handleConnectionDefinition",
		value: function handleConnectionDefinition(connection) {
			var _this5 = this;

			this.graph.clearNodeStack();
			connection.list.forEach(function (item) {
				_this5.graph.freezeNodeStack();
				_this5.walkAst(item);
			});
		}

		// this is doing too much – break into "not recognized", "success" and "ambiguous"

	}, {
		key: "handleBlockInstance",
		value: function handleBlockInstance(instance) {
			var node = {
				id: undefined,
				class: "Unknown",
				color: "darkgrey",
				height: 30,
				width: 100,

				_source: instance
			};

			var definitions = this.matchInstanceNameToDefinitions(instance.name.value);
			// console.log(`Matched definitions:`, definitions);

			if (definitions.length === 0) {
				node.class = instance.name.value;
				node.isUndefined = true;

				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". No possible matches found.",
					position: {
						start: instance.name._source.startIdx,
						end: instance.name._source.endIdx
					},
					type: "error"
				});
			} else if (definitions.length === 1) {
				var definition = definitions[0];
				if (definition) {
					node.color = definition.color;
					node.class = definition.name;
				}
			} else {
				node.class = instance.name.value;
				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". Possible matches: " + definitions.map(function (def) {
						return "\"" + def.name + "\"";
					}).join(", ") + ".",
					position: {
						start: instance.name._source.startIdx,
						end: instance.name._source.endIdx
					},
					type: "error"
				});
			}

			if (!instance.alias) {
				node.id = this.graph.generateInstanceId(node.class);
			} else {
				node.id = instance.alias.value;
				node.userGeneratedId = instance.alias.value;
				node.height = 50;
			}

			// is metanode
			if (Object.keys(this.graph.metanodes).includes(node.class)) {
				var color = d3.color(node.color);
				color.opacity = 0.1;
				this.graph.createMetanode(node.id, node.class, _extends({}, node, {
					style: { "fill": color.toString() }
				}));
				return;
			}

			this.graph.createNode(node.id, _extends({}, node, {
				style: { "fill": node.color },
				width: Math.max(Math.max(node.class.length, node.userGeneratedId ? node.userGeneratedId.length : 0), 5) * 12
			}));
		}
	}, {
		key: "handleBlockList",
		value: function handleBlockList(list) {
			var _this6 = this;

			list.list.forEach(function (item) {
				return _this6.walkAst(item);
			});
		}
	}, {
		key: "handleIdentifier",
		value: function handleIdentifier(identifier) {
			this.graph.referenceNode(identifier.value);
		}
	}, {
		key: "matchInstanceNameToDefinitions",
		value: function matchInstanceNameToDefinitions(query) {
			var _this7 = this;

			var definitions = Object.keys(this.definitions);
			var definitionKeys = Moniel.nameResolution(query, definitions);
			//console.log("Found keys", definitionKeys);
			var matchedDefinitions = definitionKeys.map(function (key) {
				return _this7.definitions[key];
			});
			return matchedDefinitions;
		}
	}, {
		key: "getComputationalGraph",
		value: function getComputationalGraph() {
			return this.graph.getGraph();
		}
	}, {
		key: "getIssues",
		value: function getIssues() {
			return this.logger.getIssues();
		}
	}, {
		key: "addIssue",
		value: function addIssue(issue) {
			this.logger.addIssue(issue);
		}
	}, {
		key: "walkAst",
		value: function walkAst(node) {
			if (!node) {
				console.error("No node?!");return;
			}

			switch (node.type) {
				case "Network":
					this.handleNetworkDefinition(node);break;
				case "BlockDefinition":
					this.handleBlockDefinition(node);break;
				case "BlockDefinitionBody":
					this.handleBlockDefinitionBody(node);break;
				case "ScopeDefinition":
					this.handleScopeDefinition(node);break;
				case "ScopeDefinitionBody":
					this.handleScopeDefinitionBody(node);break;
				case "ConnectionDefinition":
					this.handleConnectionDefinition(node);break;
				case "BlockInstance":
					this.handleBlockInstance(node);break;
				case "BlockList":
					this.handleBlockList(node);break;
				case "Identifier":
					this.handleIdentifier(node);break;
				default:
					this.handleUnrecognizedNode(node);
			}
		}
	}], [{
		key: "nameResolution",
		value: function nameResolution(partial, list) {
			var splitRegex = /(?=[0-9A-Z])/;
			var partialArray = partial.split(splitRegex);
			var listArray = list.map(function (definition) {
				return definition.split(splitRegex);
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
			return i === name.length; // got to the end?
		}
	}]);

	return Moniel;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Panel = function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel() {
    _classCallCheck(this, Panel);

    return _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).apply(this, arguments));
  }

  _createClass(Panel, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        { id: this.props.id, className: "panel" },
        this.props.children
      );
    }
  }]);

  return Panel;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeStack = function () {
	function ScopeStack() {
		var scope = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

		_classCallCheck(this, ScopeStack);

		this.scopeStack = [];

		if (Array.isArray(scope)) {
			this.scopeStack = scope;
		} else {
			console.error("Invalid initialization of scope stack.", scope);
		}
	}

	_createClass(ScopeStack, [{
		key: "initialize",
		value: function initialize() {
			this.clear();
		}
	}, {
		key: "push",
		value: function push(scope) {
			this.scopeStack.push(scope);
		}
	}, {
		key: "pop",
		value: function pop() {
			return this.scopeStack.pop();
		}
	}, {
		key: "clear",
		value: function clear() {
			this.scopeStack = [];
		}
	}, {
		key: "currentScopeIdentifier",
		value: function currentScopeIdentifier() {
			return this.scopeStack.join("/");
		}
	}, {
		key: "previousScopeIdentifier",
		value: function previousScopeIdentifier() {
			var copy = Array.from(this.scopeStack);
			copy.pop();
			return copy.join("/");
		}
	}]);

	return ScopeStack;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualGraph = function (_React$Component) {
    _inherits(VisualGraph, _React$Component);

    function VisualGraph(props) {
        _classCallCheck(this, VisualGraph);

        console.log("VisualGraph.constructor");

        var _this = _possibleConstructorReturn(this, (VisualGraph.__proto__ || Object.getPrototypeOf(VisualGraph)).call(this, props));

        _this.graphLayout = new GraphLayout();
        _this.state = {
            graph: null,
            previousViewBox: null
        };
        _this.animate = null;
        return _this;
    }

    _createClass(VisualGraph, [{
        key: "saveGraph",
        value: function saveGraph(graph) {
            this.setState({
                graph: graph
            });
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            // console.log("VisualGraph.componentWillReceiveProps", nextProps);
            if (nextProps.graph) {
                this.graphLayout.layout(nextProps.graph, this.saveGraph.bind(this));
            }
        }
    }, {
        key: "handleClick",
        value: function handleClick(node) {
            console.log("Clicked", node);
            this.setState({
                selectedNode: node.id
            });
            this.animate.beginElement();
        }
    }, {
        key: "mount",
        value: function mount(domNode) {
            if (domNode) {
                this.animate = domNode;
            }
            this.animate.beginElement();
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            // console.log(this.state.graph);

            if (!this.state.graph) {
                return null;
            }

            var g = this.state.graph;

            var nodes = g.nodes().map(function (nodeName) {
                var graph = _this2;
                var n = g.node(nodeName);
                var node = null;
                var props = {
                    key: nodeName,
                    node: n,
                    onClick: graph.handleClick.bind(graph)
                };

                if (n.isMetanode === true) {
                    node = React.createElement(Metanode, props);
                } else {
                    if (n.userGeneratedId) {
                        node = React.createElement(IdentifiedNode, props);
                    } else {
                        node = React.createElement(AnonymousNode, props);
                    }
                }

                return node;
            });

            var edges = g.edges().map(function (edgeName) {
                var e = g.edge(edgeName);
                return React.createElement(Edge, { key: edgeName.v + "->" + edgeName.w, edge: e });
            });

            var viewBox_whole = "0 0 " + g.graph().width + " " + g.graph().height;
            var transformView = "translate(0px,0px)" + ("scale(" + g.graph().width / g.graph().width + "," + g.graph().height / g.graph().height + ")");

            var selectedNode = this.state.selectedNode;
            var viewBox;
            if (selectedNode) {
                var n = g.node(selectedNode);
                viewBox = n.x - n.width / 2 + " " + (n.y - n.height / 2) + " " + n.width + " " + n.height;
            } else {
                viewBox = viewBox_whole;
            }

            return React.createElement(
                "svg",
                { id: "visualization" },
                React.createElement("animate", { ref: this.mount.bind(this), attributeName: "viewBox", from: viewBox_whole, to: viewBox, begin: "0s", dur: "0.25s", fill: "freeze", repeatCount: "1" }),
                React.createElement(
                    "defs",
                    null,
                    React.createElement(
                        "marker",
                        { id: "vee", viewBox: "0 0 10 10", refX: "10", refY: "5", markerUnits: "strokeWidth", markerWidth: "10", markerHeight: "7.5", orient: "auto" },
                        React.createElement("path", { d: "M 0 0 L 10 5 L 0 10 L 3 5 z", className: "arrow" })
                    )
                ),
                React.createElement(
                    "g",
                    { id: "graph" },
                    React.createElement(
                        "g",
                        { id: "nodes" },
                        nodes
                    ),
                    React.createElement(
                        "g",
                        { id: "edges" },
                        edges
                    )
                )
            );
        }
    }]);

    return VisualGraph;
}(React.Component);

var Edge = function (_React$Component2) {
    _inherits(Edge, _React$Component2);

    function Edge(props) {
        _classCallCheck(this, Edge);

        var _this3 = _possibleConstructorReturn(this, (Edge.__proto__ || Object.getPrototypeOf(Edge)).call(this, props));

        _this3.line = d3.line().curve(d3.curveBasis).x(function (d) {
            return d.x;
        }).y(function (d) {
            return d.y;
        });

        _this3.state = {
            previousPoints: []
        };
        return _this3;
    }

    _createClass(Edge, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            this.setState({
                previousPoints: this.props.edge.points
            });
        }
    }, {
        key: "mount",
        value: function mount(domNode) {
            if (domNode) {
                domNode.beginElement();
            }
        }
    }, {
        key: "render",
        value: function render() {
            var e = this.props.edge;
            var l = this.line;
            return React.createElement(
                "g",
                { className: "edgePath", markerEnd: "url(#vee)" },
                React.createElement(
                    "path",
                    { d: l(e.points) },
                    React.createElement("animate", { ref: this.mount, key: Math.random(), restart: "always", from: l(this.state.previousPoints), to: l(e.points), begin: "0s", dur: "0.25s", fill: "freeze", repeatCount: "1", attributeName: "d" })
                )
            );
        }
    }]);

    return Edge;
}(React.Component);

var Node = function (_React$Component3) {
    _inherits(Node, _React$Component3);

    function Node(props) {
        _classCallCheck(this, Node);

        return _possibleConstructorReturn(this, (Node.__proto__ || Object.getPrototypeOf(Node)).call(this, props));
    }

    _createClass(Node, [{
        key: "handleClick",
        value: function handleClick() {
            this.props.onClick(this.props.node);
        }
    }, {
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                "g",
                { className: "node " + n.class, onClick: this.handleClick.bind(this), style: { transform: "translate(" + (n.x - n.width / 2) + "px," + (n.y - n.height / 2) + "px)" } },
                this.props.children
            );
        }
    }]);

    return Node;
}(React.Component);

var Metanode = function (_Node) {
    _inherits(Metanode, _Node);

    function Metanode() {
        _classCallCheck(this, Metanode);

        return _possibleConstructorReturn(this, (Metanode.__proto__ || Object.getPrototypeOf(Metanode)).apply(this, arguments));
    }

    _createClass(Metanode, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                Node,
                this.props,
                React.createElement("rect", { width: n.width, height: n.height, rx: "15px", ry: "15px", style: n.style }),
                React.createElement(
                    "text",
                    { transform: "translate(10,0)", textAnchor: "start", style: { dominantBaseline: "ideographic" } },
                    React.createElement(
                        "tspan",
                        { x: "0", className: "id" },
                        n.userGeneratedId
                    ),
                    React.createElement(
                        "tspan",
                        { x: "0", dy: "1.2em" },
                        n.class
                    )
                )
            );
        }
    }]);

    return Metanode;
}(Node);

var AnonymousNode = function (_Node2) {
    _inherits(AnonymousNode, _Node2);

    function AnonymousNode(props) {
        _classCallCheck(this, AnonymousNode);

        return _possibleConstructorReturn(this, (AnonymousNode.__proto__ || Object.getPrototypeOf(AnonymousNode)).call(this, props));
    }

    _createClass(AnonymousNode, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                Node,
                this.props,
                React.createElement(
                    "rect",
                    { width: n.width, height: n.height, rx: "15px", ry: "15px", style: n.style },
                    " "
                ),
                React.createElement(
                    "text",
                    { transform: "translate(" + n.width / 2 + "," + n.height / 2 + ")", textAnchor: "middle" },
                    React.createElement(
                        "tspan",
                        null,
                        n.class
                    )
                )
            );
        }
    }]);

    return AnonymousNode;
}(Node);

var IdentifiedNode = function (_Node3) {
    _inherits(IdentifiedNode, _Node3);

    function IdentifiedNode() {
        _classCallCheck(this, IdentifiedNode);

        return _possibleConstructorReturn(this, (IdentifiedNode.__proto__ || Object.getPrototypeOf(IdentifiedNode)).apply(this, arguments));
    }

    _createClass(IdentifiedNode, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                Node,
                this.props,
                React.createElement("rect", { width: n.width, height: n.height, rx: "15px", ry: "15px", style: n.style }),
                React.createElement(
                    "text",
                    { transform: "translate(" + n.width / 2 + "," + n.height / 2 + ")", textAnchor: "middle", style: { dominantBaseline: "ideographic" } },
                    React.createElement(
                        "tspan",
                        { x: "0", className: "id" },
                        n.userGeneratedId
                    ),
                    React.createElement(
                        "tspan",
                        { x: "0", dy: "1.2em" },
                        n.class
                    )
                )
            );
        }
    }]);

    return IdentifiedNode;
}(Node);
'use strict';

function run() {
  ReactDOM.render(React.createElement(IDE, null), document.getElementById('moniel'));
}

var loadedStates = ['complete', 'loaded', 'interactive'];

if (loadedStates.includes(document.readyState) && document.body) {
  run();
} else {
  window.addEventListener('DOMContentLoaded', run, false);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFXTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BZnBCLFdBZW9CLEdBZk4sRUFlTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixNQUFNLElBQU4sQ0FBVyxLQUFoQztBQUNB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QXlCLDBCQUFFO0FBQTNCO0FBRko7QUFGSixhQURKO0FBU0g7Ozs7RUFad0IsSTs7O0FDcE03QixTQUFTLEdBQVQsR0FBZTtBQUNiLFdBQVMsTUFBVCxDQUFnQixvQkFBQyxHQUFELE9BQWhCLEVBQXdCLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUF4QjtBQUNEOztBQUVELElBQU0sZUFBZSxDQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLGFBQXZCLENBQXJCOztBQUVBLElBQUksYUFBYSxRQUFiLENBQXNCLFNBQVMsVUFBL0IsS0FBOEMsU0FBUyxJQUEzRCxFQUFpRTtBQUMvRDtBQUNELENBRkQsTUFFTztBQUNMLFNBQU8sZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRkZWZhdWx0RWRnZSA9IHt9XG5cblx0bm9kZUNvdW50ZXIgPSB7fVxuXHRub2RlU3RhY2sgPSBbXVxuXHRwcmV2aW91c05vZGVTdGFjayA9IFtdXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cblx0XHR0aGlzLm1ldGFub2RlcyA9IHt9XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrID0gW11cblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyU2NvcGUoc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZS5uYW1lLnZhbHVlKTtcblx0XHRsZXQgY3VycmVudFNjb3BlSWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBwcmV2aW91c1Njb3BlSWQgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShjdXJyZW50U2NvcGVJZCwge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBzY29wZS5uYW1lLnZhbHVlLFxuICAgICAgICAgICAgY2xhc3M6IFwiTWV0YW5vZGVcIixcbiAgICAgICAgICAgIGlzTWV0YW5vZGU6IHRydWUsXG4gICAgICAgICAgICBfc291cmNlOiBzY29wZS5uYW1lLl9zb3VyY2Vcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KGN1cnJlbnRTY29wZUlkLCBwcmV2aW91c1Njb3BlSWQpO1xuXHR9XG5cblx0ZXhpdFNjb3BlKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbmFtZV07XG5cdH1cblxuXHRleGl0TWV0YW5vZGVTY29wZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gXCJhX1wiICsgdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLmVudGVyTWV0YW5vZGVTY29wZShcIm1haW5cIik7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goXCIuXCIpO1xuXHRcdGxldCBpZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoaWQsIHtcblx0XHRcdGNsYXNzOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2sucHVzaChub2RlUGF0aCk7XG5cdFx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmZvckVhY2goZnJvbVBhdGggPT4ge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UoZnJvbVBhdGgsIG5vZGVQYXRoKVx0XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKGBUcnlpbmcgdG8gdG91Y2ggbm9uLWV4aXN0YW50IG5vZGUgXCIke25vZGVQYXRofVwiYCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmZXJlbmNlTm9kZShpZCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IGlkLFxuXHRcdFx0Y2xhc3M6IFwidW5kZWZpbmVkXCIsXG5cdFx0XHRoZWlnaHQ6IDUwXG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0d2lkdGg6IE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApICogMTBcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y3JlYXRlTm9kZShpZCwgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdGNvbnNvbGUud2FybihgUmVkaWZpbmluZyBub2RlIFwiJHtpZH1cImApO1x0XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoXG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHRyZXR1cm4gbm9kZVBhdGg7XG5cdH1cblxuXHRjcmVhdGVNZXRhbm9kZShpZGVudGlmaWVyLCBtZXRhbm9kZUNsYXNzLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcik7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZWRnZS52LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgZWRnZS53LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhgRnJlZXppbmcgbm9kZSBzdGFjay4gQ29udGVudDogJHtKU09OLnN0cmluZ2lmeSh0aGlzLm5vZGVTdGFjayl9YCk7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5pc01ldGFub2RlID09PSB0cnVlO1xuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZShzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXHRcdGlmIChvdXRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIG91dHNbMF07XHRcblx0XHR9IGVsc2UgIGlmIChvdXRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFNjb3BlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgU2NvcGUgXCIke3Njb3BlLmlkfVwiIGhhcyBtb3JlIHRoYW4gb25lIE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdGdldElucHV0Tm9kZShzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5zID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKSB9KTtcblx0XHRpZiAoaW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGluc1swXTtcdFxuXHRcdH0gZWxzZSAgaWYgKGlucy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFNjb3BlIFwiJHtzY29wZS5pZH1cIiBoYXMgbW9yZSB0aGFuIG9uZSBJbnB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XHRcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cblx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0ZnJvbVBhdGggPSB0aGlzLmdldE91dHB1dE5vZGUoZnJvbVBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0dG9QYXRoID0gdGhpcy5nZXRJbnB1dE5vZGUodG9QYXRoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGZyb21QYXRoICYmIHRvUGF0aCkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgsIHsuLi50aGlzLmRlZmF1bHRFZGdlfSk7XHRcblx0XHR9XG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5pbnNpZGUoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdHdvcmtlciA9IG5ldyBXb3JrZXIoXCJzcmMvc2NyaXB0cy9HcmFwaExheW91dFdvcmtlci5qc1wiKTtcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbigpe31cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBlbmNvZGUoZ3JhcGgpIHtcbiAgICBcdHJldHVybiBKU09OLnN0cmluZ2lmeShncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKSk7XG4gICAgfVxuXG4gICAgZGVjb2RlKGpzb24pIHtcbiAgICBcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoSlNPTi5wYXJzZShqc29uKSk7XG4gICAgfVxuXG4gICAgbGF5b3V0KGdyYXBoLCBjYWxsYmFjaykge1xuICAgIFx0Ly9jb25zb2xlLmxvZyhcIkdyYXBoTGF5b3V0LmxheW91dFwiLCBncmFwaCwgY2FsbGJhY2spO1xuICAgIFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgIFx0XHRncmFwaDogdGhpcy5lbmNvZGUoZ3JhcGgpXG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICByZWNlaXZlKGRhdGEpIHtcbiAgICBcdHZhciBncmFwaCA9IHRoaXMuZGVjb2RlKGRhdGEuZGF0YS5ncmFwaCk7XG4gICAgXHR0aGlzLmNhbGxiYWNrKGdyYXBoKTtcbiAgICB9XG59IiwiY2xhc3MgSURFIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXHRtb25pZWwgPSBuZXcgTW9uaWVsKCk7XG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRcImdyYW1tYXJcIjogZ3JhbW1hcixcblx0XHRcdFwic2VtYW50aWNzXCI6IHNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsXG5cdFx0fTtcblx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIik7XG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmNvbXBpbGVUb0FTVCh0aGlzLnN0YXRlLmdyYW1tYXIsIHRoaXMuc3RhdGUuc2VtYW50aWNzLCB2YWx1ZSk7XG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdCk7XG5cdFx0XHR2YXIgZ3JhcGggPSB0aGlzLm1vbmllbC5nZXRDb21wdXRhdGlvbmFsR3JhcGgoKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogcmVzdWx0LmFzdCxcblx0XHRcdFx0Z3JhcGg6IGdyYXBoLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlXG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogYC4vZXhhbXBsZXMvJHtpZH0ubW9uYCxcblx0XHRcdGRhdGE6IG51bGwsXG5cdFx0XHRzdWNjZXNzOiBjYWxsYmFjay5iaW5kKHRoaXMpLFxuXHRcdFx0ZGF0YVR5cGU6IFwidGV4dFwiXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBpbnRvIE1vbmllbD8gb3IgUGFyc2VyXG5cdGNvbXBpbGVUb0FTVChncmFtbWFyLCBzZW1hbnRpY3MsIHNvdXJjZSkge1xuXHQgICAgdmFyIHJlc3VsdCA9IGdyYW1tYXIubWF0Y2goc291cmNlKTtcblxuXHQgICAgaWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHQgICAgICAgIHZhciBhc3QgPSBzZW1hbnRpY3MocmVzdWx0KS5ldmFsKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJhc3RcIjogYXN0XG5cdCAgICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHQgICAgICAgIHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKTtcblx0ICAgICAgICB2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJleHBlY3RlZFwiOiBleHBlY3RlZCxcblx0ICAgICAgICAgICAgXCJwb3NpdGlvblwiOiBwb3NpdGlvblxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHQvL2NvbnNvbGUubG9nKFwiSURFLnJlbmRlclwiKTtcblxuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIj5cbiAgICBcdFx0PFBhbmVsIGlkPVwiZGVmaW5pdGlvblwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdHJlZj17KHJlZikgPT4gdGhpcy5lZGl0b3IgPSByZWZ9XG4gICAgXHRcdFx0XHRtb2RlPVwibW9uaWVsXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHRpc3N1ZXM9e3RoaXMuc3RhdGUuaXNzdWVzfVxuICAgIFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0ZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0aGlnaGxpZ2h0UmFuZ2U9e3RoaXMuc3RhdGUuaGlnaGxpZ2h0UmFuZ2V9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHRncmFwaCA9IG5ldyBDb21wdXRhdGlvbmFsR3JhcGgodGhpcyk7XG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogY29sb3JIYXNoLmhleChkZWZpbml0aW9uTmFtZSlcblx0XHR9O1xuXHR9XG5cblx0aGFuZGxlU2NvcGVEZWZpbml0aW9uKHNjb3BlKSB7XG5cdFx0dGhpcy5ncmFwaC5lbnRlclNjb3BlKHNjb3BlKTtcblx0XHR0aGlzLndhbGtBc3Qoc2NvcGUuYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0U2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkoc2NvcGVCb2R5KSB7XG5cdFx0c2NvcGVCb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMud2Fsa0FzdChibG9ja0RlZmluaXRpb24uYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShkZWZpbml0aW9uQm9keSkge1xuXHRcdGRlZmluaXRpb25Cb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdGNvbm5lY3Rpb24ubGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5mcmVlemVOb2RlU3RhY2soKTtcblx0XHRcdHRoaXMud2Fsa0FzdChpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRoYW5kbGVCbG9ja0luc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UubmFtZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcbiAgICAgICAgICAgIG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cbiAgICAgICAgICAgIHRoaXMuYWRkSXNzdWUoe1xuICAgICAgICAgICAgXHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuICAgICAgICAgICAgXHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcbiAgICAgICAgICAgIFx0dHlwZTogXCJlcnJvclwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvcjtcblx0XHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb24ubmFtZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRub2RlLmlkID0gdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQobm9kZS5jbGFzcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuaWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUudXNlckdlbmVyYXRlZElkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLmhlaWdodCA9IDUwO1xuXHRcdH1cblxuXHRcdC8vIGlzIG1ldGFub2RlXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuZ3JhcGgubWV0YW5vZGVzKS5pbmNsdWRlcyhub2RlLmNsYXNzKSkge1xuXHRcdFx0dmFyIGNvbG9yID0gZDMuY29sb3Iobm9kZS5jb2xvcik7XG5cdFx0XHRjb2xvci5vcGFjaXR5ID0gMC4xO1xuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCBub2RlLmNsYXNzLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUobm9kZS5pZCwge1xuXHRcdFx0Li4ubm9kZSxcbiAgICAgICAgICAgIHN0eWxlOiB7XCJmaWxsXCI6IG5vZGUuY29sb3J9LFxuICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApLCA1KSAqIDEyXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPXt0aGlzLnByb3BzLmlkfSBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29uc3RydWN0b3JcIik7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3JhcGg6IG51bGwsXG4gICAgICAgICAgICBwcmV2aW91c1ZpZXdCb3g6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbmltYXRlID0gbnVsbFxuICAgIH1cblxuICAgIHNhdmVHcmFwaChncmFwaCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyYXBoOiBncmFwaFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHNcIiwgbmV4dFByb3BzKTtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgdGhpcy5ncmFwaExheW91dC5sYXlvdXQobmV4dFByb3BzLmdyYXBoLCB0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3hfd2hvbGUgPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgdmFyIHZpZXdCb3hcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIHZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3Qm94ID0gdmlld0JveF93aG9sZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt2aWV3Qm94X3dob2xlfSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiPjwvYW5pbWF0ZT5cbiAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJ2ZWVcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgIDwvbWFya2VyPlxuICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgPGcgaWQ9XCJncmFwaFwiPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPjtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VQYXRoXCIgbWFya2VyRW5kPVwidXJsKCN2ZWUpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPXtgbm9kZSAke24uY2xhc3N9YH0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpfSBzdHlsZT17e3RyYW5zZm9ybTogYHRyYW5zbGF0ZSgke24ueCAtKG4ud2lkdGgvMil9cHgsJHtuLnkgLShuLmhlaWdodC8yKX1weClgfX0+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBNZXRhbm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNOb2RlIGV4dGVuZHMgTm9kZXtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT4gPC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
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

		this.defaultEdge = {
			arrowhead: "vee",
			lineInterpolate: "basis"
		};
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

			this.graph.setNode(currentScopeId, {
				label: scope.name.value,
				clusterLabelPos: "top",
				class: "Scope",
				isMetanode: true,
				_source: scope.name._source
			});

			var previousScopeId = this.scopeStack.previousScopeIdentifier();
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
				class: "Network"
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

			if (!this.graph.hasNode(nodePath)) {
				this.graph.setNode(nodePath, {
					label: id,
					class: "undefined",
					width: 100,
					height: 30
				});
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

			this.graph.setNode(nodePath, node);
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
				label: identifier,
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
      console.log("GraphLayout.layout", graph, callback);
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
				url: "/examples/" + id + ".mon",
				data: null,
				success: callback.bind(this),
				dataType: "text"
			});
		}

		// into Moniel? or Parser

	}, {
		key: "compileToAST",
		value: function compileToAST(grammar, semantics, source) {
			console.log("compileToAST");
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
					{ title: "Definition" },
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
					{ title: "Visualization" },
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
				label: "undeclared",
				class: "Unknown",
				color: "yellow",
				height: 30,
				width: 100,

				_source: instance
			};

			var definitions = this.matchInstanceNameToDefinitions(instance.name.value);
			// console.log(`Matched definitions:`, definitions);

			if (definitions.length === 0) {
				node.class = "undefined";
				node.label = instance.name.value;
				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". No possible matches found.",
					position: {
						start: instance.name._source.startIdx,
						end: instance.name._source.endIdx
					},
					type: "error"
				});
			} else if (definitions.length === 1) {
				node.class = definitions[0].name;
				var definition = definitions[0];
				if (definition) {
					node.label = definition.name;
					node.color = definition.color;
				}
			} else {
				node.class = "ambiguous";
				node.label = instance.name.value;
				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". Possible matches: " + definitions.map(function (def) {
						return def.name;
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
				width: node.label.length * 10
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
            graph: null
        };
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
            console.log("VisualGraph.componentWillReceiveProps", nextProps);
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
            var _this2 = this;

            console.log(this.state.graph);

            if (!this.state.graph) {
                return React.createElement(
                    "div",
                    null,
                    "No data yet!"
                );
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

            //console.log(edges);

            var viewBox = "0 0 " + g.graph().width + " " + g.graph().height;
            var transformView = "translate(0px,0px)" + ("scale(" + g.graph().width / g.graph().width + "," + g.graph().height / g.graph().height + ")");

            var selectedNode = this.state.selectedNode;
            if (selectedNode) {
                var n = g.node(selectedNode);
                console.log(n.x, n.y, n.width, n.height);
                //viewBox = `${n.x - n.width / 2} ${n.y - n.height / 2} ${n.width} ${n.height}`
                var scale = [g.graph().width / n.width, g.graph().height / n.height];
                var maxScale = Math.max.apply(Math, scale);
                console.log(scale, maxScale);
                var transformView = "scale(" + maxScale + ")" + ("translate(" + g.graph().width / n.x + "px," + g.graph().height / n.y + "px)");
            }

            console.log(transformView);

            return React.createElement(
                "svg",
                { id: "visualization" },
                React.createElement("animate", { ref: this.mount, attributeName: "viewBox", to: viewBox, begin: "0s", dur: "0.25s", fill: "freeze", repeatCount: "1" }),
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
                    { id: "graph", style: { transform: transformView } },
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

    return Node;
}(React.Component);

var Metanode = function (_Node) {
    _inherits(Metanode, _Node);

    function Metanode() {
        _classCallCheck(this, Metanode);

        return _possibleConstructorReturn(this, (Metanode.__proto__ || Object.getPrototypeOf(Metanode)).apply(this, arguments));
    }

    _createClass(Metanode, [{
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFjTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BbEJwQixXQWtCb0IsR0FsQk47QUFDUCxjQUFXLEtBREo7QUFFUCxvQkFBaUI7QUFGVixHQWtCTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJ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d0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRkZWZhdWx0RWRnZSA9IHtcbiAgICAgICAgYXJyb3doZWFkOiBcInZlZVwiLFxuICAgICAgICBsaW5lSW50ZXJwb2xhdGU6IFwiYmFzaXNcIlxuICAgIH1cblxuXHRub2RlQ291bnRlciA9IHt9XG5cdG5vZGVTdGFjayA9IFtdXG5cdHByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJTY29wZShzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlLm5hbWUudmFsdWUpO1xuXHRcdGxldCBjdXJyZW50U2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoY3VycmVudFNjb3BlSWQsIHtcblx0XHRcdGxhYmVsOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0Y2x1c3RlckxhYmVsUG9zOiBcInRvcFwiLFxuICAgICAgICAgICAgY2xhc3M6IFwiU2NvcGVcIixcbiAgICAgICAgICAgIGlzTWV0YW5vZGU6IHRydWUsXG4gICAgICAgICAgICBfc291cmNlOiBzY29wZS5uYW1lLl9zb3VyY2Vcblx0XHR9KTtcblxuXHRcdGxldCBwcmV2aW91c1Njb3BlSWQgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChjdXJyZW50U2NvcGVJZCwgcHJldmlvdXNTY29wZUlkKTtcblx0fVxuXG5cdGV4aXRTY29wZSgpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJOZXR3b3JrXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKTtcblx0XHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2suZm9yRWFjaChmcm9tUGF0aCA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZShmcm9tUGF0aCwgbm9kZVBhdGgpXHRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHRsYWJlbDogaWQsXG5cdFx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0XHR3aWR0aDogMTAwLFxuXHRcdFx0XHRoZWlnaHQ6IDMwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGlmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwgbm9kZSk7XG5cdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHRyZXR1cm4gbm9kZVBhdGg7XG5cdH1cblxuXHRjcmVhdGVNZXRhbm9kZShpZGVudGlmaWVyLCBtZXRhbm9kZUNsYXNzLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcik7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRsYWJlbDogaWRlbnRpZmllcixcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0ZnJlZXplTm9kZVN0YWNrKCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGBGcmVlemluZyBub2RlIHN0YWNrLiBDb250ZW50OiAke0pTT04uc3RyaW5naWZ5KHRoaXMubm9kZVN0YWNrKX1gKTtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gWy4uLnRoaXMubm9kZVN0YWNrXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0c2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLnNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpO1xuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIklucHV0XCI7XG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiO1xuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWU7XG5cdH1cblxuXHRnZXRPdXRwdXROb2RlKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBvdXRzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNPdXRwdXQobm9kZSkgfSk7XG5cdFx0aWYgKG91dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gb3V0c1swXTtcdFxuXHRcdH0gZWxzZSAgaWYgKG91dHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgU2NvcGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUuaWR9XCIgaGFzIG1vcmUgdGhhbiBvbmUgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0Z2V0SW5wdXROb2RlKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBpbnMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc0lucHV0KG5vZGUpIH0pO1xuXHRcdGlmIChpbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gaW5zWzBdO1x0XG5cdFx0fSBlbHNlICBpZiAoaW5zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFNjb3BlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IElucHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgU2NvcGUgXCIke3Njb3BlLmlkfVwiIGhhcyBtb3JlIHRoYW4gb25lIElucHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cdFxuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblxuXHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRmcm9tUGF0aCA9IHRoaXMuZ2V0T3V0cHV0Tm9kZShmcm9tUGF0aCk7XG5cdFx0fVxuXG5cdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHR0b1BhdGggPSB0aGlzLmdldElucHV0Tm9kZSh0b1BhdGgpO1xuXHRcdH1cblx0XHRcblx0XHRpZiAoZnJvbVBhdGggJiYgdG9QYXRoKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCwgey4uLnRoaXMuZGVmYXVsdEVkZ2V9KTtcdFxuXHRcdH1cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmluc2lkZShjLnJvdywgYy5jb2x1bW4pKS5yZWR1Y2UoIChwcmV2LCBjdXJyKSA9PiBwcmV2IHx8IGN1cnIsIGZhbHNlKTtcblxuICAgICAgICBpZiAoY3Vyc29yT3Zlck1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSAgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0d29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpO1xuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGVuY29kZShncmFwaCkge1xuICAgIFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGdyYXBobGliLmpzb24ud3JpdGUoZ3JhcGgpKTtcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuICAgIFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChKU09OLnBhcnNlKGpzb24pKTtcbiAgICB9XG5cbiAgICBsYXlvdXQoZ3JhcGgsIGNhbGxiYWNrKSB7XG4gICAgXHRjb25zb2xlLmxvZyhcIkdyYXBoTGF5b3V0LmxheW91dFwiLCBncmFwaCwgY2FsbGJhY2spO1xuICAgIFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgIFx0XHRncmFwaDogdGhpcy5lbmNvZGUoZ3JhcGgpXG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICByZWNlaXZlKGRhdGEpIHtcbiAgICBcdHZhciBncmFwaCA9IHRoaXMuZGVjb2RlKGRhdGEuZGF0YS5ncmFwaCk7XG4gICAgXHR0aGlzLmNhbGxiYWNrKGdyYXBoKTtcbiAgICB9XG59IiwiY2xhc3MgSURFIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXHRtb25pZWwgPSBuZXcgTW9uaWVsKCk7XG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRcImdyYW1tYXJcIjogZ3JhbW1hcixcblx0XHRcdFwic2VtYW50aWNzXCI6IHNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsXG5cdFx0fTtcblx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIik7XG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmNvbXBpbGVUb0FTVCh0aGlzLnN0YXRlLmdyYW1tYXIsIHRoaXMuc3RhdGUuc2VtYW50aWNzLCB2YWx1ZSk7XG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdCk7XG5cdFx0XHR2YXIgZ3JhcGggPSB0aGlzLm1vbmllbC5nZXRDb21wdXRhdGlvbmFsR3JhcGgoKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogcmVzdWx0LmFzdCxcblx0XHRcdFx0Z3JhcGg6IGdyYXBoLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlXG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogYC9leGFtcGxlcy8ke2lkfS5tb25gLFxuXHRcdFx0ZGF0YTogbnVsbCxcblx0XHRcdHN1Y2Nlc3M6IGNhbGxiYWNrLmJpbmQodGhpcyksXG5cdFx0XHRkYXRhVHlwZTogXCJ0ZXh0XCJcblx0XHR9KTtcblx0fVxuXG5cdC8vIGludG8gTW9uaWVsPyBvciBQYXJzZXJcblx0Y29tcGlsZVRvQVNUKGdyYW1tYXIsIHNlbWFudGljcywgc291cmNlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJjb21waWxlVG9BU1RcIik7XG5cdCAgICB2YXIgcmVzdWx0ID0gZ3JhbW1hci5tYXRjaChzb3VyY2UpO1xuXG5cdCAgICBpZiAocmVzdWx0LnN1Y2NlZWRlZCgpKSB7XG5cdCAgICAgICAgdmFyIGFzdCA9IHNlbWFudGljcyhyZXN1bHQpLmV2YWwoKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImFzdFwiOiBhc3Rcblx0ICAgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdCAgICAgICAgdmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpO1xuXHQgICAgICAgIHZhciBwb3NpdGlvbiA9IHJlc3VsdC5nZXRSaWdodG1vc3RGYWlsdXJlUG9zaXRpb24oKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImV4cGVjdGVkXCI6IGV4cGVjdGVkLFxuXHQgICAgICAgICAgICBcInBvc2l0aW9uXCI6IHBvc2l0aW9uXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdC8vY29uc29sZS5sb2coXCJJREUucmVuZGVyXCIpO1xuXG4gICAgXHRyZXR1cm4gPGRpdiBpZD1cImNvbnRhaW5lclwiPlxuICAgIFx0XHQ8UGFuZWwgdGl0bGU9XCJEZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRoaWdobGlnaHRSYW5nZT17dGhpcy5zdGF0ZS5oaWdobGlnaHRSYW5nZX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0XHRcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiVmlzdWFsaXphdGlvblwiPlxuICAgIFx0XHRcdDxWaXN1YWxHcmFwaCBncmFwaD17dGhpcy5zdGF0ZS5ncmFwaH0gLz5cbiAgICBcdFx0PC9QYW5lbD5cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiY2xhc3MgTG9nZ2Vye1xuXHRpc3N1ZXMgPSBbXVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuaXNzdWVzID0gW107XG5cdH1cblx0XG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5pc3N1ZXM7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHZhciBmID0gbnVsbDtcblx0XHRzd2l0Y2goaXNzdWUudHlwZSkge1xuXHRcdFx0Y2FzZSBcImVycm9yXCI6IGYgPSBjb25zb2xlLmVycm9yOyBicmVhaztcblx0XHRcdGNhc2UgXCJ3YXJuaW5nXCI6IGYgPSBjb25zb2xlLndhcm47IGJyZWFrO1xuXHRcdFx0Y2FzZSBcImluZm9cIjogZiA9IGNvbnNvbGUuaW5mbzsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiBmID0gY29uc29sZS5sb2c7IGJyZWFrO1xuXHRcdH1cblx0XHRmKGlzc3VlLm1lc3NhZ2UpO1xuXHRcdHRoaXMuaXNzdWVzLnB1c2goaXNzdWUpO1xuXHR9XG59IiwiY2xhc3MgTW9uaWVse1xuXHRsb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKTtcblxuXHRkZWZpbml0aW9ucyA9IHt9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmdyYXBoLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmxvZ2dlci5jbGVhcigpO1xuXG5cdFx0dGhpcy5kZWZpbml0aW9ucyA9IFtdO1xuXHRcdHRoaXMuYWRkRGVmYXVsdERlZmluaXRpb25zKCk7XG5cdH1cblxuXHRhZGREZWZhdWx0RGVmaW5pdGlvbnMoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgZGVmYXVsdCBkZWZpbml0aW9ucy5gKTtcblx0XHRjb25zdCBkZWZhdWx0RGVmaW5pdGlvbnMgPSBbXCJBZGRcIiwgXCJMaW5lYXJcIiwgXCJJbnB1dFwiLCBcIk91dHB1dFwiLCBcIlBsYWNlaG9sZGVyXCIsIFwiVmFyaWFibGVcIiwgXCJDb25zdGFudFwiLCBcIk11bHRpcGx5XCIsIFwiQ29udm9sdXRpb25cIiwgXCJEZW5zZVwiLCBcIk1heFBvb2xpbmdcIiwgXCJCYXRjaE5vcm1hbGl6YXRpb25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiBjb2xvckhhc2guaGV4KGRlZmluaXRpb25OYW1lKVxuXHRcdH07XG5cdH1cblxuXHRoYW5kbGVTY29wZURlZmluaXRpb24oc2NvcGUpIHtcblx0XHR0aGlzLmdyYXBoLmVudGVyU2NvcGUoc2NvcGUpO1xuXHRcdHRoaXMud2Fsa0FzdChzY29wZS5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlU2NvcGVEZWZpbml0aW9uQm9keShzY29wZUJvZHkpIHtcblx0XHRzY29wZUJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uKcKge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIFwiJHtibG9ja0RlZmluaXRpb24ubmFtZX1cIiB0byBhdmFpbGFibGUgZGVmaW5pdGlvbnMuYCk7XG5cdFx0dGhpcy5hZGREZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy53YWxrQXN0KGJsb2NrRGVmaW5pdGlvbi5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KGRlZmluaXRpb25Cb2R5KSB7XG5cdFx0ZGVmaW5pdGlvbkJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpIHtcblx0XHRjb25zb2xlLndhcm4oXCJXaGF0IHRvIGRvIHdpdGggdGhpcyBBU1Qgbm9kZT9cIiwgbm9kZSk7XG5cdH1cblxuXHRoYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihuZXR3b3JrKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0bmV0d29yay5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKGNvbm5lY3Rpb24pIHtcblx0XHR0aGlzLmdyYXBoLmNsZWFyTm9kZVN0YWNrKCk7XG5cdFx0Y29ubmVjdGlvbi5saXN0LmZvckVhY2goaXRlbSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpO1xuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gdGhpcyBpcyBkb2luZyB0b28gbXVjaCDigJMgYnJlYWsgaW50byBcIm5vdCByZWNvZ25pemVkXCIsIFwic3VjY2Vzc1wiIGFuZCBcImFtYmlndW91c1wiXG5cdGhhbmRsZUJsb2NrSW5zdGFuY2UoaW5zdGFuY2UpIHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRsYWJlbDogXCJ1bmRlY2xhcmVkXCIsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJ5ZWxsb3dcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UubmFtZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzID0gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgICAgIG5vZGUubGFiZWwgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgdGhpcy5hZGRJc3N1ZSh7XG4gICAgICAgICAgICBcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBObyBwb3NzaWJsZSBtYXRjaGVzIGZvdW5kLmAsXG4gICAgICAgICAgICBcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuICAgICAgICAgICAgXHR0eXBlOiBcImVycm9yXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb25zWzBdLm5hbWU7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5sYWJlbCA9IGRlZmluaXRpb24ubmFtZTtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3I7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBcImFtYmlndW91c1wiXG4gICAgICAgICAgICBub2RlLmxhYmVsID0gaW5zdGFuY2UubmFtZS52YWx1ZVxuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gZGVmLm5hbWUpLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5hbGlhcykge1xuXHRcdFx0bm9kZS5pZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKG5vZGUuY2xhc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmlkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLnVzZXJHZW5lcmF0ZWRJZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS5oZWlnaHQgPSA1MDtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdHZhciBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpO1xuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMTtcblx0XHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUobm9kZS5pZCwgbm9kZS5jbGFzcywge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZToge1wiZmlsbFwiOiBjb2xvci50b1N0cmluZygpfVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVOb2RlKG5vZGUuaWQsIHtcblx0XHRcdC4uLm5vZGUsXG4gICAgICAgICAgICBzdHlsZToge1wiZmlsbFwiOiBub2RlLmNvbG9yfSxcbiAgICAgICAgICAgIHdpZHRoOiBub2RlLmxhYmVsLmxlbmd0aCAqIDEwXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHQ8ZGl2IGNsYXNzTmFtZT1cImhlYWRlclwiPlxuICAgIFx0XHR7dGhpcy5wcm9wcy50aXRsZX1cbiAgICBcdDwvZGl2PlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29uc3RydWN0b3JcIik7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3JhcGg6IG51bGxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzXCIsIG5leHRQcm9wcyk7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCwgdGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhub2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZFwiLCBub2RlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGU6IG5vZGUuaWRcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgcmV0dXJuIDxkaXY+Tm8gZGF0YSB5ZXQhPC9kaXY+XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9jb25zb2xlLmxvZyhlZGdlcyk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3ggPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG4ueCwgbi55LCBuLndpZHRoLCBuLmhlaWdodCk7XG4gICAgICAgICAgICAvL3ZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgICAgICBsZXQgc2NhbGUgPSBbZy5ncmFwaCgpLndpZHRoIC8gbi53aWR0aCwgZy5ncmFwaCgpLmhlaWdodCAvIG4uaGVpZ2h0XTtcbiAgICAgICAgICAgIGxldCBtYXhTY2FsZSA9IE1hdGgubWF4KC4uLnNjYWxlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHNjYWxlLCBtYXhTY2FsZSlcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHNjYWxlKCR7bWF4U2NhbGV9KWAgKyBgdHJhbnNsYXRlKCR7Zy5ncmFwaCgpLndpZHRoIC8gbi54fXB4LCR7Zy5ncmFwaCgpLmhlaWdodCAvIG4ueX1weClgO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS5sb2codHJhbnNmb3JtVmlldyk7XG5cbiAgICAgICAgcmV0dXJuIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICA8bWFya2VyIGlkPVwidmVlXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIiBzdHlsZT17e3RyYW5zZm9ybTogdHJhbnNmb3JtVmlld319PlxuICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPjtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VQYXRoXCIgbWFya2VyRW5kPVwidXJsKCN2ZWUpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Bub2RlICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHN0eWxlPXt7dHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7bi54IC0obi53aWR0aC8yKX1weCwke24ueSAtKG4uaGVpZ2h0LzIpfXB4KWB9fT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNOb2RlIGV4dGVuZHMgTm9kZXtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YG5vZGUgJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gc3R5bGU9e3t0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtuLnggLShuLndpZHRoLzIpfXB4LCR7bi55IC0obi5oZWlnaHQvMil9cHgpYH19PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+IDwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIElkZW50aWZpZWROb2RlIGV4dGVuZHMgTm9kZXtcbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Bub2RlICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHN0eWxlPXt7dHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7bi54IC0obi53aWR0aC8yKX1weCwke24ueSAtKG4uaGVpZ2h0LzIpfXB4KWB9fT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
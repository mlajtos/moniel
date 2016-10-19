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
				name: name
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
					class: "undefined"
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

			if (!this.graph.hasNode(nodePath)) {
				this.graph.setNode(nodePath, node);
				this.setParent(nodePath, scope);
			} else {
				console.warn("Redifining node \"" + id + "\"");
				this.graph.setNode(nodePath, node);
				this.setParent(nodePath, scope);
			}

			this.touchNode(nodePath);

			this.scopeStack.pop();

			return nodePath;
		}
	}, {
		key: "copy",
		value: function copy(metanode, identifier) {
			var _this2 = this;

			var scope = this.scopeStack.currentScopeIdentifier();
			this.scopeStack.push(identifier);
			var nodePath = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(nodePath, {
				id: identifier,
				label: identifier,
				isMetanode: true,
				clusterLabelPos: "top",
				class: "Scope"
			});

			this.graph.setParent(nodePath, scope);

			var targetMetanode = this.metanodes[metanode];
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
			this.loadExample("VGG16");
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Moniel = function () {
	function Moniel() {
		_classCallCheck(this, Moniel);

		this.logger = new Logger();
		this.graph = new ComputationalGraph(this);
		this.definitions = [];

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
			var defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
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
			var id = undefined;
			var label = "undeclared";
			var type = "Unknown";
			var shape = "rect"; // should not be here
			var color = "yellow"; // should not be here

			var possibleTypes = this.getTypeOfInstance(instance);

			if (possibleTypes.length === 0) {
				type = "undefined";
				label = instance.name.value;
				shape = "rect"; // should not be here
				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". No possible matches found.",
					position: {
						start: instance.name._source.startIdx,
						end: instance.name._source.endIdx
					},
					type: "error"
				});
			} else if (possibleTypes.length === 1) {
				type = possibleTypes[0];
				label = type;
				color = colorHash.hex(label); // should not be here
			} else {
				type = "ambiguous";
				label = instance.name.value;
				shape = "diamond"; // should not be here
				this.addIssue({
					message: "Unrecognized node type \"" + instance.name.value + "\". Possible matches: " + possibleTypes.join(", ") + ".",
					position: {
						start: instance.name._source.startIdx,
						end: instance.name._source.endIdx
					},
					type: "error"
				});
			}

			if (!instance.alias) {
				id = this.graph.generateInstanceId(type);
			} else {
				id = instance.alias.value;
			}

			// is metanode
			if (Object.keys(this.graph.metanodes).includes(type)) {
				this.graph.copy(type, id);
				return;
			}

			this.graph.createNode(id, {
				id: id,
				label: label,
				class: type,
				shape: shape, // should not be here
				style: "fill: " + color, // should not be here
				_source: instance,
				width: label.length * 8.5, // should not be here
				height: 10 // should not be here
			});
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
		key: "getTypeOfInstance",
		value: function getTypeOfInstance(instance) {
			// console.info(`Trying to match "${instance.name.value}" against block definitions.`);
			// HACK: There should be only one place to store definitions.
			var definitions = [].concat(_toConsumableArray(this.definitions), _toConsumableArray(Object.keys(this.graph.metanodes)));
			return Moniel.nameResolution(instance.name.value, definitions);
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

        _this.dagreRenderer = new dagreD3.render();
        _this.graphLayout = new GraphLayout();
        _this.state = {
            graph: null
        };
        return _this;
    }

    _createClass(VisualGraph, [{
        key: "componentDidMount",
        value: function componentDidMount() {
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
    }, {
        key: "renderGraph",
        value: function renderGraph(graph) {
            console.log("VisualGraph.renderGraph");
            var svg = d3.select(this.svg);
            var group = d3.select(this.svgGroup);

            this.dagreRenderer(d3.select(this.svgGroup), graph);

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
    }, {
        key: "saveGraph",
        value: function saveGraph(graph) {
            console.log("VisualGraph.setState");
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
        key: "render",
        value: function render() {
            var _this2 = this;

            console.log("VisualGraph.render");
            if (this.state.graph) {
                this.renderGraph(this.state.graph);
            }

            return React.createElement(
                "svg",
                { id: "visualization", ref: function ref(_ref2) {
                        return _this2.svg = _ref2;
                    } },
                React.createElement("g", { id: "group", ref: function ref(_ref) {
                        return _this2.svgGroup = _ref;
                    } })
            );
        }
    }]);

    return VisualGraph;
}(React.Component);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFjTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BbEJwQixXQWtCb0IsR0FsQk47QUFDUCxjQUFXLEtBREo7QUFFUCxvQkFBaUI7QUFGVixHQWtCTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJ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QUFRLEdBQVIsQ0FBWSx1Q0FBWixFQUFxRCxTQUFyRDtBQUNBLGdCQUFJLFVBQVUsS0FBZCxFQUFxQjtBQUNqQixxQkFBSyxXQUFMLENBQWlCLE1BQWpCLENBQXdCLFVBQVUsS0FBbEMsRUFBeUMsS0FBSyxTQUFMLENBQWUsSUFBZixDQUFvQixJQUFwQixDQUF6QztBQUNIO0FBQ0o7OztpQ0FFUTtBQUFBOztBQUNMLG9CQUFRLEdBQVIsQ0FBWSxvQkFBWjtBQUNBLGdCQUFJLEtBQUssS0FBTCxDQUFXLEtBQWYsRUFBc0I7QUFDbEIscUJBQUssV0FBTCxDQUFpQixLQUFLLEtBQUwsQ0FBVyxLQUE1QjtBQUNIOztBQUVELG1CQUFPO0FBQUE7QUFBQSxrQkFBSyxJQUFHLGVBQVIsRUFBd0IsS0FBSyxhQUFDLEtBQUQ7QUFBQSwrQkFBUyxPQUFLLEdBQUwsR0FBVyxLQUFwQjtBQUFBLHFCQUE3QjtBQUNILDJDQUFHLElBQUcsT0FBTixFQUFjLEtBQUssYUFBQyxJQUFEO0FBQUEsK0JBQVMsT0FBSyxRQUFMLEdBQWdCLElBQXpCO0FBQUEscUJBQW5CO0FBREcsYUFBUDtBQUdIOzs7O0VBckVxQixNQUFNLFM7OztBQ0FoQyxTQUFTLEdBQVQsR0FBZTtBQUNiLFdBQVMsTUFBVCxDQUFnQixvQkFBQyxHQUFELE9BQWhCLEVBQXdCLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUF4QjtBQUNEOztBQUVELElBQU0sZUFBZSxDQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLGFBQXZCLENBQXJCOztBQUVBLElBQUksYUFBYSxRQUFiLENBQXNCLFNBQVMsVUFBL0IsS0FBOEMsU0FBUyxJQUEzRCxFQUFpRTtBQUMvRDtBQUNELENBRkQsTUFFTztBQUNMLFNBQU8sZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRkZWZhdWx0RWRnZSA9IHtcbiAgICAgICAgYXJyb3doZWFkOiBcInZlZVwiLFxuICAgICAgICBsaW5lSW50ZXJwb2xhdGU6IFwiYmFzaXNcIlxuICAgIH1cblxuXHRub2RlQ291bnRlciA9IHt9XG5cdG5vZGVTdGFjayA9IFtdXG5cdHByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJTY29wZShzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlLm5hbWUudmFsdWUpO1xuXHRcdGxldCBjdXJyZW50U2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoY3VycmVudFNjb3BlSWQsIHtcblx0XHRcdGxhYmVsOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0Y2x1c3RlckxhYmVsUG9zOiBcInRvcFwiLFxuICAgICAgICAgICAgY2xhc3M6IFwiU2NvcGVcIixcbiAgICAgICAgICAgIGlzTWV0YW5vZGU6IHRydWUsXG4gICAgICAgICAgICBfc291cmNlOiBzY29wZS5uYW1lLl9zb3VyY2Vcblx0XHR9KTtcblxuXHRcdGxldCBwcmV2aW91c1Njb3BlSWQgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChjdXJyZW50U2NvcGVJZCwgcHJldmlvdXNTY29wZUlkKTtcblx0fVxuXG5cdGV4aXRTY29wZSgpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZVxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJOZXR3b3JrXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKTtcblx0XHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2suZm9yRWFjaChmcm9tUGF0aCA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZShmcm9tUGF0aCwgbm9kZVBhdGgpXHRcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHRsYWJlbDogaWQsXG5cdFx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCBub2RlKTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgUmVkaWZpbmluZyBub2RlIFwiJHtpZH1cImApO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCBub2RlKTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXHRcdFxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNvcHkobWV0YW5vZGUsIGlkZW50aWZpZXIpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRpZDogaWRlbnRpZmllcixcblx0XHRcdGxhYmVsOiBpZGVudGlmaWVyLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZSxcblx0XHRcdGNsdXN0ZXJMYWJlbFBvczogXCJ0b3BcIixcbiAgICAgICAgICAgIGNsYXNzOiBcIlNjb3BlXCJcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZV07XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZWRnZS52LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgZWRnZS53LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhgRnJlZXppbmcgbm9kZSBzdGFjay4gQ29udGVudDogJHtKU09OLnN0cmluZ2lmeSh0aGlzLm5vZGVTdGFjayl9YCk7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5pc01ldGFub2RlID09PSB0cnVlO1xuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZShzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXHRcdGlmIChvdXRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIG91dHNbMF07XHRcblx0XHR9IGVsc2UgIGlmIChvdXRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFNjb3BlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgU2NvcGUgXCIke3Njb3BlLmlkfVwiIGhhcyBtb3JlIHRoYW4gb25lIE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXG5cdGdldElucHV0Tm9kZShzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5zID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKSB9KTtcblx0XHRpZiAoaW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGluc1swXTtcdFxuXHRcdH0gZWxzZSAgaWYgKGlucy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFNjb3BlIFwiJHtzY29wZS5pZH1cIiBoYXMgbW9yZSB0aGFuIG9uZSBJbnB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XHRcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cblx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0ZnJvbVBhdGggPSB0aGlzLmdldE91dHB1dE5vZGUoZnJvbVBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0dG9QYXRoID0gdGhpcy5nZXRJbnB1dE5vZGUodG9QYXRoKTtcblx0XHR9XG5cdFx0XG5cdFx0aWYgKGZyb21QYXRoICYmIHRvUGF0aCkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgsIHsuLi50aGlzLmRlZmF1bHRFZGdlfSk7XHRcblx0XHR9XG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5pbnNpZGUoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdHdvcmtlciA9IG5ldyBXb3JrZXIoXCJzcmMvc2NyaXB0cy9HcmFwaExheW91dFdvcmtlci5qc1wiKTtcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbigpe31cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBlbmNvZGUoZ3JhcGgpIHtcbiAgICBcdHJldHVybiBKU09OLnN0cmluZ2lmeShncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKSk7XG4gICAgfVxuXG4gICAgZGVjb2RlKGpzb24pIHtcbiAgICBcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoSlNPTi5wYXJzZShqc29uKSk7XG4gICAgfVxuXG4gICAgbGF5b3V0KGdyYXBoLCBjYWxsYmFjaykge1xuICAgIFx0Y29uc29sZS5sb2coXCJHcmFwaExheW91dC5sYXlvdXRcIiwgZ3JhcGgsIGNhbGxiYWNrKTtcbiAgICBcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICBcdFx0Z3JhcGg6IHRoaXMuZW5jb2RlKGdyYXBoKVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgcmVjZWl2ZShkYXRhKSB7XG4gICAgXHR2YXIgZ3JhcGggPSB0aGlzLmRlY29kZShkYXRhLmRhdGEuZ3JhcGgpO1xuICAgIFx0dGhpcy5jYWxsYmFjayhncmFwaCk7XG4gICAgfVxufSIsImNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0bW9uaWVsID0gbmV3IE1vbmllbCgpO1xuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0XCJncmFtbWFyXCI6IGdyYW1tYXIsXG5cdFx0XHRcInNlbWFudGljc1wiOiBzZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbFxuXHRcdH07XG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiVkdHMTZcIik7XG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmNvbXBpbGVUb0FTVCh0aGlzLnN0YXRlLmdyYW1tYXIsIHRoaXMuc3RhdGUuc2VtYW50aWNzLCB2YWx1ZSk7XG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdCk7XG5cdFx0XHR2YXIgZ3JhcGggPSB0aGlzLm1vbmllbC5nZXRDb21wdXRhdGlvbmFsR3JhcGgoKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogcmVzdWx0LmFzdCxcblx0XHRcdFx0Z3JhcGg6IGdyYXBoLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlXG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogYC9leGFtcGxlcy8ke2lkfS5tb25gLFxuXHRcdFx0ZGF0YTogbnVsbCxcblx0XHRcdHN1Y2Nlc3M6IGNhbGxiYWNrLmJpbmQodGhpcyksXG5cdFx0XHRkYXRhVHlwZTogXCJ0ZXh0XCJcblx0XHR9KTtcblx0fVxuXG5cdC8vIGludG8gTW9uaWVsPyBvciBQYXJzZXJcblx0Y29tcGlsZVRvQVNUKGdyYW1tYXIsIHNlbWFudGljcywgc291cmNlKSB7XG5cdFx0Y29uc29sZS5sb2coXCJjb21waWxlVG9BU1RcIik7XG5cdCAgICB2YXIgcmVzdWx0ID0gZ3JhbW1hci5tYXRjaChzb3VyY2UpO1xuXG5cdCAgICBpZiAocmVzdWx0LnN1Y2NlZWRlZCgpKSB7XG5cdCAgICAgICAgdmFyIGFzdCA9IHNlbWFudGljcyhyZXN1bHQpLmV2YWwoKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImFzdFwiOiBhc3Rcblx0ICAgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdCAgICAgICAgdmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpO1xuXHQgICAgICAgIHZhciBwb3NpdGlvbiA9IHJlc3VsdC5nZXRSaWdodG1vc3RGYWlsdXJlUG9zaXRpb24oKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImV4cGVjdGVkXCI6IGV4cGVjdGVkLFxuXHQgICAgICAgICAgICBcInBvc2l0aW9uXCI6IHBvc2l0aW9uXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdC8vY29uc29sZS5sb2coXCJJREUucmVuZGVyXCIpO1xuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIj5cbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiRGVmaW5pdGlvblwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdHJlZj17KHJlZikgPT4gdGhpcy5lZGl0b3IgPSByZWZ9XG4gICAgXHRcdFx0XHRtb2RlPVwibW9uaWVsXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHRpc3N1ZXM9e3RoaXMuc3RhdGUuaXNzdWVzfVxuICAgIFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0ZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0aGlnaGxpZ2h0UmFuZ2U9e3RoaXMuc3RhdGUuaGlnaGxpZ2h0UmFuZ2V9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIlZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHRncmFwaCA9IG5ldyBDb21wdXRhdGlvbmFsR3JhcGgodGhpcyk7XG5cblx0ZGVmaW5pdGlvbnMgPSBbXTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9ucy5wdXNoKGRlZmluaXRpb24pO1xuXHR9XG5cblx0aGFuZGxlU2NvcGVEZWZpbml0aW9uKHNjb3BlKSB7XG5cdFx0dGhpcy5ncmFwaC5lbnRlclNjb3BlKHNjb3BlKTtcblx0XHR0aGlzLndhbGtBc3Qoc2NvcGUuYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0U2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkoc2NvcGVCb2R5KSB7XG5cdFx0c2NvcGVCb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLndhbGtBc3QoYmxvY2tEZWZpbml0aW9uLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkoZGVmaW5pdGlvbkJvZHkpIHtcblx0XHRkZWZpbml0aW9uQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSkge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCBub2RlP1wiLCBub2RlKTtcblx0fVxuXG5cdGhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5ldHdvcmspIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHRuZXR3b3JrLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24oY29ubmVjdGlvbikge1xuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKTtcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHR0aGlzLndhbGtBc3QoaXRlbSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyB0aGlzIGlzIGRvaW5nIHRvbyBtdWNoIOKAkyBicmVhayBpbnRvIFwibm90IHJlY29nbml6ZWRcIiwgXCJzdWNjZXNzXCIgYW5kIFwiYW1iaWd1b3VzXCJcblx0aGFuZGxlQmxvY2tJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdHZhciBpZCA9IHVuZGVmaW5lZDtcblx0XHR2YXIgbGFiZWwgPSBcInVuZGVjbGFyZWRcIjtcblx0XHR2YXIgdHlwZSA9IFwiVW5rbm93blwiO1xuXHRcdHZhciBzaGFwZSA9IFwicmVjdFwiOyAvLyBzaG91bGQgbm90IGJlIGhlcmVcblx0XHR2YXIgY29sb3IgPSBcInllbGxvd1wiOyAvLyBzaG91bGQgbm90IGJlIGhlcmVcblxuXHRcdGxldCBwb3NzaWJsZVR5cGVzID0gdGhpcy5nZXRUeXBlT2ZJbnN0YW5jZShpbnN0YW5jZSk7XG5cblx0XHRpZiAocG9zc2libGVUeXBlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHR5cGUgPSBcInVuZGVmaW5lZFwiO1xuICAgICAgICAgICAgbGFiZWwgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgc2hhcGUgPSBcInJlY3RcIjsgLy8gc2hvdWxkIG5vdCBiZSBoZXJlXG4gICAgICAgICAgICB0aGlzLmFkZElzc3VlKHtcbiAgICAgICAgICAgIFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zc2libGVUeXBlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHR5cGUgPSBwb3NzaWJsZVR5cGVzWzBdO1xuXHRcdFx0bGFiZWwgPSB0eXBlO1xuXHRcdFx0Y29sb3IgPSBjb2xvckhhc2guaGV4KGxhYmVsKTsgLy8gc2hvdWxkIG5vdCBiZSBoZXJlXG5cdFx0fSBlbHNlIHtcblx0XHRcdHR5cGUgPSBcImFtYmlndW91c1wiXG4gICAgICAgICAgICBsYWJlbCA9IGluc3RhbmNlLm5hbWUudmFsdWVcbiAgICAgICAgICAgIHNoYXBlID0gXCJkaWFtb25kXCI7IC8vIHNob3VsZCBub3QgYmUgaGVyZVxuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke3Bvc3NpYmxlVHlwZXMuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRpZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIGlzIG1ldGFub2RlXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuZ3JhcGgubWV0YW5vZGVzKS5pbmNsdWRlcyh0eXBlKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5jb3B5KHR5cGUsIGlkKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUoaWQsIHtcblx0XHRcdGlkOiBpZCxcblx0XHRcdGxhYmVsOiBsYWJlbCxcbiAgICAgICAgICAgIGNsYXNzOiB0eXBlLFxuICAgICAgICAgICAgc2hhcGU6IHNoYXBlLCAvLyBzaG91bGQgbm90IGJlIGhlcmVcbiAgICAgICAgICAgIHN0eWxlOiBcImZpbGw6IFwiICsgY29sb3IsIC8vIHNob3VsZCBub3QgYmUgaGVyZVxuICAgICAgICAgICAgX3NvdXJjZTogaW5zdGFuY2UsXG4gICAgICAgICAgICB3aWR0aDogbGFiZWwubGVuZ3RoICogOC41LCAvLyBzaG91bGQgbm90IGJlIGhlcmVcbiAgICAgICAgICAgIGhlaWdodDogMTAgLy8gc2hvdWxkIG5vdCBiZSBoZXJlXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRnZXRUeXBlT2ZJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgVHJ5aW5nIHRvIG1hdGNoIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiIGFnYWluc3QgYmxvY2sgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Ly8gSEFDSzogVGhlcmUgc2hvdWxkIGJlIG9ubHkgb25lIHBsYWNlIHRvIHN0b3JlIGRlZmluaXRpb25zLlxuXHRcdHZhciBkZWZpbml0aW9ucyA9IFsuLi50aGlzLmRlZmluaXRpb25zLCAuLi5PYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcyldO1xuXHRcdHJldHVybiBNb25pZWwubmFtZVJlc29sdXRpb24oaW5zdGFuY2UubmFtZS52YWx1ZSwgZGVmaW5pdGlvbnMpO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoLyg/PVtBLVpdKS8pO1xuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdCgvKD89W0EtWl0pLykpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHQ8ZGl2IGNsYXNzTmFtZT1cImhlYWRlclwiPlxuICAgIFx0XHR7dGhpcy5wcm9wcy50aXRsZX1cbiAgICBcdDwvZGl2PlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29uc3RydWN0b3JcIik7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5kYWdyZVJlbmRlcmVyID0gbmV3IGRhZ3JlRDMucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29tcG9uZW50RGlkTW91bnRcIik7XG4gICAgICAgIC8qXG4gICAgICAgIHRoaXMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKS5vbihcInpvb21cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGQzLmV2ZW50LnRyYW5zbGF0ZSwgZDMuZXZlbnQuc2NhbGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZDMuc2VsZWN0KHRoaXMuc3ZnR3JvdXApKTtcbiAgICAgICAgICAgICAgICBkMy5zZWxlY3QodGhpcy5zdmdHcm91cCkuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIGQzLmV2ZW50LnRyYW5zbGF0ZSArIFwiKVwiICsgXCJzY2FsZShcIiArIGQzLmV2ZW50LnNjYWxlICsgXCIpXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMuc3ZnKS5jYWxsKHRoaXMuem9vbSk7XG4gICAgICAgICovXG4gICAgfVxuXG4gICAgcmVuZGVyR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5yZW5kZXJHcmFwaFwiKTtcbiAgICAgICAgdmFyIHN2ZyA9IGQzLnNlbGVjdCh0aGlzLnN2Zyk7XG4gICAgICAgIHZhciBncm91cCA9IGQzLnNlbGVjdCh0aGlzLnN2Z0dyb3VwKTtcblxuICAgICAgICB0aGlzLmRhZ3JlUmVuZGVyZXIoZDMuc2VsZWN0KHRoaXMuc3ZnR3JvdXApLCBncmFwaCk7XG5cbiAgICAgICAgdmFyIGdyYXBoV2lkdGggPSBncmFwaC5ncmFwaCgpLndpZHRoO1xuICAgICAgICB2YXIgZ3JhcGhIZWlnaHQgPSBncmFwaC5ncmFwaCgpLmhlaWdodDtcbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy5zdmcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGhcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuc3ZnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodFxuICAgICAgICB2YXIgem9vbVNjYWxlID0gTWF0aC5taW4od2lkdGggLyBncmFwaFdpZHRoLCBoZWlnaHQgLyBncmFwaEhlaWdodCk7XG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBbKCh3aWR0aC8yKSAtICgoZ3JhcGhXaWR0aCp6b29tU2NhbGUpLzIpKSwgKChoZWlnaHQvMikgLSAoZ3JhcGhIZWlnaHQqem9vbVNjYWxlKS8yKV07XG5cbiAgICAgICAgLy9ncm91cC50cmFuc2xhdGUodHJhbnNsYXRlKTtcbiAgICAgICAgLy9ncm91cC5zY2FsZSh6b29tU2NhbGUpO1xuXG4gICAgICAgIC8vIGNlbnRlclxuICAgICAgICBkMy5zZWxlY3QodGhpcy5zdmdHcm91cCkudHJhbnNpdGlvbigpLmR1cmF0aW9uKDI1MCkuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIHRyYW5zbGF0ZSArIFwiKXNjYWxlKFwiICsgem9vbVNjYWxlICsgXCIpXCIpO1xuICAgIH1cblxuICAgIHNhdmVHcmFwaChncmFwaCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLnNldFN0YXRlXCIpXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wc1wiLCBuZXh0UHJvcHMpO1xuICAgICAgICBpZiAobmV4dFByb3BzLmdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmdyYXBoTGF5b3V0LmxheW91dChuZXh0UHJvcHMuZ3JhcGgsIHRoaXMuc2F2ZUdyYXBoLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLnJlbmRlclwiKTtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyR3JhcGgodGhpcy5zdGF0ZS5ncmFwaCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPHN2ZyBpZD1cInZpc3VhbGl6YXRpb25cIiByZWY9eyhyZWYpID0+IHRoaXMuc3ZnID0gcmVmfT5cbiAgICAgICAgICAgIDxnIGlkPVwiZ3JvdXBcIiByZWY9eyhyZWYpID0+IHRoaXMuc3ZnR3JvdXAgPSByZWZ9PjwvZz5cbiAgICAgICAgPC9zdmc+O1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
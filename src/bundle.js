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
			if (this.graph.hasNode(nodePath)) {
				this.nodeStack.push(nodePath);
				console.log(this.previousNodeStack, nodePath);

				if (this.previousNodeStack.length === 1) {
					this.setEdge(this.previousNodeStack[0], nodePath);
				} else {
					this.setEdge(this.previousNodeStack, nodePath);
				}

				/*
    this.previousNodeStack.forEach(fromPath => {
    	this.setEdge(fromPath, nodePath)	
    });
    */
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
			var _this = this;

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
				_this.graph.setNode(newNodeId, newNode);

				var newParent = targetMetanode.parent(nodeId).replace(".", nodePath);
				_this.graph.setParent(newNodeId, newParent);
			});

			targetMetanode.edges().forEach(function (edge) {
				_this.graph.setEdge(edge.v.replace(".", nodePath), edge.w.replace(".", nodePath), targetMetanode.edge(edge));
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
		key: "getOutputNodes",
		value: function getOutputNodes(scopePath) {
			var _this2 = this;

			var scope = this.graph.node(scopePath);
			var outputNodes = this.graph.children(scopePath).filter(function (node) {
				return _this2.isOutput(node);
			});

			if (outputNodes.length === 0) {
				this.moniel.logger.addIssue({
					message: "Metanode \"" + scope.id + "\" doesn't have any Output node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			}

			return outputNodes;
		}
	}, {
		key: "getInputNodes",
		value: function getInputNodes(scopePath) {
			var _this3 = this;

			var scope = this.graph.node(scopePath);
			var inputNodes = this.graph.children(scopePath).filter(function (node) {
				return _this3.isInput(node);
			});

			if (inputNodes.length === 0) {
				this.moniel.logger.addIssue({
					message: "Metanode \"" + scope.id + "\" doesn't have any Input nodes.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
			}

			return inputNodes;
		}
	}, {
		key: "setEdge",
		value: function setEdge(fromPath, toPath) {
			// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)
			var sourcePaths;

			if (typeof fromPath === "string") {
				if (this.isMetanode(fromPath)) {
					sourcePaths = this.getOutputNodes(fromPath);
				} else {
					sourcePaths = [fromPath];
				}
			} else if (Array.isArray(fromPath)) {
				sourcePaths = fromPath;
			}

			var targetPaths;

			if (typeof toPath === "string") {
				if (this.isMetanode(toPath)) {
					targetPaths = this.getInputNodes(toPath);
				} else {
					targetPaths = [toPath];
				}
			} else if (Array.isArray(toPath)) {
				targetPaths = toPath;
			}

			this.setMultiEdge(sourcePaths, targetPaths);
		}
	}, {
		key: "setMultiEdge",
		value: function setMultiEdge(sourcePaths, targetPaths) {
			var _this4 = this;

			console.log("setMultiEdge", sourcePaths, targetPaths);

			if (sourcePaths === null || targetPaths === null) {
				return;
			}

			if (sourcePaths.length === targetPaths.length) {
				for (var i = 0; i < sourcePaths.length; i++) {
					if (sourcePaths[i] && targetPaths[i]) {
						this.graph.setEdge(sourcePaths[i], targetPaths[i], _extends({}, this.defaultEdge));
					}
				}
			} else {
				if (targetPaths.length === 1) {
					sourcePaths.forEach(function (sourcePath) {
						return _this4.graph.setEdge(sourcePath, targetPaths[0], _extends({}, _this4.defaultEdge));
					});
				} else if (sourcePaths.length === 1) {
					targetPaths.forEach(function (targetPath) {
						return _this4.graph.setEdge(sourcePaths[0], targetPath, _extends({}, _this4.defaultEdge));
					});
				} else {
					this.moniel.logger.addIssue({
						message: "Number of nodes does not match. [" + sourcePaths.length + "] -> [" + targetPaths.length + "]",
						type: "error",
						position: {
							// start: scope._source ? scope._source.startIdx : 0,
							// end:  scope._source ? scope._source.endIdx : 0
						}
					});
				}
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
			// console.log(this.graph)
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
                fontFamily: "Fira Code",
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

			//console.log("IDE.render");

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
                console.log(this.state.graph);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFXTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BZnBCLFdBZW9CLEdBZk4sRUFlTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixNQUFNLElBQU4sQ0FBVyxLQUFoQztBQUNB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LEVBQWEsUUFBYixFQUF1QixhQUF2QixDQUFyQjs7QUFFQSxJQUFJLGFBQWEsUUFBYixDQUFzQixTQUFTLFVBQS9CLEtBQThDLFNBQVMsSUFBM0QsRUFBaUU7QUFDL0Q7QUFDRCxDQUZELE1BRU87QUFDTCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbXB1dGF0aW9uYWxHcmFwaHtcblx0ZGVmYXVsdEVkZ2UgPSB7fVxuXG5cdG5vZGVDb3VudGVyID0ge31cblx0bm9kZVN0YWNrID0gW11cblx0cHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXHRzY29wZVN0YWNrID0gbmV3IFNjb3BlU3RhY2soKVxuXG5cdG1ldGFub2RlcyA9IHt9XG5cdG1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdGdldCBncmFwaCgpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbGFzdEluZGV4XTtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubW9uaWVsID0gcGFyZW50O1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLm5vZGVDb3VudGVyID0ge31cblx0XHR0aGlzLnNjb3BlU3RhY2suaW5pdGlhbGl6ZSgpO1xuXG5cdFx0dGhpcy5tZXRhbm9kZXMgPSB7fVxuXHRcdHRoaXMubWV0YW5vZGVTdGFjayA9IFtdXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlclNjb3BlKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUubmFtZS52YWx1ZSk7XG5cdFx0bGV0IGN1cnJlbnRTY29wZUlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgcHJldmlvdXNTY29wZUlkID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoY3VycmVudFNjb3BlSWQsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogc2NvcGUubmFtZS52YWx1ZSxcbiAgICAgICAgICAgIGNsYXNzOiBcIk1ldGFub2RlXCIsXG4gICAgICAgICAgICBpc01ldGFub2RlOiB0cnVlLFxuICAgICAgICAgICAgX3NvdXJjZTogc2NvcGUubmFtZS5fc291cmNlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChjdXJyZW50U2NvcGVJZCwgcHJldmlvdXNTY29wZUlkKTtcblx0fVxuXG5cdGV4aXRTY29wZSgpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrLnB1c2gobm9kZVBhdGgpO1xuXHRcdFx0Y29uc29sZS5sb2codGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFja1swXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0XHRcblxuXHRcdFx0XG5cdFx0XHQvKlxuXHRcdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjay5mb3JFYWNoKGZyb21QYXRoID0+IHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKGZyb21QYXRoLCBub2RlUGF0aClcdFxuXHRcdFx0fSk7XG5cdFx0XHQqL1xuXG5cdFx0XHRcblx0XHRcdFxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRpZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG1ldGFub2RlQ2xhc3MsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZGVudGlmaWVyKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXHRcdFxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aCxcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0ZnJlZXplTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbLi4udGhpcy5ub2RlU3RhY2tdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCk7XG5cdH1cblxuXHRpc0lucHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIjtcblx0fVxuXG5cdGlzT3V0cHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiT3V0cHV0XCI7XG5cdH1cblxuXHRpc01ldGFub2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZTtcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBvdXRwdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXG5cdFx0aWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1x0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dE5vZGVzO1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzSW5wdXQobm9kZSl9KTtcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IElucHV0IG5vZGVzLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXM7XG5cdH1cblxuXHRzZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYENyZWF0aW5nIGVkZ2UgZnJvbSBcIiR7ZnJvbVBhdGh9XCIgdG8gXCIke3RvUGF0aH1cIi5gKVxuXHRcdHZhciBzb3VyY2VQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiBmcm9tUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZShmcm9tUGF0aCkpIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSB0aGlzLmdldE91dHB1dE5vZGVzKGZyb21QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSBbZnJvbVBhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZyb21QYXRoKSkge1xuXHRcdFx0c291cmNlUGF0aHMgPSBmcm9tUGF0aFxuXHRcdH1cblxuXHRcdHZhciB0YXJnZXRQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiB0b1BhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IHRoaXMuZ2V0SW5wdXROb2Rlcyh0b1BhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IFt0b1BhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRvUGF0aCkpIHtcblx0XHRcdHRhcmdldFBhdGhzID0gdG9QYXRoXG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKVxuXHR9XG5cblx0c2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocykge1xuXHRcdGNvbnNvbGUubG9nKFwic2V0TXVsdGlFZGdlXCIsIHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHsuLi50aGlzLmRlZmF1bHRFZGdlfSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0sIHsuLi50aGlzLmRlZmF1bHRFZGdlfSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5ncmFwaC5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmluc2lkZShjLnJvdywgYy5jb2x1bW4pKS5yZWR1Y2UoIChwcmV2LCBjdXJyKSA9PiBwcmV2IHx8IGN1cnIsIGZhbHNlKTtcblxuICAgICAgICBpZiAoY3Vyc29yT3Zlck1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSBDb2RlXCIsXG4gICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgICBzaG93R3V0dGVyOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5lZGl0b3IuY29udGFpbmVyLnN0eWxlLmxpbmVIZWlnaHQgPSAxLjc7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRvci5vbihcImNoYW5nZVwiLCB0aGlzLm9uQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLm9uKFwiY2hhbmdlQ3Vyc29yXCIsIHRoaXMub25DdXJzb3JQb3NpdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9ucyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJvdzogcG9zaXRpb24ucm93LFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW46IHBvc2l0aW9uLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNzdWUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXNzdWUudHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLnNldEFubm90YXRpb25zKGFubm90YXRpb25zKTtcbiAgICAgICAgICAgIC8vdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuXG4gICAgICAgICAgICB2YXIgUmFuZ2UgPSByZXF1aXJlKCdhY2UvcmFuZ2UnKS5SYW5nZTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXJrZXJzID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCksXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLmVuZClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSBuZXcgUmFuZ2UocG9zaXRpb24uc3RhcnQucm93LCBwb3NpdGlvbi5zdGFydC5jb2x1bW4sIHBvc2l0aW9uLmVuZC5yb3csIHBvc2l0aW9uLmVuZC5jb2x1bW4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrZXJzLnB1c2godGhpcy5lZGl0b3Iuc2Vzc2lvbi5hZGRNYXJrZXIocmFuZ2UsIFwibWFya2VyX2Vycm9yXCIsIFwidGV4dFwiKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uY2xlYXJBbm5vdGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRQcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUobmV4dFByb3BzLnZhbHVlLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IHJlZj17IChlbGVtZW50KSA9PiB0aGlzLmluaXQoZWxlbWVudCkgfT48L2Rpdj47XG4gICAgfVxufSIsImNsYXNzIEdyYXBoTGF5b3V0e1xuXHR3b3JrZXIgPSBuZXcgV29ya2VyKFwic3JjL3NjcmlwdHMvR3JhcGhMYXlvdXRXb3JrZXIuanNcIik7XG5cdGNhbGxiYWNrID0gZnVuY3Rpb24oKXt9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZW5jb2RlKGdyYXBoKSB7XG4gICAgXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaCkpO1xuICAgIH1cblxuICAgIGRlY29kZShqc29uKSB7XG4gICAgXHRyZXR1cm4gZ3JhcGhsaWIuanNvbi5yZWFkKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH1cblxuICAgIGxheW91dChncmFwaCwgY2FsbGJhY2spIHtcbiAgICBcdC8vY29uc29sZS5sb2coXCJHcmFwaExheW91dC5sYXlvdXRcIiwgZ3JhcGgsIGNhbGxiYWNrKTtcbiAgICBcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICBcdFx0Z3JhcGg6IHRoaXMuZW5jb2RlKGdyYXBoKVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgcmVjZWl2ZShkYXRhKSB7XG4gICAgXHR2YXIgZ3JhcGggPSB0aGlzLmRlY29kZShkYXRhLmRhdGEuZ3JhcGgpO1xuICAgIFx0dGhpcy5jYWxsYmFjayhncmFwaCk7XG4gICAgfVxufSIsImNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0bW9uaWVsID0gbmV3IE1vbmllbCgpO1xuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0XCJncmFtbWFyXCI6IGdyYW1tYXIsXG5cdFx0XHRcInNlbWFudGljc1wiOiBzZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbFxuXHRcdH07XG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpO1xuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jb21waWxlVG9BU1QodGhpcy5zdGF0ZS5ncmFtbWFyLCB0aGlzLnN0YXRlLnNlbWFudGljcywgdmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpO1xuXHRcdFx0dmFyIGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0aXNzdWVzOiB0aGlzLm1vbmllbC5nZXRJc3N1ZXMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogbnVsbCxcblx0XHRcdFx0Z3JhcGg6IG51bGwsXG5cdFx0XHRcdGlzc3VlczogW3tcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IHJlc3VsdC5wb3NpdGlvbiAtIDEsXG5cdFx0XHRcdFx0XHRlbmQ6IHJlc3VsdC5wb3NpdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWVzc2FnZTogXCJFeHBlY3RlZCBcIiArIHJlc3VsdC5leHBlY3RlZCArIFwiLlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0XHR9XVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnNvbGUudGltZUVuZChcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsXG5cdFx0XHRkYXRhOiBudWxsLFxuXHRcdFx0c3VjY2VzczogY2FsbGJhY2suYmluZCh0aGlzKSxcblx0XHRcdGRhdGFUeXBlOiBcInRleHRcIlxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gaW50byBNb25pZWw/IG9yIFBhcnNlclxuXHRjb21waWxlVG9BU1QoZ3JhbW1hciwgc2VtYW50aWNzLCBzb3VyY2UpIHtcblx0ICAgIHZhciByZXN1bHQgPSBncmFtbWFyLm1hdGNoKHNvdXJjZSk7XG5cblx0ICAgIGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0ICAgICAgICB2YXIgYXN0ID0gc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiYXN0XCI6IGFzdFxuXHQgICAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0ICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KCk7XG5cdCAgICAgICAgdmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiZXhwZWN0ZWRcIjogZXhwZWN0ZWQsXG5cdCAgICAgICAgICAgIFwicG9zaXRpb25cIjogcG9zaXRpb25cblx0ICAgICAgICB9XG5cdCAgICB9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIklERS5yZW5kZXJcIik7XG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCI+XG4gICAgXHRcdDxQYW5lbCBpZD1cImRlZmluaXRpb25cIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRyZWY9eyhyZWYpID0+IHRoaXMuZWRpdG9yID0gcmVmfVxuICAgIFx0XHRcdFx0bW9kZT1cIm1vbmllbFwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0aXNzdWVzPXt0aGlzLnN0YXRlLmlzc3Vlc31cbiAgICBcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGhpZ2hsaWdodFJhbmdlPXt0aGlzLnN0YXRlLmhpZ2hsaWdodFJhbmdlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHRcdFxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgXHRcdFx0PFZpc3VhbEdyYXBoIGdyYXBoPXt0aGlzLnN0YXRlLmdyYXBofSAvPlxuICAgIFx0XHQ8L1BhbmVsPlxuXG4gICAgXHRcdHsvKlxuICAgIFx0XHQ8UGFuZWwgdGl0bGU9XCJBU1RcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwianNvblwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0dmFsdWU9e0pTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0Ki99XG4gICAgXHRcdFxuICAgIFx0PC9kaXY+O1xuICBcdH1cbn0iLCJjbGFzcyBMb2dnZXJ7XG5cdGlzc3VlcyA9IFtdXG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5pc3N1ZXMgPSBbXTtcblx0fVxuXHRcblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmlzc3Vlcztcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dmFyIGYgPSBudWxsO1xuXHRcdHN3aXRjaChpc3N1ZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiZXJyb3JcIjogZiA9IGNvbnNvbGUuZXJyb3I7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndhcm5pbmdcIjogZiA9IGNvbnNvbGUud2FybjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiaW5mb1wiOiBmID0gY29uc29sZS5pbmZvOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IGYgPSBjb25zb2xlLmxvZzsgYnJlYWs7XG5cdFx0fVxuXHRcdGYoaXNzdWUubWVzc2FnZSk7XG5cdFx0dGhpcy5pc3N1ZXMucHVzaChpc3N1ZSk7XG5cdH1cbn0iLCJjbGFzcyBNb25pZWx7XG5cdGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblx0Z3JhcGggPSBuZXcgQ29tcHV0YXRpb25hbEdyYXBoKHRoaXMpO1xuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0fVxuXG5cdGFkZERlZmF1bHREZWZpbml0aW9ucygpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBkZWZhdWx0IGRlZmluaXRpb25zLmApO1xuXHRcdGNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcIkFkZFwiLCBcIkxpbmVhclwiLCBcIklucHV0XCIsIFwiT3V0cHV0XCIsIFwiUGxhY2Vob2xkZXJcIiwgXCJWYXJpYWJsZVwiLCBcIkNvbnN0YW50XCIsIFwiTXVsdGlwbHlcIiwgXCJDb252b2x1dGlvblwiLCBcIkRlbnNlXCIsIFwiTWF4UG9vbGluZ1wiLCBcIkJhdGNoTm9ybWFsaXphdGlvblwiLCBcIklkZW50aXR5XCIsIFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIlNpZ21vaWRcIiwgXCJFeHBvbmVudGlhbExpbmVhclVuaXRcIiwgXCJUYW5oXCIsIFwiQWJzb2x1dGVcIiwgXCJTdW1tYXRpb25cIiwgXCJEcm9wb3V0XCIsIFwiTWF0cml4TXVsdGlwbHlcIiwgXCJCaWFzQWRkXCIsIFwiUmVzaGFwZVwiLCBcIkNvbmNhdFwiLCBcIkZsYXR0ZW5cIiwgXCJUZW5zb3JcIiwgXCJTb2Z0bWF4XCIsIFwiQ3Jvc3NFbnRyb3B5XCIsIFwiWmVyb1BhZGRpbmdcIiwgXCJSYW5kb21Ob3JtYWxcIiwgXCJUcnVuY2F0ZWROb3JtYWxEaXN0cmlidXRpb25cIiwgXCJEb3RQcm9kdWN0XCJdO1xuXHRcdGRlZmF1bHREZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5hZGREZWZpbml0aW9uKGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGFkZERlZmluaXRpb24oZGVmaW5pdGlvbk5hbWUpIHtcblx0XHR0aGlzLmRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSA9IHtcblx0XHRcdG5hbWU6IGRlZmluaXRpb25OYW1lLFxuXHRcdFx0Y29sb3I6IGNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbihzY29wZSkge1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJTY29wZShzY29wZSk7XG5cdFx0dGhpcy53YWxrQXN0KHNjb3BlLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdFNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVTY29wZURlZmluaXRpb25Cb2R5KHNjb3BlQm9keSkge1xuXHRcdHNjb3BlQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24pwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke2Jsb2NrRGVmaW5pdGlvbi5uYW1lfVwiIHRvIGF2YWlsYWJsZSBkZWZpbml0aW9ucy5gKTtcblx0XHR0aGlzLmFkZERlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLndhbGtBc3QoYmxvY2tEZWZpbml0aW9uLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkoZGVmaW5pdGlvbkJvZHkpIHtcblx0XHRkZWZpbml0aW9uQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSkge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCBub2RlP1wiLCBub2RlKTtcblx0fVxuXG5cdGhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5ldHdvcmspIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHRuZXR3b3JrLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24oY29ubmVjdGlvbikge1xuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKTtcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHR0aGlzLndhbGtBc3QoaXRlbSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyB0aGlzIGlzIGRvaW5nIHRvbyBtdWNoIOKAkyBicmVhayBpbnRvIFwibm90IHJlY29nbml6ZWRcIiwgXCJzdWNjZXNzXCIgYW5kIFwiYW1iaWd1b3VzXCJcblx0aGFuZGxlQmxvY2tJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0aWQ6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzOiBcIlVua25vd25cIixcblx0XHRcdGNvbG9yOiBcImRhcmtncmV5XCIsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0d2lkdGg6IDEwMCxcblxuXHRcdFx0X3NvdXJjZTogaW5zdGFuY2UsXG5cdFx0fTtcblxuXHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKGluc3RhbmNlLm5hbWUudmFsdWUpXG5cdFx0Ly8gY29uc29sZS5sb2coYE1hdGNoZWQgZGVmaW5pdGlvbnM6YCwgZGVmaW5pdGlvbnMpO1xuXG5cdFx0aWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG4gICAgICAgICAgICBub2RlLmlzVW5kZWZpbmVkID0gdHJ1ZVxuXG4gICAgICAgICAgICB0aGlzLmFkZElzc3VlKHtcbiAgICAgICAgICAgIFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3I7XG5cdFx0XHRcdG5vZGUuY2xhc3MgPSBkZWZpbml0aW9uLm5hbWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gYFwiJHtkZWYubmFtZX1cImApLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5hbGlhcykge1xuXHRcdFx0bm9kZS5pZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKG5vZGUuY2xhc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmlkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLnVzZXJHZW5lcmF0ZWRJZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS5oZWlnaHQgPSA1MDtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdHZhciBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpO1xuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMTtcblx0XHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUobm9kZS5pZCwgbm9kZS5jbGFzcywge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZToge1wiZmlsbFwiOiBjb2xvci50b1N0cmluZygpfVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVOb2RlKG5vZGUuaWQsIHtcblx0XHRcdC4uLm5vZGUsXG4gICAgICAgICAgICBzdHlsZToge1wiZmlsbFwiOiBub2RlLmNvbG9yfSxcbiAgICAgICAgICAgIHdpZHRoOiBNYXRoLm1heChNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSwgNSkgKiAxMlxuICAgICAgICB9KTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrTGlzdChsaXN0KSB7XG5cdFx0bGlzdC5saXN0LmZvckVhY2goaXRlbSA9PiB0aGlzLndhbGtBc3QoaXRlbSkpO1xuXHR9XG5cblx0aGFuZGxlSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG5cdFx0dGhpcy5ncmFwaC5yZWZlcmVuY2VOb2RlKGlkZW50aWZpZXIudmFsdWUpO1xuXHR9XG5cblx0bWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKHF1ZXJ5KSB7XG5cdFx0dmFyIGRlZmluaXRpb25zID0gT2JqZWN0LmtleXModGhpcy5kZWZpbml0aW9ucyk7XG5cdFx0bGV0IGRlZmluaXRpb25LZXlzID0gTW9uaWVsLm5hbWVSZXNvbHV0aW9uKHF1ZXJ5LCBkZWZpbml0aW9ucyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIkZvdW5kIGtleXNcIiwgZGVmaW5pdGlvbktleXMpO1xuXHRcdGxldCBtYXRjaGVkRGVmaW5pdGlvbnMgPSBkZWZpbml0aW9uS2V5cy5tYXAoa2V5ID0+IHRoaXMuZGVmaW5pdGlvbnNba2V5XSk7XG5cdFx0cmV0dXJuIG1hdGNoZWREZWZpbml0aW9ucztcblx0fVxuXG5cdGdldENvbXB1dGF0aW9uYWxHcmFwaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRHcmFwaCgpO1xuXHR9XG5cblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmxvZ2dlci5nZXRJc3N1ZXMoKTtcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dGhpcy5sb2dnZXIuYWRkSXNzdWUoaXNzdWUpO1xuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvO1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoc3BsaXRSZWdleCk7XG5cdCAgICBsZXQgbGlzdEFycmF5ID0gbGlzdC5tYXAoZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLnNwbGl0KHNwbGl0UmVnZXgpKTtcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gTW9uaWVsLmlzTXVsdGlQcmVmaXgocGFydGlhbEFycmF5LCBwb3NzaWJsZU1hdGNoKSk7XG5cdCAgICByZXN1bHQgPSByZXN1bHQubWFwKGl0ZW0gPT4gaXRlbS5qb2luKFwiXCIpKTtcblx0ICAgIHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRzdGF0aWMgaXNNdWx0aVByZWZpeChuYW1lLCB0YXJnZXQpIHtcblx0ICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gdGFyZ2V0Lmxlbmd0aCkgeyByZXR1cm4gZmFsc2U7IH1cblx0ICAgIHZhciBpID0gMDtcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDE7IH1cblx0ICAgIHJldHVybiAoaSA9PT0gbmFtZS5sZW5ndGgpOyAvLyBnb3QgdG8gdGhlIGVuZD9cblx0fVxuXG5cdHdhbGtBc3Qobm9kZSkge1xuXHRcdGlmICghbm9kZSkgeyBjb25zb2xlLmVycm9yKFwiTm8gbm9kZT8hXCIpOyByZXR1cm47IH1cblxuXHRcdHN3aXRjaCAobm9kZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiTmV0d29ya1wiOiB0aGlzLmhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJTY29wZURlZmluaXRpb25cIjogdGhpcy5oYW5kbGVTY29wZURlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVTY29wZURlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0luc3RhbmNlXCI6IHRoaXMuaGFuZGxlQmxvY2tJbnN0YW5jZShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tMaXN0XCI6IHRoaXMuaGFuZGxlQmxvY2tMaXN0KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJZGVudGlmaWVyXCI6IHRoaXMuaGFuZGxlSWRlbnRpZmllcihub2RlKTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aGlzLmhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSk7XG5cdFx0fVxuXHR9XG59IiwiY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPGRpdiBpZD17dGhpcy5wcm9wcy5pZH0gY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICBcdHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgIDwvZGl2PjtcbiAgfVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY2xhc3MgVmlzdWFsR3JhcGggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbnN0cnVjdG9yXCIpO1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsLFxuICAgICAgICAgICAgcHJldmlvdXNWaWV3Qm94OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzXCIsIG5leHRQcm9wcyk7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCwgdGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhub2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZFwiLCBub2RlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGU6IG5vZGUuaWRcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZG9tTm9kZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdyYXBoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBnID0gdGhpcy5zdGF0ZS5ncmFwaDtcblxuICAgICAgICBsZXQgbm9kZXMgPSBnLm5vZGVzKCkubWFwKG5vZGVOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBncmFwaCA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShub2RlTmFtZSk7XG4gICAgICAgICAgICBsZXQgbm9kZSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBub2RlTmFtZSxcbiAgICAgICAgICAgICAgICBub2RlOiBuLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGdyYXBoLmhhbmRsZUNsaWNrLmJpbmQoZ3JhcGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuLmlzTWV0YW5vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gPE1ldGFub2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuLnVzZXJHZW5lcmF0ZWRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPElkZW50aWZpZWROb2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxBbm9ueW1vdXNOb2RlIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZWRnZXMgPSBnLmVkZ2VzKCkubWFwKGVkZ2VOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBlID0gZy5lZGdlKGVkZ2VOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiA8RWRnZSBrZXk9e2Ake2VkZ2VOYW1lLnZ9LT4ke2VkZ2VOYW1lLnd9YH0gZWRnZT17ZX0vPlxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmlld0JveF93aG9sZSA9IGAwIDAgJHtnLmdyYXBoKCkud2lkdGh9ICR7Zy5ncmFwaCgpLmhlaWdodH1gO1xuICAgICAgICB2YXIgdHJhbnNmb3JtVmlldyA9IGB0cmFuc2xhdGUoMHB4LDBweClgICsgYHNjYWxlKCR7Zy5ncmFwaCgpLndpZHRoIC8gZy5ncmFwaCgpLndpZHRofSwke2cuZ3JhcGgoKS5oZWlnaHQgLyBnLmdyYXBoKCkuaGVpZ2h0fSlgO1xuICAgICAgICBcbiAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlO1xuICAgICAgICB2YXIgdmlld0JveFxuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShzZWxlY3RlZE5vZGUpO1xuICAgICAgICAgICAgdmlld0JveCA9IGAke24ueCAtIG4ud2lkdGggLyAyfSAke24ueSAtIG4uaGVpZ2h0IC8gMn0gJHtuLndpZHRofSAke24uaGVpZ2h0fWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdCb3ggPSB2aWV3Qm94X3dob2xlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPHN2ZyBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudC5iaW5kKHRoaXMpfSBhdHRyaWJ1dGVOYW1lPVwidmlld0JveFwiIGZyb209e3ZpZXdCb3hfd2hvbGV9IHRvPXt2aWV3Qm94fSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCI+PC9hbmltYXRlPlxuICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgPG1hcmtlciBpZD1cInZlZVwiIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiByZWZYPVwiMTBcIiByZWZZPVwiNVwiIG1hcmtlclVuaXRzPVwic3Ryb2tlV2lkdGhcIiBtYXJrZXJXaWR0aD1cIjEwXCIgbWFya2VySGVpZ2h0PVwiNy41XCIgb3JpZW50PVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDMgNSB6XCIgY2xhc3NOYW1lPVwiYXJyb3dcIj48L3BhdGg+XG4gICAgICAgICAgICAgICAgPC9tYXJrZXI+XG4gICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICA8ZyBpZD1cImdyYXBoXCI+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJub2Rlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7bm9kZXN9XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwiZWRnZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge2VkZ2VzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgPC9zdmc+O1xuICAgIH1cbn1cblxuY2xhc3MgRWRnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBsaW5lID0gZDMubGluZSgpXG4gICAgICAgIC5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgLnkoZCA9PiBkLnkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogW11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IHRoaXMucHJvcHMuZWRnZS5wb2ludHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgZG9tTm9kZS5iZWdpbkVsZW1lbnQoKSAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLnByb3BzLmVkZ2U7XG4gICAgICAgIGxldCBsID0gdGhpcy5saW5lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVBhdGhcIiBtYXJrZXJFbmQ9XCJ1cmwoI3ZlZSlcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPXtsKGUucG9pbnRzKX0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudH0ga2V5PXtNYXRoLnJhbmRvbSgpfSByZXN0YXJ0PVwiYWx3YXlzXCIgZnJvbT17bCh0aGlzLnN0YXRlLnByZXZpb3VzUG9pbnRzKX0gdG89e2woZS5wb2ludHMpfSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCIgYXR0cmlidXRlTmFtZT1cImRcIiAvPlxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Bub2RlICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHN0eWxlPXt7dHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7bi54IC0obi53aWR0aC8yKX1weCwke24ueSAtKG4uaGVpZ2h0LzIpfXB4KWB9fT5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9IHRleHRBbmNob3I9XCJzdGFydFwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PiA8L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBJZGVudGlmaWVkTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
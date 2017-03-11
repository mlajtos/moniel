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
			this.clearNodeStack();

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
				id: scope.name.value,
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

				if (this.previousNodeStack.length === 1) {
					this.setEdge(this.previousNodeStack[0], nodePath);
				} else {
					this.setEdge(this.previousNodeStack, nodePath);
				}
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
						return _this4.setEdge(sourcePath, targetPaths[0]);
					});
				} else if (sourcePaths.length === 1) {
					targetPaths.forEach(function (targetPath) {
						return _this4.setEdge(sourcePaths[0], targetPath);
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

var ipc = require("electron").ipcRenderer;
var fs = require("fs");

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
			"issues": null,
			"layout": "columns"
		};

		ipc.on('save', function (event, message) {
			fs.writeFile(message.folder + "/source.mon", this.state.networkDefinition, function (err) {
				if (err) throw errs;
			});
			fs.writeFile(message.folder + "/source.ast.json", JSON.stringify(this.state.ast, null, 2), function (err) {
				if (err) throw errs;
			});

			var saveNotification = new Notification('Sketch saved', {
				body: "Sketch was successfully saved in the \"sketches\" folder.",
				silent: true
			});
		}.bind(_this));

		var layout = window.localStorage.getItem("layout");
		if (layout) {
			if (layout == "columns" || layout == "rows") {
				_this.state.layout = layout;
			} else {
				_this.moniel.logger.addIssue({
					type: "warning",
					message: "Value for \"layout\" can be only \"columns\" or \"rows\"."
				});
			}
		}

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
		key: "toggleLayout",
		value: function toggleLayout() {
			this.setState({
				layout: this.state.layout === "columns" ? "rows" : "columns"
			});
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

			var containerLayout = this.state.layout;
			var graphLayout = this.state.layout === "columns" ? "BT" : "LR";

			return React.createElement(
				"div",
				{ id: "container", className: "container " + containerLayout },
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
						defaultValue: this.state.networkDefinition
					})
				),
				React.createElement(
					Panel,
					{ id: "visualization" },
					React.createElement(VisualGraph, { graph: this.state.graph, layout: graphLayout })
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
                nextProps.graph._label.rankdir = nextProps.layout;
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
                // console.log(this.state.graph)
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFXTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BZnBCLFdBZW9CLEdBZk4sRUFlTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7QUFDQSxRQUFLLGNBQUw7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixNQUFNLElBQU4sQ0FBVyxLQUFoQztBQUNBLE9BQUksaUJBQWlCLEtBQUssVUFBTCxDQUFnQixzQkFBaEIsRUFBckI7QUFDQSxPQUFJLGtCQUFrQixLQUFLLFVBQUwsQ0FBZ0IsdUJBQWhCLEVBQXRCOztBQUVBLFFBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsY0FBbkIsRUFBbUM7QUFDbEMscUJBQWlCLE1BQU0sSUFBTixDQUFXLEtBRE07QUFFbEMsUUFBSSxNQUFNLElBQU4sQ0FBVyxLQUZtQjtBQUd6QixXQUFPLFVBSGtCO0FBSXpCLGdCQUFZLElBSmE7QUFLekIsYUFBUyxNQUFNLElBQU4sQ0FBVztBQUxLLElBQW5DOztBQVFBLFFBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsY0FBckIsRUFBcUMsZUFBckM7QUFDQTs7OzhCQUVXO0FBQ1gsUUFBSyxVQUFMLENBQWdCLEdBQWhCO0FBQ0E7OztxQ0FFa0IsSSxFQUFNO0FBQ3hCLFFBQUssU0FBTCxDQUFlLElBQWYsSUFBdUIsSUFBSSxTQUFTLEtBQWIsQ0FBbUI7QUFDekMsY0FBVTtBQUQrQixJQUFuQixDQUF2QjtBQUdBLFFBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsUUFBckIsQ0FBOEI7QUFDN0IsVUFBTSxJQUR1QjtBQUV2QixhQUFTLElBRmM7QUFHdkIsYUFBUyxFQUhjO0FBSXZCLGFBQVMsRUFKYztBQUt2QixhQUFTLEVBTGM7QUFNdkIsYUFBUyxFQU5jO0FBT3ZCLGFBQVM7QUFQYyxJQUE5QjtBQVNBLFFBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixJQUF4Qjs7QUFFQSxVQUFPLEtBQUssU0FBTCxDQUFlLElBQWYsQ0FBUDtBQUNBOzs7c0NBRW1CO0FBQ25CLFVBQU8sS0FBSyxhQUFMLENBQW1CLEdBQW5CLEVBQVA7QUFDQTs7O3FDQUVrQixJLEVBQU07QUFDeEIsT0FBSSxDQUFDLEtBQUssV0FBTCxDQUFpQixjQUFqQixDQUFnQyxJQUFoQyxDQUFMLEVBQTRDO0FBQzNDLFNBQUssV0FBTCxDQUFpQixJQUFqQixJQUF5QixDQUF6QjtBQUNBO0FBQ0QsUUFBSyxXQUFMLENBQWlCLElBQWpCLEtBQTBCLENBQTFCO0FBQ0EsT0FBSSxLQUFLLE9BQU8sSUFBUCxHQUFjLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUF2QjtBQUNBLFVBQU8sRUFBUDtBQUNBOzs7NEJBRVM7QUFDVCxRQUFLLGtCQUFMLENBQXdCLE1BQXhCO0FBQ0EsUUFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLEdBQXJCO0FBQ0EsT0FBSSxLQUFLLEtBQUssVUFBTCxDQUFnQixzQkFBaEIsRUFBVDs7QUFFQSxRQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLEVBQW5CLEVBQXVCO0FBQ3RCLFdBQU87QUFEZSxJQUF2QjtBQUdBOzs7NEJBRVMsUSxFQUFVO0FBQ25CLE9BQUksS0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQixDQUFKLEVBQWtDO0FBQ2pDLFNBQUssU0FBTCxDQUFlLElBQWYsQ0FBb0IsUUFBcEI7O0FBRUEsUUFBSSxLQUFLLGlCQUFMLENBQXVCLE1BQXZCLEtBQWtDLENBQXRDLEVBQXlDO0FBQ3hDLFVBQUssT0FBTCxDQUFhLEtBQUssaUJBQUwsQ0FBdUIsQ0FBdkIsQ0FBYixFQUF3QyxRQUF4QztBQUNBLEtBRkQsTUFFTztBQUNOLFVBQUssT0FBTCxDQUFhLEtBQUssaUJBQWxCLEVBQXFDLFFBQXJDO0FBQ0E7QUFDRCxJQVJELE1BUU87QUFDTixZQUFRLElBQVIsMENBQW1ELFFBQW5EO0FBQ0E7QUFDRDs7O2dDQUVhLEUsRUFBSTtBQUNqQixRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsRUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxPQUFJLE9BQU87QUFDVixxQkFBaUIsRUFEUDtBQUVWLFdBQU8sV0FGRztBQUdWLFlBQVE7QUFIRSxJQUFYOztBQU1BLE9BQUksQ0FBQyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLENBQUwsRUFBbUM7QUFDbEMsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQixlQUNJLElBREo7QUFFQyxZQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLE1BQXBCLEVBQTRCLEtBQUssZUFBTCxHQUF1QixLQUFLLGVBQUwsQ0FBcUIsTUFBNUMsR0FBcUQsQ0FBakYsSUFBc0Y7QUFGOUY7QUFJQSxTQUFLLFNBQUwsQ0FBZSxRQUFmLEVBQXlCLEtBQXpCO0FBQ0E7O0FBRUQsUUFBSyxTQUFMLENBQWUsUUFBZjtBQUNBLFFBQUssVUFBTCxDQUFnQixHQUFoQjtBQUNBOzs7NkJBRVUsRSxFQUFJLEksRUFBTTtBQUNwQixRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsRUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxPQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsUUFBbkIsQ0FBSixFQUFrQztBQUNqQyxZQUFRLElBQVIsd0JBQWlDLEVBQWpDO0FBQ0E7O0FBRUQsUUFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQixlQUNJLElBREo7QUFFQyxRQUFJO0FBRkw7QUFJQSxRQUFLLFNBQUwsQ0FBZSxRQUFmLEVBQXlCLEtBQXpCOztBQUVBLFFBQUssU0FBTCxDQUFlLFFBQWY7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7O0FBRUEsVUFBTyxRQUFQO0FBQ0E7OztpQ0FFYyxVLEVBQVksYSxFQUFlLEksRUFBTTtBQUFBOztBQUMvQyxRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsVUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxRQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLGVBQ0ksSUFESjtBQUVDLFFBQUksUUFGTDtBQUdDLGdCQUFZO0FBSGI7O0FBTUEsUUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixRQUFyQixFQUErQixLQUEvQjs7QUFFQSxPQUFJLGlCQUFpQixLQUFLLFNBQUwsQ0FBZSxhQUFmLENBQXJCO0FBQ0Esa0JBQWUsS0FBZixHQUF1QixPQUF2QixDQUErQixrQkFBVTtBQUN4QyxRQUFJLE9BQU8sZUFBZSxJQUFmLENBQW9CLE1BQXBCLENBQVg7QUFDQSxRQUFJLENBQUMsSUFBTCxFQUFXO0FBQUU7QUFBUTtBQUNyQixRQUFJLFlBQVksT0FBTyxPQUFQLENBQWUsR0FBZixFQUFvQixRQUFwQixDQUFoQjtBQUNBLFFBQUksdUJBQ0EsSUFEQTtBQUVILFNBQUk7QUFGRCxNQUFKO0FBSUEsVUFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixTQUFuQixFQUE4QixPQUE5Qjs7QUFFQSxRQUFJLFlBQVksZUFBZSxNQUFmLENBQXNCLE1BQXRCLEVBQThCLE9BQTlCLENBQXNDLEdBQXRDLEVBQTJDLFFBQTNDLENBQWhCO0FBQ0EsVUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixTQUFyQixFQUFnQyxTQUFoQztBQUNBLElBWkQ7O0FBY0Esa0JBQWUsS0FBZixHQUF1QixPQUF2QixDQUErQixnQkFBUTtBQUN0QyxVQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLEtBQUssQ0FBTCxDQUFPLE9BQVAsQ0FBZSxHQUFmLEVBQW9CLFFBQXBCLENBQW5CLEVBQWtELEtBQUssQ0FBTCxDQUFPLE9BQVAsQ0FBZSxHQUFmLEVBQW9CLFFBQXBCLENBQWxELEVBQWlGLGVBQWUsSUFBZixDQUFvQixJQUFwQixDQUFqRjtBQUNBLElBRkQ7O0FBSUEsUUFBSyxVQUFMLENBQWdCLEdBQWhCOztBQUVBLFFBQUssU0FBTCxDQUFlLFFBQWY7QUFDQTs7O21DQUVnQjtBQUNoQixRQUFLLGlCQUFMLEdBQXlCLEVBQXpCO0FBQ0EsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0E7OztvQ0FFaUI7QUFDakIsUUFBSyxpQkFBTCxnQ0FBNkIsS0FBSyxTQUFsQztBQUNBLFFBQUssU0FBTCxHQUFpQixFQUFqQjtBQUNBOzs7NEJBRVMsUyxFQUFXLFUsRUFBWTtBQUNoQyxVQUFPLEtBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsU0FBckIsRUFBZ0MsVUFBaEMsQ0FBUDtBQUNBOzs7MEJBRU8sUSxFQUFVO0FBQ2pCLFVBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixLQUExQixLQUFvQyxPQUEzQztBQUNBOzs7MkJBRVEsUSxFQUFVO0FBQ2xCLFVBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixLQUExQixLQUFvQyxRQUEzQztBQUNBOzs7NkJBRVUsUSxFQUFVO0FBQ3BCLFVBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixVQUExQixLQUF5QyxJQUFoRDtBQUNBOzs7aUNBRWMsUyxFQUFXO0FBQUE7O0FBQ3pCLE9BQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFNBQWhCLENBQVo7QUFDQSxPQUFJLGNBQWMsS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixTQUFwQixFQUErQixNQUEvQixDQUFzQyxnQkFBUTtBQUFFLFdBQU8sT0FBSyxRQUFMLENBQWMsSUFBZCxDQUFQO0FBQTRCLElBQTVFLENBQWxCOztBQUVBLE9BQUksWUFBWSxNQUFaLEtBQXVCLENBQTNCLEVBQThCO0FBQzdCLFNBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsUUFBbkIsQ0FBNEI7QUFDM0IsOEJBQXNCLE1BQU0sRUFBNUIscUNBRDJCO0FBRTNCLFdBQU0sT0FGcUI7QUFHM0IsZUFBVTtBQUNULGFBQU8sTUFBTSxPQUFOLEdBQWdCLE1BQU0sT0FBTixDQUFjLFFBQTlCLEdBQXlDLENBRHZDO0FBRVQsV0FBSyxNQUFNLE9BQU4sR0FBZ0IsTUFBTSxPQUFOLENBQWMsTUFBOUIsR0FBdUM7QUFGbkM7QUFIaUIsS0FBNUI7QUFRQSxXQUFPLElBQVA7QUFDQTs7QUFFRCxVQUFPLFdBQVA7QUFDQTs7O2dDQUVhLFMsRUFBVztBQUFBOztBQUN4QixPQUFJLFFBQVEsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixTQUFoQixDQUFaO0FBQ0EsT0FBSSxhQUFhLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsU0FBcEIsRUFBK0IsTUFBL0IsQ0FBc0MsZ0JBQVE7QUFBRSxXQUFPLE9BQUssT0FBTCxDQUFhLElBQWIsQ0FBUDtBQUEwQixJQUExRSxDQUFqQjs7QUFFQSxPQUFJLFdBQVcsTUFBWCxLQUFzQixDQUExQixFQUE2QjtBQUM1QixTQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFFBQW5CLENBQTRCO0FBQzNCLDhCQUFzQixNQUFNLEVBQTVCLHFDQUQyQjtBQUUzQixXQUFNLE9BRnFCO0FBRzNCLGVBQVU7QUFDVCxhQUFPLE1BQU0sT0FBTixHQUFnQixNQUFNLE9BQU4sQ0FBYyxRQUE5QixHQUF5QyxDQUR2QztBQUVULFdBQU0sTUFBTSxPQUFOLEdBQWdCLE1BQU0sT0FBTixDQUFjLE1BQTlCLEdBQXVDO0FBRnBDO0FBSGlCLEtBQTVCO0FBUUE7O0FBRUQsVUFBTyxVQUFQO0FBQ0E7OzswQkFFTyxRLEVBQVUsTSxFQUFRO0FBQ3pCO0FBQ0EsT0FBSSxXQUFKOztBQUVBLE9BQUksT0FBTyxRQUFQLEtBQW9CLFFBQXhCLEVBQWtDO0FBQ2pDLFFBQUksS0FBSyxVQUFMLENBQWdCLFFBQWhCLENBQUosRUFBK0I7QUFDOUIsbUJBQWMsS0FBSyxjQUFMLENBQW9CLFFBQXBCLENBQWQ7QUFDQSxLQUZELE1BRU87QUFDTixtQkFBYyxDQUFDLFFBQUQsQ0FBZDtBQUNBO0FBQ0QsSUFORCxNQU1PLElBQUksTUFBTSxPQUFOLENBQWMsUUFBZCxDQUFKLEVBQTZCO0FBQ25DLGtCQUFjLFFBQWQ7QUFDQTs7QUFFRCxPQUFJLFdBQUo7O0FBRUEsT0FBSSxPQUFPLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDL0IsUUFBSSxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBSixFQUE2QjtBQUM1QixtQkFBYyxLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsQ0FBZDtBQUNBLEtBRkQsTUFFTztBQUNOLG1CQUFjLENBQUMsTUFBRCxDQUFkO0FBQ0E7QUFDRCxJQU5ELE1BTU8sSUFBSSxNQUFNLE9BQU4sQ0FBYyxNQUFkLENBQUosRUFBMkI7QUFDakMsa0JBQWMsTUFBZDtBQUNBOztBQUVELFFBQUssWUFBTCxDQUFrQixXQUFsQixFQUErQixXQUEvQjtBQUNBOzs7K0JBRVksVyxFQUFhLFcsRUFBYTtBQUFBOztBQUV0QyxPQUFJLGdCQUFnQixJQUFoQixJQUF3QixnQkFBZ0IsSUFBNUMsRUFBa0Q7QUFDakQ7QUFDQTs7QUFFRCxPQUFJLFlBQVksTUFBWixLQUF1QixZQUFZLE1BQXZDLEVBQStDO0FBQzlDLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxZQUFZLE1BQWhDLEVBQXdDLEdBQXhDLEVBQTZDO0FBQzVDLFNBQUksWUFBWSxDQUFaLEtBQWtCLFlBQVksQ0FBWixDQUF0QixFQUFzQztBQUNyQyxXQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFlBQVksQ0FBWixDQUFuQixFQUFtQyxZQUFZLENBQVosQ0FBbkMsZUFBdUQsS0FBSyxXQUE1RDtBQUNBO0FBQ0Q7QUFDRCxJQU5ELE1BTU87QUFDTixRQUFJLFlBQVksTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUM3QixpQkFBWSxPQUFaLENBQW9CO0FBQUEsYUFBYyxPQUFLLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLFlBQVksQ0FBWixDQUF6QixDQUFkO0FBQUEsTUFBcEI7QUFDQSxLQUZELE1BRU8sSUFBSSxZQUFZLE1BQVosS0FBdUIsQ0FBM0IsRUFBOEI7QUFDcEMsaUJBQVksT0FBWixDQUFvQjtBQUFBLGFBQWMsT0FBSyxPQUFMLENBQWEsWUFBWSxDQUFaLENBQWIsRUFBNkIsVUFBN0IsQ0FBZDtBQUFBLE1BQXBCO0FBQ0EsS0FGTSxNQUVBO0FBQ04sVUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixRQUFuQixDQUE0QjtBQUMzQixxREFBNkMsWUFBWSxNQUF6RCxjQUF3RSxZQUFZLE1BQXBGLE1BRDJCO0FBRTNCLFlBQU0sT0FGcUI7QUFHM0IsZ0JBQVU7QUFDVDtBQUNBO0FBRlM7QUFIaUIsTUFBNUI7QUFRQTtBQUNEO0FBRUQ7OzswQkFFTyxRLEVBQVU7QUFDakIsVUFBTyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLENBQVA7QUFDQTs7OzZCQUVVO0FBQ1Y7QUFDQSxVQUFPLEtBQUssS0FBWjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7SUM5VEksTTs7O0FBQ0Ysb0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLG9IQUNULEtBRFM7O0FBRWYsY0FBSyxRQUFMLEdBQWdCLE1BQUssUUFBTCxDQUFjLElBQWQsT0FBaEI7QUFDQSxjQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsY0FBSyxPQUFMLEdBQWUsRUFBZjtBQUplO0FBS2xCOzs7O21DQUVVO0FBQ1AsaUJBQUssYUFBTDs7QUFFQSxnQkFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFmLEVBQXlCO0FBQ3JCLG9CQUFJLFdBQVcsS0FBSyxNQUFMLENBQVksUUFBWixFQUFmO0FBQ0EscUJBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsUUFBcEI7QUFDSDtBQUNKOzs7NkJBRUksTyxFQUFTO0FBQ1YsaUJBQUssU0FBTCxHQUFpQixPQUFqQjtBQUNIOzs7aUNBRVEsSyxFQUFPO0FBQ1osaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsS0FBckIsRUFBNEIsQ0FBQyxDQUE3QjtBQUNIOzs7d0NBRWU7QUFBQTs7QUFDWixpQkFBSyxPQUFMLENBQWEsR0FBYixDQUFpQjtBQUFBLHVCQUFVLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsWUFBcEIsQ0FBaUMsTUFBakMsQ0FBVjtBQUFBLGFBQWpCO0FBQ0EsaUJBQUssT0FBTCxHQUFlLEVBQWY7QUFDSDs7O2dEQUV1QixLLEVBQU8sUyxFQUFXO0FBQ3RDLGdCQUFJLElBQUksS0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixVQUFwQixFQUFSO0FBQ0EsZ0JBQUksSUFBSSxVQUFVLFNBQVYsRUFBUjtBQUNBLGdCQUFJLFVBQVUsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQjtBQUFBLHVCQUFNLEVBQUUsRUFBRixDQUFOO0FBQUEsYUFBakIsQ0FBZDtBQUNBLGdCQUFJLG1CQUFtQixRQUFRLEdBQVIsQ0FBWTtBQUFBLHVCQUFVLE9BQU8sS0FBUCxDQUFhLE1BQWIsQ0FBb0IsRUFBRSxHQUF0QixFQUEyQixFQUFFLE1BQTdCLENBQVY7QUFBQSxhQUFaLEVBQTRELE1BQTVELENBQW9FLFVBQUMsSUFBRCxFQUFPLElBQVA7QUFBQSx1QkFBZ0IsUUFBUSxJQUF4QjtBQUFBLGFBQXBFLEVBQWtHLEtBQWxHLENBQXZCOztBQUVBLGdCQUFJLGdCQUFKLEVBQXNCO0FBQ2xCLHFCQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLGVBQXhCO0FBQ0g7QUFDSjs7OzRDQUVtQjtBQUNoQixpQkFBSyxNQUFMLEdBQWMsSUFBSSxJQUFKLENBQVMsS0FBSyxTQUFkLENBQWQ7QUFDQSxpQkFBSyxNQUFMLENBQVksVUFBWixHQUF5QixPQUF6QixDQUFpQyxjQUFjLEtBQUssS0FBTCxDQUFXLElBQTFEO0FBQ0EsaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsZUFBZSxLQUFLLEtBQUwsQ0FBVyxLQUEvQztBQUNBLGlCQUFLLE1BQUwsQ0FBWSxrQkFBWixDQUErQixLQUEvQjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCO0FBQ25CLDJDQUEyQixJQURSO0FBRW5CLGdDQUFnQixJQUZHO0FBR25CLDBDQUEwQixLQUhQO0FBSW5CLHNCQUFNLElBSmE7QUFLbkIsMENBQTBCLElBTFA7QUFNbkIsNEJBQVksV0FOTztBQU9uQixpQ0FBaUIsSUFQRTtBQVFuQiw0QkFBWTtBQVJPLGFBQXZCO0FBVUEsaUJBQUssTUFBTCxDQUFZLGVBQVosR0FBOEIsUUFBOUI7QUFDQSxpQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixLQUF0QixDQUE0QixVQUE1QixHQUF5QyxHQUF6Qzs7QUFFQSxnQkFBSSxLQUFLLEtBQUwsQ0FBVyxZQUFmLEVBQTRCO0FBQ3hCLHFCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQUssS0FBTCxDQUFXLFlBQWhDLEVBQThDLENBQUMsQ0FBL0M7QUFDSDs7QUFFRCxpQkFBSyxNQUFMLENBQVksRUFBWixDQUFlLFFBQWYsRUFBeUIsS0FBSyxRQUE5QjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEVBQXRCLENBQXlCLGNBQXpCLEVBQXlDLEtBQUssdUJBQUwsQ0FBNkIsSUFBN0IsQ0FBa0MsSUFBbEMsQ0FBekM7QUFDSDs7O2tEQUV5QixTLEVBQVc7QUFBQTs7QUFDakMsZ0JBQUksVUFBVSxNQUFkLEVBQXNCO0FBQ2xCLG9CQUFJLGNBQWMsVUFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLGlCQUFTO0FBQzVDLHdCQUFJLFdBQVcsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixHQUFwQixDQUF3QixlQUF4QixDQUF3QyxNQUFNLFFBQU4sQ0FBZSxLQUF2RCxDQUFmO0FBQ0EsMkJBQU87QUFDSCw2QkFBSyxTQUFTLEdBRFg7QUFFSCxnQ0FBUSxTQUFTLE1BRmQ7QUFHSCw4QkFBTSxNQUFNLE9BSFQ7QUFJSCw4QkFBTSxNQUFNO0FBSlQscUJBQVA7QUFNSCxpQkFSaUIsQ0FBbEI7O0FBVUEscUJBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsY0FBcEIsQ0FBbUMsV0FBbkM7QUFDQTs7QUFFQSxvQkFBSSxRQUFRLFFBQVEsV0FBUixFQUFxQixLQUFqQzs7QUFFQSxxQkFBSyxhQUFMOztBQUVBLG9CQUFJLFVBQVUsVUFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLGlCQUFTO0FBQ3hDLHdCQUFJLFdBQVc7QUFDWCwrQkFBTyxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLENBQXdCLGVBQXhCLENBQXdDLE1BQU0sUUFBTixDQUFlLEtBQXZELENBREk7QUFFWCw2QkFBSyxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLENBQXdCLGVBQXhCLENBQXdDLE1BQU0sUUFBTixDQUFlLEdBQXZEO0FBRk0scUJBQWY7O0FBS0Esd0JBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxTQUFTLEtBQVQsQ0FBZSxHQUF6QixFQUE4QixTQUFTLEtBQVQsQ0FBZSxNQUE3QyxFQUFxRCxTQUFTLEdBQVQsQ0FBYSxHQUFsRSxFQUF1RSxTQUFTLEdBQVQsQ0FBYSxNQUFwRixDQUFaOztBQUVBLDJCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsU0FBcEIsQ0FBOEIsS0FBOUIsRUFBcUMsY0FBckMsRUFBcUQsTUFBckQsQ0FBbEI7QUFDSCxpQkFUYSxDQUFkO0FBVUgsYUE1QkQsTUE0Qk87QUFDSCxxQkFBSyxNQUFMLENBQVksT0FBWixDQUFvQixnQkFBcEI7QUFDQSxxQkFBSyxNQUFMLENBQVksV0FBWixDQUF3QixlQUF4QjtBQUNIOztBQUVELGdCQUFJLFVBQVUsS0FBZCxFQUFxQjtBQUNqQixxQkFBSyxNQUFMLENBQVksUUFBWixDQUFxQixVQUFVLEtBQS9CLEVBQXNDLENBQUMsQ0FBdkM7QUFDSDtBQUNKOzs7aUNBRVE7QUFBQTs7QUFDTCxtQkFBTyw2QkFBSyxLQUFNLGFBQUMsT0FBRDtBQUFBLDJCQUFhLE9BQUssSUFBTCxDQUFVLE9BQVYsQ0FBYjtBQUFBLGlCQUFYLEdBQVA7QUFDSDs7OztFQTVHZ0IsTUFBTSxTOzs7Ozs7O0lDQXJCLFc7QUFJRix5QkFBYztBQUFBOztBQUFBLFNBSGpCLE1BR2lCLEdBSFIsSUFBSSxNQUFKLENBQVcsa0NBQVgsQ0FHUTs7QUFBQSxTQUZqQixRQUVpQixHQUZOLFlBQVUsQ0FBRSxDQUVOOztBQUNoQixTQUFLLE1BQUwsQ0FBWSxnQkFBWixDQUE2QixTQUE3QixFQUF3QyxLQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLElBQWxCLENBQXhDO0FBQ0c7Ozs7MkJBRU0sSyxFQUFPO0FBQ2IsYUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFTLElBQVQsQ0FBYyxLQUFkLENBQW9CLEtBQXBCLENBQWYsQ0FBUDtBQUNBOzs7MkJBRU0sSSxFQUFNO0FBQ1osYUFBTyxTQUFTLElBQVQsQ0FBYyxJQUFkLENBQW1CLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBbkIsQ0FBUDtBQUNBOzs7MkJBRU0sSyxFQUFPLFEsRUFBVTtBQUN2QjtBQUNBLFdBQUssUUFBTCxHQUFnQixRQUFoQjtBQUNBLFdBQUssTUFBTCxDQUFZLFdBQVosQ0FBd0I7QUFDdkIsZUFBTyxLQUFLLE1BQUwsQ0FBWSxLQUFaO0FBRGdCLE9BQXhCO0FBR0E7Ozs0QkFFTyxJLEVBQU07QUFDYixVQUFJLFFBQVEsS0FBSyxNQUFMLENBQVksS0FBSyxJQUFMLENBQVUsS0FBdEIsQ0FBWjtBQUNBLFdBQUssUUFBTCxDQUFjLEtBQWQ7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDM0JMLElBQU0sTUFBTSxRQUFRLFVBQVIsRUFBb0IsV0FBaEM7QUFDQSxJQUFNLEtBQUssUUFBUSxJQUFSLENBQVg7O0lBRU0sRzs7O0FBS0wsY0FBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsd0dBQ1osS0FEWTs7QUFBQSxRQUpuQixNQUltQixHQUpWLElBQUksTUFBSixFQUlVO0FBQUEsUUFGbkIsSUFFbUIsR0FGWixJQUVZOzs7QUFHbEIsUUFBSyxLQUFMLEdBQWE7QUFDWixjQUFXLE9BREM7QUFFWixnQkFBYSxTQUZEO0FBR1osd0JBQXFCLEVBSFQ7QUFJWixVQUFPLElBSks7QUFLWixhQUFVLElBTEU7QUFNWixhQUFVO0FBTkUsR0FBYjs7QUFTQSxNQUFJLEVBQUosQ0FBTyxNQUFQLEVBQWUsVUFBUyxLQUFULEVBQWdCLE9BQWhCLEVBQXlCO0FBQ3ZDLE1BQUcsU0FBSCxDQUFhLFFBQVEsTUFBUixHQUFpQixhQUE5QixFQUE2QyxLQUFLLEtBQUwsQ0FBVyxpQkFBeEQsRUFBMkUsVUFBUyxHQUFULEVBQWM7QUFDdkYsUUFBSSxHQUFKLEVBQVMsTUFBTSxJQUFOO0FBQ1YsSUFGRDtBQUdBLE1BQUcsU0FBSCxDQUFhLFFBQVEsTUFBUixHQUFpQixrQkFBOUIsRUFBa0QsS0FBSyxTQUFMLENBQWUsS0FBSyxLQUFMLENBQVcsR0FBMUIsRUFBK0IsSUFBL0IsRUFBcUMsQ0FBckMsQ0FBbEQsRUFBMkYsVUFBUyxHQUFULEVBQWM7QUFDdkcsUUFBSSxHQUFKLEVBQVMsTUFBTSxJQUFOO0FBQ1YsSUFGRDs7QUFJQSxPQUFJLG1CQUFtQixJQUFJLFlBQUosQ0FBaUIsY0FBakIsRUFBaUM7QUFDOUMscUVBRDhDO0FBRXZELFlBQVE7QUFGK0MsSUFBakMsQ0FBdkI7QUFJQSxHQVpjLENBWWIsSUFaYSxPQUFmOztBQWNBLE1BQUksU0FBUyxPQUFPLFlBQVAsQ0FBb0IsT0FBcEIsQ0FBNEIsUUFBNUIsQ0FBYjtBQUNBLE1BQUksTUFBSixFQUFZO0FBQ1gsT0FBSSxVQUFVLFNBQVYsSUFBdUIsVUFBVSxNQUFyQyxFQUE2QztBQUM1QyxVQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLE1BQXBCO0FBQ0EsSUFGRCxNQUVPO0FBQ04sVUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixRQUFuQixDQUE0QjtBQUMzQixXQUFNLFNBRHFCO0FBRTNCO0FBRjJCLEtBQTVCO0FBSUE7QUFDRDs7QUFFRCxRQUFLLHVCQUFMLEdBQStCLE1BQUssdUJBQUwsQ0FBNkIsSUFBN0IsT0FBL0I7QUFDQSxRQUFLLDhCQUFMLEdBQXNDLE1BQUssOEJBQUwsQ0FBb0MsSUFBcEMsT0FBdEM7QUF2Q2tCO0FBd0NsQjs7OztzQ0FFbUI7QUFDbkIsUUFBSyxXQUFMLENBQWlCLG9CQUFqQjtBQUNBOzs7aURBRThCLEssRUFBTztBQUFBOztBQUNyQyxPQUFJLEtBQUssSUFBVCxFQUFlO0FBQUUsaUJBQWEsS0FBSyxJQUFsQjtBQUEwQjtBQUMzQyxRQUFLLElBQUwsR0FBWSxXQUFXLFlBQU07QUFBRSxXQUFLLHVCQUFMLENBQTZCLEtBQTdCO0FBQXNDLElBQXpELEVBQTJELEdBQTNELENBQVo7QUFDQTs7OzBDQUV1QixLLEVBQU07QUFDN0IsV0FBUSxJQUFSLENBQWEseUJBQWI7QUFDQSxPQUFJLFNBQVMsS0FBSyxZQUFMLENBQWtCLEtBQUssS0FBTCxDQUFXLE9BQTdCLEVBQXNDLEtBQUssS0FBTCxDQUFXLFNBQWpELEVBQTRELEtBQTVELENBQWI7QUFDQSxPQUFJLE9BQU8sR0FBWCxFQUFnQjtBQUNmLFNBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsT0FBTyxHQUEzQjtBQUNBLFFBQUksUUFBUSxLQUFLLE1BQUwsQ0FBWSxxQkFBWixFQUFaO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDYix3QkFBbUIsS0FETjtBQUViLFVBQUssT0FBTyxHQUZDO0FBR2IsWUFBTyxLQUhNO0FBSWIsYUFBUSxLQUFLLE1BQUwsQ0FBWSxTQUFaO0FBSkssS0FBZDtBQU1BLElBVEQsTUFTTztBQUNOO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDYix3QkFBbUIsS0FETjtBQUViLFVBQUssSUFGUTtBQUdiLFlBQU8sSUFITTtBQUliLGFBQVEsQ0FBQztBQUNSLGdCQUFVO0FBQ1QsY0FBTyxPQUFPLFFBQVAsR0FBa0IsQ0FEaEI7QUFFVCxZQUFLLE9BQU87QUFGSCxPQURGO0FBS1IsZUFBUyxjQUFjLE9BQU8sUUFBckIsR0FBZ0MsR0FMakM7QUFNUixZQUFNO0FBTkUsTUFBRDtBQUpLLEtBQWQ7QUFhQTtBQUNELFdBQVEsT0FBUixDQUFnQix5QkFBaEI7QUFDQTs7O2lDQUVjO0FBQ2QsUUFBSyxRQUFMLENBQWM7QUFDYixZQUFTLEtBQUssS0FBTCxDQUFXLE1BQVgsS0FBc0IsU0FBdkIsR0FBb0MsTUFBcEMsR0FBNkM7QUFEeEMsSUFBZDtBQUdBOzs7OEJBRVcsRSxFQUFJO0FBQ2YsT0FBSSxXQUFXLFNBQVgsUUFBVyxDQUFTLEtBQVQsRUFBZ0I7QUFDOUIsU0FBSyxNQUFMLENBQVksUUFBWixDQUFxQixLQUFyQjtBQUNBLFNBQUssUUFBTCxDQUFjO0FBQ2Isd0JBQW1CO0FBRE4sS0FBZDtBQUdBLElBTEQ7O0FBT0EsS0FBRSxJQUFGLENBQU87QUFDTix5QkFBbUIsRUFBbkIsU0FETTtBQUVOLFVBQU0sSUFGQTtBQUdOLGFBQVMsU0FBUyxJQUFULENBQWMsSUFBZCxDQUhIO0FBSU4sY0FBVTtBQUpKLElBQVA7QUFNQTs7QUFFRDs7OzsrQkFDYSxPLEVBQVMsUyxFQUFXLE0sRUFBUTtBQUNyQyxPQUFJLFNBQVMsUUFBUSxLQUFSLENBQWMsTUFBZCxDQUFiOztBQUVBLE9BQUksT0FBTyxTQUFQLEVBQUosRUFBd0I7QUFDcEIsUUFBSSxNQUFNLFVBQVUsTUFBVixFQUFrQixJQUFsQixFQUFWO0FBQ0EsV0FBTztBQUNILFlBQU87QUFESixLQUFQO0FBR0gsSUFMRCxNQUtPO0FBQ047QUFDRyxRQUFJLFdBQVcsT0FBTyxlQUFQLEVBQWY7QUFDQSxRQUFJLFdBQVcsT0FBTywyQkFBUCxFQUFmO0FBQ0EsV0FBTztBQUNILGlCQUFZLFFBRFQ7QUFFSCxpQkFBWTtBQUZULEtBQVA7QUFJSDtBQUNKOzs7MkJBRVE7QUFBQTs7QUFDUixPQUFJLGtCQUFrQixLQUFLLEtBQUwsQ0FBVyxNQUFqQztBQUNBLE9BQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxNQUFYLEtBQXNCLFNBQXRCLEdBQWtDLElBQWxDLEdBQXlDLElBQTNEOztBQUVHLFVBQU87QUFBQTtBQUFBLE1BQUssSUFBRyxXQUFSLEVBQW9CLDBCQUF3QixlQUE1QztBQUNOO0FBQUMsVUFBRDtBQUFBLE9BQU8sSUFBRyxZQUFWO0FBQ0MseUJBQUMsTUFBRDtBQUNDLFdBQUssYUFBQyxJQUFEO0FBQUEsY0FBUyxPQUFLLE1BQUwsR0FBYyxJQUF2QjtBQUFBLE9BRE47QUFFQyxZQUFLLFFBRk47QUFHQyxhQUFNLFNBSFA7QUFJQyxjQUFRLEtBQUssS0FBTCxDQUFXLE1BSnBCO0FBS0MsZ0JBQVUsS0FBSyw4QkFMaEI7QUFNQyxvQkFBYyxLQUFLLEtBQUwsQ0FBVztBQU4xQjtBQURELEtBRE07QUFZTjtBQUFDLFVBQUQ7QUFBQSxPQUFPLElBQUcsZUFBVjtBQUNDLHlCQUFDLFdBQUQsSUFBYSxPQUFPLEtBQUssS0FBTCxDQUFXLEtBQS9CLEVBQXNDLFFBQVEsV0FBOUM7QUFERDtBQVpNLElBQVA7QUEyQkQ7Ozs7RUFoS2MsTUFBTSxTOzs7Ozs7O0lDSGxCLE07Ozs7T0FDTCxNLEdBQVMsRTs7Ozs7MEJBRUQ7QUFDUCxRQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0E7Ozs4QkFFVztBQUNYLFVBQU8sS0FBSyxNQUFaO0FBQ0E7OzsyQkFFUSxLLEVBQU87QUFDZixPQUFJLElBQUksSUFBUjtBQUNBLFdBQU8sTUFBTSxJQUFiO0FBQ0MsU0FBSyxPQUFMO0FBQWMsU0FBSSxRQUFRLEtBQVosQ0FBbUI7QUFDakMsU0FBSyxTQUFMO0FBQWdCLFNBQUksUUFBUSxJQUFaLENBQWtCO0FBQ2xDLFNBQUssTUFBTDtBQUFhLFNBQUksUUFBUSxJQUFaLENBQWtCO0FBQy9CO0FBQVMsU0FBSSxRQUFRLEdBQVosQ0FBaUI7QUFKM0I7QUFNQSxLQUFFLE1BQU0sT0FBUjtBQUNBLFFBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsS0FBakI7QUFDQTs7Ozs7Ozs7Ozs7OztJQ3JCSSxNO0FBTUwsbUJBQWM7QUFBQTs7QUFBQSxPQUxkLE1BS2MsR0FMTCxJQUFJLE1BQUosRUFLSztBQUFBLE9BSmQsS0FJYyxHQUpOLElBQUksa0JBQUosQ0FBdUIsSUFBdkIsQ0FJTTtBQUFBLE9BRmQsV0FFYyxHQUZBLEVBRUE7O0FBQ2IsT0FBSyxVQUFMO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLEtBQUwsQ0FBVyxVQUFYO0FBQ0EsUUFBSyxNQUFMLENBQVksS0FBWjs7QUFFQSxRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLHFCQUFMO0FBQ0E7OzswQ0FFdUI7QUFBQTs7QUFDdkI7QUFDQSxPQUFNLHFCQUFxQixDQUFDLEtBQUQsRUFBUSxRQUFSLEVBQWtCLE9BQWxCLEVBQTJCLFFBQTNCLEVBQXFDLGFBQXJDLEVBQW9ELFVBQXBELEVBQWdFLFVBQWhFLEVBQTRFLFVBQTVFLEVBQXdGLGFBQXhGLEVBQXVHLE9BQXZHLEVBQWdILFlBQWhILEVBQThILG9CQUE5SCxFQUFvSixVQUFwSixFQUFnSyxxQkFBaEssRUFBdUwsU0FBdkwsRUFBa00sdUJBQWxNLEVBQTJOLE1BQTNOLEVBQW1PLFVBQW5PLEVBQStPLFdBQS9PLEVBQTRQLFNBQTVQLEVBQXVRLGdCQUF2USxFQUF5UixTQUF6UixFQUFvUyxTQUFwUyxFQUErUyxRQUEvUyxFQUF5VCxTQUF6VCxFQUFvVSxRQUFwVSxFQUE4VSxTQUE5VSxFQUF5VixjQUF6VixFQUF5VyxhQUF6VyxFQUF3WCxjQUF4WCxFQUF3WSw2QkFBeFksRUFBdWEsWUFBdmEsQ0FBM0I7QUFDQSxzQkFBbUIsT0FBbkIsQ0FBMkI7QUFBQSxXQUFjLE1BQUssYUFBTCxDQUFtQixVQUFuQixDQUFkO0FBQUEsSUFBM0I7QUFDQTs7O2dDQUVhLGMsRUFBZ0I7QUFDN0IsUUFBSyxXQUFMLENBQWlCLGNBQWpCLElBQW1DO0FBQ2xDLFVBQU0sY0FENEI7QUFFbEMsV0FBTyxVQUFVLEdBQVYsQ0FBYyxjQUFkO0FBRjJCLElBQW5DO0FBSUE7Ozt3Q0FFcUIsSyxFQUFPO0FBQzVCLFFBQUssS0FBTCxDQUFXLFVBQVgsQ0FBc0IsS0FBdEI7QUFDQSxRQUFLLE9BQUwsQ0FBYSxNQUFNLElBQW5CO0FBQ0EsUUFBSyxLQUFMLENBQVcsU0FBWDtBQUNBOzs7NENBRXlCLFMsRUFBVztBQUFBOztBQUNwQyxhQUFVLFdBQVYsQ0FBc0IsT0FBdEIsQ0FBOEI7QUFBQSxXQUFjLE9BQUssT0FBTCxDQUFhLFVBQWIsQ0FBZDtBQUFBLElBQTlCO0FBQ0E7Ozt3Q0FFcUIsZSxFQUFpQjtBQUN0QztBQUNBLFFBQUssYUFBTCxDQUFtQixnQkFBZ0IsSUFBbkM7QUFDQSxRQUFLLEtBQUwsQ0FBVyxrQkFBWCxDQUE4QixnQkFBZ0IsSUFBOUM7QUFDQSxRQUFLLE9BQUwsQ0FBYSxnQkFBZ0IsSUFBN0I7QUFDQSxRQUFLLEtBQUwsQ0FBVyxpQkFBWDtBQUNBOzs7NENBRXlCLGMsRUFBZ0I7QUFBQTs7QUFDekMsa0JBQWUsV0FBZixDQUEyQixPQUEzQixDQUFtQztBQUFBLFdBQWMsT0FBSyxPQUFMLENBQWEsVUFBYixDQUFkO0FBQUEsSUFBbkM7QUFDQTs7O3lDQUVzQixJLEVBQU07QUFDNUIsV0FBUSxJQUFSLENBQWEsZ0NBQWIsRUFBK0MsSUFBL0M7QUFDQTs7OzBDQUV1QixPLEVBQVM7QUFBQTs7QUFDaEMsUUFBSyxVQUFMO0FBQ0EsV0FBUSxXQUFSLENBQW9CLE9BQXBCLENBQTRCO0FBQUEsV0FBYyxPQUFLLE9BQUwsQ0FBYSxVQUFiLENBQWQ7QUFBQSxJQUE1QjtBQUNBOzs7NkNBRTBCLFUsRUFBWTtBQUFBOztBQUN0QyxRQUFLLEtBQUwsQ0FBVyxjQUFYO0FBQ0EsY0FBVyxJQUFYLENBQWdCLE9BQWhCLENBQXdCLGdCQUFRO0FBQy9CLFdBQUssS0FBTCxDQUFXLGVBQVg7QUFDQSxXQUFLLE9BQUwsQ0FBYSxJQUFiO0FBQ0EsSUFIRDtBQUlBOztBQUVEOzs7O3NDQUNvQixRLEVBQVU7QUFDN0IsT0FBSSxPQUFPO0FBQ1YsUUFBSSxTQURNO0FBRVYsV0FBTyxTQUZHO0FBR1YsV0FBTyxVQUhHO0FBSVYsWUFBUSxFQUpFO0FBS1YsV0FBTyxHQUxHOztBQU9WLGFBQVM7QUFQQyxJQUFYOztBQVVBLE9BQUksY0FBYyxLQUFLLDhCQUFMLENBQW9DLFNBQVMsSUFBVCxDQUFjLEtBQWxELENBQWxCO0FBQ0E7O0FBRUEsT0FBSSxZQUFZLE1BQVosS0FBdUIsQ0FBM0IsRUFBOEI7QUFDcEIsU0FBSyxLQUFMLEdBQWEsU0FBUyxJQUFULENBQWMsS0FBM0I7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBbkI7O0FBRUEsU0FBSyxRQUFMLENBQWM7QUFDYiw0Q0FBb0MsU0FBUyxJQUFULENBQWMsS0FBbEQsbUNBRGE7QUFFYixlQUFVO0FBQ2xCLGFBQVEsU0FBUyxJQUFULENBQWMsT0FBZCxDQUFzQixRQURaO0FBRWxCLFdBQU0sU0FBUyxJQUFULENBQWMsT0FBZCxDQUFzQjtBQUZWLE1BRkc7QUFNYixXQUFNO0FBTk8sS0FBZDtBQVFILElBWlAsTUFZYSxJQUFJLFlBQVksTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUMxQyxRQUFJLGFBQWEsWUFBWSxDQUFaLENBQWpCO0FBQ0EsUUFBSSxVQUFKLEVBQWdCO0FBQ2YsVUFBSyxLQUFMLEdBQWEsV0FBVyxLQUF4QjtBQUNBLFVBQUssS0FBTCxHQUFhLFdBQVcsSUFBeEI7QUFDQTtBQUNELElBTlksTUFNTjtBQUNOLFNBQUssS0FBTCxHQUFhLFNBQVMsSUFBVCxDQUFjLEtBQTNCO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDYiw0Q0FBb0MsU0FBUyxJQUFULENBQWMsS0FBbEQsOEJBQStFLFlBQVksR0FBWixDQUFnQjtBQUFBLG9CQUFXLElBQUksSUFBZjtBQUFBLE1BQWhCLEVBQXdDLElBQXhDLENBQTZDLElBQTdDLENBQS9FLE1BRGE7QUFFYixlQUFVO0FBQ1QsYUFBUSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCLFFBRHJCO0FBRVQsV0FBTSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCO0FBRm5CLE1BRkc7QUFNYixXQUFNO0FBTk8sS0FBZDtBQVFBOztBQUVELE9BQUksQ0FBQyxTQUFTLEtBQWQsRUFBcUI7QUFDcEIsU0FBSyxFQUFMLEdBQVUsS0FBSyxLQUFMLENBQVcsa0JBQVgsQ0FBOEIsS0FBSyxLQUFuQyxDQUFWO0FBQ0EsSUFGRCxNQUVPO0FBQ04sU0FBSyxFQUFMLEdBQVUsU0FBUyxLQUFULENBQWUsS0FBekI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsU0FBUyxLQUFULENBQWUsS0FBdEM7QUFDQSxTQUFLLE1BQUwsR0FBYyxFQUFkO0FBQ0E7O0FBRUQ7QUFDQSxPQUFJLE9BQU8sSUFBUCxDQUFZLEtBQUssS0FBTCxDQUFXLFNBQXZCLEVBQWtDLFFBQWxDLENBQTJDLEtBQUssS0FBaEQsQ0FBSixFQUE0RDtBQUMzRCxRQUFJLFFBQVEsR0FBRyxLQUFILENBQVMsS0FBSyxLQUFkLENBQVo7QUFDQSxVQUFNLE9BQU4sR0FBZ0IsR0FBaEI7QUFDQSxTQUFLLEtBQUwsQ0FBVyxjQUFYLENBQTBCLEtBQUssRUFBL0IsRUFBbUMsS0FBSyxLQUF4QyxlQUNJLElBREo7QUFFQyxZQUFPLEVBQUMsUUFBUSxNQUFNLFFBQU4sRUFBVDtBQUZSO0FBSUE7QUFDQTs7QUFFRCxRQUFLLEtBQUwsQ0FBVyxVQUFYLENBQXNCLEtBQUssRUFBM0IsZUFDSSxJQURKO0FBRVUsV0FBTyxFQUFDLFFBQVEsS0FBSyxLQUFkLEVBRmpCO0FBR1UsV0FBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEtBQUwsQ0FBVyxNQUFwQixFQUE0QixLQUFLLGVBQUwsR0FBdUIsS0FBSyxlQUFMLENBQXFCLE1BQTVDLEdBQXFELENBQWpGLENBQVQsRUFBOEYsQ0FBOUYsSUFBbUc7QUFIcEg7QUFLQTs7O2tDQUVlLEksRUFBTTtBQUFBOztBQUNyQixRQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCO0FBQUEsV0FBUSxPQUFLLE9BQUwsQ0FBYSxJQUFiLENBQVI7QUFBQSxJQUFsQjtBQUNBOzs7bUNBRWdCLFUsRUFBWTtBQUM1QixRQUFLLEtBQUwsQ0FBVyxhQUFYLENBQXlCLFdBQVcsS0FBcEM7QUFDQTs7O2lEQUU4QixLLEVBQU87QUFBQTs7QUFDckMsT0FBSSxjQUFjLE9BQU8sSUFBUCxDQUFZLEtBQUssV0FBakIsQ0FBbEI7QUFDQSxPQUFJLGlCQUFpQixPQUFPLGNBQVAsQ0FBc0IsS0FBdEIsRUFBNkIsV0FBN0IsQ0FBckI7QUFDQTtBQUNBLE9BQUkscUJBQXFCLGVBQWUsR0FBZixDQUFtQjtBQUFBLFdBQU8sT0FBSyxXQUFMLENBQWlCLEdBQWpCLENBQVA7QUFBQSxJQUFuQixDQUF6QjtBQUNBLFVBQU8sa0JBQVA7QUFDQTs7OzBDQUV1QjtBQUN2QixVQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBUDtBQUNBOzs7OEJBRVc7QUFDWCxVQUFPLEtBQUssTUFBTCxDQUFZLFNBQVosRUFBUDtBQUNBOzs7MkJBRVEsSyxFQUFPO0FBQ2YsUUFBSyxNQUFMLENBQVksUUFBWixDQUFxQixLQUFyQjtBQUNBOzs7MEJBa0JPLEksRUFBTTtBQUNiLE9BQUksQ0FBQyxJQUFMLEVBQVc7QUFBRSxZQUFRLEtBQVIsQ0FBYyxXQUFkLEVBQTRCO0FBQVM7O0FBRWxELFdBQVEsS0FBSyxJQUFiO0FBQ0MsU0FBSyxTQUFMO0FBQWdCLFVBQUssdUJBQUwsQ0FBNkIsSUFBN0IsRUFBb0M7QUFDcEQsU0FBSyxpQkFBTDtBQUF3QixVQUFLLHFCQUFMLENBQTJCLElBQTNCLEVBQWtDO0FBQzFELFNBQUsscUJBQUw7QUFBNEIsVUFBSyx5QkFBTCxDQUErQixJQUEvQixFQUFzQztBQUNsRSxTQUFLLGlCQUFMO0FBQXdCLFVBQUsscUJBQUwsQ0FBMkIsSUFBM0IsRUFBa0M7QUFDMUQsU0FBSyxxQkFBTDtBQUE0QixVQUFLLHlCQUFMLENBQStCLElBQS9CLEVBQXNDO0FBQ2xFLFNBQUssc0JBQUw7QUFBNkIsVUFBSywwQkFBTCxDQUFnQyxJQUFoQyxFQUF1QztBQUNwRSxTQUFLLGVBQUw7QUFBc0IsVUFBSyxtQkFBTCxDQUF5QixJQUF6QixFQUFnQztBQUN0RCxTQUFLLFdBQUw7QUFBa0IsVUFBSyxlQUFMLENBQXFCLElBQXJCLEVBQTRCO0FBQzlDLFNBQUssWUFBTDtBQUFtQixVQUFLLGdCQUFMLENBQXNCLElBQXRCLEVBQTZCO0FBQ2hEO0FBQVMsVUFBSyxzQkFBTCxDQUE0QixJQUE1QjtBQVZWO0FBWUE7OztpQ0EvQnFCLE8sRUFBUyxJLEVBQU07QUFDcEMsT0FBSSxhQUFhLGNBQWpCO0FBQ0csT0FBSSxlQUFlLFFBQVEsS0FBUixDQUFjLFVBQWQsQ0FBbkI7QUFDQSxPQUFJLFlBQVksS0FBSyxHQUFMLENBQVM7QUFBQSxXQUFjLFdBQVcsS0FBWCxDQUFpQixVQUFqQixDQUFkO0FBQUEsSUFBVCxDQUFoQjtBQUNBLE9BQUksU0FBUyxVQUFVLE1BQVYsQ0FBaUI7QUFBQSxXQUFpQixPQUFPLGFBQVAsQ0FBcUIsWUFBckIsRUFBbUMsYUFBbkMsQ0FBakI7QUFBQSxJQUFqQixDQUFiO0FBQ0EsWUFBUyxPQUFPLEdBQVAsQ0FBVztBQUFBLFdBQVEsS0FBSyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsSUFBWCxDQUFUO0FBQ0EsVUFBTyxNQUFQO0FBQ0g7OztnQ0FFb0IsSSxFQUFNLE0sRUFBUTtBQUMvQixPQUFJLEtBQUssTUFBTCxLQUFnQixPQUFPLE1BQTNCLEVBQW1DO0FBQUUsV0FBTyxLQUFQO0FBQWU7QUFDcEQsT0FBSSxJQUFJLENBQVI7QUFDQSxVQUFNLElBQUksS0FBSyxNQUFULElBQW1CLE9BQU8sQ0FBUCxFQUFVLFVBQVYsQ0FBcUIsS0FBSyxDQUFMLENBQXJCLENBQXpCLEVBQXdEO0FBQUUsU0FBSyxDQUFMO0FBQVM7QUFDbkUsVUFBUSxNQUFNLEtBQUssTUFBbkIsQ0FKK0IsQ0FJSDtBQUMvQjs7Ozs7Ozs7Ozs7Ozs7O0lDdkxJLEs7Ozs7Ozs7Ozs7OzZCQUNLO0FBQ1AsYUFBTztBQUFBO0FBQUEsVUFBSyxJQUFJLEtBQUssS0FBTCxDQUFXLEVBQXBCLEVBQXdCLFdBQVUsT0FBbEM7QUFDTCxhQUFLLEtBQUwsQ0FBVztBQUROLE9BQVA7QUFHRDs7OztFQUxpQixNQUFNLFM7Ozs7Ozs7SUNBcEIsVTtBQUdMLHVCQUF3QjtBQUFBLE1BQVosS0FBWSx5REFBSixFQUFJOztBQUFBOztBQUFBLE9BRnhCLFVBRXdCLEdBRlgsRUFFVzs7QUFDdkIsTUFBSSxNQUFNLE9BQU4sQ0FBYyxLQUFkLENBQUosRUFBMEI7QUFDekIsUUFBSyxVQUFMLEdBQWtCLEtBQWxCO0FBQ0EsR0FGRCxNQUVPO0FBQ04sV0FBUSxLQUFSLENBQWMsd0NBQWQsRUFBd0QsS0FBeEQ7QUFDQTtBQUNEOzs7OytCQUVZO0FBQ1osUUFBSyxLQUFMO0FBQ0E7Ozt1QkFFSSxLLEVBQU87QUFDWCxRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsS0FBckI7QUFDQTs7O3dCQUVLO0FBQ0wsVUFBTyxLQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsRUFBUDtBQUNBOzs7MEJBRU87QUFDUCxRQUFLLFVBQUwsR0FBa0IsRUFBbEI7QUFDQTs7OzJDQUV3QjtBQUN4QixVQUFPLEtBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixHQUFyQixDQUFQO0FBQ0E7Ozs0Q0FFeUI7QUFDekIsT0FBSSxPQUFPLE1BQU0sSUFBTixDQUFXLEtBQUssVUFBaEIsQ0FBWDtBQUNBLFFBQUssR0FBTDtBQUNBLFVBQU8sS0FBSyxJQUFMLENBQVUsR0FBVixDQUFQO0FBQ0E7Ozs7Ozs7Ozs7Ozs7OztJQ25DSSxXOzs7QUFFRix5QkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQ2YsZ0JBQVEsR0FBUixDQUFZLHlCQUFaOztBQURlLDhIQUVULEtBRlM7O0FBR2YsY0FBSyxXQUFMLEdBQW1CLElBQUksV0FBSixFQUFuQjtBQUNBLGNBQUssS0FBTCxHQUFhO0FBQ1QsbUJBQU8sSUFERTtBQUVULDZCQUFpQjtBQUZSLFNBQWI7QUFJQSxjQUFLLE9BQUwsR0FBZSxJQUFmO0FBUmU7QUFTbEI7Ozs7a0NBRVMsSyxFQUFPO0FBQ2IsaUJBQUssUUFBTCxDQUFjO0FBQ1YsdUJBQU87QUFERyxhQUFkO0FBR0g7OztrREFFeUIsUyxFQUFXO0FBQ2pDO0FBQ0EsZ0JBQUksVUFBVSxLQUFkLEVBQXFCO0FBQ2pCLDBCQUFVLEtBQVYsQ0FBZ0IsTUFBaEIsQ0FBdUIsT0FBdkIsR0FBaUMsVUFBVSxNQUEzQztBQUNBLHFCQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsVUFBVSxLQUFsQyxFQUF5QyxLQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLElBQXBCLENBQXpDO0FBQ0g7QUFDSjs7O29DQUVXLEksRUFBTTtBQUNkLG9CQUFRLEdBQVIsQ0FBWSxTQUFaLEVBQXVCLElBQXZCO0FBQ0EsaUJBQUssUUFBTCxDQUFjO0FBQ1YsOEJBQWMsS0FBSztBQURULGFBQWQ7QUFHQSxpQkFBSyxPQUFMLENBQWEsWUFBYjtBQUNIOzs7OEJBRUssTyxFQUFTO0FBQ1gsZ0JBQUksT0FBSixFQUFhO0FBQ1QscUJBQUssT0FBTCxHQUFlLE9BQWY7QUFDSDtBQUNELGlCQUFLLE9BQUwsQ0FBYSxZQUFiO0FBQ0g7OztpQ0FFUTtBQUFBOztBQUNMOztBQUVBLGdCQUFJLENBQUMsS0FBSyxLQUFMLENBQVcsS0FBaEIsRUFBdUI7QUFDbkI7QUFDQSx1QkFBTyxJQUFQO0FBQ0g7O0FBRUQsZ0JBQUksSUFBSSxLQUFLLEtBQUwsQ0FBVyxLQUFuQjs7QUFFQSxnQkFBSSxRQUFRLEVBQUUsS0FBRixHQUFVLEdBQVYsQ0FBYyxvQkFBWTtBQUNsQyxvQkFBSSxjQUFKO0FBQ0Esb0JBQUksSUFBSSxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVI7QUFDQSxvQkFBSSxPQUFPLElBQVg7QUFDQSxvQkFBSSxRQUFRO0FBQ1IseUJBQUssUUFERztBQUVSLDBCQUFNLENBRkU7QUFHUiw2QkFBUyxNQUFNLFdBQU4sQ0FBa0IsSUFBbEIsQ0FBdUIsS0FBdkI7QUFIRCxpQkFBWjs7QUFNQSxvQkFBSSxFQUFFLFVBQUYsS0FBaUIsSUFBckIsRUFBMkI7QUFDdkIsMkJBQU8sb0JBQUMsUUFBRCxFQUFjLEtBQWQsQ0FBUDtBQUNILGlCQUZELE1BRU87QUFDSCx3QkFBSSxFQUFFLGVBQU4sRUFBdUI7QUFDbkIsK0JBQU8sb0JBQUMsY0FBRCxFQUFvQixLQUFwQixDQUFQO0FBQ0gscUJBRkQsTUFFTztBQUNILCtCQUFPLG9CQUFDLGFBQUQsRUFBbUIsS0FBbkIsQ0FBUDtBQUNIO0FBQ0o7O0FBRUQsdUJBQU8sSUFBUDtBQUNILGFBckJXLENBQVo7O0FBdUJBLGdCQUFJLFFBQVEsRUFBRSxLQUFGLEdBQVUsR0FBVixDQUFjLG9CQUFZO0FBQ2xDLG9CQUFJLElBQUksRUFBRSxJQUFGLENBQU8sUUFBUCxDQUFSO0FBQ0EsdUJBQU8sb0JBQUMsSUFBRCxJQUFNLEtBQVEsU0FBUyxDQUFqQixVQUF1QixTQUFTLENBQXRDLEVBQTJDLE1BQU0sQ0FBakQsR0FBUDtBQUNILGFBSFcsQ0FBWjs7QUFLQSxnQkFBSSx5QkFBdUIsRUFBRSxLQUFGLEdBQVUsS0FBakMsU0FBMEMsRUFBRSxLQUFGLEdBQVUsTUFBeEQ7QUFDQSxnQkFBSSxnQkFBZ0IsbUNBQWdDLEVBQUUsS0FBRixHQUFVLEtBQVYsR0FBa0IsRUFBRSxLQUFGLEdBQVUsS0FBNUQsU0FBcUUsRUFBRSxLQUFGLEdBQVUsTUFBVixHQUFtQixFQUFFLEtBQUYsR0FBVSxNQUFsRyxPQUFwQjs7QUFFQSxnQkFBSSxlQUFlLEtBQUssS0FBTCxDQUFXLFlBQTlCO0FBQ0EsZ0JBQUksT0FBSjtBQUNBLGdCQUFJLFlBQUosRUFBa0I7QUFDZCxvQkFBSSxJQUFJLEVBQUUsSUFBRixDQUFPLFlBQVAsQ0FBUjtBQUNBLDBCQUFhLEVBQUUsQ0FBRixHQUFNLEVBQUUsS0FBRixHQUFVLENBQTdCLFVBQWtDLEVBQUUsQ0FBRixHQUFNLEVBQUUsTUFBRixHQUFXLENBQW5ELFVBQXdELEVBQUUsS0FBMUQsU0FBbUUsRUFBRSxNQUFyRTtBQUNILGFBSEQsTUFHTztBQUNILDBCQUFVLGFBQVY7QUFDSDs7QUFFRCxtQkFBTztBQUFBO0FBQUEsa0JBQUssSUFBRyxlQUFSO0FBQ0gsaURBQVMsS0FBSyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLElBQWhCLENBQWQsRUFBcUMsZUFBYyxTQUFuRCxFQUE2RCxNQUFNLGFBQW5FLEVBQWtGLElBQUksT0FBdEYsRUFBK0YsT0FBTSxJQUFyRyxFQUEwRyxLQUFJLE9BQTlHLEVBQXNILE1BQUssUUFBM0gsRUFBb0ksYUFBWSxHQUFoSixHQURHO0FBRUg7QUFBQTtBQUFBO0FBQ0k7QUFBQTtBQUFBLDBCQUFRLElBQUcsS0FBWCxFQUFpQixTQUFRLFdBQXpCLEVBQXFDLE1BQUssSUFBMUMsRUFBK0MsTUFBSyxHQUFwRCxFQUF3RCxhQUFZLGFBQXBFLEVBQWtGLGFBQVksSUFBOUYsRUFBbUcsY0FBYSxLQUFoSCxFQUFzSCxRQUFPLE1BQTdIO0FBQ0ksc0RBQU0sR0FBRSw2QkFBUixFQUFzQyxXQUFVLE9BQWhEO0FBREo7QUFESixpQkFGRztBQU9IO0FBQUE7QUFBQSxzQkFBRyxJQUFHLE9BQU47QUFDSTtBQUFBO0FBQUEsMEJBQUcsSUFBRyxPQUFOO0FBQ0s7QUFETCxxQkFESjtBQUlJO0FBQUE7QUFBQSwwQkFBRyxJQUFHLE9BQU47QUFDSztBQURMO0FBSko7QUFQRyxhQUFQO0FBZ0JIOzs7O0VBNUdxQixNQUFNLFM7O0lBK0cxQixJOzs7QUFNRixrQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsaUhBQ1QsS0FEUzs7QUFBQSxlQUxuQixJQUttQixHQUxaLEdBQUcsSUFBSCxHQUNGLEtBREUsQ0FDSSxHQUFHLFVBRFAsRUFFRixDQUZFLENBRUE7QUFBQSxtQkFBSyxFQUFFLENBQVA7QUFBQSxTQUZBLEVBR0YsQ0FIRSxDQUdBO0FBQUEsbUJBQUssRUFBRSxDQUFQO0FBQUEsU0FIQSxDQUtZOztBQUVmLGVBQUssS0FBTCxHQUFhO0FBQ1QsNEJBQWdCO0FBRFAsU0FBYjtBQUZlO0FBS2xCOzs7O2tEQUV5QixTLEVBQVc7QUFDakMsaUJBQUssUUFBTCxDQUFjO0FBQ1YsZ0NBQWdCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFEdEIsYUFBZDtBQUdIOzs7OEJBRUssTyxFQUFTO0FBQ1gsZ0JBQUksT0FBSixFQUFhO0FBQ1Qsd0JBQVEsWUFBUjtBQUNIO0FBQ0o7OztpQ0FFUTtBQUNMLGdCQUFJLElBQUksS0FBSyxLQUFMLENBQVcsSUFBbkI7QUFDQSxnQkFBSSxJQUFJLEtBQUssSUFBYjtBQUNBLG1CQUNJO0FBQUE7QUFBQSxrQkFBRyxXQUFVLFVBQWIsRUFBd0IsV0FBVSxXQUFsQztBQUNJO0FBQUE7QUFBQSxzQkFBTSxHQUFHLEVBQUUsRUFBRSxNQUFKLENBQVQ7QUFDSSxxREFBUyxLQUFLLEtBQUssS0FBbkIsRUFBMEIsS0FBSyxLQUFLLE1BQUwsRUFBL0IsRUFBOEMsU0FBUSxRQUF0RCxFQUErRCxNQUFNLEVBQUUsS0FBSyxLQUFMLENBQVcsY0FBYixDQUFyRSxFQUFtRyxJQUFJLEVBQUUsRUFBRSxNQUFKLENBQXZHLEVBQW9ILE9BQU0sSUFBMUgsRUFBK0gsS0FBSSxPQUFuSSxFQUEySSxNQUFLLFFBQWhKLEVBQXlKLGFBQVksR0FBckssRUFBeUssZUFBYyxHQUF2TDtBQURKO0FBREosYUFESjtBQU9IOzs7O0VBbkNjLE1BQU0sUzs7SUFzQ25CLEk7OztBQUNGLGtCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSwyR0FDVCxLQURTO0FBRWxCOzs7O3NDQUNhO0FBQ1YsaUJBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsS0FBSyxLQUFMLENBQVcsSUFBOUI7QUFDSDs7O2lDQUNRO0FBQ0wsZ0JBQUksSUFBSSxLQUFLLEtBQUwsQ0FBVyxJQUFuQjtBQUNBLG1CQUNJO0FBQUE7QUFBQSxrQkFBRyxxQkFBbUIsRUFBRSxLQUF4QixFQUFpQyxTQUFTLEtBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixJQUF0QixDQUExQyxFQUF1RSxPQUFPLEVBQUMsMkJBQXdCLEVBQUUsQ0FBRixHQUFNLEVBQUUsS0FBRixHQUFRLENBQXRDLGFBQThDLEVBQUUsQ0FBRixHQUFNLEVBQUUsTUFBRixHQUFTLENBQTdELFNBQUQsRUFBOUU7QUFDSyxxQkFBSyxLQUFMLENBQVc7QUFEaEIsYUFESjtBQUtIOzs7O0VBZGMsTUFBTSxTOztJQWlCbkIsUTs7Ozs7Ozs7Ozs7aUNBQ087QUFDTCxnQkFBSSxJQUFJLEtBQUssS0FBTCxDQUFXLElBQW5CO0FBQ0EsbUJBQ0k7QUFBQyxvQkFBRDtBQUFVLHFCQUFLLEtBQWY7QUFDSSw4Q0FBTSxPQUFPLEVBQUUsS0FBZixFQUFzQixRQUFRLEVBQUUsTUFBaEMsRUFBd0MsSUFBRyxNQUEzQyxFQUFrRCxJQUFHLE1BQXJELEVBQTRELE9BQU8sRUFBRSxLQUFyRSxHQURKO0FBRUk7QUFBQTtBQUFBLHNCQUFNLDRCQUFOLEVBQW9DLFlBQVcsT0FBL0MsRUFBdUQsT0FBTyxFQUFDLGtCQUFrQixhQUFuQixFQUE5RDtBQUNJO0FBQUE7QUFBQSwwQkFBTyxHQUFFLEdBQVQsRUFBYSxXQUFVLElBQXZCO0FBQTZCLDBCQUFFO0FBQS9CLHFCQURKO0FBRUk7QUFBQTtBQUFBLDBCQUFPLEdBQUUsR0FBVCxFQUFhLElBQUcsT0FBaEI7QUFBeUIsMEJBQUU7QUFBM0I7QUFGSjtBQUZKLGFBREo7QUFTSDs7OztFQVprQixJOztJQWVqQixhOzs7QUFDRiwyQkFBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsNkhBQ1QsS0FEUztBQUVsQjs7OztpQ0FDUTtBQUNMLGdCQUFJLElBQUksS0FBSyxLQUFMLENBQVcsSUFBbkI7QUFDQSxtQkFDSTtBQUFDLG9CQUFEO0FBQVUscUJBQUssS0FBZjtBQUNJO0FBQUE7QUFBQSxzQkFBTSxPQUFPLEVBQUUsS0FBZixFQUFzQixRQUFRLEVBQUUsTUFBaEMsRUFBd0MsSUFBRyxNQUEzQyxFQUFrRCxJQUFHLE1BQXJELEVBQTRELE9BQU8sRUFBRSxLQUFyRTtBQUFBO0FBQUEsaUJBREo7QUFFSTtBQUFBO0FBQUEsc0JBQU0sMEJBQXlCLEVBQUUsS0FBRixHQUFRLENBQWpDLFNBQXlDLEVBQUUsTUFBRixHQUFTLENBQWxELE1BQU4sRUFBK0QsWUFBVyxRQUExRTtBQUNJO0FBQUE7QUFBQTtBQUFRLDBCQUFFO0FBQVY7QUFESjtBQUZKLGFBREo7QUFRSDs7OztFQWR1QixJOztJQWlCdEIsYzs7Ozs7Ozs7Ozs7aUNBQ087QUFDTCxnQkFBSSxJQUFJLEtBQUssS0FBTCxDQUFXLElBQW5CO0FBQ0EsbUJBQ0k7QUFBQyxvQkFBRDtBQUFVLHFCQUFLLEtBQWY7QUFDSSw4Q0FBTSxPQUFPLEVBQUUsS0FBZixFQUFzQixRQUFRLEVBQUUsTUFBaEMsRUFBd0MsSUFBRyxNQUEzQyxFQUFrRCxJQUFHLE1BQXJELEVBQTRELE9BQU8sRUFBRSxLQUFyRSxHQURKO0FBRUk7QUFBQTtBQUFBLHNCQUFNLDBCQUF5QixFQUFFLEtBQUYsR0FBUSxDQUFqQyxTQUF5QyxFQUFFLE1BQUYsR0FBUyxDQUFsRCxNQUFOLEVBQStELFlBQVcsUUFBMUUsRUFBbUYsT0FBTyxFQUFDLGtCQUFrQixhQUFuQixFQUExRjtBQUNJO0FBQUE7QUFBQSwwQkFBTyxHQUFFLEdBQVQsRUFBYSxXQUFVLElBQXZCO0FBQTZCLDBCQUFFO0FBQS9CLHFCQURKO0FBRUk7QUFBQTtBQUFBLDBCQUFPLEdBQUUsR0FBVCxFQUFhLElBQUcsT0FBaEI7QUFBeUIsMEJBQUU7QUFBM0I7QUFGSjtBQUZKLGFBREo7QUFTSDs7OztFQVp3QixJOzs7QUN0TTdCLFNBQVMsR0FBVCxHQUFlO0FBQ2IsV0FBUyxNQUFULENBQWdCLG9CQUFDLEdBQUQsT0FBaEIsRUFBd0IsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQXhCO0FBQ0Q7O0FBRUQsSUFBTSxlQUFlLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsYUFBdkIsQ0FBckI7O0FBRUEsSUFBSSxhQUFhLFFBQWIsQ0FBc0IsU0FBUyxVQUEvQixLQUE4QyxTQUFTLElBQTNELEVBQWlFO0FBQy9EO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsU0FBTyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdGRlZmF1bHRFZGdlID0ge31cblxuXHRub2RlQ291bnRlciA9IHt9XG5cdG5vZGVTdGFjayA9IFtdXG5cdHByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmNsZWFyTm9kZVN0YWNrKClcblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJTY29wZShzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlLm5hbWUudmFsdWUpO1xuXHRcdGxldCBjdXJyZW50U2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHByZXZpb3VzU2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGN1cnJlbnRTY29wZUlkLCB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRpZDogc2NvcGUubmFtZS52YWx1ZSxcbiAgICAgICAgICAgIGNsYXNzOiBcIk1ldGFub2RlXCIsXG4gICAgICAgICAgICBpc01ldGFub2RlOiB0cnVlLFxuICAgICAgICAgICAgX3NvdXJjZTogc2NvcGUubmFtZS5fc291cmNlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChjdXJyZW50U2NvcGVJZCwgcHJldmlvdXNTY29wZUlkKTtcblx0fVxuXG5cdGV4aXRTY29wZSgpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrLnB1c2gobm9kZVBhdGgpO1xuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2tbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRpZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG1ldGFub2RlQ2xhc3MsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZGVudGlmaWVyKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXHRcdFxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aCxcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0ZnJlZXplTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbLi4udGhpcy5ub2RlU3RhY2tdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCk7XG5cdH1cblxuXHRpc0lucHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIjtcblx0fVxuXG5cdGlzT3V0cHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiT3V0cHV0XCI7XG5cdH1cblxuXHRpc01ldGFub2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZTtcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBvdXRwdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXG5cdFx0aWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1x0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dE5vZGVzO1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzSW5wdXQobm9kZSl9KTtcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IElucHV0IG5vZGVzLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXM7XG5cdH1cblxuXHRzZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYENyZWF0aW5nIGVkZ2UgZnJvbSBcIiR7ZnJvbVBhdGh9XCIgdG8gXCIke3RvUGF0aH1cIi5gKVxuXHRcdHZhciBzb3VyY2VQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiBmcm9tUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZShmcm9tUGF0aCkpIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSB0aGlzLmdldE91dHB1dE5vZGVzKGZyb21QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSBbZnJvbVBhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZyb21QYXRoKSkge1xuXHRcdFx0c291cmNlUGF0aHMgPSBmcm9tUGF0aFxuXHRcdH1cblxuXHRcdHZhciB0YXJnZXRQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiB0b1BhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IHRoaXMuZ2V0SW5wdXROb2Rlcyh0b1BhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IFt0b1BhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRvUGF0aCkpIHtcblx0XHRcdHRhcmdldFBhdGhzID0gdG9QYXRoXG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKVxuXHR9XG5cblx0c2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocykge1xuXG5cdFx0aWYgKHNvdXJjZVBhdGhzID09PSBudWxsIHx8IHRhcmdldFBhdGhzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSB0YXJnZXRQYXRocy5sZW5ndGgpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlUGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHNvdXJjZVBhdGhzW2ldICYmIHRhcmdldFBhdGhzW2ldKSB7XG5cdFx0XHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKHNvdXJjZVBhdGhzW2ldLCB0YXJnZXRQYXRoc1tpXSwgey4uLnRoaXMuZGVmYXVsdEVkZ2V9KTtcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YXJnZXRQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0c291cmNlUGF0aHMuZm9yRWFjaChzb3VyY2VQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoLCB0YXJnZXRQYXRoc1swXSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IGBOdW1iZXIgb2Ygbm9kZXMgZG9lcyBub3QgbWF0Y2guIFske3NvdXJjZVBhdGhzLmxlbmd0aH1dIC0+IFske3RhcmdldFBhdGhzLmxlbmd0aH1dYCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdC8vIHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0XHQvLyBlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMuZ3JhcGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcnMoKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5tYXAobWFya2VyID0+IHRoaXMuZWRpdG9yLnNlc3Npb24ucmVtb3ZlTWFya2VyKG1hcmtlcikpO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkN1cnNvclBvc2l0aW9uQ2hhbmdlZChldmVudCwgc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCBtID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGxldCBjID0gc2VsZWN0aW9uLmdldEN1cnNvcigpO1xuICAgICAgICBsZXQgbWFya2VycyA9IHRoaXMubWFya2Vycy5tYXAoaWQgPT4gbVtpZF0pO1xuICAgICAgICBsZXQgY3Vyc29yT3Zlck1hcmtlciA9IG1hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIucmFuZ2UuaW5zaWRlKGMucm93LCBjLmNvbHVtbikpLnJlZHVjZSggKHByZXYsIGN1cnIpID0+IHByZXYgfHwgY3VyciwgZmFsc2UpO1xuXG4gICAgICAgIGlmIChjdXJzb3JPdmVyTWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhY2UuZWRpdCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKFwiYWNlL21vZGUvXCIgKyB0aGlzLnByb3BzLm1vZGUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS9cIiArIHRoaXMucHJvcHMudGhlbWUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTbmlwcGV0czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICB3cmFwOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEVkaXRvckludG9WaWV3OiB0cnVlLFxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJGaXJhIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdHdvcmtlciA9IG5ldyBXb3JrZXIoXCJzcmMvc2NyaXB0cy9HcmFwaExheW91dFdvcmtlci5qc1wiKTtcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbigpe31cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBlbmNvZGUoZ3JhcGgpIHtcbiAgICBcdHJldHVybiBKU09OLnN0cmluZ2lmeShncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKSk7XG4gICAgfVxuXG4gICAgZGVjb2RlKGpzb24pIHtcbiAgICBcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoSlNPTi5wYXJzZShqc29uKSk7XG4gICAgfVxuXG4gICAgbGF5b3V0KGdyYXBoLCBjYWxsYmFjaykge1xuICAgIFx0Ly9jb25zb2xlLmxvZyhcIkdyYXBoTGF5b3V0LmxheW91dFwiLCBncmFwaCwgY2FsbGJhY2spO1xuICAgIFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgIFx0XHRncmFwaDogdGhpcy5lbmNvZGUoZ3JhcGgpXG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICByZWNlaXZlKGRhdGEpIHtcbiAgICBcdHZhciBncmFwaCA9IHRoaXMuZGVjb2RlKGRhdGEuZGF0YS5ncmFwaCk7XG4gICAgXHR0aGlzLmNhbGxiYWNrKGdyYXBoKTtcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdG1vbmllbCA9IG5ldyBNb25pZWwoKTtcblxuXHRsb2NrID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdFwiZ3JhbW1hclwiOiBncmFtbWFyLFxuXHRcdFx0XCJzZW1hbnRpY3NcIjogc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImxheW91dFwiOiBcImNvbHVtbnNcIlxuXHRcdH07XG5cblx0XHRpcGMub24oJ3NhdmUnLCBmdW5jdGlvbihldmVudCwgbWVzc2FnZSkge1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLm1vblwiLCB0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9uLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UuYXN0Lmpzb25cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBzYXZlTm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignU2tldGNoIHNhdmVkJywge1xuICAgICAgICAgICAgXHRib2R5OiBgU2tldGNoIHdhcyBzdWNjZXNzZnVsbHkgc2F2ZWQgaW4gdGhlIFwic2tldGNoZXNcIiBmb2xkZXIuYCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG4gICAgICAgICAgICB9KVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRsZXQgbGF5b3V0ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGF5b3V0XCIpXG5cdFx0aWYgKGxheW91dCkge1xuXHRcdFx0aWYgKGxheW91dCA9PSBcImNvbHVtbnNcIiB8fCBsYXlvdXQgPT0gXCJyb3dzXCIpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZS5sYXlvdXQgPSBsYXlvdXRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJ3YXJuaW5nXCIsXG5cdFx0XHRcdFx0bWVzc2FnZTogYFZhbHVlIGZvciBcImxheW91dFwiIGNhbiBiZSBvbmx5IFwiY29sdW1uc1wiIG9yIFwicm93c1wiLmBcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpO1xuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jb21waWxlVG9BU1QodGhpcy5zdGF0ZS5ncmFtbWFyLCB0aGlzLnN0YXRlLnNlbWFudGljcywgdmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpO1xuXHRcdFx0dmFyIGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0aXNzdWVzOiB0aGlzLm1vbmllbC5nZXRJc3N1ZXMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogbnVsbCxcblx0XHRcdFx0Z3JhcGg6IG51bGwsXG5cdFx0XHRcdGlzc3VlczogW3tcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IHJlc3VsdC5wb3NpdGlvbiAtIDEsXG5cdFx0XHRcdFx0XHRlbmQ6IHJlc3VsdC5wb3NpdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWVzc2FnZTogXCJFeHBlY3RlZCBcIiArIHJlc3VsdC5leHBlY3RlZCArIFwiLlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0XHR9XVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnNvbGUudGltZUVuZChcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0dG9nZ2xlTGF5b3V0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bGF5b3V0OiAodGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiKSA/IFwicm93c1wiIDogXCJjb2x1bW5zXCJcblx0XHR9KVxuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsXG5cdFx0XHRkYXRhOiBudWxsLFxuXHRcdFx0c3VjY2VzczogY2FsbGJhY2suYmluZCh0aGlzKSxcblx0XHRcdGRhdGFUeXBlOiBcInRleHRcIlxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gaW50byBNb25pZWw/IG9yIFBhcnNlclxuXHRjb21waWxlVG9BU1QoZ3JhbW1hciwgc2VtYW50aWNzLCBzb3VyY2UpIHtcblx0ICAgIHZhciByZXN1bHQgPSBncmFtbWFyLm1hdGNoKHNvdXJjZSk7XG5cblx0ICAgIGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0ICAgICAgICB2YXIgYXN0ID0gc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiYXN0XCI6IGFzdFxuXHQgICAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0ICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KCk7XG5cdCAgICAgICAgdmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiZXhwZWN0ZWRcIjogZXhwZWN0ZWQsXG5cdCAgICAgICAgICAgIFwicG9zaXRpb25cIjogcG9zaXRpb25cblx0ICAgICAgICB9XG5cdCAgICB9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHRncmFwaCA9IG5ldyBDb21wdXRhdGlvbmFsR3JhcGgodGhpcyk7XG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogY29sb3JIYXNoLmhleChkZWZpbml0aW9uTmFtZSlcblx0XHR9O1xuXHR9XG5cblx0aGFuZGxlU2NvcGVEZWZpbml0aW9uKHNjb3BlKSB7XG5cdFx0dGhpcy5ncmFwaC5lbnRlclNjb3BlKHNjb3BlKTtcblx0XHR0aGlzLndhbGtBc3Qoc2NvcGUuYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0U2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkoc2NvcGVCb2R5KSB7XG5cdFx0c2NvcGVCb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMud2Fsa0FzdChibG9ja0RlZmluaXRpb24uYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShkZWZpbml0aW9uQm9keSkge1xuXHRcdGRlZmluaXRpb25Cb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdGNvbm5lY3Rpb24ubGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5mcmVlemVOb2RlU3RhY2soKTtcblx0XHRcdHRoaXMud2Fsa0FzdChpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRoYW5kbGVCbG9ja0luc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UubmFtZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcbiAgICAgICAgICAgIG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cbiAgICAgICAgICAgIHRoaXMuYWRkSXNzdWUoe1xuICAgICAgICAgICAgXHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuICAgICAgICAgICAgXHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcbiAgICAgICAgICAgIFx0dHlwZTogXCJlcnJvclwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvcjtcblx0XHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb24ubmFtZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRub2RlLmlkID0gdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQobm9kZS5jbGFzcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuaWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUudXNlckdlbmVyYXRlZElkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLmhlaWdodCA9IDUwO1xuXHRcdH1cblxuXHRcdC8vIGlzIG1ldGFub2RlXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuZ3JhcGgubWV0YW5vZGVzKS5pbmNsdWRlcyhub2RlLmNsYXNzKSkge1xuXHRcdFx0dmFyIGNvbG9yID0gZDMuY29sb3Iobm9kZS5jb2xvcik7XG5cdFx0XHRjb2xvci5vcGFjaXR5ID0gMC4xO1xuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCBub2RlLmNsYXNzLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUobm9kZS5pZCwge1xuXHRcdFx0Li4ubm9kZSxcbiAgICAgICAgICAgIHN0eWxlOiB7XCJmaWxsXCI6IG5vZGUuY29sb3J9LFxuICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApLCA1KSAqIDEyXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZVNjb3BlRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPXt0aGlzLnByb3BzLmlkfSBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29uc3RydWN0b3JcIik7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3JhcGg6IG51bGwsXG4gICAgICAgICAgICBwcmV2aW91c1ZpZXdCb3g6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbmltYXRlID0gbnVsbFxuICAgIH1cblxuICAgIHNhdmVHcmFwaChncmFwaCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyYXBoOiBncmFwaFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHNcIiwgbmV4dFByb3BzKTtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCwgdGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhub2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZFwiLCBub2RlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGU6IG5vZGUuaWRcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZG9tTm9kZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdyYXBoKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBnID0gdGhpcy5zdGF0ZS5ncmFwaDtcblxuICAgICAgICBsZXQgbm9kZXMgPSBnLm5vZGVzKCkubWFwKG5vZGVOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBncmFwaCA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShub2RlTmFtZSk7XG4gICAgICAgICAgICBsZXQgbm9kZSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBub2RlTmFtZSxcbiAgICAgICAgICAgICAgICBub2RlOiBuLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGdyYXBoLmhhbmRsZUNsaWNrLmJpbmQoZ3JhcGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuLmlzTWV0YW5vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gPE1ldGFub2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuLnVzZXJHZW5lcmF0ZWRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPElkZW50aWZpZWROb2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxBbm9ueW1vdXNOb2RlIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZWRnZXMgPSBnLmVkZ2VzKCkubWFwKGVkZ2VOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBlID0gZy5lZGdlKGVkZ2VOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiA8RWRnZSBrZXk9e2Ake2VkZ2VOYW1lLnZ9LT4ke2VkZ2VOYW1lLnd9YH0gZWRnZT17ZX0vPlxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmlld0JveF93aG9sZSA9IGAwIDAgJHtnLmdyYXBoKCkud2lkdGh9ICR7Zy5ncmFwaCgpLmhlaWdodH1gO1xuICAgICAgICB2YXIgdHJhbnNmb3JtVmlldyA9IGB0cmFuc2xhdGUoMHB4LDBweClgICsgYHNjYWxlKCR7Zy5ncmFwaCgpLndpZHRoIC8gZy5ncmFwaCgpLndpZHRofSwke2cuZ3JhcGgoKS5oZWlnaHQgLyBnLmdyYXBoKCkuaGVpZ2h0fSlgO1xuICAgICAgICBcbiAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlO1xuICAgICAgICB2YXIgdmlld0JveFxuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShzZWxlY3RlZE5vZGUpO1xuICAgICAgICAgICAgdmlld0JveCA9IGAke24ueCAtIG4ud2lkdGggLyAyfSAke24ueSAtIG4uaGVpZ2h0IC8gMn0gJHtuLndpZHRofSAke24uaGVpZ2h0fWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdCb3ggPSB2aWV3Qm94X3dob2xlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gPHN2ZyBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudC5iaW5kKHRoaXMpfSBhdHRyaWJ1dGVOYW1lPVwidmlld0JveFwiIGZyb209e3ZpZXdCb3hfd2hvbGV9IHRvPXt2aWV3Qm94fSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCI+PC9hbmltYXRlPlxuICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgPG1hcmtlciBpZD1cInZlZVwiIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiByZWZYPVwiMTBcIiByZWZZPVwiNVwiIG1hcmtlclVuaXRzPVwic3Ryb2tlV2lkdGhcIiBtYXJrZXJXaWR0aD1cIjEwXCIgbWFya2VySGVpZ2h0PVwiNy41XCIgb3JpZW50PVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDMgNSB6XCIgY2xhc3NOYW1lPVwiYXJyb3dcIj48L3BhdGg+XG4gICAgICAgICAgICAgICAgPC9tYXJrZXI+XG4gICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICA8ZyBpZD1cImdyYXBoXCI+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJub2Rlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7bm9kZXN9XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwiZWRnZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge2VkZ2VzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgPC9zdmc+O1xuICAgIH1cbn1cblxuY2xhc3MgRWRnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBsaW5lID0gZDMubGluZSgpXG4gICAgICAgIC5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgLnkoZCA9PiBkLnkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogW11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IHRoaXMucHJvcHMuZWRnZS5wb2ludHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgZG9tTm9kZS5iZWdpbkVsZW1lbnQoKSAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLnByb3BzLmVkZ2U7XG4gICAgICAgIGxldCBsID0gdGhpcy5saW5lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVBhdGhcIiBtYXJrZXJFbmQ9XCJ1cmwoI3ZlZSlcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPXtsKGUucG9pbnRzKX0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudH0ga2V5PXtNYXRoLnJhbmRvbSgpfSByZXN0YXJ0PVwiYWx3YXlzXCIgZnJvbT17bCh0aGlzLnN0YXRlLnByZXZpb3VzUG9pbnRzKX0gdG89e2woZS5wb2ludHMpfSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCIgYXR0cmlidXRlTmFtZT1cImRcIiAvPlxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Bub2RlICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHN0eWxlPXt7dHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7bi54IC0obi53aWR0aC8yKX1weCwke24ueSAtKG4uaGVpZ2h0LzIpfXB4KWB9fT5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9IHRleHRBbmNob3I9XCJzdGFydFwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PiA8L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBJZGVudGlmaWVkTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
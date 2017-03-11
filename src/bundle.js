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

		ipc.on("toggleLayout", function (e, m) {
			_this.toggleLayout();
		});

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFXTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BZnBCLFdBZW9CLEdBZk4sRUFlTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7QUFDQSxRQUFLLGNBQUw7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixNQUFNLElBQU4s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Q3RNN0IsU0FBUyxHQUFULEdBQWU7QUFDYixXQUFTLE1BQVQsQ0FBZ0Isb0JBQUMsR0FBRCxPQUFoQixFQUF3QixTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBeEI7QUFDRDs7QUFFRCxJQUFNLGVBQWUsQ0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixhQUF2QixDQUFyQjs7QUFFQSxJQUFJLGFBQWEsUUFBYixDQUFzQixTQUFTLFVBQS9CLEtBQThDLFNBQVMsSUFBM0QsRUFBaUU7QUFDL0Q7QUFDRCxDQUZELE1BRU87QUFDTCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbXB1dGF0aW9uYWxHcmFwaHtcblx0ZGVmYXVsdEVkZ2UgPSB7fVxuXG5cdG5vZGVDb3VudGVyID0ge31cblx0bm9kZVN0YWNrID0gW11cblx0cHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXHRzY29wZVN0YWNrID0gbmV3IFNjb3BlU3RhY2soKVxuXG5cdG1ldGFub2RlcyA9IHt9XG5cdG1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdGdldCBncmFwaCgpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbGFzdEluZGV4XTtcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubW9uaWVsID0gcGFyZW50O1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLm5vZGVDb3VudGVyID0ge31cblx0XHR0aGlzLnNjb3BlU3RhY2suaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMuY2xlYXJOb2RlU3RhY2soKVxuXG5cdFx0dGhpcy5tZXRhbm9kZXMgPSB7fVxuXHRcdHRoaXMubWV0YW5vZGVTdGFjayA9IFtdXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlclNjb3BlKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUubmFtZS52YWx1ZSk7XG5cdFx0bGV0IGN1cnJlbnRTY29wZUlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgcHJldmlvdXNTY29wZUlkID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoY3VycmVudFNjb3BlSWQsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGlkOiBzY29wZS5uYW1lLnZhbHVlLFxuICAgICAgICAgICAgY2xhc3M6IFwiTWV0YW5vZGVcIixcbiAgICAgICAgICAgIGlzTWV0YW5vZGU6IHRydWUsXG4gICAgICAgICAgICBfc291cmNlOiBzY29wZS5uYW1lLl9zb3VyY2Vcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KGN1cnJlbnRTY29wZUlkLCBwcmV2aW91c1Njb3BlSWQpO1xuXHR9XG5cblx0ZXhpdFNjb3BlKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbmFtZV07XG5cdH1cblxuXHRleGl0TWV0YW5vZGVTY29wZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gXCJhX1wiICsgdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLmVudGVyTWV0YW5vZGVTY29wZShcIm1haW5cIik7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goXCIuXCIpO1xuXHRcdGxldCBpZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoaWQsIHtcblx0XHRcdGNsYXNzOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2sucHVzaChub2RlUGF0aCk7XG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFja1swXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgVHJ5aW5nIHRvIHRvdWNoIG5vbi1leGlzdGFudCBub2RlIFwiJHtub2RlUGF0aH1cImApO1xuXHRcdH1cblx0fVxuXG5cdHJlZmVyZW5jZU5vZGUoaWQpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBpZCxcblx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0aGVpZ2h0OiA1MFxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHdpZHRoOiBNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSAqIDEwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGlmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aFxuXHRcdH0pO1xuXHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0cmV0dXJuIG5vZGVQYXRoO1xuXHR9XG5cblx0Y3JlYXRlTWV0YW5vZGUoaWRlbnRpZmllciwgbWV0YW5vZGVDbGFzcywgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdGxldCB0YXJnZXRNZXRhbm9kZSA9IHRoaXMubWV0YW5vZGVzW21ldGFub2RlQ2xhc3NdO1xuXHRcdHRhcmdldE1ldGFub2RlLm5vZGVzKCkuZm9yRWFjaChub2RlSWQgPT4ge1xuXHRcdFx0bGV0IG5vZGUgPSB0YXJnZXRNZXRhbm9kZS5ub2RlKG5vZGVJZCk7XG5cdFx0XHRpZiAoIW5vZGUpIHsgcmV0dXJuIH1cblx0XHRcdGxldCBuZXdOb2RlSWQgPSBub2RlSWQucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dmFyIG5ld05vZGUgPSB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdGlkOiBuZXdOb2RlSWRcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShuZXdOb2RlSWQsIG5ld05vZGUpO1xuXG5cdFx0XHRsZXQgbmV3UGFyZW50ID0gdGFyZ2V0TWV0YW5vZGUucGFyZW50KG5vZGVJZCkucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobmV3Tm9kZUlkLCBuZXdQYXJlbnQpO1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0TWV0YW5vZGUuZWRnZXMoKS5mb3JFYWNoKGVkZ2UgPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGVkZ2Uudi5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIGVkZ2Uudy5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIHRhcmdldE1ldGFub2RlLmVkZ2UoZWRnZSkpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Y2xlYXJOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5pc01ldGFub2RlID09PSB0cnVlO1xuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IG91dHB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNPdXRwdXQobm9kZSkgfSk7XG5cblx0XHRpZiAob3V0cHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0Tm9kZXM7XG5cdH1cblxuXHRnZXRJbnB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBpbnB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKX0pO1xuXG5cdFx0aWYgKGlucHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgSW5wdXQgbm9kZXMuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXROb2Rlcztcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cdFx0dmFyIHNvdXJjZVBhdGhzXG5cblx0XHRpZiAodHlwZW9mIGZyb21QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IHRoaXMuZ2V0T3V0cHV0Tm9kZXMoZnJvbVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IFtmcm9tUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZnJvbVBhdGgpKSB7XG5cdFx0XHRzb3VyY2VQYXRocyA9IGZyb21QYXRoXG5cdFx0fVxuXG5cdFx0dmFyIHRhcmdldFBhdGhzXG5cblx0XHRpZiAodHlwZW9mIHRvUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gdGhpcy5nZXRJbnB1dE5vZGVzKHRvUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gW3RvUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9QYXRoKSkge1xuXHRcdFx0dGFyZ2V0UGF0aHMgPSB0b1BhdGhcblx0XHR9XG5cblx0XHR0aGlzLnNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cdH1cblxuXHRzZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKSB7XG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pO1x0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHRhcmdldFBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocy5mb3JFYWNoKHNvdXJjZVBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGgsIHRhcmdldFBhdGhzWzBdKSlcblx0XHRcdH0gZWxzZSBpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzLmZvckVhY2godGFyZ2V0UGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aHNbMF0sIHRhcmdldFBhdGgsKSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0bWVzc2FnZTogYE51bWJlciBvZiBub2RlcyBkb2VzIG5vdCBtYXRjaC4gWyR7c291cmNlUGF0aHMubGVuZ3RofV0gLT4gWyR7dGFyZ2V0UGF0aHMubGVuZ3RofV1gLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0Ly8gc3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRcdC8vIGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0aGFzTm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Z2V0R3JhcGgoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5ncmFwaClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5pbnNpZGUoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0d29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpO1xuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGVuY29kZShncmFwaCkge1xuICAgIFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGdyYXBobGliLmpzb24ud3JpdGUoZ3JhcGgpKTtcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuICAgIFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChKU09OLnBhcnNlKGpzb24pKTtcbiAgICB9XG5cbiAgICBsYXlvdXQoZ3JhcGgsIGNhbGxiYWNrKSB7XG4gICAgXHQvL2NvbnNvbGUubG9nKFwiR3JhcGhMYXlvdXQubGF5b3V0XCIsIGdyYXBoLCBjYWxsYmFjayk7XG4gICAgXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgXHR0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgXHRcdGdyYXBoOiB0aGlzLmVuY29kZShncmFwaClcbiAgICBcdH0pO1xuICAgIH1cblxuICAgIHJlY2VpdmUoZGF0YSkge1xuICAgIFx0dmFyIGdyYXBoID0gdGhpcy5kZWNvZGUoZGF0YS5kYXRhLmdyYXBoKTtcbiAgICBcdHRoaXMuY2FsbGJhY2soZ3JhcGgpO1xuICAgIH1cbn0iLCJjb25zdCBpcGMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIikuaXBjUmVuZGVyZXJcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5cbmNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0bW9uaWVsID0gbmV3IE1vbmllbCgpO1xuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0XCJncmFtbWFyXCI6IGdyYW1tYXIsXG5cdFx0XHRcInNlbWFudGljc1wiOiBzZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbCxcblx0XHRcdFwibGF5b3V0XCI6IFwiY29sdW1uc1wiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IHNhdmVOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdTa2V0Y2ggc2F2ZWQnLCB7XG4gICAgICAgICAgICBcdGJvZHk6IGBTa2V0Y2ggd2FzIHN1Y2Nlc3NmdWxseSBzYXZlZCBpbiB0aGUgXCJza2V0Y2hlc1wiIGZvbGRlci5gLFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgIH0pXG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGlwYy5vbihcInRvZ2dsZUxheW91dFwiLCAoZSwgbSkgPT4ge1xuXHRcdFx0dGhpcy50b2dnbGVMYXlvdXQoKVxuXHRcdH0pO1xuXG5cdFx0bGV0IGxheW91dCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImxheW91dFwiKVxuXHRcdGlmIChsYXlvdXQpIHtcblx0XHRcdGlmIChsYXlvdXQgPT0gXCJjb2x1bW5zXCIgfHwgbGF5b3V0ID09IFwicm93c1wiKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUubGF5b3V0ID0gbGF5b3V0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKTtcblx0fVxuXG5cdGRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0aGlzLmxvY2spIHsgY2xlYXJUaW1lb3V0KHRoaXMubG9jayk7IH1cblx0XHR0aGlzLmxvY2sgPSBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSk7IH0sIDEwMCk7XG5cdH1cblxuXHR1cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSl7XG5cdFx0Y29uc29sZS50aW1lKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuY29tcGlsZVRvQVNUKHRoaXMuc3RhdGUuZ3JhbW1hciwgdGhpcy5zdGF0ZS5zZW1hbnRpY3MsIHZhbHVlKTtcblx0XHRpZiAocmVzdWx0LmFzdCkge1xuXHRcdFx0dGhpcy5tb25pZWwud2Fsa0FzdChyZXN1bHQuYXN0KTtcblx0XHRcdHZhciBncmFwaCA9IHRoaXMubW9uaWVsLmdldENvbXB1dGF0aW9uYWxHcmFwaCgpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGlzc3VlczogdGhpcy5tb25pZWwuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0fVxuXG5cdGxvYWRFeGFtcGxlKGlkKSB7XG5cdFx0dmFyIGNhbGxiYWNrID0gZnVuY3Rpb24odmFsdWUpIHtcblx0XHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWVcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHQkLmFqYXgoe1xuXHRcdFx0dXJsOiBgLi9leGFtcGxlcy8ke2lkfS5tb25gLFxuXHRcdFx0ZGF0YTogbnVsbCxcblx0XHRcdHN1Y2Nlc3M6IGNhbGxiYWNrLmJpbmQodGhpcyksXG5cdFx0XHRkYXRhVHlwZTogXCJ0ZXh0XCJcblx0XHR9KTtcblx0fVxuXG5cdC8vIGludG8gTW9uaWVsPyBvciBQYXJzZXJcblx0Y29tcGlsZVRvQVNUKGdyYW1tYXIsIHNlbWFudGljcywgc291cmNlKSB7XG5cdCAgICB2YXIgcmVzdWx0ID0gZ3JhbW1hci5tYXRjaChzb3VyY2UpO1xuXG5cdCAgICBpZiAocmVzdWx0LnN1Y2NlZWRlZCgpKSB7XG5cdCAgICAgICAgdmFyIGFzdCA9IHNlbWFudGljcyhyZXN1bHQpLmV2YWwoKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImFzdFwiOiBhc3Rcblx0ICAgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgXHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdCAgICAgICAgdmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpO1xuXHQgICAgICAgIHZhciBwb3NpdGlvbiA9IHJlc3VsdC5nZXRSaWdodG1vc3RGYWlsdXJlUG9zaXRpb24oKTtcblx0ICAgICAgICByZXR1cm4ge1xuXHQgICAgICAgICAgICBcImV4cGVjdGVkXCI6IGV4cGVjdGVkLFxuXHQgICAgICAgICAgICBcInBvc2l0aW9uXCI6IHBvc2l0aW9uXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjb250YWluZXJMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dFxuXHRcdGxldCBncmFwaExheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIiA/IFwiQlRcIiA6IFwiTFJcIlxuXG4gICAgXHRyZXR1cm4gPGRpdiBpZD1cImNvbnRhaW5lclwiIGNsYXNzTmFtZT17YGNvbnRhaW5lciAke2NvbnRhaW5lckxheW91dH1gfT5cbiAgICBcdFx0PFBhbmVsIGlkPVwiZGVmaW5pdGlvblwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdHJlZj17KHJlZikgPT4gdGhpcy5lZGl0b3IgPSByZWZ9XG4gICAgXHRcdFx0XHRtb2RlPVwibW9uaWVsXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHRpc3N1ZXM9e3RoaXMuc3RhdGUuaXNzdWVzfVxuICAgIFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0ZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHRcdFxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgXHRcdFx0PFZpc3VhbEdyYXBoIGdyYXBoPXt0aGlzLnN0YXRlLmdyYXBofSBsYXlvdXQ9e2dyYXBoTGF5b3V0fSAvPlxuICAgIFx0XHQ8L1BhbmVsPlxuXG4gICAgXHRcdHsvKlxuICAgIFx0XHQ8UGFuZWwgdGl0bGU9XCJBU1RcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwianNvblwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0dmFsdWU9e0pTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0Ki99XG4gICAgXHRcdFxuICAgIFx0PC9kaXY+O1xuICBcdH1cbn0iLCJjbGFzcyBMb2dnZXJ7XG5cdGlzc3VlcyA9IFtdXG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5pc3N1ZXMgPSBbXTtcblx0fVxuXHRcblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmlzc3Vlcztcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dmFyIGYgPSBudWxsO1xuXHRcdHN3aXRjaChpc3N1ZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiZXJyb3JcIjogZiA9IGNvbnNvbGUuZXJyb3I7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndhcm5pbmdcIjogZiA9IGNvbnNvbGUud2FybjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiaW5mb1wiOiBmID0gY29uc29sZS5pbmZvOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IGYgPSBjb25zb2xlLmxvZzsgYnJlYWs7XG5cdFx0fVxuXHRcdGYoaXNzdWUubWVzc2FnZSk7XG5cdFx0dGhpcy5pc3N1ZXMucHVzaChpc3N1ZSk7XG5cdH1cbn0iLCJjbGFzcyBNb25pZWx7XG5cdGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblx0Z3JhcGggPSBuZXcgQ29tcHV0YXRpb25hbEdyYXBoKHRoaXMpO1xuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0fVxuXG5cdGFkZERlZmF1bHREZWZpbml0aW9ucygpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBkZWZhdWx0IGRlZmluaXRpb25zLmApO1xuXHRcdGNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcIkFkZFwiLCBcIkxpbmVhclwiLCBcIklucHV0XCIsIFwiT3V0cHV0XCIsIFwiUGxhY2Vob2xkZXJcIiwgXCJWYXJpYWJsZVwiLCBcIkNvbnN0YW50XCIsIFwiTXVsdGlwbHlcIiwgXCJDb252b2x1dGlvblwiLCBcIkRlbnNlXCIsIFwiTWF4UG9vbGluZ1wiLCBcIkJhdGNoTm9ybWFsaXphdGlvblwiLCBcIklkZW50aXR5XCIsIFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIlNpZ21vaWRcIiwgXCJFeHBvbmVudGlhbExpbmVhclVuaXRcIiwgXCJUYW5oXCIsIFwiQWJzb2x1dGVcIiwgXCJTdW1tYXRpb25cIiwgXCJEcm9wb3V0XCIsIFwiTWF0cml4TXVsdGlwbHlcIiwgXCJCaWFzQWRkXCIsIFwiUmVzaGFwZVwiLCBcIkNvbmNhdFwiLCBcIkZsYXR0ZW5cIiwgXCJUZW5zb3JcIiwgXCJTb2Z0bWF4XCIsIFwiQ3Jvc3NFbnRyb3B5XCIsIFwiWmVyb1BhZGRpbmdcIiwgXCJSYW5kb21Ob3JtYWxcIiwgXCJUcnVuY2F0ZWROb3JtYWxEaXN0cmlidXRpb25cIiwgXCJEb3RQcm9kdWN0XCJdO1xuXHRcdGRlZmF1bHREZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5hZGREZWZpbml0aW9uKGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGFkZERlZmluaXRpb24oZGVmaW5pdGlvbk5hbWUpIHtcblx0XHR0aGlzLmRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSA9IHtcblx0XHRcdG5hbWU6IGRlZmluaXRpb25OYW1lLFxuXHRcdFx0Y29sb3I6IGNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbihzY29wZSkge1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJTY29wZShzY29wZSk7XG5cdFx0dGhpcy53YWxrQXN0KHNjb3BlLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdFNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVTY29wZURlZmluaXRpb25Cb2R5KHNjb3BlQm9keSkge1xuXHRcdHNjb3BlQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24pwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke2Jsb2NrRGVmaW5pdGlvbi5uYW1lfVwiIHRvIGF2YWlsYWJsZSBkZWZpbml0aW9ucy5gKTtcblx0XHR0aGlzLmFkZERlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLndhbGtBc3QoYmxvY2tEZWZpbml0aW9uLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkoZGVmaW5pdGlvbkJvZHkpIHtcblx0XHRkZWZpbml0aW9uQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSkge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCBub2RlP1wiLCBub2RlKTtcblx0fVxuXG5cdGhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5ldHdvcmspIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHRuZXR3b3JrLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24oY29ubmVjdGlvbikge1xuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKTtcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHR0aGlzLndhbGtBc3QoaXRlbSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyB0aGlzIGlzIGRvaW5nIHRvbyBtdWNoIOKAkyBicmVhayBpbnRvIFwibm90IHJlY29nbml6ZWRcIiwgXCJzdWNjZXNzXCIgYW5kIFwiYW1iaWd1b3VzXCJcblx0aGFuZGxlQmxvY2tJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0aWQ6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzOiBcIlVua25vd25cIixcblx0XHRcdGNvbG9yOiBcImRhcmtncmV5XCIsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0d2lkdGg6IDEwMCxcblxuXHRcdFx0X3NvdXJjZTogaW5zdGFuY2UsXG5cdFx0fTtcblxuXHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKGluc3RhbmNlLm5hbWUudmFsdWUpXG5cdFx0Ly8gY29uc29sZS5sb2coYE1hdGNoZWQgZGVmaW5pdGlvbnM6YCwgZGVmaW5pdGlvbnMpO1xuXG5cdFx0aWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG4gICAgICAgICAgICBub2RlLmlzVW5kZWZpbmVkID0gdHJ1ZVxuXG4gICAgICAgICAgICB0aGlzLmFkZElzc3VlKHtcbiAgICAgICAgICAgIFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3I7XG5cdFx0XHRcdG5vZGUuY2xhc3MgPSBkZWZpbml0aW9uLm5hbWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gYFwiJHtkZWYubmFtZX1cImApLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5hbGlhcykge1xuXHRcdFx0bm9kZS5pZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKG5vZGUuY2xhc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmlkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLnVzZXJHZW5lcmF0ZWRJZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS5oZWlnaHQgPSA1MDtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdHZhciBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpO1xuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMTtcblx0XHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUobm9kZS5pZCwgbm9kZS5jbGFzcywge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZToge1wiZmlsbFwiOiBjb2xvci50b1N0cmluZygpfVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVOb2RlKG5vZGUuaWQsIHtcblx0XHRcdC4uLm5vZGUsXG4gICAgICAgICAgICBzdHlsZToge1wiZmlsbFwiOiBub2RlLmNvbG9yfSxcbiAgICAgICAgICAgIHdpZHRoOiBNYXRoLm1heChNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSwgNSkgKiAxMlxuICAgICAgICB9KTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrTGlzdChsaXN0KSB7XG5cdFx0bGlzdC5saXN0LmZvckVhY2goaXRlbSA9PiB0aGlzLndhbGtBc3QoaXRlbSkpO1xuXHR9XG5cblx0aGFuZGxlSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG5cdFx0dGhpcy5ncmFwaC5yZWZlcmVuY2VOb2RlKGlkZW50aWZpZXIudmFsdWUpO1xuXHR9XG5cblx0bWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKHF1ZXJ5KSB7XG5cdFx0dmFyIGRlZmluaXRpb25zID0gT2JqZWN0LmtleXModGhpcy5kZWZpbml0aW9ucyk7XG5cdFx0bGV0IGRlZmluaXRpb25LZXlzID0gTW9uaWVsLm5hbWVSZXNvbHV0aW9uKHF1ZXJ5LCBkZWZpbml0aW9ucyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhcIkZvdW5kIGtleXNcIiwgZGVmaW5pdGlvbktleXMpO1xuXHRcdGxldCBtYXRjaGVkRGVmaW5pdGlvbnMgPSBkZWZpbml0aW9uS2V5cy5tYXAoa2V5ID0+IHRoaXMuZGVmaW5pdGlvbnNba2V5XSk7XG5cdFx0cmV0dXJuIG1hdGNoZWREZWZpbml0aW9ucztcblx0fVxuXG5cdGdldENvbXB1dGF0aW9uYWxHcmFwaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRHcmFwaCgpO1xuXHR9XG5cblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmxvZ2dlci5nZXRJc3N1ZXMoKTtcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dGhpcy5sb2dnZXIuYWRkSXNzdWUoaXNzdWUpO1xuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvO1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoc3BsaXRSZWdleCk7XG5cdCAgICBsZXQgbGlzdEFycmF5ID0gbGlzdC5tYXAoZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLnNwbGl0KHNwbGl0UmVnZXgpKTtcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gTW9uaWVsLmlzTXVsdGlQcmVmaXgocGFydGlhbEFycmF5LCBwb3NzaWJsZU1hdGNoKSk7XG5cdCAgICByZXN1bHQgPSByZXN1bHQubWFwKGl0ZW0gPT4gaXRlbS5qb2luKFwiXCIpKTtcblx0ICAgIHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRzdGF0aWMgaXNNdWx0aVByZWZpeChuYW1lLCB0YXJnZXQpIHtcblx0ICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gdGFyZ2V0Lmxlbmd0aCkgeyByZXR1cm4gZmFsc2U7IH1cblx0ICAgIHZhciBpID0gMDtcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDE7IH1cblx0ICAgIHJldHVybiAoaSA9PT0gbmFtZS5sZW5ndGgpOyAvLyBnb3QgdG8gdGhlIGVuZD9cblx0fVxuXG5cdHdhbGtBc3Qobm9kZSkge1xuXHRcdGlmICghbm9kZSkgeyBjb25zb2xlLmVycm9yKFwiTm8gbm9kZT8hXCIpOyByZXR1cm47IH1cblxuXHRcdHN3aXRjaCAobm9kZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiTmV0d29ya1wiOiB0aGlzLmhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJTY29wZURlZmluaXRpb25cIjogdGhpcy5oYW5kbGVTY29wZURlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlNjb3BlRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVTY29wZURlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0luc3RhbmNlXCI6IHRoaXMuaGFuZGxlQmxvY2tJbnN0YW5jZShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tMaXN0XCI6IHRoaXMuaGFuZGxlQmxvY2tMaXN0KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJZGVudGlmaWVyXCI6IHRoaXMuaGFuZGxlSWRlbnRpZmllcihub2RlKTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aGlzLmhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSk7XG5cdFx0fVxuXHR9XG59IiwiY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPGRpdiBpZD17dGhpcy5wcm9wcy5pZH0gY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICBcdHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgIDwvZGl2PjtcbiAgfVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY2xhc3MgVmlzdWFsR3JhcGggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbnN0cnVjdG9yXCIpO1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsLFxuICAgICAgICAgICAgcHJldmlvdXNWaWV3Qm94OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzXCIsIG5leHRQcm9wcyk7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIG5leHRQcm9wcy5ncmFwaC5fbGFiZWwucmFua2RpciA9IG5leHRQcm9wcy5sYXlvdXQ7XG4gICAgICAgICAgICB0aGlzLmdyYXBoTGF5b3V0LmxheW91dChuZXh0UHJvcHMuZ3JhcGgsIHRoaXMuc2F2ZUdyYXBoLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWRcIiwgbm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBub2RlLmlkXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGRvbU5vZGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3hfd2hvbGUgPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgdmFyIHZpZXdCb3hcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIHZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3Qm94ID0gdmlld0JveF93aG9sZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt2aWV3Qm94X3dob2xlfSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiPjwvYW5pbWF0ZT5cbiAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJ2ZWVcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgIDwvbWFya2VyPlxuICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgPGcgaWQ9XCJncmFwaFwiPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPjtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VQYXRoXCIgbWFya2VyRW5kPVwidXJsKCN2ZWUpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPXtgbm9kZSAke24uY2xhc3N9YH0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpfSBzdHlsZT17e3RyYW5zZm9ybTogYHRyYW5zbGF0ZSgke24ueCAtKG4ud2lkdGgvMil9cHgsJHtuLnkgLShuLmhlaWdodC8yKX1weClgfX0+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBNZXRhbm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNOb2RlIGV4dGVuZHMgTm9kZXtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT4gPC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
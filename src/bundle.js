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

		// 

	}, {
		key: "nodeStack2",
		get: function get() {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			return this._nodeStack2[lastIndex];
		},
		set: function set(value) {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			this._nodeStack2[lastIndex] = value;
		}
	}, {
		key: "previousNodeStack2",
		get: function get() {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			return this._previousNodeStack2[lastIndex];
		},
		set: function set(value) {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			this._previousNodeStack2[lastIndex] = value;
		}
	}]);

	function ComputationalGraph(parent) {
		_classCallCheck(this, ComputationalGraph);

		this.defaultEdge = {};
		this.nodeCounter = {};
		this._nodeStack2 = {};
		this._previousNodeStack2 = [];
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

			this._nodeStack2 = {};
			this._previousNodeStack2 = {};

			this.metanodes = {};
			this.metanodeStack = [];

			console.log("Metanodes:", this.metanodes);
			console.log("Metanode Stack:", this.metanodeStack);

			this.addMain();
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
			console.log(this.metanodeStack);

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
			// console.log(`Touching node "${nodePath}".`)
			if (this.graph.hasNode(nodePath)) {
				this.nodeStack2.push(nodePath);

				if (this.previousNodeStack2.length === 1) {
					this.setEdge(this.previousNodeStack2[0], nodePath);
				} else if (this.previousNodeStack2.length > 1) {
					this.setEdge(this.previousNodeStack2, nodePath);
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
			this.previousNodeStack2 = [];
			this.nodeStack2 = [];
		}
	}, {
		key: "freezeNodeStack",
		value: function freezeNodeStack() {
			this.previousNodeStack2 = [].concat(_toConsumableArray(this.nodeStack2));
			this.nodeStack2 = [];
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
			console.log("isMetanode:", nodePath);
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
		key: "handleInlineBlockDefinition",
		value: function handleInlineBlockDefinition(scope) {
			this.graph.enterMetanodeScope(scope.name.value);
			this.walkAst(scope.body);
			this.graph.exitMetanodeScope();
			this.graph.createMetanode(scope.name.value, scope.name.value, {
				userGeneratedId: scope.name.value,
				id: scope.name.value,
				class: "",
				_source: scope._source
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
			var _this2 = this;

			definitionBody.definitions.forEach(function (definition) {
				return _this2.walkAst(definition);
			});
		}
	}, {
		key: "handleNetworkDefinition",
		value: function handleNetworkDefinition(network) {
			var _this3 = this;

			this.initialize();
			network.definitions.forEach(function (definition) {
				return _this3.walkAst(definition);
			});
		}
	}, {
		key: "handleConnectionDefinition",
		value: function handleConnectionDefinition(connection) {
			var _this4 = this;

			this.graph.clearNodeStack();
			// console.log(connection.list)
			connection.list.forEach(function (item) {
				_this4.graph.freezeNodeStack();
				// console.log(item)
				_this4.walkAst(item);
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
			var _this5 = this;

			list.list.forEach(function (item) {
				return _this5.walkAst(item);
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
			var _this6 = this;

			var definitions = Object.keys(this.definitions);
			var definitionKeys = Moniel.nameResolution(query, definitions);
			//console.log("Found keys", definitionKeys);
			var matchedDefinitions = definitionKeys.map(function (key) {
				return _this6.definitions[key];
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
		key: "handleUnrecognizedNode",
		value: function handleUnrecognizedNode(node) {
			console.warn("What to do with this AST node?", node);
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
				case "InlineBlockDefinition":
					this.handleInlineBlockDefinition(node);break;
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
		var scope = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFZTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7QUFFRDs7OztzQkFDaUI7QUFDaEIsT0FBSSxZQUFZLEtBQUssYUFBTCxDQUFtQixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBL0MsQ0FBaEI7QUFDQSxVQUFPLEtBQUssV0FBTCxDQUFpQixTQUFqQixDQUFQO0FBQ0EsRztvQkFFYyxLLEVBQU87QUFDckIsT0FBSSxZQUFZLEtBQUssYUFBTCxDQUFtQixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBL0MsQ0FBaEI7QUFDQSxRQUFLLFdBQUwsQ0FBaUIsU0FBakIsSUFBOEIsS0FBOUI7QUFDQTs7O3NCQUV3QjtBQUN4QixPQUFJLFlBQVksS0FBSyxhQUFMLENBQW1CLEtBQUssYUFBTCxDQUFtQixNQUFuQixHQUE0QixDQUEvQyxDQUFoQjtBQUNBLFVBQU8sS0FBSyxtQkFBTCxDQUF5QixTQUF6QixDQUFQO0FBQ0EsRztvQkFFc0IsSyxFQUFPO0FBQzdCLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsUUFBSyxtQkFBTCxD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QUMsb0JBQUQ7QUFBVSxxQkFBSyxLQUFmO0FBQ0ksOENBQU0sT0FBTyxFQUFFLEtBQWYsRUFBc0IsUUFBUSxFQUFFLE1BQWhDLEVBQXdDLElBQUcsTUFBM0MsRUFBa0QsSUFBRyxNQUFyRCxFQUE0RCxPQUFPLEVBQUUsS0FBckUsR0FESjtBQUVJO0FBQUE7QUFBQSxzQkFBTSwwQkFBeUIsRUFBRSxLQUFGLEdBQVEsQ0FBakMsU0FBeUMsRUFBRSxNQUFGLEdBQVMsQ0FBbEQsTUFBTixFQUErRCxZQUFXLFFBQTFFLEVBQW1GLE9BQU8sRUFBQyxrQkFBa0IsYUFBbkIsRUFBMUY7QUFDSTtBQUFBO0FBQUEsMEJBQU8sR0FBRSxHQUFULEVBQWEsV0FBVSxJQUF2QjtBQUE2QiwwQkFBRTtBQUEvQixxQkFESjtBQUVJO0FBQUE7QUFBQSwwQkFBTyxHQUFFLEdBQVQsRUFBYSxJQUFHLE9BQWhCO0FBQXlCLDBCQUFFO0FBQTNCO0FBRko7QUFGSixhQURKO0FBU0g7Ozs7RUFad0IsSTs7O0FDdE03QixTQUFTLEdBQVQsR0FBZTtBQUNiLFdBQVMsTUFBVCxDQUFnQixvQkFBQyxHQUFELE9BQWhCLEVBQXdCLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUF4QjtBQUNEOztBQUVELElBQU0sZUFBZSxDQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLGFBQXZCLENBQXJCOztBQUVBLElBQUksYUFBYSxRQUFiLENBQXNCLFNBQVMsVUFBL0IsS0FBOEMsU0FBUyxJQUEzRCxFQUFpRTtBQUMvRDtBQUNELENBRkQsTUFFTztBQUNMLFNBQU8sZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRkZWZhdWx0RWRnZSA9IHt9XG5cblx0bm9kZUNvdW50ZXIgPSB7fVxuXHRfbm9kZVN0YWNrMiA9IHt9XG5cdF9wcmV2aW91c05vZGVTdGFjazIgPSBbXVxuXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Ly8gXG5cdGdldCBub2RlU3RhY2syKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9ub2RlU3RhY2syW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBub2RlU3RhY2syKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fbm9kZVN0YWNrMltsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGdldCBwcmV2aW91c05vZGVTdGFjazIoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrMltsYXN0SW5kZXhdXG5cdH1cblxuXHRzZXQgcHJldmlvdXNOb2RlU3RhY2syKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2syW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5jbGVhck5vZGVTdGFjaygpXG5cblx0XHR0aGlzLl9ub2RlU3RhY2syID0ge31cblx0XHR0aGlzLl9wcmV2aW91c05vZGVTdGFjazIgPSB7fVxuXG5cdFx0dGhpcy5tZXRhbm9kZXMgPSB7fVxuXHRcdHRoaXMubWV0YW5vZGVTdGFjayA9IFtdXG5cblx0XHRjb25zb2xlLmxvZyhcIk1ldGFub2RlczpcIiwgdGhpcy5tZXRhbm9kZXMpXG5cdFx0Y29uc29sZS5sb2coXCJNZXRhbm9kZSBTdGFjazpcIiwgdGhpcy5tZXRhbm9kZVN0YWNrKVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJNZXRhbm9kZVNjb3BlKG5hbWUpIHtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXSA9IG5ldyBncmFwaGxpYi5HcmFwaCh7XG5cdFx0XHRjb21wb3VuZDogdHJ1ZVxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdLnNldEdyYXBoKHtcblx0XHRcdG5hbWU6IG5hbWUsXG5cdCAgICAgICAgcmFua2RpcjogJ0JUJyxcblx0ICAgICAgICBlZGdlc2VwOiAyMCxcblx0ICAgICAgICByYW5rc2VwOiA0MCxcblx0ICAgICAgICBub2RlU2VwOiAzMCxcblx0ICAgICAgICBtYXJnaW54OiAyMCxcblx0ICAgICAgICBtYXJnaW55OiAyMCxcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2RlU3RhY2sucHVzaChuYW1lKTtcblx0XHRjb25zb2xlLmxvZyh0aGlzLm1ldGFub2RlU3RhY2spXG5cblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbmFtZV07XG5cdH1cblxuXHRleGl0TWV0YW5vZGVTY29wZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gXCJhX1wiICsgdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLmVudGVyTWV0YW5vZGVTY29wZShcIm1haW5cIik7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goXCIuXCIpO1xuXHRcdGxldCBpZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoaWQsIHtcblx0XHRcdGNsYXNzOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhgVG91Y2hpbmcgbm9kZSBcIiR7bm9kZVBhdGh9XCIuYClcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2syLnB1c2gobm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrMi5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2syWzBdLCBub2RlUGF0aClcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjazIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjazIsIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRpZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG1ldGFub2RlQ2xhc3MsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZGVudGlmaWVyKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXHRcdFxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aCxcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2syID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2syID0gW107XG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjazIgPSBbLi4udGhpcy5ub2RlU3RhY2syXTtcblx0XHR0aGlzLm5vZGVTdGFjazIgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhcImlzTWV0YW5vZGU6XCIsIG5vZGVQYXRoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWU7XG5cdH1cblxuXHRnZXRPdXRwdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc091dHB1dChub2RlKSB9KTtcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBPdXRwdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlcztcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc0lucHV0KG5vZGUpfSk7XG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dE5vZGVzO1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHsuLi50aGlzLmRlZmF1bHRFZGdlfSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwpKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmluc2lkZShjLnJvdywgYy5jb2x1bW4pKS5yZWR1Y2UoIChwcmV2LCBjdXJyKSA9PiBwcmV2IHx8IGN1cnIsIGZhbHNlKTtcblxuICAgICAgICBpZiAoY3Vyc29yT3Zlck1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSBDb2RlXCIsXG4gICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgICBzaG93R3V0dGVyOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5lZGl0b3IuY29udGFpbmVyLnN0eWxlLmxpbmVIZWlnaHQgPSAxLjc7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRvci5vbihcImNoYW5nZVwiLCB0aGlzLm9uQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLm9uKFwiY2hhbmdlQ3Vyc29yXCIsIHRoaXMub25DdXJzb3JQb3NpdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9ucyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJvdzogcG9zaXRpb24ucm93LFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW46IHBvc2l0aW9uLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNzdWUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXNzdWUudHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLnNldEFubm90YXRpb25zKGFubm90YXRpb25zKTtcbiAgICAgICAgICAgIC8vdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuXG4gICAgICAgICAgICB2YXIgUmFuZ2UgPSByZXF1aXJlKCdhY2UvcmFuZ2UnKS5SYW5nZTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXJrZXJzID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCksXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLmVuZClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSBuZXcgUmFuZ2UocG9zaXRpb24uc3RhcnQucm93LCBwb3NpdGlvbi5zdGFydC5jb2x1bW4sIHBvc2l0aW9uLmVuZC5yb3csIHBvc2l0aW9uLmVuZC5jb2x1bW4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrZXJzLnB1c2godGhpcy5lZGl0b3Iuc2Vzc2lvbi5hZGRNYXJrZXIocmFuZ2UsIFwibWFya2VyX2Vycm9yXCIsIFwidGV4dFwiKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uY2xlYXJBbm5vdGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRQcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUobmV4dFByb3BzLnZhbHVlLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IHJlZj17IChlbGVtZW50KSA9PiB0aGlzLmluaXQoZWxlbWVudCkgfT48L2Rpdj47XG4gICAgfVxufSIsImNsYXNzIEdyYXBoTGF5b3V0e1xuXHR3b3JrZXIgPSBuZXcgV29ya2VyKFwic3JjL3NjcmlwdHMvR3JhcGhMYXlvdXRXb3JrZXIuanNcIik7XG5cdGNhbGxiYWNrID0gZnVuY3Rpb24oKXt9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZW5jb2RlKGdyYXBoKSB7XG4gICAgXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaCkpO1xuICAgIH1cblxuICAgIGRlY29kZShqc29uKSB7XG4gICAgXHRyZXR1cm4gZ3JhcGhsaWIuanNvbi5yZWFkKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH1cblxuICAgIGxheW91dChncmFwaCwgY2FsbGJhY2spIHtcbiAgICBcdC8vY29uc29sZS5sb2coXCJHcmFwaExheW91dC5sYXlvdXRcIiwgZ3JhcGgsIGNhbGxiYWNrKTtcbiAgICBcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICBcdFx0Z3JhcGg6IHRoaXMuZW5jb2RlKGdyYXBoKVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgcmVjZWl2ZShkYXRhKSB7XG4gICAgXHR2YXIgZ3JhcGggPSB0aGlzLmRlY29kZShkYXRhLmRhdGEuZ3JhcGgpO1xuICAgIFx0dGhpcy5jYWxsYmFjayhncmFwaCk7XG4gICAgfVxufSIsImNvbnN0IGlwYyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKS5pcGNSZW5kZXJlclxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcblxuY2xhc3MgSURFIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXHRtb25pZWwgPSBuZXcgTW9uaWVsKCk7XG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRcImdyYW1tYXJcIjogZ3JhbW1hcixcblx0XHRcdFwic2VtYW50aWNzXCI6IHNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsLFxuXHRcdFx0XCJsYXlvdXRcIjogXCJjb2x1bW5zXCJcblx0XHR9O1xuXG5cdFx0aXBjLm9uKCdzYXZlJywgZnVuY3Rpb24oZXZlbnQsIG1lc3NhZ2UpIHtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5tb25cIiwgdGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbiwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLmFzdC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcbiAgICAgICAgICAgIFx0Ym9keTogYFNrZXRjaCB3YXMgc3VjY2Vzc2Z1bGx5IHNhdmVkIGluIHRoZSBcInNrZXRjaGVzXCIgZm9sZGVyLmAsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuICAgICAgICAgICAgfSlcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRsZXQgbGF5b3V0ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGF5b3V0XCIpXG5cdFx0aWYgKGxheW91dCkge1xuXHRcdFx0aWYgKGxheW91dCA9PSBcImNvbHVtbnNcIiB8fCBsYXlvdXQgPT0gXCJyb3dzXCIpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZS5sYXlvdXQgPSBsYXlvdXRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJ3YXJuaW5nXCIsXG5cdFx0XHRcdFx0bWVzc2FnZTogYFZhbHVlIGZvciBcImxheW91dFwiIGNhbiBiZSBvbmx5IFwiY29sdW1uc1wiIG9yIFwicm93c1wiLmBcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpO1xuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jb21waWxlVG9BU1QodGhpcy5zdGF0ZS5ncmFtbWFyLCB0aGlzLnN0YXRlLnNlbWFudGljcywgdmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpO1xuXHRcdFx0dmFyIGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0aXNzdWVzOiB0aGlzLm1vbmllbC5nZXRJc3N1ZXMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogbnVsbCxcblx0XHRcdFx0Z3JhcGg6IG51bGwsXG5cdFx0XHRcdGlzc3VlczogW3tcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IHJlc3VsdC5wb3NpdGlvbiAtIDEsXG5cdFx0XHRcdFx0XHRlbmQ6IHJlc3VsdC5wb3NpdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWVzc2FnZTogXCJFeHBlY3RlZCBcIiArIHJlc3VsdC5leHBlY3RlZCArIFwiLlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0XHR9XVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnNvbGUudGltZUVuZChcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0dG9nZ2xlTGF5b3V0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bGF5b3V0OiAodGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiKSA/IFwicm93c1wiIDogXCJjb2x1bW5zXCJcblx0XHR9KVxuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsXG5cdFx0XHRkYXRhOiBudWxsLFxuXHRcdFx0c3VjY2VzczogY2FsbGJhY2suYmluZCh0aGlzKSxcblx0XHRcdGRhdGFUeXBlOiBcInRleHRcIlxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gaW50byBNb25pZWw/IG9yIFBhcnNlclxuXHRjb21waWxlVG9BU1QoZ3JhbW1hciwgc2VtYW50aWNzLCBzb3VyY2UpIHtcblx0ICAgIHZhciByZXN1bHQgPSBncmFtbWFyLm1hdGNoKHNvdXJjZSk7XG5cblx0ICAgIGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0ICAgICAgICB2YXIgYXN0ID0gc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiYXN0XCI6IGFzdFxuXHQgICAgICAgIH1cblx0ICAgIH0gZWxzZSB7XG5cdCAgICBcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0ICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KCk7XG5cdCAgICAgICAgdmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiZXhwZWN0ZWRcIjogZXhwZWN0ZWQsXG5cdCAgICAgICAgICAgIFwicG9zaXRpb25cIjogcG9zaXRpb25cblx0ICAgICAgICB9XG5cdCAgICB9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpO1xuXHRncmFwaCA9IG5ldyBDb21wdXRhdGlvbmFsR3JhcGgodGhpcyk7XG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogY29sb3JIYXNoLmhleChkZWZpbml0aW9uTmFtZSlcblx0XHR9O1xuXHR9XG5cblx0aGFuZGxlSW5saW5lQmxvY2tEZWZpbml0aW9uKHNjb3BlKSB7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoc2NvcGUubmFtZS52YWx1ZSlcblx0XHR0aGlzLndhbGtBc3Qoc2NvcGUuYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUoc2NvcGUubmFtZS52YWx1ZSwgc2NvcGUubmFtZS52YWx1ZSwge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0aWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRjbGFzczogXCJcIixcblx0XHRcdF9zb3VyY2U6IHNjb3BlLl9zb3VyY2Vcblx0XHR9KTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24pwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke2Jsb2NrRGVmaW5pdGlvbi5uYW1lfVwiIHRvIGF2YWlsYWJsZSBkZWZpbml0aW9ucy5gKTtcblx0XHR0aGlzLmFkZERlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLndhbGtBc3QoYmxvY2tEZWZpbml0aW9uLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkoZGVmaW5pdGlvbkJvZHkpIHtcblx0XHRkZWZpbml0aW9uQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5ldHdvcmspIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHRuZXR3b3JrLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24oY29ubmVjdGlvbikge1xuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKTtcblx0XHQvLyBjb25zb2xlLmxvZyhjb25uZWN0aW9uLmxpc3QpXG5cdFx0Y29ubmVjdGlvbi5saXN0LmZvckVhY2goaXRlbSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coaXRlbSlcblx0XHRcdHRoaXMud2Fsa0FzdChpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRoYW5kbGVCbG9ja0luc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UubmFtZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcbiAgICAgICAgICAgIG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cbiAgICAgICAgICAgIHRoaXMuYWRkSXNzdWUoe1xuICAgICAgICAgICAgXHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuICAgICAgICAgICAgXHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcbiAgICAgICAgICAgIFx0dHlwZTogXCJlcnJvclwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvcjtcblx0XHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb24ubmFtZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRub2RlLmlkID0gdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQobm9kZS5jbGFzcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuaWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUudXNlckdlbmVyYXRlZElkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLmhlaWdodCA9IDUwO1xuXHRcdH1cblxuXHRcdC8vIGlzIG1ldGFub2RlXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuZ3JhcGgubWV0YW5vZGVzKS5pbmNsdWRlcyhub2RlLmNsYXNzKSkge1xuXHRcdFx0dmFyIGNvbG9yID0gZDMuY29sb3Iobm9kZS5jb2xvcik7XG5cdFx0XHRjb2xvci5vcGFjaXR5ID0gMC4xO1xuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCBub2RlLmNsYXNzLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUobm9kZS5pZCwge1xuXHRcdFx0Li4ubm9kZSxcbiAgICAgICAgICAgIHN0eWxlOiB7XCJmaWxsXCI6IG5vZGUuY29sb3J9LFxuICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApLCA1KSAqIDEyXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklubGluZUJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUlubGluZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIjogdGhpcy5oYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tJbnN0YW5jZVwiOiB0aGlzLmhhbmRsZUJsb2NrSW5zdGFuY2Uobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrTGlzdFwiOiB0aGlzLmhhbmRsZUJsb2NrTGlzdChub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSWRlbnRpZmllclwiOiB0aGlzLmhhbmRsZUlkZW50aWZpZXIobm9kZSk7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhpcy5oYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpO1xuXHRcdH1cblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmdyYXBoTGF5b3V0ID0gbmV3IEdyYXBoTGF5b3V0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbCxcbiAgICAgICAgICAgIHByZXZpb3VzVmlld0JveDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSBudWxsXG4gICAgfVxuXG4gICAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wc1wiLCBuZXh0UHJvcHMpO1xuICAgICAgICBpZiAobmV4dFByb3BzLmdyYXBoKSB7XG4gICAgICAgICAgICBuZXh0UHJvcHMuZ3JhcGguX2xhYmVsLnJhbmtkaXIgPSBuZXh0UHJvcHMubGF5b3V0O1xuICAgICAgICAgICAgdGhpcy5ncmFwaExheW91dC5sYXlvdXQobmV4dFByb3BzLmdyYXBoLCB0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGcgPSB0aGlzLnN0YXRlLmdyYXBoO1xuXG4gICAgICAgIGxldCBub2RlcyA9IGcubm9kZXMoKS5tYXAobm9kZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGdyYXBoID0gdGhpcztcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogZ3JhcGguaGFuZGxlQ2xpY2suYmluZChncmFwaClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG4uaXNNZXRhbm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSA8TWV0YW5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG4udXNlckdlbmVyYXRlZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8SWRlbnRpZmllZE5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPEFub255bW91c05vZGUgey4uLnByb3BzfSAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoZWRnZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGUgPSBnLmVkZ2UoZWRnZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGdlIGtleT17YCR7ZWRnZU5hbWUudn0tPiR7ZWRnZU5hbWUud31gfSBlZGdlPXtlfS8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2aWV3Qm94X3dob2xlID0gYDAgMCAke2cuZ3JhcGgoKS53aWR0aH0gJHtnLmdyYXBoKCkuaGVpZ2h0fWA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHRyYW5zbGF0ZSgwcHgsMHB4KWAgKyBgc2NhbGUoJHtnLmdyYXBoKCkud2lkdGggLyBnLmdyYXBoKCkud2lkdGh9LCR7Zy5ncmFwaCgpLmhlaWdodCAvIGcuZ3JhcGgoKS5oZWlnaHR9KWA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHZhciB2aWV3Qm94XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICB2aWV3Qm94ID0gYCR7bi54IC0gbi53aWR0aCAvIDJ9ICR7bi55IC0gbi5oZWlnaHQgLyAyfSAke24ud2lkdGh9ICR7bi5oZWlnaHR9YFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld0JveCA9IHZpZXdCb3hfd2hvbGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8c3ZnIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50LmJpbmQodGhpcyl9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgZnJvbT17dmlld0JveF93aG9sZX0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICA8bWFya2VyIGlkPVwidmVlXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIj5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtub2Rlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7ZWRnZXN9XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz47XG4gICAgfVxufVxuXG5jbGFzcyBFZGdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGxpbmUgPSBkMy5saW5lKClcbiAgICAgICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAueShkID0+IGQueSlcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiBbXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogdGhpcy5wcm9wcy5lZGdlLnBvaW50c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxpbmU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9XCJlZGdlUGF0aFwiIG1hcmtlckVuZD1cInVybCgjdmVlKVwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50fSBrZXk9e01hdGgucmFuZG9tKCl9IHJlc3RhcnQ9XCJhbHdheXNcIiBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfSB0bz17bChlLnBvaW50cyl9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIiBhdHRyaWJ1dGVOYW1lPVwiZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YG5vZGUgJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gc3R5bGU9e3t0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtuLnggLShuLndpZHRoLzIpfXB4LCR7bi55IC0obi5oZWlnaHQvMil9cHgpYH19PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgQW5vbnltb3VzTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+IDwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIElkZW50aWZpZWROb2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufSIsImZ1bmN0aW9uIHJ1bigpIHtcbiAgUmVhY3RET00ucmVuZGVyKDxJREUvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vbmllbCcpKTtcbn1cblxuY29uc3QgbG9hZGVkU3RhdGVzID0gWydjb21wbGV0ZScsICdsb2FkZWQnLCAnaW50ZXJhY3RpdmUnXTtcblxuaWYgKGxvYWRlZFN0YXRlcy5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gIHJ1bigpO1xufSBlbHNlIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW4sIGZhbHNlKTtcbn0iXX0=
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9HcmFwaExheW91dC5qc3giLCJzY3JpcHRzL0lERS5qc3giLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvTW9uaWVsLmpzIiwic2NyaXB0cy9QYW5lbC5qc3giLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0lBQU0sa0I7OztzQkFXTztBQUNYLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLFNBQUwsQ0FBZSxTQUFmLENBQVA7QUFDQTs7O0FBRUQsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BZnBCLFdBZW9CLEdBZk4sRUFlTTtBQUFBLE9BYnBCLFdBYW9CLEdBYk4sRUFhTTtBQUFBLE9BWnBCLFNBWW9CLEdBWlIsRUFZUTtBQUFBLE9BWHBCLGlCQVdvQixHQVhBLEVBV0E7QUFBQSxPQVZwQixVQVVvQixHQVZQLElBQUksVUFBSixFQVVPO0FBQUEsT0FScEIsU0FRb0IsR0FSUixFQVFRO0FBQUEsT0FQcEIsYUFPb0IsR0FQSixFQU9JOztBQUNuQixPQUFLLFVBQUw7QUFDQSxPQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVNLFFBQUssT0FBTDtBQUNOOzs7NkJBRVUsSyxFQUFPO0FBQ2pCLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixNQUFNLElBQU4sQ0FBVyxLQUFoQztBQUNB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QUFGSjtBQUZKLGFBREo7QUFTSDs7OztFQVp3QixJOzs7QUN0TTdCLFNBQVMsR0FBVCxHQUFlO0FBQ2IsV0FBUyxNQUFULENBQWdCLG9CQUFDLEdBQUQsT0FBaEIsRUFBd0IsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQXhCO0FBQ0Q7O0FBRUQsSUFBTSxlQUFlLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsYUFBdkIsQ0FBckI7O0FBRUEsSUFBSSxhQUFhLFFBQWIsQ0FBc0IsU0FBUyxVQUEvQixLQUE4QyxTQUFTLElBQTNELEVBQWlFO0FBQy9EO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsU0FBTyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdGRlZmF1bHRFZGdlID0ge31cblxuXHRub2RlQ291bnRlciA9IHt9XG5cdG5vZGVTdGFjayA9IFtdXG5cdHByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJTY29wZShzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlLm5hbWUudmFsdWUpO1xuXHRcdGxldCBjdXJyZW50U2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHByZXZpb3VzU2NvcGVJZCA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGN1cnJlbnRTY29wZUlkLCB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IHNjb3BlLm5hbWUudmFsdWUsXG4gICAgICAgICAgICBjbGFzczogXCJNZXRhbm9kZVwiLFxuICAgICAgICAgICAgaXNNZXRhbm9kZTogdHJ1ZSxcbiAgICAgICAgICAgIF9zb3VyY2U6IHNjb3BlLm5hbWUuX3NvdXJjZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQoY3VycmVudFNjb3BlSWQsIHByZXZpb3VzU2NvcGVJZCk7XG5cdH1cblxuXHRleGl0U2NvcGUoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0ZW50ZXJNZXRhbm9kZVNjb3BlKG5hbWUpIHtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXSA9IG5ldyBncmFwaGxpYi5HcmFwaCh7XG5cdFx0XHRjb21wb3VuZDogdHJ1ZVxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdLnNldEdyYXBoKHtcblx0XHRcdG5hbWU6IG5hbWUsXG5cdCAgICAgICAgcmFua2RpcjogJ0JUJyxcblx0ICAgICAgICBlZGdlc2VwOiAyMCxcblx0ICAgICAgICByYW5rc2VwOiA0MCxcblx0ICAgICAgICBub2RlU2VwOiAzMCxcblx0ICAgICAgICBtYXJnaW54OiAyMCxcblx0ICAgICAgICBtYXJnaW55OiAyMCxcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2RlU3RhY2sucHVzaChuYW1lKTtcblxuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tuYW1lXTtcblx0fVxuXG5cdGV4aXRNZXRhbm9kZVNjb3BlKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2RlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRnZW5lcmF0ZUluc3RhbmNlSWQodHlwZSkge1xuXHRcdGlmICghdGhpcy5ub2RlQ291bnRlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHRcdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSA9IDA7XG5cdFx0fVxuXHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gKz0gMTtcblx0XHRsZXQgaWQgPSBcImFfXCIgKyB0eXBlICsgdGhpcy5ub2RlQ291bnRlclt0eXBlXTtcblx0XHRyZXR1cm4gaWQ7XG5cdH1cblxuXHRhZGRNYWluKCkge1xuXHRcdHRoaXMuZW50ZXJNZXRhbm9kZVNjb3BlKFwibWFpblwiKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKTtcblx0XHRcdGNvbnNvbGUubG9nKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2tbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdFx0XG5cblx0XHRcdFxuXHRcdFx0Lypcblx0XHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2suZm9yRWFjaChmcm9tUGF0aCA9PiB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZShmcm9tUGF0aCwgbm9kZVBhdGgpXHRcblx0XHRcdH0pO1xuXHRcdFx0Ki9cblxuXHRcdFx0XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKGBUcnlpbmcgdG8gdG91Y2ggbm9uLWV4aXN0YW50IG5vZGUgXCIke25vZGVQYXRofVwiYCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmZXJlbmNlTm9kZShpZCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IGlkLFxuXHRcdFx0Y2xhc3M6IFwidW5kZWZpbmVkXCIsXG5cdFx0XHRoZWlnaHQ6IDUwXG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0d2lkdGg6IE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApICogMTBcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y3JlYXRlTm9kZShpZCwgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdGNvbnNvbGUud2FybihgUmVkaWZpbmluZyBub2RlIFwiJHtpZH1cImApO1x0XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoXG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHRyZXR1cm4gbm9kZVBhdGg7XG5cdH1cblxuXHRjcmVhdGVNZXRhbm9kZShpZGVudGlmaWVyLCBtZXRhbm9kZUNsYXNzLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcik7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZWRnZS52LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgZWRnZS53LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gWy4uLnRoaXMubm9kZVN0YWNrXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0c2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLnNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpO1xuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIklucHV0XCI7XG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiO1xuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWU7XG5cdH1cblxuXHRnZXRPdXRwdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc091dHB1dChub2RlKSB9KTtcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBPdXRwdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlcztcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc0lucHV0KG5vZGUpfSk7XG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dE5vZGVzO1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblx0XHRjb25zb2xlLmxvZyhcInNldE11bHRpRWRnZVwiLCBzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pO1x0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHRhcmdldFBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocy5mb3JFYWNoKHNvdXJjZVBhdGggPT4gdGhpcy5ncmFwaC5zZXRFZGdlKHNvdXJjZVBhdGgsIHRhcmdldFBhdGhzWzBdLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwgey4uLnRoaXMuZGVmYXVsdEVkZ2V9KSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0bWVzc2FnZTogYE51bWJlciBvZiBub2RlcyBkb2VzIG5vdCBtYXRjaC4gWyR7c291cmNlUGF0aHMubGVuZ3RofV0gLT4gWyR7dGFyZ2V0UGF0aHMubGVuZ3RofV1gLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0Ly8gc3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRcdC8vIGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0aGFzTm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Z2V0R3JhcGgoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5ncmFwaClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5pbnNpZGUoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0d29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpO1xuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGVuY29kZShncmFwaCkge1xuICAgIFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGdyYXBobGliLmpzb24ud3JpdGUoZ3JhcGgpKTtcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuICAgIFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChKU09OLnBhcnNlKGpzb24pKTtcbiAgICB9XG5cbiAgICBsYXlvdXQoZ3JhcGgsIGNhbGxiYWNrKSB7XG4gICAgXHQvL2NvbnNvbGUubG9nKFwiR3JhcGhMYXlvdXQubGF5b3V0XCIsIGdyYXBoLCBjYWxsYmFjayk7XG4gICAgXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgXHR0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgXHRcdGdyYXBoOiB0aGlzLmVuY29kZShncmFwaClcbiAgICBcdH0pO1xuICAgIH1cblxuICAgIHJlY2VpdmUoZGF0YSkge1xuICAgIFx0dmFyIGdyYXBoID0gdGhpcy5kZWNvZGUoZGF0YS5kYXRhLmdyYXBoKTtcbiAgICBcdHRoaXMuY2FsbGJhY2soZ3JhcGgpO1xuICAgIH1cbn0iLCJjb25zdCBpcGMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIikuaXBjUmVuZGVyZXJcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5cbmNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0bW9uaWVsID0gbmV3IE1vbmllbCgpO1xuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0XCJncmFtbWFyXCI6IGdyYW1tYXIsXG5cdFx0XHRcInNlbWFudGljc1wiOiBzZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbCxcblx0XHRcdFwibGF5b3V0XCI6IFwiY29sdW1uc1wiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IHNhdmVOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdTa2V0Y2ggc2F2ZWQnLCB7XG4gICAgICAgICAgICBcdGJvZHk6IGBTa2V0Y2ggd2FzIHN1Y2Nlc3NmdWxseSBzYXZlZCBpbiB0aGUgXCJza2V0Y2hlc1wiIGZvbGRlci5gLFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgIH0pXG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHR0eXBlOiBcIndhcm5pbmdcIixcblx0XHRcdFx0XHRtZXNzYWdlOiBgVmFsdWUgZm9yIFwibGF5b3V0XCIgY2FuIGJlIG9ubHkgXCJjb2x1bW5zXCIgb3IgXCJyb3dzXCIuYFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIik7XG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmNvbXBpbGVUb0FTVCh0aGlzLnN0YXRlLmdyYW1tYXIsIHRoaXMuc3RhdGUuc2VtYW50aWNzLCB2YWx1ZSk7XG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdCk7XG5cdFx0XHR2YXIgZ3JhcGggPSB0aGlzLm1vbmllbC5nZXRDb21wdXRhdGlvbmFsR3JhcGgoKTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogcmVzdWx0LmFzdCxcblx0XHRcdFx0Z3JhcGg6IGdyYXBoLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHR0b2dnbGVMYXlvdXQoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRsYXlvdXQ6ICh0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIpID8gXCJyb3dzXCIgOiBcImNvbHVtbnNcIlxuXHRcdH0pXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdHZhciBjYWxsYmFjayA9IGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlXG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0JC5hamF4KHtcblx0XHRcdHVybDogYC4vZXhhbXBsZXMvJHtpZH0ubW9uYCxcblx0XHRcdGRhdGE6IG51bGwsXG5cdFx0XHRzdWNjZXNzOiBjYWxsYmFjay5iaW5kKHRoaXMpLFxuXHRcdFx0ZGF0YVR5cGU6IFwidGV4dFwiXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBpbnRvIE1vbmllbD8gb3IgUGFyc2VyXG5cdGNvbXBpbGVUb0FTVChncmFtbWFyLCBzZW1hbnRpY3MsIHNvdXJjZSkge1xuXHQgICAgdmFyIHJlc3VsdCA9IGdyYW1tYXIubWF0Y2goc291cmNlKTtcblxuXHQgICAgaWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHQgICAgICAgIHZhciBhc3QgPSBzZW1hbnRpY3MocmVzdWx0KS5ldmFsKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJhc3RcIjogYXN0XG5cdCAgICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHQgICAgICAgIHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKTtcblx0ICAgICAgICB2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJleHBlY3RlZFwiOiBleHBlY3RlZCxcblx0ICAgICAgICAgICAgXCJwb3NpdGlvblwiOiBwb3NpdGlvblxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY29udGFpbmVyTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXRcblx0XHRsZXQgZ3JhcGhMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIgPyBcIkJUXCIgOiBcIkxSXCJcblxuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzc05hbWU9e2Bjb250YWluZXIgJHtjb250YWluZXJMYXlvdXR9YH0+XG4gICAgXHRcdDxQYW5lbCBpZD1cImRlZmluaXRpb25cIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRyZWY9eyhyZWYpID0+IHRoaXMuZWRpdG9yID0gcmVmfVxuICAgIFx0XHRcdFx0bW9kZT1cIm1vbmllbFwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0aXNzdWVzPXt0aGlzLnN0YXRlLmlzc3Vlc31cbiAgICBcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0XHRcbiAgICBcdFx0PFBhbmVsIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgIFx0XHRcdDxWaXN1YWxHcmFwaCBncmFwaD17dGhpcy5zdGF0ZS5ncmFwaH0gbGF5b3V0PXtncmFwaExheW91dH0gLz5cbiAgICBcdFx0PC9QYW5lbD5cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiY2xhc3MgTG9nZ2Vye1xuXHRpc3N1ZXMgPSBbXVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuaXNzdWVzID0gW107XG5cdH1cblx0XG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5pc3N1ZXM7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHZhciBmID0gbnVsbDtcblx0XHRzd2l0Y2goaXNzdWUudHlwZSkge1xuXHRcdFx0Y2FzZSBcImVycm9yXCI6IGYgPSBjb25zb2xlLmVycm9yOyBicmVhaztcblx0XHRcdGNhc2UgXCJ3YXJuaW5nXCI6IGYgPSBjb25zb2xlLndhcm47IGJyZWFrO1xuXHRcdFx0Y2FzZSBcImluZm9cIjogZiA9IGNvbnNvbGUuaW5mbzsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiBmID0gY29uc29sZS5sb2c7IGJyZWFrO1xuXHRcdH1cblx0XHRmKGlzc3VlLm1lc3NhZ2UpO1xuXHRcdHRoaXMuaXNzdWVzLnB1c2goaXNzdWUpO1xuXHR9XG59IiwiY2xhc3MgTW9uaWVse1xuXHRsb2dnZXIgPSBuZXcgTG9nZ2VyKCk7XG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKTtcblxuXHRkZWZpbml0aW9ucyA9IHt9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmdyYXBoLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmxvZ2dlci5jbGVhcigpO1xuXG5cdFx0dGhpcy5kZWZpbml0aW9ucyA9IFtdO1xuXHRcdHRoaXMuYWRkRGVmYXVsdERlZmluaXRpb25zKCk7XG5cdH1cblxuXHRhZGREZWZhdWx0RGVmaW5pdGlvbnMoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgZGVmYXVsdCBkZWZpbml0aW9ucy5gKTtcblx0XHRjb25zdCBkZWZhdWx0RGVmaW5pdGlvbnMgPSBbXCJBZGRcIiwgXCJMaW5lYXJcIiwgXCJJbnB1dFwiLCBcIk91dHB1dFwiLCBcIlBsYWNlaG9sZGVyXCIsIFwiVmFyaWFibGVcIiwgXCJDb25zdGFudFwiLCBcIk11bHRpcGx5XCIsIFwiQ29udm9sdXRpb25cIiwgXCJEZW5zZVwiLCBcIk1heFBvb2xpbmdcIiwgXCJCYXRjaE5vcm1hbGl6YXRpb25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiBjb2xvckhhc2guaGV4KGRlZmluaXRpb25OYW1lKVxuXHRcdH07XG5cdH1cblxuXHRoYW5kbGVTY29wZURlZmluaXRpb24oc2NvcGUpIHtcblx0XHR0aGlzLmdyYXBoLmVudGVyU2NvcGUoc2NvcGUpO1xuXHRcdHRoaXMud2Fsa0FzdChzY29wZS5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlU2NvcGVEZWZpbml0aW9uQm9keShzY29wZUJvZHkpIHtcblx0XHRzY29wZUJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uKcKge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIFwiJHtibG9ja0RlZmluaXRpb24ubmFtZX1cIiB0byBhdmFpbGFibGUgZGVmaW5pdGlvbnMuYCk7XG5cdFx0dGhpcy5hZGREZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy53YWxrQXN0KGJsb2NrRGVmaW5pdGlvbi5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KGRlZmluaXRpb25Cb2R5KSB7XG5cdFx0ZGVmaW5pdGlvbkJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpIHtcblx0XHRjb25zb2xlLndhcm4oXCJXaGF0IHRvIGRvIHdpdGggdGhpcyBBU1Qgbm9kZT9cIiwgbm9kZSk7XG5cdH1cblxuXHRoYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihuZXR3b3JrKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0bmV0d29yay5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKGNvbm5lY3Rpb24pIHtcblx0XHR0aGlzLmdyYXBoLmNsZWFyTm9kZVN0YWNrKCk7XG5cdFx0Y29ubmVjdGlvbi5saXN0LmZvckVhY2goaXRlbSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpO1xuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gdGhpcyBpcyBkb2luZyB0b28gbXVjaCDigJMgYnJlYWsgaW50byBcIm5vdCByZWNvZ25pemVkXCIsIFwic3VjY2Vzc1wiIGFuZCBcImFtYmlndW91c1wiXG5cdGhhbmRsZUJsb2NrSW5zdGFuY2UoaW5zdGFuY2UpIHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJkYXJrZ3JleVwiLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdHdpZHRoOiAxMDAsXG5cblx0XHRcdF9zb3VyY2U6IGluc3RhbmNlLFxuXHRcdH07XG5cblx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhpbnN0YW5jZS5uYW1lLnZhbHVlKVxuXHRcdC8vIGNvbnNvbGUubG9nKGBNYXRjaGVkIGRlZmluaXRpb25zOmAsIGRlZmluaXRpb25zKTtcblxuXHRcdGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgbm9kZS5pc1VuZGVmaW5lZCA9IHRydWVcblxuICAgICAgICAgICAgdGhpcy5hZGRJc3N1ZSh7XG4gICAgICAgICAgICBcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBObyBwb3NzaWJsZSBtYXRjaGVzIGZvdW5kLmAsXG4gICAgICAgICAgICBcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuICAgICAgICAgICAgXHR0eXBlOiBcImVycm9yXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXTtcblx0XHRcdGlmIChkZWZpbml0aW9uKSB7XG5cdFx0XHRcdG5vZGUuY29sb3IgPSBkZWZpbml0aW9uLmNvbG9yO1xuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gUG9zc2libGUgbWF0Y2hlczogJHtkZWZpbml0aW9ucy5tYXAoZGVmID0+IGBcIiR7ZGVmLm5hbWV9XCJgKS5qb2luKFwiLCBcIil9LmAsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHR2YXIgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKTtcblx0XHRcdGNvbG9yLm9wYWNpdHkgPSAwLjE7XG5cdFx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKG5vZGUuaWQsIG5vZGUuY2xhc3MsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHtcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKX1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuICAgICAgICAgICAgc3R5bGU6IHtcImZpbGxcIjogbm9kZS5jb2xvcn0sXG4gICAgICAgICAgICB3aWR0aDogTWF0aC5tYXgoTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCksIDUpICogMTJcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdG1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhxdWVyeSkge1xuXHRcdHZhciBkZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmaW5pdGlvbnMpO1xuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IE1vbmllbC5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpO1xuXHRcdC8vY29uc29sZS5sb2coXCJGb3VuZCBrZXlzXCIsIGRlZmluaXRpb25LZXlzKTtcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pO1xuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnM7XG5cdH1cblxuXHRnZXRDb21wdXRhdGlvbmFsR3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguZ2V0R3JhcGgoKTtcblx0fVxuXG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2dnZXIuZ2V0SXNzdWVzKCk7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKTtcblx0fVxuXG5cdHN0YXRpYyBuYW1lUmVzb2x1dGlvbihwYXJ0aWFsLCBsaXN0KSB7XG5cdFx0bGV0IHNwbGl0UmVnZXggPSAvKD89WzAtOUEtWl0pLztcblx0ICAgIGxldCBwYXJ0aWFsQXJyYXkgPSBwYXJ0aWFsLnNwbGl0KHNwbGl0UmVnZXgpO1xuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSk7XG5cdCAgICB2YXIgcmVzdWx0ID0gbGlzdEFycmF5LmZpbHRlcihwb3NzaWJsZU1hdGNoID0+IE1vbmllbC5pc011bHRpUHJlZml4KHBhcnRpYWxBcnJheSwgcG9zc2libGVNYXRjaCkpO1xuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSk7XG5cdCAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0c3RhdGljIGlzTXVsdGlQcmVmaXgobmFtZSwgdGFyZ2V0KSB7XG5cdCAgICBpZiAobmFtZS5sZW5ndGggIT09IHRhcmdldC5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdCAgICB2YXIgaSA9IDA7XG5cdCAgICB3aGlsZShpIDwgbmFtZS5sZW5ndGggJiYgdGFyZ2V0W2ldLnN0YXJ0c1dpdGgobmFtZVtpXSkpIHsgaSArPSAxOyB9XG5cdCAgICByZXR1cm4gKGkgPT09IG5hbWUubGVuZ3RoKTsgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHR3YWxrQXN0KG5vZGUpIHtcblx0XHRpZiAoIW5vZGUpIHsgY29uc29sZS5lcnJvcihcIk5vIG5vZGU/IVwiKTsgcmV0dXJuOyB9XG5cblx0XHRzd2l0Y2ggKG5vZGUudHlwZSkge1xuXHRcdFx0Y2FzZSBcIk5ldHdvcmtcIjogdGhpcy5oYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25Cb2R5XCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlU2NvcGVEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJTY29wZURlZmluaXRpb25Cb2R5XCI6IHRoaXMuaGFuZGxlU2NvcGVEZWZpbml0aW9uQm9keShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIjogdGhpcy5oYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tJbnN0YW5jZVwiOiB0aGlzLmhhbmRsZUJsb2NrSW5zdGFuY2Uobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrTGlzdFwiOiB0aGlzLmhhbmRsZUJsb2NrTGlzdChub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSWRlbnRpZmllclwiOiB0aGlzLmhhbmRsZUlkZW50aWZpZXIobm9kZSk7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhpcy5oYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpO1xuXHRcdH1cblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmdyYXBoTGF5b3V0ID0gbmV3IEdyYXBoTGF5b3V0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbCxcbiAgICAgICAgICAgIHByZXZpb3VzVmlld0JveDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSBudWxsXG4gICAgfVxuXG4gICAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wc1wiLCBuZXh0UHJvcHMpO1xuICAgICAgICBpZiAobmV4dFByb3BzLmdyYXBoKSB7XG4gICAgICAgICAgICBuZXh0UHJvcHMuZ3JhcGguX2xhYmVsLnJhbmtkaXIgPSBuZXh0UHJvcHMubGF5b3V0O1xuICAgICAgICAgICAgdGhpcy5ncmFwaExheW91dC5sYXlvdXQobmV4dFByb3BzLmdyYXBoLCB0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGcgPSB0aGlzLnN0YXRlLmdyYXBoO1xuXG4gICAgICAgIGxldCBub2RlcyA9IGcubm9kZXMoKS5tYXAobm9kZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGdyYXBoID0gdGhpcztcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogZ3JhcGguaGFuZGxlQ2xpY2suYmluZChncmFwaClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG4uaXNNZXRhbm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSA8TWV0YW5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG4udXNlckdlbmVyYXRlZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8SWRlbnRpZmllZE5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPEFub255bW91c05vZGUgey4uLnByb3BzfSAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoZWRnZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGUgPSBnLmVkZ2UoZWRnZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGdlIGtleT17YCR7ZWRnZU5hbWUudn0tPiR7ZWRnZU5hbWUud31gfSBlZGdlPXtlfS8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2aWV3Qm94X3dob2xlID0gYDAgMCAke2cuZ3JhcGgoKS53aWR0aH0gJHtnLmdyYXBoKCkuaGVpZ2h0fWA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHRyYW5zbGF0ZSgwcHgsMHB4KWAgKyBgc2NhbGUoJHtnLmdyYXBoKCkud2lkdGggLyBnLmdyYXBoKCkud2lkdGh9LCR7Zy5ncmFwaCgpLmhlaWdodCAvIGcuZ3JhcGgoKS5oZWlnaHR9KWA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHZhciB2aWV3Qm94XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICB2aWV3Qm94ID0gYCR7bi54IC0gbi53aWR0aCAvIDJ9ICR7bi55IC0gbi5oZWlnaHQgLyAyfSAke24ud2lkdGh9ICR7bi5oZWlnaHR9YFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld0JveCA9IHZpZXdCb3hfd2hvbGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8c3ZnIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50LmJpbmQodGhpcyl9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgZnJvbT17dmlld0JveF93aG9sZX0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICA8bWFya2VyIGlkPVwidmVlXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIj5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtub2Rlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7ZWRnZXN9XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz47XG4gICAgfVxufVxuXG5jbGFzcyBFZGdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGxpbmUgPSBkMy5saW5lKClcbiAgICAgICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAueShkID0+IGQueSlcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiBbXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogdGhpcy5wcm9wcy5lZGdlLnBvaW50c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxpbmU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9XCJlZGdlUGF0aFwiIG1hcmtlckVuZD1cInVybCgjdmVlKVwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50fSBrZXk9e01hdGgucmFuZG9tKCl9IHJlc3RhcnQ9XCJhbHdheXNcIiBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfSB0bz17bChlLnBvaW50cyl9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIiBhdHRyaWJ1dGVOYW1lPVwiZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YG5vZGUgJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gc3R5bGU9e3t0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtuLnggLShuLndpZHRoLzIpfXB4LCR7bi55IC0obi5oZWlnaHQvMil9cHgpYH19PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgQW5vbnltb3VzTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+IDwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIElkZW50aWZpZWROb2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufSIsImZ1bmN0aW9uIHJ1bigpIHtcbiAgUmVhY3RET00ucmVuZGVyKDxJREUvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vbmllbCcpKTtcbn1cblxuY29uc3QgbG9hZGVkU3RhdGVzID0gWydjb21wbGV0ZScsICdsb2FkZWQnLCAnaW50ZXJhY3RpdmUnXTtcblxuaWYgKGxvYWRlZFN0YXRlcy5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gIHJ1bigpO1xufSBlbHNlIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW4sIGZhbHNlKTtcbn0iXX0=
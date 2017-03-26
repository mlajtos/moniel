"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ColorHashWrapper = function () {
    function ColorHashWrapper() {
        _classCallCheck(this, ColorHashWrapper);

        this.colorHash = new ColorHash({
            saturation: [0.9],
            lightness: [0.45],
            hash: this.magic
        });
    }

    _createClass(ColorHashWrapper, [{
        key: "loseLose",
        value: function loseLose(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash += str.charCodeAt(i);
            }
            return hash;
        }
    }, {
        key: "magic",
        value: function magic(str) {
            var hash = 0;
            for (var i = 0; i < str.length; i++) {
                hash = hash * 47 + str.charCodeAt(i) % 32;
            }
            return hash;
        }
    }, {
        key: "hex",
        value: function hex(str) {
            return this.colorHash.hex(str);
        }
    }]);

    return ColorHashWrapper;
}();
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

			// console.log("Metanodes:", this.metanodes)
			// console.log("Metanode Stack:", this.metanodeStack)

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
			// console.log(this.metanodeStack)

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
			// console.log("isMetanode:", nodePath)
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
			console.log(this.graph);
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
                return marker.range.contains(c.row, c.column);
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
		_this.parser = new Parser();
		_this.generator = new PyTorchGenerator();
		_this.lock = null;


		_this.state = {
			// these are no longer needed here
			// "grammar": this.parser.grammar,
			// "semantics": this.parser.semantics,
			"networkDefinition": "",
			"ast": null,
			"issues": null,
			"layout": "columns",
			"generatedCode": ""
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

		// this.loadExample("ConvolutionalLayer")
		return _this;
	}

	_createClass(IDE, [{
		key: "loadExample",
		value: function loadExample(id) {
			var fileContent = fs.readFileSync("./examples/" + id + ".mon", "utf8");
			this.editor.setValue(fileContent); // this has to be here, I don't know why
			this.setState({
				networkDefinition: fileContent
			});
		}
	}, {
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
			var result = this.parser.make(value);

			if (result.ast) {
				this.moniel.walkAst(result.ast);
				var graph = this.moniel.getComputationalGraph();
				this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					generatedCode: this.generator.generateCode(graph),
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
				),
				React.createElement(
					Panel,
					{ title: "Generated Code" },
					React.createElement(Editor, {
						mode: "python",
						theme: "monokai",
						value: this.state.generatedCode
					})
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
		this.colorHash = new ColorHashWrapper();
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
				color: this.colorHash.hex(definitionName)
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

var fs = require("fs");
var ohm = require("ohm-js");

var Parser = function () {
	function Parser() {
		_classCallCheck(this, Parser);

		this.contents = null;
		this.grammar = null;
		this.evalOperation = {
			Network: function Network(definitions) {
				return {
					type: "Network",
					definitions: definitions.eval()
				};
			},
			BlockDefinition: function BlockDefinition(_, layerName, params, body) {
				return {
					type: "BlockDefinition",
					name: layerName.source.contents,
					body: body.eval()
				};
			},
			InlineBlockDefinition: function InlineBlockDefinition(name, _, body) {
				return {
					type: "InlineBlockDefinition",
					name: name.eval(),
					body: body.eval(),
					_source: this.source
				};
			},
			InlineBlockDefinitionBody: function InlineBlockDefinitionBody(_, list, __) {
				var definitions = list.eval();
				return {
					type: "BlockDefinitionBody",
					definitions: definitions ? definitions : []
				};
			},
			ConnectionDefinition: function ConnectionDefinition(list) {
				return {
					type: "ConnectionDefinition",
					list: list.eval()
				};
			},
			BlockInstance: function BlockInstance(id, layerName, params) {
				return {
					type: "BlockInstance",
					name: layerName.eval(),
					alias: id.eval()[0],
					parameters: params.eval(),
					_source: this.source
				};
			},
			BlockName: function BlockName(id, _) {
				return id.eval();
			},
			BlockList: function BlockList(_, list, __) {
				return {
					"type": "BlockList",
					"list": list.eval()
				};
			},
			BlockDefinitionParameters: function BlockDefinitionParameters(_, list, __) {
				return list.eval();
			},
			BlockDefinitionBody: function BlockDefinitionBody(_, list, __) {
				var definitions = list.eval()[0];
				return {
					type: "BlockDefinitionBody",
					definitions: definitions ? definitions : []
				};
			},
			BlockInstanceParameters: function BlockInstanceParameters(_, list, __) {
				return list.eval();
			},
			Parameter: function Parameter(name, _, value) {
				return {
					type: "Parameter",
					name: name.eval(),
					value: value.eval()
				};
			},
			Value: function Value(val) {
				return {
					type: "Value",
					value: val.source.contents
				};
			},
			ValueList: function ValueList(_, list, __) {
				return list.eval();
			},
			NonemptyListOf: function NonemptyListOf(x, _, xs) {
				return [x.eval()].concat(xs.eval());
			},
			EmptyListOf: function EmptyListOf() {
				return [];
			},
			blockIdentifier: function blockIdentifier(_, __, ___) {
				return {
					type: "Identifier",
					value: this.source.contents,
					_source: this.source
				};
			},
			parameterName: function parameterName(a) {
				return a.source.contents;
			},
			blockType: function blockType(_, __) {
				return {
					type: "BlockType",
					value: this.source.contents,
					_source: this.source
				};
			},
			blockName: function blockName(_, __) {
				return {
					type: "Identifier",
					value: this.source.contents,
					_source: this.source
				};
			}
		};

		this.contents = fs.readFileSync("src/moniel.ohm", "utf8");
		this.grammar = ohm.grammar(this.contents);
		this.semantics = this.grammar.createSemantics().addOperation("eval", this.evalOperation);
	}

	_createClass(Parser, [{
		key: "make",
		value: function make(source) {
			var result = this.grammar.match(source);

			if (result.succeeded()) {
				var ast = this.semantics(result).eval();
				return {
					ast: ast
				};
			} else {
				var expected = result.getExpectedText();
				var position = result.getRightmostFailurePosition();
				return {
					expected: expected,
					position: position
				};
			}
		}
	}]);

	return Parser;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PyTorchGenerator = function () {
	function PyTorchGenerator() {
		_classCallCheck(this, PyTorchGenerator);
	}

	_createClass(PyTorchGenerator, [{
		key: "sanitize",
		value: function sanitize(id) {
			var sanitizedId = id;
			sanitizedId = sanitizedId.replace(/\//g, "_");
			sanitizedId = sanitizedId.replace(/\./g, "");
			return sanitizedId;
		}
	}, {
		key: "generateCode",
		value: function generateCode(g) {
			var _this = this;

			// return ""
			var imports = "import torch";

			var topologicalOrdering = graphlib.alg.topsort(g);
			console.log(topologicalOrdering);

			var code = "";

			topologicalOrdering.map(function (node) {
				// console.log("mu", node)
				var n = g.node(node);
				var ch = g.children(node);
				console.log(n);

				if (ch.length === 0) {
					// console.log(node)
					var inNodes = g.inEdges(node).map(function (e) {
						return _this.sanitize(e.v);
					});
					code += _this.sanitize(node) + " = " + n.class + "(" + inNodes.join(", ") + ")\n";
				} else {
					if (n.userGeneratedId) {
						code += "def " + n.userGeneratedId + "():\n\tpass\n\n";
					}
				}
			}, this);
			return imports + "\n" + code;
		}
	}]);

	return PyTorchGenerator;
}();
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

        var _this = _possibleConstructorReturn(this, (VisualGraph.__proto__ || Object.getPrototypeOf(VisualGraph)).call(this, props));
        // console.log("VisualGraph.constructor");


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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9QeVRvcmNoR2VuZXJhdG9yLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7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RUFBQyxrQkFBa0IsYUFBbkIsRUFBMUY7QUFDSTtBQUFBO0FBQUEsMEJBQU8sR0FBRSxHQUFULEVBQWEsV0FBVSxJQUF2QjtBQUE2QiwwQkFBRTtBQUEvQixxQkFESjtBQUVJO0FBQUE7QUFBQSwwQkFBTyxHQUFFLEdBQVQsRUFBYSxJQUFHLE9BQWhCO0FBQXlCLDBCQUFFO0FBQTNCO0FBRko7QUFGSixhQURKO0FBU0g7Ozs7RUFad0IsSTs7O0FDdE03QixTQUFTLEdBQVQsR0FBZTtBQUNiLFdBQVMsTUFBVCxDQUFnQixvQkFBQyxHQUFELE9BQWhCLEVBQXdCLFNBQVMsY0FBVCxDQUF3QixRQUF4QixDQUF4QjtBQUNEOztBQUVELElBQU0sZUFBZSxDQUFDLFVBQUQsRUFBYSxRQUFiLEVBQXVCLGFBQXZCLENBQXJCOztBQUVBLElBQUksYUFBYSxRQUFiLENBQXNCLFNBQVMsVUFBL0IsS0FBOEMsU0FBUyxJQUEzRCxFQUFpRTtBQUMvRDtBQUNELENBRkQsTUFFTztBQUNMLFNBQU8sZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29sb3JIYXNoV3JhcHBlcntcbiAgICBjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoKHtcbiAgICAgICAgc2F0dXJhdGlvbjogWzAuOV0sXG4gICAgICAgIGxpZ2h0bmVzczogWzAuNDVdLFxuICAgICAgICBoYXNoOiB0aGlzLm1hZ2ljXG4gICAgfSlcblxuICAgIGxvc2VMb3NlKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoICs9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgbWFnaWMoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoICogNDcgKyBzdHIuY2hhckNvZGVBdChpKSAlIDMyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgaGV4KHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvckhhc2guaGV4KHN0cilcbiAgICB9XG59IiwiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRkZWZhdWx0RWRnZSA9IHt9XG5cblx0bm9kZUNvdW50ZXIgPSB7fVxuXHRfbm9kZVN0YWNrMiA9IHt9XG5cdF9wcmV2aW91c05vZGVTdGFjazIgPSBbXVxuXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Ly8gXG5cdGdldCBub2RlU3RhY2syKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9ub2RlU3RhY2syW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBub2RlU3RhY2syKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fbm9kZVN0YWNrMltsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGdldCBwcmV2aW91c05vZGVTdGFjazIoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrMltsYXN0SW5kZXhdXG5cdH1cblxuXHRzZXQgcHJldmlvdXNOb2RlU3RhY2syKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2syW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5jbGVhck5vZGVTdGFjaygpXG5cblx0XHR0aGlzLl9ub2RlU3RhY2syID0ge31cblx0XHR0aGlzLl9wcmV2aW91c05vZGVTdGFjazIgPSB7fVxuXG5cdFx0dGhpcy5tZXRhbm9kZXMgPSB7fVxuXHRcdHRoaXMubWV0YW5vZGVTdGFjayA9IFtdXG5cblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlczpcIiwgdGhpcy5tZXRhbm9kZXMpXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZSBTdGFjazpcIiwgdGhpcy5tZXRhbm9kZVN0YWNrKVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJNZXRhbm9kZVNjb3BlKG5hbWUpIHtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXSA9IG5ldyBncmFwaGxpYi5HcmFwaCh7XG5cdFx0XHRjb21wb3VuZDogdHJ1ZVxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdLnNldEdyYXBoKHtcblx0XHRcdG5hbWU6IG5hbWUsXG5cdCAgICAgICAgcmFua2RpcjogJ0JUJyxcblx0ICAgICAgICBlZGdlc2VwOiAyMCxcblx0ICAgICAgICByYW5rc2VwOiA0MCxcblx0ICAgICAgICBub2RlU2VwOiAzMCxcblx0ICAgICAgICBtYXJnaW54OiAyMCxcblx0ICAgICAgICBtYXJnaW55OiAyMCxcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2RlU3RhY2sucHVzaChuYW1lKTtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1ldGFub2RlU3RhY2spXG5cblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbmFtZV07XG5cdH1cblxuXHRleGl0TWV0YW5vZGVTY29wZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gXCJhX1wiICsgdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLmVudGVyTWV0YW5vZGVTY29wZShcIm1haW5cIik7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goXCIuXCIpO1xuXHRcdGxldCBpZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoaWQsIHtcblx0XHRcdGNsYXNzOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhgVG91Y2hpbmcgbm9kZSBcIiR7bm9kZVBhdGh9XCIuYClcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2syLnB1c2gobm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrMi5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2syWzBdLCBub2RlUGF0aClcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjazIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjazIsIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRpZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG1ldGFub2RlQ2xhc3MsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZGVudGlmaWVyKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXHRcdFxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aCxcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpKTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2syID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2syID0gW107XG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjazIgPSBbLi4udGhpcy5ub2RlU3RhY2syXTtcblx0XHR0aGlzLm5vZGVTdGFjazIgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhcImlzTWV0YW5vZGU6XCIsIG5vZGVQYXRoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWU7XG5cdH1cblxuXHRnZXRPdXRwdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc091dHB1dChub2RlKSB9KTtcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBPdXRwdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlcztcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc0lucHV0KG5vZGUpfSk7XG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dE5vZGVzO1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHsuLi50aGlzLmRlZmF1bHRFZGdlfSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwpKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHRjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmNvbnRhaW5zKGMucm93LCBjLmNvbHVtbikpLnJlZHVjZSggKHByZXYsIGN1cnIpID0+IHByZXYgfHwgY3VyciwgZmFsc2UpO1xuXG4gICAgICAgIGlmIChjdXJzb3JPdmVyTWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhY2UuZWRpdCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKFwiYWNlL21vZGUvXCIgKyB0aGlzLnByb3BzLm1vZGUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS9cIiArIHRoaXMucHJvcHMudGhlbWUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTbmlwcGV0czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICB3cmFwOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEVkaXRvckludG9WaWV3OiB0cnVlLFxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJGaXJhIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdHdvcmtlciA9IG5ldyBXb3JrZXIoXCJzcmMvc2NyaXB0cy9HcmFwaExheW91dFdvcmtlci5qc1wiKTtcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbigpe31cblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBlbmNvZGUoZ3JhcGgpIHtcbiAgICBcdHJldHVybiBKU09OLnN0cmluZ2lmeShncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKSk7XG4gICAgfVxuXG4gICAgZGVjb2RlKGpzb24pIHtcbiAgICBcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoSlNPTi5wYXJzZShqc29uKSk7XG4gICAgfVxuXG4gICAgbGF5b3V0KGdyYXBoLCBjYWxsYmFjaykge1xuICAgIFx0Ly9jb25zb2xlLmxvZyhcIkdyYXBoTGF5b3V0LmxheW91dFwiLCBncmFwaCwgY2FsbGJhY2spO1xuICAgIFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgIFx0XHRncmFwaDogdGhpcy5lbmNvZGUoZ3JhcGgpXG4gICAgXHR9KTtcbiAgICB9XG5cbiAgICByZWNlaXZlKGRhdGEpIHtcbiAgICBcdHZhciBncmFwaCA9IHRoaXMuZGVjb2RlKGRhdGEuZGF0YS5ncmFwaCk7XG4gICAgXHR0aGlzLmNhbGxiYWNrKGdyYXBoKTtcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdG1vbmllbCA9IG5ldyBNb25pZWwoKVxuXHRwYXJzZXIgPSBuZXcgUGFyc2VyKClcblx0Z2VuZXJhdG9yID0gbmV3IFB5VG9yY2hHZW5lcmF0b3IoKVxuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Ly8gdGhlc2UgYXJlIG5vIGxvbmdlciBuZWVkZWQgaGVyZVxuXHRcdFx0Ly8gXCJncmFtbWFyXCI6IHRoaXMucGFyc2VyLmdyYW1tYXIsXG5cdFx0XHQvLyBcInNlbWFudGljc1wiOiB0aGlzLnBhcnNlci5zZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbCxcblx0XHRcdFwibGF5b3V0XCI6IFwiY29sdW1uc1wiLFxuXHRcdFx0XCJnZW5lcmF0ZWRDb2RlXCI6IFwiXCJcblx0XHR9O1xuXG5cdFx0aXBjLm9uKCdzYXZlJywgZnVuY3Rpb24oZXZlbnQsIG1lc3NhZ2UpIHtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5tb25cIiwgdGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbiwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLmFzdC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcbiAgICAgICAgICAgIFx0Ym9keTogYFNrZXRjaCB3YXMgc3VjY2Vzc2Z1bGx5IHNhdmVkIGluIHRoZSBcInNrZXRjaGVzXCIgZm9sZGVyLmAsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuICAgICAgICAgICAgfSlcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRsZXQgbGF5b3V0ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGF5b3V0XCIpXG5cdFx0aWYgKGxheW91dCkge1xuXHRcdFx0aWYgKGxheW91dCA9PSBcImNvbHVtbnNcIiB8fCBsYXlvdXQgPT0gXCJyb3dzXCIpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZS5sYXlvdXQgPSBsYXlvdXRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJ3YXJuaW5nXCIsXG5cdFx0XHRcdFx0bWVzc2FnZTogYFZhbHVlIGZvciBcImxheW91dFwiIGNhbiBiZSBvbmx5IFwiY29sdW1uc1wiIG9yIFwicm93c1wiLmBcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cblx0XHQvLyB0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgLi9leGFtcGxlcy8ke2lkfS5tb25gLCBcInV0ZjhcIilcblx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZShmaWxlQ29udGVudCkgLy8gdGhpcyBoYXMgdG8gYmUgaGVyZSwgSSBkb24ndCBrbm93IHdoeVxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bmV0d29ya0RlZmluaXRpb246IGZpbGVDb250ZW50XG5cdFx0fSlcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIilcblx0fVxuXG5cdGRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0aGlzLmxvY2spIHsgY2xlYXJUaW1lb3V0KHRoaXMubG9jayk7IH1cblx0XHR0aGlzLmxvY2sgPSBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSk7IH0sIDEwMCk7XG5cdH1cblxuXHR1cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSl7XG5cdFx0Y29uc29sZS50aW1lKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2VyLm1ha2UodmFsdWUpXG5cblx0XHRpZiAocmVzdWx0LmFzdCkge1xuXHRcdFx0dGhpcy5tb25pZWwud2Fsa0FzdChyZXN1bHQuYXN0KTtcblx0XHRcdHZhciBncmFwaCA9IHRoaXMubW9uaWVsLmdldENvbXB1dGF0aW9uYWxHcmFwaCgpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCksXG5cdFx0XHRcdGlzc3VlczogdGhpcy5tb25pZWwuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY29udGFpbmVyTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXRcblx0XHRsZXQgZ3JhcGhMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIgPyBcIkJUXCIgOiBcIkxSXCJcblxuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzc05hbWU9e2Bjb250YWluZXIgJHtjb250YWluZXJMYXlvdXR9YH0+XG4gICAgXHRcdDxQYW5lbCBpZD1cImRlZmluaXRpb25cIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRyZWY9eyhyZWYpID0+IHRoaXMuZWRpdG9yID0gcmVmfVxuICAgIFx0XHRcdFx0bW9kZT1cIm1vbmllbFwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0aXNzdWVzPXt0aGlzLnN0YXRlLmlzc3Vlc31cbiAgICBcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0XHRcbiAgICBcdFx0PFBhbmVsIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgIFx0XHRcdDxWaXN1YWxHcmFwaCBncmFwaD17dGhpcy5zdGF0ZS5ncmFwaH0gbGF5b3V0PXtncmFwaExheW91dH0gLz5cbiAgICBcdFx0PC9QYW5lbD5cblxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXHRjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoV3JhcHBlcigpXG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogdGhpcy5jb2xvckhhc2guaGV4KGRlZmluaXRpb25OYW1lKVxuXHRcdH07XG5cdH1cblxuXHRoYW5kbGVJbmxpbmVCbG9ja0RlZmluaXRpb24oc2NvcGUpIHtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShzY29wZS5uYW1lLnZhbHVlKVxuXHRcdHRoaXMud2Fsa0FzdChzY29wZS5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShzY29wZS5uYW1lLnZhbHVlLCBzY29wZS5uYW1lLnZhbHVlLCB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRpZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGNsYXNzOiBcIlwiLFxuXHRcdFx0X3NvdXJjZTogc2NvcGUuX3NvdXJjZVxuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMud2Fsa0FzdChibG9ja0RlZmluaXRpb24uYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShkZWZpbml0aW9uQm9keSkge1xuXHRcdGRlZmluaXRpb25Cb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gdGhpcyBpcyBkb2luZyB0b28gbXVjaCDigJMgYnJlYWsgaW50byBcIm5vdCByZWNvZ25pemVkXCIsIFwic3VjY2Vzc1wiIGFuZCBcImFtYmlndW91c1wiXG5cdGhhbmRsZUJsb2NrSW5zdGFuY2UoaW5zdGFuY2UpIHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJkYXJrZ3JleVwiLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdHdpZHRoOiAxMDAsXG5cblx0XHRcdF9zb3VyY2U6IGluc3RhbmNlLFxuXHRcdH07XG5cblx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhpbnN0YW5jZS5uYW1lLnZhbHVlKVxuXHRcdC8vIGNvbnNvbGUubG9nKGBNYXRjaGVkIGRlZmluaXRpb25zOmAsIGRlZmluaXRpb25zKTtcblxuXHRcdGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgbm9kZS5pc1VuZGVmaW5lZCA9IHRydWVcblxuICAgICAgICAgICAgdGhpcy5hZGRJc3N1ZSh7XG4gICAgICAgICAgICBcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBObyBwb3NzaWJsZSBtYXRjaGVzIGZvdW5kLmAsXG4gICAgICAgICAgICBcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuICAgICAgICAgICAgXHR0eXBlOiBcImVycm9yXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXTtcblx0XHRcdGlmIChkZWZpbml0aW9uKSB7XG5cdFx0XHRcdG5vZGUuY29sb3IgPSBkZWZpbml0aW9uLmNvbG9yO1xuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gUG9zc2libGUgbWF0Y2hlczogJHtkZWZpbml0aW9ucy5tYXAoZGVmID0+IGBcIiR7ZGVmLm5hbWV9XCJgKS5qb2luKFwiLCBcIil9LmAsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHR2YXIgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKTtcblx0XHRcdGNvbG9yLm9wYWNpdHkgPSAwLjE7XG5cdFx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKG5vZGUuaWQsIG5vZGUuY2xhc3MsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHtcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKX1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuICAgICAgICAgICAgc3R5bGU6IHtcImZpbGxcIjogbm9kZS5jb2xvcn0sXG4gICAgICAgICAgICB3aWR0aDogTWF0aC5tYXgoTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCksIDUpICogMTJcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdG1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhxdWVyeSkge1xuXHRcdHZhciBkZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmaW5pdGlvbnMpO1xuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IE1vbmllbC5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpO1xuXHRcdC8vY29uc29sZS5sb2coXCJGb3VuZCBrZXlzXCIsIGRlZmluaXRpb25LZXlzKTtcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pO1xuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnM7XG5cdH1cblxuXHRnZXRDb21wdXRhdGlvbmFsR3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguZ2V0R3JhcGgoKTtcblx0fVxuXG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2dnZXIuZ2V0SXNzdWVzKCk7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKTtcblx0fVxuXG5cdHN0YXRpYyBuYW1lUmVzb2x1dGlvbihwYXJ0aWFsLCBsaXN0KSB7XG5cdFx0bGV0IHNwbGl0UmVnZXggPSAvKD89WzAtOUEtWl0pLztcblx0ICAgIGxldCBwYXJ0aWFsQXJyYXkgPSBwYXJ0aWFsLnNwbGl0KHNwbGl0UmVnZXgpO1xuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSk7XG5cdCAgICB2YXIgcmVzdWx0ID0gbGlzdEFycmF5LmZpbHRlcihwb3NzaWJsZU1hdGNoID0+IE1vbmllbC5pc011bHRpUHJlZml4KHBhcnRpYWxBcnJheSwgcG9zc2libGVNYXRjaCkpO1xuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSk7XG5cdCAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0c3RhdGljIGlzTXVsdGlQcmVmaXgobmFtZSwgdGFyZ2V0KSB7XG5cdCAgICBpZiAobmFtZS5sZW5ndGggIT09IHRhcmdldC5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdCAgICB2YXIgaSA9IDA7XG5cdCAgICB3aGlsZShpIDwgbmFtZS5sZW5ndGggJiYgdGFyZ2V0W2ldLnN0YXJ0c1dpdGgobmFtZVtpXSkpIHsgaSArPSAxOyB9XG5cdCAgICByZXR1cm4gKGkgPT09IG5hbWUubGVuZ3RoKTsgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHRoYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpIHtcblx0XHRjb25zb2xlLndhcm4oXCJXaGF0IHRvIGRvIHdpdGggdGhpcyBBU1Qgbm9kZT9cIiwgbm9kZSk7XG5cdH1cblxuXHR3YWxrQXN0KG5vZGUpIHtcblx0XHRpZiAoIW5vZGUpIHsgY29uc29sZS5lcnJvcihcIk5vIG5vZGU/IVwiKTsgcmV0dXJuOyB9XG5cblx0XHRzd2l0Y2ggKG5vZGUudHlwZSkge1xuXHRcdFx0Y2FzZSBcIk5ldHdvcmtcIjogdGhpcy5oYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25Cb2R5XCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSW5saW5lQmxvY2tEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlSW5saW5lQmxvY2tEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0luc3RhbmNlXCI6IHRoaXMuaGFuZGxlQmxvY2tJbnN0YW5jZShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tMaXN0XCI6IHRoaXMuaGFuZGxlQmxvY2tMaXN0KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJZGVudGlmaWVyXCI6IHRoaXMuaGFuZGxlSWRlbnRpZmllcihub2RlKTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aGlzLmhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSk7XG5cdFx0fVxuXHR9XG59IiwiY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPGRpdiBpZD17dGhpcy5wcm9wcy5pZH0gY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICBcdHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgIDwvZGl2PjtcbiAgfVxufSIsImNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5jb25zdCBvaG0gPSByZXF1aXJlKFwib2htLWpzXCIpXG5cbmNsYXNzIFBhcnNlcntcblx0Y29udGVudHMgPSBudWxsXG5cdGdyYW1tYXIgPSBudWxsXG5cdFxuXHRldmFsT3BlcmF0aW9uID0ge1xuXHRcdE5ldHdvcms6IGZ1bmN0aW9uKGRlZmluaXRpb25zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIk5ldHdvcmtcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uOiBmdW5jdGlvbihfLCBsYXllck5hbWUsIHBhcmFtcywgYm9keSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZUJsb2NrRGVmaW5pdGlvbjogZnVuY3Rpb24obmFtZSwgXywgYm9keSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJbmxpbmVCbG9ja0RlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbmFtZS5ldmFsKCksXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0SW5saW5lQmxvY2tEZWZpbml0aW9uQm9keTogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHZhciBkZWZpbml0aW9ucyA9IGxpc3QuZXZhbCgpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zID8gZGVmaW5pdGlvbnMgOiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Q29ubmVjdGlvbkRlZmluaXRpb246IGZ1bmN0aW9uKGxpc3QpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIixcblx0XHRcdFx0bGlzdDogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrSW5zdGFuY2U6IGZ1bmN0aW9uKGlkLCBsYXllck5hbWUsIHBhcmFtcykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0luc3RhbmNlXCIsXG5cdFx0XHRcdG5hbWU6IGxheWVyTmFtZS5ldmFsKCksXG5cdFx0XHRcdGFsaWFzOiBpZC5ldmFsKClbMF0sXG5cdFx0XHRcdHBhcmFtZXRlcnM6IHBhcmFtcy5ldmFsKCksXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja05hbWU6IGZ1bmN0aW9uKGlkLCBfKSB7XG5cdFx0XHRyZXR1cm4gaWQuZXZhbCgpXG5cdFx0fSxcblx0XHRCbG9ja0xpc3Q6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcInR5cGVcIjogXCJCbG9ja0xpc3RcIixcblx0XHRcdFx0XCJsaXN0XCI6IGxpc3QuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb25QYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb25Cb2R5OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0dmFyIGRlZmluaXRpb25zID0gbGlzdC5ldmFsKClbMF0gXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zID8gZGVmaW5pdGlvbnMgOiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tJbnN0YW5jZVBhcmFtZXRlcnM6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdFBhcmFtZXRlcjogZnVuY3Rpb24obmFtZSwgXywgdmFsdWUpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiUGFyYW1ldGVyXCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUuZXZhbCgpLFxuXHRcdFx0XHR2YWx1ZTogdmFsdWUuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRWYWx1ZTogZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIlZhbHVlXCIsXG5cdFx0XHRcdHZhbHVlOiB2YWwuc291cmNlLmNvbnRlbnRzXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRWYWx1ZUxpc3Q6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdE5vbmVtcHR5TGlzdE9mOiBmdW5jdGlvbih4LCBfLCB4cykge1xuXHRcdFx0cmV0dXJuIFt4LmV2YWwoKV0uY29uY2F0KHhzLmV2YWwoKSlcblx0XHR9LFxuXHRcdEVtcHR5TGlzdE9mOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH0sXG5cdFx0YmxvY2tJZGVudGlmaWVyOiBmdW5jdGlvbihfLCBfXywgX19fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRibG9ja1R5cGU6IGZ1bmN0aW9uKF8sIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrVHlwZVwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRibG9ja05hbWU6IGZ1bmN0aW9uKF8sIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoXCJzcmMvbW9uaWVsLm9obVwiLCBcInV0ZjhcIilcblx0XHR0aGlzLmdyYW1tYXIgPSBvaG0uZ3JhbW1hcih0aGlzLmNvbnRlbnRzKVxuXHRcdHRoaXMuc2VtYW50aWNzID0gdGhpcy5ncmFtbWFyLmNyZWF0ZVNlbWFudGljcygpLmFkZE9wZXJhdGlvbihcImV2YWxcIiwgdGhpcy5ldmFsT3BlcmF0aW9uKVxuXHR9XG5cblx0bWFrZShzb3VyY2UpIHtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5ncmFtbWFyLm1hdGNoKHNvdXJjZSlcblxuXHRcdGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0XHRcdHZhciBhc3QgPSB0aGlzLnNlbWFudGljcyhyZXN1bHQpLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXN0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHBlY3RlZCxcblx0XHRcdFx0cG9zaXRpb25cblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSIsImNsYXNzIFB5VG9yY2hHZW5lcmF0b3Ige1xuICAgIHNhbml0aXplKGlkKSB7XG5cdFx0dmFyIHNhbml0aXplZElkID0gaWRcblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLy9nLCBcIl9cIilcblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLi9nLCBcIlwiKVxuXHRcdHJldHVybiBzYW5pdGl6ZWRJZFxuXHR9XG5cblx0Z2VuZXJhdGVDb2RlKGcpIHtcblx0XHQvLyByZXR1cm4gXCJcIlxuXHRcdGxldCBpbXBvcnRzID0gYGltcG9ydCB0b3JjaGBcblxuXHRcdGxldCB0b3BvbG9naWNhbE9yZGVyaW5nID0gZ3JhcGhsaWIuYWxnLnRvcHNvcnQoZylcblx0XHRjb25zb2xlLmxvZyh0b3BvbG9naWNhbE9yZGVyaW5nKVxuXG5cdFx0dmFyIGNvZGUgPSBcIlwiXG5cblx0XHR0b3BvbG9naWNhbE9yZGVyaW5nLm1hcChub2RlID0+IHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKFwibXVcIiwgbm9kZSlcblx0XHRcdGxldCBuID0gZy5ub2RlKG5vZGUpXG5cdFx0XHRsZXQgY2ggPSBnLmNoaWxkcmVuKG5vZGUpIFxuXHRcdFx0Y29uc29sZS5sb2cobilcblxuXHRcdFx0aWYgKGNoLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQvLyBjb25zb2xlLmxvZyhub2RlKVxuXHRcdFx0XHRsZXQgaW5Ob2RlcyA9IGcuaW5FZGdlcyhub2RlKS5tYXAoZSA9PiB0aGlzLnNhbml0aXplKGUudikpXG5cdFx0XHRcdGNvZGUgKz0gYCR7dGhpcy5zYW5pdGl6ZShub2RlKX0gPSAke24uY2xhc3N9KCR7aW5Ob2Rlcy5qb2luKFwiLCBcIil9KVxcbmBcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlmIChuLnVzZXJHZW5lcmF0ZWRJZCkge1xuXHRcdFx0XHRcdGNvZGUgKz0gYGRlZiAke24udXNlckdlbmVyYXRlZElkfSgpOlxcblxcdHBhc3NcXG5cXG5gXG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LCB0aGlzKVxuXHRcdHJldHVybiBpbXBvcnRzICsgXCJcXG5cIiArIGNvZGVcblx0fVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY2xhc3MgVmlzdWFsR3JhcGggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbnN0cnVjdG9yXCIpO1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsLFxuICAgICAgICAgICAgcHJldmlvdXNWaWV3Qm94OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzXCIsIG5leHRQcm9wcyk7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIG5leHRQcm9wcy5ncmFwaC5fbGFiZWwucmFua2RpciA9IG5leHRQcm9wcy5sYXlvdXQ7XG4gICAgICAgICAgICB0aGlzLmdyYXBoTGF5b3V0LmxheW91dChuZXh0UHJvcHMuZ3JhcGgsIHRoaXMuc2F2ZUdyYXBoLmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWRcIiwgbm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBub2RlLmlkXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGRvbU5vZGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpO1xuXG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3hfd2hvbGUgPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgdmFyIHZpZXdCb3hcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIHZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3Qm94ID0gdmlld0JveF93aG9sZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt2aWV3Qm94X3dob2xlfSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiPjwvYW5pbWF0ZT5cbiAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJ2ZWVcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgIDwvbWFya2VyPlxuICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgPGcgaWQ9XCJncmFwaFwiPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgIDwvc3ZnPjtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VQYXRoXCIgbWFya2VyRW5kPVwidXJsKCN2ZWUpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPXtgbm9kZSAke24uY2xhc3N9YH0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpfSBzdHlsZT17e3RyYW5zZm9ybTogYHRyYW5zbGF0ZSgke24ueCAtKG4ud2lkdGgvMil9cHgsJHtuLnkgLShuLmhlaWdodC8yKX1weClgfX0+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBNZXRhbm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNOb2RlIGV4dGVuZHMgTm9kZXtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT4gPC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
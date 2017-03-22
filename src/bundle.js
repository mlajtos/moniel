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
		_this.lock = null;


		_this.state = {
			"grammar": _this.parser.grammar,
			"semantics": _this.parser.semantics,
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
			var result = this.compileToAST(this.state.grammar, this.state.semantics, value);
			if (result.ast) {
				this.moniel.walkAst(result.ast);
				var graph = this.moniel.getComputationalGraph();
				this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					generatedCode: this.generateCode(graph),
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
			var _this3 = this;

			return "";
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
						return _this3.sanitize(e.v);
					});
					code += _this3.sanitize(node) + " = " + n.class + "(" + inNodes.join(", ") + ")\n";
				} else {
					if (n.userGeneratedId) {
						code += "def " + n.userGeneratedId + "():\n\tpass\n\n";
					}
				}
			}, this);
			return imports + "\n" + code;
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
			var _this4 = this;

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
							return _this4.editor = _ref;
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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var ohm = require("ohm-js");

var Parser = function Parser() {
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
};
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7Ozs7Ozs7Ozs7SUN6QkMsa0I7OztzQkFZTztBQUNY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RSxFQUFtRixPQUFPLEVBQUMsa0JBQWtCLGFBQW5CLEVBQTFGO0FBQ0k7QUFBQTtBQUFBLDBCQUFPLEdBQUUsR0FBVCxFQUFhLFdBQVUsSUFBdkI7QUFBNkIsMEJBQUU7QUFBL0IscUJBREo7QUFFSTtBQUFBO0FBQUEsMEJBQU8sR0FBRSxHQUFULEVBQWEsSUFBRyxPQUFoQjtBQUF5QiwwQkFBRTtBQUEzQjtBQUZKO0FBRkosYUFESjtBQVNIOzs7O0VBWndCLEk7OztBQ3RNN0IsU0FBUyxHQUFULEdBQWU7QUFDYixXQUFTLE1BQVQsQ0FBZ0Isb0JBQUMsR0FBRCxPQUFoQixFQUF3QixTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBeEI7QUFDRDs7QUFFRCxJQUFNLGVBQWUsQ0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixhQUF2QixDQUFyQjs7QUFFQSxJQUFJLGFBQWEsUUFBYixDQUFzQixTQUFTLFVBQS9CLEtBQThDLFNBQVMsSUFBM0QsRUFBaUU7QUFDL0Q7QUFDRCxDQUZELE1BRU87QUFDTCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbG9ySGFzaFdyYXBwZXJ7XG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjldLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICAgICAgaGFzaDogdGhpcy5tYWdpY1xuICAgIH0pXG5cbiAgICBsb3NlTG9zZShzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCArPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaFxuICAgIH1cblxuICAgIG1hZ2ljKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoID0gaGFzaCAqIDQ3ICsgc3RyLmNoYXJDb2RlQXQoaSkgJSAzMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaFxuICAgIH1cblxuICAgIGhleChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JIYXNoLmhleChzdHIpXG4gICAgfVxufSIsImNsYXNzIENvbXB1dGF0aW9uYWxHcmFwaHtcblx0ZGVmYXVsdEVkZ2UgPSB7fVxuXG5cdG5vZGVDb3VudGVyID0ge31cblx0X25vZGVTdGFjazIgPSB7fVxuXHRfcHJldmlvdXNOb2RlU3RhY2syID0gW11cblxuXHRzY29wZVN0YWNrID0gbmV3IFNjb3BlU3RhY2soKVxuXG5cdG1ldGFub2RlcyA9IHt9XG5cdG1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdGdldCBncmFwaCgpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbGFzdEluZGV4XTtcblx0fVxuXG5cdC8vIFxuXHRnZXQgbm9kZVN0YWNrMigpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZVN0YWNrMltsYXN0SW5kZXhdXG5cdH1cblxuXHRzZXQgbm9kZVN0YWNrMih2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX25vZGVTdGFjazJbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRnZXQgcHJldmlvdXNOb2RlU3RhY2syKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9wcmV2aW91c05vZGVTdGFjazJbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IHByZXZpb3VzTm9kZVN0YWNrMih2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrMltsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubW9uaWVsID0gcGFyZW50O1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLm5vZGVDb3VudGVyID0ge31cblx0XHR0aGlzLnNjb3BlU3RhY2suaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMuY2xlYXJOb2RlU3RhY2soKVxuXG5cdFx0dGhpcy5fbm9kZVN0YWNrMiA9IHt9XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2syID0ge31cblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZXM6XCIsIHRoaXMubWV0YW5vZGVzKVxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGUgU3RhY2s6XCIsIHRoaXMubWV0YW5vZGVTdGFjaylcblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5tZXRhbm9kZVN0YWNrKVxuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYFRvdWNoaW5nIG5vZGUgXCIke25vZGVQYXRofVwiLmApXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrMi5wdXNoKG5vZGVQYXRoKVxuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjazIubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZSh0aGlzLnByZXZpb3VzTm9kZVN0YWNrMlswXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2syLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2syLCBub2RlUGF0aClcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKGBUcnlpbmcgdG8gdG91Y2ggbm9uLWV4aXN0YW50IG5vZGUgXCIke25vZGVQYXRofVwiYCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmZXJlbmNlTm9kZShpZCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IGlkLFxuXHRcdFx0Y2xhc3M6IFwidW5kZWZpbmVkXCIsXG5cdFx0XHRoZWlnaHQ6IDUwXG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0d2lkdGg6IE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApICogMTBcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y3JlYXRlTm9kZShpZCwgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdGNvbnNvbGUud2FybihgUmVkaWZpbmluZyBub2RlIFwiJHtpZH1cImApO1x0XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoXG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHRyZXR1cm4gbm9kZVBhdGg7XG5cdH1cblxuXHRjcmVhdGVNZXRhbm9kZShpZGVudGlmaWVyLCBtZXRhbm9kZUNsYXNzLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcik7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZWRnZS52LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgZWRnZS53LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrMiA9IFtdO1xuXHRcdHRoaXMubm9kZVN0YWNrMiA9IFtdO1xuXHR9XG5cblx0ZnJlZXplTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2syID0gWy4uLnRoaXMubm9kZVN0YWNrMl07XG5cdFx0dGhpcy5ub2RlU3RhY2syID0gW107XG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCk7XG5cdH1cblxuXHRpc0lucHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIjtcblx0fVxuXG5cdGlzT3V0cHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiT3V0cHV0XCI7XG5cdH1cblxuXHRpc01ldGFub2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJpc01ldGFub2RlOlwiLCBub2RlUGF0aClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5pc01ldGFub2RlID09PSB0cnVlO1xuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IG91dHB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNPdXRwdXQobm9kZSkgfSk7XG5cblx0XHRpZiAob3V0cHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0Tm9kZXM7XG5cdH1cblxuXHRnZXRJbnB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBpbnB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKX0pO1xuXG5cdFx0aWYgKGlucHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgSW5wdXQgbm9kZXMuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXROb2Rlcztcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cdFx0dmFyIHNvdXJjZVBhdGhzXG5cblx0XHRpZiAodHlwZW9mIGZyb21QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IHRoaXMuZ2V0T3V0cHV0Tm9kZXMoZnJvbVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IFtmcm9tUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZnJvbVBhdGgpKSB7XG5cdFx0XHRzb3VyY2VQYXRocyA9IGZyb21QYXRoXG5cdFx0fVxuXG5cdFx0dmFyIHRhcmdldFBhdGhzXG5cblx0XHRpZiAodHlwZW9mIHRvUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gdGhpcy5nZXRJbnB1dE5vZGVzKHRvUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gW3RvUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9QYXRoKSkge1xuXHRcdFx0dGFyZ2V0UGF0aHMgPSB0b1BhdGhcblx0XHR9XG5cblx0XHR0aGlzLnNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cdH1cblxuXHRzZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKSB7XG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pO1x0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHRhcmdldFBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocy5mb3JFYWNoKHNvdXJjZVBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGgsIHRhcmdldFBhdGhzWzBdKSlcblx0XHRcdH0gZWxzZSBpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzLmZvckVhY2godGFyZ2V0UGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aHNbMF0sIHRhcmdldFBhdGgsKSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0bWVzc2FnZTogYE51bWJlciBvZiBub2RlcyBkb2VzIG5vdCBtYXRjaC4gWyR7c291cmNlUGF0aHMubGVuZ3RofV0gLT4gWyR7dGFyZ2V0UGF0aHMubGVuZ3RofV1gLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0Ly8gc3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRcdC8vIGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0aGFzTm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Z2V0R3JhcGgoKSB7XG5cdFx0Y29uc29sZS5sb2codGhpcy5ncmFwaClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5jb250YWlucyhjLnJvdywgYy5jb2x1bW4pKS5yZWR1Y2UoIChwcmV2LCBjdXJyKSA9PiBwcmV2IHx8IGN1cnIsIGZhbHNlKTtcblxuICAgICAgICBpZiAoY3Vyc29yT3Zlck1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSBDb2RlXCIsXG4gICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgICBzaG93R3V0dGVyOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5lZGl0b3IuY29udGFpbmVyLnN0eWxlLmxpbmVIZWlnaHQgPSAxLjc7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRvci5vbihcImNoYW5nZVwiLCB0aGlzLm9uQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLm9uKFwiY2hhbmdlQ3Vyc29yXCIsIHRoaXMub25DdXJzb3JQb3NpdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9ucyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJvdzogcG9zaXRpb24ucm93LFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW46IHBvc2l0aW9uLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNzdWUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXNzdWUudHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLnNldEFubm90YXRpb25zKGFubm90YXRpb25zKTtcbiAgICAgICAgICAgIC8vdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuXG4gICAgICAgICAgICB2YXIgUmFuZ2UgPSByZXF1aXJlKCdhY2UvcmFuZ2UnKS5SYW5nZTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXJrZXJzID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCksXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLmVuZClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSBuZXcgUmFuZ2UocG9zaXRpb24uc3RhcnQucm93LCBwb3NpdGlvbi5zdGFydC5jb2x1bW4sIHBvc2l0aW9uLmVuZC5yb3csIHBvc2l0aW9uLmVuZC5jb2x1bW4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrZXJzLnB1c2godGhpcy5lZGl0b3Iuc2Vzc2lvbi5hZGRNYXJrZXIocmFuZ2UsIFwibWFya2VyX2Vycm9yXCIsIFwidGV4dFwiKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uY2xlYXJBbm5vdGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRQcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUobmV4dFByb3BzLnZhbHVlLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IHJlZj17IChlbGVtZW50KSA9PiB0aGlzLmluaXQoZWxlbWVudCkgfT48L2Rpdj47XG4gICAgfVxufSIsImNsYXNzIEdyYXBoTGF5b3V0e1xuXHR3b3JrZXIgPSBuZXcgV29ya2VyKFwic3JjL3NjcmlwdHMvR3JhcGhMYXlvdXRXb3JrZXIuanNcIik7XG5cdGNhbGxiYWNrID0gZnVuY3Rpb24oKXt9XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgZW5jb2RlKGdyYXBoKSB7XG4gICAgXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaCkpO1xuICAgIH1cblxuICAgIGRlY29kZShqc29uKSB7XG4gICAgXHRyZXR1cm4gZ3JhcGhsaWIuanNvbi5yZWFkKEpTT04ucGFyc2UoanNvbikpO1xuICAgIH1cblxuICAgIGxheW91dChncmFwaCwgY2FsbGJhY2spIHtcbiAgICBcdC8vY29uc29sZS5sb2coXCJHcmFwaExheW91dC5sYXlvdXRcIiwgZ3JhcGgsIGNhbGxiYWNrKTtcbiAgICBcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICBcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICBcdFx0Z3JhcGg6IHRoaXMuZW5jb2RlKGdyYXBoKVxuICAgIFx0fSk7XG4gICAgfVxuXG4gICAgcmVjZWl2ZShkYXRhKSB7XG4gICAgXHR2YXIgZ3JhcGggPSB0aGlzLmRlY29kZShkYXRhLmRhdGEuZ3JhcGgpO1xuICAgIFx0dGhpcy5jYWxsYmFjayhncmFwaCk7XG4gICAgfVxufSIsImNvbnN0IGlwYyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKS5pcGNSZW5kZXJlclxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcblxuY2xhc3MgSURFIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXHRtb25pZWwgPSBuZXcgTW9uaWVsKClcblx0cGFyc2VyID0gbmV3IFBhcnNlcigpXG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHRcImdyYW1tYXJcIjogdGhpcy5wYXJzZXIuZ3JhbW1hcixcblx0XHRcdFwic2VtYW50aWNzXCI6IHRoaXMucGFyc2VyLnNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsLFxuXHRcdFx0XCJsYXlvdXRcIjogXCJjb2x1bW5zXCIsXG5cdFx0XHRcImdlbmVyYXRlZENvZGVcIjogXCJcIlxuXHRcdH07XG5cblx0XHRpcGMub24oJ3NhdmUnLCBmdW5jdGlvbihldmVudCwgbWVzc2FnZSkge1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLm1vblwiLCB0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9uLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UuYXN0Lmpzb25cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBzYXZlTm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignU2tldGNoIHNhdmVkJywge1xuICAgICAgICAgICAgXHRib2R5OiBgU2tldGNoIHdhcyBzdWNjZXNzZnVsbHkgc2F2ZWQgaW4gdGhlIFwic2tldGNoZXNcIiBmb2xkZXIuYCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG4gICAgICAgICAgICB9KVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRpcGMub24oXCJ0b2dnbGVMYXlvdXRcIiwgKGUsIG0pID0+IHtcblx0XHRcdHRoaXMudG9nZ2xlTGF5b3V0KClcblx0XHR9KTtcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHR0eXBlOiBcIndhcm5pbmdcIixcblx0XHRcdFx0XHRtZXNzYWdlOiBgVmFsdWUgZm9yIFwibGF5b3V0XCIgY2FuIGJlIG9ubHkgXCJjb2x1bW5zXCIgb3IgXCJyb3dzXCIuYFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblxuXHRcdC8vIHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIilcblx0fVxuXG5cdGxvYWRFeGFtcGxlKGlkKSB7XG5cdFx0bGV0IGZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jb21waWxlVG9BU1QodGhpcy5zdGF0ZS5ncmFtbWFyLCB0aGlzLnN0YXRlLnNlbWFudGljcywgdmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpO1xuXHRcdFx0dmFyIGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0Z2VuZXJhdGVkQ29kZTogdGhpcy5nZW5lcmF0ZUNvZGUoZ3JhcGgpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHR0b2dnbGVMYXlvdXQoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRsYXlvdXQ6ICh0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIpID8gXCJyb3dzXCIgOiBcImNvbHVtbnNcIlxuXHRcdH0pXG5cdH1cblxuXHRzYW5pdGl6ZShpZCkge1xuXHRcdHZhciBzYW5pdGl6ZWRJZCA9IGlkXG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpXG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC4vZywgXCJcIilcblx0XHRyZXR1cm4gc2FuaXRpemVkSWRcblx0fVxuXG5cdGdlbmVyYXRlQ29kZShnKSB7XG5cdFx0cmV0dXJuIFwiXCJcblx0XHRsZXQgaW1wb3J0cyA9IGBpbXBvcnQgdG9yY2hgXG5cblx0XHRsZXQgdG9wb2xvZ2ljYWxPcmRlcmluZyA9IGdyYXBobGliLmFsZy50b3Bzb3J0KGcpXG5cdFx0Y29uc29sZS5sb2codG9wb2xvZ2ljYWxPcmRlcmluZylcblxuXHRcdHZhciBjb2RlID0gXCJcIlxuXG5cdFx0dG9wb2xvZ2ljYWxPcmRlcmluZy5tYXAobm9kZSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcIm11XCIsIG5vZGUpXG5cdFx0XHRsZXQgbiA9IGcubm9kZShub2RlKVxuXHRcdFx0bGV0IGNoID0gZy5jaGlsZHJlbihub2RlKSBcblx0XHRcdGNvbnNvbGUubG9nKG4pXG5cblx0XHRcdGlmIChjaC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0Ly8gY29uc29sZS5sb2cobm9kZSlcblx0XHRcdFx0bGV0IGluTm9kZXMgPSBnLmluRWRnZXMobm9kZSkubWFwKGUgPT4gdGhpcy5zYW5pdGl6ZShlLnYpKVxuXHRcdFx0XHRjb2RlICs9IGAke3RoaXMuc2FuaXRpemUobm9kZSl9ID0gJHtuLmNsYXNzfSgke2luTm9kZXMuam9pbihcIiwgXCIpfSlcXG5gXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcblx0XHRcdFx0XHRjb2RlICs9IGBkZWYgJHtuLnVzZXJHZW5lcmF0ZWRJZH0oKTpcXG5cXHRwYXNzXFxuXFxuYFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSwgdGhpcylcblx0XHRyZXR1cm4gaW1wb3J0cyArIFwiXFxuXCIgKyBjb2RlXG5cdH1cblxuXHQvLyBpbnRvIE1vbmllbD8gb3IgUGFyc2VyXG5cdGNvbXBpbGVUb0FTVChncmFtbWFyLCBzZW1hbnRpY3MsIHNvdXJjZSkge1xuXHQgICAgdmFyIHJlc3VsdCA9IGdyYW1tYXIubWF0Y2goc291cmNlKTtcblxuXHQgICAgaWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHQgICAgICAgIHZhciBhc3QgPSBzZW1hbnRpY3MocmVzdWx0KS5ldmFsKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJhc3RcIjogYXN0XG5cdCAgICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgIFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHQgICAgICAgIHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKTtcblx0ICAgICAgICB2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJleHBlY3RlZFwiOiBleHBlY3RlZCxcblx0ICAgICAgICAgICAgXCJwb3NpdGlvblwiOiBwb3NpdGlvblxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY29udGFpbmVyTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXRcblx0XHRsZXQgZ3JhcGhMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIgPyBcIkJUXCIgOiBcIkxSXCJcblxuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzc05hbWU9e2Bjb250YWluZXIgJHtjb250YWluZXJMYXlvdXR9YH0+XG4gICAgXHRcdDxQYW5lbCBpZD1cImRlZmluaXRpb25cIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRyZWY9eyhyZWYpID0+IHRoaXMuZWRpdG9yID0gcmVmfVxuICAgIFx0XHRcdFx0bW9kZT1cIm1vbmllbFwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0aXNzdWVzPXt0aGlzLnN0YXRlLmlzc3Vlc31cbiAgICBcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0XHRcbiAgICBcdFx0PFBhbmVsIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgIFx0XHRcdDxWaXN1YWxHcmFwaCBncmFwaD17dGhpcy5zdGF0ZS5ncmFwaH0gbGF5b3V0PXtncmFwaExheW91dH0gLz5cbiAgICBcdFx0PC9QYW5lbD5cblxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIE1vbmllbHtcblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXHRjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoV3JhcHBlcigpXG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogdGhpcy5jb2xvckhhc2guaGV4KGRlZmluaXRpb25OYW1lKVxuXHRcdH07XG5cdH1cblxuXHRoYW5kbGVJbmxpbmVCbG9ja0RlZmluaXRpb24oc2NvcGUpIHtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShzY29wZS5uYW1lLnZhbHVlKVxuXHRcdHRoaXMud2Fsa0FzdChzY29wZS5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShzY29wZS5uYW1lLnZhbHVlLCBzY29wZS5uYW1lLnZhbHVlLCB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRpZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGNsYXNzOiBcIlwiLFxuXHRcdFx0X3NvdXJjZTogc2NvcGUuX3NvdXJjZVxuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMud2Fsa0FzdChibG9ja0RlZmluaXRpb24uYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShkZWZpbml0aW9uQm9keSkge1xuXHRcdGRlZmluaXRpb25Cb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gdGhpcyBpcyBkb2luZyB0b28gbXVjaCDigJMgYnJlYWsgaW50byBcIm5vdCByZWNvZ25pemVkXCIsIFwic3VjY2Vzc1wiIGFuZCBcImFtYmlndW91c1wiXG5cdGhhbmRsZUJsb2NrSW5zdGFuY2UoaW5zdGFuY2UpIHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJkYXJrZ3JleVwiLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdHdpZHRoOiAxMDAsXG5cblx0XHRcdF9zb3VyY2U6IGluc3RhbmNlLFxuXHRcdH07XG5cblx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhpbnN0YW5jZS5uYW1lLnZhbHVlKVxuXHRcdC8vIGNvbnNvbGUubG9nKGBNYXRjaGVkIGRlZmluaXRpb25zOmAsIGRlZmluaXRpb25zKTtcblxuXHRcdGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgbm9kZS5pc1VuZGVmaW5lZCA9IHRydWVcblxuICAgICAgICAgICAgdGhpcy5hZGRJc3N1ZSh7XG4gICAgICAgICAgICBcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBObyBwb3NzaWJsZSBtYXRjaGVzIGZvdW5kLmAsXG4gICAgICAgICAgICBcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuICAgICAgICAgICAgXHR0eXBlOiBcImVycm9yXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXTtcblx0XHRcdGlmIChkZWZpbml0aW9uKSB7XG5cdFx0XHRcdG5vZGUuY29sb3IgPSBkZWZpbml0aW9uLmNvbG9yO1xuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gUG9zc2libGUgbWF0Y2hlczogJHtkZWZpbml0aW9ucy5tYXAoZGVmID0+IGBcIiR7ZGVmLm5hbWV9XCJgKS5qb2luKFwiLCBcIil9LmAsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHR2YXIgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKTtcblx0XHRcdGNvbG9yLm9wYWNpdHkgPSAwLjE7XG5cdFx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKG5vZGUuaWQsIG5vZGUuY2xhc3MsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHtcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKX1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuICAgICAgICAgICAgc3R5bGU6IHtcImZpbGxcIjogbm9kZS5jb2xvcn0sXG4gICAgICAgICAgICB3aWR0aDogTWF0aC5tYXgoTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCksIDUpICogMTJcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdG1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhxdWVyeSkge1xuXHRcdHZhciBkZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmaW5pdGlvbnMpO1xuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IE1vbmllbC5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpO1xuXHRcdC8vY29uc29sZS5sb2coXCJGb3VuZCBrZXlzXCIsIGRlZmluaXRpb25LZXlzKTtcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pO1xuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnM7XG5cdH1cblxuXHRnZXRDb21wdXRhdGlvbmFsR3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguZ2V0R3JhcGgoKTtcblx0fVxuXG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5sb2dnZXIuZ2V0SXNzdWVzKCk7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKTtcblx0fVxuXG5cdHN0YXRpYyBuYW1lUmVzb2x1dGlvbihwYXJ0aWFsLCBsaXN0KSB7XG5cdFx0bGV0IHNwbGl0UmVnZXggPSAvKD89WzAtOUEtWl0pLztcblx0ICAgIGxldCBwYXJ0aWFsQXJyYXkgPSBwYXJ0aWFsLnNwbGl0KHNwbGl0UmVnZXgpO1xuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSk7XG5cdCAgICB2YXIgcmVzdWx0ID0gbGlzdEFycmF5LmZpbHRlcihwb3NzaWJsZU1hdGNoID0+IE1vbmllbC5pc011bHRpUHJlZml4KHBhcnRpYWxBcnJheSwgcG9zc2libGVNYXRjaCkpO1xuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSk7XG5cdCAgICByZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0c3RhdGljIGlzTXVsdGlQcmVmaXgobmFtZSwgdGFyZ2V0KSB7XG5cdCAgICBpZiAobmFtZS5sZW5ndGggIT09IHRhcmdldC5sZW5ndGgpIHsgcmV0dXJuIGZhbHNlOyB9XG5cdCAgICB2YXIgaSA9IDA7XG5cdCAgICB3aGlsZShpIDwgbmFtZS5sZW5ndGggJiYgdGFyZ2V0W2ldLnN0YXJ0c1dpdGgobmFtZVtpXSkpIHsgaSArPSAxOyB9XG5cdCAgICByZXR1cm4gKGkgPT09IG5hbWUubGVuZ3RoKTsgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHRoYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpIHtcblx0XHRjb25zb2xlLndhcm4oXCJXaGF0IHRvIGRvIHdpdGggdGhpcyBBU1Qgbm9kZT9cIiwgbm9kZSk7XG5cdH1cblxuXHR3YWxrQXN0KG5vZGUpIHtcblx0XHRpZiAoIW5vZGUpIHsgY29uc29sZS5lcnJvcihcIk5vIG5vZGU/IVwiKTsgcmV0dXJuOyB9XG5cblx0XHRzd2l0Y2ggKG5vZGUudHlwZSkge1xuXHRcdFx0Y2FzZSBcIk5ldHdvcmtcIjogdGhpcy5oYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25Cb2R5XCI6IHRoaXMuaGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSW5saW5lQmxvY2tEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlSW5saW5lQmxvY2tEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0luc3RhbmNlXCI6IHRoaXMuaGFuZGxlQmxvY2tJbnN0YW5jZShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tMaXN0XCI6IHRoaXMuaGFuZGxlQmxvY2tMaXN0KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJZGVudGlmaWVyXCI6IHRoaXMuaGFuZGxlSWRlbnRpZmllcihub2RlKTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aGlzLmhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSk7XG5cdFx0fVxuXHR9XG59IiwiY2xhc3MgUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gPGRpdiBpZD17dGhpcy5wcm9wcy5pZH0gY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICBcdHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgIDwvZGl2PjtcbiAgfVxufSIsImNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5jb25zdCBvaG0gPSByZXF1aXJlKFwib2htLWpzXCIpXG5cbmNsYXNzIFBhcnNlcntcblx0Y29udGVudHMgPSBudWxsXG5cdGdyYW1tYXIgPSBudWxsXG5cdFxuXHRldmFsT3BlcmF0aW9uID0ge1xuXHRcdE5ldHdvcms6IGZ1bmN0aW9uKGRlZmluaXRpb25zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIk5ldHdvcmtcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uOiBmdW5jdGlvbihfLCBsYXllck5hbWUsIHBhcmFtcywgYm9keSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZUJsb2NrRGVmaW5pdGlvbjogZnVuY3Rpb24obmFtZSwgXywgYm9keSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJbmxpbmVCbG9ja0RlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbmFtZS5ldmFsKCksXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0SW5saW5lQmxvY2tEZWZpbml0aW9uQm9keTogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHZhciBkZWZpbml0aW9ucyA9IGxpc3QuZXZhbCgpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zID8gZGVmaW5pdGlvbnMgOiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Q29ubmVjdGlvbkRlZmluaXRpb246IGZ1bmN0aW9uKGxpc3QpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIixcblx0XHRcdFx0bGlzdDogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrSW5zdGFuY2U6IGZ1bmN0aW9uKGlkLCBsYXllck5hbWUsIHBhcmFtcykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0luc3RhbmNlXCIsXG5cdFx0XHRcdG5hbWU6IGxheWVyTmFtZS5ldmFsKCksXG5cdFx0XHRcdGFsaWFzOiBpZC5ldmFsKClbMF0sXG5cdFx0XHRcdHBhcmFtZXRlcnM6IHBhcmFtcy5ldmFsKCksXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja05hbWU6IGZ1bmN0aW9uKGlkLCBfKSB7XG5cdFx0XHRyZXR1cm4gaWQuZXZhbCgpXG5cdFx0fSxcblx0XHRCbG9ja0xpc3Q6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcInR5cGVcIjogXCJCbG9ja0xpc3RcIixcblx0XHRcdFx0XCJsaXN0XCI6IGxpc3QuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb25QYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb25Cb2R5OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0dmFyIGRlZmluaXRpb25zID0gbGlzdC5ldmFsKClbMF0gXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zID8gZGVmaW5pdGlvbnMgOiBbXVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tJbnN0YW5jZVBhcmFtZXRlcnM6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdFBhcmFtZXRlcjogZnVuY3Rpb24obmFtZSwgXywgdmFsdWUpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiUGFyYW1ldGVyXCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUuZXZhbCgpLFxuXHRcdFx0XHR2YWx1ZTogdmFsdWUuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRWYWx1ZTogZnVuY3Rpb24odmFsKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIlZhbHVlXCIsXG5cdFx0XHRcdHZhbHVlOiB2YWwuc291cmNlLmNvbnRlbnRzXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRWYWx1ZUxpc3Q6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdE5vbmVtcHR5TGlzdE9mOiBmdW5jdGlvbih4LCBfLCB4cykge1xuXHRcdFx0cmV0dXJuIFt4LmV2YWwoKV0uY29uY2F0KHhzLmV2YWwoKSlcblx0XHR9LFxuXHRcdEVtcHR5TGlzdE9mOiBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBbXVxuXHRcdH0sXG5cdFx0YmxvY2tJZGVudGlmaWVyOiBmdW5jdGlvbihfLCBfXywgX19fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRibG9ja1R5cGU6IGZ1bmN0aW9uKF8sIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrVHlwZVwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRibG9ja05hbWU6IGZ1bmN0aW9uKF8sIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoXCJzcmMvbW9uaWVsLm9obVwiLCBcInV0ZjhcIilcblx0XHR0aGlzLmdyYW1tYXIgPSBvaG0uZ3JhbW1hcih0aGlzLmNvbnRlbnRzKVxuXHRcdHRoaXMuc2VtYW50aWNzID0gdGhpcy5ncmFtbWFyLmNyZWF0ZVNlbWFudGljcygpLmFkZE9wZXJhdGlvbihcImV2YWxcIiwgdGhpcy5ldmFsT3BlcmF0aW9uKVxuXHR9XG5cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJWaXN1YWxHcmFwaC5jb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmdyYXBoTGF5b3V0ID0gbmV3IEdyYXBoTGF5b3V0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbCxcbiAgICAgICAgICAgIHByZXZpb3VzVmlld0JveDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSBudWxsXG4gICAgfVxuXG4gICAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wc1wiLCBuZXh0UHJvcHMpO1xuICAgICAgICBpZiAobmV4dFByb3BzLmdyYXBoKSB7XG4gICAgICAgICAgICBuZXh0UHJvcHMuZ3JhcGguX2xhYmVsLnJhbmtkaXIgPSBuZXh0UHJvcHMubGF5b3V0O1xuICAgICAgICAgICAgdGhpcy5ncmFwaExheW91dC5sYXlvdXQobmV4dFByb3BzLmdyYXBoLCB0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKTtcblxuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGcgPSB0aGlzLnN0YXRlLmdyYXBoO1xuXG4gICAgICAgIGxldCBub2RlcyA9IGcubm9kZXMoKS5tYXAobm9kZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGdyYXBoID0gdGhpcztcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogZ3JhcGguaGFuZGxlQ2xpY2suYmluZChncmFwaClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG4uaXNNZXRhbm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSA8TWV0YW5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG4udXNlckdlbmVyYXRlZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8SWRlbnRpZmllZE5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPEFub255bW91c05vZGUgey4uLnByb3BzfSAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoZWRnZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGUgPSBnLmVkZ2UoZWRnZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGdlIGtleT17YCR7ZWRnZU5hbWUudn0tPiR7ZWRnZU5hbWUud31gfSBlZGdlPXtlfS8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2aWV3Qm94X3dob2xlID0gYDAgMCAke2cuZ3JhcGgoKS53aWR0aH0gJHtnLmdyYXBoKCkuaGVpZ2h0fWA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHRyYW5zbGF0ZSgwcHgsMHB4KWAgKyBgc2NhbGUoJHtnLmdyYXBoKCkud2lkdGggLyBnLmdyYXBoKCkud2lkdGh9LCR7Zy5ncmFwaCgpLmhlaWdodCAvIGcuZ3JhcGgoKS5oZWlnaHR9KWA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHZhciB2aWV3Qm94XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICB2aWV3Qm94ID0gYCR7bi54IC0gbi53aWR0aCAvIDJ9ICR7bi55IC0gbi5oZWlnaHQgLyAyfSAke24ud2lkdGh9ICR7bi5oZWlnaHR9YFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld0JveCA9IHZpZXdCb3hfd2hvbGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiA8c3ZnIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50LmJpbmQodGhpcyl9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgZnJvbT17dmlld0JveF93aG9sZX0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICA8bWFya2VyIGlkPVwidmVlXCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIj5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgIHtub2Rlc31cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICB7ZWRnZXN9XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICA8L3N2Zz47XG4gICAgfVxufVxuXG5jbGFzcyBFZGdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGxpbmUgPSBkMy5saW5lKClcbiAgICAgICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAueShkID0+IGQueSlcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiBbXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogdGhpcy5wcm9wcy5lZGdlLnBvaW50c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxpbmU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9XCJlZGdlUGF0aFwiIG1hcmtlckVuZD1cInVybCgjdmVlKVwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50fSBrZXk9e01hdGgucmFuZG9tKCl9IHJlc3RhcnQ9XCJhbHdheXNcIiBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfSB0bz17bChlLnBvaW50cyl9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIiBhdHRyaWJ1dGVOYW1lPVwiZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YG5vZGUgJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gc3R5bGU9e3t0cmFuc2Zvcm06IGB0cmFuc2xhdGUoJHtuLnggLShuLndpZHRoLzIpfXB4LCR7bi55IC0obi5oZWlnaHQvMil9cHgpYH19PlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfT48L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgQW5vbnltb3VzTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+IDwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIElkZW50aWZpZWROb2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufSIsImZ1bmN0aW9uIHJ1bigpIHtcbiAgUmVhY3RET00ucmVuZGVyKDxJREUvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vbmllbCcpKTtcbn1cblxuY29uc3QgbG9hZGVkU3RhdGVzID0gWydjb21wbGV0ZScsICdsb2FkZWQnLCAnaW50ZXJhY3RpdmUnXTtcblxuaWYgKGxvYWRlZFN0YXRlcy5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gIHJ1bigpO1xufSBlbHNlIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW4sIGZhbHNlKTtcbn0iXX0=
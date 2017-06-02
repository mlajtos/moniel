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
	}, {
		key: "getMetanodes",
		value: function getMetanodes() {
			return this.metanodes;
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

		_this.parser = new Parser();
		_this.moniel = new Moniel();
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
			fs.writeFile(message.folder + "/graph.svg", document.querySelector("svg").outerHTML, function (err) {
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
				var definitions = this.moniel.getMetanodesDefinitions();
				console.log(definitions);

				this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					generatedCode: this.generator.generateCode(graph, definitions),
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

// rename this to something suitable
var Moniel = function () {

	// too soon, should be in VisualGraph

	// maybe singleton?
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
			var defaultDefinitions = ["Add", "Linear", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Deconvolution", "AveragePooling", "AdaptiveAveragePooling", "AdaptiveMaxPooling", "MaxUnpooling", "ParametricRectifiedLinearUnit", "LeakyRectifiedLinearUnit", "RandomizedRectifiedLinearUnit", "LogSigmoid", "Threshold", "HardTanh", "TanhShrink", "HardShrink", "LogSoftMax", "SoftShrink", "SoftMax", "SoftMin", "SoftPlus", "SoftSign", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
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
		key: "getMetanodesDefinitions",
		value: function getMetanodesDefinitions() {
			return this.graph.getMetanodes();
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

		this.builtins = ["ArithmeticError", "AssertionError", "AttributeError", "BaseException", "BlockingIOError", "BrokenPipeError", "BufferError", "BytesWarning", "ChildProcessError", "ConnectionAbortedError", "ConnectionError", "ConnectionRefusedError", "ConnectionResetError", "DeprecationWarning", "EOFError", "Ellipsis", "EnvironmentError", "Exception", "False", "FileExistsError", "FileNotFoundError", "FloatingPointError", "FutureWarning", "GeneratorExit", "IOError", "ImportError", "ImportWarning", "IndentationError", "IndexError", "InterruptedError", "IsADirectoryError", "KeyError", "KeyboardInterrupt", "LookupError", "MemoryError", "ModuleNotFoundError", "NameError", "None", "NotADirectoryError", "NotImplemented", "NotImplementedError", "OSError", "OverflowError", "PendingDeprecationWarning", "PermissionError", "ProcessLookupError", "RecursionError", "ReferenceError", "ResourceWarning", "RuntimeError", "RuntimeWarning", "StopAsyncIteration", "StopIteration", "SyntaxError", "SyntaxWarning", "SystemError", "SystemExit", "TabError", "TimeoutError", "True", "TypeError", "UnboundLocalError", "UnicodeDecodeError", "UnicodeEncodeError", "UnicodeError", "UnicodeTranslateError", "UnicodeWarning", "UserWarning", "ValueError", "Warning", "ZeroDivisionError", "__build_class__", "__debug__", "__doc__", "__import__", "__loader__", "__name__", "__package__", "__spec__", "abs", "all", "any", "ascii", "bin", "bool", "bytearray", "bytes", "callable", "chr", "classmethod", "compile", "complex", "copyright", "credits", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "exec", "exit", "filter", "float", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass", "iter", "len", "license", "list", "locals", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "quit", "range", "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "vars", "zip"];
		this.keywords = ["and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "exec", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "not", "or", "pass", "print", "raise", "return", "try", "while", "with", "yield"];
	}

	_createClass(PyTorchGenerator, [{
		key: "sanitize",
		value: function sanitize(id) {
			var sanitizedId = id;
			if (this.builtins.includes(sanitizedId) || this.keywords.includes(sanitizedId)) {
				sanitizedId = "_" + sanitizedId;
			}
			sanitizedId = sanitizedId.replace(/\./g, "this");
			sanitizedId = sanitizedId.replace(/\//g, ".");
			return sanitizedId;
		}
	}, {
		key: "mapToFunction",
		value: function mapToFunction(nodeType) {
			var translationTable = {
				"Convolution": "F.conv2d",
				"Deconvolution": "F.conv_transpose2d",
				"AveragePooling": "F.avg_pool2d",
				"AdaptiveAveragePooling": "F.adaptive_avg_pool2d",
				"MaxPooling": "F.max_pool2d",
				"AdaptiveMaxPooling": "F.adaptive_max_pool2d",
				"MaxUnpooling": "F.max_unpool2d",
				"RectifiedLinearUnit": "F.relu",
				"ExponentialLinearUnit": "F.elu",
				"ParametricRectifiedLinearUnit": "F.prelu",
				"LeakyRectifiedLinearUnit": "F.leaky_relu",
				"RandomizedRectifiedLinearUnit": "F.rrelu",
				"Sigmoid": "F.sigmoid",
				"LogSigmoid": "F.logsigmoid",
				"Threshold": "F.threshold",
				"HardTanh": "F.hardtanh",
				"Tanh": "F.tanh",
				"TanhShrink": "F.tanhshrink",
				"HardShrink": "F.hardshrink",
				"LogSoftMax": "F.log_softmax",
				"SoftShrink": "F.softshrink",
				"SoftMax": "F.softmax",
				"SoftMin": "F.softmin",
				"SoftPlus": "F.softplus",
				"SoftSign": "F.softsign",
				"BatchNormalization": "F.batch_norm",
				"Linear": "F.linear",
				"Dropout": "F.dropout",
				"PairwiseDistance": "F.pairwise_distance",
				"CrossEntropy": "F.cross_entropy",
				"BinaryCrossEntropy": "F.binary_cross_entropy",
				"KullbackLeiblerDivergenceLoss": "F.kl_div",
				"Pad": "F.pad",
				"Variable": "AG.Variable",
				"RandomNormal": "T.randn"
			};

			return translationTable.hasOwnProperty(nodeType) ? translationTable[nodeType] : nodeType;
		}
	}, {
		key: "indent",
		value: function indent(code) {
			var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
			var indentPerLevel = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "    ";

			var indent = indentPerLevel.repeat(level);
			return code.split("\n").map(function (line) {
				return indent + line;
			}).join("\n");
		}
	}, {
		key: "generateCode",
		value: function generateCode(graph, definitions) {
			var _this = this;

			var imports = "import torch as T\nimport torch.nn.functional as F\nimport torch.autograd as AG";

			var moduleDefinitions = Object.keys(definitions).map(function (definitionName) {
				if (definitionName !== "main") {
					return _this.generateCodeForModule(definitionName, definitions[definitionName]);
				} else {
					//return ""
				}
			});

			var code = imports + "\n\n" + moduleDefinitions.join("\n") + "\n";

			return code;
		}
	}, {
		key: "generateCodeForModule",
		value: function generateCodeForModule(classname, graph) {
			var _this2 = this;

			var topologicalOrdering = graphlib.alg.topsort(graph);
			var forwardFunction = "";

			topologicalOrdering.map(function (node) {
				// console.log("mu", node)
				var n = graph.node(node);
				var ch = graph.children(node);

				if (!n) {
					return;
				}
				// console.log(n)

				if (ch.length === 0) {
					var inNodes = graph.inEdges(node).map(function (e) {
						return _this2.sanitize(e.v);
					});
					forwardFunction += _this2.sanitize(node) + " = " + _this2.mapToFunction(n.class) + "(" + inNodes.join(", ") + ")\n";
				}
			}, this);

			var moduleCode = "class " + classname + "(T.nn.Module):\n    def __init__(self, param1, param2): # parameters here\n        super(" + classname + ", self).__init__()\n        # all declarations here\n\n    def forward(self, in1, in2): # all Inputs here\n        # all functional stuff here\n" + this.indent(forwardFunction, 2) + "\n        return (out1, out2) # all Outputs here\n";
			return moduleCode;
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
                { id: "visualization", xmlns: "http://www.w3.org/2000/svg", version: "1.1" },
                React.createElement(
                    "style",
                    null,
                    fs.readFileSync("src/style.css", "utf-8", function (err) {
                        console.log(err);
                    })
                ),
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
                { className: "node " + n.class, onClick: this.handleClick.bind(this), style: { transform: "translate(" + Math.floor(n.x - n.width / 2) + "px," + Math.floor(n.y - n.height / 2) + "px)" } },
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9QeVRvcmNoR2VuZXJhdG9yLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7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LEVBQTRELE9BQU8sRUFBRSxLQUFyRSxHQURKO0FBRUk7QUFBQTtBQUFBLHNCQUFNLDBCQUF5QixFQUFFLEtBQUYsR0FBUSxDQUFqQyxTQUF5QyxFQUFFLE1BQUYsR0FBUyxDQUFsRCxNQUFOLEVBQStELFlBQVcsUUFBMUUsRUFBbUYsT0FBTyxFQUFDLGtCQUFrQixhQUFuQixFQUExRjtBQUNJO0FBQUE7QUFBQSwwQkFBTyxHQUFFLEdBQVQsRUFBYSxXQUFVLElBQXZCO0FBQTZCLDBCQUFFO0FBQS9CLHFCQURKO0FBRUk7QUFBQTtBQUFBLDBCQUFPLEdBQUUsR0FBVCxFQUFhLElBQUcsT0FBaEI7QUFBeUIsMEJBQUU7QUFBM0I7QUFGSjtBQUZKLGFBREo7QUFTSDs7OztFQVp3QixJOzs7QUM3TTdCLFNBQVMsR0FBVCxHQUFlO0FBQ2IsV0FBUyxNQUFULENBQWdCLG9CQUFDLEdBQUQsT0FBaEIsRUFBd0IsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQXhCO0FBQ0Q7O0FBRUQsSUFBTSxlQUFlLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsYUFBdkIsQ0FBckI7O0FBRUEsSUFBSSxhQUFhLFFBQWIsQ0FBc0IsU0FBUyxVQUEvQixLQUE4QyxTQUFTLElBQTNELEVBQWlFO0FBQy9EO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsU0FBTyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb2xvckhhc2hXcmFwcGVye1xuICAgIGNvbG9ySGFzaCA9IG5ldyBDb2xvckhhc2goe1xuICAgICAgICBzYXR1cmF0aW9uOiBbMC45XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgICAgIGhhc2g6IHRoaXMubWFnaWNcbiAgICB9KVxuXG4gICAgbG9zZUxvc2Uoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggKz0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBtYWdpYyhzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCA9IGhhc2ggKiA0NyArIHN0ci5jaGFyQ29kZUF0KGkpICUgMzI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBoZXgoc3RyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9ySGFzaC5oZXgoc3RyKVxuICAgIH1cbn0iLCJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdGRlZmF1bHRFZGdlID0ge31cblxuXHRub2RlQ291bnRlciA9IHt9XG5cdF9ub2RlU3RhY2syID0ge31cblx0X3ByZXZpb3VzTm9kZVN0YWNrMiA9IFtdXG5cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHQvLyBcblx0Z2V0IG5vZGVTdGFjazIoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX25vZGVTdGFjazJbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IG5vZGVTdGFjazIodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9ub2RlU3RhY2syW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Z2V0IHByZXZpb3VzTm9kZVN0YWNrMigpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fcHJldmlvdXNOb2RlU3RhY2syW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBwcmV2aW91c05vZGVTdGFjazIodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9wcmV2aW91c05vZGVTdGFjazJbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmNsZWFyTm9kZVN0YWNrKClcblxuXHRcdHRoaXMuX25vZGVTdGFjazIgPSB7fVxuXHRcdHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrMiA9IHt9XG5cblx0XHR0aGlzLm1ldGFub2RlcyA9IHt9XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrID0gW11cblxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGVzOlwiLCB0aGlzLm1ldGFub2Rlcylcblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlIFN0YWNrOlwiLCB0aGlzLm1ldGFub2RlU3RhY2spXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubWV0YW5vZGVTdGFjaylcblxuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tuYW1lXTtcblx0fVxuXG5cdGV4aXRNZXRhbm9kZVNjb3BlKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2RlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRnZW5lcmF0ZUluc3RhbmNlSWQodHlwZSkge1xuXHRcdGlmICghdGhpcy5ub2RlQ291bnRlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHRcdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSA9IDA7XG5cdFx0fVxuXHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gKz0gMTtcblx0XHRsZXQgaWQgPSBcImFfXCIgKyB0eXBlICsgdGhpcy5ub2RlQ291bnRlclt0eXBlXTtcblx0XHRyZXR1cm4gaWQ7XG5cdH1cblxuXHRhZGRNYWluKCkge1xuXHRcdHRoaXMuZW50ZXJNZXRhbm9kZVNjb3BlKFwibWFpblwiKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGBUb3VjaGluZyBub2RlIFwiJHtub2RlUGF0aH1cIi5gKVxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjazIucHVzaChub2RlUGF0aClcblxuXHRcdFx0aWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2syLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjazJbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrMi5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZSh0aGlzLnByZXZpb3VzTm9kZVN0YWNrMiwgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgVHJ5aW5nIHRvIHRvdWNoIG5vbi1leGlzdGFudCBub2RlIFwiJHtub2RlUGF0aH1cImApO1xuXHRcdH1cblx0fVxuXG5cdHJlZmVyZW5jZU5vZGUoaWQpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBpZCxcblx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0aGVpZ2h0OiA1MFxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHdpZHRoOiBNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSAqIDEwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGlmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aFxuXHRcdH0pO1xuXHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0cmV0dXJuIG5vZGVQYXRoO1xuXHR9XG5cblx0Y3JlYXRlTWV0YW5vZGUoaWRlbnRpZmllciwgbWV0YW5vZGVDbGFzcywgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdGxldCB0YXJnZXRNZXRhbm9kZSA9IHRoaXMubWV0YW5vZGVzW21ldGFub2RlQ2xhc3NdO1xuXHRcdHRhcmdldE1ldGFub2RlLm5vZGVzKCkuZm9yRWFjaChub2RlSWQgPT4ge1xuXHRcdFx0bGV0IG5vZGUgPSB0YXJnZXRNZXRhbm9kZS5ub2RlKG5vZGVJZCk7XG5cdFx0XHRpZiAoIW5vZGUpIHsgcmV0dXJuIH1cblx0XHRcdGxldCBuZXdOb2RlSWQgPSBub2RlSWQucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dmFyIG5ld05vZGUgPSB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdGlkOiBuZXdOb2RlSWRcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShuZXdOb2RlSWQsIG5ld05vZGUpO1xuXG5cdFx0XHRsZXQgbmV3UGFyZW50ID0gdGFyZ2V0TWV0YW5vZGUucGFyZW50KG5vZGVJZCkucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobmV3Tm9kZUlkLCBuZXdQYXJlbnQpO1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0TWV0YW5vZGUuZWRnZXMoKS5mb3JFYWNoKGVkZ2UgPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGVkZ2Uudi5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIGVkZ2Uudy5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIHRhcmdldE1ldGFub2RlLmVkZ2UoZWRnZSkpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Y2xlYXJOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjazIgPSBbXTtcblx0XHR0aGlzLm5vZGVTdGFjazIgPSBbXTtcblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrMiA9IFsuLi50aGlzLm5vZGVTdGFjazJdO1xuXHRcdHRoaXMubm9kZVN0YWNrMiA9IFtdO1xuXHR9XG5cblx0c2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLnNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpO1xuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIklucHV0XCI7XG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiO1xuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiaXNNZXRhbm9kZTpcIiwgbm9kZVBhdGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZTtcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBvdXRwdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXG5cdFx0aWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1x0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dE5vZGVzO1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzSW5wdXQobm9kZSl9KTtcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IElucHV0IG5vZGVzLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXM7XG5cdH1cblxuXHRzZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYENyZWF0aW5nIGVkZ2UgZnJvbSBcIiR7ZnJvbVBhdGh9XCIgdG8gXCIke3RvUGF0aH1cIi5gKVxuXHRcdHZhciBzb3VyY2VQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiBmcm9tUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZShmcm9tUGF0aCkpIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSB0aGlzLmdldE91dHB1dE5vZGVzKGZyb21QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSBbZnJvbVBhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZyb21QYXRoKSkge1xuXHRcdFx0c291cmNlUGF0aHMgPSBmcm9tUGF0aFxuXHRcdH1cblxuXHRcdHZhciB0YXJnZXRQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiB0b1BhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IHRoaXMuZ2V0SW5wdXROb2Rlcyh0b1BhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IFt0b1BhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRvUGF0aCkpIHtcblx0XHRcdHRhcmdldFBhdGhzID0gdG9QYXRoXG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKVxuXHR9XG5cblx0c2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocykge1xuXG5cdFx0aWYgKHNvdXJjZVBhdGhzID09PSBudWxsIHx8IHRhcmdldFBhdGhzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSB0YXJnZXRQYXRocy5sZW5ndGgpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlUGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHNvdXJjZVBhdGhzW2ldICYmIHRhcmdldFBhdGhzW2ldKSB7XG5cdFx0XHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKHNvdXJjZVBhdGhzW2ldLCB0YXJnZXRQYXRoc1tpXSwgey4uLnRoaXMuZGVmYXVsdEVkZ2V9KTtcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YXJnZXRQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0c291cmNlUGF0aHMuZm9yRWFjaChzb3VyY2VQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoLCB0YXJnZXRQYXRoc1swXSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IGBOdW1iZXIgb2Ygbm9kZXMgZG9lcyBub3QgbWF0Y2guIFske3NvdXJjZVBhdGhzLmxlbmd0aH1dIC0+IFske3RhcmdldFBhdGhzLmxlbmd0aH1dYCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdC8vIHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0XHQvLyBlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdGNvbnNvbGUubG9nKHRoaXMuZ3JhcGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzXG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcnMoKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5tYXAobWFya2VyID0+IHRoaXMuZWRpdG9yLnNlc3Npb24ucmVtb3ZlTWFya2VyKG1hcmtlcikpO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkN1cnNvclBvc2l0aW9uQ2hhbmdlZChldmVudCwgc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCBtID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGxldCBjID0gc2VsZWN0aW9uLmdldEN1cnNvcigpO1xuICAgICAgICBsZXQgbWFya2VycyA9IHRoaXMubWFya2Vycy5tYXAoaWQgPT4gbVtpZF0pO1xuICAgICAgICBsZXQgY3Vyc29yT3Zlck1hcmtlciA9IG1hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIucmFuZ2UuY29udGFpbnMoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0d29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpO1xuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGVuY29kZShncmFwaCkge1xuICAgIFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KGdyYXBobGliLmpzb24ud3JpdGUoZ3JhcGgpKTtcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuICAgIFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChKU09OLnBhcnNlKGpzb24pKTtcbiAgICB9XG5cbiAgICBsYXlvdXQoZ3JhcGgsIGNhbGxiYWNrKSB7XG4gICAgXHQvL2NvbnNvbGUubG9nKFwiR3JhcGhMYXlvdXQubGF5b3V0XCIsIGdyYXBoLCBjYWxsYmFjayk7XG4gICAgXHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgXHR0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgXHRcdGdyYXBoOiB0aGlzLmVuY29kZShncmFwaClcbiAgICBcdH0pO1xuICAgIH1cblxuICAgIHJlY2VpdmUoZGF0YSkge1xuICAgIFx0dmFyIGdyYXBoID0gdGhpcy5kZWNvZGUoZGF0YS5kYXRhLmdyYXBoKTtcbiAgICBcdHRoaXMuY2FsbGJhY2soZ3JhcGgpO1xuICAgIH1cbn0iLCJjb25zdCBpcGMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIikuaXBjUmVuZGVyZXJcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5cbmNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0cGFyc2VyID0gbmV3IFBhcnNlcigpXG5cdG1vbmllbCA9IG5ldyBNb25pZWwoKVxuXHRnZW5lcmF0b3IgPSBuZXcgUHlUb3JjaEdlbmVyYXRvcigpXG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHQvLyB0aGVzZSBhcmUgbm8gbG9uZ2VyIG5lZWRlZCBoZXJlXG5cdFx0XHQvLyBcImdyYW1tYXJcIjogdGhpcy5wYXJzZXIuZ3JhbW1hcixcblx0XHRcdC8vIFwic2VtYW50aWNzXCI6IHRoaXMucGFyc2VyLnNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsLFxuXHRcdFx0XCJsYXlvdXRcIjogXCJjb2x1bW5zXCIsXG5cdFx0XHRcImdlbmVyYXRlZENvZGVcIjogXCJcIlxuXHRcdH07XG5cblx0XHRpcGMub24oJ3NhdmUnLCBmdW5jdGlvbihldmVudCwgbWVzc2FnZSkge1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLm1vblwiLCB0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9uLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UuYXN0Lmpzb25cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9ncmFwaC5zdmdcIiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN2Z1wiKS5vdXRlckhUTUwsIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IHNhdmVOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdTa2V0Y2ggc2F2ZWQnLCB7XG4gICAgICAgICAgICBcdGJvZHk6IGBTa2V0Y2ggd2FzIHN1Y2Nlc3NmdWxseSBzYXZlZCBpbiB0aGUgXCJza2V0Y2hlc1wiIGZvbGRlci5gLFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgIH0pXG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGlwYy5vbihcInRvZ2dsZUxheW91dFwiLCAoZSwgbSkgPT4ge1xuXHRcdFx0dGhpcy50b2dnbGVMYXlvdXQoKVxuXHRcdH0pO1xuXG5cdFx0bGV0IGxheW91dCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImxheW91dFwiKVxuXHRcdGlmIChsYXlvdXQpIHtcblx0XHRcdGlmIChsYXlvdXQgPT0gXCJjb2x1bW5zXCIgfHwgbGF5b3V0ID09IFwicm93c1wiKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUubGF5b3V0ID0gbGF5b3V0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHRsZXQgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYC4vZXhhbXBsZXMvJHtpZH0ubW9uYCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpXG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcnNlci5tYWtlKHZhbHVlKVxuXG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMubW9uaWVsLmdldENvbXB1dGF0aW9uYWxHcmFwaCgpXG5cdFx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1vbmllbC5nZXRNZXRhbm9kZXNEZWZpbml0aW9ucygpXG5cdFx0XHRjb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHR0b2dnbGVMYXlvdXQoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRsYXlvdXQ6ICh0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIpID8gXCJyb3dzXCIgOiBcImNvbHVtbnNcIlxuXHRcdH0pXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiY2xhc3MgTG9nZ2Vye1xuXHRpc3N1ZXMgPSBbXVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuaXNzdWVzID0gW107XG5cdH1cblx0XG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5pc3N1ZXM7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHZhciBmID0gbnVsbDtcblx0XHRzd2l0Y2goaXNzdWUudHlwZSkge1xuXHRcdFx0Y2FzZSBcImVycm9yXCI6IGYgPSBjb25zb2xlLmVycm9yOyBicmVhaztcblx0XHRcdGNhc2UgXCJ3YXJuaW5nXCI6IGYgPSBjb25zb2xlLndhcm47IGJyZWFrO1xuXHRcdFx0Y2FzZSBcImluZm9cIjogZiA9IGNvbnNvbGUuaW5mbzsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiBmID0gY29uc29sZS5sb2c7IGJyZWFrO1xuXHRcdH1cblx0XHRmKGlzc3VlLm1lc3NhZ2UpO1xuXHRcdHRoaXMuaXNzdWVzLnB1c2goaXNzdWUpO1xuXHR9XG59IiwiLy8gcmVuYW1lIHRoaXMgdG8gc29tZXRoaW5nIHN1aXRhYmxlXG5jbGFzcyBNb25pZWx7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0fVxuXG5cdGFkZERlZmF1bHREZWZpbml0aW9ucygpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBkZWZhdWx0IGRlZmluaXRpb25zLmApO1xuXHRcdGNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcIkFkZFwiLCBcIkxpbmVhclwiLCBcIklucHV0XCIsIFwiT3V0cHV0XCIsIFwiUGxhY2Vob2xkZXJcIiwgXCJWYXJpYWJsZVwiLCBcIkNvbnN0YW50XCIsIFwiTXVsdGlwbHlcIiwgXCJDb252b2x1dGlvblwiLCBcIkRlbnNlXCIsIFwiTWF4UG9vbGluZ1wiLCBcIkJhdGNoTm9ybWFsaXphdGlvblwiLCBcIkRlY29udm9sdXRpb25cIiwgXCJBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlQXZlcmFnZVBvb2xpbmdcIiwgXCJBZGFwdGl2ZU1heFBvb2xpbmdcIiwgXCJNYXhVbnBvb2xpbmdcIiwgXCJQYXJhbWV0cmljUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxlYWt5UmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIlJhbmRvbWl6ZWRSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiTG9nU2lnbW9pZFwiLCBcIlRocmVzaG9sZFwiLCBcIkhhcmRUYW5oXCIsIFwiVGFuaFNocmlua1wiLCBcIkhhcmRTaHJpbmtcIiwgXCJMb2dTb2Z0TWF4XCIsIFwiU29mdFNocmlua1wiLCBcIlNvZnRNYXhcIiwgXCJTb2Z0TWluXCIsIFwiU29mdFBsdXNcIiwgXCJTb2Z0U2lnblwiLCBcIklkZW50aXR5XCIsIFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIlNpZ21vaWRcIiwgXCJFeHBvbmVudGlhbExpbmVhclVuaXRcIiwgXCJUYW5oXCIsIFwiQWJzb2x1dGVcIiwgXCJTdW1tYXRpb25cIiwgXCJEcm9wb3V0XCIsIFwiTWF0cml4TXVsdGlwbHlcIiwgXCJCaWFzQWRkXCIsIFwiUmVzaGFwZVwiLCBcIkNvbmNhdFwiLCBcIkZsYXR0ZW5cIiwgXCJUZW5zb3JcIiwgXCJTb2Z0bWF4XCIsIFwiQ3Jvc3NFbnRyb3B5XCIsIFwiWmVyb1BhZGRpbmdcIiwgXCJSYW5kb21Ob3JtYWxcIiwgXCJUcnVuY2F0ZWROb3JtYWxEaXN0cmlidXRpb25cIiwgXCJEb3RQcm9kdWN0XCJdO1xuXHRcdGRlZmF1bHREZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5hZGREZWZpbml0aW9uKGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGFkZERlZmluaXRpb24oZGVmaW5pdGlvbk5hbWUpIHtcblx0XHR0aGlzLmRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSA9IHtcblx0XHRcdG5hbWU6IGRlZmluaXRpb25OYW1lLFxuXHRcdFx0Y29sb3I6IHRoaXMuY29sb3JIYXNoLmhleChkZWZpbml0aW9uTmFtZSlcblx0XHR9O1xuXHR9XG5cblx0aGFuZGxlSW5saW5lQmxvY2tEZWZpbml0aW9uKHNjb3BlKSB7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoc2NvcGUubmFtZS52YWx1ZSlcblx0XHR0aGlzLndhbGtBc3Qoc2NvcGUuYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUoc2NvcGUubmFtZS52YWx1ZSwgc2NvcGUubmFtZS52YWx1ZSwge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0aWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRjbGFzczogXCJcIixcblx0XHRcdF9zb3VyY2U6IHNjb3BlLl9zb3VyY2Vcblx0XHR9KTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24pwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke2Jsb2NrRGVmaW5pdGlvbi5uYW1lfVwiIHRvIGF2YWlsYWJsZSBkZWZpbml0aW9ucy5gKTtcblx0XHR0aGlzLmFkZERlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLndhbGtBc3QoYmxvY2tEZWZpbml0aW9uLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkoZGVmaW5pdGlvbkJvZHkpIHtcblx0XHRkZWZpbml0aW9uQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5ldHdvcmspIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHRuZXR3b3JrLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24oY29ubmVjdGlvbikge1xuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKTtcblx0XHQvLyBjb25zb2xlLmxvZyhjb25uZWN0aW9uLmxpc3QpXG5cdFx0Y29ubmVjdGlvbi5saXN0LmZvckVhY2goaXRlbSA9PiB7XG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpO1xuXHRcdFx0Ly8gY29uc29sZS5sb2coaXRlbSlcblx0XHRcdHRoaXMud2Fsa0FzdChpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRoYW5kbGVCbG9ja0luc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UubmFtZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcbiAgICAgICAgICAgIG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cbiAgICAgICAgICAgIHRoaXMuYWRkSXNzdWUoe1xuICAgICAgICAgICAgXHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuICAgICAgICAgICAgXHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcbiAgICAgICAgICAgIFx0dHlwZTogXCJlcnJvclwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDEpIHtcblx0XHRcdGxldCBkZWZpbml0aW9uID0gZGVmaW5pdGlvbnNbMF07XG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvcjtcblx0XHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb24ubmFtZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UubmFtZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRub2RlLmlkID0gdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQobm9kZS5jbGFzcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuaWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUudXNlckdlbmVyYXRlZElkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLmhlaWdodCA9IDUwO1xuXHRcdH1cblxuXHRcdC8vIGlzIG1ldGFub2RlXG5cdFx0aWYgKE9iamVjdC5rZXlzKHRoaXMuZ3JhcGgubWV0YW5vZGVzKS5pbmNsdWRlcyhub2RlLmNsYXNzKSkge1xuXHRcdFx0dmFyIGNvbG9yID0gZDMuY29sb3Iobm9kZS5jb2xvcik7XG5cdFx0XHRjb2xvci5vcGFjaXR5ID0gMC4xO1xuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCBub2RlLmNsYXNzLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUobm9kZS5pZCwge1xuXHRcdFx0Li4ubm9kZSxcbiAgICAgICAgICAgIHN0eWxlOiB7XCJmaWxsXCI6IG5vZGUuY29sb3J9LFxuICAgICAgICAgICAgd2lkdGg6IE1hdGgubWF4KE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApLCA1KSAqIDEyXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXNEZWZpbml0aW9ucygpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRNZXRhbm9kZXMoKVxuXHR9XG5cblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmxvZ2dlci5nZXRJc3N1ZXMoKTtcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dGhpcy5sb2dnZXIuYWRkSXNzdWUoaXNzdWUpO1xuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvO1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoc3BsaXRSZWdleCk7XG5cdCAgICBsZXQgbGlzdEFycmF5ID0gbGlzdC5tYXAoZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLnNwbGl0KHNwbGl0UmVnZXgpKTtcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gTW9uaWVsLmlzTXVsdGlQcmVmaXgocGFydGlhbEFycmF5LCBwb3NzaWJsZU1hdGNoKSk7XG5cdCAgICByZXN1bHQgPSByZXN1bHQubWFwKGl0ZW0gPT4gaXRlbS5qb2luKFwiXCIpKTtcblx0ICAgIHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRzdGF0aWMgaXNNdWx0aVByZWZpeChuYW1lLCB0YXJnZXQpIHtcblx0ICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gdGFyZ2V0Lmxlbmd0aCkgeyByZXR1cm4gZmFsc2U7IH1cblx0ICAgIHZhciBpID0gMDtcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDE7IH1cblx0ICAgIHJldHVybiAoaSA9PT0gbmFtZS5sZW5ndGgpOyAvLyBnb3QgdG8gdGhlIGVuZD9cblx0fVxuXG5cdGhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSkge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCBub2RlP1wiLCBub2RlKTtcblx0fVxuXG5cdHdhbGtBc3Qobm9kZSkge1xuXHRcdGlmICghbm9kZSkgeyBjb25zb2xlLmVycm9yKFwiTm8gbm9kZT8hXCIpOyByZXR1cm47IH1cblxuXHRcdHN3aXRjaCAobm9kZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiTmV0d29ya1wiOiB0aGlzLmhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJbmxpbmVCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVJbmxpbmVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPXt0aGlzLnByb3BzLmlkfSBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcbmNvbnN0IG9obSA9IHJlcXVpcmUoXCJvaG0tanNcIilcblxuY2xhc3MgUGFyc2Vye1xuXHRjb250ZW50cyA9IG51bGxcblx0Z3JhbW1hciA9IG51bGxcblx0XG5cdGV2YWxPcGVyYXRpb24gPSB7XG5cdFx0TmV0d29yazogZnVuY3Rpb24oZGVmaW5pdGlvbnMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiTmV0d29ya1wiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb246IGZ1bmN0aW9uKF8sIGxheWVyTmFtZSwgcGFyYW1zLCBib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRuYW1lOiBsYXllck5hbWUuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRib2R5OiBib2R5LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0SW5saW5lQmxvY2tEZWZpbml0aW9uOiBmdW5jdGlvbihuYW1lLCBfLCBib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklubGluZUJsb2NrRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKCksXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRJbmxpbmVCbG9ja0RlZmluaXRpb25Cb2R5OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0dmFyIGRlZmluaXRpb25zID0gbGlzdC5ldmFsKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uQm9keVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMgPyBkZWZpbml0aW9ucyA6IFtdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRDb25uZWN0aW9uRGVmaW5pdGlvbjogZnVuY3Rpb24obGlzdCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRsaXN0OiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tJbnN0YW5jZTogZnVuY3Rpb24oaWQsIGxheWVyTmFtZSwgcGFyYW1zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrSW5zdGFuY2VcIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLmV2YWwoKSxcblx0XHRcdFx0YWxpYXM6IGlkLmV2YWwoKVswXSxcblx0XHRcdFx0cGFyYW1ldGVyczogcGFyYW1zLmV2YWwoKSxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrTmFtZTogZnVuY3Rpb24oaWQsIF8pIHtcblx0XHRcdHJldHVybiBpZC5ldmFsKClcblx0XHR9LFxuXHRcdEJsb2NrTGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcIkJsb2NrTGlzdFwiLFxuXHRcdFx0XHRcImxpc3RcIjogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvblBhcmFtZXRlcnM6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvbkJvZHk6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBsaXN0LmV2YWwoKVswXSBcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uQm9keVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMgPyBkZWZpbml0aW9ucyA6IFtdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0luc3RhbmNlUGFyYW1ldGVyczogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0UGFyYW1ldGVyOiBmdW5jdGlvbihuYW1lLCBfLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJQYXJhbWV0ZXJcIixcblx0XHRcdFx0bmFtZTogbmFtZS5ldmFsKCksXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZS5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdFZhbHVlOiBmdW5jdGlvbih2YWwpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiVmFsdWVcIixcblx0XHRcdFx0dmFsdWU6IHZhbC5zb3VyY2UuY29udGVudHNcblx0XHRcdH1cblx0XHR9LFxuXHRcdFZhbHVlTGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRibG9ja0lkZW50aWZpZXI6IGZ1bmN0aW9uKF8sIF9fLCBfX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRwYXJhbWV0ZXJOYW1lOiBmdW5jdGlvbihhKSB7XG5cdFx0XHRyZXR1cm4gYS5zb3VyY2UuY29udGVudHNcblx0XHR9LFxuXHRcdGJsb2NrVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tUeXBlXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJsb2NrTmFtZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhcInNyYy9tb25pZWwub2htXCIsIFwidXRmOFwiKVxuXHRcdHRoaXMuZ3JhbW1hciA9IG9obS5ncmFtbWFyKHRoaXMuY29udGVudHMpXG5cdFx0dGhpcy5zZW1hbnRpY3MgPSB0aGlzLmdyYW1tYXIuY3JlYXRlU2VtYW50aWNzKCkuYWRkT3BlcmF0aW9uKFwiZXZhbFwiLCB0aGlzLmV2YWxPcGVyYXRpb24pXG5cdH1cblxuXHRtYWtlKHNvdXJjZSkge1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmdyYW1tYXIubWF0Y2goc291cmNlKVxuXG5cdFx0aWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHRcdFx0dmFyIGFzdCA9IHRoaXMuc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhc3Rcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpXG5cdFx0XHR2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4cGVjdGVkLFxuXHRcdFx0XHRwb3NpdGlvblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59IiwiY2xhc3MgUHlUb3JjaEdlbmVyYXRvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuYnVpbHRpbnMgPSBbXCJBcml0aG1ldGljRXJyb3JcIiwgXCJBc3NlcnRpb25FcnJvclwiLCBcIkF0dHJpYnV0ZUVycm9yXCIsIFwiQmFzZUV4Y2VwdGlvblwiLCBcIkJsb2NraW5nSU9FcnJvclwiLCBcIkJyb2tlblBpcGVFcnJvclwiLCBcIkJ1ZmZlckVycm9yXCIsIFwiQnl0ZXNXYXJuaW5nXCIsIFwiQ2hpbGRQcm9jZXNzRXJyb3JcIiwgXCJDb25uZWN0aW9uQWJvcnRlZEVycm9yXCIsIFwiQ29ubmVjdGlvbkVycm9yXCIsIFwiQ29ubmVjdGlvblJlZnVzZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25SZXNldEVycm9yXCIsIFwiRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiRU9GRXJyb3JcIiwgXCJFbGxpcHNpc1wiLCBcIkVudmlyb25tZW50RXJyb3JcIiwgXCJFeGNlcHRpb25cIiwgXCJGYWxzZVwiLCBcIkZpbGVFeGlzdHNFcnJvclwiLCBcIkZpbGVOb3RGb3VuZEVycm9yXCIsIFwiRmxvYXRpbmdQb2ludEVycm9yXCIsIFwiRnV0dXJlV2FybmluZ1wiLCBcIkdlbmVyYXRvckV4aXRcIiwgXCJJT0Vycm9yXCIsIFwiSW1wb3J0RXJyb3JcIiwgXCJJbXBvcnRXYXJuaW5nXCIsIFwiSW5kZW50YXRpb25FcnJvclwiLCBcIkluZGV4RXJyb3JcIiwgXCJJbnRlcnJ1cHRlZEVycm9yXCIsIFwiSXNBRGlyZWN0b3J5RXJyb3JcIiwgXCJLZXlFcnJvclwiLCBcIktleWJvYXJkSW50ZXJydXB0XCIsIFwiTG9va3VwRXJyb3JcIiwgXCJNZW1vcnlFcnJvclwiLCBcIk1vZHVsZU5vdEZvdW5kRXJyb3JcIiwgXCJOYW1lRXJyb3JcIiwgXCJOb25lXCIsIFwiTm90QURpcmVjdG9yeUVycm9yXCIsIFwiTm90SW1wbGVtZW50ZWRcIiwgXCJOb3RJbXBsZW1lbnRlZEVycm9yXCIsIFwiT1NFcnJvclwiLCBcIk92ZXJmbG93RXJyb3JcIiwgXCJQZW5kaW5nRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiUGVybWlzc2lvbkVycm9yXCIsIFwiUHJvY2Vzc0xvb2t1cEVycm9yXCIsIFwiUmVjdXJzaW9uRXJyb3JcIiwgXCJSZWZlcmVuY2VFcnJvclwiLCBcIlJlc291cmNlV2FybmluZ1wiLCBcIlJ1bnRpbWVFcnJvclwiLCBcIlJ1bnRpbWVXYXJuaW5nXCIsIFwiU3RvcEFzeW5jSXRlcmF0aW9uXCIsIFwiU3RvcEl0ZXJhdGlvblwiLCBcIlN5bnRheEVycm9yXCIsIFwiU3ludGF4V2FybmluZ1wiLCBcIlN5c3RlbUVycm9yXCIsIFwiU3lzdGVtRXhpdFwiLCBcIlRhYkVycm9yXCIsIFwiVGltZW91dEVycm9yXCIsIFwiVHJ1ZVwiLCBcIlR5cGVFcnJvclwiLCBcIlVuYm91bmRMb2NhbEVycm9yXCIsIFwiVW5pY29kZURlY29kZUVycm9yXCIsIFwiVW5pY29kZUVuY29kZUVycm9yXCIsIFwiVW5pY29kZUVycm9yXCIsIFwiVW5pY29kZVRyYW5zbGF0ZUVycm9yXCIsIFwiVW5pY29kZVdhcm5pbmdcIiwgXCJVc2VyV2FybmluZ1wiLCBcIlZhbHVlRXJyb3JcIiwgXCJXYXJuaW5nXCIsIFwiWmVyb0RpdmlzaW9uRXJyb3JcIiwgXCJfX2J1aWxkX2NsYXNzX19cIiwgXCJfX2RlYnVnX19cIiwgXCJfX2RvY19fXCIsIFwiX19pbXBvcnRfX1wiLCBcIl9fbG9hZGVyX19cIiwgXCJfX25hbWVfX1wiLCBcIl9fcGFja2FnZV9fXCIsIFwiX19zcGVjX19cIiwgXCJhYnNcIiwgXCJhbGxcIiwgXCJhbnlcIiwgXCJhc2NpaVwiLCBcImJpblwiLCBcImJvb2xcIiwgXCJieXRlYXJyYXlcIiwgXCJieXRlc1wiLCBcImNhbGxhYmxlXCIsIFwiY2hyXCIsIFwiY2xhc3NtZXRob2RcIiwgXCJjb21waWxlXCIsIFwiY29tcGxleFwiLCBcImNvcHlyaWdodFwiLCBcImNyZWRpdHNcIiwgXCJkZWxhdHRyXCIsIFwiZGljdFwiLCBcImRpclwiLCBcImRpdm1vZFwiLCBcImVudW1lcmF0ZVwiLCBcImV2YWxcIiwgXCJleGVjXCIsIFwiZXhpdFwiLCBcImZpbHRlclwiLCBcImZsb2F0XCIsIFwiZm9ybWF0XCIsIFwiZnJvemVuc2V0XCIsIFwiZ2V0YXR0clwiLCBcImdsb2JhbHNcIiwgXCJoYXNhdHRyXCIsIFwiaGFzaFwiLCBcImhlbHBcIiwgXCJoZXhcIiwgXCJpZFwiLCBcImlucHV0XCIsIFwiaW50XCIsIFwiaXNpbnN0YW5jZVwiLCBcImlzc3ViY2xhc3NcIiwgXCJpdGVyXCIsIFwibGVuXCIsIFwibGljZW5zZVwiLCBcImxpc3RcIiwgXCJsb2NhbHNcIiwgXCJtYXBcIiwgXCJtYXhcIiwgXCJtZW1vcnl2aWV3XCIsIFwibWluXCIsIFwibmV4dFwiLCBcIm9iamVjdFwiLCBcIm9jdFwiLCBcIm9wZW5cIiwgXCJvcmRcIiwgXCJwb3dcIiwgXCJwcmludFwiLCBcInByb3BlcnR5XCIsIFwicXVpdFwiLCBcInJhbmdlXCIsIFwicmVwclwiLCBcInJldmVyc2VkXCIsIFwicm91bmRcIiwgXCJzZXRcIiwgXCJzZXRhdHRyXCIsIFwic2xpY2VcIiwgXCJzb3J0ZWRcIiwgXCJzdGF0aWNtZXRob2RcIiwgXCJzdHJcIiwgXCJzdW1cIiwgXCJzdXBlclwiLCBcInR1cGxlXCIsIFwidHlwZVwiLCBcInZhcnNcIiwgXCJ6aXBcIl1cblx0XHR0aGlzLmtleXdvcmRzID0gW1wiYW5kXCIsIFwiYXNcIiwgXCJhc3NlcnRcIiwgXCJicmVha1wiLCBcImNsYXNzXCIsIFwiY29udGludWVcIiwgXCJkZWZcIiwgXCJkZWxcIiwgXCJlbGlmXCIsIFwiZWxzZVwiLCBcImV4Y2VwdFwiLCBcImV4ZWNcIiwgXCJmaW5hbGx5XCIsIFwiZm9yXCIsIFwiZnJvbVwiLCBcImdsb2JhbFwiLCBcImlmXCIsIFwiaW1wb3J0XCIsIFwiaW5cIiwgXCJpc1wiLCBcImxhbWJkYVwiLCBcIm5vdFwiLCBcIm9yXCIsIFwicGFzc1wiLCBcInByaW50XCIsIFwicmFpc2VcIiwgXCJyZXR1cm5cIiwgXCJ0cnlcIiwgXCJ3aGlsZVwiLCBcIndpdGhcIiwgXCJ5aWVsZFwiXVxuXHR9XG5cbiAgICBzYW5pdGl6ZShpZCkge1xuXHRcdHZhciBzYW5pdGl6ZWRJZCA9IGlkXG5cdFx0aWYgKHRoaXMuYnVpbHRpbnMuaW5jbHVkZXMoc2FuaXRpemVkSWQpIHx8IHRoaXMua2V5d29yZHMuaW5jbHVkZXMoc2FuaXRpemVkSWQpKSB7XG5cdFx0XHRzYW5pdGl6ZWRJZCA9IFwiX1wiICsgc2FuaXRpemVkSWRcblx0XHR9XG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC4vZywgXCJ0aGlzXCIpXG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC8vZywgXCIuXCIpXG5cdFx0cmV0dXJuIHNhbml0aXplZElkXG5cdH1cblxuXHRtYXBUb0Z1bmN0aW9uKG5vZGVUeXBlKSB7XG5cdFx0bGV0IHRyYW5zbGF0aW9uVGFibGUgPSB7XG5cdFx0XHRcIkNvbnZvbHV0aW9uXCI6IFwiRi5jb252MmRcIixcblx0XHRcdFwiRGVjb252b2x1dGlvblwiOiBcIkYuY29udl90cmFuc3Bvc2UyZFwiLFxuXHRcdFx0XCJBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJBZGFwdGl2ZUF2ZXJhZ2VQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9hdmdfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFBvb2xpbmdcIjogXCJGLm1heF9wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVNYXhQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFVucG9vbGluZ1wiOiBcIkYubWF4X3VucG9vbDJkXCIsXG5cdFx0XHRcIlJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJlbHVcIixcblx0XHRcdFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCI6IFwiRi5lbHVcIixcblx0XHRcdFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnByZWx1XCIsXG5cdFx0XHRcIkxlYWt5UmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYubGVha3lfcmVsdVwiLFxuXHRcdFx0XCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucnJlbHVcIixcblx0XHRcdFwiU2lnbW9pZFwiOiBcIkYuc2lnbW9pZFwiLFxuXHRcdFx0XCJMb2dTaWdtb2lkXCI6IFwiRi5sb2dzaWdtb2lkXCIsXG5cdFx0XHRcIlRocmVzaG9sZFwiOiBcIkYudGhyZXNob2xkXCIsXG5cdFx0XHRcIkhhcmRUYW5oXCI6IFwiRi5oYXJkdGFuaFwiLFxuXHRcdFx0XCJUYW5oXCI6IFwiRi50YW5oXCIsXG5cdFx0XHRcIlRhbmhTaHJpbmtcIjogXCJGLnRhbmhzaHJpbmtcIixcblx0XHRcdFwiSGFyZFNocmlua1wiOiBcIkYuaGFyZHNocmlua1wiLFxuXHRcdFx0XCJMb2dTb2Z0TWF4XCI6IFwiRi5sb2dfc29mdG1heFwiLFxuXHRcdFx0XCJTb2Z0U2hyaW5rXCI6IFwiRi5zb2Z0c2hyaW5rXCIsXG5cdFx0XHRcIlNvZnRNYXhcIjogXCJGLnNvZnRtYXhcIixcblx0XHRcdFwiU29mdE1pblwiOiBcIkYuc29mdG1pblwiLFxuXHRcdFx0XCJTb2Z0UGx1c1wiOiBcIkYuc29mdHBsdXNcIixcblx0XHRcdFwiU29mdFNpZ25cIjogXCJGLnNvZnRzaWduXCIsXG5cdFx0XHRcIkJhdGNoTm9ybWFsaXphdGlvblwiOiBcIkYuYmF0Y2hfbm9ybVwiLFxuXHRcdFx0XCJMaW5lYXJcIjogXCJGLmxpbmVhclwiLFxuXHRcdFx0XCJEcm9wb3V0XCI6IFwiRi5kcm9wb3V0XCIsXG5cdFx0XHRcIlBhaXJ3aXNlRGlzdGFuY2VcIjogXCJGLnBhaXJ3aXNlX2Rpc3RhbmNlXCIsXG5cdFx0XHRcIkNyb3NzRW50cm9weVwiOiBcIkYuY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJCaW5hcnlDcm9zc0VudHJvcHlcIjogXCJGLmJpbmFyeV9jcm9zc19lbnRyb3B5XCIsXG5cdFx0XHRcIkt1bGxiYWNrTGVpYmxlckRpdmVyZ2VuY2VMb3NzXCI6IFwiRi5rbF9kaXZcIixcblx0XHRcdFwiUGFkXCI6IFwiRi5wYWRcIixcblx0XHRcdFwiVmFyaWFibGVcIjogXCJBRy5WYXJpYWJsZVwiLFxuXHRcdFx0XCJSYW5kb21Ob3JtYWxcIjogXCJULnJhbmRuXCJcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShub2RlVHlwZSkgPyB0cmFuc2xhdGlvblRhYmxlW25vZGVUeXBlXSA6IG5vZGVUeXBlXG5cblx0fVxuXG5cdGluZGVudChjb2RlLCBsZXZlbCA9IDEsIGluZGVudFBlckxldmVsID0gXCIgICAgXCIpIHtcblx0XHRsZXQgaW5kZW50ID0gaW5kZW50UGVyTGV2ZWwucmVwZWF0KGxldmVsKVxuXHRcdHJldHVybiBjb2RlLnNwbGl0KFwiXFxuXCIpLm1hcChsaW5lID0+IGluZGVudCArIGxpbmUpLmpvaW4oXCJcXG5cIilcblx0fVxuXG5cdGdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpIHtcblx0XHRsZXQgaW1wb3J0cyA9XG5gaW1wb3J0IHRvcmNoIGFzIFRcbmltcG9ydCB0b3JjaC5ubi5mdW5jdGlvbmFsIGFzIEZcbmltcG9ydCB0b3JjaC5hdXRvZ3JhZCBhcyBBR2BcblxuXHRcdGxldCBtb2R1bGVEZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5tYXAoZGVmaW5pdGlvbk5hbWUgPT4ge1xuXHRcdFx0aWYgKGRlZmluaXRpb25OYW1lICE9PSBcIm1haW5cIikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUNvZGVGb3JNb2R1bGUoZGVmaW5pdGlvbk5hbWUsIGRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vcmV0dXJuIFwiXCJcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0bGV0IGNvZGUgPVxuYCR7aW1wb3J0c31cblxuJHttb2R1bGVEZWZpbml0aW9ucy5qb2luKFwiXFxuXCIpfVxuYFxuXG5cdFx0cmV0dXJuIGNvZGVcblx0fVxuXG5cdGdlbmVyYXRlQ29kZUZvck1vZHVsZShjbGFzc25hbWUsIGdyYXBoKSB7XG5cdFx0bGV0IHRvcG9sb2dpY2FsT3JkZXJpbmcgPSBncmFwaGxpYi5hbGcudG9wc29ydChncmFwaClcblx0XHRsZXQgZm9yd2FyZEZ1bmN0aW9uID0gXCJcIlxuXG5cdFx0dG9wb2xvZ2ljYWxPcmRlcmluZy5tYXAobm9kZSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcIm11XCIsIG5vZGUpXG5cdFx0XHRsZXQgbiA9IGdyYXBoLm5vZGUobm9kZSlcblx0XHRcdGxldCBjaCA9IGdyYXBoLmNoaWxkcmVuKG5vZGUpXG5cblx0XHRcdGlmICghbikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKG4pXG5cblx0XHRcdGlmIChjaC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bGV0IGluTm9kZXMgPSBncmFwaC5pbkVkZ2VzKG5vZGUpLm1hcChlID0+IHRoaXMuc2FuaXRpemUoZS52KSlcblx0XHRcdFx0Zm9yd2FyZEZ1bmN0aW9uICs9IGAke3RoaXMuc2FuaXRpemUobm9kZSl9ID0gJHt0aGlzLm1hcFRvRnVuY3Rpb24obi5jbGFzcyl9KCR7aW5Ob2Rlcy5qb2luKFwiLCBcIil9KVxcbmBcblx0XHRcdH0gXG5cdFx0fSwgdGhpcylcblxuXHRcdGxldCBtb2R1bGVDb2RlID1cbmBjbGFzcyAke2NsYXNzbmFtZX0oVC5ubi5Nb2R1bGUpOlxuICAgIGRlZiBfX2luaXRfXyhzZWxmLCBwYXJhbTEsIHBhcmFtMik6ICMgcGFyYW1ldGVycyBoZXJlXG4gICAgICAgIHN1cGVyKCR7Y2xhc3NuYW1lfSwgc2VsZikuX19pbml0X18oKVxuICAgICAgICAjIGFsbCBkZWNsYXJhdGlvbnMgaGVyZVxuXG4gICAgZGVmIGZvcndhcmQoc2VsZiwgaW4xLCBpbjIpOiAjIGFsbCBJbnB1dHMgaGVyZVxuICAgICAgICAjIGFsbCBmdW5jdGlvbmFsIHN0dWZmIGhlcmVcbiR7dGhpcy5pbmRlbnQoZm9yd2FyZEZ1bmN0aW9uLCAyKX1cbiAgICAgICAgcmV0dXJuIChvdXQxLCBvdXQyKSAjIGFsbCBPdXRwdXRzIGhlcmVcbmBcblx0XHRyZXR1cm4gbW9kdWxlQ29kZVxuXHR9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwiVmlzdWFsR3JhcGguY29uc3RydWN0b3JcIik7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCgpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3JhcGg6IG51bGwsXG4gICAgICAgICAgICBwcmV2aW91c1ZpZXdCb3g6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbmltYXRlID0gbnVsbFxuICAgIH1cblxuICAgIHNhdmVHcmFwaChncmFwaCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGdyYXBoOiBncmFwaFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcIlZpc3VhbEdyYXBoLmNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHNcIiwgbmV4dFByb3BzKTtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCwgdGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVDbGljayhub2RlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ2xpY2tlZFwiLCBub2RlKTtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBzZWxlY3RlZE5vZGU6IG5vZGUuaWRcbiAgICAgICAgfSlcbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgdGhpcy5hbmltYXRlID0gZG9tTm9kZVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdyYXBoKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBnID0gdGhpcy5zdGF0ZS5ncmFwaDtcblxuICAgICAgICBsZXQgbm9kZXMgPSBnLm5vZGVzKCkubWFwKG5vZGVOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBncmFwaCA9IHRoaXM7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShub2RlTmFtZSk7XG4gICAgICAgICAgICBsZXQgbm9kZSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBub2RlTmFtZSxcbiAgICAgICAgICAgICAgICBub2RlOiBuLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGdyYXBoLmhhbmRsZUNsaWNrLmJpbmQoZ3JhcGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuLmlzTWV0YW5vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBub2RlID0gPE1ldGFub2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuLnVzZXJHZW5lcmF0ZWRJZCkge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPElkZW50aWZpZWROb2RlIHsuLi5wcm9wc30gLz47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxBbm9ueW1vdXNOb2RlIHsuLi5wcm9wc30gLz5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgZWRnZXMgPSBnLmVkZ2VzKCkubWFwKGVkZ2VOYW1lID0+IHtcbiAgICAgICAgICAgIGxldCBlID0gZy5lZGdlKGVkZ2VOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiA8RWRnZSBrZXk9e2Ake2VkZ2VOYW1lLnZ9LT4ke2VkZ2VOYW1lLnd9YH0gZWRnZT17ZX0vPlxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmlld0JveF93aG9sZSA9IGAwIDAgJHtnLmdyYXBoKCkud2lkdGh9ICR7Zy5ncmFwaCgpLmhlaWdodH1gO1xuICAgICAgICB2YXIgdHJhbnNmb3JtVmlldyA9IGB0cmFuc2xhdGUoMHB4LDBweClgICsgYHNjYWxlKCR7Zy5ncmFwaCgpLndpZHRoIC8gZy5ncmFwaCgpLndpZHRofSwke2cuZ3JhcGgoKS5oZWlnaHQgLyBnLmdyYXBoKCkuaGVpZ2h0fSlgO1xuICAgICAgICBcbiAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlO1xuICAgICAgICB2YXIgdmlld0JveFxuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShzZWxlY3RlZE5vZGUpO1xuICAgICAgICAgICAgdmlld0JveCA9IGAke24ueCAtIG4ud2lkdGggLyAyfSAke24ueSAtIG4uaGVpZ2h0IC8gMn0gJHtuLndpZHRofSAke24uaGVpZ2h0fWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdCb3ggPSB2aWV3Qm94X3dob2xlXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHN2ZyBpZD1cInZpc3VhbGl6YXRpb25cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiPlxuICAgICAgICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKFwic3JjL3N0eWxlLmNzc1wiLCBcInV0Zi04XCIsIChlcnIpID0+IHtjb25zb2xlLmxvZyhlcnIpfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50LmJpbmQodGhpcyl9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgZnJvbT17dmlld0JveF93aG9sZX0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJ2ZWVcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgPC9tYXJrZXI+XG4gICAgICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9XCJub2Rlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgICAgIDxnIGlkPVwiZWRnZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgRWRnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBsaW5lID0gZDMubGluZSgpXG4gICAgICAgIC5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgLnkoZCA9PiBkLnkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogW11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IHRoaXMucHJvcHMuZWRnZS5wb2ludHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgZG9tTm9kZS5iZWdpbkVsZW1lbnQoKSAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLnByb3BzLmVkZ2U7XG4gICAgICAgIGxldCBsID0gdGhpcy5saW5lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVBhdGhcIiBtYXJrZXJFbmQ9XCJ1cmwoI3ZlZSlcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPXtsKGUucG9pbnRzKX0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudH0ga2V5PXtNYXRoLnJhbmRvbSgpfSByZXN0YXJ0PVwiYWx3YXlzXCIgZnJvbT17bCh0aGlzLnN0YXRlLnByZXZpb3VzUG9pbnRzKX0gdG89e2woZS5wb2ludHMpfSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCIgYXR0cmlidXRlTmFtZT1cImRcIiAvPlxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Bub2RlICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHN0eWxlPXt7dHJhbnNmb3JtOiBgdHJhbnNsYXRlKCR7TWF0aC5mbG9vcihuLnggLShuLndpZHRoLzIpKX1weCwke01hdGguZmxvb3Iobi55IC0obi5oZWlnaHQvMikpfXB4KWB9fT5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0+PC9yZWN0PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9IHRleHRBbmNob3I9XCJzdGFydFwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PiA8L3JlY3Q+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBJZGVudGlmaWVkTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9PjwvcmVjdD5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
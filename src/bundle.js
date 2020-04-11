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
        this.colorHash = new ColorHash({
            saturation: [0.5, 0.6, 0.7],
            lightness: [0.45]
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
	}, {
		key: "nodeStack",
		get: function get() {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			return this._nodeStack[lastIndex];
		},
		set: function set(value) {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			this._nodeStack[lastIndex] = value;
		}
	}, {
		key: "previousNodeStack",
		get: function get() {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			return this._previousNodeStack[lastIndex];
		},
		set: function set(value) {
			var lastIndex = this.metanodeStack[this.metanodeStack.length - 1];
			this._previousNodeStack[lastIndex] = value;
		}
	}]);

	function ComputationalGraph(parent) {
		_classCallCheck(this, ComputationalGraph);

		this.nodeCounter = {};
		this._nodeStack = [];
		this._previousNodeStack = [];
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

			this.nodeStack = [];
			this.previousNodeStack = [];

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
				this.nodeStack.push(nodePath);

				if (this.previousNodeStack.length === 1) {
					this.setEdge(this.previousNodeStack[0], nodePath);
				} else if (this.previousNodeStack.length > 1) {
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
				console.warn("Redefining node \"" + id + "\"");
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
		value: function createMetanode(identifier, node) {
			var _this = this;

			var metanodeClass = node.class;
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
				var e = targetMetanode.edge(edge);
				_this.graph.setEdge(edge.v.replace(".", nodePath), edge.w.replace(".", nodePath), {});
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
			var isAvailable = this.graph.inEdges(nodePath).length === 0;
			var isInput = this.graph.node(nodePath).class === "Input";
			var isUndefined = this.graph.node(nodePath).class === "undefined";
			return isInput || isUndefined && isAvailable;
		}
	}, {
		key: "isOutput",
		value: function isOutput(nodePath) {
			var isAvailable = this.graph.outEdges(nodePath).length === 0;
			var isOutput = this.graph.node(nodePath).class === "Output";
			var isUndefined = this.graph.node(nodePath).class === "undefined";
			return isOutput || isUndefined && isAvailable;
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
				return null;
				this.moniel.logger.addIssue({
					message: "Metanode \"" + scope.id + "\" doesn't have any Output node.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			} else if (outputNodes.length === 1 && this.graph.node(outputNodes[0]).isMetanode) {
				return this.getOutputNodes(outputNodes[0]);
			}

			return outputNodes;
		}
	}, {
		key: "getInputNodes",
		value: function getInputNodes(scopePath) {
			var _this3 = this;

			console.log(scopePath);
			var scope = this.graph.node(scopePath);
			var inputNodes = this.graph.children(scopePath).filter(function (node) {
				return _this3.isInput(node);
			});
			console.log(inputNodes);

			if (inputNodes.length === 0) {
				return null;
				this.moniel.logger.addIssue({
					message: "Metanode \"" + scope.id + "\" doesn't have any Input nodes.",
					type: "error",
					position: {
						start: scope._source ? scope._source.startIdx : 0,
						end: scope._source ? scope._source.endIdx : 0
					}
				});
				return null;
			} else if (inputNodes.length === 1 && this.graph.node(inputNodes[0]).isMetanode) {
				return this.getInputNodes(inputNodes[0]);
			}

			return inputNodes;
		}
	}, {
		key: "setEdge",
		value: function setEdge(fromPath, toPath) {
			console.info("Creating edge from \"" + fromPath + "\" to \"" + toPath + "\".");
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
						this.graph.setEdge(sourcePaths[i], targetPaths[i], {});
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
        key: "UNSAFE_componentWillReceiveProps",
        value: function UNSAFE_componentWillReceiveProps(nextProps) {
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
	function GraphLayout(callback) {
		_classCallCheck(this, GraphLayout);

		this.activeWorkers = {};
		this.currentWorkerId = 0;
		this.lastFinishedWorkerId = 0;

		this.callback = function () {};

		this.callback = callback;
	}

	_createClass(GraphLayout, [{
		key: "layout",
		value: function layout(graph) {
			var id = this.getWorkerId();
			this.activeWorkers[id] = new LayoutWorker(id, graph, this.workerFinished.bind(this));
		}
	}, {
		key: "workerFinished",
		value: function workerFinished(_ref) {
			var id = _ref.id,
			    graph = _ref.graph;

			if (id >= this.lastFinishedWorkerId) {
				this.lastFinishedWorkerId = id;
				this.callback(graph);
			}
		}
	}, {
		key: "getWorkerId",
		value: function getWorkerId() {
			this.currentWorkerId += 1;
			return this.currentWorkerId;
		}
	}]);

	return GraphLayout;
}();

var LayoutWorker = function () {
	function LayoutWorker(id, graph, onFinished) {
		_classCallCheck(this, LayoutWorker);

		this.id = 0;
		this.worker = null;

		this.id = id;
		this.worker = new Worker("src/scripts/GraphLayoutWorker.js");
		this.worker.addEventListener("message", this.receive.bind(this));
		this.onFinished = onFinished;

		this.worker.postMessage(this.encode(graph));
	}

	_createClass(LayoutWorker, [{
		key: "receive",
		value: function receive(message) {
			this.worker.terminate();
			this.onFinished({
				id: this.id,
				graph: this.decode(message.data)
			});
		}
	}, {
		key: "encode",
		value: function encode(graph) {
			return graphlib.json.write(graph);
		}
	}, {
		key: "decode",
		value: function decode(json) {
			return graphlib.json.read(json);
		}
	}]);

	return LayoutWorker;
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
		_this.interpreter = new Interpreter();
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
			fs.writeFile(message.folder + "/graph.json", JSON.stringify(dagre.graphlib.json.write(this.state.graph), null, 2), function (err) {
				if (err) throw errs;
			});
			fs.writeFile(message.folder + "/half-assed_joke.py", this.state.generatedCode, function (err) {
				if (err) throw errs;
			});

			var saveNotification = new Notification('Sketch saved', {
				body: "Click to open saved sketch.",
				silent: true
			});

			var _require = require('electron'),
			    shell = _require.shell;

			saveNotification.onclick = function () {
				shell.showItemInFolder(message.folder);
			};
		}.bind(_this));

		ipc.on("toggleLayout", function (e, m) {
			_this.toggleLayout();
		});

		ipc.on("open", function (e, m) {
			_this.openFile(m.filePath);
		});

		var layout = window.localStorage.getItem("layout");
		if (layout) {
			if (layout == "columns" || layout == "rows") {
				_this.state.layout = layout;
			} else {
				_this.interpreter.logger.addIssue({
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
		key: "openFile",
		value: function openFile(filePath) {
			console.log("openFile", filePath);
			var fileContent = fs.readFileSync(filePath, "utf8");
			this.editor.setValue(fileContent // this has to be here, I don't know why
			);this.setState({
				networkDefinition: fileContent
			});
		}
	}, {
		key: "loadExample",
		value: function loadExample(id) {
			var fileContent = fs.readFileSync(__dirname + "/examples/" + id + ".mon", "utf8");
			this.editor.setValue(fileContent // this has to be here, I don't know why
			);this.setState({
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
				this.interpreter.execute(result.ast);
				var graph = this.interpreter.getComputationalGraph();
				var definitions = this.interpreter.getMetanodesDefinitions
				//console.log(definitions)

				();this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					generatedCode: this.generator.generateCode(graph, definitions),
					issues: this.interpreter.getIssues()
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
			setTimeout(function () {
				window.dispatchEvent(new Event("resize"));
			}, 100);
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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
	This code is a mess.
*/

var pixelWidth = require('string-pixel-width');

var Interpreter = function () {

	// too soon, should be in VisualGraph

	// maybe singleton?
	function Interpreter() {
		_classCallCheck(this, Interpreter);

		this.logger = new Logger();
		this.graph = new ComputationalGraph(this);
		this.colorHash = new ColorHashWrapper();
		this.definitions = {};

		this.initialize();
	}

	_createClass(Interpreter, [{
		key: "initialize",
		value: function initialize() {
			this.graph.initialize();
			this.logger.clear();

			this.definitions = [];
			this.addDefaultDefinitions();
			this.depth = 0;
		}
	}, {
		key: "addDefaultDefinitions",
		value: function addDefaultDefinitions() {
			var _this = this;

			// console.info(`Adding default definitions.`);
			var defaultDefinitions = ["Add", "Linear", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Deconvolution", "AveragePooling", "AdaptiveAveragePooling", "AdaptiveMaxPooling", "MaxUnpooling", "LocalResponseNormalization", "ParametricRectifiedLinearUnit", "LeakyRectifiedLinearUnit", "RandomizedRectifiedLinearUnit", "LogSigmoid", "Threshold", "HardTanh", "TanhShrink", "HardShrink", "LogSoftMax", "SoftShrink", "SoftMax", "SoftMin", "SoftPlus", "SoftSign", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy", "ZeroPadding", "RandomNormal", "TruncatedNormalDistribution", "DotProduct"];
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
		key: "execute",
		value: function execute(ast) {
			var state = {
				graph: new ComputationalGraph(this),
				logger: new Logger()
			};
			this.initialize();
			this.walkAst(ast, state);
			console.log("Final State:", state);
		}
	}, {
		key: "walkAst",
		value: function walkAst(token, state) {
			if (!token) {
				console.error("No token?!");return;
			}
			this.depth += 1;
			var pad = Array.from({ length: this.depth }).fill(" ").reduce(function (p, c) {
				return p + c;
			}, ""
			//console.log(pad + token.kind)

			);var fnName = "_" + token.kind;
			var fn = this[fnName] || this._unrecognized;
			var returnValue = fn.call(this, token, state);
			this.depth -= 1;

			return returnValue;
		}
	}, {
		key: "_Graph",
		value: function _Graph(graph, state) {
			var _this2 = this;

			graph.definitions.forEach(function (definition) {
				return _this2.walkAst(definition, state);
			});
		}
	}, {
		key: "_NodeDefinition",
		value: function _NodeDefinition(nodeDefinition, state) {
			// console.info(`Adding "${nodeDefinition.name}" to available definitions.`);
			this.addDefinition(nodeDefinition.name);
			if (nodeDefinition.body) {
				state.graph.enterMetanodeScope(nodeDefinition.name);
				this.graph.enterMetanodeScope(nodeDefinition.name);
				this.walkAst(nodeDefinition.body, state);
				state.graph.exitMetanodeScope();
				this.graph.exitMetanodeScope();
			}
		}
	}, {
		key: "_Chain",
		value: function _Chain(chain, state) {
			var _this3 = this;

			state.graph.clearNodeStack();
			this.graph.clearNodeStack
			// console.log(connection.list)
			();chain.blocks.forEach(function (item) {
				state.graph.freezeNodeStack();
				_this3.graph.freezeNodeStack
				// console.log(item)
				();_this3.walkAst(item, state);
			});
		}
	}, {
		key: "_InlineMetaNode",
		value: function _InlineMetaNode(node, state) {
			//console.log(node)
			var identifier = node.alias ? node.alias.value : this.graph.generateInstanceId("metanode");

			state.graph.enterMetanodeScope(identifier);
			this.graph.enterMetanodeScope(identifier);
			this.walkAst(node.body, state);
			state.graph.exitMetanodeScope();
			this.graph.exitMetanodeScope();

			this.graph.createMetanode(identifier, {
				userGeneratedId: node.alias ? node.alias.value : undefined,
				id: identifier,
				class: identifier,
				isAnonymous: true,
				_source: node._source
			});

			return {
				id: identifier,
				class: identifier,
				userGeneratedId: node.alias ? node.alias.value : undefined,
				_source: node._source
			};
		}
	}, {
		key: "_MetaNode",
		value: function _MetaNode(metanode, state) {
			var _this4 = this;

			// console.log(metanode)
			metanode.definitions.forEach(function (definition) {
				return _this4.walkAst(definition, state);
			});
		}
	}, {
		key: "_Node",
		value: function _Node(node, state) {
			var nodeDefinition = this.walkAst(_extends({}, node.node, {
				alias: node.alias
			}), state

			// console.log(nodeDefinition)
			);
		}

		// this is doing too much – break into "not recognized", "success" and "ambiguous"

	}, {
		key: "_LiteralNode",
		value: function _LiteralNode(instance, state) {

			var heights = {
				id: 19,
				class: 18,
				parameterRow: 15,
				parameterTablePadding: 2 * 3,
				headerPadding: 5
			};

			var node = {
				id: undefined,
				class: "Unknown",
				color: "darkgrey",
				height: 2 * heights.headerPadding + heights.class,
				width: 100,
				parameters: instance.parameters.map(function (p) {
					return [p.name, p.value.value];
				}),

				_source: instance
			};

			var definitions = this.matchInstanceNameToDefinitions(instance.type.value
			// console.log(`Matched definitions:`, definitions);

			);if (definitions.length === 0) {
				node.class = instance.type.value;
				node.isUndefined = true;

				this.addIssue({
					message: "Unrecognized node type \"" + instance.type.value + "\". No possible matches found.",
					position: {
						start: instance.type._source.startIdx,
						end: instance.type._source.endIdx
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
				node.class = instance.type.value;
				this.addIssue({
					message: "Unrecognized node type \"" + instance.type.value + "\". Possible matches: " + definitions.map(function (def) {
						return "\"" + def.name + "\"";
					}).join(", ") + ".",
					position: {
						start: instance.type._source.startIdx,
						end: instance.type._source.endIdx
					},
					type: "error"
				});
			}

			if (!instance.alias) {
				node.id = this.graph.generateInstanceId(node.class);
			} else {
				node.id = instance.alias.value;
				node.userGeneratedId = instance.alias.value;
				node.height += heights.id;
			}

			if (node.parameters.length > 0) {
				node.height += heights.parameterTablePadding + node.parameters.length * heights.parameterRow;
			}

			// is metanode
			if (Object.keys(this.graph.metanodes).includes(node.class)) {
				var color = d3.color(node.color);
				color.opacity = 0.1;
				this.graph.createMetanode(node.id, _extends({}, node, {
					style: { "fill": color.toString() }
				}));
				return _extends({}, node, {
					style: { "fill": color.toString() }
				});
			}

			var left = Math.max.apply(Math, _toConsumableArray(node.parameters.map(function (_ref) {
				var _ref2 = _slicedToArray(_ref, 2),
				    key = _ref2[0],
				    value = _ref2[1];

				return pixelWidth(key, { size: 14 });
			})));
			var right = Math.max.apply(Math, _toConsumableArray(node.parameters.map(function (_ref3) {
				var _ref4 = _slicedToArray(_ref3, 2),
				    key = _ref4[0],
				    value = _ref4[1];

				return pixelWidth(value, { size: 14 });
			})));
			var widthParams = left + right;

			var widthTitle = Math.max.apply(Math, _toConsumableArray([node.class, node.userGeneratedId ? node.userGeneratedId : ""].map(function (string) {
				return pixelWidth(string, { size: 16 });
			})));

			var width = 20 + Math.max(widthParams, widthTitle);

			this.graph.createNode(node.id, _extends({}, node, {
				style: { fill: node.color },
				width: width
			}));

			return _extends({}, node, {
				style: { fill: node.color },
				width: width
			});
		}
	}, {
		key: "_List",
		value: function _List(list, state) {
			var _this5 = this;

			list.list.forEach(function (item) {
				return _this5.walkAst(item, state);
			});
		}
	}, {
		key: "_Identifier",
		value: function _Identifier(identifier) {
			this.graph.referenceNode(identifier.value);
		}
	}, {
		key: "matchInstanceNameToDefinitions",
		value: function matchInstanceNameToDefinitions(query) {
			var _this6 = this;

			var definitions = Object.keys(this.definitions);
			var definitionKeys = Interpreter.nameResolution(query, definitions
			//console.log("Found keys", definitionKeys)
			);var matchedDefinitions = definitionKeys.map(function (key) {
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
		key: "_unrecognized",
		value: function _unrecognized(token) {
			console.warn("What to do with this AST token?", token);
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
				return Interpreter.isMultiPrefix(partialArray, possibleMatch);
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

	return Interpreter;
}();
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
			Graph: function Graph(definitions) {
				return {
					kind: "Graph",
					definitions: definitions.eval()
				};
			},
			NodeDefinition: function NodeDefinition(_, layerName, params, body) {
				return {
					kind: "NodeDefinition",
					name: layerName.source.contents,
					body: body.eval()[0]
				};
			},
			InlineMetaNode: function InlineMetaNode(body) {
				return {
					kind: "InlineMetaNode",
					body: body.eval(),
					_source: this.source
				};
			},
			MetaNode: function MetaNode(_, defs, __) {
				var definitions = defs.eval();
				return {
					kind: "MetaNode",
					definitions: definitions.definitions
				};
			},
			Chain: function Chain(list) {
				return {
					kind: "Chain",
					blocks: list.eval()
				};
			},
			Node: function Node(id, _, node) {
				return {
					kind: "Node",
					node: node.eval(),
					alias: id.eval()[0],
					_source: this.source
				};
			},
			LiteralNode: function LiteralNode(type, params) {
				return {
					kind: "LiteralNode",
					type: type.eval(),
					parameters: params.eval()
				};
			},
			/*
   BlockName: function(id, _) {
   	return id.eval()
   },
   */
			List: function List(_, list, __) {
				return {
					kind: "List",
					list: list.eval()
				};
			},
			BlockParameters: function BlockParameters(_, params, __) {
				var p = params.eval();
				return p[0] ? p[0] : p;
			},
			Parameter: function Parameter(name, _, value) {
				return {
					kind: "Parameter",
					name: name.source.contents,
					value: value.eval()
				};
			},
			Value: function Value(val) {
				return {
					kind: "Value",
					value: val.source.contents
				};
			},
			NonemptyListOf: function NonemptyListOf(x, _, xs) {
				return [x.eval()].concat(xs.eval());
			},
			EmptyListOf: function EmptyListOf() {
				return [];
			},
			path: function path(list) {
				return {
					kind: "Identifier",
					value: this.source.contents,
					_source: this.source
				};
			},
			parameterName: function parameterName(a) {
				return a.source.contents;
			},
			nodeType: function nodeType(_, __) {
				return {
					kind: "NodeType",
					value: this.source.contents,
					_source: this.source
				};
			},
			identifier: function identifier(_, __) {
				return {
					kind: "Identifier",
					value: this.source.contents,
					_source: this.source
				};
			}
		};

		this.contents = fs.readFileSync(__dirname + "/src/moniel.ohm", "utf8");
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
				"RandomNormal": "T.randn",
				"Tensor": "T.Tensor"
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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var zoom = require("d3-zoom");

var VisualGraph = function (_React$Component) {
  _inherits(VisualGraph, _React$Component);

  function VisualGraph(props) {
    _classCallCheck(this, VisualGraph);

    var _this = _possibleConstructorReturn(this, (VisualGraph.__proto__ || Object.getPrototypeOf(VisualGraph)).call(this, props));

    _this.graphLayout = new GraphLayout(_this.saveGraph.bind(_this));
    _this.state = {
      graph: null
    };

    _this.svg = null;
    _this.group = null;

    _this.currentZoom = null;
    return _this;
  }

  _createClass(VisualGraph, [{
    key: "saveGraph",
    value: function saveGraph(graph) {
      this.setState({ graph: graph });
    }
  }, {
    key: "UNSAFE_componentWillReceiveProps",
    value: function UNSAFE_componentWillReceiveProps(nextProps) {
      if (nextProps.graph) {
        nextProps.graph._label.rankdir = nextProps.layout;
        this.graphLayout.layout(nextProps.graph);
      }
    }
  }, {
    key: "shouldComponentUpdate",
    value: function shouldComponentUpdate(nextProps, nextState) {
      return this.state !== nextState;
    }
  }, {
    key: "handleClick",
    value: function handleClick(node) {
      var selectedNode = node.id;
      this.setState({ selectedNode: selectedNode });

      var _state$graph$graph = this.state.graph.graph(),
          width = _state$graph$graph.width,
          height = _state$graph$graph.height;

      var idealSize = function idealSize(width, height, maxWidth, maxHeight) {
        var widthRatio = width / maxWidth;
        var heightRatio = height / maxHeight;
        var idealSize = widthRatio < heightRatio ? width : height;
        // console.log(`[${width}, ${height}], [${maxWidth}, ${maxHeight}], ${widthRatio}, ${heightRatio}, ideal = ${idealSize}`)
        return idealSize;
      };

      if (this.currentZoom === null) {
        this.currentZoom = [width / 2, height / 2, idealSize(width, height, width, height)];
      }
      var target = [node.x, node.y, idealSize(node.width, node.height, width, height)];

      this.transition(this.currentZoom, target, node);

      this.currentZoom = target;
    }
  }, {
    key: "transition",
    value: function transition(start, end, node) {
      var _state$graph$graph2 = this.state.graph.graph(),
          width = _state$graph$graph2.width,
          height = _state$graph$graph2.height;

      var center = {
        x: width / 2,
        y: height / 2
      };
      var i = d3.interpolateZoom(start, end);

      var transform = function transform(_ref) {
        var _ref2 = _slicedToArray(_ref, 3),
            x = _ref2[0],
            y = _ref2[1],
            size = _ref2[2];

        var scale = width / size;
        var translateX = center.x - x * scale;
        var translateY = center.y - y * scale;
        return "translate(" + translateX + "," + translateY + ")scale(" + scale + ")";
      };

      d3.select(this.group).attr("transform", transform(start)).transition().duration(i.duration).attrTween("transform", function () {
        return function (t) {
          return transform(i(t));
        };
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      if (!this.state.graph) {
        // console.log(this.state.graph)
        return null;
      }

      var g = this.state.graph;

      var nodes = g.nodes().map(function (nodeName) {
        var n = g.node(nodeName);
        var props = {
          key: nodeName,
          node: n,
          onClick: _this2.handleClick.bind(_this2)
        };

        var Type = nodeDispatch(n);

        return React.createElement(Type, props);
      });

      var edges = g.edges().map(function (edgeName) {
        var e = g.edge(edgeName);
        return React.createElement(Edge, { key: edgeName.v + "->" + edgeName.w, edge: e });
      });

      var _g$graph = g.graph(),
          width = _g$graph.width,
          height = _g$graph.height;

      return React.createElement(
        "svg",
        {
          ref: function ref(el) {
            _this2.svg = el;
          },
          id: "visualization",
          xmlns: "http://www.w3.org/2000/svg",
          version: "1.1",
          viewBox: "0 0 " + width + " " + height
        },
        React.createElement(
          "style",
          null,
          fs.readFileSync(__dirname + "/src/bundle.css", "utf-8", function (err) {
            console.log(err);
          })
        ),
        React.createElement(
          "defs",
          null,
          React.createElement(Arrow, null)
        ),
        React.createElement(
          "g",
          {
            id: "graph",
            ref: function ref(el) {
              _this2.group = el;
            }
          },
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

var Arrow = function Arrow() {
  return React.createElement(
    "marker",
    {
      id: "arrow",
      viewBox: "0 0 10 10",
      refX: "10",
      refY: "5",
      markerUnits: "strokeWidth",
      markerWidth: "10",
      markerHeight: "7.5",
      orient: "auto"
    },
    React.createElement("path", { d: "M 0 0 L 10 5 L 0 10 L 3 5 z", className: "arrow" })
  );
};

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
    key: "UNSAFE_componentWillReceiveProps",
    value: function UNSAFE_componentWillReceiveProps(nextProps) {
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
        { className: "edge", markerEnd: "url(#arrow)" },
        React.createElement(
          "path",
          { d: l(e.points) },
          React.createElement("animate", {
            ref: this.mount,
            key: Math.random(),
            restart: "always",
            from: l(this.state.previousPoints),
            to: l(e.points),
            begin: "0s",
            dur: "0.25s",
            fill: "freeze",
            repeatCount: "1",
            attributeName: "d"
          })
        )
      );
    }
  }]);

  return Edge;
}(React.Component);

var nodeDispatch = function nodeDispatch(n) {
  var Type = null;
  if (n.isMetanode === true) {
    if (n.isAnonymous) {
      Type = AnonymousMetanode;
    } else {
      Type = Metanode;
    }
  } else {
    Type = AtomNode;
  }
  return Type;
};

var Node = function Node(props) {
  var n = props.node;
  var type = n.isMetanode ? "metanode" : "node";

  var translateX = Math.floor(n.x - n.width / 2);
  var translateY = Math.floor(n.y - n.height / 2);

  return React.createElement(
    "g",
    {
      className: type + " " + n.class
      // TODO: fix zooming
      // onClick={props.onClick.bind(this, props.node)}
      , transform: "translate(" + translateX + "," + translateY + ")"
    },
    React.createElement(
      "foreignObject",
      { width: props.node.width, height: props.node.height },
      React.createElement(
        "section",
        {
          style: {
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            width: "100%",
            overflow: "hidden",
            borderRadius: "10px",
            backgroundColor: props.node.style ? props.node.style.fill : undefined,
            boxShadow: "0px 0px 0px 1px white"
          }
        },
        props.children
      )
    )
  );
};

var Metanode = function Metanode(props) {
  return React.createElement(
    Node,
    props,
    "muuuu"
  );
};

var AnonymousMetanode = function AnonymousMetanode(props) {
  return React.createElement(Node, props);
};

var AtomNode = function AtomNode(props) {
  return React.createElement(
    Node,
    props,
    React.createElement(NodeContent, { node: props.node })
  );
};

var NodeContent = function NodeContent(_ref3) {
  var node = _ref3.node;

  var id = node.userGeneratedId;
  if (!node.hasOwnProperty("parameters")) {
    console.warn("WTF", node);
    return null;
  }

  var params = node.parameters.length !== 0 ? React.createElement(
    "div",
    {
      style: {
        background: "rgba(0, 0, 0, 0.2)",
        fontSize: "0.8em",
        maxWidth: "100%",
        width: "100%",
        paddingTop: "3px",
        paddingBottom: "3px"
      }
    },
    React.createElement(
      "table",
      {
        style: {
          borderCollapse: "collapse",
          width: "100%",
          lineHeight: "14px"
        }
      },
      React.createElement(
        "tbody",
        null,
        node.parameters.map(function (_ref4, i) {
          var _ref5 = _slicedToArray(_ref4, 2),
              key = _ref5[0],
              value = _ref5[1];

          return React.createElement(
            "tr",
            { key: key },
            React.createElement(
              "td",
              {
                style: {
                  paddingRight: "0.25em",
                  fontWeight: "bold",
                  textAlign: "right"
                }
              },
              key
            ),
            React.createElement(
              "td",
              { style: { paddingLeft: "0.25em" } },
              value
            )
          );
        })
      )
    )
  ) : null;

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "header",
      {
        style: {
          padding: "3px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }
      },
      id && React.createElement(
        "div",
        { className: "id", style: { fontWeight: "bold" } },
        id
      ),
      React.createElement(
        "div",
        null,
        node.class
      )
    ),
    params
  );
};
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvSW50ZXJwcmV0ZXIuanMiLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvUGFuZWwuanN4Iiwic2NyaXB0cy9QYXJzZXIuanMiLCJzY3JpcHRzL1B5VG9yY2hHZW5lcmF0b3IuanMiLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSxnQjs7OzthQUNGLFMsR0FBWSxJQUFJLFNBQUosQ0FBYztBQUN0Qix3QkFBWSxDQUFDLEdBQUQsQ0FEVTtBQUV0Qix1QkFBVyxDQUFDLElBQUQsQ0FGVztBQUd0QixrQkFBTSxLQUFLO0FBSFcsU0FBZCxDO2FBTVosUyxHQUFZLElBQUksU0FBSixDQUFjO0FBQ3RCLHdCQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFEO0FBRlcsU0FBZCxDOzs7OztpQ0FLSCxHLEVBQUs7QUFDVixnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsd0JBQVEsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUFSO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsdUJBQU8sT0FBTyxFQUFQLEdBQVksSUFBSSxVQUFKLENBQWUsQ0FBZixJQUFvQixFQUF2QztBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7NEJBRUcsRyxFQUFLO0FBQ0wsbUJBQU8sS0FBSyxTQUFMLENBQWUsR0FBZixDQUFtQixHQUFuQixDQUFQO0FBQ0g7Ozs7Ozs7Ozs7Ozs7OztJQzlCQyxrQjs7O3NCQVVPO0FBQ1gsT0FBSSxZQUFZLEtBQUssYUFBTCxDQUFtQixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBL0MsQ0FBaEI7QUFDQSxVQUFPLEtBQUssU0FBTCxDQUFlLFNBQWYsQ0FBUDtBQUNBOzs7c0JBRWU7QUFDZixPQUFJLFlBQVksS0FBSyxhQUFMLENBQW1CLEtBQUssYUFBTCxDQUFtQixNQUFuQixHQUE0QixDQUEvQyxDQUFoQjtBQUNBLFVBQU8sS0FBSyxVQUFMLENBQWdCLFNBQWhCLENBQVA7QUFDQSxHO29CQUVhLEssRUFBTztBQUNwQixPQUFJLFlBQVksS0FBSyxhQUFMLENBQW1CLEtBQUssYUFBTCxDQUFtQixNQUFuQixHQUE0QixDQUEvQyxDQUFoQjtBQUNBLFFBQUssVUFBTCxDQUFnQixTQUFoQixJQUE2QixLQUE3QjtBQUNBOzs7c0JBRXVCO0FBQ3ZCLE9BQUksWUFBWSxLQUFLLGFBQUwsQ0FBbUIsS0FBSyxhQUFMLENBQW1CLE1BQW5CLEdBQTRCLENBQS9DLENBQWhCO0FBQ0EsVUFBTyxLQUFLLGtCQUFMLENBQXdCLFNBQXhCLENBQVA7QUFDQSxHO29CQUVxQixLLEVBQU87QUFDNUIsT0FBSSxZQUFZLEtBQUssYUFBTCxDQUFtQixLQUFLLGFBQUwsQ0FBbUIsTUFBbkIsR0FBNEIsQ0FBL0MsQ0FBaEI7QUFDQSxRQUFLLGtCQUFMLENBQXdCLFNBQXhCLElBQXFDLEtBQXJDO0FBQ0E7OztBQUVELDZCQUFZLE1BQVosRUFBb0I7QUFBQTs7QUFBQSxPQWxDcEIsV0FrQ29CLEdBbENOLEVBa0NNO0FBQUEsT0FqQ3BCLFVBaUNvQixHQWpDUCxFQWlDTztBQUFBLE9BaENwQixrQkFnQ29CLEdBaENDLEVBZ0NEO0FBQUEsT0E5QnBCLFVBOEJvQixHQTlCUCxJQUFJLFVBQUosRUE4Qk87QUFBQSxPQTVCcEIsU0E0Qm9CLEdBNUJSLEVBNEJRO0FBQUEsT0EzQnBCLGFBMkJvQixHQTNCSixFQTJCSTs7QUFDbkIsT0FBSyxVQUFMO0FBQ0EsT0FBSyxNQUFMLEdBQWMsTUFBZDtBQUNBOzs7OytCQUVZO0FBQ1osUUFBSyxXQUFMLEdBQW1CLEVBQW5CO0FBQ0EsUUFBSyxVQUFMLENBQWdCLFVBQWhCO0FBQ0EsUUFBSyxjQUFMOztBQUVBLFFBQUssU0FBTCxHQUFpQixFQUFqQjtBQUNBLFFBQUssaUJBQUwsR0FBeUIsRUFBekI7O0FBRUEsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsUUFBSyxhQUFMLEdBQXFCLEVBQXJCOztBQUVBO0FBQ0E7O0FBRU0sUUFBSyxPQUFMO0FBQ047OztxQ0FFa0IsSSxFQUFNO0FBQ3hCLFFBQUssU0FBTCxDQUFlLElBQWYsSUFBdUIsSUFBSSxTQUFTLEtBQWIsQ0FBbUI7QUFDekMsY0FBVTtBQUQrQixJQUFuQixDQUF2QjtBQUdBLFFBQUssU0FBTCxDQUFlLElBQWYsRUFBcUIsUUFBckIsQ0FBOEI7QUFDN0IsVUFBTSxJQUR1QjtBQUV2QixhQUFTLElBRmM7QUFHdkIsYUFBUyxFQUhjO0FBSXZCLGFBQVMsRUFKYztBQUt2QixhQUFTLEVBTGM7QUFNdkIsYUFBUyxFQU5jO0FBT3ZCLGFBQVM7QUFQYyxJQUE5QjtBQVNBLFFBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixJQUF4QjtBQUNBOztBQUVBLFVBQU8sS0FBSyxTQUFMLENBQWUsSUFBZixDQUFQO0FBQ0E7OztzQ0FFbUI7QUFDbkIsVUFBTyxLQUFLLGFBQUwsQ0FBbUIsR0FBbkIsRUFBUDtBQUNBOzs7cUNBRWtCLEksRUFBTTtBQUN4QixPQUFJLENBQUMsS0FBSyxXQUFMLENBQWlCLGNBQWpCLENBQWdDLElBQWhDLENBQUwsRUFBNEM7QUFDM0MsU0FBSyxXQUFMLENBQWlCLElBQWpCLElBQXlCLENBQXpCO0FBQ0E7QUFDRCxRQUFLLFdBQUwsQ0FBaUIsSUFBakIsS0FBMEIsQ0FBMUI7QUFDQSxPQUFJLEtBQUssT0FBTyxJQUFQLEdBQWMsS0FBSyxXQUFMLENBQWlCLElBQWpCLENBQXZCO0FBQ0EsVUFBTyxFQUFQO0FBQ0E7Ozs0QkFFUztBQUNULFFBQUssa0JBQUwsQ0FBd0IsTUFBeEI7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsR0FBckI7QUFDQSxPQUFJLEtBQUssS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFUOztBQUVBLFFBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsRUFBbkIsRUFBdUI7QUFDdEIsV0FBTztBQURlLElBQXZCO0FBR0E7Ozs0QkFFUyxRLEVBQVU7QUFDbkI7QUFDQSxPQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsUUFBbkIsQ0FBSixFQUFrQztBQUNqQyxTQUFLLFNBQUwsQ0FBZSxJQUFmLENBQW9CLFFBQXBCOztBQUVBLFFBQUksS0FBSyxpQkFBTCxDQUF1QixNQUF2QixLQUFrQyxDQUF0QyxFQUF5QztBQUN4QyxVQUFLLE9BQUwsQ0FBYSxLQUFLLGlCQUFMLENBQXVCLENBQXZCLENBQWIsRUFBd0MsUUFBeEM7QUFDQSxLQUZELE1BRU8sSUFBSSxLQUFLLGlCQUFMLENBQXVCLE1BQXZCLEdBQWdDLENBQXBDLEVBQXVDO0FBQzdDLFVBQUssT0FBTCxDQUFhLEtBQUssaUJBQWxCLEVBQXFDLFFBQXJDO0FBQ0E7QUFDRCxJQVJELE1BUU87QUFDTixZQUFRLElBQVIsMENBQW1ELFFBQW5EO0FBQ0E7QUFDRDs7O2dDQUVhLEUsRUFBSTtBQUNqQixRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsRUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxPQUFJLE9BQU87QUFDVixxQkFBaUIsRUFEUDtBQUVWLFdBQU8sV0FGRztBQUdWLFlBQVE7QUFIRSxJQUFYOztBQU1BLE9BQUksQ0FBQyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLENBQUwsRUFBbUM7QUFDbEMsU0FBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQixlQUNJLElBREo7QUFFQyxZQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLE1BQXBCLEVBQTRCLEtBQUssZUFBTCxHQUF1QixLQUFLLGVBQUwsQ0FBcUIsTUFBNUMsR0FBcUQsQ0FBakYsSUFBc0Y7QUFGOUY7QUFJQSxTQUFLLFNBQUwsQ0FBZSxRQUFmLEVBQXlCLEtBQXpCO0FBQ0E7O0FBRUQsUUFBSyxTQUFMLENBQWUsUUFBZjtBQUNBLFFBQUssVUFBTCxDQUFnQixHQUFoQjtBQUNBOzs7NkJBRVUsRSxFQUFJLEksRUFBTTtBQUNwQixRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsRUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxPQUFJLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsUUFBbkIsQ0FBSixFQUFrQztBQUNqQyxZQUFRLElBQVIsd0JBQWlDLEVBQWpDO0FBQ0E7O0FBRUQsUUFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixRQUFuQixlQUNJLElBREo7QUFFQyxRQUFJO0FBRkw7QUFJQSxRQUFLLFNBQUwsQ0FBZSxRQUFmLEVBQXlCLEtBQXpCOztBQUVBLFFBQUssU0FBTCxDQUFlLFFBQWY7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7O0FBRUEsVUFBTyxRQUFQO0FBQ0E7OztpQ0FFYyxVLEVBQVksSSxFQUFNO0FBQUE7O0FBQ2hDLE9BQU0sZ0JBQWdCLEtBQUssS0FBM0I7QUFDQSxRQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsVUFBckI7QUFDQSxPQUFJLFdBQVcsS0FBSyxVQUFMLENBQWdCLHNCQUFoQixFQUFmO0FBQ0EsT0FBSSxRQUFRLEtBQUssVUFBTCxDQUFnQix1QkFBaEIsRUFBWjs7QUFFQSxRQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLGVBQ0ksSUFESjtBQUVDLFFBQUksUUFGTDtBQUdDLGdCQUFZO0FBSGI7O0FBTUEsUUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixRQUFyQixFQUErQixLQUEvQjs7QUFFQSxPQUFJLGlCQUFpQixLQUFLLFNBQUwsQ0FBZSxhQUFmLENBQXJCO0FBQ0Esa0JBQWUsS0FBZixHQUF1QixPQUF2QixDQUErQixrQkFBVTtBQUN4QyxRQUFJLE9BQU8sZUFBZSxJQUFmLENBQW9CLE1BQXBCLENBQVg7QUFDQSxRQUFJLENBQUMsSUFBTCxFQUFXO0FBQUU7QUFBUTtBQUNyQixRQUFJLFlBQVksT0FBTyxPQUFQLENBQWUsR0FBZixFQUFvQixRQUFwQixDQUFoQjtBQUNBLFFBQUksdUJBQ0EsSUFEQTtBQUVILFNBQUk7QUFGRCxNQUFKO0FBSUEsVUFBSyxLQUFMLENBQVcsT0FBWCxDQUFtQixTQUFuQixFQUE4QixPQUE5Qjs7QUFFQSxRQUFJLFlBQVksZUFBZSxNQUFmLENBQXNCLE1BQXRCLEVBQThCLE9BQTlCLENBQXNDLEdBQXRDLEVBQTJDLFFBQTNDLENBQWhCO0FBQ0EsVUFBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixTQUFyQixFQUFnQyxTQUFoQztBQUNBLElBWkQ7O0FBY0Esa0JBQWUsS0FBZixHQUF1QixPQUF2QixDQUErQixnQkFBUTtBQUN0QyxRQUFNLElBQUksZUFBZSxJQUFmLENBQW9CLElBQXBCLENBQVY7QUFDQSxVQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLEtBQUssQ0FBTCxDQUFPLE9BQVAsQ0FBZSxHQUFmLEVBQW9CLFFBQXBCLENBQW5CLEVBQWtELEtBQUssQ0FBTCxDQUFPLE9BQVAsQ0FBZSxHQUFmLEVBQW9CLFFBQXBCLENBQWxELEVBQWlGLEVBQWpGO0FBQ0EsSUFIRDs7QUFLQSxRQUFLLFVBQUwsQ0FBZ0IsR0FBaEI7O0FBRUEsUUFBSyxTQUFMLENBQWUsUUFBZjtBQUNBOzs7bUNBRWdCO0FBQ2hCLFFBQUssaUJBQUwsR0FBeUIsRUFBekI7QUFDQSxRQUFLLFNBQUwsR0FBaUIsRUFBakI7QUFDQTs7O29DQUVpQjtBQUNqQixRQUFLLGlCQUFMLGdDQUE2QixLQUFLLFNBQWxDO0FBQ0EsUUFBSyxTQUFMLEdBQWlCLEVBQWpCO0FBQ0E7Ozs0QkFFUyxTLEVBQVcsVSxFQUFZO0FBQ2hDLFVBQU8sS0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixTQUFyQixFQUFnQyxVQUFoQyxDQUFQO0FBQ0E7OzswQkFFTyxRLEVBQVU7QUFDakIsT0FBTSxjQUFlLEtBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsUUFBbkIsRUFBNkIsTUFBN0IsS0FBd0MsQ0FBN0Q7QUFDQSxPQUFNLFVBQVcsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixRQUFoQixFQUEwQixLQUExQixLQUFvQyxPQUFyRDtBQUNBLE9BQU0sY0FBZSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLEtBQTFCLEtBQW9DLFdBQXpEO0FBQ0EsVUFBUSxXQUFZLGVBQWUsV0FBbkM7QUFDQTs7OzJCQUVRLFEsRUFBVTtBQUNsQixPQUFNLGNBQWUsS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixRQUFwQixFQUE4QixNQUE5QixLQUF5QyxDQUE5RDtBQUNBLE9BQU0sV0FBWSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLEtBQTFCLEtBQW9DLFFBQXREO0FBQ0EsT0FBTSxjQUFlLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsUUFBaEIsRUFBMEIsS0FBMUIsS0FBb0MsV0FBekQ7QUFDQSxVQUFRLFlBQWEsZUFBZSxXQUFwQztBQUNBOzs7NkJBRVUsUSxFQUFVO0FBQ3BCO0FBQ0EsVUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFFBQWhCLEVBQTBCLFVBQTFCLEtBQXlDLElBQWhEO0FBQ0E7OztpQ0FFYyxTLEVBQVc7QUFBQTs7QUFDekIsT0FBSSxRQUFRLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsU0FBaEIsQ0FBWjtBQUNBLE9BQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLFNBQXBCLEVBQStCLE1BQS9CLENBQXNDO0FBQUEsV0FBUSxPQUFLLFFBQUwsQ0FBYyxJQUFkLENBQVI7QUFBQSxJQUF0QyxDQUFsQjs7QUFFQSxPQUFJLFlBQVksTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUM3QixXQUFPLElBQVA7QUFDQSxTQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLFFBQW5CLENBQTRCO0FBQzNCLDhCQUFzQixNQUFNLEVBQTVCLHFDQUQyQjtBQUUzQixXQUFNLE9BRnFCO0FBRzNCLGVBQVU7QUFDVCxhQUFPLE1BQU0sT0FBTixHQUFnQixNQUFNLE9BQU4sQ0FBYyxRQUE5QixHQUF5QyxDQUR2QztBQUVULFdBQUssTUFBTSxPQUFOLEdBQWdCLE1BQU0sT0FBTixDQUFjLE1BQTlCLEdBQXVDO0FBRm5DO0FBSGlCLEtBQTVCO0FBUUEsV0FBTyxJQUFQO0FBQ0EsSUFYRCxNQVdPLElBQUksWUFBWSxNQUFaLEtBQXVCLENBQXZCLElBQTRCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0IsWUFBWSxDQUFaLENBQWhCLEVBQWdDLFVBQWhFLEVBQTRFO0FBQ2xGLFdBQU8sS0FBSyxjQUFMLENBQW9CLFlBQVksQ0FBWixDQUFwQixDQUFQO0FBQ0E7O0FBRUQsVUFBTyxXQUFQO0FBQ0E7OztnQ0FFYSxTLEVBQVc7QUFBQTs7QUFDeEIsV0FBUSxHQUFSLENBQVksU0FBWjtBQUNBLE9BQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLFNBQWhCLENBQVo7QUFDQSxPQUFJLGFBQWEsS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFvQixTQUFwQixFQUErQixNQUEvQixDQUFzQztBQUFBLFdBQVEsT0FBSyxPQUFMLENBQWEsSUFBYixDQUFSO0FBQUEsSUFBdEMsQ0FBakI7QUFDQSxXQUFRLEdBQVIsQ0FBWSxVQUFaOztBQUVBLE9BQUksV0FBVyxNQUFYLEtBQXNCLENBQTFCLEVBQTZCO0FBQzVCLFdBQU8sSUFBUDtBQUNBLFNBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsUUFBbkIsQ0FBNEI7QUFDM0IsOEJBQXNCLE1BQU0sRUFBNUIscUNBRDJCO0FBRTNCLFdBQU0sT0FGcUI7QUFHM0IsZUFBVTtBQUNULGFBQU8sTUFBTSxPQUFOLEdBQWdCLE1BQU0sT0FBTixDQUFjLFFBQTlCLEdBQXlDLENBRHZDO0FBRVQsV0FBTSxNQUFNLE9BQU4sR0FBZ0IsTUFBTSxPQUFOLENBQWMsTUFBOUIsR0FBdUM7QUFGcEM7QUFIaUIsS0FBNUI7QUFRQSxXQUFPLElBQVA7QUFDQSxJQVhELE1BV08sSUFBSSxXQUFXLE1BQVgsS0FBc0IsQ0FBdEIsSUFBMkIsS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFnQixXQUFXLENBQVgsQ0FBaEIsRUFBK0IsVUFBOUQsRUFBMEU7QUFDaEYsV0FBTyxLQUFLLGFBQUwsQ0FBbUIsV0FBVyxDQUFYLENBQW5CLENBQVA7QUFDQTs7QUFFRCxVQUFPLFVBQVA7QUFDQTs7OzBCQUVPLFEsRUFBVSxNLEVBQVE7QUFDekIsV0FBUSxJQUFSLDJCQUFvQyxRQUFwQyxnQkFBcUQsTUFBckQ7QUFDQSxPQUFJLFdBQUo7O0FBRUEsT0FBSSxPQUFPLFFBQVAsS0FBb0IsUUFBeEIsRUFBa0M7QUFDakMsUUFBSSxLQUFLLFVBQUwsQ0FBZ0IsUUFBaEIsQ0FBSixFQUErQjtBQUM5QixtQkFBYyxLQUFLLGNBQUwsQ0FBb0IsUUFBcEIsQ0FBZDtBQUNBLEtBRkQsTUFFTztBQUNOLG1CQUFjLENBQUMsUUFBRCxDQUFkO0FBQ0E7QUFDRCxJQU5ELE1BTU8sSUFBSSxNQUFNLE9BQU4sQ0FBYyxRQUFkLENBQUosRUFBNkI7QUFDbkMsa0JBQWMsUUFBZDtBQUNBOztBQUVELE9BQUksV0FBSjs7QUFFQSxPQUFJLE9BQU8sTUFBUCxLQUFrQixRQUF0QixFQUFnQztBQUMvQixRQUFJLEtBQUssVUFBTCxDQUFnQixNQUFoQixDQUFKLEVBQTZCO0FBQzVCLG1CQUFjLEtBQUssYUFBTCxDQUFtQixNQUFuQixDQUFkO0FBQ0EsS0FGRCxNQUVPO0FBQ04sbUJBQWMsQ0FBQyxNQUFELENBQWQ7QUFDQTtBQUNELElBTkQsTUFNTyxJQUFJLE1BQU0sT0FBTixDQUFjLE1BQWQsQ0FBSixFQUEyQjtBQUNqQyxrQkFBYyxNQUFkO0FBQ0E7O0FBRUQsUUFBSyxZQUFMLENBQWtCLFdBQWxCLEVBQStCLFdBQS9CO0FBQ0E7OzsrQkFFWSxXLEVBQWEsVyxFQUFhO0FBQUE7O0FBRXRDLE9BQUksZ0JBQWdCLElBQWhCLElBQXdCLGdCQUFnQixJQUE1QyxFQUFrRDtBQUNqRDtBQUNBOztBQUVELE9BQUksWUFBWSxNQUFaLEtBQXVCLFlBQVksTUFBdkMsRUFBK0M7QUFDOUMsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFlBQVksTUFBaEMsRUFBd0MsR0FBeEMsRUFBNkM7QUFDNUMsU0FBSSxZQUFZLENBQVosS0FBa0IsWUFBWSxDQUFaLENBQXRCLEVBQXNDO0FBQ3JDLFdBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsWUFBWSxDQUFaLENBQW5CLEVBQW1DLFlBQVksQ0FBWixDQUFuQyxFQUFtRCxFQUFuRDtBQUNBO0FBQ0Q7QUFDRCxJQU5ELE1BTU87QUFDTixRQUFJLFlBQVksTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUM3QixpQkFBWSxPQUFaLENBQW9CO0FBQUEsYUFBYyxPQUFLLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLFlBQVksQ0FBWixDQUF6QixDQUFkO0FBQUEsTUFBcEI7QUFDQSxLQUZELE1BRU8sSUFBSSxZQUFZLE1BQVosS0FBdUIsQ0FBM0IsRUFBOEI7QUFDcEMsaUJBQVksT0FBWixDQUFvQjtBQUFBLGFBQWMsT0FBSyxPQUFMLENBQWEsWUFBWSxDQUFaLENBQWIsRUFBNkIsVUFBN0IsQ0FBZDtBQUFBLE1BQXBCO0FBQ0EsS0FGTSxNQUVBO0FBQ04sVUFBSyxNQUFMLENBQVksTUFBWixDQUFtQixRQUFuQixDQUE0QjtBQUMzQixxREFBNkMsWUFBWSxNQUF6RCxjQUF3RSxZQUFZLE1BQXBGLE1BRDJCO0FBRTNCLFlBQU0sT0FGcUI7QUFHM0IsZ0JBQVU7QUFDVDtBQUNBO0FBRlM7QUFIaUIsTUFBNUI7QUFRQTtBQUNEO0FBRUQ7OzswQkFFTyxRLEVBQVU7QUFDakIsVUFBTyxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQW1CLFFBQW5CLENBQVA7QUFDQTs7OzZCQUVVO0FBQ1Y7QUFDQSxVQUFPLEtBQUssS0FBWjtBQUNBOzs7aUNBRWM7QUFDZCxVQUFPLEtBQUssU0FBWjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7SUMzVkksTTs7O0FBQ0Ysb0JBQVksS0FBWixFQUFtQjtBQUFBOztBQUFBLG9IQUNULEtBRFM7O0FBRWYsY0FBSyxRQUFMLEdBQWdCLE1BQUssUUFBTCxDQUFjLElBQWQsT0FBaEI7QUFDQSxjQUFLLE1BQUwsR0FBYyxJQUFkO0FBQ0EsY0FBSyxPQUFMLEdBQWUsRUFBZjtBQUplO0FBS2xCOzs7O21DQUVVO0FBQ1AsaUJBQUssYUFBTDs7QUFFQSxnQkFBSSxLQUFLLEtBQUwsQ0FBVyxRQUFmLEVBQXlCO0FBQ3JCLG9CQUFJLFdBQVcsS0FBSyxNQUFMLENBQVksUUFBWixFQUFmO0FBQ0EscUJBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsUUFBcEI7QUFDSDtBQUNKOzs7NkJBRUksTyxFQUFTO0FBQ1YsaUJBQUssU0FBTCxHQUFpQixPQUFqQjtBQUNIOzs7aUNBRVEsSyxFQUFPO0FBQ1osaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsS0FBckIsRUFBNEIsQ0FBQyxDQUE3QjtBQUNIOzs7d0NBRWU7QUFBQTs7QUFDWixpQkFBSyxPQUFMLENBQWEsR0FBYixDQUFpQjtBQUFBLHVCQUFVLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsWUFBcEIsQ0FBaUMsTUFBakMsQ0FBVjtBQUFBLGFBQWpCO0FBQ0EsaUJBQUssT0FBTCxHQUFlLEVBQWY7QUFDSDs7O2dEQUV1QixLLEVBQU8sUyxFQUFXO0FBQ3RDLGdCQUFJLElBQUksS0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixVQUFwQixFQUFSO0FBQ0EsZ0JBQUksSUFBSSxVQUFVLFNBQVYsRUFBUjtBQUNBLGdCQUFJLFVBQVUsS0FBSyxPQUFMLENBQWEsR0FBYixDQUFpQjtBQUFBLHVCQUFNLEVBQUUsRUFBRixDQUFOO0FBQUEsYUFBakIsQ0FBZDtBQUNBLGdCQUFJLG1CQUFtQixRQUFRLEdBQVIsQ0FBWTtBQUFBLHVCQUFVLE9BQU8sS0FBUCxDQUFhLFFBQWIsQ0FBc0IsRUFBRSxHQUF4QixFQUE2QixFQUFFLE1BQS9CLENBQVY7QUFBQSxhQUFaLEVBQThELE1BQTlELENBQXNFLFVBQUMsSUFBRCxFQUFPLElBQVA7QUFBQSx1QkFBZ0IsUUFBUSxJQUF4QjtBQUFBLGFBQXRFLEVBQW9HLEtBQXBHLENBQXZCOztBQUVBLGdCQUFJLGdCQUFKLEVBQXNCO0FBQ2xCLHFCQUFLLE1BQUwsQ0FBWSxXQUFaLENBQXdCLGVBQXhCO0FBQ0g7QUFDSjs7OzRDQUVtQjtBQUNoQixpQkFBSyxNQUFMLEdBQWMsSUFBSSxJQUFKLENBQVMsS0FBSyxTQUFkLENBQWQ7QUFDQSxpQkFBSyxNQUFMLENBQVksVUFBWixHQUF5QixPQUF6QixDQUFpQyxjQUFjLEtBQUssS0FBTCxDQUFXLElBQTFEO0FBQ0EsaUJBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsZUFBZSxLQUFLLEtBQUwsQ0FBVyxLQUEvQztBQUNBLGlCQUFLLE1BQUwsQ0FBWSxrQkFBWixDQUErQixLQUEvQjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxVQUFaLENBQXVCO0FBQ25CLDJDQUEyQixJQURSO0FBRW5CLGdDQUFnQixJQUZHO0FBR25CLDBDQUEwQixLQUhQO0FBSW5CLHNCQUFNLElBSmE7QUFLbkIsMENBQTBCLElBTFA7QUFNbkIsNEJBQVksV0FOTztBQU9uQixpQ0FBaUIsSUFQRTtBQVFuQiw0QkFBWTtBQVJPLGFBQXZCO0FBVUEsaUJBQUssTUFBTCxDQUFZLGVBQVosR0FBOEIsUUFBOUI7QUFDQSxpQkFBSyxNQUFMLENBQVksU0FBWixDQUFzQixLQUF0QixDQUE0QixVQUE1QixHQUF5QyxHQUF6Qzs7QUFFQSxnQkFBSSxLQUFLLEtBQUwsQ0FBVyxZQUFmLEVBQTRCO0FBQ3hCLHFCQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQUssS0FBTCxDQUFXLFlBQWhDLEVBQThDLENBQUMsQ0FBL0M7QUFDSDs7QUFFRCxpQkFBSyxNQUFMLENBQVksRUFBWixDQUFlLFFBQWYsRUFBeUIsS0FBSyxRQUE5QjtBQUNBLGlCQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEVBQXRCLENBQXlCLGNBQXpCLEVBQXlDLEtBQUssdUJBQUwsQ0FBNkIsSUFBN0IsQ0FBa0MsSUFBbEMsQ0FBekM7QUFDSDs7O3lEQUVnQyxTLEVBQVc7QUFBQTs7QUFDeEMsZ0JBQUksVUFBVSxNQUFkLEVBQXNCO0FBQ2xCLG9CQUFJLGNBQWMsVUFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLGlCQUFTO0FBQzVDLHdCQUFJLFdBQVcsT0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixHQUFwQixDQUF3QixlQUF4QixDQUF3QyxNQUFNLFFBQU4sQ0FBZSxLQUF2RCxDQUFmO0FBQ0EsMkJBQU87QUFDSCw2QkFBSyxTQUFTLEdBRFg7QUFFSCxnQ0FBUSxTQUFTLE1BRmQ7QUFHSCw4QkFBTSxNQUFNLE9BSFQ7QUFJSCw4QkFBTSxNQUFNO0FBSlQscUJBQVA7QUFNSCxpQkFSaUIsQ0FBbEI7O0FBVUEscUJBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsY0FBcEIsQ0FBbUMsV0FBbkM7QUFDQTs7QUFFQSxvQkFBSSxRQUFRLFFBQVEsV0FBUixFQUFxQixLQUFqQzs7QUFFQSxxQkFBSyxhQUFMOztBQUVBLG9CQUFJLFVBQVUsVUFBVSxNQUFWLENBQWlCLEdBQWpCLENBQXFCLGlCQUFTO0FBQ3hDLHdCQUFJLFdBQVc7QUFDWCwrQkFBTyxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLENBQXdCLGVBQXhCLENBQXdDLE1BQU0sUUFBTixDQUFlLEtBQXZELENBREk7QUFFWCw2QkFBSyxPQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBQXBCLENBQXdCLGVBQXhCLENBQXdDLE1BQU0sUUFBTixDQUFlLEdBQXZEO0FBRk0scUJBQWY7O0FBS0Esd0JBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxTQUFTLEtBQVQsQ0FBZSxHQUF6QixFQUE4QixTQUFTLEtBQVQsQ0FBZSxNQUE3QyxFQUFxRCxTQUFTLEdBQVQsQ0FBYSxHQUFsRSxFQUF1RSxTQUFTLEdBQVQsQ0FBYSxNQUFwRixDQUFaOztBQUVBLDJCQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCLE9BQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsU0FBcEIsQ0FBOEIsS0FBOUIsRUFBcUMsY0FBckMsRUFBcUQsTUFBckQsQ0FBbEI7QUFDSCxpQkFUYSxDQUFkO0FBVUgsYUE1QkQsTUE0Qk87QUFDSCxxQkFBSyxNQUFMLENBQVksT0FBWixDQUFvQixnQkFBcEI7QUFDQSxxQkFBSyxNQUFMLENBQVksV0FBWixDQUF3QixlQUF4QjtBQUNIOztBQUVELGdCQUFJLFVBQVUsS0FBZCxFQUFxQjtBQUNqQixxQkFBSyxNQUFMLENBQVksUUFBWixDQUFxQixVQUFVLEtBQS9CLEVBQXNDLENBQUMsQ0FBdkM7QUFDSDtBQUNKOzs7aUNBRVE7QUFBQTs7QUFDTCxtQkFBTyw2QkFBSyxLQUFNLGFBQUMsT0FBRDtBQUFBLDJCQUFhLE9BQUssSUFBTCxDQUFVLE9BQVYsQ0FBYjtBQUFBLGlCQUFYLEdBQVA7QUFDSDs7OztFQTVHZ0IsTUFBTSxTOzs7Ozs7O0lDQXJCLFc7QUFNTCxzQkFBWSxRQUFaLEVBQXNCO0FBQUE7O0FBQUEsT0FMdEIsYUFLc0IsR0FMTixFQUtNO0FBQUEsT0FKdEIsZUFJc0IsR0FKSixDQUlJO0FBQUEsT0FIdEIsb0JBR3NCLEdBSEMsQ0FHRDs7QUFBQSxPQUZ0QixRQUVzQixHQUZYLFlBQVUsQ0FBRSxDQUVEOztBQUNyQixPQUFLLFFBQUwsR0FBZ0IsUUFBaEI7QUFDQTs7Ozt5QkFFTSxLLEVBQU87QUFDYixPQUFNLEtBQUssS0FBSyxXQUFMLEVBQVg7QUFDQSxRQUFLLGFBQUwsQ0FBbUIsRUFBbkIsSUFBeUIsSUFBSSxZQUFKLENBQWlCLEVBQWpCLEVBQXFCLEtBQXJCLEVBQTRCLEtBQUssY0FBTCxDQUFvQixJQUFwQixDQUF5QixJQUF6QixDQUE1QixDQUF6QjtBQUNBOzs7dUNBRTJCO0FBQUEsT0FBWixFQUFZLFFBQVosRUFBWTtBQUFBLE9BQVIsS0FBUSxRQUFSLEtBQVE7O0FBQzNCLE9BQUksTUFBTSxLQUFLLG9CQUFmLEVBQXFDO0FBQ3BDLFNBQUssb0JBQUwsR0FBNEIsRUFBNUI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxLQUFkO0FBQ0E7QUFDRDs7O2dDQUVhO0FBQ2IsUUFBSyxlQUFMLElBQXdCLENBQXhCO0FBQ0EsVUFBTyxLQUFLLGVBQVo7QUFDQTs7Ozs7O0lBR0ksWTtBQUdMLHVCQUFZLEVBQVosRUFBZ0IsS0FBaEIsRUFBdUIsVUFBdkIsRUFBbUM7QUFBQTs7QUFBQSxPQUZuQyxFQUVtQyxHQUY5QixDQUU4QjtBQUFBLE9BRG5DLE1BQ21DLEdBRDFCLElBQzBCOztBQUNsQyxPQUFLLEVBQUwsR0FBVSxFQUFWO0FBQ0EsT0FBSyxNQUFMLEdBQWMsSUFBSSxNQUFKLENBQVcsa0NBQVgsQ0FBZDtBQUNBLE9BQUssTUFBTCxDQUFZLGdCQUFaLENBQTZCLFNBQTdCLEVBQXdDLEtBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsSUFBbEIsQ0FBeEM7QUFDQSxPQUFLLFVBQUwsR0FBa0IsVUFBbEI7O0FBRUEsT0FBSyxNQUFMLENBQVksV0FBWixDQUF3QixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQXhCO0FBQ0E7Ozs7MEJBQ08sTyxFQUFTO0FBQ2hCLFFBQUssTUFBTCxDQUFZLFNBQVo7QUFDQSxRQUFLLFVBQUwsQ0FBZ0I7QUFDZixRQUFJLEtBQUssRUFETTtBQUVmLFdBQU8sS0FBSyxNQUFMLENBQVksUUFBUSxJQUFwQjtBQUZRLElBQWhCO0FBSUE7Ozt5QkFDTSxLLEVBQU87QUFDYixVQUFPLFNBQVMsSUFBVCxDQUFjLEtBQWQsQ0FBb0IsS0FBcEIsQ0FBUDtBQUNHOzs7eUJBRU0sSSxFQUFNO0FBQ2YsVUFBTyxTQUFTLElBQVQsQ0FBYyxJQUFkLENBQW1CLElBQW5CLENBQVA7QUFDRzs7Ozs7Ozs7Ozs7Ozs7O0FDcERMLElBQU0sTUFBTSxRQUFRLFVBQVIsRUFBb0IsV0FBaEM7QUFDQSxJQUFNLEtBQUssUUFBUSxJQUFSLENBQVg7O0lBRU0sRzs7O0FBT0wsY0FBWSxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsd0dBQ1osS0FEWTs7QUFBQSxRQU5uQixNQU1tQixHQU5WLElBQUksTUFBSixFQU1VO0FBQUEsUUFMbkIsV0FLbUIsR0FMTCxJQUFJLFdBQUosRUFLSztBQUFBLFFBSm5CLFNBSW1CLEdBSlAsSUFBSSxnQkFBSixFQUlPO0FBQUEsUUFGbkIsSUFFbUIsR0FGWixJQUVZOzs7QUFHbEIsUUFBSyxLQUFMLEdBQWE7QUFDWjtBQUNBO0FBQ0E7QUFDQSx3QkFBcUIsRUFKVDtBQUtaLFVBQU8sSUFMSztBQU1aLGFBQVUsSUFORTtBQU9aLGFBQVUsU0FQRTtBQVFaLG9CQUFpQjtBQVJMLEdBQWI7O0FBV0EsTUFBSSxFQUFKLENBQU8sTUFBUCxFQUFlLFVBQVMsS0FBVCxFQUFnQixPQUFoQixFQUF5QjtBQUN2QyxNQUFHLFNBQUgsQ0FBYSxRQUFRLE1BQVIsR0FBaUIsYUFBOUIsRUFBNkMsS0FBSyxLQUFMLENBQVcsaUJBQXhELEVBQTJFLFVBQVMsR0FBVCxFQUFjO0FBQ3ZGLFFBQUksR0FBSixFQUFTLE1BQU0sSUFBTjtBQUNWLElBRkQ7QUFHQSxNQUFHLFNBQUgsQ0FBYSxRQUFRLE1BQVIsR0FBaUIsa0JBQTlCLEVBQWtELEtBQUssU0FBTCxDQUFlLEtBQUssS0FBTCxDQUFXLEdBQTFCLEVBQStCLElBQS9CLEVBQXFDLENBQXJDLENBQWxELEVBQTJGLFVBQVMsR0FBVCxFQUFjO0FBQ3ZHLFFBQUksR0FBSixFQUFTLE1BQU0sSUFBTjtBQUNWLElBRkQ7QUFHQSxNQUFHLFNBQUgsQ0FBYSxRQUFRLE1BQVIsR0FBaUIsWUFBOUIsRUFBNEMsU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCLFNBQTFFLEVBQXFGLFVBQVMsR0FBVCxFQUFjO0FBQ2pHLFFBQUksR0FBSixFQUFTLE1BQU0sSUFBTjtBQUNWLElBRkQ7QUFHQSxNQUFHLFNBQUgsQ0FBYSxRQUFRLE1BQVIsR0FBaUIsYUFBOUIsRUFBNkMsS0FBSyxTQUFMLENBQWUsTUFBTSxRQUFOLENBQWUsSUFBZixDQUFvQixLQUFwQixDQUEwQixLQUFLLEtBQUwsQ0FBVyxLQUFyQyxDQUFmLEVBQTRELElBQTVELEVBQWtFLENBQWxFLENBQTdDLEVBQW1ILFVBQVMsR0FBVCxFQUFjO0FBQy9ILFFBQUksR0FBSixFQUFTLE1BQU0sSUFBTjtBQUNWLElBRkQ7QUFHQSxNQUFHLFNBQUgsQ0FBYSxRQUFRLE1BQVIsR0FBaUIscUJBQTlCLEVBQXFELEtBQUssS0FBTCxDQUFXLGFBQWhFLEVBQStFLFVBQVMsR0FBVCxFQUFjO0FBQzNGLFFBQUksR0FBSixFQUFTLE1BQU0sSUFBTjtBQUNWLElBRkQ7O0FBSUEsT0FBSSxtQkFBbUIsSUFBSSxZQUFKLENBQWlCLGNBQWpCLEVBQWlDO0FBQ3ZELHVDQUR1RDtBQUV2RCxZQUFRO0FBRitDLElBQWpDLENBQXZCOztBQWpCdUMsa0JBcUJyQixRQUFRLFVBQVIsQ0FyQnFCO0FBQUEsT0FxQi9CLEtBckIrQixZQXFCL0IsS0FyQitCOztBQXVCdkMsb0JBQWlCLE9BQWpCLEdBQTJCLFlBQU07QUFDaEMsVUFBTSxnQkFBTixDQUF1QixRQUFRLE1BQS9CO0FBQ0EsSUFGRDtBQUdBLEdBMUJjLENBMEJiLElBMUJhLE9BQWY7O0FBNEJBLE1BQUksRUFBSixDQUFPLGNBQVAsRUFBdUIsVUFBQyxDQUFELEVBQUksQ0FBSixFQUFVO0FBQ2hDLFNBQUssWUFBTDtBQUNBLEdBRkQ7O0FBSUEsTUFBSSxFQUFKLENBQU8sTUFBUCxFQUFlLFVBQUMsQ0FBRCxFQUFJLENBQUosRUFBVTtBQUN4QixTQUFLLFFBQUwsQ0FBYyxFQUFFLFFBQWhCO0FBQ0EsR0FGRDs7QUFJQSxNQUFJLFNBQVMsT0FBTyxZQUFQLENBQW9CLE9BQXBCLENBQTRCLFFBQTVCLENBQWI7QUFDQSxNQUFJLE1BQUosRUFBWTtBQUNYLE9BQUksVUFBVSxTQUFWLElBQXVCLFVBQVUsTUFBckMsRUFBNkM7QUFDNUMsVUFBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixNQUFwQjtBQUNBLElBRkQsTUFFTztBQUNOLFVBQUssV0FBTCxDQUFpQixNQUFqQixDQUF3QixRQUF4QixDQUFpQztBQUNoQyxXQUFNLFNBRDBCO0FBRWhDO0FBRmdDLEtBQWpDO0FBSUE7QUFDRDs7QUFFRCxRQUFLLHVCQUFMLEdBQStCLE1BQUssdUJBQUwsQ0FBNkIsSUFBN0IsT0FBL0I7QUFDQSxRQUFLLDhCQUFMLEdBQXNDLE1BQUssOEJBQUwsQ0FBb0MsSUFBcEMsT0FBdEM7QUEvRGtCO0FBZ0VsQjs7OzsyQkFFUSxRLEVBQVU7QUFDbEIsV0FBUSxHQUFSLENBQVksVUFBWixFQUF3QixRQUF4QjtBQUNBLE9BQUksY0FBYyxHQUFHLFlBQUgsQ0FBZ0IsUUFBaEIsRUFBMEIsTUFBMUIsQ0FBbEI7QUFDQSxRQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLFdBQXJCLENBQWtDO0FBQWxDLEtBQ0EsS0FBSyxRQUFMLENBQWM7QUFDYix1QkFBbUI7QUFETixJQUFkO0FBR0E7Ozs4QkFFVyxFLEVBQUk7QUFDZixPQUFJLGNBQWMsR0FBRyxZQUFILENBQW1CLFNBQW5CLGtCQUF5QyxFQUF6QyxXQUFtRCxNQUFuRCxDQUFsQjtBQUNBLFFBQUssTUFBTCxDQUFZLFFBQVosQ0FBcUIsV0FBckIsQ0FBa0M7QUFBbEMsS0FDQSxLQUFLLFFBQUwsQ0FBYztBQUNiLHVCQUFtQjtBQUROLElBQWQ7QUFHQTs7O3NDQUVtQjtBQUNuQixRQUFLLFdBQUwsQ0FBaUIsb0JBQWpCO0FBQ0E7OztpREFFOEIsSyxFQUFPO0FBQUE7O0FBQ3JDLE9BQUksS0FBSyxJQUFULEVBQWU7QUFBRSxpQkFBYSxLQUFLLElBQWxCO0FBQTBCO0FBQzNDLFFBQUssSUFBTCxHQUFZLFdBQVcsWUFBTTtBQUFFLFdBQUssdUJBQUwsQ0FBNkIsS0FBN0I7QUFBc0MsSUFBekQsRUFBMkQsR0FBM0QsQ0FBWjtBQUNBOzs7MENBRXVCLEssRUFBTTtBQUM3QixXQUFRLElBQVIsQ0FBYSx5QkFBYjtBQUNBLE9BQUksU0FBUyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEtBQWpCLENBQWI7O0FBRUEsT0FBSSxPQUFPLEdBQVgsRUFBZ0I7QUFDZixTQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsT0FBTyxHQUFoQztBQUNBLFFBQUksUUFBUSxLQUFLLFdBQUwsQ0FBaUIscUJBQWpCLEVBQVo7QUFDQSxRQUFJLGNBQWMsS0FBSyxXQUFMLENBQWlCO0FBQ25DOztBQURrQixNQUFsQixDQUdBLEtBQUssUUFBTCxDQUFjO0FBQ2Isd0JBQW1CLEtBRE47QUFFYixVQUFLLE9BQU8sR0FGQztBQUdiLFlBQU8sS0FITTtBQUliLG9CQUFlLEtBQUssU0FBTCxDQUFlLFlBQWYsQ0FBNEIsS0FBNUIsRUFBbUMsV0FBbkMsQ0FKRjtBQUtiLGFBQVEsS0FBSyxXQUFMLENBQWlCLFNBQWpCO0FBTEssS0FBZDtBQU9BLElBYkQsTUFhTztBQUNOO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDYix3QkFBbUIsS0FETjtBQUViLFVBQUssSUFGUTtBQUdiLFlBQU8sSUFITTtBQUliLGFBQVEsQ0FBQztBQUNSLGdCQUFVO0FBQ1QsY0FBTyxPQUFPLFFBQVAsR0FBa0IsQ0FEaEI7QUFFVCxZQUFLLE9BQU87QUFGSCxPQURGO0FBS1IsZUFBUyxjQUFjLE9BQU8sUUFBckIsR0FBZ0MsR0FMakM7QUFNUixZQUFNO0FBTkUsTUFBRDtBQUpLLEtBQWQ7QUFhQTtBQUNELFdBQVEsT0FBUixDQUFnQix5QkFBaEI7QUFDQTs7O2lDQUVjO0FBQ2QsUUFBSyxRQUFMLENBQWM7QUFDYixZQUFTLEtBQUssS0FBTCxDQUFXLE1BQVgsS0FBc0IsU0FBdkIsR0FBb0MsTUFBcEMsR0FBNkM7QUFEeEMsSUFBZDtBQUdBLGNBQVcsWUFBTTtBQUNoQixXQUFPLGFBQVAsQ0FBcUIsSUFBSSxLQUFKLENBQVUsUUFBVixDQUFyQjtBQUNBLElBRkQsRUFFRyxHQUZIO0FBR0E7OzsyQkFFUTtBQUFBOztBQUNSLE9BQUksa0JBQWtCLEtBQUssS0FBTCxDQUFXLE1BQWpDO0FBQ0EsT0FBSSxjQUFjLEtBQUssS0FBTCxDQUFXLE1BQVgsS0FBc0IsU0FBdEIsR0FBa0MsSUFBbEMsR0FBeUMsSUFBM0Q7O0FBRUcsVUFBTztBQUFBO0FBQUEsTUFBSyxJQUFHLFdBQVIsRUFBb0IsMEJBQXdCLGVBQTVDO0FBQ047QUFBQyxVQUFEO0FBQUEsT0FBTyxJQUFHLFlBQVY7QUFDQyx5QkFBQyxNQUFEO0FBQ0MsV0FBSyxhQUFDLElBQUQ7QUFBQSxjQUFTLE9BQUssTUFBTCxHQUFjLElBQXZCO0FBQUEsT0FETjtBQUVDLFlBQUssUUFGTjtBQUdDLGFBQU0sU0FIUDtBQUlDLGNBQVEsS0FBSyxLQUFMLENBQVcsTUFKcEI7QUFLQyxnQkFBVSxLQUFLLDhCQUxoQjtBQU1DLG9CQUFjLEtBQUssS0FBTCxDQUFXO0FBTjFCO0FBREQsS0FETTtBQVlOO0FBQUMsVUFBRDtBQUFBLE9BQU8sSUFBRyxlQUFWO0FBQ0MseUJBQUMsV0FBRCxJQUFhLE9BQU8sS0FBSyxLQUFMLENBQVcsS0FBL0IsRUFBc0MsUUFBUSxXQUE5QztBQUREO0FBWk0sSUFBUDtBQXFDRDs7OztFQXpMYyxNQUFNLFM7Ozs7Ozs7Ozs7Ozs7QUNIeEI7Ozs7QUFJQSxJQUFNLGFBQWEsUUFBUSxvQkFBUixDQUFuQjs7SUFFTSxXOztBQUtMOztBQUpBO0FBU0Esd0JBQWM7QUFBQTs7QUFBQSxPQVJkLE1BUWMsR0FSTCxJQUFJLE1BQUosRUFRSztBQUFBLE9BUGQsS0FPYyxHQVBOLElBQUksa0JBQUosQ0FBdUIsSUFBdkIsQ0FPTTtBQUFBLE9BSmQsU0FJYyxHQUpGLElBQUksZ0JBQUosRUFJRTtBQUFBLE9BRmQsV0FFYyxHQUZBLEVBRUE7O0FBQ2IsT0FBSyxVQUFMO0FBQ0E7Ozs7K0JBRVk7QUFDWixRQUFLLEtBQUwsQ0FBVyxVQUFYO0FBQ0EsUUFBSyxNQUFMLENBQVksS0FBWjs7QUFFQSxRQUFLLFdBQUwsR0FBbUIsRUFBbkI7QUFDQSxRQUFLLHFCQUFMO0FBQ0EsUUFBSyxLQUFMLEdBQWEsQ0FBYjtBQUNBOzs7MENBRXVCO0FBQUE7O0FBQ3ZCO0FBQ0EsT0FBTSxxQkFBcUIsQ0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixPQUFsQixFQUEyQixRQUEzQixFQUFxQyxhQUFyQyxFQUFvRCxVQUFwRCxFQUFnRSxVQUFoRSxFQUE0RSxVQUE1RSxFQUF3RixhQUF4RixFQUF1RyxPQUF2RyxFQUFnSCxZQUFoSCxFQUE4SCxvQkFBOUgsRUFBb0osZUFBcEosRUFBcUssZ0JBQXJLLEVBQXVMLHdCQUF2TCxFQUFpTixvQkFBak4sRUFBdU8sY0FBdk8sRUFBdVAsNEJBQXZQLEVBQXFSLCtCQUFyUixFQUFzVCwwQkFBdFQsRUFBa1YsK0JBQWxWLEVBQW1YLFlBQW5YLEVBQWlZLFdBQWpZLEVBQThZLFVBQTlZLEVBQTBaLFlBQTFaLEVBQXdhLFlBQXhhLEVBQXNiLFlBQXRiLEVBQW9jLFlBQXBjLEVBQWtkLFNBQWxkLEVBQTZkLFNBQTdkLEVBQXdlLFVBQXhlLEVBQW9mLFVBQXBmLEVBQWdnQixVQUFoZ0IsRUFBNGdCLHFCQUE1Z0IsRUFBbWlCLFNBQW5pQixFQUE4aUIsdUJBQTlpQixFQUF1a0IsTUFBdmtCLEVBQStrQixVQUEva0IsRUFBMmxCLFdBQTNsQixFQUF3bUIsU0FBeG1CLEVBQW1uQixnQkFBbm5CLEVBQXFvQixTQUFyb0IsRUFBZ3BCLFNBQWhwQixFQUEycEIsUUFBM3BCLEVBQXFxQixTQUFycUIsRUFBZ3JCLFFBQWhyQixFQUEwckIsU0FBMXJCLEVBQXFzQixjQUFyc0IsRUFBcXRCLGFBQXJ0QixFQUFvdUIsY0FBcHVCLEVBQW92Qiw2QkFBcHZCLEVBQW14QixZQUFueEIsQ0FBM0I7QUFDQSxzQkFBbUIsT0FBbkIsQ0FBMkI7QUFBQSxXQUFjLE1BQUssYUFBTCxDQUFtQixVQUFuQixDQUFkO0FBQUEsSUFBM0I7QUFDQTs7O2dDQUVhLGMsRUFBZ0I7QUFDN0IsUUFBSyxXQUFMLENBQWlCLGNBQWpCLElBQW1DO0FBQ2xDLFVBQU0sY0FENEI7QUFFbEMsV0FBTyxLQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLGNBQW5CO0FBRjJCLElBQW5DO0FBSUE7OzswQkFFTyxHLEVBQUs7QUFDWixPQUFNLFFBQVE7QUFDYixXQUFPLElBQUksa0JBQUosQ0FBdUIsSUFBdkIsQ0FETTtBQUViLFlBQVEsSUFBSSxNQUFKO0FBRkssSUFBZDtBQUlBLFFBQUssVUFBTDtBQUNBLFFBQUssT0FBTCxDQUFhLEdBQWIsRUFBa0IsS0FBbEI7QUFDQSxXQUFRLEdBQVIsQ0FBWSxjQUFaLEVBQTRCLEtBQTVCO0FBQ0E7OzswQkFFTyxLLEVBQU8sSyxFQUFPO0FBQ3JCLE9BQUksQ0FBQyxLQUFMLEVBQVk7QUFBRSxZQUFRLEtBQVIsQ0FBYyxZQUFkLEVBQTZCO0FBQVM7QUFDcEQsUUFBSyxLQUFMLElBQWMsQ0FBZDtBQUNBLE9BQU0sTUFBTSxNQUFNLElBQU4sQ0FBVyxFQUFDLFFBQVEsS0FBSyxLQUFkLEVBQVgsRUFBaUMsSUFBakMsQ0FBc0MsR0FBdEMsRUFBMkMsTUFBM0MsQ0FBa0QsVUFBQyxDQUFELEVBQUksQ0FBSjtBQUFBLFdBQVUsSUFBSSxDQUFkO0FBQUEsSUFBbEQsRUFBbUU7QUFDL0U7O0FBRFksSUFBWixDQUdBLElBQU0sU0FBUyxNQUFNLE1BQU0sSUFBM0I7QUFDQSxPQUFNLEtBQUssS0FBSyxNQUFMLEtBQWdCLEtBQUssYUFBaEM7QUFDQSxPQUFNLGNBQWMsR0FBRyxJQUFILENBQVEsSUFBUixFQUFjLEtBQWQsRUFBcUIsS0FBckIsQ0FBcEI7QUFDQSxRQUFLLEtBQUwsSUFBYyxDQUFkOztBQUVBLFVBQU8sV0FBUDtBQUNBOzs7eUJBRU0sSyxFQUFPLEssRUFBTztBQUFBOztBQUNwQixTQUFNLFdBQU4sQ0FBa0IsT0FBbEIsQ0FBMEI7QUFBQSxXQUFjLE9BQUssT0FBTCxDQUFhLFVBQWIsRUFBeUIsS0FBekIsQ0FBZDtBQUFBLElBQTFCO0FBQ0E7OztrQ0FFZSxjLEVBQWdCLEssRUFBTztBQUN0QztBQUNBLFFBQUssYUFBTCxDQUFtQixlQUFlLElBQWxDO0FBQ0EsT0FBSSxlQUFlLElBQW5CLEVBQXlCO0FBQ3hCLFVBQU0sS0FBTixDQUFZLGtCQUFaLENBQStCLGVBQWUsSUFBOUM7QUFDQSxTQUFLLEtBQUwsQ0FBVyxrQkFBWCxDQUE4QixlQUFlLElBQTdDO0FBQ0EsU0FBSyxPQUFMLENBQWEsZUFBZSxJQUE1QixFQUFrQyxLQUFsQztBQUNBLFVBQU0sS0FBTixDQUFZLGlCQUFaO0FBQ0EsU0FBSyxLQUFMLENBQVcsaUJBQVg7QUFDQTtBQUNEOzs7eUJBRU0sSyxFQUFPLEssRUFBTztBQUFBOztBQUNwQixTQUFNLEtBQU4sQ0FBWSxjQUFaO0FBQ0EsUUFBSyxLQUFMLENBQVc7QUFDWDtBQURBLE1BRUEsTUFBTSxNQUFOLENBQWEsT0FBYixDQUFxQixnQkFBUTtBQUM1QixVQUFNLEtBQU4sQ0FBWSxlQUFaO0FBQ0EsV0FBSyxLQUFMLENBQVc7QUFDWDtBQURBLE9BRUEsT0FBSyxPQUFMLENBQWEsSUFBYixFQUFtQixLQUFuQjtBQUNBLElBTEQ7QUFNQTs7O2tDQUVlLEksRUFBTSxLLEVBQU87QUFDNUI7QUFDQSxPQUFNLGFBQWEsS0FBSyxLQUFMLEdBQWEsS0FBSyxLQUFMLENBQVcsS0FBeEIsR0FBZ0MsS0FBSyxLQUFMLENBQVcsa0JBQVgsQ0FBOEIsVUFBOUIsQ0FBbkQ7O0FBRUEsU0FBTSxLQUFOLENBQVksa0JBQVosQ0FBK0IsVUFBL0I7QUFDQSxRQUFLLEtBQUwsQ0FBVyxrQkFBWCxDQUE4QixVQUE5QjtBQUNBLFFBQUssT0FBTCxDQUFhLEtBQUssSUFBbEIsRUFBd0IsS0FBeEI7QUFDQSxTQUFNLEtBQU4sQ0FBWSxpQkFBWjtBQUNBLFFBQUssS0FBTCxDQUFXLGlCQUFYOztBQUVBLFFBQUssS0FBTCxDQUFXLGNBQVgsQ0FBMEIsVUFBMUIsRUFBc0M7QUFDckMscUJBQWlCLEtBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLEtBQXhCLEdBQWdDLFNBRFo7QUFFckMsUUFBSSxVQUZpQztBQUdyQyxXQUFPLFVBSDhCO0FBSXJDLGlCQUFhLElBSndCO0FBS3JDLGFBQVMsS0FBSztBQUx1QixJQUF0Qzs7QUFRQSxVQUFPO0FBQ04sUUFBSSxVQURFO0FBRU4sV0FBTyxVQUZEO0FBR04scUJBQWlCLEtBQUssS0FBTCxHQUFhLEtBQUssS0FBTCxDQUFXLEtBQXhCLEdBQWdDLFNBSDNDO0FBSU4sYUFBUyxLQUFLO0FBSlIsSUFBUDtBQU1BOzs7NEJBRVMsUSxFQUFVLEssRUFBTztBQUFBOztBQUMxQjtBQUNBLFlBQVMsV0FBVCxDQUFxQixPQUFyQixDQUE2QjtBQUFBLFdBQWMsT0FBSyxPQUFMLENBQWEsVUFBYixFQUF5QixLQUF6QixDQUFkO0FBQUEsSUFBN0I7QUFDQTs7O3dCQUdLLEksRUFBTSxLLEVBQU87QUFDbEIsT0FBTSxpQkFBaUIsS0FBSyxPQUFMLGNBQ25CLEtBQUssSUFEYztBQUV0QixXQUFPLEtBQUs7QUFGVSxPQUdwQjs7QUFFSDtBQUx1QixJQUF2QjtBQU1BOztBQUVEOzs7OytCQUNhLFEsRUFBVSxLLEVBQU87O0FBRTdCLE9BQU0sVUFBVTtBQUNmLFFBQUksRUFEVztBQUVmLFdBQU8sRUFGUTtBQUdmLGtCQUFjLEVBSEM7QUFJZiwyQkFBdUIsSUFBRSxDQUpWO0FBS2YsbUJBQWU7QUFMQSxJQUFoQjs7QUFRQSxPQUFNLE9BQU87QUFDWixRQUFJLFNBRFE7QUFFWixXQUFPLFNBRks7QUFHWixXQUFPLFVBSEs7QUFJWixZQUFRLElBQUksUUFBUSxhQUFaLEdBQTRCLFFBQVEsS0FKaEM7QUFLWixXQUFPLEdBTEs7QUFNWixnQkFBWSxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsQ0FBd0I7QUFBQSxZQUFLLENBQUMsRUFBRSxJQUFILEVBQVMsRUFBRSxLQUFGLENBQVEsS0FBakIsQ0FBTDtBQUFBLEtBQXhCLENBTkE7O0FBUVosYUFBUztBQVJHLElBQWI7O0FBV0EsT0FBSSxjQUFjLEtBQUssOEJBQUwsQ0FBb0MsU0FBUyxJQUFULENBQWM7QUFDcEU7O0FBRGtCLElBQWxCLENBR0EsSUFBSSxZQUFZLE1BQVosS0FBdUIsQ0FBM0IsRUFBOEI7QUFDN0IsU0FBSyxLQUFMLEdBQWEsU0FBUyxJQUFULENBQWMsS0FBM0I7QUFDQSxTQUFLLFdBQUwsR0FBbUIsSUFBbkI7O0FBRUEsU0FBSyxRQUFMLENBQWM7QUFDYiw0Q0FBb0MsU0FBUyxJQUFULENBQWMsS0FBbEQsbUNBRGE7QUFFYixlQUFVO0FBQ1QsYUFBUSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCLFFBRHJCO0FBRVQsV0FBTSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCO0FBRm5CLE1BRkc7QUFNYixXQUFNO0FBTk8sS0FBZDtBQVFBLElBWkQsTUFZTyxJQUFJLFlBQVksTUFBWixLQUF1QixDQUEzQixFQUE4QjtBQUNwQyxRQUFJLGFBQWEsWUFBWSxDQUFaLENBQWpCO0FBQ0EsUUFBSSxVQUFKLEVBQWdCO0FBQ2YsVUFBSyxLQUFMLEdBQWEsV0FBVyxLQUF4QjtBQUNBLFVBQUssS0FBTCxHQUFhLFdBQVcsSUFBeEI7QUFDQTtBQUNELElBTk0sTUFNQTtBQUNOLFNBQUssS0FBTCxHQUFhLFNBQVMsSUFBVCxDQUFjLEtBQTNCO0FBQ0EsU0FBSyxRQUFMLENBQWM7QUFDYiw0Q0FBb0MsU0FBUyxJQUFULENBQWMsS0FBbEQsOEJBQStFLFlBQVksR0FBWixDQUFnQjtBQUFBLG9CQUFXLElBQUksSUFBZjtBQUFBLE1BQWhCLEVBQXdDLElBQXhDLENBQTZDLElBQTdDLENBQS9FLE1BRGE7QUFFYixlQUFVO0FBQ1QsYUFBUSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCLFFBRHJCO0FBRVQsV0FBTSxTQUFTLElBQVQsQ0FBYyxPQUFkLENBQXNCO0FBRm5CLE1BRkc7QUFNYixXQUFNO0FBTk8sS0FBZDtBQVFBOztBQUVELE9BQUksQ0FBQyxTQUFTLEtBQWQsRUFBcUI7QUFDcEIsU0FBSyxFQUFMLEdBQVUsS0FBSyxLQUFMLENBQVcsa0JBQVgsQ0FBOEIsS0FBSyxLQUFuQyxDQUFWO0FBQ0EsSUFGRCxNQUVPO0FBQ04sU0FBSyxFQUFMLEdBQVUsU0FBUyxLQUFULENBQWUsS0FBekI7QUFDQSxTQUFLLGVBQUwsR0FBdUIsU0FBUyxLQUFULENBQWUsS0FBdEM7QUFDQSxTQUFLLE1BQUwsSUFBZSxRQUFRLEVBQXZCO0FBQ0E7O0FBRUQsT0FBSSxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBN0IsRUFBZ0M7QUFDL0IsU0FBSyxNQUFMLElBQWUsUUFBUSxxQkFBUixHQUFpQyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsUUFBUSxZQUFqRjtBQUNBOztBQUVEO0FBQ0EsT0FBSSxPQUFPLElBQVAsQ0FBWSxLQUFLLEtBQUwsQ0FBVyxTQUF2QixFQUFrQyxRQUFsQyxDQUEyQyxLQUFLLEtBQWhELENBQUosRUFBNEQ7QUFDM0QsUUFBSSxRQUFRLEdBQUcsS0FBSCxDQUFTLEtBQUssS0FBZCxDQUFaO0FBQ0EsVUFBTSxPQUFOLEdBQWdCLEdBQWhCO0FBQ0EsU0FBSyxLQUFMLENBQVcsY0FBWCxDQUEwQixLQUFLLEVBQS9CLGVBQ0ksSUFESjtBQUVDLFlBQU8sRUFBQyxRQUFRLE1BQU0sUUFBTixFQUFUO0FBRlI7QUFJQSx3QkFDSSxJQURKO0FBRUMsWUFBTyxFQUFFLFFBQVEsTUFBTSxRQUFOLEVBQVY7QUFGUjtBQUlBOztBQUVELE9BQU0sT0FBTyxLQUFLLEdBQUwsZ0NBQVksS0FBSyxVQUFMLENBQWdCLEdBQWhCLENBQW9CO0FBQUE7QUFBQSxRQUFFLEdBQUY7QUFBQSxRQUFPLEtBQVA7O0FBQUEsV0FBa0IsV0FBVyxHQUFYLEVBQWdCLEVBQUUsTUFBSyxFQUFQLEVBQWhCLENBQWxCO0FBQUEsSUFBcEIsQ0FBWixFQUFiO0FBQ0EsT0FBTSxRQUFRLEtBQUssR0FBTCxnQ0FBWSxLQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0I7QUFBQTtBQUFBLFFBQUUsR0FBRjtBQUFBLFFBQU8sS0FBUDs7QUFBQSxXQUFrQixXQUFXLEtBQVgsRUFBa0IsRUFBRSxNQUFLLEVBQVAsRUFBbEIsQ0FBbEI7QUFBQSxJQUFwQixDQUFaLEVBQWQ7QUFDQSxPQUFNLGNBQWMsT0FBTyxLQUEzQjs7QUFFQSxPQUFNLGFBQWEsS0FBSyxHQUFMLGdDQUFZLENBQUMsS0FBSyxLQUFOLEVBQWEsS0FBSyxlQUFMLEdBQXVCLEtBQUssZUFBNUIsR0FBOEMsRUFBM0QsRUFBK0QsR0FBL0QsQ0FBbUU7QUFBQSxXQUFVLFdBQVcsTUFBWCxFQUFtQixFQUFDLE1BQU0sRUFBUCxFQUFuQixDQUFWO0FBQUEsSUFBbkUsQ0FBWixFQUFuQjs7QUFFQSxPQUFNLFFBQVEsS0FBSyxLQUFLLEdBQUwsQ0FBUyxXQUFULEVBQXNCLFVBQXRCLENBQW5COztBQUVBLFFBQUssS0FBTCxDQUFXLFVBQVgsQ0FBc0IsS0FBSyxFQUEzQixlQUNJLElBREo7QUFFQyxXQUFPLEVBQUMsTUFBTSxLQUFLLEtBQVosRUFGUjtBQUdDO0FBSEQ7O0FBTUEsdUJBQ0ksSUFESjtBQUVDLFdBQU8sRUFBQyxNQUFNLEtBQUssS0FBWixFQUZSO0FBR0M7QUFIRDtBQUtBOzs7d0JBRUssSSxFQUFNLEssRUFBTztBQUFBOztBQUNsQixRQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCO0FBQUEsV0FBUSxPQUFLLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLEtBQW5CLENBQVI7QUFBQSxJQUFsQjtBQUNBOzs7OEJBRVcsVSxFQUFZO0FBQ3ZCLFFBQUssS0FBTCxDQUFXLGFBQVgsQ0FBeUIsV0FBVyxLQUFwQztBQUNBOzs7aURBRThCLEssRUFBTztBQUFBOztBQUNyQyxPQUFJLGNBQWMsT0FBTyxJQUFQLENBQVksS0FBSyxXQUFqQixDQUFsQjtBQUNBLE9BQUksaUJBQWlCLFlBQVksY0FBWixDQUEyQixLQUEzQixFQUFrQztBQUN2RDtBQURxQixJQUFyQixDQUVBLElBQUkscUJBQXFCLGVBQWUsR0FBZixDQUFtQjtBQUFBLFdBQU8sT0FBSyxXQUFMLENBQWlCLEdBQWpCLENBQVA7QUFBQSxJQUFuQixDQUF6QjtBQUNBLFVBQU8sa0JBQVA7QUFDQTs7OzBDQUV1QjtBQUN2QixVQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBUDtBQUNBOzs7NENBRXlCO0FBQ3pCLFVBQU8sS0FBSyxLQUFMLENBQVcsWUFBWCxFQUFQO0FBQ0E7Ozs4QkFFVztBQUNYLFVBQU8sS0FBSyxNQUFMLENBQVksU0FBWixFQUFQO0FBQ0E7OzsyQkFFUSxLLEVBQU87QUFDZixRQUFLLE1BQUwsQ0FBWSxRQUFaLENBQXFCLEtBQXJCO0FBQ0E7OztnQ0FrQmEsSyxFQUFPO0FBQ3BCLFdBQVEsSUFBUixDQUFhLGlDQUFiLEVBQWdELEtBQWhEO0FBQ0E7OztpQ0FsQnFCLE8sRUFBUyxJLEVBQU07QUFDcEMsT0FBSSxhQUFhLGNBQWpCO0FBQ0csT0FBSSxlQUFlLFFBQVEsS0FBUixDQUFjLFVBQWQsQ0FBbkI7QUFDQSxPQUFJLFlBQVksS0FBSyxHQUFMLENBQVM7QUFBQSxXQUFjLFdBQVcsS0FBWCxDQUFpQixVQUFqQixDQUFkO0FBQUEsSUFBVCxDQUFoQjtBQUNBLE9BQUksU0FBUyxVQUFVLE1BQVYsQ0FBaUI7QUFBQSxXQUFpQixZQUFZLGFBQVosQ0FBMEIsWUFBMUIsRUFBd0MsYUFBeEMsQ0FBakI7QUFBQSxJQUFqQixDQUFiO0FBQ0EsWUFBUyxPQUFPLEdBQVAsQ0FBVztBQUFBLFdBQVEsS0FBSyxJQUFMLENBQVUsRUFBVixDQUFSO0FBQUEsSUFBWCxDQUFUO0FBQ0EsVUFBTyxNQUFQO0FBQ0g7OztnQ0FFb0IsSSxFQUFNLE0sRUFBUTtBQUMvQixPQUFJLEtBQUssTUFBTCxLQUFnQixPQUFPLE1BQTNCLEVBQW1DO0FBQUUsV0FBTyxLQUFQO0FBQWM7QUFDbkQsT0FBSSxJQUFJLENBQVI7QUFDQSxVQUFNLElBQUksS0FBSyxNQUFULElBQW1CLE9BQU8sQ0FBUCxFQUFVLFVBQVYsQ0FBcUIsS0FBSyxDQUFMLENBQXJCLENBQXpCLEVBQXdEO0FBQUUsU0FBSyxDQUFMO0FBQVE7QUFDbEUsVUFBUSxNQUFNLEtBQUssTUFBbkIsQ0FKK0IsQ0FJSjtBQUM5Qjs7Ozs7Ozs7Ozs7SUMzUkksTTs7OztPQUNMLE0sR0FBUyxFOzs7OzswQkFFRDtBQUNQLFFBQUssTUFBTCxHQUFjLEVBQWQ7QUFDQTs7OzhCQUVXO0FBQ1gsVUFBTyxLQUFLLE1BQVo7QUFDQTs7OzJCQUVRLEssRUFBTztBQUNmLE9BQUksSUFBSSxJQUFSO0FBQ0EsV0FBTyxNQUFNLElBQWI7QUFDQyxTQUFLLE9BQUw7QUFBYyxTQUFJLFFBQVEsS0FBWixDQUFtQjtBQUNqQyxTQUFLLFNBQUw7QUFBZ0IsU0FBSSxRQUFRLElBQVosQ0FBa0I7QUFDbEMsU0FBSyxNQUFMO0FBQWEsU0FBSSxRQUFRLElBQVosQ0FBa0I7QUFDL0I7QUFBUyxTQUFJLFFBQVEsR0FBWixDQUFpQjtBQUozQjtBQU1BLEtBQUUsTUFBTSxPQUFSO0FBQ0EsUUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFqQjtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7SUNyQkksSzs7Ozs7Ozs7Ozs7NkJBQ0s7QUFDUCxhQUFPO0FBQUE7QUFBQSxVQUFLLElBQUksS0FBSyxLQUFMLENBQVcsRUFBcEIsRUFBd0IsV0FBVSxPQUFsQztBQUNMLGFBQUssS0FBTCxDQUFXO0FBRE4sT0FBUDtBQUdEOzs7O0VBTGlCLE1BQU0sUzs7Ozs7OztBQ0ExQixJQUFNLEtBQUssUUFBUSxJQUFSLENBQVg7QUFDQSxJQUFNLE1BQU0sUUFBUSxRQUFSLENBQVo7O0lBRU0sTTtBQStHTCxtQkFBYztBQUFBOztBQUFBLE9BOUdkLFFBOEdjLEdBOUdILElBOEdHO0FBQUEsT0E3R2QsT0E2R2MsR0E3R0osSUE2R0k7QUFBQSxPQTNHZCxhQTJHYyxHQTNHRTtBQUNmLFVBQU8sZUFBQyxXQUFEO0FBQUEsV0FBbUI7QUFDekIsV0FBTSxPQURtQjtBQUV6QixrQkFBYSxZQUFZLElBQVo7QUFGWSxLQUFuQjtBQUFBLElBRFE7QUFLZixtQkFBZ0Isd0JBQVMsQ0FBVCxFQUFZLFNBQVosRUFBdUIsTUFBdkIsRUFBK0IsSUFBL0IsRUFBcUM7QUFDcEQsV0FBTztBQUNOLFdBQU0sZ0JBREE7QUFFTixXQUFNLFVBQVUsTUFBVixDQUFpQixRQUZqQjtBQUdOLFdBQU0sS0FBSyxJQUFMLEdBQVksQ0FBWjtBQUhBLEtBQVA7QUFLQSxJQVhjO0FBWWYsbUJBQWdCLHdCQUFTLElBQVQsRUFBZTtBQUM5QixXQUFPO0FBQ04sV0FBTSxnQkFEQTtBQUVOLFdBQU0sS0FBSyxJQUFMLEVBRkE7QUFHTixjQUFTLEtBQUs7QUFIUixLQUFQO0FBS0EsSUFsQmM7QUFtQmYsYUFBVSxrQkFBUyxDQUFULEVBQVksSUFBWixFQUFrQixFQUFsQixFQUFzQjtBQUMvQixRQUFJLGNBQWMsS0FBSyxJQUFMLEVBQWxCO0FBQ0EsV0FBTztBQUNOLFdBQU0sVUFEQTtBQUVOLGtCQUFhLFlBQVk7QUFGbkIsS0FBUDtBQUlBLElBekJjO0FBMEJmLFVBQU8sZUFBUyxJQUFULEVBQWU7QUFDckIsV0FBTztBQUNOLFdBQU0sT0FEQTtBQUVOLGFBQVEsS0FBSyxJQUFMO0FBRkYsS0FBUDtBQUlBLElBL0JjO0FBZ0NmLFNBQU0sY0FBUyxFQUFULEVBQWEsQ0FBYixFQUFnQixJQUFoQixFQUFzQjtBQUMzQixXQUFPO0FBQ04sV0FBTSxNQURBO0FBRU4sV0FBTSxLQUFLLElBQUwsRUFGQTtBQUdOLFlBQU8sR0FBRyxJQUFILEdBQVUsQ0FBVixDQUhEO0FBSU4sY0FBUyxLQUFLO0FBSlIsS0FBUDtBQU1BLElBdkNjO0FBd0NmLGdCQUFhLHFCQUFTLElBQVQsRUFBZSxNQUFmLEVBQXVCO0FBQ25DLFdBQU87QUFDTixXQUFNLGFBREE7QUFFTixXQUFNLEtBQUssSUFBTCxFQUZBO0FBR04saUJBQVksT0FBTyxJQUFQO0FBSE4sS0FBUDtBQUtBLElBOUNjO0FBK0NmOzs7OztBQUtBLFNBQU0sY0FBUyxDQUFULEVBQVksSUFBWixFQUFrQixFQUFsQixFQUFzQjtBQUMzQixXQUFPO0FBQ04sV0FBTSxNQURBO0FBRU4sV0FBTSxLQUFLLElBQUw7QUFGQSxLQUFQO0FBSUEsSUF6RGM7QUEwRGYsb0JBQWlCLHlCQUFTLENBQVQsRUFBWSxNQUFaLEVBQW9CLEVBQXBCLEVBQXdCO0FBQ3hDLFFBQU0sSUFBSSxPQUFPLElBQVAsRUFBVjtBQUNBLFdBQU8sRUFBRSxDQUFGLElBQU8sRUFBRSxDQUFGLENBQVAsR0FBYyxDQUFyQjtBQUNBLElBN0RjO0FBOERmLGNBQVcsbUJBQVMsSUFBVCxFQUFlLENBQWYsRUFBa0IsS0FBbEIsRUFBeUI7QUFDbkMsV0FBTztBQUNOLFdBQU0sV0FEQTtBQUVOLFdBQU0sS0FBSyxNQUFMLENBQVksUUFGWjtBQUdOLFlBQU8sTUFBTSxJQUFOO0FBSEQsS0FBUDtBQUtBLElBcEVjO0FBcUVmLFVBQU8sZUFBUyxHQUFULEVBQWM7QUFDcEIsV0FBTztBQUNOLFdBQU0sT0FEQTtBQUVOLFlBQU8sSUFBSSxNQUFKLENBQVc7QUFGWixLQUFQO0FBSUEsSUExRWM7QUEyRWYsbUJBQWdCLHdCQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsRUFBZixFQUFtQjtBQUNsQyxXQUFPLENBQUMsRUFBRSxJQUFGLEVBQUQsRUFBVyxNQUFYLENBQWtCLEdBQUcsSUFBSCxFQUFsQixDQUFQO0FBQ0EsSUE3RWM7QUE4RWYsZ0JBQWEsdUJBQVc7QUFDdkIsV0FBTyxFQUFQO0FBQ0EsSUFoRmM7QUFpRmYsU0FBTSxjQUFTLElBQVQsRUFBZTtBQUNwQixXQUFPO0FBQ04sV0FBTSxZQURBO0FBRU4sWUFBTyxLQUFLLE1BQUwsQ0FBWSxRQUZiO0FBR04sY0FBUyxLQUFLO0FBSFIsS0FBUDtBQUtBLElBdkZjO0FBd0ZmLGtCQUFlLHVCQUFTLENBQVQsRUFBWTtBQUMxQixXQUFPLEVBQUUsTUFBRixDQUFTLFFBQWhCO0FBQ0EsSUExRmM7QUEyRmYsYUFBVSxrQkFBUyxDQUFULEVBQVksRUFBWixFQUFnQjtBQUN6QixXQUFPO0FBQ04sV0FBTSxVQURBO0FBRU4sWUFBTyxLQUFLLE1BQUwsQ0FBWSxRQUZiO0FBR04sY0FBUyxLQUFLO0FBSFIsS0FBUDtBQUtBLElBakdjO0FBa0dmLGVBQVksb0JBQVMsQ0FBVCxFQUFZLEVBQVosRUFBZ0I7QUFDM0IsV0FBTztBQUNOLFdBQU0sWUFEQTtBQUVOLFlBQU8sS0FBSyxNQUFMLENBQVksUUFGYjtBQUdOLGNBQVMsS0FBSztBQUhSLEtBQVA7QUFLQTtBQXhHYyxHQTJHRjs7QUFDYixPQUFLLFFBQUwsR0FBZ0IsR0FBRyxZQUFILENBQWdCLFlBQVksaUJBQTVCLEVBQStDLE1BQS9DLENBQWhCO0FBQ0EsT0FBSyxPQUFMLEdBQWUsSUFBSSxPQUFKLENBQVksS0FBSyxRQUFqQixDQUFmO0FBQ0EsT0FBSyxTQUFMLEdBQWlCLEtBQUssT0FBTCxDQUFhLGVBQWIsR0FBK0IsWUFBL0IsQ0FBNEMsTUFBNUMsRUFBb0QsS0FBSyxhQUF6RCxDQUFqQjtBQUNBOzs7O3VCQUVJLE0sRUFBUTtBQUNaLE9BQUksU0FBUyxLQUFLLE9BQUwsQ0FBYSxLQUFiLENBQW1CLE1BQW5CLENBQWI7O0FBRUEsT0FBSSxPQUFPLFNBQVAsRUFBSixFQUF3QjtBQUN2QixRQUFJLE1BQU0sS0FBSyxTQUFMLENBQWUsTUFBZixFQUF1QixJQUF2QixFQUFWO0FBQ0EsV0FBTztBQUNOO0FBRE0sS0FBUDtBQUdBLElBTEQsTUFLTztBQUNOLFFBQUksV0FBVyxPQUFPLGVBQVAsRUFBZjtBQUNBLFFBQUksV0FBVyxPQUFPLDJCQUFQLEVBQWY7QUFDQSxXQUFPO0FBQ04sdUJBRE07QUFFTjtBQUZNLEtBQVA7QUFJQTtBQUNEOzs7Ozs7Ozs7OztJQ3hJSSxnQjtBQUNMLDZCQUFjO0FBQUE7O0FBQ2IsT0FBSyxRQUFMLEdBQWdCLENBQUMsaUJBQUQsRUFBb0IsZ0JBQXBCLEVBQXNDLGdCQUF0QyxFQUF3RCxlQUF4RCxFQUF5RSxpQkFBekUsRUFBNEYsaUJBQTVGLEVBQStHLGFBQS9HLEVBQThILGNBQTlILEVBQThJLG1CQUE5SSxFQUFtSyx3QkFBbkssRUFBNkwsaUJBQTdMLEVBQWdOLHdCQUFoTixFQUEwTyxzQkFBMU8sRUFBa1Esb0JBQWxRLEVBQXdSLFVBQXhSLEVBQW9TLFVBQXBTLEVBQWdULGtCQUFoVCxFQUFvVSxXQUFwVSxFQUFpVixPQUFqVixFQUEwVixpQkFBMVYsRUFBNlcsbUJBQTdXLEVBQWtZLG9CQUFsWSxFQUF3WixlQUF4WixFQUF5YSxlQUF6YSxFQUEwYixTQUExYixFQUFxYyxhQUFyYyxFQUFvZCxlQUFwZCxFQUFxZSxrQkFBcmUsRUFBeWYsWUFBemYsRUFBdWdCLGtCQUF2Z0IsRUFBMmhCLG1CQUEzaEIsRUFBZ2pCLFVBQWhqQixFQUE0akIsbUJBQTVqQixFQUFpbEIsYUFBamxCLEVBQWdtQixhQUFobUIsRUFBK21CLHFCQUEvbUIsRUFBc29CLFdBQXRvQixFQUFtcEIsTUFBbnBCLEVBQTJwQixvQkFBM3BCLEVBQWlyQixnQkFBanJCLEVBQW1zQixxQkFBbnNCLEVBQTB0QixTQUExdEIsRUFBcXVCLGVBQXJ1QixFQUFzdkIsMkJBQXR2QixFQUFteEIsaUJBQW54QixFQUFzeUIsb0JBQXR5QixFQUE0ekIsZ0JBQTV6QixFQUE4MEIsZ0JBQTkwQixFQUFnMkIsaUJBQWgyQixFQUFtM0IsY0FBbjNCLEVBQW00QixnQkFBbjRCLEVBQXE1QixvQkFBcjVCLEVBQTI2QixlQUEzNkIsRUFBNDdCLGFBQTU3QixFQUEyOEIsZUFBMzhCLEVBQTQ5QixhQUE1OUIsRUFBMitCLFlBQTMrQixFQUF5L0IsVUFBei9CLEVBQXFnQyxjQUFyZ0MsRUFBcWhDLE1BQXJoQyxFQUE2aEMsV0FBN2hDLEVBQTBpQyxtQkFBMWlDLEVBQStqQyxvQkFBL2pDLEVBQXFsQyxvQkFBcmxDLEVBQTJtQyxjQUEzbUMsRUFBMm5DLHVCQUEzbkMsRUFBb3BDLGdCQUFwcEMsRUFBc3FDLGFBQXRxQyxFQUFxckMsWUFBcnJDLEVBQW1zQyxTQUFuc0MsRUFBOHNDLG1CQUE5c0MsRUFBbXVDLGlCQUFudUMsRUFBc3ZDLFdBQXR2QyxFQUFtd0MsU0FBbndDLEVBQTh3QyxZQUE5d0MsRUFBNHhDLFlBQTV4QyxFQUEweUMsVUFBMXlDLEVBQXN6QyxhQUF0ekMsRUFBcTBDLFVBQXIwQyxFQUFpMUMsS0FBajFDLEVBQXcxQyxLQUF4MUMsRUFBKzFDLEtBQS8xQyxFQUFzMkMsT0FBdDJDLEVBQSsyQyxLQUEvMkMsRUFBczNDLE1BQXQzQyxFQUE4M0MsV0FBOTNDLEVBQTI0QyxPQUEzNEMsRUFBbzVDLFVBQXA1QyxFQUFnNkMsS0FBaDZDLEVBQXU2QyxhQUF2NkMsRUFBczdDLFNBQXQ3QyxFQUFpOEMsU0FBajhDLEVBQTQ4QyxXQUE1OEMsRUFBeTlDLFNBQXo5QyxFQUFvK0MsU0FBcCtDLEVBQSsrQyxNQUEvK0MsRUFBdS9DLEtBQXYvQyxFQUE4L0MsUUFBOS9DLEVBQXdnRCxXQUF4Z0QsRUFBcWhELE1BQXJoRCxFQUE2aEQsTUFBN2hELEVBQXFpRCxNQUFyaUQsRUFBNmlELFFBQTdpRCxFQUF1akQsT0FBdmpELEVBQWdrRCxRQUFoa0QsRUFBMGtELFdBQTFrRCxFQUF1bEQsU0FBdmxELEVBQWttRCxTQUFsbUQsRUFBNm1ELFNBQTdtRCxFQUF3bkQsTUFBeG5ELEVBQWdvRCxNQUFob0QsRUFBd29ELEtBQXhvRCxFQUErb0QsSUFBL29ELEVBQXFwRCxPQUFycEQsRUFBOHBELEtBQTlwRCxFQUFxcUQsWUFBcnFELEVBQW1yRCxZQUFuckQsRUFBaXNELE1BQWpzRCxFQUF5c0QsS0FBenNELEVBQWd0RCxTQUFodEQsRUFBMnRELE1BQTN0RCxFQUFtdUQsUUFBbnVELEVBQTZ1RCxLQUE3dUQsRUFBb3ZELEtBQXB2RCxFQUEydkQsWUFBM3ZELEVBQXl3RCxLQUF6d0QsRUFBZ3hELE1BQWh4RCxFQUF3eEQsUUFBeHhELEVBQWt5RCxLQUFseUQsRUFBeXlELE1BQXp5RCxFQUFpekQsS0FBanpELEVBQXd6RCxLQUF4ekQsRUFBK3pELE9BQS96RCxFQUF3MEQsVUFBeDBELEVBQW8xRCxNQUFwMUQsRUFBNDFELE9BQTUxRCxFQUFxMkQsTUFBcjJELEVBQTYyRCxVQUE3MkQsRUFBeTNELE9BQXozRCxFQUFrNEQsS0FBbDRELEVBQXk0RCxTQUF6NEQsRUFBbzVELE9BQXA1RCxFQUE2NUQsUUFBNzVELEVBQXU2RCxjQUF2NkQsRUFBdTdELEtBQXY3RCxFQUE4N0QsS0FBOTdELEVBQXE4RCxPQUFyOEQsRUFBODhELE9BQTk4RCxFQUF1OUQsTUFBdjlELEVBQSs5RCxNQUEvOUQsRUFBdStELEtBQXYrRCxDQUFoQjtBQUNBLE9BQUssUUFBTCxHQUFnQixDQUFDLEtBQUQsRUFBUSxJQUFSLEVBQWMsUUFBZCxFQUF3QixPQUF4QixFQUFpQyxPQUFqQyxFQUEwQyxVQUExQyxFQUFzRCxLQUF0RCxFQUE2RCxLQUE3RCxFQUFvRSxNQUFwRSxFQUE0RSxNQUE1RSxFQUFvRixRQUFwRixFQUE4RixNQUE5RixFQUFzRyxTQUF0RyxFQUFpSCxLQUFqSCxFQUF3SCxNQUF4SCxFQUFnSSxRQUFoSSxFQUEwSSxJQUExSSxFQUFnSixRQUFoSixFQUEwSixJQUExSixFQUFnSyxJQUFoSyxFQUFzSyxRQUF0SyxFQUFnTCxLQUFoTCxFQUF1TCxJQUF2TCxFQUE2TCxNQUE3TCxFQUFxTSxPQUFyTSxFQUE4TSxPQUE5TSxFQUF1TixRQUF2TixFQUFpTyxLQUFqTyxFQUF3TyxPQUF4TyxFQUFpUCxNQUFqUCxFQUF5UCxPQUF6UCxDQUFoQjtBQUNBOzs7OzJCQUVXLEUsRUFBSTtBQUNmLE9BQUksY0FBYyxFQUFsQjtBQUNBLE9BQUksS0FBSyxRQUFMLENBQWMsUUFBZCxDQUF1QixXQUF2QixLQUF1QyxLQUFLLFFBQUwsQ0FBYyxRQUFkLENBQXVCLFdBQXZCLENBQTNDLEVBQWdGO0FBQy9FLGtCQUFjLE1BQU0sV0FBcEI7QUFDQTtBQUNELGlCQUFjLFlBQVksT0FBWixDQUFvQixLQUFwQixFQUEyQixNQUEzQixDQUFkO0FBQ0EsaUJBQWMsWUFBWSxPQUFaLENBQW9CLEtBQXBCLEVBQTJCLEdBQTNCLENBQWQ7QUFDQSxVQUFPLFdBQVA7QUFDQTs7O2dDQUVhLFEsRUFBVTtBQUN2QixPQUFJLG1CQUFtQjtBQUN0QixtQkFBZSxVQURPO0FBRXRCLHFCQUFpQixvQkFGSztBQUd0QixzQkFBa0IsY0FISTtBQUl0Qiw4QkFBMEIsdUJBSko7QUFLdEIsa0JBQWMsY0FMUTtBQU10QiwwQkFBc0IsdUJBTkE7QUFPdEIsb0JBQWdCLGdCQVBNO0FBUXRCLDJCQUF1QixRQVJEO0FBU3RCLDZCQUF5QixPQVRIO0FBVXRCLHFDQUFpQyxTQVZYO0FBV3RCLGdDQUE0QixjQVhOO0FBWXRCLHFDQUFpQyxTQVpYO0FBYXRCLGVBQVcsV0FiVztBQWN0QixrQkFBYyxjQWRRO0FBZXRCLGlCQUFhLGFBZlM7QUFnQnRCLGdCQUFZLFlBaEJVO0FBaUJ0QixZQUFRLFFBakJjO0FBa0J0QixrQkFBYyxjQWxCUTtBQW1CdEIsa0JBQWMsY0FuQlE7QUFvQnRCLGtCQUFjLGVBcEJRO0FBcUJ0QixrQkFBYyxjQXJCUTtBQXNCdEIsZUFBVyxXQXRCVztBQXVCdEIsZUFBVyxXQXZCVztBQXdCdEIsZ0JBQVksWUF4QlU7QUF5QnRCLGdCQUFZLFlBekJVO0FBMEJ0QiwwQkFBc0IsY0ExQkE7QUEyQnRCLGNBQVUsVUEzQlk7QUE0QnRCLGVBQVcsV0E1Qlc7QUE2QnRCLHdCQUFvQixxQkE3QkU7QUE4QnRCLG9CQUFnQixpQkE5Qk07QUErQnRCLDBCQUFzQix3QkEvQkE7QUFnQ3RCLHFDQUFpQyxVQWhDWDtBQWlDdEIsV0FBTyxPQWpDZTtBQWtDdEIsZ0JBQVksYUFsQ1U7QUFtQ3RCLG9CQUFnQixTQW5DTTtBQW9DdEIsY0FBVTtBQXBDWSxJQUF2Qjs7QUF1Q0EsVUFBTyxpQkFBaUIsY0FBakIsQ0FBZ0MsUUFBaEMsSUFBNEMsaUJBQWlCLFFBQWpCLENBQTVDLEdBQXlFLFFBQWhGO0FBRUE7Ozt5QkFFTSxJLEVBQTBDO0FBQUEsT0FBcEMsS0FBb0MsdUVBQTVCLENBQTRCO0FBQUEsT0FBekIsY0FBeUIsdUVBQVIsTUFBUTs7QUFDaEQsT0FBSSxTQUFTLGVBQWUsTUFBZixDQUFzQixLQUF0QixDQUFiO0FBQ0EsVUFBTyxLQUFLLEtBQUwsQ0FBVyxJQUFYLEVBQWlCLEdBQWpCLENBQXFCO0FBQUEsV0FBUSxTQUFTLElBQWpCO0FBQUEsSUFBckIsRUFBNEMsSUFBNUMsQ0FBaUQsSUFBakQsQ0FBUDtBQUNBOzs7K0JBRVksSyxFQUFPLFcsRUFBYTtBQUFBOztBQUNoQyxPQUFJLDJGQUFKOztBQUtBLE9BQUksb0JBQW9CLE9BQU8sSUFBUCxDQUFZLFdBQVosRUFBeUIsR0FBekIsQ0FBNkIsMEJBQWtCO0FBQ3RFLFFBQUksbUJBQW1CLE1BQXZCLEVBQStCO0FBQzlCLFlBQU8sTUFBSyxxQkFBTCxDQUEyQixjQUEzQixFQUEyQyxZQUFZLGNBQVosQ0FBM0MsQ0FBUDtBQUNBLEtBRkQsTUFFTztBQUNOO0FBQ0E7QUFDRCxJQU51QixDQUF4Qjs7QUFRQSxPQUFJLE9BQ0gsT0FERyxZQUdKLGtCQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUhJLE9BQUo7O0FBTUEsVUFBTyxJQUFQO0FBQ0E7Ozt3Q0FFcUIsUyxFQUFXLEssRUFBTztBQUFBOztBQUN2QyxPQUFJLHNCQUFzQixTQUFTLEdBQVQsQ0FBYSxPQUFiLENBQXFCLEtBQXJCLENBQTFCO0FBQ0EsT0FBSSxrQkFBa0IsRUFBdEI7O0FBRUEsdUJBQW9CLEdBQXBCLENBQXdCLGdCQUFRO0FBQy9CO0FBQ0EsUUFBSSxJQUFJLE1BQU0sSUFBTixDQUFXLElBQVgsQ0FBUjtBQUNBLFFBQUksS0FBSyxNQUFNLFFBQU4sQ0FBZSxJQUFmLENBQVQ7O0FBRUEsUUFBSSxDQUFDLENBQUwsRUFBUTtBQUNQO0FBQ0E7QUFDRDs7QUFFQSxRQUFJLEdBQUcsTUFBSCxLQUFjLENBQWxCLEVBQXFCO0FBQ3BCLFNBQUksVUFBVSxNQUFNLE9BQU4sQ0FBYyxJQUFkLEVBQW9CLEdBQXBCLENBQXdCO0FBQUEsYUFBSyxPQUFLLFFBQUwsQ0FBYyxFQUFFLENBQWhCLENBQUw7QUFBQSxNQUF4QixDQUFkO0FBQ0Esd0JBQXNCLE9BQUssUUFBTCxDQUFjLElBQWQsQ0FBdEIsV0FBK0MsT0FBSyxhQUFMLENBQW1CLEVBQUUsS0FBckIsQ0FBL0MsU0FBOEUsUUFBUSxJQUFSLENBQWEsSUFBYixDQUE5RTtBQUNBO0FBQ0QsSUFkRCxFQWNHLElBZEg7O0FBZ0JBLE9BQUksd0JBQ0csU0FESCxpR0FHVSxTQUhWLHdKQVFKLEtBQUssTUFBTCxDQUFZLGVBQVosRUFBNkIsQ0FBN0IsQ0FSSSx1REFBSjtBQVdBLFVBQU8sVUFBUDtBQUNBOzs7Ozs7Ozs7OztJQ3hISSxVO0FBR0wsdUJBQXdCO0FBQUEsTUFBWixLQUFZLHVFQUFKLEVBQUk7O0FBQUE7O0FBQUEsT0FGeEIsVUFFd0IsR0FGWCxFQUVXOztBQUN2QixNQUFJLE1BQU0sT0FBTixDQUFjLEtBQWQsQ0FBSixFQUEwQjtBQUN6QixRQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxHQUZELE1BRU87QUFDTixXQUFRLEtBQVIsQ0FBYyx3Q0FBZCxFQUF3RCxLQUF4RDtBQUNBO0FBQ0Q7Ozs7K0JBRVk7QUFDWixRQUFLLEtBQUw7QUFDQTs7O3VCQUVJLEssRUFBTztBQUNYLFFBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixLQUFyQjtBQUNBOzs7d0JBRUs7QUFDTCxVQUFPLEtBQUssVUFBTCxDQUFnQixHQUFoQixFQUFQO0FBQ0E7OzswQkFFTztBQUNQLFFBQUssVUFBTCxHQUFrQixFQUFsQjtBQUNBOzs7MkNBRXdCO0FBQ3hCLFVBQU8sS0FBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLEdBQXJCLENBQVA7QUFDQTs7OzRDQUV5QjtBQUN6QixPQUFJLE9BQU8sTUFBTSxJQUFOLENBQVcsS0FBSyxVQUFoQixDQUFYO0FBQ0EsUUFBSyxHQUFMO0FBQ0EsVUFBTyxLQUFLLElBQUwsQ0FBVSxHQUFWLENBQVA7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNuQ0YsSUFBTSxPQUFPLFFBQVEsU0FBUixDQUFiOztJQUVNLFc7OztBQUNKLHVCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSwwSEFDWCxLQURXOztBQUdqQixVQUFLLFdBQUwsR0FBbUIsSUFBSSxXQUFKLENBQWdCLE1BQUssU0FBTCxDQUFlLElBQWYsT0FBaEIsQ0FBbkI7QUFDQSxVQUFLLEtBQUwsR0FBYTtBQUNYLGFBQU87QUFESSxLQUFiOztBQUlBLFVBQUssR0FBTCxHQUFXLElBQVg7QUFDQSxVQUFLLEtBQUwsR0FBYSxJQUFiOztBQUVBLFVBQUssV0FBTCxHQUFtQixJQUFuQjtBQVhpQjtBQVlsQjs7Ozs4QkFFUyxLLEVBQU87QUFDZixXQUFLLFFBQUwsQ0FBYyxFQUFFLFlBQUYsRUFBZDtBQUNEOzs7cURBRWdDLFMsRUFBVztBQUMxQyxVQUFJLFVBQVUsS0FBZCxFQUFxQjtBQUNuQixrQkFBVSxLQUFWLENBQWdCLE1BQWhCLENBQXVCLE9BQXZCLEdBQWlDLFVBQVUsTUFBM0M7QUFDQSxhQUFLLFdBQUwsQ0FBaUIsTUFBakIsQ0FBd0IsVUFBVSxLQUFsQztBQUNEO0FBQ0Y7OzswQ0FFcUIsUyxFQUFXLFMsRUFBVztBQUMxQyxhQUFPLEtBQUssS0FBTCxLQUFlLFNBQXRCO0FBQ0Q7OztnQ0FFVyxJLEVBQU07QUFDaEIsVUFBTSxlQUFlLEtBQUssRUFBMUI7QUFDQSxXQUFLLFFBQUwsQ0FBYyxFQUFFLDBCQUFGLEVBQWQ7O0FBRmdCLCtCQUlVLEtBQUssS0FBTCxDQUFXLEtBQVgsQ0FBaUIsS0FBakIsRUFKVjtBQUFBLFVBSVIsS0FKUSxzQkFJUixLQUpRO0FBQUEsVUFJRCxNQUpDLHNCQUlELE1BSkM7O0FBTWhCLFVBQU0sWUFBWSxtQkFBQyxLQUFELEVBQVEsTUFBUixFQUFnQixRQUFoQixFQUEwQixTQUExQixFQUF3QztBQUN4RCxZQUFNLGFBQWEsUUFBUSxRQUEzQjtBQUNBLFlBQU0sY0FBYyxTQUFTLFNBQTdCO0FBQ0EsWUFBTSxZQUFZLGFBQWEsV0FBYixHQUEyQixLQUEzQixHQUFtQyxNQUFyRDtBQUNBO0FBQ0EsZUFBTyxTQUFQO0FBQ0QsT0FORDs7QUFRQSxVQUFJLEtBQUssV0FBTCxLQUFxQixJQUF6QixFQUErQjtBQUM3QixhQUFLLFdBQUwsR0FBbUIsQ0FDakIsUUFBUSxDQURTLEVBRWpCLFNBQVMsQ0FGUSxFQUdqQixVQUFVLEtBQVYsRUFBaUIsTUFBakIsRUFBeUIsS0FBekIsRUFBZ0MsTUFBaEMsQ0FIaUIsQ0FBbkI7QUFLRDtBQUNELFVBQU0sU0FBUyxDQUNiLEtBQUssQ0FEUSxFQUViLEtBQUssQ0FGUSxFQUdiLFVBQVUsS0FBSyxLQUFmLEVBQXNCLEtBQUssTUFBM0IsRUFBbUMsS0FBbkMsRUFBMEMsTUFBMUMsQ0FIYSxDQUFmOztBQU1BLFdBQUssVUFBTCxDQUFnQixLQUFLLFdBQXJCLEVBQWtDLE1BQWxDLEVBQTBDLElBQTFDOztBQUVBLFdBQUssV0FBTCxHQUFtQixNQUFuQjtBQUNEOzs7K0JBRVUsSyxFQUFPLEcsRUFBSyxJLEVBQU07QUFBQSxnQ0FDRCxLQUFLLEtBQUwsQ0FBVyxLQUFYLENBQWlCLEtBQWpCLEVBREM7QUFBQSxVQUNuQixLQURtQix1QkFDbkIsS0FEbUI7QUFBQSxVQUNaLE1BRFksdUJBQ1osTUFEWTs7QUFHM0IsVUFBTSxTQUFTO0FBQ2IsV0FBRyxRQUFRLENBREU7QUFFYixXQUFHLFNBQVM7QUFGQyxPQUFmO0FBSUEsVUFBTSxJQUFJLEdBQUcsZUFBSCxDQUFtQixLQUFuQixFQUEwQixHQUExQixDQUFWOztBQUVBLFVBQU0sWUFBWSxTQUFaLFNBQVksT0FBa0I7QUFBQTtBQUFBLFlBQWhCLENBQWdCO0FBQUEsWUFBYixDQUFhO0FBQUEsWUFBVixJQUFVOztBQUNsQyxZQUFNLFFBQVEsUUFBUSxJQUF0QjtBQUNBLFlBQU0sYUFBYSxPQUFPLENBQVAsR0FBVyxJQUFJLEtBQWxDO0FBQ0EsWUFBTSxhQUFhLE9BQU8sQ0FBUCxHQUFXLElBQUksS0FBbEM7QUFDQSw4QkFBb0IsVUFBcEIsU0FBa0MsVUFBbEMsZUFBc0QsS0FBdEQ7QUFDRCxPQUxEOztBQU9BLFNBQUcsTUFBSCxDQUFVLEtBQUssS0FBZixFQUNHLElBREgsQ0FDUSxXQURSLEVBQ3FCLFVBQVUsS0FBVixDQURyQixFQUVHLFVBRkgsR0FHRyxRQUhILENBR1ksRUFBRSxRQUhkLEVBSUcsU0FKSCxDQUlhLFdBSmIsRUFJMEI7QUFBQSxlQUFNLFVBQUMsQ0FBRDtBQUFBLGlCQUFPLFVBQVUsRUFBRSxDQUFGLENBQVYsQ0FBUDtBQUFBLFNBQU47QUFBQSxPQUoxQjtBQUtEOzs7NkJBRVE7QUFBQTs7QUFDUCxVQUFJLENBQUMsS0FBSyxLQUFMLENBQVcsS0FBaEIsRUFBdUI7QUFDckI7QUFDQSxlQUFPLElBQVA7QUFDRDs7QUFFRCxVQUFNLElBQUksS0FBSyxLQUFMLENBQVcsS0FBckI7O0FBRUEsVUFBTSxRQUFRLEVBQUUsS0FBRixHQUFVLEdBQVYsQ0FBYyxVQUFDLFFBQUQsRUFBYztBQUN4QyxZQUFNLElBQUksRUFBRSxJQUFGLENBQU8sUUFBUCxDQUFWO0FBQ0EsWUFBTSxRQUFRO0FBQ1osZUFBSyxRQURPO0FBRVosZ0JBQU0sQ0FGTTtBQUdaLG1CQUFTLE9BQUssV0FBTCxDQUFpQixJQUFqQjtBQUhHLFNBQWQ7O0FBTUEsWUFBTSxPQUFPLGFBQWEsQ0FBYixDQUFiOztBQUVBLGVBQU8sb0JBQUMsSUFBRCxFQUFVLEtBQVYsQ0FBUDtBQUNELE9BWGEsQ0FBZDs7QUFhQSxVQUFNLFFBQVEsRUFBRSxLQUFGLEdBQVUsR0FBVixDQUFjLFVBQUMsUUFBRCxFQUFjO0FBQ3hDLFlBQU0sSUFBSSxFQUFFLElBQUYsQ0FBTyxRQUFQLENBQVY7QUFDQSxlQUFPLG9CQUFDLElBQUQsSUFBTSxLQUFRLFNBQVMsQ0FBakIsVUFBdUIsU0FBUyxDQUF0QyxFQUEyQyxNQUFNLENBQWpELEdBQVA7QUFDRCxPQUhhLENBQWQ7O0FBckJPLHFCQTBCbUIsRUFBRSxLQUFGLEVBMUJuQjtBQUFBLFVBMEJDLEtBMUJELFlBMEJDLEtBMUJEO0FBQUEsVUEwQlEsTUExQlIsWUEwQlEsTUExQlI7O0FBNEJQLGFBQ0U7QUFBQTtBQUFBO0FBQ0UsZUFBSyxhQUFDLEVBQUQsRUFBUTtBQUNYLG1CQUFLLEdBQUwsR0FBVyxFQUFYO0FBQ0QsV0FISDtBQUlFLGNBQUcsZUFKTDtBQUtFLGlCQUFNLDRCQUxSO0FBTUUsbUJBQVEsS0FOVjtBQU9FLDRCQUFnQixLQUFoQixTQUF5QjtBQVAzQjtBQVNFO0FBQUE7QUFBQTtBQUNHLGFBQUcsWUFBSCxDQUFnQixZQUFZLGlCQUE1QixFQUErQyxPQUEvQyxFQUF3RCxVQUFDLEdBQUQsRUFBUztBQUNoRSxvQkFBUSxHQUFSLENBQVksR0FBWjtBQUNELFdBRkE7QUFESCxTQVRGO0FBY0U7QUFBQTtBQUFBO0FBQ0UsOEJBQUMsS0FBRDtBQURGLFNBZEY7QUFpQkU7QUFBQTtBQUFBO0FBQ0UsZ0JBQUcsT0FETDtBQUVFLGlCQUFLLGFBQUMsRUFBRCxFQUFRO0FBQ1gscUJBQUssS0FBTCxHQUFhLEVBQWI7QUFDRDtBQUpIO0FBTUU7QUFBQTtBQUFBLGNBQUcsSUFBRyxPQUFOO0FBQWU7QUFBZixXQU5GO0FBT0U7QUFBQTtBQUFBLGNBQUcsSUFBRyxPQUFOO0FBQWU7QUFBZjtBQVBGO0FBakJGLE9BREY7QUE2QkQ7Ozs7RUE5SXVCLE1BQU0sUzs7QUFpSmhDLElBQU0sUUFBUSxTQUFSLEtBQVE7QUFBQSxTQUNaO0FBQUE7QUFBQTtBQUNFLFVBQUcsT0FETDtBQUVFLGVBQVEsV0FGVjtBQUdFLFlBQUssSUFIUDtBQUlFLFlBQUssR0FKUDtBQUtFLG1CQUFZLGFBTGQ7QUFNRSxtQkFBWSxJQU5kO0FBT0Usb0JBQWEsS0FQZjtBQVFFLGNBQU87QUFSVDtBQVVFLGtDQUFNLEdBQUUsNkJBQVIsRUFBc0MsV0FBVSxPQUFoRDtBQVZGLEdBRFk7QUFBQSxDQUFkOztJQWVNLEk7OztBQU9KLGdCQUFZLEtBQVosRUFBbUI7QUFBQTs7QUFBQSw2R0FDWCxLQURXOztBQUFBLFdBTm5CLElBTW1CLEdBTlosR0FDSixJQURJLEdBRUosS0FGSSxDQUVFLEdBQUcsVUFGTCxFQUdKLENBSEksQ0FHRixVQUFDLENBQUQ7QUFBQSxhQUFPLEVBQUUsQ0FBVDtBQUFBLEtBSEUsRUFJSixDQUpJLENBSUYsVUFBQyxDQUFEO0FBQUEsYUFBTyxFQUFFLENBQVQ7QUFBQSxLQUpFLENBTVk7O0FBRWpCLFdBQUssS0FBTCxHQUFhO0FBQ1gsc0JBQWdCO0FBREwsS0FBYjtBQUZpQjtBQUtsQjs7OztxREFFZ0MsUyxFQUFXO0FBQzFDLFdBQUssUUFBTCxDQUFjO0FBQ1osd0JBQWdCLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBZ0I7QUFEcEIsT0FBZDtBQUdEOzs7MEJBRUssTyxFQUFTO0FBQ2IsVUFBSSxPQUFKLEVBQWE7QUFDWCxnQkFBUSxZQUFSO0FBQ0Q7QUFDRjs7OzZCQUVRO0FBQ1AsVUFBSSxJQUFJLEtBQUssS0FBTCxDQUFXLElBQW5CO0FBQ0EsVUFBSSxJQUFJLEtBQUssSUFBYjtBQUNBLGFBQ0U7QUFBQTtBQUFBLFVBQUcsV0FBVSxNQUFiLEVBQW9CLFdBQVUsYUFBOUI7QUFDRTtBQUFBO0FBQUEsWUFBTSxHQUFHLEVBQUUsRUFBRSxNQUFKLENBQVQ7QUFDRTtBQUNFLGlCQUFLLEtBQUssS0FEWjtBQUVFLGlCQUFLLEtBQUssTUFBTCxFQUZQO0FBR0UscUJBQVEsUUFIVjtBQUlFLGtCQUFNLEVBQUUsS0FBSyxLQUFMLENBQVcsY0FBYixDQUpSO0FBS0UsZ0JBQUksRUFBRSxFQUFFLE1BQUosQ0FMTjtBQU1FLG1CQUFNLElBTlI7QUFPRSxpQkFBSSxPQVBOO0FBUUUsa0JBQUssUUFSUDtBQVNFLHlCQUFZLEdBVGQ7QUFVRSwyQkFBYztBQVZoQjtBQURGO0FBREYsT0FERjtBQWtCRDs7OztFQS9DZ0IsTUFBTSxTOztBQWtEekIsSUFBTSxlQUFlLFNBQWYsWUFBZSxDQUFDLENBQUQsRUFBTztBQUMxQixNQUFJLE9BQU8sSUFBWDtBQUNBLE1BQUksRUFBRSxVQUFGLEtBQWlCLElBQXJCLEVBQTJCO0FBQ3pCLFFBQUksRUFBRSxXQUFOLEVBQW1CO0FBQ2pCLGFBQU8saUJBQVA7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLFFBQVA7QUFDRDtBQUNGLEdBTkQsTUFNTztBQUNMLFdBQU8sUUFBUDtBQUNEO0FBQ0QsU0FBTyxJQUFQO0FBQ0QsQ0FaRDs7QUFjQSxJQUFNLE9BQU8sU0FBUCxJQUFPLENBQUMsS0FBRCxFQUFXO0FBQ3RCLE1BQU0sSUFBSSxNQUFNLElBQWhCO0FBQ0EsTUFBTSxPQUFPLEVBQUUsVUFBRixHQUFlLFVBQWYsR0FBNEIsTUFBekM7O0FBRUEsTUFBTSxhQUFhLEtBQUssS0FBTCxDQUFXLEVBQUUsQ0FBRixHQUFNLEVBQUUsS0FBRixHQUFVLENBQTNCLENBQW5CO0FBQ0EsTUFBTSxhQUFhLEtBQUssS0FBTCxDQUFXLEVBQUUsQ0FBRixHQUFNLEVBQUUsTUFBRixHQUFXLENBQTVCLENBQW5COztBQUVBLFNBQ0U7QUFBQTtBQUFBO0FBQ0UsaUJBQWMsSUFBZCxTQUFzQixFQUFFO0FBQ3hCO0FBQ0E7QUFIRixRQUlFLDBCQUF3QixVQUF4QixTQUFzQyxVQUF0QztBQUpGO0FBTUU7QUFBQTtBQUFBLFFBQWUsT0FBTyxNQUFNLElBQU4sQ0FBVyxLQUFqQyxFQUF3QyxRQUFRLE1BQU0sSUFBTixDQUFXLE1BQTNEO0FBQ0U7QUFBQTtBQUFBO0FBQ0UsaUJBQU87QUFDTCxtQkFBTyxPQURGO0FBRUwscUJBQVMsTUFGSjtBQUdMLDJCQUFlLFFBSFY7QUFJTCx3QkFBWSxRQUpQO0FBS0wsNEJBQWdCLFFBTFg7QUFNTCxvQkFBUSxNQU5IO0FBT0wsbUJBQU8sTUFQRjtBQVFMLHNCQUFVLFFBUkw7QUFTTCwwQkFBYyxNQVRUO0FBVUwsNkJBQWlCLE1BQU0sSUFBTixDQUFXLEtBQVgsR0FDYixNQUFNLElBQU4sQ0FBVyxLQUFYLENBQWlCLElBREosR0FFYixTQVpDO0FBYUwsdUJBQVc7QUFiTjtBQURUO0FBaUJHLGNBQU07QUFqQlQ7QUFERjtBQU5GLEdBREY7QUE4QkQsQ0FyQ0Q7O0FBdUNBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxLQUFEO0FBQUEsU0FDZjtBQUFDLFFBQUQ7QUFBVSxTQUFWO0FBQUE7QUFBQSxHQURlO0FBQUEsQ0FBakI7O0FBa0JBLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixDQUFDLEtBQUQ7QUFBQSxTQUN4QixvQkFBQyxJQUFELEVBQVUsS0FBVixDQUR3QjtBQUFBLENBQTFCOztBQWNBLElBQU0sV0FBVyxTQUFYLFFBQVcsQ0FBQyxLQUFEO0FBQUEsU0FDZjtBQUFDLFFBQUQ7QUFBVSxTQUFWO0FBQ0Usd0JBQUMsV0FBRCxJQUFhLE1BQU0sTUFBTSxJQUF6QjtBQURGLEdBRGU7QUFBQSxDQUFqQjs7QUFNQSxJQUFNLGNBQWMsU0FBZCxXQUFjLFFBQWM7QUFBQSxNQUFYLElBQVcsU0FBWCxJQUFXOztBQUNoQyxNQUFNLEtBQUssS0FBSyxlQUFoQjtBQUNBLE1BQUksQ0FBQyxLQUFLLGNBQUwsQ0FBb0IsWUFBcEIsQ0FBTCxFQUF3QztBQUN0QyxZQUFRLElBQVIsQ0FBYSxLQUFiLEVBQW9CLElBQXBCO0FBQ0EsV0FBTyxJQUFQO0FBQ0Q7O0FBRUQsTUFBTSxTQUNKLEtBQUssVUFBTCxDQUFnQixNQUFoQixLQUEyQixDQUEzQixHQUNFO0FBQUE7QUFBQTtBQUNFLGFBQU87QUFDTCxvQkFBWSxvQkFEUDtBQUVMLGtCQUFVLE9BRkw7QUFHTCxrQkFBVSxNQUhMO0FBSUwsZUFBTyxNQUpGO0FBS0wsb0JBQVksS0FMUDtBQU1MLHVCQUFlO0FBTlY7QUFEVDtBQVVFO0FBQUE7QUFBQTtBQUNFLGVBQU87QUFDTCwwQkFBZ0IsVUFEWDtBQUVMLGlCQUFPLE1BRkY7QUFHTCxzQkFBWTtBQUhQO0FBRFQ7QUFPRTtBQUFBO0FBQUE7QUFDRyxhQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBb0IsaUJBQWUsQ0FBZjtBQUFBO0FBQUEsY0FBRSxHQUFGO0FBQUEsY0FBTyxLQUFQOztBQUFBLGlCQUNuQjtBQUFBO0FBQUEsY0FBSSxLQUFLLEdBQVQ7QUFDRTtBQUFBO0FBQUE7QUFDRSx1QkFBTztBQUNMLGdDQUFjLFFBRFQ7QUFFTCw4QkFBWSxNQUZQO0FBR0wsNkJBQVc7QUFITjtBQURUO0FBT0c7QUFQSCxhQURGO0FBVUU7QUFBQTtBQUFBLGdCQUFJLE9BQU8sRUFBRSxhQUFhLFFBQWYsRUFBWDtBQUF1QztBQUF2QztBQVZGLFdBRG1CO0FBQUEsU0FBcEI7QUFESDtBQVBGO0FBVkYsR0FERixHQW9DSSxJQXJDTjs7QUF1Q0EsU0FDRTtBQUFDLFNBQUQsQ0FBTyxRQUFQO0FBQUE7QUFDRTtBQUFBO0FBQUE7QUFDRSxlQUFPO0FBQ0wsbUJBQVMsT0FESjtBQUVMLG1CQUFTLE1BRko7QUFHTCx5QkFBZSxRQUhWO0FBSUwsc0JBQVksUUFKUDtBQUtMLDBCQUFnQjtBQUxYO0FBRFQ7QUFTRyxZQUNDO0FBQUE7QUFBQSxVQUFLLFdBQVUsSUFBZixFQUFvQixPQUFPLEVBQUUsWUFBWSxNQUFkLEVBQTNCO0FBQ0c7QUFESCxPQVZKO0FBY0U7QUFBQTtBQUFBO0FBQU0sYUFBSztBQUFYO0FBZEYsS0FERjtBQWlCRztBQWpCSCxHQURGO0FBcUJELENBbkVEOzs7QUMvU0EsU0FBUyxHQUFULEdBQWU7QUFDYixXQUFTLE1BQVQsQ0FBZ0Isb0JBQUMsR0FBRCxPQUFoQixFQUF3QixTQUFTLGNBQVQsQ0FBd0IsUUFBeEIsQ0FBeEI7QUFDRDs7QUFFRCxJQUFNLGVBQWUsQ0FBQyxVQUFELEVBQWEsUUFBYixFQUF1QixhQUF2QixDQUFyQjs7QUFFQSxJQUFJLGFBQWEsUUFBYixDQUFzQixTQUFTLFVBQS9CLEtBQThDLFNBQVMsSUFBM0QsRUFBaUU7QUFDL0Q7QUFDRCxDQUZELE1BRU87QUFDTCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbG9ySGFzaFdyYXBwZXJ7XG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjldLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICAgICAgaGFzaDogdGhpcy5tYWdpY1xuICAgIH0pXG5cbiAgICBjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoKHtcbiAgICAgICAgc2F0dXJhdGlvbjogWzAuNSwgMC42LCAwLjddLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICB9KVxuXG4gICAgbG9zZUxvc2Uoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggKz0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBtYWdpYyhzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCA9IGhhc2ggKiA0NyArIHN0ci5jaGFyQ29kZUF0KGkpICUgMzI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBoZXgoc3RyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9ySGFzaC5oZXgoc3RyKVxuICAgIH1cbn0iLCJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdG5vZGVDb3VudGVyID0ge31cblx0X25vZGVTdGFjayA9IFtdXG5cdF9wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRnZXQgbm9kZVN0YWNrKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IG5vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX25vZGVTdGFja1tsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGdldCBwcmV2aW91c05vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IHByZXZpb3VzTm9kZVN0YWNrKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmNsZWFyTm9kZVN0YWNrKClcblxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW11cblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZXM6XCIsIHRoaXMubWV0YW5vZGVzKVxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGUgU3RhY2s6XCIsIHRoaXMubWV0YW5vZGVTdGFjaylcblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5tZXRhbm9kZVN0YWNrKVxuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYFRvdWNoaW5nIG5vZGUgXCIke25vZGVQYXRofVwiLmApXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrLnB1c2gobm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFja1swXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2subGVuZ3RoID4gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgVHJ5aW5nIHRvIHRvdWNoIG5vbi1leGlzdGFudCBub2RlIFwiJHtub2RlUGF0aH1cImApO1xuXHRcdH1cblx0fVxuXG5cdHJlZmVyZW5jZU5vZGUoaWQpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBpZCxcblx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0aGVpZ2h0OiA1MFxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHdpZHRoOiBNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSAqIDEwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZClcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKClcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGVmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aFxuXHRcdH0pO1xuXHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0cmV0dXJuIG5vZGVQYXRoO1xuXHR9XG5cblx0Y3JlYXRlTWV0YW5vZGUoaWRlbnRpZmllciwgbm9kZSkge1xuXHRcdGNvbnN0IG1ldGFub2RlQ2xhc3MgPSBub2RlLmNsYXNzXG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcilcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKClcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHRjb25zdCBlID0gdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKVxuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGVkZ2Uudi5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIGVkZ2Uudy5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIHt9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gWy4uLnRoaXMubm9kZVN0YWNrXVxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKVxuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdGNvbnN0IGlzQXZhaWxhYmxlID0gKHRoaXMuZ3JhcGguaW5FZGdlcyhub2RlUGF0aCkubGVuZ3RoID09PSAwKVxuXHRcdGNvbnN0IGlzSW5wdXQgPSAodGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiKVxuXHRcdGNvbnN0IGlzVW5kZWZpbmVkID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwidW5kZWZpbmVkXCIpXG5cdFx0cmV0dXJuIChpc0lucHV0IHx8IChpc1VuZGVmaW5lZCAmJiBpc0F2YWlsYWJsZSkpXG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdGNvbnN0IGlzQXZhaWxhYmxlID0gKHRoaXMuZ3JhcGgub3V0RWRnZXMobm9kZVBhdGgpLmxlbmd0aCA9PT0gMClcblx0XHRjb25zdCBpc091dHB1dCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiKVxuXHRcdGNvbnN0IGlzVW5kZWZpbmVkID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwidW5kZWZpbmVkXCIpXG5cdFx0cmV0dXJuIChpc091dHB1dCB8fCAoaXNVbmRlZmluZWQgJiYgaXNBdmFpbGFibGUpKVxuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiaXNNZXRhbm9kZTpcIiwgbm9kZVBhdGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZVxuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aClcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4gdGhpcy5pc091dHB1dChub2RlKSlcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmdyYXBoLm5vZGUob3V0cHV0Tm9kZXNbMF0pLmlzTWV0YW5vZGUpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE91dHB1dE5vZGVzKG91dHB1dE5vZGVzWzBdKVxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlc1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhzY29wZVBhdGgpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aClcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB0aGlzLmlzSW5wdXQobm9kZSkpXG5cdFx0Y29uc29sZS5sb2coaW5wdXROb2RlcylcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH0gZWxzZSBpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDEgJiYgdGhpcy5ncmFwaC5ub2RlKGlucHV0Tm9kZXNbMF0pLmlzTWV0YW5vZGUpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldElucHV0Tm9kZXMoaW5wdXROb2Rlc1swXSlcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXROb2Rlc1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Y29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHt9KTtcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YXJnZXRQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0c291cmNlUGF0aHMuZm9yRWFjaChzb3VyY2VQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoLCB0YXJnZXRQYXRoc1swXSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IGBOdW1iZXIgb2Ygbm9kZXMgZG9lcyBub3QgbWF0Y2guIFske3NvdXJjZVBhdGhzLmxlbmd0aH1dIC0+IFske3RhcmdldFBhdGhzLmxlbmd0aH1dYCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdC8vIHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0XHQvLyBlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMuZ3JhcGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzXG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcnMoKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5tYXAobWFya2VyID0+IHRoaXMuZWRpdG9yLnNlc3Npb24ucmVtb3ZlTWFya2VyKG1hcmtlcikpO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkN1cnNvclBvc2l0aW9uQ2hhbmdlZChldmVudCwgc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCBtID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGxldCBjID0gc2VsZWN0aW9uLmdldEN1cnNvcigpO1xuICAgICAgICBsZXQgbWFya2VycyA9IHRoaXMubWFya2Vycy5tYXAoaWQgPT4gbVtpZF0pO1xuICAgICAgICBsZXQgY3Vyc29yT3Zlck1hcmtlciA9IG1hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIucmFuZ2UuY29udGFpbnMoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFVOU0FGRV9jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdGFjdGl2ZVdvcmtlcnMgPSB7fVxuXHRjdXJyZW50V29ya2VySWQgPSAwXG5cdGxhc3RGaW5pc2hlZFdvcmtlcklkID0gMFxuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG5cdGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG5cdH1cblxuXHRsYXlvdXQoZ3JhcGgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuZ2V0V29ya2VySWQoKVxuXHRcdHRoaXMuYWN0aXZlV29ya2Vyc1tpZF0gPSBuZXcgTGF5b3V0V29ya2VyKGlkLCBncmFwaCwgdGhpcy53b3JrZXJGaW5pc2hlZC5iaW5kKHRoaXMpKVxuXHR9XG5cblx0d29ya2VyRmluaXNoZWQoe2lkLCBncmFwaH0pIHtcblx0XHRpZiAoaWQgPj0gdGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCkge1xuXHRcdFx0dGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCA9IGlkXG5cdFx0XHR0aGlzLmNhbGxiYWNrKGdyYXBoKVxuXHRcdH1cblx0fVxuXG5cdGdldFdvcmtlcklkKCkge1xuXHRcdHRoaXMuY3VycmVudFdvcmtlcklkICs9IDFcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50V29ya2VySWRcblx0fVxufVxuXG5jbGFzcyBMYXlvdXRXb3JrZXJ7XG5cdGlkID0gMFxuXHR3b3JrZXIgPSBudWxsXG5cdGNvbnN0cnVjdG9yKGlkLCBncmFwaCwgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuaWQgPSBpZFxuXHRcdHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpXG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpXG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZFxuXHRcdFxuXHRcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuZW5jb2RlKGdyYXBoKSlcblx0fVxuXHRyZWNlaXZlKG1lc3NhZ2UpIHtcblx0XHR0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuXHRcdHRoaXMub25GaW5pc2hlZCh7XG5cdFx0XHRpZDogdGhpcy5pZCxcblx0XHRcdGdyYXBoOiB0aGlzLmRlY29kZShtZXNzYWdlLmRhdGEpXG5cdFx0fSlcblx0fVxuXHRlbmNvZGUoZ3JhcGgpIHtcblx0XHRyZXR1cm4gZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaClcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoanNvbilcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuXHRpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcigpXG5cdGdlbmVyYXRvciA9IG5ldyBQeVRvcmNoR2VuZXJhdG9yKClcblxuXHRsb2NrID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdC8vIHRoZXNlIGFyZSBubyBsb25nZXIgbmVlZGVkIGhlcmVcblx0XHRcdC8vIFwiZ3JhbW1hclwiOiB0aGlzLnBhcnNlci5ncmFtbWFyLFxuXHRcdFx0Ly8gXCJzZW1hbnRpY3NcIjogdGhpcy5wYXJzZXIuc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImxheW91dFwiOiBcImNvbHVtbnNcIixcblx0XHRcdFwiZ2VuZXJhdGVkQ29kZVwiOiBcIlwiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2dyYXBoLnN2Z1wiLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpLm91dGVySFRNTCwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguanNvblwiLCBKU09OLnN0cmluZ2lmeShkYWdyZS5ncmFwaGxpYi5qc29uLndyaXRlKHRoaXMuc3RhdGUuZ3JhcGgpLCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvaGFsZi1hc3NlZF9qb2tlLnB5XCIsIHRoaXMuc3RhdGUuZ2VuZXJhdGVkQ29kZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcblx0XHRcdFx0Ym9keTogYENsaWNrIHRvIG9wZW4gc2F2ZWQgc2tldGNoLmAsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHRjb25zdCB7IHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpXG5cdFx0XHRcblx0XHRcdHNhdmVOb3RpZmljYXRpb24ub25jbGljayA9ICgpID0+IHtcblx0XHRcdFx0c2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihtZXNzYWdlLmZvbGRlcilcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRpcGMub24oXCJvcGVuXCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLm9wZW5GaWxlKG0uZmlsZVBhdGgpXG5cdFx0fSlcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5pbnRlcnByZXRlci5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0b3BlbkZpbGUoZmlsZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIm9wZW5GaWxlXCIsIGZpbGVQYXRoKVxuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZXIubWFrZSh2YWx1ZSlcblxuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLmludGVycHJldGVyLmV4ZWN1dGUocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKClcblx0XHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0TWV0YW5vZGVzRGVmaW5pdGlvbnMoKVxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcInJlc2l6ZVwiKSlcblx0XHR9LCAxMDApXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiLypcblx0VGhpcyBjb2RlIGlzIGEgbWVzcy5cbiovXG5cbmNvbnN0IHBpeGVsV2lkdGggPSByZXF1aXJlKCdzdHJpbmctcGl4ZWwtd2lkdGgnKVxuXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0XHR0aGlzLmRlcHRoID0gMFxuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiRGVjb252b2x1dGlvblwiLCBcIkF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlTWF4UG9vbGluZ1wiLCBcIk1heFVucG9vbGluZ1wiLCBcIkxvY2FsUmVzcG9uc2VOb3JtYWxpemF0aW9uXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGV4ZWN1dGUoYXN0KSB7XG5cdFx0Y29uc3Qgc3RhdGUgPSB7XG5cdFx0XHRncmFwaDogbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKSxcblx0XHRcdGxvZ2dlcjogbmV3IExvZ2dlcigpXG5cdFx0fVxuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpXG5cdFx0dGhpcy53YWxrQXN0KGFzdCwgc3RhdGUpXG5cdFx0Y29uc29sZS5sb2coXCJGaW5hbCBTdGF0ZTpcIiwgc3RhdGUpXG5cdH1cblxuXHR3YWxrQXN0KHRva2VuLCBzdGF0ZSkge1xuXHRcdGlmICghdG9rZW4pIHsgY29uc29sZS5lcnJvcihcIk5vIHRva2VuPyFcIik7IHJldHVybjsgfVxuXHRcdHRoaXMuZGVwdGggKz0gMVxuXHRcdGNvbnN0IHBhZCA9IEFycmF5LmZyb20oe2xlbmd0aDogdGhpcy5kZXB0aH0pLmZpbGwoXCIgXCIpLnJlZHVjZSgocCwgYykgPT4gcCArIGMsIFwiXCIpXG5cdFx0Ly9jb25zb2xlLmxvZyhwYWQgKyB0b2tlbi5raW5kKVxuXG5cdFx0Y29uc3QgZm5OYW1lID0gXCJfXCIgKyB0b2tlbi5raW5kXG5cdFx0Y29uc3QgZm4gPSB0aGlzW2ZuTmFtZV0gfHwgdGhpcy5fdW5yZWNvZ25pemVkXG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBmbi5jYWxsKHRoaXMsIHRva2VuLCBzdGF0ZSlcblx0XHR0aGlzLmRlcHRoIC09IDFcblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZVxuXHR9XG5cblx0X0dyYXBoKGdyYXBoLCBzdGF0ZSkge1xuXHRcdGdyYXBoLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKTtcblx0fVxuXG5cdF9Ob2RlRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbiwgc3RhdGUpwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke25vZGVEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRpZiAobm9kZURlZmluaXRpb24uYm9keSkge1xuXHRcdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKG5vZGVEZWZpbml0aW9uLm5hbWUpXG5cdFx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShub2RlRGVmaW5pdGlvbi5uYW1lKVxuXHRcdFx0dGhpcy53YWxrQXN0KG5vZGVEZWZpbml0aW9uLmJvZHksIHN0YXRlKVxuXHRcdFx0c3RhdGUuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKVxuXHRcdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0fVxuXHR9XG5cdFxuXHRfQ2hhaW4oY2hhaW4sIHN0YXRlKSB7XG5cdFx0c3RhdGUuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjaGFpbi5ibG9ja3MuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHN0YXRlLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0sIHN0YXRlKVxuXHRcdH0pXG5cdH1cblxuXHRfSW5saW5lTWV0YU5vZGUobm9kZSwgc3RhdGUpIHtcblx0XHQvL2NvbnNvbGUubG9nKG5vZGUpXG5cdFx0Y29uc3QgaWRlbnRpZmllciA9IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQoXCJtZXRhbm9kZVwiKVxuXG5cdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGlkZW50aWZpZXIpXG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoaWRlbnRpZmllcilcblx0XHR0aGlzLndhbGtBc3Qobm9kZS5ib2R5LCBzdGF0ZSlcblx0XHRzdGF0ZS5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogbm9kZS5hbGlhcyA/IG5vZGUuYWxpYXMudmFsdWUgOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogaWRlbnRpZmllcixcblx0XHRcdGNsYXNzOiBpZGVudGlmaWVyLFxuXHRcdFx0aXNBbm9ueW1vdXM6IHRydWUsXG5cdFx0XHRfc291cmNlOiBub2RlLl9zb3VyY2Vcblx0XHR9KVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiBpZGVudGlmaWVyLFxuXHRcdFx0Y2xhc3M6IGlkZW50aWZpZXIsXG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdW5kZWZpbmVkLFxuXHRcdFx0X3NvdXJjZTogbm9kZS5fc291cmNlXG5cdFx0fVxuXHR9XG5cblx0X01ldGFOb2RlKG1ldGFub2RlLCBzdGF0ZSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKG1ldGFub2RlKVxuXHRcdG1ldGFub2RlLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKVxuXHR9XG5cblxuXHRfTm9kZShub2RlLCBzdGF0ZSkge1xuXHRcdGNvbnN0IG5vZGVEZWZpbml0aW9uID0gdGhpcy53YWxrQXN0KHtcblx0XHRcdC4uLm5vZGUubm9kZSxcblx0XHRcdGFsaWFzOiBub2RlLmFsaWFzXG5cdFx0fSwgc3RhdGUpXG5cblx0XHQvLyBjb25zb2xlLmxvZyhub2RlRGVmaW5pdGlvbilcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRfTGl0ZXJhbE5vZGUoaW5zdGFuY2UsIHN0YXRlKSB7XG5cblx0XHRjb25zdCBoZWlnaHRzID0ge1xuXHRcdFx0aWQ6IDE5LFxuXHRcdFx0Y2xhc3M6IDE4LFxuXHRcdFx0cGFyYW1ldGVyUm93OiAxNSxcblx0XHRcdHBhcmFtZXRlclRhYmxlUGFkZGluZzogMiozLFxuXHRcdFx0aGVhZGVyUGFkZGluZzogNVxuXHRcdH07XG5cdFx0XG5cdFx0Y29uc3Qgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJkYXJrZ3JleVwiLFxuXHRcdFx0aGVpZ2h0OiAyICogaGVpZ2h0cy5oZWFkZXJQYWRkaW5nICsgaGVpZ2h0cy5jbGFzcyxcblx0XHRcdHdpZHRoOiAxMDAsXG5cdFx0XHRwYXJhbWV0ZXJzOiBpbnN0YW5jZS5wYXJhbWV0ZXJzLm1hcChwID0+IFtwLm5hbWUsIHAudmFsdWUudmFsdWVdKSxcblxuXHRcdFx0X3NvdXJjZTogaW5zdGFuY2UsXG5cdFx0fTtcblxuXHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKGluc3RhbmNlLnR5cGUudmFsdWUpXG5cdFx0Ly8gY29uc29sZS5sb2coYE1hdGNoZWQgZGVmaW5pdGlvbnM6YCwgZGVmaW5pdGlvbnMpO1xuXG5cdFx0aWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0bm9kZS5jbGFzcyA9IGluc3RhbmNlLnR5cGUudmFsdWU7XG5cdFx0XHRub2RlLmlzVW5kZWZpbmVkID0gdHJ1ZVxuXG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLnR5cGUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS50eXBlLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSlcblx0XHR9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXVxuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3Jcblx0XHRcdFx0bm9kZS5jbGFzcyA9IGRlZmluaXRpb24ubmFtZVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UudHlwZS52YWx1ZVxuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS50eXBlLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gYFwiJHtkZWYubmFtZX1cImApLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS50eXBlLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSlcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRub2RlLmlkID0gdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQobm9kZS5jbGFzcyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuaWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUudXNlckdlbmVyYXRlZElkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLmhlaWdodCArPSBoZWlnaHRzLmlkO1xuXHRcdH1cblxuXHRcdGlmIChub2RlLnBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0bm9kZS5oZWlnaHQgKz0gaGVpZ2h0cy5wYXJhbWV0ZXJUYWJsZVBhZGRpbmcgKyAobm9kZS5wYXJhbWV0ZXJzLmxlbmd0aCAqIGhlaWdodHMucGFyYW1ldGVyUm93KTtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdGxldCBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpXG5cdFx0XHRjb2xvci5vcGFjaXR5ID0gMC4xXG5cdFx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKG5vZGUuaWQsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHtcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKX1cblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZTogeyBcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKSB9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgbGVmdCA9IE1hdGgubWF4KC4uLm5vZGUucGFyYW1ldGVycy5tYXAoKFtrZXksIHZhbHVlXSkgPT4gcGl4ZWxXaWR0aChrZXksIHsgc2l6ZToxNCB9KSkpO1xuXHRcdGNvbnN0IHJpZ2h0ID0gTWF0aC5tYXgoLi4ubm9kZS5wYXJhbWV0ZXJzLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBwaXhlbFdpZHRoKHZhbHVlLCB7IHNpemU6MTQgfSkpKTtcblx0XHRjb25zdCB3aWR0aFBhcmFtcyA9IGxlZnQgKyByaWdodDtcblxuXHRcdGNvbnN0IHdpZHRoVGl0bGUgPSBNYXRoLm1heCguLi5bbm9kZS5jbGFzcywgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZCA6IFwiXCJdLm1hcChzdHJpbmcgPT4gcGl4ZWxXaWR0aChzdHJpbmcsIHtzaXplOiAxNn0pKSlcblxuXHRcdGNvbnN0IHdpZHRoID0gMjAgKyBNYXRoLm1heCh3aWR0aFBhcmFtcywgd2lkdGhUaXRsZSk7XG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU5vZGUobm9kZS5pZCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdHN0eWxlOiB7ZmlsbDogbm9kZS5jb2xvcn0sXG5cdFx0XHR3aWR0aFxuXHRcdH0pXG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdHN0eWxlOiB7ZmlsbDogbm9kZS5jb2xvcn0sXG5cdFx0XHR3aWR0aFxuXHRcdH1cblx0fVxuXG5cdF9MaXN0KGxpc3QsIHN0YXRlKSB7XG5cdFx0bGlzdC5saXN0LmZvckVhY2goaXRlbSA9PiB0aGlzLndhbGtBc3QoaXRlbSwgc3RhdGUpKVxuXHR9XG5cblx0X0lkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKVxuXHR9XG5cblx0bWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKHF1ZXJ5KSB7XG5cdFx0dmFyIGRlZmluaXRpb25zID0gT2JqZWN0LmtleXModGhpcy5kZWZpbml0aW9ucylcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBJbnRlcnByZXRlci5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpXG5cdFx0Ly9jb25zb2xlLmxvZyhcIkZvdW5kIGtleXNcIiwgZGVmaW5pdGlvbktleXMpXG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKVxuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnNcblx0fVxuXG5cdGdldENvbXB1dGF0aW9uYWxHcmFwaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRHcmFwaCgpXG5cdH1cblxuXHRnZXRNZXRhbm9kZXNEZWZpbml0aW9ucygpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRNZXRhbm9kZXMoKVxuXHR9XG5cblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmxvZ2dlci5nZXRJc3N1ZXMoKVxuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSlcblx0fVxuXG5cdHN0YXRpYyBuYW1lUmVzb2x1dGlvbihwYXJ0aWFsLCBsaXN0KSB7XG5cdFx0bGV0IHNwbGl0UmVnZXggPSAvKD89WzAtOUEtWl0pL1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoc3BsaXRSZWdleClcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpXG5cdCAgICB2YXIgcmVzdWx0ID0gbGlzdEFycmF5LmZpbHRlcihwb3NzaWJsZU1hdGNoID0+IEludGVycHJldGVyLmlzTXVsdGlQcmVmaXgocGFydGlhbEFycmF5LCBwb3NzaWJsZU1hdGNoKSlcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpXG5cdCAgICByZXR1cm4gcmVzdWx0XG5cdH1cblxuXHRzdGF0aWMgaXNNdWx0aVByZWZpeChuYW1lLCB0YXJnZXQpIHtcblx0ICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gdGFyZ2V0Lmxlbmd0aCkgeyByZXR1cm4gZmFsc2UgfVxuXHQgICAgbGV0IGkgPSAwXG5cdCAgICB3aGlsZShpIDwgbmFtZS5sZW5ndGggJiYgdGFyZ2V0W2ldLnN0YXJ0c1dpdGgobmFtZVtpXSkpIHsgaSArPSAxIH1cblx0ICAgIHJldHVybiAoaSA9PT0gbmFtZS5sZW5ndGgpIC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0X3VucmVjb2duaXplZCh0b2tlbikge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCB0b2tlbj9cIiwgdG9rZW4pXG5cdH1cbn0iLCJjbGFzcyBMb2dnZXJ7XG5cdGlzc3VlcyA9IFtdXG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5pc3N1ZXMgPSBbXTtcblx0fVxuXHRcblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmlzc3Vlcztcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dmFyIGYgPSBudWxsO1xuXHRcdHN3aXRjaChpc3N1ZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiZXJyb3JcIjogZiA9IGNvbnNvbGUuZXJyb3I7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndhcm5pbmdcIjogZiA9IGNvbnNvbGUud2FybjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiaW5mb1wiOiBmID0gY29uc29sZS5pbmZvOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IGYgPSBjb25zb2xlLmxvZzsgYnJlYWs7XG5cdFx0fVxuXHRcdGYoaXNzdWUubWVzc2FnZSk7XG5cdFx0dGhpcy5pc3N1ZXMucHVzaChpc3N1ZSk7XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPXt0aGlzLnByb3BzLmlkfSBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcbmNvbnN0IG9obSA9IHJlcXVpcmUoXCJvaG0tanNcIilcblxuY2xhc3MgUGFyc2Vye1xuXHRjb250ZW50cyA9IG51bGxcblx0Z3JhbW1hciA9IG51bGxcblx0XG5cdGV2YWxPcGVyYXRpb24gPSB7XG5cdFx0R3JhcGg6IChkZWZpbml0aW9ucykgPT4gICh7XG5cdFx0XHRraW5kOiBcIkdyYXBoXCIsXG5cdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZXZhbCgpXG5cdFx0fSksXG5cdFx0Tm9kZURlZmluaXRpb246IGZ1bmN0aW9uKF8sIGxheWVyTmFtZSwgcGFyYW1zLCBib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIk5vZGVEZWZpbml0aW9uXCIsXG5cdFx0XHRcdG5hbWU6IGxheWVyTmFtZS5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpWzBdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRJbmxpbmVNZXRhTm9kZTogZnVuY3Rpb24oYm9keSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJJbmxpbmVNZXRhTm9kZVwiLFxuXHRcdFx0XHRib2R5OiBib2R5LmV2YWwoKSxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdE1ldGFOb2RlOiBmdW5jdGlvbihfLCBkZWZzLCBfXykge1xuXHRcdFx0dmFyIGRlZmluaXRpb25zID0gZGVmcy5ldmFsKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTWV0YU5vZGVcIixcblx0XHRcdFx0ZGVmaW5pdGlvbnM6IGRlZmluaXRpb25zLmRlZmluaXRpb25zXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRDaGFpbjogZnVuY3Rpb24obGlzdCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJDaGFpblwiLFxuXHRcdFx0XHRibG9ja3M6IGxpc3QuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHROb2RlOiBmdW5jdGlvbihpZCwgXywgbm9kZSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJOb2RlXCIsXG5cdFx0XHRcdG5vZGU6IG5vZGUuZXZhbCgpLFxuXHRcdFx0XHRhbGlhczogaWQuZXZhbCgpWzBdLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0TGl0ZXJhbE5vZGU6IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJMaXRlcmFsTm9kZVwiLFxuXHRcdFx0XHR0eXBlOiB0eXBlLmV2YWwoKSxcblx0XHRcdFx0cGFyYW1ldGVyczogcGFyYW1zLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Lypcblx0XHRCbG9ja05hbWU6IGZ1bmN0aW9uKGlkLCBfKSB7XG5cdFx0XHRyZXR1cm4gaWQuZXZhbCgpXG5cdFx0fSxcblx0XHQqL1xuXHRcdExpc3Q6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkxpc3RcIixcblx0XHRcdFx0bGlzdDogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrUGFyYW1ldGVyczogZnVuY3Rpb24oXywgcGFyYW1zLCBfXykge1xuXHRcdFx0Y29uc3QgcCA9IHBhcmFtcy5ldmFsKCk7XG5cdFx0XHRyZXR1cm4gcFswXSA/IHBbMF0gOiBwXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRwYXRoOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRub2RlVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZVR5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyBcIi9zcmMvbW9uaWVsLm9obVwiLCBcInV0ZjhcIilcblx0XHR0aGlzLmdyYW1tYXIgPSBvaG0uZ3JhbW1hcih0aGlzLmNvbnRlbnRzKVxuXHRcdHRoaXMuc2VtYW50aWNzID0gdGhpcy5ncmFtbWFyLmNyZWF0ZVNlbWFudGljcygpLmFkZE9wZXJhdGlvbihcImV2YWxcIiwgdGhpcy5ldmFsT3BlcmF0aW9uKVxuXHR9XG5cblx0bWFrZShzb3VyY2UpIHtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5ncmFtbWFyLm1hdGNoKHNvdXJjZSlcblxuXHRcdGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0XHRcdHZhciBhc3QgPSB0aGlzLnNlbWFudGljcyhyZXN1bHQpLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXN0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHBlY3RlZCxcblx0XHRcdFx0cG9zaXRpb25cblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSIsImNsYXNzIFB5VG9yY2hHZW5lcmF0b3Ige1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmJ1aWx0aW5zID0gW1wiQXJpdGhtZXRpY0Vycm9yXCIsIFwiQXNzZXJ0aW9uRXJyb3JcIiwgXCJBdHRyaWJ1dGVFcnJvclwiLCBcIkJhc2VFeGNlcHRpb25cIiwgXCJCbG9ja2luZ0lPRXJyb3JcIiwgXCJCcm9rZW5QaXBlRXJyb3JcIiwgXCJCdWZmZXJFcnJvclwiLCBcIkJ5dGVzV2FybmluZ1wiLCBcIkNoaWxkUHJvY2Vzc0Vycm9yXCIsIFwiQ29ubmVjdGlvbkFib3J0ZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25FcnJvclwiLCBcIkNvbm5lY3Rpb25SZWZ1c2VkRXJyb3JcIiwgXCJDb25uZWN0aW9uUmVzZXRFcnJvclwiLCBcIkRlcHJlY2F0aW9uV2FybmluZ1wiLCBcIkVPRkVycm9yXCIsIFwiRWxsaXBzaXNcIiwgXCJFbnZpcm9ubWVudEVycm9yXCIsIFwiRXhjZXB0aW9uXCIsIFwiRmFsc2VcIiwgXCJGaWxlRXhpc3RzRXJyb3JcIiwgXCJGaWxlTm90Rm91bmRFcnJvclwiLCBcIkZsb2F0aW5nUG9pbnRFcnJvclwiLCBcIkZ1dHVyZVdhcm5pbmdcIiwgXCJHZW5lcmF0b3JFeGl0XCIsIFwiSU9FcnJvclwiLCBcIkltcG9ydEVycm9yXCIsIFwiSW1wb3J0V2FybmluZ1wiLCBcIkluZGVudGF0aW9uRXJyb3JcIiwgXCJJbmRleEVycm9yXCIsIFwiSW50ZXJydXB0ZWRFcnJvclwiLCBcIklzQURpcmVjdG9yeUVycm9yXCIsIFwiS2V5RXJyb3JcIiwgXCJLZXlib2FyZEludGVycnVwdFwiLCBcIkxvb2t1cEVycm9yXCIsIFwiTWVtb3J5RXJyb3JcIiwgXCJNb2R1bGVOb3RGb3VuZEVycm9yXCIsIFwiTmFtZUVycm9yXCIsIFwiTm9uZVwiLCBcIk5vdEFEaXJlY3RvcnlFcnJvclwiLCBcIk5vdEltcGxlbWVudGVkXCIsIFwiTm90SW1wbGVtZW50ZWRFcnJvclwiLCBcIk9TRXJyb3JcIiwgXCJPdmVyZmxvd0Vycm9yXCIsIFwiUGVuZGluZ0RlcHJlY2F0aW9uV2FybmluZ1wiLCBcIlBlcm1pc3Npb25FcnJvclwiLCBcIlByb2Nlc3NMb29rdXBFcnJvclwiLCBcIlJlY3Vyc2lvbkVycm9yXCIsIFwiUmVmZXJlbmNlRXJyb3JcIiwgXCJSZXNvdXJjZVdhcm5pbmdcIiwgXCJSdW50aW1lRXJyb3JcIiwgXCJSdW50aW1lV2FybmluZ1wiLCBcIlN0b3BBc3luY0l0ZXJhdGlvblwiLCBcIlN0b3BJdGVyYXRpb25cIiwgXCJTeW50YXhFcnJvclwiLCBcIlN5bnRheFdhcm5pbmdcIiwgXCJTeXN0ZW1FcnJvclwiLCBcIlN5c3RlbUV4aXRcIiwgXCJUYWJFcnJvclwiLCBcIlRpbWVvdXRFcnJvclwiLCBcIlRydWVcIiwgXCJUeXBlRXJyb3JcIiwgXCJVbmJvdW5kTG9jYWxFcnJvclwiLCBcIlVuaWNvZGVEZWNvZGVFcnJvclwiLCBcIlVuaWNvZGVFbmNvZGVFcnJvclwiLCBcIlVuaWNvZGVFcnJvclwiLCBcIlVuaWNvZGVUcmFuc2xhdGVFcnJvclwiLCBcIlVuaWNvZGVXYXJuaW5nXCIsIFwiVXNlcldhcm5pbmdcIiwgXCJWYWx1ZUVycm9yXCIsIFwiV2FybmluZ1wiLCBcIlplcm9EaXZpc2lvbkVycm9yXCIsIFwiX19idWlsZF9jbGFzc19fXCIsIFwiX19kZWJ1Z19fXCIsIFwiX19kb2NfX1wiLCBcIl9faW1wb3J0X19cIiwgXCJfX2xvYWRlcl9fXCIsIFwiX19uYW1lX19cIiwgXCJfX3BhY2thZ2VfX1wiLCBcIl9fc3BlY19fXCIsIFwiYWJzXCIsIFwiYWxsXCIsIFwiYW55XCIsIFwiYXNjaWlcIiwgXCJiaW5cIiwgXCJib29sXCIsIFwiYnl0ZWFycmF5XCIsIFwiYnl0ZXNcIiwgXCJjYWxsYWJsZVwiLCBcImNoclwiLCBcImNsYXNzbWV0aG9kXCIsIFwiY29tcGlsZVwiLCBcImNvbXBsZXhcIiwgXCJjb3B5cmlnaHRcIiwgXCJjcmVkaXRzXCIsIFwiZGVsYXR0clwiLCBcImRpY3RcIiwgXCJkaXJcIiwgXCJkaXZtb2RcIiwgXCJlbnVtZXJhdGVcIiwgXCJldmFsXCIsIFwiZXhlY1wiLCBcImV4aXRcIiwgXCJmaWx0ZXJcIiwgXCJmbG9hdFwiLCBcImZvcm1hdFwiLCBcImZyb3plbnNldFwiLCBcImdldGF0dHJcIiwgXCJnbG9iYWxzXCIsIFwiaGFzYXR0clwiLCBcImhhc2hcIiwgXCJoZWxwXCIsIFwiaGV4XCIsIFwiaWRcIiwgXCJpbnB1dFwiLCBcImludFwiLCBcImlzaW5zdGFuY2VcIiwgXCJpc3N1YmNsYXNzXCIsIFwiaXRlclwiLCBcImxlblwiLCBcImxpY2Vuc2VcIiwgXCJsaXN0XCIsIFwibG9jYWxzXCIsIFwibWFwXCIsIFwibWF4XCIsIFwibWVtb3J5dmlld1wiLCBcIm1pblwiLCBcIm5leHRcIiwgXCJvYmplY3RcIiwgXCJvY3RcIiwgXCJvcGVuXCIsIFwib3JkXCIsIFwicG93XCIsIFwicHJpbnRcIiwgXCJwcm9wZXJ0eVwiLCBcInF1aXRcIiwgXCJyYW5nZVwiLCBcInJlcHJcIiwgXCJyZXZlcnNlZFwiLCBcInJvdW5kXCIsIFwic2V0XCIsIFwic2V0YXR0clwiLCBcInNsaWNlXCIsIFwic29ydGVkXCIsIFwic3RhdGljbWV0aG9kXCIsIFwic3RyXCIsIFwic3VtXCIsIFwic3VwZXJcIiwgXCJ0dXBsZVwiLCBcInR5cGVcIiwgXCJ2YXJzXCIsIFwiemlwXCJdXG5cdFx0dGhpcy5rZXl3b3JkcyA9IFtcImFuZFwiLCBcImFzXCIsIFwiYXNzZXJ0XCIsIFwiYnJlYWtcIiwgXCJjbGFzc1wiLCBcImNvbnRpbnVlXCIsIFwiZGVmXCIsIFwiZGVsXCIsIFwiZWxpZlwiLCBcImVsc2VcIiwgXCJleGNlcHRcIiwgXCJleGVjXCIsIFwiZmluYWxseVwiLCBcImZvclwiLCBcImZyb21cIiwgXCJnbG9iYWxcIiwgXCJpZlwiLCBcImltcG9ydFwiLCBcImluXCIsIFwiaXNcIiwgXCJsYW1iZGFcIiwgXCJub3RcIiwgXCJvclwiLCBcInBhc3NcIiwgXCJwcmludFwiLCBcInJhaXNlXCIsIFwicmV0dXJuXCIsIFwidHJ5XCIsIFwid2hpbGVcIiwgXCJ3aXRoXCIsIFwieWllbGRcIl1cblx0fVxuXG4gICAgc2FuaXRpemUoaWQpIHtcblx0XHR2YXIgc2FuaXRpemVkSWQgPSBpZFxuXHRcdGlmICh0aGlzLmJ1aWx0aW5zLmluY2x1ZGVzKHNhbml0aXplZElkKSB8fCB0aGlzLmtleXdvcmRzLmluY2x1ZGVzKHNhbml0aXplZElkKSkge1xuXHRcdFx0c2FuaXRpemVkSWQgPSBcIl9cIiArIHNhbml0aXplZElkXG5cdFx0fVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwuL2csIFwidGhpc1wiKVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwvL2csIFwiLlwiKVxuXHRcdHJldHVybiBzYW5pdGl6ZWRJZFxuXHR9XG5cblx0bWFwVG9GdW5jdGlvbihub2RlVHlwZSkge1xuXHRcdGxldCB0cmFuc2xhdGlvblRhYmxlID0ge1xuXHRcdFx0XCJDb252b2x1dGlvblwiOiBcIkYuY29udjJkXCIsXG5cdFx0XHRcIkRlY29udm9sdXRpb25cIjogXCJGLmNvbnZfdHJhbnNwb3NlMmRcIixcblx0XHRcdFwiQXZlcmFnZVBvb2xpbmdcIjogXCJGLmF2Z19wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhQb29saW5nXCI6IFwiRi5tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIkFkYXB0aXZlTWF4UG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfbWF4X3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhVbnBvb2xpbmdcIjogXCJGLm1heF91bnBvb2wyZFwiLFxuXHRcdFx0XCJSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5yZWx1XCIsXG5cdFx0XHRcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiOiBcIkYuZWx1XCIsXG5cdFx0XHRcIlBhcmFtZXRyaWNSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5wcmVsdVwiLFxuXHRcdFx0XCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLmxlYWt5X3JlbHVcIixcblx0XHRcdFwiUmFuZG9taXplZFJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJyZWx1XCIsXG5cdFx0XHRcIlNpZ21vaWRcIjogXCJGLnNpZ21vaWRcIixcblx0XHRcdFwiTG9nU2lnbW9pZFwiOiBcIkYubG9nc2lnbW9pZFwiLFxuXHRcdFx0XCJUaHJlc2hvbGRcIjogXCJGLnRocmVzaG9sZFwiLFxuXHRcdFx0XCJIYXJkVGFuaFwiOiBcIkYuaGFyZHRhbmhcIixcblx0XHRcdFwiVGFuaFwiOiBcIkYudGFuaFwiLFxuXHRcdFx0XCJUYW5oU2hyaW5rXCI6IFwiRi50YW5oc2hyaW5rXCIsXG5cdFx0XHRcIkhhcmRTaHJpbmtcIjogXCJGLmhhcmRzaHJpbmtcIixcblx0XHRcdFwiTG9nU29mdE1heFwiOiBcIkYubG9nX3NvZnRtYXhcIixcblx0XHRcdFwiU29mdFNocmlua1wiOiBcIkYuc29mdHNocmlua1wiLFxuXHRcdFx0XCJTb2Z0TWF4XCI6IFwiRi5zb2Z0bWF4XCIsXG5cdFx0XHRcIlNvZnRNaW5cIjogXCJGLnNvZnRtaW5cIixcblx0XHRcdFwiU29mdFBsdXNcIjogXCJGLnNvZnRwbHVzXCIsXG5cdFx0XHRcIlNvZnRTaWduXCI6IFwiRi5zb2Z0c2lnblwiLFxuXHRcdFx0XCJCYXRjaE5vcm1hbGl6YXRpb25cIjogXCJGLmJhdGNoX25vcm1cIixcblx0XHRcdFwiTGluZWFyXCI6IFwiRi5saW5lYXJcIixcblx0XHRcdFwiRHJvcG91dFwiOiBcIkYuZHJvcG91dFwiLFxuXHRcdFx0XCJQYWlyd2lzZURpc3RhbmNlXCI6IFwiRi5wYWlyd2lzZV9kaXN0YW5jZVwiLFxuXHRcdFx0XCJDcm9zc0VudHJvcHlcIjogXCJGLmNyb3NzX2VudHJvcHlcIixcblx0XHRcdFwiQmluYXJ5Q3Jvc3NFbnRyb3B5XCI6IFwiRi5iaW5hcnlfY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJLdWxsYmFja0xlaWJsZXJEaXZlcmdlbmNlTG9zc1wiOiBcIkYua2xfZGl2XCIsXG5cdFx0XHRcIlBhZFwiOiBcIkYucGFkXCIsXG5cdFx0XHRcIlZhcmlhYmxlXCI6IFwiQUcuVmFyaWFibGVcIixcblx0XHRcdFwiUmFuZG9tTm9ybWFsXCI6IFwiVC5yYW5kblwiLFxuXHRcdFx0XCJUZW5zb3JcIjogXCJULlRlbnNvclwiXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkobm9kZVR5cGUpID8gdHJhbnNsYXRpb25UYWJsZVtub2RlVHlwZV0gOiBub2RlVHlwZVxuXG5cdH1cblxuXHRpbmRlbnQoY29kZSwgbGV2ZWwgPSAxLCBpbmRlbnRQZXJMZXZlbCA9IFwiICAgIFwiKSB7XG5cdFx0bGV0IGluZGVudCA9IGluZGVudFBlckxldmVsLnJlcGVhdChsZXZlbClcblx0XHRyZXR1cm4gY29kZS5zcGxpdChcIlxcblwiKS5tYXAobGluZSA9PiBpbmRlbnQgKyBsaW5lKS5qb2luKFwiXFxuXCIpXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGUoZ3JhcGgsIGRlZmluaXRpb25zKSB7XG5cdFx0bGV0IGltcG9ydHMgPVxuYGltcG9ydCB0b3JjaCBhcyBUXG5pbXBvcnQgdG9yY2gubm4uZnVuY3Rpb25hbCBhcyBGXG5pbXBvcnQgdG9yY2guYXV0b2dyYWQgYXMgQUdgXG5cblx0XHRsZXQgbW9kdWxlRGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9ucykubWFwKGRlZmluaXRpb25OYW1lID0+IHtcblx0XHRcdGlmIChkZWZpbml0aW9uTmFtZSAhPT0gXCJtYWluXCIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVDb2RlRm9yTW9kdWxlKGRlZmluaXRpb25OYW1lLCBkZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3JldHVybiBcIlwiXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGxldCBjb2RlID1cbmAke2ltcG9ydHN9XG5cbiR7bW9kdWxlRGVmaW5pdGlvbnMuam9pbihcIlxcblwiKX1cbmBcblxuXHRcdHJldHVybiBjb2RlXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGVGb3JNb2R1bGUoY2xhc3NuYW1lLCBncmFwaCkge1xuXHRcdGxldCB0b3BvbG9naWNhbE9yZGVyaW5nID0gZ3JhcGhsaWIuYWxnLnRvcHNvcnQoZ3JhcGgpXG5cdFx0bGV0IGZvcndhcmRGdW5jdGlvbiA9IFwiXCJcblxuXHRcdHRvcG9sb2dpY2FsT3JkZXJpbmcubWFwKG5vZGUgPT4ge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coXCJtdVwiLCBub2RlKVxuXHRcdFx0bGV0IG4gPSBncmFwaC5ub2RlKG5vZGUpXG5cdFx0XHRsZXQgY2ggPSBncmFwaC5jaGlsZHJlbihub2RlKVxuXG5cdFx0XHRpZiAoIW4pIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhuKVxuXG5cdFx0XHRpZiAoY2gubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdGxldCBpbk5vZGVzID0gZ3JhcGguaW5FZGdlcyhub2RlKS5tYXAoZSA9PiB0aGlzLnNhbml0aXplKGUudikpXG5cdFx0XHRcdGZvcndhcmRGdW5jdGlvbiArPSBgJHt0aGlzLnNhbml0aXplKG5vZGUpfSA9ICR7dGhpcy5tYXBUb0Z1bmN0aW9uKG4uY2xhc3MpfSgke2luTm9kZXMuam9pbihcIiwgXCIpfSlcXG5gXG5cdFx0XHR9IFxuXHRcdH0sIHRoaXMpXG5cblx0XHRsZXQgbW9kdWxlQ29kZSA9XG5gY2xhc3MgJHtjbGFzc25hbWV9KFQubm4uTW9kdWxlKTpcbiAgICBkZWYgX19pbml0X18oc2VsZiwgcGFyYW0xLCBwYXJhbTIpOiAjIHBhcmFtZXRlcnMgaGVyZVxuICAgICAgICBzdXBlcigke2NsYXNzbmFtZX0sIHNlbGYpLl9faW5pdF9fKClcbiAgICAgICAgIyBhbGwgZGVjbGFyYXRpb25zIGhlcmVcblxuICAgIGRlZiBmb3J3YXJkKHNlbGYsIGluMSwgaW4yKTogIyBhbGwgSW5wdXRzIGhlcmVcbiAgICAgICAgIyBhbGwgZnVuY3Rpb25hbCBzdHVmZiBoZXJlXG4ke3RoaXMuaW5kZW50KGZvcndhcmRGdW5jdGlvbiwgMil9XG4gICAgICAgIHJldHVybiAob3V0MSwgb3V0MikgIyBhbGwgT3V0cHV0cyBoZXJlXG5gXG5cdFx0cmV0dXJuIG1vZHVsZUNvZGVcblx0fVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY29uc3Qgem9vbSA9IHJlcXVpcmUoXCJkMy16b29tXCIpO1xuXG5jbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuXG4gICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCh0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZ3JhcGg6IG51bGwsXG4gICAgfTtcblxuICAgIHRoaXMuc3ZnID0gbnVsbDtcbiAgICB0aGlzLmdyb3VwID0gbnVsbDtcblxuICAgIHRoaXMuY3VycmVudFpvb20gPSBudWxsO1xuICB9XG5cbiAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IGdyYXBoIH0pO1xuICB9XG5cbiAgVU5TQUZFX2NvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCk7XG4gICAgfVxuICB9XG5cbiAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhdGUgIT09IG5leHRTdGF0ZTtcbiAgfVxuXG4gIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSBub2RlLmlkO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZE5vZGUgfSk7XG5cbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuc3RhdGUuZ3JhcGguZ3JhcGgoKTtcblxuICAgIGNvbnN0IGlkZWFsU2l6ZSA9ICh3aWR0aCwgaGVpZ2h0LCBtYXhXaWR0aCwgbWF4SGVpZ2h0KSA9PiB7XG4gICAgICBjb25zdCB3aWR0aFJhdGlvID0gd2lkdGggLyBtYXhXaWR0aDtcbiAgICAgIGNvbnN0IGhlaWdodFJhdGlvID0gaGVpZ2h0IC8gbWF4SGVpZ2h0O1xuICAgICAgY29uc3QgaWRlYWxTaXplID0gd2lkdGhSYXRpbyA8IGhlaWdodFJhdGlvID8gd2lkdGggOiBoZWlnaHQ7XG4gICAgICAvLyBjb25zb2xlLmxvZyhgWyR7d2lkdGh9LCAke2hlaWdodH1dLCBbJHttYXhXaWR0aH0sICR7bWF4SGVpZ2h0fV0sICR7d2lkdGhSYXRpb30sICR7aGVpZ2h0UmF0aW99LCBpZGVhbCA9ICR7aWRlYWxTaXplfWApXG4gICAgICByZXR1cm4gaWRlYWxTaXplO1xuICAgIH07XG5cbiAgICBpZiAodGhpcy5jdXJyZW50Wm9vbSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5jdXJyZW50Wm9vbSA9IFtcbiAgICAgICAgd2lkdGggLyAyLFxuICAgICAgICBoZWlnaHQgLyAyLFxuICAgICAgICBpZGVhbFNpemUod2lkdGgsIGhlaWdodCwgd2lkdGgsIGhlaWdodCksXG4gICAgICBdO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXQgPSBbXG4gICAgICBub2RlLngsXG4gICAgICBub2RlLnksXG4gICAgICBpZGVhbFNpemUobm9kZS53aWR0aCwgbm9kZS5oZWlnaHQsIHdpZHRoLCBoZWlnaHQpLFxuICAgIF07XG5cbiAgICB0aGlzLnRyYW5zaXRpb24odGhpcy5jdXJyZW50Wm9vbSwgdGFyZ2V0LCBub2RlKTtcblxuICAgIHRoaXMuY3VycmVudFpvb20gPSB0YXJnZXQ7XG4gIH1cblxuICB0cmFuc2l0aW9uKHN0YXJ0LCBlbmQsIG5vZGUpIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuc3RhdGUuZ3JhcGguZ3JhcGgoKTtcblxuICAgIGNvbnN0IGNlbnRlciA9IHtcbiAgICAgIHg6IHdpZHRoIC8gMixcbiAgICAgIHk6IGhlaWdodCAvIDIsXG4gICAgfTtcbiAgICBjb25zdCBpID0gZDMuaW50ZXJwb2xhdGVab29tKHN0YXJ0LCBlbmQpO1xuXG4gICAgY29uc3QgdHJhbnNmb3JtID0gKFt4LCB5LCBzaXplXSkgPT4ge1xuICAgICAgY29uc3Qgc2NhbGUgPSB3aWR0aCAvIHNpemU7XG4gICAgICBjb25zdCB0cmFuc2xhdGVYID0gY2VudGVyLnggLSB4ICogc2NhbGU7XG4gICAgICBjb25zdCB0cmFuc2xhdGVZID0gY2VudGVyLnkgLSB5ICogc2NhbGU7XG4gICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3RyYW5zbGF0ZVh9LCR7dHJhbnNsYXRlWX0pc2NhbGUoJHtzY2FsZX0pYDtcbiAgICB9O1xuXG4gICAgZDMuc2VsZWN0KHRoaXMuZ3JvdXApXG4gICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0oc3RhcnQpKVxuICAgICAgLnRyYW5zaXRpb24oKVxuICAgICAgLmR1cmF0aW9uKGkuZHVyYXRpb24pXG4gICAgICAuYXR0clR3ZWVuKFwidHJhbnNmb3JtXCIsICgpID0+ICh0KSA9PiB0cmFuc2Zvcm0oaSh0KSkpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IGcgPSB0aGlzLnN0YXRlLmdyYXBoO1xuXG4gICAgY29uc3Qgbm9kZXMgPSBnLm5vZGVzKCkubWFwKChub2RlTmFtZSkgPT4ge1xuICAgICAgY29uc3QgbiA9IGcubm9kZShub2RlTmFtZSk7XG4gICAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgICAga2V5OiBub2RlTmFtZSxcbiAgICAgICAgbm9kZTogbixcbiAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpLFxuICAgICAgfTtcblxuICAgICAgY29uc3QgVHlwZSA9IG5vZGVEaXNwYXRjaChuKTtcblxuICAgICAgcmV0dXJuIDxUeXBlIHsuLi5wcm9wc30gLz47XG4gICAgfSk7XG5cbiAgICBjb25zdCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoKGVkZ2VOYW1lKSA9PiB7XG4gICAgICBjb25zdCBlID0gZy5lZGdlKGVkZ2VOYW1lKTtcbiAgICAgIHJldHVybiA8RWRnZSBrZXk9e2Ake2VkZ2VOYW1lLnZ9LT4ke2VkZ2VOYW1lLnd9YH0gZWRnZT17ZX0gLz47XG4gICAgfSk7XG5cbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGcuZ3JhcGgoKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8c3ZnXG4gICAgICAgIHJlZj17KGVsKSA9PiB7XG4gICAgICAgICAgdGhpcy5zdmcgPSBlbDtcbiAgICAgICAgfX1cbiAgICAgICAgaWQ9XCJ2aXN1YWxpemF0aW9uXCJcbiAgICAgICAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiXG4gICAgICAgIHZlcnNpb249XCIxLjFcIlxuICAgICAgICB2aWV3Qm94PXtgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWB9XG4gICAgICA+XG4gICAgICAgIDxzdHlsZT5cbiAgICAgICAgICB7ZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArIFwiL3NyYy9idW5kbGUuY3NzXCIsIFwidXRmLThcIiwgKGVycikgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgICB9KX1cbiAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgPGRlZnM+XG4gICAgICAgICAgPEFycm93IC8+XG4gICAgICAgIDwvZGVmcz5cbiAgICAgICAgPGdcbiAgICAgICAgICBpZD1cImdyYXBoXCJcbiAgICAgICAgICByZWY9eyhlbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5ncm91cCA9IGVsO1xuICAgICAgICAgIH19XG4gICAgICAgID5cbiAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+e25vZGVzfTwvZz5cbiAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+e2VkZ2VzfTwvZz5cbiAgICAgICAgPC9nPlxuICAgICAgPC9zdmc+XG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBBcnJvdyA9ICgpID0+IChcbiAgPG1hcmtlclxuICAgIGlkPVwiYXJyb3dcIlxuICAgIHZpZXdCb3g9XCIwIDAgMTAgMTBcIlxuICAgIHJlZlg9XCIxMFwiXG4gICAgcmVmWT1cIjVcIlxuICAgIG1hcmtlclVuaXRzPVwic3Ryb2tlV2lkdGhcIlxuICAgIG1hcmtlcldpZHRoPVwiMTBcIlxuICAgIG1hcmtlckhlaWdodD1cIjcuNVwiXG4gICAgb3JpZW50PVwiYXV0b1wiXG4gID5cbiAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDMgNSB6XCIgY2xhc3NOYW1lPVwiYXJyb3dcIiAvPlxuICA8L21hcmtlcj5cbik7XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBsaW5lID0gZDNcbiAgICAubGluZSgpXG4gICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgLngoKGQpID0+IGQueClcbiAgICAueSgoZCkgPT4gZC55KTtcblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcHJldmlvdXNQb2ludHM6IFtdLFxuICAgIH07XG4gIH1cblxuICBVTlNBRkVfY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzLFxuICAgIH0pO1xuICB9XG5cbiAgbW91bnQoZG9tTm9kZSkge1xuICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICByZXR1cm4gKFxuICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVwiIG1hcmtlckVuZD1cInVybCgjYXJyb3cpXCI+XG4gICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICA8YW5pbWF0ZVxuICAgICAgICAgICAgcmVmPXt0aGlzLm1vdW50fVxuICAgICAgICAgICAga2V5PXtNYXRoLnJhbmRvbSgpfVxuICAgICAgICAgICAgcmVzdGFydD1cImFsd2F5c1wiXG4gICAgICAgICAgICBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfVxuICAgICAgICAgICAgdG89e2woZS5wb2ludHMpfVxuICAgICAgICAgICAgYmVnaW49XCIwc1wiXG4gICAgICAgICAgICBkdXI9XCIwLjI1c1wiXG4gICAgICAgICAgICBmaWxsPVwiZnJlZXplXCJcbiAgICAgICAgICAgIHJlcGVhdENvdW50PVwiMVwiXG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lPVwiZFwiXG4gICAgICAgICAgLz5cbiAgICAgICAgPC9wYXRoPlxuICAgICAgPC9nPlxuICAgICk7XG4gIH1cbn1cblxuY29uc3Qgbm9kZURpc3BhdGNoID0gKG4pID0+IHtcbiAgbGV0IFR5cGUgPSBudWxsO1xuICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgaWYgKG4uaXNBbm9ueW1vdXMpIHtcbiAgICAgIFR5cGUgPSBBbm9ueW1vdXNNZXRhbm9kZTtcbiAgICB9IGVsc2Uge1xuICAgICAgVHlwZSA9IE1ldGFub2RlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBUeXBlID0gQXRvbU5vZGU7XG4gIH1cbiAgcmV0dXJuIFR5cGU7XG59O1xuXG5jb25zdCBOb2RlID0gKHByb3BzKSA9PiB7XG4gIGNvbnN0IG4gPSBwcm9wcy5ub2RlO1xuICBjb25zdCB0eXBlID0gbi5pc01ldGFub2RlID8gXCJtZXRhbm9kZVwiIDogXCJub2RlXCI7XG5cbiAgY29uc3QgdHJhbnNsYXRlWCA9IE1hdGguZmxvb3Iobi54IC0gbi53aWR0aCAvIDIpO1xuICBjb25zdCB0cmFuc2xhdGVZID0gTWF0aC5mbG9vcihuLnkgLSBuLmhlaWdodCAvIDIpO1xuXG4gIHJldHVybiAoXG4gICAgPGdcbiAgICAgIGNsYXNzTmFtZT17YCR7dHlwZX0gJHtuLmNsYXNzfWB9XG4gICAgICAvLyBUT0RPOiBmaXggem9vbWluZ1xuICAgICAgLy8gb25DbGljaz17cHJvcHMub25DbGljay5iaW5kKHRoaXMsIHByb3BzLm5vZGUpfVxuICAgICAgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7dHJhbnNsYXRlWH0sJHt0cmFuc2xhdGVZfSlgfVxuICAgID5cbiAgICAgIDxmb3JlaWduT2JqZWN0IHdpZHRoPXtwcm9wcy5ub2RlLndpZHRofSBoZWlnaHQ9e3Byb3BzLm5vZGUuaGVpZ2h0fT5cbiAgICAgICAgPHNlY3Rpb25cbiAgICAgICAgICBzdHlsZT17e1xuICAgICAgICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgICAgICAgIGRpc3BsYXk6IFwiZmxleFwiLFxuICAgICAgICAgICAgZmxleERpcmVjdGlvbjogXCJjb2x1bW5cIixcbiAgICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBqdXN0aWZ5Q29udGVudDogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGhlaWdodDogXCIxMDAlXCIsXG4gICAgICAgICAgICB3aWR0aDogXCIxMDAlXCIsXG4gICAgICAgICAgICBvdmVyZmxvdzogXCJoaWRkZW5cIixcbiAgICAgICAgICAgIGJvcmRlclJhZGl1czogXCIxMHB4XCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IHByb3BzLm5vZGUuc3R5bGVcbiAgICAgICAgICAgICAgPyBwcm9wcy5ub2RlLnN0eWxlLmZpbGxcbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICBib3hTaGFkb3c6IFwiMHB4IDBweCAwcHggMXB4IHdoaXRlXCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIHtwcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9mb3JlaWduT2JqZWN0PlxuICAgIDwvZz5cbiAgKTtcbn07XG5cbmNvbnN0IE1ldGFub2RlID0gKHByb3BzKSA9PiAoXG4gIDxOb2RlIHsuLi5wcm9wc30+XG4gICAgbXV1dXVcbiAgICB7LyogPHRleHRcbiAgICAgIHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9XG4gICAgICB0ZXh0QW5jaG9yPVwic3RhcnRcIlxuICAgICAgc3R5bGU9e3sgZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wiIH19XG4gICAgPlxuICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj5cbiAgICAgICAge3Byb3BzLm5vZGUudXNlckdlbmVyYXRlZElkfVxuICAgICAgPC90c3Bhbj5cbiAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj5cbiAgICAgICAge3Byb3BzLm5vZGUuY2xhc3N9XG4gICAgICA8L3RzcGFuPlxuICAgIDwvdGV4dD4gKi99XG4gIDwvTm9kZT5cbik7XG5cbmNvbnN0IEFub255bW91c01ldGFub2RlID0gKHByb3BzKSA9PiAoXG4gIDxOb2RlIHsuLi5wcm9wc30+XG4gICAgey8qIDx0ZXh0XG4gICAgICB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfVxuICAgICAgdGV4dEFuY2hvcj1cInN0YXJ0XCJcbiAgICAgIHN0eWxlPXt7IGRvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIiB9fVxuICAgID5cbiAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+XG4gICAgICAgIHtwcm9wcy5ub2RlLnVzZXJHZW5lcmF0ZWRJZH1cbiAgICAgIDwvdHNwYW4+XG4gICAgPC90ZXh0PiAqL31cbiAgPC9Ob2RlPlxuKTtcblxuY29uc3QgQXRvbU5vZGUgPSAocHJvcHMpID0+IChcbiAgPE5vZGUgey4uLnByb3BzfT5cbiAgICA8Tm9kZUNvbnRlbnQgbm9kZT17cHJvcHMubm9kZX0gLz5cbiAgPC9Ob2RlPlxuKTtcblxuY29uc3QgTm9kZUNvbnRlbnQgPSAoeyBub2RlIH0pID0+IHtcbiAgY29uc3QgaWQgPSBub2RlLnVzZXJHZW5lcmF0ZWRJZDtcbiAgaWYgKCFub2RlLmhhc093blByb3BlcnR5KFwicGFyYW1ldGVyc1wiKSkge1xuICAgIGNvbnNvbGUud2FybihcIldURlwiLCBub2RlKTtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IHBhcmFtcyA9XG4gICAgbm9kZS5wYXJhbWV0ZXJzLmxlbmd0aCAhPT0gMCA/IChcbiAgICAgIDxkaXZcbiAgICAgICAgc3R5bGU9e3tcbiAgICAgICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMCwgMCwgMCwgMC4yKVwiLFxuICAgICAgICAgIGZvbnRTaXplOiBcIjAuOGVtXCIsXG4gICAgICAgICAgbWF4V2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgIHdpZHRoOiBcIjEwMCVcIixcbiAgICAgICAgICBwYWRkaW5nVG9wOiBcIjNweFwiLFxuICAgICAgICAgIHBhZGRpbmdCb3R0b206IFwiM3B4XCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIDx0YWJsZVxuICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICBib3JkZXJDb2xsYXBzZTogXCJjb2xsYXBzZVwiLFxuICAgICAgICAgICAgd2lkdGg6IFwiMTAwJVwiLFxuICAgICAgICAgICAgbGluZUhlaWdodDogXCIxNHB4XCIsXG4gICAgICAgICAgfX1cbiAgICAgICAgPlxuICAgICAgICAgIDx0Ym9keT5cbiAgICAgICAgICAgIHtub2RlLnBhcmFtZXRlcnMubWFwKChba2V5LCB2YWx1ZV0sIGkpID0+IChcbiAgICAgICAgICAgICAgPHRyIGtleT17a2V5fT5cbiAgICAgICAgICAgICAgICA8dGRcbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgICAgIHBhZGRpbmdSaWdodDogXCIwLjI1ZW1cIixcbiAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodDogXCJib2xkXCIsXG4gICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICB7a2V5fVxuICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgPHRkIHN0eWxlPXt7IHBhZGRpbmdMZWZ0OiBcIjAuMjVlbVwiIH19Pnt2YWx1ZX08L3RkPlxuICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgKSl9XG4gICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgPC90YWJsZT5cbiAgICAgIDwvZGl2PlxuICAgICkgOiBudWxsO1xuXG4gIHJldHVybiAoXG4gICAgPFJlYWN0LkZyYWdtZW50PlxuICAgICAgPGhlYWRlclxuICAgICAgICBzdHlsZT17e1xuICAgICAgICAgIHBhZGRpbmc6IFwiM3B4IDBcIixcbiAgICAgICAgICBkaXNwbGF5OiBcImZsZXhcIixcbiAgICAgICAgICBmbGV4RGlyZWN0aW9uOiBcImNvbHVtblwiLFxuICAgICAgICAgIGFsaWduSXRlbXM6IFwiY2VudGVyXCIsXG4gICAgICAgICAganVzdGlmeUNvbnRlbnQ6IFwiY2VudGVyXCIsXG4gICAgICAgIH19XG4gICAgICA+XG4gICAgICAgIHtpZCAmJiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJpZFwiIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IFwiYm9sZFwiIH19PlxuICAgICAgICAgICAge2lkfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgICA8ZGl2Pntub2RlLmNsYXNzfTwvZGl2PlxuICAgICAgPC9oZWFkZXI+XG4gICAgICB7cGFyYW1zfVxuICAgIDwvUmVhY3QuRnJhZ21lbnQ+XG4gICk7XG59O1xuIiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
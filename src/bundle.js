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
				subtitle: "muuu",
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
			var node = {
				id: undefined,
				class: "Unknown",
				color: "darkgrey",
				height: 30,
				width: 100,

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
				node.height = 50;
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

			var width = 20 + Math.max.apply(Math, _toConsumableArray([node.class, node.userGeneratedId ? node.userGeneratedId : ""].map(function (string) {
				return pixelWidth(string, { size: 16 });
			})));

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
			BlockParameters: function BlockParameters(_, list, __) {
				return list.eval();
			},
			Parameter: function Parameter(name, _, value) {
				return {
					kind: "Parameter",
					name: name.eval(),
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var VisualGraph = function (_React$Component) {
    _inherits(VisualGraph, _React$Component);

    function VisualGraph(props) {
        _classCallCheck(this, VisualGraph);

        var _this = _possibleConstructorReturn(this, (VisualGraph.__proto__ || Object.getPrototypeOf(VisualGraph)).call(this, props));

        _this.graphLayout = new GraphLayout(_this.saveGraph.bind(_this));
        _this.state = {
            graph: null,
            previousViewBox: null
        };
        _this.animate = null;
        _this.previousViewBox = "0 0 0 0";
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

            if (!this.state.graph) {
                // console.log(this.state.graph)
                return null;
            }

            var g = this.state.graph;

            var nodes = g.nodes().map(function (nodeName) {
                var graph = _this2;
                var n = g.node(nodeName);
                var props = {
                    key: nodeName,
                    node: n,
                    onClick: graph.handleClick.bind(graph)
                };

                var Type = null;

                if (n.isMetanode === true) {
                    if (n.isAnonymous) {
                        Type = AnonymousMetanode;
                    } else {
                        Type = Metanode;
                    }
                } else {
                    if (n.userGeneratedId) {
                        Type = IdentifiedNode;
                    } else {
                        Type = AnonymousNode;
                    }
                }

                return React.createElement(Type, props);
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

            setTimeout(function () {
                _this2.previousViewBox = viewBox;
            }, 300);

            return React.createElement(
                "svg",
                { id: "visualization", xmlns: "http://www.w3.org/2000/svg", version: "1.1", height: g.graph().height, width: g.graph().width },
                React.createElement(
                    "style",
                    null,
                    fs.readFileSync(__dirname + "/src/bundle.css", "utf-8", function (err) {
                        console.log(err);
                    })
                ),
                React.createElement("animate", { ref: this.mount.bind(this), attributeName: "viewBox", from: this.previousViewBox, to: viewBox, begin: "0s", dur: "0.25s", fill: "freeze", repeatCount: "1",
                    calcMode: "paced"
                }),
                React.createElement(
                    "defs",
                    null,
                    React.createElement(
                        "marker",
                        { id: "arrow", viewBox: "0 0 10 10", refX: "10", refY: "5", markerUnits: "strokeWidth", markerWidth: "10", markerHeight: "7.5", orient: "auto" },
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
                { className: "edge", markerEnd: "url(#arrow)" },
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
            var type = n.isMetanode ? "metanode" : "node";

            return React.createElement(
                "g",
                { className: type + " " + n.class, onClick: this.handleClick.bind(this), transform: "translate(" + Math.floor(n.x - n.width / 2) + "," + Math.floor(n.y - n.height / 2) + ")" },
                React.createElement("rect", { width: n.width, height: n.height, rx: "15px", ry: "15px", style: n.style }),
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

var AnonymousMetanode = function (_Node2) {
    _inherits(AnonymousMetanode, _Node2);

    function AnonymousMetanode() {
        _classCallCheck(this, AnonymousMetanode);

        return _possibleConstructorReturn(this, (AnonymousMetanode.__proto__ || Object.getPrototypeOf(AnonymousMetanode)).apply(this, arguments));
    }

    _createClass(AnonymousMetanode, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                Node,
                this.props,
                React.createElement(
                    "text",
                    { transform: "translate(10,0)", textAnchor: "start", style: { dominantBaseline: "ideographic" } },
                    React.createElement(
                        "tspan",
                        { x: "0", className: "id" },
                        n.userGeneratedId
                    )
                )
            );
        }
    }]);

    return AnonymousMetanode;
}(Node);

var AnonymousNode = function (_Node3) {
    _inherits(AnonymousNode, _Node3);

    function AnonymousNode() {
        _classCallCheck(this, AnonymousNode);

        return _possibleConstructorReturn(this, (AnonymousNode.__proto__ || Object.getPrototypeOf(AnonymousNode)).apply(this, arguments));
    }

    _createClass(AnonymousNode, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            return React.createElement(
                Node,
                this.props,
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

var IdentifiedNode = function (_Node4) {
    _inherits(IdentifiedNode, _Node4);

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvSW50ZXJwcmV0ZXIuanMiLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvUGFuZWwuanN4Iiwic2NyaXB0cy9QYXJzZXIuanMiLCJzY3JpcHRzL1B5VG9yY2hHZW5lcmF0b3IuanMiLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSxnQjs7OzthQUNGLFMsR0FBWSxJQUFJLFNBQUosQ0FBYztBQUN0Qix3QkFBWSxDQUFDLEdBQUQsQ0FEVTtBQUV0Qix1QkFBVyxDQUFDLElBQUQsQ0FGVztBQUd0QixrQkFBTSxLQUFLO0FBSFcsU0FBZCxDO2FBTVosUyxHQUFZLElBQUksU0FBSixDQUFjO0FBQ3RCLHdCQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFEO0FBRlcsU0FBZCxDOzs7OztpQ0FLSCxHLEVBQUs7QUFDVixnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsd0JBQVEsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUFSO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsdUJBQU8sT0FBTyxFQUFQLEdBQVksSUFBSSxVQUFKLENBQWUsQ0FB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LEdBQUQsT0FBaEIsRUFBd0IsU0FBUyxjQUFULENBQXdCLFFBQXhCLENBQXhCO0FBQ0Q7O0FBRUQsSUFBTSxlQUFlLENBQUMsVUFBRCxFQUFhLFFBQWIsRUFBdUIsYUFBdkIsQ0FBckI7O0FBRUEsSUFBSSxhQUFhLFFBQWIsQ0FBc0IsU0FBUyxVQUEvQixLQUE4QyxTQUFTLElBQTNELEVBQWlFO0FBQy9EO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsU0FBTyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb2xvckhhc2hXcmFwcGVye1xuICAgIGNvbG9ySGFzaCA9IG5ldyBDb2xvckhhc2goe1xuICAgICAgICBzYXR1cmF0aW9uOiBbMC45XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgICAgIGhhc2g6IHRoaXMubWFnaWNcbiAgICB9KVxuXG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjUsIDAuNiwgMC43XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgfSlcblxuICAgIGxvc2VMb3NlKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoICs9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgbWFnaWMoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoICogNDcgKyBzdHIuY2hhckNvZGVBdChpKSAlIDMyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgaGV4KHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvckhhc2guaGV4KHN0cilcbiAgICB9XG59IiwiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRub2RlQ291bnRlciA9IHt9XG5cdF9ub2RlU3RhY2sgPSBbXVxuXHRfcHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Z2V0IG5vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBub2RlU3RhY2sodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRnZXQgcHJldmlvdXNOb2RlU3RhY2soKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBwcmV2aW91c05vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5jbGVhck5vZGVTdGFjaygpXG5cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0XHR0aGlzLm1ldGFub2RlcyA9IHt9XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrID0gW11cblxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGVzOlwiLCB0aGlzLm1ldGFub2Rlcylcblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlIFN0YWNrOlwiLCB0aGlzLm1ldGFub2RlU3RhY2spXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubWV0YW5vZGVTdGFjaylcblxuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tuYW1lXTtcblx0fVxuXG5cdGV4aXRNZXRhbm9kZVNjb3BlKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2RlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRnZW5lcmF0ZUluc3RhbmNlSWQodHlwZSkge1xuXHRcdGlmICghdGhpcy5ub2RlQ291bnRlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHRcdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSA9IDA7XG5cdFx0fVxuXHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gKz0gMTtcblx0XHRsZXQgaWQgPSBcImFfXCIgKyB0eXBlICsgdGhpcy5ub2RlQ291bnRlclt0eXBlXTtcblx0XHRyZXR1cm4gaWQ7XG5cdH1cblxuXHRhZGRNYWluKCkge1xuXHRcdHRoaXMuZW50ZXJNZXRhbm9kZVNjb3BlKFwibWFpblwiKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGBUb3VjaGluZyBub2RlIFwiJHtub2RlUGF0aH1cIi5gKVxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKVxuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2tbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpXG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpXG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRlZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG5vZGUpIHtcblx0XHRjb25zdCBtZXRhbm9kZUNsYXNzID0gbm9kZS5jbGFzc1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpXG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpXG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdGxldCB0YXJnZXRNZXRhbm9kZSA9IHRoaXMubWV0YW5vZGVzW21ldGFub2RlQ2xhc3NdO1xuXHRcdHRhcmdldE1ldGFub2RlLm5vZGVzKCkuZm9yRWFjaChub2RlSWQgPT4ge1xuXHRcdFx0bGV0IG5vZGUgPSB0YXJnZXRNZXRhbm9kZS5ub2RlKG5vZGVJZCk7XG5cdFx0XHRpZiAoIW5vZGUpIHsgcmV0dXJuIH1cblx0XHRcdGxldCBuZXdOb2RlSWQgPSBub2RlSWQucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dmFyIG5ld05vZGUgPSB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdGlkOiBuZXdOb2RlSWRcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShuZXdOb2RlSWQsIG5ld05vZGUpO1xuXG5cdFx0XHRsZXQgbmV3UGFyZW50ID0gdGFyZ2V0TWV0YW5vZGUucGFyZW50KG5vZGVJZCkucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobmV3Tm9kZUlkLCBuZXdQYXJlbnQpO1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0TWV0YW5vZGUuZWRnZXMoKS5mb3JFYWNoKGVkZ2UgPT4ge1xuXHRcdFx0Y29uc3QgZSA9IHRhcmdldE1ldGFub2RlLmVkZ2UoZWRnZSlcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB7fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja11cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aClcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRjb25zdCBpc0F2YWlsYWJsZSA9ICh0aGlzLmdyYXBoLmluRWRnZXMobm9kZVBhdGgpLmxlbmd0aCA9PT0gMClcblx0XHRjb25zdCBpc0lucHV0ID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIilcblx0XHRjb25zdCBpc1VuZGVmaW5lZCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcInVuZGVmaW5lZFwiKVxuXHRcdHJldHVybiAoaXNJbnB1dCB8fCAoaXNVbmRlZmluZWQgJiYgaXNBdmFpbGFibGUpKVxuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRjb25zdCBpc0F2YWlsYWJsZSA9ICh0aGlzLmdyYXBoLm91dEVkZ2VzKG5vZGVQYXRoKS5sZW5ndGggPT09IDApXG5cdFx0Y29uc3QgaXNPdXRwdXQgPSAodGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIilcblx0XHRjb25zdCBpc1VuZGVmaW5lZCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcInVuZGVmaW5lZFwiKVxuXHRcdHJldHVybiAoaXNPdXRwdXQgfHwgKGlzVW5kZWZpbmVkICYmIGlzQXZhaWxhYmxlKSlcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhcImlzTWV0YW5vZGU6XCIsIG5vZGVQYXRoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWVcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpXG5cdFx0bGV0IG91dHB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHRoaXMuaXNPdXRwdXQobm9kZSkpXG5cblx0XHRpZiAob3V0cHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSBlbHNlIGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDEgJiYgdGhpcy5ncmFwaC5ub2RlKG91dHB1dE5vZGVzWzBdKS5pc01ldGFub2RlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPdXRwdXROb2RlcyhvdXRwdXROb2Rlc1swXSlcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0Tm9kZXNcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0Y29uc29sZS5sb2coc2NvcGVQYXRoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpXG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4gdGhpcy5pc0lucHV0KG5vZGUpKVxuXHRcdGNvbnNvbGUubG9nKGlucHV0Tm9kZXMpXG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgSW5wdXQgbm9kZXMuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKGlucHV0Tm9kZXMubGVuZ3RoID09PSAxICYmIHRoaXMuZ3JhcGgubm9kZShpbnB1dE5vZGVzWzBdKS5pc01ldGFub2RlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJbnB1dE5vZGVzKGlucHV0Tm9kZXNbMF0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXNcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cdFx0dmFyIHNvdXJjZVBhdGhzXG5cblx0XHRpZiAodHlwZW9mIGZyb21QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IHRoaXMuZ2V0T3V0cHV0Tm9kZXMoZnJvbVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IFtmcm9tUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZnJvbVBhdGgpKSB7XG5cdFx0XHRzb3VyY2VQYXRocyA9IGZyb21QYXRoXG5cdFx0fVxuXG5cdFx0dmFyIHRhcmdldFBhdGhzXG5cblx0XHRpZiAodHlwZW9mIHRvUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gdGhpcy5nZXRJbnB1dE5vZGVzKHRvUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gW3RvUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9QYXRoKSkge1xuXHRcdFx0dGFyZ2V0UGF0aHMgPSB0b1BhdGhcblx0XHR9XG5cblx0XHR0aGlzLnNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cdH1cblxuXHRzZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKSB7XG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7fSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwpKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG5cblx0Z2V0TWV0YW5vZGVzKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmNvbnRhaW5zKGMucm93LCBjLmNvbHVtbikpLnJlZHVjZSggKHByZXYsIGN1cnIpID0+IHByZXYgfHwgY3VyciwgZmFsc2UpO1xuXG4gICAgICAgIGlmIChjdXJzb3JPdmVyTWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhY2UuZWRpdCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKFwiYWNlL21vZGUvXCIgKyB0aGlzLnByb3BzLm1vZGUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS9cIiArIHRoaXMucHJvcHMudGhlbWUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTbmlwcGV0czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICB3cmFwOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEVkaXRvckludG9WaWV3OiB0cnVlLFxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJGaXJhIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdGFjdGl2ZVdvcmtlcnMgPSB7fVxuXHRjdXJyZW50V29ya2VySWQgPSAwXG5cdGxhc3RGaW5pc2hlZFdvcmtlcklkID0gMFxuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG5cdGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG5cdH1cblxuXHRsYXlvdXQoZ3JhcGgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuZ2V0V29ya2VySWQoKVxuXHRcdHRoaXMuYWN0aXZlV29ya2Vyc1tpZF0gPSBuZXcgTGF5b3V0V29ya2VyKGlkLCBncmFwaCwgdGhpcy53b3JrZXJGaW5pc2hlZC5iaW5kKHRoaXMpKVxuXHR9XG5cblx0d29ya2VyRmluaXNoZWQoe2lkLCBncmFwaH0pIHtcblx0XHRpZiAoaWQgPj0gdGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCkge1xuXHRcdFx0dGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCA9IGlkXG5cdFx0XHR0aGlzLmNhbGxiYWNrKGdyYXBoKVxuXHRcdH1cblx0fVxuXG5cdGdldFdvcmtlcklkKCkge1xuXHRcdHRoaXMuY3VycmVudFdvcmtlcklkICs9IDFcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50V29ya2VySWRcblx0fVxufVxuXG5jbGFzcyBMYXlvdXRXb3JrZXJ7XG5cdGlkID0gMFxuXHR3b3JrZXIgPSBudWxsXG5cdGNvbnN0cnVjdG9yKGlkLCBncmFwaCwgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuaWQgPSBpZFxuXHRcdHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpXG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpXG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZFxuXHRcdFxuXHRcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuZW5jb2RlKGdyYXBoKSlcblx0fVxuXHRyZWNlaXZlKG1lc3NhZ2UpIHtcblx0XHR0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuXHRcdHRoaXMub25GaW5pc2hlZCh7XG5cdFx0XHRpZDogdGhpcy5pZCxcblx0XHRcdGdyYXBoOiB0aGlzLmRlY29kZShtZXNzYWdlLmRhdGEpXG5cdFx0fSlcblx0fVxuXHRlbmNvZGUoZ3JhcGgpIHtcblx0XHRyZXR1cm4gZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaClcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoanNvbilcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuXHRpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcigpXG5cdGdlbmVyYXRvciA9IG5ldyBQeVRvcmNoR2VuZXJhdG9yKClcblxuXHRsb2NrID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdC8vIHRoZXNlIGFyZSBubyBsb25nZXIgbmVlZGVkIGhlcmVcblx0XHRcdC8vIFwiZ3JhbW1hclwiOiB0aGlzLnBhcnNlci5ncmFtbWFyLFxuXHRcdFx0Ly8gXCJzZW1hbnRpY3NcIjogdGhpcy5wYXJzZXIuc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImxheW91dFwiOiBcImNvbHVtbnNcIixcblx0XHRcdFwiZ2VuZXJhdGVkQ29kZVwiOiBcIlwiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2dyYXBoLnN2Z1wiLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpLm91dGVySFRNTCwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguanNvblwiLCBKU09OLnN0cmluZ2lmeShkYWdyZS5ncmFwaGxpYi5qc29uLndyaXRlKHRoaXMuc3RhdGUuZ3JhcGgpLCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvaGFsZi1hc3NlZF9qb2tlLnB5XCIsIHRoaXMuc3RhdGUuZ2VuZXJhdGVkQ29kZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcblx0XHRcdFx0c3VidGl0bGU6IFwibXV1dVwiLFxuXHRcdFx0XHRib2R5OiBgQ2xpY2sgdG8gb3BlbiBzYXZlZCBza2V0Y2guYCxcblx0XHRcdFx0c2lsZW50OiB0cnVlLFxuXHRcdFx0fSlcblx0XHRcdGNvbnN0IHtzaGVsbH0gPSByZXF1aXJlKCdlbGVjdHJvbicpXG5cdFx0XHRcblx0XHRcdHNhdmVOb3RpZmljYXRpb24ub25jbGljayA9ICgpID0+IHtcblx0XHRcdFx0c2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihtZXNzYWdlLmZvbGRlcilcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRpcGMub24oXCJvcGVuXCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLm9wZW5GaWxlKG0uZmlsZVBhdGgpXG5cdFx0fSlcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5pbnRlcnByZXRlci5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0b3BlbkZpbGUoZmlsZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIm9wZW5GaWxlXCIsIGZpbGVQYXRoKVxuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZXIubWFrZSh2YWx1ZSlcblxuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLmludGVycHJldGVyLmV4ZWN1dGUocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKClcblx0XHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0TWV0YW5vZGVzRGVmaW5pdGlvbnMoKVxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcInJlc2l6ZVwiKSlcblx0XHR9LCAxMDApXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiLypcblx0VGhpcyBjb2RlIGlzIGEgbWVzcy5cbiovXG5cbmNvbnN0IHBpeGVsV2lkdGggPSByZXF1aXJlKCdzdHJpbmctcGl4ZWwtd2lkdGgnKVxuXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0XHR0aGlzLmRlcHRoID0gMFxuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiRGVjb252b2x1dGlvblwiLCBcIkF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlTWF4UG9vbGluZ1wiLCBcIk1heFVucG9vbGluZ1wiLCBcIkxvY2FsUmVzcG9uc2VOb3JtYWxpemF0aW9uXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGV4ZWN1dGUoYXN0KSB7XG5cdFx0Y29uc3Qgc3RhdGUgPSB7XG5cdFx0XHRncmFwaDogbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKSxcblx0XHRcdGxvZ2dlcjogbmV3IExvZ2dlcigpXG5cdFx0fVxuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpXG5cdFx0dGhpcy53YWxrQXN0KGFzdCwgc3RhdGUpXG5cdFx0Y29uc29sZS5sb2coXCJGaW5hbCBTdGF0ZTpcIiwgc3RhdGUpXG5cdH1cblxuXHR3YWxrQXN0KHRva2VuLCBzdGF0ZSkge1xuXHRcdGlmICghdG9rZW4pIHsgY29uc29sZS5lcnJvcihcIk5vIHRva2VuPyFcIik7IHJldHVybjsgfVxuXHRcdHRoaXMuZGVwdGggKz0gMVxuXHRcdGNvbnN0IHBhZCA9IEFycmF5LmZyb20oe2xlbmd0aDogdGhpcy5kZXB0aH0pLmZpbGwoXCIgXCIpLnJlZHVjZSgocCwgYykgPT4gcCArIGMsIFwiXCIpXG5cdFx0Ly9jb25zb2xlLmxvZyhwYWQgKyB0b2tlbi5raW5kKVxuXG5cdFx0Y29uc3QgZm5OYW1lID0gXCJfXCIgKyB0b2tlbi5raW5kXG5cdFx0Y29uc3QgZm4gPSB0aGlzW2ZuTmFtZV0gfHwgdGhpcy5fdW5yZWNvZ25pemVkXG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBmbi5jYWxsKHRoaXMsIHRva2VuLCBzdGF0ZSlcblx0XHR0aGlzLmRlcHRoIC09IDFcblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZVxuXHR9XG5cblx0X0dyYXBoKGdyYXBoLCBzdGF0ZSkge1xuXHRcdGdyYXBoLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKTtcblx0fVxuXG5cdF9Ob2RlRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbiwgc3RhdGUpwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke25vZGVEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRpZiAobm9kZURlZmluaXRpb24uYm9keSkge1xuXHRcdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKG5vZGVEZWZpbml0aW9uLm5hbWUpXG5cdFx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShub2RlRGVmaW5pdGlvbi5uYW1lKVxuXHRcdFx0dGhpcy53YWxrQXN0KG5vZGVEZWZpbml0aW9uLmJvZHksIHN0YXRlKVxuXHRcdFx0c3RhdGUuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKVxuXHRcdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0fVxuXHR9XG5cdFxuXHRfQ2hhaW4oY2hhaW4sIHN0YXRlKSB7XG5cdFx0c3RhdGUuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjaGFpbi5ibG9ja3MuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHN0YXRlLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0sIHN0YXRlKVxuXHRcdH0pXG5cdH1cblxuXHRfSW5saW5lTWV0YU5vZGUobm9kZSwgc3RhdGUpIHtcblx0XHQvL2NvbnNvbGUubG9nKG5vZGUpXG5cdFx0Y29uc3QgaWRlbnRpZmllciA9IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQoXCJtZXRhbm9kZVwiKVxuXG5cdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGlkZW50aWZpZXIpXG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoaWRlbnRpZmllcilcblx0XHR0aGlzLndhbGtBc3Qobm9kZS5ib2R5LCBzdGF0ZSlcblx0XHRzdGF0ZS5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogbm9kZS5hbGlhcyA/IG5vZGUuYWxpYXMudmFsdWUgOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogaWRlbnRpZmllcixcblx0XHRcdGNsYXNzOiBpZGVudGlmaWVyLFxuXHRcdFx0aXNBbm9ueW1vdXM6IHRydWUsXG5cdFx0XHRfc291cmNlOiBub2RlLl9zb3VyY2Vcblx0XHR9KVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiBpZGVudGlmaWVyLFxuXHRcdFx0Y2xhc3M6IGlkZW50aWZpZXIsXG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdW5kZWZpbmVkLFxuXHRcdFx0X3NvdXJjZTogbm9kZS5fc291cmNlXG5cdFx0fVxuXHR9XG5cblx0X01ldGFOb2RlKG1ldGFub2RlLCBzdGF0ZSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKG1ldGFub2RlKVxuXHRcdG1ldGFub2RlLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKVxuXHR9XG5cblxuXHRfTm9kZShub2RlLCBzdGF0ZSkge1xuXHRcdGNvbnN0IG5vZGVEZWZpbml0aW9uID0gdGhpcy53YWxrQXN0KHtcblx0XHRcdC4uLm5vZGUubm9kZSxcblx0XHRcdGFsaWFzOiBub2RlLmFsaWFzXG5cdFx0fSwgc3RhdGUpXG5cblx0XHQvLyBjb25zb2xlLmxvZyhub2RlRGVmaW5pdGlvbilcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRfTGl0ZXJhbE5vZGUoaW5zdGFuY2UsIHN0YXRlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UudHlwZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UudHlwZS52YWx1ZTtcblx0XHRcdG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UudHlwZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdXG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvclxuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS50eXBlLnZhbHVlXG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLnR5cGUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHRsZXQgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKVxuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMVxuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHsgXCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCkgfVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHdpZHRoID0gMjAgKyBNYXRoLm1heCguLi5bbm9kZS5jbGFzcywgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZCA6IFwiXCJdLm1hcChzdHJpbmcgPT4gcGl4ZWxXaWR0aChzdHJpbmcsIHtzaXplOiAxNn0pKSlcblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fSlcblxuXHRcdHJldHVybiB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fVxuXHR9XG5cblx0X0xpc3QobGlzdCwgc3RhdGUpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtLCBzdGF0ZSkpXG5cdH1cblxuXHRfSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG5cdFx0dGhpcy5ncmFwaC5yZWZlcmVuY2VOb2RlKGlkZW50aWZpZXIudmFsdWUpXG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKVxuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IEludGVycHJldGVyLm5hbWVSZXNvbHV0aW9uKHF1ZXJ5LCBkZWZpbml0aW9ucylcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cylcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pXG5cdFx0cmV0dXJuIG1hdGNoZWREZWZpbml0aW9uc1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKClcblx0fVxuXG5cdGdldE1ldGFub2Rlc0RlZmluaXRpb25zKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldE1ldGFub2RlcygpXG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpXG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKVxuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvXG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KVxuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSlcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gSW50ZXJwcmV0ZXIuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKVxuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSlcblx0ICAgIHJldHVybiByZXN1bHRcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZSB9XG5cdCAgICBsZXQgaSA9IDBcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDEgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCkgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHRfdW5yZWNvZ25pemVkKHRva2VuKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIHRva2VuP1wiLCB0b2tlbilcblx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuY29uc3Qgb2htID0gcmVxdWlyZShcIm9obS1qc1wiKVxuXG5jbGFzcyBQYXJzZXJ7XG5cdGNvbnRlbnRzID0gbnVsbFxuXHRncmFtbWFyID0gbnVsbFxuXHRcblx0ZXZhbE9wZXJhdGlvbiA9IHtcblx0XHRHcmFwaDogKGRlZmluaXRpb25zKSA9PiAgKHtcblx0XHRcdGtpbmQ6IFwiR3JhcGhcIixcblx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5ldmFsKClcblx0XHR9KSxcblx0XHROb2RlRGVmaW5pdGlvbjogZnVuY3Rpb24oXywgbGF5ZXJOYW1lLCBwYXJhbXMsIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZURlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKClbMF1cblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZU1ldGFOb2RlOiBmdW5jdGlvbihib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklubGluZU1ldGFOb2RlXCIsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0TWV0YU5vZGU6IGZ1bmN0aW9uKF8sIGRlZnMsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBkZWZzLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJNZXRhTm9kZVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZGVmaW5pdGlvbnNcblx0XHRcdH1cblx0XHR9LFxuXHRcdENoYWluOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkNoYWluXCIsXG5cdFx0XHRcdGJsb2NrczogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdE5vZGU6IGZ1bmN0aW9uKGlkLCBfLCBub2RlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIk5vZGVcIixcblx0XHRcdFx0bm9kZTogbm9kZS5ldmFsKCksXG5cdFx0XHRcdGFsaWFzOiBpZC5ldmFsKClbMF0sXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRMaXRlcmFsTm9kZTogZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkxpdGVyYWxOb2RlXCIsXG5cdFx0XHRcdHR5cGU6IHR5cGUuZXZhbCgpLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBwYXJhbXMuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKlxuXHRcdEJsb2NrTmFtZTogZnVuY3Rpb24oaWQsIF8pIHtcblx0XHRcdHJldHVybiBpZC5ldmFsKClcblx0XHR9LFxuXHRcdCovXG5cdFx0TGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTGlzdFwiLFxuXHRcdFx0XHRsaXN0OiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tQYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRwYXRoOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRub2RlVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZVR5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyBcIi9zcmMvbW9uaWVsLm9obVwiLCBcInV0ZjhcIilcblx0XHR0aGlzLmdyYW1tYXIgPSBvaG0uZ3JhbW1hcih0aGlzLmNvbnRlbnRzKVxuXHRcdHRoaXMuc2VtYW50aWNzID0gdGhpcy5ncmFtbWFyLmNyZWF0ZVNlbWFudGljcygpLmFkZE9wZXJhdGlvbihcImV2YWxcIiwgdGhpcy5ldmFsT3BlcmF0aW9uKVxuXHR9XG5cblx0bWFrZShzb3VyY2UpIHtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5ncmFtbWFyLm1hdGNoKHNvdXJjZSlcblxuXHRcdGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0XHRcdHZhciBhc3QgPSB0aGlzLnNlbWFudGljcyhyZXN1bHQpLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXN0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHBlY3RlZCxcblx0XHRcdFx0cG9zaXRpb25cblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSIsImNsYXNzIFB5VG9yY2hHZW5lcmF0b3Ige1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmJ1aWx0aW5zID0gW1wiQXJpdGhtZXRpY0Vycm9yXCIsIFwiQXNzZXJ0aW9uRXJyb3JcIiwgXCJBdHRyaWJ1dGVFcnJvclwiLCBcIkJhc2VFeGNlcHRpb25cIiwgXCJCbG9ja2luZ0lPRXJyb3JcIiwgXCJCcm9rZW5QaXBlRXJyb3JcIiwgXCJCdWZmZXJFcnJvclwiLCBcIkJ5dGVzV2FybmluZ1wiLCBcIkNoaWxkUHJvY2Vzc0Vycm9yXCIsIFwiQ29ubmVjdGlvbkFib3J0ZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25FcnJvclwiLCBcIkNvbm5lY3Rpb25SZWZ1c2VkRXJyb3JcIiwgXCJDb25uZWN0aW9uUmVzZXRFcnJvclwiLCBcIkRlcHJlY2F0aW9uV2FybmluZ1wiLCBcIkVPRkVycm9yXCIsIFwiRWxsaXBzaXNcIiwgXCJFbnZpcm9ubWVudEVycm9yXCIsIFwiRXhjZXB0aW9uXCIsIFwiRmFsc2VcIiwgXCJGaWxlRXhpc3RzRXJyb3JcIiwgXCJGaWxlTm90Rm91bmRFcnJvclwiLCBcIkZsb2F0aW5nUG9pbnRFcnJvclwiLCBcIkZ1dHVyZVdhcm5pbmdcIiwgXCJHZW5lcmF0b3JFeGl0XCIsIFwiSU9FcnJvclwiLCBcIkltcG9ydEVycm9yXCIsIFwiSW1wb3J0V2FybmluZ1wiLCBcIkluZGVudGF0aW9uRXJyb3JcIiwgXCJJbmRleEVycm9yXCIsIFwiSW50ZXJydXB0ZWRFcnJvclwiLCBcIklzQURpcmVjdG9yeUVycm9yXCIsIFwiS2V5RXJyb3JcIiwgXCJLZXlib2FyZEludGVycnVwdFwiLCBcIkxvb2t1cEVycm9yXCIsIFwiTWVtb3J5RXJyb3JcIiwgXCJNb2R1bGVOb3RGb3VuZEVycm9yXCIsIFwiTmFtZUVycm9yXCIsIFwiTm9uZVwiLCBcIk5vdEFEaXJlY3RvcnlFcnJvclwiLCBcIk5vdEltcGxlbWVudGVkXCIsIFwiTm90SW1wbGVtZW50ZWRFcnJvclwiLCBcIk9TRXJyb3JcIiwgXCJPdmVyZmxvd0Vycm9yXCIsIFwiUGVuZGluZ0RlcHJlY2F0aW9uV2FybmluZ1wiLCBcIlBlcm1pc3Npb25FcnJvclwiLCBcIlByb2Nlc3NMb29rdXBFcnJvclwiLCBcIlJlY3Vyc2lvbkVycm9yXCIsIFwiUmVmZXJlbmNlRXJyb3JcIiwgXCJSZXNvdXJjZVdhcm5pbmdcIiwgXCJSdW50aW1lRXJyb3JcIiwgXCJSdW50aW1lV2FybmluZ1wiLCBcIlN0b3BBc3luY0l0ZXJhdGlvblwiLCBcIlN0b3BJdGVyYXRpb25cIiwgXCJTeW50YXhFcnJvclwiLCBcIlN5bnRheFdhcm5pbmdcIiwgXCJTeXN0ZW1FcnJvclwiLCBcIlN5c3RlbUV4aXRcIiwgXCJUYWJFcnJvclwiLCBcIlRpbWVvdXRFcnJvclwiLCBcIlRydWVcIiwgXCJUeXBlRXJyb3JcIiwgXCJVbmJvdW5kTG9jYWxFcnJvclwiLCBcIlVuaWNvZGVEZWNvZGVFcnJvclwiLCBcIlVuaWNvZGVFbmNvZGVFcnJvclwiLCBcIlVuaWNvZGVFcnJvclwiLCBcIlVuaWNvZGVUcmFuc2xhdGVFcnJvclwiLCBcIlVuaWNvZGVXYXJuaW5nXCIsIFwiVXNlcldhcm5pbmdcIiwgXCJWYWx1ZUVycm9yXCIsIFwiV2FybmluZ1wiLCBcIlplcm9EaXZpc2lvbkVycm9yXCIsIFwiX19idWlsZF9jbGFzc19fXCIsIFwiX19kZWJ1Z19fXCIsIFwiX19kb2NfX1wiLCBcIl9faW1wb3J0X19cIiwgXCJfX2xvYWRlcl9fXCIsIFwiX19uYW1lX19cIiwgXCJfX3BhY2thZ2VfX1wiLCBcIl9fc3BlY19fXCIsIFwiYWJzXCIsIFwiYWxsXCIsIFwiYW55XCIsIFwiYXNjaWlcIiwgXCJiaW5cIiwgXCJib29sXCIsIFwiYnl0ZWFycmF5XCIsIFwiYnl0ZXNcIiwgXCJjYWxsYWJsZVwiLCBcImNoclwiLCBcImNsYXNzbWV0aG9kXCIsIFwiY29tcGlsZVwiLCBcImNvbXBsZXhcIiwgXCJjb3B5cmlnaHRcIiwgXCJjcmVkaXRzXCIsIFwiZGVsYXR0clwiLCBcImRpY3RcIiwgXCJkaXJcIiwgXCJkaXZtb2RcIiwgXCJlbnVtZXJhdGVcIiwgXCJldmFsXCIsIFwiZXhlY1wiLCBcImV4aXRcIiwgXCJmaWx0ZXJcIiwgXCJmbG9hdFwiLCBcImZvcm1hdFwiLCBcImZyb3plbnNldFwiLCBcImdldGF0dHJcIiwgXCJnbG9iYWxzXCIsIFwiaGFzYXR0clwiLCBcImhhc2hcIiwgXCJoZWxwXCIsIFwiaGV4XCIsIFwiaWRcIiwgXCJpbnB1dFwiLCBcImludFwiLCBcImlzaW5zdGFuY2VcIiwgXCJpc3N1YmNsYXNzXCIsIFwiaXRlclwiLCBcImxlblwiLCBcImxpY2Vuc2VcIiwgXCJsaXN0XCIsIFwibG9jYWxzXCIsIFwibWFwXCIsIFwibWF4XCIsIFwibWVtb3J5dmlld1wiLCBcIm1pblwiLCBcIm5leHRcIiwgXCJvYmplY3RcIiwgXCJvY3RcIiwgXCJvcGVuXCIsIFwib3JkXCIsIFwicG93XCIsIFwicHJpbnRcIiwgXCJwcm9wZXJ0eVwiLCBcInF1aXRcIiwgXCJyYW5nZVwiLCBcInJlcHJcIiwgXCJyZXZlcnNlZFwiLCBcInJvdW5kXCIsIFwic2V0XCIsIFwic2V0YXR0clwiLCBcInNsaWNlXCIsIFwic29ydGVkXCIsIFwic3RhdGljbWV0aG9kXCIsIFwic3RyXCIsIFwic3VtXCIsIFwic3VwZXJcIiwgXCJ0dXBsZVwiLCBcInR5cGVcIiwgXCJ2YXJzXCIsIFwiemlwXCJdXG5cdFx0dGhpcy5rZXl3b3JkcyA9IFtcImFuZFwiLCBcImFzXCIsIFwiYXNzZXJ0XCIsIFwiYnJlYWtcIiwgXCJjbGFzc1wiLCBcImNvbnRpbnVlXCIsIFwiZGVmXCIsIFwiZGVsXCIsIFwiZWxpZlwiLCBcImVsc2VcIiwgXCJleGNlcHRcIiwgXCJleGVjXCIsIFwiZmluYWxseVwiLCBcImZvclwiLCBcImZyb21cIiwgXCJnbG9iYWxcIiwgXCJpZlwiLCBcImltcG9ydFwiLCBcImluXCIsIFwiaXNcIiwgXCJsYW1iZGFcIiwgXCJub3RcIiwgXCJvclwiLCBcInBhc3NcIiwgXCJwcmludFwiLCBcInJhaXNlXCIsIFwicmV0dXJuXCIsIFwidHJ5XCIsIFwid2hpbGVcIiwgXCJ3aXRoXCIsIFwieWllbGRcIl1cblx0fVxuXG4gICAgc2FuaXRpemUoaWQpIHtcblx0XHR2YXIgc2FuaXRpemVkSWQgPSBpZFxuXHRcdGlmICh0aGlzLmJ1aWx0aW5zLmluY2x1ZGVzKHNhbml0aXplZElkKSB8fCB0aGlzLmtleXdvcmRzLmluY2x1ZGVzKHNhbml0aXplZElkKSkge1xuXHRcdFx0c2FuaXRpemVkSWQgPSBcIl9cIiArIHNhbml0aXplZElkXG5cdFx0fVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwuL2csIFwidGhpc1wiKVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwvL2csIFwiLlwiKVxuXHRcdHJldHVybiBzYW5pdGl6ZWRJZFxuXHR9XG5cblx0bWFwVG9GdW5jdGlvbihub2RlVHlwZSkge1xuXHRcdGxldCB0cmFuc2xhdGlvblRhYmxlID0ge1xuXHRcdFx0XCJDb252b2x1dGlvblwiOiBcIkYuY29udjJkXCIsXG5cdFx0XHRcIkRlY29udm9sdXRpb25cIjogXCJGLmNvbnZfdHJhbnNwb3NlMmRcIixcblx0XHRcdFwiQXZlcmFnZVBvb2xpbmdcIjogXCJGLmF2Z19wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhQb29saW5nXCI6IFwiRi5tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIkFkYXB0aXZlTWF4UG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfbWF4X3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhVbnBvb2xpbmdcIjogXCJGLm1heF91bnBvb2wyZFwiLFxuXHRcdFx0XCJSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5yZWx1XCIsXG5cdFx0XHRcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiOiBcIkYuZWx1XCIsXG5cdFx0XHRcIlBhcmFtZXRyaWNSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5wcmVsdVwiLFxuXHRcdFx0XCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLmxlYWt5X3JlbHVcIixcblx0XHRcdFwiUmFuZG9taXplZFJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJyZWx1XCIsXG5cdFx0XHRcIlNpZ21vaWRcIjogXCJGLnNpZ21vaWRcIixcblx0XHRcdFwiTG9nU2lnbW9pZFwiOiBcIkYubG9nc2lnbW9pZFwiLFxuXHRcdFx0XCJUaHJlc2hvbGRcIjogXCJGLnRocmVzaG9sZFwiLFxuXHRcdFx0XCJIYXJkVGFuaFwiOiBcIkYuaGFyZHRhbmhcIixcblx0XHRcdFwiVGFuaFwiOiBcIkYudGFuaFwiLFxuXHRcdFx0XCJUYW5oU2hyaW5rXCI6IFwiRi50YW5oc2hyaW5rXCIsXG5cdFx0XHRcIkhhcmRTaHJpbmtcIjogXCJGLmhhcmRzaHJpbmtcIixcblx0XHRcdFwiTG9nU29mdE1heFwiOiBcIkYubG9nX3NvZnRtYXhcIixcblx0XHRcdFwiU29mdFNocmlua1wiOiBcIkYuc29mdHNocmlua1wiLFxuXHRcdFx0XCJTb2Z0TWF4XCI6IFwiRi5zb2Z0bWF4XCIsXG5cdFx0XHRcIlNvZnRNaW5cIjogXCJGLnNvZnRtaW5cIixcblx0XHRcdFwiU29mdFBsdXNcIjogXCJGLnNvZnRwbHVzXCIsXG5cdFx0XHRcIlNvZnRTaWduXCI6IFwiRi5zb2Z0c2lnblwiLFxuXHRcdFx0XCJCYXRjaE5vcm1hbGl6YXRpb25cIjogXCJGLmJhdGNoX25vcm1cIixcblx0XHRcdFwiTGluZWFyXCI6IFwiRi5saW5lYXJcIixcblx0XHRcdFwiRHJvcG91dFwiOiBcIkYuZHJvcG91dFwiLFxuXHRcdFx0XCJQYWlyd2lzZURpc3RhbmNlXCI6IFwiRi5wYWlyd2lzZV9kaXN0YW5jZVwiLFxuXHRcdFx0XCJDcm9zc0VudHJvcHlcIjogXCJGLmNyb3NzX2VudHJvcHlcIixcblx0XHRcdFwiQmluYXJ5Q3Jvc3NFbnRyb3B5XCI6IFwiRi5iaW5hcnlfY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJLdWxsYmFja0xlaWJsZXJEaXZlcmdlbmNlTG9zc1wiOiBcIkYua2xfZGl2XCIsXG5cdFx0XHRcIlBhZFwiOiBcIkYucGFkXCIsXG5cdFx0XHRcIlZhcmlhYmxlXCI6IFwiQUcuVmFyaWFibGVcIixcblx0XHRcdFwiUmFuZG9tTm9ybWFsXCI6IFwiVC5yYW5kblwiLFxuXHRcdFx0XCJUZW5zb3JcIjogXCJULlRlbnNvclwiXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkobm9kZVR5cGUpID8gdHJhbnNsYXRpb25UYWJsZVtub2RlVHlwZV0gOiBub2RlVHlwZVxuXG5cdH1cblxuXHRpbmRlbnQoY29kZSwgbGV2ZWwgPSAxLCBpbmRlbnRQZXJMZXZlbCA9IFwiICAgIFwiKSB7XG5cdFx0bGV0IGluZGVudCA9IGluZGVudFBlckxldmVsLnJlcGVhdChsZXZlbClcblx0XHRyZXR1cm4gY29kZS5zcGxpdChcIlxcblwiKS5tYXAobGluZSA9PiBpbmRlbnQgKyBsaW5lKS5qb2luKFwiXFxuXCIpXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGUoZ3JhcGgsIGRlZmluaXRpb25zKSB7XG5cdFx0bGV0IGltcG9ydHMgPVxuYGltcG9ydCB0b3JjaCBhcyBUXG5pbXBvcnQgdG9yY2gubm4uZnVuY3Rpb25hbCBhcyBGXG5pbXBvcnQgdG9yY2guYXV0b2dyYWQgYXMgQUdgXG5cblx0XHRsZXQgbW9kdWxlRGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9ucykubWFwKGRlZmluaXRpb25OYW1lID0+IHtcblx0XHRcdGlmIChkZWZpbml0aW9uTmFtZSAhPT0gXCJtYWluXCIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVDb2RlRm9yTW9kdWxlKGRlZmluaXRpb25OYW1lLCBkZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3JldHVybiBcIlwiXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGxldCBjb2RlID1cbmAke2ltcG9ydHN9XG5cbiR7bW9kdWxlRGVmaW5pdGlvbnMuam9pbihcIlxcblwiKX1cbmBcblxuXHRcdHJldHVybiBjb2RlXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGVGb3JNb2R1bGUoY2xhc3NuYW1lLCBncmFwaCkge1xuXHRcdGxldCB0b3BvbG9naWNhbE9yZGVyaW5nID0gZ3JhcGhsaWIuYWxnLnRvcHNvcnQoZ3JhcGgpXG5cdFx0bGV0IGZvcndhcmRGdW5jdGlvbiA9IFwiXCJcblxuXHRcdHRvcG9sb2dpY2FsT3JkZXJpbmcubWFwKG5vZGUgPT4ge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coXCJtdVwiLCBub2RlKVxuXHRcdFx0bGV0IG4gPSBncmFwaC5ub2RlKG5vZGUpXG5cdFx0XHRsZXQgY2ggPSBncmFwaC5jaGlsZHJlbihub2RlKVxuXG5cdFx0XHRpZiAoIW4pIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhuKVxuXG5cdFx0XHRpZiAoY2gubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdGxldCBpbk5vZGVzID0gZ3JhcGguaW5FZGdlcyhub2RlKS5tYXAoZSA9PiB0aGlzLnNhbml0aXplKGUudikpXG5cdFx0XHRcdGZvcndhcmRGdW5jdGlvbiArPSBgJHt0aGlzLnNhbml0aXplKG5vZGUpfSA9ICR7dGhpcy5tYXBUb0Z1bmN0aW9uKG4uY2xhc3MpfSgke2luTm9kZXMuam9pbihcIiwgXCIpfSlcXG5gXG5cdFx0XHR9IFxuXHRcdH0sIHRoaXMpXG5cblx0XHRsZXQgbW9kdWxlQ29kZSA9XG5gY2xhc3MgJHtjbGFzc25hbWV9KFQubm4uTW9kdWxlKTpcbiAgICBkZWYgX19pbml0X18oc2VsZiwgcGFyYW0xLCBwYXJhbTIpOiAjIHBhcmFtZXRlcnMgaGVyZVxuICAgICAgICBzdXBlcigke2NsYXNzbmFtZX0sIHNlbGYpLl9faW5pdF9fKClcbiAgICAgICAgIyBhbGwgZGVjbGFyYXRpb25zIGhlcmVcblxuICAgIGRlZiBmb3J3YXJkKHNlbGYsIGluMSwgaW4yKTogIyBhbGwgSW5wdXRzIGhlcmVcbiAgICAgICAgIyBhbGwgZnVuY3Rpb25hbCBzdHVmZiBoZXJlXG4ke3RoaXMuaW5kZW50KGZvcndhcmRGdW5jdGlvbiwgMil9XG4gICAgICAgIHJldHVybiAob3V0MSwgb3V0MikgIyBhbGwgT3V0cHV0cyBoZXJlXG5gXG5cdFx0cmV0dXJuIG1vZHVsZUNvZGVcblx0fVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY2xhc3MgVmlzdWFsR3JhcGggZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmdyYXBoTGF5b3V0ID0gbmV3IEdyYXBoTGF5b3V0KHRoaXMuc2F2ZUdyYXBoLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgZ3JhcGg6IG51bGwsXG4gICAgICAgICAgICBwcmV2aW91c1ZpZXdCb3g6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5hbmltYXRlID0gbnVsbFxuICAgICAgICB0aGlzLnByZXZpb3VzVmlld0JveCA9IFwiMCAwIDAgMFwiXG4gICAgfVxuXG4gICAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIG5leHRQcm9wcy5ncmFwaC5fbGFiZWwucmFua2RpciA9IG5leHRQcm9wcy5sYXlvdXQ7XG4gICAgICAgICAgICB0aGlzLmdyYXBoTGF5b3V0LmxheW91dChuZXh0UHJvcHMuZ3JhcGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0ZSAhPT0gbmV4dFN0YXRlKVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgY29uc3Qgbm9kZXMgPSBnLm5vZGVzKCkubWFwKG5vZGVOYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGdyYXBoID0gdGhpcztcbiAgICAgICAgICAgIGNvbnN0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgY29uc3QgcHJvcHMgPSB7XG4gICAgICAgICAgICAgICAga2V5OiBub2RlTmFtZSxcbiAgICAgICAgICAgICAgICBub2RlOiBuLFxuICAgICAgICAgICAgICAgIG9uQ2xpY2s6IGdyYXBoLmhhbmRsZUNsaWNrLmJpbmQoZ3JhcGgpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBUeXBlID0gbnVsbFxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKG4uaXNBbm9ueW1vdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgVHlwZSA9IEFub255bW91c01ldGFub2RlXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgVHlwZSA9IE1ldGFub2RlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgVHlwZSA9IElkZW50aWZpZWROb2RlXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgVHlwZSA9IEFub255bW91c05vZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiA8VHlwZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlID0gZy5lZGdlKGVkZ2VOYW1lKTtcbiAgICAgICAgICAgIHJldHVybiA8RWRnZSBrZXk9e2Ake2VkZ2VOYW1lLnZ9LT4ke2VkZ2VOYW1lLnd9YH0gZWRnZT17ZX0vPlxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgdmlld0JveF93aG9sZSA9IGAwIDAgJHtnLmdyYXBoKCkud2lkdGh9ICR7Zy5ncmFwaCgpLmhlaWdodH1gO1xuICAgICAgICB2YXIgdHJhbnNmb3JtVmlldyA9IGB0cmFuc2xhdGUoMHB4LDBweClgICsgYHNjYWxlKCR7Zy5ncmFwaCgpLndpZHRoIC8gZy5ncmFwaCgpLndpZHRofSwke2cuZ3JhcGgoKS5oZWlnaHQgLyBnLmdyYXBoKCkuaGVpZ2h0fSlgO1xuICAgICAgICBcbiAgICAgICAgbGV0IHNlbGVjdGVkTm9kZSA9IHRoaXMuc3RhdGUuc2VsZWN0ZWROb2RlO1xuICAgICAgICB2YXIgdmlld0JveFxuICAgICAgICBpZiAoc2VsZWN0ZWROb2RlKSB7XG4gICAgICAgICAgICBsZXQgbiA9IGcubm9kZShzZWxlY3RlZE5vZGUpO1xuICAgICAgICAgICAgdmlld0JveCA9IGAke24ueCAtIG4ud2lkdGggLyAyfSAke24ueSAtIG4uaGVpZ2h0IC8gMn0gJHtuLndpZHRofSAke24uaGVpZ2h0fWBcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZpZXdCb3ggPSB2aWV3Qm94X3dob2xlXG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy5wcmV2aW91c1ZpZXdCb3ggPSB2aWV3Qm94IH0sIDMwMClcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHN2ZyBpZD1cInZpc3VhbGl6YXRpb25cIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmVyc2lvbj1cIjEuMVwiIGhlaWdodD17Zy5ncmFwaCgpLmhlaWdodH0gd2lkdGg9e2cuZ3JhcGgoKS53aWR0aH0+XG4gICAgICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMoX19kaXJuYW1lICsgXCIvc3JjL2J1bmRsZS5jc3NcIiwgXCJ1dGYtOFwiLCAoZXJyKSA9PiB7Y29uc29sZS5sb2coZXJyKX0pXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudC5iaW5kKHRoaXMpfSBhdHRyaWJ1dGVOYW1lPVwidmlld0JveFwiIGZyb209e3RoaXMucHJldmlvdXNWaWV3Qm94fSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiXG4gICAgICAgICAgICAgICAgICAgIGNhbGNNb2RlPVwicGFjZWRcIlxuICAgICAgICAgICAgICAgID48L2FuaW1hdGU+XG4gICAgICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJhcnJvd1wiIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiByZWZYPVwiMTBcIiByZWZZPVwiNVwiIG1hcmtlclVuaXRzPVwic3Ryb2tlV2lkdGhcIiBtYXJrZXJXaWR0aD1cIjEwXCIgbWFya2VySGVpZ2h0PVwiNy41XCIgb3JpZW50PVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJncmFwaFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bm9kZXN9XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2VkZ2VzfVxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBFZGdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGxpbmUgPSBkMy5saW5lKClcbiAgICAgICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAueShkID0+IGQueSlcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiBbXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogdGhpcy5wcm9wcy5lZGdlLnBvaW50c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxpbmU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9XCJlZGdlXCIgbWFya2VyRW5kPVwidXJsKCNhcnJvdylcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPXtsKGUucG9pbnRzKX0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudH0ga2V5PXtNYXRoLnJhbmRvbSgpfSByZXN0YXJ0PVwiYWx3YXlzXCIgZnJvbT17bCh0aGlzLnN0YXRlLnByZXZpb3VzUG9pbnRzKX0gdG89e2woZS5wb2ludHMpfSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCIgYXR0cmlidXRlTmFtZT1cImRcIiAvPlxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBuLmlzTWV0YW5vZGUgPyBcIm1ldGFub2RlXCIgOiBcIm5vZGVcIlxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Ake3R5cGV9ICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgke01hdGguZmxvb3Iobi54IC0obi53aWR0aC8yKSl9LCR7TWF0aC5mbG9vcihuLnkgLShuLmhlaWdodC8yKSl9KWB9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0gLz5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9IHRleHRBbmNob3I9XCJzdGFydFwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c01ldGFub2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBJZGVudGlmaWVkTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn0iLCJmdW5jdGlvbiBydW4oKSB7XG4gIFJlYWN0RE9NLnJlbmRlcig8SURFLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtb25pZWwnKSk7XG59XG5cbmNvbnN0IGxvYWRlZFN0YXRlcyA9IFsnY29tcGxldGUnLCAnbG9hZGVkJywgJ2ludGVyYWN0aXZlJ107XG5cbmlmIChsb2FkZWRTdGF0ZXMuaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkgJiYgZG9jdW1lbnQuYm9keSkge1xuICBydW4oKTtcbn0gZWxzZSB7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgcnVuLCBmYWxzZSk7XG59Il19
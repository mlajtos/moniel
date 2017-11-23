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
                { ref: function ref(el) {
                        _this2.svg = el;
                    }, id: "visualization", xmlns: "http://www.w3.org/2000/svg", version: "1.1", viewBox: "0 0 " + width + " " + height },
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
                    { id: "graph", ref: function ref(el) {
                            _this2.group = el;
                        } },
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
        { id: "arrow", viewBox: "0 0 10 10", refX: "10", refY: "5", markerUnits: "strokeWidth", markerWidth: "10", markerHeight: "7.5", orient: "auto" },
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

var nodeDispatch = function nodeDispatch(n) {
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
    return Type;
};

var Node = function (_React$Component3) {
    _inherits(Node, _React$Component3);

    function Node() {
        _classCallCheck(this, Node);

        return _possibleConstructorReturn(this, (Node.__proto__ || Object.getPrototypeOf(Node)).apply(this, arguments));
    }

    _createClass(Node, [{
        key: "render",
        value: function render() {
            var n = this.props.node;
            var type = n.isMetanode ? "metanode" : "node";

            var translateX = Math.floor(n.x - n.width / 2);
            var translateY = Math.floor(n.y - n.height / 2);

            return React.createElement(
                "g",
                {
                    className: type + " " + n.class,
                    onClick: this.props.onClick.bind(this, this.props.node),
                    transform: "translate(" + translateX + "," + translateY + ")"
                },
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvSW50ZXJwcmV0ZXIuanMiLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvUGFuZWwuanN4Iiwic2NyaXB0cy9QYXJzZXIuanMiLCJzY3JpcHRzL1B5VG9yY2hHZW5lcmF0b3IuanMiLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSxnQjs7OzthQUNGLFMsR0FBWSxJQUFJLFNBQUosQ0FBYztBQUN0Qix3QkFBWSxDQUFDLEdBQUQsQ0FEVTtBQUV0Qix1QkFBVyxDQUFDLElBQUQsQ0FGVztBQUd0QixrQkFBTSxLQUFLO0FBSFcsU0FBZCxDO2FBTVosUyxHQUFZLElBQUksU0FBSixDQUFjO0FBQ3RCLHdCQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFEO0FBRlcsU0FBZCxDOzs7OztpQ0FLSCxHLEVBQUs7QUFDVixnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsd0JBQVEsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUFSO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsdUJBQU8sT0FBTyxFQUFQLEdBQVksSUFBSSxVQUFKLENBQWUsQ0FB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ckI7O0FBRUEsSUFBSSxhQUFhLFFBQWIsQ0FBc0IsU0FBUyxVQUEvQixLQUE4QyxTQUFTLElBQTNELEVBQWlFO0FBQy9EO0FBQ0QsQ0FGRCxNQUVPO0FBQ0wsU0FBTyxnQkFBUCxDQUF3QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb2xvckhhc2hXcmFwcGVye1xuICAgIGNvbG9ySGFzaCA9IG5ldyBDb2xvckhhc2goe1xuICAgICAgICBzYXR1cmF0aW9uOiBbMC45XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgICAgIGhhc2g6IHRoaXMubWFnaWNcbiAgICB9KVxuXG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjUsIDAuNiwgMC43XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgfSlcblxuICAgIGxvc2VMb3NlKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoICs9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgbWFnaWMoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoICogNDcgKyBzdHIuY2hhckNvZGVBdChpKSAlIDMyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgaGV4KHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvckhhc2guaGV4KHN0cilcbiAgICB9XG59IiwiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRub2RlQ291bnRlciA9IHt9XG5cdF9ub2RlU3RhY2sgPSBbXVxuXHRfcHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Z2V0IG5vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBub2RlU3RhY2sodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRnZXQgcHJldmlvdXNOb2RlU3RhY2soKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBwcmV2aW91c05vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5jbGVhck5vZGVTdGFjaygpXG5cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0XHR0aGlzLm1ldGFub2RlcyA9IHt9XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrID0gW11cblxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGVzOlwiLCB0aGlzLm1ldGFub2Rlcylcblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlIFN0YWNrOlwiLCB0aGlzLm1ldGFub2RlU3RhY2spXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubWV0YW5vZGVTdGFjaylcblxuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tuYW1lXTtcblx0fVxuXG5cdGV4aXRNZXRhbm9kZVNjb3BlKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2RlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRnZW5lcmF0ZUluc3RhbmNlSWQodHlwZSkge1xuXHRcdGlmICghdGhpcy5ub2RlQ291bnRlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHRcdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSA9IDA7XG5cdFx0fVxuXHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gKz0gMTtcblx0XHRsZXQgaWQgPSBcImFfXCIgKyB0eXBlICsgdGhpcy5ub2RlQ291bnRlclt0eXBlXTtcblx0XHRyZXR1cm4gaWQ7XG5cdH1cblxuXHRhZGRNYWluKCkge1xuXHRcdHRoaXMuZW50ZXJNZXRhbm9kZVNjb3BlKFwibWFpblwiKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGBUb3VjaGluZyBub2RlIFwiJHtub2RlUGF0aH1cIi5gKVxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKVxuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2tbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpXG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpXG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRlZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG5vZGUpIHtcblx0XHRjb25zdCBtZXRhbm9kZUNsYXNzID0gbm9kZS5jbGFzc1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpXG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpXG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdGxldCB0YXJnZXRNZXRhbm9kZSA9IHRoaXMubWV0YW5vZGVzW21ldGFub2RlQ2xhc3NdO1xuXHRcdHRhcmdldE1ldGFub2RlLm5vZGVzKCkuZm9yRWFjaChub2RlSWQgPT4ge1xuXHRcdFx0bGV0IG5vZGUgPSB0YXJnZXRNZXRhbm9kZS5ub2RlKG5vZGVJZCk7XG5cdFx0XHRpZiAoIW5vZGUpIHsgcmV0dXJuIH1cblx0XHRcdGxldCBuZXdOb2RlSWQgPSBub2RlSWQucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dmFyIG5ld05vZGUgPSB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdGlkOiBuZXdOb2RlSWRcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShuZXdOb2RlSWQsIG5ld05vZGUpO1xuXG5cdFx0XHRsZXQgbmV3UGFyZW50ID0gdGFyZ2V0TWV0YW5vZGUucGFyZW50KG5vZGVJZCkucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobmV3Tm9kZUlkLCBuZXdQYXJlbnQpO1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0TWV0YW5vZGUuZWRnZXMoKS5mb3JFYWNoKGVkZ2UgPT4ge1xuXHRcdFx0Y29uc3QgZSA9IHRhcmdldE1ldGFub2RlLmVkZ2UoZWRnZSlcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB7fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW11cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja11cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aClcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRjb25zdCBpc0F2YWlsYWJsZSA9ICh0aGlzLmdyYXBoLmluRWRnZXMobm9kZVBhdGgpLmxlbmd0aCA9PT0gMClcblx0XHRjb25zdCBpc0lucHV0ID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIilcblx0XHRjb25zdCBpc1VuZGVmaW5lZCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcInVuZGVmaW5lZFwiKVxuXHRcdHJldHVybiAoaXNJbnB1dCB8fCAoaXNVbmRlZmluZWQgJiYgaXNBdmFpbGFibGUpKVxuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRjb25zdCBpc0F2YWlsYWJsZSA9ICh0aGlzLmdyYXBoLm91dEVkZ2VzKG5vZGVQYXRoKS5sZW5ndGggPT09IDApXG5cdFx0Y29uc3QgaXNPdXRwdXQgPSAodGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIilcblx0XHRjb25zdCBpc1VuZGVmaW5lZCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcInVuZGVmaW5lZFwiKVxuXHRcdHJldHVybiAoaXNPdXRwdXQgfHwgKGlzVW5kZWZpbmVkICYmIGlzQXZhaWxhYmxlKSlcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhcImlzTWV0YW5vZGU6XCIsIG5vZGVQYXRoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWVcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpXG5cdFx0bGV0IG91dHB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHRoaXMuaXNPdXRwdXQobm9kZSkpXG5cblx0XHRpZiAob3V0cHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0fSBlbHNlIGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDEgJiYgdGhpcy5ncmFwaC5ub2RlKG91dHB1dE5vZGVzWzBdKS5pc01ldGFub2RlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRPdXRwdXROb2RlcyhvdXRwdXROb2Rlc1swXSlcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0Tm9kZXNcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0Y29uc29sZS5sb2coc2NvcGVQYXRoKVxuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpXG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4gdGhpcy5pc0lucHV0KG5vZGUpKVxuXHRcdGNvbnNvbGUubG9nKGlucHV0Tm9kZXMpXG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgSW5wdXQgbm9kZXMuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKGlucHV0Tm9kZXMubGVuZ3RoID09PSAxICYmIHRoaXMuZ3JhcGgubm9kZShpbnB1dE5vZGVzWzBdKS5pc01ldGFub2RlKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRJbnB1dE5vZGVzKGlucHV0Tm9kZXNbMF0pXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXNcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cdFx0dmFyIHNvdXJjZVBhdGhzXG5cblx0XHRpZiAodHlwZW9mIGZyb21QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IHRoaXMuZ2V0T3V0cHV0Tm9kZXMoZnJvbVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IFtmcm9tUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZnJvbVBhdGgpKSB7XG5cdFx0XHRzb3VyY2VQYXRocyA9IGZyb21QYXRoXG5cdFx0fVxuXG5cdFx0dmFyIHRhcmdldFBhdGhzXG5cblx0XHRpZiAodHlwZW9mIHRvUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gdGhpcy5nZXRJbnB1dE5vZGVzKHRvUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gW3RvUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9QYXRoKSkge1xuXHRcdFx0dGFyZ2V0UGF0aHMgPSB0b1BhdGhcblx0XHR9XG5cblx0XHR0aGlzLnNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cdH1cblxuXHRzZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKSB7XG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7fSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwpKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG5cblx0Z2V0TWV0YW5vZGVzKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmNvbnRhaW5zKGMucm93LCBjLmNvbHVtbikpLnJlZHVjZSggKHByZXYsIGN1cnIpID0+IHByZXYgfHwgY3VyciwgZmFsc2UpO1xuXG4gICAgICAgIGlmIChjdXJzb3JPdmVyTWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhY2UuZWRpdCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKFwiYWNlL21vZGUvXCIgKyB0aGlzLnByb3BzLm1vZGUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS9cIiArIHRoaXMucHJvcHMudGhlbWUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTbmlwcGV0czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICB3cmFwOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEVkaXRvckludG9WaWV3OiB0cnVlLFxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJGaXJhIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdGFjdGl2ZVdvcmtlcnMgPSB7fVxuXHRjdXJyZW50V29ya2VySWQgPSAwXG5cdGxhc3RGaW5pc2hlZFdvcmtlcklkID0gMFxuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG5cdGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG5cdH1cblxuXHRsYXlvdXQoZ3JhcGgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuZ2V0V29ya2VySWQoKVxuXHRcdHRoaXMuYWN0aXZlV29ya2Vyc1tpZF0gPSBuZXcgTGF5b3V0V29ya2VyKGlkLCBncmFwaCwgdGhpcy53b3JrZXJGaW5pc2hlZC5iaW5kKHRoaXMpKVxuXHR9XG5cblx0d29ya2VyRmluaXNoZWQoe2lkLCBncmFwaH0pIHtcblx0XHRpZiAoaWQgPj0gdGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCkge1xuXHRcdFx0dGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCA9IGlkXG5cdFx0XHR0aGlzLmNhbGxiYWNrKGdyYXBoKVxuXHRcdH1cblx0fVxuXG5cdGdldFdvcmtlcklkKCkge1xuXHRcdHRoaXMuY3VycmVudFdvcmtlcklkICs9IDFcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50V29ya2VySWRcblx0fVxufVxuXG5jbGFzcyBMYXlvdXRXb3JrZXJ7XG5cdGlkID0gMFxuXHR3b3JrZXIgPSBudWxsXG5cdGNvbnN0cnVjdG9yKGlkLCBncmFwaCwgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuaWQgPSBpZFxuXHRcdHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpXG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpXG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZFxuXHRcdFxuXHRcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuZW5jb2RlKGdyYXBoKSlcblx0fVxuXHRyZWNlaXZlKG1lc3NhZ2UpIHtcblx0XHR0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuXHRcdHRoaXMub25GaW5pc2hlZCh7XG5cdFx0XHRpZDogdGhpcy5pZCxcblx0XHRcdGdyYXBoOiB0aGlzLmRlY29kZShtZXNzYWdlLmRhdGEpXG5cdFx0fSlcblx0fVxuXHRlbmNvZGUoZ3JhcGgpIHtcblx0XHRyZXR1cm4gZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaClcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoanNvbilcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuXHRpbnRlcnByZXRlciA9IG5ldyBJbnRlcnByZXRlcigpXG5cdGdlbmVyYXRvciA9IG5ldyBQeVRvcmNoR2VuZXJhdG9yKClcblxuXHRsb2NrID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdC8vIHRoZXNlIGFyZSBubyBsb25nZXIgbmVlZGVkIGhlcmVcblx0XHRcdC8vIFwiZ3JhbW1hclwiOiB0aGlzLnBhcnNlci5ncmFtbWFyLFxuXHRcdFx0Ly8gXCJzZW1hbnRpY3NcIjogdGhpcy5wYXJzZXIuc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImxheW91dFwiOiBcImNvbHVtbnNcIixcblx0XHRcdFwiZ2VuZXJhdGVkQ29kZVwiOiBcIlwiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2dyYXBoLnN2Z1wiLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpLm91dGVySFRNTCwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguanNvblwiLCBKU09OLnN0cmluZ2lmeShkYWdyZS5ncmFwaGxpYi5qc29uLndyaXRlKHRoaXMuc3RhdGUuZ3JhcGgpLCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvaGFsZi1hc3NlZF9qb2tlLnB5XCIsIHRoaXMuc3RhdGUuZ2VuZXJhdGVkQ29kZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcblx0XHRcdFx0Ym9keTogYENsaWNrIHRvIG9wZW4gc2F2ZWQgc2tldGNoLmAsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZSxcblx0XHRcdH0pXG5cdFx0XHRjb25zdCB7IHNoZWxsIH0gPSByZXF1aXJlKCdlbGVjdHJvbicpXG5cdFx0XHRcblx0XHRcdHNhdmVOb3RpZmljYXRpb24ub25jbGljayA9ICgpID0+IHtcblx0XHRcdFx0c2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihtZXNzYWdlLmZvbGRlcilcblx0XHRcdH1cblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRpcGMub24oXCJvcGVuXCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLm9wZW5GaWxlKG0uZmlsZVBhdGgpXG5cdFx0fSlcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5pbnRlcnByZXRlci5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0b3BlbkZpbGUoZmlsZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIm9wZW5GaWxlXCIsIGZpbGVQYXRoKVxuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgJHtfX2Rpcm5hbWV9L2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZXIubWFrZSh2YWx1ZSlcblxuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLmludGVycHJldGVyLmV4ZWN1dGUocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKClcblx0XHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0TWV0YW5vZGVzRGVmaW5pdGlvbnMoKVxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcInJlc2l6ZVwiKSlcblx0XHR9LCAxMDApXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiLypcblx0VGhpcyBjb2RlIGlzIGEgbWVzcy5cbiovXG5cbmNvbnN0IHBpeGVsV2lkdGggPSByZXF1aXJlKCdzdHJpbmctcGl4ZWwtd2lkdGgnKVxuXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0XHR0aGlzLmRlcHRoID0gMFxuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiRGVjb252b2x1dGlvblwiLCBcIkF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlTWF4UG9vbGluZ1wiLCBcIk1heFVucG9vbGluZ1wiLCBcIkxvY2FsUmVzcG9uc2VOb3JtYWxpemF0aW9uXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGV4ZWN1dGUoYXN0KSB7XG5cdFx0Y29uc3Qgc3RhdGUgPSB7XG5cdFx0XHRncmFwaDogbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKSxcblx0XHRcdGxvZ2dlcjogbmV3IExvZ2dlcigpXG5cdFx0fVxuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpXG5cdFx0dGhpcy53YWxrQXN0KGFzdCwgc3RhdGUpXG5cdFx0Y29uc29sZS5sb2coXCJGaW5hbCBTdGF0ZTpcIiwgc3RhdGUpXG5cdH1cblxuXHR3YWxrQXN0KHRva2VuLCBzdGF0ZSkge1xuXHRcdGlmICghdG9rZW4pIHsgY29uc29sZS5lcnJvcihcIk5vIHRva2VuPyFcIik7IHJldHVybjsgfVxuXHRcdHRoaXMuZGVwdGggKz0gMVxuXHRcdGNvbnN0IHBhZCA9IEFycmF5LmZyb20oe2xlbmd0aDogdGhpcy5kZXB0aH0pLmZpbGwoXCIgXCIpLnJlZHVjZSgocCwgYykgPT4gcCArIGMsIFwiXCIpXG5cdFx0Ly9jb25zb2xlLmxvZyhwYWQgKyB0b2tlbi5raW5kKVxuXG5cdFx0Y29uc3QgZm5OYW1lID0gXCJfXCIgKyB0b2tlbi5raW5kXG5cdFx0Y29uc3QgZm4gPSB0aGlzW2ZuTmFtZV0gfHwgdGhpcy5fdW5yZWNvZ25pemVkXG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBmbi5jYWxsKHRoaXMsIHRva2VuLCBzdGF0ZSlcblx0XHR0aGlzLmRlcHRoIC09IDFcblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZVxuXHR9XG5cblx0X0dyYXBoKGdyYXBoLCBzdGF0ZSkge1xuXHRcdGdyYXBoLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKTtcblx0fVxuXG5cdF9Ob2RlRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbiwgc3RhdGUpwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke25vZGVEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRpZiAobm9kZURlZmluaXRpb24uYm9keSkge1xuXHRcdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKG5vZGVEZWZpbml0aW9uLm5hbWUpXG5cdFx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShub2RlRGVmaW5pdGlvbi5uYW1lKVxuXHRcdFx0dGhpcy53YWxrQXN0KG5vZGVEZWZpbml0aW9uLmJvZHksIHN0YXRlKVxuXHRcdFx0c3RhdGUuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKVxuXHRcdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0fVxuXHR9XG5cdFxuXHRfQ2hhaW4oY2hhaW4sIHN0YXRlKSB7XG5cdFx0c3RhdGUuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjaGFpbi5ibG9ja3MuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHN0YXRlLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0sIHN0YXRlKVxuXHRcdH0pXG5cdH1cblxuXHRfSW5saW5lTWV0YU5vZGUobm9kZSwgc3RhdGUpIHtcblx0XHQvL2NvbnNvbGUubG9nKG5vZGUpXG5cdFx0Y29uc3QgaWRlbnRpZmllciA9IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQoXCJtZXRhbm9kZVwiKVxuXG5cdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGlkZW50aWZpZXIpXG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoaWRlbnRpZmllcilcblx0XHR0aGlzLndhbGtBc3Qobm9kZS5ib2R5LCBzdGF0ZSlcblx0XHRzdGF0ZS5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogbm9kZS5hbGlhcyA/IG5vZGUuYWxpYXMudmFsdWUgOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogaWRlbnRpZmllcixcblx0XHRcdGNsYXNzOiBpZGVudGlmaWVyLFxuXHRcdFx0aXNBbm9ueW1vdXM6IHRydWUsXG5cdFx0XHRfc291cmNlOiBub2RlLl9zb3VyY2Vcblx0XHR9KVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiBpZGVudGlmaWVyLFxuXHRcdFx0Y2xhc3M6IGlkZW50aWZpZXIsXG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdW5kZWZpbmVkLFxuXHRcdFx0X3NvdXJjZTogbm9kZS5fc291cmNlXG5cdFx0fVxuXHR9XG5cblx0X01ldGFOb2RlKG1ldGFub2RlLCBzdGF0ZSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKG1ldGFub2RlKVxuXHRcdG1ldGFub2RlLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKVxuXHR9XG5cblxuXHRfTm9kZShub2RlLCBzdGF0ZSkge1xuXHRcdGNvbnN0IG5vZGVEZWZpbml0aW9uID0gdGhpcy53YWxrQXN0KHtcblx0XHRcdC4uLm5vZGUubm9kZSxcblx0XHRcdGFsaWFzOiBub2RlLmFsaWFzXG5cdFx0fSwgc3RhdGUpXG5cblx0XHQvLyBjb25zb2xlLmxvZyhub2RlRGVmaW5pdGlvbilcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRfTGl0ZXJhbE5vZGUoaW5zdGFuY2UsIHN0YXRlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UudHlwZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UudHlwZS52YWx1ZTtcblx0XHRcdG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UudHlwZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdXG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvclxuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS50eXBlLnZhbHVlXG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLnR5cGUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHRsZXQgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKVxuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMVxuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHsgXCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCkgfVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHdpZHRoID0gMjAgKyBNYXRoLm1heCguLi5bbm9kZS5jbGFzcywgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZCA6IFwiXCJdLm1hcChzdHJpbmcgPT4gcGl4ZWxXaWR0aChzdHJpbmcsIHtzaXplOiAxNn0pKSlcblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fSlcblxuXHRcdHJldHVybiB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fVxuXHR9XG5cblx0X0xpc3QobGlzdCwgc3RhdGUpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtLCBzdGF0ZSkpXG5cdH1cblxuXHRfSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG5cdFx0dGhpcy5ncmFwaC5yZWZlcmVuY2VOb2RlKGlkZW50aWZpZXIudmFsdWUpXG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKVxuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IEludGVycHJldGVyLm5hbWVSZXNvbHV0aW9uKHF1ZXJ5LCBkZWZpbml0aW9ucylcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cylcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pXG5cdFx0cmV0dXJuIG1hdGNoZWREZWZpbml0aW9uc1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKClcblx0fVxuXG5cdGdldE1ldGFub2Rlc0RlZmluaXRpb25zKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldE1ldGFub2RlcygpXG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpXG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKVxuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvXG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KVxuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSlcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gSW50ZXJwcmV0ZXIuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKVxuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSlcblx0ICAgIHJldHVybiByZXN1bHRcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZSB9XG5cdCAgICBsZXQgaSA9IDBcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDEgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCkgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHRfdW5yZWNvZ25pemVkKHRva2VuKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIHRva2VuP1wiLCB0b2tlbilcblx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuY29uc3Qgb2htID0gcmVxdWlyZShcIm9obS1qc1wiKVxuXG5jbGFzcyBQYXJzZXJ7XG5cdGNvbnRlbnRzID0gbnVsbFxuXHRncmFtbWFyID0gbnVsbFxuXHRcblx0ZXZhbE9wZXJhdGlvbiA9IHtcblx0XHRHcmFwaDogKGRlZmluaXRpb25zKSA9PiAgKHtcblx0XHRcdGtpbmQ6IFwiR3JhcGhcIixcblx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5ldmFsKClcblx0XHR9KSxcblx0XHROb2RlRGVmaW5pdGlvbjogZnVuY3Rpb24oXywgbGF5ZXJOYW1lLCBwYXJhbXMsIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZURlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKClbMF1cblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZU1ldGFOb2RlOiBmdW5jdGlvbihib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklubGluZU1ldGFOb2RlXCIsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0TWV0YU5vZGU6IGZ1bmN0aW9uKF8sIGRlZnMsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBkZWZzLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJNZXRhTm9kZVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZGVmaW5pdGlvbnNcblx0XHRcdH1cblx0XHR9LFxuXHRcdENoYWluOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkNoYWluXCIsXG5cdFx0XHRcdGJsb2NrczogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdE5vZGU6IGZ1bmN0aW9uKGlkLCBfLCBub2RlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIk5vZGVcIixcblx0XHRcdFx0bm9kZTogbm9kZS5ldmFsKCksXG5cdFx0XHRcdGFsaWFzOiBpZC5ldmFsKClbMF0sXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRMaXRlcmFsTm9kZTogZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkxpdGVyYWxOb2RlXCIsXG5cdFx0XHRcdHR5cGU6IHR5cGUuZXZhbCgpLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBwYXJhbXMuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKlxuXHRcdEJsb2NrTmFtZTogZnVuY3Rpb24oaWQsIF8pIHtcblx0XHRcdHJldHVybiBpZC5ldmFsKClcblx0XHR9LFxuXHRcdCovXG5cdFx0TGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTGlzdFwiLFxuXHRcdFx0XHRsaXN0OiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tQYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRwYXRoOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRub2RlVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZVR5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhfX2Rpcm5hbWUgKyBcIi9zcmMvbW9uaWVsLm9obVwiLCBcInV0ZjhcIilcblx0XHR0aGlzLmdyYW1tYXIgPSBvaG0uZ3JhbW1hcih0aGlzLmNvbnRlbnRzKVxuXHRcdHRoaXMuc2VtYW50aWNzID0gdGhpcy5ncmFtbWFyLmNyZWF0ZVNlbWFudGljcygpLmFkZE9wZXJhdGlvbihcImV2YWxcIiwgdGhpcy5ldmFsT3BlcmF0aW9uKVxuXHR9XG5cblx0bWFrZShzb3VyY2UpIHtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5ncmFtbWFyLm1hdGNoKHNvdXJjZSlcblxuXHRcdGlmIChyZXN1bHQuc3VjY2VlZGVkKCkpIHtcblx0XHRcdHZhciBhc3QgPSB0aGlzLnNlbWFudGljcyhyZXN1bHQpLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YXN0XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBleHBlY3RlZCA9IHJlc3VsdC5nZXRFeHBlY3RlZFRleHQoKVxuXHRcdFx0dmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRleHBlY3RlZCxcblx0XHRcdFx0cG9zaXRpb25cblx0XHRcdH1cblx0XHR9XG5cdH1cblxufSIsImNsYXNzIFB5VG9yY2hHZW5lcmF0b3Ige1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmJ1aWx0aW5zID0gW1wiQXJpdGhtZXRpY0Vycm9yXCIsIFwiQXNzZXJ0aW9uRXJyb3JcIiwgXCJBdHRyaWJ1dGVFcnJvclwiLCBcIkJhc2VFeGNlcHRpb25cIiwgXCJCbG9ja2luZ0lPRXJyb3JcIiwgXCJCcm9rZW5QaXBlRXJyb3JcIiwgXCJCdWZmZXJFcnJvclwiLCBcIkJ5dGVzV2FybmluZ1wiLCBcIkNoaWxkUHJvY2Vzc0Vycm9yXCIsIFwiQ29ubmVjdGlvbkFib3J0ZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25FcnJvclwiLCBcIkNvbm5lY3Rpb25SZWZ1c2VkRXJyb3JcIiwgXCJDb25uZWN0aW9uUmVzZXRFcnJvclwiLCBcIkRlcHJlY2F0aW9uV2FybmluZ1wiLCBcIkVPRkVycm9yXCIsIFwiRWxsaXBzaXNcIiwgXCJFbnZpcm9ubWVudEVycm9yXCIsIFwiRXhjZXB0aW9uXCIsIFwiRmFsc2VcIiwgXCJGaWxlRXhpc3RzRXJyb3JcIiwgXCJGaWxlTm90Rm91bmRFcnJvclwiLCBcIkZsb2F0aW5nUG9pbnRFcnJvclwiLCBcIkZ1dHVyZVdhcm5pbmdcIiwgXCJHZW5lcmF0b3JFeGl0XCIsIFwiSU9FcnJvclwiLCBcIkltcG9ydEVycm9yXCIsIFwiSW1wb3J0V2FybmluZ1wiLCBcIkluZGVudGF0aW9uRXJyb3JcIiwgXCJJbmRleEVycm9yXCIsIFwiSW50ZXJydXB0ZWRFcnJvclwiLCBcIklzQURpcmVjdG9yeUVycm9yXCIsIFwiS2V5RXJyb3JcIiwgXCJLZXlib2FyZEludGVycnVwdFwiLCBcIkxvb2t1cEVycm9yXCIsIFwiTWVtb3J5RXJyb3JcIiwgXCJNb2R1bGVOb3RGb3VuZEVycm9yXCIsIFwiTmFtZUVycm9yXCIsIFwiTm9uZVwiLCBcIk5vdEFEaXJlY3RvcnlFcnJvclwiLCBcIk5vdEltcGxlbWVudGVkXCIsIFwiTm90SW1wbGVtZW50ZWRFcnJvclwiLCBcIk9TRXJyb3JcIiwgXCJPdmVyZmxvd0Vycm9yXCIsIFwiUGVuZGluZ0RlcHJlY2F0aW9uV2FybmluZ1wiLCBcIlBlcm1pc3Npb25FcnJvclwiLCBcIlByb2Nlc3NMb29rdXBFcnJvclwiLCBcIlJlY3Vyc2lvbkVycm9yXCIsIFwiUmVmZXJlbmNlRXJyb3JcIiwgXCJSZXNvdXJjZVdhcm5pbmdcIiwgXCJSdW50aW1lRXJyb3JcIiwgXCJSdW50aW1lV2FybmluZ1wiLCBcIlN0b3BBc3luY0l0ZXJhdGlvblwiLCBcIlN0b3BJdGVyYXRpb25cIiwgXCJTeW50YXhFcnJvclwiLCBcIlN5bnRheFdhcm5pbmdcIiwgXCJTeXN0ZW1FcnJvclwiLCBcIlN5c3RlbUV4aXRcIiwgXCJUYWJFcnJvclwiLCBcIlRpbWVvdXRFcnJvclwiLCBcIlRydWVcIiwgXCJUeXBlRXJyb3JcIiwgXCJVbmJvdW5kTG9jYWxFcnJvclwiLCBcIlVuaWNvZGVEZWNvZGVFcnJvclwiLCBcIlVuaWNvZGVFbmNvZGVFcnJvclwiLCBcIlVuaWNvZGVFcnJvclwiLCBcIlVuaWNvZGVUcmFuc2xhdGVFcnJvclwiLCBcIlVuaWNvZGVXYXJuaW5nXCIsIFwiVXNlcldhcm5pbmdcIiwgXCJWYWx1ZUVycm9yXCIsIFwiV2FybmluZ1wiLCBcIlplcm9EaXZpc2lvbkVycm9yXCIsIFwiX19idWlsZF9jbGFzc19fXCIsIFwiX19kZWJ1Z19fXCIsIFwiX19kb2NfX1wiLCBcIl9faW1wb3J0X19cIiwgXCJfX2xvYWRlcl9fXCIsIFwiX19uYW1lX19cIiwgXCJfX3BhY2thZ2VfX1wiLCBcIl9fc3BlY19fXCIsIFwiYWJzXCIsIFwiYWxsXCIsIFwiYW55XCIsIFwiYXNjaWlcIiwgXCJiaW5cIiwgXCJib29sXCIsIFwiYnl0ZWFycmF5XCIsIFwiYnl0ZXNcIiwgXCJjYWxsYWJsZVwiLCBcImNoclwiLCBcImNsYXNzbWV0aG9kXCIsIFwiY29tcGlsZVwiLCBcImNvbXBsZXhcIiwgXCJjb3B5cmlnaHRcIiwgXCJjcmVkaXRzXCIsIFwiZGVsYXR0clwiLCBcImRpY3RcIiwgXCJkaXJcIiwgXCJkaXZtb2RcIiwgXCJlbnVtZXJhdGVcIiwgXCJldmFsXCIsIFwiZXhlY1wiLCBcImV4aXRcIiwgXCJmaWx0ZXJcIiwgXCJmbG9hdFwiLCBcImZvcm1hdFwiLCBcImZyb3plbnNldFwiLCBcImdldGF0dHJcIiwgXCJnbG9iYWxzXCIsIFwiaGFzYXR0clwiLCBcImhhc2hcIiwgXCJoZWxwXCIsIFwiaGV4XCIsIFwiaWRcIiwgXCJpbnB1dFwiLCBcImludFwiLCBcImlzaW5zdGFuY2VcIiwgXCJpc3N1YmNsYXNzXCIsIFwiaXRlclwiLCBcImxlblwiLCBcImxpY2Vuc2VcIiwgXCJsaXN0XCIsIFwibG9jYWxzXCIsIFwibWFwXCIsIFwibWF4XCIsIFwibWVtb3J5dmlld1wiLCBcIm1pblwiLCBcIm5leHRcIiwgXCJvYmplY3RcIiwgXCJvY3RcIiwgXCJvcGVuXCIsIFwib3JkXCIsIFwicG93XCIsIFwicHJpbnRcIiwgXCJwcm9wZXJ0eVwiLCBcInF1aXRcIiwgXCJyYW5nZVwiLCBcInJlcHJcIiwgXCJyZXZlcnNlZFwiLCBcInJvdW5kXCIsIFwic2V0XCIsIFwic2V0YXR0clwiLCBcInNsaWNlXCIsIFwic29ydGVkXCIsIFwic3RhdGljbWV0aG9kXCIsIFwic3RyXCIsIFwic3VtXCIsIFwic3VwZXJcIiwgXCJ0dXBsZVwiLCBcInR5cGVcIiwgXCJ2YXJzXCIsIFwiemlwXCJdXG5cdFx0dGhpcy5rZXl3b3JkcyA9IFtcImFuZFwiLCBcImFzXCIsIFwiYXNzZXJ0XCIsIFwiYnJlYWtcIiwgXCJjbGFzc1wiLCBcImNvbnRpbnVlXCIsIFwiZGVmXCIsIFwiZGVsXCIsIFwiZWxpZlwiLCBcImVsc2VcIiwgXCJleGNlcHRcIiwgXCJleGVjXCIsIFwiZmluYWxseVwiLCBcImZvclwiLCBcImZyb21cIiwgXCJnbG9iYWxcIiwgXCJpZlwiLCBcImltcG9ydFwiLCBcImluXCIsIFwiaXNcIiwgXCJsYW1iZGFcIiwgXCJub3RcIiwgXCJvclwiLCBcInBhc3NcIiwgXCJwcmludFwiLCBcInJhaXNlXCIsIFwicmV0dXJuXCIsIFwidHJ5XCIsIFwid2hpbGVcIiwgXCJ3aXRoXCIsIFwieWllbGRcIl1cblx0fVxuXG4gICAgc2FuaXRpemUoaWQpIHtcblx0XHR2YXIgc2FuaXRpemVkSWQgPSBpZFxuXHRcdGlmICh0aGlzLmJ1aWx0aW5zLmluY2x1ZGVzKHNhbml0aXplZElkKSB8fCB0aGlzLmtleXdvcmRzLmluY2x1ZGVzKHNhbml0aXplZElkKSkge1xuXHRcdFx0c2FuaXRpemVkSWQgPSBcIl9cIiArIHNhbml0aXplZElkXG5cdFx0fVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwuL2csIFwidGhpc1wiKVxuXHRcdHNhbml0aXplZElkID0gc2FuaXRpemVkSWQucmVwbGFjZSgvXFwvL2csIFwiLlwiKVxuXHRcdHJldHVybiBzYW5pdGl6ZWRJZFxuXHR9XG5cblx0bWFwVG9GdW5jdGlvbihub2RlVHlwZSkge1xuXHRcdGxldCB0cmFuc2xhdGlvblRhYmxlID0ge1xuXHRcdFx0XCJDb252b2x1dGlvblwiOiBcIkYuY29udjJkXCIsXG5cdFx0XHRcIkRlY29udm9sdXRpb25cIjogXCJGLmNvbnZfdHJhbnNwb3NlMmRcIixcblx0XHRcdFwiQXZlcmFnZVBvb2xpbmdcIjogXCJGLmF2Z19wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhQb29saW5nXCI6IFwiRi5tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIkFkYXB0aXZlTWF4UG9vbGluZ1wiOiBcIkYuYWRhcHRpdmVfbWF4X3Bvb2wyZFwiLFxuXHRcdFx0XCJNYXhVbnBvb2xpbmdcIjogXCJGLm1heF91bnBvb2wyZFwiLFxuXHRcdFx0XCJSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5yZWx1XCIsXG5cdFx0XHRcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiOiBcIkYuZWx1XCIsXG5cdFx0XHRcIlBhcmFtZXRyaWNSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5wcmVsdVwiLFxuXHRcdFx0XCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLmxlYWt5X3JlbHVcIixcblx0XHRcdFwiUmFuZG9taXplZFJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJyZWx1XCIsXG5cdFx0XHRcIlNpZ21vaWRcIjogXCJGLnNpZ21vaWRcIixcblx0XHRcdFwiTG9nU2lnbW9pZFwiOiBcIkYubG9nc2lnbW9pZFwiLFxuXHRcdFx0XCJUaHJlc2hvbGRcIjogXCJGLnRocmVzaG9sZFwiLFxuXHRcdFx0XCJIYXJkVGFuaFwiOiBcIkYuaGFyZHRhbmhcIixcblx0XHRcdFwiVGFuaFwiOiBcIkYudGFuaFwiLFxuXHRcdFx0XCJUYW5oU2hyaW5rXCI6IFwiRi50YW5oc2hyaW5rXCIsXG5cdFx0XHRcIkhhcmRTaHJpbmtcIjogXCJGLmhhcmRzaHJpbmtcIixcblx0XHRcdFwiTG9nU29mdE1heFwiOiBcIkYubG9nX3NvZnRtYXhcIixcblx0XHRcdFwiU29mdFNocmlua1wiOiBcIkYuc29mdHNocmlua1wiLFxuXHRcdFx0XCJTb2Z0TWF4XCI6IFwiRi5zb2Z0bWF4XCIsXG5cdFx0XHRcIlNvZnRNaW5cIjogXCJGLnNvZnRtaW5cIixcblx0XHRcdFwiU29mdFBsdXNcIjogXCJGLnNvZnRwbHVzXCIsXG5cdFx0XHRcIlNvZnRTaWduXCI6IFwiRi5zb2Z0c2lnblwiLFxuXHRcdFx0XCJCYXRjaE5vcm1hbGl6YXRpb25cIjogXCJGLmJhdGNoX25vcm1cIixcblx0XHRcdFwiTGluZWFyXCI6IFwiRi5saW5lYXJcIixcblx0XHRcdFwiRHJvcG91dFwiOiBcIkYuZHJvcG91dFwiLFxuXHRcdFx0XCJQYWlyd2lzZURpc3RhbmNlXCI6IFwiRi5wYWlyd2lzZV9kaXN0YW5jZVwiLFxuXHRcdFx0XCJDcm9zc0VudHJvcHlcIjogXCJGLmNyb3NzX2VudHJvcHlcIixcblx0XHRcdFwiQmluYXJ5Q3Jvc3NFbnRyb3B5XCI6IFwiRi5iaW5hcnlfY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJLdWxsYmFja0xlaWJsZXJEaXZlcmdlbmNlTG9zc1wiOiBcIkYua2xfZGl2XCIsXG5cdFx0XHRcIlBhZFwiOiBcIkYucGFkXCIsXG5cdFx0XHRcIlZhcmlhYmxlXCI6IFwiQUcuVmFyaWFibGVcIixcblx0XHRcdFwiUmFuZG9tTm9ybWFsXCI6IFwiVC5yYW5kblwiLFxuXHRcdFx0XCJUZW5zb3JcIjogXCJULlRlbnNvclwiXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkobm9kZVR5cGUpID8gdHJhbnNsYXRpb25UYWJsZVtub2RlVHlwZV0gOiBub2RlVHlwZVxuXG5cdH1cblxuXHRpbmRlbnQoY29kZSwgbGV2ZWwgPSAxLCBpbmRlbnRQZXJMZXZlbCA9IFwiICAgIFwiKSB7XG5cdFx0bGV0IGluZGVudCA9IGluZGVudFBlckxldmVsLnJlcGVhdChsZXZlbClcblx0XHRyZXR1cm4gY29kZS5zcGxpdChcIlxcblwiKS5tYXAobGluZSA9PiBpbmRlbnQgKyBsaW5lKS5qb2luKFwiXFxuXCIpXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGUoZ3JhcGgsIGRlZmluaXRpb25zKSB7XG5cdFx0bGV0IGltcG9ydHMgPVxuYGltcG9ydCB0b3JjaCBhcyBUXG5pbXBvcnQgdG9yY2gubm4uZnVuY3Rpb25hbCBhcyBGXG5pbXBvcnQgdG9yY2guYXV0b2dyYWQgYXMgQUdgXG5cblx0XHRsZXQgbW9kdWxlRGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyhkZWZpbml0aW9ucykubWFwKGRlZmluaXRpb25OYW1lID0+IHtcblx0XHRcdGlmIChkZWZpbml0aW9uTmFtZSAhPT0gXCJtYWluXCIpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVDb2RlRm9yTW9kdWxlKGRlZmluaXRpb25OYW1lLCBkZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0pXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3JldHVybiBcIlwiXG5cdFx0XHR9XG5cdFx0fSlcblxuXHRcdGxldCBjb2RlID1cbmAke2ltcG9ydHN9XG5cbiR7bW9kdWxlRGVmaW5pdGlvbnMuam9pbihcIlxcblwiKX1cbmBcblxuXHRcdHJldHVybiBjb2RlXG5cdH1cblxuXHRnZW5lcmF0ZUNvZGVGb3JNb2R1bGUoY2xhc3NuYW1lLCBncmFwaCkge1xuXHRcdGxldCB0b3BvbG9naWNhbE9yZGVyaW5nID0gZ3JhcGhsaWIuYWxnLnRvcHNvcnQoZ3JhcGgpXG5cdFx0bGV0IGZvcndhcmRGdW5jdGlvbiA9IFwiXCJcblxuXHRcdHRvcG9sb2dpY2FsT3JkZXJpbmcubWFwKG5vZGUgPT4ge1xuXHRcdFx0Ly8gY29uc29sZS5sb2coXCJtdVwiLCBub2RlKVxuXHRcdFx0bGV0IG4gPSBncmFwaC5ub2RlKG5vZGUpXG5cdFx0XHRsZXQgY2ggPSBncmFwaC5jaGlsZHJlbihub2RlKVxuXG5cdFx0XHRpZiAoIW4pIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhuKVxuXG5cdFx0XHRpZiAoY2gubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdGxldCBpbk5vZGVzID0gZ3JhcGguaW5FZGdlcyhub2RlKS5tYXAoZSA9PiB0aGlzLnNhbml0aXplKGUudikpXG5cdFx0XHRcdGZvcndhcmRGdW5jdGlvbiArPSBgJHt0aGlzLnNhbml0aXplKG5vZGUpfSA9ICR7dGhpcy5tYXBUb0Z1bmN0aW9uKG4uY2xhc3MpfSgke2luTm9kZXMuam9pbihcIiwgXCIpfSlcXG5gXG5cdFx0XHR9IFxuXHRcdH0sIHRoaXMpXG5cblx0XHRsZXQgbW9kdWxlQ29kZSA9XG5gY2xhc3MgJHtjbGFzc25hbWV9KFQubm4uTW9kdWxlKTpcbiAgICBkZWYgX19pbml0X18oc2VsZiwgcGFyYW0xLCBwYXJhbTIpOiAjIHBhcmFtZXRlcnMgaGVyZVxuICAgICAgICBzdXBlcigke2NsYXNzbmFtZX0sIHNlbGYpLl9faW5pdF9fKClcbiAgICAgICAgIyBhbGwgZGVjbGFyYXRpb25zIGhlcmVcblxuICAgIGRlZiBmb3J3YXJkKHNlbGYsIGluMSwgaW4yKTogIyBhbGwgSW5wdXRzIGhlcmVcbiAgICAgICAgIyBhbGwgZnVuY3Rpb25hbCBzdHVmZiBoZXJlXG4ke3RoaXMuaW5kZW50KGZvcndhcmRGdW5jdGlvbiwgMil9XG4gICAgICAgIHJldHVybiAob3V0MSwgb3V0MikgIyBhbGwgT3V0cHV0cyBoZXJlXG5gXG5cdFx0cmV0dXJuIG1vZHVsZUNvZGVcblx0fVxufSIsImNsYXNzIFNjb3BlU3RhY2t7XG5cdHNjb3BlU3RhY2sgPSBbXVxuXG5cdGNvbnN0cnVjdG9yKHNjb3BlID0gW10pIHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzY29wZSkpIHtcblx0XHRcdHRoaXMuc2NvcGVTdGFjayA9IHNjb3BlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKFwiSW52YWxpZCBpbml0aWFsaXphdGlvbiBvZiBzY29wZSBzdGFjay5cIiwgc2NvcGUpO1xuXHRcdH1cblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0cHVzaChzY29wZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKHNjb3BlKTtcblx0fVxuXG5cdHBvcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrID0gW107XG5cdH1cblxuXHRjdXJyZW50U2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2suam9pbihcIi9cIik7XG5cdH1cblxuXHRwcmV2aW91c1Njb3BlSWRlbnRpZmllcigpIHtcblx0XHRsZXQgY29weSA9IEFycmF5LmZyb20odGhpcy5zY29wZVN0YWNrKTtcblx0XHRjb3B5LnBvcCgpO1xuXHRcdHJldHVybiBjb3B5LmpvaW4oXCIvXCIpO1xuXHR9XG59IiwiY29uc3Qgem9vbSA9IHJlcXVpcmUoXCJkMy16b29tXCIpXG5cbmNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKVxuXG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQodGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdmcgPSBudWxsXG4gICAgICAgIHRoaXMuZ3JvdXAgPSBudWxsXG5cbiAgICAgICAgdGhpcy5jdXJyZW50Wm9vbSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGdyYXBoIH0pXG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dFxuICAgICAgICAgICAgdGhpcy5ncmFwaExheW91dC5sYXlvdXQobmV4dFByb3BzLmdyYXBoKVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0ZSAhPT0gbmV4dFN0YXRlKVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gbm9kZS5pZFxuICAgICAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWROb2RlIH0pXG5cbiAgICAgICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0IH0gPSB0aGlzLnN0YXRlLmdyYXBoLmdyYXBoKClcblxuICAgICAgICBjb25zdCBpZGVhbFNpemUgPSAod2lkdGgsIGhlaWdodCwgbWF4V2lkdGgsIG1heEhlaWdodCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgd2lkdGhSYXRpbyA9IHdpZHRoIC8gbWF4V2lkdGhcbiAgICAgICAgICAgIGNvbnN0IGhlaWdodFJhdGlvID0gaGVpZ2h0IC8gbWF4SGVpZ2h0XG4gICAgICAgICAgICBjb25zdCBpZGVhbFNpemUgPSAod2lkdGhSYXRpbyA8IGhlaWdodFJhdGlvID8gd2lkdGggOiBoZWlnaHQpXG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhgWyR7d2lkdGh9LCAke2hlaWdodH1dLCBbJHttYXhXaWR0aH0sICR7bWF4SGVpZ2h0fV0sICR7d2lkdGhSYXRpb30sICR7aGVpZ2h0UmF0aW99LCBpZGVhbCA9ICR7aWRlYWxTaXplfWApXG4gICAgICAgICAgICByZXR1cm4gaWRlYWxTaXplXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5jdXJyZW50Wm9vbSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50Wm9vbSA9IFsgd2lkdGggLyAyLCBoZWlnaHQgLyAyLCBpZGVhbFNpemUod2lkdGgsIGhlaWdodCwgd2lkdGgsIGhlaWdodCldXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gW25vZGUueCwgbm9kZS55LCBpZGVhbFNpemUobm9kZS53aWR0aCwgbm9kZS5oZWlnaHQsIHdpZHRoLCBoZWlnaHQpXVxuXG4gICAgICAgIHRoaXMudHJhbnNpdGlvbih0aGlzLmN1cnJlbnRab29tLCB0YXJnZXQsIG5vZGUpXG5cbiAgICAgICAgdGhpcy5jdXJyZW50Wm9vbSA9IHRhcmdldFxuICAgIH1cblxuICAgIHRyYW5zaXRpb24oc3RhcnQsIGVuZCwgbm9kZSkge1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMuc3RhdGUuZ3JhcGguZ3JhcGgoKVxuXG4gICAgICAgIGNvbnN0IGNlbnRlciA9IHtcbiAgICAgICAgICAgIHg6IHdpZHRoIC8gMixcbiAgICAgICAgICAgIHk6IGhlaWdodCAvIDJcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpID0gZDMuaW50ZXJwb2xhdGVab29tKHN0YXJ0LCBlbmQpXG5cbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gKFt4LCB5LCBzaXplXSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2NhbGUgPSB3aWR0aCAvIHNpemVcbiAgICAgICAgICAgIGNvbnN0IHRyYW5zbGF0ZVggPSBjZW50ZXIueCAtIHggKiBzY2FsZVxuICAgICAgICAgICAgY29uc3QgdHJhbnNsYXRlWSA9IGNlbnRlci55IC0geSAqIHNjYWxlXG4gICAgICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3RyYW5zbGF0ZVh9LCR7dHJhbnNsYXRlWX0pc2NhbGUoJHtzY2FsZX0pYFxuICAgICAgICB9XG5cbiAgICAgICAgZDMuc2VsZWN0KHRoaXMuZ3JvdXApXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2Zvcm0oc3RhcnQpKVxuICAgICAgICAgIC50cmFuc2l0aW9uKClcbiAgICAgICAgICAgIC5kdXJhdGlvbihpLmR1cmF0aW9uKVxuICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCAoKSA9PiAoICh0KSA9PiB0cmFuc2Zvcm0oaSh0KSkgKSlcbiAgICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnN0YXRlLmdyYXBoKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyh0aGlzLnN0YXRlLmdyYXBoKVxuICAgICAgICAgICAgcmV0dXJuIG51bGxcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGcgPSB0aGlzLnN0YXRlLmdyYXBoXG5cbiAgICAgICAgY29uc3Qgbm9kZXMgPSBnLm5vZGVzKCkubWFwKG5vZGVOYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG4gPSBnLm5vZGUobm9kZU5hbWUpXG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogdGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IFR5cGUgPSBub2RlRGlzcGF0Y2gobilcblxuICAgICAgICAgICAgcmV0dXJuIDxUeXBlIHsuLi5wcm9wc30gLz5cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoZWRnZU5hbWUgPT4ge1xuICAgICAgICAgICAgY29uc3QgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSlcblxuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGcuZ3JhcGgoKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3ZnIHJlZj17IGVsID0+IHsgdGhpcy5zdmcgPSBlbCB9IH0gaWQ9XCJ2aXN1YWxpemF0aW9uXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIiB2aWV3Qm94PXtgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWB9PlxuICAgICAgICAgICAgICAgIDxzdHlsZT5cbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnMucmVhZEZpbGVTeW5jKF9fZGlybmFtZSArIFwiL3NyYy9idW5kbGUuY3NzXCIsIFwidXRmLThcIiwgKGVycikgPT4ge2NvbnNvbGUubG9nKGVycil9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICAgICAgPEFycm93IC8+XG4gICAgICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIiByZWY9e2VsID0+IHsgdGhpcy5ncm91cCA9IGVsIH19PlxuICAgICAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bm9kZXN9XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2VkZ2VzfVxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jb25zdCBBcnJvdyA9ICgpID0+IChcbiAgICA8bWFya2VyIGlkPVwiYXJyb3dcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCIgLz5cbiAgICA8L21hcmtlcj5cbilcblxuY2xhc3MgRWRnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBsaW5lID0gZDMubGluZSgpXG4gICAgICAgIC5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgLnkoZCA9PiBkLnkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogW11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IHRoaXMucHJvcHMuZWRnZS5wb2ludHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgZG9tTm9kZS5iZWdpbkVsZW1lbnQoKSAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLnByb3BzLmVkZ2U7XG4gICAgICAgIGxldCBsID0gdGhpcy5saW5lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVwiIG1hcmtlckVuZD1cInVybCgjYXJyb3cpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jb25zdCBub2RlRGlzcGF0Y2ggPSAobikgPT4ge1xuICAgIGxldCBUeXBlID0gbnVsbFxuICAgIGlmIChuLmlzTWV0YW5vZGUgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKG4uaXNBbm9ueW1vdXMpIHtcbiAgICAgICAgICAgIFR5cGUgPSBBbm9ueW1vdXNNZXRhbm9kZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVHlwZSA9IE1ldGFub2RlXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgIFR5cGUgPSBJZGVudGlmaWVkTm9kZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgVHlwZSA9IEFub255bW91c05vZGVcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gVHlwZVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG4gPSB0aGlzLnByb3BzLm5vZGVcbiAgICAgICAgY29uc3QgdHlwZSA9IG4uaXNNZXRhbm9kZSA/IFwibWV0YW5vZGVcIiA6IFwibm9kZVwiXG5cbiAgICAgICAgY29uc3QgdHJhbnNsYXRlWCA9IE1hdGguZmxvb3Iobi54IC0obi53aWR0aCAvIDIpKVxuICAgICAgICBjb25zdCB0cmFuc2xhdGVZID0gTWF0aC5mbG9vcihuLnkgLShuLmhlaWdodCAvIDIpKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Z1xuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17YCR7dHlwZX0gJHtuLmNsYXNzfWB9XG4gICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5wcm9wcy5vbkNsaWNrLmJpbmQodGhpcywgdGhpcy5wcm9wcy5ub2RlKX1cbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHt0cmFuc2xhdGVYfSwke3RyYW5zbGF0ZVl9KWB9XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfSAvPlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG4gPSB0aGlzLnByb3BzLm5vZGVcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgIClcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c01ldGFub2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBjb25zdCBuID0gdGhpcy5wcm9wcy5ub2RlXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgIClcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG4gPSB0aGlzLnByb3BzLm5vZGVcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKVxuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnN0IG4gPSB0aGlzLnByb3BzLm5vZGVcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApXG4gICAgfVxufSIsImZ1bmN0aW9uIHJ1bigpIHtcbiAgUmVhY3RET00ucmVuZGVyKDxJREUvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vbmllbCcpKTtcbn1cblxuY29uc3QgbG9hZGVkU3RhdGVzID0gWydjb21wbGV0ZScsICdsb2FkZWQnLCAnaW50ZXJhY3RpdmUnXTtcblxuaWYgKGxvYWRlZFN0YXRlcy5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gIHJ1bigpO1xufSBlbHNlIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW4sIGZhbHNlKTtcbn0iXX0=
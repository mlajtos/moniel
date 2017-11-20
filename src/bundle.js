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
				body: "Sketch was successfully saved in the \"sketches\" folder.",
				silent: true
			});
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
			var fileContent = fs.readFileSync("./examples/" + id + ".mon", "utf8");
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
                    fs.readFileSync("src/bundle.css", "utf-8", function (err) {
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvSW50ZXJwcmV0ZXIuanMiLCJzY3JpcHRzL0xvZ2dlci5qcyIsInNjcmlwdHMvUGFuZWwuanN4Iiwic2NyaXB0cy9QYXJzZXIuanMiLCJzY3JpcHRzL1B5VG9yY2hHZW5lcmF0b3IuanMiLCJzY3JpcHRzL1Njb3BlU3RhY2suanMiLCJzY3JpcHRzL1Zpc3VhbEdyYXBoLmpzeCIsInNjcmlwdHMvYXBwLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7SUFBTSxnQjs7OzthQUNGLFMsR0FBWSxJQUFJLFNBQUosQ0FBYztBQUN0Qix3QkFBWSxDQUFDLEdBQUQsQ0FEVTtBQUV0Qix1QkFBVyxDQUFDLElBQUQsQ0FGVztBQUd0QixrQkFBTSxLQUFLO0FBSFcsU0FBZCxDO2FBTVosUyxHQUFZLElBQUksU0FBSixDQUFjO0FBQ3RCLHdCQUFZLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFEO0FBRlcsU0FBZCxDOzs7OztpQ0FLSCxHLEVBQUs7QUFDVixnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsd0JBQVEsSUFBSSxVQUFKLENBQWUsQ0FBZixDQUFSO0FBQ0g7QUFDRCxtQkFBTyxJQUFQO0FBQ0g7Ozs4QkFFSyxHLEVBQUs7QUFDUCxnQkFBSSxPQUFPLENBQVg7QUFDQSxpQkFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksTUFBeEIsRUFBZ0MsR0FBaEMsRUFBcUM7QUFDakMsdUJBQU8sT0FBTyxFQUFQLEdBQVksSUFBSSxVQUFKLENBQWUsQ0FB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LE1BRU87QUFDTCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbG9ySGFzaFdyYXBwZXJ7XG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjldLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICAgICAgaGFzaDogdGhpcy5tYWdpY1xuICAgIH0pXG5cbiAgICBjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoKHtcbiAgICAgICAgc2F0dXJhdGlvbjogWzAuNSwgMC42LCAwLjddLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICB9KVxuXG4gICAgbG9zZUxvc2Uoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggKz0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBtYWdpYyhzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCA9IGhhc2ggKiA0NyArIHN0ci5jaGFyQ29kZUF0KGkpICUgMzI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBoZXgoc3RyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9ySGFzaC5oZXgoc3RyKVxuICAgIH1cbn0iLCJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdG5vZGVDb3VudGVyID0ge31cblx0X25vZGVTdGFjayA9IFtdXG5cdF9wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRnZXQgbm9kZVN0YWNrKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IG5vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX25vZGVTdGFja1tsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGdldCBwcmV2aW91c05vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IHByZXZpb3VzTm9kZVN0YWNrKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmNsZWFyTm9kZVN0YWNrKClcblxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW11cblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZXM6XCIsIHRoaXMubWV0YW5vZGVzKVxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGUgU3RhY2s6XCIsIHRoaXMubWV0YW5vZGVTdGFjaylcblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5tZXRhbm9kZVN0YWNrKVxuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYFRvdWNoaW5nIG5vZGUgXCIke25vZGVQYXRofVwiLmApXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrLnB1c2gobm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFja1swXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2subGVuZ3RoID4gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgVHJ5aW5nIHRvIHRvdWNoIG5vbi1leGlzdGFudCBub2RlIFwiJHtub2RlUGF0aH1cImApO1xuXHRcdH1cblx0fVxuXG5cdHJlZmVyZW5jZU5vZGUoaWQpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBpZCxcblx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0aGVpZ2h0OiA1MFxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHdpZHRoOiBNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSAqIDEwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZClcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKClcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGVmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aFxuXHRcdH0pO1xuXHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0cmV0dXJuIG5vZGVQYXRoO1xuXHR9XG5cblx0Y3JlYXRlTWV0YW5vZGUoaWRlbnRpZmllciwgbm9kZSkge1xuXHRcdGNvbnN0IG1ldGFub2RlQ2xhc3MgPSBub2RlLmNsYXNzXG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcilcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKClcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHRjb25zdCBlID0gdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKVxuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGVkZ2Uudi5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIGVkZ2Uudy5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIHt9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gWy4uLnRoaXMubm9kZVN0YWNrXVxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKVxuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdGNvbnN0IGlzQXZhaWxhYmxlID0gKHRoaXMuZ3JhcGguaW5FZGdlcyhub2RlUGF0aCkubGVuZ3RoID09PSAwKVxuXHRcdGNvbnN0IGlzSW5wdXQgPSAodGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiKVxuXHRcdGNvbnN0IGlzVW5kZWZpbmVkID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwidW5kZWZpbmVkXCIpXG5cdFx0cmV0dXJuIChpc0lucHV0IHx8IChpc1VuZGVmaW5lZCAmJiBpc0F2YWlsYWJsZSkpXG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdGNvbnN0IGlzQXZhaWxhYmxlID0gKHRoaXMuZ3JhcGgub3V0RWRnZXMobm9kZVBhdGgpLmxlbmd0aCA9PT0gMClcblx0XHRjb25zdCBpc091dHB1dCA9ICh0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiKVxuXHRcdGNvbnN0IGlzVW5kZWZpbmVkID0gKHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwidW5kZWZpbmVkXCIpXG5cdFx0cmV0dXJuIChpc091dHB1dCB8fCAoaXNVbmRlZmluZWQgJiYgaXNBdmFpbGFibGUpKVxuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiaXNNZXRhbm9kZTpcIiwgbm9kZVBhdGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZVxuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aClcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4gdGhpcy5pc091dHB1dChub2RlKSlcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBudWxsXG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHR9IGVsc2UgaWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMSAmJiB0aGlzLmdyYXBoLm5vZGUob3V0cHV0Tm9kZXNbMF0pLmlzTWV0YW5vZGUpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldE91dHB1dE5vZGVzKG91dHB1dE5vZGVzWzBdKVxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlc1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhzY29wZVBhdGgpXG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aClcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB0aGlzLmlzSW5wdXQobm9kZSkpXG5cdFx0Y29uc29sZS5sb2coaW5wdXROb2RlcylcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIG51bGxcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHRyZXR1cm4gbnVsbFxuXHRcdH0gZWxzZSBpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDEgJiYgdGhpcy5ncmFwaC5ub2RlKGlucHV0Tm9kZXNbMF0pLmlzTWV0YW5vZGUpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldElucHV0Tm9kZXMoaW5wdXROb2Rlc1swXSlcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXROb2Rlc1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Y29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHt9KTtcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YXJnZXRQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0c291cmNlUGF0aHMuZm9yRWFjaChzb3VyY2VQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoLCB0YXJnZXRQYXRoc1swXSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IGBOdW1iZXIgb2Ygbm9kZXMgZG9lcyBub3QgbWF0Y2guIFske3NvdXJjZVBhdGhzLmxlbmd0aH1dIC0+IFske3RhcmdldFBhdGhzLmxlbmd0aH1dYCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdC8vIHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0XHQvLyBlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMuZ3JhcGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzXG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcnMoKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5tYXAobWFya2VyID0+IHRoaXMuZWRpdG9yLnNlc3Npb24ucmVtb3ZlTWFya2VyKG1hcmtlcikpO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkN1cnNvclBvc2l0aW9uQ2hhbmdlZChldmVudCwgc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCBtID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGxldCBjID0gc2VsZWN0aW9uLmdldEN1cnNvcigpO1xuICAgICAgICBsZXQgbWFya2VycyA9IHRoaXMubWFya2Vycy5tYXAoaWQgPT4gbVtpZF0pO1xuICAgICAgICBsZXQgY3Vyc29yT3Zlck1hcmtlciA9IG1hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIucmFuZ2UuY29udGFpbnMoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0YWN0aXZlV29ya2VycyA9IHt9XG5cdGN1cnJlbnRXb3JrZXJJZCA9IDBcblx0bGFzdEZpbmlzaGVkV29ya2VySWQgPSAwXG5cdGNhbGxiYWNrID0gZnVuY3Rpb24oKXt9XG5cblx0Y29uc3RydWN0b3IoY2FsbGJhY2spIHtcblx0XHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcblx0fVxuXG5cdGxheW91dChncmFwaCkge1xuXHRcdGNvbnN0IGlkID0gdGhpcy5nZXRXb3JrZXJJZCgpXG5cdFx0dGhpcy5hY3RpdmVXb3JrZXJzW2lkXSA9IG5ldyBMYXlvdXRXb3JrZXIoaWQsIGdyYXBoLCB0aGlzLndvcmtlckZpbmlzaGVkLmJpbmQodGhpcykpXG5cdH1cblxuXHR3b3JrZXJGaW5pc2hlZCh7aWQsIGdyYXBofSkge1xuXHRcdGlmIChpZCA+PSB0aGlzLmxhc3RGaW5pc2hlZFdvcmtlcklkKSB7XG5cdFx0XHR0aGlzLmxhc3RGaW5pc2hlZFdvcmtlcklkID0gaWRcblx0XHRcdHRoaXMuY2FsbGJhY2soZ3JhcGgpXG5cdFx0fVxuXHR9XG5cblx0Z2V0V29ya2VySWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50V29ya2VySWQgKz0gMVxuXHRcdHJldHVybiB0aGlzLmN1cnJlbnRXb3JrZXJJZFxuXHR9XG59XG5cbmNsYXNzIExheW91dFdvcmtlcntcblx0aWQgPSAwXG5cdHdvcmtlciA9IG51bGxcblx0Y29uc3RydWN0b3IoaWQsIGdyYXBoLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5pZCA9IGlkXG5cdFx0dGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKFwic3JjL3NjcmlwdHMvR3JhcGhMYXlvdXRXb3JrZXIuanNcIilcblx0XHR0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKSlcblx0XHR0aGlzLm9uRmluaXNoZWQgPSBvbkZpbmlzaGVkXG5cdFx0XG5cdFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2UodGhpcy5lbmNvZGUoZ3JhcGgpKVxuXHR9XG5cdHJlY2VpdmUobWVzc2FnZSkge1xuXHRcdHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG5cdFx0dGhpcy5vbkZpbmlzaGVkKHtcblx0XHRcdGlkOiB0aGlzLmlkLFxuXHRcdFx0Z3JhcGg6IHRoaXMuZGVjb2RlKG1lc3NhZ2UuZGF0YSlcblx0XHR9KVxuXHR9XG5cdGVuY29kZShncmFwaCkge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKVxuICAgIH1cblxuICAgIGRlY29kZShqc29uKSB7XG5cdFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChqc29uKVxuICAgIH1cbn0iLCJjb25zdCBpcGMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIikuaXBjUmVuZGVyZXJcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5cbmNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0cGFyc2VyID0gbmV3IFBhcnNlcigpXG5cdGludGVycHJldGVyID0gbmV3IEludGVycHJldGVyKClcblx0Z2VuZXJhdG9yID0gbmV3IFB5VG9yY2hHZW5lcmF0b3IoKVxuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Ly8gdGhlc2UgYXJlIG5vIGxvbmdlciBuZWVkZWQgaGVyZVxuXHRcdFx0Ly8gXCJncmFtbWFyXCI6IHRoaXMucGFyc2VyLmdyYW1tYXIsXG5cdFx0XHQvLyBcInNlbWFudGljc1wiOiB0aGlzLnBhcnNlci5zZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbCxcblx0XHRcdFwibGF5b3V0XCI6IFwiY29sdW1uc1wiLFxuXHRcdFx0XCJnZW5lcmF0ZWRDb2RlXCI6IFwiXCJcblx0XHR9O1xuXG5cdFx0aXBjLm9uKCdzYXZlJywgZnVuY3Rpb24oZXZlbnQsIG1lc3NhZ2UpIHtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5tb25cIiwgdGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbiwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLmFzdC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguc3ZnXCIsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzdmdcIikub3V0ZXJIVE1MLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9ncmFwaC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KGRhZ3JlLmdyYXBobGliLmpzb24ud3JpdGUodGhpcy5zdGF0ZS5ncmFwaCksIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9oYWxmLWFzc2VkX2pva2UucHlcIiwgdGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBzYXZlTm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignU2tldGNoIHNhdmVkJywge1xuICAgICAgICAgICAgXHRib2R5OiBgU2tldGNoIHdhcyBzdWNjZXNzZnVsbHkgc2F2ZWQgaW4gdGhlIFwic2tldGNoZXNcIiBmb2xkZXIuYCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG4gICAgICAgICAgICB9KVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRpcGMub24oXCJ0b2dnbGVMYXlvdXRcIiwgKGUsIG0pID0+IHtcblx0XHRcdHRoaXMudG9nZ2xlTGF5b3V0KClcblx0XHR9KTtcblxuXHRcdGlwYy5vbihcIm9wZW5cIiwgKGUsIG0pID0+IHtcblx0XHRcdHRoaXMub3BlbkZpbGUobS5maWxlUGF0aClcblx0XHR9KVxuXG5cdFx0bGV0IGxheW91dCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImxheW91dFwiKVxuXHRcdGlmIChsYXlvdXQpIHtcblx0XHRcdGlmIChsYXlvdXQgPT0gXCJjb2x1bW5zXCIgfHwgbGF5b3V0ID09IFwicm93c1wiKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUubGF5b3V0ID0gbGF5b3V0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmludGVycHJldGVyLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJ3YXJuaW5nXCIsXG5cdFx0XHRcdFx0bWVzc2FnZTogYFZhbHVlIGZvciBcImxheW91dFwiIGNhbiBiZSBvbmx5IFwiY29sdW1uc1wiIG9yIFwicm93c1wiLmBcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRvcGVuRmlsZShmaWxlUGF0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwib3BlbkZpbGVcIiwgZmlsZVBhdGgpXG5cdFx0bGV0IGZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0ZjhcIilcblx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZShmaWxlQ29udGVudCkgLy8gdGhpcyBoYXMgdG8gYmUgaGVyZSwgSSBkb24ndCBrbm93IHdoeVxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bmV0d29ya0RlZmluaXRpb246IGZpbGVDb250ZW50XG5cdFx0fSlcblx0fVxuXG5cdGxvYWRFeGFtcGxlKGlkKSB7XG5cdFx0bGV0IGZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZXIubWFrZSh2YWx1ZSlcblxuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLmludGVycHJldGVyLmV4ZWN1dGUocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKClcblx0XHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0TWV0YW5vZGVzRGVmaW5pdGlvbnMoKVxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMuaW50ZXJwcmV0ZXIuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcInJlc2l6ZVwiKSlcblx0XHR9LCAxMDApXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiLypcblx0VGhpcyBjb2RlIGlzIGEgbWVzcy5cbiovXG5cbmNvbnN0IHBpeGVsV2lkdGggPSByZXF1aXJlKCdzdHJpbmctcGl4ZWwtd2lkdGgnKVxuXG5jbGFzcyBJbnRlcnByZXRlciB7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0XHR0aGlzLmRlcHRoID0gMFxuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiRGVjb252b2x1dGlvblwiLCBcIkF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlTWF4UG9vbGluZ1wiLCBcIk1heFVucG9vbGluZ1wiLCBcIkxvY2FsUmVzcG9uc2VOb3JtYWxpemF0aW9uXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGV4ZWN1dGUoYXN0KSB7XG5cdFx0Y29uc3Qgc3RhdGUgPSB7XG5cdFx0XHRncmFwaDogbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKSxcblx0XHRcdGxvZ2dlcjogbmV3IExvZ2dlcigpXG5cdFx0fVxuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpXG5cdFx0dGhpcy53YWxrQXN0KGFzdCwgc3RhdGUpXG5cdFx0Y29uc29sZS5sb2coXCJGaW5hbCBTdGF0ZTpcIiwgc3RhdGUpXG5cdH1cblxuXHR3YWxrQXN0KHRva2VuLCBzdGF0ZSkge1xuXHRcdGlmICghdG9rZW4pIHsgY29uc29sZS5lcnJvcihcIk5vIHRva2VuPyFcIik7IHJldHVybjsgfVxuXHRcdHRoaXMuZGVwdGggKz0gMVxuXHRcdGNvbnN0IHBhZCA9IEFycmF5LmZyb20oe2xlbmd0aDogdGhpcy5kZXB0aH0pLmZpbGwoXCIgXCIpLnJlZHVjZSgocCwgYykgPT4gcCArIGMsIFwiXCIpXG5cdFx0Ly9jb25zb2xlLmxvZyhwYWQgKyB0b2tlbi5raW5kKVxuXG5cdFx0Y29uc3QgZm5OYW1lID0gXCJfXCIgKyB0b2tlbi5raW5kXG5cdFx0Y29uc3QgZm4gPSB0aGlzW2ZuTmFtZV0gfHwgdGhpcy5fdW5yZWNvZ25pemVkXG5cdFx0Y29uc3QgcmV0dXJuVmFsdWUgPSBmbi5jYWxsKHRoaXMsIHRva2VuLCBzdGF0ZSlcblx0XHR0aGlzLmRlcHRoIC09IDFcblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZVxuXHR9XG5cblx0X0dyYXBoKGdyYXBoLCBzdGF0ZSkge1xuXHRcdGdyYXBoLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKTtcblx0fVxuXG5cdF9Ob2RlRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbiwgc3RhdGUpwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke25vZGVEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihub2RlRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRpZiAobm9kZURlZmluaXRpb24uYm9keSkge1xuXHRcdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKG5vZGVEZWZpbml0aW9uLm5hbWUpXG5cdFx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShub2RlRGVmaW5pdGlvbi5uYW1lKVxuXHRcdFx0dGhpcy53YWxrQXN0KG5vZGVEZWZpbml0aW9uLmJvZHksIHN0YXRlKVxuXHRcdFx0c3RhdGUuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKVxuXHRcdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0fVxuXHR9XG5cdFxuXHRfQ2hhaW4oY2hhaW4sIHN0YXRlKSB7XG5cdFx0c3RhdGUuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdHRoaXMuZ3JhcGguY2xlYXJOb2RlU3RhY2soKVxuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjaGFpbi5ibG9ja3MuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHN0YXRlLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHR0aGlzLmdyYXBoLmZyZWV6ZU5vZGVTdGFjaygpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0sIHN0YXRlKVxuXHRcdH0pXG5cdH1cblxuXHRfSW5saW5lTWV0YU5vZGUobm9kZSwgc3RhdGUpIHtcblx0XHQvL2NvbnNvbGUubG9nKG5vZGUpXG5cdFx0Y29uc3QgaWRlbnRpZmllciA9IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdGhpcy5ncmFwaC5nZW5lcmF0ZUluc3RhbmNlSWQoXCJtZXRhbm9kZVwiKVxuXG5cdFx0c3RhdGUuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKGlkZW50aWZpZXIpXG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoaWRlbnRpZmllcilcblx0XHR0aGlzLndhbGtBc3Qobm9kZS5ib2R5LCBzdGF0ZSlcblx0XHRzdGF0ZS5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpXG5cblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogbm9kZS5hbGlhcyA/IG5vZGUuYWxpYXMudmFsdWUgOiB1bmRlZmluZWQsXG5cdFx0XHRpZDogaWRlbnRpZmllcixcblx0XHRcdGNsYXNzOiBpZGVudGlmaWVyLFxuXHRcdFx0aXNBbm9ueW1vdXM6IHRydWUsXG5cdFx0XHRfc291cmNlOiBub2RlLl9zb3VyY2Vcblx0XHR9KVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiBpZGVudGlmaWVyLFxuXHRcdFx0Y2xhc3M6IGlkZW50aWZpZXIsXG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IG5vZGUuYWxpYXMgPyBub2RlLmFsaWFzLnZhbHVlIDogdW5kZWZpbmVkLFxuXHRcdFx0X3NvdXJjZTogbm9kZS5fc291cmNlXG5cdFx0fVxuXHR9XG5cblx0X01ldGFOb2RlKG1ldGFub2RlLCBzdGF0ZSkge1xuXHRcdC8vIGNvbnNvbGUubG9nKG1ldGFub2RlKVxuXHRcdG1ldGFub2RlLmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbiwgc3RhdGUpKVxuXHR9XG5cblxuXHRfTm9kZShub2RlLCBzdGF0ZSkge1xuXHRcdGNvbnN0IG5vZGVEZWZpbml0aW9uID0gdGhpcy53YWxrQXN0KHtcblx0XHRcdC4uLm5vZGUubm9kZSxcblx0XHRcdGFsaWFzOiBub2RlLmFsaWFzXG5cdFx0fSwgc3RhdGUpXG5cblx0XHQvLyBjb25zb2xlLmxvZyhub2RlRGVmaW5pdGlvbilcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRfTGl0ZXJhbE5vZGUoaW5zdGFuY2UsIHN0YXRlKSB7XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHRpZDogdW5kZWZpbmVkLFxuXHRcdFx0Y2xhc3M6IFwiVW5rbm93blwiLFxuXHRcdFx0Y29sb3I6IFwiZGFya2dyZXlcIixcblx0XHRcdGhlaWdodDogMzAsXG5cdFx0XHR3aWR0aDogMTAwLFxuXG5cdFx0XHRfc291cmNlOiBpbnN0YW5jZSxcblx0XHR9O1xuXG5cdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMoaW5zdGFuY2UudHlwZS52YWx1ZSlcblx0XHQvLyBjb25zb2xlLmxvZyhgTWF0Y2hlZCBkZWZpbml0aW9uczpgLCBkZWZpbml0aW9ucyk7XG5cblx0XHRpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UudHlwZS52YWx1ZTtcblx0XHRcdG5vZGUuaXNVbmRlZmluZWQgPSB0cnVlXG5cblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UudHlwZS52YWx1ZX1cIi4gTm8gcG9zc2libGUgbWF0Y2hlcyBmb3VuZC5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdXG5cdFx0XHRpZiAoZGVmaW5pdGlvbikge1xuXHRcdFx0XHRub2RlLmNvbG9yID0gZGVmaW5pdGlvbi5jb2xvclxuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS50eXBlLnZhbHVlXG5cdFx0XHR0aGlzLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLnR5cGUudmFsdWV9XCIuIFBvc3NpYmxlIG1hdGNoZXM6ICR7ZGVmaW5pdGlvbnMubWFwKGRlZiA9PiBgXCIke2RlZi5uYW1lfVwiYCkuam9pbihcIiwgXCIpfS5gLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiAgaW5zdGFuY2UudHlwZS5fc291cmNlLnN0YXJ0SWR4LFxuXHRcdFx0XHRcdGVuZDogIGluc3RhbmNlLnR5cGUuX3NvdXJjZS5lbmRJZHhcblx0XHRcdFx0fSxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHR9KVxuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHRsZXQgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKVxuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMVxuXHRcdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShub2RlLmlkLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHN0eWxlOiB7XCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCl9XG5cdFx0XHR9KVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHsgXCJmaWxsXCI6IGNvbG9yLnRvU3RyaW5nKCkgfVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGNvbnN0IHdpZHRoID0gMjAgKyBNYXRoLm1heCguLi5bbm9kZS5jbGFzcywgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZCA6IFwiXCJdLm1hcChzdHJpbmcgPT4gcGl4ZWxXaWR0aChzdHJpbmcsIHtzaXplOiAxNn0pKSlcblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fSlcblxuXHRcdHJldHVybiB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0c3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG5cdFx0fVxuXHR9XG5cblx0X0xpc3QobGlzdCwgc3RhdGUpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtLCBzdGF0ZSkpXG5cdH1cblxuXHRfSWRlbnRpZmllcihpZGVudGlmaWVyKSB7XG5cdFx0dGhpcy5ncmFwaC5yZWZlcmVuY2VOb2RlKGlkZW50aWZpZXIudmFsdWUpXG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKVxuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IEludGVycHJldGVyLm5hbWVSZXNvbHV0aW9uKHF1ZXJ5LCBkZWZpbml0aW9ucylcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cylcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pXG5cdFx0cmV0dXJuIG1hdGNoZWREZWZpbml0aW9uc1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKClcblx0fVxuXG5cdGdldE1ldGFub2Rlc0RlZmluaXRpb25zKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldE1ldGFub2RlcygpXG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpXG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHRoaXMubG9nZ2VyLmFkZElzc3VlKGlzc3VlKVxuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvXG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KVxuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdChzcGxpdFJlZ2V4KSlcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gSW50ZXJwcmV0ZXIuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKVxuXHQgICAgcmVzdWx0ID0gcmVzdWx0Lm1hcChpdGVtID0+IGl0ZW0uam9pbihcIlwiKSlcblx0ICAgIHJldHVybiByZXN1bHRcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZSB9XG5cdCAgICBsZXQgaSA9IDBcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDEgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCkgLy8gZ290IHRvIHRoZSBlbmQ/XG5cdH1cblxuXHRfdW5yZWNvZ25pemVkKHRva2VuKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIHRva2VuP1wiLCB0b2tlbilcblx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuY29uc3Qgb2htID0gcmVxdWlyZShcIm9obS1qc1wiKVxuXG5jbGFzcyBQYXJzZXJ7XG5cdGNvbnRlbnRzID0gbnVsbFxuXHRncmFtbWFyID0gbnVsbFxuXHRcblx0ZXZhbE9wZXJhdGlvbiA9IHtcblx0XHRHcmFwaDogKGRlZmluaXRpb25zKSA9PiAgKHtcblx0XHRcdGtpbmQ6IFwiR3JhcGhcIixcblx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5ldmFsKClcblx0XHR9KSxcblx0XHROb2RlRGVmaW5pdGlvbjogZnVuY3Rpb24oXywgbGF5ZXJOYW1lLCBwYXJhbXMsIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZURlZmluaXRpb25cIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKClbMF1cblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZU1ldGFOb2RlOiBmdW5jdGlvbihib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklubGluZU1ldGFOb2RlXCIsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0TWV0YU5vZGU6IGZ1bmN0aW9uKF8sIGRlZnMsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBkZWZzLmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJNZXRhTm9kZVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZGVmaW5pdGlvbnNcblx0XHRcdH1cblx0XHR9LFxuXHRcdENoYWluOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkNoYWluXCIsXG5cdFx0XHRcdGJsb2NrczogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdE5vZGU6IGZ1bmN0aW9uKGlkLCBfLCBub2RlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIk5vZGVcIixcblx0XHRcdFx0bm9kZTogbm9kZS5ldmFsKCksXG5cdFx0XHRcdGFsaWFzOiBpZC5ldmFsKClbMF0sXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRMaXRlcmFsTm9kZTogZnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIkxpdGVyYWxOb2RlXCIsXG5cdFx0XHRcdHR5cGU6IHR5cGUuZXZhbCgpLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBwYXJhbXMuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHQvKlxuXHRcdEJsb2NrTmFtZTogZnVuY3Rpb24oaWQsIF8pIHtcblx0XHRcdHJldHVybiBpZC5ldmFsKClcblx0XHR9LFxuXHRcdCovXG5cdFx0TGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTGlzdFwiLFxuXHRcdFx0XHRsaXN0OiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tQYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0a2luZDogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRwYXRoOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRraW5kOiBcIklkZW50aWZpZXJcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cGFyYW1ldGVyTmFtZTogZnVuY3Rpb24oYSkge1xuXHRcdFx0cmV0dXJuIGEuc291cmNlLmNvbnRlbnRzXG5cdFx0fSxcblx0XHRub2RlVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiTm9kZVR5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGtpbmQ6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhcInNyYy9tb25pZWwub2htXCIsIFwidXRmOFwiKVxuXHRcdHRoaXMuZ3JhbW1hciA9IG9obS5ncmFtbWFyKHRoaXMuY29udGVudHMpXG5cdFx0dGhpcy5zZW1hbnRpY3MgPSB0aGlzLmdyYW1tYXIuY3JlYXRlU2VtYW50aWNzKCkuYWRkT3BlcmF0aW9uKFwiZXZhbFwiLCB0aGlzLmV2YWxPcGVyYXRpb24pXG5cdH1cblxuXHRtYWtlKHNvdXJjZSkge1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmdyYW1tYXIubWF0Y2goc291cmNlKVxuXG5cdFx0aWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHRcdFx0dmFyIGFzdCA9IHRoaXMuc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhc3Rcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpXG5cdFx0XHR2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4cGVjdGVkLFxuXHRcdFx0XHRwb3NpdGlvblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59IiwiY2xhc3MgUHlUb3JjaEdlbmVyYXRvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuYnVpbHRpbnMgPSBbXCJBcml0aG1ldGljRXJyb3JcIiwgXCJBc3NlcnRpb25FcnJvclwiLCBcIkF0dHJpYnV0ZUVycm9yXCIsIFwiQmFzZUV4Y2VwdGlvblwiLCBcIkJsb2NraW5nSU9FcnJvclwiLCBcIkJyb2tlblBpcGVFcnJvclwiLCBcIkJ1ZmZlckVycm9yXCIsIFwiQnl0ZXNXYXJuaW5nXCIsIFwiQ2hpbGRQcm9jZXNzRXJyb3JcIiwgXCJDb25uZWN0aW9uQWJvcnRlZEVycm9yXCIsIFwiQ29ubmVjdGlvbkVycm9yXCIsIFwiQ29ubmVjdGlvblJlZnVzZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25SZXNldEVycm9yXCIsIFwiRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiRU9GRXJyb3JcIiwgXCJFbGxpcHNpc1wiLCBcIkVudmlyb25tZW50RXJyb3JcIiwgXCJFeGNlcHRpb25cIiwgXCJGYWxzZVwiLCBcIkZpbGVFeGlzdHNFcnJvclwiLCBcIkZpbGVOb3RGb3VuZEVycm9yXCIsIFwiRmxvYXRpbmdQb2ludEVycm9yXCIsIFwiRnV0dXJlV2FybmluZ1wiLCBcIkdlbmVyYXRvckV4aXRcIiwgXCJJT0Vycm9yXCIsIFwiSW1wb3J0RXJyb3JcIiwgXCJJbXBvcnRXYXJuaW5nXCIsIFwiSW5kZW50YXRpb25FcnJvclwiLCBcIkluZGV4RXJyb3JcIiwgXCJJbnRlcnJ1cHRlZEVycm9yXCIsIFwiSXNBRGlyZWN0b3J5RXJyb3JcIiwgXCJLZXlFcnJvclwiLCBcIktleWJvYXJkSW50ZXJydXB0XCIsIFwiTG9va3VwRXJyb3JcIiwgXCJNZW1vcnlFcnJvclwiLCBcIk1vZHVsZU5vdEZvdW5kRXJyb3JcIiwgXCJOYW1lRXJyb3JcIiwgXCJOb25lXCIsIFwiTm90QURpcmVjdG9yeUVycm9yXCIsIFwiTm90SW1wbGVtZW50ZWRcIiwgXCJOb3RJbXBsZW1lbnRlZEVycm9yXCIsIFwiT1NFcnJvclwiLCBcIk92ZXJmbG93RXJyb3JcIiwgXCJQZW5kaW5nRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiUGVybWlzc2lvbkVycm9yXCIsIFwiUHJvY2Vzc0xvb2t1cEVycm9yXCIsIFwiUmVjdXJzaW9uRXJyb3JcIiwgXCJSZWZlcmVuY2VFcnJvclwiLCBcIlJlc291cmNlV2FybmluZ1wiLCBcIlJ1bnRpbWVFcnJvclwiLCBcIlJ1bnRpbWVXYXJuaW5nXCIsIFwiU3RvcEFzeW5jSXRlcmF0aW9uXCIsIFwiU3RvcEl0ZXJhdGlvblwiLCBcIlN5bnRheEVycm9yXCIsIFwiU3ludGF4V2FybmluZ1wiLCBcIlN5c3RlbUVycm9yXCIsIFwiU3lzdGVtRXhpdFwiLCBcIlRhYkVycm9yXCIsIFwiVGltZW91dEVycm9yXCIsIFwiVHJ1ZVwiLCBcIlR5cGVFcnJvclwiLCBcIlVuYm91bmRMb2NhbEVycm9yXCIsIFwiVW5pY29kZURlY29kZUVycm9yXCIsIFwiVW5pY29kZUVuY29kZUVycm9yXCIsIFwiVW5pY29kZUVycm9yXCIsIFwiVW5pY29kZVRyYW5zbGF0ZUVycm9yXCIsIFwiVW5pY29kZVdhcm5pbmdcIiwgXCJVc2VyV2FybmluZ1wiLCBcIlZhbHVlRXJyb3JcIiwgXCJXYXJuaW5nXCIsIFwiWmVyb0RpdmlzaW9uRXJyb3JcIiwgXCJfX2J1aWxkX2NsYXNzX19cIiwgXCJfX2RlYnVnX19cIiwgXCJfX2RvY19fXCIsIFwiX19pbXBvcnRfX1wiLCBcIl9fbG9hZGVyX19cIiwgXCJfX25hbWVfX1wiLCBcIl9fcGFja2FnZV9fXCIsIFwiX19zcGVjX19cIiwgXCJhYnNcIiwgXCJhbGxcIiwgXCJhbnlcIiwgXCJhc2NpaVwiLCBcImJpblwiLCBcImJvb2xcIiwgXCJieXRlYXJyYXlcIiwgXCJieXRlc1wiLCBcImNhbGxhYmxlXCIsIFwiY2hyXCIsIFwiY2xhc3NtZXRob2RcIiwgXCJjb21waWxlXCIsIFwiY29tcGxleFwiLCBcImNvcHlyaWdodFwiLCBcImNyZWRpdHNcIiwgXCJkZWxhdHRyXCIsIFwiZGljdFwiLCBcImRpclwiLCBcImRpdm1vZFwiLCBcImVudW1lcmF0ZVwiLCBcImV2YWxcIiwgXCJleGVjXCIsIFwiZXhpdFwiLCBcImZpbHRlclwiLCBcImZsb2F0XCIsIFwiZm9ybWF0XCIsIFwiZnJvemVuc2V0XCIsIFwiZ2V0YXR0clwiLCBcImdsb2JhbHNcIiwgXCJoYXNhdHRyXCIsIFwiaGFzaFwiLCBcImhlbHBcIiwgXCJoZXhcIiwgXCJpZFwiLCBcImlucHV0XCIsIFwiaW50XCIsIFwiaXNpbnN0YW5jZVwiLCBcImlzc3ViY2xhc3NcIiwgXCJpdGVyXCIsIFwibGVuXCIsIFwibGljZW5zZVwiLCBcImxpc3RcIiwgXCJsb2NhbHNcIiwgXCJtYXBcIiwgXCJtYXhcIiwgXCJtZW1vcnl2aWV3XCIsIFwibWluXCIsIFwibmV4dFwiLCBcIm9iamVjdFwiLCBcIm9jdFwiLCBcIm9wZW5cIiwgXCJvcmRcIiwgXCJwb3dcIiwgXCJwcmludFwiLCBcInByb3BlcnR5XCIsIFwicXVpdFwiLCBcInJhbmdlXCIsIFwicmVwclwiLCBcInJldmVyc2VkXCIsIFwicm91bmRcIiwgXCJzZXRcIiwgXCJzZXRhdHRyXCIsIFwic2xpY2VcIiwgXCJzb3J0ZWRcIiwgXCJzdGF0aWNtZXRob2RcIiwgXCJzdHJcIiwgXCJzdW1cIiwgXCJzdXBlclwiLCBcInR1cGxlXCIsIFwidHlwZVwiLCBcInZhcnNcIiwgXCJ6aXBcIl1cblx0XHR0aGlzLmtleXdvcmRzID0gW1wiYW5kXCIsIFwiYXNcIiwgXCJhc3NlcnRcIiwgXCJicmVha1wiLCBcImNsYXNzXCIsIFwiY29udGludWVcIiwgXCJkZWZcIiwgXCJkZWxcIiwgXCJlbGlmXCIsIFwiZWxzZVwiLCBcImV4Y2VwdFwiLCBcImV4ZWNcIiwgXCJmaW5hbGx5XCIsIFwiZm9yXCIsIFwiZnJvbVwiLCBcImdsb2JhbFwiLCBcImlmXCIsIFwiaW1wb3J0XCIsIFwiaW5cIiwgXCJpc1wiLCBcImxhbWJkYVwiLCBcIm5vdFwiLCBcIm9yXCIsIFwicGFzc1wiLCBcInByaW50XCIsIFwicmFpc2VcIiwgXCJyZXR1cm5cIiwgXCJ0cnlcIiwgXCJ3aGlsZVwiLCBcIndpdGhcIiwgXCJ5aWVsZFwiXVxuXHR9XG5cbiAgICBzYW5pdGl6ZShpZCkge1xuXHRcdHZhciBzYW5pdGl6ZWRJZCA9IGlkXG5cdFx0aWYgKHRoaXMuYnVpbHRpbnMuaW5jbHVkZXMoc2FuaXRpemVkSWQpIHx8IHRoaXMua2V5d29yZHMuaW5jbHVkZXMoc2FuaXRpemVkSWQpKSB7XG5cdFx0XHRzYW5pdGl6ZWRJZCA9IFwiX1wiICsgc2FuaXRpemVkSWRcblx0XHR9XG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC4vZywgXCJ0aGlzXCIpXG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC8vZywgXCIuXCIpXG5cdFx0cmV0dXJuIHNhbml0aXplZElkXG5cdH1cblxuXHRtYXBUb0Z1bmN0aW9uKG5vZGVUeXBlKSB7XG5cdFx0bGV0IHRyYW5zbGF0aW9uVGFibGUgPSB7XG5cdFx0XHRcIkNvbnZvbHV0aW9uXCI6IFwiRi5jb252MmRcIixcblx0XHRcdFwiRGVjb252b2x1dGlvblwiOiBcIkYuY29udl90cmFuc3Bvc2UyZFwiLFxuXHRcdFx0XCJBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJBZGFwdGl2ZUF2ZXJhZ2VQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9hdmdfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFBvb2xpbmdcIjogXCJGLm1heF9wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVNYXhQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFVucG9vbGluZ1wiOiBcIkYubWF4X3VucG9vbDJkXCIsXG5cdFx0XHRcIlJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJlbHVcIixcblx0XHRcdFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCI6IFwiRi5lbHVcIixcblx0XHRcdFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnByZWx1XCIsXG5cdFx0XHRcIkxlYWt5UmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYubGVha3lfcmVsdVwiLFxuXHRcdFx0XCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucnJlbHVcIixcblx0XHRcdFwiU2lnbW9pZFwiOiBcIkYuc2lnbW9pZFwiLFxuXHRcdFx0XCJMb2dTaWdtb2lkXCI6IFwiRi5sb2dzaWdtb2lkXCIsXG5cdFx0XHRcIlRocmVzaG9sZFwiOiBcIkYudGhyZXNob2xkXCIsXG5cdFx0XHRcIkhhcmRUYW5oXCI6IFwiRi5oYXJkdGFuaFwiLFxuXHRcdFx0XCJUYW5oXCI6IFwiRi50YW5oXCIsXG5cdFx0XHRcIlRhbmhTaHJpbmtcIjogXCJGLnRhbmhzaHJpbmtcIixcblx0XHRcdFwiSGFyZFNocmlua1wiOiBcIkYuaGFyZHNocmlua1wiLFxuXHRcdFx0XCJMb2dTb2Z0TWF4XCI6IFwiRi5sb2dfc29mdG1heFwiLFxuXHRcdFx0XCJTb2Z0U2hyaW5rXCI6IFwiRi5zb2Z0c2hyaW5rXCIsXG5cdFx0XHRcIlNvZnRNYXhcIjogXCJGLnNvZnRtYXhcIixcblx0XHRcdFwiU29mdE1pblwiOiBcIkYuc29mdG1pblwiLFxuXHRcdFx0XCJTb2Z0UGx1c1wiOiBcIkYuc29mdHBsdXNcIixcblx0XHRcdFwiU29mdFNpZ25cIjogXCJGLnNvZnRzaWduXCIsXG5cdFx0XHRcIkJhdGNoTm9ybWFsaXphdGlvblwiOiBcIkYuYmF0Y2hfbm9ybVwiLFxuXHRcdFx0XCJMaW5lYXJcIjogXCJGLmxpbmVhclwiLFxuXHRcdFx0XCJEcm9wb3V0XCI6IFwiRi5kcm9wb3V0XCIsXG5cdFx0XHRcIlBhaXJ3aXNlRGlzdGFuY2VcIjogXCJGLnBhaXJ3aXNlX2Rpc3RhbmNlXCIsXG5cdFx0XHRcIkNyb3NzRW50cm9weVwiOiBcIkYuY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJCaW5hcnlDcm9zc0VudHJvcHlcIjogXCJGLmJpbmFyeV9jcm9zc19lbnRyb3B5XCIsXG5cdFx0XHRcIkt1bGxiYWNrTGVpYmxlckRpdmVyZ2VuY2VMb3NzXCI6IFwiRi5rbF9kaXZcIixcblx0XHRcdFwiUGFkXCI6IFwiRi5wYWRcIixcblx0XHRcdFwiVmFyaWFibGVcIjogXCJBRy5WYXJpYWJsZVwiLFxuXHRcdFx0XCJSYW5kb21Ob3JtYWxcIjogXCJULnJhbmRuXCIsXG5cdFx0XHRcIlRlbnNvclwiOiBcIlQuVGVuc29yXCJcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShub2RlVHlwZSkgPyB0cmFuc2xhdGlvblRhYmxlW25vZGVUeXBlXSA6IG5vZGVUeXBlXG5cblx0fVxuXG5cdGluZGVudChjb2RlLCBsZXZlbCA9IDEsIGluZGVudFBlckxldmVsID0gXCIgICAgXCIpIHtcblx0XHRsZXQgaW5kZW50ID0gaW5kZW50UGVyTGV2ZWwucmVwZWF0KGxldmVsKVxuXHRcdHJldHVybiBjb2RlLnNwbGl0KFwiXFxuXCIpLm1hcChsaW5lID0+IGluZGVudCArIGxpbmUpLmpvaW4oXCJcXG5cIilcblx0fVxuXG5cdGdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpIHtcblx0XHRsZXQgaW1wb3J0cyA9XG5gaW1wb3J0IHRvcmNoIGFzIFRcbmltcG9ydCB0b3JjaC5ubi5mdW5jdGlvbmFsIGFzIEZcbmltcG9ydCB0b3JjaC5hdXRvZ3JhZCBhcyBBR2BcblxuXHRcdGxldCBtb2R1bGVEZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5tYXAoZGVmaW5pdGlvbk5hbWUgPT4ge1xuXHRcdFx0aWYgKGRlZmluaXRpb25OYW1lICE9PSBcIm1haW5cIikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUNvZGVGb3JNb2R1bGUoZGVmaW5pdGlvbk5hbWUsIGRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vcmV0dXJuIFwiXCJcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0bGV0IGNvZGUgPVxuYCR7aW1wb3J0c31cblxuJHttb2R1bGVEZWZpbml0aW9ucy5qb2luKFwiXFxuXCIpfVxuYFxuXG5cdFx0cmV0dXJuIGNvZGVcblx0fVxuXG5cdGdlbmVyYXRlQ29kZUZvck1vZHVsZShjbGFzc25hbWUsIGdyYXBoKSB7XG5cdFx0bGV0IHRvcG9sb2dpY2FsT3JkZXJpbmcgPSBncmFwaGxpYi5hbGcudG9wc29ydChncmFwaClcblx0XHRsZXQgZm9yd2FyZEZ1bmN0aW9uID0gXCJcIlxuXG5cdFx0dG9wb2xvZ2ljYWxPcmRlcmluZy5tYXAobm9kZSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcIm11XCIsIG5vZGUpXG5cdFx0XHRsZXQgbiA9IGdyYXBoLm5vZGUobm9kZSlcblx0XHRcdGxldCBjaCA9IGdyYXBoLmNoaWxkcmVuKG5vZGUpXG5cblx0XHRcdGlmICghbikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKG4pXG5cblx0XHRcdGlmIChjaC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bGV0IGluTm9kZXMgPSBncmFwaC5pbkVkZ2VzKG5vZGUpLm1hcChlID0+IHRoaXMuc2FuaXRpemUoZS52KSlcblx0XHRcdFx0Zm9yd2FyZEZ1bmN0aW9uICs9IGAke3RoaXMuc2FuaXRpemUobm9kZSl9ID0gJHt0aGlzLm1hcFRvRnVuY3Rpb24obi5jbGFzcyl9KCR7aW5Ob2Rlcy5qb2luKFwiLCBcIil9KVxcbmBcblx0XHRcdH0gXG5cdFx0fSwgdGhpcylcblxuXHRcdGxldCBtb2R1bGVDb2RlID1cbmBjbGFzcyAke2NsYXNzbmFtZX0oVC5ubi5Nb2R1bGUpOlxuICAgIGRlZiBfX2luaXRfXyhzZWxmLCBwYXJhbTEsIHBhcmFtMik6ICMgcGFyYW1ldGVycyBoZXJlXG4gICAgICAgIHN1cGVyKCR7Y2xhc3NuYW1lfSwgc2VsZikuX19pbml0X18oKVxuICAgICAgICAjIGFsbCBkZWNsYXJhdGlvbnMgaGVyZVxuXG4gICAgZGVmIGZvcndhcmQoc2VsZiwgaW4xLCBpbjIpOiAjIGFsbCBJbnB1dHMgaGVyZVxuICAgICAgICAjIGFsbCBmdW5jdGlvbmFsIHN0dWZmIGhlcmVcbiR7dGhpcy5pbmRlbnQoZm9yd2FyZEZ1bmN0aW9uLCAyKX1cbiAgICAgICAgcmV0dXJuIChvdXQxLCBvdXQyKSAjIGFsbCBPdXRwdXRzIGhlcmVcbmBcblx0XHRyZXR1cm4gbW9kdWxlQ29kZVxuXHR9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQodGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbCxcbiAgICAgICAgICAgIHByZXZpb3VzVmlld0JveDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSBudWxsXG4gICAgICAgIHRoaXMucHJldmlvdXNWaWV3Qm94ID0gXCIwIDAgMCAwXCJcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlICE9PSBuZXh0U3RhdGUpXG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWRcIiwgbm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBub2RlLmlkXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGRvbU5vZGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnID0gdGhpcy5zdGF0ZS5ncmFwaDtcblxuICAgICAgICBjb25zdCBub2RlcyA9IGcubm9kZXMoKS5tYXAobm9kZU5hbWUgPT4ge1xuICAgICAgICAgICAgY29uc3QgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgY29uc3QgbiA9IGcubm9kZShub2RlTmFtZSk7XG4gICAgICAgICAgICBjb25zdCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogZ3JhcGguaGFuZGxlQ2xpY2suYmluZChncmFwaClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IFR5cGUgPSBudWxsXG5cbiAgICAgICAgICAgIGlmIChuLmlzTWV0YW5vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBpZiAobi5pc0Fub255bW91cykge1xuICAgICAgICAgICAgICAgICAgICBUeXBlID0gQW5vbnltb3VzTWV0YW5vZGVcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBUeXBlID0gTWV0YW5vZGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChuLnVzZXJHZW5lcmF0ZWRJZCkge1xuICAgICAgICAgICAgICAgICAgICBUeXBlID0gSWRlbnRpZmllZE5vZGVcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBUeXBlID0gQW5vbnltb3VzTm9kZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIDxUeXBlIHsuLi5wcm9wc30gLz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgZWRnZXMgPSBnLmVkZ2VzKCkubWFwKGVkZ2VOYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGUgPSBnLmVkZ2UoZWRnZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGdlIGtleT17YCR7ZWRnZU5hbWUudn0tPiR7ZWRnZU5hbWUud31gfSBlZGdlPXtlfS8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2aWV3Qm94X3dob2xlID0gYDAgMCAke2cuZ3JhcGgoKS53aWR0aH0gJHtnLmdyYXBoKCkuaGVpZ2h0fWA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHRyYW5zbGF0ZSgwcHgsMHB4KWAgKyBgc2NhbGUoJHtnLmdyYXBoKCkud2lkdGggLyBnLmdyYXBoKCkud2lkdGh9LCR7Zy5ncmFwaCgpLmhlaWdodCAvIGcuZ3JhcGgoKS5oZWlnaHR9KWA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHZhciB2aWV3Qm94XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICB2aWV3Qm94ID0gYCR7bi54IC0gbi53aWR0aCAvIDJ9ICR7bi55IC0gbi5oZWlnaHQgLyAyfSAke24ud2lkdGh9ICR7bi5oZWlnaHR9YFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld0JveCA9IHZpZXdCb3hfd2hvbGVcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnByZXZpb3VzVmlld0JveCA9IHZpZXdCb3ggfSwgMzAwKVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3ZnIGlkPVwidmlzdWFsaXphdGlvblwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCIgaGVpZ2h0PXtnLmdyYXBoKCkuaGVpZ2h0fSB3aWR0aD17Zy5ncmFwaCgpLndpZHRofT5cbiAgICAgICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhcInNyYy9idW5kbGUuY3NzXCIsIFwidXRmLThcIiwgKGVycikgPT4ge2NvbnNvbGUubG9nKGVycil9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt0aGlzLnByZXZpb3VzVmlld0JveH0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIlxuICAgICAgICAgICAgICAgICAgICBjYWxjTW9kZT1cInBhY2VkXCJcbiAgICAgICAgICAgICAgICA+PC9hbmltYXRlPlxuICAgICAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgICAgICA8bWFya2VyIGlkPVwiYXJyb3dcIiB2aWV3Qm94PVwiMCAwIDEwIDEwXCIgcmVmWD1cIjEwXCIgcmVmWT1cIjVcIiBtYXJrZXJVbml0cz1cInN0cm9rZVdpZHRoXCIgbWFya2VyV2lkdGg9XCIxMFwiIG1hcmtlckhlaWdodD1cIjcuNVwiIG9yaWVudD1cImF1dG9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDAgMCBMIDEwIDUgTCAwIDEwIEwgMyA1IHpcIiBjbGFzc05hbWU9XCJhcnJvd1wiPjwvcGF0aD5cbiAgICAgICAgICAgICAgICAgICAgPC9tYXJrZXI+XG4gICAgICAgICAgICAgICAgPC9kZWZzPlxuICAgICAgICAgICAgICAgIDxnIGlkPVwiZ3JhcGhcIj5cbiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9XCJub2Rlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge25vZGVzfVxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgICAgIDxnIGlkPVwiZWRnZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtlZGdlc31cbiAgICAgICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgRWRnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBsaW5lID0gZDMubGluZSgpXG4gICAgICAgIC5jdXJ2ZShkMy5jdXJ2ZUJhc2lzKVxuICAgICAgICAueChkID0+IGQueClcbiAgICAgICAgLnkoZCA9PiBkLnkpXG5cbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogW11cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IHRoaXMucHJvcHMuZWRnZS5wb2ludHNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW91bnQoZG9tTm9kZSkge1xuICAgICAgICBpZiAoZG9tTm9kZSkge1xuICAgICAgICAgICAgZG9tTm9kZS5iZWdpbkVsZW1lbnQoKSAgICBcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IGUgPSB0aGlzLnByb3BzLmVkZ2U7XG4gICAgICAgIGxldCBsID0gdGhpcy5saW5lO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPVwiZWRnZVwiIG1hcmtlckVuZD1cInVybCgjYXJyb3cpXCI+XG4gICAgICAgICAgICAgICAgPHBhdGggZD17bChlLnBvaW50cyl9PlxuICAgICAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnR9IGtleT17TWF0aC5yYW5kb20oKX0gcmVzdGFydD1cImFsd2F5c1wiIGZyb209e2wodGhpcy5zdGF0ZS5wcmV2aW91c1BvaW50cyl9IHRvPXtsKGUucG9pbnRzKX0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiIGF0dHJpYnV0ZU5hbWU9XCJkXCIgLz5cbiAgICAgICAgICAgICAgICA8L3BhdGg+XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBOb2RlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgaGFuZGxlQ2xpY2soKSB7XG4gICAgICAgIHRoaXMucHJvcHMub25DbGljayh0aGlzLnByb3BzLm5vZGUpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICBjb25zdCB0eXBlID0gbi5pc01ldGFub2RlID8gXCJtZXRhbm9kZVwiIDogXCJub2RlXCJcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGcgY2xhc3NOYW1lPXtgJHt0eXBlfSAke24uY2xhc3N9YH0gb25DbGljaz17dGhpcy5oYW5kbGVDbGljay5iaW5kKHRoaXMpfSB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHtNYXRoLmZsb29yKG4ueCAtKG4ud2lkdGgvMikpfSwke01hdGguZmxvb3Iobi55IC0obi5oZWlnaHQvMikpfSlgfT5cbiAgICAgICAgICAgICAgICA8cmVjdCB3aWR0aD17bi53aWR0aH0gaGVpZ2h0PXtuLmhlaWdodH0gcng9XCIxNXB4XCIgcnk9XCIxNXB4XCIgc3R5bGU9e24uc3R5bGV9IC8+XG4gICAgICAgICAgICAgICAge3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgICAgICAgICA8L2c+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBNZXRhbm9kZSBleHRlbmRzIE5vZGV7XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoMTAsMClgfSB0ZXh0QW5jaG9yPVwic3RhcnRcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNNZXRhbm9kZSBleHRlbmRzIE5vZGUge1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBBbm9ueW1vdXNOb2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
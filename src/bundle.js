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
				this.moniel.walkAst(result.ast);
				var graph = this.moniel.getComputationalGraph();
				var definitions = this.moniel.getMetanodesDefinitions
				//console.log(definitions)

				();this.setState({
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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pixelWidth = require('string-pixel-width'

// rename this to something suitable
);
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
			if (blockDefinition.body.definitions.length > 0) {
				this.graph.enterMetanodeScope(blockDefinition.name);
				this.walkAst(blockDefinition.body);
				this.graph.exitMetanodeScope();
			}
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

			var definitions = this.matchInstanceNameToDefinitions(instance.name.value
			// console.log(`Matched definitions:`, definitions);

			);if (definitions.length === 0) {
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

			var width = 20 + Math.max.apply(Math, _toConsumableArray([node.class, node.userGeneratedId ? node.userGeneratedId : ""].map(function (string) {
				return pixelWidth(string, { size: 16 });
			})));

			this.graph.createNode(node.id, _extends({}, node, {
				style: { fill: node.color },
				width: width
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
                    fs.readFileSync("src/bundle.css", "utf-8", function (err) {
                        console.log(err);
                    })
                ),
                React.createElement("animate", { ref: this.mount.bind(this), attributeName: "viewBox", from: viewBox_whole, to: viewBox, begin: "0s", dur: "0.25s", fill: "freeze", repeatCount: "1" }),
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9QeVRvcmNoR2VuZXJhdG9yLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7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YSxRQUFiLENBQXNCLFNBQVMsVUFBL0IsS0FBOEMsU0FBUyxJQUEzRCxFQUFpRTtBQUMvRDtBQUNELENBRkQsTUFFTztBQUNMLFNBQU8sZ0JBQVAsQ0FBd0Isa0JBQXhCLEVBQTRDLEdBQTVDLEVBQWlELEtBQWpEO0FBQ0QiLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgQ29sb3JIYXNoV3JhcHBlcntcbiAgICBjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoKHtcbiAgICAgICAgc2F0dXJhdGlvbjogWzAuOV0sXG4gICAgICAgIGxpZ2h0bmVzczogWzAuNDVdLFxuICAgICAgICBoYXNoOiB0aGlzLm1hZ2ljXG4gICAgfSlcblxuICAgIGxvc2VMb3NlKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoICs9IHN0ci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgbWFnaWMoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggPSBoYXNoICogNDcgKyBzdHIuY2hhckNvZGVBdChpKSAlIDMyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBoYXNoXG4gICAgfVxuXG4gICAgaGV4KHN0cikge1xuICAgICAgICByZXR1cm4gdGhpcy5jb2xvckhhc2guaGV4KHN0cilcbiAgICB9XG59IiwiY2xhc3MgQ29tcHV0YXRpb25hbEdyYXBoe1xuXHRub2RlQ291bnRlciA9IHt9XG5cdF9ub2RlU3RhY2sgPSBbXVxuXHRfcHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXG5cdHNjb3BlU3RhY2sgPSBuZXcgU2NvcGVTdGFjaygpXG5cblx0bWV0YW5vZGVzID0ge31cblx0bWV0YW5vZGVTdGFjayA9IFtdXG5cblx0Z2V0IGdyYXBoKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tsYXN0SW5kZXhdO1xuXHR9XG5cblx0Z2V0IG5vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fbm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBub2RlU3RhY2sodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRnZXQgcHJldmlvdXNOb2RlU3RhY2soKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF1cblx0fVxuXG5cdHNldCBwcmV2aW91c05vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX3ByZXZpb3VzTm9kZVN0YWNrW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Y29uc3RydWN0b3IocGFyZW50KSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5tb25pZWwgPSBwYXJlbnQ7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMubm9kZUNvdW50ZXIgPSB7fVxuXHRcdHRoaXMuc2NvcGVTdGFjay5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5jbGVhck5vZGVTdGFjaygpXG5cblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdXG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0XHR0aGlzLm1ldGFub2RlcyA9IHt9XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrID0gW11cblxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGVzOlwiLCB0aGlzLm1ldGFub2Rlcylcblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlIFN0YWNrOlwiLCB0aGlzLm1ldGFub2RlU3RhY2spXG5cbiAgICAgICAgdGhpcy5hZGRNYWluKCk7XG5cdH1cblxuXHRlbnRlck1ldGFub2RlU2NvcGUobmFtZSkge1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0uc2V0R3JhcGgoe1xuXHRcdFx0bmFtZTogbmFtZSxcblx0ICAgICAgICByYW5rZGlyOiAnQlQnLFxuXHQgICAgICAgIGVkZ2VzZXA6IDIwLFxuXHQgICAgICAgIHJhbmtzZXA6IDQwLFxuXHQgICAgICAgIG5vZGVTZXA6IDMwLFxuXHQgICAgICAgIG1hcmdpbng6IDIwLFxuXHQgICAgICAgIG1hcmdpbnk6IDIwLFxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVTdGFjay5wdXNoKG5hbWUpO1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMubWV0YW5vZGVTdGFjaylcblxuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1tuYW1lXTtcblx0fVxuXG5cdGV4aXRNZXRhbm9kZVNjb3BlKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2RlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRnZW5lcmF0ZUluc3RhbmNlSWQodHlwZSkge1xuXHRcdGlmICghdGhpcy5ub2RlQ291bnRlci5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuXHRcdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSA9IDA7XG5cdFx0fVxuXHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gKz0gMTtcblx0XHRsZXQgaWQgPSBcImFfXCIgKyB0eXBlICsgdGhpcy5ub2RlQ291bnRlclt0eXBlXTtcblx0XHRyZXR1cm4gaWQ7XG5cdH1cblxuXHRhZGRNYWluKCkge1xuXHRcdHRoaXMuZW50ZXJNZXRhbm9kZVNjb3BlKFwibWFpblwiKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiXCJcblx0XHR9KTtcblx0fVxuXG5cdHRvdWNoTm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKGBUb3VjaGluZyBub2RlIFwiJHtub2RlUGF0aH1cIi5gKVxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLm5vZGVTdGFjay5wdXNoKG5vZGVQYXRoKVxuXG5cdFx0XHRpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2tbMF0sIG5vZGVQYXRoKVxuXHRcdFx0fSBlbHNlIGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0dGhpcy5zZXRFZGdlKHRoaXMucHJldmlvdXNOb2RlU3RhY2ssIG5vZGVQYXRoKVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFRyeWluZyB0byB0b3VjaCBub24tZXhpc3RhbnQgbm9kZSBcIiR7bm9kZVBhdGh9XCJgKTtcblx0XHR9XG5cdH1cblxuXHRyZWZlcmVuY2VOb2RlKGlkKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogaWQsXG5cdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIixcblx0XHRcdGhlaWdodDogNTBcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHR3aWR0aDogTWF0aC5tYXgobm9kZS5jbGFzcy5sZW5ndGgsIG5vZGUudXNlckdlbmVyYXRlZElkID8gbm9kZS51c2VyR2VuZXJhdGVkSWQubGVuZ3RoIDogMCkgKiAxMFxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0Y29uc29sZS53YXJuKGBSZWRlZmluaW5nIG5vZGUgXCIke2lkfVwiYCk7XHRcblx0XHR9XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGhcblx0XHR9KTtcblx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHJldHVybiBub2RlUGF0aDtcblx0fVxuXG5cdGNyZWF0ZU1ldGFub2RlKGlkZW50aWZpZXIsIG1ldGFub2RlQ2xhc3MsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZGVudGlmaWVyKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXHRcdFxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aCxcblx0XHRcdGlzTWV0YW5vZGU6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHRsZXQgdGFyZ2V0TWV0YW5vZGUgPSB0aGlzLm1ldGFub2Rlc1ttZXRhbm9kZUNsYXNzXTtcblx0XHR0YXJnZXRNZXRhbm9kZS5ub2RlcygpLmZvckVhY2gobm9kZUlkID0+IHtcblx0XHRcdGxldCBub2RlID0gdGFyZ2V0TWV0YW5vZGUubm9kZShub2RlSWQpO1xuXHRcdFx0aWYgKCFub2RlKSB7IHJldHVybiB9XG5cdFx0XHRsZXQgbmV3Tm9kZUlkID0gbm9kZUlkLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHZhciBuZXdOb2RlID0ge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRpZDogbmV3Tm9kZUlkXG5cdFx0XHR9XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobmV3Tm9kZUlkLCBuZXdOb2RlKTtcblxuXHRcdFx0bGV0IG5ld1BhcmVudCA9IHRhcmdldE1ldGFub2RlLnBhcmVudChub2RlSWQpLnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0UGFyZW50KG5ld05vZGVJZCwgbmV3UGFyZW50KTtcblx0XHR9KTtcblxuXHRcdHRhcmdldE1ldGFub2RlLmVkZ2VzKCkuZm9yRWFjaChlZGdlID0+IHtcblx0XHRcdGNvbnN0IGUgPSB0YXJnZXRNZXRhbm9kZS5lZGdlKGVkZ2UpXG5cdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2UoZWRnZS52LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwgZWRnZS53LnJlcGxhY2UoXCIuXCIsIG5vZGVQYXRoKSwge30pO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Y2xlYXJOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFsuLi50aGlzLm5vZGVTdGFja107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdHNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5zZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKTtcblx0fVxuXG5cdGlzSW5wdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJJbnB1dFwiO1xuXHR9XG5cblx0aXNPdXRwdXQobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5jbGFzcyA9PT0gXCJPdXRwdXRcIjtcblx0fVxuXG5cdGlzTWV0YW5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhcImlzTWV0YW5vZGU6XCIsIG5vZGVQYXRoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmlzTWV0YW5vZGUgPT09IHRydWU7XG5cdH1cblxuXHRnZXRPdXRwdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgb3V0cHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc091dHB1dChub2RlKSB9KTtcblxuXHRcdGlmIChvdXRwdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBPdXRwdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gbnVsbDtcdFxuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXROb2Rlcztcblx0fVxuXG5cdGdldElucHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IGlucHV0Tm9kZXMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc0lucHV0KG5vZGUpfSk7XG5cblx0XHRpZiAoaW5wdXROb2Rlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBNZXRhbm9kZSBcIiR7c2NvcGUuaWR9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2Rlcy5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBpbnB1dE5vZGVzO1xuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblx0XHR2YXIgc291cmNlUGF0aHNcblxuXHRcdGlmICh0eXBlb2YgZnJvbVBhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gdGhpcy5nZXRPdXRwdXROb2Rlcyhmcm9tUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzID0gW2Zyb21QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShmcm9tUGF0aCkpIHtcblx0XHRcdHNvdXJjZVBhdGhzID0gZnJvbVBhdGhcblx0XHR9XG5cblx0XHR2YXIgdGFyZ2V0UGF0aHNcblxuXHRcdGlmICh0eXBlb2YgdG9QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKHRvUGF0aCkpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSB0aGlzLmdldElucHV0Tm9kZXModG9QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMgPSBbdG9QYXRoXVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSh0b1BhdGgpKSB7XG5cdFx0XHR0YXJnZXRQYXRocyA9IHRvUGF0aFxuXHRcdH1cblxuXHRcdHRoaXMuc2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocylcblx0fVxuXG5cdHNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpIHtcblxuXHRcdGlmIChzb3VyY2VQYXRocyA9PT0gbnVsbCB8fCB0YXJnZXRQYXRocyA9PT0gbnVsbCkge1xuXHRcdFx0cmV0dXJuXG5cdFx0fVxuXG5cdFx0aWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gdGFyZ2V0UGF0aHMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzb3VyY2VQYXRoc1tpXSAmJiB0YXJnZXRQYXRoc1tpXSkge1xuXHRcdFx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShzb3VyY2VQYXRoc1tpXSwgdGFyZ2V0UGF0aHNbaV0sIHt9KTtcdFxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0YXJnZXRQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0c291cmNlUGF0aHMuZm9yRWFjaChzb3VyY2VQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoLCB0YXJnZXRQYXRoc1swXSkpXG5cdFx0XHR9IGVsc2UgaWYgKHNvdXJjZVBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocy5mb3JFYWNoKHRhcmdldFBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGhzWzBdLCB0YXJnZXRQYXRoLCkpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdG1lc3NhZ2U6IGBOdW1iZXIgb2Ygbm9kZXMgZG9lcyBub3QgbWF0Y2guIFske3NvdXJjZVBhdGhzLmxlbmd0aH1dIC0+IFske3RhcmdldFBhdGhzLmxlbmd0aH1dYCxcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdC8vIHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0XHQvLyBlbmQ6ICBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0fVxuXG5cdGhhc05vZGUobm9kZVBhdGgpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGdldEdyYXBoKCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKHRoaXMuZ3JhcGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzXG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5vbkNoYW5nZSkge1xuICAgICAgICAgICAgdmFyIG5ld1ZhbHVlID0gdGhpcy5lZGl0b3IuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIHRoaXMucHJvcHMub25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaW5pdChlbGVtZW50KSB7XG4gICAgICAgIHRoaXMuY29udGFpbmVyID0gZWxlbWVudDtcbiAgICB9XG5cbiAgICBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh2YWx1ZSwgLTEpO1xuICAgIH1cblxuICAgIHJlbW92ZU1hcmtlcnMoKSB7XG4gICAgICAgIHRoaXMubWFya2Vycy5tYXAobWFya2VyID0+IHRoaXMuZWRpdG9yLnNlc3Npb24ucmVtb3ZlTWFya2VyKG1hcmtlcikpO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkN1cnNvclBvc2l0aW9uQ2hhbmdlZChldmVudCwgc2VsZWN0aW9uKSB7XG4gICAgICAgIGxldCBtID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5nZXRNYXJrZXJzKCk7XG4gICAgICAgIGxldCBjID0gc2VsZWN0aW9uLmdldEN1cnNvcigpO1xuICAgICAgICBsZXQgbWFya2VycyA9IHRoaXMubWFya2Vycy5tYXAoaWQgPT4gbVtpZF0pO1xuICAgICAgICBsZXQgY3Vyc29yT3Zlck1hcmtlciA9IG1hcmtlcnMubWFwKG1hcmtlciA9PiBtYXJrZXIucmFuZ2UuY29udGFpbnMoYy5yb3csIGMuY29sdW1uKSkucmVkdWNlKCAocHJldiwgY3VycikgPT4gcHJldiB8fCBjdXJyLCBmYWxzZSk7XG5cbiAgICAgICAgaWYgKGN1cnNvck92ZXJNYXJrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgICAgICB0aGlzLmVkaXRvciA9IGFjZS5lZGl0KHRoaXMuY29udGFpbmVyKTtcbiAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnNldE1vZGUoXCJhY2UvbW9kZS9cIiArIHRoaXMucHJvcHMubW9kZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFRoZW1lKFwiYWNlL3RoZW1lL1wiICsgdGhpcy5wcm9wcy50aGVtZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFNob3dQcmludE1hcmdpbihmYWxzZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgICAgICAgICAgZW5hYmxlQmFzaWNBdXRvY29tcGxldGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZVNuaXBwZXRzOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIHdyYXA6IHRydWUsXG4gICAgICAgICAgICBhdXRvU2Nyb2xsRWRpdG9ySW50b1ZpZXc6IHRydWUsXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIkZpcmEgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG4gICAgICAgIHRoaXMuZWRpdG9yLmNvbnRhaW5lci5zdHlsZS5saW5lSGVpZ2h0ID0gMS43O1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSl7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZSh0aGlzLnByb3BzLmRlZmF1bHRWYWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lZGl0b3Iub24oXCJjaGFuZ2VcIiwgdGhpcy5vbkNoYW5nZSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNlbGVjdGlvbi5vbihcImNoYW5nZUN1cnNvclwiLCB0aGlzLm9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuaXNzdWVzKSB7XG4gICAgICAgICAgICB2YXIgYW5ub3RhdGlvbnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KTtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICByb3c6IHBvc2l0aW9uLnJvdyxcbiAgICAgICAgICAgICAgICAgICAgY29sdW1uOiBwb3NpdGlvbi5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGlzc3VlLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGlzc3VlLnR5cGVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICAvL3RoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcblxuICAgICAgICAgICAgdmFyIFJhbmdlID0gcmVxdWlyZSgnYWNlL3JhbmdlJykuUmFuZ2U7XG5cbiAgICAgICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgICAgICB2YXIgbWFya2VycyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0OiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpLFxuICAgICAgICAgICAgICAgICAgICBlbmQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5lbmQpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbGV0IHJhbmdlID0gbmV3IFJhbmdlKHBvc2l0aW9uLnN0YXJ0LnJvdywgcG9zaXRpb24uc3RhcnQuY29sdW1uLCBwb3NpdGlvbi5lbmQucm93LCBwb3NpdGlvbi5lbmQuY29sdW1uKTtcblxuICAgICAgICAgICAgICAgIHRoaXMubWFya2Vycy5wdXNoKHRoaXMuZWRpdG9yLnNlc3Npb24uYWRkTWFya2VyKHJhbmdlLCBcIm1hcmtlcl9lcnJvclwiLCBcInRleHRcIikpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICByZXR1cm4gPGRpdiByZWY9eyAoZWxlbWVudCkgPT4gdGhpcy5pbml0KGVsZW1lbnQpIH0+PC9kaXY+O1xuICAgIH1cbn0iLCJjbGFzcyBHcmFwaExheW91dHtcblx0YWN0aXZlV29ya2VycyA9IHt9XG5cdGN1cnJlbnRXb3JrZXJJZCA9IDBcblx0bGFzdEZpbmlzaGVkV29ya2VySWQgPSAwXG5cdGNhbGxiYWNrID0gZnVuY3Rpb24oKXt9XG5cblx0Y29uc3RydWN0b3IoY2FsbGJhY2spIHtcblx0XHR0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcblx0fVxuXG5cdGxheW91dChncmFwaCkge1xuXHRcdGNvbnN0IGlkID0gdGhpcy5nZXRXb3JrZXJJZCgpXG5cdFx0dGhpcy5hY3RpdmVXb3JrZXJzW2lkXSA9IG5ldyBMYXlvdXRXb3JrZXIoaWQsIGdyYXBoLCB0aGlzLndvcmtlckZpbmlzaGVkLmJpbmQodGhpcykpXG5cdH1cblxuXHR3b3JrZXJGaW5pc2hlZCh7aWQsIGdyYXBofSkge1xuXHRcdGlmIChpZCA+PSB0aGlzLmxhc3RGaW5pc2hlZFdvcmtlcklkKSB7XG5cdFx0XHR0aGlzLmxhc3RGaW5pc2hlZFdvcmtlcklkID0gaWRcblx0XHRcdHRoaXMuY2FsbGJhY2soZ3JhcGgpXG5cdFx0fVxuXHR9XG5cblx0Z2V0V29ya2VySWQoKSB7XG5cdFx0dGhpcy5jdXJyZW50V29ya2VySWQgKz0gMVxuXHRcdHJldHVybiB0aGlzLmN1cnJlbnRXb3JrZXJJZFxuXHR9XG59XG5cbmNsYXNzIExheW91dFdvcmtlcntcblx0aWQgPSAwXG5cdHdvcmtlciA9IG51bGxcblx0Y29uc3RydWN0b3IoaWQsIGdyYXBoLCBvbkZpbmlzaGVkKSB7XG5cdFx0dGhpcy5pZCA9IGlkXG5cdFx0dGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKFwic3JjL3NjcmlwdHMvR3JhcGhMYXlvdXRXb3JrZXIuanNcIilcblx0XHR0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCB0aGlzLnJlY2VpdmUuYmluZCh0aGlzKSlcblx0XHR0aGlzLm9uRmluaXNoZWQgPSBvbkZpbmlzaGVkXG5cdFx0XG5cdFx0dGhpcy53b3JrZXIucG9zdE1lc3NhZ2UodGhpcy5lbmNvZGUoZ3JhcGgpKVxuXHR9XG5cdHJlY2VpdmUobWVzc2FnZSkge1xuXHRcdHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpXG5cdFx0dGhpcy5vbkZpbmlzaGVkKHtcblx0XHRcdGlkOiB0aGlzLmlkLFxuXHRcdFx0Z3JhcGg6IHRoaXMuZGVjb2RlKG1lc3NhZ2UuZGF0YSlcblx0XHR9KVxuXHR9XG5cdGVuY29kZShncmFwaCkge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLndyaXRlKGdyYXBoKVxuICAgIH1cblxuICAgIGRlY29kZShqc29uKSB7XG5cdFx0cmV0dXJuIGdyYXBobGliLmpzb24ucmVhZChqc29uKVxuICAgIH1cbn0iLCJjb25zdCBpcGMgPSByZXF1aXJlKFwiZWxlY3Ryb25cIikuaXBjUmVuZGVyZXJcbmNvbnN0IGZzID0gcmVxdWlyZShcImZzXCIpXG5cbmNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblx0cGFyc2VyID0gbmV3IFBhcnNlcigpXG5cdG1vbmllbCA9IG5ldyBNb25pZWwoKVxuXHRnZW5lcmF0b3IgPSBuZXcgUHlUb3JjaEdlbmVyYXRvcigpXG5cblx0bG9jayA9IG51bGxcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMuc3RhdGUgPSB7XG5cdFx0XHQvLyB0aGVzZSBhcmUgbm8gbG9uZ2VyIG5lZWRlZCBoZXJlXG5cdFx0XHQvLyBcImdyYW1tYXJcIjogdGhpcy5wYXJzZXIuZ3JhbW1hcixcblx0XHRcdC8vIFwic2VtYW50aWNzXCI6IHRoaXMucGFyc2VyLnNlbWFudGljcyxcblx0XHRcdFwibmV0d29ya0RlZmluaXRpb25cIjogXCJcIixcblx0XHRcdFwiYXN0XCI6IG51bGwsXG5cdFx0XHRcImlzc3Vlc1wiOiBudWxsLFxuXHRcdFx0XCJsYXlvdXRcIjogXCJjb2x1bW5zXCIsXG5cdFx0XHRcImdlbmVyYXRlZENvZGVcIjogXCJcIlxuXHRcdH07XG5cblx0XHRpcGMub24oJ3NhdmUnLCBmdW5jdGlvbihldmVudCwgbWVzc2FnZSkge1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLm1vblwiLCB0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9uLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UuYXN0Lmpzb25cIiwgSlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9ncmFwaC5zdmdcIiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcInN2Z1wiKS5vdXRlckhUTUwsIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2dyYXBoLmpzb25cIiwgSlNPTi5zdHJpbmdpZnkoZGFncmUuZ3JhcGhsaWIuanNvbi53cml0ZSh0aGlzLnN0YXRlLmdyYXBoKSwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2hhbGYtYXNzZWRfam9rZS5weVwiLCB0aGlzLnN0YXRlLmdlbmVyYXRlZENvZGUsIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblxuXHRcdFx0bGV0IHNhdmVOb3RpZmljYXRpb24gPSBuZXcgTm90aWZpY2F0aW9uKCdTa2V0Y2ggc2F2ZWQnLCB7XG4gICAgICAgICAgICBcdGJvZHk6IGBTa2V0Y2ggd2FzIHN1Y2Nlc3NmdWxseSBzYXZlZCBpbiB0aGUgXCJza2V0Y2hlc1wiIGZvbGRlci5gLFxuXHRcdFx0XHRzaWxlbnQ6IHRydWVcbiAgICAgICAgICAgIH0pXG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuXHRcdGlwYy5vbihcInRvZ2dsZUxheW91dFwiLCAoZSwgbSkgPT4ge1xuXHRcdFx0dGhpcy50b2dnbGVMYXlvdXQoKVxuXHRcdH0pO1xuXG5cdFx0aXBjLm9uKFwib3BlblwiLCAoZSwgbSkgPT4ge1xuXHRcdFx0dGhpcy5vcGVuRmlsZShtLmZpbGVQYXRoKVxuXHRcdH0pXG5cblx0XHRsZXQgbGF5b3V0ID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibGF5b3V0XCIpXG5cdFx0aWYgKGxheW91dCkge1xuXHRcdFx0aWYgKGxheW91dCA9PSBcImNvbHVtbnNcIiB8fCBsYXlvdXQgPT0gXCJyb3dzXCIpIHtcblx0XHRcdFx0dGhpcy5zdGF0ZS5sYXlvdXQgPSBsYXlvdXRcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0dHlwZTogXCJ3YXJuaW5nXCIsXG5cdFx0XHRcdFx0bWVzc2FnZTogYFZhbHVlIGZvciBcImxheW91dFwiIGNhbiBiZSBvbmx5IFwiY29sdW1uc1wiIG9yIFwicm93c1wiLmBcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdH1cblxuXHRvcGVuRmlsZShmaWxlUGF0aCkge1xuXHRcdGNvbnNvbGUubG9nKFwib3BlbkZpbGVcIiwgZmlsZVBhdGgpXG5cdFx0bGV0IGZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGZpbGVQYXRoLCBcInV0ZjhcIilcblx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZShmaWxlQ29udGVudCkgLy8gdGhpcyBoYXMgdG8gYmUgaGVyZSwgSSBkb24ndCBrbm93IHdoeVxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bmV0d29ya0RlZmluaXRpb246IGZpbGVDb250ZW50XG5cdFx0fSlcblx0fVxuXG5cdGxvYWRFeGFtcGxlKGlkKSB7XG5cdFx0bGV0IGZpbGVDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGAuL2V4YW1wbGVzLyR7aWR9Lm1vbmAsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIkNvbnZvbHV0aW9uYWxMYXllclwiKVxuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMTAwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5wYXJzZXIubWFrZSh2YWx1ZSlcblxuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpXG5cdFx0XHRsZXQgZ3JhcGggPSB0aGlzLm1vbmllbC5nZXRDb21wdXRhdGlvbmFsR3JhcGgoKVxuXHRcdFx0bGV0IGRlZmluaXRpb25zID0gdGhpcy5tb25pZWwuZ2V0TWV0YW5vZGVzRGVmaW5pdGlvbnMoKVxuXHRcdFx0Ly9jb25zb2xlLmxvZyhkZWZpbml0aW9ucylcblxuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiByZXN1bHQuYXN0LFxuXHRcdFx0XHRncmFwaDogZ3JhcGgsXG5cdFx0XHRcdGdlbmVyYXRlZENvZGU6IHRoaXMuZ2VuZXJhdG9yLmdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpLFxuXHRcdFx0XHRpc3N1ZXM6IHRoaXMubW9uaWVsLmdldElzc3VlcygpXG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gY29uc29sZS5lcnJvcihyZXN1bHQpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZSxcblx0XHRcdFx0YXN0OiBudWxsLFxuXHRcdFx0XHRncmFwaDogbnVsbCxcblx0XHRcdFx0aXNzdWVzOiBbe1xuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRzdGFydDogcmVzdWx0LnBvc2l0aW9uIC0gMSxcblx0XHRcdFx0XHRcdGVuZDogcmVzdWx0LnBvc2l0aW9uXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtZXNzYWdlOiBcIkV4cGVjdGVkIFwiICsgcmVzdWx0LmV4cGVjdGVkICsgXCIuXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiXG5cdFx0XHRcdH1dXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc29sZS50aW1lRW5kKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdH1cblxuXHR0b2dnbGVMYXlvdXQoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRsYXlvdXQ6ICh0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIpID8gXCJyb3dzXCIgOiBcImNvbHVtbnNcIlxuXHRcdH0pXG5cdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR3aW5kb3cuZGlzcGF0Y2hFdmVudChuZXcgRXZlbnQoXCJyZXNpemVcIikpXG5cdFx0fSwgMTAwKVxuXHR9XG5cblx0cmVuZGVyKCkge1xuXHRcdGxldCBjb250YWluZXJMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dFxuXHRcdGxldCBncmFwaExheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIiA/IFwiQlRcIiA6IFwiTFJcIlxuXG4gICAgXHRyZXR1cm4gPGRpdiBpZD1cImNvbnRhaW5lclwiIGNsYXNzTmFtZT17YGNvbnRhaW5lciAke2NvbnRhaW5lckxheW91dH1gfT5cbiAgICBcdFx0PFBhbmVsIGlkPVwiZGVmaW5pdGlvblwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdHJlZj17KHJlZikgPT4gdGhpcy5lZGl0b3IgPSByZWZ9XG4gICAgXHRcdFx0XHRtb2RlPVwibW9uaWVsXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHRpc3N1ZXM9e3RoaXMuc3RhdGUuaXNzdWVzfVxuICAgIFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0ZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHRcdFxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJ2aXN1YWxpemF0aW9uXCI+XG4gICAgXHRcdFx0PFZpc3VhbEdyYXBoIGdyYXBoPXt0aGlzLnN0YXRlLmdyYXBofSBsYXlvdXQ9e2dyYXBoTGF5b3V0fSAvPlxuICAgIFx0XHQ8L1BhbmVsPlxuXG5cdFx0XHR7Lypcblx0XHRcdDxQYW5lbCB0aXRsZT1cIkdlbmVyYXRlZCBDb2RlXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cInB5dGhvblwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0dmFsdWU9e3RoaXMuc3RhdGUuZ2VuZXJhdGVkQ29kZX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuXHRcdFx0Ki99XG5cbiAgICBcdFx0ey8qXG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIkFTVFwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJqc29uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17SlNPTi5zdHJpbmdpZnkodGhpcy5zdGF0ZS5hc3QsIG51bGwsIDIpfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG4gICAgXHQqL31cbiAgICBcdFx0XG4gICAgXHQ8L2Rpdj47XG4gIFx0fVxufSIsImNsYXNzIExvZ2dlcntcblx0aXNzdWVzID0gW11cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLmlzc3VlcyA9IFtdO1xuXHR9XG5cdFxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuaXNzdWVzO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR2YXIgZiA9IG51bGw7XG5cdFx0c3dpdGNoKGlzc3VlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJlcnJvclwiOiBmID0gY29uc29sZS5lcnJvcjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwid2FybmluZ1wiOiBmID0gY29uc29sZS53YXJuOyBicmVhaztcblx0XHRcdGNhc2UgXCJpbmZvXCI6IGYgPSBjb25zb2xlLmluZm87IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogZiA9IGNvbnNvbGUubG9nOyBicmVhaztcblx0XHR9XG5cdFx0Zihpc3N1ZS5tZXNzYWdlKTtcblx0XHR0aGlzLmlzc3Vlcy5wdXNoKGlzc3VlKTtcblx0fVxufSIsImNvbnN0IHBpeGVsV2lkdGggPSByZXF1aXJlKCdzdHJpbmctcGl4ZWwtd2lkdGgnKVxuXG4vLyByZW5hbWUgdGhpcyB0byBzb21ldGhpbmcgc3VpdGFibGVcbmNsYXNzIE1vbmllbHtcblx0Ly8gbWF5YmUgc2luZ2xldG9uP1xuXHRsb2dnZXIgPSBuZXcgTG9nZ2VyKClcblx0Z3JhcGggPSBuZXcgQ29tcHV0YXRpb25hbEdyYXBoKHRoaXMpXG5cblx0Ly8gdG9vIHNvb24sIHNob3VsZCBiZSBpbiBWaXN1YWxHcmFwaFxuXHRjb2xvckhhc2ggPSBuZXcgQ29sb3JIYXNoV3JhcHBlcigpXG5cblx0ZGVmaW5pdGlvbnMgPSB7fTtcblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ncmFwaC5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5sb2dnZXIuY2xlYXIoKTtcblxuXHRcdHRoaXMuZGVmaW5pdGlvbnMgPSBbXTtcblx0XHR0aGlzLmFkZERlZmF1bHREZWZpbml0aW9ucygpO1xuXHR9XG5cblx0YWRkRGVmYXVsdERlZmluaXRpb25zKCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIGRlZmF1bHQgZGVmaW5pdGlvbnMuYCk7XG5cdFx0Y29uc3QgZGVmYXVsdERlZmluaXRpb25zID0gW1wiQWRkXCIsIFwiTGluZWFyXCIsIFwiSW5wdXRcIiwgXCJPdXRwdXRcIiwgXCJQbGFjZWhvbGRlclwiLCBcIlZhcmlhYmxlXCIsIFwiQ29uc3RhbnRcIiwgXCJNdWx0aXBseVwiLCBcIkNvbnZvbHV0aW9uXCIsIFwiRGVuc2VcIiwgXCJNYXhQb29saW5nXCIsIFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIsIFwiRGVjb252b2x1dGlvblwiLCBcIkF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlTWF4UG9vbGluZ1wiLCBcIk1heFVucG9vbGluZ1wiLCBcIkxvY2FsUmVzcG9uc2VOb3JtYWxpemF0aW9uXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGhhbmRsZUlubGluZUJsb2NrRGVmaW5pdGlvbihzY29wZSkge1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKHNjb3BlLm5hbWUudmFsdWUpXG5cdFx0dGhpcy53YWxrQXN0KHNjb3BlLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKHNjb3BlLm5hbWUudmFsdWUsIHNjb3BlLm5hbWUudmFsdWUsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGlkOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0Y2xhc3M6IFwiXCIsXG5cdFx0XHRfc291cmNlOiBzY29wZS5fc291cmNlXG5cdFx0fSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uKcKge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIFwiJHtibG9ja0RlZmluaXRpb24ubmFtZX1cIiB0byBhdmFpbGFibGUgZGVmaW5pdGlvbnMuYCk7XG5cdFx0dGhpcy5hZGREZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHRpZiAoYmxvY2tEZWZpbml0aW9uLmJvZHkuZGVmaW5pdGlvbnMubGVuZ3RoID4gMCkge1xuXHRcdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdFx0dGhpcy53YWxrQXN0KGJsb2NrRGVmaW5pdGlvbi5ib2R5KTtcblx0XHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0XHR9XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KGRlZmluaXRpb25Cb2R5KSB7XG5cdFx0ZGVmaW5pdGlvbkJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihuZXR3b3JrKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0bmV0d29yay5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKGNvbm5lY3Rpb24pIHtcblx0XHR0aGlzLmdyYXBoLmNsZWFyTm9kZVN0YWNrKCk7XG5cdFx0Ly8gY29uc29sZS5sb2coY29ubmVjdGlvbi5saXN0KVxuXHRcdGNvbm5lY3Rpb24ubGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5mcmVlemVOb2RlU3RhY2soKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGl0ZW0pXG5cdFx0XHR0aGlzLndhbGtBc3QoaXRlbSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyB0aGlzIGlzIGRvaW5nIHRvbyBtdWNoIOKAkyBicmVhayBpbnRvIFwibm90IHJlY29nbml6ZWRcIiwgXCJzdWNjZXNzXCIgYW5kIFwiYW1iaWd1b3VzXCJcblx0aGFuZGxlQmxvY2tJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0aWQ6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzOiBcIlVua25vd25cIixcblx0XHRcdGNvbG9yOiBcImRhcmtncmV5XCIsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0d2lkdGg6IDEwMCxcblxuXHRcdFx0X3NvdXJjZTogaW5zdGFuY2UsXG5cdFx0fTtcblxuXHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKGluc3RhbmNlLm5hbWUudmFsdWUpXG5cdFx0Ly8gY29uc29sZS5sb2coYE1hdGNoZWQgZGVmaW5pdGlvbnM6YCwgZGVmaW5pdGlvbnMpO1xuXG5cdFx0aWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG4gICAgICAgICAgICBub2RlLmlzVW5kZWZpbmVkID0gdHJ1ZVxuXG4gICAgICAgICAgICB0aGlzLmFkZElzc3VlKHtcbiAgICAgICAgICAgIFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3I7XG5cdFx0XHRcdG5vZGUuY2xhc3MgPSBkZWZpbml0aW9uLm5hbWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gYFwiJHtkZWYubmFtZX1cImApLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5hbGlhcykge1xuXHRcdFx0bm9kZS5pZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKG5vZGUuY2xhc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmlkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLnVzZXJHZW5lcmF0ZWRJZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS5oZWlnaHQgPSA1MDtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdHZhciBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpO1xuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMTtcblx0XHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUobm9kZS5pZCwgbm9kZS5jbGFzcywge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZToge1wiZmlsbFwiOiBjb2xvci50b1N0cmluZygpfVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgd2lkdGggPSAyMCArIE1hdGgubWF4KC4uLltub2RlLmNsYXNzLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkIDogXCJcIl0ubWFwKHN0cmluZyA9PiBwaXhlbFdpZHRoKHN0cmluZywge3NpemU6IDE2fSkpKVxuXG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVOb2RlKG5vZGUuaWQsIHtcblx0XHRcdC4uLm5vZGUsXG4gICAgICAgICAgICBzdHlsZToge2ZpbGw6IG5vZGUuY29sb3J9LFxuXHRcdFx0d2lkdGhcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdG1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhxdWVyeSkge1xuXHRcdHZhciBkZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmaW5pdGlvbnMpO1xuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IE1vbmllbC5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpO1xuXHRcdC8vY29uc29sZS5sb2coXCJGb3VuZCBrZXlzXCIsIGRlZmluaXRpb25LZXlzKTtcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pO1xuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnM7XG5cdH1cblxuXHRnZXRDb21wdXRhdGlvbmFsR3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguZ2V0R3JhcGgoKTtcblx0fVxuXG5cdGdldE1ldGFub2Rlc0RlZmluaXRpb25zKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldE1ldGFub2RlcygpXG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklubGluZUJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUlubGluZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIjogdGhpcy5oYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tJbnN0YW5jZVwiOiB0aGlzLmhhbmRsZUJsb2NrSW5zdGFuY2Uobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrTGlzdFwiOiB0aGlzLmhhbmRsZUJsb2NrTGlzdChub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSWRlbnRpZmllclwiOiB0aGlzLmhhbmRsZUlkZW50aWZpZXIobm9kZSk7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhpcy5oYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpO1xuXHRcdH1cblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuY29uc3Qgb2htID0gcmVxdWlyZShcIm9obS1qc1wiKVxuXG5jbGFzcyBQYXJzZXJ7XG5cdGNvbnRlbnRzID0gbnVsbFxuXHRncmFtbWFyID0gbnVsbFxuXHRcblx0ZXZhbE9wZXJhdGlvbiA9IHtcblx0XHROZXR3b3JrOiBmdW5jdGlvbihkZWZpbml0aW9ucykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJOZXR3b3JrXCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvbjogZnVuY3Rpb24oXywgbGF5ZXJOYW1lLCBwYXJhbXMsIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uXCIsXG5cdFx0XHRcdG5hbWU6IGxheWVyTmFtZS5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRJbmxpbmVCbG9ja0RlZmluaXRpb246IGZ1bmN0aW9uKG5hbWUsIF8sIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSW5saW5lQmxvY2tEZWZpbml0aW9uXCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUuZXZhbCgpLFxuXHRcdFx0XHRib2R5OiBib2R5LmV2YWwoKSxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZUJsb2NrRGVmaW5pdGlvbkJvZHk6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBsaXN0LmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25Cb2R5XCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucyA/IGRlZmluaXRpb25zIDogW11cblx0XHRcdH1cblx0XHR9LFxuXHRcdENvbm5lY3Rpb25EZWZpbml0aW9uOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCIsXG5cdFx0XHRcdGxpc3Q6IGxpc3QuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0luc3RhbmNlOiBmdW5jdGlvbihpZCwgbGF5ZXJOYW1lLCBwYXJhbXMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tJbnN0YW5jZVwiLFxuXHRcdFx0XHRuYW1lOiBsYXllck5hbWUuZXZhbCgpLFxuXHRcdFx0XHRhbGlhczogaWQuZXZhbCgpWzBdLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBwYXJhbXMuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tOYW1lOiBmdW5jdGlvbihpZCwgXykge1xuXHRcdFx0cmV0dXJuIGlkLmV2YWwoKVxuXHRcdH0sXG5cdFx0QmxvY2tMaXN0OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiQmxvY2tMaXN0XCIsXG5cdFx0XHRcdFwibGlzdFwiOiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uUGFyYW1ldGVyczogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uQm9keTogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHZhciBkZWZpbml0aW9ucyA9IGxpc3QuZXZhbCgpWzBdIFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25Cb2R5XCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucyA/IGRlZmluaXRpb25zIDogW11cblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrSW5zdGFuY2VQYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWVMaXN0OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHROb25lbXB0eUxpc3RPZjogZnVuY3Rpb24oeCwgXywgeHMpIHtcblx0XHRcdHJldHVybiBbeC5ldmFsKCldLmNvbmNhdCh4cy5ldmFsKCkpXG5cdFx0fSxcblx0XHRFbXB0eUxpc3RPZjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9LFxuXHRcdGJsb2NrSWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18sIF9fXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJZGVudGlmaWVyXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdHBhcmFtZXRlck5hbWU6IGZ1bmN0aW9uKGEpIHtcblx0XHRcdHJldHVybiBhLnNvdXJjZS5jb250ZW50c1xuXHRcdH0sXG5cdFx0YmxvY2tUeXBlOiBmdW5jdGlvbihfLCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja1R5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YmxvY2tOYW1lOiBmdW5jdGlvbihfLCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJZGVudGlmaWVyXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKFwic3JjL21vbmllbC5vaG1cIiwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5ncmFtbWFyID0gb2htLmdyYW1tYXIodGhpcy5jb250ZW50cylcblx0XHR0aGlzLnNlbWFudGljcyA9IHRoaXMuZ3JhbW1hci5jcmVhdGVTZW1hbnRpY3MoKS5hZGRPcGVyYXRpb24oXCJldmFsXCIsIHRoaXMuZXZhbE9wZXJhdGlvbilcblx0fVxuXG5cdG1ha2Uoc291cmNlKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuZ3JhbW1hci5tYXRjaChzb3VyY2UpXG5cblx0XHRpZiAocmVzdWx0LnN1Y2NlZWRlZCgpKSB7XG5cdFx0XHR2YXIgYXN0ID0gdGhpcy5zZW1hbnRpY3MocmVzdWx0KS5ldmFsKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGFzdFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KClcblx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3VsdC5nZXRSaWdodG1vc3RGYWlsdXJlUG9zaXRpb24oKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXhwZWN0ZWQsXG5cdFx0XHRcdHBvc2l0aW9uXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0iLCJjbGFzcyBQeVRvcmNoR2VuZXJhdG9yIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5idWlsdGlucyA9IFtcIkFyaXRobWV0aWNFcnJvclwiLCBcIkFzc2VydGlvbkVycm9yXCIsIFwiQXR0cmlidXRlRXJyb3JcIiwgXCJCYXNlRXhjZXB0aW9uXCIsIFwiQmxvY2tpbmdJT0Vycm9yXCIsIFwiQnJva2VuUGlwZUVycm9yXCIsIFwiQnVmZmVyRXJyb3JcIiwgXCJCeXRlc1dhcm5pbmdcIiwgXCJDaGlsZFByb2Nlc3NFcnJvclwiLCBcIkNvbm5lY3Rpb25BYm9ydGVkRXJyb3JcIiwgXCJDb25uZWN0aW9uRXJyb3JcIiwgXCJDb25uZWN0aW9uUmVmdXNlZEVycm9yXCIsIFwiQ29ubmVjdGlvblJlc2V0RXJyb3JcIiwgXCJEZXByZWNhdGlvbldhcm5pbmdcIiwgXCJFT0ZFcnJvclwiLCBcIkVsbGlwc2lzXCIsIFwiRW52aXJvbm1lbnRFcnJvclwiLCBcIkV4Y2VwdGlvblwiLCBcIkZhbHNlXCIsIFwiRmlsZUV4aXN0c0Vycm9yXCIsIFwiRmlsZU5vdEZvdW5kRXJyb3JcIiwgXCJGbG9hdGluZ1BvaW50RXJyb3JcIiwgXCJGdXR1cmVXYXJuaW5nXCIsIFwiR2VuZXJhdG9yRXhpdFwiLCBcIklPRXJyb3JcIiwgXCJJbXBvcnRFcnJvclwiLCBcIkltcG9ydFdhcm5pbmdcIiwgXCJJbmRlbnRhdGlvbkVycm9yXCIsIFwiSW5kZXhFcnJvclwiLCBcIkludGVycnVwdGVkRXJyb3JcIiwgXCJJc0FEaXJlY3RvcnlFcnJvclwiLCBcIktleUVycm9yXCIsIFwiS2V5Ym9hcmRJbnRlcnJ1cHRcIiwgXCJMb29rdXBFcnJvclwiLCBcIk1lbW9yeUVycm9yXCIsIFwiTW9kdWxlTm90Rm91bmRFcnJvclwiLCBcIk5hbWVFcnJvclwiLCBcIk5vbmVcIiwgXCJOb3RBRGlyZWN0b3J5RXJyb3JcIiwgXCJOb3RJbXBsZW1lbnRlZFwiLCBcIk5vdEltcGxlbWVudGVkRXJyb3JcIiwgXCJPU0Vycm9yXCIsIFwiT3ZlcmZsb3dFcnJvclwiLCBcIlBlbmRpbmdEZXByZWNhdGlvbldhcm5pbmdcIiwgXCJQZXJtaXNzaW9uRXJyb3JcIiwgXCJQcm9jZXNzTG9va3VwRXJyb3JcIiwgXCJSZWN1cnNpb25FcnJvclwiLCBcIlJlZmVyZW5jZUVycm9yXCIsIFwiUmVzb3VyY2VXYXJuaW5nXCIsIFwiUnVudGltZUVycm9yXCIsIFwiUnVudGltZVdhcm5pbmdcIiwgXCJTdG9wQXN5bmNJdGVyYXRpb25cIiwgXCJTdG9wSXRlcmF0aW9uXCIsIFwiU3ludGF4RXJyb3JcIiwgXCJTeW50YXhXYXJuaW5nXCIsIFwiU3lzdGVtRXJyb3JcIiwgXCJTeXN0ZW1FeGl0XCIsIFwiVGFiRXJyb3JcIiwgXCJUaW1lb3V0RXJyb3JcIiwgXCJUcnVlXCIsIFwiVHlwZUVycm9yXCIsIFwiVW5ib3VuZExvY2FsRXJyb3JcIiwgXCJVbmljb2RlRGVjb2RlRXJyb3JcIiwgXCJVbmljb2RlRW5jb2RlRXJyb3JcIiwgXCJVbmljb2RlRXJyb3JcIiwgXCJVbmljb2RlVHJhbnNsYXRlRXJyb3JcIiwgXCJVbmljb2RlV2FybmluZ1wiLCBcIlVzZXJXYXJuaW5nXCIsIFwiVmFsdWVFcnJvclwiLCBcIldhcm5pbmdcIiwgXCJaZXJvRGl2aXNpb25FcnJvclwiLCBcIl9fYnVpbGRfY2xhc3NfX1wiLCBcIl9fZGVidWdfX1wiLCBcIl9fZG9jX19cIiwgXCJfX2ltcG9ydF9fXCIsIFwiX19sb2FkZXJfX1wiLCBcIl9fbmFtZV9fXCIsIFwiX19wYWNrYWdlX19cIiwgXCJfX3NwZWNfX1wiLCBcImFic1wiLCBcImFsbFwiLCBcImFueVwiLCBcImFzY2lpXCIsIFwiYmluXCIsIFwiYm9vbFwiLCBcImJ5dGVhcnJheVwiLCBcImJ5dGVzXCIsIFwiY2FsbGFibGVcIiwgXCJjaHJcIiwgXCJjbGFzc21ldGhvZFwiLCBcImNvbXBpbGVcIiwgXCJjb21wbGV4XCIsIFwiY29weXJpZ2h0XCIsIFwiY3JlZGl0c1wiLCBcImRlbGF0dHJcIiwgXCJkaWN0XCIsIFwiZGlyXCIsIFwiZGl2bW9kXCIsIFwiZW51bWVyYXRlXCIsIFwiZXZhbFwiLCBcImV4ZWNcIiwgXCJleGl0XCIsIFwiZmlsdGVyXCIsIFwiZmxvYXRcIiwgXCJmb3JtYXRcIiwgXCJmcm96ZW5zZXRcIiwgXCJnZXRhdHRyXCIsIFwiZ2xvYmFsc1wiLCBcImhhc2F0dHJcIiwgXCJoYXNoXCIsIFwiaGVscFwiLCBcImhleFwiLCBcImlkXCIsIFwiaW5wdXRcIiwgXCJpbnRcIiwgXCJpc2luc3RhbmNlXCIsIFwiaXNzdWJjbGFzc1wiLCBcIml0ZXJcIiwgXCJsZW5cIiwgXCJsaWNlbnNlXCIsIFwibGlzdFwiLCBcImxvY2Fsc1wiLCBcIm1hcFwiLCBcIm1heFwiLCBcIm1lbW9yeXZpZXdcIiwgXCJtaW5cIiwgXCJuZXh0XCIsIFwib2JqZWN0XCIsIFwib2N0XCIsIFwib3BlblwiLCBcIm9yZFwiLCBcInBvd1wiLCBcInByaW50XCIsIFwicHJvcGVydHlcIiwgXCJxdWl0XCIsIFwicmFuZ2VcIiwgXCJyZXByXCIsIFwicmV2ZXJzZWRcIiwgXCJyb3VuZFwiLCBcInNldFwiLCBcInNldGF0dHJcIiwgXCJzbGljZVwiLCBcInNvcnRlZFwiLCBcInN0YXRpY21ldGhvZFwiLCBcInN0clwiLCBcInN1bVwiLCBcInN1cGVyXCIsIFwidHVwbGVcIiwgXCJ0eXBlXCIsIFwidmFyc1wiLCBcInppcFwiXVxuXHRcdHRoaXMua2V5d29yZHMgPSBbXCJhbmRcIiwgXCJhc1wiLCBcImFzc2VydFwiLCBcImJyZWFrXCIsIFwiY2xhc3NcIiwgXCJjb250aW51ZVwiLCBcImRlZlwiLCBcImRlbFwiLCBcImVsaWZcIiwgXCJlbHNlXCIsIFwiZXhjZXB0XCIsIFwiZXhlY1wiLCBcImZpbmFsbHlcIiwgXCJmb3JcIiwgXCJmcm9tXCIsIFwiZ2xvYmFsXCIsIFwiaWZcIiwgXCJpbXBvcnRcIiwgXCJpblwiLCBcImlzXCIsIFwibGFtYmRhXCIsIFwibm90XCIsIFwib3JcIiwgXCJwYXNzXCIsIFwicHJpbnRcIiwgXCJyYWlzZVwiLCBcInJldHVyblwiLCBcInRyeVwiLCBcIndoaWxlXCIsIFwid2l0aFwiLCBcInlpZWxkXCJdXG5cdH1cblxuICAgIHNhbml0aXplKGlkKSB7XG5cdFx0dmFyIHNhbml0aXplZElkID0gaWRcblx0XHRpZiAodGhpcy5idWlsdGlucy5pbmNsdWRlcyhzYW5pdGl6ZWRJZCkgfHwgdGhpcy5rZXl3b3Jkcy5pbmNsdWRlcyhzYW5pdGl6ZWRJZCkpIHtcblx0XHRcdHNhbml0aXplZElkID0gXCJfXCIgKyBzYW5pdGl6ZWRJZFxuXHRcdH1cblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLi9nLCBcInRoaXNcIilcblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLy9nLCBcIi5cIilcblx0XHRyZXR1cm4gc2FuaXRpemVkSWRcblx0fVxuXG5cdG1hcFRvRnVuY3Rpb24obm9kZVR5cGUpIHtcblx0XHRsZXQgdHJhbnNsYXRpb25UYWJsZSA9IHtcblx0XHRcdFwiQ29udm9sdXRpb25cIjogXCJGLmNvbnYyZFwiLFxuXHRcdFx0XCJEZWNvbnZvbHV0aW9uXCI6IFwiRi5jb252X3RyYW5zcG9zZTJkXCIsXG5cdFx0XHRcIkF2ZXJhZ2VQb29saW5nXCI6IFwiRi5hdmdfcG9vbDJkXCIsXG5cdFx0XHRcIkFkYXB0aXZlQXZlcmFnZVBvb2xpbmdcIjogXCJGLmFkYXB0aXZlX2F2Z19wb29sMmRcIixcblx0XHRcdFwiTWF4UG9vbGluZ1wiOiBcIkYubWF4X3Bvb2wyZFwiLFxuXHRcdFx0XCJBZGFwdGl2ZU1heFBvb2xpbmdcIjogXCJGLmFkYXB0aXZlX21heF9wb29sMmRcIixcblx0XHRcdFwiTWF4VW5wb29saW5nXCI6IFwiRi5tYXhfdW5wb29sMmRcIixcblx0XHRcdFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucmVsdVwiLFxuXHRcdFx0XCJFeHBvbmVudGlhbExpbmVhclVuaXRcIjogXCJGLmVsdVwiLFxuXHRcdFx0XCJQYXJhbWV0cmljUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucHJlbHVcIixcblx0XHRcdFwiTGVha3lSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5sZWFreV9yZWx1XCIsXG5cdFx0XHRcIlJhbmRvbWl6ZWRSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5ycmVsdVwiLFxuXHRcdFx0XCJTaWdtb2lkXCI6IFwiRi5zaWdtb2lkXCIsXG5cdFx0XHRcIkxvZ1NpZ21vaWRcIjogXCJGLmxvZ3NpZ21vaWRcIixcblx0XHRcdFwiVGhyZXNob2xkXCI6IFwiRi50aHJlc2hvbGRcIixcblx0XHRcdFwiSGFyZFRhbmhcIjogXCJGLmhhcmR0YW5oXCIsXG5cdFx0XHRcIlRhbmhcIjogXCJGLnRhbmhcIixcblx0XHRcdFwiVGFuaFNocmlua1wiOiBcIkYudGFuaHNocmlua1wiLFxuXHRcdFx0XCJIYXJkU2hyaW5rXCI6IFwiRi5oYXJkc2hyaW5rXCIsXG5cdFx0XHRcIkxvZ1NvZnRNYXhcIjogXCJGLmxvZ19zb2Z0bWF4XCIsXG5cdFx0XHRcIlNvZnRTaHJpbmtcIjogXCJGLnNvZnRzaHJpbmtcIixcblx0XHRcdFwiU29mdE1heFwiOiBcIkYuc29mdG1heFwiLFxuXHRcdFx0XCJTb2Z0TWluXCI6IFwiRi5zb2Z0bWluXCIsXG5cdFx0XHRcIlNvZnRQbHVzXCI6IFwiRi5zb2Z0cGx1c1wiLFxuXHRcdFx0XCJTb2Z0U2lnblwiOiBcIkYuc29mdHNpZ25cIixcblx0XHRcdFwiQmF0Y2hOb3JtYWxpemF0aW9uXCI6IFwiRi5iYXRjaF9ub3JtXCIsXG5cdFx0XHRcIkxpbmVhclwiOiBcIkYubGluZWFyXCIsXG5cdFx0XHRcIkRyb3BvdXRcIjogXCJGLmRyb3BvdXRcIixcblx0XHRcdFwiUGFpcndpc2VEaXN0YW5jZVwiOiBcIkYucGFpcndpc2VfZGlzdGFuY2VcIixcblx0XHRcdFwiQ3Jvc3NFbnRyb3B5XCI6IFwiRi5jcm9zc19lbnRyb3B5XCIsXG5cdFx0XHRcIkJpbmFyeUNyb3NzRW50cm9weVwiOiBcIkYuYmluYXJ5X2Nyb3NzX2VudHJvcHlcIixcblx0XHRcdFwiS3VsbGJhY2tMZWlibGVyRGl2ZXJnZW5jZUxvc3NcIjogXCJGLmtsX2RpdlwiLFxuXHRcdFx0XCJQYWRcIjogXCJGLnBhZFwiLFxuXHRcdFx0XCJWYXJpYWJsZVwiOiBcIkFHLlZhcmlhYmxlXCIsXG5cdFx0XHRcIlJhbmRvbU5vcm1hbFwiOiBcIlQucmFuZG5cIixcblx0XHRcdFwiVGVuc29yXCI6IFwiVC5UZW5zb3JcIlxuXHRcdH1cblxuXHRcdHJldHVybiB0cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KG5vZGVUeXBlKSA/IHRyYW5zbGF0aW9uVGFibGVbbm9kZVR5cGVdIDogbm9kZVR5cGVcblxuXHR9XG5cblx0aW5kZW50KGNvZGUsIGxldmVsID0gMSwgaW5kZW50UGVyTGV2ZWwgPSBcIiAgICBcIikge1xuXHRcdGxldCBpbmRlbnQgPSBpbmRlbnRQZXJMZXZlbC5yZXBlYXQobGV2ZWwpXG5cdFx0cmV0dXJuIGNvZGUuc3BsaXQoXCJcXG5cIikubWFwKGxpbmUgPT4gaW5kZW50ICsgbGluZSkuam9pbihcIlxcblwiKVxuXHR9XG5cblx0Z2VuZXJhdGVDb2RlKGdyYXBoLCBkZWZpbml0aW9ucykge1xuXHRcdGxldCBpbXBvcnRzID1cbmBpbXBvcnQgdG9yY2ggYXMgVFxuaW1wb3J0IHRvcmNoLm5uLmZ1bmN0aW9uYWwgYXMgRlxuaW1wb3J0IHRvcmNoLmF1dG9ncmFkIGFzIEFHYFxuXG5cdFx0bGV0IG1vZHVsZURlZmluaXRpb25zID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbnMpLm1hcChkZWZpbml0aW9uTmFtZSA9PiB7XG5cdFx0XHRpZiAoZGVmaW5pdGlvbk5hbWUgIT09IFwibWFpblwiKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdlbmVyYXRlQ29kZUZvck1vZHVsZShkZWZpbml0aW9uTmFtZSwgZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9yZXR1cm4gXCJcIlxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRsZXQgY29kZSA9XG5gJHtpbXBvcnRzfVxuXG4ke21vZHVsZURlZmluaXRpb25zLmpvaW4oXCJcXG5cIil9XG5gXG5cblx0XHRyZXR1cm4gY29kZVxuXHR9XG5cblx0Z2VuZXJhdGVDb2RlRm9yTW9kdWxlKGNsYXNzbmFtZSwgZ3JhcGgpIHtcblx0XHRsZXQgdG9wb2xvZ2ljYWxPcmRlcmluZyA9IGdyYXBobGliLmFsZy50b3Bzb3J0KGdyYXBoKVxuXHRcdGxldCBmb3J3YXJkRnVuY3Rpb24gPSBcIlwiXG5cblx0XHR0b3BvbG9naWNhbE9yZGVyaW5nLm1hcChub2RlID0+IHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKFwibXVcIiwgbm9kZSlcblx0XHRcdGxldCBuID0gZ3JhcGgubm9kZShub2RlKVxuXHRcdFx0bGV0IGNoID0gZ3JhcGguY2hpbGRyZW4obm9kZSlcblxuXHRcdFx0aWYgKCFuKSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2cobilcblxuXHRcdFx0aWYgKGNoLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRsZXQgaW5Ob2RlcyA9IGdyYXBoLmluRWRnZXMobm9kZSkubWFwKGUgPT4gdGhpcy5zYW5pdGl6ZShlLnYpKVxuXHRcdFx0XHRmb3J3YXJkRnVuY3Rpb24gKz0gYCR7dGhpcy5zYW5pdGl6ZShub2RlKX0gPSAke3RoaXMubWFwVG9GdW5jdGlvbihuLmNsYXNzKX0oJHtpbk5vZGVzLmpvaW4oXCIsIFwiKX0pXFxuYFxuXHRcdFx0fSBcblx0XHR9LCB0aGlzKVxuXG5cdFx0bGV0IG1vZHVsZUNvZGUgPVxuYGNsYXNzICR7Y2xhc3NuYW1lfShULm5uLk1vZHVsZSk6XG4gICAgZGVmIF9faW5pdF9fKHNlbGYsIHBhcmFtMSwgcGFyYW0yKTogIyBwYXJhbWV0ZXJzIGhlcmVcbiAgICAgICAgc3VwZXIoJHtjbGFzc25hbWV9LCBzZWxmKS5fX2luaXRfXygpXG4gICAgICAgICMgYWxsIGRlY2xhcmF0aW9ucyBoZXJlXG5cbiAgICBkZWYgZm9yd2FyZChzZWxmLCBpbjEsIGluMik6ICMgYWxsIElucHV0cyBoZXJlXG4gICAgICAgICMgYWxsIGZ1bmN0aW9uYWwgc3R1ZmYgaGVyZVxuJHt0aGlzLmluZGVudChmb3J3YXJkRnVuY3Rpb24sIDIpfVxuICAgICAgICByZXR1cm4gKG91dDEsIG91dDIpICMgYWxsIE91dHB1dHMgaGVyZVxuYFxuXHRcdHJldHVybiBtb2R1bGVDb2RlXG5cdH1cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCh0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsLFxuICAgICAgICAgICAgcHJldmlvdXNWaWV3Qm94OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlICE9PSBuZXh0U3RhdGUpXG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWRcIiwgbm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBub2RlLmlkXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGRvbU5vZGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3hfd2hvbGUgPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgdmFyIHZpZXdCb3hcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIHZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3Qm94ID0gdmlld0JveF93aG9sZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIj5cbiAgICAgICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhcInNyYy9idW5kbGUuY3NzXCIsIFwidXRmLThcIiwgKGVycikgPT4ge2NvbnNvbGUubG9nKGVycil9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt2aWV3Qm94X3dob2xlfSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiPjwvYW5pbWF0ZT5cbiAgICAgICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICAgICAgPG1hcmtlciBpZD1cImFycm93XCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDMgNSB6XCIgY2xhc3NOYW1lPVwiYXJyb3dcIj48L3BhdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvbWFya2VyPlxuICAgICAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImdyYXBoXCI+XG4gICAgICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtub2Rlc31cbiAgICAgICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZWRnZXN9XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VcIiBtYXJrZXJFbmQ9XCJ1cmwoI2Fycm93KVwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50fSBrZXk9e01hdGgucmFuZG9tKCl9IHJlc3RhcnQ9XCJhbHdheXNcIiBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfSB0bz17bChlLnBvaW50cyl9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIiBhdHRyaWJ1dGVOYW1lPVwiZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgY29uc3QgdHlwZSA9IG4uaXNNZXRhbm9kZSA/IFwibWV0YW5vZGVcIiA6IFwibm9kZVwiXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YCR7dHlwZX0gJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7TWF0aC5mbG9vcihuLnggLShuLndpZHRoLzIpKX0sJHtNYXRoLmZsb29yKG4ueSAtKG4uaGVpZ2h0LzIpKX0pYH0+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfSAvPlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgQW5vbnltb3VzTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
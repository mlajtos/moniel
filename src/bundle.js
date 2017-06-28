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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9QeVRvcmNoR2VuZXJhdG9yLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7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TCxTQUFPLGdCQUFQLENBQXdCLGtCQUF4QixFQUE0QyxHQUE1QyxFQUFpRCxLQUFqRDtBQUNEIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNsYXNzIENvbG9ySGFzaFdyYXBwZXJ7XG4gICAgY29sb3JIYXNoID0gbmV3IENvbG9ySGFzaCh7XG4gICAgICAgIHNhdHVyYXRpb246IFswLjldLFxuICAgICAgICBsaWdodG5lc3M6IFswLjQ1XSxcbiAgICAgICAgaGFzaDogdGhpcy5tYWdpY1xuICAgIH0pXG5cbiAgICBsb3NlTG9zZShzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCArPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaFxuICAgIH1cblxuICAgIG1hZ2ljKHN0cikge1xuICAgICAgICB2YXIgaGFzaCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBoYXNoID0gaGFzaCAqIDQ3ICsgc3RyLmNoYXJDb2RlQXQoaSkgJSAzMjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaGFzaFxuICAgIH1cblxuICAgIGhleChzdHIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29sb3JIYXNoLmhleChzdHIpXG4gICAgfVxufSIsImNsYXNzIENvbXB1dGF0aW9uYWxHcmFwaHtcblx0bm9kZUNvdW50ZXIgPSB7fVxuXHRfbm9kZVN0YWNrID0gW11cblx0X3ByZXZpb3VzTm9kZVN0YWNrID0gW11cblxuXHRzY29wZVN0YWNrID0gbmV3IFNjb3BlU3RhY2soKVxuXG5cdG1ldGFub2RlcyA9IHt9XG5cdG1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdGdldCBncmFwaCgpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbGFzdEluZGV4XTtcblx0fVxuXG5cdGdldCBub2RlU3RhY2soKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMuX25vZGVTdGFja1tsYXN0SW5kZXhdXG5cdH1cblxuXHRzZXQgbm9kZVN0YWNrKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fbm9kZVN0YWNrW2xhc3RJbmRleF0gPSB2YWx1ZVxuXHR9XG5cblx0Z2V0IHByZXZpb3VzTm9kZVN0YWNrKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9wcmV2aW91c05vZGVTdGFja1tsYXN0SW5kZXhdXG5cdH1cblxuXHRzZXQgcHJldmlvdXNOb2RlU3RhY2sodmFsdWUpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHR0aGlzLl9wcmV2aW91c05vZGVTdGFja1tsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubW9uaWVsID0gcGFyZW50O1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLm5vZGVDb3VudGVyID0ge31cblx0XHR0aGlzLnNjb3BlU3RhY2suaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMuY2xlYXJOb2RlU3RhY2soKVxuXG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXVxuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXG5cdFx0dGhpcy5tZXRhbm9kZXMgPSB7fVxuXHRcdHRoaXMubWV0YW5vZGVTdGFjayA9IFtdXG5cblx0XHQvLyBjb25zb2xlLmxvZyhcIk1ldGFub2RlczpcIiwgdGhpcy5tZXRhbm9kZXMpXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZSBTdGFjazpcIiwgdGhpcy5tZXRhbm9kZVN0YWNrKVxuXG4gICAgICAgIHRoaXMuYWRkTWFpbigpO1xuXHR9XG5cblx0ZW50ZXJNZXRhbm9kZVNjb3BlKG5hbWUpIHtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXSA9IG5ldyBncmFwaGxpYi5HcmFwaCh7XG5cdFx0XHRjb21wb3VuZDogdHJ1ZVxuXHRcdH0pO1xuXHRcdHRoaXMubWV0YW5vZGVzW25hbWVdLnNldEdyYXBoKHtcblx0XHRcdG5hbWU6IG5hbWUsXG5cdCAgICAgICAgcmFua2RpcjogJ0JUJyxcblx0ICAgICAgICBlZGdlc2VwOiAyMCxcblx0ICAgICAgICByYW5rc2VwOiA0MCxcblx0ICAgICAgICBub2RlU2VwOiAzMCxcblx0ICAgICAgICBtYXJnaW54OiAyMCxcblx0ICAgICAgICBtYXJnaW55OiAyMCxcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2RlU3RhY2sucHVzaChuYW1lKTtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLm1ldGFub2RlU3RhY2spXG5cblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNbbmFtZV07XG5cdH1cblxuXHRleGl0TWV0YW5vZGVTY29wZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gXCJhX1wiICsgdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLmVudGVyTWV0YW5vZGVTY29wZShcIm1haW5cIik7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goXCIuXCIpO1xuXHRcdGxldCBpZCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHR0aGlzLmdyYXBoLnNldE5vZGUoaWQsIHtcblx0XHRcdGNsYXNzOiBcIlwiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyhgVG91Y2hpbmcgbm9kZSBcIiR7bm9kZVBhdGh9XCIuYClcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2sucHVzaChub2RlUGF0aClcblxuXHRcdFx0aWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2subGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZSh0aGlzLnByZXZpb3VzTm9kZVN0YWNrWzBdLCBub2RlUGF0aClcblx0XHRcdH0gZWxzZSBpZiAodGhpcy5wcmV2aW91c05vZGVTdGFjay5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdHRoaXMuc2V0RWRnZSh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLCBub2RlUGF0aClcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKGBUcnlpbmcgdG8gdG91Y2ggbm9uLWV4aXN0YW50IG5vZGUgXCIke25vZGVQYXRofVwiYCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmZXJlbmNlTm9kZShpZCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IGlkLFxuXHRcdFx0Y2xhc3M6IFwidW5kZWZpbmVkXCIsXG5cdFx0XHRoZWlnaHQ6IDUwXG5cdFx0fVxuXG5cdFx0aWYgKCF0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0d2lkdGg6IE1hdGgubWF4KG5vZGUuY2xhc3MubGVuZ3RoLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkLmxlbmd0aCA6IDApICogMTBcblx0XHRcdH0pO1xuXHRcdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblx0XHR9XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y3JlYXRlTm9kZShpZCwgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdGNvbnNvbGUud2FybihgUmVkZWZpbmluZyBub2RlIFwiJHtpZH1cImApO1x0XG5cdFx0fVxuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoXG5cdFx0fSk7XG5cdFx0dGhpcy5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHRyZXR1cm4gbm9kZVBhdGg7XG5cdH1cblxuXHRjcmVhdGVNZXRhbm9kZShpZGVudGlmaWVyLCBtZXRhbm9kZUNsYXNzLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWRlbnRpZmllcik7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblx0XHRcblx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdC4uLm5vZGUsXG5cdFx0XHRpZDogbm9kZVBhdGgsXG5cdFx0XHRpc01ldGFub2RlOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXG5cdFx0bGV0IHRhcmdldE1ldGFub2RlID0gdGhpcy5tZXRhbm9kZXNbbWV0YW5vZGVDbGFzc107XG5cdFx0dGFyZ2V0TWV0YW5vZGUubm9kZXMoKS5mb3JFYWNoKG5vZGVJZCA9PiB7XG5cdFx0XHRsZXQgbm9kZSA9IHRhcmdldE1ldGFub2RlLm5vZGUobm9kZUlkKTtcblx0XHRcdGlmICghbm9kZSkgeyByZXR1cm4gfVxuXHRcdFx0bGV0IG5ld05vZGVJZCA9IG5vZGVJZC5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR2YXIgbmV3Tm9kZSA9IHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0aWQ6IG5ld05vZGVJZFxuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5ld05vZGVJZCwgbmV3Tm9kZSk7XG5cblx0XHRcdGxldCBuZXdQYXJlbnQgPSB0YXJnZXRNZXRhbm9kZS5wYXJlbnQobm9kZUlkKS5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCk7XG5cdFx0XHR0aGlzLmdyYXBoLnNldFBhcmVudChuZXdOb2RlSWQsIG5ld1BhcmVudCk7XG5cdFx0fSk7XG5cblx0XHR0YXJnZXRNZXRhbm9kZS5lZGdlcygpLmZvckVhY2goZWRnZSA9PiB7XG5cdFx0XHRjb25zdCBlID0gdGFyZ2V0TWV0YW5vZGUuZWRnZShlZGdlKVxuXHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKGVkZ2Uudi5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIGVkZ2Uudy5yZXBsYWNlKFwiLlwiLCBub2RlUGF0aCksIHt9KTtcblx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0fVxuXG5cdGNsZWFyTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0ZnJlZXplTm9kZVN0YWNrKCkge1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbLi4udGhpcy5ub2RlU3RhY2tdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCk7XG5cdH1cblxuXHRpc0lucHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIjtcblx0fVxuXG5cdGlzT3V0cHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiT3V0cHV0XCI7XG5cdH1cblxuXHRpc01ldGFub2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coXCJpc01ldGFub2RlOlwiLCBub2RlUGF0aClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5ub2RlKG5vZGVQYXRoKS5pc01ldGFub2RlID09PSB0cnVlO1xuXHR9XG5cblx0Z2V0T3V0cHV0Tm9kZXMoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IG91dHB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNPdXRwdXQobm9kZSkgfSk7XG5cblx0XHRpZiAob3V0cHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgT3V0cHV0IG5vZGUuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5lbmRJZHggOiAwXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XHRcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0Tm9kZXM7XG5cdH1cblxuXHRnZXRJbnB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBpbnB1dE5vZGVzID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKX0pO1xuXG5cdFx0aWYgKGlucHV0Tm9kZXMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgTWV0YW5vZGUgXCIke3Njb3BlLmlkfVwiIGRvZXNuJ3QgaGF2ZSBhbnkgSW5wdXQgbm9kZXMuYCxcblx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdHN0YXJ0OiBzY29wZS5fc291cmNlID8gc2NvcGUuX3NvdXJjZS5zdGFydElkeCA6IDAsXG5cdFx0XHRcdFx0ZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaW5wdXROb2Rlcztcblx0fVxuXG5cdHNldEVkZ2UoZnJvbVBhdGgsIHRvUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQ3JlYXRpbmcgZWRnZSBmcm9tIFwiJHtmcm9tUGF0aH1cIiB0byBcIiR7dG9QYXRofVwiLmApXG5cdFx0dmFyIHNvdXJjZVBhdGhzXG5cblx0XHRpZiAodHlwZW9mIGZyb21QYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodGhpcy5pc01ldGFub2RlKGZyb21QYXRoKSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IHRoaXMuZ2V0T3V0cHV0Tm9kZXMoZnJvbVBhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzb3VyY2VQYXRocyA9IFtmcm9tUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkoZnJvbVBhdGgpKSB7XG5cdFx0XHRzb3VyY2VQYXRocyA9IGZyb21QYXRoXG5cdFx0fVxuXG5cdFx0dmFyIHRhcmdldFBhdGhzXG5cblx0XHRpZiAodHlwZW9mIHRvUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZSh0b1BhdGgpKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gdGhpcy5nZXRJbnB1dE5vZGVzKHRvUGF0aClcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzID0gW3RvUGF0aF1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodG9QYXRoKSkge1xuXHRcdFx0dGFyZ2V0UGF0aHMgPSB0b1BhdGhcblx0XHR9XG5cblx0XHR0aGlzLnNldE11bHRpRWRnZShzb3VyY2VQYXRocywgdGFyZ2V0UGF0aHMpXG5cdH1cblxuXHRzZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKSB7XG5cblx0XHRpZiAoc291cmNlUGF0aHMgPT09IG51bGwgfHwgdGFyZ2V0UGF0aHMgPT09IG51bGwpIHtcblx0XHRcdHJldHVyblxuXHRcdH1cblxuXHRcdGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IHRhcmdldFBhdGhzLmxlbmd0aCkge1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2VQYXRocy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoc291cmNlUGF0aHNbaV0gJiYgdGFyZ2V0UGF0aHNbaV0pIHtcblx0XHRcdFx0XHR0aGlzLmdyYXBoLnNldEVkZ2Uoc291cmNlUGF0aHNbaV0sIHRhcmdldFBhdGhzW2ldLCB7fSk7XHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAodGFyZ2V0UGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHNvdXJjZVBhdGhzLmZvckVhY2goc291cmNlUGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aCwgdGFyZ2V0UGF0aHNbMF0pKVxuXHRcdFx0fSBlbHNlIGlmIChzb3VyY2VQYXRocy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0dGFyZ2V0UGF0aHMuZm9yRWFjaCh0YXJnZXRQYXRoID0+IHRoaXMuc2V0RWRnZShzb3VyY2VQYXRoc1swXSwgdGFyZ2V0UGF0aCwpKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBgTnVtYmVyIG9mIG5vZGVzIGRvZXMgbm90IG1hdGNoLiBbJHtzb3VyY2VQYXRocy5sZW5ndGh9XSAtPiBbJHt0YXJnZXRQYXRocy5sZW5ndGh9XWAsXG5cdFx0XHRcdFx0dHlwZTogXCJlcnJvclwiLFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHQvLyBzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdFx0Ly8gZW5kOiAgc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH1cblxuXHRoYXNOb2RlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRnZXRHcmFwaCgpIHtcblx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLmdyYXBoKVxuXHRcdHJldHVybiB0aGlzLmdyYXBoO1xuXHR9XG5cblx0Z2V0TWV0YW5vZGVzKCkge1xuXHRcdHJldHVybiB0aGlzLm1ldGFub2Rlc1xuXHR9XG59IiwiY2xhc3MgRWRpdG9yIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5vbkNoYW5nZSA9IHRoaXMub25DaGFuZ2UuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5tYXJrZXIgPSBudWxsO1xuICAgICAgICB0aGlzLm1hcmtlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBvbkNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25DaGFuZ2UpIHtcbiAgICAgICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuZWRpdG9yLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKG5ld1ZhbHVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGluaXQoZWxlbWVudCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IGVsZW1lbnQ7XG4gICAgfVxuXG4gICAgc2V0VmFsdWUodmFsdWUpIHtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUsIC0xKTtcbiAgICB9XG5cbiAgICByZW1vdmVNYXJrZXJzKCkge1xuICAgICAgICB0aGlzLm1hcmtlcnMubWFwKG1hcmtlciA9PiB0aGlzLmVkaXRvci5zZXNzaW9uLnJlbW92ZU1hcmtlcihtYXJrZXIpKTtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DdXJzb3JQb3NpdGlvbkNoYW5nZWQoZXZlbnQsIHNlbGVjdGlvbikge1xuICAgICAgICBsZXQgbSA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZ2V0TWFya2VycygpO1xuICAgICAgICBsZXQgYyA9IHNlbGVjdGlvbi5nZXRDdXJzb3IoKTtcbiAgICAgICAgbGV0IG1hcmtlcnMgPSB0aGlzLm1hcmtlcnMubWFwKGlkID0+IG1baWRdKTtcbiAgICAgICAgbGV0IGN1cnNvck92ZXJNYXJrZXIgPSBtYXJrZXJzLm1hcChtYXJrZXIgPT4gbWFya2VyLnJhbmdlLmNvbnRhaW5zKGMucm93LCBjLmNvbHVtbikpLnJlZHVjZSggKHByZXYsIGN1cnIpID0+IHByZXYgfHwgY3VyciwgZmFsc2UpO1xuXG4gICAgICAgIGlmIChjdXJzb3JPdmVyTWFya2VyKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgdGhpcy5lZGl0b3IgPSBhY2UuZWRpdCh0aGlzLmNvbnRhaW5lcik7XG4gICAgICAgIHRoaXMuZWRpdG9yLmdldFNlc3Npb24oKS5zZXRNb2RlKFwiYWNlL21vZGUvXCIgKyB0aGlzLnByb3BzLm1vZGUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRUaGVtZShcImFjZS90aGVtZS9cIiArIHRoaXMucHJvcHMudGhlbWUpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRTaG93UHJpbnRNYXJnaW4oZmFsc2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZXRPcHRpb25zKHtcbiAgICAgICAgICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgICAgICAgICBlbmFibGVTbmlwcGV0czogdHJ1ZSxcbiAgICAgICAgICAgIGVuYWJsZUxpdmVBdXRvY29tcGxldGlvbjogZmFsc2UsXG4gICAgICAgICAgICB3cmFwOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1Njcm9sbEVkaXRvckludG9WaWV3OiB0cnVlLFxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJGaXJhIENvZGVcIixcbiAgICAgICAgICAgIHNob3dMaW5lTnVtYmVyczogdHJ1ZSxcbiAgICAgICAgICAgIHNob3dHdXR0ZXI6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuICAgICAgICB0aGlzLmVkaXRvci5jb250YWluZXIuc3R5bGUubGluZUhlaWdodCA9IDEuNztcblxuICAgICAgICBpZiAodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUpe1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUodGhpcy5wcm9wcy5kZWZhdWx0VmFsdWUsIC0xKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZWRpdG9yLm9uKFwiY2hhbmdlXCIsIHRoaXMub25DaGFuZ2UpO1xuICAgICAgICB0aGlzLmVkaXRvci5zZWxlY3Rpb24ub24oXCJjaGFuZ2VDdXJzb3JcIiwgdGhpcy5vbkN1cnNvclBvc2l0aW9uQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uc2V0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbnMpO1xuICAgICAgICAgICAgLy90aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG5cbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuXG4gICAgICAgICAgICB0aGlzLnJlbW92ZU1hcmtlcnMoKTtcblxuICAgICAgICAgICAgdmFyIG1hcmtlcnMgPSBuZXh0UHJvcHMuaXNzdWVzLm1hcChpc3N1ZSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICBzdGFydDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLnN0YXJ0KSxcbiAgICAgICAgICAgICAgICAgICAgZW5kOiB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uZW5kKVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCByYW5nZSA9IG5ldyBSYW5nZShwb3NpdGlvbi5zdGFydC5yb3csIHBvc2l0aW9uLnN0YXJ0LmNvbHVtbiwgcG9zaXRpb24uZW5kLnJvdywgcG9zaXRpb24uZW5kLmNvbHVtbik7XG5cbiAgICAgICAgICAgICAgICB0aGlzLm1hcmtlcnMucHVzaCh0aGlzLmVkaXRvci5zZXNzaW9uLmFkZE1hcmtlcihyYW5nZSwgXCJtYXJrZXJfZXJyb3JcIiwgXCJ0ZXh0XCIpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5jbGVhckFubm90YXRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobmV4dFByb3BzLnZhbHVlKSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXRWYWx1ZShuZXh0UHJvcHMudmFsdWUsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgcmV0dXJuIDxkaXYgcmVmPXsgKGVsZW1lbnQpID0+IHRoaXMuaW5pdChlbGVtZW50KSB9PjwvZGl2PjtcbiAgICB9XG59IiwiY2xhc3MgR3JhcGhMYXlvdXR7XG5cdGFjdGl2ZVdvcmtlcnMgPSB7fVxuXHRjdXJyZW50V29ya2VySWQgPSAwXG5cdGxhc3RGaW5pc2hlZFdvcmtlcklkID0gMFxuXHRjYWxsYmFjayA9IGZ1bmN0aW9uKCl7fVxuXG5cdGNvbnN0cnVjdG9yKGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrXG5cdH1cblxuXHRsYXlvdXQoZ3JhcGgpIHtcblx0XHRjb25zdCBpZCA9IHRoaXMuZ2V0V29ya2VySWQoKVxuXHRcdHRoaXMuYWN0aXZlV29ya2Vyc1tpZF0gPSBuZXcgTGF5b3V0V29ya2VyKGlkLCBncmFwaCwgdGhpcy53b3JrZXJGaW5pc2hlZC5iaW5kKHRoaXMpKVxuXHR9XG5cblx0d29ya2VyRmluaXNoZWQoe2lkLCBncmFwaH0pIHtcblx0XHRpZiAoaWQgPj0gdGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCkge1xuXHRcdFx0dGhpcy5sYXN0RmluaXNoZWRXb3JrZXJJZCA9IGlkXG5cdFx0XHR0aGlzLmNhbGxiYWNrKGdyYXBoKVxuXHRcdH1cblx0fVxuXG5cdGdldFdvcmtlcklkKCkge1xuXHRcdHRoaXMuY3VycmVudFdvcmtlcklkICs9IDFcblx0XHRyZXR1cm4gdGhpcy5jdXJyZW50V29ya2VySWRcblx0fVxufVxuXG5jbGFzcyBMYXlvdXRXb3JrZXJ7XG5cdGlkID0gMFxuXHR3b3JrZXIgPSBudWxsXG5cdGNvbnN0cnVjdG9yKGlkLCBncmFwaCwgb25GaW5pc2hlZCkge1xuXHRcdHRoaXMuaWQgPSBpZFxuXHRcdHRoaXMud29ya2VyID0gbmV3IFdvcmtlcihcInNyYy9zY3JpcHRzL0dyYXBoTGF5b3V0V29ya2VyLmpzXCIpXG5cdFx0dGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgdGhpcy5yZWNlaXZlLmJpbmQodGhpcykpXG5cdFx0dGhpcy5vbkZpbmlzaGVkID0gb25GaW5pc2hlZFxuXHRcdFxuXHRcdHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHRoaXMuZW5jb2RlKGdyYXBoKSlcblx0fVxuXHRyZWNlaXZlKG1lc3NhZ2UpIHtcblx0XHR0aGlzLndvcmtlci50ZXJtaW5hdGUoKVxuXHRcdHRoaXMub25GaW5pc2hlZCh7XG5cdFx0XHRpZDogdGhpcy5pZCxcblx0XHRcdGdyYXBoOiB0aGlzLmRlY29kZShtZXNzYWdlLmRhdGEpXG5cdFx0fSlcblx0fVxuXHRlbmNvZGUoZ3JhcGgpIHtcblx0XHRyZXR1cm4gZ3JhcGhsaWIuanNvbi53cml0ZShncmFwaClcbiAgICB9XG5cbiAgICBkZWNvZGUoanNvbikge1xuXHRcdHJldHVybiBncmFwaGxpYi5qc29uLnJlYWQoanNvbilcbiAgICB9XG59IiwiY29uc3QgaXBjID0gcmVxdWlyZShcImVsZWN0cm9uXCIpLmlwY1JlbmRlcmVyXG5jb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuXG5jbGFzcyBJREUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG5cdHBhcnNlciA9IG5ldyBQYXJzZXIoKVxuXHRtb25pZWwgPSBuZXcgTW9uaWVsKClcblx0Z2VuZXJhdG9yID0gbmV3IFB5VG9yY2hHZW5lcmF0b3IoKVxuXG5cdGxvY2sgPSBudWxsXG5cblx0Y29uc3RydWN0b3IocHJvcHMpIHtcblx0XHRzdXBlcihwcm9wcyk7XG5cblx0XHR0aGlzLnN0YXRlID0ge1xuXHRcdFx0Ly8gdGhlc2UgYXJlIG5vIGxvbmdlciBuZWVkZWQgaGVyZVxuXHRcdFx0Ly8gXCJncmFtbWFyXCI6IHRoaXMucGFyc2VyLmdyYW1tYXIsXG5cdFx0XHQvLyBcInNlbWFudGljc1wiOiB0aGlzLnBhcnNlci5zZW1hbnRpY3MsXG5cdFx0XHRcIm5ldHdvcmtEZWZpbml0aW9uXCI6IFwiXCIsXG5cdFx0XHRcImFzdFwiOiBudWxsLFxuXHRcdFx0XCJpc3N1ZXNcIjogbnVsbCxcblx0XHRcdFwibGF5b3V0XCI6IFwiY29sdW1uc1wiLFxuXHRcdFx0XCJnZW5lcmF0ZWRDb2RlXCI6IFwiXCJcblx0XHR9O1xuXG5cdFx0aXBjLm9uKCdzYXZlJywgZnVuY3Rpb24oZXZlbnQsIG1lc3NhZ2UpIHtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5tb25cIiwgdGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbiwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvc291cmNlLmFzdC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguc3ZnXCIsIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJzdmdcIikub3V0ZXJIVE1MLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9ncmFwaC5qc29uXCIsIEpTT04uc3RyaW5naWZ5KGRhZ3JlLmdyYXBobGliLmpzb24ud3JpdGUodGhpcy5zdGF0ZS5ncmFwaCksIG51bGwsIDIpLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9oYWxmLWFzc2VkX2pva2UucHlcIiwgdGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdCAgaWYgKGVycikgdGhyb3cgZXJyc1xuXHRcdFx0fSk7XG5cblx0XHRcdGxldCBzYXZlTm90aWZpY2F0aW9uID0gbmV3IE5vdGlmaWNhdGlvbignU2tldGNoIHNhdmVkJywge1xuICAgICAgICAgICAgXHRib2R5OiBgU2tldGNoIHdhcyBzdWNjZXNzZnVsbHkgc2F2ZWQgaW4gdGhlIFwic2tldGNoZXNcIiBmb2xkZXIuYCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG4gICAgICAgICAgICB9KVxuXHRcdH0uYmluZCh0aGlzKSk7XG5cblx0XHRpcGMub24oXCJ0b2dnbGVMYXlvdXRcIiwgKGUsIG0pID0+IHtcblx0XHRcdHRoaXMudG9nZ2xlTGF5b3V0KClcblx0XHR9KTtcblxuXHRcdGlwYy5vbihcIm9wZW5cIiwgKGUsIG0pID0+IHtcblx0XHRcdHRoaXMub3BlbkZpbGUobS5maWxlUGF0aClcblx0XHR9KVxuXG5cdFx0bGV0IGxheW91dCA9IHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImxheW91dFwiKVxuXHRcdGlmIChsYXlvdXQpIHtcblx0XHRcdGlmIChsYXlvdXQgPT0gXCJjb2x1bW5zXCIgfHwgbGF5b3V0ID09IFwicm93c1wiKSB7XG5cdFx0XHRcdHRoaXMuc3RhdGUubGF5b3V0ID0gbGF5b3V0XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBWYWx1ZSBmb3IgXCJsYXlvdXRcIiBjYW4gYmUgb25seSBcImNvbHVtbnNcIiBvciBcInJvd3NcIi5gXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24gPSB0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHR9XG5cblx0b3BlbkZpbGUoZmlsZVBhdGgpIHtcblx0XHRjb25zb2xlLmxvZyhcIm9wZW5GaWxlXCIsIGZpbGVQYXRoKVxuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRsb2FkRXhhbXBsZShpZCkge1xuXHRcdGxldCBmaWxlQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhgLi9leGFtcGxlcy8ke2lkfS5tb25gLCBcInV0ZjhcIilcblx0XHR0aGlzLmVkaXRvci5zZXRWYWx1ZShmaWxlQ29udGVudCkgLy8gdGhpcyBoYXMgdG8gYmUgaGVyZSwgSSBkb24ndCBrbm93IHdoeVxuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bmV0d29ya0RlZmluaXRpb246IGZpbGVDb250ZW50XG5cdFx0fSlcblx0fVxuXG5cdGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHRoaXMubG9hZEV4YW1wbGUoXCJDb252b2x1dGlvbmFsTGF5ZXJcIilcblx0fVxuXG5cdGRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSkge1xuXHRcdGlmICh0aGlzLmxvY2spIHsgY2xlYXJUaW1lb3V0KHRoaXMubG9jayk7IH1cblx0XHR0aGlzLmxvY2sgPSBzZXRUaW1lb3V0KCgpID0+IHsgdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSk7IH0sIDEwMCk7XG5cdH1cblxuXHR1cGRhdGVOZXR3b3JrRGVmaW5pdGlvbih2YWx1ZSl7XG5cdFx0Y29uc29sZS50aW1lKFwidXBkYXRlTmV0d29ya0RlZmluaXRpb25cIik7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMucGFyc2VyLm1ha2UodmFsdWUpXG5cblx0XHRpZiAocmVzdWx0LmFzdCkge1xuXHRcdFx0dGhpcy5tb25pZWwud2Fsa0FzdChyZXN1bHQuYXN0KVxuXHRcdFx0bGV0IGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKClcblx0XHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubW9uaWVsLmdldE1ldGFub2Rlc0RlZmluaXRpb25zKClcblx0XHRcdC8vY29uc29sZS5sb2coZGVmaW5pdGlvbnMpXG5cblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogcmVzdWx0LmFzdCxcblx0XHRcdFx0Z3JhcGg6IGdyYXBoLFxuXHRcdFx0XHRnZW5lcmF0ZWRDb2RlOiB0aGlzLmdlbmVyYXRvci5nZW5lcmF0ZUNvZGUoZ3JhcGgsIGRlZmluaXRpb25zKSxcblx0XHRcdFx0aXNzdWVzOiB0aGlzLm1vbmllbC5nZXRJc3N1ZXMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNvbnNvbGUuZXJyb3IocmVzdWx0KTtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogbnVsbCxcblx0XHRcdFx0Z3JhcGg6IG51bGwsXG5cdFx0XHRcdGlzc3VlczogW3tcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0c3RhcnQ6IHJlc3VsdC5wb3NpdGlvbiAtIDEsXG5cdFx0XHRcdFx0XHRlbmQ6IHJlc3VsdC5wb3NpdGlvblxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWVzc2FnZTogXCJFeHBlY3RlZCBcIiArIHJlc3VsdC5leHBlY3RlZCArIFwiLlwiLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0XHR9XVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnNvbGUudGltZUVuZChcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0dG9nZ2xlTGF5b3V0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0bGF5b3V0OiAodGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiKSA/IFwicm93c1wiIDogXCJjb2x1bW5zXCJcblx0XHR9KVxuXHRcdHNldFRpbWVvdXQoKCkgPT4ge1xuXHRcdFx0d2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KFwicmVzaXplXCIpKVxuXHRcdH0sIDEwMClcblx0fVxuXG5cdHJlbmRlcigpIHtcblx0XHRsZXQgY29udGFpbmVyTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXRcblx0XHRsZXQgZ3JhcGhMYXlvdXQgPSB0aGlzLnN0YXRlLmxheW91dCA9PT0gXCJjb2x1bW5zXCIgPyBcIkJUXCIgOiBcIkxSXCJcblxuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIiBjbGFzc05hbWU9e2Bjb250YWluZXIgJHtjb250YWluZXJMYXlvdXR9YH0+XG4gICAgXHRcdDxQYW5lbCBpZD1cImRlZmluaXRpb25cIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRyZWY9eyhyZWYpID0+IHRoaXMuZWRpdG9yID0gcmVmfVxuICAgIFx0XHRcdFx0bW9kZT1cIm1vbmllbFwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0aXNzdWVzPXt0aGlzLnN0YXRlLmlzc3Vlc31cbiAgICBcdFx0XHRcdG9uQ2hhbmdlPXt0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHRcdGRlZmF1bHRWYWx1ZT17dGhpcy5zdGF0ZS5uZXR3b3JrRGVmaW5pdGlvbn1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0XHRcbiAgICBcdFx0PFBhbmVsIGlkPVwidmlzdWFsaXphdGlvblwiPlxuICAgIFx0XHRcdDxWaXN1YWxHcmFwaCBncmFwaD17dGhpcy5zdGF0ZS5ncmFwaH0gbGF5b3V0PXtncmFwaExheW91dH0gLz5cbiAgICBcdFx0PC9QYW5lbD5cblxuXHRcdFx0ey8qXG5cdFx0XHQ8UGFuZWwgdGl0bGU9XCJHZW5lcmF0ZWQgQ29kZVwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdG1vZGU9XCJweXRob25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXt0aGlzLnN0YXRlLmdlbmVyYXRlZENvZGV9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cblx0XHRcdCovfVxuXG4gICAgXHRcdHsvKlxuICAgIFx0XHQ8UGFuZWwgdGl0bGU9XCJBU1RcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwianNvblwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0dmFsdWU9e0pTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0Ki99XG4gICAgXHRcdFxuICAgIFx0PC9kaXY+O1xuICBcdH1cbn0iLCJjbGFzcyBMb2dnZXJ7XG5cdGlzc3VlcyA9IFtdXG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5pc3N1ZXMgPSBbXTtcblx0fVxuXHRcblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmlzc3Vlcztcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dmFyIGYgPSBudWxsO1xuXHRcdHN3aXRjaChpc3N1ZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiZXJyb3JcIjogZiA9IGNvbnNvbGUuZXJyb3I7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndhcm5pbmdcIjogZiA9IGNvbnNvbGUud2FybjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiaW5mb1wiOiBmID0gY29uc29sZS5pbmZvOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IGYgPSBjb25zb2xlLmxvZzsgYnJlYWs7XG5cdFx0fVxuXHRcdGYoaXNzdWUubWVzc2FnZSk7XG5cdFx0dGhpcy5pc3N1ZXMucHVzaChpc3N1ZSk7XG5cdH1cbn0iLCJjb25zdCBwaXhlbFdpZHRoID0gcmVxdWlyZSgnc3RyaW5nLXBpeGVsLXdpZHRoJylcblxuLy8gcmVuYW1lIHRoaXMgdG8gc29tZXRoaW5nIHN1aXRhYmxlXG5jbGFzcyBNb25pZWx7XG5cdC8vIG1heWJlIHNpbmdsZXRvbj9cblx0bG9nZ2VyID0gbmV3IExvZ2dlcigpXG5cdGdyYXBoID0gbmV3IENvbXB1dGF0aW9uYWxHcmFwaCh0aGlzKVxuXG5cdC8vIHRvbyBzb29uLCBzaG91bGQgYmUgaW4gVmlzdWFsR3JhcGhcblx0Y29sb3JIYXNoID0gbmV3IENvbG9ySGFzaFdyYXBwZXIoKVxuXG5cdGRlZmluaXRpb25zID0ge307XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0fVxuXG5cdGFkZERlZmF1bHREZWZpbml0aW9ucygpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBkZWZhdWx0IGRlZmluaXRpb25zLmApO1xuXHRcdGNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcIkFkZFwiLCBcIkxpbmVhclwiLCBcIklucHV0XCIsIFwiT3V0cHV0XCIsIFwiUGxhY2Vob2xkZXJcIiwgXCJWYXJpYWJsZVwiLCBcIkNvbnN0YW50XCIsIFwiTXVsdGlwbHlcIiwgXCJDb252b2x1dGlvblwiLCBcIkRlbnNlXCIsIFwiTWF4UG9vbGluZ1wiLCBcIkJhdGNoTm9ybWFsaXphdGlvblwiLCBcIkRlY29udm9sdXRpb25cIiwgXCJBdmVyYWdlUG9vbGluZ1wiLCBcIkFkYXB0aXZlQXZlcmFnZVBvb2xpbmdcIiwgXCJBZGFwdGl2ZU1heFBvb2xpbmdcIiwgXCJNYXhVbnBvb2xpbmdcIiwgXCJMb2NhbFJlc3BvbnNlTm9ybWFsaXphdGlvblwiLCBcIlBhcmFtZXRyaWNSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiTGVha3lSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiUmFuZG9taXplZFJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMb2dTaWdtb2lkXCIsIFwiVGhyZXNob2xkXCIsIFwiSGFyZFRhbmhcIiwgXCJUYW5oU2hyaW5rXCIsIFwiSGFyZFNocmlua1wiLCBcIkxvZ1NvZnRNYXhcIiwgXCJTb2Z0U2hyaW5rXCIsIFwiU29mdE1heFwiLCBcIlNvZnRNaW5cIiwgXCJTb2Z0UGx1c1wiLCBcIlNvZnRTaWduXCIsIFwiSWRlbnRpdHlcIiwgXCJSZWN0aWZpZWRMaW5lYXJVbml0XCIsIFwiU2lnbW9pZFwiLCBcIkV4cG9uZW50aWFsTGluZWFyVW5pdFwiLCBcIlRhbmhcIiwgXCJBYnNvbHV0ZVwiLCBcIlN1bW1hdGlvblwiLCBcIkRyb3BvdXRcIiwgXCJNYXRyaXhNdWx0aXBseVwiLCBcIkJpYXNBZGRcIiwgXCJSZXNoYXBlXCIsIFwiQ29uY2F0XCIsIFwiRmxhdHRlblwiLCBcIlRlbnNvclwiLCBcIlNvZnRtYXhcIiwgXCJDcm9zc0VudHJvcHlcIiwgXCJaZXJvUGFkZGluZ1wiLCBcIlJhbmRvbU5vcm1hbFwiLCBcIlRydW5jYXRlZE5vcm1hbERpc3RyaWJ1dGlvblwiLCBcIkRvdFByb2R1Y3RcIl07XG5cdFx0ZGVmYXVsdERlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLmFkZERlZmluaXRpb24oZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0YWRkRGVmaW5pdGlvbihkZWZpbml0aW9uTmFtZSkge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdID0ge1xuXHRcdFx0bmFtZTogZGVmaW5pdGlvbk5hbWUsXG5cdFx0XHRjb2xvcjogdGhpcy5jb2xvckhhc2guaGV4KGRlZmluaXRpb25OYW1lKVxuXHRcdH07XG5cdH1cblxuXHRoYW5kbGVJbmxpbmVCbG9ja0RlZmluaXRpb24oc2NvcGUpIHtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShzY29wZS5uYW1lLnZhbHVlKVxuXHRcdHRoaXMud2Fsa0FzdChzY29wZS5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVNZXRhbm9kZShzY29wZS5uYW1lLnZhbHVlLCBzY29wZS5uYW1lLnZhbHVlLCB7XG5cdFx0XHR1c2VyR2VuZXJhdGVkSWQ6IHNjb3BlLm5hbWUudmFsdWUsXG5cdFx0XHRpZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGNsYXNzOiBcIlwiLFxuXHRcdFx0X3NvdXJjZTogc2NvcGUuX3NvdXJjZVxuXHRcdH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbinCoHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBcIiR7YmxvY2tEZWZpbml0aW9uLm5hbWV9XCIgdG8gYXZhaWxhYmxlIGRlZmluaXRpb25zLmApO1xuXHRcdHRoaXMuYWRkRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy5ncmFwaC5lbnRlck1ldGFub2RlU2NvcGUoYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHRcdHRoaXMud2Fsa0FzdChibG9ja0RlZmluaXRpb24uYm9keSk7XG5cdFx0dGhpcy5ncmFwaC5leGl0TWV0YW5vZGVTY29wZSgpO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tEZWZpbml0aW9uQm9keShkZWZpbml0aW9uQm9keSkge1xuXHRcdGRlZmluaXRpb25Cb2R5LmRlZmluaXRpb25zLmZvckVhY2goZGVmaW5pdGlvbiA9PiB0aGlzLndhbGtBc3QoZGVmaW5pdGlvbikpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdC8vIGNvbnNvbGUubG9nKGNvbm5lY3Rpb24ubGlzdClcblx0XHRjb25uZWN0aW9uLmxpc3QuZm9yRWFjaChpdGVtID0+IHtcblx0XHRcdHRoaXMuZ3JhcGguZnJlZXplTm9kZVN0YWNrKCk7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhpdGVtKVxuXHRcdFx0dGhpcy53YWxrQXN0KGl0ZW0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gdGhpcyBpcyBkb2luZyB0b28gbXVjaCDigJMgYnJlYWsgaW50byBcIm5vdCByZWNvZ25pemVkXCIsIFwic3VjY2Vzc1wiIGFuZCBcImFtYmlndW91c1wiXG5cdGhhbmRsZUJsb2NrSW5zdGFuY2UoaW5zdGFuY2UpIHtcblx0XHR2YXIgbm9kZSA9IHtcblx0XHRcdGlkOiB1bmRlZmluZWQsXG5cdFx0XHRjbGFzczogXCJVbmtub3duXCIsXG5cdFx0XHRjb2xvcjogXCJkYXJrZ3JleVwiLFxuXHRcdFx0aGVpZ2h0OiAzMCxcblx0XHRcdHdpZHRoOiAxMDAsXG5cblx0XHRcdF9zb3VyY2U6IGluc3RhbmNlLFxuXHRcdH07XG5cblx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhpbnN0YW5jZS5uYW1lLnZhbHVlKVxuXHRcdC8vIGNvbnNvbGUubG9nKGBNYXRjaGVkIGRlZmluaXRpb25zOmAsIGRlZmluaXRpb25zKTtcblxuXHRcdGlmIChkZWZpbml0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuICAgICAgICAgICAgbm9kZS5pc1VuZGVmaW5lZCA9IHRydWVcblxuICAgICAgICAgICAgdGhpcy5hZGRJc3N1ZSh7XG4gICAgICAgICAgICBcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBObyBwb3NzaWJsZSBtYXRjaGVzIGZvdW5kLmAsXG4gICAgICAgICAgICBcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuICAgICAgICAgICAgXHR0eXBlOiBcImVycm9yXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0bGV0IGRlZmluaXRpb24gPSBkZWZpbml0aW9uc1swXTtcblx0XHRcdGlmIChkZWZpbml0aW9uKSB7XG5cdFx0XHRcdG5vZGUuY29sb3IgPSBkZWZpbml0aW9uLmNvbG9yO1xuXHRcdFx0XHRub2RlLmNsYXNzID0gZGVmaW5pdGlvbi5uYW1lO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmNsYXNzID0gaW5zdGFuY2UubmFtZS52YWx1ZTtcblx0XHRcdHRoaXMuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIG5vZGUgdHlwZSBcIiR7aW5zdGFuY2UubmFtZS52YWx1ZX1cIi4gUG9zc2libGUgbWF0Y2hlczogJHtkZWZpbml0aW9ucy5tYXAoZGVmID0+IGBcIiR7ZGVmLm5hbWV9XCJgKS5qb2luKFwiLCBcIil9LmAsXG5cdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0c3RhcnQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdFx0ZW5kOiAgaW5zdGFuY2UubmFtZS5fc291cmNlLmVuZElkeFxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmICghaW5zdGFuY2UuYWxpYXMpIHtcblx0XHRcdG5vZGUuaWQgPSB0aGlzLmdyYXBoLmdlbmVyYXRlSW5zdGFuY2VJZChub2RlLmNsYXNzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bm9kZS5pZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS51c2VyR2VuZXJhdGVkSWQgPSBpbnN0YW5jZS5hbGlhcy52YWx1ZTtcblx0XHRcdG5vZGUuaGVpZ2h0ID0gNTA7XG5cdFx0fVxuXG5cdFx0Ly8gaXMgbWV0YW5vZGVcblx0XHRpZiAoT2JqZWN0LmtleXModGhpcy5ncmFwaC5tZXRhbm9kZXMpLmluY2x1ZGVzKG5vZGUuY2xhc3MpKSB7XG5cdFx0XHR2YXIgY29sb3IgPSBkMy5jb2xvcihub2RlLmNvbG9yKTtcblx0XHRcdGNvbG9yLm9wYWNpdHkgPSAwLjE7XG5cdFx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKG5vZGUuaWQsIG5vZGUuY2xhc3MsIHtcblx0XHRcdFx0Li4ubm9kZSxcblx0XHRcdFx0c3R5bGU6IHtcImZpbGxcIjogY29sb3IudG9TdHJpbmcoKX1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdpZHRoID0gMjAgKyBNYXRoLm1heCguLi5bbm9kZS5jbGFzcywgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZCA6IFwiXCJdLm1hcChzdHJpbmcgPT4gcGl4ZWxXaWR0aChzdHJpbmcsIHtzaXplOiAxNn0pKSlcblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShub2RlLmlkLCB7XG5cdFx0XHQuLi5ub2RlLFxuICAgICAgICAgICAgc3R5bGU6IHtmaWxsOiBub2RlLmNvbG9yfSxcblx0XHRcdHdpZHRoXG4gICAgICAgIH0pO1xuXHR9XG5cblx0aGFuZGxlQmxvY2tMaXN0KGxpc3QpIHtcblx0XHRsaXN0Lmxpc3QuZm9yRWFjaChpdGVtID0+IHRoaXMud2Fsa0FzdChpdGVtKSk7XG5cdH1cblxuXHRoYW5kbGVJZGVudGlmaWVyKGlkZW50aWZpZXIpIHtcblx0XHR0aGlzLmdyYXBoLnJlZmVyZW5jZU5vZGUoaWRlbnRpZmllci52YWx1ZSk7XG5cdH1cblxuXHRtYXRjaEluc3RhbmNlTmFtZVRvRGVmaW5pdGlvbnMocXVlcnkpIHtcblx0XHR2YXIgZGVmaW5pdGlvbnMgPSBPYmplY3Qua2V5cyh0aGlzLmRlZmluaXRpb25zKTtcblx0XHRsZXQgZGVmaW5pdGlvbktleXMgPSBNb25pZWwubmFtZVJlc29sdXRpb24ocXVlcnksIGRlZmluaXRpb25zKTtcblx0XHQvL2NvbnNvbGUubG9nKFwiRm91bmQga2V5c1wiLCBkZWZpbml0aW9uS2V5cyk7XG5cdFx0bGV0IG1hdGNoZWREZWZpbml0aW9ucyA9IGRlZmluaXRpb25LZXlzLm1hcChrZXkgPT4gdGhpcy5kZWZpbml0aW9uc1trZXldKTtcblx0XHRyZXR1cm4gbWF0Y2hlZERlZmluaXRpb25zO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRNZXRhbm9kZXNEZWZpbml0aW9ucygpIHtcblx0XHRyZXR1cm4gdGhpcy5ncmFwaC5nZXRNZXRhbm9kZXMoKVxuXHR9XG5cblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmxvZ2dlci5nZXRJc3N1ZXMoKTtcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dGhpcy5sb2dnZXIuYWRkSXNzdWUoaXNzdWUpO1xuXHR9XG5cblx0c3RhdGljIG5hbWVSZXNvbHV0aW9uKHBhcnRpYWwsIGxpc3QpIHtcblx0XHRsZXQgc3BsaXRSZWdleCA9IC8oPz1bMC05QS1aXSkvO1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoc3BsaXRSZWdleCk7XG5cdCAgICBsZXQgbGlzdEFycmF5ID0gbGlzdC5tYXAoZGVmaW5pdGlvbiA9PiBkZWZpbml0aW9uLnNwbGl0KHNwbGl0UmVnZXgpKTtcblx0ICAgIHZhciByZXN1bHQgPSBsaXN0QXJyYXkuZmlsdGVyKHBvc3NpYmxlTWF0Y2ggPT4gTW9uaWVsLmlzTXVsdGlQcmVmaXgocGFydGlhbEFycmF5LCBwb3NzaWJsZU1hdGNoKSk7XG5cdCAgICByZXN1bHQgPSByZXN1bHQubWFwKGl0ZW0gPT4gaXRlbS5qb2luKFwiXCIpKTtcblx0ICAgIHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRzdGF0aWMgaXNNdWx0aVByZWZpeChuYW1lLCB0YXJnZXQpIHtcblx0ICAgIGlmIChuYW1lLmxlbmd0aCAhPT0gdGFyZ2V0Lmxlbmd0aCkgeyByZXR1cm4gZmFsc2U7IH1cblx0ICAgIHZhciBpID0gMDtcblx0ICAgIHdoaWxlKGkgPCBuYW1lLmxlbmd0aCAmJiB0YXJnZXRbaV0uc3RhcnRzV2l0aChuYW1lW2ldKSkgeyBpICs9IDE7IH1cblx0ICAgIHJldHVybiAoaSA9PT0gbmFtZS5sZW5ndGgpOyAvLyBnb3QgdG8gdGhlIGVuZD9cblx0fVxuXG5cdGhhbmRsZVVucmVjb2duaXplZE5vZGUobm9kZSkge1xuXHRcdGNvbnNvbGUud2FybihcIldoYXQgdG8gZG8gd2l0aCB0aGlzIEFTVCBub2RlP1wiLCBub2RlKTtcblx0fVxuXG5cdHdhbGtBc3Qobm9kZSkge1xuXHRcdGlmICghbm9kZSkgeyBjb25zb2xlLmVycm9yKFwiTm8gbm9kZT8hXCIpOyByZXR1cm47IH1cblxuXHRcdHN3aXRjaCAobm9kZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiTmV0d29ya1wiOiB0aGlzLmhhbmRsZU5ldHdvcmtEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvbkJvZHlcIjogdGhpcy5oYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJJbmxpbmVCbG9ja0RlZmluaXRpb25cIjogdGhpcy5oYW5kbGVJbmxpbmVCbG9ja0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlQ29ubmVjdGlvbkRlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrSW5zdGFuY2VcIjogdGhpcy5oYW5kbGVCbG9ja0luc3RhbmNlKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJCbG9ja0xpc3RcIjogdGhpcy5oYW5kbGVCbG9ja0xpc3Qobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklkZW50aWZpZXJcIjogdGhpcy5oYW5kbGVJZGVudGlmaWVyKG5vZGUpOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IHRoaXMuaGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKTtcblx0XHR9XG5cdH1cbn0iLCJjbGFzcyBQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiA8ZGl2IGlkPXt0aGlzLnByb3BzLmlkfSBjbGFzc05hbWU9XCJwYW5lbFwiPlxuICAgIFx0e3RoaXMucHJvcHMuY2hpbGRyZW59XG4gICAgPC9kaXY+O1xuICB9XG59IiwiY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcbmNvbnN0IG9obSA9IHJlcXVpcmUoXCJvaG0tanNcIilcblxuY2xhc3MgUGFyc2Vye1xuXHRjb250ZW50cyA9IG51bGxcblx0Z3JhbW1hciA9IG51bGxcblx0XG5cdGV2YWxPcGVyYXRpb24gPSB7XG5cdFx0TmV0d29yazogZnVuY3Rpb24oZGVmaW5pdGlvbnMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiTmV0d29ya1wiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0RlZmluaXRpb246IGZ1bmN0aW9uKF8sIGxheWVyTmFtZSwgcGFyYW1zLCBib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRuYW1lOiBsYXllck5hbWUuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRib2R5OiBib2R5LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0SW5saW5lQmxvY2tEZWZpbml0aW9uOiBmdW5jdGlvbihuYW1lLCBfLCBib2R5KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIklubGluZUJsb2NrRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0Ym9keTogYm9keS5ldmFsKCksXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRJbmxpbmVCbG9ja0RlZmluaXRpb25Cb2R5OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0dmFyIGRlZmluaXRpb25zID0gbGlzdC5ldmFsKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uQm9keVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMgPyBkZWZpbml0aW9ucyA6IFtdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRDb25uZWN0aW9uRGVmaW5pdGlvbjogZnVuY3Rpb24obGlzdCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJDb25uZWN0aW9uRGVmaW5pdGlvblwiLFxuXHRcdFx0XHRsaXN0OiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tJbnN0YW5jZTogZnVuY3Rpb24oaWQsIGxheWVyTmFtZSwgcGFyYW1zKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkJsb2NrSW5zdGFuY2VcIixcblx0XHRcdFx0bmFtZTogbGF5ZXJOYW1lLmV2YWwoKSxcblx0XHRcdFx0YWxpYXM6IGlkLmV2YWwoKVswXSxcblx0XHRcdFx0cGFyYW1ldGVyczogcGFyYW1zLmV2YWwoKSxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrTmFtZTogZnVuY3Rpb24oaWQsIF8pIHtcblx0XHRcdHJldHVybiBpZC5ldmFsKClcblx0XHR9LFxuXHRcdEJsb2NrTGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFwidHlwZVwiOiBcIkJsb2NrTGlzdFwiLFxuXHRcdFx0XHRcImxpc3RcIjogbGlzdC5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvblBhcmFtZXRlcnM6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHRyZXR1cm4gbGlzdC5ldmFsKClcblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvbkJvZHk6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBsaXN0LmV2YWwoKVswXSBcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uQm9keVwiLFxuXHRcdFx0XHRkZWZpbml0aW9uczogZGVmaW5pdGlvbnMgPyBkZWZpbml0aW9ucyA6IFtdXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0luc3RhbmNlUGFyYW1ldGVyczogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0UGFyYW1ldGVyOiBmdW5jdGlvbihuYW1lLCBfLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJQYXJhbWV0ZXJcIixcblx0XHRcdFx0bmFtZTogbmFtZS5ldmFsKCksXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZS5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdFZhbHVlOiBmdW5jdGlvbih2YWwpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiVmFsdWVcIixcblx0XHRcdFx0dmFsdWU6IHZhbC5zb3VyY2UuY29udGVudHNcblx0XHRcdH1cblx0XHR9LFxuXHRcdFZhbHVlTGlzdDogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0Tm9uZW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKHgsIF8sIHhzKSB7XG5cdFx0XHRyZXR1cm4gW3guZXZhbCgpXS5jb25jYXQoeHMuZXZhbCgpKVxuXHRcdH0sXG5cdFx0RW1wdHlMaXN0T2Y6IGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIFtdXG5cdFx0fSxcblx0XHRibG9ja0lkZW50aWZpZXI6IGZ1bmN0aW9uKF8sIF9fLCBfX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRwYXJhbWV0ZXJOYW1lOiBmdW5jdGlvbihhKSB7XG5cdFx0XHRyZXR1cm4gYS5zb3VyY2UuY29udGVudHNcblx0XHR9LFxuXHRcdGJsb2NrVHlwZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tUeXBlXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdGJsb2NrTmFtZTogZnVuY3Rpb24oXywgX18pIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSWRlbnRpZmllclwiLFxuXHRcdFx0XHR2YWx1ZTogdGhpcy5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdF9zb3VyY2U6IHRoaXMuc291cmNlXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jb250ZW50cyA9IGZzLnJlYWRGaWxlU3luYyhcInNyYy9tb25pZWwub2htXCIsIFwidXRmOFwiKVxuXHRcdHRoaXMuZ3JhbW1hciA9IG9obS5ncmFtbWFyKHRoaXMuY29udGVudHMpXG5cdFx0dGhpcy5zZW1hbnRpY3MgPSB0aGlzLmdyYW1tYXIuY3JlYXRlU2VtYW50aWNzKCkuYWRkT3BlcmF0aW9uKFwiZXZhbFwiLCB0aGlzLmV2YWxPcGVyYXRpb24pXG5cdH1cblxuXHRtYWtlKHNvdXJjZSkge1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLmdyYW1tYXIubWF0Y2goc291cmNlKVxuXG5cdFx0aWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHRcdFx0dmFyIGFzdCA9IHRoaXMuc2VtYW50aWNzKHJlc3VsdCkuZXZhbCgpXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRhc3Rcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGV4cGVjdGVkID0gcmVzdWx0LmdldEV4cGVjdGVkVGV4dCgpXG5cdFx0XHR2YXIgcG9zaXRpb24gPSByZXN1bHQuZ2V0UmlnaHRtb3N0RmFpbHVyZVBvc2l0aW9uKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGV4cGVjdGVkLFxuXHRcdFx0XHRwb3NpdGlvblxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG59IiwiY2xhc3MgUHlUb3JjaEdlbmVyYXRvciB7XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuYnVpbHRpbnMgPSBbXCJBcml0aG1ldGljRXJyb3JcIiwgXCJBc3NlcnRpb25FcnJvclwiLCBcIkF0dHJpYnV0ZUVycm9yXCIsIFwiQmFzZUV4Y2VwdGlvblwiLCBcIkJsb2NraW5nSU9FcnJvclwiLCBcIkJyb2tlblBpcGVFcnJvclwiLCBcIkJ1ZmZlckVycm9yXCIsIFwiQnl0ZXNXYXJuaW5nXCIsIFwiQ2hpbGRQcm9jZXNzRXJyb3JcIiwgXCJDb25uZWN0aW9uQWJvcnRlZEVycm9yXCIsIFwiQ29ubmVjdGlvbkVycm9yXCIsIFwiQ29ubmVjdGlvblJlZnVzZWRFcnJvclwiLCBcIkNvbm5lY3Rpb25SZXNldEVycm9yXCIsIFwiRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiRU9GRXJyb3JcIiwgXCJFbGxpcHNpc1wiLCBcIkVudmlyb25tZW50RXJyb3JcIiwgXCJFeGNlcHRpb25cIiwgXCJGYWxzZVwiLCBcIkZpbGVFeGlzdHNFcnJvclwiLCBcIkZpbGVOb3RGb3VuZEVycm9yXCIsIFwiRmxvYXRpbmdQb2ludEVycm9yXCIsIFwiRnV0dXJlV2FybmluZ1wiLCBcIkdlbmVyYXRvckV4aXRcIiwgXCJJT0Vycm9yXCIsIFwiSW1wb3J0RXJyb3JcIiwgXCJJbXBvcnRXYXJuaW5nXCIsIFwiSW5kZW50YXRpb25FcnJvclwiLCBcIkluZGV4RXJyb3JcIiwgXCJJbnRlcnJ1cHRlZEVycm9yXCIsIFwiSXNBRGlyZWN0b3J5RXJyb3JcIiwgXCJLZXlFcnJvclwiLCBcIktleWJvYXJkSW50ZXJydXB0XCIsIFwiTG9va3VwRXJyb3JcIiwgXCJNZW1vcnlFcnJvclwiLCBcIk1vZHVsZU5vdEZvdW5kRXJyb3JcIiwgXCJOYW1lRXJyb3JcIiwgXCJOb25lXCIsIFwiTm90QURpcmVjdG9yeUVycm9yXCIsIFwiTm90SW1wbGVtZW50ZWRcIiwgXCJOb3RJbXBsZW1lbnRlZEVycm9yXCIsIFwiT1NFcnJvclwiLCBcIk92ZXJmbG93RXJyb3JcIiwgXCJQZW5kaW5nRGVwcmVjYXRpb25XYXJuaW5nXCIsIFwiUGVybWlzc2lvbkVycm9yXCIsIFwiUHJvY2Vzc0xvb2t1cEVycm9yXCIsIFwiUmVjdXJzaW9uRXJyb3JcIiwgXCJSZWZlcmVuY2VFcnJvclwiLCBcIlJlc291cmNlV2FybmluZ1wiLCBcIlJ1bnRpbWVFcnJvclwiLCBcIlJ1bnRpbWVXYXJuaW5nXCIsIFwiU3RvcEFzeW5jSXRlcmF0aW9uXCIsIFwiU3RvcEl0ZXJhdGlvblwiLCBcIlN5bnRheEVycm9yXCIsIFwiU3ludGF4V2FybmluZ1wiLCBcIlN5c3RlbUVycm9yXCIsIFwiU3lzdGVtRXhpdFwiLCBcIlRhYkVycm9yXCIsIFwiVGltZW91dEVycm9yXCIsIFwiVHJ1ZVwiLCBcIlR5cGVFcnJvclwiLCBcIlVuYm91bmRMb2NhbEVycm9yXCIsIFwiVW5pY29kZURlY29kZUVycm9yXCIsIFwiVW5pY29kZUVuY29kZUVycm9yXCIsIFwiVW5pY29kZUVycm9yXCIsIFwiVW5pY29kZVRyYW5zbGF0ZUVycm9yXCIsIFwiVW5pY29kZVdhcm5pbmdcIiwgXCJVc2VyV2FybmluZ1wiLCBcIlZhbHVlRXJyb3JcIiwgXCJXYXJuaW5nXCIsIFwiWmVyb0RpdmlzaW9uRXJyb3JcIiwgXCJfX2J1aWxkX2NsYXNzX19cIiwgXCJfX2RlYnVnX19cIiwgXCJfX2RvY19fXCIsIFwiX19pbXBvcnRfX1wiLCBcIl9fbG9hZGVyX19cIiwgXCJfX25hbWVfX1wiLCBcIl9fcGFja2FnZV9fXCIsIFwiX19zcGVjX19cIiwgXCJhYnNcIiwgXCJhbGxcIiwgXCJhbnlcIiwgXCJhc2NpaVwiLCBcImJpblwiLCBcImJvb2xcIiwgXCJieXRlYXJyYXlcIiwgXCJieXRlc1wiLCBcImNhbGxhYmxlXCIsIFwiY2hyXCIsIFwiY2xhc3NtZXRob2RcIiwgXCJjb21waWxlXCIsIFwiY29tcGxleFwiLCBcImNvcHlyaWdodFwiLCBcImNyZWRpdHNcIiwgXCJkZWxhdHRyXCIsIFwiZGljdFwiLCBcImRpclwiLCBcImRpdm1vZFwiLCBcImVudW1lcmF0ZVwiLCBcImV2YWxcIiwgXCJleGVjXCIsIFwiZXhpdFwiLCBcImZpbHRlclwiLCBcImZsb2F0XCIsIFwiZm9ybWF0XCIsIFwiZnJvemVuc2V0XCIsIFwiZ2V0YXR0clwiLCBcImdsb2JhbHNcIiwgXCJoYXNhdHRyXCIsIFwiaGFzaFwiLCBcImhlbHBcIiwgXCJoZXhcIiwgXCJpZFwiLCBcImlucHV0XCIsIFwiaW50XCIsIFwiaXNpbnN0YW5jZVwiLCBcImlzc3ViY2xhc3NcIiwgXCJpdGVyXCIsIFwibGVuXCIsIFwibGljZW5zZVwiLCBcImxpc3RcIiwgXCJsb2NhbHNcIiwgXCJtYXBcIiwgXCJtYXhcIiwgXCJtZW1vcnl2aWV3XCIsIFwibWluXCIsIFwibmV4dFwiLCBcIm9iamVjdFwiLCBcIm9jdFwiLCBcIm9wZW5cIiwgXCJvcmRcIiwgXCJwb3dcIiwgXCJwcmludFwiLCBcInByb3BlcnR5XCIsIFwicXVpdFwiLCBcInJhbmdlXCIsIFwicmVwclwiLCBcInJldmVyc2VkXCIsIFwicm91bmRcIiwgXCJzZXRcIiwgXCJzZXRhdHRyXCIsIFwic2xpY2VcIiwgXCJzb3J0ZWRcIiwgXCJzdGF0aWNtZXRob2RcIiwgXCJzdHJcIiwgXCJzdW1cIiwgXCJzdXBlclwiLCBcInR1cGxlXCIsIFwidHlwZVwiLCBcInZhcnNcIiwgXCJ6aXBcIl1cblx0XHR0aGlzLmtleXdvcmRzID0gW1wiYW5kXCIsIFwiYXNcIiwgXCJhc3NlcnRcIiwgXCJicmVha1wiLCBcImNsYXNzXCIsIFwiY29udGludWVcIiwgXCJkZWZcIiwgXCJkZWxcIiwgXCJlbGlmXCIsIFwiZWxzZVwiLCBcImV4Y2VwdFwiLCBcImV4ZWNcIiwgXCJmaW5hbGx5XCIsIFwiZm9yXCIsIFwiZnJvbVwiLCBcImdsb2JhbFwiLCBcImlmXCIsIFwiaW1wb3J0XCIsIFwiaW5cIiwgXCJpc1wiLCBcImxhbWJkYVwiLCBcIm5vdFwiLCBcIm9yXCIsIFwicGFzc1wiLCBcInByaW50XCIsIFwicmFpc2VcIiwgXCJyZXR1cm5cIiwgXCJ0cnlcIiwgXCJ3aGlsZVwiLCBcIndpdGhcIiwgXCJ5aWVsZFwiXVxuXHR9XG5cbiAgICBzYW5pdGl6ZShpZCkge1xuXHRcdHZhciBzYW5pdGl6ZWRJZCA9IGlkXG5cdFx0aWYgKHRoaXMuYnVpbHRpbnMuaW5jbHVkZXMoc2FuaXRpemVkSWQpIHx8IHRoaXMua2V5d29yZHMuaW5jbHVkZXMoc2FuaXRpemVkSWQpKSB7XG5cdFx0XHRzYW5pdGl6ZWRJZCA9IFwiX1wiICsgc2FuaXRpemVkSWRcblx0XHR9XG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC4vZywgXCJ0aGlzXCIpXG5cdFx0c2FuaXRpemVkSWQgPSBzYW5pdGl6ZWRJZC5yZXBsYWNlKC9cXC8vZywgXCIuXCIpXG5cdFx0cmV0dXJuIHNhbml0aXplZElkXG5cdH1cblxuXHRtYXBUb0Z1bmN0aW9uKG5vZGVUeXBlKSB7XG5cdFx0bGV0IHRyYW5zbGF0aW9uVGFibGUgPSB7XG5cdFx0XHRcIkNvbnZvbHV0aW9uXCI6IFwiRi5jb252MmRcIixcblx0XHRcdFwiRGVjb252b2x1dGlvblwiOiBcIkYuY29udl90cmFuc3Bvc2UyZFwiLFxuXHRcdFx0XCJBdmVyYWdlUG9vbGluZ1wiOiBcIkYuYXZnX3Bvb2wyZFwiLFxuXHRcdFx0XCJBZGFwdGl2ZUF2ZXJhZ2VQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9hdmdfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFBvb2xpbmdcIjogXCJGLm1heF9wb29sMmRcIixcblx0XHRcdFwiQWRhcHRpdmVNYXhQb29saW5nXCI6IFwiRi5hZGFwdGl2ZV9tYXhfcG9vbDJkXCIsXG5cdFx0XHRcIk1heFVucG9vbGluZ1wiOiBcIkYubWF4X3VucG9vbDJkXCIsXG5cdFx0XHRcIlJlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnJlbHVcIixcblx0XHRcdFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCI6IFwiRi5lbHVcIixcblx0XHRcdFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIjogXCJGLnByZWx1XCIsXG5cdFx0XHRcIkxlYWt5UmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYubGVha3lfcmVsdVwiLFxuXHRcdFx0XCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucnJlbHVcIixcblx0XHRcdFwiU2lnbW9pZFwiOiBcIkYuc2lnbW9pZFwiLFxuXHRcdFx0XCJMb2dTaWdtb2lkXCI6IFwiRi5sb2dzaWdtb2lkXCIsXG5cdFx0XHRcIlRocmVzaG9sZFwiOiBcIkYudGhyZXNob2xkXCIsXG5cdFx0XHRcIkhhcmRUYW5oXCI6IFwiRi5oYXJkdGFuaFwiLFxuXHRcdFx0XCJUYW5oXCI6IFwiRi50YW5oXCIsXG5cdFx0XHRcIlRhbmhTaHJpbmtcIjogXCJGLnRhbmhzaHJpbmtcIixcblx0XHRcdFwiSGFyZFNocmlua1wiOiBcIkYuaGFyZHNocmlua1wiLFxuXHRcdFx0XCJMb2dTb2Z0TWF4XCI6IFwiRi5sb2dfc29mdG1heFwiLFxuXHRcdFx0XCJTb2Z0U2hyaW5rXCI6IFwiRi5zb2Z0c2hyaW5rXCIsXG5cdFx0XHRcIlNvZnRNYXhcIjogXCJGLnNvZnRtYXhcIixcblx0XHRcdFwiU29mdE1pblwiOiBcIkYuc29mdG1pblwiLFxuXHRcdFx0XCJTb2Z0UGx1c1wiOiBcIkYuc29mdHBsdXNcIixcblx0XHRcdFwiU29mdFNpZ25cIjogXCJGLnNvZnRzaWduXCIsXG5cdFx0XHRcIkJhdGNoTm9ybWFsaXphdGlvblwiOiBcIkYuYmF0Y2hfbm9ybVwiLFxuXHRcdFx0XCJMaW5lYXJcIjogXCJGLmxpbmVhclwiLFxuXHRcdFx0XCJEcm9wb3V0XCI6IFwiRi5kcm9wb3V0XCIsXG5cdFx0XHRcIlBhaXJ3aXNlRGlzdGFuY2VcIjogXCJGLnBhaXJ3aXNlX2Rpc3RhbmNlXCIsXG5cdFx0XHRcIkNyb3NzRW50cm9weVwiOiBcIkYuY3Jvc3NfZW50cm9weVwiLFxuXHRcdFx0XCJCaW5hcnlDcm9zc0VudHJvcHlcIjogXCJGLmJpbmFyeV9jcm9zc19lbnRyb3B5XCIsXG5cdFx0XHRcIkt1bGxiYWNrTGVpYmxlckRpdmVyZ2VuY2VMb3NzXCI6IFwiRi5rbF9kaXZcIixcblx0XHRcdFwiUGFkXCI6IFwiRi5wYWRcIixcblx0XHRcdFwiVmFyaWFibGVcIjogXCJBRy5WYXJpYWJsZVwiLFxuXHRcdFx0XCJSYW5kb21Ob3JtYWxcIjogXCJULnJhbmRuXCIsXG5cdFx0XHRcIlRlbnNvclwiOiBcIlQuVGVuc29yXCJcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShub2RlVHlwZSkgPyB0cmFuc2xhdGlvblRhYmxlW25vZGVUeXBlXSA6IG5vZGVUeXBlXG5cblx0fVxuXG5cdGluZGVudChjb2RlLCBsZXZlbCA9IDEsIGluZGVudFBlckxldmVsID0gXCIgICAgXCIpIHtcblx0XHRsZXQgaW5kZW50ID0gaW5kZW50UGVyTGV2ZWwucmVwZWF0KGxldmVsKVxuXHRcdHJldHVybiBjb2RlLnNwbGl0KFwiXFxuXCIpLm1hcChsaW5lID0+IGluZGVudCArIGxpbmUpLmpvaW4oXCJcXG5cIilcblx0fVxuXG5cdGdlbmVyYXRlQ29kZShncmFwaCwgZGVmaW5pdGlvbnMpIHtcblx0XHRsZXQgaW1wb3J0cyA9XG5gaW1wb3J0IHRvcmNoIGFzIFRcbmltcG9ydCB0b3JjaC5ubi5mdW5jdGlvbmFsIGFzIEZcbmltcG9ydCB0b3JjaC5hdXRvZ3JhZCBhcyBBR2BcblxuXHRcdGxldCBtb2R1bGVEZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKGRlZmluaXRpb25zKS5tYXAoZGVmaW5pdGlvbk5hbWUgPT4ge1xuXHRcdFx0aWYgKGRlZmluaXRpb25OYW1lICE9PSBcIm1haW5cIikge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZW5lcmF0ZUNvZGVGb3JNb2R1bGUoZGVmaW5pdGlvbk5hbWUsIGRlZmluaXRpb25zW2RlZmluaXRpb25OYW1lXSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vcmV0dXJuIFwiXCJcblx0XHRcdH1cblx0XHR9KVxuXG5cdFx0bGV0IGNvZGUgPVxuYCR7aW1wb3J0c31cblxuJHttb2R1bGVEZWZpbml0aW9ucy5qb2luKFwiXFxuXCIpfVxuYFxuXG5cdFx0cmV0dXJuIGNvZGVcblx0fVxuXG5cdGdlbmVyYXRlQ29kZUZvck1vZHVsZShjbGFzc25hbWUsIGdyYXBoKSB7XG5cdFx0bGV0IHRvcG9sb2dpY2FsT3JkZXJpbmcgPSBncmFwaGxpYi5hbGcudG9wc29ydChncmFwaClcblx0XHRsZXQgZm9yd2FyZEZ1bmN0aW9uID0gXCJcIlxuXG5cdFx0dG9wb2xvZ2ljYWxPcmRlcmluZy5tYXAobm9kZSA9PiB7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhcIm11XCIsIG5vZGUpXG5cdFx0XHRsZXQgbiA9IGdyYXBoLm5vZGUobm9kZSlcblx0XHRcdGxldCBjaCA9IGdyYXBoLmNoaWxkcmVuKG5vZGUpXG5cblx0XHRcdGlmICghbikge1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdC8vIGNvbnNvbGUubG9nKG4pXG5cblx0XHRcdGlmIChjaC5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0bGV0IGluTm9kZXMgPSBncmFwaC5pbkVkZ2VzKG5vZGUpLm1hcChlID0+IHRoaXMuc2FuaXRpemUoZS52KSlcblx0XHRcdFx0Zm9yd2FyZEZ1bmN0aW9uICs9IGAke3RoaXMuc2FuaXRpemUobm9kZSl9ID0gJHt0aGlzLm1hcFRvRnVuY3Rpb24obi5jbGFzcyl9KCR7aW5Ob2Rlcy5qb2luKFwiLCBcIil9KVxcbmBcblx0XHRcdH0gXG5cdFx0fSwgdGhpcylcblxuXHRcdGxldCBtb2R1bGVDb2RlID1cbmBjbGFzcyAke2NsYXNzbmFtZX0oVC5ubi5Nb2R1bGUpOlxuICAgIGRlZiBfX2luaXRfXyhzZWxmLCBwYXJhbTEsIHBhcmFtMik6ICMgcGFyYW1ldGVycyBoZXJlXG4gICAgICAgIHN1cGVyKCR7Y2xhc3NuYW1lfSwgc2VsZikuX19pbml0X18oKVxuICAgICAgICAjIGFsbCBkZWNsYXJhdGlvbnMgaGVyZVxuXG4gICAgZGVmIGZvcndhcmQoc2VsZiwgaW4xLCBpbjIpOiAjIGFsbCBJbnB1dHMgaGVyZVxuICAgICAgICAjIGFsbCBmdW5jdGlvbmFsIHN0dWZmIGhlcmVcbiR7dGhpcy5pbmRlbnQoZm9yd2FyZEZ1bmN0aW9uLCAyKX1cbiAgICAgICAgcmV0dXJuIChvdXQxLCBvdXQyKSAjIGFsbCBPdXRwdXRzIGhlcmVcbmBcblx0XHRyZXR1cm4gbW9kdWxlQ29kZVxuXHR9XG59IiwiY2xhc3MgU2NvcGVTdGFja3tcblx0c2NvcGVTdGFjayA9IFtdXG5cblx0Y29uc3RydWN0b3Ioc2NvcGUgPSBbXSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KHNjb3BlKSkge1xuXHRcdFx0dGhpcy5zY29wZVN0YWNrID0gc2NvcGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIGluaXRpYWxpemF0aW9uIG9mIHNjb3BlIHN0YWNrLlwiLCBzY29wZSk7XG5cdFx0fVxuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmNsZWFyKCk7XG5cdH1cblxuXHRwdXNoKHNjb3BlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goc2NvcGUpO1xuXHR9XG5cblx0cG9wKCkge1xuXHRcdHJldHVybiB0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGN1cnJlbnRTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5qb2luKFwiL1wiKTtcblx0fVxuXG5cdHByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCkge1xuXHRcdGxldCBjb3B5ID0gQXJyYXkuZnJvbSh0aGlzLnNjb3BlU3RhY2spO1xuXHRcdGNvcHkucG9wKCk7XG5cdFx0cmV0dXJuIGNvcHkuam9pbihcIi9cIik7XG5cdH1cbn0iLCJjbGFzcyBWaXN1YWxHcmFwaCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQgPSBuZXcgR3JhcGhMYXlvdXQodGhpcy5zYXZlR3JhcGguYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAgICAgICBncmFwaDogbnVsbCxcbiAgICAgICAgICAgIHByZXZpb3VzVmlld0JveDogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmFuaW1hdGUgPSBudWxsXG4gICAgfVxuXG4gICAgc2F2ZUdyYXBoKGdyYXBoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgZ3JhcGg6IGdyYXBoXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMobmV4dFByb3BzKSB7XG4gICAgICAgIGlmIChuZXh0UHJvcHMuZ3JhcGgpIHtcbiAgICAgICAgICAgIG5leHRQcm9wcy5ncmFwaC5fbGFiZWwucmFua2RpciA9IG5leHRQcm9wcy5sYXlvdXQ7XG4gICAgICAgICAgICB0aGlzLmdyYXBoTGF5b3V0LmxheW91dChuZXh0UHJvcHMuZ3JhcGgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2hvdWxkQ29tcG9uZW50VXBkYXRlKG5leHRQcm9wcywgbmV4dFN0YXRlKSB7XG4gICAgICAgIHJldHVybiAodGhpcy5zdGF0ZSAhPT0gbmV4dFN0YXRlKVxuICAgIH1cblxuICAgIGhhbmRsZUNsaWNrKG5vZGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJDbGlja2VkXCIsIG5vZGUpO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlbGVjdGVkTm9kZTogbm9kZS5pZFxuICAgICAgICB9KVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBkb21Ob2RlXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hbmltYXRlLmJlZ2luRWxlbWVudCgpXG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBpZiAoIXRoaXMuc3RhdGUuZ3JhcGgpIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuc3RhdGUuZ3JhcGgpXG4gICAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGcgPSB0aGlzLnN0YXRlLmdyYXBoO1xuXG4gICAgICAgIGxldCBub2RlcyA9IGcubm9kZXMoKS5tYXAobm9kZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGdyYXBoID0gdGhpcztcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKG5vZGVOYW1lKTtcbiAgICAgICAgICAgIGxldCBub2RlID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBwcm9wcyA9IHtcbiAgICAgICAgICAgICAgICBrZXk6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgIG5vZGU6IG4sXG4gICAgICAgICAgICAgICAgb25DbGljazogZ3JhcGguaGFuZGxlQ2xpY2suYmluZChncmFwaClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG4uaXNNZXRhbm9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIG5vZGUgPSA8TWV0YW5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG4udXNlckdlbmVyYXRlZElkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8SWRlbnRpZmllZE5vZGUgey4uLnByb3BzfSAvPjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlID0gPEFub255bW91c05vZGUgey4uLnByb3BzfSAvPlxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxldCBlZGdlcyA9IGcuZWRnZXMoKS5tYXAoZWRnZU5hbWUgPT4ge1xuICAgICAgICAgICAgbGV0IGUgPSBnLmVkZ2UoZWRnZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIDxFZGdlIGtleT17YCR7ZWRnZU5hbWUudn0tPiR7ZWRnZU5hbWUud31gfSBlZGdlPXtlfS8+XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB2aWV3Qm94X3dob2xlID0gYDAgMCAke2cuZ3JhcGgoKS53aWR0aH0gJHtnLmdyYXBoKCkuaGVpZ2h0fWA7XG4gICAgICAgIHZhciB0cmFuc2Zvcm1WaWV3ID0gYHRyYW5zbGF0ZSgwcHgsMHB4KWAgKyBgc2NhbGUoJHtnLmdyYXBoKCkud2lkdGggLyBnLmdyYXBoKCkud2lkdGh9LCR7Zy5ncmFwaCgpLmhlaWdodCAvIGcuZ3JhcGgoKS5oZWlnaHR9KWA7XG4gICAgICAgIFxuICAgICAgICBsZXQgc2VsZWN0ZWROb2RlID0gdGhpcy5zdGF0ZS5zZWxlY3RlZE5vZGU7XG4gICAgICAgIHZhciB2aWV3Qm94XG4gICAgICAgIGlmIChzZWxlY3RlZE5vZGUpIHtcbiAgICAgICAgICAgIGxldCBuID0gZy5ub2RlKHNlbGVjdGVkTm9kZSk7XG4gICAgICAgICAgICB2aWV3Qm94ID0gYCR7bi54IC0gbi53aWR0aCAvIDJ9ICR7bi55IC0gbi5oZWlnaHQgLyAyfSAke24ud2lkdGh9ICR7bi5oZWlnaHR9YFxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmlld0JveCA9IHZpZXdCb3hfd2hvbGVcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c3ZnIGlkPVwidmlzdWFsaXphdGlvblwiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2ZXJzaW9uPVwiMS4xXCI+XG4gICAgICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcy5yZWFkRmlsZVN5bmMoXCJzcmMvYnVuZGxlLmNzc1wiLCBcInV0Zi04XCIsIChlcnIpID0+IHtjb25zb2xlLmxvZyhlcnIpfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50LmJpbmQodGhpcyl9IGF0dHJpYnV0ZU5hbWU9XCJ2aWV3Qm94XCIgZnJvbT17dmlld0JveF93aG9sZX0gdG89e3ZpZXdCb3h9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIj48L2FuaW1hdGU+XG4gICAgICAgICAgICAgICAgPGRlZnM+XG4gICAgICAgICAgICAgICAgICAgIDxtYXJrZXIgaWQ9XCJhcnJvd1wiIHZpZXdCb3g9XCIwIDAgMTAgMTBcIiByZWZYPVwiMTBcIiByZWZZPVwiNVwiIG1hcmtlclVuaXRzPVwic3Ryb2tlV2lkdGhcIiBtYXJrZXJXaWR0aD1cIjEwXCIgbWFya2VySGVpZ2h0PVwiNy41XCIgb3JpZW50PVwiYXV0b1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMCAwIEwgMTAgNSBMIDAgMTAgTCAzIDUgelwiIGNsYXNzTmFtZT1cImFycm93XCI+PC9wYXRoPlxuICAgICAgICAgICAgICAgICAgICA8L21hcmtlcj5cbiAgICAgICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICAgICAgPGcgaWQ9XCJncmFwaFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZyBpZD1cIm5vZGVzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7bm9kZXN9XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICAgICAgPGcgaWQ9XCJlZGdlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2VkZ2VzfVxuICAgICAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICk7XG4gICAgfVxufVxuXG5jbGFzcyBFZGdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGxpbmUgPSBkMy5saW5lKClcbiAgICAgICAgLmN1cnZlKGQzLmN1cnZlQmFzaXMpXG4gICAgICAgIC54KGQgPT4gZC54KVxuICAgICAgICAueShkID0+IGQueSlcblxuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiBbXVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBwcmV2aW91c1BvaW50czogdGhpcy5wcm9wcy5lZGdlLnBvaW50c1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtb3VudChkb21Ob2RlKSB7XG4gICAgICAgIGlmIChkb21Ob2RlKSB7XG4gICAgICAgICAgICBkb21Ob2RlLmJlZ2luRWxlbWVudCgpICAgIFxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgZSA9IHRoaXMucHJvcHMuZWRnZTtcbiAgICAgICAgbGV0IGwgPSB0aGlzLmxpbmU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9XCJlZGdlXCIgbWFya2VyRW5kPVwidXJsKCNhcnJvdylcIj5cbiAgICAgICAgICAgICAgICA8cGF0aCBkPXtsKGUucG9pbnRzKX0+XG4gICAgICAgICAgICAgICAgICAgIDxhbmltYXRlIHJlZj17dGhpcy5tb3VudH0ga2V5PXtNYXRoLnJhbmRvbSgpfSByZXN0YXJ0PVwiYWx3YXlzXCIgZnJvbT17bCh0aGlzLnN0YXRlLnByZXZpb3VzUG9pbnRzKX0gdG89e2woZS5wb2ludHMpfSBiZWdpbj1cIjBzXCIgZHVyPVwiMC4yNXNcIiBmaWxsPVwiZnJlZXplXCIgcmVwZWF0Q291bnQ9XCIxXCIgYXR0cmlidXRlTmFtZT1cImRcIiAvPlxuICAgICAgICAgICAgICAgIDwvcGF0aD5cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE5vZGUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICBoYW5kbGVDbGljaygpIHtcbiAgICAgICAgdGhpcy5wcm9wcy5vbkNsaWNrKHRoaXMucHJvcHMubm9kZSk7XG4gICAgfVxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIGNvbnN0IHR5cGUgPSBuLmlzTWV0YW5vZGUgPyBcIm1ldGFub2RlXCIgOiBcIm5vZGVcIlxuXG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZyBjbGFzc05hbWU9e2Ake3R5cGV9ICR7bi5jbGFzc31gfSBvbkNsaWNrPXt0aGlzLmhhbmRsZUNsaWNrLmJpbmQodGhpcyl9IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgke01hdGguZmxvb3Iobi54IC0obi53aWR0aC8yKSl9LCR7TWF0aC5mbG9vcihuLnkgLShuLmhlaWdodC8yKSl9KWB9PlxuICAgICAgICAgICAgICAgIDxyZWN0IHdpZHRoPXtuLndpZHRofSBoZWlnaHQ9e24uaGVpZ2h0fSByeD1cIjE1cHhcIiByeT1cIjE1cHhcIiBzdHlsZT17bi5zdHlsZX0gLz5cbiAgICAgICAgICAgICAgICB7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICAgICAgICAgIDwvZz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIE1ldGFub2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgxMCwwKWB9IHRleHRBbmNob3I9XCJzdGFydFwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEFub255bW91c05vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxOb2RlIHsuLi50aGlzLnByb3BzfT5cbiAgICAgICAgICAgICAgICA8dGV4dCB0cmFuc2Zvcm09e2B0cmFuc2xhdGUoJHsobi53aWR0aC8yKSB9LCR7KG4uaGVpZ2h0LzIpfSlgfSB0ZXh0QW5jaG9yPVwibWlkZGxlXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0c3Bhbj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIElkZW50aWZpZWROb2RlIGV4dGVuZHMgTm9kZXtcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIiBzdHlsZT17e2RvbWluYW50QmFzZWxpbmU6IFwiaWRlb2dyYXBoaWNcIn19PlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBjbGFzc05hbWU9XCJpZFwiPntuLnVzZXJHZW5lcmF0ZWRJZH08L3RzcGFuPlxuICAgICAgICAgICAgICAgICAgICA8dHNwYW4geD1cIjBcIiBkeT1cIjEuMmVtXCI+e24uY2xhc3N9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgICA8L05vZGU+XG4gICAgICAgICk7XG4gICAgfVxufSIsImZ1bmN0aW9uIHJ1bigpIHtcbiAgUmVhY3RET00ucmVuZGVyKDxJREUvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vbmllbCcpKTtcbn1cblxuY29uc3QgbG9hZGVkU3RhdGVzID0gWydjb21wbGV0ZScsICdsb2FkZWQnLCAnaW50ZXJhY3RpdmUnXTtcblxuaWYgKGxvYWRlZFN0YXRlcy5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSAmJiBkb2N1bWVudC5ib2R5KSB7XG4gIHJ1bigpO1xufSBlbHNlIHtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBydW4sIGZhbHNlKTtcbn0iXX0=
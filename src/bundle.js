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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29sb3JIYXNoLmpzIiwic2NyaXB0cy9Db21wdXRhdGlvbmFsR3JhcGguanMiLCJzY3JpcHRzL0VkaXRvci5qc3giLCJzY3JpcHRzL0dyYXBoTGF5b3V0LmpzeCIsInNjcmlwdHMvSURFLmpzeCIsInNjcmlwdHMvTG9nZ2VyLmpzIiwic2NyaXB0cy9Nb25pZWwuanMiLCJzY3JpcHRzL1BhbmVsLmpzeCIsInNjcmlwdHMvUGFyc2VyLmpzIiwic2NyaXB0cy9QeVRvcmNoR2VuZXJhdG9yLmpzIiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQU0sZ0I7Ozs7YUFDRixTLEdBQVksSUFBSSxTQUFKLENBQWM7QUFDdEIsd0JBQVksQ0FBQyxHQUFELENBRFU7QUFFdEIsdUJBQVcsQ0FBQyxJQUFELENBRlc7QUFHdEIsa0JBQU0sS0FBSztBQUhXLFNBQWQsQzs7Ozs7aUNBTUgsRyxFQUFLO0FBQ1YsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHdCQUFRLElBQUksVUFBSixDQUFlLENBQWYsQ0FBUjtBQUNIO0FBQ0QsbUJBQU8sSUFBUDtBQUNIOzs7OEJBRUssRyxFQUFLO0FBQ1AsZ0JBQUksT0FBTyxDQUFYO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLE1BQXhCLEVBQWdDLEdBQWhDLEVBQXFDO0FBQ2pDLHVCQUFPLE9BQU8sRUFBUCxHQUFZLElBQUksVUFBSixDQUFlLENBQWYsSUFBb0IsRUFBdkM7QUFDSDtBQUNELG1CQUFPLElBQVA7QUFDSDs7OzRCQUVHLEcsRUFBSztBQUNMLG1CQUFPLEtBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsR0FBbkIsQ0FBUDtBQUNIOzs7Ozs7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QixrQkFBeEIsRUFBNEMsR0FBNUMsRUFBaUQsS0FBakQ7QUFDRCIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBDb2xvckhhc2hXcmFwcGVye1xuICAgIGNvbG9ySGFzaCA9IG5ldyBDb2xvckhhc2goe1xuICAgICAgICBzYXR1cmF0aW9uOiBbMC45XSxcbiAgICAgICAgbGlnaHRuZXNzOiBbMC40NV0sXG4gICAgICAgIGhhc2g6IHRoaXMubWFnaWNcbiAgICB9KVxuXG4gICAgbG9zZUxvc2Uoc3RyKSB7XG4gICAgICAgIHZhciBoYXNoID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGhhc2ggKz0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBtYWdpYyhzdHIpIHtcbiAgICAgICAgdmFyIGhhc2ggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaGFzaCA9IGhhc2ggKiA0NyArIHN0ci5jaGFyQ29kZUF0KGkpICUgMzI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhhc2hcbiAgICB9XG5cbiAgICBoZXgoc3RyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbG9ySGFzaC5oZXgoc3RyKVxuICAgIH1cbn0iLCJjbGFzcyBDb21wdXRhdGlvbmFsR3JhcGh7XG5cdG5vZGVDb3VudGVyID0ge31cblx0X25vZGVTdGFjayA9IFtdXG5cdF9wcmV2aW91c05vZGVTdGFjayA9IFtdXG5cblx0c2NvcGVTdGFjayA9IG5ldyBTY29wZVN0YWNrKClcblxuXHRtZXRhbm9kZXMgPSB7fVxuXHRtZXRhbm9kZVN0YWNrID0gW11cblxuXHRnZXQgZ3JhcGgoKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW2xhc3RJbmRleF07XG5cdH1cblxuXHRnZXQgbm9kZVN0YWNrKCkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHJldHVybiB0aGlzLl9ub2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IG5vZGVTdGFjayh2YWx1ZSkge1xuXHRcdGxldCBsYXN0SW5kZXggPSB0aGlzLm1ldGFub2RlU3RhY2tbdGhpcy5tZXRhbm9kZVN0YWNrLmxlbmd0aCAtIDFdO1xuXHRcdHRoaXMuX25vZGVTdGFja1tsYXN0SW5kZXhdID0gdmFsdWVcblx0fVxuXG5cdGdldCBwcmV2aW91c05vZGVTdGFjaygpIHtcblx0XHRsZXQgbGFzdEluZGV4ID0gdGhpcy5tZXRhbm9kZVN0YWNrW3RoaXMubWV0YW5vZGVTdGFjay5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gdGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XVxuXHR9XG5cblx0c2V0IHByZXZpb3VzTm9kZVN0YWNrKHZhbHVlKSB7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMubWV0YW5vZGVTdGFja1t0aGlzLm1ldGFub2RlU3RhY2subGVuZ3RoIC0gMV07XG5cdFx0dGhpcy5fcHJldmlvdXNOb2RlU3RhY2tbbGFzdEluZGV4XSA9IHZhbHVlXG5cdH1cblxuXHRjb25zdHJ1Y3RvcihwYXJlbnQpIHtcblx0XHR0aGlzLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLm1vbmllbCA9IHBhcmVudDtcblx0fVxuXG5cdGluaXRpYWxpemUoKSB7XG5cdFx0dGhpcy5ub2RlQ291bnRlciA9IHt9XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmNsZWFyTm9kZVN0YWNrKClcblxuXHRcdHRoaXMubm9kZVN0YWNrID0gW11cblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW11cblxuXHRcdHRoaXMubWV0YW5vZGVzID0ge31cblx0XHR0aGlzLm1ldGFub2RlU3RhY2sgPSBbXVxuXG5cdFx0Ly8gY29uc29sZS5sb2coXCJNZXRhbm9kZXM6XCIsIHRoaXMubWV0YW5vZGVzKVxuXHRcdC8vIGNvbnNvbGUubG9nKFwiTWV0YW5vZGUgU3RhY2s6XCIsIHRoaXMubWV0YW5vZGVTdGFjaylcblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyTWV0YW5vZGVTY29wZShuYW1lKSB7XG5cdFx0dGhpcy5tZXRhbm9kZXNbbmFtZV0gPSBuZXcgZ3JhcGhsaWIuR3JhcGgoe1xuXHRcdFx0Y29tcG91bmQ6IHRydWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFub2Rlc1tuYW1lXS5zZXRHcmFwaCh7XG5cdFx0XHRuYW1lOiBuYW1lLFxuXHQgICAgICAgIHJhbmtkaXI6ICdCVCcsXG5cdCAgICAgICAgZWRnZXNlcDogMjAsXG5cdCAgICAgICAgcmFua3NlcDogNDAsXG5cdCAgICAgICAgbm9kZVNlcDogMzAsXG5cdCAgICAgICAgbWFyZ2lueDogMjAsXG5cdCAgICAgICAgbWFyZ2lueTogMjAsXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhbm9kZVN0YWNrLnB1c2gobmFtZSk7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5tZXRhbm9kZVN0YWNrKVxuXG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVzW25hbWVdO1xuXHR9XG5cblx0ZXhpdE1ldGFub2RlU2NvcGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMubWV0YW5vZGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGdlbmVyYXRlSW5zdGFuY2VJZCh0eXBlKSB7XG5cdFx0aWYgKCF0aGlzLm5vZGVDb3VudGVyLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG5cdFx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdID0gMDtcblx0XHR9XG5cdFx0dGhpcy5ub2RlQ291bnRlclt0eXBlXSArPSAxO1xuXHRcdGxldCBpZCA9IFwiYV9cIiArIHR5cGUgKyB0aGlzLm5vZGVDb3VudGVyW3R5cGVdO1xuXHRcdHJldHVybiBpZDtcblx0fVxuXG5cdGFkZE1haW4oKSB7XG5cdFx0dGhpcy5lbnRlck1ldGFub2RlU2NvcGUoXCJtYWluXCIpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKFwiLlwiKTtcblx0XHRsZXQgaWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGlkLCB7XG5cdFx0XHRjbGFzczogXCJcIlxuXHRcdH0pO1xuXHR9XG5cblx0dG91Y2hOb2RlKG5vZGVQYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYFRvdWNoaW5nIG5vZGUgXCIke25vZGVQYXRofVwiLmApXG5cdFx0aWYgKHRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMubm9kZVN0YWNrLnB1c2gobm9kZVBhdGgpXG5cblx0XHRcdGlmICh0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFja1swXSwgbm9kZVBhdGgpXG5cdFx0XHR9IGVsc2UgaWYgKHRoaXMucHJldmlvdXNOb2RlU3RhY2subGVuZ3RoID4gMSkge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UodGhpcy5wcmV2aW91c05vZGVTdGFjaywgbm9kZVBhdGgpXG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnNvbGUud2FybihgVHJ5aW5nIHRvIHRvdWNoIG5vbi1leGlzdGFudCBub2RlIFwiJHtub2RlUGF0aH1cImApO1xuXHRcdH1cblx0fVxuXG5cdHJlZmVyZW5jZU5vZGUoaWQpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0dXNlckdlbmVyYXRlZElkOiBpZCxcblx0XHRcdGNsYXNzOiBcInVuZGVmaW5lZFwiLFxuXHRcdFx0aGVpZ2h0OiA1MFxuXHRcdH1cblxuXHRcdGlmICghdGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdHdpZHRoOiBNYXRoLm1heChub2RlLmNsYXNzLmxlbmd0aCwgbm9kZS51c2VyR2VuZXJhdGVkSWQgPyBub2RlLnVzZXJHZW5lcmF0ZWRJZC5sZW5ndGggOiAwKSAqIDEwXG5cdFx0XHR9KTtcblx0XHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b3VjaE5vZGUobm9kZVBhdGgpO1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNyZWF0ZU5vZGUoaWQsIG5vZGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChpZCk7XG5cdFx0bGV0IG5vZGVQYXRoID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLnNjb3BlU3RhY2sucHJldmlvdXNTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdGlmICh0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGVmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcdFxuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwge1xuXHRcdFx0Li4ubm9kZSxcblx0XHRcdGlkOiBub2RlUGF0aFxuXHRcdH0pO1xuXHRcdHRoaXMuc2V0UGFyZW50KG5vZGVQYXRoLCBzY29wZSk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXG5cdFx0cmV0dXJuIG5vZGVQYXRoO1xuXHR9XG5cblx0Y3JlYXRlTWV0YW5vZGUoaWRlbnRpZmllciwgbWV0YW5vZGVDbGFzcywgbm9kZSkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkZW50aWZpZXIpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0XG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKG5vZGVQYXRoLCB7XG5cdFx0XHQuLi5ub2RlLFxuXHRcdFx0aWQ6IG5vZGVQYXRoLFxuXHRcdFx0aXNNZXRhbm9kZTogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobm9kZVBhdGgsIHNjb3BlKTtcblxuXHRcdGxldCB0YXJnZXRNZXRhbm9kZSA9IHRoaXMubWV0YW5vZGVzW21ldGFub2RlQ2xhc3NdO1xuXHRcdHRhcmdldE1ldGFub2RlLm5vZGVzKCkuZm9yRWFjaChub2RlSWQgPT4ge1xuXHRcdFx0bGV0IG5vZGUgPSB0YXJnZXRNZXRhbm9kZS5ub2RlKG5vZGVJZCk7XG5cdFx0XHRpZiAoIW5vZGUpIHsgcmV0dXJuIH1cblx0XHRcdGxldCBuZXdOb2RlSWQgPSBub2RlSWQucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dmFyIG5ld05vZGUgPSB7XG5cdFx0XHRcdC4uLm5vZGUsXG5cdFx0XHRcdGlkOiBuZXdOb2RlSWRcblx0XHRcdH1cblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShuZXdOb2RlSWQsIG5ld05vZGUpO1xuXG5cdFx0XHRsZXQgbmV3UGFyZW50ID0gdGFyZ2V0TWV0YW5vZGUucGFyZW50KG5vZGVJZCkucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpO1xuXHRcdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQobmV3Tm9kZUlkLCBuZXdQYXJlbnQpO1xuXHRcdH0pO1xuXG5cdFx0dGFyZ2V0TWV0YW5vZGUuZWRnZXMoKS5mb3JFYWNoKGVkZ2UgPT4ge1xuXHRcdFx0Y29uc3QgZSA9IHRhcmdldE1ldGFub2RlLmVkZ2UoZWRnZSlcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShlZGdlLnYucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCBlZGdlLncucmVwbGFjZShcIi5cIiwgbm9kZVBhdGgpLCB7fSk7XG5cdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdH1cblxuXHRjbGVhck5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gW107XG5cdFx0dGhpcy5ub2RlU3RhY2sgPSBbXTtcblx0fVxuXG5cdGZyZWV6ZU5vZGVTdGFjaygpIHtcblx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrID0gWy4uLnRoaXMubm9kZVN0YWNrXTtcblx0XHR0aGlzLm5vZGVTdGFjayA9IFtdO1xuXHR9XG5cblx0c2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLnNldFBhcmVudChjaGlsZFBhdGgsIHBhcmVudFBhdGgpO1xuXHR9XG5cblx0aXNJbnB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIklucHV0XCI7XG5cdH1cblxuXHRpc091dHB1dChub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLm5vZGUobm9kZVBhdGgpLmNsYXNzID09PSBcIk91dHB1dFwiO1xuXHR9XG5cblx0aXNNZXRhbm9kZShub2RlUGF0aCkge1xuXHRcdC8vIGNvbnNvbGUubG9nKFwiaXNNZXRhbm9kZTpcIiwgbm9kZVBhdGgpXG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuaXNNZXRhbm9kZSA9PT0gdHJ1ZTtcblx0fVxuXG5cdGdldE91dHB1dE5vZGVzKHNjb3BlUGF0aCkge1xuXHRcdGxldCBzY29wZSA9IHRoaXMuZ3JhcGgubm9kZShzY29wZVBhdGgpO1xuXHRcdGxldCBvdXRwdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzT3V0cHV0KG5vZGUpIH0pO1xuXG5cdFx0aWYgKG91dHB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2UuZW5kSWR4IDogMFxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1x0XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dE5vZGVzO1xuXHR9XG5cblx0Z2V0SW5wdXROb2RlcyhzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5wdXROb2RlcyA9IHRoaXMuZ3JhcGguY2hpbGRyZW4oc2NvcGVQYXRoKS5maWx0ZXIobm9kZSA9PiB7IHJldHVybiB0aGlzLmlzSW5wdXQobm9kZSl9KTtcblxuXHRcdGlmIChpbnB1dE5vZGVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0bWVzc2FnZTogYE1ldGFub2RlIFwiJHtzY29wZS5pZH1cIiBkb2Vzbid0IGhhdmUgYW55IElucHV0IG5vZGVzLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogc2NvcGUuX3NvdXJjZSA/IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHggOiAwLFxuXHRcdFx0XHRcdGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGlucHV0Tm9kZXM7XG5cdH1cblxuXHRzZXRFZGdlKGZyb21QYXRoLCB0b1BhdGgpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYENyZWF0aW5nIGVkZ2UgZnJvbSBcIiR7ZnJvbVBhdGh9XCIgdG8gXCIke3RvUGF0aH1cIi5gKVxuXHRcdHZhciBzb3VyY2VQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiBmcm9tUGF0aCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0aWYgKHRoaXMuaXNNZXRhbm9kZShmcm9tUGF0aCkpIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSB0aGlzLmdldE91dHB1dE5vZGVzKGZyb21QYXRoKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c291cmNlUGF0aHMgPSBbZnJvbVBhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGZyb21QYXRoKSkge1xuXHRcdFx0c291cmNlUGF0aHMgPSBmcm9tUGF0aFxuXHRcdH1cblxuXHRcdHZhciB0YXJnZXRQYXRoc1xuXG5cdFx0aWYgKHR5cGVvZiB0b1BhdGggPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmICh0aGlzLmlzTWV0YW5vZGUodG9QYXRoKSkge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IHRoaXMuZ2V0SW5wdXROb2Rlcyh0b1BhdGgpXG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0YXJnZXRQYXRocyA9IFt0b1BhdGhdXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHRvUGF0aCkpIHtcblx0XHRcdHRhcmdldFBhdGhzID0gdG9QYXRoXG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRNdWx0aUVkZ2Uoc291cmNlUGF0aHMsIHRhcmdldFBhdGhzKVxuXHR9XG5cblx0c2V0TXVsdGlFZGdlKHNvdXJjZVBhdGhzLCB0YXJnZXRQYXRocykge1xuXG5cdFx0aWYgKHNvdXJjZVBhdGhzID09PSBudWxsIHx8IHRhcmdldFBhdGhzID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm5cblx0XHR9XG5cblx0XHRpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSB0YXJnZXRQYXRocy5sZW5ndGgpIHtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc291cmNlUGF0aHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHNvdXJjZVBhdGhzW2ldICYmIHRhcmdldFBhdGhzW2ldKSB7XG5cdFx0XHRcdFx0dGhpcy5ncmFwaC5zZXRFZGdlKHNvdXJjZVBhdGhzW2ldLCB0YXJnZXRQYXRoc1tpXSwge30pO1x0XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKHRhcmdldFBhdGhzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRzb3VyY2VQYXRocy5mb3JFYWNoKHNvdXJjZVBhdGggPT4gdGhpcy5zZXRFZGdlKHNvdXJjZVBhdGgsIHRhcmdldFBhdGhzWzBdKSlcblx0XHRcdH0gZWxzZSBpZiAoc291cmNlUGF0aHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdHRhcmdldFBhdGhzLmZvckVhY2godGFyZ2V0UGF0aCA9PiB0aGlzLnNldEVkZ2Uoc291cmNlUGF0aHNbMF0sIHRhcmdldFBhdGgsKSlcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdFx0bWVzc2FnZTogYE51bWJlciBvZiBub2RlcyBkb2VzIG5vdCBtYXRjaC4gWyR7c291cmNlUGF0aHMubGVuZ3RofV0gLT4gWyR7dGFyZ2V0UGF0aHMubGVuZ3RofV1gLFxuXHRcdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0Ly8gc3RhcnQ6IHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLnN0YXJ0SWR4IDogMCxcblx0XHRcdFx0XHRcdC8vIGVuZDogIHNjb3BlLl9zb3VyY2UgPyBzY29wZS5fc291cmNlLmVuZElkeCA6IDBcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG5cblx0aGFzTm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Z2V0R3JhcGgoKSB7XG5cdFx0Ly8gY29uc29sZS5sb2codGhpcy5ncmFwaClcblx0XHRyZXR1cm4gdGhpcy5ncmFwaDtcblx0fVxuXG5cdGdldE1ldGFub2RlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5tZXRhbm9kZXNcblx0fVxufSIsImNsYXNzIEVkaXRvciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgICAgIHRoaXMub25DaGFuZ2UgPSB0aGlzLm9uQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMubWFya2VyID0gbnVsbDtcbiAgICAgICAgdGhpcy5tYXJrZXJzID0gW107XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTWFya2VycygpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTWFya2VycygpIHtcbiAgICAgICAgdGhpcy5tYXJrZXJzLm1hcChtYXJrZXIgPT4gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5yZW1vdmVNYXJrZXIobWFya2VyKSk7XG4gICAgICAgIHRoaXMubWFya2VycyA9IFtdO1xuICAgIH1cblxuICAgIG9uQ3Vyc29yUG9zaXRpb25DaGFuZ2VkKGV2ZW50LCBzZWxlY3Rpb24pIHtcbiAgICAgICAgbGV0IG0gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmdldE1hcmtlcnMoKTtcbiAgICAgICAgbGV0IGMgPSBzZWxlY3Rpb24uZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGxldCBtYXJrZXJzID0gdGhpcy5tYXJrZXJzLm1hcChpZCA9PiBtW2lkXSk7XG4gICAgICAgIGxldCBjdXJzb3JPdmVyTWFya2VyID0gbWFya2Vycy5tYXAobWFya2VyID0+IG1hcmtlci5yYW5nZS5jb250YWlucyhjLnJvdywgYy5jb2x1bW4pKS5yZWR1Y2UoIChwcmV2LCBjdXJyKSA9PiBwcmV2IHx8IGN1cnIsIGZhbHNlKTtcblxuICAgICAgICBpZiAoY3Vyc29yT3Zlck1hcmtlcikge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSBDb2RlXCIsXG4gICAgICAgICAgICBzaG93TGluZU51bWJlcnM6IHRydWUsXG4gICAgICAgICAgICBzaG93R3V0dGVyOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmVkaXRvci4kYmxvY2tTY3JvbGxpbmcgPSBJbmZpbml0eTtcbiAgICAgICAgdGhpcy5lZGl0b3IuY29udGFpbmVyLnN0eWxlLmxpbmVIZWlnaHQgPSAxLjc7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRvci5vbihcImNoYW5nZVwiLCB0aGlzLm9uQ2hhbmdlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2VsZWN0aW9uLm9uKFwiY2hhbmdlQ3Vyc29yXCIsIHRoaXMub25DdXJzb3JQb3NpdGlvbkNoYW5nZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5pc3N1ZXMpIHtcbiAgICAgICAgICAgIHZhciBhbm5vdGF0aW9ucyA9IG5leHRQcm9wcy5pc3N1ZXMubWFwKGlzc3VlID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmVkaXRvci5zZXNzaW9uLmRvYy5pbmRleFRvUG9zaXRpb24oaXNzdWUucG9zaXRpb24uc3RhcnQpO1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHJvdzogcG9zaXRpb24ucm93LFxuICAgICAgICAgICAgICAgICAgICBjb2x1bW46IHBvc2l0aW9uLmNvbHVtbixcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogaXNzdWUubWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogaXNzdWUudHlwZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLnNldEFubm90YXRpb25zKGFubm90YXRpb25zKTtcbiAgICAgICAgICAgIC8vdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuXG4gICAgICAgICAgICB2YXIgUmFuZ2UgPSByZXF1aXJlKCdhY2UvcmFuZ2UnKS5SYW5nZTtcblxuICAgICAgICAgICAgdGhpcy5yZW1vdmVNYXJrZXJzKCk7XG5cbiAgICAgICAgICAgIHZhciBtYXJrZXJzID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnQ6IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbi5zdGFydCksXG4gICAgICAgICAgICAgICAgICAgIGVuZDogdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKGlzc3VlLnBvc2l0aW9uLmVuZClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgcmFuZ2UgPSBuZXcgUmFuZ2UocG9zaXRpb24uc3RhcnQucm93LCBwb3NpdGlvbi5zdGFydC5jb2x1bW4sIHBvc2l0aW9uLmVuZC5yb3csIHBvc2l0aW9uLmVuZC5jb2x1bW4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrZXJzLnB1c2godGhpcy5lZGl0b3Iuc2Vzc2lvbi5hZGRNYXJrZXIocmFuZ2UsIFwibWFya2VyX2Vycm9yXCIsIFwidGV4dFwiKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNlc3Npb24uY2xlYXJBbm5vdGF0aW9ucygpO1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZXhlY0NvbW1hbmQoXCJnb1RvTmV4dEVycm9yXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRQcm9wcy52YWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VmFsdWUobmV4dFByb3BzLnZhbHVlLCAtMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IHJlZj17IChlbGVtZW50KSA9PiB0aGlzLmluaXQoZWxlbWVudCkgfT48L2Rpdj47XG4gICAgfVxufSIsImNsYXNzIEdyYXBoTGF5b3V0e1xuXHRhY3RpdmVXb3JrZXJzID0ge31cblx0Y3VycmVudFdvcmtlcklkID0gMFxuXHRsYXN0RmluaXNoZWRXb3JrZXJJZCA9IDBcblx0Y2FsbGJhY2sgPSBmdW5jdGlvbigpe31cblxuXHRjb25zdHJ1Y3RvcihjYWxsYmFjaykge1xuXHRcdHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFja1xuXHR9XG5cblx0bGF5b3V0KGdyYXBoKSB7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLmdldFdvcmtlcklkKClcblx0XHR0aGlzLmFjdGl2ZVdvcmtlcnNbaWRdID0gbmV3IExheW91dFdvcmtlcihpZCwgZ3JhcGgsIHRoaXMud29ya2VyRmluaXNoZWQuYmluZCh0aGlzKSlcblx0fVxuXG5cdHdvcmtlckZpbmlzaGVkKHtpZCwgZ3JhcGh9KSB7XG5cdFx0aWYgKGlkID49IHRoaXMubGFzdEZpbmlzaGVkV29ya2VySWQpIHtcblx0XHRcdHRoaXMubGFzdEZpbmlzaGVkV29ya2VySWQgPSBpZFxuXHRcdFx0dGhpcy5jYWxsYmFjayhncmFwaClcblx0XHR9XG5cdH1cblxuXHRnZXRXb3JrZXJJZCgpIHtcblx0XHR0aGlzLmN1cnJlbnRXb3JrZXJJZCArPSAxXG5cdFx0cmV0dXJuIHRoaXMuY3VycmVudFdvcmtlcklkXG5cdH1cbn1cblxuY2xhc3MgTGF5b3V0V29ya2Vye1xuXHRpZCA9IDBcblx0d29ya2VyID0gbnVsbFxuXHRjb25zdHJ1Y3RvcihpZCwgZ3JhcGgsIG9uRmluaXNoZWQpIHtcblx0XHR0aGlzLmlkID0gaWRcblx0XHR0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIoXCJzcmMvc2NyaXB0cy9HcmFwaExheW91dFdvcmtlci5qc1wiKVxuXHRcdHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIHRoaXMucmVjZWl2ZS5iaW5kKHRoaXMpKVxuXHRcdHRoaXMub25GaW5pc2hlZCA9IG9uRmluaXNoZWRcblx0XHRcblx0XHR0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh0aGlzLmVuY29kZShncmFwaCkpXG5cdH1cblx0cmVjZWl2ZShtZXNzYWdlKSB7XG5cdFx0dGhpcy53b3JrZXIudGVybWluYXRlKClcblx0XHR0aGlzLm9uRmluaXNoZWQoe1xuXHRcdFx0aWQ6IHRoaXMuaWQsXG5cdFx0XHRncmFwaDogdGhpcy5kZWNvZGUobWVzc2FnZS5kYXRhKVxuXHRcdH0pXG5cdH1cblx0ZW5jb2RlKGdyYXBoKSB7XG5cdFx0cmV0dXJuIGdyYXBobGliLmpzb24ud3JpdGUoZ3JhcGgpXG4gICAgfVxuXG4gICAgZGVjb2RlKGpzb24pIHtcblx0XHRyZXR1cm4gZ3JhcGhsaWIuanNvbi5yZWFkKGpzb24pXG4gICAgfVxufSIsImNvbnN0IGlwYyA9IHJlcXVpcmUoXCJlbGVjdHJvblwiKS5pcGNSZW5kZXJlclxuY29uc3QgZnMgPSByZXF1aXJlKFwiZnNcIilcblxuY2xhc3MgSURFIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXHRwYXJzZXIgPSBuZXcgUGFyc2VyKClcblx0bW9uaWVsID0gbmV3IE1vbmllbCgpXG5cdGdlbmVyYXRvciA9IG5ldyBQeVRvcmNoR2VuZXJhdG9yKClcblxuXHRsb2NrID0gbnVsbFxuXG5cdGNvbnN0cnVjdG9yKHByb3BzKSB7XG5cdFx0c3VwZXIocHJvcHMpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdC8vIHRoZXNlIGFyZSBubyBsb25nZXIgbmVlZGVkIGhlcmVcblx0XHRcdC8vIFwiZ3JhbW1hclwiOiB0aGlzLnBhcnNlci5ncmFtbWFyLFxuXHRcdFx0Ly8gXCJzZW1hbnRpY3NcIjogdGhpcy5wYXJzZXIuc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImxheW91dFwiOiBcImNvbHVtbnNcIixcblx0XHRcdFwiZ2VuZXJhdGVkQ29kZVwiOiBcIlwiXG5cdFx0fTtcblxuXHRcdGlwYy5vbignc2F2ZScsIGZ1bmN0aW9uKGV2ZW50LCBtZXNzYWdlKSB7XG5cdFx0XHRmcy53cml0ZUZpbGUobWVzc2FnZS5mb2xkZXIgKyBcIi9zb3VyY2UubW9uXCIsIHRoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb24sIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL3NvdXJjZS5hc3QuanNvblwiLCBKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMiksIGZ1bmN0aW9uKGVycikge1xuXHRcdFx0ICBpZiAoZXJyKSB0aHJvdyBlcnJzXG5cdFx0XHR9KTtcblx0XHRcdGZzLndyaXRlRmlsZShtZXNzYWdlLmZvbGRlciArIFwiL2dyYXBoLnN2Z1wiLCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3ZnXCIpLm91dGVySFRNTCwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvZ3JhcGguanNvblwiLCBKU09OLnN0cmluZ2lmeShkYWdyZS5ncmFwaGxpYi5qc29uLndyaXRlKHRoaXMuc3RhdGUuZ3JhcGgpLCBudWxsLCAyKSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXHRcdFx0ZnMud3JpdGVGaWxlKG1lc3NhZ2UuZm9sZGVyICsgXCIvaGFsZi1hc3NlZF9qb2tlLnB5XCIsIHRoaXMuc3RhdGUuZ2VuZXJhdGVkQ29kZSwgZnVuY3Rpb24oZXJyKSB7XG5cdFx0XHQgIGlmIChlcnIpIHRocm93IGVycnNcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgc2F2ZU5vdGlmaWNhdGlvbiA9IG5ldyBOb3RpZmljYXRpb24oJ1NrZXRjaCBzYXZlZCcsIHtcbiAgICAgICAgICAgIFx0Ym9keTogYFNrZXRjaCB3YXMgc3VjY2Vzc2Z1bGx5IHNhdmVkIGluIHRoZSBcInNrZXRjaGVzXCIgZm9sZGVyLmAsXG5cdFx0XHRcdHNpbGVudDogdHJ1ZVxuICAgICAgICAgICAgfSlcblx0XHR9LmJpbmQodGhpcykpO1xuXG5cdFx0aXBjLm9uKFwidG9nZ2xlTGF5b3V0XCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLnRvZ2dsZUxheW91dCgpXG5cdFx0fSk7XG5cblx0XHRpcGMub24oXCJvcGVuXCIsIChlLCBtKSA9PiB7XG5cdFx0XHR0aGlzLm9wZW5GaWxlKG0uZmlsZVBhdGgpXG5cdFx0fSlcblxuXHRcdGxldCBsYXlvdXQgPSB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJsYXlvdXRcIilcblx0XHRpZiAobGF5b3V0KSB7XG5cdFx0XHRpZiAobGF5b3V0ID09IFwiY29sdW1uc1wiIHx8IGxheW91dCA9PSBcInJvd3NcIikge1xuXHRcdFx0XHR0aGlzLnN0YXRlLmxheW91dCA9IGxheW91dFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5tb25pZWwubG9nZ2VyLmFkZElzc3VlKHtcblx0XHRcdFx0XHR0eXBlOiBcIndhcm5pbmdcIixcblx0XHRcdFx0XHRtZXNzYWdlOiBgVmFsdWUgZm9yIFwibGF5b3V0XCIgY2FuIGJlIG9ubHkgXCJjb2x1bW5zXCIgb3IgXCJyb3dzXCIuYFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbi5iaW5kKHRoaXMpO1xuXHRcdHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uID0gdGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0fVxuXG5cdG9wZW5GaWxlKGZpbGVQYXRoKSB7XG5cdFx0Y29uc29sZS5sb2coXCJvcGVuRmlsZVwiLCBmaWxlUGF0aClcblx0XHRsZXQgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoZmlsZVBhdGgsIFwidXRmOFwiKVxuXHRcdHRoaXMuZWRpdG9yLnNldFZhbHVlKGZpbGVDb250ZW50KSAvLyB0aGlzIGhhcyB0byBiZSBoZXJlLCBJIGRvbid0IGtub3cgd2h5XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogZmlsZUNvbnRlbnRcblx0XHR9KVxuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHRsZXQgZmlsZUNvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoYC4vZXhhbXBsZXMvJHtpZH0ubW9uYCwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUoZmlsZUNvbnRlbnQpIC8vIHRoaXMgaGFzIHRvIGJlIGhlcmUsIEkgZG9uJ3Qga25vdyB3aHlcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiBmaWxlQ29udGVudFxuXHRcdH0pXG5cdH1cblxuXHRjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR0aGlzLmxvYWRFeGFtcGxlKFwiQ29udm9sdXRpb25hbExheWVyXCIpXG5cdH1cblxuXHRkZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpIHtcblx0XHRpZiAodGhpcy5sb2NrKSB7IGNsZWFyVGltZW91dCh0aGlzLmxvY2spOyB9XG5cdFx0dGhpcy5sb2NrID0gc2V0VGltZW91dCgoKSA9PiB7IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpOyB9LCAxMDApO1xuXHR9XG5cblx0dXBkYXRlTmV0d29ya0RlZmluaXRpb24odmFsdWUpe1xuXHRcdGNvbnNvbGUudGltZShcInVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uXCIpO1xuXHRcdHZhciByZXN1bHQgPSB0aGlzLnBhcnNlci5tYWtlKHZhbHVlKVxuXG5cdFx0aWYgKHJlc3VsdC5hc3QpIHtcblx0XHRcdHRoaXMubW9uaWVsLndhbGtBc3QocmVzdWx0LmFzdClcblx0XHRcdGxldCBncmFwaCA9IHRoaXMubW9uaWVsLmdldENvbXB1dGF0aW9uYWxHcmFwaCgpXG5cdFx0XHRsZXQgZGVmaW5pdGlvbnMgPSB0aGlzLm1vbmllbC5nZXRNZXRhbm9kZXNEZWZpbml0aW9ucygpXG5cdFx0XHQvL2NvbnNvbGUubG9nKGRlZmluaXRpb25zKVxuXG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0Z2VuZXJhdGVkQ29kZTogdGhpcy5nZW5lcmF0b3IuZ2VuZXJhdGVDb2RlKGdyYXBoLCBkZWZpbml0aW9ucyksXG5cdFx0XHRcdGlzc3VlczogdGhpcy5tb25pZWwuZ2V0SXNzdWVzKClcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBjb25zb2xlLmVycm9yKHJlc3VsdCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IG51bGwsXG5cdFx0XHRcdGdyYXBoOiBudWxsLFxuXHRcdFx0XHRpc3N1ZXM6IFt7XG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHN0YXJ0OiByZXN1bHQucG9zaXRpb24gLSAxLFxuXHRcdFx0XHRcdFx0ZW5kOiByZXN1bHQucG9zaXRpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zb2xlLnRpbWVFbmQoXCJ1cGRhdGVOZXR3b3JrRGVmaW5pdGlvblwiKTtcblx0fVxuXG5cdHRvZ2dsZUxheW91dCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdGxheW91dDogKHRoaXMuc3RhdGUubGF5b3V0ID09PSBcImNvbHVtbnNcIikgPyBcInJvd3NcIiA6IFwiY29sdW1uc1wiXG5cdFx0fSlcblx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcInJlc2l6ZVwiKSlcblx0XHR9LCAxMDApXG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0bGV0IGNvbnRhaW5lckxheW91dCA9IHRoaXMuc3RhdGUubGF5b3V0XG5cdFx0bGV0IGdyYXBoTGF5b3V0ID0gdGhpcy5zdGF0ZS5sYXlvdXQgPT09IFwiY29sdW1uc1wiID8gXCJCVFwiIDogXCJMUlwiXG5cbiAgICBcdHJldHVybiA8ZGl2IGlkPVwiY29udGFpbmVyXCIgY2xhc3NOYW1lPXtgY29udGFpbmVyICR7Y29udGFpbmVyTGF5b3V0fWB9PlxuICAgIFx0XHQ8UGFuZWwgaWQ9XCJkZWZpbml0aW9uXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0cmVmPXsocmVmKSA9PiB0aGlzLmVkaXRvciA9IHJlZn1cbiAgICBcdFx0XHRcdG1vZGU9XCJtb25pZWxcIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdGlzc3Vlcz17dGhpcy5zdGF0ZS5pc3N1ZXN9XG4gICAgXHRcdFx0XHRvbkNoYW5nZT17dGhpcy5kZWxheWVkVXBkYXRlTmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0XHRkZWZhdWx0VmFsdWU9e3RoaXMuc3RhdGUubmV0d29ya0RlZmluaXRpb259XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCBpZD1cInZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IGxheW91dD17Z3JhcGhMYXlvdXR9IC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cblx0XHRcdHsvKlxuXHRcdFx0PFBhbmVsIHRpdGxlPVwiR2VuZXJhdGVkIENvZGVcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwicHl0aG9uXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHR2YWx1ZT17dGhpcy5zdGF0ZS5nZW5lcmF0ZWRDb2RlfVxuICAgIFx0XHRcdC8+XG4gICAgXHRcdDwvUGFuZWw+XG5cdFx0XHQqL31cblxuICAgIFx0XHR7LypcbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiQVNUXCI+XG4gICAgXHRcdFx0PEVkaXRvclxuICAgIFx0XHRcdFx0bW9kZT1cImpzb25cIlxuICAgIFx0XHRcdFx0dGhlbWU9XCJtb25va2FpXCJcbiAgICBcdFx0XHRcdHZhbHVlPXtKU09OLnN0cmluZ2lmeSh0aGlzLnN0YXRlLmFzdCwgbnVsbCwgMil9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdCovfVxuICAgIFx0XHRcbiAgICBcdDwvZGl2PjtcbiAgXHR9XG59IiwiY2xhc3MgTG9nZ2Vye1xuXHRpc3N1ZXMgPSBbXVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuaXNzdWVzID0gW107XG5cdH1cblx0XG5cdGdldElzc3VlcygpIHtcblx0XHRyZXR1cm4gdGhpcy5pc3N1ZXM7XG5cdH1cblxuXHRhZGRJc3N1ZShpc3N1ZSkge1xuXHRcdHZhciBmID0gbnVsbDtcblx0XHRzd2l0Y2goaXNzdWUudHlwZSkge1xuXHRcdFx0Y2FzZSBcImVycm9yXCI6IGYgPSBjb25zb2xlLmVycm9yOyBicmVhaztcblx0XHRcdGNhc2UgXCJ3YXJuaW5nXCI6IGYgPSBjb25zb2xlLndhcm47IGJyZWFrO1xuXHRcdFx0Y2FzZSBcImluZm9cIjogZiA9IGNvbnNvbGUuaW5mbzsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiBmID0gY29uc29sZS5sb2c7IGJyZWFrO1xuXHRcdH1cblx0XHRmKGlzc3VlLm1lc3NhZ2UpO1xuXHRcdHRoaXMuaXNzdWVzLnB1c2goaXNzdWUpO1xuXHR9XG59IiwiY29uc3QgcGl4ZWxXaWR0aCA9IHJlcXVpcmUoJ3N0cmluZy1waXhlbC13aWR0aCcpXG5cbi8vIHJlbmFtZSB0aGlzIHRvIHNvbWV0aGluZyBzdWl0YWJsZVxuY2xhc3MgTW9uaWVse1xuXHQvLyBtYXliZSBzaW5nbGV0b24/XG5cdGxvZ2dlciA9IG5ldyBMb2dnZXIoKVxuXHRncmFwaCA9IG5ldyBDb21wdXRhdGlvbmFsR3JhcGgodGhpcylcblxuXHQvLyB0b28gc29vbiwgc2hvdWxkIGJlIGluIFZpc3VhbEdyYXBoXG5cdGNvbG9ySGFzaCA9IG5ldyBDb2xvckhhc2hXcmFwcGVyKClcblxuXHRkZWZpbml0aW9ucyA9IHt9O1xuXG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmdyYXBoLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLmxvZ2dlci5jbGVhcigpO1xuXG5cdFx0dGhpcy5kZWZpbml0aW9ucyA9IFtdO1xuXHRcdHRoaXMuYWRkRGVmYXVsdERlZmluaXRpb25zKCk7XG5cdH1cblxuXHRhZGREZWZhdWx0RGVmaW5pdGlvbnMoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgZGVmYXVsdCBkZWZpbml0aW9ucy5gKTtcblx0XHRjb25zdCBkZWZhdWx0RGVmaW5pdGlvbnMgPSBbXCJBZGRcIiwgXCJMaW5lYXJcIiwgXCJJbnB1dFwiLCBcIk91dHB1dFwiLCBcIlBsYWNlaG9sZGVyXCIsIFwiVmFyaWFibGVcIiwgXCJDb25zdGFudFwiLCBcIk11bHRpcGx5XCIsIFwiQ29udm9sdXRpb25cIiwgXCJEZW5zZVwiLCBcIk1heFBvb2xpbmdcIiwgXCJCYXRjaE5vcm1hbGl6YXRpb25cIiwgXCJEZWNvbnZvbHV0aW9uXCIsIFwiQXZlcmFnZVBvb2xpbmdcIiwgXCJBZGFwdGl2ZUF2ZXJhZ2VQb29saW5nXCIsIFwiQWRhcHRpdmVNYXhQb29saW5nXCIsIFwiTWF4VW5wb29saW5nXCIsIFwiUGFyYW1ldHJpY1JlY3RpZmllZExpbmVhclVuaXRcIiwgXCJMZWFreVJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJSYW5kb21pemVkUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIkxvZ1NpZ21vaWRcIiwgXCJUaHJlc2hvbGRcIiwgXCJIYXJkVGFuaFwiLCBcIlRhbmhTaHJpbmtcIiwgXCJIYXJkU2hyaW5rXCIsIFwiTG9nU29mdE1heFwiLCBcIlNvZnRTaHJpbmtcIiwgXCJTb2Z0TWF4XCIsIFwiU29mdE1pblwiLCBcIlNvZnRQbHVzXCIsIFwiU29mdFNpZ25cIiwgXCJJZGVudGl0eVwiLCBcIlJlY3RpZmllZExpbmVhclVuaXRcIiwgXCJTaWdtb2lkXCIsIFwiRXhwb25lbnRpYWxMaW5lYXJVbml0XCIsIFwiVGFuaFwiLCBcIkFic29sdXRlXCIsIFwiU3VtbWF0aW9uXCIsIFwiRHJvcG91dFwiLCBcIk1hdHJpeE11bHRpcGx5XCIsIFwiQmlhc0FkZFwiLCBcIlJlc2hhcGVcIiwgXCJDb25jYXRcIiwgXCJGbGF0dGVuXCIsIFwiVGVuc29yXCIsIFwiU29mdG1heFwiLCBcIkNyb3NzRW50cm9weVwiLCBcIlplcm9QYWRkaW5nXCIsIFwiUmFuZG9tTm9ybWFsXCIsIFwiVHJ1bmNhdGVkTm9ybWFsRGlzdHJpYnV0aW9uXCIsIFwiRG90UHJvZHVjdFwiXTtcblx0XHRkZWZhdWx0RGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMuYWRkRGVmaW5pdGlvbihkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRhZGREZWZpbml0aW9uKGRlZmluaXRpb25OYW1lKSB7XG5cdFx0dGhpcy5kZWZpbml0aW9uc1tkZWZpbml0aW9uTmFtZV0gPSB7XG5cdFx0XHRuYW1lOiBkZWZpbml0aW9uTmFtZSxcblx0XHRcdGNvbG9yOiB0aGlzLmNvbG9ySGFzaC5oZXgoZGVmaW5pdGlvbk5hbWUpXG5cdFx0fTtcblx0fVxuXG5cdGhhbmRsZUlubGluZUJsb2NrRGVmaW5pdGlvbihzY29wZSkge1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJNZXRhbm9kZVNjb3BlKHNjb3BlLm5hbWUudmFsdWUpXG5cdFx0dGhpcy53YWxrQXN0KHNjb3BlLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdE1ldGFub2RlU2NvcGUoKTtcblx0XHR0aGlzLmdyYXBoLmNyZWF0ZU1ldGFub2RlKHNjb3BlLm5hbWUudmFsdWUsIHNjb3BlLm5hbWUudmFsdWUsIHtcblx0XHRcdHVzZXJHZW5lcmF0ZWRJZDogc2NvcGUubmFtZS52YWx1ZSxcblx0XHRcdGlkOiBzY29wZS5uYW1lLnZhbHVlLFxuXHRcdFx0Y2xhc3M6IFwiXCIsXG5cdFx0XHRfc291cmNlOiBzY29wZS5fc291cmNlXG5cdFx0fSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uKcKge1xuXHRcdC8vIGNvbnNvbGUuaW5mbyhgQWRkaW5nIFwiJHtibG9ja0RlZmluaXRpb24ubmFtZX1cIiB0byBhdmFpbGFibGUgZGVmaW5pdGlvbnMuYCk7XG5cdFx0dGhpcy5hZGREZWZpbml0aW9uKGJsb2NrRGVmaW5pdGlvbi5uYW1lKTtcblx0XHR0aGlzLmdyYXBoLmVudGVyTWV0YW5vZGVTY29wZShibG9ja0RlZmluaXRpb24ubmFtZSk7XG5cdFx0dGhpcy53YWxrQXN0KGJsb2NrRGVmaW5pdGlvbi5ib2R5KTtcblx0XHR0aGlzLmdyYXBoLmV4aXRNZXRhbm9kZVNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0RlZmluaXRpb25Cb2R5KGRlZmluaXRpb25Cb2R5KSB7XG5cdFx0ZGVmaW5pdGlvbkJvZHkuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVOZXR3b3JrRGVmaW5pdGlvbihuZXR3b3JrKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdFx0bmV0d29yay5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUNvbm5lY3Rpb25EZWZpbml0aW9uKGNvbm5lY3Rpb24pIHtcblx0XHR0aGlzLmdyYXBoLmNsZWFyTm9kZVN0YWNrKCk7XG5cdFx0Ly8gY29uc29sZS5sb2coY29ubmVjdGlvbi5saXN0KVxuXHRcdGNvbm5lY3Rpb24ubGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5mcmVlemVOb2RlU3RhY2soKTtcblx0XHRcdC8vIGNvbnNvbGUubG9nKGl0ZW0pXG5cdFx0XHR0aGlzLndhbGtBc3QoaXRlbSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyB0aGlzIGlzIGRvaW5nIHRvbyBtdWNoIOKAkyBicmVhayBpbnRvIFwibm90IHJlY29nbml6ZWRcIiwgXCJzdWNjZXNzXCIgYW5kIFwiYW1iaWd1b3VzXCJcblx0aGFuZGxlQmxvY2tJbnN0YW5jZShpbnN0YW5jZSkge1xuXHRcdHZhciBub2RlID0ge1xuXHRcdFx0aWQ6IHVuZGVmaW5lZCxcblx0XHRcdGNsYXNzOiBcIlVua25vd25cIixcblx0XHRcdGNvbG9yOiBcImRhcmtncmV5XCIsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0d2lkdGg6IDEwMCxcblxuXHRcdFx0X3NvdXJjZTogaW5zdGFuY2UsXG5cdFx0fTtcblxuXHRcdGxldCBkZWZpbml0aW9ucyA9IHRoaXMubWF0Y2hJbnN0YW5jZU5hbWVUb0RlZmluaXRpb25zKGluc3RhbmNlLm5hbWUudmFsdWUpXG5cdFx0Ly8gY29uc29sZS5sb2coYE1hdGNoZWQgZGVmaW5pdGlvbnM6YCwgZGVmaW5pdGlvbnMpO1xuXG5cdFx0aWYgKGRlZmluaXRpb25zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgbm9kZS5jbGFzcyA9IGluc3RhbmNlLm5hbWUudmFsdWU7XG4gICAgICAgICAgICBub2RlLmlzVW5kZWZpbmVkID0gdHJ1ZVxuXG4gICAgICAgICAgICB0aGlzLmFkZElzc3VlKHtcbiAgICAgICAgICAgIFx0bWVzc2FnZTogYFVucmVjb2duaXplZCBub2RlIHR5cGUgXCIke2luc3RhbmNlLm5hbWUudmFsdWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGVmaW5pdGlvbnMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRsZXQgZGVmaW5pdGlvbiA9IGRlZmluaXRpb25zWzBdO1xuXHRcdFx0aWYgKGRlZmluaXRpb24pIHtcblx0XHRcdFx0bm9kZS5jb2xvciA9IGRlZmluaXRpb24uY29sb3I7XG5cdFx0XHRcdG5vZGUuY2xhc3MgPSBkZWZpbml0aW9uLm5hbWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG5vZGUuY2xhc3MgPSBpbnN0YW5jZS5uYW1lLnZhbHVlO1xuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgbm9kZSB0eXBlIFwiJHtpbnN0YW5jZS5uYW1lLnZhbHVlfVwiLiBQb3NzaWJsZSBtYXRjaGVzOiAke2RlZmluaXRpb25zLm1hcChkZWYgPT4gYFwiJHtkZWYubmFtZX1cImApLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRzdGFydDogIGluc3RhbmNlLm5hbWUuX3NvdXJjZS5zdGFydElkeCxcblx0XHRcdFx0XHRlbmQ6ICBpbnN0YW5jZS5uYW1lLl9zb3VyY2UuZW5kSWR4XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFpbnN0YW5jZS5hbGlhcykge1xuXHRcdFx0bm9kZS5pZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKG5vZGUuY2xhc3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub2RlLmlkID0gaW5zdGFuY2UuYWxpYXMudmFsdWU7XG5cdFx0XHRub2RlLnVzZXJHZW5lcmF0ZWRJZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdFx0bm9kZS5oZWlnaHQgPSA1MDtcblx0XHR9XG5cblx0XHQvLyBpcyBtZXRhbm9kZVxuXHRcdGlmIChPYmplY3Qua2V5cyh0aGlzLmdyYXBoLm1ldGFub2RlcykuaW5jbHVkZXMobm9kZS5jbGFzcykpIHtcblx0XHRcdHZhciBjb2xvciA9IGQzLmNvbG9yKG5vZGUuY29sb3IpO1xuXHRcdFx0Y29sb3Iub3BhY2l0eSA9IDAuMTtcblx0XHRcdHRoaXMuZ3JhcGguY3JlYXRlTWV0YW5vZGUobm9kZS5pZCwgbm9kZS5jbGFzcywge1xuXHRcdFx0XHQuLi5ub2RlLFxuXHRcdFx0XHRzdHlsZToge1wiZmlsbFwiOiBjb2xvci50b1N0cmluZygpfVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y29uc3Qgd2lkdGggPSAyMCArIE1hdGgubWF4KC4uLltub2RlLmNsYXNzLCBub2RlLnVzZXJHZW5lcmF0ZWRJZCA/IG5vZGUudXNlckdlbmVyYXRlZElkIDogXCJcIl0ubWFwKHN0cmluZyA9PiBwaXhlbFdpZHRoKHN0cmluZywge3NpemU6IDE2fSkpKVxuXG5cdFx0dGhpcy5ncmFwaC5jcmVhdGVOb2RlKG5vZGUuaWQsIHtcblx0XHRcdC4uLm5vZGUsXG4gICAgICAgICAgICBzdHlsZToge2ZpbGw6IG5vZGUuY29sb3J9LFxuXHRcdFx0d2lkdGhcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdG1hdGNoSW5zdGFuY2VOYW1lVG9EZWZpbml0aW9ucyhxdWVyeSkge1xuXHRcdHZhciBkZWZpbml0aW9ucyA9IE9iamVjdC5rZXlzKHRoaXMuZGVmaW5pdGlvbnMpO1xuXHRcdGxldCBkZWZpbml0aW9uS2V5cyA9IE1vbmllbC5uYW1lUmVzb2x1dGlvbihxdWVyeSwgZGVmaW5pdGlvbnMpO1xuXHRcdC8vY29uc29sZS5sb2coXCJGb3VuZCBrZXlzXCIsIGRlZmluaXRpb25LZXlzKTtcblx0XHRsZXQgbWF0Y2hlZERlZmluaXRpb25zID0gZGVmaW5pdGlvbktleXMubWFwKGtleSA9PiB0aGlzLmRlZmluaXRpb25zW2tleV0pO1xuXHRcdHJldHVybiBtYXRjaGVkRGVmaW5pdGlvbnM7XG5cdH1cblxuXHRnZXRDb21wdXRhdGlvbmFsR3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguZ2V0R3JhcGgoKTtcblx0fVxuXG5cdGdldE1ldGFub2Rlc0RlZmluaXRpb25zKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldE1ldGFub2RlcygpXG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHRcdGxldCBzcGxpdFJlZ2V4ID0gLyg/PVswLTlBLVpdKS87XG5cdCAgICBsZXQgcGFydGlhbEFycmF5ID0gcGFydGlhbC5zcGxpdChzcGxpdFJlZ2V4KTtcblx0ICAgIGxldCBsaXN0QXJyYXkgPSBsaXN0Lm1hcChkZWZpbml0aW9uID0+IGRlZmluaXRpb24uc3BsaXQoc3BsaXRSZWdleCkpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tEZWZpbml0aW9uQm9keVwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbkJvZHkobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIklubGluZUJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUlubGluZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIjogdGhpcy5oYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tJbnN0YW5jZVwiOiB0aGlzLmhhbmRsZUJsb2NrSW5zdGFuY2Uobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrTGlzdFwiOiB0aGlzLmhhbmRsZUJsb2NrTGlzdChub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSWRlbnRpZmllclwiOiB0aGlzLmhhbmRsZUlkZW50aWZpZXIobm9kZSk7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhpcy5oYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpO1xuXHRcdH1cblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgaWQ9e3RoaXMucHJvcHMuaWR9IGNsYXNzTmFtZT1cInBhbmVsXCI+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjb25zdCBmcyA9IHJlcXVpcmUoXCJmc1wiKVxuY29uc3Qgb2htID0gcmVxdWlyZShcIm9obS1qc1wiKVxuXG5jbGFzcyBQYXJzZXJ7XG5cdGNvbnRlbnRzID0gbnVsbFxuXHRncmFtbWFyID0gbnVsbFxuXHRcblx0ZXZhbE9wZXJhdGlvbiA9IHtcblx0XHROZXR3b3JrOiBmdW5jdGlvbihkZWZpbml0aW9ucykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJOZXR3b3JrXCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucy5ldmFsKClcblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrRGVmaW5pdGlvbjogZnVuY3Rpb24oXywgbGF5ZXJOYW1lLCBwYXJhbXMsIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tEZWZpbml0aW9uXCIsXG5cdFx0XHRcdG5hbWU6IGxheWVyTmFtZS5zb3VyY2UuY29udGVudHMsXG5cdFx0XHRcdGJvZHk6IGJvZHkuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRJbmxpbmVCbG9ja0RlZmluaXRpb246IGZ1bmN0aW9uKG5hbWUsIF8sIGJvZHkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiSW5saW5lQmxvY2tEZWZpbml0aW9uXCIsXG5cdFx0XHRcdG5hbWU6IG5hbWUuZXZhbCgpLFxuXHRcdFx0XHRib2R5OiBib2R5LmV2YWwoKSxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdElubGluZUJsb2NrRGVmaW5pdGlvbkJvZHk6IGZ1bmN0aW9uKF8sIGxpc3QsIF9fKSB7XG5cdFx0XHR2YXIgZGVmaW5pdGlvbnMgPSBsaXN0LmV2YWwoKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25Cb2R5XCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucyA/IGRlZmluaXRpb25zIDogW11cblx0XHRcdH1cblx0XHR9LFxuXHRcdENvbm5lY3Rpb25EZWZpbml0aW9uOiBmdW5jdGlvbihsaXN0KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIkNvbm5lY3Rpb25EZWZpbml0aW9uXCIsXG5cdFx0XHRcdGxpc3Q6IGxpc3QuZXZhbCgpXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRCbG9ja0luc3RhbmNlOiBmdW5jdGlvbihpZCwgbGF5ZXJOYW1lLCBwYXJhbXMpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IFwiQmxvY2tJbnN0YW5jZVwiLFxuXHRcdFx0XHRuYW1lOiBsYXllck5hbWUuZXZhbCgpLFxuXHRcdFx0XHRhbGlhczogaWQuZXZhbCgpWzBdLFxuXHRcdFx0XHRwYXJhbWV0ZXJzOiBwYXJhbXMuZXZhbCgpLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tOYW1lOiBmdW5jdGlvbihpZCwgXykge1xuXHRcdFx0cmV0dXJuIGlkLmV2YWwoKVxuXHRcdH0sXG5cdFx0QmxvY2tMaXN0OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XCJ0eXBlXCI6IFwiQmxvY2tMaXN0XCIsXG5cdFx0XHRcdFwibGlzdFwiOiBsaXN0LmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uUGFyYW1ldGVyczogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHJldHVybiBsaXN0LmV2YWwoKVxuXHRcdH0sXG5cdFx0QmxvY2tEZWZpbml0aW9uQm9keTogZnVuY3Rpb24oXywgbGlzdCwgX18pIHtcblx0XHRcdHZhciBkZWZpbml0aW9ucyA9IGxpc3QuZXZhbCgpWzBdIFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja0RlZmluaXRpb25Cb2R5XCIsXG5cdFx0XHRcdGRlZmluaXRpb25zOiBkZWZpbml0aW9ucyA/IGRlZmluaXRpb25zIDogW11cblx0XHRcdH1cblx0XHR9LFxuXHRcdEJsb2NrSW5zdGFuY2VQYXJhbWV0ZXJzOiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHRQYXJhbWV0ZXI6IGZ1bmN0aW9uKG5hbWUsIF8sIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBcIlBhcmFtZXRlclwiLFxuXHRcdFx0XHRuYW1lOiBuYW1lLmV2YWwoKSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlLmV2YWwoKVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWU6IGZ1bmN0aW9uKHZhbCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJWYWx1ZVwiLFxuXHRcdFx0XHR2YWx1ZTogdmFsLnNvdXJjZS5jb250ZW50c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0VmFsdWVMaXN0OiBmdW5jdGlvbihfLCBsaXN0LCBfXykge1xuXHRcdFx0cmV0dXJuIGxpc3QuZXZhbCgpXG5cdFx0fSxcblx0XHROb25lbXB0eUxpc3RPZjogZnVuY3Rpb24oeCwgXywgeHMpIHtcblx0XHRcdHJldHVybiBbeC5ldmFsKCldLmNvbmNhdCh4cy5ldmFsKCkpXG5cdFx0fSxcblx0XHRFbXB0eUxpc3RPZjogZnVuY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gW11cblx0XHR9LFxuXHRcdGJsb2NrSWRlbnRpZmllcjogZnVuY3Rpb24oXywgX18sIF9fXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJZGVudGlmaWVyXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9LFxuXHRcdHBhcmFtZXRlck5hbWU6IGZ1bmN0aW9uKGEpIHtcblx0XHRcdHJldHVybiBhLnNvdXJjZS5jb250ZW50c1xuXHRcdH0sXG5cdFx0YmxvY2tUeXBlOiBmdW5jdGlvbihfLCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJCbG9ja1R5cGVcIixcblx0XHRcdFx0dmFsdWU6IHRoaXMuc291cmNlLmNvbnRlbnRzLFxuXHRcdFx0XHRfc291cmNlOiB0aGlzLnNvdXJjZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YmxvY2tOYW1lOiBmdW5jdGlvbihfLCBfXykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogXCJJZGVudGlmaWVyXCIsXG5cdFx0XHRcdHZhbHVlOiB0aGlzLnNvdXJjZS5jb250ZW50cyxcblx0XHRcdFx0X3NvdXJjZTogdGhpcy5zb3VyY2Vcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHR0aGlzLmNvbnRlbnRzID0gZnMucmVhZEZpbGVTeW5jKFwic3JjL21vbmllbC5vaG1cIiwgXCJ1dGY4XCIpXG5cdFx0dGhpcy5ncmFtbWFyID0gb2htLmdyYW1tYXIodGhpcy5jb250ZW50cylcblx0XHR0aGlzLnNlbWFudGljcyA9IHRoaXMuZ3JhbW1hci5jcmVhdGVTZW1hbnRpY3MoKS5hZGRPcGVyYXRpb24oXCJldmFsXCIsIHRoaXMuZXZhbE9wZXJhdGlvbilcblx0fVxuXG5cdG1ha2Uoc291cmNlKSB7XG5cdFx0dmFyIHJlc3VsdCA9IHRoaXMuZ3JhbW1hci5tYXRjaChzb3VyY2UpXG5cblx0XHRpZiAocmVzdWx0LnN1Y2NlZWRlZCgpKSB7XG5cdFx0XHR2YXIgYXN0ID0gdGhpcy5zZW1hbnRpY3MocmVzdWx0KS5ldmFsKClcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGFzdFxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KClcblx0XHRcdHZhciBwb3NpdGlvbiA9IHJlc3VsdC5nZXRSaWdodG1vc3RGYWlsdXJlUG9zaXRpb24oKVxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXhwZWN0ZWQsXG5cdFx0XHRcdHBvc2l0aW9uXG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cbn0iLCJjbGFzcyBQeVRvcmNoR2VuZXJhdG9yIHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5idWlsdGlucyA9IFtcIkFyaXRobWV0aWNFcnJvclwiLCBcIkFzc2VydGlvbkVycm9yXCIsIFwiQXR0cmlidXRlRXJyb3JcIiwgXCJCYXNlRXhjZXB0aW9uXCIsIFwiQmxvY2tpbmdJT0Vycm9yXCIsIFwiQnJva2VuUGlwZUVycm9yXCIsIFwiQnVmZmVyRXJyb3JcIiwgXCJCeXRlc1dhcm5pbmdcIiwgXCJDaGlsZFByb2Nlc3NFcnJvclwiLCBcIkNvbm5lY3Rpb25BYm9ydGVkRXJyb3JcIiwgXCJDb25uZWN0aW9uRXJyb3JcIiwgXCJDb25uZWN0aW9uUmVmdXNlZEVycm9yXCIsIFwiQ29ubmVjdGlvblJlc2V0RXJyb3JcIiwgXCJEZXByZWNhdGlvbldhcm5pbmdcIiwgXCJFT0ZFcnJvclwiLCBcIkVsbGlwc2lzXCIsIFwiRW52aXJvbm1lbnRFcnJvclwiLCBcIkV4Y2VwdGlvblwiLCBcIkZhbHNlXCIsIFwiRmlsZUV4aXN0c0Vycm9yXCIsIFwiRmlsZU5vdEZvdW5kRXJyb3JcIiwgXCJGbG9hdGluZ1BvaW50RXJyb3JcIiwgXCJGdXR1cmVXYXJuaW5nXCIsIFwiR2VuZXJhdG9yRXhpdFwiLCBcIklPRXJyb3JcIiwgXCJJbXBvcnRFcnJvclwiLCBcIkltcG9ydFdhcm5pbmdcIiwgXCJJbmRlbnRhdGlvbkVycm9yXCIsIFwiSW5kZXhFcnJvclwiLCBcIkludGVycnVwdGVkRXJyb3JcIiwgXCJJc0FEaXJlY3RvcnlFcnJvclwiLCBcIktleUVycm9yXCIsIFwiS2V5Ym9hcmRJbnRlcnJ1cHRcIiwgXCJMb29rdXBFcnJvclwiLCBcIk1lbW9yeUVycm9yXCIsIFwiTW9kdWxlTm90Rm91bmRFcnJvclwiLCBcIk5hbWVFcnJvclwiLCBcIk5vbmVcIiwgXCJOb3RBRGlyZWN0b3J5RXJyb3JcIiwgXCJOb3RJbXBsZW1lbnRlZFwiLCBcIk5vdEltcGxlbWVudGVkRXJyb3JcIiwgXCJPU0Vycm9yXCIsIFwiT3ZlcmZsb3dFcnJvclwiLCBcIlBlbmRpbmdEZXByZWNhdGlvbldhcm5pbmdcIiwgXCJQZXJtaXNzaW9uRXJyb3JcIiwgXCJQcm9jZXNzTG9va3VwRXJyb3JcIiwgXCJSZWN1cnNpb25FcnJvclwiLCBcIlJlZmVyZW5jZUVycm9yXCIsIFwiUmVzb3VyY2VXYXJuaW5nXCIsIFwiUnVudGltZUVycm9yXCIsIFwiUnVudGltZVdhcm5pbmdcIiwgXCJTdG9wQXN5bmNJdGVyYXRpb25cIiwgXCJTdG9wSXRlcmF0aW9uXCIsIFwiU3ludGF4RXJyb3JcIiwgXCJTeW50YXhXYXJuaW5nXCIsIFwiU3lzdGVtRXJyb3JcIiwgXCJTeXN0ZW1FeGl0XCIsIFwiVGFiRXJyb3JcIiwgXCJUaW1lb3V0RXJyb3JcIiwgXCJUcnVlXCIsIFwiVHlwZUVycm9yXCIsIFwiVW5ib3VuZExvY2FsRXJyb3JcIiwgXCJVbmljb2RlRGVjb2RlRXJyb3JcIiwgXCJVbmljb2RlRW5jb2RlRXJyb3JcIiwgXCJVbmljb2RlRXJyb3JcIiwgXCJVbmljb2RlVHJhbnNsYXRlRXJyb3JcIiwgXCJVbmljb2RlV2FybmluZ1wiLCBcIlVzZXJXYXJuaW5nXCIsIFwiVmFsdWVFcnJvclwiLCBcIldhcm5pbmdcIiwgXCJaZXJvRGl2aXNpb25FcnJvclwiLCBcIl9fYnVpbGRfY2xhc3NfX1wiLCBcIl9fZGVidWdfX1wiLCBcIl9fZG9jX19cIiwgXCJfX2ltcG9ydF9fXCIsIFwiX19sb2FkZXJfX1wiLCBcIl9fbmFtZV9fXCIsIFwiX19wYWNrYWdlX19cIiwgXCJfX3NwZWNfX1wiLCBcImFic1wiLCBcImFsbFwiLCBcImFueVwiLCBcImFzY2lpXCIsIFwiYmluXCIsIFwiYm9vbFwiLCBcImJ5dGVhcnJheVwiLCBcImJ5dGVzXCIsIFwiY2FsbGFibGVcIiwgXCJjaHJcIiwgXCJjbGFzc21ldGhvZFwiLCBcImNvbXBpbGVcIiwgXCJjb21wbGV4XCIsIFwiY29weXJpZ2h0XCIsIFwiY3JlZGl0c1wiLCBcImRlbGF0dHJcIiwgXCJkaWN0XCIsIFwiZGlyXCIsIFwiZGl2bW9kXCIsIFwiZW51bWVyYXRlXCIsIFwiZXZhbFwiLCBcImV4ZWNcIiwgXCJleGl0XCIsIFwiZmlsdGVyXCIsIFwiZmxvYXRcIiwgXCJmb3JtYXRcIiwgXCJmcm96ZW5zZXRcIiwgXCJnZXRhdHRyXCIsIFwiZ2xvYmFsc1wiLCBcImhhc2F0dHJcIiwgXCJoYXNoXCIsIFwiaGVscFwiLCBcImhleFwiLCBcImlkXCIsIFwiaW5wdXRcIiwgXCJpbnRcIiwgXCJpc2luc3RhbmNlXCIsIFwiaXNzdWJjbGFzc1wiLCBcIml0ZXJcIiwgXCJsZW5cIiwgXCJsaWNlbnNlXCIsIFwibGlzdFwiLCBcImxvY2Fsc1wiLCBcIm1hcFwiLCBcIm1heFwiLCBcIm1lbW9yeXZpZXdcIiwgXCJtaW5cIiwgXCJuZXh0XCIsIFwib2JqZWN0XCIsIFwib2N0XCIsIFwib3BlblwiLCBcIm9yZFwiLCBcInBvd1wiLCBcInByaW50XCIsIFwicHJvcGVydHlcIiwgXCJxdWl0XCIsIFwicmFuZ2VcIiwgXCJyZXByXCIsIFwicmV2ZXJzZWRcIiwgXCJyb3VuZFwiLCBcInNldFwiLCBcInNldGF0dHJcIiwgXCJzbGljZVwiLCBcInNvcnRlZFwiLCBcInN0YXRpY21ldGhvZFwiLCBcInN0clwiLCBcInN1bVwiLCBcInN1cGVyXCIsIFwidHVwbGVcIiwgXCJ0eXBlXCIsIFwidmFyc1wiLCBcInppcFwiXVxuXHRcdHRoaXMua2V5d29yZHMgPSBbXCJhbmRcIiwgXCJhc1wiLCBcImFzc2VydFwiLCBcImJyZWFrXCIsIFwiY2xhc3NcIiwgXCJjb250aW51ZVwiLCBcImRlZlwiLCBcImRlbFwiLCBcImVsaWZcIiwgXCJlbHNlXCIsIFwiZXhjZXB0XCIsIFwiZXhlY1wiLCBcImZpbmFsbHlcIiwgXCJmb3JcIiwgXCJmcm9tXCIsIFwiZ2xvYmFsXCIsIFwiaWZcIiwgXCJpbXBvcnRcIiwgXCJpblwiLCBcImlzXCIsIFwibGFtYmRhXCIsIFwibm90XCIsIFwib3JcIiwgXCJwYXNzXCIsIFwicHJpbnRcIiwgXCJyYWlzZVwiLCBcInJldHVyblwiLCBcInRyeVwiLCBcIndoaWxlXCIsIFwid2l0aFwiLCBcInlpZWxkXCJdXG5cdH1cblxuICAgIHNhbml0aXplKGlkKSB7XG5cdFx0dmFyIHNhbml0aXplZElkID0gaWRcblx0XHRpZiAodGhpcy5idWlsdGlucy5pbmNsdWRlcyhzYW5pdGl6ZWRJZCkgfHwgdGhpcy5rZXl3b3Jkcy5pbmNsdWRlcyhzYW5pdGl6ZWRJZCkpIHtcblx0XHRcdHNhbml0aXplZElkID0gXCJfXCIgKyBzYW5pdGl6ZWRJZFxuXHRcdH1cblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLi9nLCBcInRoaXNcIilcblx0XHRzYW5pdGl6ZWRJZCA9IHNhbml0aXplZElkLnJlcGxhY2UoL1xcLy9nLCBcIi5cIilcblx0XHRyZXR1cm4gc2FuaXRpemVkSWRcblx0fVxuXG5cdG1hcFRvRnVuY3Rpb24obm9kZVR5cGUpIHtcblx0XHRsZXQgdHJhbnNsYXRpb25UYWJsZSA9IHtcblx0XHRcdFwiQ29udm9sdXRpb25cIjogXCJGLmNvbnYyZFwiLFxuXHRcdFx0XCJEZWNvbnZvbHV0aW9uXCI6IFwiRi5jb252X3RyYW5zcG9zZTJkXCIsXG5cdFx0XHRcIkF2ZXJhZ2VQb29saW5nXCI6IFwiRi5hdmdfcG9vbDJkXCIsXG5cdFx0XHRcIkFkYXB0aXZlQXZlcmFnZVBvb2xpbmdcIjogXCJGLmFkYXB0aXZlX2F2Z19wb29sMmRcIixcblx0XHRcdFwiTWF4UG9vbGluZ1wiOiBcIkYubWF4X3Bvb2wyZFwiLFxuXHRcdFx0XCJBZGFwdGl2ZU1heFBvb2xpbmdcIjogXCJGLmFkYXB0aXZlX21heF9wb29sMmRcIixcblx0XHRcdFwiTWF4VW5wb29saW5nXCI6IFwiRi5tYXhfdW5wb29sMmRcIixcblx0XHRcdFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucmVsdVwiLFxuXHRcdFx0XCJFeHBvbmVudGlhbExpbmVhclVuaXRcIjogXCJGLmVsdVwiLFxuXHRcdFx0XCJQYXJhbWV0cmljUmVjdGlmaWVkTGluZWFyVW5pdFwiOiBcIkYucHJlbHVcIixcblx0XHRcdFwiTGVha3lSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5sZWFreV9yZWx1XCIsXG5cdFx0XHRcIlJhbmRvbWl6ZWRSZWN0aWZpZWRMaW5lYXJVbml0XCI6IFwiRi5ycmVsdVwiLFxuXHRcdFx0XCJTaWdtb2lkXCI6IFwiRi5zaWdtb2lkXCIsXG5cdFx0XHRcIkxvZ1NpZ21vaWRcIjogXCJGLmxvZ3NpZ21vaWRcIixcblx0XHRcdFwiVGhyZXNob2xkXCI6IFwiRi50aHJlc2hvbGRcIixcblx0XHRcdFwiSGFyZFRhbmhcIjogXCJGLmhhcmR0YW5oXCIsXG5cdFx0XHRcIlRhbmhcIjogXCJGLnRhbmhcIixcblx0XHRcdFwiVGFuaFNocmlua1wiOiBcIkYudGFuaHNocmlua1wiLFxuXHRcdFx0XCJIYXJkU2hyaW5rXCI6IFwiRi5oYXJkc2hyaW5rXCIsXG5cdFx0XHRcIkxvZ1NvZnRNYXhcIjogXCJGLmxvZ19zb2Z0bWF4XCIsXG5cdFx0XHRcIlNvZnRTaHJpbmtcIjogXCJGLnNvZnRzaHJpbmtcIixcblx0XHRcdFwiU29mdE1heFwiOiBcIkYuc29mdG1heFwiLFxuXHRcdFx0XCJTb2Z0TWluXCI6IFwiRi5zb2Z0bWluXCIsXG5cdFx0XHRcIlNvZnRQbHVzXCI6IFwiRi5zb2Z0cGx1c1wiLFxuXHRcdFx0XCJTb2Z0U2lnblwiOiBcIkYuc29mdHNpZ25cIixcblx0XHRcdFwiQmF0Y2hOb3JtYWxpemF0aW9uXCI6IFwiRi5iYXRjaF9ub3JtXCIsXG5cdFx0XHRcIkxpbmVhclwiOiBcIkYubGluZWFyXCIsXG5cdFx0XHRcIkRyb3BvdXRcIjogXCJGLmRyb3BvdXRcIixcblx0XHRcdFwiUGFpcndpc2VEaXN0YW5jZVwiOiBcIkYucGFpcndpc2VfZGlzdGFuY2VcIixcblx0XHRcdFwiQ3Jvc3NFbnRyb3B5XCI6IFwiRi5jcm9zc19lbnRyb3B5XCIsXG5cdFx0XHRcIkJpbmFyeUNyb3NzRW50cm9weVwiOiBcIkYuYmluYXJ5X2Nyb3NzX2VudHJvcHlcIixcblx0XHRcdFwiS3VsbGJhY2tMZWlibGVyRGl2ZXJnZW5jZUxvc3NcIjogXCJGLmtsX2RpdlwiLFxuXHRcdFx0XCJQYWRcIjogXCJGLnBhZFwiLFxuXHRcdFx0XCJWYXJpYWJsZVwiOiBcIkFHLlZhcmlhYmxlXCIsXG5cdFx0XHRcIlJhbmRvbU5vcm1hbFwiOiBcIlQucmFuZG5cIixcblx0XHRcdFwiVGVuc29yXCI6IFwiVC5UZW5zb3JcIlxuXHRcdH1cblxuXHRcdHJldHVybiB0cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KG5vZGVUeXBlKSA/IHRyYW5zbGF0aW9uVGFibGVbbm9kZVR5cGVdIDogbm9kZVR5cGVcblxuXHR9XG5cblx0aW5kZW50KGNvZGUsIGxldmVsID0gMSwgaW5kZW50UGVyTGV2ZWwgPSBcIiAgICBcIikge1xuXHRcdGxldCBpbmRlbnQgPSBpbmRlbnRQZXJMZXZlbC5yZXBlYXQobGV2ZWwpXG5cdFx0cmV0dXJuIGNvZGUuc3BsaXQoXCJcXG5cIikubWFwKGxpbmUgPT4gaW5kZW50ICsgbGluZSkuam9pbihcIlxcblwiKVxuXHR9XG5cblx0Z2VuZXJhdGVDb2RlKGdyYXBoLCBkZWZpbml0aW9ucykge1xuXHRcdGxldCBpbXBvcnRzID1cbmBpbXBvcnQgdG9yY2ggYXMgVFxuaW1wb3J0IHRvcmNoLm5uLmZ1bmN0aW9uYWwgYXMgRlxuaW1wb3J0IHRvcmNoLmF1dG9ncmFkIGFzIEFHYFxuXG5cdFx0bGV0IG1vZHVsZURlZmluaXRpb25zID0gT2JqZWN0LmtleXMoZGVmaW5pdGlvbnMpLm1hcChkZWZpbml0aW9uTmFtZSA9PiB7XG5cdFx0XHRpZiAoZGVmaW5pdGlvbk5hbWUgIT09IFwibWFpblwiKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmdlbmVyYXRlQ29kZUZvck1vZHVsZShkZWZpbml0aW9uTmFtZSwgZGVmaW5pdGlvbnNbZGVmaW5pdGlvbk5hbWVdKVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9yZXR1cm4gXCJcIlxuXHRcdFx0fVxuXHRcdH0pXG5cblx0XHRsZXQgY29kZSA9XG5gJHtpbXBvcnRzfVxuXG4ke21vZHVsZURlZmluaXRpb25zLmpvaW4oXCJcXG5cIil9XG5gXG5cblx0XHRyZXR1cm4gY29kZVxuXHR9XG5cblx0Z2VuZXJhdGVDb2RlRm9yTW9kdWxlKGNsYXNzbmFtZSwgZ3JhcGgpIHtcblx0XHRsZXQgdG9wb2xvZ2ljYWxPcmRlcmluZyA9IGdyYXBobGliLmFsZy50b3Bzb3J0KGdyYXBoKVxuXHRcdGxldCBmb3J3YXJkRnVuY3Rpb24gPSBcIlwiXG5cblx0XHR0b3BvbG9naWNhbE9yZGVyaW5nLm1hcChub2RlID0+IHtcblx0XHRcdC8vIGNvbnNvbGUubG9nKFwibXVcIiwgbm9kZSlcblx0XHRcdGxldCBuID0gZ3JhcGgubm9kZShub2RlKVxuXHRcdFx0bGV0IGNoID0gZ3JhcGguY2hpbGRyZW4obm9kZSlcblxuXHRcdFx0aWYgKCFuKSB7XG5cdFx0XHRcdHJldHVyblxuXHRcdFx0fVxuXHRcdFx0Ly8gY29uc29sZS5sb2cobilcblxuXHRcdFx0aWYgKGNoLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRsZXQgaW5Ob2RlcyA9IGdyYXBoLmluRWRnZXMobm9kZSkubWFwKGUgPT4gdGhpcy5zYW5pdGl6ZShlLnYpKVxuXHRcdFx0XHRmb3J3YXJkRnVuY3Rpb24gKz0gYCR7dGhpcy5zYW5pdGl6ZShub2RlKX0gPSAke3RoaXMubWFwVG9GdW5jdGlvbihuLmNsYXNzKX0oJHtpbk5vZGVzLmpvaW4oXCIsIFwiKX0pXFxuYFxuXHRcdFx0fSBcblx0XHR9LCB0aGlzKVxuXG5cdFx0bGV0IG1vZHVsZUNvZGUgPVxuYGNsYXNzICR7Y2xhc3NuYW1lfShULm5uLk1vZHVsZSk6XG4gICAgZGVmIF9faW5pdF9fKHNlbGYsIHBhcmFtMSwgcGFyYW0yKTogIyBwYXJhbWV0ZXJzIGhlcmVcbiAgICAgICAgc3VwZXIoJHtjbGFzc25hbWV9LCBzZWxmKS5fX2luaXRfXygpXG4gICAgICAgICMgYWxsIGRlY2xhcmF0aW9ucyBoZXJlXG5cbiAgICBkZWYgZm9yd2FyZChzZWxmLCBpbjEsIGluMik6ICMgYWxsIElucHV0cyBoZXJlXG4gICAgICAgICMgYWxsIGZ1bmN0aW9uYWwgc3R1ZmYgaGVyZVxuJHt0aGlzLmluZGVudChmb3J3YXJkRnVuY3Rpb24sIDIpfVxuICAgICAgICByZXR1cm4gKG91dDEsIG91dDIpICMgYWxsIE91dHB1dHMgaGVyZVxuYFxuXHRcdHJldHVybiBtb2R1bGVDb2RlXG5cdH1cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIHN1cGVyKHByb3BzKTtcbiAgICAgICAgdGhpcy5ncmFwaExheW91dCA9IG5ldyBHcmFwaExheW91dCh0aGlzLnNhdmVHcmFwaC5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgICAgICAgIGdyYXBoOiBudWxsLFxuICAgICAgICAgICAgcHJldmlvdXNWaWV3Qm94OiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYW5pbWF0ZSA9IG51bGxcbiAgICB9XG5cbiAgICBzYXZlR3JhcGgoZ3JhcGgpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBncmFwaDogZ3JhcGhcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcbiAgICAgICAgaWYgKG5leHRQcm9wcy5ncmFwaCkge1xuICAgICAgICAgICAgbmV4dFByb3BzLmdyYXBoLl9sYWJlbC5yYW5rZGlyID0gbmV4dFByb3BzLmxheW91dDtcbiAgICAgICAgICAgIHRoaXMuZ3JhcGhMYXlvdXQubGF5b3V0KG5leHRQcm9wcy5ncmFwaCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGUobmV4dFByb3BzLCBuZXh0U3RhdGUpIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLnN0YXRlICE9PSBuZXh0U3RhdGUpXG4gICAgfVxuXG4gICAgaGFuZGxlQ2xpY2sobm9kZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkNsaWNrZWRcIiwgbm9kZSk7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0ZWROb2RlOiBub2RlLmlkXG4gICAgICAgIH0pXG4gICAgICAgIHRoaXMuYW5pbWF0ZS5iZWdpbkVsZW1lbnQoKVxuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0ZSA9IGRvbU5vZGVcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFuaW1hdGUuYmVnaW5FbGVtZW50KClcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGlmICghdGhpcy5zdGF0ZS5ncmFwaCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcy5zdGF0ZS5ncmFwaClcbiAgICAgICAgICAgIHJldHVybiBudWxsXG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZyA9IHRoaXMuc3RhdGUuZ3JhcGg7XG5cbiAgICAgICAgbGV0IG5vZGVzID0gZy5ub2RlcygpLm1hcChub2RlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZ3JhcGggPSB0aGlzO1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUobm9kZU5hbWUpO1xuICAgICAgICAgICAgbGV0IG5vZGUgPSBudWxsO1xuICAgICAgICAgICAgbGV0IHByb3BzID0ge1xuICAgICAgICAgICAgICAgIGtleTogbm9kZU5hbWUsXG4gICAgICAgICAgICAgICAgbm9kZTogbixcbiAgICAgICAgICAgICAgICBvbkNsaWNrOiBncmFwaC5oYW5kbGVDbGljay5iaW5kKGdyYXBoKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobi5pc01ldGFub2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgbm9kZSA9IDxNZXRhbm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobi51c2VyR2VuZXJhdGVkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZSA9IDxJZGVudGlmaWVkTm9kZSB7Li4ucHJvcHN9IC8+O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGUgPSA8QW5vbnltb3VzTm9kZSB7Li4ucHJvcHN9IC8+XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGV0IGVkZ2VzID0gZy5lZGdlcygpLm1hcChlZGdlTmFtZSA9PiB7XG4gICAgICAgICAgICBsZXQgZSA9IGcuZWRnZShlZGdlTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gPEVkZ2Uga2V5PXtgJHtlZGdlTmFtZS52fS0+JHtlZGdlTmFtZS53fWB9IGVkZ2U9e2V9Lz5cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIHZpZXdCb3hfd2hvbGUgPSBgMCAwICR7Zy5ncmFwaCgpLndpZHRofSAke2cuZ3JhcGgoKS5oZWlnaHR9YDtcbiAgICAgICAgdmFyIHRyYW5zZm9ybVZpZXcgPSBgdHJhbnNsYXRlKDBweCwwcHgpYCArIGBzY2FsZSgke2cuZ3JhcGgoKS53aWR0aCAvIGcuZ3JhcGgoKS53aWR0aH0sJHtnLmdyYXBoKCkuaGVpZ2h0IC8gZy5ncmFwaCgpLmhlaWdodH0pYDtcbiAgICAgICAgXG4gICAgICAgIGxldCBzZWxlY3RlZE5vZGUgPSB0aGlzLnN0YXRlLnNlbGVjdGVkTm9kZTtcbiAgICAgICAgdmFyIHZpZXdCb3hcbiAgICAgICAgaWYgKHNlbGVjdGVkTm9kZSkge1xuICAgICAgICAgICAgbGV0IG4gPSBnLm5vZGUoc2VsZWN0ZWROb2RlKTtcbiAgICAgICAgICAgIHZpZXdCb3ggPSBgJHtuLnggLSBuLndpZHRoIC8gMn0gJHtuLnkgLSBuLmhlaWdodCAvIDJ9ICR7bi53aWR0aH0gJHtuLmhlaWdodH1gXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2aWV3Qm94ID0gdmlld0JveF93aG9sZVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZlcnNpb249XCIxLjFcIj5cbiAgICAgICAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLnJlYWRGaWxlU3luYyhcInNyYy9idW5kbGUuY3NzXCIsIFwidXRmLThcIiwgKGVycikgPT4ge2NvbnNvbGUubG9nKGVycil9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgPC9zdHlsZT5cbiAgICAgICAgICAgICAgICA8YW5pbWF0ZSByZWY9e3RoaXMubW91bnQuYmluZCh0aGlzKX0gYXR0cmlidXRlTmFtZT1cInZpZXdCb3hcIiBmcm9tPXt2aWV3Qm94X3dob2xlfSB0bz17dmlld0JveH0gYmVnaW49XCIwc1wiIGR1cj1cIjAuMjVzXCIgZmlsbD1cImZyZWV6ZVwiIHJlcGVhdENvdW50PVwiMVwiPjwvYW5pbWF0ZT5cbiAgICAgICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICAgICAgPG1hcmtlciBpZD1cImFycm93XCIgdmlld0JveD1cIjAgMCAxMCAxMFwiIHJlZlg9XCIxMFwiIHJlZlk9XCI1XCIgbWFya2VyVW5pdHM9XCJzdHJva2VXaWR0aFwiIG1hcmtlcldpZHRoPVwiMTBcIiBtYXJrZXJIZWlnaHQ9XCI3LjVcIiBvcmllbnQ9XCJhdXRvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDMgNSB6XCIgY2xhc3NOYW1lPVwiYXJyb3dcIj48L3BhdGg+XG4gICAgICAgICAgICAgICAgICAgIDwvbWFya2VyPlxuICAgICAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgICAgICA8ZyBpZD1cImdyYXBoXCI+XG4gICAgICAgICAgICAgICAgICAgIDxnIGlkPVwibm9kZXNcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtub2Rlc31cbiAgICAgICAgICAgICAgICAgICAgPC9nPlxuICAgICAgICAgICAgICAgICAgICA8ZyBpZD1cImVkZ2VzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7ZWRnZXN9XG4gICAgICAgICAgICAgICAgICAgIDwvZz5cbiAgICAgICAgICAgICAgICA8L2c+XG4gICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKTtcbiAgICB9XG59XG5cbmNsYXNzIEVkZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgbGluZSA9IGQzLmxpbmUoKVxuICAgICAgICAuY3VydmUoZDMuY3VydmVCYXNpcylcbiAgICAgICAgLngoZCA9PiBkLngpXG4gICAgICAgIC55KGQgPT4gZC55KVxuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgICAgICAgcHJldmlvdXNQb2ludHM6IFtdXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHByZXZpb3VzUG9pbnRzOiB0aGlzLnByb3BzLmVkZ2UucG9pbnRzXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdW50KGRvbU5vZGUpIHtcbiAgICAgICAgaWYgKGRvbU5vZGUpIHtcbiAgICAgICAgICAgIGRvbU5vZGUuYmVnaW5FbGVtZW50KCkgICAgXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBlID0gdGhpcy5wcm9wcy5lZGdlO1xuICAgICAgICBsZXQgbCA9IHRoaXMubGluZTtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT1cImVkZ2VcIiBtYXJrZXJFbmQ9XCJ1cmwoI2Fycm93KVwiPlxuICAgICAgICAgICAgICAgIDxwYXRoIGQ9e2woZS5wb2ludHMpfT5cbiAgICAgICAgICAgICAgICAgICAgPGFuaW1hdGUgcmVmPXt0aGlzLm1vdW50fSBrZXk9e01hdGgucmFuZG9tKCl9IHJlc3RhcnQ9XCJhbHdheXNcIiBmcm9tPXtsKHRoaXMuc3RhdGUucHJldmlvdXNQb2ludHMpfSB0bz17bChlLnBvaW50cyl9IGJlZ2luPVwiMHNcIiBkdXI9XCIwLjI1c1wiIGZpbGw9XCJmcmVlemVcIiByZXBlYXRDb3VudD1cIjFcIiBhdHRyaWJ1dGVOYW1lPVwiZFwiIC8+XG4gICAgICAgICAgICAgICAgPC9wYXRoPlxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTm9kZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBzdXBlcihwcm9wcyk7XG4gICAgfVxuICAgIGhhbmRsZUNsaWNrKCkge1xuICAgICAgICB0aGlzLnByb3BzLm9uQ2xpY2sodGhpcy5wcm9wcy5ub2RlKTtcbiAgICB9XG4gICAgcmVuZGVyKCkge1xuICAgICAgICBsZXQgbiA9IHRoaXMucHJvcHMubm9kZTtcbiAgICAgICAgY29uc3QgdHlwZSA9IG4uaXNNZXRhbm9kZSA/IFwibWV0YW5vZGVcIiA6IFwibm9kZVwiXG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxnIGNsYXNzTmFtZT17YCR7dHlwZX0gJHtuLmNsYXNzfWB9IG9uQ2xpY2s9e3RoaXMuaGFuZGxlQ2xpY2suYmluZCh0aGlzKX0gdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7TWF0aC5mbG9vcihuLnggLShuLndpZHRoLzIpKX0sJHtNYXRoLmZsb29yKG4ueSAtKG4uaGVpZ2h0LzIpKX0pYH0+XG4gICAgICAgICAgICAgICAgPHJlY3Qgd2lkdGg9e24ud2lkdGh9IGhlaWdodD17bi5oZWlnaHR9IHJ4PVwiMTVweFwiIHJ5PVwiMTVweFwiIHN0eWxlPXtuLnN0eWxlfSAvPlxuICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICAgICAgPC9nPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgTWV0YW5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKDEwLDApYH0gdGV4dEFuY2hvcj1cInN0YXJ0XCIgc3R5bGU9e3tkb21pbmFudEJhc2VsaW5lOiBcImlkZW9ncmFwaGljXCJ9fT5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgY2xhc3NOYW1lPVwiaWRcIj57bi51c2VyR2VuZXJhdGVkSWR9PC90c3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuIHg9XCIwXCIgZHk9XCIxLjJlbVwiPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgQW5vbnltb3VzTm9kZSBleHRlbmRzIE5vZGV7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgIH1cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGxldCBuID0gdGhpcy5wcm9wcy5ub2RlO1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPE5vZGUgey4uLnRoaXMucHJvcHN9PlxuICAgICAgICAgICAgICAgIDx0ZXh0IHRyYW5zZm9ybT17YHRyYW5zbGF0ZSgkeyhuLndpZHRoLzIpIH0sJHsobi5oZWlnaHQvMil9KWB9IHRleHRBbmNob3I9XCJtaWRkbGVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRzcGFuPntuLmNsYXNzfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgICAgPC9Ob2RlPlxuICAgICAgICApO1xuICAgIH1cbn1cblxuY2xhc3MgSWRlbnRpZmllZE5vZGUgZXh0ZW5kcyBOb2Rle1xuICAgIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG4gPSB0aGlzLnByb3BzLm5vZGU7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8Tm9kZSB7Li4udGhpcy5wcm9wc30+XG4gICAgICAgICAgICAgICAgPHRleHQgdHJhbnNmb3JtPXtgdHJhbnNsYXRlKCR7KG4ud2lkdGgvMikgfSwkeyhuLmhlaWdodC8yKX0pYH0gdGV4dEFuY2hvcj1cIm1pZGRsZVwiIHN0eWxlPXt7ZG9taW5hbnRCYXNlbGluZTogXCJpZGVvZ3JhcGhpY1wifX0+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGNsYXNzTmFtZT1cImlkXCI+e24udXNlckdlbmVyYXRlZElkfTwvdHNwYW4+XG4gICAgICAgICAgICAgICAgICAgIDx0c3BhbiB4PVwiMFwiIGR5PVwiMS4yZW1cIj57bi5jbGFzc308L3RzcGFuPlxuICAgICAgICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICAgIDwvTm9kZT5cbiAgICAgICAgKTtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
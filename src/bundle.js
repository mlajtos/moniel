"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComputationalGraph = function () {
	function ComputationalGraph(parent) {
		_classCallCheck(this, ComputationalGraph);

		this.graph = null;
		this.defaultEdge = {
			arrowhead: "vee",
			lineInterpolate: "basis"
		};
		this.nodeCounter = {};
		this.nodeStack = [];
		this.previousNodeStack = [];
		this.scopeStack = new ScopeStack();

		this.initialize();
		this.moniel = parent;
	}

	_createClass(ComputationalGraph, [{
		key: "initialize",
		value: function initialize() {
			this.graph = new graphlib.Graph({
				compound: true
			});
			this.graph.setGraph({});
			this.scopeStack.initialize();

			this.addMain();
		}
	}, {
		key: "enterScope",
		value: function enterScope(scope) {
			this.scopeStack.push(scope.name);
			var currentScopeId = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(currentScopeId, {
				label: scope.name,
				clusterLabelPos: "top",
				class: "Scope",
				_source: scope._source
			});

			var previousScopeId = this.scopeStack.previousScopeIdentifier();
			this.graph.setParent(currentScopeId, previousScopeId);
		}
	}, {
		key: "exitScope",
		value: function exitScope() {
			this.scopeStack.pop();
		}
	}, {
		key: "generateInstanceId",
		value: function generateInstanceId(type) {
			if (!this.nodeCounter.hasOwnProperty(type)) {
				this.nodeCounter[type] = 0;
			}
			this.nodeCounter[type] += 1;
			var id = type + this.nodeCounter[type];
			return id;
		}
	}, {
		key: "addMain",
		value: function addMain() {
			this.scopeStack.push(".");
			var id = this.scopeStack.currentScopeIdentifier();

			this.graph.setNode(id, {
				class: "Network"
			});
		}
	}, {
		key: "touchNode",
		value: function touchNode(nodePath) {
			var _this = this;

			if (this.graph.hasNode(nodePath)) {
				this.nodeStack.push(nodePath);
				this.previousNodeStack.forEach(function (fromPath) {
					_this.setEdge(fromPath, nodePath);
				});
			} else {}
		}
	}, {
		key: "referenceNode",
		value: function referenceNode(id) {
			this.scopeStack.push(id);
			var nodePath = this.scopeStack.currentScopeIdentifier();
			var scope = this.scopeStack.previousScopeIdentifier();

			if (!this.graph.hasNode(nodePath)) {
				this.graph.setNode(nodePath, {
					label: id,
					class: "undefined"
				});
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

			if (!this.graph.hasNode(nodePath)) {
				this.graph.setNode(nodePath, node);
				this.setParent(nodePath, scope);
			} else {
				this.graph.setNode(nodePath, node);
				this.setParent(nodePath, scope);
			}

			this.touchNode(nodePath);
			this.scopeStack.pop();
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
			// console.log(`Freezing node stack. Content: ${JSON.stringify(this.nodeStack)}`);
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
		key: "isScope",
		value: function isScope(nodePath) {
			return this.graph.node(nodePath).class === "Scope";
		}
	}, {
		key: "getScopeOutput",
		value: function getScopeOutput(scopePath) {
			var _this2 = this;

			var scope = this.graph.node(scopePath);
			var outs = this.graph.children(scopePath).filter(function (node) {
				return _this2.isOutput(node);
			});
			if (outs.length === 1) {
				return outs[0];
			} else if (outs.length === 0) {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.label + "\" doesn't have any Output node.",
					type: "error",
					position: scope._source.startIdx
				});
				return null;
			} else {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.label + "\" has more than one Output node.",
					type: "error",
					position: scope._source.startIdx
				});
				return null;
			}
		}
	}, {
		key: "getScopeInput",
		value: function getScopeInput(scopePath) {
			var _this3 = this;

			var scope = this.graph.node(scopePath);
			var ins = this.graph.children(scopePath).filter(function (node) {
				return _this3.isInput(node);
			});
			if (ins.length === 1) {
				return ins[0];
			} else if (ins.length === 0) {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.label + "\" doesn't have any Input node.",
					type: "error",
					position: scope._source.startIdx
				});
				return null;
			} else {
				this.moniel.logger.addIssue({
					message: "Scope \"" + scope.label + "\" has more than one Input node.",
					type: "error",
					position: scope._source.startIdx
				});
				return null;
			}
		}
	}, {
		key: "setEdge",
		value: function setEdge(fromPath, toPath) {
			// console.info(`Creating edge from "${fromPath}" to "${toPath}".`)

			if (this.isScope(fromPath)) {
				fromPath = this.getScopeOutput(fromPath);
			}

			if (this.isScope(toPath)) {
				toPath = this.getScopeInput(toPath);
			}

			if (fromPath && toPath) {
				this.graph.setEdge(fromPath, toPath, _extends({}, this.defaultEdge));
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
        return _this;
    }

    _createClass(Editor, [{
        key: "onChange",
        value: function onChange() {
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
                fontFamily: "Fira  Code",
                showLineNumbers: true,
                showGutter: true
            });
            this.editor.$blockScrolling = Infinity;

            if (this.props.defaultValue) {
                this.editor.setValue(this.props.defaultValue, -1);
            }

            this.editor.on("change", this.onChange);
        }
    }, {
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
            var _this2 = this;

            if (nextProps.issues) {
                var annotations = nextProps.issues.map(function (issue) {
                    var position = _this2.editor.session.doc.indexToPosition(issue.position);
                    return {
                        row: position.row,
                        column: position.column,
                        text: issue.message,
                        type: issue.type
                    };
                });

                this.editor.session.setAnnotations(annotations);
                this.editor.execCommand("goToNextError");
            } else {
                this.editor.session.clearAnnotations();
                this.editor.execCommand("goToNextError");
            }

            if (nextProps.value) {
                this.editor.setValue(nextProps.value, -1);
            }

            if (nextProps.highlightRange) {
                this.editor.getSession().removeMarker(this.marker);
                //console.log("highlightRange", nextProps.highlightRange);
                var Range = require('ace/range').Range;
                var start = this.editor.session.doc.indexToPosition(nextProps.highlightRange.startIdx);
                var end = this.editor.session.doc.indexToPosition(nextProps.highlightRange.endIdx);
                var range = new Range(start.row, start.column, end.row, end.column);
                //console.log(range);
                this.marker = this.editor.getSession().addMarker(range, "highlight", "text");
            }
        }
    }, {
        key: "render",
        value: function render() {
            var _this3 = this;

            return React.createElement("div", { ref: function ref(element) {
                    return _this3.init(element);
                } });
        }
    }]);

    return Editor;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IDE = function (_React$Component) {
	_inherits(IDE, _React$Component);

	function IDE(props) {
		_classCallCheck(this, IDE);

		var _this = _possibleConstructorReturn(this, (IDE.__proto__ || Object.getPrototypeOf(IDE)).call(this, props));

		_this.moniel = new Moniel();

		_this.state = {
			"grammar": grammar,
			"semantics": semantics,
			"networkDefinition": "",
			"ast": null,
			"issues": null,
			"highlightRange": {
				startIdx: 0,
				endIdx: 0
			}
		};
		_this.updateNetworkDefinition = _this.updateNetworkDefinition.bind(_this);
		_this.delayedUpdateNetworkDefinition = _this.delayedUpdateNetworkDefinition.bind(_this);
		_this.onHighlight = _this.onHighlight.bind(_this);
		_this.lock = null;
		return _this;
	}

	_createClass(IDE, [{
		key: "componentDidMount",
		value: function componentDidMount() {
			this.loadExample("VGG16");
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
			}, 250);
		}
	}, {
		key: "updateNetworkDefinition",
		value: function updateNetworkDefinition(value) {
			var result = this.compileToAST(this.state.grammar, this.state.semantics, value);
			if (result.ast) {
				this.moniel.walkAst(result.ast);
				var graph = this.moniel.getComputationalGraph();
				this.setState({
					networkDefinition: value,
					ast: result.ast,
					graph: graph,
					issues: this.moniel.getIssues()
				});
			} else {
				this.setState({
					networkDefinition: value,
					ast: null,
					graph: null,
					issues: [{
						position: result.position,
						message: "Expected " + result.expected + ".",
						type: "error"
					}]
				});
			}
		}
	}, {
		key: "onHighlight",
		value: function onHighlight(range) {
			this.setState({
				highlightRange: range
			});
		}
	}, {
		key: "loadExample",
		value: function loadExample(id) {
			var callback = function callback(value) {
				this.editor.setValue(value);
				this.setState({
					networkDefinition: value
				});
			};

			$.ajax({
				url: "/examples/" + id + ".mon",
				data: null,
				success: callback.bind(this),
				dataType: "text"
			});
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
			var _this3 = this;

			return React.createElement(
				"div",
				{ id: "container" },
				React.createElement(
					Panel,
					{ title: "Definition" },
					React.createElement(Editor, {
						ref: function ref(_ref) {
							return _this3.editor = _ref;
						},
						mode: "moniel",
						theme: "monokai",
						issues: this.state.issues,
						onChange: this.delayedUpdateNetworkDefinition,
						defaultValue: this.state.networkDefinition,
						highlightRange: this.state.highlightRange
					})
				),
				React.createElement(
					Panel,
					{ title: "Visualization" },
					React.createElement(VisualGraph, { graph: this.state.graph, onHighlight: this.onHighlight })
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Moniel = function () {
	function Moniel() {
		_classCallCheck(this, Moniel);

		this.logger = new Logger();
		this.graph = new ComputationalGraph(this);
		this.definitions = [];

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
			var defaultDefinitions = ["Add", "Input", "Output", "Placeholder", "Variable", "Constant", "Multiply", "Convolution", "Dense", "MaxPooling", "BatchNormalization", "Identity", "RectifiedLinearUnit", "Sigmoid", "ExponentialLinearUnit", "Tanh", "Absolute", "Summation", "Dropout", "MatrixMultiply", "BiasAdd", "Reshape", "Concat", "Flatten", "Tensor", "Softmax", "CrossEntropy"];
			defaultDefinitions.forEach(function (definition) {
				return _this.addDefinition(definition);
			});
		}
	}, {
		key: "addDefinition",
		value: function addDefinition(definition) {
			this.definitions.push(definition);
		}
	}, {
		key: "handleScopeDefinition",
		value: function handleScopeDefinition(scope) {
			this.graph.enterScope(scope);
			this.walkAst(scope.body);
			this.graph.exitScope();
		}
	}, {
		key: "handleScopeDefinitionBody",
		value: function handleScopeDefinitionBody(scopeBody) {
			var _this2 = this;

			scopeBody.definitions.forEach(function (definition) {
				return _this2.walkAst(definition);
			});
		}
	}, {
		key: "handleBlockDefinition",
		value: function handleBlockDefinition(blockDefinition) {
			// console.info(`Adding "${blockDefinition.name}" to available definitions.`);
			this.addDefinition(blockDefinition.name);
		}
	}, {
		key: "handleUnrecognizedNode",
		value: function handleUnrecognizedNode(node) {}
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
			connection.list.forEach(function (item) {
				_this4.graph.freezeNodeStack();
				_this4.walkAst(item);
			});
		}

		// this is doing too much – break into "not recognized", "success" and "ambiguous"

	}, {
		key: "handleBlockInstance",
		value: function handleBlockInstance(instance) {
			var id = undefined;
			var label = "undeclared";
			var type = "Unknown";
			var shape = "rect";
			var color = "yellow";

			var possibleTypes = this.getTypeOfInstance(instance);

			if (possibleTypes.length === 0) {
				type = "undefined";
				label = instance.name;
				shape = "rect";
				this.addIssue({
					message: "Unrecognized type of block instance \"" + instance.name + "\". No possible matches found.",
					position: instance._source.startIdx,
					type: "error"
				});
			} else if (possibleTypes.length === 1) {
				type = possibleTypes[0];
				label = type;
				color = colorHash.hex(label); // this should be handled in VisualGraph
			} else {
				type = "ambiguous";
				label = instance.name;
				shape = "diamond";
				this.addIssue({
					message: "Unrecognized type of block instance. Possible matches: " + possibleTypes.join(", ") + ".",
					position: instance._source.startIdx,
					type: "warning"
				});
			}

			if (!instance.alias) {
				id = this.graph.generateInstanceId(type);
			} else {
				id = instance.alias.value;
			}

			this.graph.createNode(id, {
				label: label,
				class: type,
				shape: shape,
				style: "fill: " + color,
				_source: instance
			});
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
		key: "getTypeOfInstance",
		value: function getTypeOfInstance(instance) {
			// console.info(`Trying to match "${instance.name}" against block definitions.`);
			return Moniel.nameResolution(instance.name, this.definitions);
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
		key: "walkAst",
		value: function walkAst(node) {
			if (!node) {
				return;
			}

			switch (node.type) {
				case "Network":
					this.handleNetworkDefinition(node);break;
				case "BlockDefinition":
					this.handleBlockDefinition(node);break;
				case "ScopeDefinition":
					this.handleScopeDefinition(node);break;
				case "ScopeDefinitionBody":
					this.handleScopeDefinitionBody(node);break;
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
			var partialArray = partial.split(/(?=[A-Z])/);
			var listArray = list.map(function (definition) {
				return definition.split(/(?=[A-Z])/);
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
        { className: "panel" },
        React.createElement(
          "div",
          { className: "header" },
          this.props.title
        ),
        this.props.children
      );
    }
  }]);

  return Panel;
}(React.Component);
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScopeStack = function () {
	function ScopeStack() {
		var scope = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

		_classCallCheck(this, ScopeStack);

		this.scopeStack = [];

		if (Array.isArray(scope)) {
			this.scopeStack = scope;
		} else {}
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

        _this.dagreRenderer = new dagreD3.render();
        return _this;
    }

    _createClass(VisualGraph, [{
        key: "componentDidMount",
        value: function componentDidMount() {
            /*
            this.zoom = d3.behavior.zoom().on("zoom", function() {
                //console.log(d3.event.translate, d3.event.scale);
                console.log(d3.select(this.svgGroup));
                    d3.select(this.svgGroup).attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
                });
             d3.select(this.svg).call(this.zoom);
            */
        }
    }, {
        key: "layoutGraph",
        value: function layoutGraph(graph) {
            var svg = d3.select(this.svg);
            var group = d3.select(this.svgGroup);

            graph.graph().transition = function (selection) {
                return selection.transition().duration(250);
            };

            graph.setGraph({
                rankdir: 'BT',
                edgesep: 20,
                ranksep: 40,
                nodeSep: 20,
                marginx: 20,
                marginy: 20
            });
            // dagre.layout(graph);

            this.dagreRenderer(d3.select(this.svgGroup), graph);

            var nodes = group.selectAll("g.node");

            nodes.on("click", function (d) {
                var node = graph.node(d);
                this.props.onHighlight({
                    startIdx: node._interval.startIdx,
                    endIdx: node._interval.endIdx
                });
            }.bind(this));

            var graphWidth = graph.graph().width;
            var graphHeight = graph.graph().height;
            var width = this.svg.getBoundingClientRect().width;
            var height = this.svg.getBoundingClientRect().height;
            var zoomScale = Math.min(width / graphWidth, height / graphHeight);
            var translate = [width / 2 - graphWidth * zoomScale / 2, height / 2 - graphHeight * zoomScale / 2];

            //group.translate(translate);
            //group.scale(zoomScale);

            // center
            d3.select(this.svgGroup).transition().duration(250).attr("transform", "translate(" + translate + ")scale(" + zoomScale + ")");
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            if (this.props.graph) {
                this.layoutGraph(this.props.graph);
            }

            return React.createElement(
                "svg",
                { id: "visualization", ref: function ref(_ref2) {
                        return _this2.svg = _ref2;
                    } },
                React.createElement("g", { id: "group", ref: function ref(_ref) {
                        return _this2.svgGroup = _ref;
                    } })
            );
        }
    }]);

    return VisualGraph;
}(React.Component);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMvQ29tcHV0YXRpb25hbEdyYXBoLmpzIiwic2NyaXB0cy9FZGl0b3IuanN4Iiwic2NyaXB0cy9JREUuanN4Iiwic2NyaXB0cy9Mb2dnZXIuanMiLCJzY3JpcHRzL01vbmllbC5qcyIsInNjcmlwdHMvUGFuZWwuanN4Iiwic2NyaXB0cy9TY29wZVN0YWNrLmpzIiwic2NyaXB0cy9WaXN1YWxHcmFwaC5qc3giLCJzY3JpcHRzL2FwcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztJQUFNLGtCO0FBYUwsNkJBQVksTUFBWixFQUFvQjtBQUFBOztBQUFBLE9BWnBCLEtBWW9CLEdBWlosSUFZWTtBQUFBLE9BVnBCLFdBVW9CLEdBVk47QUFDUCxjQUFXLEtBREo7QUFFUCxvQkFBaUI7QUFGVixHQVVNO0FBQUEsT0FMcEIsV0FLb0IsR0FMTixFQUtNO0FBQUEsT0FKcEIsU0FJb0IsR0FKUixFQUlRO0FBQUEsT0FIcEIsaUJBR29CLEdBSEEsRUFHQTtBQUFBLE9BRnBCLFVBRW9CLEdBRlAsSUFBSSxVQUFKLEVBRU87O0FBQ25CLE9BQUssVUFBTDtBQUNBLE9BQUssTUFBTCxHQUFjLE1BQWQ7QUFDQTs7OzsrQkFFWTtBQUNaLFFBQUssS0FBTCxHQUFhLElBQUksU0FBUyxLQUFiLENBQW1CO0FBQy9CLGNBQVM7QUFEc0IsSUFBbkIsQ0FBYjtBQUdNLFFBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsRUFBcEI7QUFDTixRQUFLLFVBQUwsQ0FBZ0IsVUFBaEI7O0FBRU0sUUFBSyxPQUFMO0FBQ047Ozs2QkFFVSxLLEVBQU87QUFDakIsUUFBSyxVQUFMLENBQWdCLElBQWhCLENBQXFCLE1BQU0sSUFBM0I7QUFDQSxPQUFJLGlCQUFpQixLQUFLLFVBQUwsQ0FBZ0Isc0JBQWhCLEVBQXJCOztBQUVBLFFBQUssS0FBTCxDQUFXLE9BQVgsQ0FBbUIsY0FBbkIsRUFBbUM7QUFDbEMsV0FBTyxNQUFNLElBRHFCO0FBRWxDLHFCQUFpQixLQUZpQjtB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bmFsR3JhcGh7XG5cdGdyYXBoID0gbnVsbFxuXG5cdGRlZmF1bHRFZGdlID0ge1xuICAgICAgICBhcnJvd2hlYWQ6IFwidmVlXCIsXG4gICAgICAgIGxpbmVJbnRlcnBvbGF0ZTogXCJiYXNpc1wiXG4gICAgfVxuXG5cdG5vZGVDb3VudGVyID0ge31cblx0bm9kZVN0YWNrID0gW11cblx0cHJldmlvdXNOb2RlU3RhY2sgPSBbXVxuXHRzY29wZVN0YWNrID0gbmV3IFNjb3BlU3RhY2soKVxuXG5cdGNvbnN0cnVjdG9yKHBhcmVudCkge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubW9uaWVsID0gcGFyZW50O1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHR0aGlzLmdyYXBoID0gbmV3IGdyYXBobGliLkdyYXBoKHtcblx0XHRcdGNvbXBvdW5kOnRydWVcblx0XHR9KTtcbiAgICAgICAgdGhpcy5ncmFwaC5zZXRHcmFwaCh7fSk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLmluaXRpYWxpemUoKTtcblxuICAgICAgICB0aGlzLmFkZE1haW4oKTtcblx0fVxuXG5cdGVudGVyU2NvcGUoc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZS5uYW1lKTtcblx0XHRsZXQgY3VycmVudFNjb3BlSWQgPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0dGhpcy5ncmFwaC5zZXROb2RlKGN1cnJlbnRTY29wZUlkLCB7XG5cdFx0XHRsYWJlbDogc2NvcGUubmFtZSxcblx0XHRcdGNsdXN0ZXJMYWJlbFBvczogXCJ0b3BcIixcbiAgICAgICAgICAgIGNsYXNzOiBcIlNjb3BlXCIsXG4gICAgICAgICAgICBfc291cmNlOiBzY29wZS5fc291cmNlXG5cdFx0fSk7XG5cblx0XHRsZXQgcHJldmlvdXNTY29wZUlkID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0dGhpcy5ncmFwaC5zZXRQYXJlbnQoY3VycmVudFNjb3BlSWQsIHByZXZpb3VzU2NvcGVJZCk7XG5cdH1cblxuXHRleGl0U2NvcGUoKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Z2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpIHtcblx0XHRpZiAoIXRoaXMubm9kZUNvdW50ZXIuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcblx0XHRcdHRoaXMubm9kZUNvdW50ZXJbdHlwZV0gPSAwO1xuXHRcdH1cblx0XHR0aGlzLm5vZGVDb3VudGVyW3R5cGVdICs9IDE7XG5cdFx0bGV0IGlkID0gdHlwZSArIHRoaXMubm9kZUNvdW50ZXJbdHlwZV07XG5cdFx0cmV0dXJuIGlkO1xuXHR9XG5cblx0YWRkTWFpbigpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChcIi5cIik7XG5cdFx0bGV0IGlkID0gdGhpcy5zY29wZVN0YWNrLmN1cnJlbnRTY29wZUlkZW50aWZpZXIoKTtcblxuXHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShpZCwge1xuXHRcdFx0Y2xhc3M6IFwiTmV0d29ya1wiXG5cdFx0fSk7XG5cdH1cblxuXHR0b3VjaE5vZGUobm9kZVBhdGgpIHtcblx0XHRpZiAodGhpcy5ncmFwaC5oYXNOb2RlKG5vZGVQYXRoKSkge1xuXHRcdFx0dGhpcy5ub2RlU3RhY2sucHVzaChub2RlUGF0aCk7XG5cdFx0XHR0aGlzLnByZXZpb3VzTm9kZVN0YWNrLmZvckVhY2goZnJvbVBhdGggPT4ge1xuXHRcdFx0XHR0aGlzLnNldEVkZ2UoZnJvbVBhdGgsIG5vZGVQYXRoKVx0XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS53YXJuKGBUcnlpbmcgdG8gdG91Y2ggbm9uLWV4aXN0YW50IG5vZGUgXCIke25vZGVQYXRofVwiYCk7XG5cdFx0fVxuXHR9XG5cblx0cmVmZXJlbmNlTm9kZShpZCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjay5wdXNoKGlkKTtcblx0XHRsZXQgbm9kZVBhdGggPSB0aGlzLnNjb3BlU3RhY2suY3VycmVudFNjb3BlSWRlbnRpZmllcigpO1xuXHRcdGxldCBzY29wZSA9IHRoaXMuc2NvcGVTdGFjay5wcmV2aW91c1Njb3BlSWRlbnRpZmllcigpO1xuXG5cdFx0aWYgKCF0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpKSB7XG5cdFx0XHR0aGlzLmdyYXBoLnNldE5vZGUobm9kZVBhdGgsIHtcblx0XHRcdFx0bGFiZWw6IGlkLFxuXHRcdFx0XHRjbGFzczogXCJ1bmRlZmluZWRcIlxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblxuXHRcdHRoaXMudG91Y2hOb2RlKG5vZGVQYXRoKTtcblx0XHR0aGlzLnNjb3BlU3RhY2sucG9wKCk7XG5cdH1cblxuXHRjcmVhdGVOb2RlKGlkLCBub2RlKSB7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnB1c2goaWQpO1xuXHRcdGxldCBub2RlUGF0aCA9IHRoaXMuc2NvcGVTdGFjay5jdXJyZW50U2NvcGVJZGVudGlmaWVyKCk7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5zY29wZVN0YWNrLnByZXZpb3VzU2NvcGVJZGVudGlmaWVyKCk7XG5cblx0XHRpZiAoIXRoaXMuZ3JhcGguaGFzTm9kZShub2RlUGF0aCkpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwgbm9kZSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zb2xlLndhcm4oYFJlZGlmaW5pbmcgbm9kZSBcIiR7aWR9XCJgKTtcblx0XHRcdHRoaXMuZ3JhcGguc2V0Tm9kZShub2RlUGF0aCwgbm9kZSk7XG5cdFx0XHR0aGlzLnNldFBhcmVudChub2RlUGF0aCwgc2NvcGUpO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLnRvdWNoTm9kZShub2RlUGF0aCk7XG5cdFx0dGhpcy5zY29wZVN0YWNrLnBvcCgpO1xuXHR9XG5cblx0Y2xlYXJOb2RlU3RhY2soKSB7XG5cdFx0dGhpcy5wcmV2aW91c05vZGVTdGFjayA9IFtdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRmcmVlemVOb2RlU3RhY2soKSB7XG5cdFx0Ly8gY29uc29sZS5sb2coYEZyZWV6aW5nIG5vZGUgc3RhY2suIENvbnRlbnQ6ICR7SlNPTi5zdHJpbmdpZnkodGhpcy5ub2RlU3RhY2spfWApO1xuXHRcdHRoaXMucHJldmlvdXNOb2RlU3RhY2sgPSBbLi4udGhpcy5ub2RlU3RhY2tdO1xuXHRcdHRoaXMubm9kZVN0YWNrID0gW107XG5cdH1cblxuXHRzZXRQYXJlbnQoY2hpbGRQYXRoLCBwYXJlbnRQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGguc2V0UGFyZW50KGNoaWxkUGF0aCwgcGFyZW50UGF0aCk7XG5cdH1cblxuXHRpc0lucHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiSW5wdXRcIjtcblx0fVxuXG5cdGlzT3V0cHV0KG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiT3V0cHV0XCI7XG5cdH1cblxuXHRpc1Njb3BlKG5vZGVQYXRoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGgubm9kZShub2RlUGF0aCkuY2xhc3MgPT09IFwiU2NvcGVcIjtcdFxuXHR9XG5cblx0Z2V0U2NvcGVPdXRwdXQoc2NvcGVQYXRoKSB7XG5cdFx0bGV0IHNjb3BlID0gdGhpcy5ncmFwaC5ub2RlKHNjb3BlUGF0aCk7XG5cdFx0bGV0IG91dHMgPSB0aGlzLmdyYXBoLmNoaWxkcmVuKHNjb3BlUGF0aCkuZmlsdGVyKG5vZGUgPT4geyByZXR1cm4gdGhpcy5pc091dHB1dChub2RlKSB9KTtcblx0XHRpZiAob3V0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHJldHVybiBvdXRzWzBdO1x0XG5cdFx0fSBlbHNlICBpZiAob3V0cy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUubGFiZWx9XCIgZG9lc24ndCBoYXZlIGFueSBPdXRwdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiBzY29wZS5fc291cmNlLnN0YXJ0SWR4XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm1vbmllbC5sb2dnZXIuYWRkSXNzdWUoe1xuXHRcdFx0XHRtZXNzYWdlOiBgU2NvcGUgXCIke3Njb3BlLmxhYmVsfVwiIGhhcyBtb3JlIHRoYW4gb25lIE91dHB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHhcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG5cblx0Z2V0U2NvcGVJbnB1dChzY29wZVBhdGgpIHtcblx0XHRsZXQgc2NvcGUgPSB0aGlzLmdyYXBoLm5vZGUoc2NvcGVQYXRoKTtcblx0XHRsZXQgaW5zID0gdGhpcy5ncmFwaC5jaGlsZHJlbihzY29wZVBhdGgpLmZpbHRlcihub2RlID0+IHsgcmV0dXJuIHRoaXMuaXNJbnB1dChub2RlKSB9KTtcblx0XHRpZiAoaW5zLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIGluc1swXTtcdFxuXHRcdH0gZWxzZSAgaWYgKGlucy5sZW5ndGggPT09IDApIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUubGFiZWx9XCIgZG9lc24ndCBoYXZlIGFueSBJbnB1dCBub2RlLmAsXG5cdFx0XHRcdHR5cGU6IFwiZXJyb3JcIixcblx0XHRcdFx0cG9zaXRpb246IHNjb3BlLl9zb3VyY2Uuc3RhcnRJZHhcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubW9uaWVsLmxvZ2dlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBTY29wZSBcIiR7c2NvcGUubGFiZWx9XCIgaGFzIG1vcmUgdGhhbiBvbmUgSW5wdXQgbm9kZS5gLFxuXHRcdFx0XHR0eXBlOiBcImVycm9yXCIsXG5cdFx0XHRcdHBvc2l0aW9uOiBzY29wZS5fc291cmNlLnN0YXJ0SWR4XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cdFxuXHR9XG5cblx0c2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBDcmVhdGluZyBlZGdlIGZyb20gXCIke2Zyb21QYXRofVwiIHRvIFwiJHt0b1BhdGh9XCIuYClcblxuXHRcdGlmICh0aGlzLmlzU2NvcGUoZnJvbVBhdGgpKSB7XG5cdFx0XHRmcm9tUGF0aCA9IHRoaXMuZ2V0U2NvcGVPdXRwdXQoZnJvbVBhdGgpO1xuXHRcdH1cblxuXHRcdGlmICh0aGlzLmlzU2NvcGUodG9QYXRoKSkge1xuXHRcdFx0dG9QYXRoID0gdGhpcy5nZXRTY29wZUlucHV0KHRvUGF0aCk7XG5cdFx0fVxuXHRcdFxuXHRcdGlmIChmcm9tUGF0aCAmJiB0b1BhdGgpIHtcblx0XHRcdHRoaXMuZ3JhcGguc2V0RWRnZShmcm9tUGF0aCwgdG9QYXRoLCB7Li4udGhpcy5kZWZhdWx0RWRnZX0pO1x0XG5cdFx0fVxuXHR9XG5cblx0aGFzTm9kZShub2RlUGF0aCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmhhc05vZGUobm9kZVBhdGgpO1xuXHR9XG5cblx0Z2V0R3JhcGgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ3JhcGg7XG5cdH1cbn0iLCJjbGFzcyBFZGl0b3IgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnR7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLm9uQ2hhbmdlID0gdGhpcy5vbkNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcmtlciA9IG51bGw7XG4gICAgfVxuXG4gICAgb25DaGFuZ2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB2YXIgbmV3VmFsdWUgPSB0aGlzLmVkaXRvci5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbml0KGVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jb250YWluZXIgPSBlbGVtZW50O1xuICAgIH1cblxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHZhbHVlLCAtMSk7XG4gICAgfVxuXG4gICAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgICAgIHRoaXMuZWRpdG9yID0gYWNlLmVkaXQodGhpcy5jb250YWluZXIpO1xuICAgICAgICB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuc2V0TW9kZShcImFjZS9tb2RlL1wiICsgdGhpcy5wcm9wcy5tb2RlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0VGhlbWUoXCJhY2UvdGhlbWUvXCIgKyB0aGlzLnByb3BzLnRoZW1lKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0U2hvd1ByaW50TWFyZ2luKGZhbHNlKTtcbiAgICAgICAgdGhpcy5lZGl0b3Iuc2V0T3B0aW9ucyh7XG4gICAgICAgICAgICBlbmFibGVCYXNpY0F1dG9jb21wbGV0aW9uOiB0cnVlLFxuICAgICAgICAgICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgICAgICAgICBlbmFibGVMaXZlQXV0b2NvbXBsZXRpb246IGZhbHNlLFxuICAgICAgICAgICAgd3JhcDogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9TY3JvbGxFZGl0b3JJbnRvVmlldzogdHJ1ZSxcbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiRmlyYSAgQ29kZVwiLFxuICAgICAgICAgICAgc2hvd0xpbmVOdW1iZXJzOiB0cnVlLFxuICAgICAgICAgICAgc2hvd0d1dHRlcjogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5lZGl0b3IuJGJsb2NrU2Nyb2xsaW5nID0gSW5maW5pdHk7XG5cbiAgICAgICAgaWYgKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlKXtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKHRoaXMucHJvcHMuZGVmYXVsdFZhbHVlLCAtMSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmVkaXRvci5vbihcImNoYW5nZVwiLCB0aGlzLm9uQ2hhbmdlKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5leHRQcm9wcykge1xuICAgICAgICBpZiAobmV4dFByb3BzLmlzc3Vlcykge1xuICAgICAgICAgICAgdmFyIGFubm90YXRpb25zID0gbmV4dFByb3BzLmlzc3Vlcy5tYXAoaXNzdWUgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZWRpdG9yLnNlc3Npb24uZG9jLmluZGV4VG9Qb3NpdGlvbihpc3N1ZS5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgcm93OiBwb3NpdGlvbi5yb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbHVtbjogcG9zaXRpb24uY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBpc3N1ZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBpc3N1ZS50eXBlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgdGhpcy5lZGl0b3Iuc2Vzc2lvbi5zZXRBbm5vdGF0aW9ucyhhbm5vdGF0aW9ucyk7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5leGVjQ29tbWFuZChcImdvVG9OZXh0RXJyb3JcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmVkaXRvci5zZXNzaW9uLmNsZWFyQW5ub3RhdGlvbnMoKTtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLmV4ZWNDb21tYW5kKFwiZ29Ub05leHRFcnJvclwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXh0UHJvcHMudmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuZWRpdG9yLnNldFZhbHVlKG5leHRQcm9wcy52YWx1ZSwgLTEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5leHRQcm9wcy5oaWdobGlnaHRSYW5nZSkge1xuICAgICAgICAgICAgdGhpcy5lZGl0b3IuZ2V0U2Vzc2lvbigpLnJlbW92ZU1hcmtlcih0aGlzLm1hcmtlcik7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiaGlnaGxpZ2h0UmFuZ2VcIiwgbmV4dFByb3BzLmhpZ2hsaWdodFJhbmdlKTtcbiAgICAgICAgICAgIHZhciBSYW5nZSA9IHJlcXVpcmUoJ2FjZS9yYW5nZScpLlJhbmdlO1xuICAgICAgICAgICAgdmFyIHN0YXJ0ID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKG5leHRQcm9wcy5oaWdobGlnaHRSYW5nZS5zdGFydElkeCk7XG4gICAgICAgICAgICB2YXIgZW5kID0gdGhpcy5lZGl0b3Iuc2Vzc2lvbi5kb2MuaW5kZXhUb1Bvc2l0aW9uKG5leHRQcm9wcy5oaWdobGlnaHRSYW5nZS5lbmRJZHgpO1xuICAgICAgICAgICAgdmFyIHJhbmdlID0gbmV3IFJhbmdlKHN0YXJ0LnJvdywgc3RhcnQuY29sdW1uLCBlbmQucm93LCBlbmQuY29sdW1uKTtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2cocmFuZ2UpO1xuICAgICAgICAgICAgdGhpcy5tYXJrZXIgPSB0aGlzLmVkaXRvci5nZXRTZXNzaW9uKCkuYWRkTWFya2VyKHJhbmdlLCBcImhpZ2hsaWdodFwiLCBcInRleHRcIik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHJldHVybiA8ZGl2IHJlZj17IChlbGVtZW50KSA9PiB0aGlzLmluaXQoZWxlbWVudCkgfT48L2Rpdj47XG4gICAgfVxufSIsImNsYXNzIElERSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudHtcblxuXHRjb25zdHJ1Y3Rvcihwcm9wcykge1xuXHRcdHN1cGVyKHByb3BzKTtcblxuXHRcdHRoaXMubW9uaWVsID0gbmV3IE1vbmllbCgpO1xuXG5cdFx0dGhpcy5zdGF0ZSA9IHtcblx0XHRcdFwiZ3JhbW1hclwiOiBncmFtbWFyLFxuXHRcdFx0XCJzZW1hbnRpY3NcIjogc2VtYW50aWNzLFxuXHRcdFx0XCJuZXR3b3JrRGVmaW5pdGlvblwiOiBcIlwiLFxuXHRcdFx0XCJhc3RcIjogbnVsbCxcblx0XHRcdFwiaXNzdWVzXCI6IG51bGwsXG5cdFx0XHRcImhpZ2hsaWdodFJhbmdlXCI6IHtcblx0XHRcdFx0c3RhcnRJZHg6IDAsXG5cdFx0XHRcdGVuZElkeDogMFxuXHRcdFx0fVxuXHRcdH07XG5cdFx0dGhpcy51cGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMudXBkYXRlTmV0d29ya0RlZmluaXRpb24uYmluZCh0aGlzKTtcblx0XHR0aGlzLmRlbGF5ZWRVcGRhdGVOZXR3b3JrRGVmaW5pdGlvbiA9IHRoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uLmJpbmQodGhpcyk7XG5cdFx0dGhpcy5vbkhpZ2hsaWdodCA9IHRoaXMub25IaWdobGlnaHQuYmluZCh0aGlzKTtcblx0XHR0aGlzLmxvY2sgPSBudWxsO1xuXHR9XG5cblx0Y29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dGhpcy5sb2FkRXhhbXBsZShcIlZHRzE2XCIpO1xuXHR9XG5cblx0ZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKSB7XG5cdFx0aWYgKHRoaXMubG9jaykgeyBjbGVhclRpbWVvdXQodGhpcy5sb2NrKTsgfVxuXHRcdHRoaXMubG9jayA9IHNldFRpbWVvdXQoKCkgPT4geyB0aGlzLnVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKTsgfSwgMjUwKTtcblx0fVxuXG5cdHVwZGF0ZU5ldHdvcmtEZWZpbml0aW9uKHZhbHVlKXtcblx0XHRjb25zb2xlLnRpbWUoXCJkYXRhZmxvd1wiKTtcblx0XHR2YXIgcmVzdWx0ID0gdGhpcy5jb21waWxlVG9BU1QodGhpcy5zdGF0ZS5ncmFtbWFyLCB0aGlzLnN0YXRlLnNlbWFudGljcywgdmFsdWUpO1xuXHRcdGlmIChyZXN1bHQuYXN0KSB7XG5cdFx0XHR0aGlzLm1vbmllbC53YWxrQXN0KHJlc3VsdC5hc3QpO1xuXHRcdFx0dmFyIGdyYXBoID0gdGhpcy5tb25pZWwuZ2V0Q29tcHV0YXRpb25hbEdyYXBoKCk7XG5cdFx0XHR0aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0bmV0d29ya0RlZmluaXRpb246IHZhbHVlLFxuXHRcdFx0XHRhc3Q6IHJlc3VsdC5hc3QsXG5cdFx0XHRcdGdyYXBoOiBncmFwaCxcblx0XHRcdFx0aXNzdWVzOiB0aGlzLm1vbmllbC5nZXRJc3N1ZXMoKVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRuZXR3b3JrRGVmaW5pdGlvbjogdmFsdWUsXG5cdFx0XHRcdGFzdDogbnVsbCxcblx0XHRcdFx0Z3JhcGg6IG51bGwsXG5cdFx0XHRcdGlzc3VlczogW3tcblx0XHRcdFx0XHRwb3NpdGlvbjogcmVzdWx0LnBvc2l0aW9uLFxuXHRcdFx0XHRcdG1lc3NhZ2U6IFwiRXhwZWN0ZWQgXCIgKyByZXN1bHQuZXhwZWN0ZWQgKyBcIi5cIixcblx0XHRcdFx0XHR0eXBlOiBcImVycm9yXCJcblx0XHRcdFx0fV1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdG9uSGlnaGxpZ2h0KHJhbmdlKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRoaWdobGlnaHRSYW5nZTogcmFuZ2Vcblx0XHR9KVxuXHR9XG5cblx0bG9hZEV4YW1wbGUoaWQpIHtcblx0XHR2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbih2YWx1ZSkge1xuXHRcdFx0dGhpcy5lZGl0b3Iuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdG5ldHdvcmtEZWZpbml0aW9uOiB2YWx1ZVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdCQuYWpheCh7XG5cdFx0XHR1cmw6IGAvZXhhbXBsZXMvJHtpZH0ubW9uYCxcblx0XHRcdGRhdGE6IG51bGwsXG5cdFx0XHRzdWNjZXNzOiBjYWxsYmFjay5iaW5kKHRoaXMpLFxuXHRcdFx0ZGF0YVR5cGU6IFwidGV4dFwiXG5cdFx0fSk7XG5cdH1cblxuXHQvLyBpbnRvIE1vbmllbD8gb3IgUGFyc2VyXG5cdGNvbXBpbGVUb0FTVChncmFtbWFyLCBzZW1hbnRpY3MsIHNvdXJjZSkge1xuXHRcdGNvbnNvbGUubG9nKFwiY29tcGlsZVRvQVNUXCIpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGdyYW1tYXIubWF0Y2goc291cmNlKTtcblxuXHQgICAgaWYgKHJlc3VsdC5zdWNjZWVkZWQoKSkge1xuXHQgICAgICAgIHZhciBhc3QgPSBzZW1hbnRpY3MocmVzdWx0KS5ldmFsKCk7XG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgXCJhc3RcIjogYXN0XG5cdCAgICAgICAgfVxuXHQgICAgfSBlbHNlIHtcblx0ICAgICAgICB2YXIgZXhwZWN0ZWQgPSByZXN1bHQuZ2V0RXhwZWN0ZWRUZXh0KCk7XG5cdCAgICAgICAgdmFyIHBvc2l0aW9uID0gcmVzdWx0LmdldFJpZ2h0bW9zdEZhaWx1cmVQb3NpdGlvbigpO1xuXHQgICAgICAgIHJldHVybiB7XG5cdCAgICAgICAgICAgIFwiZXhwZWN0ZWRcIjogZXhwZWN0ZWQsXG5cdCAgICAgICAgICAgIFwicG9zaXRpb25cIjogcG9zaXRpb25cblx0ICAgICAgICB9XG5cdCAgICB9XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc29sZS5sb2coXCJJREUucmVuZGVyXCIpO1xuICAgIFx0cmV0dXJuIDxkaXYgaWQ9XCJjb250YWluZXJcIj5cbiAgICBcdFx0PFBhbmVsIHRpdGxlPVwiRGVmaW5pdGlvblwiPlxuICAgIFx0XHRcdDxFZGl0b3JcbiAgICBcdFx0XHRcdHJlZj17KHJlZikgPT4gdGhpcy5lZGl0b3IgPSByZWZ9XG4gICAgXHRcdFx0XHRtb2RlPVwibW9uaWVsXCJcbiAgICBcdFx0XHRcdHRoZW1lPVwibW9ub2thaVwiXG4gICAgXHRcdFx0XHRpc3N1ZXM9e3RoaXMuc3RhdGUuaXNzdWVzfVxuICAgIFx0XHRcdFx0b25DaGFuZ2U9e3RoaXMuZGVsYXllZFVwZGF0ZU5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0ZGVmYXVsdFZhbHVlPXt0aGlzLnN0YXRlLm5ldHdvcmtEZWZpbml0aW9ufVxuICAgIFx0XHRcdFx0aGlnaGxpZ2h0UmFuZ2U9e3RoaXMuc3RhdGUuaGlnaGxpZ2h0UmFuZ2V9XG4gICAgXHRcdFx0Lz5cbiAgICBcdFx0PC9QYW5lbD5cbiAgICBcdFx0XG4gICAgXHRcdDxQYW5lbCB0aXRsZT1cIlZpc3VhbGl6YXRpb25cIj5cbiAgICBcdFx0XHQ8VmlzdWFsR3JhcGggZ3JhcGg9e3RoaXMuc3RhdGUuZ3JhcGh9IG9uSGlnaGxpZ2h0PXt0aGlzLm9uSGlnaGxpZ2h0fSAvPlxuICAgIFx0XHQ8L1BhbmVsPlxuXG4gICAgXHRcdHsvKlxuICAgIFx0XHQ8UGFuZWwgdGl0bGU9XCJBU1RcIj5cbiAgICBcdFx0XHQ8RWRpdG9yXG4gICAgXHRcdFx0XHRtb2RlPVwianNvblwiXG4gICAgXHRcdFx0XHR0aGVtZT1cIm1vbm9rYWlcIlxuICAgIFx0XHRcdFx0dmFsdWU9e0pTT04uc3RyaW5naWZ5KHRoaXMuc3RhdGUuYXN0LCBudWxsLCAyKX1cbiAgICBcdFx0XHQvPlxuICAgIFx0XHQ8L1BhbmVsPlxuICAgIFx0Ki99XG4gICAgXHRcdFxuICAgIFx0PC9kaXY+O1xuICBcdH1cbn0iLCJjbGFzcyBMb2dnZXJ7XG5cdGlzc3VlcyA9IFtdXG5cblx0Y2xlYXIoKSB7XG5cdFx0dGhpcy5pc3N1ZXMgPSBbXTtcblx0fVxuXHRcblx0Z2V0SXNzdWVzKCkge1xuXHRcdHJldHVybiB0aGlzLmlzc3Vlcztcblx0fVxuXG5cdGFkZElzc3VlKGlzc3VlKSB7XG5cdFx0dmFyIGYgPSBudWxsO1xuXHRcdHN3aXRjaChpc3N1ZS50eXBlKSB7XG5cdFx0XHRjYXNlIFwiZXJyb3JcIjogZiA9IGNvbnNvbGUuZXJyb3I7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIndhcm5pbmdcIjogZiA9IGNvbnNvbGUud2FybjsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiaW5mb1wiOiBmID0gY29uc29sZS5pbmZvOyBicmVhaztcblx0XHRcdGRlZmF1bHQ6IGYgPSBjb25zb2xlLmxvZzsgYnJlYWs7XG5cdFx0fVxuXHRcdGYoaXNzdWUubWVzc2FnZSk7XG5cdFx0dGhpcy5pc3N1ZXMucHVzaChpc3N1ZSk7XG5cdH1cbn0iLCJjbGFzcyBNb25pZWx7XG5cdGxvZ2dlciA9IG5ldyBMb2dnZXIoKTtcblx0Z3JhcGggPSBuZXcgQ29tcHV0YXRpb25hbEdyYXBoKHRoaXMpO1xuXG5cdGRlZmluaXRpb25zID0gW107XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0aWFsaXplKCk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuZ3JhcGguaW5pdGlhbGl6ZSgpO1xuXHRcdHRoaXMubG9nZ2VyLmNsZWFyKCk7XG5cblx0XHR0aGlzLmRlZmluaXRpb25zID0gW107XG5cdFx0dGhpcy5hZGREZWZhdWx0RGVmaW5pdGlvbnMoKTtcblx0fVxuXG5cdGFkZERlZmF1bHREZWZpbml0aW9ucygpIHtcblx0XHQvLyBjb25zb2xlLmluZm8oYEFkZGluZyBkZWZhdWx0IGRlZmluaXRpb25zLmApO1xuXHRcdGNvbnN0IGRlZmF1bHREZWZpbml0aW9ucyA9IFtcIkFkZFwiLCBcIklucHV0XCIsIFwiT3V0cHV0XCIsIFwiUGxhY2Vob2xkZXJcIiwgXCJWYXJpYWJsZVwiLCBcIkNvbnN0YW50XCIsIFwiTXVsdGlwbHlcIiwgXCJDb252b2x1dGlvblwiLCBcIkRlbnNlXCIsIFwiTWF4UG9vbGluZ1wiLCBcIkJhdGNoTm9ybWFsaXphdGlvblwiLCBcIklkZW50aXR5XCIsIFwiUmVjdGlmaWVkTGluZWFyVW5pdFwiLCBcIlNpZ21vaWRcIiwgXCJFeHBvbmVudGlhbExpbmVhclVuaXRcIiwgXCJUYW5oXCIsIFwiQWJzb2x1dGVcIiwgXCJTdW1tYXRpb25cIiwgXCJEcm9wb3V0XCIsIFwiTWF0cml4TXVsdGlwbHlcIiwgXCJCaWFzQWRkXCIsIFwiUmVzaGFwZVwiLCBcIkNvbmNhdFwiLCBcIkZsYXR0ZW5cIiwgXCJUZW5zb3JcIiwgXCJTb2Z0bWF4XCIsIFwiQ3Jvc3NFbnRyb3B5XCJdO1xuXHRcdGRlZmF1bHREZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy5hZGREZWZpbml0aW9uKGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGFkZERlZmluaXRpb24oZGVmaW5pdGlvbikge1xuXHRcdHRoaXMuZGVmaW5pdGlvbnMucHVzaChkZWZpbml0aW9uKTtcblx0fVxuXG5cdGhhbmRsZVNjb3BlRGVmaW5pdGlvbihzY29wZSkge1xuXHRcdHRoaXMuZ3JhcGguZW50ZXJTY29wZShzY29wZSk7XG5cdFx0dGhpcy53YWxrQXN0KHNjb3BlLmJvZHkpO1xuXHRcdHRoaXMuZ3JhcGguZXhpdFNjb3BlKCk7XG5cdH1cblxuXHRoYW5kbGVTY29wZURlZmluaXRpb25Cb2R5KHNjb3BlQm9keSkge1xuXHRcdHNjb3BlQm9keS5kZWZpbml0aW9ucy5mb3JFYWNoKGRlZmluaXRpb24gPT4gdGhpcy53YWxrQXN0KGRlZmluaXRpb24pKTtcblx0fVxuXG5cdGhhbmRsZUJsb2NrRGVmaW5pdGlvbihibG9ja0RlZmluaXRpb24pwqB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBBZGRpbmcgXCIke2Jsb2NrRGVmaW5pdGlvbi5uYW1lfVwiIHRvIGF2YWlsYWJsZSBkZWZpbml0aW9ucy5gKTtcblx0XHR0aGlzLmFkZERlZmluaXRpb24oYmxvY2tEZWZpbml0aW9uLm5hbWUpO1xuXHR9XG5cblx0aGFuZGxlVW5yZWNvZ25pemVkTm9kZShub2RlKSB7XG5cdFx0Y29uc29sZS53YXJuKFwiV2hhdCB0byBkbyB3aXRoIHRoaXMgQVNUIG5vZGU/XCIsIG5vZGUpO1xuXHR9XG5cblx0aGFuZGxlTmV0d29ya0RlZmluaXRpb24obmV0d29yaykge1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSgpO1xuXHRcdG5ldHdvcmsuZGVmaW5pdGlvbnMuZm9yRWFjaChkZWZpbml0aW9uID0+IHRoaXMud2Fsa0FzdChkZWZpbml0aW9uKSk7XG5cdH1cblxuXHRoYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihjb25uZWN0aW9uKSB7XG5cdFx0dGhpcy5ncmFwaC5jbGVhck5vZGVTdGFjaygpO1xuXHRcdGNvbm5lY3Rpb24ubGlzdC5mb3JFYWNoKGl0ZW0gPT4ge1xuXHRcdFx0dGhpcy5ncmFwaC5mcmVlemVOb2RlU3RhY2soKTtcblx0XHRcdHRoaXMud2Fsa0FzdChpdGVtKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIHRoaXMgaXMgZG9pbmcgdG9vIG11Y2gg4oCTIGJyZWFrIGludG8gXCJub3QgcmVjb2duaXplZFwiLCBcInN1Y2Nlc3NcIiBhbmQgXCJhbWJpZ3VvdXNcIlxuXHRoYW5kbGVCbG9ja0luc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0dmFyIGlkID0gdW5kZWZpbmVkO1xuXHRcdHZhciBsYWJlbCA9IFwidW5kZWNsYXJlZFwiO1xuXHRcdHZhciB0eXBlID0gXCJVbmtub3duXCI7XG5cdFx0dmFyIHNoYXBlID0gXCJyZWN0XCI7XG5cdFx0dmFyIGNvbG9yID0gXCJ5ZWxsb3dcIjtcblxuXHRcdGxldCBwb3NzaWJsZVR5cGVzID0gdGhpcy5nZXRUeXBlT2ZJbnN0YW5jZShpbnN0YW5jZSk7XG5cblx0XHRpZiAocG9zc2libGVUeXBlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHR5cGUgPSBcInVuZGVmaW5lZFwiO1xuICAgICAgICAgICAgbGFiZWwgPSBpbnN0YW5jZS5uYW1lO1xuICAgICAgICAgICAgc2hhcGUgPSBcInJlY3RcIjtcbiAgICAgICAgICAgIHRoaXMuYWRkSXNzdWUoe1xuICAgICAgICAgICAgXHRtZXNzYWdlOiBgVW5yZWNvZ25pemVkIHR5cGUgb2YgYmxvY2sgaW5zdGFuY2UgXCIke2luc3RhbmNlLm5hbWV9XCIuIE5vIHBvc3NpYmxlIG1hdGNoZXMgZm91bmQuYCxcbiAgICAgICAgICAgIFx0cG9zaXRpb246IGluc3RhbmNlLl9zb3VyY2Uuc3RhcnRJZHgsXG4gICAgICAgICAgICBcdHR5cGU6IFwiZXJyb3JcIlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAocG9zc2libGVUeXBlcy5sZW5ndGggPT09IDEpIHtcblx0XHRcdHR5cGUgPSBwb3NzaWJsZVR5cGVzWzBdO1xuXHRcdFx0bGFiZWwgPSB0eXBlO1xuXHRcdFx0Y29sb3IgPSBjb2xvckhhc2guaGV4KGxhYmVsKTsgLy8gdGhpcyBzaG91bGQgYmUgaGFuZGxlZCBpbiBWaXN1YWxHcmFwaFxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0eXBlID0gXCJhbWJpZ3VvdXNcIlxuICAgICAgICAgICAgbGFiZWwgPSBpbnN0YW5jZS5uYW1lXG4gICAgICAgICAgICBzaGFwZSA9IFwiZGlhbW9uZFwiO1xuXHRcdFx0dGhpcy5hZGRJc3N1ZSh7XG5cdFx0XHRcdG1lc3NhZ2U6IGBVbnJlY29nbml6ZWQgdHlwZSBvZiBibG9jayBpbnN0YW5jZS4gUG9zc2libGUgbWF0Y2hlczogJHtwb3NzaWJsZVR5cGVzLmpvaW4oXCIsIFwiKX0uYCxcblx0XHRcdFx0cG9zaXRpb246IGluc3RhbmNlLl9zb3VyY2Uuc3RhcnRJZHgsXG5cdFx0XHRcdHR5cGU6IFwid2FybmluZ1wiXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIWluc3RhbmNlLmFsaWFzKSB7XG5cdFx0XHRpZCA9IHRoaXMuZ3JhcGguZ2VuZXJhdGVJbnN0YW5jZUlkKHR5cGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZCA9IGluc3RhbmNlLmFsaWFzLnZhbHVlO1xuXHRcdH1cblxuXHRcdHRoaXMuZ3JhcGguY3JlYXRlTm9kZShpZCwge1xuXHRcdFx0bGFiZWw6IGxhYmVsLFxuICAgICAgICAgICAgY2xhc3M6IHR5cGUsXG4gICAgICAgICAgICBzaGFwZTogc2hhcGUsXG4gICAgICAgICAgICBzdHlsZTogXCJmaWxsOiBcIiArIGNvbG9yLFxuICAgICAgICAgICAgX3NvdXJjZTogaW5zdGFuY2VcbiAgICAgICAgfSk7XG5cdH1cblxuXHRoYW5kbGVCbG9ja0xpc3QobGlzdCkge1xuXHRcdGxpc3QubGlzdC5mb3JFYWNoKGl0ZW0gPT4gdGhpcy53YWxrQXN0KGl0ZW0pKTtcblx0fVxuXG5cdGhhbmRsZUlkZW50aWZpZXIoaWRlbnRpZmllcikge1xuXHRcdHRoaXMuZ3JhcGgucmVmZXJlbmNlTm9kZShpZGVudGlmaWVyLnZhbHVlKTtcblx0fVxuXG5cdGdldFR5cGVPZkluc3RhbmNlKGluc3RhbmNlKSB7XG5cdFx0Ly8gY29uc29sZS5pbmZvKGBUcnlpbmcgdG8gbWF0Y2ggXCIke2luc3RhbmNlLm5hbWV9XCIgYWdhaW5zdCBibG9jayBkZWZpbml0aW9ucy5gKTtcblx0XHRyZXR1cm4gTW9uaWVsLm5hbWVSZXNvbHV0aW9uKGluc3RhbmNlLm5hbWUsIHRoaXMuZGVmaW5pdGlvbnMpO1xuXHR9XG5cblx0Z2V0Q29tcHV0YXRpb25hbEdyYXBoKCkge1xuXHRcdHJldHVybiB0aGlzLmdyYXBoLmdldEdyYXBoKCk7XG5cdH1cblxuXHRnZXRJc3N1ZXMoKSB7XG5cdFx0cmV0dXJuIHRoaXMubG9nZ2VyLmdldElzc3VlcygpO1xuXHR9XG5cblx0YWRkSXNzdWUoaXNzdWUpIHtcblx0XHR0aGlzLmxvZ2dlci5hZGRJc3N1ZShpc3N1ZSk7XG5cdH1cblxuXHRzdGF0aWMgbmFtZVJlc29sdXRpb24ocGFydGlhbCwgbGlzdCkge1xuXHQgICAgbGV0IHBhcnRpYWxBcnJheSA9IHBhcnRpYWwuc3BsaXQoLyg/PVtBLVpdKS8pO1xuXHQgICAgbGV0IGxpc3RBcnJheSA9IGxpc3QubWFwKGRlZmluaXRpb24gPT4gZGVmaW5pdGlvbi5zcGxpdCgvKD89W0EtWl0pLykpO1xuXHQgICAgdmFyIHJlc3VsdCA9IGxpc3RBcnJheS5maWx0ZXIocG9zc2libGVNYXRjaCA9PiBNb25pZWwuaXNNdWx0aVByZWZpeChwYXJ0aWFsQXJyYXksIHBvc3NpYmxlTWF0Y2gpKTtcblx0ICAgIHJlc3VsdCA9IHJlc3VsdC5tYXAoaXRlbSA9PiBpdGVtLmpvaW4oXCJcIikpO1xuXHQgICAgcmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdHN0YXRpYyBpc011bHRpUHJlZml4KG5hbWUsIHRhcmdldCkge1xuXHQgICAgaWYgKG5hbWUubGVuZ3RoICE9PSB0YXJnZXQubGVuZ3RoKSB7IHJldHVybiBmYWxzZTsgfVxuXHQgICAgdmFyIGkgPSAwO1xuXHQgICAgd2hpbGUoaSA8IG5hbWUubGVuZ3RoICYmIHRhcmdldFtpXS5zdGFydHNXaXRoKG5hbWVbaV0pKSB7IGkgKz0gMTsgfVxuXHQgICAgcmV0dXJuIChpID09PSBuYW1lLmxlbmd0aCk7IC8vIGdvdCB0byB0aGUgZW5kP1xuXHR9XG5cblx0d2Fsa0FzdChub2RlKSB7XG5cdFx0aWYgKCFub2RlKSB7IGNvbnNvbGUuZXJyb3IoXCJObyBub2RlPyFcIik7IHJldHVybjsgfVxuXG5cdFx0c3dpdGNoIChub2RlLnR5cGUpIHtcblx0XHRcdGNhc2UgXCJOZXR3b3JrXCI6IHRoaXMuaGFuZGxlTmV0d29ya0RlZmluaXRpb24obm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrRGVmaW5pdGlvblwiOiB0aGlzLmhhbmRsZUJsb2NrRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiU2NvcGVEZWZpbml0aW9uXCI6IHRoaXMuaGFuZGxlU2NvcGVEZWZpbml0aW9uKG5vZGUpOyBicmVhaztcblx0XHRcdGNhc2UgXCJTY29wZURlZmluaXRpb25Cb2R5XCI6IHRoaXMuaGFuZGxlU2NvcGVEZWZpbml0aW9uQm9keShub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQ29ubmVjdGlvbkRlZmluaXRpb25cIjogdGhpcy5oYW5kbGVDb25uZWN0aW9uRGVmaW5pdGlvbihub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiQmxvY2tJbnN0YW5jZVwiOiB0aGlzLmhhbmRsZUJsb2NrSW5zdGFuY2Uobm9kZSk7IGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJsb2NrTGlzdFwiOiB0aGlzLmhhbmRsZUJsb2NrTGlzdChub2RlKTsgYnJlYWs7XG5cdFx0XHRjYXNlIFwiSWRlbnRpZmllclwiOiB0aGlzLmhhbmRsZUlkZW50aWZpZXIobm9kZSk7IGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDogdGhpcy5oYW5kbGVVbnJlY29nbml6ZWROb2RlKG5vZGUpO1xuXHRcdH1cblx0fVxufSIsImNsYXNzIFBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIDxkaXYgY2xhc3NOYW1lPVwicGFuZWxcIj5cbiAgICBcdDxkaXYgY2xhc3NOYW1lPVwiaGVhZGVyXCI+XG4gICAgXHRcdHt0aGlzLnByb3BzLnRpdGxlfVxuICAgIFx0PC9kaXY+XG4gICAgXHR7dGhpcy5wcm9wcy5jaGlsZHJlbn1cbiAgICA8L2Rpdj47XG4gIH1cbn0iLCJjbGFzcyBTY29wZVN0YWNre1xuXHRzY29wZVN0YWNrID0gW11cblxuXHRjb25zdHJ1Y3RvcihzY29wZSA9IFtdKSB7XG5cdFx0aWYgKEFycmF5LmlzQXJyYXkoc2NvcGUpKSB7XG5cdFx0XHR0aGlzLnNjb3BlU3RhY2sgPSBzY29wZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc29sZS5lcnJvcihcIkludmFsaWQgaW5pdGlhbGl6YXRpb24gb2Ygc2NvcGUgc3RhY2suXCIsIHNjb3BlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHRoaXMuY2xlYXIoKTtcblx0fVxuXG5cdHB1c2goc2NvcGUpIHtcblx0XHR0aGlzLnNjb3BlU3RhY2sucHVzaChzY29wZSk7XG5cdH1cblxuXHRwb3AoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2NvcGVTdGFjay5wb3AoKTtcblx0fVxuXG5cdGNsZWFyKCkge1xuXHRcdHRoaXMuc2NvcGVTdGFjayA9IFtdO1xuXHR9XG5cblx0Y3VycmVudFNjb3BlSWRlbnRpZmllcigpIHtcblx0XHRyZXR1cm4gdGhpcy5zY29wZVN0YWNrLmpvaW4oXCIvXCIpO1xuXHR9XG5cblx0cHJldmlvdXNTY29wZUlkZW50aWZpZXIoKSB7XG5cdFx0bGV0IGNvcHkgPSBBcnJheS5mcm9tKHRoaXMuc2NvcGVTdGFjayk7XG5cdFx0Y29weS5wb3AoKTtcblx0XHRyZXR1cm4gY29weS5qb2luKFwiL1wiKTtcblx0fVxufSIsImNsYXNzIFZpc3VhbEdyYXBoIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50e1xuXG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJjb25zdHJ1Y3RvclwiKTtcbiAgICAgICAgc3VwZXIocHJvcHMpO1xuICAgICAgICB0aGlzLmRhZ3JlUmVuZGVyZXIgPSBuZXcgZGFncmVEMy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAgICAgLypcbiAgICAgICAgdGhpcy56b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpLm9uKFwiem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coZDMuZXZlbnQudHJhbnNsYXRlLCBkMy5ldmVudC5zY2FsZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkMy5zZWxlY3QodGhpcy5zdmdHcm91cCkpO1xuICAgICAgICAgICAgICAgIGQzLnNlbGVjdCh0aGlzLnN2Z0dyb3VwKS5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgZDMuZXZlbnQudHJhbnNsYXRlICsgXCIpXCIgKyBcInNjYWxlKFwiICsgZDMuZXZlbnQuc2NhbGUgKyBcIilcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICBkMy5zZWxlY3QodGhpcy5zdmcpLmNhbGwodGhpcy56b29tKTtcbiAgICAgICAgKi9cbiAgICB9XG5cbiAgICBsYXlvdXRHcmFwaChncmFwaCkge1xuICAgICAgICB2YXIgc3ZnID0gZDMuc2VsZWN0KHRoaXMuc3ZnKVxuICAgICAgICB2YXIgZ3JvdXAgPSBkMy5zZWxlY3QodGhpcy5zdmdHcm91cClcblxuICAgICAgICBncmFwaC5ncmFwaCgpLnRyYW5zaXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb24udHJhbnNpdGlvbigpLmR1cmF0aW9uKDI1MCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZ3JhcGguc2V0R3JhcGgoe1xuICAgICAgICAgICAgcmFua2RpcjogJ0JUJyxcbiAgICAgICAgICAgIGVkZ2VzZXA6IDIwLFxuICAgICAgICAgICAgcmFua3NlcDogNDAsXG4gICAgICAgICAgICBub2RlU2VwOiAyMCxcbiAgICAgICAgICAgIG1hcmdpbng6IDIwLFxuICAgICAgICAgICAgbWFyZ2lueTogMjBcbiAgICAgICAgfSlcbiAgICAgICAgLy8gZGFncmUubGF5b3V0KGdyYXBoKTtcblxuICAgICAgICB0aGlzLmRhZ3JlUmVuZGVyZXIoZDMuc2VsZWN0KHRoaXMuc3ZnR3JvdXApLCBncmFwaCk7XG5cbiAgICAgICAgdmFyIG5vZGVzID0gZ3JvdXAuc2VsZWN0QWxsKFwiZy5ub2RlXCIpO1xuXG4gICAgICAgIG5vZGVzLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSBncmFwaC5ub2RlKGQpO1xuICAgICAgICAgICAgdGhpcy5wcm9wcy5vbkhpZ2hsaWdodCh7XG4gICAgICAgICAgICAgICAgc3RhcnRJZHg6IG5vZGUuX2ludGVydmFsLnN0YXJ0SWR4LFxuICAgICAgICAgICAgICAgIGVuZElkeDogbm9kZS5faW50ZXJ2YWwuZW5kSWR4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuXG4gICAgICAgIHZhciBncmFwaFdpZHRoID0gZ3JhcGguZ3JhcGgoKS53aWR0aDtcbiAgICAgICAgdmFyIGdyYXBoSGVpZ2h0ID0gZ3JhcGguZ3JhcGgoKS5oZWlnaHQ7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMuc3ZnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoXG4gICAgICAgIHZhciBoZWlnaHQgPSB0aGlzLnN2Zy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHRcbiAgICAgICAgdmFyIHpvb21TY2FsZSA9IE1hdGgubWluKHdpZHRoIC8gZ3JhcGhXaWR0aCwgaGVpZ2h0IC8gZ3JhcGhIZWlnaHQpO1xuICAgICAgICB2YXIgdHJhbnNsYXRlID0gWygod2lkdGgvMikgLSAoKGdyYXBoV2lkdGgqem9vbVNjYWxlKS8yKSksICgoaGVpZ2h0LzIpIC0gKGdyYXBoSGVpZ2h0Knpvb21TY2FsZSkvMildO1xuXG4gICAgICAgIC8vZ3JvdXAudHJhbnNsYXRlKHRyYW5zbGF0ZSk7XG4gICAgICAgIC8vZ3JvdXAuc2NhbGUoem9vbVNjYWxlKTtcblxuICAgICAgICAvLyBjZW50ZXJcbiAgICAgICAgZDMuc2VsZWN0KHRoaXMuc3ZnR3JvdXApLnRyYW5zaXRpb24oKS5kdXJhdGlvbigyNTApLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyB0cmFuc2xhdGUgKyBcIilzY2FsZShcIiArIHpvb21TY2FsZSArIFwiKVwiKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHRoaXMucHJvcHMuZ3JhcGgpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmdyYXBoKSB7XG4gICAgICAgICAgICB0aGlzLmxheW91dEdyYXBoKHRoaXMucHJvcHMuZ3JhcGgpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc29sZS50aW1lRW5kKFwiZGF0YWZsb3dcIik7XG5cbiAgICAgICAgcmV0dXJuIDxzdmcgaWQ9XCJ2aXN1YWxpemF0aW9uXCIgcmVmPXsocmVmKSA9PiB0aGlzLnN2ZyA9IHJlZn0+XG4gICAgICAgICAgICA8ZyBpZD1cImdyb3VwXCIgcmVmPXsocmVmKSA9PiB0aGlzLnN2Z0dyb3VwID0gcmVmfT48L2c+XG4gICAgICAgIDwvc3ZnPjtcbiAgICB9XG59IiwiZnVuY3Rpb24gcnVuKCkge1xuICBSZWFjdERPTS5yZW5kZXIoPElERS8+LCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbW9uaWVsJykpO1xufVxuXG5jb25zdCBsb2FkZWRTdGF0ZXMgPSBbJ2NvbXBsZXRlJywgJ2xvYWRlZCcsICdpbnRlcmFjdGl2ZSddO1xuXG5pZiAobG9hZGVkU3RhdGVzLmluY2x1ZGVzKGRvY3VtZW50LnJlYWR5U3RhdGUpICYmIGRvY3VtZW50LmJvZHkpIHtcbiAgcnVuKCk7XG59IGVsc2Uge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIHJ1biwgZmFsc2UpO1xufSJdfQ==
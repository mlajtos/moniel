class PyTorchGenerator {
	constructor() {
		this.builtins = ["ArithmeticError", "AssertionError", "AttributeError", "BaseException", "BlockingIOError", "BrokenPipeError", "BufferError", "BytesWarning", "ChildProcessError", "ConnectionAbortedError", "ConnectionError", "ConnectionRefusedError", "ConnectionResetError", "DeprecationWarning", "EOFError", "Ellipsis", "EnvironmentError", "Exception", "False", "FileExistsError", "FileNotFoundError", "FloatingPointError", "FutureWarning", "GeneratorExit", "IOError", "ImportError", "ImportWarning", "IndentationError", "IndexError", "InterruptedError", "IsADirectoryError", "KeyError", "KeyboardInterrupt", "LookupError", "MemoryError", "ModuleNotFoundError", "NameError", "None", "NotADirectoryError", "NotImplemented", "NotImplementedError", "OSError", "OverflowError", "PendingDeprecationWarning", "PermissionError", "ProcessLookupError", "RecursionError", "ReferenceError", "ResourceWarning", "RuntimeError", "RuntimeWarning", "StopAsyncIteration", "StopIteration", "SyntaxError", "SyntaxWarning", "SystemError", "SystemExit", "TabError", "TimeoutError", "True", "TypeError", "UnboundLocalError", "UnicodeDecodeError", "UnicodeEncodeError", "UnicodeError", "UnicodeTranslateError", "UnicodeWarning", "UserWarning", "ValueError", "Warning", "ZeroDivisionError", "__build_class__", "__debug__", "__doc__", "__import__", "__loader__", "__name__", "__package__", "__spec__", "abs", "all", "any", "ascii", "bin", "bool", "bytearray", "bytes", "callable", "chr", "classmethod", "compile", "complex", "copyright", "credits", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "exec", "exit", "filter", "float", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input", "int", "isinstance", "issubclass", "iter", "len", "license", "list", "locals", "map", "max", "memoryview", "min", "next", "object", "oct", "open", "ord", "pow", "print", "property", "quit", "range", "repr", "reversed", "round", "set", "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "vars", "zip"]
		this.keywords = ["and", "as", "assert", "break", "class", "continue", "def", "del", "elif", "else", "except", "exec", "finally", "for", "from", "global", "if", "import", "in", "is", "lambda", "not", "or", "pass", "print", "raise", "return", "try", "while", "with", "yield"]
	}

    sanitize(id) {
		var sanitizedId = id
		if (this.builtins.includes(sanitizedId) || this.keywords.includes(sanitizedId)) {
			sanitizedId = "_" + sanitizedId
		}
		sanitizedId = sanitizedId.replace(/\./g, "this")
		sanitizedId = sanitizedId.replace(/\//g, ".")
		return sanitizedId
	}

	mapToFunction(nodeType) {
		let translationTable = {
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
		}

		return translationTable.hasOwnProperty(nodeType) ? translationTable[nodeType] : nodeType

	}

	indent(code, level = 1, indentPerLevel = "    ") {
		let indent = indentPerLevel.repeat(level)
		return code.split("\n").map(line => indent + line).join("\n")
	}

	generateCode(graph, definitions) {
		let imports =
`import torch as T
import torch.nn.functional as F
import torch.autograd as AG`

		let moduleDefinitions = Object.keys(definitions).map(definitionName => {
			if (definitionName !== "main") {
				return this.generateCodeForModule(definitionName, definitions[definitionName])
			} else {
				//return ""
			}
		})

		let code =
`${imports}

${moduleDefinitions.join("\n")}
`

		return code
	}

	generateCodeForModule(classname, graph) {
		let topologicalOrdering = graphlib.alg.topsort(graph)
		let forwardFunction = ""

		topologicalOrdering.map(node => {
			// console.log("mu", node)
			let n = graph.node(node)
			let ch = graph.children(node)

			if (!n) {
				return
			}
			// console.log(n)

			if (ch.length === 0) {
				let inNodes = graph.inEdges(node).map(e => this.sanitize(e.v))
				forwardFunction += `${this.sanitize(node)} = ${this.mapToFunction(n.class)}(${inNodes.join(", ")})\n`
			} 
		}, this)

		let moduleCode =
`class ${classname}(T.nn.Module):
    def __init__(self, param1, param2): # parameters here
        super(${classname}, self).__init__()
        # all declarations here

    def forward(self, in1, in2): # all Inputs here
        # all functional stuff here
${this.indent(forwardFunction, 2)}
        return (out1, out2) # all Outputs here
`
		return moduleCode
	}
}
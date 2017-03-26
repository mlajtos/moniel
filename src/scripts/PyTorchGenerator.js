class PyTorchGenerator {
    sanitize(id) {
		var sanitizedId = id
		sanitizedId = sanitizedId.replace(/\//g, "_")
		sanitizedId = sanitizedId.replace(/\./g, "")
		return sanitizedId
	}

	generateCode(g) {
		// return ""
		let imports = `import torch`

		let topologicalOrdering = graphlib.alg.topsort(g)
		console.log(topologicalOrdering)

		var code = ""

		topologicalOrdering.map(node => {
			// console.log("mu", node)
			let n = g.node(node)
			let ch = g.children(node) 
			console.log(n)

			if (ch.length === 0) {
				// console.log(node)
				let inNodes = g.inEdges(node).map(e => this.sanitize(e.v))
				code += `${this.sanitize(node)} = ${n.class}(${inNodes.join(", ")})\n`
			} else {
				if (n.userGeneratedId) {
					code += `def ${n.userGeneratedId}():\n\tpass\n\n`
				}
			}
		}, this)
		return imports + "\n" + code
	}
}
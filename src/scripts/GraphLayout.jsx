class GraphLayout{
	activeWorkers = {}
	currentWorkerId = 0
	lastFinishedWorkerId = 0
	callback = function(){}

	constructor(callback) {
		this.callback = callback
	}

	layout(graph) {
		const id = this.getWorkerId()
		this.activeWorkers[id] = new LayoutWorker(id, graph, this.workerFinished.bind(this))
	}

	workerFinished({id, graph}) {
		if (id >= this.lastFinishedWorkerId) {
			this.lastFinishedWorkerId = id
			this.callback(graph)
		}
	}

	getWorkerId() {
		this.currentWorkerId += 1
		return this.currentWorkerId
	}
}

class LayoutWorker{
	id = 0
	worker = null
	constructor(id, graph, onFinished) {
		this.id = id
		this.worker = new Worker("src/scripts/GraphLayoutWorker.js")
		this.worker.addEventListener("message", this.receive.bind(this))
		this.onFinished = onFinished
		
		this.worker.postMessage(this.encode(graph))
	}
	receive(message) {
		this.worker.terminate()
		this.onFinished({
			id: this.id,
			graph: this.decode(message.data)
		})
	}
	encode(graph) {
		return graphlib.json.write(graph)
    }

    decode(json) {
		return graphlib.json.read(json)
    }
}
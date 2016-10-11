# Moniel: *Notation for Deep Learning Models*
Moniel is human-friendly notation for declarative data flow graphs which can be compiled for TensorFlow runtime.

Definition of VGG16:

![VGG16 written in Moniel](docs/images/VGG16.png)
## Motivation
### Why?
Deep Learning is all about learning representations. Deep hierarchical representations that help us solve problems that were thought to be impossible to crack. Ironically, representations of models themselves suck – we describe them in programming languages that were designed for other purpose in another era; effectively burying the beauty of the model under years of legacy ideas.
### How?
Deep learning community shifted its thinking about the computations that are at the core of every learning model. We don't execute everything right away, instead we construct a lightweight intermediate representation of all these computations – [a computational graph](https://colah.github.io/posts/2015-08-Backprop/). Coincidentally, illustrations in form of boxes and arrows are used as the best tool to convey an understanding about neural nets. Funny.
### What?
Moniel is an attempt at creating a notation for deep learning models leveraging graph thinking. Instead of defining computation as list of formulea, we define our model as a declarative dataflow graph. It is [not a programming language](https://twitter.com/karpathy/status/469958608260579328), just a convenient notation that can be executed.

----------

## Quick Introduction
*These examples are contrived. They serve only for introducing the notation.*

Let's start with nothing, i.e. **comments**:
```
// This is line comment.

/*
	This is block
	comment.
*/
```
Node can be created by stating its **type**:
```
Sigmoid
```
You don't have to write full name of a type. Use **acronym** that fits you! These are all equivalent:
```
LocalResponseNormalization // canonical, but too long
LocRespNorm // weird, but why not?
LRN // cryptic for beginners, enough for others
```
Nodes connect with other nodes with an **arrow**:
```
Sigmoid -> MaxPooling
```
There can be **chains** of any length:
```
LRN -> Sigm -> BatchNorm -> ReLU -> Tanh -> MP -> Conv -> BN -> ELU
```
Also, there can be many chains:
```
ReLU -> BN
LRN -> Conv -> MP
Sigm -> Tanh
```
Nodes can have **identifiers**:
```
conv:Convolution
```
Identifiers let's you refer to nodes that are used more than once:
```
// inefficient definition of matrix-matrix multiplication
matrix1:Tensor
matrix2:Tensor
mm:MatrixMultiplication

matrix1 -> mm
matrix2 -> mm
```
However, this can be rewritten without identifiers using **list**:
```
[Tensor,Tensor] -> MatMul
```
Lists let's you easily define **multi-connection**:
```
// Maximum of 3 random numbers
[Random,Random,Random] -> Maximum
```
**List-to-list connections** are sometimes really handy:
```
// Range of 3 random numbers
[Rand,Rand,Rand] -> [Max,Min] -> Sub -> Abs
```
Some nodes can take **named attributes** that modify their behavior:
```
Fill(shape = 10x10x10, value = 1.0)
```
Attribute names can also be shortened:
```
Ones(s=10x10x10)
```
**Multi-valued attributes** are useful for hyper-parameter tuning:
```
Dropout(ratio = <0.3, 0.5, 0.7>)
```
Defining large graphs without proper structuring is unmanageable. **Scopes** can help:
```
/layer{ // slash denotes scope
	RandomNormal(shape=784x1000) -> weights:Variable
	weights -> dp:DotProduct -> act:ReLU
}

Tensor -> layer/dp // feed input into the DotProduct of the "layer" scope
layer/act -> Softmax // feed output of the "layer" scope into another node
```
Scopes are more powerful when they define proper **Input-Output boundary**:
```
/layer1{
	RandomNormal(shape=784x1000) -> weights:Variable
	[in:Input,weigths] -> DotProduct -> ReLU -> out:Output
}

/layer2{
	RandomNormal(shape=1000x10) -> weights:Variable
	[in:Input,weigths] -> DotProduct -> ReLU -> out:Output
}

layer1 -> layer2 // connect scopes directly
```
If scopes have identical structure, we can create a **reusable block** and use it as a normal node:
```
+ReusableLayer(shape = 1x1){
	RandN(shape = shape) -> w:Var
	[in:In,w] -> DP -> RLU -> out:Out
}

RL(s = 784x1000) -> RL(s = 1000x10)
```
Of course, [editor](https://www.youtube.com/watch?v=zVZqHHNQ50c) with proper syntax highlighting and interactive feedback really helps:

![Syntax highlightning helps](docs/images/ReusableLayer.png)

----------

## Similar projects and Inspiration
- [TensorGraph](https://github.com/hycis/TensorGraph) – "TensorGraph is a framework for building any imaginable models based on TensorFlow"
- [DNNGraph](https://github.com/ajtulloch/dnngraph) – "a deep neural network model generation DSL in Haskell"
- [NNVM](https://github.com/dmlc/nnvm) – "Intermediate Computational Graph Representation for Deep Learning Systems"
- [DeepRosetta](https://github.com/edgarriba/DeepRosetta) – "An universal deep learning models conversor"
- [TensorBuilder](https://cgarciae.github.io/tensorbuilder/) – "a functional fluent immutable API based on the Builder Pattern"
- [Keras](https://keras.io/) – "minimalist, highly modular neural networks library"
- [KeraFlow](https://github.com/ipod825/keraflow) – simplified Keras(?)
- [PrettyTensor](https://github.com/google/prettytensor) – "a high level builder API"
- [TF-Slim](https://github.com/tensorflow/models/blob/master/inception/inception/slim/README.md) – "a lightweight library for defining, training and evaluating models"
- [TFLearn](http://tflearn.org/) – "modular and transparent deep learning library"
- [Caffe](https://github.com/BVLC/caffe) – "deep learning framework made with expression, speed, and modularity in mind"

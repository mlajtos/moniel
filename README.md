# Moniel: *Notation for Deep Learning Models*
[Demo](https://www.youtube.com/watch?v=zVZqHHNQ50c)
## Why?
Deep Learning is all about learning representations. Deep hierarchical representations that help us solve problems that were thought to be impossible to crack. Ironically, representations of models themselves suck – we describe them in programming languages that were designed for other purpose in another era; effectively burying the beauty of the model under years of legacy ideas.
## How?
Deep learning community shifted its thinking about the computations that are at the core of every learning model. We don't execute everything right away, instead we construct a lightweight intermediate representation of all these computations – [a computational graph](https://colah.github.io/posts/2015-08-Backprop/). Coincidentally, illustrations in form of boxes and arrows are used as the best tool to convey an understanding about neural nets. Funny.
## What?
Moniel is an attempt at creating a notation for deep learning models leveraging graph thinking. Instead of defining computation as list of formulea, we define our model as a declarative dataflow graph. It is [not a programming language](https://twitter.com/karpathy/status/469958608260579328), just a convenient notation that can be executed.

----------

## Quick Introduction
*These examples are sometimes weird and without any sense. They are not real-world examples and serve only for introducing the notation.*

Let's start with nothing, i.e. comments:
```
// This is line comment.

/*
	This is block
	comment.
*/
```
Node can be created by stating its type:
```
Sigmoid
```
You don't have to write full name of a type. Use acronym that fits you! These are all equivalent:
```
LocalResponseNormalization // canonical, but too long
LocRespNorm // weird, but why not?
LRN // cryptic for beginners, enough for others
```
Nodes connect with other nodes with an arrow:
```
Sigmoid -> MaxPooling
```
There can be chains of any length:
```
LRN -> Sigm -> BathNorm -> ReLU -> Tanh -> MP -> Conv -> BN -> ELU
```
Also, there can be many chains:
```
ReLU -> BN
LRN -> Conv -> MP
```
Nodes can have identifiers:
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
However, this can be rewritten without identifiers using list:
```
[Tensor,Tensor] -> MatMul
```
Lists let's you easily define multi-connection:
```
// Maximum of 5 random numbers
[Random,Random,Random,Random,Random] -> Maximum
```
List-to-list connections are sometimes really handy:
```
// Range of 3 random numbers
[Rand,Rand,Rand] -> [Max,Min] -> Sub -> Abs
```
Some nodes can take named attributes that modify their behavior:
```
Constant(shape = 10x10x10, value = 1.0)
```
Yes, shape attribute is written with times sign (or "x"). And of course, these can also be shortened/rewritten to your liking:
```
Ones(s=10x10x10)
```
Creating one giant graph without proper structuring is a suicide. Scopes can shield computations by Input-Output boundary:
```
/layer1{ // slash denotes scope
	RandomNormal(shape=784x1000) -> weights:Variable
	[in:Input,weigths] -> DotProduct -> ReLU -> out:Output
}

/layer2{
	RandomNormal(shape=1000x10) -> weights:Variable
	[in:Input,weigths] -> DotProduct -> ReLU -> out:Output
} // 'in', 'weights', and 'out' are not shared because scope name is different

layer1/out -> layer2/in // connect scopes together
```
When scopes have defined Inputs and Outputs, they can be connected directly:
```
layer1 -> layer2
```
If scopes are almost identical, we can create a reusable block and use it as a normal node:
```
+ReusableLayer(shape = 1x1){
	RandN(shape = shape) -> w:Var
	[in:In,w] -> DP -> ReLU -> out:Out
}

RL(s=784x1000) -> RL(s=1000x10)
```
Of course, editor with proper syntax highlighting can really help:

![Syntax highlightning helps](images/ReusableLayer.png)

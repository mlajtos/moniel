# Overview
## Pipeline
![Transformation pipeline](images/pipeline.png)

### Moniel
#### Parser
Moniel notation is defined as a [Parsing Expression Grammar](https://en.wikipedia.org/wiki/Parsing_expression_grammar). The language consists of a [grammar](../moniel.ohm) and [semantics](../moniel.semantics.js) that are interpreted by [Ohm/JS](https://github.com/cdglabs/ohm). Result is a Abstract Syntax Tree that is further processed by Moniel Runtime.

#### Runtime
Runtime constructs itermediate representaion of the computational graph from AST. This step includes node type resolution, managing scopes, etc. Intermediate representation graph is then used to produce JSON and ProtoBuf definitions.

### Moniel IDE
*Moniel IDE* stands for (Integrated | Interactive) (Development | Design) (Environment | Experience), where user can interactively design model with immediate feedback. For now, this stage is limited to model definition only. However, user should be able to interactively inspect model training and model evaluation – these are partly covered by TensorBoard.
#### Editor
We use [Ace editor customized for Moniel notation](https://github.com/mlajtos/ace-moniel/) with proper syntax highlighting and basic code completion. Thanks to [Fira Code](https://github.com/tonsky/FiraCode) font, various symbols in notation are damn gorgeous.
#### Visualization
To visualize computational graph we use [Dagre](https://github.com/cpettitt/dagre) to layout the graph and [Dagre-D3](https://github.com/cpettitt/dagre-d3) as a bridge to rendering with [D3](https://github.com/d3/d3).
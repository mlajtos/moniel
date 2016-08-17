# Moniel
*Deep learning model defintions for people.*

You can view [first public demo](https://www.youtube.com/watch?v=zVZqHHNQ50c). Following text is brief introduction of implemented ideas.

### A Foreword about Representations
Deep Learning is all about learning representations. Deep hierarchical representations that help us solve problems that were thought to be impossible to crack. Ironically, represenatations of deep learning models themselves suck. This is a stab at creating notation for deep learning models.

## Boxes and Arrows
Computational graph is the single best thing that happened to Deep Learning since inventing backpropagation. In contrast to computing everything right away, we construct a lightweight *representation* of all these computations that needs to be done – some sort of plan. This plan is in form of a graph – nodes and edges. Or boxes and arrows. Every box represents a unit computation and arrows connect boxes to boxes.

This representation is convenient if you want to do crazy stuff like efficiently dispatching computation among multiple machines, eliminating unnecessary computation, [automatic differentiation](https://colah.github.io/posts/2015-08-Backprop/), visualization and so on.

Computational graphs lie at the heart of the software-hardware stack that we use to run deep neural nets. Down are depths of ones and zeroes and at the top are UI/UX heights. It is better to be high, so today we are not going to talk much about computations. Rather, how to express them.
## Formulae
How does one get a computational graph? Easy. Write a formula for it:
```
f(x) = max((x × w) + b, 0)
```
This representation uses Euler's functional notation, Recode's equal sign, Oresme's plus sign, Oughtred's times sign, Tartaglia's precedence parentheses. I have no idea from where comes "max" and the comma, but I bet there will be a cool YouTube video about origins of zero.

As every language, [mathematical notation](https://en.wikipedia.org/wiki/History_of_mathematical_notation) evolved over time to an inconsistent and ambiguous mess that we can use without any problem. Of course, this paper and pencil notation was also carried over to programming languages. Since Backus' Fortran (from *for*mula *tran*slation) we are basically stuck with it. There were some briliant ideas that tried to bring clarity to this chaos. Notably, [Iverson's APL](http://dl.acm.org/ft_gateway.cfm?id=1283935&type=pdf) family could change the flow of the history, but it didn't happen. Better luck next time.

So back to our question – how do we get computational graph from our formula? Just move things around a bit and voilá:

[animation – formula to graph]

With this visualization, we can see that there is not a real distinction between operators (+,×) and functions (max). Operators are just a convenient notation for frequently reocurring functions. So we can rewrite the fomula to a pure functional notation:
```
f(x) = max(plus(times(x,w),b),0)
```
As we can clearly see, this isn't better. Actually it is harder to read and understand. What if we skipped the step of translating formulas into graphs? What if we adopted our graph thinking for the direct definition of computational graphs?
## Composition
In mathematics, we have functions that can be composed. For example, we can rewrite `h(g(f(x)))` into `(h.g.f)(x)`. This is called *function composition* (notice the order of execution). As you can see, this is directly related to stacking layers on top of each other in deep learning practice. But how we think about it is slightly different. We rather talk about *chain of transformations*. As an example, we can look at a definition of a simple MLP in high-level Python framework [Keras](https://keras.io/):
```python
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation

model = Sequential()
model.add(Dense(64, input_dim=20, init='uniform'))
model.add(Activation('tanh'))
model.add(Dropout(0.5))
model.add(Dense(64, init='uniform'))
model.add(Activation('tanh'))
model.add(Dropout(0.5))
model.add(Dense(10, init='uniform'))
model.add(Activation('softmax'))
```
In this example, every layer (Dense, Activation, Dropout) takes in the output of the layer before it. However, this information is infered and not directly stated by the notation. Using the [functional API](https://keras.io/getting-started/functional-api-guide/) this information can be explicitly stated:
```
from keras.layers import Input, Dense
from keras.models import Model

inputs = Input(shape=(784,))

x = Dense(64, activation='relu')(inputs)
x = Dense(64, activation='relu')(x)
predictions = Dense(10, activation='softmax')(x)

model = Model(input=inputs, output=predictions)
```
Even though that this notation is intended to be more functional, the composition is still quite different  than functional composition. But more important is fact that the overall model architecture (computational graph) is still hidden. Wouldn't it be nice to see things more clearly?

## Chinnese Room


Súčasné frameworky pre neurónové siete využívajú na definíciu modelov imperatívne rozhranie. Inak povedané, architektúra modelu je zadefinovaná priamo v kóde spolu s učiacou sa slučkou a  preprocesingom dát. Ako illustračný príklad nám poslúži framework Torch v programovacom jazyku Lua:
```lua
mlp = nn.Sequential()
mlp:add(nn.Linear(784,2000))
mlp:add(nn.ReLU())
mlp:add(nn.Linear(2000,1000))
mlp:add(nn.ReLU())
mlp:add(nn.Linear(1000,10))
mlp:add(nn.SoftMax())
```
Kompozíciou preddefinovaných blokov vytvárame komplexné modely, ktoré potom učíme pomocou učiaceho sa algoritmu podľa vhodného výberu. Každý blok má predpis, vzorec, či rovnicu ktorá definuje čo robí – ako transformuje vstupné dáta na výstupné dáta. Napr. notorický známy blok ReLU označuje funkciu, ktorú vieme vyjadriť ako ```y = max(x,0)``` Ak vieme napísať, čo robí jeden blok, vieme napísať aj rovnicu pre celý tento zložený model. Tá rovnica bude samozrejme nečitateľná... Ale presne na to máme koncept funkcií, či blokov – aby sme zabaľovali funkcionalitu jednotlivých modulov do čiernych skriniek, ktoré potom spájame do seba. Inými slovami, schovávame nepodstatné implementačné detaily a sústreďujeme sa na úroveň opisu, ktorá je vhodnejšia pre tvorbu komplexných modelov.


Čo keby sme preskočili reprezentáciu výpočtu danú vzorcami a išli rovno do grafovej reprezentácie? Notácia by sa nám podstatne zjednodušila. 

Na tento typ úlohy je turing-complete programovací jazyk overkill z nasledujúcich dôvodov:

1. nejasná architektúra (odkiaľ tečú dáta? kam tečú dáta?)
2. miešanie vstupných dát s parametrami operácie (iná úroveň opisu)
3. nejasné mená parametrov
4. zbytočne opakujúce sa konštrukcie
5. etc. (pri TF je toho ešte viac)

```
Linear(784) -> ReLU -> Linear(2000) -> ReLU -> Linear(10)
```

### Parametre operácií

### Hyperparametre
Ok, máme nadefinovaný hrubý model a po natrénovaní zistíme, že je zlý.. Vyskúšame inú sadu hyperparametrov a vidíme, že je lepší. A ďalšou zmenou to celé pokazíme. Tento cyklus by mal byť automatizovaný – framework by mal teda zabezpečiť sweep cez celý priestor hyperparametrov. Avšak ako zadefinovať celú sadu hyperparametrov? Jednoducho:

```
In -> Convolution -> Dropout(ratio = [0.2, 0.5, 0.8]) -> Out
```
Tento zápis definuje rovno 3 modely – jeden pre každú hodnotu dropout.

Ak máme viac operácií, ktorých hyperparametre obsahujú celý zoznam možných hodnôt, počet modelov rastie multiplikatívne. Príklad:
```
In -> Dropout(ratio = [0.2, 0.3]) -> Convolution -> Dropout(ratio = [0.5,0.7]) -> Out
```
Tento zápis definuje 4 modely, kde hyperparametre vytvárajú kartézsky súčin, teda všetky možné kombinácie hodnôt hyperparametrov.

## Various References
http://mxnet.readthedocs.io/en/latest/system/program_model.html

## TODO

1. natívne hyperparametre 
2. scopy
3. kompozícia cez vlastné bloky
4. IDE – integrated/interactive design/development environment/experience
5. vizuálny programovací jazyk je zlý lebo vzniká špagetový kód
6. správne obmedzený grafový jazyk ostane prehľadný + vizuálna forma je vždy precízna
7. spájanie cez listy je mocné (selektory budú ešte mocnejšie)
8. možnosť priameho zasahovania do modelu cez hierarchickú štruktúru
9. takmer všetky frameworky sa ticho "dohodli" na DAGoch s preddefinovanými operáciami
10. obmedená doména -> možnosť robiť skratky (abbreviation/acronym)
11. identifikátory len vtedy keď sú potrebné
12. vstupno-výstupné rozhrania pre bloky
13. prečo nie grafické rozhranie?

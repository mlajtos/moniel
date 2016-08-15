# Moniel
*Deep learning model defintions for people.*

### A foreword about representations
Deep learning is all about learning representations. Hierarchical representations that help us peek into the  structure of important data. Good representations are crucial to solving tasks that were thought to be impossible to crack. For example, the whole generative modeling movement is a true test for learning good representations. As Feynman said, ```"What I cannot create, I do not understand."```. Let's see where this path will lead us.

## Boxes and Arrows
Computational graph is a way to organize many small computations in an ordered and efficient manner. In deep learning communtity it is so far the best approach to tackle the problem of training massive models. How does it help? In contrast to computing everything right away, we construct a lightweight *representation* of all these computations that needs to be done – some sort of plan. This plan is called computational *graph*. Graph with nodes and edges. Or, you know, boxes and arrows. And juice! Every box represents a unit computation; arrows connect boxes to boxes; and juice is the thing that flows through the whole thing and makes us happy. 

This representation as a graph is really good for neural nets because sometimes we need to derive another computational graph from it. We won't go into that because Christopher Olah wrote beautifully about [Calculus on Computational Graphs](https://colah.github.io/posts/2015-08-Backprop/), so go read it. It's pupil-dilatating.

We began at a weird starting point – computational graphs are almost at the middle point of the software-hardware stack that we need to run neural nets. Down are depths of ones and zeroes and at the top are UI/UX heights. I prefer to be high, so today we are not going to talk so much about computations. Rather, how to express them.
## Formulae
How does one get a computational graph? Easy. Write a formula for it:
```
f(x) = max((x × w) + b, 0)
```
This representation uses Euler's functional notation, [Recode](https://en.wikipedia.org/wiki/Robert_Recorde)'s equal sign, Oresme's plus sign, Oughtred's times sign, Tartaglia's precedence parentheses. I have no idea from where comes "max" and the comma, but I bet there will be a cool YouTube video about origins of "zero".

As every language, mathematical notation evolved over time to an inconsistent and ambiguous mess and suprisingly we have absolutely no trouble reading it. Years of training shaped us into form that it is easy to read and write such "language". This mathematical symbolism designed for paper and pencil was also carried over to programming languages. Since Backus' Fortran (from *for*mula *tran*slation) we are basically stuck with this inconsistencies. Of course, there were some briliant ideas that tried to bring clarity to this chaos. Notably, Iverson's APL family could change the flow of the history, but it didn't happen. Better luck next time.

So, how do we get computational graph from our formula? Just move things around a bit and voilá:

[animation – formula to graph]

## Composing
Our formula was trivial and it was easily translated to computational graph. That's because degree of nesting was low. Nesting is wrapping result of one function into another function. In mathematics it is called *function composition*. It enables us omit some parentheses, so this ```f(g(h(x)))``` becomes this ```(f.g.h)(x)```. Much clearer, right? But it seems... Backwards.

Actually the whole functional notation is kind of backwards. (Like APL *wink* *wink*) What we want to do is take something, shake it, squeeze it, turn it, twist it and boom! We have what we wanted. Formaly speaking, we want to use postfix notation istead of prefix notation. So instead we should write ```(((x)h)g)f```. Yeah, it's worse. Let me grab some arrows: ```x -> h -> g -> f```. Better.


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

## TODO

1. natívne hyperparametre 
2. scopy
3. kompozícia cez vlastné bloky
4. integrované dizajnové/vývojové prostredie
5. vizuálny programovací jazyk je zlý lebo vzniká špagetový kód
6. správne obmedzený grafový jazyk ostane prehľadný + vizuálna forma je vždy precízna
7. spájanie cez listy je mocné (selektory budú ešte mocnejšie)
8. možnosť priameho zasahovania do modelu cez hierarchickú štruktúru
9. takmer všetky frameworky sa ticho "dohodli" na DAGoch s preddefinovanými operáciami
10. obmedená doména -> možnosť robiť skratky (abbreviation/acronym)
11. identifikátory len vtedy keď sú potrebné
12. vstupno-výstupné rozhrania pre bloky
13. prečo nie grafické rozhranie?

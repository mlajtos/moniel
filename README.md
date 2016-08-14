# Moniel
*Deep learning model defintions for people.*

### A foreword about representations
Deep learning is all about learning representations. Hierarchical representations that help us peek into the  structure of important data. Good representations are crucial to solving tasks that were thought to be impossible to solve. For example, the whole generative modeling movement is a true test for learning good representations. As Feynman said, ```"What I cannot create, I do not understand."```. Let's see where this path will lead us.

## Computational graph

Computational graph is a way to organize many small computations in an ordered and efficient manner. In deep learning communtity it is so far the best approach to tackle the problem of training massive models. How it helps? In contrast to computing everything right away, we construct a lightway *representation* of all these computations that needs to be done. This representation is called computational graph. Boxes and arrows. And juice! Every box represents a unit computation; arrows connect boxes to boxes; and juice is the thing that flows through the whole thing and makes us happy. This representation as a graph is really good for neural nets because sometimes we need to derive another computational graph from it. We won't go into that – Christopher Olah wrote beautifully about [Calculus on Computational Graphs](https://colah.github.io/posts/2015-08-Backprop/), so go read it.

We started at a weird starting point – computational graphs are almost the middle point of the software-hardware stack that we need to run a neural net. Down are depths of ones and zeroes and at the top are UI/UX heights. I prefer to be high.
## Formulas

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


### Výpočtový graf
Výpočtový graf popisuje výpočet, ktorý vykonáva neurónová sieť ako directed accyclic graph (DAG). Táto reprezentácia je vhodná pre auto differentiation, ktorá je potrebná pre výpočet gradientov, ktoré sú základom učenia pomocou backpropagation. Ako tieto gradienty počítame popísal Cristohper Olah v článku [Calculus na výčtových grafoch](https://colah.github.io/posts/2015-08-Backprop/). Nás bude zaujímať ako sa dopracovať k samotnému výpočtovému grafu.
### Vzorce
[Fortran](https://en.wikipedia.org/wiki/Fortran) je programovací jazyk, ktorý vymyslel John Backus na prevod vzorcov (*for*mula *tran*slation) čitateľných človekom do reči strojov (assembly language). Dnešné programovacie jazyky sú priamimi pokračovateľmi tejto myšlienky.

Výpočtový graf pre LSTM môžeme popísať nasledovnými formulami:
```
(i,f,o,g) = meh meh meh
```
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

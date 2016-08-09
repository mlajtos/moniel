# Moniel
Definícia modelov neurónových sietí pre obyčajných ľudí.

## Súčasný stav
Väčšina frameworkov ktoré poskytujú používanie umelých neurónových sietí, využíva na definíciu modelov imperatívne rozhranie, resp. imperatívny kód. Ako jednoduchý príklad môžeme použiť ukážku z frameworku Torch v jazyku Lua:
```lua
mlp = nn.Sequential()
mlp:add( nn.Linear(784, 2000) )
mlp:add( nn.ReLU() )
mlp:add( nn.Linear(2000, 10) )
mlp:add( nn.ReLU() )
mlp:add( nn.Linear(10, 1) )
```

Tento dvojvrstvový perceptrón je svojou vstupno-výstupnou architektúrou vhodný na klasifikáciu MNIST číslic. Ako vstup máme obrázok vo veľkosti 28x28 pixelov a ako výstup je 10 možných číslic. Ako môžeme vidieť, tak dnešné frameworky ponúkajú už predefinované parametrizovateľné vrstvy. Koncový používateľ/programátor je teda častokrát postavený pred úlohu vyskladania vhodného modelu zo základných LEGO kociek. Na tento typ úlohy je turing-complete programovací jazyk overkill z nasledujúcich dôvodov:

1. nejasná architektúra (odkiaľ tečú dáta? kam tečú dáta?)
2. miešanie vstupných dát s parametrami operácie (iná úroveň opisu)
3. nejasné mená parametrov
4. zbytočne opakujúce sa konštrukcie
5. etc. (pri TF je toho ešte viac)

```
Linear(784) -> ReLU -> Linear(2000) -> ReLU -> Linear(10)
```

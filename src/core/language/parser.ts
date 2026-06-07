// @ts-nocheck
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,x:24, SCRIVI:30, WRITE:32, RIPETI:38, REPEAT:40, VOLTE:42, TIMES:44, FINE:46, END:48, SE:52, IF:54, ALTRIMENTI:60, ELSE:62}
export const parser = LRParser.deserialize({
  version: 14,
  states: "&fQVQPOOOnQPO'#C^OOQO'#DR'#DROOQO'#C|'#C|QVQPOOOsQPO'#CjO!RQPO'#CnOsQPO'#CuOsQPO,58xOOQO-E6z-E6zOOQO'#Ca'#CaOsQPO'#CaOOQO'#DS'#DSO!iQPO,59UO#fQPO,59YO#nQPO'#DVO#{QPO,59aO$]QPO1G.dO%VQPO,58{OOQO'#Cg'#CgOsQPO,59nOsQPO'#C}O%^QPO1G.pO&XQPO1G.tOsQPO,59qO&cQPO1G.{OOQO1G.{1G.{O&sQPO1G.{OOQO1G.g1G.gOOQO1G/Y1G/YO&}QPO,59iOOQO-E6{-E6{O'zQPO7+$`OOQO7+$`7+$`O(UQPO1G/]OOQO7+$g7+$gO({QPO7+$gO({QPO7+$gOOQO<<Gz<<GzO)VQPO<<HROOQO<<HR<<HROOQOAN=mAN=m",
  stateData: ")a~OtOS~ORPO_TO`TOcUOdUOjVOkVO~OSWO~ORYOUYOVYOwZO~OU^O~OWdOXdOYdO[cO]dO~OaeOR^a_^a`^ac^ad^aj^ak^ar^ag^ah^an^ao^a~P!WOegOfgO~OShOlhOmhO~P!WOgjOhjOnkOokO~PVORQi_Qi`QicQidQijQikQirQigQihQinQioQi~P!WOxlO~P!WOaeOR^i_^i`^ic^id^ij^ik^ir^ig^ih^in^io^i~OgqOhqO~PVOgsOhsOntOotO~PVOgsOhsO~PVORqa_qa`qaaqacqadqajqakqarqagqahqanqaoqa~P!WOgvOhvO~PVORyi_yi`yicyidyigyihyijyikyinyioyi~P!WOgxOhxO~PVOgyOhyO~PVO",
  goto: "#{zPP{PP!XPPPPP!dPP{PPP{PPPPPP{PPPPPP!l#SPPP#Y#fPP#xeQOS`gikptuw[[TVWZehRmd]d]_abnrQSOYXSipuwQi`QpgQukRwtQf]RofeROS`gikptuwQ]TQ_VQaWQbZQneRrhR`V",
  nodeNames: "⚠ Program Assignment Identifier Equal Term Number String Plus Minus Times XMul XMul Divide Print SCRIVI WRITE Comma Loop RIPETI REPEAT VOLTE TIMES FINE END Conditional SE IF Greater Less ALTRIMENTI ELSE",
  maxTerm: 41,
  skippedNodes: [0],
  repeatNodeCount: 2,
  tokenData: "%|~ReXY!dYZ!d]^!dpq!drs!uwx#dxy#|yz$Rz{$W{|$]|}$b}!O$g!P!Q$l!Q![$q![!]$l!^!_%[!_!`%a!`!a%f!c!}%k#R#S%k#T#o%k~!iSt~XY!dYZ!d]^!dpq!d~!xTOr!urs#Xs;'S!u;'S;=`#^<%lO!u~#^OV~~#aP;=`<%l!u~#gTOw#dwx#Xx;'S#d;'S;=`#v<%lO#d~#yP;=`<%l#d~$ROw~~$WOx~~$]OY~~$bOW~~$gOa~~$lOX~~$qO]~~$vQU~!O!P$|!Q![$q~%PP!Q![%S~%XPU~!Q![%S~%aOm~~%fOS~~%kOl~~%pSR~!Q![%k!c!}%k#R#S%k#T#o%k",
  tokenizers: [0],
  topRules: {"Program":[0,1]},
  specialized: [{term: 3, get: (value) => spec_Identifier[value] || -1}],
  tokenPrec: 0
})

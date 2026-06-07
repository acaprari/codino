// @ts-nocheck
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,x:24, SCRIVI:30, WRITE:32, RIPETI:38, REPEAT:40, VOLTE:42, TIMES:44, FINE:46, END:48, SE:52, IF:54, ALTRIMENTI:60, ELSE:62}
export const parser = LRParser.deserialize({
  version: 14,
  states: "&fQVQPOOOnQPO'#C^OOQO'#DR'#DROOQO'#C|'#C|QVQPOOOsQPO'#CjOsQPO'#CnOsQPO'#CuOsQPO,58xOOQO-E6z-E6zOOQO'#Ca'#CaOsQPO'#CaOOQO'#DS'#DSO!dQPO,59UO#aQPO,59YO#kQPO'#DVO#xQPO,59aO$YQPO1G.dO%SQPO,58{OOQO'#Cg'#CgOsQPO,59nOsQPO'#C}O%ZQPO1G.pO&UQPO1G.tOsQPO,59qO&`QPO1G.{OOQO1G.{1G.{O&pQPO1G.{OOQO1G.g1G.gOOQO1G/Y1G/YO&zQPO,59iOOQO-E6{-E6{O'wQPO7+$`OOQO7+$`7+$`O(RQPO1G/]OOQO7+$g7+$gO(xQPO7+$gO(xQPO7+$gOOQO<<Gz<<GzO)SQPO<<HROOQO<<HR<<HROOQOAN=mAN=m",
  stateData: ")^~OtOS~ORPO_TO`TOcUOdUOjVOkVO~OSWO~ORYOUYOVYOwZO~OWdOXdOYdO[cO]dO~OaeOR^a_^a`^ac^ad^aj^ak^ar^ag^ah^an^ao^a~P!ROegOfgO~P!ROShOlhOmhO~P!ROgjOhjOnkOokO~PVORQi_Qi`QicQidQijQikQirQigQihQinQioQi~P!ROxlO~P!ROaeOR^i_^i`^ic^id^ij^ik^ir^ig^ih^in^io^i~OgqOhqO~PVOgsOhsOntOotO~PVOgsOhsO~PVORqa_qa`qaaqacqadqajqakqarqagqahqanqaoqa~P!ROgvOhvO~PVORyi_yi`yicyidyigyihyijyikyinyioyi~P!ROgxOhxO~PVOgyOhyO~PVO",
  goto: "$QzPP{PP!XPPPPP!ePP{PPP{PPPPPP{PPPPPP!n#UPPP#[#hPP#}eQOS`gikptuw^[TUVWZehRmd_d]^_abnrQSOYXSipuwQi`QpgQukRwtQf]RofeROS`gikptuwQ]TQ^UQ_VQaWQbZQneRrhR`V",
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

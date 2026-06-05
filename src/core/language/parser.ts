// @ts-nocheck
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,x:24, SCRIVI:30, WRITE:32, RIPETI:36, REPEAT:38, VOLTE:40, TIMES:42, FINE:44, END:46, SE:50, IF:52, ALTRIMENTI:58, ELSE:60}
export const parser = LRParser.deserialize({
  version: 14,
  states: "%|QVQPOOOnQPO'#C^OOQO'#DP'#DPOOQO'#C{'#C{QVQPOOOsQPO'#CjO!RQPO'#CmOsQPO'#CtOsQPO,58xOOQO-E6y-E6yOOQO'#Ca'#CaOsQPO'#CaOOQO'#DQ'#DQO!iQPO,59UO#cQPO,59XO#kQPO'#DTO#xQPO,59`O$YQPO1G.dO%SQPO,58{OOQO'#Cg'#CgOsQPO,59lO%ZQPO1G.sOsQPO,59oO%eQPO1G.zOOQO1G.z1G.zO%uQPO1G.zOOQO1G.g1G.gOOQO1G/W1G/WO&PQPO7+$_OOQO7+$_7+$_O&ZQPO1G/ZOOQO7+$f7+$fO'QQPO7+$fO'QQPO7+$fOOQO<<Gy<<GyO'[QPO<<HQOOQO<<HQ<<HQOOQOAN=lAN=l",
  stateData: "'f~OrOS~ORPO_TO`TObUOcUOiVOjVO~OSWO~ORYOUYOVYOuZO~OU^O~OWdOXdOYdO[cO]dO~OR^a_^a`^ab^ac^ai^aj^ap^af^ag^am^an^a~P!WOdeOeeO~OSfOkfOlfO~P!WOfhOghOmiOniO~PVORQi_Qi`QibQicQiiQijQipQifQigQimQinQi~P!WOvjO~P!WOfmOgmO~PVOfoOgoOmpOnpO~PVOfoOgoO~PVOfrOgrO~PVORwi_wi`wibwicwifwigwiiwijwimwinwi~P!WOftOgtO~PVOfuOguO~PVO",
  goto: "#nxPPyPP!VPPPPP!aPPyPPyPPPPPPyPPPPPP!hPPP#O#[PP#keQOS`egilpqsY[TVWZfRkdZd]_abnQSOYXSglqsQg`QleQqiRspeROS`egilpqsQ]TQ_VQaWQbZRnfR`V",
  nodeNames: "⚠ Program Assignment Identifier Equal Term Number String Plus Minus Times XMul XMul Divide Print SCRIVI WRITE Loop RIPETI REPEAT VOLTE TIMES FINE END Conditional SE IF Greater Less ALTRIMENTI ELSE",
  maxTerm: 39,
  skippedNodes: [0],
  repeatNodeCount: 1,
  tokenData: "%t~RdXY!aYZ!a]^!apq!ars!rwx#axy#yyz$Oz{$T{|$Y}!O$_!P!Q$d!Q![$i![!]$d!^!_%S!_!`%X!`!a%^!c!}%c#R#S%c#T#o%c~!fSr~XY!aYZ!a]^!apq!a~!uTOr!rrs#Us;'S!r;'S;=`#Z<%lO!r~#ZOV~~#^P;=`<%l!r~#dTOw#awx#Ux;'S#a;'S;=`#s<%lO#a~#vP;=`<%l#a~$OOu~~$TOv~~$YOY~~$_OW~~$dOX~~$iO]~~$nQU~!O!P$t!Q![$i~$wP!Q![$z~%PPU~!Q![$z~%XOl~~%^OS~~%cOk~~%hSR~!Q![%c!c!}%c#R#S%c#T#o%c",
  tokenizers: [0],
  topRules: {"Program":[0,1]},
  specialized: [{term: 3, get: (value) => spec_Identifier[value] || -1}],
  tokenPrec: 0
})

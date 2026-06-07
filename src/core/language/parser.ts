// @ts-nocheck
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,x:24, SCRIVI:30, WRITE:32, RIPETI:38, REPEAT:40, VOLTE:42, TIMES:44, FINE:46, END:48, DA:52, FROM:54, A:56, TO:58, SE:62, IF:64, ALTRIMENTI:70, ELSE:72}
export const parser = LRParser.deserialize({
  version: 14,
  states: "'hQVQPOOOnQPO'#C^OOQO'#DW'#DWOOQO'#DR'#DRQVQPOOOsQPO'#CjO!RQPO'#CnOsQPO'#CzOsQPO,58xOOQO-E7P-E7POOQO'#Ca'#CaOsQPO'#CaOOQO'#DX'#DXO!rQPO,59UO#oQPO,59aO$^QPO,59YO$hQPO'#D[O$uQPO,59fO%VQPO1G.dO&PQPO,58{OOQO'#Cg'#CgOsQPO,59sOsQPO'#DSO&WQPO1G.pOsQPO1G.{O'RQPO1G.tOsQPO,59vO']QPO1G/QOOQO1G/Q1G/QO'mQPO1G/QOOQO1G.g1G.gOOQO1G/_1G/_O'wQPO,59nOOQO-E7Q-E7QO(tQPO7+$gO)OQPO7+$`OOQO7+$`7+$`O)YQPO1G/bOOQO7+$l7+$lO*PQPO7+$lO*PQPO7+$lOsQPO<<HROOQO<<Gz<<GzO*ZQPO<<HWOOQO<<HW<<HWO*eQPOAN=mOOQOAN=rAN=rO+OQPOG23XOOQOG23XG23XOOQOLD(sLD(s",
  stateData: "+Y~OyOS~ORPO_TO`TOcUOdUOoVOpVO~OSWO~ORYOUYOVYO|ZO~OR^OUYOVYO|ZO~OWeOXeOYeO[dO]eO~OafOR^a_^a`^ac^ad^ao^ap^aw^ag^ah^as^at^a~P!aOjhOkhOWTXXTXYTX[TX]TXeTXfTX~OeiOfiO~P!aOSjOqjOrjO~P!aOglOhlOsmOtmO~PVORQi_Qi`QicQidQioQipQiwQigQihQisQitQi~P!aO}nO~P!aOafOR^i_^i`^ic^id^io^ip^iw^ig^ih^is^it^i~OgtOhtO~PVOgvOhvOswOtwO~PVOgvOhvO~PVORva_va`vaavacvadvaovapvawvagvahvasvatva~P!aOlyOmyO~P!aOgzOhzO~PVOR!Oi_!Oi`!Oic!Oid!Oig!Oih!Oio!Oip!Ois!Oit!Oi~P!aOg|Oh|O~PVOg!OOh!OO~PVOWeOXeOYeO[dO]eOg!QOh!QO~PVOg!ROh!RO~PVO",
  goto: "$i!PPP!QPP!`PPPPP!nPP!QPPP!QPPPPPP!QPPPP!QPPPPPP!y#ePPP#k#yPP$fiQOSaikmswx{}!Pb[TUVWZfhjyRoece]_`bcpru}QSO[XSksx{!PQkaQsiQxmQ{wR!P}Qg]RqgiROSaikmswx{}!PQ]TQ_UQ`VQbWQcZQpfQrhQujR}yRaV",
  nodeNames: "⚠ Program Assignment Identifier Equal Term Number String Plus Minus Times XMul XMul Divide Print SCRIVI WRITE Comma CountLoop RIPETI REPEAT VOLTE TIMES FINE END RangeLoop DA FROM A TO Conditional SE IF Greater Less ALTRIMENTI ELSE",
  maxTerm: 46,
  skippedNodes: [0],
  repeatNodeCount: 2,
  tokenData: "%|~ReXY!dYZ!d]^!dpq!drs!uwx#dxy#|yz$Rz{$W{|$]|}$b}!O$g!P!Q$l!Q![$q![!]$l!^!_%[!_!`%a!`!a%f!c!}%k#R#S%k#T#o%k~!iSy~XY!dYZ!d]^!dpq!d~!xTOr!urs#Xs;'S!u;'S;=`#^<%lO!u~#^OV~~#aP;=`<%l!u~#gTOw#dwx#Xx;'S#d;'S;=`#v<%lO#d~#yP;=`<%l#d~$RO|~~$WO}~~$]OY~~$bOW~~$gOa~~$lOX~~$qO]~~$vQU~!O!P$|!Q![$q~%PP!Q![%S~%XPU~!Q![%S~%aOr~~%fOS~~%kOq~~%pSR~!Q![%k!c!}%k#R#S%k#T#o%k",
  tokenizers: [0],
  topRules: {"Program":[0,1]},
  dynamicPrecedences: {"25":1},
  specialized: [{term: 3, get: (value) => spec_Identifier[value] || -1}],
  tokenPrec: 0
})

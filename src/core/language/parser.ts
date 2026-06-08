// @ts-nocheck
import {LRParser} from "@lezer/lr"
const spec_Identifier = {__proto__:null,x:24, SCRIVI:30, WRITE:32, RIPETI:38, REPEAT:40, VOLTE:42, TIMES:44, FINE:46, END:48, DA:52, FROM:54, A:56, TO:58, SE:62, IF:64, PARI:70, EVEN:72, DISPARI:74, ODD:76, ALTRIMENTI:78, ELSE:80}
export const parser = LRParser.deserialize({
  version: 14,
  states: "'nQVQPOOOnQPO'#C^OOQO'#D['#D[OOQO'#DV'#DVQVQPOOOsQPO'#CjO!RQPO'#CnOsQPO'#CzOsQPO,58xOOQO-E7T-E7TOOQO'#Ca'#CaOsQPO'#CaOOQO'#D]'#D]O!rQPO,59UO#oQPO,59aO$^QPO,59YO$hQPO'#D`O%RQPO,59fO%cQPO1G.dO&]QPO,58{OOQO'#Cg'#CgOsQPO,59wOsQPO'#DWO&dQPO1G.pOsQPO1G.{O'_QPO1G.tOsQPO,59zOOQO,59z,59zO'iQPO1G/QOOQO1G/Q1G/QO'yQPO1G/QOOQO1G.g1G.gOOQO1G/c1G/cO(TQPO,59rOOQO-E7U-E7UO)QQPO7+$gO)[QPO7+$`OOQO7+$`7+$`O)fQPO1G/fOOQO7+$l7+$lO*]QPO7+$lO*]QPO7+$lOsQPO<<HROOQO<<Gz<<GzO*gQPO<<HWOOQO<<HW<<HWO*qQPOAN=mOOQOAN=rAN=rO+[QPOG23XOOQOG23XG23XOOQOLD(sLD(s",
  stateData: "+f~O}OS~ORPO_TO`TOcUOdUOoVOpVO~OSWO~ORYOUYOVYO!QZO~OR^OUYOVYO!QZO~OWeOXeOYeO[dO]eO~OafOR^a_^a`^ac^ad^ao^ap^a{^ag^ah^aw^ax^a~P!aOjhOkhOWTXXTXYTX[TX]TXeTXfTX~OeiOfiO~P!aOSjOqjOrjOskOtkOukOvkO~P!aOgmOhmOwnOxnO~PVORQi_Qi`QicQidQioQipQi{QigQihQiwQixQi~P!aO!RoO~P!aOafOR^i_^i`^ic^id^io^ip^i{^ig^ih^iw^ix^i~OguOhuO~PVOgwOhwOwxOxxO~PVOgwOhwO~PVORza_za`zaazaczadzaozapza{zagzahzawzaxza~P!aOlzOmzO~P!aOg{Oh{O~PVOR!Si_!Si`!Sic!Sid!Sig!Sih!Sio!Sip!Siw!Six!Si~P!aOg}Oh}O~PVOg!POh!PO~PVOWeOXeOYeO[dO]eOg!ROh!RO~PVOg!SOh!SO~PVO",
  goto: "$m!TPP!UPP!dPPPPP!rPP!UPPP!UPPPPPP!UPPPP!UPPPPPPPPPP!}#iPPP#o#}PP$jiQOSailntxy|!O!Qb[TUVWZfhjzRpece]_`bcqsv!OQSO[XSlty|!QQlaQtiQynQ|xR!Q!OQg]RrgiROSailntxy|!O!QQ]TQ_UQ`VQbWQcZQqfQshQvjR!OzRaV",
  nodeNames: "⚠ Program Assignment Identifier Equal Term Number String Plus Minus Times XMul XMul Divide Print SCRIVI WRITE Comma CountLoop RIPETI REPEAT VOLTE TIMES FINE END RangeLoop DA FROM A TO Conditional SE IF Greater Less PARI EVEN DISPARI ODD ALTRIMENTI ELSE",
  maxTerm: 50,
  skippedNodes: [0],
  repeatNodeCount: 2,
  tokenData: "%|~ReXY!dYZ!d]^!dpq!drs!uwx#dxy#|yz$Rz{$W{|$]|}$b}!O$g!P!Q$l!Q![$q![!]$l!^!_%[!_!`%a!`!a%f!c!}%k#R#S%k#T#o%k~!iS}~XY!dYZ!d]^!dpq!d~!xTOr!urs#Xs;'S!u;'S;=`#^<%lO!u~#^OV~~#aP;=`<%l!u~#gTOw#dwx#Xx;'S#d;'S;=`#v<%lO#d~#yP;=`<%l#d~$RO!Q~~$WO!R~~$]OY~~$bOW~~$gOa~~$lOX~~$qO]~~$vQU~!O!P$|!Q![$q~%PP!Q![%S~%XPU~!Q![%S~%aOr~~%fOS~~%kOq~~%pSR~!Q![%k!c!}%k#R#S%k#T#o%k",
  tokenizers: [0],
  topRules: {"Program":[0,1]},
  dynamicPrecedences: {"25":1},
  specialized: [{term: 3, get: (value) => spec_Identifier[value] || -1}],
  tokenPrec: 0
})

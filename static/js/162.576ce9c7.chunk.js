!function(){"use strict";var e={2162:function(e,n,a){var r=a(1413),o=a(4165),t=a(5861),l=a(2982),s=a(7762),d=a(7786),i=a(3144),c=a(5671),u=a(136),f=a(9388),B=new(function(e){(0,u.Z)(a,e);var n=(0,f.Z)(a);function a(){var e;return(0,c.Z)(this,a),(e=n.call(this,"colors")).data=void 0,e.gallery=void 0,e.version(2).stores({colors:"[collection+name+hex], collection, name, hex, owned, *bases"}),e.version(3).stores({data:"id"}),e.version(4).stores({data:"id",gallery:"++id"}),e}return(0,i.Z)(a)}(a(1447).default)),y=a(8792),b=a(6847),h=a(8100),G=a(9899),g=a.n(G),p=g().Root,w=g().Type,L=g().Field,m=new w("LabMessage").add(new L("mode",1,"string")).add(new L("l",2,"float")).add(new L("a",3,"float")).add(new L("b",4,"float")),k=new w("ColorMessage").add(new L("collection",8,"string")).add(new L("name",9,"string")).add(new L("hex",10,"string")).add(new L("color",11,"LabMessage")).add(new L("H",12,"int32")).add(new L("S",13,"int32")).add(new L("V",14,"int32")).add(new L("owned",15,"bool")).add(new L("bases",16,"int32","repeated")).add(new L("ratio",18,"float")).add(new L("minDelta",19,"int32")),v=new w("ColorsMessage").add(new L("colors",17,"ColorMessage","repeated")),S=((new p).define("ColorAssistant").add(m).add(k).add(v),self),C=y.bb(),F=[],D={farMixPenalty:.1},O=function(e,n,a,r){var o=b.EYs(a),t=b.mCF(o);return{collection:e,name:n,hex:a,color:o,H:Math.round(t.h||0),S:Math.round(100*t.s),V:Math.round(100*t.v),owned:r}},M=function(){var e,n=F.filter((function(e){return!e.bases||0===e.bases.length})),a=(0,s.Z)(n);try{var r=function(){var n=e.value,a=F.filter((function(e){return e!==n&&e.owned})).map((function(e){var a=Math.round(C(n.color,e.color));if(e.bases&&0!==e.bases.length){var r=C(F[e.bases[0]].color,F[e.bases[1]].color);return a+D.farMixPenalty*r}return a}));n.minDelta=Math.min.apply(Math,(0,l.Z)(a))};for(a.s();!(e=a.n()).done;)r()}catch(o){a.e(o)}finally{a.f()}},R=function(e,n){return n.split("\n").filter((function(e){return e})).map((function(n){var a=n.substring(n.indexOf("#")),r=n.substring(0,n.indexOf("#")-1);return O(e,r,a,!1)}))};(0,t.Z)((0,o.Z)().mark((function e(){var n,a,r,t;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,B.data.get("colors");case 2:if(!(n=e.sent)){e.next=9;break}a=new Uint8Array(n.data),S.postMessage({type:"colorsUpdated",data:a},[a.buffer]);try{F=v.decode(n.data).colors}catch(o){console.log(o)}if(!(F&&F.length>0)){e.next=9;break}return e.abrupt("return");case 9:return console.log("Starting generation"),F=[],r=[],R("Vallejo Game Colors","Dead White #ffffff\nPale Flesh #f6bdb3\nElf Skintone #f8a070\nMoon Yellow #fff103\nSun Yellow #ffcf07\nGold Yellow #fdb318\nOrange Fire #f1652e\nHot Orange #e43027\nBloody Red #bf282e\nGory Red #810504\nScarlet Red #741330\nSquid Pink #da7fb5\nWarlord Purple #7d1a44\nHexed Lichen #34274d\nRoyal Purple #23264f\nDark Blue #2b265d\nStormy Night #1f1a4f\nNight Blue #19183f\nImperial Purple #211a4b\nMagic Blue #024381\nUltramarine Blue #373592\nElectric Blue #008cbf\nTurquoise #03676f\nFoul Green #239378\nJade Green #128379\nScurvy Green #09474e\nDark Green #083c2a\nSick Green #096638\nGoblin Green #23743c\nCamoflage Green #71753a\nScorpion Green #48b851\nLivery Green #9ece65\nBone White #e8be86\nDead Flesh #bcb686\nBronze Fleshtone #db945c\nFilthy Brown #f58d2b\nScrofulous Brown #d68030\nPlague Brown #cc9b34\nLeather Brown #7b5d2a\nDwarf Skin #cc7c67\nParasite Brown #b1481f\nBeasty Brown #55432d\nDark Fleshtone #4f2b26\nCharred Brown #39343b\nGhost Grey #a7c5db\nWolf Grey #90a2bc\nSombre Grey #4c5c7d\nStonewall Grey #828e95\nCold Grey #54646d\nBlack #000000\nKhaki #8c806d\nEarth #6f563d\nDesert Yellow #8e7845\nYellow Olive #063b2f\nTerracota #6b1306\nTan #9f4746\nCayman Green #285648\nSmokey Ink #2b2325\nGlacier Blue #acd0ee\nVerdigris #b3ceca\nPale Yellow #d5c179\nElfic Flesh #cdc29c\nCadmium Skin #fab78a\nRosy Flesh #f89e84\nOffwhite #f5f4da\nSteel Grey #64889d\nFluo Yellow #eeea50\nFluo Green #9dcd64\nMutation Green #296934\nScarletBlood Red #b72a38\nHeavy Skintone #aa7b62\nHeavy Red #943238\nHeavy Violet #4c2e65\nHeavy Blue #29556d\nHeavy Blue Grey #9ca7a7\nHeavy Grey #626d54\nHeavy Green #566840\nHeavy Black Green #18433d\nHeavy Warm Grey #939066\nHeavy Khaki #9d965d\nHeavy Ochre #a87536\nHeavy Gold Brown #ba8636\nHeavy Orange #ee5527\nHeavy Brown #705d41\nHeavy Sienna #744642\nHeavy Charcoal #1c2e2e\n").forEach((function(e){return r.push(e)})),R("Vallejo Model Colors","Sunset Red #c22c5f\nBrown Rose #cf8774\nBeige Red #c79166\nGerman Orange #f05426\nGerman Yellow #e8e589\nOxford Blue #3a465f\nBlue Green #1a9496\nRoyal Blue #41558d\nRoyal Purple #4b2967\nBlue Violet #795c9a\nViolet Red #6b2946\nBurnt Cadmium Red #623535\nBasic Skintone #fbbc8c\nLuftwaffe Uniform WW2 #3d474f\nScarlet #da3630\nRed Leather #93453d\nIraqi Sand #b89972\nOffwhite #efeee2\nGerman Cam. Beige WW2 #9c8d70\nGerman Cam. Black Brown #5b3528\nLuftwaffe Cam. Green #596b3f\nGerman Cam. Orange Ochre #9d7e55\nGerman Cam. Pale Brown #82685e\nGerman Cam. Medium Brown #722b2f\nLime Green #6fae4e\nAmaranth Red #cc4338\nGerman Field Grey WW2 #595748\nGerman Cam. Bright Green #528944\nSalmon Rose #f89d87\nLondon Grey #4a555e\nPale Sand #d1c49c\nEmerald #00906a\nUltramarine #3b5da7\nLight Turquoise #0094a5\nAndrea Blue #008dc9\nCork Brown #a57b63\nDeep Sky Blue #00a6da\nSunny Skintone #f4b171\nMahogany Brown #804b47\nDark Sand #d6b779\nMedium Olive #226b2e\nBright Orange #f26833\nOchre Brown #a77237\nGolden Olive #78923b\nIce Yellow #feef87\nBlack Red [Cadmium Brown] #5f2e39\nMedium Fleshtone #c08245\nGlossy Black #010101\nBlack Grey #2d373a\nGrey Green #565a60\nDark Sea Green #2f4844\nBasalt Grey #576860\nMedium Sea Grey #869393\nLeather Brown #4a4639\nChocolate Brown #5f5047\nUS Field Drab #705d43\nTan Earth #9c7962\nBeige Brown #78584a\nBrown Sand #b08064\nGold Brown #ba8636\nGreen Brown #8d7b55\nKhaki Grey #8b7f5d\nYellow Green 1 #91864b\nMiddlestone #9c9660\nSilver Grey #d8dfd5\nStone Grey #959980\nPastel Green #a4bb99\nGreen Grey #827e61\nBrown Violet #4e5d4d\nOlive Grey #39584f\nUSA Olive Drab #3b4947\nReflective Green #496244\nIntermediate Green #49944f\nYellow Olive #26392e\nUS Dark Green #5b6955\nCam. Olive Green #3c5549\nGunship Green #3d685e\nGerman Cam. Extra Dark Green #30504a\nBronce Green #2a534f\nDark Sea Blue #2a4048\nDark Prussian Blue #192c43\nFrench Mirage Blue #557880\nPastel Blue #67859b\nAzure #717cad\nIntermediate Blue #607a80\nDark Blue Grey #5c7476\nBlue Grey Pale #9ea7a5\nPale Blue #83b5b2\nPale Grey Blue #bacdd0\nCarmine Red #b73035\nVermillion #d22b2d\nOrange Red #e34c26\nLight Orange #f68627\nTan Yellow #b5915d\nYellow Ochre #c19448\nGreen Ochre #a98969\nDeep Yellow #ffe30c\nSand Yellow #d7bf75\nBeige #dbc58e\nIvory #eff1d9\nGerman Uniform #286254\nEnglish Uniform #715833\nUniform Green #577a38\nJapan Uniform WW2 #998546\nRussian Uniform WW2 #606d53\nBlue #043667\nRed #91323a\nDark Flesh #d9a262\nLight Flesh #feedd0\nLight Brown #bf764e\nDark Blue #0d5a86\nSaddle Brown #89584f\nBurnt Umber #665148\nLight Green #00a850\nGrey Blue #45708d\nOld Rose #d47b7d\nMagenta #a92a56\nDark Red #a24a46\nGolden Yellow #f7c65e\nLight Yellow #f7ea62\nBlack #252b31\nWhite #ffffff\nLemon Yellow #fef10e\nFlat Yellow #ffcd25\nYellow Green 2 #d9e02a\nFlat Flesh #d8a977\nClear Orange #f1552c\nFlat Red #aa3037\nPink #d37497\nPurple #834a6c\nViolet #4b2f65\nSky Blue #86d6f7\nFlat Blue #336991\nMedium Blue #066588\nField Blue #436872\nPrussian Blue #2a546e\nTurquoise #008e9c\nOlive Green #6a8b3a\nFlat Green #2a6531\nPark Green Flat #008c5d\nDeep Green #0a6b48\nGrey Grey #aecbbb\nLight Green Blue #6d9a95\nLight Sea Grey #97b4b5\nGreen Sky #59ad84\nMilitary Green #3e5848\nBuff #d2ca9f\nDesert Yellow #b19151\nDark Yellow #9d9059\nGerman Cam. Dark Green #2f4845\nBlack Green #19423e\nOrange Brown #b86f44\nCavalry Brown #853f3d\nFlat Earth #87643c\nFlat Brown #764841\nHull Red #522724\nDeck Tan #bec5b3\nMedium Grey #909b85\nKhaki #969163\nSky Grey #b3b6b2\nLight Grey #949c9a\nDark Sea Grey #787d7a\nNeutral Grey #64767a\nWhite Grey #eef1ec\nDark Grey #233e3d\nGerman Grey #192f30\n").forEach((function(e){return r.push(e)})),R("Citadel","Ceramite White Base Layer #ffffff\nWhite Scar Base Layer #ffffff\nAverland Sunset Base Layer #fbba00\nYriel Yellow Base Layer #ffda00\nFlash Gitz Yellow Base Layer #ffee00\nJokaero Orange Base Layer #e6200f\nTroll Slayer Orange Base Layer #eb641b\nFire Dragon Bright Base Layer #f1844a\nMephiston Red Base Layer #9b0e05\nEvil Suns Scarlet Base Layer #c00b0c\nWild Rider Red Base Layer #e21516\nKhorne Red Base Layer #6a0a01\nWazdakka Red Base Layer #8d0d01\nSquig Orange Base Layer #b04d3e\nScreamer Pink Base Layer #831740\nPink Horror Base Layer #96325c\nEmperors Children Base Layer #bd3f75\nNaggaroth Night Base Layer #433656\nXereus Purple Base Layer #4b205c\nGenestealer Purple Base Layer #7c5ca4\nDaemonette Hide Base Layer #696685\nWarpfiend Grey Base Layer #6B6A74\nSlaanesh Grey Base Layer #8E8C97\nKantor Blue Base Layer #06234f\nAlaitoc Blue Base Layer #2e5689\nHoeth Blue Base Layer #4f7fb5\nMacragge Blue Base Layer #14397a\nAltdorf Guard Blue Base Layer #274b9b\nCalgar Blue Base Layer #456eb5\nCaledor Sky Base Layer #38689c\nTeclis Blue Base Layer #387bbf\nLothern Blue Base Layer #3ba1d1\nThousand Sons Blue Base Layer #18ABCC\nAhriman Blue Base Layer #1F8C9C\nThe Fang Base Layer #457479\nRuss Grey Base Layer #55768a\nFenrisian Grey Base Layer #789ebb\nStegadon Scale Green Base Layer #004261\nSotek Green Base Layer #056976\nTemple Guard Blue Base Layer #35998e\nThunderhawk Blue Base Layer #417074\nIncubi Darkness Base Layer #094345\nKabalite Green Base Layer #008660\nSybarite Green Base Layer #36a062\nCaliban Green Base Layer #003b1d\nWarpstone Glow Base Layer #257326\nMoot Green Base Layer #57aa2d\nWaaagh! Flesh Base Layer #275627\nWarboss Green Base Layer #3b7d54\nSkarsnik Green Base Layer #5e9067\nCastellan Green Base Layer #384d20\nDeath World Forest Base Layer #666c2d\nLoren Forest Base Layer #5b7426\nStraken Green Base Layer #6e8611\nNurgling Green Base Layer #90a15f\nElysian Green Base Layer #81932e\nOgryn Camo Base Layer #a9af42\nZandri Dust Base Layer #a89758\nUshabti Bone Base Layer #c6c180\nScreaming Skull Base Layer #d9d8a6\nFlayed One Flesh Base Layer #f3ca8a\nSteel Legion Drab Base Layer #695634\nTallarn Sand Base Layer #ab7d00\nKarak Stone Base Layer #c1a069\nBugmans Glow Base Layer #8c5144\nCadian Fleshtone Base Layer #cb7953\nKislev Flesh Base Layer #dbad75\nRatskin Flesh Base Layer #AD6B4C\nBestigor Flesh Base Layer #D38A57\nUngor Flesh Base Layer #dbac63\nMournfang Brown Base Layer #681104\nSkrag Brown Base Layer #954b00\nDeathclaw Brown Base Layer #ba6952\nXV-88 Base Layer #7b4d1c\nTau Light Ochre Base Layer #c26e02\nBalor Brown Base Layer #915e02\nZamesi Desert Base Layer #e0a503\nRhinox Hide Base Layer #4e3433\nDoombull Brown Base Layer #5e0605\nTuskgor Fur Base Layer #8e3734\nDryad Bark Base Layer #3b342e\nGorthor Brown Base Layer #6e4e46\nBaneblade Brown Base Layer #99826b\nMechanicus Standard Grey Base Layer #454e50\nDawnstone Base Layer #7b7e74\nAdministratum Grey Base Layer #9da299\nCelestra Grey Base Layer #9caeae\nUlthuan Grey Base Layer #d2e4df\nRakarth Flesh Base Layer #aba495\nPallid Wych Flesh Base Layer #d6d5c4\nAbaddon Black Base Layer #010100\nEshin Grey Base Layer #535659\nSkavenblight Dinge Base Layer #4f4840\nStormvermin Fur Base Layer #7d736a\nDark Reaper Base Layer #3B5150\nDeath Guard Armor Base Layer #848A66\nBaharroth Blue Edge #58C1CD\nBlue Horror Edge #A2BAD2\nDechala Lilac Edge #B69FCC\nDorn Yellow Edge #FFF200\nFulgrim Pink Edge #F4AFCD\nGauss Blaster Green Edge #84C3AA\nKrieg Khaki Edge #C0BD81\nLugganath Orange Edge #F79E86\n").forEach((function(e){return r.push(e)})),R("Army Painter","Army Painter #231f20\nMatt White #ffffff\nPure Red #cf2127\nDragon Red #9a1b1e\nLava Orange #e65525\nDaemonic Yellow #fada06\nNecrotic Flesh #bfc292\nGoblin Green #348941\nArmy Green #6e7645\nGreenskin #136232\nAngel Green #0c391d\nElectric Blue #508cbe\nCrystal Blue #0083c2\nUltramarine Blue #0f4e85\nDeep Blue #083251\nAsh Grey #a2a5a4\nUniform Grey #5e6a73\nWolf Grey #5b8093\nMonster Brown #855c2a\nDesert Yellow #c7952c\nFur Brown #a14322\nLeather Brown #764823\nOak Brown #432010\nSkeleton Bone #d3c89d\nBarbarian Flesh #e89c6c\nTanned Flesh #bc745e\nAlien Purple #50317b\nHydra Turquoise #199ba3\nChaotic Red #6c1e10\nAbomination Gore #6c1e10\nArid Earth #faecc3\nBabe Blonde #f8dd0d\nBanshee Brown #c3b097\nBasilisk Brown #cd8315\nBrainmatter Beige #f1f0e0\nCastle Grey #f1f0e0\nCentaur Skin #deaba0\nCombat Fatigue #878e5c\nCommando Green #827b39\nCorpse Pale #edccad\nCrusted Sore #611624\nCrypt Wraith #606050\nCultist Robe #756e60\nDark Sky #2b4b5f\nDirt Spatter #5e3827\nDrake Tooth #cfcbb4\nDungeon Grey #686c71\nElemental Bolt #009a82\nElf Green #495122\nElven Flesh #495122\nOrc Blood #925f6e\nFilthy Cape #7c7863\nDark Stone #605752\nFire Lizard #d67128\nFog Grey #6c8fac\nGorgon Hide #c7d2e4\nGriffon Blue #215383\nHardened Carapace #4c473f\nHemp Rope #94763a\nIce Storm #639ec9\nJungle Green #88ac2e\nKobold Skin #c9a484\nKraken Skin #71c591\nMars Red #b73b37\nToxic Mist #39c0c5\nMoon Dust #e8d468\nMouldy Clothes #447b3a\nMummy Robes #ebded5\nMutant Hue #a58084\nMythical Orange #e73d24\nNecromance Cloak #3c3d37\nGrimoire Purple #805259\nOozing Purple #aa94b4\nPhoenix Flames #faa61a\nPixie Pink #d47a83\nPoisonous Cloud #cdde4a\nRoyal Cloak #15999c\nScaly Hide #859852\nWarlock Purple #bb5b64\nVoidshield Blue #2ca2d9\nSnake Scales #8ab239\nSpaceship Exterior #cdced0\nStone Golem #b9bab7\nSulphide Ochre #c68512\nToxic Boils #a67284\nTroglodyte Blue #0889ba\nTroll Claws #cb8b4e\nVampire Red #981d34\nVenom Wyrm #6a653e\nViking Blue #00609a\nWasteland Soil #774b58\nWerewolf Fur #785e4e\nWitch Brew #92963e\nWizards Orb #00726a\nScar Tissue #ca8772\nField Grey #787c78").forEach((function(e){return r.push(e)})),r.forEach((function(e){return F.push(e)})),S.postMessage({type:"progressUpdate",value:95}),console.log("Saving colors",F.length),t=v.encode({colors:F}).finish(),e.next=22,B.data.put({id:"colors",data:t});case 22:console.log("Saved colors"),S.postMessage({type:"progressUpdate",value:100}),S.postMessage({type:"colorsUpdated",data:t},[t.buffer]);case 25:case"end":return e.stop()}}),e)})))(),onmessage=function(){var e=(0,t.Z)((0,o.Z)().mark((function e(n){var a,t,l,s,i,c,u;return(0,o.Z)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=n.data,e.t0=a.type,e.next="getColors"===e.t0?4:"updateDeltaOptions"===e.t0?10:"updateOwned"===e.t0?20:30;break;case 4:return t=v.encode({colors:F}).finish(),e.next=7,B.data.put({id:"colors",data:t});case 7:return l=new Uint8Array(t),S.postMessage({type:"colorsUpdated",data:l},[l.buffer]),e.abrupt("break",30);case 10:if(F&&0!==F.length){e.next=12;break}return e.abrupt("return");case 12:return D=a.deltaOptions,M(),s=v.encode({colors:F}).finish(),e.next=17,B.data.put({id:"colors",data:s});case 17:return i=new Uint8Array(s),S.postMessage({type:"colorsUpdated",data:i},[i.buffer]),e.abrupt("break",30);case 20:return S.postMessage({type:"progressUpdate",value:0}),a.colors.forEach((function(e){var n=F.findIndex((function(n){return n.collection===e.collection&&n.name===e.name&&n.hex===e.hex}));if(F[n].owned!==e.owned)if(F[n].owned=e.owned,F[n].owned){var a=[];F.forEach((function(e,o){var t;if(n!==o&&e.owned&&!((null===(t=e.bases)||void 0===t?void 0:t.length)>0))for(var l=0,s=[.25,.5,.75];l<s.length;l++){var i=s[l],c=d.Z.lerp(F[n].hex,e.hex,i),u=h.t5({mode:"rgb",r:c[0]/255,g:c[1]/255,b:c[2]/255}),f=O(null,null,u,!0);a.push((0,r.Z)((0,r.Z)({},f),{},{bases:[n,o],ratio:i}))}})),F=F.concat(a)}else F=F.filter((function(e){return!e.bases||e.bases.every((function(e){return e!==n}))}));else S.postMessage({type:"progressUpdate",value:100})})),M(),c=v.encode({colors:F}).finish(),e.next=26,B.data.put({id:"colors",data:c});case 26:return u=new Uint8Array(c),S.postMessage({type:"colorsUpdated",data:u},[u.buffer]),S.postMessage({type:"progressUpdate",value:100}),e.abrupt("break",30);case 30:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}()}},n={};function a(r){var o=n[r];if(void 0!==o)return o.exports;var t=n[r]={exports:{}};return e[r].call(t.exports,t,t.exports,a),t.exports}a.m=e,a.x=function(){var e=a.O(void 0,[893,871],(function(){return a(2162)}));return e=a.O(e)},function(){var e=[];a.O=function(n,r,o,t){if(!r){var l=1/0;for(c=0;c<e.length;c++){r=e[c][0],o=e[c][1],t=e[c][2];for(var s=!0,d=0;d<r.length;d++)(!1&t||l>=t)&&Object.keys(a.O).every((function(e){return a.O[e](r[d])}))?r.splice(d--,1):(s=!1,t<l&&(l=t));if(s){e.splice(c--,1);var i=o();void 0!==i&&(n=i)}}return n}t=t||0;for(var c=e.length;c>0&&e[c-1][2]>t;c--)e[c]=e[c-1];e[c]=[r,o,t]}}(),a.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return a.d(n,{a:n}),n},a.d=function(e,n){for(var r in n)a.o(n,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:n[r]})},a.f={},a.e=function(e){return Promise.all(Object.keys(a.f).reduce((function(n,r){return a.f[r](e,n),n}),[]))},a.u=function(e){return"static/js/"+e+"."+{871:"2288e62f",893:"007344e1"}[e]+".chunk.js"},a.miniCssF=function(e){},a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}(),a.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},a.p="/ColorAssistant/",function(){var e={162:1};a.f.i=function(n,r){e[n]||importScripts(a.p+a.u(n))};var n=self.webpackChunkcolor_assistant=self.webpackChunkcolor_assistant||[],r=n.push.bind(n);n.push=function(n){var o=n[0],t=n[1],l=n[2];for(var s in t)a.o(t,s)&&(a.m[s]=t[s]);for(l&&l(a);o.length;)e[o.pop()]=1;r(n)}}(),function(){var e=a.x;a.x=function(){return Promise.all([a.e(893),a.e(871)]).then(e)}}();a.x()}();
//# sourceMappingURL=162.576ce9c7.chunk.js.map
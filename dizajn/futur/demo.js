(function(){
var root=document.getElementById('demo'); if(!root) return;
var scr=root.querySelector('.ph-screen'), nav=root.querySelector('.ph-nav'), host=root.querySelector('.house');
var CFG=JSON.parse(document.getElementById('kuca3d-cfg').textContent);

/* ---------- stanje (sve u pregledniku) ---------- */
var S={}, card=null;
function set(id,state,attr){var o=S[id]||{attributes:{}};S[id]={entity_id:id,state:state,attributes:Object.assign({},o.attributes,{friendly_name:id},attr||{}),last_changed:new Date().toISOString()};}
var LIGHTS=[
 ['light.dnevni','Strop dnevni','p','dnevni',1,0],['light.blagovaonica','Blagovaonica','p','dnevni',1,0],['light.traka_tv','TV traka','p','dnevni',1,1],
 ['light.kuhinja','Kuhinja','p','kuhinja',0,0],['light.traka_ormar','Traka ormar','p','kuhinja',0,1],['light.holl','Ulaz','p','holl',0,0],
 ['light.kupaonica','Kupaonica','p','kup',0,0],['light.ured','Ured','p','ured',1,0],
 ['light.hodnik','Hodnik','k','hodnik',0,0],['light.toni','Soba 1','k','toni',1,0],['light.ana','Soba 2','k','ana',1,0],
 ['light.mz','Spavaća soba','k','mz',1,0],['light.traka_mz_krevet','Traka uz krevet','k','mz',1,1],['light.jopa','Soba 3','k','jopa',1,0],
 ['light.kupaonica_kat','Kupaonica kat','k','kup',0,0]];
var LN={};LIGHTS.forEach(function(l){LN[l[0]]=l;});
var COVERS=[['cover.dnevni_l','Dnevni boravak lijeva'],['cover.dnevni_d','Dnevni boravak desna'],['cover.kuhinja','Kuhinja'],['cover.toni','Soba 1'],['cover.ana','Soba 2'],['cover.mz','Spavaća soba'],['cover.balkon','Balkon']];
var WIN=[['binary_sensor.vrata_ulaz','Ulazna vrata'],['binary_sensor.dnevni_d_prozor','Terasa'],['binary_sensor.kuhinja_prozor','Kuhinja'],['binary_sensor.toni_prozor','Soba 1'],['binary_sensor.ana_prozor','Soba 2'],['binary_sensor.mz_prozor','Spavaća soba'],['binary_sensor.balkon_prozor','Balkon'],['binary_sensor.jopa_prozor','Soba 3'],['binary_sensor.kupaonica_kat_prozor','Kupaonica kat'],['binary_sensor.kupaonica_prozor','Kupaonica']];
var ROOMS=[
 {k:'dnevni',n:'Dnevni boravak',l:['light.dnevni','light.blagovaonica','light.traka_tv'],c:'cover.dnevni_l',t:'dnevni'},
 {k:'kuhinja',n:'Kuhinja',l:['light.kuhinja','light.traka_ormar'],c:'cover.kuhinja',t:'dnevni'},
 {k:'ured',n:'Ured',l:['light.ured'],t:'ured'},
 {k:'toni',n:'Soba 1',l:['light.toni'],c:'cover.toni',t:'toni'},
 {k:'ana',n:'Soba 2',l:['light.ana'],c:'cover.ana',t:'ana'},
 {k:'mz',n:'Spavaća soba',l:['light.mz','light.traka_mz_krevet'],c:'cover.mz',t:'mz'},
 {k:'jopa',n:'Soba 3',l:['light.jopa'],t:'jopa'},
 {k:'kup',n:'Kupaonice',l:['light.kupaonica','light.kupaonica_kat'],t:'kupaonica'}];
var TN={dnevni:'Dnevni boravak',kupaonica:'Kupaonica',ured:'Ured',toni:'Soba 1',ana:'Soba 2',mz:'Spavaća soba',jopa:'Soba 3',kupaonica_kat:'Kupaonica kat'};
var CUR={dnevni:22.0,kupaonica:22.6,ured:21.4,toni:21.2,ana:22.2,mz:22.8,jopa:20.9,kupaonica_kat:22.3},TGT={dnevni:22,kupaonica:23,ured:21.5,toni:21.5,ana:21.5,mz:21,jopa:21.5,kupaonica_kat:23};
var heat=true, alarm='off', scene='', sun='below_horizon', room='dnevni', tab='home', sub='', zone=0, play=false, vol=42, water=-1, wleft=0, cam=0;

function on(id){return S[id]&&S[id].state==='on';}
function pct(id){return S[id]&&S[id].attributes.brightness?Math.round(S[id].attributes.brightness/2.55):0;}
function light(id,v,p,rgb){var a={brightness:v?Math.round((p||pct(id)||100)*2.55):0};if(rgb)a.rgb_color=rgb,a.color_mode='rgb';else if(v){a.rgb_color=null;a.color_mode='brightness';}set(id,v?'on':'off',a);}
function pos(id){return S[id]?S[id].attributes.current_position:0;}
var MV={};
function moveCover(id,to){clearInterval(MV[id]);if(to==null)return;MV[id]=setInterval(function(){var p=pos(id),d=to>p?10:-10;if(Math.abs(to-p)<=10){p=to;clearInterval(MV[id]);}else p+=d;set(id,p>0?'open':'closed',{current_position:p});push();},120);}
function temps(){for(var k in CUR){var d=heat?(TGT[k]-CUR[k])*.02:(19-CUR[k])*.01;CUR[k]=Math.round((CUR[k]+d)*100)/100;set('sensor.'+k+'_temperatura',CUR[k].toFixed(1),{unit_of_measurement:'°C'});}}

function init(){
 set('sun.sun',sun);
 LIGHTS.forEach(function(l){light(l[0],false);});
 COVERS.forEach(function(c){set(c[0],'open',{current_position:100});});
 set('cover.zavjesa_dnevni','open',{current_position:30});
 WIN.forEach(function(w){set(w[0],'off');});
 temps(); applyScene('vecer',true);
}

/* ---------- scene ---------- */
function applyScene(k,quiet){scene=k;
 var L={},C={};
 if(k==='dan'){sun='above_horizon';COVERS.forEach(function(c){C[c[0]]=100;});}
 if(k==='vecer'){sun='below_horizon';L={'light.dnevni':70,'light.blagovaonica':80,'light.kuhinja':100,'light.holl':100,'light.hodnik':60,'light.traka_tv':40,'light.ana':50};C={'cover.toni':0,'cover.mz':0};}
 if(k==='film'){sun='below_horizon';L={'light.traka_tv':[25,[110,80,255]]};C={'cover.dnevni_l':0,'cover.dnevni_d':0,'cover.kuhinja':0};}
 if(k==='tv'){sun='below_horizon';L={'light.dnevni':25,'light.traka_tv':60};}
 if(k==='rom'){sun='below_horizon';L={'light.dnevni':[20],'light.traka_tv':[50,[255,70,120]],'light.blagovaonica':[30,[255,150,90]]};}
 if(k==='max'){LIGHTS.forEach(function(l){L[l[0]]=100;});}
 if(k==='noc'){sun='below_horizon';COVERS.forEach(function(c){C[c[0]]=0;});alarm='night';}
 if(k==='van'){COVERS.forEach(function(c){C[c[0]]=0;});alarm='on';}
 if(k!=='noc'&&k!=='van'&&k!=='max'&&alarm!=='off'&&k!=='dan'){}
 set('sun.sun',sun);
 LIGHTS.forEach(function(l){var v=L[l[0]];if(v==null){light(l[0],false);return;}var p=v.length?v[0]:v,rgb=v.length?v[1]:null;light(l[0],true,p,rgb);});
 for(var id in C)moveCover(id,C[id]);
 if(!quiet)push();
}

/* ---------- veza s 3D kućom ---------- */
function callService(domain,service,data){
 [].concat(data.entity_id||[]).forEach(function(id){
  if(domain==='light'){var v=service==='turn_off'?false:service==='toggle'?!on(id):true;light(id,v,data.brightness_pct,data.rgb_color);scene='';}
  if(domain==='cover'){if(service==='open_cover')moveCover(id,100);else if(service==='close_cover')moveCover(id,0);else if(service==='stop_cover')moveCover(id,null);else if(data.position!=null)moveCover(id,data.position);}
 });push();}
var raf=0;
var cardT=0,cardLast=0;function toCard(){cardT=0;cardLast=Date.now();if(card)card.hass={states:Object.assign({},S),callService:callService};}
function push(noRender){if(card&&!cardT)cardT=setTimeout(toCard,Math.max(0,140-(Date.now()-cardLast)));if(!noRender&&!raf)raf=requestAnimationFrame(function(){raf=0;render();});}

/* ---------- ikone ---------- */
var IP={home:'M3 11l9-7 9 7v9h-6v-6H9v6H3z',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z',
 music:'M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',dots:'M5 5h2v2H5zM11 5h2v2h-2zM17 5h2v2h-2zM5 11h2v2H5zM11 11h2v2h-2zM17 11h2v2h-2zM5 17h2v2H5zM11 17h2v2h-2zM17 17h2v2h-2z',
 blind:'M4 4h16M5 4v4h14V4M5 8v3h14V8M5 11v3h14v-3M12 14v4',therm:'M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z',cam:'M3 7h12v10H3zM15 10l6-3v10l-6-3',
 shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',drop:'M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z',bolt:'M13 2L4 14h7l-1 8 9-12h-7z',
 sun:'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1',
 moon:'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z',film:'M3 5h18v14H3zM7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4',heart:'M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z',
 tv:'M3 6h18v12H3zM8 21h8',up:'M12 19V5M5 12l7-7 7 7',down:'M12 5v14M5 12l7 7 7-7',stop:'M7 7h10v10H7z',play:'M7 4l13 8-13 8z',pause:'M7 4h4v16H7zM13 4h4v16h-4z',
 prev:'M19 5L9 12l10 7zM5 5v14',next:'M5 5l10 7-10 7zM19 5v14',back:'M15 18l-6-6 6-6',door:'M6 3h12v18H6zM14 12h1',lock:'M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4',
 key:'M15 7a4 4 0 1 1-3.9 5H3v3h3v-3',power:'M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0',vacation:'M3 21h18M5 21V10l7-5 7 5v11',phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z',
 star:'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z'};
function I(n){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+IP[n]+'"/></svg>';}
function sw(id,state,label){return '<button class="sw'+(state?' on':'')+'" data-act="'+id+'" role="switch" aria-checked="'+state+'" aria-label="'+label+'"><i></i></button>';}
function hhmm(){var d=new Date();return d.toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'});}
function head(t,sm,back){return '<div class="ph-h">'+(back?'<button class="ph-back" data-go="more" aria-label="Natrag">'+I('back')+'</button>':'')+'<div><b>'+t+'</b><small>'+sm+'</small></div><span class="ph-t">'+hhmm()+'</span></div>';}
function nOn(f){return LIGHTS.filter(function(l){return (!f||l[2]===f)&&on(l[0]);}).length;}
function openWins(){return WIN.filter(function(w){return on(w[0]);});}
function watts(){var w=140;LIGHTS.forEach(function(l){if(on(l[0]))w+=Math.round(6+pct(l[0])*.14);});if(heat)w+=620;if(play)w+=25;if(water>=0)w+=90;return w;}
function fmt(n,d){return n.toFixed(d==null?1:d).replace('.',',');}
function alarmTxt(){return alarm==='on'?'Uključen':alarm==='night'?'Noćni način':'Isključen';}
function scenes(list){return '<div class="ph-scenes">'+list.map(function(s){return '<button data-scene="'+s[0]+'" class="'+(scene===s[0]?'on':'')+'">'+I(s[2])+'<span>'+s[1]+'</span></button>';}).join('')+'</div>';}
function coverRow(id,name){var p=pos(id);return '<div class="ph-cv"><div class="ph-cvh"><span>'+name+'<small>'+(p===0?'zatvoreno':p===100?'otvoreno':'otvoreno '+p+' %')+'</small></span><b>'+p+'<small>%</small></b></div><div class="ph-b3"><button data-cover="'+id+'" data-to="100">'+I('up')+'Gore</button><button data-cover="'+id+'" data-to="stop">'+I('stop')+'Stop</button><button data-cover="'+id+'" data-to="0">'+I('down')+'Dolje</button></div></div>';}
function lightRow(l){var o=on(l[0]);return '<div class="ph-lr'+(o?' on':'')+'"><span class="ph-li">'+I('bulb')+'</span><span class="ph-ln">'+l[1]+(o&&l[4]?'<small>'+pct(l[0])+' %</small>':'')+'</span>'+sw('L:'+l[0],o,l[1])+(o&&l[4]?'<input type="range" min="5" max="100" value="'+pct(l[0])+'" data-dim="'+l[0]+'" aria-label="Jačina: '+l[1]+'">':'')+'</div>';}

/* ---------- ekrani ---------- */
var V={};
V.home=function(){var h=new Date().getHours(),g=h<10?'Dobro jutro':h<18?'Dobar dan':'Dobra večer',ow=openWins(),cl=COVERS.filter(function(c){return pos(c[0])<100;}).length;
 return '<div class="ph-hero"><small>Zagreb · '+new Date().toLocaleDateString('hr-HR',{weekday:'long',day:'numeric',month:'long'})+'</small><b>'+g+',<br>Fiel</b><span class="ph-wx">'+I(sun==='above_horizon'?'sun':'moon')+'5°<small>djelomično oblačno</small></span></div>'+
 (ow.length?'<button class="ph-warn" data-go="security">'+I('door')+'<span><small>Pažnja</small>'+ow[0][1]+(ow[0][0].indexOf('vrata')>-1?' otvorena':' otvoren prozor')+(ow.length>1?' i još '+(ow.length-1):'')+'</span></button>':'<div class="ph-ok">'+I('shield')+'Svi prozori i vrata zatvoreni</div>')+
 '<div class="ph-2"><div class="ph-card'+(alarm!=='off'?' armed':'')+'"><small>Alarm</small><b>'+alarmTxt()+'</b><button class="ph-pill" data-act="alarm">'+(alarm==='off'?'Uključi':'Isključi')+'</button></div>'+
 '<div class="ph-card"><small>Rasvjeta</small><b>'+nOn()+' upaljeno</b><button class="ph-pill" data-act="alloff">Ugasi sve</button></div></div>'+
 '<div class="ph-lbl">Scene</div>'+scenes([['dan','Dan','sun'],['vecer','Večer','bulb'],['film','Film','film'],['noc','Laku noć','moon'],['van','Odlazak','lock']])+
 '<div class="ph-3"><button data-go="climate"><small>Dnevni</small><b>'+fmt(CUR.dnevni)+'°</b></button><button data-go="blinds"><small>Žaluzine</small><b>'+cl+'/'+COVERS.length+'</b><i>spuštene</i></button><button data-go="energy"><small>Potrošnja</small><b>'+fmt(watts()/1000,2)+'</b><i>kW</i></button></div>';};
V.rooms=function(){var R=ROOMS.filter(function(r){return r.k===room;})[0],lo=R.l.some(on);
 return head('Prostorije',R.n)+'<div class="ph-chips">'+ROOMS.map(function(r){return '<button data-room="'+r.k+'" class="'+(r.k===room?'on':'')+'">'+r.n+'</button>';}).join('')+'</div>'+
 '<div class="ph-card wide"><div class="ph-row"><span class="ph-li big'+(lo?' lit':'')+'">'+I('bulb')+'</span><span class="ph-ln"><b>Svjetla</b><small>'+(lo?R.l.filter(on).length+' od '+R.l.length+' upaljeno':'ugašeno')+'</small></span>'+sw('R:'+R.k,lo,'Sva svjetla u prostoriji')+'</div>'+(R.l.length>1?R.l.map(function(id){return lightRow(LN[id]);}).join(''):'')+'</div>'+
 (R.c?'<div class="ph-card wide">'+coverRow(R.c,'Žaluzina')+'</div>':'')+
 '<div class="ph-card wide ph-th"><div><small>Termostat</small><b>'+fmt(CUR[R.t])+'°</b><small>cilj '+fmt(TGT[R.t])+'°'+(heat?'':' · grijanje isključeno')+'</small></div><div class="ph-pm"><button data-tgt="'+R.t+'" data-d="-0.5" aria-label="Snizi">−</button><button data-tgt="'+R.t+'" data-d="0.5" aria-label="Povisi">+</button></div></div>';};
V.light=function(){var fl=function(f,n){var c=nOn(f);return '<button class="ph-fl'+(c?' lit':'')+'" data-act="floor:'+f+'"><small>'+(c?'Ugasi':'Upali')+'</small><b>'+n+'</b><i>'+c+' upaljeno</i></button>';};
 return head('Rasvjeta',nOn()+' od '+LIGHTS.length+' upaljeno')+'<div class="ph-2">'+fl('p','Prizemlje')+fl('k','Kat')+'</div>'+
 scenes([['max','Maks','sun'],['tv','TV','tv'],['film','Film','film'],['rom','Romantika','heart']])+
 '<div class="ph-lbl">Prizemlje</div><div class="ph-card wide">'+LIGHTS.filter(function(l){return l[2]==='p';}).map(lightRow).join('')+'</div>'+
 '<div class="ph-lbl">Kat</div><div class="ph-card wide">'+LIGHTS.filter(function(l){return l[2]==='k';}).map(lightRow).join('')+'</div>';};
var ZONES=[['Dnevni','Miruje'],['Ured','Miruje'],['Konoba','Miruje']],TR=[['Večernji jazz','Playlista · Dnevni'],['Lounge za večeru','Playlista · Blagovaonica'],['Jutarnje vijesti','Radio']],tr=0;
V.music=function(){return head('Glazba','Odaberite gdje svira')+'<div class="ph-chips">'+ZONES.map(function(z,i){return '<button data-zone="'+i+'" class="'+(zone===i?'on':'')+'">'+z[0]+'<small>'+(zone===i&&play?'svira':'miruje')+'</small></button>';}).join('')+'</div>'+
 '<div class="ph-card wide ph-np"><small>Sada svira · '+ZONES[zone][0]+'</small><div class="ph-disc'+(play?' spin':'')+'"><i></i></div><b>'+TR[tr][0]+'</b><small>'+TR[tr][1]+'</small><div class="ph-prog"><i style="width:'+(play?62:35)+'%"></i></div>'+
 '<div class="ph-mc"><button data-act="prev" aria-label="Prethodna">'+I('prev')+'</button><button class="big" data-act="play" aria-label="'+(play?'Pauza':'Pusti')+'">'+I(play?'pause':'play')+'</button><button data-act="next" aria-label="Sljedeća">'+I('next')+'</button></div>'+
 '<label class="ph-vol"><span>Glasnoća</span><input type="range" min="0" max="100" value="'+vol+'" data-vol aria-label="Glasnoća"><b>'+vol+' %</b></label></div>';};
var TILES=[['blinds','Žaluzine','blind',function(){return COVERS.filter(function(c){return pos(c[0])>0;}).length+' od '+COVERS.length+' otvoreno';}],
 ['climate','Klima i grijanje','therm',function(){return heat?'grijanje radi':'isključeno';}],['cams','Kamere i portafon','cam',function(){return '3 kamere';}],
 ['security','Sigurnost','shield',function(){return alarmTxt().toLowerCase()+' · '+(openWins().length?openWins().length+' otvoreno':'sve zatvoreno');}],
 ['water','Navodnjavanje','drop',function(){return water>=0?'radi zona '+(water+1):'sve zone miruju';}],['energy','Energija','bolt',function(){return fmt(watts()/1000,2)+' kW sada';}]];
V.more=function(){return head('Više','Svi sustavi u kući')+'<div class="ph-tiles">'+TILES.map(function(t){return '<button data-go="'+t[0]+'">'+I(t[2])+'<b>'+t[1]+'</b><small>'+t[3]()+'</small></button>';}).join('')+'</div>';};
V.blinds=function(){return head('Žaluzine',COVERS.filter(function(c){return pos(c[0])>0;}).length+' od '+COVERS.length+' otvoreno',1)+
 '<div class="ph-2"><button class="ph-fl" data-act="cov:100">'+I('up')+'<b>Otvori sve</b></button><button class="ph-fl" data-act="cov:0">'+I('down')+'<b>Zatvori sve</b></button></div>'+
 '<div class="ph-card wide"><div class="ph-cvh"><span>Zavjesa · dnevni<small>'+pos('cover.zavjesa_dnevni')+' % otvoreno</small></span></div><input type="range" min="0" max="100" value="'+pos('cover.zavjesa_dnevni')+'" data-curtain aria-label="Zavjesa"></div>'+
 COVERS.map(function(c){return '<div class="ph-card wide">'+coverRow(c[0],c[1])+'</div>';}).join('');};
V.climate=function(){return head('Klima i grijanje',heat?'Grijanje radi po rasporedu':'Grijanje isključeno',1)+
 '<div class="ph-card wide ph-heat'+(heat?' lit':'')+'"><span class="ph-li big">'+I('therm')+'</span><span class="ph-ln"><b>Grijanje '+(heat?'uključeno':'isključeno')+'</b><small>vani 5,6 °C</small></span>'+sw('heat',heat,'Grijanje')+'</div>'+
 '<div class="ph-lbl">Termostati</div><div class="ph-thg">'+Object.keys(TN).map(function(k){var w=heat&&CUR[k]<TGT[k]-.1;return '<div class="ph-tc'+(w?' warm':'')+'"><small>'+TN[k]+'</small><b>'+fmt(CUR[k])+'°</b><div class="ph-pm"><button data-tgt="'+k+'" data-d="-0.5" aria-label="Snizi">−</button><span>'+fmt(TGT[k])+'°</span><button data-tgt="'+k+'" data-d="0.5" aria-label="Povisi">+</button></div></div>';}).join('')+'</div>';};
var CAMS=['Ulaz','Dvorište','Parking'];
V.cams=function(){return head('Kamere i portafon',CAMS[cam],1)+'<div class="ph-feed c'+cam+'"><span class="live">● UŽIVO</span><span class="demo">demo prikaz</span>'+feedSvg(cam)+'<span class="ts" id="ph-ts"></span></div>'+
 '<div class="ph-chips">'+CAMS.map(function(c,i){return '<button data-cam="'+i+'" class="'+(cam===i?'on':'')+'">'+c+'</button>';}).join('')+'</div>'+
 '<div class="ph-card wide"><div class="ph-row"><span class="ph-li big">'+I('phone')+'</span><span class="ph-ln"><b>Portafon · ulaz</b><small>'+(on('binary_sensor.vrata_ulaz')?'vrata otvorena':'nema poziva')+'</small></span><button class="ph-pill" data-act="opendoor">Otvori vrata</button></div></div>';};
V.security=function(){var ow=openWins();return head('Sigurnost',ow.length?ow.length+' otvoreno':'Sve zatvoreno',1)+
 '<div class="ph-seg">'+[['off','Isključen'],['on','Uključen'],['night','Noćni']].map(function(a){return '<button data-alarm="'+a[0]+'" class="'+(alarm===a[0]?'on':'')+'">'+a[1]+'</button>';}).join('')+'</div>'+
 (alarm!=='off'&&ow.length?'<div class="ph-warn static">'+I('shield')+'<span><small>Alarm</small>Zone s otvorenim prozorima su isključene iz zaštite</span></div>':'')+
 '<div class="ph-lbl">Prozori i vrata · dodirnite za simulaciju</div><div class="ph-card wide">'+WIN.map(function(w){var o=on(w[0]);return '<button class="ph-wr" data-win="'+w[0]+'"><span>'+w[1]+'</span><em class="'+(o?'bad':'')+'">'+(o?'otvoreno':'zatvoreno')+'</em></button>';}).join('')+'</div>';};
var WZ=['Travnjak ispred','Travnjak iza','Živica','Vrt','Kap po kap · stabla'];
V.water=function(){return head('Navodnjavanje',water>=0?'Radi: '+WZ[water]:'Sve zone miruju',1)+'<div class="ph-card wide">'+WZ.map(function(z,i){var r=water===i;return '<div class="ph-row ph-wz"><span class="ph-li'+(r?' lit':'')+'">'+I('drop')+'</span><span class="ph-ln">'+z+'<small>'+(r?Math.floor(wleft/60)+':'+('0'+wleft%60).slice(-2)+' preostalo':'10 min')+'</small></span><button class="ph-pill'+(r?' on':'')+'" data-water="'+i+'">'+(r?'Zaustavi':'Pokreni')+'</button></div>';}).join('')+'</div>';};
V.energy=function(){var w=watts(),lw=0;LIGHTS.forEach(function(l){if(on(l[0]))lw+=Math.round(6+pct(l[0])*.14);});
 return head('Energija','Potrošnja kuće',1)+'<div class="ph-card wide ph-big"><small>Sada</small><b>'+w+'<small> W</small></b><div class="ph-prog"><i style="width:'+Math.min(100,w/55)+'%"></i></div><small>ograničenje priključka 5,5 kW</small></div>'+
 '<div class="ph-card wide">'+[['Grijanje',heat?620:0],['Rasvjeta',lw],['Navodnjavanje',water>=0?90:0],['Glazba',play?25:0],['Ostalo',140]].map(function(r){return '<div class="ph-wr"><span>'+r[0]+'</span><em>'+r[1]+' W</em></div>';}).join('')+'</div>';};
function feedSvg(i){var tint=['#f3c66b','#9fd1ff','#c8b6ff'][i];
 return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="lmp'+i+'" cx="'+(i===1?'30%':'78%')+'" cy="22%" r="40%"><stop offset="0" stop-color="'+tint+'" stop-opacity=".55"/><stop offset="1" stop-color="'+tint+'" stop-opacity="0"/></radialGradient></defs>'+
 '<rect width="320" height="180" fill="#0d1420"/><rect width="320" height="180" fill="url(#lmp'+i+')"/>'+
 (i===0?'<path d="M0 130 L320 110 L320 180 L0 180Z" fill="#1b2433"/><path d="M40 70h80v60H40z" fill="#141c2a" stroke="#2f3d52"/><path d="M60 92h18v38H60z" fill="#2a2f3a"/><path d="M180 60v70M240 55v62" stroke="#2f3d52" stroke-width="3"/><circle cx="250" cy="40" r="5" fill="'+tint+'"/>':
  i===1?'<path d="M0 120 C80 110 200 125 320 112 L320 180 L0 180Z" fill="#14231b"/><circle cx="70" cy="85" r="34" fill="#16261d"/><path d="M70 119v20" stroke="#223" stroke-width="5"/><path d="M180 128h110v-6H180z" fill="#2a4a6a"/><circle cx="96" cy="40" r="5" fill="'+tint+'"/>':
  '<path d="M0 140 L320 140 L320 180 L0 180Z" fill="#1a1f2a"/><path d="M60 140c0-18 10-26 30-28l20-14h50l22 14c18 2 26 10 26 28z" fill="#232c3c" stroke="#3a4a63"/><circle cx="95" cy="142" r="12" fill="#0b0f16"/><circle cx="185" cy="142" r="12" fill="#0b0f16"/><path d="M228 126h6" stroke="'+tint+'" stroke-width="4"/>')+
 '<rect width="320" height="180" fill="url(#noise)" opacity=".0"/></svg>';}

function render(){
 var v=sub||tab;scr.innerHTML=V[v]();scr.dataset.v=v;if(typeof renderTab==='function')renderTab();
 [].forEach.call(nav.querySelectorAll('button'),function(b){b.classList.toggle('on',b.dataset.tab===tab);});
}
function go(t){if(['home','rooms','light','music','more'].indexOf(t)>-1){tab=t;sub='';}else{tab='more';sub=t;}scr.scrollTop=0;render();}

/* ---------- događaji ---------- */
nav.addEventListener('click',function(e){var b=e.target.closest('button');if(b)go(b.dataset.tab);});
function handleBtn(b){var d=b.dataset;
 if(d.go){go(d.go);return;}
 if(d.scene){applyScene(d.scene);return;}
 if(d.room){room=d.room;render();return;}
 if(d.zone){zone=+d.zone;render();return;}
 if(d.cam){cam=+d.cam;render();return;}
 if(d.alarm){alarm=d.alarm;render();return;}
 if(d.win){set(d.win,on(d.win)?'off':'on');push();return;}
 if(d.cover){moveCover(d.cover,d.to==='stop'?null:+d.to);scene='';render();return;}
 if(d.tgt){TGT[d.tgt]=Math.min(28,Math.max(16,TGT[d.tgt]+ +d.d));render();return;}
 if(d.water){var i=+d.water;water=water===i?-1:i;wleft=600;render();return;}
 var a=d.act;if(!a)return;
 if(a.indexOf('L:')===0){var id=a.slice(2);light(id,!on(id),null,LN[id][5]&&!on(id)?S[id].attributes.rgb_color:null);scene='';push();return;}
 if(a.indexOf('R:')===0){var R=ROOMS.filter(function(r){return r.k===a.slice(2);})[0],v=!R.l.some(on);R.l.forEach(function(id){light(id,v);});scene='';push();return;}
 if(a.indexOf('floor:')===0){var f=a.slice(6),v2=!nOn(f);LIGHTS.forEach(function(l){if(l[2]===f)light(l[0],v2);});scene='';push();return;}
 if(a.indexOf('cov:')===0){var to=+a.slice(4);COVERS.forEach(function(c){moveCover(c[0],to);});return;}
 if(a==='alloff'){LIGHTS.forEach(function(l){light(l[0],false);});scene='';push();return;}
 if(a==='alarm'){alarm=alarm==='off'?'on':'off';render();return;}
 if(a==='heat'){heat=!heat;render();return;}
 if(a==='play'){play=!play;render();return;}
 if(a==='next'||a==='prev'){tr=(tr+(a==='next'?1:TR.length-1))%TR.length;render();return;}
 if(a==='opendoor'){set('binary_sensor.vrata_ulaz','on');light('light.holl',true);push();setTimeout(function(){set('binary_sensor.vrata_ulaz','off');push();},5000);return;}
}
scr.addEventListener('click',function(e){var b=e.target.closest('button');if(b)handleBtn(b);});
scr.addEventListener('input',function(e){var t=e.target;
 if(t.dataset.dim){var id=t.dataset.dim;light(id,true,+t.value,S[id].attributes.rgb_color);var s=t.parentNode.querySelector('.ph-ln small');if(s)s.textContent=t.value+' %';push(true);}
 if(t.hasAttribute('data-vol')){vol=+t.value;t.nextElementSibling.textContent=vol+' %';}
 if(t.hasAttribute('data-curtain')){set('cover.zavjesa_dnevni',+t.value>0?'open':'closed',{current_position:+t.value});var s2=t.parentNode.querySelector('small');if(s2)s2.textContent=t.value+' % otvoreno';push(true);}
});
scr.addEventListener('change',function(e){if(e.target.type==='range')render();});

/* sat, temperature, navodnjavanje, kamera */
setInterval(function(){if(water>=0){wleft-=1;if(wleft<=0){water=water<WZ.length-1?water+1:-1;wleft=600;}}
 var ts=document.getElementById('ph-ts');if(ts)ts.textContent=new Date().toLocaleString('hr-HR');
 if(sub==='water'||(sub==='cams'&&!ts))render();},1000);
setInterval(function(){temps();push(true);var a=document.activeElement;if(!(a&&a.type==='range'&&scr.contains(a)))render();},8000);

/* ---------- TABLET u naslovnom dijelu (dijeli stanje s mobitelom i 3D kućom) ---------- */
var TB=document.getElementById('tablet'),tbody=TB&&TB.querySelector('.tb-body'),tpopEl=TB&&TB.querySelector('.tb-pop'),tnav=TB&&TB.querySelector('.tb-nav');
var tpop='',tfloor='p',tdur=10,tvOn=false,tvCh='',tvToast=0,camT=0;
var KL=[{n:'Prizemlje',m:'25 m²',t:23,cur:26,mode:'off',fan:'auto'},{n:'Kat',m:'18 m²',t:23,cur:25,mode:'off',fan:'auto'}];
var SCHED={dnevni:[[0,6,22],[6,21,21],[21,24,22]],kupaonica:[[0,24,22]],ured:[[0,8,21],[8,16,21.5],[16,24,21]],toni:[[0,8,21.5],[8,10,22],[10,20,21],[20,24,21.5]],ana:[[0,7,22],[7,24,20.5]],mz:[[0,10,21],[10,17,20.5],[17,24,21]],jopa:[[0,14,17],[14,24,25.5]],kupaonica_kat:[[0,18,22],[18,24,22.5]]};
var HON={};Object.keys(SCHED).forEach(function(k){HON[k]=true;});
function hcol(t){var f=Math.max(0,Math.min(1,(t-17)/8));var c=[[59,130,246],[52,168,140],[107,170,80],[214,170,60],[245,110,60]],i=Math.min(3,Math.floor(f*4)),u=f*4-i,a=c[i],b=c[i+1];return 'rgb('+a.map(function(v,j){return Math.round(v+(b[j]-v)*u);}).join(',')+')';}
function gauge(v,min,max,lab,unit,warm){var f=Math.max(0,Math.min(1,(v-min)/(max-min))),R=34,C=2*Math.PI*R*0.75;
 return '<svg class="tb-g" viewBox="0 0 90 80"><circle cx="45" cy="45" r="'+R+'" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 45 45)" class="bg"/><circle cx="45" cy="45" r="'+R+'" pathLength="100" stroke-dasharray="'+(75*f).toFixed(1)+' 100" transform="rotate(135 45 45)" class="'+(warm?'fg warm':'fg')+'"/><text x="45" y="48">'+lab+'</text><text x="45" y="62" class="u">'+unit+'</text></svg>';}
function tclock(){var d=new Date();return d.toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'});}
var TV={};
TV.home=function(){var d=new Date(),w=watts();
 return '<div class="tb-grid">'+
 '<div class="tc clock"><b>'+tclock()+'</b><span>'+d.toLocaleDateString('hr-HR',{weekday:'long'})+'</span><small>'+d.toLocaleDateString('hr-HR',{day:'numeric',month:'long',year:'numeric'})+'</small><div class="wx">'+I(sun==='above_horizon'?'sun':'moon')+'<span>5 °C<small>djelomično oblačno</small></span></div></div>'+
 '<div class="tc cam">'+feedSvg(0)+'<span class="live">● UŽIVO</span><span class="lbl">Ulaz · demo</span><button class="tb-gate" data-tact="gate">'+I('key')+'Otvori kapiju</button></div>'+
 '<div class="tc alarm'+(alarm!=='off'?' armed':'')+'"><div class="ah">'+I('shield')+'<span><small>ALARM</small>'+alarmTxt()+'</span></div><div class="seg"><button data-talarm="off" class="'+(alarm==='off'?'on':'')+'">OFF</button><button data-talarm="on" class="'+(alarm!=='off'?'on':'')+'">ON</button></div></div>'+
 '<div class="tc gg" data-tpop="grijanje"><small>Dnevni</small>'+gauge(CUR.dnevni,15,30,fmt(CUR.dnevni),'°C',1)+'</div>'+
 '<div class="tc gg" data-tpop="energija"><small>Potrošnja</small>'+gauge(w,0,5500,w,'W')+'</div>'+
 '<div class="tc lights" data-tpop="rasvjeta"><small>Rasvjeta</small><b>'+nOn()+'</b><span>upaljeno</span><button data-tact="alloff">Ugasi sve</button></div>'+
 '<div class="tc scn">'+[['film','Film','film'],['rom','Romantika','heart'],['vecer','Opusti se','bulb'],['noc','Laku noć','moon'],['van','Odlazak','lock']].map(function(s){return '<button data-tscene="'+s[0]+'" class="'+(scene===s[0]?'on':'')+'">'+I(s[2])+'<span>'+s[1]+'</span></button>';}).join('')+'</div>'+
 '</div>';};
function pophead(t,ic,extra){return '<div class="tp-h">'+I(ic)+'<b>'+t+'</b>'+(extra||'')+'<button class="tp-x" data-tclose>✕ Zatvori</button></div>';}
TV.rasvjeta=function(){var L=LIGHTS.filter(function(l){return l[2]===tfloor;}),half=Math.ceil(L.length/2);
 function row(l){var o=on(l[0]);return '<div class="tl'+(o?' on':'')+'"><span>'+I('bulb')+l[1]+'</span>'+(o&&l[4]?'<em>'+pct(l[0])+' %</em>':'')+sw('L:'+l[0],o,l[1])+'</div>';}
 return pophead('Rasvjeta','bulb','<span class="tp-sub">'+nOn(tfloor)+' upaljeno '+(tfloor==='p'?'u prizemlju':'na katu')+'</span>')+
 '<div class="tp-tabs"><button data-tfloor="p" class="'+(tfloor==='p'?'on':'')+'">Prizemlje</button><button data-tfloor="k" class="'+(tfloor==='k'?'on':'')+'">Kat</button><button class="right" data-act="floor:'+tfloor+'">'+(nOn(tfloor)?'Ugasi ':'Upali ')+(tfloor==='p'?'prizemlje':'kat')+'</button></div>'+
 '<div class="tp-2"><div class="tp-card">'+L.slice(0,half).map(row).join('')+'</div><div class="tp-card">'+L.slice(half).map(row).join('')+'</div></div>'+
 '<div class="tp-sc">'+[['tv','Gledanje TV-a','tv'],['film','Film','film'],['max','Maksimalno','sun'],['rom','Romantika','heart']].map(function(s){return '<button data-tscene="'+s[0]+'" class="'+(scene===s[0]?'on':'')+'">'+I(s[2])+s[1]+'</button>';}).join('')+'</div>';};
TV.grijanje=function(){var h=new Date().getHours()+new Date().getMinutes()/60;
 return pophead('Grijanje','therm','<span class="tp-sub">vani 5,6 °C</span>')+'<div class="tp-ok">'+(openWins().length?'Otvoreno: '+openWins().map(function(w){return w[1];}).join(', '):'Svi prozori i vrata zatvoreni')+'</div>'+
 '<div class="tp-hz"><div class="tp-card sched"><b class="t">Raspored grijanja</b><div class="hrs"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>'+Object.keys(SCHED).map(function(k){return '<div class="sr'+(HON[k]&&heat?'':' off')+'"><div class="sn">'+TN[k]+sw('H:'+k,HON[k]&&heat,'Grijanje '+TN[k])+'</div><div class="bar">'+SCHED[k].map(function(s){return '<i style="width:'+((s[1]-s[0])/24*100)+'%;background:'+hcol(s[2])+'">'+fmt(s[2])+'°</i>';}).join('')+'<u style="left:'+(h/24*100)+'%"></u></div></div>';}).join('')+'</div>'+
 '<div class="tp-col"><div class="tp-card"><b class="t">Trenutne temperature</b>'+Object.keys(TN).map(function(k){return '<div class="tt"><span>'+TN[k]+'</span><b>'+fmt(CUR[k])+' °C</b></div>';}).join('')+'</div>'+
 '<div class="tp-card"><b>Cijela kuća</b><small>'+(heat?'Grijanje uključeno':'Grijanje isključeno')+'</small><button class="wide" data-act="heat">'+I('power')+(heat?'Isključi grijanje':'Uključi grijanje')+'</button></div></div></div>';};
TV.klima=function(){return pophead('Klima','therm')+'<div class="tp-2">'+KL.map(function(k,i){return '<div class="tp-card kl'+(k.mode!=='off'?' run '+k.mode:'')+'"><div class="kh"><b>'+k.n+'</b><small>'+k.m+'</small><button data-kmode="'+i+':off">'+I('power')+'</button></div><small>Trenutno '+k.cur+'°</small><div class="kt">'+k.t+'°</div><small>'+(k.mode==='off'?'Ugašeno':k.mode==='cool'?'Hlađenje':'Grijanje')+' · ventilator '+k.fan+'</small><div class="pm"><button data-kt="'+i+':-1">−</button><button data-kt="'+i+':1">+</button></div><div class="seg3">'+[['off','Off'],['cool','Hlađenje'],['heat','Grijanje']].map(function(m){return '<button data-kmode="'+i+':'+m[0]+'" class="'+(k.mode===m[0]?'on':'')+'">'+m[1]+'</button>';}).join('')+'</div><small class="fl">VENTILATOR</small><div class="fan">'+['auto','low','medium','high'].map(function(f){return '<button data-kfan="'+i+':'+f+'" class="'+(k.fan===f?'on':'')+'">'+f+'</button>';}).join('')+'</div></div>';}).join('')+'</div>';};
TV.zaluzine=function(){return pophead('Žaluzine','blind','<button class="tp-all" data-act="cov:100">Podigni sve</button><button class="tp-all" data-act="cov:0">Spusti sve</button>')+'<div class="tp-3">'+COVERS.map(function(c){var p=pos(c[0]);return '<div class="tp-card cv"><b>'+c[1]+'</b><small>'+(p===0?'Zatvoreno':'Otvoreno · '+p+'%')+'</small><div class="pr"><i style="height:'+(100-p)+'%"></i></div><div class="b3"><button data-cover="'+c[0]+'" data-to="100">'+I('up')+'Podigni</button><button data-cover="'+c[0]+'" data-to="stop">'+I('stop')+'Zaustavi</button><button data-cover="'+c[0]+'" data-to="0">'+I('down')+'Spusti</button></div></div>';}).join('')+'</div>';};
TV.navodnjavanje=function(){return pophead('Navodnjavanje','drop','<span class="tp-sub">'+(water>=0?'Radi: '+WZ[water]:'Sve zone miruju')+'</span>')+'<div class="tp-hz w"><div class="tp-card"><b>Sve zone</b><small>Trajanje po zoni</small><div class="seg3">'+[10,20,30].map(function(d){return '<button data-tdur="'+d+'" class="'+(tdur===d?'on':'')+'">'+d+' min</button>';}).join('')+'</div><button class="big" data-water="0">'+I(water>=0?'stop':'play')+(water>=0?'Zaustavi':'Pokreni sve')+'</button><small>Zone se zalijevaju redom.</small></div>'+
 '<div class="tp-card"><b>Pojedinačne zone</b>'+WZ.map(function(z,i){var r=water===i;return '<div class="tt"><span>'+I('drop')+z+'</span><em>'+(r?Math.floor(wleft/60)+':'+('0'+wleft%60).slice(-2):tdur+' min')+'</em><button class="'+(r?'on':'')+'" data-water="'+i+'">'+(r?'Zaustavi':'Pokreni')+'</button></div>';}).join('')+'</div></div>';};
var CH=['HRT 1','HRT 2','HRT 3','RTL','RTL 2','Nova TV','Doma TV','Sportska TV'];
TV.tv=function(){return pophead('TV daljinski','tv','<span class="tp-sub">'+(tvOn?'Uključen'+(tvCh?' · '+tvCh:''):'Isključen')+'</span>')+'<div class="tp-hz tvw"><div class="tp-card"><b class="t">TV kanali</b><div class="chg">'+CH.map(function(c){return '<button data-tch="'+c+'" class="'+(tvOn&&tvCh===c?'on':'')+'">'+c+'</button>';}).join('')+'</div><div class="tvb"><button data-tact="tvpow">'+I('power')+'</button><button data-tact="vol">Tiše</button><button data-tact="vol">Bez zvuka</button><button data-tact="vol">Glasnije</button></div></div>'+
 '<div class="tp-card dp"><div class="pad"><button data-tact="nav">▲</button><button data-tact="nav">◀</button><button class="ok" data-tact="nav">OK</button><button data-tact="nav">▶</button><button data-tact="nav">▼</button></div><div class="tvb"><button data-tact="nav">Natrag</button><button data-tact="nav">Početna</button></div></div></div>'+(tvToast?'<div class="toast">'+(tvOn?'Televizor: '+(tvCh||'uključen'):'Televizor isključen')+'</div>':'');};
TV.energija=function(){var w=watts(),lw=0;LIGHTS.forEach(function(l){if(on(l[0]))lw+=Math.round(6+pct(l[0])*.14);});
 return pophead('Potrošnja','bolt')+'<div class="tp-hz w"><div class="tp-card en">'+gauge(w,0,5500,w,'W')+'<small>ograničenje priključka 5,5 kW</small></div><div class="tp-card">'+[['Grijanje',heat?620:0],['Rasvjeta',lw],['Navodnjavanje',water>=0?90:0],['Klima',KL.filter(function(k){return k.mode!=='off';}).length*700],['Ostalo',140]].map(function(r){return '<div class="tt"><span>'+r[0]+'</span><b>'+r[1]+' W</b></div>';}).join('')+'</div></div>';};
var TNAV=[['home','Početna','home'],['rasvjeta','Rasvjeta','bulb'],['grijanje','Grijanje','therm'],['klima','Klima','therm'],['zaluzine','Žaluzine','blind'],['navodnjavanje','Navodnjavanje','drop'],['tv','TV daljinski','tv']];
function renderTab(){if(!TB)return;
 tnav.innerHTML=TNAV.map(function(n){return '<button data-tnav="'+n[0]+'" class="'+((n[0]==='home'&&!tpop)||tpop===n[0]?'on':'')+'">'+I(n[2])+'<span>'+n[1]+'</span></button>';}).join('');
 tbody.innerHTML=TV.home();
 if(tpop){tpopEl.innerHTML='<div class="tp">'+TV[tpop]()+'</div>';tpopEl.hidden=false;}else{tpopEl.hidden=true;tpopEl.innerHTML='';}
}
if(TB){
 TB.addEventListener('click',function(e){var b=e.target.closest('button,[data-tpop]');if(!b)return;var d=b.dataset;
  if(d.tnav!=null){tpop=d.tnav==='home'?'':d.tnav;renderTab();return;}
  if(d.tclose!=null){tpop='';renderTab();return;}
  if(d.tpop&&b.tagName!=='BUTTON'){tpop=d.tpop;renderTab();return;}
  if(d.tscene){applyScene(d.tscene);return;}
  if(d.talarm){alarm=d.talarm==='on'?'on':'off';render();return;}
  if(d.tfloor){tfloor=d.tfloor;renderTab();return;}
  if(d.tdur){tdur=+d.tdur;renderTab();return;}
  if(d.kt){var q=d.kt.split(':');KL[+q[0]].t=Math.max(16,Math.min(30,KL[+q[0]].t+ +q[1]));renderTab();return;}
  if(d.kmode){var q2=d.kmode.split(':');KL[+q2[0]].mode=q2[1];renderTab();return;}
  if(d.kfan){var q3=d.kfan.split(':');KL[+q3[0]].fan=q3[1];renderTab();return;}
  if(d.tch){tvOn=true;tvCh=d.tch;light('light.traka_tv',true,40);toastTv();push();return;}
  var a=d.tact;
  if(a==='tvpow'){tvOn=!tvOn;light('light.traka_tv',tvOn,40);toastTv();push();return;}
  if(a==='vol'||a==='nav'){b.classList.add('hit');setTimeout(function(){b.classList.remove('hit');},200);return;}
  if(a==='gate'){set('binary_sensor.vrata_ulaz','on');push();b.textContent='Kapija se otvara…';setTimeout(function(){set('binary_sensor.vrata_ulaz','off');push();},5000);return;}
  if(a==='alloff'){LIGHTS.forEach(function(l){light(l[0],false);});scene='';push();return;}
  if(d.act&&d.act.indexOf('H:')===0){var k=d.act.slice(2);HON[k]=!HON[k];renderTab();return;}
  if(d.water!=null&&tpop==='navodnjavanje'){var i=+d.water;water=water===i||(i===0&&water>=0&&b.classList.contains('big'))?-1:i;wleft=tdur*60;render();return;}
  /* ostalo (svjetla, žaluzine, grijanje) dijeli logiku s mobitelom */
  handleBtn(b);
 });
 TB.addEventListener('keydown',function(e){if(e.key==='Escape'&&tpop){tpop='';renderTab();}});
}
if(TB){var TW=document.getElementById('tabwrap');function fitTab(){TB.style.transform='scale('+(TW.clientWidth/780)+')';}fitTab();addEventListener('resize',fitTab);
 setTimeout(function(){TB.classList.add('on');TW.classList.add('on');},window.THREE&&!matchMedia('(prefers-reduced-motion: reduce)').matches?1900:100);}
function toastTv(){tvToast=1;clearTimeout(camT);camT=setTimeout(function(){tvToast=0;renderTab();},1800);}
setInterval(function(){if(TB&&(!tpop||tpop==='navodnjavanje'))renderTab();},15000);

/* ---------- 3D kuća se učitava tek kad se približi ---------- */
function load(){
 Promise.all([import('./kuca3d/kuca3d-card.js'),import('./kuca3d/okolis.js')]).then(function(r){var O=r[1];CFG.height=host.clientHeight;card=document.createElement('kuca3d-card');O.pripremi(card);card.setConfig(CFG);card._floor='both';addEventListener('resize',function(){if(card._config&&card._resize){card._config.height=host.clientHeight;card._resize();}});host.appendChild(card);toCard();O.okolis(card);host.classList.add('ready');})
 .catch(function(){host.classList.add('fail');});}
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();load();}},{rootMargin:'400px'});io.observe(host);}else load();

init();render();
})();

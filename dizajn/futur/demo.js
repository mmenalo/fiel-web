(function(){
var root=document.getElementById('demo'); if(!root) return;
var scr=root.querySelector('.ph-screen'), nav=root.querySelector('.ph-nav'), host=document.querySelector('.house');
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
var PL={fm:'auto',fs:[[8,12,1],[16,20,1]],t:26.8,tgt:28,ph:7.24,orp:706,sp:720,heat:false,light:true,mass:false,fall:false,sl:false};
var heat=true, alarm='off', scene='', sun=(new Date().getHours()>=7&&new Date().getHours()<17)?'above_horizon':'below_horizon', room='dnevni', tab='home', sub='', zone=0, play=false, vol=42, water=-1, wleft=0, cam=0;

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
function unzoom(){if(sub==='pool'){sub='';tab='more';}}
function applyScene(k,quiet){scene=k;unzoom();[].forEach.call(document.querySelectorAll('[data-hscene]'),function(x){x.classList.toggle('on',x.dataset.hscene===k);});if(k==='noc'||k==='van'){PL.light=false;PL.mass=false;PL.fall=false;PL.sl=false;}if(k==='vecer'){PL.light=true;}if(typeof vrt!=='undefined'){vrt=!(k==='noc'||k==='van');}
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
 if(!quiet){push();toast(TOAST[k]);}
}

var TOAST={dan:'Dan: sve rolete se dižu.',vecer:'Večer: upaljena rasvjeta u prizemlju i hodniku, rolete u spavaćim sobama spuštene.',
 film:'Film: ostala svjetla se gase, TV traka svijetli prigušeno, rolete u dnevnom boravku i kuhinji se spuštaju.',noc:'Laku noć: sva svjetla ugašena, sve rolete dolje, alarm u noćnom načinu.',
 van:'Odlazak: svjetla ugašena, rolete dolje, alarm uključen.',tv:'TV: dnevni boravak prigušen na 25 %, TV traka upaljena.',rom:'Romantika: prigušena topla rasvjeta u dnevnom boravku.',max:'Maks: sva svjetla na 100 %.'};
var toastT=0;function toast(t){if(!t||!host)return;var r=host.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var el=host.querySelector('.dm-toast');if(!el){el=document.createElement('div');el.className='dm-toast';el.setAttribute('role','status');host.appendChild(el);}
 el.textContent=t;el.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){el.classList.remove('on');},4200);}
/* ---------- veza s 3D kućom ---------- */
function callService(domain,service,data){
 [].concat(data.entity_id||[]).forEach(function(id){
  if(domain==='light'){var v=service==='turn_off'?false:service==='toggle'?!on(id):true;light(id,v,data.brightness_pct,data.rgb_color);scene='';}
  if(domain==='cover'){if(service==='open_cover')moveCover(id,100);else if(service==='close_cover')moveCover(id,0);else if(service==='stop_cover')moveCover(id,null);else if(data.position!=null)moveCover(id,data.position);}
 });push();}
var raf=0;
var cardT=0,cardLast=0,cardVis=true,cardPend=false;function toCard(){cardT=0;cardLast=Date.now();if(!cardVis){cardPend=true;return;}cardPend=false;if(card)card.hass={states:Object.assign({},S),callService:callService};}
function push(noRender){if(card&&!cardT)cardT=setTimeout(toCard,Math.max(0,140-(Date.now()-cardLast)));if(!noRender&&!raf)raf=requestAnimationFrame(function(){raf=0;render();});}

/* ---------- ikone ---------- */
var IP={pool:'M3 16c2 0 2-1.5 4.5-1.5S10 16 12 16s2.5-1.5 4.5-1.5S19 16 21 16M3 20c2 0 2-1.5 4.5-1.5S10 20 12 20s2.5-1.5 4.5-1.5S19 20 21 20M8 13V5a2 2 0 0 1 4 0M14 13V5a2 2 0 0 1 4 0M8 8h6M8 11h6',jet:'M6 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M13 14a3 3 0 1 0 6 0a3 3 0 1 0-6 0M8 9a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0M15 6a1 1 0 1 0 2 0a1 1 0 1 0-2 0',fall:'M4 5h16M6 5v4c0 3 2 3 2 6s-2 3-2 5M12 5v4c0 3 2 3 2 6s-2 3-2 5M18 5v4c0 3-2 3-2 6s2 3 2 5',gear:'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1',cloud:'M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.5 1.5A3.3 3.3 0 0 0 7 18z',home:'M3 11l9-7 9 7v9h-6v-6H9v6H3z',grid:'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',bulb:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z',
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
 '<button class="ph-card wide ph-poolc" data-go="pool"><span class="ph-li big'+(PL.light?' lit':'')+'">'+I('pool')+'</span><span class="ph-ln"><b>Bazen '+fmt(PL.t)+' °C</b><small>pH '+fmt(PL.ph,2)+' · ORP '+Math.round(PL.orp)+' mV'+(PL.heat?' · grije se':'')+'</small></span><span class="ph-go">'+I('back')+'</span></button>'+
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
 ['pool','Bazen','pool',function(){return fmt(PL.t)+' °C · pH '+fmt(PL.ph,1);}],['water','Navodnjavanje','drop',function(){return water>=0?'radi zona '+(water+1):'sve zone miruju';}],['energy','Energija','bolt',function(){return fmt(watts()/1000,2)+' kW sada';}]];
V.more=function(){return head('Više','Svi sustavi u kući')+'<div class="ph-tiles">'+TILES.map(function(t){return '<button data-go="'+t[0]+'">'+I(t[2])+'<b>'+t[1]+'</b><small>'+t[3]()+'</small></button>';}).join('')+'</div>';};
V.blinds=function(){return head('Žaluzine',COVERS.filter(function(c){return pos(c[0])>0;}).length+' od '+COVERS.length+' otvoreno',1)+
 '<div class="ph-2"><button class="ph-fl" data-act="cov:100">'+I('up')+'<b>Podigni sve</b></button><button class="ph-fl" data-act="cov:0">'+I('down')+'<b>Spusti sve</b></button></div>'+
 '<div class="ph-card wide"><div class="ph-cvh"><span>Zavjesa · dnevni<small>'+pos('cover.zavjesa_dnevni')+' % otvoreno</small></span></div><input type="range" min="0" max="100" value="'+pos('cover.zavjesa_dnevni')+'" data-curtain aria-label="Zavjesa"></div>'+
 COVERS.map(function(c){return '<div class="ph-card wide">'+coverRow(c[0],c[1])+'</div>';}).join('');};
V.climate=function(){return head('Klima i grijanje',heat?'Grijanje radi po rasporedu':'Grijanje isključeno',1)+
 '<div class="ph-card wide ph-heat'+(heat?' lit':'')+'"><span class="ph-li big">'+I('therm')+'</span><span class="ph-ln"><b>Grijanje '+(heat?'uključeno':'isključeno')+'</b><small>vani 5,6 °C</small></span>'+sw('heat',heat,'Grijanje')+'</div>'+
 '<div class="ph-lbl">Termostati</div><div class="ph-thg">'+Object.keys(TN).map(function(k){var w=heat&&CUR[k]<TGT[k]-.1;return '<div class="ph-tc'+(w?' warm':'')+'"><small>'+TN[k]+'</small><b>'+fmt(CUR[k])+'°</b><div class="ph-pm"><button data-tgt="'+k+'" data-d="-0.5" aria-label="Snizi">−</button><span>'+fmt(TGT[k])+'°</span><button data-tgt="'+k+'" data-d="0.5" aria-label="Povisi">+</button></div></div>';}).join('')+'</div>';};
var KAM=[['ulaz','Ulaz',[905,418]],['prilaz','Prilaz',[372,338]],['bazen','Bazen',[1040,522]],['vrt','Vrt iza kuće',[1032,226]]],CAMS=KAM.map(function(k){return k[1];});
function feedImg(i,cls){var k=KAM[i];return '<img src="kam/'+k[0]+'-'+(sun==='above_horizon'?'d':'n')+'.jpg" alt="Kamera '+k[1]+', vizualizacija" class="kimg'+(cls?' '+cls:'')+'" loading="lazy">';}
V.cams=function(){return head('Kamere i portafon',KAM.length+' kamere · '+CAMS[cam],1)+'<div class="ph-feed c'+cam+'">'+feedImg(cam)+'<span class="live">● SIMULACIJA</span><span class="demo">'+CAMS[cam]+'</span><span class="ts" id="ph-ts"></span></div>'+
 '<div class="ph-kg">'+KAM.map(function(c,i){return '<button data-cam="'+i+'" class="'+(cam===i?'on':'')+'">'+feedImg(i)+'<span>'+c[1]+'</span></button>';}).join('')+'</div>'+
 '<div class="ph-card wide"><div class="ph-row"><span class="ph-li big">'+I('phone')+'</span><span class="ph-ln"><b>Portafon · ulaz</b><small>'+(on('binary_sensor.vrata_ulaz')?'vrata otvorena':'nema poziva')+'</small></span><button class="ph-pill" data-act="opendoor">Otvori vrata</button></div></div>';};
V.security=function(){var ow=openWins();return head('Sigurnost',ow.length?ow.length+' otvoreno':'Sve zatvoreno',1)+
 '<div class="ph-seg">'+[['off','Isključen'],['on','Uključen'],['night','Noćni']].map(function(a){return '<button data-alarm="'+a[0]+'" class="'+(alarm===a[0]?'on':'')+'">'+a[1]+'</button>';}).join('')+'</div>'+
 (alarm!=='off'&&ow.length?'<div class="ph-warn static">'+I('shield')+'<span><small>Alarm</small>Zone s otvorenim prozorima su isključene iz zaštite</span></div>':'')+
 '<div class="ph-lbl">Prozori i vrata · dodirnite za simulaciju</div><div class="ph-card wide">'+WIN.map(function(w){var o=on(w[0]);return '<button class="ph-wr" data-win="'+w[0]+'"><span>'+w[1]+'</span><em class="'+(o?'bad':'')+'">'+(o?'otvoreno':'zatvoreno')+'</em></button>';}).join('')+'</div>';};
function hm(x){return ('0'+Math.floor(x)).slice(-2)+':'+(x%1?'30':'00');}
function nowH(){var d=new Date();return d.getHours()+d.getMinutes()/60;}
function fOn(){if(PL.fm!=='auto')return PL.fm==='on';var n=nowH();return PL.fs.some(function(p){return p[2]&&n>=p[0]&&n<p[1];});}
function fTxt(){if(PL.fm==='on')return 'radi stalno (ručno)';if(PL.fm==='off')return 'isključena';var n=nowH(),cur=PL.fs.filter(function(p){return p[2]&&n>=p[0]&&n<p[1];})[0];if(cur)return 'radi do '+hm(cur[1]);
 var nx=PL.fs.filter(function(p){return p[2];}).map(function(p){return p[0];}).sort(function(a,b){return a-b;}),f=nx.filter(function(x){return x>n;})[0];return nx.length?'miruje · uključuje se u '+hm(f!=null?f:nx[0]):'nema razdoblja';}
function fSched(){var n=nowH();return '<div class="ph-fsb'+(PL.fm!=='auto'?' dim':'')+'">'+PL.fs.map(function(p){return p[2]?'<i style="left:'+(p[0]/24*100)+'%;width:'+((p[1]-p[0])/24*100)+'%"></i>':'';}).join('')+'<b style="left:'+(n/24*100)+'%"></b></div><div class="ph-rng"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>'+
 PL.fs.map(function(p,i){return '<div class="ph-fp'+(p[2]?'':' off')+'"><button class="sw'+(p[2]?' on':'')+'" data-fs="'+i+':t" role="switch" aria-checked="'+!!p[2]+'" aria-label="Razdoblje '+(i+1)+'"><i></i></button>'+
  '<div class="ph-pm"><button data-fs="'+i+':0:-0.5" aria-label="Ranije početak">−</button><span>'+hm(p[0])+'</span><button data-fs="'+i+':0:0.5" aria-label="Kasnije početak">+</button></div><em>do</em>'+
  '<div class="ph-pm"><button data-fs="'+i+':1:-0.5" aria-label="Ranije kraj">−</button><span>'+hm(p[1])+'</span><button data-fs="'+i+':1:0.5" aria-label="Kasnije kraj">+</button></div>'+
  (PL.fs.length>1?'<button class="ph-x" data-fs="'+i+':x" aria-label="Ukloni razdoblje">×</button>':'')+'</div>';}).join('')+
 (PL.fs.length<3?'<button class="ph-add" data-fs="add">+ Dodaj razdoblje</button>':'');}
function plRow(k,ic,n,st){return '<div class="ph-row"><span class="ph-li'+(PL[k]?' lit':'')+'">'+I(ic)+'</span><span class="ph-ln"><b>'+n+'</b><small>'+st+'</small></span>'+sw('P:'+k,PL[k],n)+'</div>';}
V.pool=function(){var phOk=PL.ph>=7&&PL.ph<=7.6,orOk=PL.orp>=650,prod=PL.orp<PL.sp-3?Math.min(100,Math.round((PL.sp-PL.orp)*4+30)):0;
 return head('Bazen',phOk&&orOk?'Kvaliteta vode u redu':'Provjerite kvalitetu vode',1)+
 '<div class="ph-3 ph-psens"><div><small>Voda</small><b>'+fmt(PL.t)+'°</b><i>'+(PL.heat?'cilj '+fmt(PL.tgt)+'°':'grijanje isklj.')+'</i></div><div class="'+(phOk?'ok':'bad')+'"><small>pH</small><b>'+fmt(PL.ph,2)+'</b><i>'+(phOk?'u redu':'izvan raspona')+'</i></div><div class="'+(orOk?'ok':'bad')+'"><small>ORP</small><b>'+Math.round(PL.orp)+'</b><i>mV · '+(orOk?'u redu':'nisko')+'</i></div></div>'+
 '<div class="ph-card wide">'+plRow('heat','therm','Grijanje bazena',PL.heat?(PL.t<PL.tgt-.05?'grije do '+fmt(PL.tgt)+' °C':'drži '+fmt(PL.tgt)+' °C'):'isključeno')+
 '<div class="ph-row ph-ptg"><span></span><span class="ph-ln"><small>Željena temperatura</small></span><div class="ph-pm"><button data-ptgt="-0.5" aria-label="Snizi">−</button><span>'+fmt(PL.tgt)+'°</span><button data-ptgt="0.5" aria-label="Povisi">+</button></div></div></div>'+
 '<div class="ph-card wide">'+plRow('light','bulb','Rasvjeta bazena',PL.light?'upaljena':'ugašena')+plRow('mass','jet','Masažeri',PL.mass?'rade':'isključeni')+plRow('fall','fall','Vodopad',PL.fall?'radi':'isključen')+'</div>'+
 '<div class="ph-card wide"><div class="ph-cvh"><span>Elektroliza · set point<small>proizvodnja klora '+prod+' %</small></span><b class="ph-spv">'+PL.sp+' mV</b></div><input type="range" min="600" max="800" step="10" value="'+PL.sp+'" data-orp aria-label="Set point elektrolize"><div class="ph-rng"><span>600</span><span>preporuka 700 do 750</span><span>800</span></div></div>'+
 '<div class="ph-lbl">Strojarnica</div><div class="ph-card wide">'+plRow('sl','bulb','Rasvjeta strojarnice',PL.sl?'upaljena':'ugašena')+'</div><div class="ph-lbl">Filtracija</div><div class="ph-card wide"><div class="ph-row"><span class="ph-li'+(fOn()?' lit':'')+'">'+I('gear')+'</span><span class="ph-ln"><b>Pumpa filtracije</b><small>'+fTxt()+'</small></span><span class="ph-tag'+(fOn()?' on':'')+'">'+(fOn()?'radi':'miruje')+'</span></div>'+
 '<div class="ph-seg sm">'+[['auto','Raspored'],['on','Uvijek'],['off','Isključeno']].map(function(m){return '<button data-fm="'+m[0]+'" class="'+(PL.fm===m[0]?'on':'')+'">'+m[1]+'</button>';}).join('')+'</div>'+fSched()+'</div>';};
var WZ=['Travnjak uz bazen','Travnjak uz prilaz','Živica','Vrt','Kap po kap · stabla'];
V.water=function(){return head('Navodnjavanje',water>=0?'Radi: '+WZ[water]:'Sve zone miruju',1)+'<div class="ph-card wide">'+WZ.map(function(z,i){var r=water===i;return '<div class="ph-row ph-wz"><span class="ph-li'+(r?' lit':'')+'">'+I('drop')+'</span><span class="ph-ln">'+z+'<small>'+(r?Math.floor(wleft/60)+':'+('0'+wleft%60).slice(-2)+' preostalo':'10 min')+'</small></span><button class="ph-pill'+(r?' on':'')+'" data-water="'+i+'">'+(r?'Zaustavi':'Pokreni')+'</button></div>';}).join('')+'</div>';};
V.energy=function(){var w=watts(),lw=0;LIGHTS.forEach(function(l){if(on(l[0]))lw+=Math.round(6+pct(l[0])*.14);});
 return head('Energija','Potrošnja kuće',1)+'<div class="ph-card wide ph-big"><small>Sada</small><b>'+w+'<small> W</small></b><div class="ph-prog"><i style="width:'+Math.min(100,w/55)+'%"></i></div><small>ograničenje priključka 5,5 kW</small></div>'+
 '<div class="ph-card wide">'+[['Grijanje',heat?620:0],['Rasvjeta',lw],['Bazen',(PL.heat&&PL.t<PL.tgt?1900:0)+(fOn()?450:0)+(PL.mass?750:0)+(PL.fall?300:0)],['Navodnjavanje',water>=0?90:0],['Glazba',play?25:0],['Ostalo',140]].map(function(r){return '<div class="ph-wr"><span>'+r[0]+'</span><em>'+r[1]+' W</em></div>';}).join('')+'</div>';};
function feedSvg(i){var tint=['#f3c66b','#9fd1ff','#c8b6ff'][i];
 return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"><defs><radialGradient id="lmp'+i+'" cx="'+(i===1?'30%':'78%')+'" cy="22%" r="40%"><stop offset="0" stop-color="'+tint+'" stop-opacity=".55"/><stop offset="1" stop-color="'+tint+'" stop-opacity="0"/></radialGradient></defs>'+
 '<rect width="320" height="180" fill="#0d1420"/><rect width="320" height="180" fill="url(#lmp'+i+')"/>'+
 (i===0?'<path d="M0 130 L320 110 L320 180 L0 180Z" fill="#1b2433"/><path d="M40 70h80v60H40z" fill="#141c2a" stroke="#2f3d52"/><path d="M60 92h18v38H60z" fill="#2a2f3a"/><path d="M180 60v70M240 55v62" stroke="#2f3d52" stroke-width="3"/><circle cx="250" cy="40" r="5" fill="'+tint+'"/>':
  i===1?'<path d="M0 120 C80 110 200 125 320 112 L320 180 L0 180Z" fill="#14231b"/><circle cx="70" cy="85" r="34" fill="#16261d"/><path d="M70 119v20" stroke="#223" stroke-width="5"/><path d="M180 128h110v-6H180z" fill="#2a4a6a"/><circle cx="96" cy="40" r="5" fill="'+tint+'"/>':
  '<path d="M0 140 L320 140 L320 180 L0 180Z" fill="#1a1f2a"/><path d="M60 140c0-18 10-26 30-28l20-14h50l22 14c18 2 26 10 26 28z" fill="#232c3c" stroke="#3a4a63"/><circle cx="95" cy="142" r="12" fill="#0b0f16"/><circle cx="185" cy="142" r="12" fill="#0b0f16"/><path d="M228 126h6" stroke="'+tint+'" stroke-width="4"/>')+
 '<rect width="320" height="180" fill="url(#noise)" opacity=".0"/></svg>';}

function render(){
 if(typeof vilaUpd==='function')vilaUpd();var v=sub||tab,hh=V[v]();if(scr._h!==hh){scr._h=hh;scr.innerHTML=hh;}scr.dataset.v=v;if(typeof renderTab==='function')renderTab();
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
 if(d.fm){PL.fm=d.fm;render();return;}
 if(d.fs){var q=d.fs.split(':');if(q[0]==='add'){var l=PL.fs[PL.fs.length-1];PL.fs.push([Math.min(22,l[1]+1),Math.min(24,l[1]+3),1]);}else{var P=PL.fs[+q[0]];if(q[1]==='t')P[2]=P[2]?0:1;else if(q[1]==='x')PL.fs.splice(+q[0],1);else{var j=+q[1];P[j]=Math.min(24,Math.max(0,P[j]+ +q[2]));if(P[1]<=P[0]){if(j===0)P[1]=Math.min(24,P[0]+.5);else P[0]=Math.max(0,P[1]-.5);}}}render();return;}
 if(d.ptgt){PL.tgt=Math.min(32,Math.max(20,PL.tgt+ +d.ptgt));render();return;}
 if(d.water){var i=+d.water;water=water===i?-1:i;wleft=600;render();return;}
 var a=d.act;if(!a)return;
 if(a.indexOf('P:')===0){var pk=a.slice(2);PL[pk]=!PL[pk];if(pk==='light'||pk==='mass'||pk==='fall')scene='';render();return;}
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
 if(t.hasAttribute('data-orp')){PL.sp=+t.value;var sv=t.parentNode.querySelector('.ph-spv');if(sv)sv.textContent=PL.sp+' mV';}
 if(t.hasAttribute('data-vol')){vol=+t.value;t.nextElementSibling.textContent=vol+' %';}
 if(t.hasAttribute('data-curtain')){set('cover.zavjesa_dnevni',+t.value>0?'open':'closed',{current_position:+t.value});var s2=t.parentNode.querySelector('small');if(s2)s2.textContent=t.value+' % otvoreno';push(true);}
});
scr.addEventListener('change',function(e){if(e.target.type==='range')render();});

function poolSim(){if(PL.heat&&PL.t<PL.tgt)PL.t=Math.min(PL.tgt,PL.t+.1);else if(!PL.heat&&PL.t>24)PL.t-=.02;
 PL.orp+=(PL.sp-PL.orp)*.18+(Math.random()-.5)*3;PL.ph+=(7.22-PL.ph)*.2+(Math.random()-.5)*.03;}
/* sat, temperature, navodnjavanje, kamera */
setInterval(function(){if(water>=0){wleft-=1;if(wleft<=0){water=water<WZ.length-1?water+1:-1;wleft=600;}}
 var ts=document.getElementById('ph-ts');if(ts)ts.textContent=new Date().toLocaleString('hr-HR');
 if(sub==='water'||(sub==='cams'&&!ts))render();},1000);
setInterval(function(){poolSim();temps();push(true);var a=document.activeElement;if(!(a&&a.type==='range'&&scr.contains(a)))render();},8000);

/* ---------- TABLET u naslovnom dijelu (dijeli stanje s mobitelom i 3D kućom) ---------- */
var TB=document.getElementById('tablet'),tbody=TB&&TB.querySelector('.tb-body'),tpopEl=TB&&TB.querySelector('.tb-pop'),tnav=TB&&TB.querySelector('.tb-nav');
var tpop='',hsel='',tfloor='p',tdur=10,tvOn=false,tvCh='',tvToast=0,camT=0;
var KL=[{n:'Prizemlje',m:'25 m²',t:23,cur:26,mode:'off',fan:'auto'},{n:'Kat',m:'18 m²',t:23,cur:25,mode:'off',fan:'auto'}];
var SCHED={dnevni:[[0,6,22],[6,21,21],[21,24,22]],kupaonica:[[0,24,22]],ured:[[0,8,21],[8,16,21.5],[16,24,21]],toni:[[0,8,21.5],[8,10,22],[10,20,21],[20,24,21.5]],ana:[[0,7,22],[7,24,20.5]],mz:[[0,10,21],[10,17,20.5],[17,24,21]],jopa:[[0,14,17],[14,24,25.5]],kupaonica_kat:[[0,18,22],[18,24,22.5]]};
var HON={};Object.keys(SCHED).forEach(function(k){HON[k]=true;});
function hcol(t){var f=Math.max(0,Math.min(1,(t-17)/8));var c=[[59,130,246],[52,168,140],[107,170,80],[214,170,60],[245,110,60]],i=Math.min(3,Math.floor(f*4)),u=f*4-i,a=c[i],b=c[i+1];return 'rgb('+a.map(function(v,j){return Math.round(v+(b[j]-v)*u);}).join(',')+')';}
function gauge(v,min,max,lab,unit,warm){var f=Math.max(0,Math.min(1,(v-min)/(max-min))),R=34,C=2*Math.PI*R*0.75;
 return '<svg class="tb-g" viewBox="0 0 90 80"><circle cx="45" cy="45" r="'+R+'" pathLength="100" stroke-dasharray="75 100" transform="rotate(135 45 45)" class="bg"/><circle cx="45" cy="45" r="'+R+'" pathLength="100" stroke-dasharray="'+(75*f).toFixed(1)+' 100" transform="rotate(135 45 45)" class="'+(warm?'fg warm':'fg')+'"/><text x="45" y="48">'+lab+'</text><text x="45" y="62" class="u">'+unit+'</text></svg>';}
function tclock(){var d=new Date();return d.toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit'});}
var TV={};
function pophead(t,ic,extra){return '<div class="tp-h">'+I(ic)+'<b>'+t+'</b>'+(extra||'')+'<button class="tp-x" data-tclose>✕ Zatvori</button></div>';}
TV.rasvjeta=function(){var L=LIGHTS.filter(function(l){return l[2]===tfloor;}),half=Math.ceil(L.length/2);
 function row(l){var o=on(l[0]);return '<div class="tl'+(o?' on':'')+'"><span>'+I('bulb')+l[1]+'</span>'+(o&&l[4]?'<em>'+pct(l[0])+' %</em>':'')+sw('L:'+l[0],o,l[1])+'</div>';}
 return pophead('Rasvjeta','bulb','<span class="tp-sub">'+nOn(tfloor)+' upaljeno '+(tfloor==='p'?'u prizemlju':'na katu')+'</span>')+
 '<div class="tp-tabs"><button data-tfloor="p" class="'+(tfloor==='p'?'on':'')+'">Prizemlje</button><button data-tfloor="k" class="'+(tfloor==='k'?'on':'')+'">Kat</button><button class="right" data-act="floor:'+tfloor+'">'+(nOn(tfloor)?'Ugasi ':'Upali ')+(tfloor==='p'?'prizemlje':'kat')+'</button></div>'+
 '<div class="tp-2"><div class="tp-card">'+L.slice(0,half).map(row).join('')+'</div><div class="tp-card">'+L.slice(half).map(row).join('')+'</div></div>'+
 '<div class="tp-sc">'+[['tv','Gledanje TV-a','tv'],['film','Film','film'],['max','Maksimalno','sun'],['rom','Romantika','heart']].map(function(s){return '<button data-tscene="'+s[0]+'" class="'+(scene===s[0]?'on':'')+'">'+I(s[2])+s[1]+'</button>';}).join('')+'</div>';};
function hed(k){if(hsel.split(':')[0]!==k)return '';var i=+hsel.split(':')[1],s=SCHED[k][i];return '<div class="hed"><span>'+('0'+s[0]).slice(-2)+':00 – '+('0'+s[1]).slice(-2)+':00</span><button data-hst="'+k+':'+i+':-0.5" aria-label="Snizi">−</button><b>'+fmt(s[2])+' °C</b><button data-hst="'+k+':'+i+':0.5" aria-label="Povisi">+</button><button class="x" data-hst="x" aria-label="Zatvori">✕</button></div>';}
TV.grijanje=function(){var h=new Date().getHours()+new Date().getMinutes()/60;
 return pophead('Grijanje','therm','<span class="tp-sub">vani 5,6 °C</span>')+'<div class="tp-ok">'+(openWins().length?'Otvoreno: '+openWins().map(function(w){return w[1];}).join(', '):'Svi prozori i vrata zatvoreni')+'</div>'+
 '<div class="tp-hz"><div class="tp-card sched"><b class="t">Raspored grijanja</b><div class="hrs"><span>00</span><span>06</span><span>12</span><span>18</span><span>24</span></div>'+Object.keys(SCHED).map(function(k){return '<div class="sr'+(HON[k]&&heat?'':' off')+'"><div class="sn">'+TN[k]+sw('H:'+k,HON[k]&&heat,'Grijanje '+TN[k])+'</div><div class="bar">'+SCHED[k].map(function(s,i){var id=k+':'+i;return '<i data-hseg="'+id+'" class="'+(hsel===id?'sel':'')+'" style="width:'+((s[1]-s[0])/24*100)+'%;background:'+hcol(s[2])+'" title="'+s[0]+'–'+s[1]+' h">'+fmt(s[2])+'°</i>';}).join('')+'<u style="left:'+(h/24*100)+'%"></u></div>'+hed(k)+'</div>';}).join('')+'<small class="hint">'+(hsel?'Promijenite temperaturu razdoblja tipkama − i +.':'Kliknite razdoblje u rasporedu za promjenu temperature.')+'</small></div>'+
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
var TCAM=[0,1],CAMN=CAMS,robo=0,hold=false,rad='',mtab=0;
var FC=[['Sub','sun',8,2],['Ned','cloud',8,2],['Pon','sun',11,2],['Uto','cloud',15,8],['Sri','sun',17,9]];
function tcam(slot){var i=TCAM[slot];return '<div class="tc cam c'+slot+'">'+feedImg(i)+'<span class="live">● SIMULACIJA</span><span class="lbl">'+CAMN[i]+'</span><button class="ar l" data-tcam="'+slot+':-1" aria-label="Prethodna kamera">‹</button><button class="ar r" data-tcam="'+slot+':1" aria-label="Sljedeća kamera">›</button><span class="ts">'+new Date().toLocaleDateString('hr-HR')+' '+tclock()+'</span></div>';}
function cvrow(id,name){var p=pos(id);return '<div class="cvr"><span class="ci">'+I('blind')+'</span><span class="cn">'+name+'<small>'+(p===0?'Zatvoreno':p===100?'Otvoreno':'Otvoreno · '+p+' %')+'</small></span><button data-cover="'+id+'" data-to="100" aria-label="Podigni">'+I('up')+'</button><button data-cover="'+id+'" data-to="stop" aria-label="Zaustavi">'+I('stop')+'</button><button data-cover="'+id+'" data-to="0" aria-label="Spusti">'+I('down')+'</button></div>';}
TV.home=function(){var d=new Date(),w=watts(),ow=openWins(),lp=pct('light.dnevni'),lo=on('light.dnevni');
 return '<div class="tch">'+
 '<button class="chip odv"><span class="ci">'+I('dots')+'</span><span><small>ODVOZ SMEĆA</small>Srijeda · miješani</span></button>'+
 '<button class="chip" data-tpop="grijanje">'+I('therm')+'<span><b>'+fmt(CUR.dnevni)+'°</b><small>Dnevni</small></span></button>'+
 '<button class="chip">'+I(sun==='above_horizon'?'sun':'moon')+'<span><b>5,6°</b><small>Vani</small></span></button>'+
 '<button class="chip">'+I('drop')+'<span><b>42 %</b><small>Vlaga</small></span></button>'+
 '<button class="chip'+(ow.length?' warn':'')+'">'+I('door')+'<span><b>'+(ow.length?ow.length+' otv.':'OK')+'</b><small>Prozori</small></span></button>'+
 '<button class="chip" data-tpop="rasvjeta">'+I('bulb')+'<span><b>'+nOn()+'</b><small>Svjetla</small></span></button></div>'+
 '<div class="thg">'+
 '<div class="tc alarm'+(alarm!=='off'?' armed':'')+'"><div class="ah">'+I('shield')+'<span>ALARM<small>'+alarmTxt()+'</small></span></div><div class="seg"><button data-talarm="off" class="'+(alarm==='off'?'on':'')+'">'+I('shield')+'OFF</button><button data-talarm="on" class="'+(alarm!=='off'?'on':'')+'">'+I('lock')+'ON</button></div></div>'+
 tcam(0)+tcam(1)+
 '<div class="tc wx"><div class="wh">'+I(sun==='above_horizon'?'sun':'cloud')+'<span>Djelomično oblačno<small>Prognoza · Zagreb</small></span><b>4,8 °C<small>4,8 / 3,8 °C</small></b></div><div class="fc">'+FC.map(function(f){return '<span><small>'+f[0]+'</small>'+I(f[1])+'<b>'+f[2]+'°</b><small>'+f[3]+'°</small></span>';}).join('')+'</div></div>'+
 '<div class="tc clk"><b>'+tclock()+'</b><span>'+d.toLocaleDateString('hr-HR',{weekday:'long'})+'</span><small>'+d.toLocaleDateString('hr-HR',{day:'numeric',month:'long',year:'numeric'})+'</small></div>'+
 '<div class="tc gg g1" data-tpop="grijanje"><small>'+I('therm')+'Dnevni</small>'+gauge(CUR.dnevni,15,30,fmt(CUR.dnevni),'°C',1)+'<small class="b">Vlaga 42 %</small></div>'+
 '<div class="tc gg g2" data-tpop="energija"><small>'+I('bolt')+'Potrošnja</small>'+gauge(w,0,5500,w,'W')+'<small class="b">Limit 5,5 kW</small></div>'+
 '<div class="tc st'+(ow.length?' warn':'')+'"><span class="ok">'+(ow.length?'!':'✓')+'</span><span><small>'+(ow.length?'UPOZORENJE':'SVE U REDU')+'</small>'+(ow.length?ow.map(function(x){return x[1];}).join(', ')+' otvoreno':'Prozori i vrata zatvoreni')+'</span></div>'+
 '<div class="tc cvs">'+cvrow('cover.zavjesa_dnevni','Zavjesa dnevni')+cvrow('cover.dnevni_d','Desna žaluzina')+
 '<button class="cvr dim'+(lo?' on':'')+'" data-act="L:light.dnevni"><span class="fill" style="width:'+(lo?lp:0)+'%"></span><span class="ci">'+I('bulb')+'</span><span class="cn">Strop dnevni<small>'+(lo?lp+' %':'Ugašeno')+'</small></span></button></div>'+
 '<div class="tc inf"><button class="ir" data-tact="robo"><span class="ci">'+I('home')+'</span><span>Usisavač<small>'+(robo?'Usisava prizemlje':'Na punjaču')+'</small></span></button><button class="ir" data-tpop="navodnjavanje"><span class="ci">'+I('drop')+'</span><span>Navodnjavanje<small>'+(water>=0?'Radi: '+WZ[water]:'Sljedeće u 06:00')+'</small></span></button></div>'+
 '<div class="tc bts"><button data-tact="gate">'+I('key')+'<span>Otvori</span></button><button data-tact="hold" class="'+(hold?'on':'')+'">'+I('door')+'<span>Drži otvoreno</span></button><button data-tscene="noc" class="'+(scene==='noc'?'on':'')+'">'+I('moon')+'<span>Laku noć</span></button></div>'+
 '</div>';};
var RADIO=[['HR 1','HRT'],['HR 2','HRT'],['Otvoreni','Radio'],['Extra FM','Radio'],['Antena Zagreb','Radio'],['Narodni','Radio']];
TV.glazba=function(){var t=rad?[rad,'Radio · '+ZONES[zone][0]]:[TR[tr][0],TR[tr][1]];
 return pophead('Glazba','music','<span class="tp-search">'+I('dots')+'Pretraži glazbu i radio</span>')+
 '<div class="tp-zn">'+ZONES.map(function(z,i){return '<button data-zone="'+i+'" class="'+(zone===i?'on':'')+'">'+I('music')+'<span>'+z[0]+'<small>'+(zone===i&&play?'Svira':i===0?'Miruje':'Spremno')+'</small></span></button>';}).join('')+'</div>'+
 '<div class="tp-hz mu"><div class="tp-card np"><b class="t">Sada svira <em>'+(play?'● svira':'miruje')+'</em></b><div class="disc'+(play?' spin':'')+'">'+I('music')+'</div><b>'+t[0]+'</b><small>'+t[1]+'</small>'+
 '<div class="mc"><button data-act="prev" aria-label="Prethodna">'+I('prev')+'</button><button class="big" data-act="play">'+I(play?'pause':'play')+(play?'Pauza':'Pusti')+'</button><button data-act="next" aria-label="Sljedeća">'+I('next')+'</button></div>'+
 '<div class="vl"><small>Glasnoća</small><button data-tvol="-10">−</button><span class="bar"><i style="width:'+vol+'%"></i></span><button data-tvol="10">+</button><small>'+vol+' %</small></div></div>'+
 '<div class="tp-card"><div class="tp-tabs">'+['Radio','Moja glazba','Popisi'].map(function(n,i){return '<button data-mtab="'+i+'" class="'+(mtab===i?'on':'')+'">'+n+'</button>';}).join('')+'</div><small class="t2">BRZI ODABIR</small><div class="rg">'+
 (mtab===0?RADIO.map(function(r){return '<button data-trad="'+r[0]+'" class="'+(rad===r[0]&&play?'on':'')+'"><b>'+r[0]+'</b><small>'+r[1]+'</small></button>';}):TR.map(function(r,i){return '<button data-ttr="'+i+'" class="'+(!rad&&tr===i&&play?'on':'')+'"><b>'+r[0]+'</b><small>'+r[1]+'</small></button>';})).join('')+'</div></div></div>';};
var TNAV=[['home','Početna','home'],['glazba','Glazba','music'],['rasvjeta','Rasvjeta','bulb'],['navodnjavanje','Navodnjavanje','drop'],['grijanje','Grijanje','therm'],['klima','Klima','therm'],['zaluzine','Žaluzine','blind'],['tv','TV daljinski','tv'],['kuca','Kuća 3D','grid']];
var tLast={n:'',b:'',p:''},tPrev='';
function setH(el,k,h){if(tLast[k]!==h){tLast[k]=h;el.innerHTML=h;}}
function renderTab(){if(!TB)return;
 setH(tnav,'n',TNAV.map(function(n){return '<button data-tnav="'+n[0]+'" class="'+((n[0]==='home'&&!tpop)||tpop===n[0]?'on':'')+'">'+I(n[2])+'<span>'+n[1]+'</span></button>';}).join(''));
 setH(tbody,'b',TV.home());
 if(tpop){setH(tpopEl,'p','<div class="tp">'+TV[tpop]()+'</div>');if(tPrev!==tpop){tpopEl.classList.remove('anim');void tpopEl.offsetWidth;tpopEl.classList.add('anim');}tpopEl.hidden=false;}else{tpopEl.hidden=true;setH(tpopEl,'p','');}
 tPrev=tpop;
}
/* zvjezdana prašina: točke se raspoređuju po stvarnim elementima tableta */
window.fielTabletDust=function(N){if(!TB)return null;var R0=TB.getBoundingClientRect();if(!R0.width)return null;var W=R0.width,items=[],tot=0;
 function add(r,kind,w,c){if(!r.width||!r.height)return;var x0=(r.left-R0.left)/W-.5,y0=(r.top-R0.top)/W,ww=r.width/W,hh=r.height/W,wt=kind==='e'?(ww+hh)*2*w:ww*hh*w*40;if(wt<=0)return;items.push({k:kind,x:x0,y:y0,w:ww,h:hh,c:c,wt:wt});tot+=wt;}
 add(R0,'e',3,'w');add(R0,'f',.12,'d');
 var scope=tpop?tpopEl:TB;
 [].forEach.call(TB.querySelectorAll('.tb-nav button'),function(e){var r=e.getBoundingClientRect();add(r,'e',.9,'p');add(r,'f',.5,'p');});
 [].forEach.call(scope.querySelectorAll(tpop?'.tp,.tp-card,.tp button':'.tc,.chip,.tc button'),function(e){var r=e.getBoundingClientRect();add(r,'e',e.matches('.tc,.tp,.tp-card')?1.1:.5,'p');add(r,'f',e.matches('button')?.22:.1,e.classList.contains('on')?'p':'d');});
 [].forEach.call(scope.querySelectorAll('svg'),function(e){var r=e.getBoundingClientRect();if(r.width>120){add(r,'f',.35,'b');return;}add(r,'f',e.classList.contains('tb-g')?1.6:1.2,e.classList.contains('tb-g')?'o':'g');});
 var tw=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,null,false),n,rg=document.createRange();
 while((n=tw.nextNode())){if(!n.nodeValue.trim()||n.parentNode.closest('svg'))continue;rg.selectNodeContents(n);var rs=rg.getClientRects();for(var i=0;i<rs.length;i++){var r=rs[i],hgt=r.height,sh=Math.min(1,16/hgt);add({left:r.left,top:r.top+hgt*.2,width:r.width,height:hgt*.6},'f',3.6*sh,'w');}}
 var p=new Float32Array(N*3),k=new Array(N),acc=0,j=0;items.forEach(function(it){acc+=it.wt/tot;it.e=acc;});
 for(var q=0;q<N;q++){var u=(q+.5)/N;while(items[j].e<u&&j<items.length-1)j++;var it=items[j],x,y;
  if(it.k==='e'){var L=Math.random()*(it.w+it.h)*2;if(L<it.w){x=it.x+L;y=it.y;}else if(L<it.w*2){x=it.x+L-it.w;y=it.y+it.h;}else if(L<it.w*2+it.h){x=it.x;y=it.y+L-it.w*2;}else{x=it.x+it.w;y=it.y+L-it.w*2-it.h;}}
  else{x=it.x+Math.random()*it.w;y=it.y+Math.random()*it.h;}
  p[q*3]=x;p[q*3+1]=-(y-R0.height/W/2);p[q*3+2]=(Math.random()-.5)*.004;k[q]=it.c;}
 return {p:p,k:k};};
if(TB){
 TB.addEventListener('click',function(e){var b=e.target.closest('button,[data-tpop],[data-hseg]');if(!b)return;var d=b.dataset;if(sub==='pool'){unzoom();render();}
  if(d.hseg){hsel=hsel===d.hseg?'':d.hseg;renderTab();return;}
  if(d.hst){if(d.hst==='x'){hsel='';renderTab();return;}var hq=d.hst.split(':'),hk=hq[0],hi=+hq[1],hs=SCHED[hk][hi];hs[2]=Math.min(28,Math.max(16,Math.round((hs[2]+ +hq[2])*2)/2));var hh=new Date().getHours();if(hh>=hs[0]&&hh<hs[1]){TGT[hk]=hs[2];render();}else renderTab();return;}
  if(d.tnav!=null){if(d.tnav==='kuca'){var ds=document.getElementById('demo-sekcija');if(ds)ds.scrollIntoView({behavior:'smooth'});return;}tpop=d.tnav==='home'?'':d.tnav;renderTab();return;}
  if(d.tcam){var q0=d.tcam.split(':');var sl=+q0[0],nv=TCAM[sl];do{nv=(nv+ +q0[1]+KAM.length)%KAM.length;}while(nv===TCAM[1-sl]);TCAM[sl]=nv;renderTab();return;}
  if(d.tvol){vol=Math.max(0,Math.min(100,vol+ +d.tvol));render();return;}
  if(d.mtab!=null){mtab=+d.mtab;renderTab();return;}
  if(d.trad){rad=d.trad;play=true;render();return;}
  if(d.ttr!=null){rad='';tr=+d.ttr;play=true;render();return;}
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
  if(a==='robo'){robo=!robo;renderTab();return;}
  if(a==='hold'){hold=!hold;set('binary_sensor.vrata_ulaz',hold?'on':'off');push();return;}
  if(a==='gate'){set('binary_sensor.vrata_ulaz','on');push();b.classList.add('on');setTimeout(function(){if(!hold)set('binary_sensor.vrata_ulaz','off');push();},5000);return;}
  if(a==='alloff'){LIGHTS.forEach(function(l){light(l[0],false);});scene='';push();return;}
  if(d.act&&d.act.indexOf('H:')===0){var k=d.act.slice(2);HON[k]=!HON[k];renderTab();return;}
  if(d.water!=null&&tpop==='navodnjavanje'){var i=+d.water;water=water===i||(i===0&&water>=0&&b.classList.contains('big'))?-1:i;wleft=tdur*60;render();return;}
  /* ostalo (svjetla, žaluzine, grijanje) dijeli logiku s mobitelom */
  handleBtn(b);
 });
 TB.addEventListener('keydown',function(e){if(e.key==='Escape'&&tpop){tpop='';renderTab();}});
}
if(TB){var TW=document.getElementById('tabwrap');function fitTab(){var w=TW.clientWidth||TW.parentNode.clientWidth;TB.style.transform='scale('+(w/1000)+')';}fitTab();addEventListener('resize',fitTab);
 setTimeout(function(){TB.classList.add('on');TW.classList.add('on');},!matchMedia('(prefers-reduced-motion: reduce)').matches?2600:100);}
function toastTv(){tvToast=1;clearTimeout(camT);camT=setTimeout(function(){tvToast=0;renderTab();},1800);}
setInterval(function(){if(TB&&(!tpop||tpop==='navodnjavanje'))renderTab();},15000);

/* ---------- 3D kuća se učitava tek kad se približi ---------- */
var pre=null;function preload(){if(!pre)pre=Promise.all([import('./kuca3d/kuca3d-card.js'),import('./kuca3d/okolis.js')]);return pre;}
function load(){
 preload().then(function(r){var O=r[1];CFG.height=host.clientHeight;card=document.createElement('kuca3d-card');O.pripremi(card);card.setConfig(CFG);card._floor='gf';addEventListener('resize',function(){if(card._config&&card._resize){card._config.height=host.clientHeight;card._resize();}});host.appendChild(card);toCard();O.okolis(card);card._applyFloor();host.classList.add('ready');})
 .catch(function(){host.classList.add('fail');});}
/* ---------- foto prikaz vile: slojevi po sobama i roletama ---------- */
var SHL=[['dnevni','cover.dnevni_l',0,50,-.22],['dnevni','cover.dnevni_d',50,100,-.22],['kuhinja','cover.kuhinja',0,100,-.08],['gl','cover.toni',0,100,-.07],['gs','cover.ana',0,100,-.07],['gd','cover.mz',0,100,-.07]];
var VR={dnevni:{b:[585,367,915,712],l:['light.dnevni','light.blagovaonica','light.traka_tv'],c:['cover.dnevni_l','cover.dnevni_d'],s:[650,413,861,598],n:'Dnevni boravak'},
 kuhinja:{b:[875,369,1013,533],l:['light.kuhinja','light.traka_ormar'],c:['cover.kuhinja'],s:[911,398,985,489],n:'Kuhinja'},
 gl:{b:[640,256,752,433],l:['light.toni'],c:['cover.toni'],s:[659,274,722,396],n:'Soba 1'},
 gs:{b:[764,225,854,416],l:['light.ana'],c:['cover.ana'],s:[767,251,832,373],n:'Soba 2'},
 gd:{b:[893,201,1019,380],l:['light.mz','light.traka_mz_krevet'],c:['cover.mz'],s:[924,217,987,349],n:'Spavaća soba'}};
var vrt=true,vmode='foto',VS=null;
function pc(b){return 'left:'+(b[0]/15.36)+'%;top:'+(b[1]/10.24)+'%;width:'+((b[2]-b[0])/15.36)+'%;height:'+((b[3]-b[1])/10.24)+'%';}
function buildVila(){var h='<div class="vila"><div class="vl-st"><img src="vila/baza.jpg" alt="Vizualizacija kuće noću" class="vl-b"><img src="vila/vrt-ugasen.jpg" alt="" class="vl-vrt"><img src="vila/dan.jpg" alt="" class="vl-dan">';
 Object.keys(VR).forEach(function(k){var r=VR[k];h+='<img src="vila/s-'+k+'.png" alt="" class="vl-s" data-k="'+k+'" style="'+pc(r.b)+'">';});
 h+='<img src="vila/bz-on.png" alt="" class="vl-bz on" style="'+pc([800,600,1460,940])+'"><img src="vila/bz-off.png" alt="" class="vl-bz off" style="'+pc([800,600,1460,940])+'">'+
  '<div class="vl-fall" style="left:'+(868/15.36)+'%;top:'+(742/10.24)+'%;width:'+(330/15.36)+'%"><i></i></div><div class="vl-jets">'+[[1236,668],[1286,690],[1336,712]].map(function(q){return '<i style="left:'+(q[0]/15.36)+'%;top:'+(q[1]/10.24)+'%"></i>';}).join('')+'</div>'+
  '<button class="vl-h vl-pool" data-vpool style="left:'+(1130/15.36)+'%;top:'+(770/10.24)+'%"><i></i><span>Bazen</span></button>';
 h+=KAM.map(function(k,i){return '<button class="vl-cam" data-vcam="'+i+'" style="left:'+(k[2][0]/15.36)+'%;top:'+(k[2][1]/10.24)+'%" aria-label="Kamera '+k[1]+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+IP.cam+'"/></svg><span>'+k[1]+'</span></button>';}).join('');
var SPR=[[0,[[1110,440,20],[1250,350,60],[1420,470,120],[1500,600,160],[1330,560,-80],[1200,480,45],[1260,250,100],[1470,900,180],[1500,740,200]]],[1,[[120,380,0],[260,330,90],[60,470,-30],[660,900,30],[820,980,-20],[1000,990,-40],[560,1010,0]]],[2,[[60,900,-60],[160,965,-40],[1380,1000,-90],[1180,990,-100]]],[3,[[1330,430,30],[1490,420,150],[1450,540,90],[300,280,-90]]],[4,[[1130,300],[1380,345],[135,330],[1050,480],[600,560],[60,480],[1470,230]],'d']];
 h+='<div class="vl-spr-all">'+SPR.map(function(z){return z[1].map(function(q,i){return '<span class="vl-spr'+(z[2]==='d'?' drip':'')+'" data-z="'+z[0]+'" style="left:'+(q[0]/15.36)+'%;top:'+(q[1]/10.24)+'%;--rot:'+(q[2]||0)+'deg;--d:'+(-(i*.7)%3.2).toFixed(2)+'s"><i></i><b></b><u></u><s></s></span>';}).join('');}).join('')+'</div>'; h+='<div class="vl-spr-all">'+SPR.map(function(z){return z[1].map(function(q){return '<span class="vl-spr'+(z[2]==='d'?' drip':'')+'" data-z="'+z[0]+'" style="left:'+(q[0]/15.36)+'%;top:'+(q[1]/10.24)+'%;--rot:'+(q[2]||0)+'deg"><i></i><b></b></span>';}).join('');}).join('')+'</div>';
 h+='<div class="vl-cur" style="'+pc([659,419,852,586])+'"></div>';
 SHL.forEach(function(q,i){var r=VR[q[0]];h+='<div class="vl-r" data-i="'+i+'" style="'+pc(r.s)+'"><img src="vila/r-'+q[0]+'.png" alt="" class="n"><img src="vila/rd-'+q[0]+'.png" alt="" class="d"></div>';});
 Object.keys(VR).forEach(function(k){var r=VR[k];h+='<button class="vl-h" data-vroom="'+k+'" style="left:'+((r.s[0]+r.s[2])/2/15.36)+'%;top:'+((r.s[1]+r.s[3])/2/10.24)+'%"><i></i><span>'+r.n+'</span></button>';});
 h+='</div><span class="vl-tag">Vizualizacija</span></div>';
 host.insertAdjacentHTML('afterbegin',h);
 host.insertAdjacentHTML('beforeend','<div class="vl-ctl"><button data-vmode="foto" class="on">Kuća</button><button data-vmode="3d">3D tlocrt</button><button data-vsun class="vsun">Dnevni prikaz</button><button data-vrt class="vrt on">Vrtna rasvjeta</button></div><button class="vl-back" data-vback>↩ Cijela kuća</button>');
 VS=host.querySelector('.vl-st');fitVila();addEventListener('resize',fitVila);
 host.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.vback!=null){unzoom();render();return;}if(sub==='pool'&&b.dataset.vpool==null){unzoom();}
  if(b.dataset.vroom){var r=VR[b.dataset.vroom],v=!r.l.some(on);r.l.forEach(function(id){light(id,v);});scene='';push();return;}
  if(b.dataset.vcam!=null){cam=+b.dataset.vcam;go('cams');return;}
  if(b.dataset.vpool!=null){PL.light=!PL.light;scene='';render();return;}
  if(b.dataset.vrt!=null){vrt=!vrt;vilaUpd();return;}
  if(b.dataset.vsun!=null){sun=sun==='above_horizon'?'below_horizon':'above_horizon';if(sun==='above_horizon')vrt=true;push();return;}
  if(b.dataset.vmode){vmode=b.dataset.vmode;host.classList.toggle('m3d',vmode==='3d');[].forEach.call(host.querySelectorAll('[data-vmode]'),function(x){x.classList.toggle('on',x===b);});if(vmode==='3d'&&!card)load();if(card&&card._resize){card._config.height=host.clientHeight;card._resize();}cardVis=vmode==='3d';if(cardVis&&cardPend)toCard();return;}
 });
 vilaUpd();}
var vfz=false;function fitVila(){if(!VS)return;var w=host.clientWidth,h=host.clientHeight,s=Math.max(w/1536,h/1024)*(w<700?1.12:1.05),W,H,L,T;vfz=sub==='pool';
 if(vfz){s*=w<700?1.9:1.45;W=1536*s;H=1024*s;L=Math.min(0,Math.max(w-W,w/2-1120*s));T=Math.min(0,Math.max(h-H,h/2-760*s));}else{W=1536*s;H=1024*s;L=(w-W)/2+(w<700?-W*.04:0);T=(h-H)/2;}
 VS.style.width=W+'px';VS.style.height=H+'px';VS.style.left=L+'px';VS.style.top=T+'px';}
function vilaUpd(){if(!VS)return;if((sub==='pool')!==vfz)fitVila();host.classList.toggle('pzoom',sub==='pool');
 Object.keys(VR).forEach(function(k){var r=VR[k],o=0;r.l.forEach(function(id){if(on(id))o=Math.max(o,.5+.5*(pct(id)||100)/100);});
  VS.querySelector('.vl-s[data-k="'+k+'"]').style.opacity=o;
  VS.querySelector('.vl-h[data-vroom="'+k+'"]').classList.toggle('on',o>0);});
 SHL.forEach(function(q,i){var r=VR[q[0]],w=r.s[2]-r.s[0],h=r.s[3]-r.s[1],d=-q[4]*w/h*100,Yl=(100-pos(q[1]))*(1+d/100),xa=q[2],xb=q[3],f=function(x){return (Yl-d*x/100).toFixed(2)+'%';};
  VS.querySelector('.vl-r[data-i="'+i+'"]').style.clipPath='polygon('+xa+'% 0%,'+xb+'% 0%,'+xb+'% '+f(xb)+','+xa+'% '+f(xa)+')';});
 var cf=1-pos('cover.zavjesa_dnevni')/100,X=(cf*100).toFixed(2),cu=VS.querySelector('.vl-cur');cu.style.clipPath='polygon(0% 26.9%,'+X+'% '+(26.9*(1-cf)).toFixed(2)+'%,'+X+'% '+(100-25.7*cf).toFixed(2)+'%,0% 100%)';cu.classList.toggle('lit',VR.dnevni.l.some(on));
 var day=sun==='above_horizon';host.classList.toggle('vday',day);var sb=host.querySelector('[data-vsun]');if(sb)sb.textContent=day?'Noćni prikaz':'Dnevni prikaz';
 VS.querySelector('.vl-vrt').style.opacity=vrt||day?0:1;VS.querySelector('.vl-bz.on').style.opacity=!day&&!vrt&&PL.light?1:0;VS.querySelector('.vl-bz.off').style.opacity=!day&&vrt&&!PL.light?1:0;
 host.classList.toggle('pcams',sub==='cams');[].forEach.call(VS.querySelectorAll('.vl-cam'),function(x){x.classList.toggle('on',+x.dataset.vcam===cam);});
 [].forEach.call(VS.querySelectorAll('.vl-spr'),function(x){x.classList.toggle('on',+x.dataset.z===water);});host.classList.toggle('pmass',PL.mass);host.classList.toggle('pfall',PL.fall);var pb=VS.querySelector('.vl-pool');pb.classList.toggle('on',PL.light&&!day);pb.querySelector('span').textContent='Bazen '+fmt(PL.t)+' °C';var vb=host.querySelector('[data-vrt]');if(vb)vb.classList.toggle('on',vrt);}

cardVis=false;buildVila();
if('IntersectionObserver' in window){var pio=new IntersectionObserver(function(es){if(es[0].isIntersecting){pio.disconnect();setTimeout(preload,400);}},{rootMargin:'900px 0px'});pio.observe(host);}else setTimeout(preload,3000);
host.addEventListener('pointerover',function(e){if(e.target.closest&&e.target.closest('[data-vmode="3d"]'))preload();});

/* ---------- jedan dan u kući ---------- */
var DAN=[function(){applyScene('dan');go('home');},
 function(){applyScene('van');go('security');},
 function(){sun='above_horizon';set('sun.sun',sun);cam=0;go('cams');toast('Kurir zvoni: slika s ulaza stiže na mobitel, a vrata mu otvarate jednim dodirom.');},
 function(){heat=true;go('climate');toast('Krenuli ste kući: grijanje se uključuje, da bude toplo kad stignete.');},
 function(){applyScene('vecer');go('home');},
 function(){applyScene('noc');go('home');}];
var danI=-1,danT=0,dPlay=document.querySelector('[data-dan-play]');
function danMark(i){danI=i;[].forEach.call(document.querySelectorAll('[data-dan]'),function(b){var on=+b.dataset.dan===i;b.classList.toggle('on',on);var r=b.parentNode;if(on&&r.scrollWidth>r.clientWidth&&r.scrollTo)r.scrollTo({left:r.scrollLeft+b.getBoundingClientRect().left-r.getBoundingClientRect().left-4,behavior:'smooth'});});}
function danStep(i){DAN[i]();push();danMark(i);}
function danStop(){clearInterval(danT);danT=0;if(dPlay){dPlay.textContent='▶ Pusti cijeli dan';dPlay.setAttribute('aria-pressed','false');}}
[].forEach.call(document.querySelectorAll('[data-dan]'),function(b){b.addEventListener('click',function(){danStop();danStep(+b.dataset.dan);});});
if(dPlay)dPlay.addEventListener('click',function(){if(danT){danStop();return;}dPlay.textContent='❚❚ Zaustavi';dPlay.setAttribute('aria-pressed','true');danStep((danI+1)%DAN.length);danT=setInterval(function(){if(danI>=DAN.length-1){danStop();return;}danStep(danI+1);},3800);});

/* ---------- kuća: vrh stranice ili demo ---------- */
var hslot=document.querySelector('.hero-house'),dslot=document.querySelector('.house-slot'),hIn='hero';
function placeHouse(){if(!hslot||!dslot)return;var st=document.getElementById('demo');if(!st)return;var r=st.getBoundingClientRect(),want=r.top<innerHeight*.6?'demo':'hero';if(want===hIn)return;hIn=want;(want==='demo'?dslot:hslot).insertBefore(host,(want==='demo'?dslot:hslot).firstChild);document.body.classList.toggle('house-in-demo',want==='demo');
 if(typeof fitVila==='function')fitVila();if(card&&card._resize){card._config.height=host.clientHeight;card._resize();}dispatchEvent(new Event('resize'));}
addEventListener('scroll',placeHouse,{passive:true});addEventListener('resize',placeHouse);placeHouse();
[].forEach.call(document.querySelectorAll('[data-hscene]'),function(b){b.addEventListener('click',function(){applyScene(b.dataset.hscene);[].forEach.call(document.querySelectorAll('[data-hscene]'),function(x){x.classList.toggle('on',x===b);});});});
/* uređaji: mobitel / zidni zaslon */
[].forEach.call(document.querySelectorAll('[data-dev]'),function(b){b.addEventListener('click',function(){var k=b.dataset.dev;[].forEach.call(document.querySelectorAll('[data-dev]'),function(x){x.setAttribute('aria-selected',x===b);});[].forEach.call(document.querySelectorAll('[data-devpane]'),function(p){p.hidden=p.dataset.devpane!==k;});var st=document.getElementById('demo');if(st)st.classList.toggle('tabmode',k==='tab');if(sub==='pool'){unzoom();render();}setTimeout(function(){if(typeof fitVila==='function')fitVila();if(card&&card._resize){card._config.height=host.clientHeight;card._resize();}},50);if(k==='tab'&&typeof fitTab==='function'){fitTab();if(window.fielTabDust)window.fielTabDust();}});});
(function(){var sec=document.getElementById('demo-sekcija');if(!sec)return;function off(){sec.classList.add('dirao');sec.removeEventListener('click',off,true);}sec.addEventListener('click',off,true);})();
init();render();
function dustNow(){if(window.fielTabDust)window.fielTabDust();}setTimeout(dustNow,60);setTimeout(dustNow,600);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(dustNow);
})();

"""Tri futuristične varijante početne (po uzoru na principe leoautomize.tech, u Fielovim bojama).
Pokretanje: python3 dizajn/futur/build.py  → dizajn/futur/out/"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "src"))
from logo import logo  # noqa: E402
OUT = os.path.join(HERE, "out"); os.makedirs(OUT, exist_ok=True)

LOGO_DARK = logo("#eef2f7", "#8fa1ba", "#d9ad52", title="Fiel d.o.o.")
LOGO_LIGHT = logo("#1f3550", "#7c8da6", "#c79a3a", title="Fiel d.o.o.")

ROOMS = [("boravak", "DNEVNI BORAVAK", 20, 20, 300, 220), ("kuhinja", "KUHINJA", 320, 20, 140, 220),
         ("terasa", "TERASA", 460, 20, 120, 220), ("spavaca", "SPAVAĆA", 20, 240, 220, 160),
         ("ulaz", "ULAZ", 240, 240, 140, 160), ("kupaonica", "KUPAONICA", 380, 240, 200, 160)]

def plan():
    g = ""
    for k, n, x, y, w, h in ROOMS:
        g += (f'<g class="room" data-room="{k}" tabindex="0" role="button" aria-pressed="false" aria-label="{n.capitalize()}: svjetlo">'
              f'<rect class="floor" x="{x}" y="{y}" width="{w}" height="{h}"/>'
              f'<rect class="glow" x="{x}" y="{y}" width="{w}" height="{h}" fill="url(#sjaj)"/>'
              f'<text x="{x+14}" y="{y+24}">{n}</text><circle class="bulb" cx="{x+w/2}" cy="{y+h/2}" r="5"/></g>')
    furn = ('<g class="furn"><rect x="50" y="170" width="170" height="44" rx="6"/><rect x="50" y="130" width="40" height="40" rx="6"/>'
            '<rect x="230" y="90" width="64" height="40" rx="4"/><rect x="336" y="40" width="108" height="30"/><rect x="350" y="120" width="80" height="70" rx="35"/>'
            '<rect x="40" y="280" width="120" height="100" rx="6"/><rect x="480" y="60" width="80" height="50" rx="4"/>'
            '<rect x="420" y="330" width="130" height="50" rx="20"/><rect x="400" y="262" width="40" height="40" rx="20"/></g>')
    walls = ('<g class="walls"><path d="M20 20H580V400H20Z"/><path d="M320 20V110M320 160V240M460 20V240M20 240H120M170 240H300M340 240H580M240 240V400M380 240V300M380 350V400"/></g>'
             '<path class="door-out" d="M290 400H330"/>')
    return ('<svg class="plan-svg" viewBox="0 0 600 420" aria-label="Tlocrt stana: kliknite prostoriju da upalite svjetlo">'
            '<defs><radialGradient id="sjaj" cx="50%" cy="50%" r="65%"><stop offset="0" stop-color="#f3c66b" stop-opacity=".95"/>'
            '<stop offset=".55" stop-color="#d9ad52" stop-opacity=".35"/><stop offset="1" stop-color="#d9ad52" stop-opacity="0"/></radialGradient></defs>'
            f'{g}{furn}{walls}</svg>')

APP = f"""<div class="app" id="app">
  <div class="app-top"><div><b id="pozdrav">Dobra večer</b><small id="brojac">3 od 6 prostorija upaljeno</small></div><span class="pill">21,5 °C</span></div>
  <div class="plan">{plan()}</div>
  <div class="scenes" role="group" aria-label="Scene">
    <button data-scene="dan">Dan</button><button data-scene="vecer" class="on">Večer</button><button data-scene="film">Film</button><button data-scene="noc">Laku noć</button><button data-scene="odlazak">Odlazak</button>
  </div>
  <div class="chips"><span id="alarm"><i></i>Alarm isključen</span><span><i class="ok"></i>Radi lokalno</span></div>
  <p class="hint">Kliknite prostoriju ili scenu</p>
</div>"""

JS = """
(function(){
  var app=document.getElementById('app'); if(!app) return;
  var rooms=[].slice.call(app.querySelectorAll('.room'));
  var S={dan:['boravak','kuhinja'],vecer:['boravak','kuhinja','ulaz'],film:['boravak'],noc:['ulaz'],odlazak:[]};
  function count(){var n=rooms.filter(function(r){return r.classList.contains('on')}).length;
    app.querySelector('#brojac').textContent=n+' od '+rooms.length+' prostorija upaljeno';}
  function set(r,on){r.classList.toggle('on',on);r.setAttribute('aria-pressed',on);}
  function scene(k){rooms.forEach(function(r){set(r,S[k].indexOf(r.dataset.room)>-1)});
    app.classList.toggle('dim',k==='film');
    var a=app.querySelector('#alarm');a.classList.toggle('armed',k==='odlazak'||k==='noc');
    a.lastChild.textContent=(k==='odlazak'?'Alarm uključen':k==='noc'?'Alarm noćni način':'Alarm isključen');
    app.querySelector('#pozdrav').textContent={dan:'Dobar dan',vecer:'Dobra večer',film:'Film',noc:'Laku noć',odlazak:'Kuća je zaključana'}[k];
    [].forEach.call(app.querySelectorAll('[data-scene]'),function(b){b.classList.toggle('on',b.dataset.scene===k)});count();}
  rooms.forEach(function(r){function t(){set(r,!r.classList.contains('on'));count();}
    r.addEventListener('click',t);r.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();t();}});});
  [].forEach.call(app.querySelectorAll('[data-scene]'),function(b){b.addEventListener('click',function(){scene(b.dataset.scene)})});
  scene('vecer');
  var reveal=document.querySelector('.reveal');
  if(reveal){var w=reveal.textContent.trim().split(/\\s+/);reveal.innerHTML=w.map(function(x){return '<span>'+x+'</span> '}).join('');
    var sp=[].slice.call(reveal.querySelectorAll('span'));
    function onS(){var r=reveal.getBoundingClientRect(),vh=innerHeight,p=Math.min(1,Math.max(0,(vh*.85-r.top)/(r.height+vh*.35)));
      var k=Math.round(p*sp.length);sp.forEach(function(s,i){s.classList.toggle('lit',i<k)});}
    addEventListener('scroll',onS,{passive:true});onS();}
})();
"""

PARTICLES = """
(function(){
  var c=document.getElementById('cestice'); if(!c||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var x=c.getContext('2d'),W,H,dpr=Math.min(devicePixelRatio||1,2),N=innerWidth<700?380:900,P=[],t=0,mode=0;
  function house(i){var s=Math.min(W,H)*.34,cx=W*.5,cy=H*.52,u=i/N*5,f=u%1,seg=Math.floor(u);
    var pts=[[-1,1,1,1],[1,1,1,-.2],[1,-.2,0,-1],[0,-1,-1,-.2],[-1,-.2,-1,1]][seg]||[-1,1,1,1];
    return [cx+s*(pts[0]+(pts[2]-pts[0])*f)+(Math.random()-.5)*6, cy+s*(pts[1]+(pts[3]-pts[1])*f)+(Math.random()-.5)*6];}
  function sphere(i){var a=i*2.399,r=Math.sqrt(i/N),R=Math.min(W,H)*.42;return [W*.5+Math.cos(a)*r*R,H*.5+Math.sin(a)*r*R*.95];}
  function resize(){W=c.clientWidth;H=c.clientHeight;c.width=W*dpr;c.height=H*dpr;x.setTransform(dpr,0,0,dpr,0,0);}
  resize();addEventListener('resize',resize);
  for(var i=0;i<N;i++){var p=sphere(i);P.push({x:p[0],y:p[1],h:i,g:Math.random()<.18});}
  addEventListener('scroll',function(){mode=scrollY>innerHeight*.35?1:0},{passive:true});
  (function f(){t+=.004;x.clearRect(0,0,W,H);
    for(var i=0;i<N;i++){var p=P[i],T=mode?house(i):sphere(i);
      var a=t+i*.0021,ox=Math.cos(a*3+i)*3,oy=Math.sin(a*2+i)*3;
      if(!mode){var dx=T[0]-W/2,dy=T[1]-H/2,ca=Math.cos(t),sa=Math.sin(t);T=[W/2+dx*ca-dy*sa*.15,H/2+dy+dx*sa*.15];}
      p.x+=(T[0]+ox-p.x)*.04;p.y+=(T[1]+oy-p.y)*.04;
      x.fillStyle=p.g?'rgba(217,173,82,.9)':'rgba(190,205,228,.55)';x.fillRect(p.x,p.y,p.g?1.8:1.3,p.g?1.8:1.3);}
    requestAnimationFrame(f);})();
})();
"""

THREE_FX = """
(function(){
  if(!window.THREE||matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var mob=innerWidth<700, N=mob?4200:10000;
  var r=new THREE.WebGLRenderer({canvas:document.getElementById('fx'),alpha:true,antialias:false});
  r.setPixelRatio(Math.min(devicePixelRatio,mob?1.5:2));
  var sc=new THREE.Scene(), cam=new THREE.PerspectiveCamera(50,1,.1,100); cam.position.z=7;
  function size(){r.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
  size(); addEventListener('resize',size);
  function R(){return Math.random()*2-1}
  function edges(E,i){var e=E[i%E.length],t=Math.random();return [e[0]+(e[3]-e[0])*t+R()*.02,e[1]+(e[4]-e[1])*t+R()*.02,e[2]+(e[5]-e[2])*t+R()*.02];}
  var HOUSE=(function(){var b=[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1],[-1,.5,-1],[1,.5,-1],[1,.5,1],[-1,.5,1]],E=[],P=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    P.forEach(function(q){E.push(b[q[0]].concat(b[q[1]]))});
    [[-1,.5,-1,0,1.4,-1],[1,.5,-1,0,1.4,-1],[-1,.5,1,0,1.4,1],[1,.5,1,0,1.4,1],[0,1.4,-1,0,1.4,1]].forEach(function(e){E.push(e)});return E;})();
  var SHIELD=(function(){var E=[],pts=[];for(var a=0;a<=20;a++){var t=a/20;pts.push([-1+2*t,1.1-.15*Math.sin(t*Math.PI),0]);}
    for(var k=0;k<=20;k++){var u=k/20;pts.push([1-u, 1.1-2.6*u*u*.4-1.5*u ,0]);}
    for(var j=0;j<=20;j++){var v=j/20;pts.push([0-v,-1.5+1.5*v+ (1.1-.6-(-1.5))*0 ,0]);}
    return pts;})();

  var P=[];
    function seg(a,b,w,c){P.push({w:w,c:c,f:function(){var t=Math.random();return [a[0]+(b[0]-a[0])*t+R()*.012,a[1]+(b[1]-a[1])*t+R()*.012,a[2]+(b[2]-a[2])*t+R()*.012];}});}
    function L(a,b){return Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2]);}
    function line(a,b,d,c){seg(a,b,L(a,b)*d,c);}
    function box(x0,x1,y0,y1,z0,z1,d,c){var v=[[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1]];
      [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]].forEach(function(e){line(v[e[0]],v[e[1]],d,c);});}
    function rect(x0,x1,y0,y1,z,d,c){line([x0,y0,z],[x1,y0,z],d,c);line([x1,y0,z],[x1,y1,z],d,c);line([x1,y1,z],[x0,y1,z],d,c);line([x0,y1,z],[x0,y0,z],d,c);}
    function ring(cx,cy,z,r,w,c){P.push({w:w,c:c,f:function(){var a=Math.random()*6.283;return [cx+Math.cos(a)*r,cy+Math.sin(a)*r,z+R()*.01];}});}
    function area(w,c,f){P.push({w:w,c:c,f:f});}
    function rnd(a,b){return a+Math.random()*(b-a);}
    function done(){var tot=0;P.forEach(function(p){tot+=p.w;});var acc=0;P.forEach(function(p){acc+=p.w/tot;p.e=acc;});var o=P;P=[];return o;}
  var COMP={};
  COMP.villa=function(){var G=-1.2;
    /* prizemlje, kat na prepust, ravni krov */
    box(-2.2,.4,G,-.35,-1.6,-.2,1,'w');
    box(-1.5,1.35,-.35,.42,-1.85,-.5,1,'w');
    box(-1.62,1.48,.42,.52,-1.97,-.4,.7,'w');
    /* staklene stijene sa svjetlom */
    area(2.4,'g',function(){return [rnd(-2.05,.25),rnd(G+.05,-.42),-.2-Math.random()*.6];});
    area(1.8,'g',function(){return [rnd(-1.35,1.2),rnd(-.28,.36),-.5-Math.random()*.6];});
    for(var x=-2.05;x<.3;x+=.47)line([x,G,-.2],[x,-.35,-.2],.5,'w');
    for(var x2=-1.35;x2<1.25;x2+=.43)line([x2,-.35,-.5],[x2,.42,-.5],.5,'w');
    /* balkon ograda (staklo) */
    line([-1.5,-.12,-.5+.001],[1.35,-.12,-.5],.4,'w');
    /* bazen */
    var px0=.75,px1=2.65,pz0=-1.5,pz1=.05;
    box(px0,px1,G-.06,G,pz0,pz1,.9,'w');
    area(3.4,'b',function(){var x=rnd(px0+.05,px1-.05),z=rnd(pz0+.05,pz1-.05);return [x,G-.03+Math.sin(x*7+z*5)*.015,z];});
    /* drvena terasa uz bazen */
    for(var k=0;k<6;k++)line([.45,G+.01,-1.5+k*.3],[.72,G+.01,-1.5+k*.3],.4,'s');
    /* dvorište: trava, staza i ograda */
    area(3,'n',function(){var x,z;do{x=rnd(-3,3);z=rnd(-2.2,2.1);}while((x>-2.25&&x<.45&&z>-1.65&&z<-.15)||(x>.7&&x<2.7&&z>-1.55&&z<.1)||(z>.45&&z<1.75&&x>-2.2&&x<1.4));return [x,G,z];});
    line([-2.2,G,.45],[1.4,G,.45],.35,'s');line([-2.2,G,1.75],[1.4,G,1.75],.35,'s');
    line([-3,G+.2,2.1],[-.6,G+.2,2.1],.3,'s');line([.9,G+.2,2.1],[3,G+.2,2.1],.3,'s');
    [-3,-1.8,-.6,.9,2,3].forEach(function(x){line([x,G,2.1],[x,G+.2,2.1],.4,'s');});
    /* stabla */
    [[-2.7,-1.9,.42],[2.85,-1.9,.38],[-2.75,.9,.34],[2.8,1.2,.3]].forEach(function(t){
      line([t[0],G,t[1]],[t[0],G+.5,t[1]],.5,'s');
      area(t[2]*2.6,'t',function(){var y=1-2*Math.random(),r=Math.sqrt(1-y*y),a=Math.random()*6.283,s=t[2]*(.85+Math.random()*.15);return [t[0]+Math.cos(a)*r*s,G+.5+t[2]+y*s,t[1]+Math.sin(a)*r*s];});});
    /* auti */
    function car(cx,cz,len,wid,sp){var x0=cx-len/2;
      function X(u){return x0+u*len;}
      function belt(u){return G+.24-.07*u-(u>.9?(u-.9)*.6:0)-(u<.06?(.06-u)*.8:0);}
      function roof(u){return G+.24+sp*Math.sin(Math.PI*(u-.3)/.42);}
      [-1,1].forEach(function(sd){var z=cz+sd*wid/2;
        area(.55,'c',function(){var u=Math.random();return [X(u),G+.07,z];});
        area(.7,'c',function(){var u=Math.random();return [X(u),belt(u),z];});
        area(.45,'c',function(){var u=rnd(.3,.72);return [X(u),roof(u),z*0.82+cz*0.18];});
        [.18,.82].forEach(function(u){area(.32,'w',function(){var a=Math.random()*6.283;return [X(u)+Math.cos(a)*.1,G+.1+Math.sin(a)*.1,z];});});
        area(.05,'g',function(){return [X(1)-.01,G+.17+R()*.02,z-sd*.05+R()*.03];});
        area(.05,'r',function(){return [X(0)+.01,G+.2+R()*.02,z-sd*.05+R()*.03];});});
      area(.35,'c',function(){var u=rnd(.32,.7);return [X(u),roof(u),rnd(cz-wid*.41,cz+wid*.41)];});
      area(.2,'c',function(){return [X(1),rnd(G+.07,belt(1)),rnd(cz-wid/2,cz+wid/2)];});
      area(.2,'c',function(){return [X(0),rnd(G+.07,belt(0)),rnd(cz-wid/2,cz+wid/2)];});}
    car(-1.35,1.1,1.2,.5,.12);car(.55,1.12,1.25,.52,.16);return done();};
  COMP.blind=function(){var W=1.45,top=1.45,bot=-1.6,down=-.15;
    box(-W-.12,W+.12,top,top+.38,-.2,.2,1.2,'w');
    area(.9,'s',function(){return [rnd(-W-.12,W+.12),rnd(top,top+.38),.2];});
    [-1,1].forEach(function(sd){line([sd*W,top,.05],[sd*W,bot,.05],.9,'w');line([sd*(W+.1),top,.05],[sd*(W+.1),bot,.05],.9,'w');line([sd*W,bot,.05],[sd*(W+.1),bot,.05],.9,'w');});
    for(var y=top-.02;y>down;y-=.13){line([-W,y,.05],[W,y,.05],1,'c');line([-W,y-.045,.07],[W,y-.045,.07],.45,'s');}
    line([-W,down,.06],[W,down,.06],1.4,'w');line([-.25,down-.03,.08],[.25,down-.03,.08],1.2,'g');
    rect(-W,W,bot,down,-.08,.8,'w');line([0,bot,-.08],[0,down,-.08],.8,'w');
    area(3.2,'g',function(){return [rnd(-W+.04,W-.04),rnd(bot+.04,down-.04),-.1-Math.random()*.5];});
    line([-W-.25,bot,.25],[W+.25,bot,.25],.9,'w');line([-W-.25,bot,.25],[-W-.25,bot,-.1],.9,'w');line([W+.25,bot,.25],[W+.25,bot,-.1],.9,'w');
    return done();};
  COMP.door=function(){var W=.95,H=1.95,z=0;
    rect(-W-.12,W+.12,-H,H+.12,z,1,'w');rect(-W,W,-H,H,z+.03,1,'c');
    rect(-W+.22,W-.22,.25,H-.25,z+.05,.7,'s');rect(-W+.22,W-.22,-H+.25,-.25,z+.05,.7,'s');
    area(1.6,'g',function(){return [rnd(-W+.3,-W+.48),rnd(-H+.35,H-.35),z+.04];});
    var lx=W-.32;
    rect(lx-.17,lx+.17,-.15,.62,z+.12,1.6,'w');
    area(.6,'d',function(){return [rnd(lx-.15,lx+.15),rnd(-.13,.6),z+.11];});
    for(var r=0;r<4;r++)for(var c=0;c<3;c++){(function(cx,cy){area(.07,'g',function(){var a=Math.random()*6.283,q=Math.random()*.025;return [cx+Math.cos(a)*q,cy+Math.sin(a)*q,z+.13];});})(lx-.09+c*.09,.5-r*.1);}
    ring(lx,-.42,z+.12,.07,.35,'w');line([lx,-.42,z+.16],[lx-.42,-.42,z+.16],.9,'w');line([lx-.42,-.42,z+.16],[lx-.42,-.38,z+.12],.5,'w');
    ring(lx,.72,z+.13,.035,.15,'b');
    return done();};
  COMP.lamp=function(){var top=1.75;
    line([-1.3,top,0],[1.3,top,0],.5,'s');
    [[0,.55,1.25],[.0,.15,.85],[0,-.2,.5]].forEach(function(q){var y=q[1],r=q[2];
      [[-1,0],[.5,.87],[.5,-.87]].forEach(function(d){line([d[0]*r,top,d[1]*r],[d[0]*r,y,d[1]*r],.15,'s');});
      P.push({w:r*3.2,c:'g',f:function(){var a=Math.random()*6.283;return [Math.cos(a)*r,y+R()*.015,Math.sin(a)*r];}});
      P.push({w:r*1.2,c:'w',f:function(){var a=Math.random()*6.283;return [Math.cos(a)*(r+.03),y+.03,Math.sin(a)*(r+.03)];}});});
    area(2.6,'g',function(){var h=Math.random(),a=Math.random()*6.283,rr=(.2+h*1.2)*Math.sqrt(Math.random());return [Math.cos(a)*rr,-.25-h*1.25,Math.sin(a)*rr];});
    var ty=-1.5;rect(-1.5,1.5,ty,ty,0,0,'w');
    box(-1.5,1.5,ty-.06,ty,-.7,.7,1,'w');[[-1.35,-.55],[1.35,-.55],[-1.35,.55],[1.35,.55]].forEach(function(l){line([l[0],ty-.06,l[1]],[l[0],-2.3,l[1]],.6,'w');});
    area(1.4,'g',function(){var a=Math.random()*6.283,rr=1.2*Math.sqrt(Math.random());return [Math.cos(a)*rr,ty+.01,Math.sin(a)*rr*.55];});
    return done();};
  COMP.heat=function(){var W=1.7,y0=-.55,y1=.75,z=0;
    rect(-W,W,y0,y1,z,1,'w');
    for(var x=-W+.12;x<W;x+=.17){line([x,y0+.05,z+.04],[x,y1-.05,z+.04],.55,'c');}
    line([-W,y1+.05,z],[W,y1+.05,z],.6,'s');line([-W,y0-.05,z],[W,y0-.05,z],.6,'s');
    [-W+.25,W-.25].forEach(function(x){line([x,y0-.05,z],[x,-1.05,z],.6,'w');});
    ring(W+.18,y1-.1,z,.12,.5,'w');line([W,y1-.1,z],[W+.06,y1-.1,z],.4,'w');
    area(.25,'o',function(){var a=Math.random()*6.283;return [W+.18+Math.cos(a)*.05,y1-.1+Math.sin(a)*.05,z+.02];});
    /* podno grijanje: zmija cijevi */
    var fy=-1.15;for(var k=0;k<7;k++){var zz=-1.1+k*.36;line([-2.2,fy,zz],[2.2,fy,zz],.9,'o');
      if(k<6){var xe=k%2?-2.2:2.2;P.push({w:.35,c:'o',f:(function(zz,xe){return function(){var a=Math.random()*Math.PI-Math.PI/2;return [xe+(xe>0?1:-1)*Math.cos(a)*.18,fy,zz+.18+Math.sin(a)*.18];};})(zz,xe)});}}
    rect(-2.5,2.5,fy-.02,fy-.02,0,0,'s');line([-2.5,fy-.02,-1.35],[2.5,fy-.02,-1.35],.5,'s');line([-2.5,fy-.02,1.35],[2.5,fy-.02,1.35],.5,'s');
    /* topli zrak koji se diže */
    for(var j=0;j<5;j++){(function(j){var bx=-1.3+j*.65;area(1.1,j%2?'o':'h',function(){var h=Math.random(),y=y1+.15+h*1.5;return [bx+Math.sin(h*7+j)*.18,y,Math.cos(h*5+j)*.12];});})(j);}
    return done();};
  var CC={};function compInit(name){var D=COMP[name](),pos=new Float32Array(N*3),col=new Float32Array(N*3),j=0,sc=name==='villa'?.82:.95,dy=name==='villa'?.2:0;
    for(var i=0;i<N;i++){var u=(i+.5)/N;while(D[j].e<u&&j<D.length-1)j++;var p=D[j].f(),c=VC[D[j].c];pos.set([p[0]*sc,p[1]*sc+dy,p[2]*sc],i*3);col.set([c.r,c.g,c.b],i*3);}
    CC[name]={p:pos,c:col};return CC[name];}
  var VC={w:new THREE.Color('#e3ebf7'),g:new THREE.Color('#f3c66b'),b:new THREE.Color('#3f9bff'),n:new THREE.Color('#4f7a63'),t:new THREE.Color('#8fc6a0'),s:new THREE.Color('#8f9fb6'),c:new THREE.Color('#d6dde8'),r:new THREE.Color('#ff4b4b'),d:new THREE.Color('#2c3a52'),o:new THREE.Color('#ff8a3d'),h:new THREE.Color('#ff4f2e')};
  var shapes={
    sphere:function(i){var y=1-2*(i+.5)/N,rr=Math.sqrt(1-y*y),a=i*2.39996;return [Math.cos(a)*rr*2.7,y*2.7,Math.sin(a)*rr*2.7];},
    dust:function(){return [R()*9,R()*5,R()*4-1];},
    house:function(i){return edges(HOUSE,i).map(function(v){return v*1.15});},
    bulb:function(i){if(i%4){var y=1-2*Math.random(),rr=Math.sqrt(1-y*y),a=Math.random()*6.283;return [Math.cos(a)*rr*1.2,y*1.2+.5,Math.sin(a)*rr*1.2];}
      var a2=Math.random()*6.283,h=Math.random();return [Math.cos(a2)*.5,-.9-h*.9,Math.sin(a2)*.5];},
    wave:function(i){var x=R()*3,z=R()*2;return [x,Math.sin(x*2.2)*.45*Math.cos(z*1.5),z];},
    curtain:function(i){var c=i%14,x=-1.8+c*.28,y=R()*1.7;return [x+Math.sin(y*3+c)*.06,y,Math.sin(c*1.3)*.25];},
    shield:function(i){var k=i%3,sd=i%2?1:-1,u=Math.random(),x,y;
      if(k===0){x=R()*1.2;y=1.2;}else if(u<.4){x=sd*1.2;y=1.2-u/.4;}else{var v=(u-.4)/.6;x=sd*1.2*(1-v*v);y=.2-1.8*v;}
      return [x+R()*.025,y+R()*.025,R()*.06];},
    eye:function(i){var a=Math.random()*6.283;if(i%3===0){var rr=.45*Math.sqrt(Math.random());return [Math.cos(a)*rr,Math.sin(a)*rr,0];}
      var k=i%2?1:-1;return [Math.cos(a)*1.9, k*Math.abs(Math.sin(a))*.9,0];}
  };
  var g=new THREE.BufferGeometry(),pos=new Float32Array(N*3),col=new Float32Array(N*3),tgt=new Float32Array(N*3),c1=new THREE.Color('#f3c66b'),c2=new THREE.Color('#9fb3d1');
  var base=new Float32Array(N*3),ctg=new Float32Array(N*3);for(var i=0;i<N;i++){var d=shapes.dust(i);pos.set(d,i*3);var c=Math.random()<.2?c1:c2;base.set([c.r,c.g,c.b],i*3);}col.set(base);ctg.set(base);
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  var m=new THREE.PointsMaterial({size:mob?.03:.022,vertexColors:true,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
  var pts=new THREE.Points(g,m);sc.add(pts);
  var offX=0,goalX=0,cur='';
  function shape(name,x){if(name===cur&&x===goalX)return;cur=name;goalX=x;if(COMP[name]){var C=CC[name]||compInit(name);tgt.set(C.p);ctg.set(C.c);return;}var f=shapes[name];for(var i=0;i<N;i++)tgt.set(f(i),i*3);ctg.set(base);}
  window.fielShape=shape;
  var secs=[].slice.call(document.querySelectorAll('[data-shape]'));
  function pick(){var best=null,bv=0;secs.forEach(function(s){var b=s.getBoundingClientRect(),v=Math.min(b.bottom,innerHeight)-Math.max(b.top,0);if(v>bv){bv=v;best=s;}});
    if(best&&!best.dataset.locked){var x=mob?0:parseFloat(best.dataset.x||0);shape(best.dataset.shape,x);}}
  addEventListener('scroll',pick,{passive:true});pick();
  var mx=0,my=0;addEventListener('pointermove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;});
  var t=0,ry=0,rx=0;(function f(){t+=.003;var p=g.attributes.position.array;
    var cc=g.attributes.color.array;for(var i=0;i<N*3;i++){p[i]+=(tgt[i]-p[i])*.045;cc[i]+=(ctg[i]-cc[i])*.05;}
    g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;offX+=(goalX-offX)*.05;
    pts.position.x=offX;var V=!!COMP[cur];ry+=((V?(cur==='villa'?-.55:-.35)+Math.sin(t*2)*.4:t*1.2)+mx*.5-ry)*.04;rx+=((cur==='villa'?.42:cur==='lamp'?.32:cur==='heat'?.28:V?.08:0)+my*.3+Math.sin(t)*.08-rx)*.04;pts.rotation.y=ry;pts.rotation.x=rx;
    r.render(sc,cam);requestAnimationFrame(f);})();
})();
(function(){
  var app=document.getElementById('app');if(app&&matchMedia('(pointer:fine)').matches){var w=app.parentElement;w.style.perspective='1200px';
    addEventListener('pointermove',function(e){var x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;app.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*8)+'deg)';});}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.15});
  [].forEach.call(document.querySelectorAll('.up'),function(el,i){el.style.transitionDelay=(i%4*80)+'ms';io.observe(el);});
  var sol=document.querySelector('.sol');if(sol){var cards=[].slice.call(sol.querySelectorAll('[data-s]'));
    function act(c){cards.forEach(function(k){k.classList.toggle('act',k===c)});sol.dataset.shape=c.dataset.s;sol.dataset.locked='';if(window.fielShape)window.fielShape(c.dataset.s,innerWidth<700?0:-2.6);}
    cards.forEach(function(c){c.addEventListener('mouseenter',function(){act(c)});c.addEventListener('click',function(){act(c)});c.addEventListener('focus',function(){act(c)});});}
  var top=document.querySelector('.top');addEventListener('scroll',function(){top.classList.toggle('scrolled',scrollY>40)},{passive:true});
  var clk=document.getElementById('sat');if(clk){(function u(){clk.textContent=new Date().toLocaleTimeString('hr-HR');setTimeout(u,1000)})();}
})();
"""

FX_CSS = """
#fx{position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none}
.fx main,.fx footer,.fx .top{position:relative;z-index:1}.fx .top{position:sticky}
.fx section,.fx .hero{background:transparent}.fx .band{background:rgba(14,24,40,.55)}
.fx .card{background:rgba(17,29,48,.72);backdrop-filter:blur(6px)}
.app{transition:transform .25s ease-out;transform-style:preserve-3d}
.top.scrolled{background:rgba(8,15,26,.7)}
.up{opacity:0;transform:translateY(28px);transition:opacity .8s,transform .8s}.up.in{opacity:1;transform:none}
.fx h1 em{background:linear-gradient(90deg,#f3c66b,#d9ad52,#fff1cf,#d9ad52);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sheen 6s linear infinite}
@keyframes sheen{to{background-position:-300% 0}}
.sol .wrap{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:start}
.sol-list{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sol-list [data-s]{cursor:pointer;text-align:left;font:inherit;color:inherit;background:rgba(17,29,48,.6);border:1px solid var(--line);border-radius:18px;padding:22px;display:grid;gap:8px;transition:background .3s,border-color .3s,transform .3s}
.sol-list [data-s].act{background:linear-gradient(160deg,rgba(217,173,82,.22),rgba(17,29,48,.7));border-color:rgba(217,173,82,.6);transform:translateY(-3px)}
.sol-list b{font:500 1.1rem Jost,sans-serif;color:var(--ink)}.sol-list span{color:var(--muted);font-size:.95rem}
.clock{font:500 .8rem "IBM Plex Mono",monospace;color:var(--muted);letter-spacing:.08em}
.glow-beam{position:absolute;width:900px;height:900px;left:-300px;top:-400px;background:radial-gradient(closest-side,rgba(66,92,122,.45),transparent);filter:blur(40px);pointer-events:none;z-index:0}
@media (max-width:960px){.sol .wrap{grid-template-columns:1fr}.sol-list{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){.up{opacity:1;transform:none}.fx h1 em{animation:none}}
"""

CSS = """
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;font:400 17px/1.6 "Source Sans 3",system-ui,sans-serif;background:var(--bg);color:var(--text)}
:root{--gold:#d9ad52;--gold2:#f3c66b}
.dark{--bg:#080f1a;--bg2:#0e1828;--card:#111d30;--text:#e9eef5;--muted:rgba(233,238,245,.62);--line:rgba(190,205,228,.12);--line2:rgba(190,205,228,.22);--ink:#f4f6fa}
.light{--bg:#fbfbfa;--bg2:#eef1f5;--card:#fff;--text:#33404f;--muted:#64717f;--line:#d9dfe7;--line2:#c3ccd8;--ink:#1f3550}
h1,h2,h3{font-family:Jost,system-ui,sans-serif;color:var(--ink);margin:0;font-weight:300;letter-spacing:-.025em;text-wrap:balance}
h1{font-size:clamp(2.4rem,6vw,4.6rem);line-height:1.02}h2{font-size:clamp(1.7rem,3.6vw,2.7rem);line-height:1.1}h3{font-weight:500;font-size:1.12rem;letter-spacing:0}
em{font-style:italic;font-weight:500;color:var(--gold2)} .light em{color:#b5862a}
p{margin:0}a{color:inherit}
.wrap{max-width:1180px;margin:0 auto;padding:0 max(20px,env(safe-area-inset-left,0px))}
.top{position:sticky;top:0;z-index:20;backdrop-filter:blur(12px);background:color-mix(in srgb,var(--bg) 75%,transparent);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;gap:28px;height:74px}.top .logo{height:42px;width:auto}
.top nav{display:flex;gap:26px;margin-left:auto;font:400 .95rem Jost,sans-serif}.top nav a{text-decoration:none;color:var(--muted)}
.cta{display:inline-flex;align-items:center;gap:10px;font:500 .95rem Jost,sans-serif;padding:11px 14px 11px 20px;border-radius:999px;border:1px solid var(--line2);text-decoration:none;color:var(--ink)}
.cta i{width:26px;height:26px;border-radius:50%;background:var(--gold);display:grid;place-items:center;font-style:normal;color:#0b1220}
.btn{display:inline-flex;align-items:center;justify-content:center;font:500 1rem Jost,sans-serif;padding:15px 26px;border-radius:999px;text-decoration:none;border:1px solid var(--line2);color:var(--ink)}
.btn.gold{background:var(--gold);border-color:var(--gold);color:#0b1220;box-shadow:0 12px 40px -14px rgba(217,173,82,.75)}
.hero{position:relative;padding:72px 0 88px;overflow:hidden}
.hero .wrap{display:grid;grid-template-columns:1fr 1.05fr;gap:56px;align-items:center;position:relative;z-index:2}
.hero p.lead{color:var(--muted);font-size:1.12rem;max-width:32em;margin-top:22px}
.hero .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:30px}
.facts{display:grid;grid-template-columns:repeat(3,auto);gap:28px;margin-top:44px;justify-content:start}
.facts b{display:block;font:400 1.35rem Jost,sans-serif;color:var(--ink)}.facts small{color:var(--muted);font-size:.85rem}
.ghost{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font:500 clamp(9rem,28vw,24rem) Jost,sans-serif;letter-spacing:.06em;color:var(--ink);opacity:.035;pointer-events:none;white-space:nowrap;z-index:1}
#cestice{position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none}
.label{font:500 .74rem "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}
/* aplikacija */
.app{background:linear-gradient(180deg,#0f1a2c,#0b1422);border:1px solid rgba(190,205,228,.16);border-radius:26px;padding:18px;color:#e9eef5;box-shadow:0 40px 90px -40px rgba(0,0,0,.8),0 0 0 8px rgba(255,255,255,.02);display:grid;gap:14px}
.app-top{display:flex;justify-content:space-between;align-items:center}.app-top b{font:500 1.1rem Jost,sans-serif;display:block}.app-top small{color:rgba(233,238,245,.55);font-size:.8rem}
.pill{font:400 .85rem Jost,sans-serif;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.06)}
.plan-svg{display:block;width:100%;height:auto}
.room{cursor:pointer;outline:none}.room .floor{fill:#0d1726;transition:fill .5s}.room:hover .floor,.room:focus-visible .floor{fill:#13213a}
.room .glow{opacity:0;transition:opacity .6s}.room.on .glow{opacity:1}.app.dim .room.on .glow{opacity:.45}
.room text{font:500 10px "IBM Plex Mono",monospace;letter-spacing:.08em;fill:rgba(233,238,245,.45)}.room.on text{fill:#fff7e6}
.room .bulb{fill:#2a3a55;transition:fill .4s}.room.on .bulb{fill:#f3c66b}
.furn rect{fill:none;stroke:rgba(190,205,228,.18);stroke-width:1.5}
.walls path{fill:none;stroke:#8fa1ba;stroke-width:4;stroke-linecap:square}.door-out{stroke:#d9ad52;stroke-width:4}
.scenes{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.scenes button{font:500 .82rem Jost,sans-serif;color:#e9eef5;background:rgba(255,255,255,.05);border:1px solid rgba(190,205,228,.12);border-radius:12px;padding:10px 4px;cursor:pointer}
.scenes button.on{background:var(--gold);color:#0b1220;border-color:var(--gold)}
.chips{display:flex;gap:14px;flex-wrap:wrap;font-size:.82rem;color:rgba(233,238,245,.7)}.chips i{display:inline-block;width:8px;height:8px;border-radius:50%;background:#5c6b80;margin-right:7px}
.chips i.ok,.chips .armed i{background:#4fbf7f}.hint{font:400 .75rem "IBM Plex Mono",monospace;color:rgba(233,238,245,.4);text-align:center}
/* sekcije */
section{padding:96px 0;position:relative}
.manifest{font:300 clamp(1.7rem,4vw,3rem)/1.25 Jost,sans-serif;max-width:22em;color:var(--ink);letter-spacing:-.02em}
.reveal span{opacity:.18;transition:opacity .35s}.reveal span.lit{opacity:1}
.grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:44px}
.card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:26px;display:grid;gap:10px;align-content:start}
.card p{color:var(--muted);font-size:.97rem}.card .n{font:300 2.4rem Jost,sans-serif;color:var(--gold)}
.icon{width:38px;height:38px;border-radius:12px;border:1px solid var(--line2);display:grid;place-items:center;color:var(--gold)}
.band{background:var(--bg2);border-block:1px solid var(--line)}
.contact .wrap{display:grid;grid-template-columns:1.2fr .8fr;gap:40px;align-items:end}
.phone{font:300 clamp(2rem,5vw,3.4rem) Jost,sans-serif;color:var(--ink);text-decoration:none;display:block;margin-top:18px}
footer{padding:56px 0 30px;border-top:1px solid var(--line);color:var(--muted);font-size:.9rem;position:relative;overflow:hidden}
footer .big{font:500 clamp(6rem,22vw,16rem)/0.8 Jost,sans-serif;letter-spacing:.05em;color:var(--ink);opacity:.05;margin-top:30px;white-space:nowrap}
.light .hero.dark-band{background:#080f1a;--text:#e9eef5;--muted:rgba(233,238,245,.62);--ink:#f4f6fa;--line2:rgba(190,205,228,.22);color:#e9eef5}
.light .hero.dark-band em{color:#f3c66b}
.light .top{background:color-mix(in srgb,#fbfbfa 85%,transparent)}
.light .card{border-radius:4px}.light .btn,.light .cta{border-radius:3px}.light .scenes button{border-radius:8px}
@media (max-width:960px){.top nav{display:none}.cta{margin-left:auto}.hero .wrap,.contact .wrap{grid-template-columns:1fr;gap:40px}.grid4{grid-template-columns:1fr 1fr}.hero{padding:40px 0 64px}section{padding:64px 0}}
@media (max-width:560px){.grid4{grid-template-columns:1fr}.facts{grid-template-columns:repeat(3,1fr);gap:12px}.facts b{font-size:1.1rem}.scenes{grid-template-columns:repeat(3,1fr)}.btn{width:100%}.top .logo{height:36px}.cta{padding:9px 10px 9px 16px;font-size:.88rem}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.reveal span{opacity:1}}
"""


DEMO_CSS = open(os.path.join(HERE, "demo.css")).read()
DEMO_JS = open(os.path.join(HERE, "demo.js")).read()
_cfg = json.load(open(os.path.join(OUT, "kuca3d", "kuca3d-config.json")))
_cfg.update({"transparent": True, "show_labels": True, "show_bar": True, "show_info": False, "zoom": 1.0, "lawn": True})
NAVB = [("home", "home", "Početna"), ("rooms", "grid", "Prostorije"), ("light", "bulb", "Rasvjeta"), ("music", "music", "Glazba"), ("more", "dots", "Više")]
_IC = {"home": "M3 11l9-7 9 7v9h-6v-6H9v6H3z", "grid": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
       "bulb": "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z",
       "music": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
       "dots": "M5 5h2v2H5zM11 5h2v2h-2zM17 5h2v2h-2zM5 11h2v2H5zM11 11h2v2h-2zM17 11h2v2h-2zM5 17h2v2H5zM11 17h2v2h-2zM17 17h2v2h-2z"}
DEMO = f"""<section class="demo-sec" id="demo-sekcija" data-shape="dust"><div class="wrap">
<div class="head"><div><span class="label">Isprobajte</span><h2 style="margin-top:14px">Upravljajte kućom <em>s mobitela</em></h2></div>
<p>Ovo je 3D model kuće koju smo opremili i aplikacija kakvu dobiju naši klijenti. Upalite svjetlo, spustite žaluzine ili odaberite scenu i pogledajte što se događa u kući. Možete kliknuti i sobu u modelu. Demo radi samo u vašem pregledniku.</p></div>
<div class="demo-stage" id="demo">
<div class="house"><div class="house-load">UČITAVAM 3D MODEL</div><span class="house-hint">Prizemlje i Kat gore desno: pogled u sobe, klik pali svjetlo</span></div>
<div class="ph" aria-label="Demo aplikacije"><div class="ph-in"><div class="ph-notch"></div><div class="ph-screen" aria-live="polite"></div>
<nav class="ph-nav">{''.join(f'<button data-tab="{k}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="{_IC[i]}"/></svg>{n}</button>' for k, i, n in NAVB)}</nav></div></div>
</div></div>
<script type="application/json" id="kuca3d-cfg">{json.dumps(_cfg)}</script></section>
"""

ICONS = {"net": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><path d="M3 3l18 18"/></svg>',
         "sub": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/><path d="M3 21L21 3"/></svg>',
         "free": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 12h8M12 8v8"/><circle cx="12" cy="12" r="9"/></svg>',
         "home": '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 11l9-7 9 7v9H3z"/><rect x="9" y="13" width="6" height="7"/></svg>'}

def page(theme, name, ghost=False, particles=False, dark_band=False):
    lg = LOGO_DARK if theme == "dark" else LOGO_LIGHT
    hero_cls = "hero dark-band" if dark_band else "hero"
    body = f"""<header class="top"><div class="wrap"><a href="#">{lg}</a>
<nav><a href="#">Pametna kuća</a><a href="#">Video nadzor i portafoni</a><a href="#">Za investitore</a><a href="#">Kako radimo</a><a href="#">O nama</a></nav>
<a class="cta" href="#kontakt">Besplatan dolazak <i>↗</i></a></div></header>
<main>
<div class="{hero_cls}">{'<canvas id="cestice" aria-hidden="true"></canvas>' if particles else ''}{'<div class="ghost" aria-hidden="true">FIEL</div>' if ghost else ''}
<div class="wrap"><div>
<span class="label">Zagreb i okolica</span>
<h1 style="margin-top:18px">Pametna kuća koja radi <em>i kad internet ne radi.</em></h1>
<p class="lead">Projektiramo i ugrađujemo pametne instalacije, video nadzor i portafone za stambene zgrade, kuće i poslovne prostore. Sustav radi u vašem objektu, bez mjesečne pretplate.</p>
<div class="row"><a class="btn gold" href="#kontakt">Dogovorite besplatan dolazak</a><a class="btn" href="#">Za investitore</a></div>
<div class="facts"><div><b>2 god.</b><small>jamstvo</small></div><div><b>0 €</b><small>pretplate</small></div><div><b>1 ekipa</b><small>ugradnja i održavanje</small></div></div>
</div>{APP}</div></div>
<section><div class="wrap"><span class="label">Zašto lokalno</span>
<p class="manifest {'reveal' if particles else ''}" style="margin-top:18px">Pametna kuća ne smije stati kad padne internet ili kad proizvođač promijeni uvjete. Zato sve radi na uređaju u vašem objektu.</p>
<div class="grid4">
<div class="card"><div class="icon">{ICONS['net']}</div><h3>Radi bez interneta</h3><p>Rasvjeta, grijanje, alarm i brave rade i kad veza padne.</p></div>
<div class="card"><div class="icon">{ICONS['sub']}</div><h3>Bez pretplate</h3><p>Za rad sustava ne plaćate ništa mjesečno.</p></div>
<div class="card"><div class="icon">{ICONS['free']}</div><h3>Bez vezanosti</h3><p>Opremu različitih proizvođača možete kombinirati i mijenjati.</p></div>
<div class="card"><div class="icon">{ICONS['home']}</div><h3>Podaci kod vas</h3><p>Snimke kamera i podaci spremaju se u objektu.</p></div>
</div></div></section>
<section class="band"><div class="wrap"><span class="label">Kako radimo</span><h2 style="margin-top:14px">Od prvog razgovora <em>do predaje</em></h2>
<div class="grid4">
<div class="card"><span class="n">01</span><h3>Dolazak</h3><p>Pogledamo objekt i dogovorimo što vam treba. Besplatno.</p></div>
<div class="card"><span class="n">02</span><h3>Projekt i ponuda</h3><p>Točna ponuda s popisom opreme i radova.</p></div>
<div class="card"><span class="n">03</span><h3>Ugradnja</h3><p>Ugradimo, povežemo i podesimo sustav.</p></div>
<div class="card"><span class="n">04</span><h3>Predaja i podrška</h3><p>Pokažemo kako se koristi i ostajemo dostupni.</p></div>
</div></div></section>
<section class="contact" id="kontakt"><div class="wrap"><div><span class="label">Kontakt</span><h2 style="margin-top:14px">Recite nam <em>što planirate</em></h2><a class="phone" href="tel:+38598802490">+385 98 802 490</a></div>
<div class="row" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn gold" href="tel:+38598802490">Nazovite</a><a class="btn" href="#">Pošaljite upit</a></div></div></section>
</main>
<footer><div class="wrap">© 2026 Fiel d.o.o. · Rušiščak 5b, Zagreb{'<div class="big" aria-hidden="true">FIEL</div>' if ghost else ''}</div></footer>
<script>{JS}{PARTICLES if particles else ''}</script>"""
    return f"""<!doctype html><html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{name} | Fiel</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;1,500&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body class="{theme}">{body}</body></html>"""


def page3():
    html = page("dark", "Varijanta 3: Puni efekt", ghost=True)
    html = html.replace(APP, '<div class="hero-side" aria-hidden="true"></div>')
    html = html.replace(LOGO_DARK, '<img class="logo logo-img" src="fiel-logo.svg" alt="Fiel d.o.o." width="1222" height="600">', 1)
    html = html.replace('</style>', '.top .logo-img{height:60px;width:auto;display:block}@media (max-width:560px){.top .logo-img{height:44px}}</style>', 1)
    html = html.replace('<a class="btn" href="#">Za investitore</a>', '<a class="btn" href="#demo-sekcija">Isprobajte demo ↓</a>', 1)
    html = html.replace('<section><div class="wrap"><span class="label">Zašto lokalno</span>', DEMO + '<section><div class="wrap"><span class="label">Zašto lokalno</span>', 1)
    html = html.replace('</style>', DEMO_CSS + '</style>', 1)
    html = html.replace('</body>', '<script>' + DEMO_JS + '</script></body>')
    html = html.replace('<body class="dark">','<body class="dark fx"><canvas id="fx" aria-hidden="true"></canvas>')
    html = html.replace('</style>', FX_CSS + '</style>')
    html = html.replace('<div class="hero">','<div class="hero" data-shape="sphere" data-x="2.1"><div class="glow-beam" aria-hidden="true"></div>')
    html = html.replace('<section><div class="wrap"><span class="label">Zašto lokalno</span>','<section data-shape="dust"><div class="wrap"><span class="label">Zašto lokalno</span>')
    html = html.replace('class="manifest "','class="manifest reveal"')
    html = html.replace('<div class="card">','<div class="card up">')
    sol = """<section class="sol" data-shape="lamp" data-x="-2.6"><div class="wrap"><div><span class="label">Rješenja</span><h2 style="margin-top:14px">Jedan sustav <em>za cijeli objekt</em></h2>
<p style="color:var(--muted);margin-top:16px;max-width:28em">Prijeđite mišem ili dodirnite karticu.</p></div>
<div class="sol-list">
<button data-s="lamp" class="act"><b>Rasvjeta</b><span>Scene, raspored po dobu dana i prisutnost.</span></button>
<button data-s="heat"><b>Grijanje i hlađenje</b><span>Temperatura po prostorijama i raspored po danima.</span></button>
<button data-s="blind"><b>Rolete</b><span>Prema suncu, dobu dana ili jednim dodirom.</span></button>
<button data-s="door"><b>Alarm i brave</b><span>Jedan dodir: sve zaključano, alarm uključen.</span></button>
<button data-s="eye"><b>Kamere i portafon</b><span>Slika s ulaza i kamera na zaslonu i mobitelu.</span></button>
<button data-s="house"><b>Cijela kuća</b><span>Sve na jednom zaslonu, radi i bez interneta.</span></button>
</div></div></section>"""
    html = html.replace('<section class="band">', sol + '\n<section class="band" data-shape="villa" data-x="2.6">')
    html = html.replace('<section class="contact" id="kontakt">','<section class="contact" id="kontakt" data-shape="villa" data-x="2.9">')
    html = html.replace('© 2026 Fiel d.o.o. · Rušiščak 5b, Zagreb','© 2026 Fiel d.o.o. · Rušiščak 5b, Zagreb · <span class="clock">ZAGREB, SADA <span id="sat"></span></span>')
    html = html.replace('<script>','<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script><script>')
    html = html.replace('</script></body>', THREE_FX + '</script></body>')
    return html

open(os.path.join(OUT, "varijanta-1.html"), "w").write(page("dark", "Varijanta 1: Noćni tlocrt", ghost=True))
open(os.path.join(OUT, "varijanta-2.html"), "w").write(page("light", "Varijanta 2: Svijetla s tamnim vrhom", dark_band=True))
open(os.path.join(OUT, "varijanta-3.html"), "w").write(page3())
print("ok")

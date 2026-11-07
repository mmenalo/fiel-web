"""Tri futuristične varijante početne (po uzoru na principe leoautomize.tech, u Fielovim bojama).
Pokretanje: python3 dizajn/futur/build.py  → dizajn/futur/out/"""
import os, sys
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

open(os.path.join(OUT, "varijanta-1.html"), "w").write(page("dark", "Varijanta 1: Noćni tlocrt", ghost=True))
open(os.path.join(OUT, "varijanta-2.html"), "w").write(page("light", "Varijanta 2: Svijetla s tamnim vrhom", dark_band=True))
open(os.path.join(OUT, "varijanta-3.html"), "w").write(page("dark", "Varijanta 3: Puni efekt", ghost=True, particles=True))
print("ok")

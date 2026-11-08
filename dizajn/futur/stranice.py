"""Gradi ostale stranice u stilu Varijante 3 (tamno, čestice).
Sadržaj dolazi iz web/src/pages/02..08, a okvir (CSS, zaglavlje, čestice) iz build.py.
Pokretanje: python3 dizajn/futur/stranice.py  (prvo pokreće build.py)
"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import build as B  # noqa: E402  (gradi i varijante)

SRC = os.path.join(HERE, "..", "..", "web", "src", "pages")
OUT = B.OUT
NAV = [("pametna-kuca", "Pametna kuća"), ("video-nadzor-i-portafoni", "Video nadzor i portafoni"),
       ("za-investitore", "Za investitore"), ("kako-radimo", "Kako radimo"), ("o-nama", "O nama")]
HOME = "varijanta-3.html"

v3 = open(os.path.join(OUT, "varijanta-3.html")).read()
HEAD = v3[:v3.index("<body")]
FX_SCRIPT = v3[v3.index("(function(){var R=Math.random") if "(function(){var R=Math.random" in v3 else 0:0]
# skripta čestica: zadnji <script> blok u varijanti 3 sadrži demo + čestice; čestice su B.THREE_FX
THREE = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'


def fig(src, alt, cap, cls="dash"):
    return f'<figure class="{cls} up"><div class="glass"><img src="dash/{src}" alt="{alt}" loading="lazy"></div><figcaption>{cap}</figcaption></figure>'


def phone(src, alt, cap):
    return f'<figure class="dphone up"><div class="pframe"><img src="dash/{src}" alt="{alt}" loading="lazy"></div><figcaption>{cap}</figcaption></figure>'


GALLERY = """<section class="gal" data-shape="dust"><div class="wrap"><div class="head"><span class="label">Stvarni zaslon</span><h2>Ovako izgleda <em>zidni zaslon</em> u kući</h2><p>Snimke zaslona iz kuće koju smo opremili. Imena ukućana i slike s kamera su skriveni.</p></div></div>
<div class="gal-row" tabindex="0" aria-label="Snimke zaslona, pomaknite vodoravno">""" + "".join(
    fig(s, a, c, "dash slide") for s, a, c in [
        ("tab-rasvjeta.jpg", "Zaslon rasvjete po prostorijama", "Rasvjeta po katovima i scene"),
        ("tab-grijanje.jpg", "Zaslon rasporeda grijanja", "Raspored grijanja po prostorijama"),
        ("tab-zaluzine.jpg", "Zaslon žaluzina", "Žaluzine i lamele"),
        ("tab-navodnjavanje.jpg", "Zaslon navodnjavanja", "Navodnjavanje po zonama"),
        ("tab-tv.jpg", "Zaslon TV daljinskog", "TV i glazba s istog zaslona"),
    ]) + "</div></section>"

CONTACT = """<section class="upit" id="kontakt" data-shape="villa" data-x="2.9" data-mshape="dust">
  <div class="wrap upit-grid">
    <div>
      <span class="label">Kontakt</span>
      <h2 style="margin-top:14px">Recite nam <em>što planirate</em></h2>
      <p style="margin-top:16px">Nazovite ili pošaljite upit. Dogovorit ćemo besplatan dolazak na lokaciju, bez obveze.</p>
      <a class="phone" href="tel:+38598802490">+385 98 802 490</a>
    </div>
    <form class="form" novalidate>
      <div class="row">
        <label for="k-ime">Ime i prezime<input id="k-ime" name="ime" autocomplete="name" required></label>
        <label for="k-kontakt">Telefon ili e-mail<input id="k-kontakt" name="kontakt" required></label>
      </div>
      <label for="k-objekt">Vrsta objekta<select id="k-objekt" name="objekt"><option>Stan</option><option>Kuća ili penthouse</option><option>Stambena zgrada (investitor)</option><option>Poslovni prostor</option></select></label>
      <label for="k-poruka">Poruka<textarea id="k-poruka" name="poruka" placeholder="Npr. rasvjeta i rolete u stanu od 90 m² i video portafon."></textarea></label>
      <button class="btn gold" type="submit">Pošalji upit</button>
      <p class="sent" hidden>Ovo je pregled stranice, upit nije poslan. Na pravoj stranici upit stiže na vaš e-mail.</p>
    </form>
  </div>
</section>"""

PLAN_DARK = None
try:
    sys.path.insert(0, os.path.join(HERE, "..", "..", "web", "src"))
    import importlib.util
    spec = importlib.util.spec_from_file_location("oldbuild_plan", os.path.join(HERE, "..", "..", "web", "src", "build.py"))
    txt = open(os.path.join(HERE, "..", "..", "web", "src", "build.py")).read()
    m = re.search(r'PLAN = """(.*?)"""', txt, re.S)
    PLAN_DARK = (m.group(1).replace("#1f3550", "#e9eef5").replace("#9aa8b9", "#5b6f8c").replace("#64717f", "#9fb0c6")
                 .replace('fill="#fff"', 'fill="#0e1828"').replace("#c79a3a", "#f3c66b").replace('class="plan"', 'class="plan dplan up"'))
except Exception as e:  # noqa
    PLAN_DARK = ""

# po stranici: oblik u zaglavlju, zamjene sadržaja
PAGES = {
    "pametna-kuca": dict(shape="villa", x="2.6",
        hero_fig=fig("tab-kuca3d.jpg", "Zidni zaslon s 3D tlocrtom kuće, vremenom, alarmom i stanjem kuće", "Zidni zaslon · početna s 3D tlocrtom", "dash hero-dash"),
        phone=phone("mob-zaluzine.jpg", "Aplikacija na mobitelu: žaluzine i zavjesa", "Mobitel · žaluzine i zavjesa"),
        gallery=True, shapes=["lamp", "blind", "heat"]),
    "video-nadzor-i-portafoni": dict(shape="cam", x="2.4", hero_fig="", shapes=["cam", "door", "eye"]),
    "za-investitore": dict(shape="zgrada", x="2.6", hero_fig="", shapes=["dust", "zgrada", "dust"]),
    "kako-radimo": dict(shape="tablet0", x="0", hero_fig="", shapes=["lamp", "dust"],
        extra=fig("tab-grijanje.jpg", "Zaslon rasporeda grijanja", "Primjer: raspored grijanja koji podesimo pri predaji", "dash wide")),
    "o-nama": dict(shape="door", x="2.6", hero_fig="", shapes=["dust", "villa"]),
    "kontakt": dict(shape="villa", x="2.8", hero_fig="", shapes=["dust"]),
    "pravila-privatnosti": dict(shape="dust", x="0", hero_fig="", shapes=["dust"]),
}

CSS = """
/* podstranice */
.pgh{position:relative;padding:88px 0 56px}.pgh .wrap{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.pgh h1{margin-top:16px;font-size:clamp(2.2rem,5vw,3.9rem);line-height:1.05}.pgh p.lead{color:var(--muted);font-size:1.12rem;max-width:34em;margin-top:22px}
.pgh .row{display:flex;gap:12px;flex-wrap:wrap;margin-top:28px}.pgh .btn{width:auto}
.pgh.solo .wrap{grid-template-columns:minmax(0,640px)}
.pgh .shape-space{min-height:380px}
.fx .sub section{padding:84px 0}.fx .sub section.tight{padding:48px 0}
.sub .head{display:grid;gap:12px;margin-bottom:34px;max-width:44em}.sub .head h2 em,.sub h2 em{color:#f3c66b;font-style:italic}
.sub .head p{color:var(--muted)}
.sub .split{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start}
.sub .lined{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sub .lined.three{grid-template-columns:repeat(3,1fr)}
.sub .lined>div{background:rgba(17,29,48,.66);backdrop-filter:blur(6px);border:1px solid var(--line);border-radius:18px;padding:22px;display:grid;gap:8px;align-content:start;transition:border-color .3s,transform .3s}
.sub .lined>div:hover{border-color:rgba(217,173,82,.5);transform:translateY(-3px)}
.sub .lined h3{font:500 1.1rem Jost,sans-serif;color:var(--ink)}.sub .lined p{color:var(--muted);font-size:.97rem}
.sub .tinted{background:linear-gradient(180deg,rgba(14,24,40,.0),rgba(14,24,40,.6) 20%,rgba(14,24,40,.6) 80%,rgba(14,24,40,0))}
.sub ol.day{list-style:none;margin:0;padding:0;display:grid;gap:0;border-left:1px solid rgba(217,173,82,.35)}
.sub ol.day li{display:grid;grid-template-columns:80px 1fr;gap:16px;padding:14px 0 14px 22px;position:relative}
.sub ol.day li::before{content:"";position:absolute;left:-5px;top:22px;width:9px;height:9px;border-radius:50%;background:#f3c66b;box-shadow:0 0 12px #f3c66b}
.sub ol.day time{font:500 .95rem "IBM Plex Mono",monospace;color:#f3c66b}.sub ol.day p{color:var(--text)}
.sub ul{color:var(--text)}.sub li{margin:2px 0}
.check{background:rgba(243,198,107,.14);border:1px dashed rgba(243,198,107,.6);color:#f3d38a;border-radius:6px;padding:1px 6px;font-size:.85em}
.warranty{display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:center;background:linear-gradient(135deg,rgba(217,173,82,.16),rgba(17,29,48,.6));border:1px solid rgba(217,173,82,.35);border-radius:24px;padding:36px 40px!important;max-width:1140px}
.warranty strong{font:300 clamp(2.4rem,6vw,4rem)/1 Jost,sans-serif;color:#f3c66b;display:grid}.warranty strong small{font:500 .8rem "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:8px}
.warranty p{color:var(--text);font-size:1.05rem}
.steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px;counter-reset:s}
.steps li{counter-increment:s;background:rgba(17,29,48,.66);border:1px solid var(--line);border-radius:18px;padding:22px;display:grid;gap:8px;align-content:start}
.steps li::before{content:"0" counter(s);font:500 .8rem "IBM Plex Mono",monospace;color:#f3c66b}.steps h3{font:500 1.08rem Jost,sans-serif}.steps p{color:var(--muted)}
.roles{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.roles>div{background:rgba(17,29,48,.66);border:1px solid var(--line);border-radius:18px;padding:24px}
.roles>div:first-child{border-color:rgba(217,173,82,.55);background:linear-gradient(160deg,rgba(217,173,82,.18),rgba(17,29,48,.7))}
.roles h3{font:500 1.15rem Jost,sans-serif;margin-bottom:10px}.roles ul{margin:0;padding-left:18px;display:grid;gap:6px;color:var(--muted)}
.process{display:grid;gap:14px}.process article{display:grid;grid-template-columns:90px 1fr;gap:24px;align-items:start;background:rgba(17,29,48,.62);border:1px solid var(--line);border-radius:22px;padding:28px}
.process .n{font:200 3.4rem/1 Jost,sans-serif;color:#f3c66b;text-shadow:0 0 24px rgba(243,198,107,.45)}.process h2{font-size:1.5rem}.process p{color:var(--muted);margin-top:8px}
.faq{display:grid;gap:10px}.faq details{background:rgba(17,29,48,.66);border:1px solid var(--line);border-radius:16px;padding:0 20px}
.faq summary{cursor:pointer;padding:18px 0;font:500 1.05rem Jost,sans-serif;list-style:none;display:flex;justify-content:space-between;gap:16px}.faq summary::after{content:"+";color:#f3c66b;font-size:1.3rem;line-height:1}
.faq details[open] summary::after{content:"−"}.faq details>div{padding:0 0 18px;color:var(--muted);display:grid;gap:8px}
.narrow{max-width:820px!important}
.person-photo{min-height:380px;border-radius:24px;border:1px dashed rgba(243,198,107,.5);display:grid;place-items:center;text-align:center;padding:30px;color:#f3d38a;background:rgba(17,29,48,.5)}
.info{display:grid;grid-template-columns:1fr 1fr;gap:12px}.info>div{background:rgba(17,29,48,.66);border:1px solid var(--line);border-radius:16px;padding:18px;display:grid;gap:6px}
.info strong{font:500 1.1rem Jost,sans-serif}.info a{color:inherit}
.upit-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start}
.form{display:grid;gap:14px;background:rgba(17,29,48,.72);backdrop-filter:blur(8px);border:1px solid var(--line2);border-radius:24px;padding:28px}
.form .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.form label{display:grid;gap:6px;font:500 .8rem "IBM Plex Mono",monospace;letter-spacing:.06em;color:var(--muted);text-transform:uppercase}
.form input,.form select,.form textarea{font:400 1rem "Source Sans 3",sans-serif;color:var(--ink);background:rgba(5,9,16,.6);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;text-transform:none;letter-spacing:0}
.form textarea{min-height:110px;resize:vertical}.form input:focus,.form select:focus,.form textarea:focus{outline:2px solid rgba(243,198,107,.6);border-color:transparent}
.form .consent{display:flex;gap:10px;align-items:center;text-transform:none;font:400 .95rem "Source Sans 3",sans-serif}.form .consent input{width:18px;height:18px}
.form .consent a{color:#f3c66b}.form .btn{width:100%}.sent{color:#9ff0c2}
.upit .phone,.sub .phone{display:block;font:300 clamp(2rem,4.5vw,3.2rem) Jost,sans-serif;color:var(--ink);text-decoration:none;margin-top:22px}
/* snimke zaslona */
.dash{margin:0;display:grid;gap:10px}.dash .glass{border-radius:22px;padding:10px;background:linear-gradient(160deg,rgba(124,92,255,.25),rgba(17,29,48,.7));border:1px solid rgba(160,150,255,.3);box-shadow:0 40px 100px -40px rgba(0,0,0,.9),0 0 80px -30px rgba(124,92,255,.55);transition:transform .4s}
.dash img{display:block;width:100%;height:auto;border-radius:14px}
.dash figcaption,.dphone figcaption,.plan figcaption{font:500 .72rem "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:center}
.hero-dash .glass{transform:perspective(1400px) rotateY(-9deg) rotateX(3deg)}.hero-dash:hover .glass{transform:perspective(1400px) rotateY(-3deg)}
.dash.wide{margin:40px auto 0;max-width:1140px;padding:0 20px}
.dphone{margin:0;display:grid;gap:10px;justify-items:center}.pframe{width:min(300px,80vw);border-radius:42px;padding:10px;background:#05070d;border:1px solid rgba(190,205,228,.2);box-shadow:0 40px 100px -40px rgba(0,0,0,.9),0 0 70px -25px rgba(124,92,255,.5)}
.pframe img{display:block;width:100%;border-radius:32px}
.gal{padding-bottom:40px!important}.gal-row{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;padding:10px max(20px,calc((100vw - 1180px)/2)) 30px;scrollbar-width:thin}
.gal-row .slide{flex:0 0 min(720px,86vw);scroll-snap-align:center}
.dplan{margin:0}.dplan svg{width:100%;height:auto;background:rgba(14,24,40,.6);border:1px solid var(--line);border-radius:20px;padding:10px}
.legal .wrap{max-width:820px}.legal h2{font-size:1.4rem;margin:28px 0 8px}.legal p,.legal li{color:var(--muted)}
.top nav a[aria-current]{color:#f3c66b}
@media (max-width:960px){.pgh .wrap,.sub .split,.upit-grid{grid-template-columns:1fr;gap:36px}.sub .lined,.sub .lined.three,.roles,.steps,.info{grid-template-columns:1fr}
 .warranty{grid-template-columns:1fr;gap:16px;padding:26px!important}.process article{grid-template-columns:1fr;gap:6px}.pgh{padding:48px 0 24px}.pgh .shape-space{min-height:280px}.form .row{grid-template-columns:1fr}.hero-dash .glass{transform:none}}
"""

FORM_JS = """<script>[].forEach.call(document.querySelectorAll('form.form'),function(f){f.addEventListener('submit',function(e){e.preventDefault();var s=f.querySelector('.sent');if(s)s.hidden=false;});});
(function(){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});[].forEach.call(document.querySelectorAll('.up'),function(el){io.observe(el);});
var t=document.querySelector('.top');addEventListener('scroll',function(){t.classList.toggle('scrolled',scrollY>10);},{passive:true});
var s=document.getElementById('sat');function tick(){if(s)s.textContent=new Date().toLocaleTimeString('hr-HR');}tick();setInterval(tick,1000);})();</script>"""


def header(slug):
    nav = "".join(f'<a href="{s}.html"{" aria-current=\"page\"" if s == slug else ""}>{n}</a>' for s, n in NAV)
    return (f'<header class="top"><div class="wrap"><a href="{HOME}"><img class="logo logo-img" src="fiel-logo.svg" alt="Fiel d.o.o. – početna" width="1222" height="600"></a>'
            f'<nav>{nav}</nav><a class="cta" href="kontakt.html">Besplatan dolazak <i>↗</i></a></div></header>')


FOOTER = ('<footer><div class="wrap">© 2026 Fiel d.o.o. · Rušiščak 5b, Zagreb · <a href="pravila-privatnosti.html" style="color:inherit">Pravila privatnosti</a> · '
          '<span class="clock">ZAGREB, SADA <span id="sat"></span></span><div class="big" aria-hidden="true">FIEL</div></div></footer>')


def convert(slug, body, P):
    # zaglavlje stranice
    m = re.search(r'<div class="(?:page-head[^"]*|wrap hero)">(.*?)</div>\s*</div>\s*(?:</div>\s*)?(?=<section|%%)', body, re.S)
    head_html = m.group(0) if m else ""
    label = re.search(r'<span class="label">(.*?)</span>', head_html)
    h1 = re.search(r'<h1>(.*?)</h1>', head_html, re.S)
    lead = re.search(r'<h1>.*?</h1>\s*<p>(.*?)</p>', head_html, re.S)
    cta = re.search(r'<div class="cta-row">(.*?)</div>', head_html, re.S)
    ctah = cta.group(1).replace('class="btn btn-solid"', 'class="btn gold"') if cta else ''
    if slug not in ("kontakt", "pravila-privatnosti"):
        ctah += '<a class="btn" href="tel:+38598802490">+385 98 802 490</a>'
    right = P["hero_fig"] or '<div class="shape-space mslot" aria-hidden="true"></div>'
    solo = "" if right else " solo"
    title = h1.group(1) if h1 else ""
    # zadnju riječ ili dvije naslova u zlatni kurziv
    w = title.split(" ")
    if len(w) > 3:
        k = 2 if len(w) > 5 else 1
        title = " ".join(w[:-k]) + " <em>" + " ".join(w[-k:]) + "</em>"
    hero = (f'<div class="pgh" data-shape="{P["shape"]}" data-x="{P["x"]}" data-mshape="dust"><div class="glow-beam" aria-hidden="true"></div><div class="wrap"><div>'
            f'<span class="label">{label.group(1) if label else ""}</span><h1>{title}</h1>'
            f'{"<p class=\"lead\">" + lead.group(1) + "</p>" if lead else ""}'
            f'{"<div class=\"row\">" + ctah + "</div>" if ctah else ""}</div>{right}</div></div>')
    rest = body[m.end():] if m else body
    # zamjene
    rest = rest.replace("%%CONTACT%%", CONTACT).replace("%%PLAN%%", PLAN_DARK).replace("%%PHONE_HOME%%", P.get("phone", ""))
    rest = rest.replace("%%ILL_PRESJEK%%", "")
    rest = re.sub(r'<figure class="photo">.*?</figure>', '', rest, flags=re.S)
    rest = rest.replace('class="btn btn-solid"', 'class="btn gold"').replace('<section class="contact" id="kontakt">', '<section class="upit" id="kontakt" data-shape="villa" data-x="2.9" data-mshape="dust">')
    rest = rest.replace('class="wrap contact-grid"', 'class="wrap upit-grid"')
    rest = rest.replace('<form class="form" novalidate>', '<form class="form up" novalidate>')
    rest = rest.replace('<button class="btn" type="submit">', '<button class="btn gold" type="submit">')
    # oblici po sekcijama
    shapes = iter(P["shapes"] * 4)
    def sec(mo):
        attrs = mo.group(1)
        if "data-shape" in attrs:
            return mo.group(0)
        s = next(shapes)
        side = "-2.6" if s not in ("dust",) else "0"
        return f'<section{attrs} data-shape="{s}" data-x="{side}" data-mshape="dust">'
    rest = re.sub(r'<section([^>]*)>', sec, rest)
    if P.get("gallery"):
        rest = rest.replace('<section class="tinted"', GALLERY + '\n<section class="tinted"', 1)
    if P.get("extra"):
        rest = rest.replace('</div>\n</section>', '</div>' + P["extra"] + '\n</div>\n</section>', 1) if False else rest.replace('<section class="tight"', '<section class="tight" ', 1)
        rest = re.sub(r'(<div class="process">.*?</div>\s*</div>)', lambda mm: mm.group(1) + P["extra"], rest, count=1, flags=re.S)
    rest = rest.replace('<div class="lined', '<div class="lined up', 1)
    return hero + rest


def build_page(fn):
    raw = open(os.path.join(SRC, fn)).read()
    slug = re.search(r"slug: (\S+)", raw).group(1)
    title = re.search(r"title: (.*?) -->", raw).group(1)
    desc = re.search(r"desc: (.*?) -->", raw).group(1)
    body = re.sub(r"^<!--.*?-->\s*", "", raw, flags=re.M)
    P = PAGES.get(slug, PAGES["pravila-privatnosti"])
    if slug == "kako-radimo":
        P = dict(P, shape="lamp", x="2.6")
    main = convert(slug, body, P)
    if slug == "pravila-privatnosti":
        main = main.replace("<section", '<section class="legal"', 1) if 'class="legal"' not in main else main
    head = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", HEAD, count=1, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{desc}">', head, count=1)
    if '<meta name="description"' not in head:
        head = head.replace("</title>", f'</title>\n<meta name="description" content="{desc}">', 1)
    head = head.replace("</style>", CSS + "</style>", 1)
    html = (head + '<body class="dark fx"><canvas id="fx" aria-hidden="true"></canvas>' + header(slug) +
            f'<main class="sub">{main}</main>' + FOOTER + THREE + "<script>" + B.THREE_FX + "</script>" + FORM_JS + "</body></html>")
    open(os.path.join(OUT, slug + ".html"), "w").write(html)
    return slug


done = [build_page(f) for f in sorted(os.listdir(SRC)) if f.endswith(".html") and not f.startswith("01-")]

# početna: poveznice na prave stranice
v3 = open(os.path.join(OUT, "varijanta-3.html")).read()
for s, n in NAV:
    v3 = v3.replace(f'<a href="#">{n}</a>', f'<a href="{s}.html">{n}</a>', 1)
v3 = v3.replace('<a class="cta" href="#kontakt">', '<a class="cta" href="kontakt.html">', 1)
v3 = v3.replace('<a class="btn" href="#">Pošaljite upit</a>', '<a class="btn" href="kontakt.html">Pošaljite upit</a>')
open(os.path.join(OUT, "varijanta-3.html"), "w").write(v3)
print("stranice:", done)

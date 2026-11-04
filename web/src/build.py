"""Gradi stranice Fiel d.o.o. iz src/pages/*.html u web/.

Svaka stranica u src/pages počinje s tri retka:
<!-- slug: pametna-kuca -->
<!-- title: ... -->
<!-- desc: ... -->
Ostatak je sadržaj <main>. Oznake %%PLAN%% i %%CONTACT%% zamjenjuju se zajedničkim dijelovima.
Pokretanje: python3 web/src/build.py
"""
import os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(OUT, "..", "dizajn", "src"))
from logo import logo, mark  # noqa: E402

NAV = [
    ("pametna-kuca", "Pametna kuća"),
    ("video-nadzor-i-portafoni", "Video nadzor i portafoni"),
    ("za-investitore", "Za investitore"),
    ("kako-radimo", "Kako radimo"),
    ("o-nama", "O nama"),
]
LOGO = logo("#1f3550", "#7c8da6", "#c79a3a", title="Fiel d.o.o. – početna")

PLAN = """<figure class="plan">
  <svg viewBox="0 0 520 380" role="img" aria-label="Tlocrt stana: rasvjeta, rolete, termostat, portafon, brava i senzor vode spojeni su na upravljački uređaj u stanu">
    <g fill="none" stroke="#1f3550" stroke-width="3"><path d="M20 20H500V360H20Z"/><path d="M260 20V150M260 210V360M20 200H200M310 200H500"/></g>
    <g fill="none" stroke="#9aa8b9" stroke-width="1.2" stroke-dasharray="4 5"><path d="M240 260L100 110M240 260L420 100M240 260L410 290M240 260L90 300M240 260L150 360M240 260L360 20"/></g>
    <g font-family="IBM Plex Mono, monospace" font-size="11" fill="#64717f"><text x="34" y="44">DNEVNI BORAVAK</text><text x="276" y="44">SPAVAĆA</text><text x="34" y="226">ULAZ</text><text x="324" y="226">KUPAONICA</text></g>
    <g font-family="IBM Plex Mono, monospace" font-size="12" fill="#1f3550">
      <circle cx="100" cy="110" r="7" fill="#c79a3a"/><text x="114" y="114">rasvjeta</text>
      <circle cx="420" cy="100" r="7" fill="#c79a3a"/><text x="340" y="86">termostat</text>
      <circle cx="360" cy="20" r="7" fill="#c79a3a"/><text x="372" y="40">roleta</text>
      <circle cx="410" cy="290" r="7" fill="#c79a3a"/><text x="352" y="322">senzor vode</text>
      <circle cx="90" cy="300" r="7" fill="#c79a3a"/><text x="104" y="290">portafon</text>
      <circle cx="150" cy="360" r="7" fill="#c79a3a"/><text x="164" y="350">brava</text>
      <rect x="222" y="242" width="36" height="36" fill="#fff" stroke="#c79a3a" stroke-width="2.5"/><circle cx="240" cy="260" r="5" fill="#1f3550"/>
      <text x="268" y="256" font-weight="500">upravljački uređaj</text><text x="268" y="272" fill="#64717f">u stanu, ne u oblaku</text>
    </g>
  </svg>
  <figcaption>SHEMA · sve se spaja na uređaj u vašem objektu</figcaption>
</figure>"""
TABLET = """<figure class="demo">
  <div class="demo-stage">
    <div class="tablet" role="img" aria-label="Primjer zidnog zaslona: scene, rasvjeta, rolete, grijanje, alarm i brava na jednom mjestu">
      <div class="screen">
        <div class="top"><b>Dnevni boravak</b><span>19:42 · 21,5 °C</span></div>
        <div class="scenes"><span>Jutro</span><span>Odlazak</span><span class="on">Večer</span><span>Film</span><span>Laku noć</span></div>
        <div class="tiles">
          <div class="tile on"><small>Rasvjeta</small><strong>Uključena</strong><div class="bar"><i style="width:60%"></i></div></div>
          <div class="tile"><small>Rolete</small><strong>Spuštene 70 %</strong><div class="bar"><i style="width:70%"></i></div></div>
          <div class="tile on"><small>Grijanje</small><strong>21,5 °C</strong><div class="bar"><i style="width:55%"></i></div></div>
          <div class="tile"><small>Alarm</small><strong>Isključen</strong></div>
          <div class="tile"><small>Ulazna vrata</small><strong>Zaključana</strong></div>
          <div class="tile"><small>Kupaonica</small><strong>Pod 24 °C</strong></div>
        </div>
        <div class="status"><span>Radi lokalno</span><span>Svi uređaji spojeni</span></div>
      </div>
    </div>
  </div>
  <figcaption>Primjer sučelja · izgled i funkcije prilagođavamo objektu</figcaption>
</figure>"""

PHONE_CALL = """<figure class="demo">
  <div class="demo-stage">
    <div class="mob" role="img" aria-label="Primjer poziva s portafona na mobitelu: slika s ulaza i tipke Javi se i Otključaj">
      <div class="screen">
        <div class="call"><b>Zvoni: ulazna vrata</b><small>Kuća · upravo sada</small></div>
        <div class="feed"><img src="assets/foto/10-kuca-u-sumrak.jpg" alt="" loading="lazy"><span>ULAZ · UŽIVO</span></div>
        <div class="call-btns"><span>Javi se</span><span class="go">Otključaj</span></div>
        <div class="tiles">
          <div class="tile"><small>Kamera dvorište</small><strong>Mirno</strong></div>
          <div class="tile"><small>Garaža</small><strong>Zatvorena</strong></div>
        </div>
      </div>
    </div>
  </div>
  <figcaption>Primjer sučelja · poziv s ulaza na mobitelu</figcaption>
</figure>"""

PHONE_HOME = """<figure class="demo">
  <div class="demo-stage">
    <div class="mob" role="img" aria-label="Primjer aplikacije na mobitelu: scene i stanje kuće">
      <div class="screen">
        <div class="top"><b>Kuća</b><span>izvan kuće</span></div>
        <div class="scenes"><span class="on">Odlazak</span><span>Dolazim kući</span></div>
        <div class="tiles">
          <div class="tile on"><small>Alarm</small><strong>Uključen</strong></div>
          <div class="tile"><small>Vrata</small><strong>Zaključana</strong></div>
          <div class="tile"><small>Svjetla</small><strong>Sva ugašena</strong></div>
          <div class="tile on"><small>Grijanje</small><strong>Štedni 18 °C</strong></div>
          <div class="tile"><small>Rolete</small><strong>Spuštene</strong></div>
          <div class="tile"><small>Senzor vode</small><strong>Suho</strong></div>
        </div>
        <div class="status"><span>Zaštićena veza</span></div>
      </div>
    </div>
  </div>
  <figcaption>Primjer sučelja · stanje kuće s puta</figcaption>
</figure>"""


CONTACT = """<section class="contact" id="kontakt">
  <div class="wrap contact-grid">
    <div>
      <h2>Recite nam što planirate</h2>
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
      <button class="btn" type="submit">Pošalji upit</button>
      <p class="sent" hidden>Ovo je pregled stranice, upit nije poslan. Na pravoj stranici upit stiže na vaš e-mail.</p>
    </form>
  </div>
</section>"""


def page(slug, title, desc, body, full=True):
    nav = "\n      ".join(
        f'<a href="{s}.html"{" aria-current=\"page\"" if s == slug else ""}>{n}</a>' for s, n in NAV
    )
    kontakt_cur = ' aria-current="page"' if slug == "kontakt" else ""
    head = f"""<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="claude:viewport-fit-sides" content="cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/fiel-znak.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500&family=Source+Sans+3:wght@400;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">"""
    body_html = f"""<a class="skip" href="#sadrzaj">Preskoči na sadržaj</a>
<div class="proto">Pregled nove stranice · tekstovi označeni žuto čekaju potvrdu · fotografije su privremene (Unsplash)</div>
<header class="site-header">
  <div class="wrap bar">
    <a class="brand" href="index.html">{LOGO}</a>
    <button class="menu" aria-expanded="false" aria-controls="nav">Izbornik</button>
    <nav class="nav" id="nav" aria-label="Glavni izbornik">
      {nav}
      <a class="btn btn-solid" href="kontakt.html"{kontakt_cur}>Kontakt</a>
    </nav>
  </div>
</header>
<main id="sadrzaj">
{body.replace("%%PLAN%%", PLAN).replace("%%CONTACT%%", CONTACT).replace("%%TABLET%%", TABLET).replace("%%PHONE_CALL%%", PHONE_CALL).replace("%%PHONE_HOME%%", PHONE_HOME)}
</main>
<footer class="site-footer">
  <div class="wrap">
    <div class="foot-grid">
      <div style="display:grid;gap:14px;align-content:start"><a class="brand" href="index.html">{LOGO}</a><p>Pametne instalacije, video nadzor i portafoni. Zagreb i okolica.</p></div>
      <div><h3>Stranice</h3><ul>{"".join(f'<li><a href="{s}.html">{n}</a></li>' for s, n in NAV)}<li><a href="kontakt.html">Kontakt</a></li></ul></div>
      <div><h3>Fiel d.o.o.</h3><ul><li>Rušiščak 5b, 10000 Zagreb</li><li><a href="tel:+38598802490">+385 98 802 490</a></li><li>info@fidelis-automatika.com <span class="check">nova adresa</span></li><li>OIB: <span class="check">provjeriti</span></li></ul></div>
    </div>
    <div class="foot-bottom"><span>© 2026 Fiel d.o.o.</span><a href="pravila-privatnosti.html">Pravila privatnosti</a></div>
  </div>
</footer>
<div class="callbar"><a class="btn btn-solid" href="tel:+38598802490">Nazovite</a><a class="btn btn-line" href="kontakt.html">Pošaljite upit</a></div>
<script src="assets/main.js" defer></script>"""
    if full:
        return f"<!doctype html>\n<html lang=\"hr\">\n<head>\n{head}\n</head>\n<body>\n{body_html}\n</body>\n</html>\n"
    # inačica za Artifact pregled: bez doctype/html/head omotača
    return f"{head}\n{body_html}\n"


def main():
    pages_dir = os.path.join(HERE, "pages")
    os.makedirs(os.path.join(OUT, "assets"), exist_ok=True)
    open(os.path.join(OUT, "assets", "fiel-logo.svg"), "w").write(LOGO)
    open(os.path.join(OUT, "assets", "fiel-znak.svg"), "w").write(mark("#1f3550", "#c79a3a"))
    os.makedirs(os.path.join(OUT, "pregled"), exist_ok=True)
    for fn in sorted(os.listdir(pages_dir)):
        raw = open(os.path.join(pages_dir, fn)).read()
        meta = dict(re.findall(r"<!-- (\w+): (.*?) -->", raw[:600]))
        body = re.sub(r"\A(\s*<!-- \w+: .*? -->\n)+", "", raw)
        slug = meta["slug"]
        out_name = "index.html" if slug == "index" else f"{slug}.html"
        open(os.path.join(OUT, out_name), "w").write(page(slug, meta["title"], meta["desc"], body))
        if slug == "index":
            open(os.path.join(OUT, "pregled", "index.html"), "w").write(page(slug, meta["title"], meta["desc"], body, full=False))
    print("ok")


if __name__ == "__main__":
    main()

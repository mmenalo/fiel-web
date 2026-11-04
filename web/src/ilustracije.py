"""Crteži umjesto fotografija (linijski, boje iz znaka). Zamijeniti vlastitim fotografijama kad budu."""
N = "#1f3550"; G = "#c79a3a"; T = "#eef1f5"; W = "#ffffff"; L = "#f3e3bd"; M = "#9aa8b9"

def _svg(vb, label, body):
    return f'<svg viewBox="{vb}" role="img" aria-label="{label}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="{T}"/>{body}</svg>'

def zgrada():
    win = ""
    for f in range(5):
        y = 44 + f * 28
        for c in range(4):
            x = 84 + c * 36
            fill = G if (f, c) == (2, 1) else (L if (f + c) % 3 == 0 else W)
            win += f'<rect x="{x}" y="{y}" width="24" height="16" fill="{fill}" stroke="{N}" stroke-width="1.5"/>'
        win += f'<path d="M78 {y+20}H222" stroke="{N}" stroke-width="1.5"/>'
    body = (f'<path d="M10 186H290" stroke="{M}" stroke-width="1.5"/>'
            f'<rect x="72" y="30" width="156" height="156" fill="{W}" stroke="{N}" stroke-width="2.5"/>{win}'
            f'<rect x="136" y="166" width="28" height="20" fill="{N}"/>'
            f'<circle cx="40" cy="160" r="16" fill="none" stroke="{M}" stroke-width="1.5"/><path d="M40 176V186" stroke="{M}" stroke-width="1.5"/>'
            f'<circle cx="260" cy="156" r="20" fill="none" stroke="{M}" stroke-width="1.5"/><path d="M260 176V186" stroke="{M}" stroke-width="1.5"/>')
    return _svg("0 0 300 200", "Crtež stambene zgrade, jedan stan istaknut", body)

def kuca():
    rays = "".join(f'<path d="M{50+14*c:.1f} {44+14*s:.1f}L{50+24*c:.1f} {44+24*s:.1f}" stroke="{G}" stroke-width="2"/>'
                   for c, s in [(1,0),(.87,.5),(.5,.87),(0,1),(-.5,.87),(-.87,.5),(-1,0),(-.87,-.5),(-.5,-.87),(0,-1),(.5,-.87),(.87,-.5)])
    body = (f'{rays}<circle cx="50" cy="44" r="9" fill="{G}"/>'
            f'<path d="M10 186H290" stroke="{M}" stroke-width="1.5"/>'
            f'<rect x="40" y="112" width="160" height="74" fill="{W}" stroke="{N}" stroke-width="2.5"/>'
            f'<rect x="110" y="64" width="150" height="48" fill="{W}" stroke="{N}" stroke-width="2.5"/>'
            f'<rect x="56" y="126" width="80" height="46" fill="{L}" stroke="{N}" stroke-width="1.5"/><path d="M83 126V172M110 126V172" stroke="{N}" stroke-width="1.5"/>'
            f'<rect x="150" y="126" width="30" height="60" fill="{N}"/><circle cx="174" cy="158" r="2" fill="{G}"/>'
            f'<rect x="126" y="76" width="118" height="26" fill="{L}" stroke="{N}" stroke-width="1.5"/><path d="M165 76V102M205 76V102" stroke="{N}" stroke-width="1.5"/>'
            f'<path d="M110 64H262" stroke="{N}" stroke-width="4"/>'
            f'<circle cx="244" cy="150" r="22" fill="none" stroke="{M}" stroke-width="1.5"/><path d="M244 172V186" stroke="{M}" stroke-width="1.5"/>')
    return _svg("0 0 300 200", "Crtež moderne kuće s osvijetljenim prozorima", body)

def poslovni():
    body = (f'<path d="M10 186H290" stroke="{M}" stroke-width="1.5"/>'
            f'<rect x="46" y="44" width="208" height="142" fill="{W}" stroke="{N}" stroke-width="2.5"/>'
            f'<rect x="46" y="44" width="208" height="28" fill="{N}"/><path d="M64 58H150" stroke="{W}" stroke-width="4"/>'
            f'<rect x="62" y="88" width="104" height="98" fill="{L}" stroke="{N}" stroke-width="1.5"/><path d="M114 88V186" stroke="{N}" stroke-width="1.5"/>'
            f'<rect x="184" y="98" width="46" height="88" fill="{T}" stroke="{N}" stroke-width="2"/><path d="M222 140V150" stroke="{N}" stroke-width="2.5"/>'
            f'<rect x="236" y="130" width="10" height="16" rx="2" fill="{W}" stroke="{G}" stroke-width="2"/>'
            f'<path d="M238 80H250" stroke="{N}" stroke-width="2"/><rect x="226" y="82" width="20" height="10" rx="2" fill="{W}" stroke="{N}" stroke-width="2"/><circle cx="230" cy="87" r="2" fill="{G}"/>'
            f'<path d="M226 92L200 120M226 92L246 120" stroke="{G}" stroke-width="1" stroke-dasharray="3 3"/>')
    return _svg("0 0 300 200", "Crtež poslovnog prostora s kamerom i čitačem na ulazu", body)

def ulaz():
    body = (f'<rect x="0" y="150" width="240" height="30" fill="#dfe5ec"/>'
            f'<rect x="70" y="30" width="84" height="120" fill="{W}" stroke="{N}" stroke-width="2.5"/>'
            f'<rect x="78" y="38" width="68" height="112" fill="{N}"/><rect x="88" y="50" width="12" height="70" fill="#2c4a6e"/>'
            f'<path d="M136 92V104" stroke="{G}" stroke-width="3"/>'
            f'<rect x="166" y="74" width="20" height="34" rx="2" fill="{W}" stroke="{N}" stroke-width="2"/><circle cx="176" cy="84" r="4" fill="{N}"/><rect x="171" y="94" width="10" height="8" fill="{G}"/>'
            f'<path d="M40 30V46" stroke="{N}" stroke-width="2"/><path d="M32 46H48L44 56H36Z" fill="{L}" stroke="{N}" stroke-width="1.5"/>'
            f'<rect x="196" y="122" width="22" height="28" fill="{W}" stroke="{N}" stroke-width="1.5"/><circle cx="207" cy="112" r="12" fill="none" stroke="{M}" stroke-width="1.5"/>')
    return _svg("0 0 240 180", "Crtež ulaza s portafonom pokraj vrata", body)

def zgrada_presjek():
    body = f'<path d="M20 390H300" stroke="{M}" stroke-width="1.5"/><rect x="40" y="40" width="240" height="320" fill="{W}" stroke="{N}" stroke-width="3"/>'
    body += f'<path d="M160 40V360" stroke="{N}" stroke-width="1.5"/>'
    for f in range(6):
        y = round(40 + f * 320 / 6)
        if f: body += f'<path d="M40 {y}H280" stroke="{N}" stroke-width="2"/>'
        for x in (60, 180):
            body += f'<rect x="{x}" y="{y+16}" width="14" height="20" fill="{W}" stroke="{G}" stroke-width="2"/><circle cx="{x+7}" cy="{y+27}" r="2.5" fill="{N}"/>'
            body += f'<path d="M{x+20} {y+27}H{x+80}" stroke="{M}" stroke-width="1.2" stroke-dasharray="3 4"/>'
    body += f'<rect x="40" y="360" width="240" height="30" fill="#dfe5ec" stroke="{N}" stroke-width="2"/><rect x="146" y="364" width="28" height="22" fill="{N}"/>'
    body += f'<g font-family="IBM Plex Mono, monospace" font-size="10" fill="#64717f"><text x="48" y="30">ZIDNI ZASLON U SVAKOM STANU</text><text x="186" y="382">ULAZ · PORTAFON</text></g>'
    return _svg("0 0 320 400", "Shema stambene zgrade: zidni zaslon u svakom stanu i portafon na ulazu", body)

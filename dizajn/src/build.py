import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from logo import logo, mark
src = os.path.dirname(__file__); out = os.path.dirname(src)
NAVY, SLATE, GOLD = "#2f4a6b", "#7c8da6", "#c79a3a"
pages = {
  "smjer-a.html": logo("#1f3550", "#7c8da6", GOLD),
  "smjer-b.html": logo("#e9eef5", "#8fa3bd", "#d8a947"),
  "smjer-c.html": logo("#26405f", "#7c8da6", GOLD),
}
marks = {"smjer-a.html": mark("#1f3550", GOLD), "smjer-b.html": mark("#e9eef5", "#d8a947"), "smjer-c.html": mark("#26405f", GOLD)}
for name, lg in pages.items():
    s = open(os.path.join(src, name)).read().replace("%%LOGO%%", lg).replace("%%MARK%%", marks[name])
    open(os.path.join(out, name), "w").write(s)
s = open(os.path.join(src, "index.html")).read()
s = s.replace("%%LOGO_LIGHT%%", logo(NAVY, SLATE, GOLD)).replace("%%LOGO_DARK%%", logo("#e9eef5", "#8fa3bd", "#d8a947"))
for px in (96, 48, 32, 16):
    s = s.replace(f"%%MARK_{px}%%", mark(NAVY, GOLD, cls="m").replace('<svg class="m"', f'<svg class="m" width="{px}" height="{px}"'))
open(os.path.join(out, "index.html"), "w").write(s)
# standalone logo files
open(os.path.join(out, "fiel-logo.svg"), "w").write(logo(NAVY, SLATE, GOLD))
open(os.path.join(out, "fiel-znak.svg"), "w").write(mark(NAVY, GOLD))
print("ok")

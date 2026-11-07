/* Fiel: okoliš i "vila" prikaz za kuca3d-card.
   Ne mijenja kuca3d-card.js. Koristi njegove three.js klase (uzima ih iz postojeće scene),
   pa ne treba druga kopija three.js. */
const UP = 3.4;               // visina kata
const ROOF = 6.0;             // vrh zidova kata

export function pripremi(card) {
  /* prije gradnje: "Sve" prikazuje kuću složenu kao jednu vilu */
  const applyFloor = card._applyFloor, place = card._placeCamera;
  card._applyFloor = function () {
    applyFloor.call(this);
    const both = this._floor === 'both', [g, k] = this._floors || [];
    if (both && g && k) { g.position.set(0, 0, 0); k.position.set(0, UP, 0); }
    if (this._env3) this._env3.roof.visible = both;
    if (this._labelsEl) this._labelsEl.style.display = both ? 'none' : '';
    this._shadowDirty = true; this._placeCamera();
  };
  card._placeCamera = function () {
    if (this._floor !== 'both') return place.call(this);
    const a = this._aspect || 1.3, el = 0.47, az = -0.62;
    let n = 46 * (this._zoom || 1); if (a < 1.2) n *= 1.25 * (1.2 / a);
    const c = this._camera, t = c.position.clone().set(-1.2, 1.2, 4.0);
    c.position.set(t.x + n * Math.cos(el) * Math.sin(az), t.y + n * Math.sin(el), t.z + n * Math.cos(el) * Math.cos(az));
    c.lookAt(t); this._requestRender();
  };
}

export function okolis(card) {
  const sc = card._scene, C = {};
  sc.traverse(o => {
    if (o.isGroup) C.Group = C.Group || o.constructor;
    if (o.isPointLight) C.PointLight = C.PointLight || o.constructor;
    if (!o.isMesh) return;
    C.Mesh = C.Mesh || o.constructor;
    const g = o.geometry; C[g.type] = C[g.type] || g.constructor;
    if (g.type === 'ExtrudeGeometry' && g.parameters.shapes) C.Shape = [].concat(g.parameters.shapes)[0].constructor;
    [].concat(o.material).forEach(m => { C[m.type] = C[m.type] || m.constructor; if (m.color) C.Color = m.color.constructor; if (m.map && m.map.isCanvasTexture) C.CanvasTexture = m.map.constructor; });
  });
  const need = ['Group', 'Mesh', 'BoxGeometry', 'CylinderGeometry', 'PlaneGeometry', 'MeshStandardMaterial', 'MeshBasicMaterial'];
  if (need.some(k => !C[k])) return;
  const env = new C.Group(); env.name = 'fiel-okolis';
  const STD = (color, o = {}) => new C.MeshStandardMaterial({ color, roughness: .8, metalness: 0, ...o });
  const BAS = (color, o = {}) => new C.MeshBasicMaterial({ color, ...o });
  const add = (geo, mat, x, y, z, o = {}) => { const m = new C.Mesh(geo, mat); m.position.set(x, y, z); if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; m.castShadow = o.cast !== false; m.receiveShadow = true; (o.parent || env).add(m); return m; };
  const box = (w, h, d) => new C.BoxGeometry(w, h, d);
  const cyl = (rt, rb, h, s = 18) => new C.CylinderGeometry(rt, rb, h, s);
  const plane = (w, h) => { const p = new C.PlaneGeometry(w, h); p.rotateX(-Math.PI / 2); return p; };

  /* sjaj: aditivna ravnina s radijalnim prijelazom */
  let glowTex = null;
  if (C.CanvasTexture) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
    const gr = x.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.35, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 128, 128); glowTex = new C.CanvasTexture(cv); glowTex.colorSpace = 'srgb';
  }
  const glow = (x, y, z, s, color, op = .55) => { if (!glowTex) return; add(plane(s, s), BAS(color, { map: glowTex, transparent: true, opacity: op, blending: 2, depthWrite: false }), x, y, z, { cast: false }); };

  const M = {
    pave: STD(0x9aa0a8, { roughness: .9 }), drive: STD(0x3a3f47, { roughness: .95 }), coping: STD(0xd9d4c8, { roughness: .7 }),
    deck: STD(0x8a5a36, { roughness: .75 }), hedge: STD(0x1f4a2a), leaf: STD(0x2c5e34), leaf2: STD(0x3d6f3a), trunk: STD(0x4a3526),
    water: STD(0x1a8cc4, { roughness: .04, metalness: .15, emissive: 0x0a7fb5, emissiveIntensity: .85, transparent: true, opacity: .92 }),
    poolIn: STD(0x7fd0ea, { emissive: 0x1e7fa8, emissiveIntensity: .35 }),
    roof: STD(0x2b2f36, { roughness: .85 }), fascia: STD(0x1c1f24, { roughness: .6 }),
    neon: BAS(0x38d6ff), lamp: BAS(0xffe2a8), tire: STD(0x111111, { roughness: .9 }), rim: STD(0xc9ced6, { metalness: .9, roughness: .25 }),
    glass: STD(0x0b0f16, { metalness: .6, roughness: .08 }), head: BAS(0xf4f8ff), tail: BAS(0xff2a2a), lounger: STD(0xece8e0),
    fence: STD(0x2a2d33, { metalness: .4, roughness: .5 }),
  };

  /* ravni krov s prepustom (samo u prikazu cijele kuće) + neonski rub */
  const roof = new C.Group();
  add(box(10.1, .28, 10.2), M.roof, .05, ROOF + .14, -.45, { parent: roof });
  add(box(10.3, .12, 10.4), M.fascia, .05, ROOF + .34, -.45, { parent: roof });
  const edge = (w, d, y, cx, cz, parent) => {
    const t = .045;
    add(box(w, t, t), M.neon, cx, y, cz + d / 2, { parent, cast: false }); add(box(w, t, t), M.neon, cx, y, cz - d / 2, { parent, cast: false });
    add(box(t, t, d), M.neon, cx + w / 2, y, cz, { parent, cast: false }); add(box(t, t, d), M.neon, cx - w / 2, y, cz, { parent, cast: false });
  };
  edge(10.32, 10.42, ROOF + .41, .05, -.45, roof);
  env.add(roof);
  card._env3 = { roof };
  edge(9.15, 8.05, .03, 0, -.3, env);           // neon uz tlo, kao na referenci

  /* terasa i bazen ispred dnevnog boravka */
  add(plane(9.4, 1.2), M.deck, 0, .02, 8.4, { cast: false });
  [[0, 9.6, 8.4, .4], [0, 14.2, 8.4, .4], [-4, 11.9, .4, 4.2], [4, 11.9, .4, 4.2]].forEach(c => add(box(c[2], .12, c[3]), M.coping, c[0], .06, c[1]));
  add(box(7.6, .02, 4.2), M.water, 0, .03, 11.9, { cast: false });
  glow(0, .06, 11.9, 6.5, 0x3fb8ff, .22);
  if (C.PointLight) { const pl = new C.PointLight(0x46c8ff, 6, 9, 1.6); pl.position.set(0, .6, 11.9); env.add(pl); }
  [-2.2, -.6].forEach(x => { // ležaljke
    add(box(.75, .12, 1.9), M.lounger, x + 5.6, .32, 11.2); add(box(.75, .1, .7), M.lounger, x + 5.6, .55, 10.45, { rx: -.55 });
    [[.3, .7], [-.3, .7], [.3, -.7], [-.3, -.7]].forEach(l => add(box(.05, .26, .05), M.fence, x + 5.6 + l[0], .13, 11.2 + l[1], { cast: false }));
  });

  /* prilaz i auti s lijeve strane */
  add(plane(6.6, 16), M.drive, -9.2, .015, 1.5, { cast: false });
  add(plane(1.2, 4), M.pave, -5.3, .02, 6.5, { cast: false });
  const car = (x, z, paint, ry = 0) => {
    const g = new C.Group(); g.position.set(x, 0, z); g.rotation.y = ry; env.add(g);
    const P = STD(paint, { metalness: .75, roughness: .28 });
    if (C.Shape && C.ExtrudeGeometry) {
      const s = new C.Shape();
      [[-2.35, .32], [-2.38, .72], [-2.15, .86], [-1.15, .9], [-.55, 1.32], [.55, 1.34], [1.35, .95], [2.28, .78], [2.4, .52], [2.36, .32]].forEach((p, i) => i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]));
      const body = new C.ExtrudeGeometry(s, { depth: 1.86, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2 });
      body.translate(0, 0, -.93); body.rotateY(Math.PI / 2);
      add(body, P, 0, 0, 0, { parent: g });
      const w = new C.Shape();
      [[-1.05, .92], [-.5, 1.28], [.5, 1.3], [1.22, .95]].forEach((p, i) => i ? w.lineTo(p[0], p[1]) : w.moveTo(p[0], p[1]));
      const gl = new C.ExtrudeGeometry(w, { depth: 1.9, bevelEnabled: false }); gl.translate(0, 0, -.95); gl.rotateY(Math.PI / 2);
      add(gl, M.glass, 0, .005, 0, { parent: g, cast: false });
    } else add(box(1.9, .8, 4.7), P, 0, .65, 0, { parent: g });
    [[.86, 1.45], [-.86, 1.45], [.86, -1.5], [-.86, -1.5]].forEach(p => {
      add(cyl(.36, .36, .26, 20), M.tire, p[0], .36, p[1], { parent: g, rz: Math.PI / 2 });
      add(cyl(.24, .24, .27, 14), M.rim, p[0], .36, p[1], { parent: g, rz: Math.PI / 2, cast: false });
    });
    [-.62, .62].forEach(xx => { add(box(.42, .08, .05), M.head, xx, .68, 2.42, { parent: g, cast: false }); add(box(.5, .07, .05), M.tail, xx, .74, -2.4, { parent: g, cast: false }); });
    glow(x, .03, z, 6.2, 0xffffff, .1);
    return g;
  };
  car(-8.0, 3.2, 0x2a3442);
  car(-10.7, 2.4, 0xd8dbe0, .06);

  /* vrt: živica uz rub, stabla, rasvjeta staze */
  [[0, -16, 30, .4], [-15, 2, .4, 36], [15, 2, .4, 36]].forEach(h => add(box(h[2], 1.1, h[3]), M.hedge, h[0], .55, h[1]));
  const tree = (x, z, h, round) => {
    add(cyl(.1, .16, h * .45, 8), M.trunk, x, h * .22, z);
    if (round) { [[.0, .95, 1.0], [.35, .75, 1.25], [.7, .45, 1.45]].forEach(q => add(cyl(q[1] * h * .38, q[2] * h * .26, h * .28, 14), M.leaf2, x, h * (.5 + q[0] * .5), z)); }
    else add(cyl(0, h * .28, h * .8, 12), M.leaf, x, h * .6, z);
  };
  [[-7, -9, 6, 0], [-12.5, -6, 7, 0], [7.5, -8.5, 5.5, 1], [12, -2, 6.5, 0], [11.5, 6, 4.5, 1], [-15, -10, 5, 1], [13, 13, 5, 0], [-14, 15, 4, 1]].forEach(t => tree(t[0], t[1], t[2], t[3]));
  [[-5.3, 9], [-5.3, 13], [5.6, 8.6], [-6.2, -2], [-6.2, -6]].forEach(p => {
    add(cyl(.07, .07, .65, 8), M.fence, p[0], .33, p[1], { cast: false }); add(cyl(.09, .09, .1, 8), M.lamp, p[0], .7, p[1], { cast: false });
    glow(p[0], .04, p[1], 2.4, 0xffd38a, .5);
  });
  /* ograda s kapijom na prilazu */

  sc.add(env);
  card._shadowDirty = true; card._requestRender && card._requestRender();
  return env;
}

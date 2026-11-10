/* ===== RIG: kostur sa kinematikom, bez biblioteka =====
   Svaka vežba ima dve poze (a = početak, b = kraj). Aplikacija ih glatko meša.
   Noga je zakačena za pod (članak), a ruke mogu da budu zadate uglovima ili
   ciljem šake (IK), pa dužine udova ostaju iste u svim vežbama.
   Dodatni režimi: ex.lying (oslonac je kuk na podu), p.lift (celo telo iznad poda),
   p.fhand (druga ruka na osloncu), p.wrist (zglob šake), ex.props (klupa),
   a u pogledu spreda p.drop (spuštanje kukova), p.lean (nagib trupa) i savijanje kolena u stranu. */
const Rig = (() => {
  const NS = 'http://www.w3.org/2000/svg';
  const FLOOR = 186;
  const L = { shin: 46, thigh: 46, torso: 50, upper: 32, fore: 30 };
  const rad = d => d * Math.PI / 180;
  const dir = a => [Math.cos(rad(a)), Math.sin(rad(a))];
  const add = (p, v, l = 1) => [p[0] + v[0] * l, p[1] + v[1] * l];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = x => x * x * (3 - 2 * x);

  // Dvozglobni IK: vraća [lakat/koleno, krajnja tačka]. sign bira na koju stranu se savija.
  function ik(S, W, l1, l2, sign) {
    const dx = W[0] - S[0], dy = W[1] - S[1];
    const d = Math.hypot(dx, dy) || 0.001;
    const dd = Math.min(Math.max(d, Math.abs(l1 - l2) + 0.5), l1 + l2 - 0.1);
    const ux = dx / d, uy = dy / d;
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
    const h = Math.sqrt(Math.max(l1 * l1 - a * a, 0));
    return [
      [S[0] + ux * a + sign * h * uy, S[1] + uy * a - sign * h * ux],
      [S[0] + ux * dd, S[1] + uy * dd]
    ];
  }

  // Uglovi se mešaju najkraćim putem (184° i -176° su isto), ostali brojevi linearno.
  const ANG = new Set(['shin', 'thigh', 'torso', 'tilt', 'upper', 'fore', 'hk', 'ka', 'fhk', 'fka', 'wrist']);
  const lerpAng = (a, b, t) => a + (((b - a + 540) % 360) - 180) * t;
  function mixPose(a, b, t) {
    const o = {};
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      const x = a[k] ?? b[k], y = b[k] ?? a[k];
      if (Array.isArray(x)) o[k] = [lerp(x[0], y[0], t), lerp(x[1], y[1], t)];
      else if (typeof x === 'number') o[k] = ANG.has(k) ? lerpAng(x, y, t) : lerp(x, y, t);
      else o[k] = x;
    }
    return o;
  }

  // Stopalo na prstima, ili ravno (pete se dižu a prsti ostaju na podu).
  const footOf = (A, toe, lift = 0) => toe
    ? [A, [A[0] + 9, FLOOR - 2 - lift]]
    : [[A[0] - 6, A[1] + 4], [A[0] + 16, FLOOR - 3]];
  const footLy = (A, ka) => [A, add(A, dir(ka - 90), 9)];

  function solveSide(p, ex) {
    const ly = !!ex.lying;
    let A, K, H;
    if (ly) {
      H = [p.hx, FLOOR - 7];
      K = add(H, dir(p.hk), L.thigh);
      A = add(K, dir(p.ka), L.shin);
    } else {
      A = [p.ax, FLOOR - (ex.toe ? 14 : 7) - (p.lift || 0)];
      K = add(A, dir(p.shin), L.shin);
      H = add(K, dir(p.thigh), L.thigh);
    }
    const S = add(H, dir(p.torso), L.torso);
    const Hd = add(S, dir(p.torso + (p.tilt || 0)), 17);
    let E, W;
    if (p.hand) [E, W] = ik(S, p.hand, L.upper, L.fore, p.bend ?? -1);
    else { E = add(S, dir(p.upper), L.upper); W = add(E, dir(p.fore), L.fore); }
    const off = [-4, 0];
    let fA, fK, fH = H;
    if (ly && p.fhk != null) {
      fK = add(H, dir(p.fhk), L.thigh); fA = add(fK, dir(p.fka ?? p.fhk), L.shin);
    } else if (p.farAnkle != null) {
      const fy = p.farUp != null ? FLOOR - 7 - p.farUp : FLOOR - (ex.farToe ? 14 : 7);
      [fK, fA] = ik(H, [p.farAnkle, fy], L.thigh, L.shin, p.farBend ?? 1);
    } else { fA = add(A, off); fK = add(K, off); fH = add(H, off); }
    const fS = add(S, off);
    let fE, fW;
    if (p.fhand) [fE, fW] = ik(fS, p.fhand, L.upper, L.fore, p.fbend ?? -1);
    else { fE = add(E, off); fW = add(W, off); }
    const wr = p.wrist != null ? dir(p.wrist) : null;
    const Wt = wr ? add(W, wr, 11) : W, fWt = wr ? add(fW, wr, 11) : fW;
    const flat = ly && ex.flatFeet;
    const J = {
      A, K, H, S, Hd, E, W, fA, fK, fH, fS, fE, fW, Wt, fWt, hasWrist: !!wr,
      foot: ly ? (flat ? footOf(A, false) : footLy(A, p.ka)) : footOf(A, ex.toe, p.lift || 0),
      fFoot: ly ? (flat ? footOf(fA, false) : footLy(fA, p.fka ?? p.fhk ?? p.ka)) : footOf(fA, p.farAnkle != null ? (p.farUp != null ? false : ex.farToe) : ex.toe, p.lift || 0)
    };
    J.pts = [A, K, H, S, Hd, E, W, Wt, fA, fK, fE, fW, J.foot[1], J.fFoot[1]];
    return J;
  }

  function solveFront(p) {
    const cx = 120, drop = p.drop || 0, lean = p.lean || 0;
    const hipY = FLOOR - 7 - 92 + drop, top = hipY - L.torso * Math.cos(rad(lean));
    const st = p.stance ?? 15, sh = [[cx - 18, top], [cx + 18, top]];
    const hips = [[cx - 8, hipY], [cx + 8, hipY]];
    const ank = [[cx - st, FLOOR - 7], [cx + st, FLOOR - 7]];
    const knees = [ik(hips[0], ank[0], L.thigh, L.shin, -1)[0], ik(hips[1], ank[1], L.thigh, L.shin, 1)[0]];
    const arms = [1, -1].map((sg, i) => {
      const E = add(sh[i], dir(90 + sg * p.abd), L.upper);
      return [E, add(E, dir(90 + sg * p.abdF), L.fore)];
    });
    const head = [cx, top - lerp(20, 8, Math.sin(rad(lean)))];
    const J = { front: true, cx, hipY, top, sh, hips, ank, knees, arms, head };
    J.pts = [J.head, ...sh, ...ank, ...knees, arms[0][1], arms[1][1], [cx, hipY]];
    return J;
  }

  const solve = (ex, p) => ex.view === 'front' ? solveFront(p) : solveSide(p, ex);

  const boxCache = {};
  function rawBox(ex) {
    if (boxCache[ex.id]) return boxCache[ex.id];
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const t of [0, .25, .5, .75, 1]) {
      for (const q of solve(ex, mixPose(ex.a, ex.b, t)).pts) {
        x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]);
        y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]);
      }
    }
    for (const pr of ex.props || []) { x0 = Math.min(x0, pr.x); x1 = Math.max(x1, pr.x + pr.w); y0 = Math.min(y0, pr.y); }
    return boxCache[ex.id] = [x0 - 9, y0 - 12, x1 + 9, Math.max(y1, FLOOR) + 4];
  }
  const fmt = a => a.map(v => +v.toFixed(1)).join(' ');
  // Čvrsto uokvirenje za sličice u planu.
  function bounds(ex) {
    const [x0, y0, x1, y1] = rawBox(ex);
    return fmt([x0 - 6, y0 - 6, x1 - x0 + 12, y1 - y0 + 12]);
  }
  // Uokvirenje sa fiksnim odnosom stranica za kartice i detalj; pod je uvek pri dnu.
  function fit(ex, aspect = 1.22) {
    let [x0, y0, x1, y1] = rawBox(ex);
    x0 -= 14; x1 += 14; y0 -= 10; y1 += 10;
    let w = x1 - x0, h = y1 - y0;
    if (w / h < aspect) { const nw = h * aspect; x0 -= (nw - w) / 2; w = nw; }
    else { const nh = w / aspect; y0 -= nh - h; h = nh; }
    return fmt([x0, y0, w, h]);
  }

  // Jedan ciklus: zadrži početak, podigni, zadrži kraj, spusti.
  const CYCLE = 3400;
  function phaseAt(ms) {
    const t = (ms % CYCLE) / CYCLE;
    if (t < .12) return 0;
    if (t < .5) return ease((t - .12) / .38);
    if (t < .62) return 1;
    return 1 - ease((t - .62) / .38);
  }

  const figs = new Set();
  let raf = 0;
  function loop(now) {
    for (const f of figs) if (f.visible) f.tick(now);
    raf = requestAnimationFrame(loop);
  }
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => { if (e.target.__fig) e.target.__fig.visible = e.isIntersecting; }))
    : null;

  function make(svg, ex, opts = {}) {
    const vbStr = opts.viewBox || fit(ex, opts.aspect);
    const vb = vbStr.split(' ').map(Number);
    svg.setAttribute('viewBox', vbStr);
    svg.setAttribute('class', 'rg' + (opts.crop ? ' rg-crop' : ''));
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', ex.name + ', prikaz pokreta');
    svg.textContent = '';
    const mk = (n, attrs, parent) => {
      const e = document.createElementNS(NS, n);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      (parent || svg).appendChild(e);
      return e;
    };
    const gFloor = mk('g'), gFar = mk('g', { class: 'rg-far' }), gMain = mk('g'), gGlow = mk('g');
    const els = {};
    (ex.props || []).forEach(pr => {
      if (pr.legs) [pr.x + 7, pr.x + pr.w - 7].forEach(lx => mk('line', { class: 'rg-prop-leg', x1: lx, y1: pr.y + pr.h, x2: lx, y2: FLOOR + 1 }, gFloor));
      mk('rect', { class: 'rg-prop', x: pr.x, y: pr.y, width: pr.w, height: pr.h, rx: 3 }, gFloor);
    });
    const f1 = v => v.toFixed(1);
    function seg(key, p, q, cls, g) {
      let e = els[key];
      if (!e) { e = els[key] = mk('line', { class: cls }, g || gMain); }
      else if (e.getAttribute('class') !== cls) e.setAttribute('class', cls);
      e.setAttribute('x1', f1(p[0])); e.setAttribute('y1', f1(p[1]));
      e.setAttribute('x2', f1(q[0])); e.setAttribute('y2', f1(q[1]));
    }
    function circ(key, c, r, cls, g, fill) {
      let e = els[key];
      if (!e) { e = els[key] = mk('circle', { class: cls, r }, g || gMain); if (fill) e.setAttribute('fill', fill); }
      e.setAttribute('cx', f1(c[0])); e.setAttribute('cy', f1(c[1]));
    }
    const plate = (key, c, g) => { circ(key, c, 6.5, 'rg-plate', g); circ(key + 'h', c, 2.2, 'rg-hole', g); };
    const hl = new Set(ex.hl || []);
    const lc = (n, extra = '') => 'rg-limb' + extra + (hl.has(n) ? ' hl' : '');
    const equipped = ex.equip === 'teg';

    function blobPoint(type, J, p) {
      const t = dir(p.torso), n = dir(p.torso + 90);
      const au = [J.E[0] - J.S[0], J.E[1] - J.S[1]], al = Math.hypot(au[0], au[1]) || 1;
      const an = [au[1] / al, -au[0] / al];          // prednja strana nadlaktice
      const tu = [J.K[0] - J.H[0], J.K[1] - J.H[1]], tl = Math.hypot(tu[0], tu[1]) || 1;
      const tn = [tu[1] / tl, -tu[0] / tl];          // prednja strana butine
      switch (type) {
        case 'shoulder': return add(J.S, n, 3);
        case 'chest': return add(add(J.S, t, -13), n, 7);
        case 'core': return add(add(J.H, t, 24), n, 5);
        case 'back': return add(add(J.S, t, -14), n, -6);
        case 'biceps': return add(mid(J.S, J.E), an, 4);
        case 'triceps': return add(mid(J.S, J.E), an, -4);
        case 'quad': return add(mid(J.H, J.K), tn, 3);
        case 'glute': return add(add(J.H, t, 4), n, -8);
        case 'calf': { const su = [J.K[0] - J.A[0], J.K[1] - J.A[1]], sl = Math.hypot(su[0], su[1]) || 1; return add(mid(J.K, J.A), [su[1] / sl, -su[0] / sl], 4); }
        case 'fore': return mid(J.E, J.W);
        default: return J.S;
      }
    }

    function drawSide(J, p, ph) {
      seg('floor', [vb[0] + 4, FLOOR + 1], [vb[0] + vb[2] - 4, FLOOR + 1], 'rg-floor', gFloor);
      seg('f-thigh', J.fH, J.fK, lc('thigh'), gFar);
      seg('f-shin', J.fK, J.fA, lc('shin'), gFar);
      seg('f-foot', J.fFoot[0], J.fFoot[1], lc('', ' foot'), gFar);
      seg('f-upper', J.fS, J.fE, lc('upper'), gFar);
      seg('f-fore', J.fE, J.fW, lc('fore'), gFar);
      if (J.hasWrist) seg('f-wrist', J.fW, J.fWt, lc('fore', ' foot'), gFar);
      if (equipped) plate('f-plate', J.fWt, gFar); else circ('f-hand', J.fWt, 3.6, 'rg-hand', gFar);
      seg('torso', J.H, J.S, 'rg-torso');
      seg('neck', J.S, J.Hd, 'rg-neck');
      circ('head', J.Hd, 10.5, 'rg-head');
      seg('n-thigh', J.H, J.K, lc('thigh'));
      seg('n-shin', J.K, J.A, lc('shin'));
      seg('n-foot', J.foot[0], J.foot[1], lc('', ' foot'));
      seg('n-upper', J.S, J.E, lc('upper'));
      seg('n-fore', J.E, J.W, lc('fore'));
      if (J.hasWrist) seg('n-wrist', J.W, J.Wt, lc('fore', ' foot'));
      circ('j-k', J.K, 2.2, 'rg-joint');
      circ('j-e', J.E, 2.2, 'rg-joint');
      if (equipped) plate('n-plate', J.Wt); else circ('n-hand', J.Wt, 3.6, 'rg-hand');
      (ex.blob || []).forEach((b, i) => glow('blob' + i, blobPoint(b, J, p), 15 + 3 * Math.sin(ph * Math.PI)));
    }

    function drawFront(J, p, ph) {
      seg('floor', [vb[0] + 4, FLOOR + 1], [vb[0] + vb[2] - 4, FLOOR + 1], 'rg-floor', gFloor);
      [0, 1].forEach(i => {
        seg('l-thigh' + i, J.hips[i], J.knees[i], lc('thigh', ' lg'));
        seg('l-shin' + i, J.knees[i], J.ank[i], lc('shin', ' lg'));
        const sg = i === 0 ? -1 : 1;
        seg('l-foot' + i, [J.ank[i][0] + sg * 0, J.ank[i][1] + 4], [J.ank[i][0] + sg * 9, J.ank[i][1] + 4], 'rg-limb foot');
      });
      seg('torso', [J.cx, J.hipY], [J.cx, J.top + 2], 'rg-torso fr');
      seg('sh-bar', J.sh[0], J.sh[1], 'rg-bar');
      seg('neck', [J.cx, J.top], J.head, 'rg-neck');
      circ('head', J.head, 10.5, 'rg-head');
      [0, 1].forEach(i => {
        seg('a-up' + i, J.sh[i], J.arms[i][0], lc('upper'));
        seg('a-fo' + i, J.arms[i][0], J.arms[i][1], lc('fore'));
        circ('j-e' + i, J.arms[i][0], 2.2, 'rg-joint');
        if (equipped) plate('plate' + i, J.arms[i][1]); else circ('hand' + i, J.arms[i][1], 3.6, 'rg-hand');
      });
      (ex.blob || []).forEach((type, bi) => [0, 1].forEach(i => {
        const c = type === 'quad' ? mid(J.hips[i], J.knees[i]) : add(J.sh[i], [i ? 1 : -1, 0.4], 6);
        glow('blob' + bi + '-' + i, c, 15 + 3 * Math.sin(ph * Math.PI));
      }));
    }

    function glow(key, c, r) {
      let e = els[key];
      if (!e) { e = els[key] = mk('circle', { fill: 'url(#rg-glow)' }, gGlow); }
      e.setAttribute('cx', f1(c[0])); e.setAttribute('cy', f1(c[1])); e.setAttribute('r', f1(r));
    }

    function draw(ph) {
      const p = mixPose(ex.a, ex.b, ph);
      const J = solve(ex, p);
      if (J.front) drawFront(J, p, ph); else drawSide(J, p, ph);
    }

    const fig = {
      visible: true, mode: opts.mode || 'loop', cur: 0, last: -1, offset: opts.offset || 0, draw,
      tick(now) {
        let v;
        if (fig.mode === 'loop') v = phaseAt(now + fig.offset);
        else {
          const target = fig.mode === 'b' ? 1 : 0;
          v = fig.cur + (target - fig.cur) * (opts.instant ? 1 : 0.16);
          if (Math.abs(target - v) < 0.002) v = target;
        }
        fig.cur = v;
        if (v !== fig.last) { fig.last = v; draw(v); }
      },
      setMode(m) { fig.mode = m; if (!figs.has(fig) || !fig.visible) fig.tick(performance.now()); },
      destroy() { figs.delete(fig); if (io) io.unobserve(svg); svg.__fig = null; }
    };
    draw(0);
    fig.last = 0;
    if (!opts.static) {
      figs.add(fig);
      svg.__fig = fig;
      if (io) io.observe(svg);
      if (!raf) raf = requestAnimationFrame(loop);
    }
    return fig;
  }

  return { make, bounds, fit, FLOOR };
})();

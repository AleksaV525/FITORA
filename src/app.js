/* ===== FITORA: aplikacija ===== */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const DAYS = [
    { k: 'pon', s: 'Pon', f: 'Ponedeljak' }, { k: 'uto', s: 'Uto', f: 'Utorak' },
    { k: 'sre', s: 'Sre', f: 'Sreda' }, { k: 'cet', s: 'Čet', f: 'Četvrtak' },
    { k: 'pet', s: 'Pet', f: 'Petak' }, { k: 'sub', s: 'Sub', f: 'Subota' },
    { k: 'ned', s: 'Ned', f: 'Nedelja' }
  ];
  const MONTHS = ['januar', 'februar', 'mart', 'april', 'maj', 'jun', 'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar'];
  const MON_S = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];
  const VIEWS = ['plan', 'biblioteka', 'statistika', 'podesavanja'];

  /* ---------- datumi ---------- */
  const pad = n => String(n).padStart(2, '0');
  const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const sod = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => { const x = sod(d); x.setDate(x.getDate() + n); return x; };
  const NOW = sod(new Date());
  const TODAY = (NOW.getDay() + 6) % 7;
  const WEEK0 = addDays(NOW, -TODAY);
  const dateOfDay = i => addDays(WEEK0, i);
  const fmtDate = d => `${d.getDate()}. ${MONTHS[d.getMonth()]}`;
  const fmtShort = d => `${d.getDate()}. ${MON_S[d.getMonth()]}`;

  const BY = Object.fromEntries(EXERCISES.map(e => [e.id, e]));
  const mlabel = k => MUSCLES[k].label;
  const plural = (n, a, b, c) => {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return b;
    return c;
  };
  const unitWord = (ex, n) => ex.unit === 'sek' ? plural(n, 'sekunda', 'sekunde', 'sekundi') : plural(n, 'ponavljanje', 'ponavljanja', 'ponavljanja');
  const unitShort = ex => ex.unit === 'sek' ? 'sek' : 'pon';
  const setsWord = n => plural(n, 'serija', 'serije', 'serija');
  const ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------- podaci i čuvanje ---------- */
  const KEY = 'fitora-v1';
  const SAMPLE = {
    pon: [['potisak', 4, 10], ['bocno', 3, 12], ['prednje', 3, 12], ['pike', 3, 8]],
    sre: [['cucanj', 4, 15], ['iskorak', 3, 10], ['plank', 3, 40]],
    pet: [['sklekovi', 4, 12], ['veslanje', 3, 12], ['pregib', 3, 12]]
  };
  const mkEntry = (id, sets, reps) => ({ id, sets, reps, done: Array(sets).fill(0) });
  function samplePlan() {
    const plan = {};
    DAYS.forEach(d => { plan[d.k] = (SAMPLE[d.k] || []).map(r => mkEntry(...r)); });
    return plan;
  }
  const hash = str => { let h = 2166136261; for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619); return h >>> 0; };
  // Primer istorije: poslednjih 10 nedelja, pon/sre/pet, poneki izostanak.
  function makeDemo() {
    const demo = {};
    const groups = [['prednje-rame', 'srednje-rame', 'triceps', 'prednje-rame'], ['noge', 'zadnjica', 'core', 'noge'], ['grudi', 'leda', 'biceps', 'grudi']];
    for (let d = addDays(WEEK0, -70); d <= NOW; d = addDays(d, 1)) {
      const wd = (d.getDay() + 6) % 7, slot = wd === 0 ? 0 : wd === 2 ? 1 : wd === 4 ? 2 : -1;
      if (slot < 0) continue;
      const h = hash(iso(d));
      if (d < WEEK0 && h % 100 < 14) continue;
      const sets = 9 + (h >> 3) % 6, m = {};
      for (let k = 0; k < sets; k++) { const g = groups[slot][k % 4]; m[g] = (m[g] || 0) + 1; }
      demo[iso(d)] = { s: sets, r: sets * (10 + h % 4), m };
    }
    return demo;
  }
  function cleanLog(o) {
    const out = {};
    if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || !(v.s > 0)) continue;
      const m = {};
      for (const [mk, mv] of Object.entries(v.m || {})) if (MUSCLES[mk] && mv > 0) m[mk] = +mv;
      out[k] = { s: +v.s, r: +v.r || 0, m };
    }
    return out;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const o = JSON.parse(raw), plan = {}, fresh = o.week !== iso(WEEK0);
      DAYS.forEach(d => {
        plan[d.k] = ((o.plan || {})[d.k] || []).filter(e => e && BY[e.id]).map(e => {
          const sets = clamp(+e.sets || 3, 1, 10);
          return {
            id: e.id, sets, reps: clamp(+e.reps || 10, 1, 300),
            done: Array.from({ length: sets }, (_, i) => fresh ? 0 : Math.max(0, +(e.done || [])[i] || 0))
          };
        });
      });
      const st = o.settings || {};
      return {
        plan, sample: !!o.sample, log: cleanLog(o.log), demo: o.demo ? cleanLog(o.demo) : null,
        settings: {
          theme: ['auto', 'light', 'dark'].includes(st.theme) ? st.theme : 'auto',
          anim: typeof st.anim === 'boolean' ? st.anim : !REDUCED,
          name: String(st.name || '').slice(0, 24)
        }
      };
    } catch (e) { return null; }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify({ plan: state.plan, sample: state.sample, log: state.log, demo: state.demo, settings: state.settings, week: iso(WEEK0) }));
    } catch (e) { /* privatni prozor */ }
  }
  const freshState = () => ({ plan: samplePlan(), sample: true, log: {}, demo: makeDemo(), settings: { theme: 'auto', anim: !REDUCED, name: '' } });
  const saved = load();
  const h0 = location.hash.slice(1);
  const state = Object.assign(saved || freshState(), {
    view: VIEWS.includes(h0) ? h0 : 'plan', muscle: 'prednje-rame', equip: 'sve', day: TODAY,
    range: 'week', pick: null, confirmReset: false, shareTab: 'send', shareImport: '', shareParsed: null, shareErr: ''
  });
  const dayHas = i => state.plan[DAYS[i].k].length > 0;
  if (!dayHas(state.day)) { const f = DAYS.findIndex((_, i) => dayHas(i)); if (f >= 0) state.day = f; }
  const anim = () => state.settings.anim;

  function applyTheme() {
    const r = document.documentElement, t = state.settings.theme;
    if (t === 'auto') r.removeAttribute('data-ui'); else r.setAttribute('data-ui', t);
    try { localStorage.setItem('fitora-theme', t); } catch (e) { /* bez čuvanja */ }
  }
  applyTheme();

  /* ---------- mapa mišića ---------- */
  const cap = (x1, y1, x2, y2, w) => `<line class="cap" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke-width="${w}"/>`;
  const ell = (cx, cy, rx, ry) => `<ellipse class="blob" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
  const ZONES = {
    'noge': [cap(54, 134, 52, 180, 18), cap(76, 134, 78, 180, 18), cap(184, 142, 182, 182, 17), cap(206, 142, 208, 182, 17)],
    'listovi': [cap(52, 187, 53, 230, 11), cap(78, 187, 77, 230, 11), cap(182, 189, 183, 230, 11), cap(208, 189, 207, 230, 11)],
    'podlaktice': [cap(26, 104, 23, 128, 9), cap(104, 104, 107, 128, 9), cap(160, 104, 157, 128, 9), cap(230, 104, 233, 128, 9)],
    'zadnjica': [ell(184, 128, 11, 12), ell(206, 128, 11, 12)],
    'leda': [ell(195, 66, 27, 13), ell(195, 93, 19, 17)],
    'core': ['<rect class="blob" x="53" y="82" width="24" height="40" rx="9"/>'],
    'grudi': [ell(55, 68, 13, 11), ell(75, 68, 13, 11)],
    'biceps': [cap(30, 76, 27, 100, 11), cap(100, 76, 103, 100, 11)],
    'triceps': [cap(164, 76, 161, 100, 11), cap(226, 76, 229, 100, 11)],
    'srednje-rame': [ell(33, 64, 7, 10), ell(97, 64, 7, 10)],
    'zadnje-rame': [ell(169, 58, 9, 10), ell(221, 58, 9, 10)],
    'prednje-rame': [ell(45, 56, 9, 11), ell(85, 56, 9, 11)]
  };
  const NEUTRAL = [
    '<circle class="blob" cx="65" cy="20" r="12"/>', '<circle class="blob" cx="195" cy="20" r="12"/>',
    cap(65, 34, 65, 42, 9), cap(195, 34, 195, 42, 9),
    '<circle class="blob" cx="23" cy="134" r="5"/>', '<circle class="blob" cx="107" cy="134" r="5"/>',
    '<circle class="blob" cx="157" cy="134" r="5"/>', '<circle class="blob" cx="233" cy="134" r="5"/>',
    ell(65, 128, 20, 9), ell(45, 100, 8, 22), ell(85, 100, 8, 22)
  ];
  $('#map').innerHTML =
    `<svg viewBox="0 0 260 258" role="group" aria-label="Mapa mišića, prednja i zadnja strana">
      <g class="neutral">${NEUTRAL.join('')}</g>
      ${Object.keys(ZONES).map(k => `<g class="zone" data-m="${k}" role="button" tabindex="0" aria-pressed="false" aria-label="${mlabel(k)}"><title>${mlabel(k)}</title>${ZONES[k].join('')}</g>`).join('')}
      <text x="65" y="252" text-anchor="middle" class="map-label">PREDNJA</text>
      <text x="195" y="252" text-anchor="middle" class="map-label">ZADNJA</text>
    </svg>`;

  /* ---------- slike (animirani skelet) ---------- */
  const figs = { grid: [], plan: [], sheet: null };
  const clearFigs = k => { figs[k].forEach(f => f.destroy()); figs[k] = []; };

  /* ---------- biblioteka ---------- */
  const matches = (e, m) => m === 'sve' || e.primary.includes(m) || e.secondary.includes(m);
  const equipOK = e => state.equip === 'sve' || e.equip === state.equip;
  function visible() {
    const rank = e => state.muscle === 'sve' || e.primary.includes(state.muscle) ? 0 : 1;
    return EXERCISES.filter(e => equipOK(e) && matches(e, state.muscle)).sort((a, b) => rank(a) - rank(b));
  }
  const daysWith = id => DAYS.filter(d => state.plan[d.k].some(e => e.id === id));

  function renderChips() {
    const count = m => EXERCISES.filter(e => equipOK(e) && matches(e, m)).length;
    $('#chips').innerHTML = ['sve', ...Object.keys(MUSCLES)].map(m =>
      `<button class="chip" data-m="${m}" aria-pressed="${state.muscle === m}">${m === 'sve' ? 'Sve' : mlabel(m)}<span class="n">${count(m)}</span></button>`).join('');
    $$('.zone').forEach(z => { z.setAttribute('aria-pressed', z.dataset.m === state.muscle); z.classList.toggle('on', z.dataset.m === state.muscle); });
    $$('#equip button').forEach(b => b.setAttribute('aria-pressed', b.dataset.e === state.equip));
  }

  function renderGrid() {
    clearFigs('grid');
    const list = visible();
    $('#res-title').textContent = state.muscle === 'sve' ? 'Sve vežbe' : mlabel(state.muscle);
    $('#res-count').textContent = `${list.length} ${plural(list.length, 'vežba', 'vežbe', 'vežbi')}`;
    const grid = $('#grid');
    if (!list.length) {
      grid.innerHTML = '<p class="empty">Za ovaj mišić nema vežbi sa izabranom opremom. Probaj „Sve“ u filteru opreme.</p>';
      return;
    }
    grid.innerHTML = list.map(e => {
      const primary = state.muscle === 'sve' || e.primary.includes(state.muscle);
      const inPlan = daysWith(e.id);
      return `<div class="card" role="button" tabindex="0" data-id="${e.id}" aria-label="${e.name}, otvori detalje">
        <div class="card-fig"><svg></svg><span class="lvl">${e.level}</span></div>
        <div class="card-body">
          <h3>${e.name}</h3>
          <p class="meta">${e.primary.map(mlabel).join(' · ')}<span class="sep"></span>${EQUIP[e.equip]}</p>
          <div class="card-foot">
            <span class="score" aria-label="${e.sets} ${setsWord(e.sets)} po ${e.reps} ${unitWord(e, e.reps)}"><b>${e.sets}</b><i>×</i><b>${e.reps}</b><small>${unitShort(e)}${e.per ? ' ' + e.per : ''}</small></span>
            ${state.muscle === 'sve' ? '' : `<span class="rel ${primary ? 'main' : ''}">${primary ? 'Glavni mišić' : 'Pomoćni mišić'}</span>`}
          </div>
          ${inPlan.length ? `<p class="inplan">U planu: ${inPlan.map(d => d.s).join(' · ')}</p>` : ''}
        </div>
      </div>`;
    }).join('');
    $$('.card', grid).forEach((c, i) => {
      figs.grid.push(Rig.make($('svg', c), BY[c.dataset.id], { aspect: 1.78, offset: i * 260, static: !anim() }));
    });
  }

  /* ---------- moj plan ---------- */
  const planTotals = () => DAYS.reduce((n, d) => n + state.plan[d.k].length, 0);

  function renderPlan() {
    clearFigs('plan');
    $('#plan-date').textContent = `${DAYS[TODAY].f}, ${fmtDate(NOW)}`;
    const maxSets = Math.max(12, ...DAYS.map(d => state.plan[d.k].reduce((n, e) => n + e.sets, 0)));
    $('#week').innerHTML = DAYS.map((d, i) => {
      const sets = state.plan[d.k].reduce((n, e) => n + e.sets, 0);
      const h = sets ? Math.max(6, Math.round(sets / maxSets * 44)) : 2;
      return `<button class="wd" data-i="${i}" aria-pressed="${i === state.day}" aria-label="${d.f}, ${sets} ${setsWord(sets)}">
        <span class="wd-name">${d.s}${i === TODAY ? '<em>danas</em>' : ''}</span>
        <span class="wd-bar"><i style="height:${h}px" class="${sets ? '' : 'zero'}"></i></span>
        <span class="wd-n">${sets || '–'}</span></button>`;
    }).join('');

    const day = DAYS[state.day], list = state.plan[day.k];
    const sets = list.reduce((n, e) => n + e.sets, 0), done = list.reduce((n, e) => n + e.done.filter(Boolean).length, 0);
    const muscles = [...new Set(list.flatMap(e => BY[e.id].primary))].map(mlabel);
    const mtxt = muscles.length > 3 ? muscles.slice(0, 3).join(' · ') + ` +${muscles.length - 3}` : muscles.join(' · ');
    $('#day-title').textContent = day.f;
    $('#day-sub').textContent = list.length
      ? `${mtxt} · ${list.length} ${plural(list.length, 'vežba', 'vežbe', 'vežbi')} · ${sets} ${setsWord(sets)}`
      : 'Dan odmora';
    $('#day-prog').hidden = !list.length;
    const full = sets > 0 && done === sets, pt = $('#day-prog-txt');
    pt.className = full ? 'full' : '';
    pt.innerHTML = full ? `${ICON_CHECK}Završeno` : `${done} / ${sets} ${setsWord(sets)}`;
    $('#day-prog-bar').style.width = sets ? Math.round(done / sets * 100) + '%' : '0%';
    $('#sample-note').hidden = !state.sample || planTotals() === 0;

    const ol = $('#day-list');
    if (!list.length) {
      ol.innerHTML = `<li class="rest"><p>Ništa nije zakazano za ${day.f.toLowerCase()}.</p><p class="rest-sub">Izaberi mišić u biblioteci i dodaj vežbe u ovaj dan.</p></li>`;
      return;
    }
    ol.innerHTML = list.map((en, idx) => {
      const ex = BY[en.id];
      return `<li class="row" data-idx="${idx}">
        <button class="row-fig" data-act="open" aria-label="Otvori ${ex.name}"><svg></svg></button>
        <div class="row-main">
          <h3><button data-act="open">${ex.name}</button></h3>
          <p class="meta">${ex.primary.map(mlabel).join(' · ')}</p>
        </div>
        <div class="score big" aria-label="${en.sets} ${setsWord(en.sets)} po ${en.reps} ${unitWord(ex, en.reps)}"><b>${en.sets}</b><i>×</i><b>${en.reps}</b><small>${unitShort(ex)}${ex.per ? ' ' + ex.per : ''}</small></div>
        <div class="row-foot">
          <div class="sets" role="group" aria-label="Urađene serije">${en.done.map((d, i) =>
            `<button class="set" data-act="set" data-i="${i}" aria-pressed="${!!d}" aria-label="Serija ${i + 1}">${i + 1}</button>`).join('')}</div>
          <button class="link" data-act="remove">Ukloni</button>
        </div>
      </li>`;
    }).join('');
    $$('.row', ol).forEach(r => {
      const ex = BY[list[+r.dataset.idx].id];
      figs.plan.push(Rig.make($('svg', r), ex, { viewBox: Rig.bounds(ex), crop: true, static: true }));
    });
  }

  function logSet(dayIdx, en, dir, reps) {
    if (state.demo) state.demo = null; // prva prava serija menja primer podataka
    const k = iso(dateOfDay(dayIdx)), e = state.log[k] || (state.log[k] = { s: 0, r: 0, m: {} });
    e.s += dir; e.r += dir * reps;
    BY[en.id].primary.forEach(m => { e.m[m] = (e.m[m] || 0) + dir; if (e.m[m] <= 0) delete e.m[m]; });
    if (e.s <= 0) delete state.log[k];
  }

  /* ---------- statistika ---------- */
  const logOf = () => state.demo || state.log;
  function sumRange(a, b) {
    const L = logOf(), t = { s: 0, r: 0, days: 0, m: {} };
    for (let d = a; d <= b; d = addDays(d, 1)) {
      const e = L[iso(d)];
      if (!e || !e.s) continue;
      t.s += e.s; t.r += e.r; t.days++;
      for (const k in e.m) t.m[k] = (t.m[k] || 0) + e.m[k];
    }
    return t;
  }
  function periodOf(kind) {
    const y = NOW.getFullYear(), mo = NOW.getMonth();
    if (kind === 'week') return { a: WEEK0, b: addDays(WEEK0, 6), pa: addDays(WEEK0, -7), pb: addDays(WEEK0, -1), prevText: 'Prošle nedelje', prevAcc: 'prošlu nedelju', when: 'ove nedelje', title: 'Serije po danima' };
    if (kind === 'month') { const a = new Date(y, mo, 1); return { a, b: new Date(y, mo + 1, 0), pa: new Date(y, mo - 1, 1), pb: addDays(a, -1), prevText: 'Prošlog meseca', prevAcc: 'prošli mesec', when: 'ovog meseca', title: 'Serije po danima' }; }
    return { a: new Date(y, 0, 1), b: new Date(y, 11, 31), pa: new Date(y - 1, 0, 1), pb: new Date(y - 1, 11, 31), prevText: 'Prošle godine', prevAcc: 'prošlu godinu', when: 'ove godine', title: 'Serije po mesecima' };
  }
  function bucketsOf(kind, p) {
    const out = [], L = logOf();
    if (kind === 'year') {
      for (let m = 0; m < 12; m++) {
        const t = sumRange(new Date(p.a.getFullYear(), m, 1), new Date(p.a.getFullYear(), m + 1, 0));
        out.push({ v: t.s, r: t.r, label: MON_S[m], full: MONTHS[m][0].toUpperCase() + MONTHS[m].slice(1), now: m === NOW.getMonth(), show: true });
      }
      return out;
    }
    const n = Math.round((p.b - p.a) / 864e5) + 1;
    for (let i = 0; i < n; i++) {
      const d = addDays(p.a, i), e = L[iso(d)] || { s: 0, r: 0 }, wd = (d.getDay() + 6) % 7;
      out.push({
        v: e.s, r: e.r, now: iso(d) === iso(NOW),
        label: kind === 'week' ? DAYS[wd].s : String(d.getDate()),
        full: `${DAYS[wd].f}, ${fmtShort(d)}`,
        show: kind === 'week' || i % 7 === 0
      });
    }
    return out;
  }
  function readout(b) {
    return `<span><b>${b.full}</b></span><span>${b.v} ${setsWord(b.v)} · ${b.r} pon.</span>`;
  }

  function renderStats() {
    const kind = state.range, p = periodOf(kind), cur = sumRange(p.a, p.b), prev = sumRange(p.pa, p.pb);
    const bk = bucketsOf(kind, p);
    const top = Math.max(4, Math.ceil(Math.max(...bk.map(b => b.v), 0) / 4) * 4);
    const nowIdx = Math.max(0, bk.findIndex(b => b.now));
    const rows = Object.entries(cur.m).sort((a, b) => b[1] - a[1]).slice(0, 6), maxM = rows.length ? rows[0][1] : 1;
    $('#stats-body').innerHTML = `
      ${state.demo ? `<div class="note"><span>Prikazani su primeri podataka da vidiš kako izgleda. Nestaju čim označiš prvu urađenu seriju.</span><button class="link" data-act="clear-sample">Obriši primer</button></div>` : ''}
      <div class="seg" id="range" role="group" aria-label="Period" style="margin-top:18px">
        <button data-range="week" aria-pressed="${kind === 'week'}">Nedelja</button>
        <button data-range="month" aria-pressed="${kind === 'month'}">Mesec</button>
        <button data-range="year" aria-pressed="${kind === 'year'}">Godina</button>
      </div>
      <div class="kpis">
        <div class="kpi main"><b>${cur.s}</b><span>${setsWord(cur.s)} ${p.when}</span></div>
        <div class="kpi"><b>${cur.days}</b><span>${plural(cur.days, 'trening', 'treninga', 'treninga')}</span></div>
        <div class="kpi"><b>${cur.r}</b><span>ponavljanja</span></div>
      </div>
      <p class="prev">${prev.s ? `${p.prevText}: ${prev.s} ${setsWord(prev.s)} na ${prev.days} ${plural(prev.days, 'treningu', 'treninga', 'treninga')}.` : `Nema podataka za ${p.prevAcc}.`}</p>
      <div class="chartcard">
        <h3>${p.title}</h3>
        <div class="cw ${bk.length > 12 ? 'dense' : ''}">
          <div class="chart" role="group" aria-label="${p.title}">
            <div class="gl" style="bottom:100%"><span>${top}</span></div>
            <div class="gl" style="bottom:50%"><span>${top / 2}</span></div>
            <div class="bars has" id="bars">${bk.map((b, i) =>
              `<button class="cb ${i === nowIdx ? 'sel' : ''}" data-b="${i}" aria-label="${b.full}: ${b.v} ${setsWord(b.v)}"><i class="${b.v ? '' : 'zero'}" style="height:${b.v / top * 100}%"></i></button>`).join('')}</div>
          </div>
          <div class="axis">${bk.map(b => `<span class="${b.now ? 'now' : ''}">${b.show ? `<em>${b.label}</em>` : ''}</span>`).join('')}</div>
        </div>
        <div class="readout" id="readout">${readout(bk[nowIdx])}</div>
      </div>
      <div class="mcard">
        <h3>Po mišićima ${p.when}</h3>
        ${rows.length ? rows.map(([m, v]) => `<div class="mrow"><span>${mlabel(m)}</span><div class="tr"><i style="width:${Math.max(4, v / maxM * 100)}%"></i></div><b>${v}</b></div>`).join('')
          : `<p class="none">Još nema urađenih serija ${p.when}. Označi serije u planu i ovde će se pojaviti tvoji mišići.</p>`}
      </div>`;
    state.buckets = bk;
  }

  /* ---------- podešavanja ---------- */
  function renderSettings() {
    const s = state.settings;
    $('#settings-body').innerHTML = `
      <p class="eyebrow gtitle">Izgled</p>
      <div class="group">
        <div class="srow col">
          <div><b>Tema</b><small>Automatski prati podešavanje telefona.</small></div>
          <div class="seg" role="group" aria-label="Tema">
            <button data-theme-opt="auto" aria-pressed="${s.theme === 'auto'}">Automatski</button>
            <button data-theme-opt="light" aria-pressed="${s.theme === 'light'}">Svetla</button>
            <button data-theme-opt="dark" aria-pressed="${s.theme === 'dark'}">Tamna</button>
          </div>
        </div>
        <div class="srow">
          <div><b>Animacija pokreta</b><small>Vežbe se kreću u petlji. Isključi za mirne slike.</small></div>
          <button class="sw" role="switch" aria-checked="${s.anim}" aria-label="Animacija pokreta" data-act="toggle-anim"></button>
        </div>
      </div>
      <p class="eyebrow gtitle">Profil</p>
      <div class="group"><div class="srow col field">
        <div><label for="set-name">Ime</label><input id="set-name" type="text" maxlength="24" autocomplete="off" placeholder="Na primer: Marko" value="${esc(s.name)}"><small>Pojavljuje se u planu koji deliš.</small></div>
      </div></div>
      <p class="eyebrow gtitle">Podaci</p>
      <div class="group">
        ${state.sample || state.demo ? `<div class="srow"><div><b>Primer rasporeda i statistike</b><small>Brišeš ga jednim dodirom.</small></div><button class="btn ghost sm" data-act="clear-sample">Obriši</button></div>` : ''}
        <div class="srow"><div><b>Resetuj sve</b><small>Briše plan, statistiku i podešavanja sa ovog uređaja.</small></div>${state.confirmReset ? '' : '<button class="btn danger sm" data-act="reset-ask">Resetuj</button>'}</div>
        ${state.confirmReset ? `<div class="confirm"><p>Ovo se ne može vratiti. Sigurno želiš da obrišeš sve?</p><div class="two"><button class="btn danger sm" data-act="reset-yes">Da, obriši</button><button class="btn ghost sm" data-act="reset-no">Odustani</button></div></div>` : ''}
      </div>
      <p class="about">FITORA · prototip. Podaci se čuvaju samo na ovom uređaju.</p>`;
  }

  function resetAll() {
    Object.assign(state, freshState(), { confirmReset: false, day: TODAY });
    const f = DAYS.findIndex((_, i) => dayHas(i)); if (!dayHas(state.day) && f >= 0) state.day = f;
    applyTheme(); save(); refresh();
    toast('Podaci su obrisani');
  }
  function clearSample() {
    if (state.sample) { DAYS.forEach(d => { state.plan[d.k] = []; }); state.sample = false; }
    state.demo = null; save(); refresh();
  }

  /* ---------- listovi (detalj vežbe i deljenje) ---------- */
  const SHEET = $('#sheet'), SHARE = $('#share'), SCRIM = $('#scrim');
  let overlay = null;
  function openOverlay(el, opener) {
    overlay = { el, opener: opener || document.activeElement };
    $('#app').inert = true; SCRIM.hidden = false; el.hidden = false;
    el.classList.remove('open'); void el.offsetWidth; el.classList.add('open');
    const sc = $('.sh-scroll', el); if (sc) sc.scrollTop = 0;
    $('.sh-close', el).focus();
  }
  function closeOverlay() {
    if (!overlay) return;
    const { el, opener } = overlay;
    if (el === SHEET && figs.sheet) { figs.sheet.destroy(); figs.sheet = null; }
    el.hidden = true; SCRIM.hidden = true; $('#app').inert = false; overlay = null;
    if (opener && document.contains(opener)) opener.focus();
  }

  const sheet = { id: null, day: 0, sets: 3, reps: 10 };
  const entryOn = (id, dayIdx) => state.plan[DAYS[dayIdx].k].find(e => e.id === id);

  function openSheet(id, dayIdx, opener) {
    const ex = BY[id], cur = entryOn(id, dayIdx ?? state.day);
    sheet.id = id; sheet.day = dayIdx ?? state.day;
    sheet.sets = cur ? cur.sets : ex.sets; sheet.reps = cur ? cur.reps : ex.reps;
    $('#sh-body').innerHTML = `
      <div class="sh-fig"><svg id="sh-svg"></svg></div>
      <div class="seg modes" id="sh-modes" role="group" aria-label="Prikaz pokreta">
        <button data-mode="a" aria-pressed="${!anim()}">Početak</button>
        <button data-mode="b" aria-pressed="false">Kraj</button>
        <button data-mode="loop" aria-pressed="${anim()}">Pokret</button>
      </div>
      <p class="eyebrow">${ex.primary.map(mlabel).join(' · ')}</p>
      <h2 id="sh-title">${ex.name}</h2>
      <div class="tags"><span class="tag">${EQUIP[ex.equip]}</span><span class="tag">${ex.level}</span>${ex.secondary.length ? `<span class="tag plain">Pomaže i: ${ex.secondary.map(mlabel).join(', ')}</span>` : ''}</div>
      <p class="cue">${ex.cue}</p>
      <h4>Kako se izvodi</h4>
      <ol class="steps">${ex.steps.map(s => `<li><span>${s}</span></li>`).join('')}</ol>
      <h4>Česte greške</h4>
      <ul class="mistakes">${ex.mistakes.map(s => `<li>${s}</li>`).join('')}</ul>`;
    renderSheetAdd();
    figs.sheet = Rig.make($('#sh-svg'), ex, { mode: anim() ? 'loop' : 'a', instant: !anim() });
    openOverlay(SHEET, opener);
  }

  function renderSheetAdd() {
    const ex = BY[sheet.id], exists = entryOn(sheet.id, sheet.day), step = ex.unit === 'sek' ? 5 : 1;
    $('#sh-add').innerHTML = `
      <div class="days" role="group" aria-label="Dan u nedelji">${DAYS.map((d, i) =>
        `<button class="dp" data-day="${i}" aria-pressed="${i === sheet.day}" aria-label="${d.f}">${d.s}${entryOn(sheet.id, i) ? '<i></i>' : ''}</button>`).join('')}</div>
      <div class="steppers">
        <div class="stp" role="group" aria-label="Broj serija">
          <button data-step="sets" data-d="-1" aria-label="Manje serija">−</button>
          <div><b>${sheet.sets}</b><small>${setsWord(sheet.sets)}</small></div>
          <button data-step="sets" data-d="1" aria-label="Više serija">+</button>
        </div>
        <div class="stp" role="group" aria-label="${ex.unit === 'sek' ? 'Trajanje' : 'Broj ponavljanja'}">
          <button data-step="reps" data-d="${-step}" aria-label="Manje">−</button>
          <div><b>${sheet.reps}</b><small>${unitWord(ex, sheet.reps)}${ex.per ? ' ' + ex.per : ''}</small></div>
          <button data-step="reps" data-d="${step}" aria-label="Više">+</button>
        </div>
      </div>
      <button class="btn" data-act="submit">${exists ? 'Ažuriraj' : 'Dodaj u plan'} · ${DAYS[sheet.day].f}</button>`;
  }

  function addToPlan() {
    const list = state.plan[DAYS[sheet.day].k], ex = BY[sheet.id], cur = entryOn(sheet.id, sheet.day);
    if (cur) { cur.sets = sheet.sets; cur.reps = sheet.reps; cur.done = Array.from({ length: sheet.sets }, (_, i) => cur.done[i] || 0); }
    else list.push(mkEntry(sheet.id, sheet.sets, sheet.reps));
    state.sample = false; state.day = sheet.day;
    save();
    const dayName = DAYS[sheet.day].f;
    closeOverlay(); refresh();
    toast(`${cur ? 'Ažurirano' : 'Dodato'}: ${ex.name} · ${dayName}`, { label: 'Pogledaj plan', fn: () => setView('plan') });
  }

  /* ---------- deljenje plana ---------- */
  const planCode = () => 'FITORA1:' + btoa(JSON.stringify(DAYS.map(d => state.plan[d.k].map(e => [e.id, e.sets, e.reps]))));
  function planText() {
    const nm = state.settings.name.trim(), lines = [`FITORA · nedeljni plan treninga${nm ? ' · ' + nm : ''}`, ''];
    DAYS.forEach(d => {
      const l = state.plan[d.k]; if (!l.length) return;
      lines.push(d.f.toUpperCase());
      l.forEach(e => { const ex = BY[e.id]; lines.push(`• ${ex.name}: ${e.sets} × ${e.reps}${ex.unit === 'sek' ? ' sek' : ''}${ex.per ? ' ' + ex.per : ''}`); });
      lines.push('');
    });
    lines.push('Za uvoz u FITORU nalepi ovaj kod (Podeli → Uvezi):', planCode());
    return lines.join('\n');
  }
  function parseCode(text) {
    const m = /FITORA1:([A-Za-z0-9+/=]+)/.exec(text);
    if (!m) return null;
    try {
      const arr = JSON.parse(atob(m[1])), plan = {};
      if (!Array.isArray(arr) || arr.length !== 7) return null;
      DAYS.forEach((d, i) => {
        if (!Array.isArray(arr[i])) throw new Error('oblik');
        plan[d.k] = arr[i].slice(0, 20).filter(x => Array.isArray(x) && BY[x[0]]).map(x => mkEntry(x[0], clamp(+x[1] || 3, 1, 10), clamp(+x[2] || 10, 1, 300)));
      });
      return plan;
    } catch (e) { return null; }
  }
  function renderShare() {
    const send = state.shareTab === 'send', n = planTotals();
    let body;
    if (send) {
      body = n ? `
        <p>Pošalji ovaj tekst kome želiš. Ko ga nalepi u FITORU (Podeli → Uvezi), dobija ceo plan.</p>
        <textarea class="ta ro" id="share-text" rows="11" readonly aria-label="Tekst plana">${esc(planText())}</textarea>
        <button class="btn" data-act="copy-plan">Kopiraj plan</button>`
        : '<p>Plan je prazan. Dodaj vežbe u plan pa ga podeli.</p>';
    } else {
      const pr = state.shareParsed;
      body = `
        <p>Nalepi plan koji si dobio od nekog drugog.</p>
        <textarea class="ta" id="imp" rows="6" placeholder="Nalepi ovde" aria-label="Plan za uvoz">${esc(state.shareImport)}</textarea>
        ${state.shareErr ? `<p class="err">${state.shareErr}</p>` : ''}
        ${pr ? (() => {
          const days = DAYS.filter(d => pr[d.k].length), cnt = days.reduce((a, d) => a + pr[d.k].length, 0);
          return `<div class="preview"><b>${days.length} ${plural(days.length, 'dan', 'dana', 'dana')} · ${cnt} ${plural(cnt, 'vežba', 'vežbe', 'vežbi')}</b><span>${days.map(d => `${d.s} ${pr[d.k].length}`).join(' · ')}</span></div>
            <button class="btn" data-act="imp-replace">Zameni moj plan</button>
            <button class="btn ghost" data-act="imp-merge">Dodaj u moj plan</button>`;
        })() : '<button class="btn" data-act="imp-check">Proveri plan</button>'}`;
    }
    $('#share-body').innerHTML = `
      <p class="eyebrow" style="padding-top:20px">Plan</p>
      <h2 class="stitle" id="share-title" style="margin-top:0;padding-top:0">Podeli plan</h2>
      <div class="seg" role="group" aria-label="Podeli ili uvezi">
        <button data-share-tab="send" aria-pressed="${send}">Pošalji</button>
        <button data-share-tab="import" aria-pressed="${!send}">Uvezi</button>
      </div>${body}`;
  }
  function openShare(opener) {
    state.shareTab = 'send'; state.shareParsed = null; state.shareErr = ''; state.shareImport = '';
    renderShare(); openOverlay(SHARE, opener);
  }
  async function copyPlan() {
    const ta = $('#share-text'), text = planText();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch (e) { try { ta.focus(); ta.select(); ok = document.execCommand('copy'); } catch (e2) { ok = false; } }
    if (!ok) { ta.focus(); ta.select(); }
    toast(ok ? 'Plan je kopiran' : 'Tekst je označen, kopiraj ga ručno');
  }
  function importPlan(merge) {
    const incoming = state.shareParsed; if (!incoming) return;
    DAYS.forEach(d => {
      if (merge) incoming[d.k].forEach(e => { if (!state.plan[d.k].some(x => x.id === e.id)) state.plan[d.k].push(e); });
      else state.plan[d.k] = incoming[d.k];
    });
    state.sample = false;
    const f = DAYS.findIndex((_, i) => dayHas(i)); if (!dayHas(state.day) && f >= 0) state.day = f;
    save(); closeOverlay(); setView('plan'); refresh();
    toast(merge ? 'Vežbe su dodate u tvoj plan' : 'Plan je uvezen');
  }

  /* ---------- obaveštenja ---------- */
  let toastT = 0;
  function toast(msg, action) {
    const t = $('#toast');
    t.innerHTML = `<span>${msg}</span>${action ? '<button id="toast-act">' + action.label + '</button>' : ''}`;
    t.hidden = false;
    if (action) $('#toast-act').onclick = () => { action.fn(); t.hidden = true; };
    clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 4200);
  }

  /* ---------- prikazi ---------- */
  function renderNav() {
    $$('.nt').forEach(b => { if (b.dataset.view === state.view) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    VIEWS.forEach(v => { $('#view-' + v).hidden = v !== state.view; });
  }
  function renderView() {
    clearFigs('grid'); clearFigs('plan');
    if (state.view === 'plan') renderPlan();
    else if (state.view === 'biblioteka') { renderChips(); renderGrid(); }
    else if (state.view === 'statistika') renderStats();
    else renderSettings();
  }
  const refresh = () => { renderNav(); renderView(); };
  function setView(v, fromHash) {
    if (!VIEWS.includes(v)) v = 'plan';
    state.view = v; state.confirmReset = false;
    if (!fromHash && location.hash !== '#' + v) location.hash = v;
    refresh(); window.scrollTo(0, 0);
  }
  addEventListener('hashchange', () => {
    const h = location.hash.slice(1);
    if (VIEWS.includes(h) && h !== state.view) setView(h, true);
  });

  /* ---------- događaji ---------- */
  document.addEventListener('click', ev => {
    const t = ev.target;
    const nt = t.closest('.nt'); if (nt) return setView(nt.dataset.view);
    if (t.closest('#btn-share')) return openShare(t.closest('#btn-share'));
    const chip = t.closest('.chip');
    if (chip) {
      state.muscle = chip.dataset.m; renderChips(); renderGrid();
      const again = $(`.chip[data-m="${state.muscle}"]`); if (again) again.focus();
      return;
    }
    const zone = t.closest('.zone');
    if (zone) { state.muscle = state.muscle === zone.dataset.m ? 'sve' : zone.dataset.m; renderChips(); renderGrid(); return; }
    const eq = t.closest('#equip button'); if (eq) { state.equip = eq.dataset.e; renderChips(); renderGrid(); return; }
    const card = t.closest('.card'); if (card) return openSheet(card.dataset.id, state.day, card);
    const wd = t.closest('.wd'); if (wd) { state.day = +wd.dataset.i; renderPlan(); return; }
    const rg = t.closest('[data-range]'); if (rg) { state.range = rg.dataset.range; renderStats(); const a = $(`[data-range="${state.range}"]`); if (a) a.focus(); return; }
    const bar = t.closest('.cb');
    if (bar) {
      $$('.cb').forEach(b => b.classList.toggle('sel', b === bar));
      $('#readout').innerHTML = readout(state.buckets[+bar.dataset.b]); return;
    }
    const th = t.closest('[data-theme-opt]');
    if (th) { state.settings.theme = th.dataset.themeOpt; applyTheme(); save(); renderSettings(); return; }
    const st = t.closest('[data-share-tab]'); if (st) { state.shareTab = st.dataset.shareTab; renderShare(); return; }

    const row = t.closest('.row');
    if (row) {
      const list = state.plan[DAYS[state.day].k], idx = +row.dataset.idx, en = list[idx], act = t.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'set') {
        const i = +act.dataset.i, was = en.done[i];
        en.done[i] = was ? 0 : en.reps;
        logSet(state.day, en, was ? -1 : 1, was || en.reps);
        save(); renderPlan();
      } else if (act.dataset.act === 'open') openSheet(en.id, state.day, act);
      else if (act.dataset.act === 'remove') {
        list.splice(idx, 1); save(); refresh();
        toast(`Uklonjeno: ${BY[en.id].name}`, { label: 'Vrati', fn: () => { list.splice(idx, 0, en); save(); refresh(); } });
      }
      return;
    }

    const mode = t.closest('[data-mode]');
    if (mode && figs.sheet) {
      figs.sheet.setMode(mode.dataset.mode);
      $$('[data-mode]', SHEET).forEach(b => b.setAttribute('aria-pressed', b === mode));
      return;
    }
    const dp = t.closest('.dp');
    if (dp) {
      sheet.day = +dp.dataset.day;
      const cur = entryOn(sheet.id, sheet.day); if (cur) { sheet.sets = cur.sets; sheet.reps = cur.reps; }
      renderSheetAdd(); return;
    }
    const sp = t.closest('[data-step]');
    if (sp) {
      const d = +sp.dataset.d, sec = BY[sheet.id].unit === 'sek';
      if (sp.dataset.step === 'sets') sheet.sets = clamp(sheet.sets + d, 1, 10);
      else sheet.reps = clamp(sheet.reps + d, sec ? 5 : 1, sec ? 300 : 60);
      renderSheetAdd();
      const again = $(`[data-step="${sp.dataset.step}"][data-d="${sp.dataset.d}"]`, SHEET); if (again) again.focus();
      return;
    }
    if (t === SCRIM) return closeOverlay();

    const act = t.closest('[data-act]');
    if (!act) return;
    switch (act.dataset.act) {
      case 'close': closeOverlay(); break;
      case 'submit': addToPlan(); break;
      case 'go-library': setView('biblioteka'); break;
      case 'clear-sample': clearSample(); break;
      case 'toggle-anim': state.settings.anim = !state.settings.anim; save(); renderSettings(); break;
      case 'reset-ask': state.confirmReset = true; renderSettings(); break;
      case 'reset-no': state.confirmReset = false; renderSettings(); break;
      case 'reset-yes': resetAll(); break;
      case 'copy-plan': copyPlan(); break;
      case 'imp-check': {
        const txt = state.shareImport.trim();
        state.shareParsed = null; state.shareErr = '';
        if (!txt) state.shareErr = 'Nalepi plan u polje iznad.';
        else {
          const pr = parseCode(txt);
          if (!pr) state.shareErr = 'Ne mogu da pročitam ovaj plan. Nalepi ceo tekst koji si dobio, zajedno sa kodom na kraju.';
          else if (!DAYS.some(d => pr[d.k].length)) state.shareErr = 'Ovaj plan je prazan.';
          else state.shareParsed = pr;
        }
        renderShare(); break;
      }
      case 'imp-replace': importPlan(false); break;
      case 'imp-merge': importPlan(true); break;
    }
  });

  document.addEventListener('input', ev => {
    const t = ev.target;
    if (t.id === 'set-name') { state.settings.name = t.value.slice(0, 24); save(); }
    else if (t.id === 'imp') {
      state.shareImport = t.value;
      if (state.shareParsed || state.shareErr) {
        const pos = t.selectionStart;
        state.shareParsed = null; state.shareErr = ''; renderShare();
        const n = $('#imp'); n.focus(); n.setSelectionRange(pos, pos);
      }
    }
  });
  document.addEventListener('keydown', ev => {
    if (ev.key === 'Escape') closeOverlay();
    if ((ev.key === 'Enter' || ev.key === ' ') && (ev.target.matches('.card') || ev.target.matches('.zone'))) {
      ev.preventDefault(); ev.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
  });

  /* ---------- start ---------- */
  if (!saved) save();
  refresh();
})();

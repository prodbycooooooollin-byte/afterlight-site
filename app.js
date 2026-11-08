// AFTERLIGHT landing page: a simplified, clickable copy of the app, live patch notes and the download link.
(() => {
  const REPO = 'prodbycooooooollin-byte/afterlight-releases';
  const SETUP = `https://github.com/${REPO}/releases/latest/download/AFTERLIGHT-Setup.exe`;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[<>&"]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

  // ---------- download, nav, reveal, parallax ----------
  // set to false to open the download again
  const DOWNLOAD_PAUSED = false;
  if (DOWNLOAD_PAUSED) {
    $$('[data-download]').forEach(a => { a.removeAttribute('href'); a.classList.add('paused'); a.setAttribute('aria-disabled', 'true'); a.lastChild.textContent = a.classList.contains('small') ? 'Paused' : 'Download paused'; });
    $('.hero-copy .fine, .final .fine').forEach(p => { p.textContent = 'The download is paused for a short update. Check back in a little while.'; p.classList.add('paused-note'); });
  } else $$('[data-download]').forEach(a => { a.href = SETUP; a.setAttribute('download', ''); });
  const nav = $('#nav'); const onScroll = () => nav.classList.toggle('solid', scrollY > 20); onScroll(); addEventListener('scroll', onScroll, { passive: true });
  // Einblenden beim Scrollen: jedes .reveal-Element einmal, wenn es zu sehen ist
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));
  // Aktiver Menüpunkt nach Abschnitt
  const links = $$('.links a'), secs = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(sec => spy.observe(sec));
  // ---------- Hero: die App zerlegt sich beim Scrollen in ihre echten Bauteile, zeigt die Funktionen und man zoomt hinein ----------
  // Alles hängt nur an der Scroll-Position, rückwärts läuft es exakt zurück. Auf Handys und bei reduzierter Bewegung bleibt der Hero still.
  const hero = $('#hero'), stage = $('#stage'), win = $('#xpWin'), calm = matchMedia('(prefers-reduced-motion: reduce)').matches && !/[?&]motion/.test(location.search);
  const wide = matchMedia('(min-width: 1000px) and (min-height: 560px)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), seg = (p, a, b) => clamp((p - a) / (b - a)), lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // Tour durch echte App-Seiten: Seitenleiste im Screenshot und die Knöpfe darunter schalten um
  const demo = $('#xpDemo'), chips = $('.xp-chips');
  const go = name => {
    $$('.xp-demo-img').forEach(i => i.classList.toggle('on', i.dataset.screen === name));
    $$('.xp-hot button, .xp-chips button').forEach(b => { const on = b.dataset.go === name; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
  };
  $$('[data-go]').forEach(b => b.addEventListener('click', () => go(b.dataset.go)));
  go('profile');
  if (hero && win) {
    const sticky = $('.xp-sticky'), copy = $('.hero-copy'), sigil = $('.hero-bg .sigil');
    const rail = document.createElement('div'); rail.className = 'xp-rail'; rail.setAttribute('aria-hidden', 'true'); rail.innerHTML = '<i></i><i></i><i></i><i></i>'; sticky.appendChild(rail);
    const bars = [...rail.children], caps = $$('.xp-captions li'), screens = $$('.xp-screen');
    // Bauteile aus dem Profil-Screenshot ausschneiden (Koordinaten in Pixeln des 1480×920-Bildes)
    const layers = $$('.xp-layer').map(el => {
      const [x, y, w, h] = el.dataset.r.split(',').map(Number), [ox, oy] = (el.dataset.o || '0,0').split(',').map(Number);
      Object.assign(el.style, { left: `${x / 14.8}%`, top: `${y / 9.2}%`, width: `${w / 14.8}%`, height: `${h / 9.2}%`, backgroundSize: `${1480 / w * 100}% ${920 / h * 100}%`, backgroundPosition: `${x / (1480 - w) * 100}% ${y / (920 - h) * 100}%` });
      return { el, z: +el.dataset.z || 0, ox, oy, focus: el.dataset.f === '0' };
    });
    const STEPS = [.24, .36, .48, .60], LEN = .12;
    let W = 1000, vw = 0, vh = 0, on = false, raf = 0, last = -1;
    const mouse = { x: 0, y: 0, gx: 0, gy: 0 };
    const measure = () => { vw = innerWidth; vh = innerHeight; W = Math.round(Math.min(1180, vw * .62, vh * 1.02)); hero.style.setProperty('--W', `${W}px`); last = -1; };
    const set = (el, k, v) => el.style.setProperty(k, v);
    const frame = () => {
      raf = 0;
      mouse.x += (mouse.gx - mouse.x) * .08; mouse.y += (mouse.gy - mouse.y) * .08;
      const moving = Math.abs(mouse.gx - mouse.x) + Math.abs(mouse.gy - mouse.y) > .001;
      const p = clamp((scrollY - hero.offsetTop) / (hero.offsetHeight - vh));
      if (p === last && !moving) return;
      last = p;
      const intro = ease(seg(p, 0, .10)), back = ease(seg(p, .72, .80)), zoom = ease(seg(p, .80, .88)), out = ease(seg(p, .95, 1));
      const e = ease(seg(p, .10, .24)) * (1 - back), H = W * .6216, k = W / 1000;
      // Fensterbahn: schräg rechts im Hero -> Mitte, gekippt -> gerade -> füllt den Bildschirm -> tritt zurück
      const s0 = vw * .6 / W, sFill = Math.min(vw / W, vh / H), s1 = .9;
      let tx = lerp(vw * .26, vw * .16, intro), ty = lerp(vh * .04, 0, intro), s = lerp(s0, s1, intro);
      let rx = lerp(6 - mouse.y * 4, 16, intro), ry = lerp(-14 + mouse.x * 6, -22, intro);
      tx = lerp(tx, 0, back); s = lerp(s, 1, back); rx = lerp(rx, 0, back); ry = lerp(ry, 0, back);
      s = lerp(s, sFill, zoom); s = lerp(s, sFill * .82, out); ty = lerp(ty, -vh * .06, out);
      set(win, '--t', `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`);
      // Schritte: jeweils ein- und ausblenden
      const amt = STEPS.map(a => Math.min(seg(p, a, a + .035), 1 - seg(p, a + LEN - .035, a + LEN)));
      const focusAny = Math.max(...amt) * e;
      layers.forEach(L => {
        const lift = L.focus ? amt[0] * 150 : 0, dim = L.focus ? 1 - .5 * Math.max(amt[1], amt[2], amt[3]) : 1 - .62 * focusAny;
        set(L.el, '--lo', (Math.min(1, e * 8) * dim).toFixed(3));
        set(L.el, '--lx', `${(L.ox * e * k).toFixed(1)}px`); set(L.el, '--ly', `${(L.oy * e * k).toFixed(1)}px`); set(L.el, '--lz', `${((L.z + lift) * e * k).toFixed(1)}px`);
        set(L.el, '--lg', ((L.focus ? .35 + amt[0] * .65 : .3) * e).toFixed(3));
      });
      screens.forEach(sc => { const a = amt[+sc.dataset.f] * e; set(sc, '--so', a.toFixed(3)); set(sc, '--sz', `${(lerp(-420, 230, a) * k).toFixed(1)}px`); sc.style.visibility = a > .002 ? 'visible' : 'hidden'; });
      caps.forEach((c, i) => { set(c, '--a', (amt[i] * e).toFixed(3)); set(c, '--dir', p > STEPS[i] + LEN / 2 ? -1 : 1); });
      bars.forEach((b, i) => set(b, '--f', seg(p, STEPS[i], STEPS[i] + LEN).toFixed(3)));
      set(hero, '--ro', (seg(p, .2, .24) * (1 - seg(p, .72, .76))).toFixed(3));
      set(win, '--bb', (1 - e * .62).toFixed(3)); set(win, '--bs', (1 - e * .4).toFixed(3));
      // Text, Karten und Hinweise
      const c0 = seg(p, 0, .07);
      set(copy, '--co', (1 - c0).toFixed(3)); set(copy, '--cy', `${(-c0 * 70).toFixed(1)}px`); copy.style.visibility = c0 > .999 ? 'hidden' : 'visible';
      set(hero, '--fo', (1 - seg(p, 0, .06)).toFixed(3)); set(hero, '--so0', (1 - seg(p, 0, .03)).toFixed(3));
      set(hero, '--bgo', (1 - .5 * zoom).toFixed(3));
      if (sigil) sigil.style.scale = (1 + p * .35).toFixed(3);
      // in der App: echte Seiten, die Seitenleiste funktioniert
      set(demo, '--do', seg(p, .78, .82).toFixed(3));
      const inside = p > .875 && p < .955, io = seg(p, .86, .89) * (1 - seg(p, .94, .96));
      demo.classList.toggle('live', inside); chips.classList.toggle('live', inside); set(hero, '--io', io.toFixed(3));
      $('#nav').classList.toggle('xp-hide', p > .84 && p < .955);
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(frame); };
    const clear = () => { ['--t', '--bb', '--bs'].forEach(v => win.style.removeProperty(v)); copy.style.removeProperty('--co'); copy.style.removeProperty('--cy'); copy.style.visibility = ''; if (sigil) sigil.style.scale = ''; $('#nav').classList.remove('xp-hide'); demo.classList.remove('live'); chips.classList.remove('live'); };
    const mode = () => {
      on = wide.matches; // bewegt sich nur durch eigenes Scrollen, deshalb auch bei reduzierter Bewegung an
      document.documentElement.classList.toggle('xp-on', on);
      if (on) { measure(); kick(); } else clear();
    };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', () => { if (on) { measure(); kick(); } }, { passive: true });
    wide.addEventListener('change', mode);
    hero.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mouse.gx = (e.clientX / innerWidth - .5) * 2; mouse.gy = (e.clientY / innerHeight - .5) * 2; stage.style.setProperty("--mx", mouse.gx.toFixed(3)); stage.style.setProperty("--my", mouse.gy.toFixed(3)); if (on) kick(); }, { passive: true });
    hero.addEventListener('pointerleave', () => { mouse.gx = mouse.gy = 0; stage.style.setProperty("--mx", 0); stage.style.setProperty("--my", 0); if (on) kick(); });
    mode();
  }

  // ---------- counter finder: live from the Deadlock API (last 30 days, all ranks) ----------
  const grid = $('#cfGrid'), result = $('#cfResult'), search = $('#cfSearch');
  if (grid && result) {
    const pic = id => `assets/h/h${id}.webp`;
    let names = {}, rows = null, enemy = 13;
    const pctTxt = v => `${(v * 100).toFixed(1)} %`;
    const draw = () => {
      if (!rows) return;
      const vs = rows.filter(r => r.enemy_hero_id === enemy && r.hero_id !== enemy && names[r.hero_id] && r.matches_played >= 150)
        .map(r => ({ hero: r.hero_id, win: r.wins / r.matches_played, n: r.matches_played })).sort((a, b) => b.win - a.win);
      if (!vs.length) { result.innerHTML = '<p class="cf-note">Not enough matches for this hero yet.</p>'; return; }
      const best = vs.slice(0, 5), worst = vs.slice(-3).reverse(), total = vs.reduce((a, r) => a + r.n, 0);
      const row = (r, i, good) => `<li style="--i:${i}"><img src="${pic(r.hero)}" alt=""><span><b>${esc(names[r.hero])}</b><small>${r.n.toLocaleString('en-US')} matches</small></span><i class="cf-bar ${good ? 'good' : 'bad'}"><em style="width:${Math.max(6, Math.min(100, Math.abs(r.win - .5) * 600))}%"></em></i><b class="${good ? 'good' : 'bad'}">${pctTxt(r.win)}</b></li>`;
      result.innerHTML = `<div class="cf-enemy"><img src="${pic(enemy)}" alt=""><div><small>You're facing</small><h3>${esc(names[enemy])}</h3><p>${total.toLocaleString('en-US')} matches against ${esc(names[enemy])} in the last 30 days</p></div></div>
        <div class="cf-cols"><section><h4 class="good">Pick these</h4><ol>${best.map((r, i) => row(r, i, true)).join('')}</ol></section>
        <section><h4 class="bad">Avoid</h4><ol>${worst.map((r, i) => row(r, i, false)).join('')}</ol></section></div>
        <p class="cf-foot">Win rate of each hero against ${esc(names[enemy])}. Live data from the community Deadlock API.</p>`;
    };
    const tiles = () => { const q = (search.value || '').trim().toLowerCase(); grid.innerHTML = Object.entries(names).sort((a, b) => a[1].localeCompare(b[1])).filter(([, n]) => n.toLowerCase().includes(q)).map(([id, n]) => `<button role="option" aria-selected="${+id === enemy}" class="${+id === enemy ? 'on' : ''}" data-id="${id}" title="${esc(n)}"><img src="${pic(id)}" alt="" loading="lazy"><span>${esc(n)}</span></button>`).join(''); };
    grid.addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (!b) return; enemy = +b.dataset.id; tiles(); draw(); });
    search.addEventListener('input', tiles);
    fetch('heroes.json').then(r => r.json()).then(n => { names = n; tiles(); }).catch(() => {});
    const since = Math.floor(Date.now() / 1000 / 3600) * 3600 - 30 * 86400;
    fetch(`https://api.deadlock-api.com/v1/analytics/hero-counter-stats?game_mode=normal&min_unix_timestamp=${since}`).then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { rows = Array.isArray(d) ? d : []; draw(); })
      .catch(() => { result.innerHTML = '<p class="cf-note">The Deadlock API can’t be reached right now. The app shows matchups for every hero.</p>'; });
  }

  // ---------- motion ----------
  if (!calm) {
    // Lichtfleck folgt der Maus auf Karten, Screenshots und Vorteilen
    $('.why-item, .cell, .show .win, .cf-box, .note, .faq details').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--x', `${e.clientX - r.left}px`); el.style.setProperty('--y', `${e.clientY - r.top}px`); }, { passive: true }));
    // Bento-Zellen kippen leicht zur Maus
    $('.cell').forEach(el => { el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`; }, { passive: true }); el.addEventListener('pointerleave', () => { el.style.transform = ''; }); });
    // Überschriften: Wörter steigen nacheinander auf, wenn der Abschnitt erscheint
    $('.sec-head h2, .show h3, .final h2').forEach(h => { const dot = h.querySelector('.dot'); const words = [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().split(/\s+/); h.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ') + (dot ? `<span class="w" style="--i:${words.length}"><span class="dot">${dot.textContent}</span></span>` : ''); h.classList.add('split'); const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { h.classList.add('in'); o.disconnect(); } }), { threshold: .4 }); o.observe(h); });
    // Scroll-Parallaxe: Screenshots wandern beim Scrollen gegen den Text, das Licht der Abschnitte zieht mit
    const wins = $$('.show .win');
    // Jeder Abschnitt bekommt ein eigenes Licht, das aufgeht, solange man darin ist
    const lit = ['#features', '#heroes', '#discord', '#counters', '#updates', '#faq', '.final'].map(s => $(s)).filter(Boolean);
    lit.forEach(sec => { sec.classList.add('lightable'); const g = document.createElement('i'); g.className = 'sec-glow'; g.setAttribute('aria-hidden', 'true'); sec.prepend(g); });
    const lio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('lit', e.isIntersecting)), { rootMargin: '-20% 0px -30% 0px' });
    lit.forEach(s => lio.observe(s));
    let ticking = false;
    const onScrollFx = () => { ticking = false; const vh = innerHeight;
      for (const w of wins) { const r = w.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) continue; const c = (r.top + r.height / 2 - vh / 2) / vh; w.style.translate = `0 ${(c * -40).toFixed(1)}px`; }
      for (const s of lit) { if (!s.classList.contains('lit')) continue; const r = s.getBoundingClientRect(); s.style.setProperty('--gy', `${(-r.top * .18).toFixed(1)}px`); } };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true }); onScrollFx();
    // Magnet-Knöpfe: ziehen sich ein paar Pixel zur Maus
    if (matchMedia('(pointer: fine)').matches) {
      $$('.btn').forEach(btn => {
        btn.addEventListener('pointermove', e => { const r = btn.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; btn.classList.add('pulling'); btn.style.setProperty('--bx', `${clamp(dx * .22, -9, 9).toFixed(1)}px`); btn.style.setProperty('--by', `${clamp(dy * .3, -6, 6).toFixed(1)}px`); }, { passive: true });
        btn.addEventListener('pointerleave', () => { btn.classList.remove('pulling'); btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
      });
      // Ein sanftes Licht folgt dem Mauszeiger über die ganze Seite
      const glow = document.createElement('div'); glow.className = 'cursor-light'; glow.setAttribute('aria-hidden', 'true'); document.body.appendChild(glow);
      let gx = 0, gy = 0, gr = 0;
      addEventListener('pointermove', e => { gx = e.clientX; gy = e.clientY; glow.classList.add('on'); if (!gr) gr = requestAnimationFrame(() => { gr = 0; glow.style.setProperty('--cx', `${gx}px`); glow.style.setProperty('--cy2', `${gy}px`); }); }, { passive: true });
      document.addEventListener('pointerleave', () => glow.classList.remove('on'));
    }
  }

  // ---------- patch notes live from GitHub ----------
  fetch(`https://api.github.com/repos/${REPO}/releases?per_page=6`, { headers: { Accept: 'application/vnd.github+json' } })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(list => {
      const rel = list.filter(r => !r.draft && /^v\d/.test(r.tag_name)).slice(0, 6);
      if (!rel.length) throw 0;
      const latest = rel[0].tag_name.replace(/^v/, '');
      const hv = $("#heroVersion"); if (hv) hv.textContent = `Version ${latest}`; const hb = $("#heroBadge"); if (hb) hb.textContent = `Version ${latest} is out`;
      const plain = s => esc(String(s || '').replace(/\*\*/g, '').replace(/`/g, '').replace(/^[-*]\s+/gm, '').replace(/\r?\n+/g, ' ').trim());
      $('#notes').innerHTML = rel.map((r, i) => `<article class="note">${i === 0 ? '<span class="tag">LATEST</span>' : ''}<header><b>${esc(r.tag_name)}</b><time datetime="${r.published_at}">${new Date(r.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time></header><p>${plain(r.body)}</p></article>`).join('');
      $$('.note').forEach(el => { el.classList.add('reveal'); io.observe(el); });
    })
    .catch(() => { $('#notes').innerHTML = `<p class="loading">See all changes on <a href="https://github.com/${REPO}/releases" style="color:var(--gold)">GitHub</a>.</p>`; });
})();

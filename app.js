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
    $$('.hero-copy .fine, .final .fine').forEach(p => { p.textContent = 'The download is paused for a short update. Check back in a little while.'; p.classList.add('paused-note'); });
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
  // Alles hängt nur an der Scroll-Position und läuft rückwärts exakt zurück. Pro Bild werden nur transform und opacity geschrieben
  // (keine CSS-Variablen, keine Filter, keine Schatten-Animation), damit der Browser alles auf der Grafikkarte erledigt.
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
    const sticky = $('.xp-sticky'), copy = $('.hero-copy'), sigil = $('.hero-bg .sigil'), nav = $('#nav');
    const rail = document.createElement('div'); rail.className = 'xp-rail'; rail.setAttribute('aria-hidden', 'true'); rail.innerHTML = '<i><b></b></i><i><b></b></i><i><b></b></i><i><b></b></i>'; sticky.appendChild(rail);
    const bars = [...rail.querySelectorAll('b')], caps = $$('.xp-captions li'), screens = $$('.xp-screen');
    const dim = $('.xp-dim'), floats = $$('.xp-stage .float'), cue = $('.xp-scroll'), inside = $('.xp-inside'), bg = $('.hero-bg');
    // Bauteile aus dem Profil-Screenshot ausschneiden (Koordinaten in Pixeln des 1480×920-Bildes)
    const layers = $$('.xp-layer').map(el => {
      const [x, y, w, h] = el.dataset.r.split(',').map(Number), [ox, oy] = (el.dataset.o || '0,0').split(',').map(Number);
      Object.assign(el.style, { left: `${x / 14.8}%`, top: `${y / 9.2}%`, width: `${w / 14.8}%`, height: `${h / 9.2}%`, backgroundSize: `${1480 / w * 100}% ${920 / h * 100}%`, backgroundPosition: `${x / (1480 - w) * 100}% ${y / (920 - h) * 100}%` });
      return { el, z: +el.dataset.z || 0, ox, oy, focus: el.dataset.f === '0' };
    });
    // nur schreiben, wenn sich der Wert wirklich ändert
    const memo = new WeakMap();
    const put = (el, t, o) => { const m = memo.get(el) || {}; if (t !== undefined && m.t !== t) { el.style.transform = t; m.t = t; } if (o !== undefined) { const os = o.toFixed(3); if (m.o !== os) { el.style.opacity = os; el.style.visibility = o < .002 ? 'hidden' : 'visible'; m.o = os; } } memo.set(el, m); };
    // Zeitplan (Anteil der Hero-Strecke)
    const T = { intro: [0, .12], apart: [.12, .26], steps: [.22, .37, .50, .63], len: .125, back: [.78, .84], zoom: [.84, .9], live: [.9, .96], out: [.96, 1] };
    let W = 1000, vw = 0, vh = 0, top0 = 0, span = 1, on = false, raf = 0, last = -1, navHidden = false, isLive = false;
    const mouse = { x: 0, y: 0, gx: 0, gy: 0 };
    const measure = () => { vw = innerWidth; vh = innerHeight; W = Math.round(Math.min(1180, vw * .62, vh * 1.02)); hero.style.setProperty('--W', `${W}px`); top0 = hero.offsetTop; span = Math.max(1, hero.offsetHeight - vh); last = -1; };
    const frame = () => {
      raf = 0;
      mouse.x += (mouse.gx - mouse.x) * .1; mouse.y += (mouse.gy - mouse.y) * .1;
      const moving = Math.abs(mouse.gx - mouse.x) + Math.abs(mouse.gy - mouse.y) > .002;
      const p = clamp((scrollY - top0) / span);
      if (p === last && !moving) return;
      last = p;
      if (p >= 1 && !moving) { if (navHidden) { nav.classList.remove('xp-hide'); navHidden = false; } return; } // Hero ist durch, nichts mehr zu tun
      const intro = ease(seg(p, ...T.intro)), back = ease(seg(p, ...T.back)), zoom = ease(seg(p, ...T.zoom)), out = ease(seg(p, ...T.out));
      const apart = ease(seg(p, ...T.apart)) * (1 - back), k = W / 1000, H = W * .6216;
      // Schritte 1-4 jeweils mit weichem Ein- und Ausblenden
      const amt = T.steps.map((a, i) => { const fin = i === 0 ? seg(p, a, a + .04) : seg(p, a, a + .05), fout = 1 - seg(p, a + T.len - .04, a + T.len); return Math.min(fin, fout); });
      // Bauteile sind nur beim Profil-Schritt zu sehen; bei Clips, Analyse und Helden steht die jeweilige Seite allein im Fenster
      const pagesOn = clamp(Math.max(amt[1], amt[2], amt[3]) * 1.6);
      const reform = seg(p, T.back[0] - .02, T.back[0] + .015); // Bauteile kommen zurück und setzen sich zusammen
      const layerVis = Math.min(1, apart * 6) * (p < T.back[0] - .02 ? 1 - seg(p, T.steps[1] - .045, T.steps[1]) : reform);
      // Fensterbahn: schräg rechts -> Mitte gekippt -> gerade -> füllt den Bildschirm -> tritt zurück
      const s0 = vw * .6 / W, sFill = Math.min(vw / W, vh / H);
      let tx = lerp(vw * .26, vw * .16, intro), ty = lerp(vh * .04, 0, intro), s = lerp(s0, .9, intro);
      let rx = lerp(6 - mouse.y * 4, 16, intro) * (1 - pagesOn * .6), ry = lerp(-14 + mouse.x * 6, -22, intro) * (1 - pagesOn * .55);
      tx = lerp(tx, 0, back); s = lerp(s, 1, back); rx = lerp(rx, 0, back); ry = lerp(ry, 0, back);
      s = lerp(s, sFill, zoom); s = lerp(s, sFill * .84, out); ty = lerp(ty, -vh * .05, out);
      put(win, `translate3d(${tx.toFixed(1)}px,${ty.toFixed(1)}px,0) scale(${s.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`);
      put(dim, undefined, apart * .7);
      layers.forEach(L => {
        const lift = L.focus ? amt[0] * 140 : 0, o = layerVis * (L.focus ? 1 : 1 - .6 * amt[0]);
        put(L.el, `translate3d(${(L.ox * apart * k).toFixed(1)}px,${(L.oy * apart * k).toFixed(1)}px,${((L.z + lift) * apart * k).toFixed(1)}px)`, o);
      });
      screens.forEach(sc => { const a = amt[+sc.dataset.f]; put(sc, `translate3d(0,${((1 - a) * 30 * k).toFixed(1)}px,${(lerp(-160, 40, a) * k).toFixed(1)}px)`, a); });
      caps.forEach((c, i) => { const a = amt[i], dir = p > T.steps[i] + T.len / 2 ? -1 : 1; put(c, `translate3d(0,calc(-50% + ${((1 - a) * dir * 26).toFixed(1)}px),0)`, a); });
      bars.forEach((b, i) => put(b, `scaleY(${seg(p, T.steps[i], T.steps[i] + T.len).toFixed(3)})`));
      put(rail, undefined, seg(p, .18, .22) * (1 - seg(p, T.back[0] - .02, T.back[0] + .02)));
      // Text, Karten, Hinweise
      const c0 = seg(p, 0, .08);
      put(copy, `translate3d(0,calc(-50% - ${(c0 * 70).toFixed(1)}px),0)`, 1 - c0);
      const fo = 1 - seg(p, 0, .06); floats.forEach(f => put(f, undefined, fo));
      put(cue, undefined, 1 - seg(p, 0, .04));
      put(bg, undefined, 1 - .6 * zoom);
      // in der App: echte Seiten, die Seitenleiste funktioniert
      put(demo, undefined, seg(p, T.back[1] - .005, T.back[1] + .015));
      const io = seg(p, T.zoom[1] - .03, T.zoom[1]) * (1 - seg(p, T.live[1] - .01, T.live[1] + .01));
      put(inside, `translate3d(-50%,${((1 - io) * -14).toFixed(1)}px,0)`, io); put(chips, `translate3d(-50%,${((1 - io) * 18).toFixed(1)}px,0)`, io);
      const live = p > T.zoom[1] - .01 && p < T.live[1] + .005;
      if (live !== isLive) { isLive = live; demo.classList.toggle('live', live); chips.classList.toggle('live', live); }
      const hide = p > T.zoom[0] + .02 && p < T.live[1] + .005;
      if (hide !== navHidden) { navHidden = hide; nav.classList.toggle('xp-hide', hide); }
      if (moving) raf = requestAnimationFrame(frame);
    };
    const kick = () => { if (on && !raf) raf = requestAnimationFrame(frame); };
    const clear = () => { [win, dim, copy, cue, bg, demo, inside, chips, rail, ...floats, ...layers.map(l => l.el), ...screens, ...caps, ...bars].forEach(el => { if (el) { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; memo.delete(el); } }); nav.classList.remove('xp-hide'); demo.classList.remove('live'); chips.classList.remove('live'); navHidden = isLive = false; };
    const mode = () => { on = wide.matches; document.documentElement.classList.toggle('xp-on', on); if (on) { measure(); kick(); } else clear(); };
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', () => { if (on) { measure(); kick(); } }, { passive: true });
    addEventListener('load', () => { if (on) { measure(); kick(); } });
    wide.addEventListener('change', mode);
    if (!calm) {
      hero.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; mouse.gx = (e.clientX / innerWidth - .5) * 2; mouse.gy = (e.clientY / innerHeight - .5) * 2; if (on) kick(); else { stage.style.setProperty('--mx', mouse.gx.toFixed(3)); stage.style.setProperty('--my', mouse.gy.toFixed(3)); } }, { passive: true });
      hero.addEventListener('pointerleave', () => { mouse.gx = mouse.gy = 0; if (on) kick(); else { stage.style.setProperty('--mx', 0); stage.style.setProperty('--my', 0); } });
    }
    if (/[?&]motion/.test(location.search)) { window.__xpFrame = frame; const q = /[?&]xp=([\d.]+)/.exec(location.search); if (q) addEventListener("load", () => { measure(); scrollTo(0, top0 + +q[1] * span); last = -1; frame(); }); } // nur zum Testen
    mode();
  }

  // ---------- motion ----------
  if (!calm) {
    // Lichtfleck folgt der Maus auf Karten, Screenshots und Vorteilen
    $$('.why-item, .cell, .show .win, .note, .faq details').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--x', `${e.clientX - r.left}px`); el.style.setProperty('--y', `${e.clientY - r.top}px`); }, { passive: true }));
    // Bento-Zellen kippen leicht zur Maus
    $$('.cell').forEach(el => { el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`; }, { passive: true }); el.addEventListener('pointerleave', () => { el.style.transform = ''; }); });
    // Überschriften: Wörter steigen nacheinander auf, wenn der Abschnitt erscheint
    $$('.sec-head h2, .show h3, .final h2').forEach(h => { const dot = h.querySelector('.dot'); const words = [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().split(/\s+/); h.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ') + (dot ? `<span class="w" style="--i:${words.length}"><span class="dot">${dot.textContent}</span></span>` : ''); h.classList.add('split'); const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { h.classList.add('in'); o.disconnect(); } }), { threshold: .4 }); o.observe(h); });
    // Scroll-Parallaxe: Screenshots wandern beim Scrollen gegen den Text, das Licht der Abschnitte zieht mit
    const wins = $$('.show .win');
    // Jeder Abschnitt bekommt ein eigenes Licht, das aufgeht, solange man darin ist
    const lit = ['#features', '#heroes', '#discord', '#updates', '#faq', '.final'].map(s => $(s)).filter(Boolean);
    lit.forEach(sec => { sec.classList.add('lightable'); const g = document.createElement('i'); g.className = 'sec-glow'; g.setAttribute('aria-hidden', 'true'); sec.prepend(g); });
    const lio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('lit', e.isIntersecting)), { rootMargin: '-20% 0px -30% 0px' });
    lit.forEach(s => lio.observe(s));
    let ticking = false;
    const onScrollFx = () => { ticking = false; const vh = innerHeight;
      for (const w of wins) { const r = w.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) continue; const c = (r.top + r.height / 2 - vh / 2) / vh; w.style.translate = `0 ${(c * -40).toFixed(1)}px`; }
      for (const s of lit) { if (!s.classList.contains('lit')) continue; const r = s.getBoundingClientRect(); s.firstElementChild.style.transform = `translate3d(0,${(-r.top * .18).toFixed(1)}px,0)`; } };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true }); onScrollFx();
    // Magnet-Knöpfe: ziehen sich ein paar Pixel zur Maus
    if (matchMedia('(pointer: fine)').matches) {
      $$('.btn').forEach(btn => {
        btn.addEventListener('pointermove', e => { const r = btn.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2; btn.classList.add('pulling'); btn.style.setProperty('--bx', `${clamp(dx * .22, -9, 9).toFixed(1)}px`); btn.style.setProperty('--by', `${clamp(dy * .3, -6, 6).toFixed(1)}px`); }, { passive: true });
        btn.addEventListener('pointerleave', () => { btn.classList.remove('pulling'); btn.style.setProperty('--bx', '0px'); btn.style.setProperty('--by', '0px'); });
      });
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

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
  // Hero-Bühne: Maus kippt das App-Fenster und verschiebt die schwebenden Karten; beim Scrollen richtet es sich auf
  const stage = $('#stage'), calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (stage && !calm) {
    const cur = { x: 0, y: 0 }, goal = { x: 0, y: 0 }; let raf = 0;
    const tick = () => { cur.x += (goal.x - cur.x) * .08; cur.y += (goal.y - cur.y) * .08; stage.style.setProperty('--mx', cur.x.toFixed(4)); stage.style.setProperty('--my', cur.y.toFixed(4)); raf = Math.abs(goal.x - cur.x) + Math.abs(goal.y - cur.y) > .0005 ? requestAnimationFrame(tick) : 0; };
    const hero = $('#hero');
    hero.addEventListener('pointermove', e => { if (e.pointerType === 'touch') return; const r = hero.getBoundingClientRect(); goal.x = ((e.clientX - r.left) / r.width - .5) * 2; goal.y = ((e.clientY - r.top) / r.height - .5) * 2; if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
    hero.addEventListener('pointerleave', () => { goal.x = goal.y = 0; if (!raf) raf = requestAnimationFrame(tick); });
    const main = stage.querySelector('.win.main');
    addEventListener('scroll', () => { const p = Math.min(1, scrollY / (innerHeight * .8)); main.style.setProperty('--sp', p.toFixed(3)); main.style.translate = `0 ${(-p * 60).toFixed(1)}px`; main.style.scale = String(1 + p * .04); }, { passive: true });
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
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Lichtfleck folgt der Maus auf Karten, Screenshots und Vorteilen
    $('.why-item, .cell, .show .win, .cf-box, .note, .faq details').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--x', `${e.clientX - r.left}px`); el.style.setProperty('--y', `${e.clientY - r.top}px`); }, { passive: true }));
    // Bento-Zellen kippen leicht zur Maus
    $('.cell').forEach(el => { el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateZ(0)`; }, { passive: true }); el.addEventListener('pointerleave', () => { el.style.transform = ''; }); });
    // Überschriften: Wörter steigen nacheinander auf, wenn der Abschnitt erscheint
    $('.sec-head h2, .show h3, .final h2').forEach(h => { const dot = h.querySelector('.dot'); const words = [...h.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim().split(/\s+/); h.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}"><span>${esc(w)}</span></span>`).join(' ') + (dot ? `<span class="w" style="--i:${words.length}"><span class="dot">${dot.textContent}</span></span>` : ''); h.classList.add('split'); const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { h.classList.add('in'); o.disconnect(); } }), { threshold: .4 }); o.observe(h); });
    // Scroll-Parallaxe: Screenshots wandern beim Scrollen gegen den Text, der Hero tritt zurück
    const wins = $('.show .win'), heroCopy = $('.hero-copy'), sigil = $('.hero-bg .sigil');
    let ticking = false;
    const onScrollFx = () => { ticking = false; const vh = innerHeight;
      for (const w of wins) { const r = w.getBoundingClientRect(), c = (r.top + r.height / 2 - vh / 2) / vh; w.style.translate = `0 ${(c * -40).toFixed(1)}px`; }
      const p = Math.min(1, scrollY / vh); if (heroCopy) { heroCopy.style.opacity = String(1 - p * .9); heroCopy.style.translate = `0 ${(p * 80).toFixed(1)}px`; }
      if (sigil) sigil.style.scale = String(1 + p * .25); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true }); onScrollFx();
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

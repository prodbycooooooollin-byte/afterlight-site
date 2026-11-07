// AFTERLIGHT landing page: a simplified, clickable copy of the app, live patch notes and the download link.
(() => {
  const REPO = 'prodbycooooooollin-byte/afterlight-releases';
  const SETUP = `https://github.com/${REPO}/releases/latest/download/AFTERLIGHT-Setup.exe`;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const H = { 1: 'Infernus', 2: 'Seven', 4: 'Lady Geist', 6: 'Abrams', 7: 'Wraith', 13: 'Haze', 14: 'Holliday', 15: 'Bebop', 16: 'Calico', 17: 'Grey Talon', 52: 'Mirage', 63: 'Mina' };
  const img = id => `assets/heroes/${id}.png`;
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
  const app = $('#app');
  new IntersectionObserver(es => es.forEach(e => app.classList.toggle('flat', e.intersectionRatio > .35)), { threshold: [0, .35, .7] }).observe(app);
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

  // ---------- demo data (sample match, like the app's own preview data) ----------
  const matches = [
    { hero: 13, res: 'w', mode: 'Ranked', kda: '12/4/9', souls: '24.8k', rating: 9.1, time: '24:52', ago: 'Today' },
    { hero: 7, res: 'w', mode: 'Standard', kda: '9/3/14', souls: '22.1k', rating: 8.4, time: '31:30', ago: 'Today' },
    { hero: 4, res: 'l', mode: 'Ranked', kda: '5/7/11', souls: '18.9k', rating: 6.2, time: '29:04', ago: 'Yesterday' },
    { hero: 1, res: 'w', mode: 'Street Brawl', kda: '14/5/6', souls: '19.4k', rating: 8.8, time: '18:40', ago: 'Yesterday' },
  ];
  const team = (ids, me) => ids.map((id, i) => ({ id, name: i === me ? 'You' : ['orbit', 'lowkey', 'moss', 'vanta', 'echo', 'reverb', 'ghost', 'nightshift', 'silhouette', 'bluehour', 'void'][(id + i) % 11], k: [12, 8, 6, 4, 9, 5][i], d: [4, 3, 6, 5, 7, 8][i], a: [9, 9, 11, 18, 5, 13][i], s: [24.8, 21.3, 19.9, 17.2, 22.5, 18.1][i] }));
  const clips = [
    { hero: 4, type: 'Double kill', time: '14:12', tint: '#3a2a3d', score: { total: 350, tier: 'legendary', label: 'Legendary', lines: [['Kills', '2 ×', 200], ['Double kill', '', 60], ['Objective', 'walker', 90]] } },
    { hero: 13, type: 'Elimination', time: '21:40', tint: '#3b2c18', score: { total: 236, tier: 'insane', label: 'Insane', lines: [['Kills', '1 ×', 100], ['Hero damage', '1,840 dmg', 46], ['Tight combo', '', 40]], mult: ['Low-HP clutch', '9% HP', 1.28] } },
    { hero: 1, type: 'Elimination', time: '08:03', tint: '#3d2114', score: { total: 175, tier: 'impressive', label: 'Impressive', lines: [['Kills', '1 ×', 100], ['Assists', '1 ×', 35], ['Tight combo', '', 40]] } },
    { hero: 7, type: 'Assist', time: '11:27', tint: '#2a2238', score: { total: 135, tier: 'impressive', label: 'Impressive', lines: [['Assists', '2 ×', 70], ['Objective', '', 60]], mult: ['Traded', '', .75] } },
    { hero: 14, type: 'Elimination', time: '17:55', tint: '#33261b', score: { total: 100, tier: 'good', label: 'Good', lines: [['Kills', '1 ×', 100]] } },
    { hero: 15, type: 'Assist', time: '03:12', tint: '#22301c', score: { total: 35, tier: 'okay', label: 'Okay', lines: [['Assists', '1 ×', 35]] } },
  ];
  const events = [[150, 'kill', 'You eliminated vanta'], [212, 'death', 'You died'], [300, 'obj', 'Guardian destroyed'], [430, 'kill', 'You eliminated echo'], [515, 'kill', 'Double kill'], [640, 'obj', 'Walker destroyed'], [820, 'death', 'You died'], [960, 'kill', 'You eliminated reverb'], [1180, 'obj', 'Base guardian destroyed'], [1360, 'kill', 'You eliminated void'], [1492, 'obj', 'Patron destroyed']];
  const END = 1492, fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const leadAt = s => Math.round((Math.sin(s / 170) * 2.4 + s / END * 11 - (s > 200 && s < 320 ? 3 : 0)) * 10) / 10;

  // ---------- pages ----------
  const discord = { hero: 13, state: 'match', match: 'Do not disturb.', win: 'Easy.', loss: 'We don’t talk about it.', hide: '' };
  const pages = {
    profile: () => `<div class="page">
      <div class="scr-title"><h3>Your profile</h3><small>39 matches · 22 h played · main: Haze</small></div>
      <div class="tiles"><div class="tile"><small>Win rate</small><b>62 %</b><span>24 W · 15 L</span></div><div class="tile"><small>KDA</small><b>5.25</b><span>avg 12.0 / 4.0 / 9.0</span></div><div class="tile"><small>Souls / min</small><b>701</b><span>avg 24.8k souls</span></div><div class="tile"><small>Avg rating</small><b>8.9</b><span>39 matches rated</span></div></div>
      <div class="form" aria-label="Form">${'wwlwwlwwlw'.split('').map(r => `<i class="${r}">${r === 'w' ? 'W' : 'L'}</i>`).join('')}</div>
      <div class="matches">${matches.map((m, i) => `<button class="match" data-open="${i}"><img src="${img(m.hero)}" alt=""><span><span class="res ${m.res}">${m.res === 'w' ? 'WIN' : 'LOSS'} · ${m.mode.toUpperCase()}</span><b>${H[m.hero]}</b><small>${m.ago} · ${m.time} min</small></span><span class="kda">${m.kda}</span><span class="rt">${m.rating}</span><span class="go">›</span></button>`).join('')}</div></div>`,
    live: () => { const amber = team([13, 2, 4, 15, 16, 14], 0), sap = team([7, 1, 6, 17, 52, 63], -1);
      const rows = (list) => list.map(p => `<div class="prow ${p.name === 'You' ? 'you' : ''}"><img src="${img(p.id)}" alt=""><span><b>${p.name}</b> · ${H[p.id]}</span><span class="num">${p.k}/${p.d}/${p.a}</span><span class="num">${p.s}k</span></div>`).join('');
      return `<div class="page"><div class="scr-title"><h3>Live board</h3><small>18:12 · Ranked</small></div>
      <div class="lb"><div class="teams"><div class="team amber"><header><span>Hidden King · your team</span><span>42 kills</span></header>${rows(amber)}</div><div class="team sapphire"><header><span>Archmother</span><span>28 kills</span></header>${rows(sap)}</div></div>
      <div class="side"><div class="mod"><small>Soul lead</small><b class="big" id="leadNum">+4.2k</b><svg viewBox="0 0 300 70" preserveAspectRatio="none"><path class="area" id="leadArea"/><path class="line" id="leadLine"/></svg></div>
      <div class="mod"><small>Counter items</small><div class="counter"><img src="${img(7)}" alt=""><span><b>Spirit Armor</b><small>less spirit damage</small></span></div><div class="counter"><img src="${img(1)}" alt=""><span><b>Healbane</b><small>sharply cuts their healing</small></span></div></div>
      <div class="mod fair"><i></i>Fair play: hidden stats of others only after the match.</div></div></div></div>`; },
    review: () => `<div class="page"><div class="rv-head"><span class="res">Win</span><span class="score"><span class="a">42</span> : <span class="s">28</span></span><small style="color:var(--muted)">Haze · 24:52 · drag across the timeline</small></div>
      <div class="track" id="track"><svg viewBox="0 0 1000 150" preserveAspectRatio="none"><line x1="0" x2="1000" y1="75" y2="75" stroke="rgba(243,239,230,.1)"/><path class="area" id="trArea"/><path class="line" id="trLine"/></svg>${events.map(([t, k]) => `<i class="ev ${k}" style="left:${t / END * 100}%;top:${k === 'death' ? 82 : k === 'obj' ? 50 : 18}%"></i>`).join('')}<div class="head" id="head"><b id="headT">00:00</b></div></div>
      <div class="rv-foot"><div class="events" id="evlist">${events.map(([t, k, l]) => `<div class="event" data-t="${t}"><time>${fmt(t)}</time><i style="background:var(--${k === 'kill' ? 'good' : k === 'death' ? 'bad' : 'gold'})"></i>${l}</div>`).join('')}</div>
      <div class="ranks"><div class="rank"><b>1<small>/12</small></b><span>Souls / min</span><i style="--w:96%"></i></div><div class="rank"><b>1<small>/12</small></b><span>Damage / min</span><i style="--w:92%"></i></div><div class="rank"><b>3<small>/12</small></b><span>KDA</span><i style="--w:78%"></i></div><div class="rank"><b>9<small>/12</small></b><span>Healing</span><i style="--w:28%"></i></div></div></div></div>`,
    clips: () => `<div class="page"><div class="scr-title"><h3>Clips</h3><small>hover a clip to see its score</small><div class="sortrow"><button class="chip on" data-sort="score">Highest score</button><button class="chip" data-sort="new">Newest</button></div></div>
      <div class="clipgrid" id="clipgrid">${clipCards('score')}</div></div>`,
    discord: () => `<div class="page"><div class="scr-title"><h3>Discord status</h3><small>type and watch your status change</small></div>
      <div class="dsc"><div class="dsc-form">
        <label>Hero<select id="dHero">${Object.entries(H).map(([id, n]) => `<option value="${id}" ${+id === discord.hero ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <div class="toggles">${[['match', 'In a match'], ['win', 'After a win'], ['loss', 'After a loss'], ['hide', 'Hideout']].map(([k, l]) => `<button class="chip ${discord.state === k ? 'on' : ''}" data-state="${k}">${l}</button>`).join('')}</div>
        <label id="dLineLabel">Your own words<input id="dLine" maxlength="60" value="${esc(discord[discord.state])}" placeholder="Write something …"></label>
      </div><div class="dc-cards" id="dcCard">${dcCard()}</div></div></div>`,
  };
  function clipCards(sort) {
    const list = [...clips].sort((a, b) => sort === 'score' ? b.score.total - a.score.total : b.time.localeCompare(a.time));
    return list.map(c => `<button class="clip"><div class="th" style="--tint:${c.tint}"><img src="${img(c.hero)}" alt=""><span class="ty">${c.type}</span><span class="du">00:25</span><span class="tier t-${c.score.tier}"><b>${c.score.label}</b><i>${c.score.total}</i></span></div><div class="meta"><b>${H[c.hero]} · ${c.time}</b><small>Ranked · today</small></div>
      <div class="pop t-${c.score.tier}" style="--c:var(--c)"><header><b>${c.score.label}</b><span>${c.score.total} <small style="font-size:10px;color:var(--muted)">PTS</small></span></header><ul>${c.score.lines.map(([l, d, p]) => `<li><i></i>${l} <small>${d}</small><em>+${p}</em></li>`).join('')}</ul>${c.score.mult ? `<footer><span>${c.score.mult[0]} ${c.score.mult[1]}</span><em style="color:${c.score.mult[2] < 1 ? 'var(--bad)' : 'var(--good)'}">×${c.score.mult[2].toFixed(2)}</em></footer>` : ''}</div></button>`).join('');
  }
  function dcCard() {
    const n = H[discord.hero], own = esc(discord[discord.state] || ''), mark = '<svg viewBox="0 0 100 100"><path fill-rule="evenodd" d="M60.6 2C65.3 41.8 69 44.5 95.2 40.9C70.8 50.2 69.9 53.6 78.4 65.8C64.7 57.9 57.6 61.6 4.8 98C50.2 53.9 53.8 48.4 36.7 35C56.5 43.5 59.4 41.7 60.6 2Z"/></svg>';
    const lines = { match: [`${n} · 12/4/9 · 24.8k souls`, own || 'Ranked', '18:12 elapsed'], win: [`Won as ${n} · 14/4/9`, own, ''], loss: [`Lost as ${n} · 3/9/4`, own, ''], hide: [own || hideLine(discord.hero), `Hanging out as ${n}`, '0:58 elapsed'] }[discord.state];
    return `<div class="dc"><small>Playing</small><div class="dc-row"><span class="dc-art"><img src="${img(discord.hero)}" alt=""><i>${mark}</i></span><span class="dc-text"><b>AFTERLIGHT</b>${lines[0] ? `<span>${lines[0]}</span>` : ''}${lines[1] ? `<span>${lines[1]}</span>` : ''}${lines[2] ? `<span class="dc-time">${lines[2]}</span>` : ''}</span></div></div>`;
  }
  const hideLine = id => ({ 1: 'Mixing Drinks In The Hideout', 14: 'Solving Mysteries In The Hideout', 13: 'Sleep Walking In The Hideout', 15: 'Ignoring Lash In The Hideout', 4: 'Being Fabulous In The Hideout', 7: 'Gambling In The Hideout' })[id] || 'Relaxing In The Hideout';

  // ---------- behaviour per page ----------
  const screen = $('#screen'), title = $('#appTitle'), hint = $('#hint');
  const NAMES = { profile: 'Profile', live: 'Live board', review: 'Match review', clips: 'Clips', discord: 'Discord status' };
  let liveTimer = null;
  function show(page) {
    clearInterval(liveTimer);
    $$('.rail button').forEach(b => b.setAttribute('aria-selected', b.dataset.page === page));
    title.textContent = NAMES[page]; screen.innerHTML = pages[page]();
    if (page === 'profile') $$('[data-open]').forEach(b => b.addEventListener('click', () => { hint.classList.add('gone'); show('review'); }));
    if (page === 'live') { let t = 700; const draw = () => { t += 6; const pts = []; for (let i = 0; i <= 60; i++) { const s = t * i / 60; pts.push(`${i * 5},${35 - leadAt(s) * 2.2}`); } $('#leadLine').setAttribute('d', 'M' + pts.join(' L')); $('#leadArea').setAttribute('d', 'M' + pts.join(' L') + ' L300,70 L0,70z'); const v = leadAt(t); $('#leadNum').textContent = `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}k`; }; draw(); liveTimer = setInterval(draw, 120); }
    if (page === 'review') initTrack();
    if (page === 'clips') $$('[data-sort]').forEach(b => b.addEventListener('click', () => { $$('[data-sort]').forEach(x => x.classList.toggle('on', x === b)); $('#clipgrid').innerHTML = clipCards(b.dataset.sort); }));
    if (page === 'discord') {
      const card = () => { $('#dcCard').innerHTML = dcCard(); };
      $('#dHero').addEventListener('change', e => { discord.hero = +e.target.value; card(); });
      $('#dLine').addEventListener('input', e => { discord[discord.state] = e.target.value; card(); });
      $$('[data-state]').forEach(b => b.addEventListener('click', () => { discord.state = b.dataset.state; $$('[data-state]').forEach(x => x.classList.toggle('on', x === b)); $('#dLine').value = discord[discord.state]; $('#dLine').placeholder = discord.state === 'hide' ? hideLine(discord.hero) : 'Write something …'; card(); }));
    }
  }
  function initTrack() {
    const track = $('#track'), pts = [];
    for (let i = 0; i <= 100; i++) { const s = END * i / 100; pts.push(`${i * 10},${75 - leadAt(s) * 5}`); }
    $('#trLine').setAttribute('d', 'M' + pts.join(' L')); $('#trArea').setAttribute('d', 'M' + pts.join(' L') + ' L1000,75 L0,75z');
    const set = x => { const r = track.getBoundingClientRect(), f = Math.max(0, Math.min(1, (x - r.left) / r.width)), s = f * END; $('#head').style.left = `${f * 100}%`; $('#headT').textContent = fmt(s);
      let now = null; $$('.event').forEach(ev => { const t = +ev.dataset.t; ev.classList.toggle('past', t <= s); if (t <= s) now = ev; ev.classList.remove('now'); }); if (now) { now.classList.add('now'); const list = $('#evlist'); list.scrollTop = Math.max(0, now.offsetTop - list.offsetTop - 60); } };
    let drag = false; const r0 = track.getBoundingClientRect(); set(r0.left + r0.width * .42);
    track.addEventListener('pointerdown', e => { drag = true; track.setPointerCapture(e.pointerId); set(e.clientX); hint.classList.add('gone'); });
    track.addEventListener('pointermove', e => { if (drag) set(e.clientX); });
    track.addEventListener('pointerup', () => { drag = false; });
  }
  $$('.rail button').forEach(b => b.addEventListener('click', () => { hint.classList.add('gone'); show(b.dataset.page); }));
  $$('[data-go]').forEach(a => a.addEventListener('click', () => setTimeout(() => show(a.dataset.go), 350)));
  show('profile');

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

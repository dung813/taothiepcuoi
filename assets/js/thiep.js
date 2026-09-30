/* ============ Trang thiệp cưới: dựng giao diện + tương tác ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
const isPreview = P.has('preview');
const guest = P.get('to');
let id = P.get('id') || (P.get('demo') ? 'demo-' + P.get('demo') : 'demo');
let D, music = null, audioEl = null, cdTimer = null, petalsOn = false;

/* ---------- Nạp dữ liệu ---------- */
function load(){
  const hash = location.hash.startsWith('#d=') ? TH.unpackInvite(location.hash.slice(3)) : null;
  if (hash) return hash;
  const local = P.get('id') && TH.invites.get(P.get('id'));
  if (local) return local;
  const d = TH.defaultInvite(P.get('demo') || 'hong-pastel');
  if (P.get('g')) { d.groom.nick = P.get('g'); d.groom.name = P.get('g'); }
  if (P.get('b')) { d.bride.nick = P.get('b'); d.bride.name = P.get('b'); }
  if (P.get('d')) { d.date = P.get('d') + 'T11:00'; d.events.forEach(e => e.time = P.get('d') + e.time.slice(10)); }
  return d;
}

const pad = n => String(n).padStart(2,'0');
const DOW = ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'];
const fmtTime = s => { const d = new Date(s); return isNaN(d) ? '' : `${pad(d.getHours())}:${pad(d.getMinutes())} · ${DOW[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`; };
const mapUrl = e => e.map || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(e.address || e.place);
const gcal = e => { const s = new Date(e.time), en = new Date(+s + 3*36e5), f = x => x.toISOString().replace(/[-:]|\.\d{3}/g,'');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(`${e.title} – ${D.groom.nick} & ${D.bride.nick}`) + `&dates=${f(s)}/${f(en)}&location=` + encodeURIComponent(e.place + ', ' + e.address); };
const lum = hex => { const m = hex.replace('#','').match(/.{2}/g); if (!m) return 0; const [r,g,b] = m.map(x=>parseInt(x,16)/255); return .2126*r+.7152*g+.0722*b; };

/* ---------- Dựng giao diện ---------- */
function render(){
  const t = TH.findTemplate(D.tpl), o = D.opts || {};
  const accent = D.accent || t.accent, font = D.font || t.font;
  const b = document.body;
  b.style.setProperty('--t-bg', t.bg); b.style.setProperty('--t-fg', t.fg);
  b.style.setProperty('--t-accent', accent); b.style.setProperty('--t-font', `'${font}'`);
  b.classList.toggle('dark', lum(t.fg) > .6);
  b.classList.toggle('preview-mode', isPreview);
  document.title = `${D.groom.nick} & ${D.bride.nick} – Thiệp cưới`;
  const wd = new Date(D.date);
  const dateStr = isNaN(wd) ? '' : `${pad(wd.getDate())} . ${pad(wd.getMonth()+1)} . ${wd.getFullYear()}`;
  const photos = (D.photos||[]).filter(Boolean);

  $('#app').innerHTML = `
  ${o.envelope !== false && !isPreview ? `<div class="envelope-wrap" id="env">
    <div class="env-guest"><small>Thân gửi</small><div>${esc(guest || 'Quý khách')}</div></div>
    <div class="envelope" id="envelope"><div class="env-body"></div><div class="env-letter"><span>Save the date</span><b>${esc(D.groom.nick)} & ${esc(D.bride.nick)}</b><span>${dateStr}</span></div><div class="env-flap"></div><div class="env-seal">♥</div></div>
    <button class="t-btn" id="openEnv">💌 Mở thiệp</button></div>` : ''}

  <section class="t-hero"><div class="bg" style="background-image:url('${esc(D.cover || photos[0] || '')}')"></div>
    <div class="in"><div class="t-sub" style="margin-bottom:10px;opacity:.9">We're getting married</div>
    <div class="names">${esc(D.groom.nick)}<span>&amp;</span>${esc(D.bride.nick)}</div><div class="date">${dateStr}</div></div><div class="scroll"></div></section>

  <section>
    ${D.quote ? `<p class="reveal" style="font-style:italic;opacity:.8;max-width:380px;margin:0 auto">“${esc(D.quote)}”</p><div class="divider"></div>` : ''}
    <div class="couple">
      <div class="p reveal left"><div class="role">Nhà trai</div><small>${esc(D.groom.father)}<br>${esc(D.groom.mother)}</small></div><span></span>
      <div class="p reveal right"><div class="role">Nhà gái</div><small>${esc(D.bride.father)}<br>${esc(D.bride.mother)}</small></div>
    </div>
    <p class="reveal" style="margin:30px 0 8px;letter-spacing:.2em;font-size:.78rem;text-transform:uppercase;opacity:.7">Trân trọng báo tin lễ thành hôn của</p>
    <div class="couple reveal zoom" style="margin-top:6px">
      <div class="p"><div class="role">Chú rể</div><b>${esc(D.groom.nick)}</b><small>${esc(D.groom.name)}</small></div>
      <div class="amp">&amp;</div>
      <div class="p"><div class="role">Cô dâu</div><b>${esc(D.bride.nick)}</b><small>${esc(D.bride.name)}</small></div>
    </div>
    ${guest ? `<div class="guest-line reveal"><small style="letter-spacing:.2em;text-transform:uppercase;font-size:.7rem;opacity:.7">Kính mời</small><b>${esc(guest)}</b></div>` : ''}
    <p class="reveal" style="margin-top:24px;opacity:.85;line-height:1.8">${esc(D.message)}</p>
  </section>

  ${o.countdown !== false ? `<section style="padding-top:20px"><h2 class="t-title reveal">Đếm ngược</h2><div class="t-sub reveal">Đến ngày chung đôi</div>
    <div class="countdown reveal zoom" id="cd"><div><b>0</b><small>Ngày</small></div><div><b>0</b><small>Giờ</small></div><div><b>0</b><small>Phút</small></div><div><b>0</b><small>Giây</small></div></div></section>` : ''}

  ${o.calendar !== false && !isNaN(wd) ? `<section style="padding-top:10px"><div class="card cal reveal">${calendar(wd)}</div></section>` : ''}

  <section><h2 class="t-title reveal">Sự kiện cưới</h2><div class="t-sub reveal">Thời gian & địa điểm</div>
    <div class="events">${(D.events||[]).filter(e=>e.title).map((e,i)=>`<div class="card event reveal ${i%2?'right':'left'}">
      <h3>${esc(e.title)}</h3><div class="when">${fmtTime(e.time)}</div><div class="where"><b>${esc(e.place)}</b><br>${esc(e.address)}</div>
      <div class="acts"><a class="t-btn" target="_blank" href="${esc(mapUrl(e))}">📍 Chỉ đường</a><a class="t-btn ghost" target="_blank" href="${esc(gcal(e))}">📅 Lưu lịch</a></div></div>`).join('')}</div>
    ${(D.events||[]).length ? `<iframe class="reveal" title="Bản đồ" loading="lazy" style="width:100%;height:240px;border:0;border-radius:18px;margin-top:18px" src="https://maps.google.com/maps?q=${encodeURIComponent(D.events[D.events.length-1].address||'')}&z=15&output=embed"></iframe>` : ''}
  </section>

  ${o.story !== false && (D.story||[]).length ? `<section><h2 class="t-title reveal">Chuyện tình yêu</h2><div class="t-sub reveal">Our love story</div>
    <div class="timeline">${D.story.filter(s=>s.title).map(s=>`<div class="tl-item reveal"><div class="y">${esc(s.date)}</div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>`).join('')}</div></section>` : ''}

  ${o.album !== false && photos.length ? `<section><h2 class="t-title reveal">Album ảnh cưới</h2><div class="t-sub reveal">Khoảnh khắc hạnh phúc</div>
    <div class="album">${photos.map((p,i)=>`<img class="reveal zoom" loading="lazy" src="${esc(p)}" data-i="${i}" alt="Ảnh cưới ${i+1}">`).join('')}</div></section>` : ''}

  ${o.rsvp !== false ? `<section><h2 class="t-title reveal">Xác nhận tham dự</h2><div class="t-sub reveal">Vui lòng phản hồi trước ngày cưới</div>
    <form class="t-form card reveal" id="rsvp">
      <input name="name" placeholder="Họ tên của bạn *" required value="${esc(guest||'')}">
      <input name="phone" placeholder="Số điện thoại">
      <div class="radio-row"><label><input type="radio" name="attend" value="yes" checked><span>Sẽ đến 🎉</span></label><label><input type="radio" name="attend" value="no"><span>Rất tiếc 😢</span></label></div>
      <select name="count"><option value="1">Đi 1 người</option><option value="2">Đi 2 người</option><option value="3">Đi 3 người</option><option value="4">Đi 4+ người</option></select>
      <select name="side"><option value="groom">Khách nhà trai</option><option value="bride">Khách nhà gái</option></select>
      <button class="t-btn" style="justify-content:center">Gửi xác nhận</button></form></section>` : ''}

  ${o.wishes !== false ? `<section id="wishSec"><h2 class="t-title reveal">Sổ lời chúc</h2><div class="t-sub reveal">Gửi yêu thương đến cô dâu chú rể</div>
    <form class="t-form card reveal" id="wishForm"><input name="name" placeholder="Tên của bạn *" required value="${esc(guest||'')}"><textarea name="msg" placeholder="Lời chúc của bạn *" required></textarea>
    <div style="display:flex;gap:6px;flex-wrap:wrap" id="quick">${['Trăm năm hạnh phúc 💕','Chúc hai bạn mãi yêu thương','Sớm có em bé nhé 👶'].map(q=>`<button type="button" class="t-btn ghost" style="padding:6px 12px;font-size:.78rem">${q}</button>`).join('')}</div>
    <button class="t-btn" style="justify-content:center">Gửi lời chúc</button></form><div class="wishes" id="wishes"></div></section>` : ''}

  ${o.gift !== false ? `<section id="giftSec"><h2 class="t-title reveal">Hộp mừng cưới</h2><div class="t-sub reveal">Gửi quà yêu thương</div>
    <p class="reveal" style="opacity:.8;margin-bottom:18px">Sự hiện diện của bạn là món quà quý giá nhất. Nếu không thể đến chung vui, bạn có thể gửi lời chúc qua hộp mừng cưới.</p>
    <button class="t-btn reveal zoom" id="openGift">🎁 Mở hộp mừng cưới</button></section>` : ''}

  <footer class="t-foot"><div class="t-script reveal">Thank you!</div><p class="reveal" style="opacity:.8">Rất hân hạnh được đón tiếp quý khách</p>
    <div class="t-script reveal" style="font-size:2rem;margin-top:10px">${esc(D.groom.nick)} &amp; ${esc(D.bride.nick)}</div>
    <div class="t-brand">Thiệp được tạo bởi <a href="index.html" target="_blank">Thiệp Hồng</a> · <a href="mau-thiep.html" target="_blank">Tạo thiệp miễn phí</a></div></footer>

  <button class="fab fab-music" id="musicBtn" aria-label="Nhạc nền">🎵</button>
  ${o.wishes !== false ? '<button class="fab fab-wish" id="wishBtn" aria-label="Gửi lời chúc">💬</button>' : ''}
  ${o.gift !== false ? '<button class="fab fab-gift" id="giftBtn" aria-label="Mừng cưới">🎁</button>' : ''}
  <div class="lightbox" id="lb"><button class="lb-x">×</button><button class="lb-prev">‹</button><img alt=""><button class="lb-next">›</button><span class="lb-n"></span></div>`;

  bind(photos);
  TH.reveal();
  startCountdown();
  renderWishes();
  if (o.petals !== false && !petalsOn && !isPreview) { petalsOn = true; TH.petals(16, [accent, '#ffffff', t.fg].map(c=>c+'')); }
}

function calendar(d){
  const y = d.getFullYear(), m = d.getMonth(), first = new Date(y,m,1).getDay(), days = new Date(y,m+1,0).getDate();
  const off = (first + 6) % 7; // bắt đầu từ Thứ Hai
  let cells = ['T2','T3','T4','T5','T6','T7','CN'].map(x=>`<span class="dow">${x}</span>`).join('');
  cells += '<span></span>'.repeat(off);
  for (let i=1;i<=days;i++) cells += `<span class="${i===d.getDate()?'hit':''}">${i}</span>`;
  return `<div class="cal-head">Tháng ${m+1} · ${y}</div><div class="cal-grid">${cells}</div>`;
}

function startCountdown(){
  clearInterval(cdTimer); const el = $('#cd'); if (!el) return;
  const target = new Date(D.date).getTime(), b = $$('b', el);
  const tick = () => { let s = Math.max(0, Math.floor((target - Date.now())/1000));
    const v = [Math.floor(s/86400), Math.floor(s%86400/3600), Math.floor(s%3600/60), s%60];
    v.forEach((x,i)=> b[i].textContent = pad(x));
    if (s === 0) { clearInterval(cdTimer); el.insertAdjacentHTML('afterend','<p style="margin-top:14px">💍 Hôm nay là ngày trọng đại!</p>'); } };
  tick(); cdTimer = setInterval(tick, 1000);
}

function renderWishes(){
  const box = $('#wishes'); if (!box) return;
  let list = TH.guestbook.get(id).wishes;
  if (!list.length) list = [
    {name:'Ngọc Lan', msg:'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương nhau như ngày đầu!', at:Date.now()-36e5*5},
    {name:'Thanh Hải', msg:'Hẹn gặp ở tiệc cưới nhé. Chúc mừng hai bạn! 🎉', at:Date.now()-36e5*20}];
  box.innerHTML = list.map(w=>`<div class="wish"><small>${new Date(w.at).toLocaleDateString('vi-VN')}</small><b>${esc(w.name)}</b><p>${esc(w.msg)}</p></div>`).join('');
}

/* ---------- Sự kiện ---------- */
function bind(photos){
  const env = $('#env');
  if (env) $('#openEnv').onclick = () => { $('#envelope').classList.add('open'); playMusic(); setTimeout(()=>env.classList.add('gone'), 1900); setTimeout(()=>env.remove(), 3000); };

  $('#musicBtn').onclick = () => (music?.on || (audioEl && !audioEl.paused)) ? stopMusic() : playMusic();

  // Lightbox
  const lb = $('#lb'); let cur = 0;
  const show = i => { cur = (i + photos.length) % photos.length; $('img', lb).src = photos[cur]; $('.lb-n', lb).textContent = `${cur+1} / ${photos.length}`; lb.classList.add('open'); };
  $$('.album img').forEach(im => im.onclick = () => show(+im.dataset.i));
  $('.lb-x', lb).onclick = () => lb.classList.remove('open');
  $('.lb-prev', lb).onclick = () => show(cur-1); $('.lb-next', lb).onclick = () => show(cur+1);
  lb.onclick = e => { if (e.target === lb) lb.classList.remove('open'); };
  document.onkeydown = e => { if (!lb.classList.contains('open')) return; if (e.key==='Escape') lb.classList.remove('open'); if (e.key==='ArrowLeft') show(cur-1); if (e.key==='ArrowRight') show(cur+1); };
  let sx = 0; lb.ontouchstart = e => sx = e.touches[0].clientX; lb.ontouchend = e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1)); };

  // RSVP
  const rs = $('#rsvp');
  if (rs) rs.onsubmit = e => { e.preventDefault(); if (isPreview) return TH.toast('Đây là bản xem trước');
    const f = Object.fromEntries(new FormData(rs)); TH.guestbook.add(id, 'rsvp', f);
    rs.innerHTML = `<div style="text-align:center;padding:10px"><div style="font-size:2.4rem">${f.attend==='yes'?'🥂':'💐'}</div><b>Cảm ơn ${esc(f.name)}!</b><p style="opacity:.8;margin-top:6px">${f.attend==='yes'?'Rất mong được gặp bạn trong ngày vui.':'Cảm ơn bạn đã báo tin. Mong bạn gửi lời chúc nhé!'}</p></div>`;
    if (f.attend === 'yes') hearts(18); };

  // Wishes
  const wf = $('#wishForm');
  if (wf) { $$('#quick button').forEach(b => b.onclick = () => wf.msg.value = b.textContent);
    wf.onsubmit = e => { e.preventDefault(); if (isPreview) return TH.toast('Đây là bản xem trước');
      const f = Object.fromEntries(new FormData(wf)); TH.guestbook.add(id, 'wishes', {name:f.name.trim(), msg:f.msg.trim()});
      wf.msg.value = ''; renderWishes(); hearts(12); TH.toast('Đã gửi lời chúc 💕'); }; }
  const wb = $('#wishBtn'); if (wb) wb.onclick = () => $('#wishSec').scrollIntoView({behavior:'smooth'});

  // Gift
  [$('#openGift'), $('#giftBtn')].forEach(b => b && (b.onclick = openGift));
}

function openGift(){
  hearts(20);
  const card = (who, g) => !g || !g.acc ? '' : `<div class="gift-card card" style="color:#333;background:#fff8f8">
    <b style="font-family:var(--t-font),cursive;font-size:1.7rem;color:var(--t-accent);font-weight:400">Mừng cưới ${who}</b>
    ${g.qr ? `<img src="${esc(g.qr)}" alt="QR">` : `<div class="qr-box" data-bank="${esc(g.bank)}" data-acc="${esc(g.acc)}" data-owner="${esc(g.owner)}"></div>`}
    <div>${esc(g.bank)}</div><div class="acc">${esc(g.acc)}</div><div style="font-size:.85rem;opacity:.8">${esc(g.owner)}</div>
    <button class="t-btn" style="margin-top:10px;padding:8px 16px;font-size:.85rem" data-copy="${esc(g.acc)}">Sao chép số tài khoản</button></div>`;
  const m = TH.modal(`<div class="gift-grid">${card('chú rể', D.gift?.groom)}${card('cô dâu', D.gift?.bride)}</div>`);
  m.querySelector('.modal-box').style.cssText = 'max-width:420px;max-height:90vh;overflow:auto;--t-accent:' + getComputedStyle(document.body).getPropertyValue('--t-accent');
  $$('[data-copy]', m).forEach(b => b.onclick = () => navigator.clipboard.writeText(b.dataset.copy).then(()=>TH.toast('Đã sao chép số tài khoản')));
  $$('.qr-box', m).forEach(box => {
    // Thử ảnh VietQR theo tên ngân hàng; nếu lỗi thì tạo QR chứa thông tin tài khoản
    const img = new Image(); img.alt = 'QR';
    img.src = `https://img.vietqr.io/image/${encodeURIComponent(box.dataset.bank.toLowerCase().replace(/\s+/g,''))}-${encodeURIComponent(box.dataset.acc)}-qr_only.png?accountName=${encodeURIComponent(box.dataset.owner)}`;
    img.onerror = () => { box.innerHTML = ''; if (window.QRCode) new QRCode(box, {text:`${box.dataset.bank} ${box.dataset.acc} ${box.dataset.owner}`, width:154, height:154}); };
    box.append(img);
  });
}

function hearts(n){
  for (let i=0;i<n;i++) setTimeout(() => { const h = document.createElement('div'); h.className = 'heart-fly';
    h.textContent = ['❤','💕','💖','🌸'][i%4];
    h.style.left = (20 + Math.random()*60) + 'vw'; h.style.bottom = '0';
    h.style.setProperty('--dx', (Math.random()*200-100)+'px'); h.style.setProperty('--r', (Math.random()*90-45)+'deg');
    document.body.append(h); setTimeout(()=>h.remove(), 2300); }, i*70);
}

/* ---------- Nhạc ---------- */
function playMusic(){
  const btn = $('#musicBtn');
  if (D.music?.type === 'url' && D.music.url) {
    if (!audioEl || audioEl.dataset.src !== D.music.url) { audioEl?.pause(); audioEl = new Audio(D.music.url); audioEl.dataset.src = D.music.url; audioEl.loop = true; }
    audioEl.play().catch(()=>{});
  } else if (D.music?.type !== 'none') { music = music || new TH.MusicBox(); music.start(); }
  else return;
  btn.classList.add('playing'); btn.textContent = '🎶';
}
function stopMusic(){ music?.stop(); audioEl?.pause(); const b = $('#musicBtn'); b.classList.remove('playing'); b.textContent = '🎵'; }

/* ---------- Khởi động ---------- */
D = load();
render();
if (!isPreview && P.get('id')) TH.guestbook.view(id);

// Nhận dữ liệu trực tiếp từ trình chỉnh sửa
addEventListener('message', e => {
  if (e.origin !== location.origin || e.data?.type !== 'th-preview') return;
  const y = scrollY; D = e.data.data; render(); scrollTo(0, y);
  $$('.reveal').forEach(el => el.classList.add('in'));
});
if (isPreview) parent.postMessage({type:'th-ready'}, location.origin);
})();

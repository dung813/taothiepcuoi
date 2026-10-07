/* ============ Trang thiệp cưới: dựng giao diện + tương tác ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
const isPreview = P.has('preview');
/* Cá nhân hoá theo khách: ?guest=Huy&table=08 (giữ ?to= cho link cũ) */
const guest = (P.get('guest') || P.get('to') || '').trim();
const table = (P.get('table') || '').trim();
const isDemo = !P.get('id') && !location.hash.startsWith('#d=');
/* ?template=<id> (link từ trang Mẫu thiệp); ?demo= giữ cho link cũ */
const demoTpl = P.get('template') || P.get('demo');
let id = P.get('id') || (demoTpl ? 'demo-' + demoTpl : 'demo');
let D, music = null, audioEl = null, cdTimer = null, petalsOn = false;
/* ?senior=1 trên link: mở sẵn chế độ chữ lớn (tiện gửi cho ông bà, bố mẹ) */
let senior = P.has('senior') ? P.get('senior') !== '0' : !!TH.store.get('senior', false), wishPhoto = '';
document.body.classList.toggle('senior', senior);

/* ---------- Nạp dữ liệu ---------- */
function load(){
  const hash = location.hash.startsWith('#d=') ? TH.unpackInvite(location.hash.slice(3)) : null;
  if (hash) return hash;
  const local = P.get('id') && TH.invites.get(P.get('id'));
  if (local) return local;
  const tpl = demoTpl || 'hong-pastel';
  /* Link từ thẻ "Thiệp khách hàng" truyền tên riêng (g/b) → giữ dữ liệu chung; còn lại dùng đúng cặp đôi của mẫu */
  const c = TH.findTemplate(tpl).couple || {};
  const own = (P.get('g') || P.get('b')) && !(P.get('g') === c.groom && P.get('b') === c.bride);
  const d = own ? TH.defaultInvite(tpl) : TH.sampleInvite(tpl);
  if (!own) return d;
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
  TH.loadFont(font, D.fontBody);
  D.fontBody ? b.style.setProperty('--f-body', TH.fontStack(D.fontBody)) : b.style.removeProperty('--f-body');
  /* Nền thiệp do khách chọn: màu đơn, dải màu hoặc ảnh */
  const bg = D.bg || {};
  if (bg.c) b.style.setProperty('--t-bg', bg.c);
  b.style.backgroundImage = bg.img ? `url('${bg.img}')` : bg.g || '';
  b.style.backgroundSize = bg.img ? 'cover' : '';
  b.style.backgroundPosition = bg.img ? 'center' : '';
  b.style.backgroundAttachment = bg.img ? 'fixed' : '';
  b.classList.toggle('dark', lum(t.fg) > .6);
  b.classList.toggle('preview-mode', isPreview);
  document.title = `${D.groom.nick} & ${D.bride.nick} – Thiệp cưới`;
  const wd = new Date(D.date);
  const dateStr = isNaN(wd) ? '' : `${pad(wd.getDate())} . ${pad(wd.getMonth()+1)} . ${wd.getFullYear()}`;
  const photos = (D.photos||[]).filter(Boolean);
  // Ảnh bìa gốc của mẫu có bảng tên ở giữa → đưa chữ lên trên để không đè lên bảng (ảnh bìa tự tải lên thì giữ bố cục thường)
  b.classList.toggle('hero-top', t.heroPos === 'top' && (D.cover || photos[0]) === (t.photos||[])[0]);

  const v = venue(), stage = currentStage();
  b.dataset.stage = stage;

  const top = `
  <div class="inv-backdrop" aria-hidden="true" style="background-image:url('${esc(D.cover || photos[0] || '')}')"></div>
  <div class="t-topbar">
    ${isDemo && !isPreview ? `<a class="home-btn" href="index.html" aria-label="Về trang chủ WEDSTORY"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg><span>Trang chủ</span></a>` : ''}
    ${o.wishes !== false ? '<div class="ticker" id="ticker" aria-label="Hoạt động mới của khách mời"><div class="ticker-track"></div></div>' : '<span></span>'}
    <button class="senior-btn" id="seniorBtn" aria-pressed="${senior}">${senior ? '👓 Chế độ thường' : '👓 Chữ lớn'}</button>
  </div>
  <button class="speak-btn" id="speakBtn" aria-label="Đọc thiệp thành tiếng">🔊 Đọc thiệp thành tiếng</button>
  <div class="read-progress" aria-hidden="true"><i id="progBar"></i></div>
  ${isDemo && !isPreview ? `<a class="use-tpl" href="editor.html?template=${encodeURIComponent(D.tpl)}" aria-label="Dùng mẫu ${esc(t.name)} để tạo thiệp">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 4l5 5L9 20H4v-5z"/><path d="M13 6l5 5"/></svg>
    <span>Dùng mẫu này</span><small>${esc(t.name)}</small></a>` : ''}
  <div class="autoplay-wrap" role="group" aria-label="Tự động chạy nội dung">
    <button class="autoplay" id="autoBtn" aria-pressed="false" aria-label="Tự động chạy nội dung thiệp"><span class="ic">▶</span><span class="lb">Tự động chạy</span></button>
    <button class="speed-btn" id="speedBtn" aria-label="Tốc độ cuộn: ${SPEEDS[speedIdx]}x — bấm để đổi" title="Đổi tốc độ cuộn (1x · 2x · 4x)">${SPEEDS[speedIdx]}x</button>
  </div>`;

  /* Giai đoạn 1 — trước ngày cưới: thiệp đầy đủ */
  const beforeView = () => `
  ${o.envelope !== false && !isPreview ? `<div class="envelope-wrap" id="env">
    <div class="env-sparkles" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--x:${(i*37)%100}%;--y:${(i*61+13)%100}%;--d:${(i%5)*.6}s;--s:${.6+(i%3)*.35}"></i>`).join('')}</div>
    <div class="env-guest"><small>Thân gửi</small><div>${esc(guest || 'Quý khách')}</div></div>
    <div class="envelope" id="envelope" role="button" tabindex="0" aria-label="Mở thiệp"><div class="env-body"></div><div class="env-letter"><span>Save the date</span><b>${esc(D.groom.nick)}<i>&amp;</i>${esc(D.bride.nick)}</b><span>${dateStr}</span></div><div class="env-flap"></div><div class="env-seal">♥</div></div>
    <button class="t-btn" id="openEnv">💌 Mở thiệp</button></div>` : ''}

  <section class="t-hero${isPreview ? '' : ' intro'}" id="hero"><div class="bg" data-bimg="cover" style="background-image:url('${esc(D.cover || photos[0] || '')}')"></div><div class="flash"></div>
    <div class="in">${guest ? `<div class="guest-pill">Thân mời <b>${esc(guest)}</b>${table ? ` · Bàn ${esc(table)}` : ''}</div>` : ''}<div class="t-sub kick" style="margin-bottom:10px">We're getting married</div>
    <div class="names"><span class="nm g" data-b="groom.nick">${esc(D.groom.nick)}</span><span class="amp">&amp;</span><span class="nm b" data-b="bride.nick">${esc(D.bride.nick)}</span></div><div class="date">${dateStr}</div>${o.countdown !== false ? `<div class="hero-cd" id="cdHero" aria-label="Đếm ngược đến ngày cưới">${["Ngày","Giờ","Phút","Giây"].map(l => `<div><b>0</b><small>${l}</small></div>`).join("")}</div>` : ""}</div><div class="scroll"></div></section>

  <section class="sec-couple">
    <div class="couple-photo reveal left" style="background-image:url('${esc(photos[1] || D.cover || photos[0] || '')}')" aria-hidden="true"></div>
    <div class="couple-info">
    ${D.quote ? `<p class="reveal" style="font-style:italic;opacity:.8;max-width:380px;margin:0 auto">“<span data-b="quote">${esc(D.quote)}</span>”</p><div class="divider"></div>` : ''}
    <div class="couple">
      <div class="p reveal left"><div class="role">Nhà trai</div><small>${esc(D.groom.father)}<br>${esc(D.groom.mother)}</small></div><span></span>
      <div class="p reveal right"><div class="role">Nhà gái</div><small>${esc(D.bride.father)}<br>${esc(D.bride.mother)}</small></div>
    </div>
    <p class="reveal" style="margin:30px 0 8px;letter-spacing:.2em;font-size:.78rem;text-transform:uppercase;opacity:.7">Trân trọng báo tin lễ thành hôn của</p>
    <div class="couple reveal zoom" style="margin-top:6px">
      <div class="p"><div class="role">Chú rể</div><b data-b="groom.nick">${esc(D.groom.nick)}</b><small data-b="groom.name">${esc(D.groom.name)}</small></div>
      <div class="amp">&amp;</div>
      <div class="p"><div class="role">Cô dâu</div><b data-b="bride.nick">${esc(D.bride.nick)}</b><small data-b="bride.name">${esc(D.bride.name)}</small></div>
    </div>
    ${guest ? `<div class="guest-line reveal"><small style="letter-spacing:.2em;text-transform:uppercase;font-size:.7rem;opacity:.7">Kính mời</small><b>${esc(guest)}</b>${table ? `<span class="guest-table">🎟 Bàn số ${esc(table)}</span>` : ''}</div>` : ''}
    <p class="reveal" style="margin-top:24px;opacity:.85;line-height:1.8" data-b="message">${esc(D.message)}</p>
    </div>
  </section>

  ${o.countdown !== false ? `<section class="sec-countdown" style="padding-top:20px"><h2 class="t-title reveal">Đếm ngược</h2><div class="t-sub reveal">Đến ngày chung đôi</div>
    <div class="countdown reveal zoom" id="cd"><div><b>0</b><small>Ngày</small></div><div><b>0</b><small>Giờ</small></div><div><b>0</b><small>Phút</small></div><div><b>0</b><small>Giây</small></div></div></section>` : ''}

  ${o.calendar !== false && !isNaN(wd) ? `<section class="sec-cal" style="padding-top:10px"><div class="card cal reveal">${calendar(wd)}</div></section>` : ''}

  <section class="sec-events"><h2 class="t-title reveal">Sự kiện cưới</h2><div class="t-sub reveal">Thời gian & địa điểm</div>
    <div class="events">${(D.events||[]).filter(e=>e.title).map((e,i,_,n=D.events.indexOf(e))=>`<div class="card event reveal ${i%2?'right':'left'}">
      <h3 data-b="events.${n}.title">${esc(e.title)}</h3><div class="when">${fmtTime(e.time)}</div><div class="where"><b data-b="events.${n}.place">${esc(e.place)}</b><br><span data-b="events.${n}.address">${esc(e.address)}</span></div>
      <div class="acts"><a class="t-btn" target="_blank" href="${esc(mapUrl(e))}">📍 Chỉ đường</a><a class="t-btn ghost" target="_blank" href="${esc(gcal(e))}">📅 Lưu lịch</a></div></div>`).join('')}</div>
    ${(D.events||[]).length && !P.has('lite') ? `<iframe class="reveal" title="Bản đồ" loading="lazy" style="width:100%;height:240px;border:0;border-radius:18px;margin-top:18px" src="https://maps.google.com/maps?q=${encodeURIComponent(D.events[D.events.length-1].address||'')}&z=15&output=embed"></iframe>` : ''}
    ${v ? `<div class="quick-go card reveal" id="quickGo"><div class="qg-head">Đi đến <b>${esc(v.title)}</b><small>${esc(v.place)} · ${esc(v.address)}</small></div>
      <div class="qg-btns">
        <a class="qg" target="_blank" rel="noopener" href="${esc(dirUrl(v))}"><i>🗺️</i><span>Mở Google Maps</span></a>
        <button type="button" class="qg" id="rideBtn"><i>🚕</i><span>Đặt xe đến tiệc</span></button>
        <button type="button" class="qg" id="parkBtn"><i>🅿️</i><span>Bãi đỗ &amp; gửi xe</span></button>
      </div></div>` : ''}
  </section>

  ${o.story !== false && (D.story||[]).length ? `<section class="sec-story"><h2 class="t-title reveal">Chuyện tình yêu</h2><div class="t-sub reveal">Our love story</div>
    <div class="timeline">${D.story.map((s,n)=>!s.title ? '' : `<div class="tl-item reveal"><div class="y" data-b="story.${n}.date">${esc(s.date)}</div><h4 data-b="story.${n}.title">${esc(s.title)}</h4><p data-b="story.${n}.text">${esc(s.text)}</p></div>`).join('')}</div></section>` : ''}

  ${o.album !== false && photos.length ? `<section class="sec-album"><h2 class="t-title reveal">Album ảnh cưới</h2><div class="t-sub reveal">Khoảnh khắc hạnh phúc</div>
    <div class="album">${photos.map((p,i)=>`<img class="reveal zoom" loading="lazy" src="${esc(p)}" data-i="${i}" data-bimg="photos.${D.photos.indexOf(p)}" alt="Ảnh cưới ${i+1}">`).join('')}</div></section>` : ''}

  ${o.rsvp !== false ? `<section class="sec-rsvp"><h2 class="t-title reveal">Xác nhận tham dự</h2><div class="t-sub reveal">Vui lòng phản hồi trước ngày cưới</div>
    <form class="t-form card reveal" id="rsvp" novalidate>
      <input name="name" placeholder="Họ tên của bạn *" required value="${esc(guest||'')}">
      <input name="phone" type="tel" inputmode="tel" placeholder="Số điện thoại">
      <select name="side"><option value="groom">Khách nhà trai</option><option value="bride">Khách nhà gái</option></select>
      <div class="radio-row" role="radiogroup" aria-label="Bạn có tham dự không?"><label><input type="radio" name="attend" value="yes" required><span>Sẽ tham dự 🎉</span></label><label><input type="radio" name="attend" value="no"><span>Không tham dự 😢</span></label></div>
      <fieldset class="rsvp-branch" data-when="yes" hidden disabled>
        <div class="steppers">
          ${stepper('adults', 'Người lớn', 1, 1, 20)}
          ${stepper('kids', 'Trẻ em', 0, 0, 10)}
        </div>
        <p class="rsvp-label">Chế độ ăn uống</p>
        <label class="chk"><input type="checkbox" name="veg" value="1"><span>🥗 Ăn chay</span></label>
        <div class="rsvp-sub" data-show="veg" hidden>${stepper('vegCount', 'Số suất chay', 1, 1, 30)}</div>
        <label class="chk"><input type="checkbox" name="allergy" value="1"><span>⚠️ Dị ứng thực phẩm</span></label>
        <div class="rsvp-sub" data-show="allergy" hidden><textarea name="allergyNote" placeholder="Ví dụ: dị ứng hải sản (tôm, cua), đậu phộng…" maxlength="200"></textarea></div>
      </fieldset>
      <fieldset class="rsvp-branch" data-when="no" hidden disabled>
        <textarea name="msg" placeholder="Gửi lời chúc mừng từ xa đến cô dâu chú rể 💌" maxlength="500"></textarea>
        ${o.gift !== false && (D.gift?.groom?.acc || D.gift?.bride?.acc) ? `<p class="rsvp-label">Mừng cưới từ xa</p><div class="gift-grid rsvp-gift" id="rsvpGift"></div>` : ''}
      </fieldset>
      <p class="rsvp-err" id="rsvpErr" role="alert" hidden></p>
      <button class="t-btn" style="justify-content:center">Gửi xác nhận</button></form></section>` : ''}

  ${o.wishes !== false ? `<section id="wishSec"><h2 class="t-title reveal">Sổ lời chúc</h2><div class="t-sub reveal">Gửi yêu thương đến cô dâu chú rể</div>
    <form class="t-form card reveal" id="wishForm"><input name="name" placeholder="Tên của bạn *" required value="${esc(myName())}"><textarea name="msg" placeholder="Lời chúc của bạn *" required></textarea>
    <div class="wish-tools">
      <button type="button" class="t-btn ghost sm" id="suggestBtn">✨ Gợi ý lời chúc</button>
      <label class="t-btn ghost sm" for="wishPhoto">📷 Đính kèm ảnh</label><input type="file" id="wishPhoto" accept="image/*" hidden>
    </div>
    <div class="photo-prev" id="photoPrev" hidden><img alt="Ảnh đính kèm"><button type="button" aria-label="Bỏ ảnh">×</button></div>
    <div class="quick" id="quick">${['Trăm năm hạnh phúc 💕','Chúc hai bạn mãi yêu thương','Sớm có em bé nhé 👶'].map(q=>`<button type="button" class="t-btn ghost sm">${q}</button>`).join('')}</div>
    <button class="t-btn" style="justify-content:center">Gửi lời chúc</button></form><div class="wishes" id="wishes"></div></section>

  <section id="cheerSec" style="padding-top:10px"><h2 class="t-title reveal">Gửi niềm vui</h2><div class="t-sub reveal">Chạm để chung vui cùng cô dâu chú rể</div>
    <div class="card reveal cheer-card">
      <input class="cheer-name" id="cheerName" placeholder="Tên của bạn (để lên bảng vàng)" value="${esc(myName())}">
      <div class="cheer-btns">
        <button type="button" class="cheer heart" id="cheerHeart"><i>💖</i><span>Bắn tim</span><small id="cntHeart">0</small></button>
        <button type="button" class="cheer fire" id="cheerFire"><i>🎆</i><span>Bắn pháo hoa</span><small id="cntFire">0</small></button>
      </div>
    </div>
    <div class="card reveal board"><h3>🏆 Bảng vàng khách mời</h3><small class="board-sub">Top 5 tương tác nhiều nhất · Lời chúc +3 · Xác nhận dự +2 · Tim/Pháo hoa +1</small><ol id="board"></ol></div>
  </section>` : ''}

  ${o.gift !== false ? `<section id="giftSec"><h2 class="t-title reveal">Hộp mừng cưới</h2><div class="t-sub reveal">Gửi quà yêu thương</div>
    <p class="reveal" style="opacity:.8;margin-bottom:18px">Sự hiện diện của bạn là món quà quý giá nhất. Nếu không thể đến chung vui, bạn có thể gửi lời chúc qua hộp mừng cưới.</p>
    <button class="t-btn reveal zoom" id="openGift">🎁 Mở hộp mừng cưới</button></section>` : ''}

  <footer class="t-foot"><div class="t-script reveal">Thank you!</div><p class="reveal" style="opacity:.8">Rất hân hạnh được đón tiếp quý khách</p>
    <div class="t-script reveal" style="font-size:2rem;margin-top:10px">${esc(D.groom.nick)} &amp; ${esc(D.bride.nick)}</div>
    <div class="t-brand">Thiệp được tạo bởi <a href="index.html" target="_blank">WEDSTORY</a> · <a href="mau-thiep.html" target="_blank">Tạo thiệp miễn phí</a></div>
    ${stageSwitch(stage)}</footer>`;

  $('#app').innerHTML = top + (stage === 'today' ? ticketView(v) : stage === 'after' ? thanksView(photos, dateStr) : beforeView()) + `
  <button class="fab fab-music" id="musicBtn" aria-label="Nhạc nền">🎵</button>
  ${o.wishes !== false && stage === 'before' ? '<button class="fab fab-wish" id="wishBtn" aria-label="Gửi lời chúc">💬</button>' : ''}
  ${o.gift !== false ? '<button class="fab fab-gift" id="giftBtn" aria-label="Mừng cưới">🎁</button>' : ''}
  <div class="lightbox" id="lb"><div class="lb-stage"><img alt="" draggable="false"></div><button class="lb-prev" aria-label="Ảnh trước">‹</button><button class="lb-next" aria-label="Ảnh sau">›</button><div class="lb-tools"><button class="lb-zout" aria-label="Thu nhỏ" title="Thu nhỏ (−)">−</button><span class="lb-zv">100%</span><button class="lb-zin" aria-label="Phóng to" title="Phóng to (+)">+</button><button class="lb-fs" aria-label="Toàn màn hình" title="Toàn màn hình"><svg class="ic-in" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg><svg class="ic-out" viewBox="0 0 24 24"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg></button><button class="lb-x" aria-label="Đóng">×</button></div><span class="lb-n"></span></div>`;

  TH.ek?.apply(D);   // chỉnh sửa tự do (vị trí, phông, màu, ảnh thay thế, chữ/ảnh thêm) — xem thiep-edit.js
  bind(photos);
  if (stage === 'today') drawTicketQr();
  TH.reveal();
  startCountdown();
  renderWishes();
  renderSocial();
  // Ngày cưới: tắt cánh hoa rơi để không che mã QR check-in
  if (o.petals !== false && !petalsOn && !isPreview && stage !== 'today') { petalsOn = true; TH.petals(16, [accent, '#ffffff', t.fg].map(c=>c+'')); }
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
  clearInterval(cdTimer);
  const el = $('#cd'), boxes = [el, $('#cdHero')].filter(Boolean);   // #cdHero: đếm ngược trong ảnh bìa (bản máy tính)
  if (!boxes.length) return;
  const target = new Date(D.date).getTime(), bs = boxes.map(x => $$('b', x));
  const tick = () => { let s = Math.max(0, Math.floor((target - Date.now())/1000));
    const v = [Math.floor(s/86400), Math.floor(s%86400/3600), Math.floor(s%3600/60), s%60];
    bs.forEach(b => v.forEach((x,i)=> b[i].textContent = pad(x)));
    if (s === 0) { clearInterval(cdTimer);
      const msg = new Date().toDateString() === new Date(target).toDateString() ? '💍 Hôm nay là ngày trọng đại!' : '💍 Hai bạn đã chính thức về chung một nhà!';
      boxes.forEach(x => x.nextElementSibling?.classList.contains('cd-msg') || x.insertAdjacentHTML('afterend',`<p class="cd-msg" style="margin-top:14px">${msg}</p>`)); } };   // chỉ chèn 1 lần dù đếm ngược chạy lại
  tick(); cdTimer = setInterval(tick, 1000);
}

function renderWishes(){
  const box = $('#wishes'); if (!box) return;
  let list = TH.guestbook.get(id).wishes;
  if (!list.length) list = [
    {name:'Ngọc Lan', msg:'Chúc hai bạn trăm năm hạnh phúc, mãi yêu thương nhau như ngày đầu!', at:Date.now()-36e5*5},
    {name:'Thanh Hải', msg:'Hẹn gặp ở tiệc cưới nhé. Chúc mừng hai bạn! 🎉', at:Date.now()-36e5*20}];
  box.innerHTML = list.map(w=>`<div class="wish"><small>${new Date(w.at).toLocaleDateString('vi-VN')}</small><b>${esc(w.name)}</b><p>${esc(w.msg)}</p>${w.photo && /^data:image\//.test(w.photo) ? `<img src="${esc(w.photo)}" alt="Ảnh của ${esc(w.name)}" loading="lazy">` : ''}</div>`).join('');
}

/* ---------- Địa điểm tiệc, đọc thiệp, hoạt động của khách ---------- */
function venue(){
  const ev = (D.events||[]).filter(e => e.title && (e.address || e.place));
  return ev.find(e => /tiệc/i.test(e.title)) || ev[ev.length-1] || null;
}
const dirUrl = e => 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(e.lat && e.lng ? `${e.lat},${e.lng}` : [e.place, e.address].filter(Boolean).join(', '));
const myName = () => guest || TH.store.get('guestname', '') || '';
const rememberName = n => { n = (n||'').trim(); if (n) TH.store.set('guestname', n); return n; };

function speechText(){
  const say = s => { const d = new Date(s); if (isNaN(d)) return '';
    return `lúc ${d.getHours()} giờ${d.getMinutes() ? ' ' + d.getMinutes() + ' phút' : ''}, ${DOW[d.getDay()]}, ngày ${d.getDate()} tháng ${d.getMonth()+1} năm ${d.getFullYear()}`; };
  const g = D.groom, b = D.bride, out = [];
  out.push(guest ? `Kính gửi ${guest}.` : 'Kính gửi quý khách.');
  if (table) out.push(`Bàn tiệc của quý khách là bàn số ${table}.`);
  const v = venue(); if (v?.hall) out.push(`Tiệc cưới tổ chức tại ${v.hall}, ${v.place}.`);
  out.push(`Trân trọng báo tin lễ thành hôn của chú rể ${g.name || g.nick} và cô dâu ${b.name || b.nick}.`);
  if (g.father || g.mother) out.push(`Nhà trai: ${[g.father, g.mother].filter(Boolean).join(' và ')}.`);
  if (b.father || b.mother) out.push(`Nhà gái: ${[b.father, b.mother].filter(Boolean).join(' và ')}.`);
  (D.events||[]).filter(e => e.title).forEach(e => out.push(`${e.title}: ${say(e.time)}, tại ${e.place}${e.address ? ', địa chỉ ' + e.address : ''}.`));
  out.push('Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi. Xin chân thành cảm ơn.');
  return out.join(' ');
}

/* Khách mẫu cho thiệp demo / thiệp chưa có tương tác, để bảng vàng và thanh thông báo không trống */
const SAMPLE_ACTS = [
  {name:'Ngọc Lan', type:'wish'}, {name:'Ngọc Lan', type:'heart'}, {name:'Ngọc Lan', type:'fire'}, {name:'Ngọc Lan', type:'heart'},
  {name:'Thanh Hải', type:'wish'}, {name:'Thanh Hải', type:'rsvp'}, {name:'Thanh Hải', type:'fire'},
  {name:'Minh Tú', type:'rsvp'}, {name:'Minh Tú', type:'heart'}, {name:'Minh Tú', type:'heart'}, {name:'Minh Tú', type:'heart'},
  {name:'Bảo Châu', type:'fire'}, {name:'Bảo Châu', type:'fire'}, {name:'Bảo Châu', type:'heart'},
  {name:'Gia Bảo', type:'heart'}, {name:'Gia Bảo', type:'rsvp'}, {name:'Hoài An', type:'heart'}
].map((a, i) => ({...a, at: Date.now() - (i + 1) * 36e5}));
function activity(){
  const gb = TH.guestbook.get(id);
  const real = [
    ...gb.wishes.map(w => ({name:w.name, type:'wish', at:w.at})),
    ...gb.rsvp.filter(r => r.attend === 'yes').map(r => ({name:r.name, type:'rsvp', at:r.at})),
    ...gb.cheers.map(c => ({name:c.name, type:c.kind, at:c.at}))
  ];
  const acts = real.length && !id.startsWith('demo') ? real : [...real, ...SAMPLE_ACTS];
  return acts.filter(a => a.name).sort((x, y) => y.at - x.at);
}
const ACT_TEXT = {wish:'vừa gửi lời chúc 💌', rsvp:'sẽ đến dự tiệc 🥂', heart:'vừa bắn tim 💖', fire:'vừa bắn pháo hoa mừng cưới 🎆'};
const ACT_PTS = {wish:3, rsvp:2, heart:1, fire:1};

function renderSocial(){
  const acts = activity();
  const tk = $('#ticker .ticker-track');
  if (tk) { const items = acts.slice(0, 12).map(a => `<span><b>${esc(a.name)}</b> ${ACT_TEXT[a.type]||''}</span>`).join('');
    tk.innerHTML = items + items; tk.style.animationDuration = Math.max(18, acts.slice(0,12).length * 5) + 's'; }
  const board = $('#board');
  if (board) { const by = {};
    acts.forEach(a => { const k = a.name.trim().toLowerCase(); const r = by[k] = by[k] || {name:a.name.trim(), pts:0, wish:0, heart:0, fire:0, rsvp:0}; r.pts += ACT_PTS[a.type]||0; r[a.type]++; });
    const top = Object.values(by).sort((x, y) => y.pts - x.pts).slice(0, 5), me = myName().toLowerCase();
    board.innerHTML = top.map((r, i) => `<li class="${r.name.toLowerCase() === me ? 'me' : ''}"><span class="rk">${['🥇','🥈','🥉','4','5'][i]}</span><span class="nm">${esc(r.name)}</span>
      <span class="st">${r.wish ? '💌'+r.wish : ''} ${r.heart ? '💖'+r.heart : ''} ${r.fire ? '🎆'+r.fire : ''} ${r.rsvp ? '🥂' : ''}</span><b>${r.pts}</b></li>`).join('') || '<li class="empty">Hãy là người đầu tiên lên bảng vàng!</li>'; }
  const cnt = k => acts.filter(a => a.type === k).length;
  if ($('#cntHeart')) { $('#cntHeart').textContent = cnt('heart'); $('#cntFire').textContent = cnt('fire'); }
}

let cheerLock = 0;
function cheer(kind){
  const accent = getComputedStyle(document.body).getPropertyValue('--t-accent').trim() || '#e35d74';
  kind === 'heart' ? TH.FX.hearts([accent, '#ff8fab', '#ffb3c6', '#ffffff']) : TH.FX.fireworks([accent, '#ffd166', '#ffffff', '#f4b6c2', '#c9a45c']);
  if (isPreview || Date.now() < cheerLock) return; // giãn nhịp ghi điểm để tránh bấm liên tục
  cheerLock = Date.now() + 1200;
  const name = rememberName($('#cheerName')?.value) || 'Một vị khách';
  TH.guestbook.add(id, 'cheers', {name, kind});
  renderSocial();
}

function setSenior(on){
  senior = on; TH.store.set('senior', on);
  document.body.classList.toggle('senior', on);
  const b = $('#seniorBtn'); b.setAttribute('aria-pressed', on); b.textContent = on ? '👓 Chế độ thường' : '👓 Chữ lớn';
  if (!on) { TH.speech.stop(); $('#speakBtn').classList.remove('on'); }
  TH.toast(on ? 'Đã bật chế độ chữ lớn, dễ đọc' : 'Đã về chế độ hiển thị thường');
}

function openRide(v){
  const dest = {name:v.place, address:v.address, lat:v.lat, lng:v.lng};
  if (!dest.lat) TH.geocode([v.address].filter(Boolean).join(', ')).then(p => { if (p) Object.assign(dest, p); });
  const m = TH.modal(`<div class="ride-modal"><h3>🚕 Đặt xe đến tiệc cưới</h3>
    <p class="ride-dest"><b>${esc(v.place)}</b><br>${esc(v.address)}</p>
    <div class="ride-opts">${Object.entries(TH.RIDES).map(([k, r]) => `<button type="button" class="ride-opt ride-${k}" data-ride="${k}">Đặt ${esc(r.name)}</button>`).join('')}</div>
    <button type="button" class="ride-copy" id="rideCopy">📋 Sao chép địa chỉ</button>
    <p class="ride-note">Địa chỉ sẽ được sao chép sẵn. Nếu app chưa tự điền điểm đến, bạn chỉ cần dán vào ô “Điểm đến”.</p></div>`);
  $$('[data-ride]', m).forEach(b => b.onclick = () => TH.rideTo(b.dataset.ride, dest));
  $('#rideCopy', m).onclick = () => navigator.clipboard.writeText(`${v.place}, ${v.address}`).then(() => TH.toast('Đã sao chép địa chỉ'));
}
/* ---------- Tự động chạy nội dung (presentation mode) ----------
   Cuộn đều theo thứ tự các phần của thiệp, dừng ~1,8s ở đầu mỗi phần;
   khách chạm / lăn chuột / bấm phím cuộn thì tự tạm dừng. */
const tour = {on:false, raf:0, timer:0, y:0, last:0, hold:0, stops:[], next:0};
const TOUR_DWELL = 1800, TOUR_EASE = 600;
/* Tốc độ 1x · 2x · 4x (nhớ lựa chọn của khách); thời gian dừng ở mỗi phần cũng rút ngắn theo */
const SPEEDS = [1, 2, 4];
let speedIdx = Math.max(0, SPEEDS.indexOf(+TH.store.get('tourSpeed', 1)));
const SPEED_NAME = {1:'Chậm, vừa mắt', 2:'Nhanh', 4:'Lướt nhanh'};
function cycleSpeed(){
  speedIdx = (speedIdx + 1) % SPEEDS.length;
  const x = SPEEDS[speedIdx], b = $('#speedBtn');
  TH.store.set('tourSpeed', x);
  b.textContent = x + 'x'; b.setAttribute('aria-label', `Tốc độ cuộn: ${x}x — bấm để đổi`);
  b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  TH.toast(`Tốc độ ${x}x · ${SPEED_NAME[x]}`);
}
const scrollMax = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
function tourStops(){
  const ys = $$('#app > section, #app > footer').map(s => Math.max(0, Math.round(s.getBoundingClientRect().top + scrollY - 56)));
  return ys.filter((y, i) => i === 0 || y - ys[i-1] > 40);
}
function setTourUI(on, label){
  const b = $('#autoBtn'); if (!b) return;
  b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
  $('.ic', b).textContent = on ? '⏸' : '▶';
  $('.lb', b).textContent = label || (on ? 'Tạm dừng' : 'Tự động chạy');
  b.closest('.autoplay-wrap')?.classList.toggle('playing', on);
}
function tourStart(){
  if (tour.on || tour.timer) return;
  const env = $('#env');
  if (env && !env.classList.contains('gone')) {          // còn phong bì → mở thiệp trước rồi mới chạy
    if (!env.classList.contains('opening')) $('#openEnv')?.click();
    setTourUI(true, 'Đang mở thiệp…');
    tour.timer = setTimeout(() => { tour.timer = 0; tourStart(); }, 2700);
    return;
  }
  if (scrollY >= scrollMax() - 2) scrollTo({top:0, behavior:'instant'});   // đã xem hết → chạy lại từ đầu
  Object.assign(tour, {on:true, y:scrollY, last:performance.now(), hold:performance.now() - TOUR_EASE});
  tour.stops = tourStops(); tour.next = tour.stops.findIndex(s => s > tour.y + 2);
  setTourUI(true);
  tour.raf = requestAnimationFrame(tourTick);
}
function tourStop(finished){
  clearTimeout(tour.timer); tour.timer = 0;
  cancelAnimationFrame(tour.raf); tour.on = false;
  setTourUI(false, finished ? 'Xem lại' : '');
  if (finished) TH.toast('Bạn đã xem hết thiệp 💕');
}
function tourTick(now){
  if (!tour.on) return;
  const dt = Math.min(64, now - tour.last); tour.last = now;
  if (now >= tour.hold) {
    const ease = Math.min(1, (now - tour.hold) / TOUR_EASE);            // tăng tốc nhẹ sau mỗi lần dừng
    tour.y = Math.min(scrollMax(), tour.y + (senior ? 40 : 55) * SPEEDS[speedIdx] * ease * dt / 1000);
    const stop = tour.stops[tour.next];
    if (stop != null && tour.y >= stop) {
      tour.y = stop; tour.hold = now + TOUR_DWELL / Math.sqrt(SPEEDS[speedIdx]);
      tour.stops = tourStops(); tour.next = tour.stops.findIndex(s => s > tour.y + 2);  // ảnh tải xong có thể làm lệch vị trí
      if (tour.next < 0) tour.next = tour.stops.length;
    }
    scrollTo({top:tour.y, behavior:'instant'});
    if (tour.y >= scrollMax() - 1) return tourStop(true);
  }
  tour.raf = requestAnimationFrame(tourTick);
}
function updateProgress(){
  const bar = $('#progBar'); if (bar) bar.style.width = (scrollMax() ? Math.min(100, scrollY / scrollMax() * 100) : 0) + '%';
}
/* Khách tự tương tác → tạm dừng (bỏ qua chính nút tự động chạy) */
const userTakeover = e => {
  if (!tour.on && !tour.timer) return;
  if (e.target?.closest?.('#autoBtn, #speedBtn')) return;
  tourStop(); TH.toast('Đã tạm dừng — bạn tự do xem nhé');
};
['wheel', 'touchstart', 'pointerdown'].forEach(t => addEventListener(t, userTakeover, {passive:true}));
addEventListener('keydown', e => ['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key) && userTakeover(e));
addEventListener('scroll', updateProgress, {passive:true});
addEventListener('resize', updateProgress);

/* ---------- RSVP: câu hỏi nối tiếp ---------- */
const stepper = (name, label, val, min, max) => `<div class="stepper"><span>${label}</span>
  <div><button type="button" data-step="-1" aria-label="Bớt ${label.toLowerCase()}">−</button><input type="number" name="${name}" value="${val}" min="${min}" max="${max}" inputmode="numeric"><button type="button" data-step="1" aria-label="Thêm ${label.toLowerCase()}">+</button></div></div>`;
function bindRsvp(rs){
  const show = (el, on) => { el.hidden = !on; if (el.tagName === 'FIELDSET') el.disabled = !on; };
  const sync = () => {
    const a = rs.attend.value;
    $$('.rsvp-branch', rs).forEach(fs => show(fs, fs.dataset.when === a));
    $$('[data-show]', rs).forEach(el => { const on = rs[el.dataset.show].checked; el.hidden = !on; $$('input,textarea', el).forEach(i => i.disabled = !on); });
    // Số suất chay không vượt quá tổng số người
    const vc = rs.vegCount, total = (+rs.adults.value || 0) + (+rs.kids.value || 0);
    vc.max = Math.max(1, total); if (+vc.value > total) vc.value = Math.max(1, total);
    const g = $('#rsvpGift', rs);
    if (g && a === 'no' && !g.dataset.ready) { g.dataset.ready = 1; g.innerHTML = giftCards(); mountGift(g); }
    $('#rsvpErr').hidden = true;
  };
  rs.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (!b) return;
    const inp = $('input', b.parentElement), v = (+inp.value || 0) + (+b.dataset.step);
    inp.value = Math.min(+inp.max, Math.max(+inp.min, v)); sync(); });
  rs.addEventListener('change', sync);
  rs.addEventListener('input', e => e.target.type === 'number' && sync());
  sync();
}
function rsvpError(rs){
  if (!rs.elements.name.value.trim()) return 'Vui lòng nhập họ tên của bạn.'; // rs.name là thuộc tính name của chính form
  if (!rs.attend.value) return 'Bạn vui lòng chọn "Sẽ tham dự" hoặc "Không tham dự".';
  if (rs.attend.value === 'yes') {
    const a = +rs.adults.value, k = +rs.kids.value;
    if (!(a >= 1 && a <= 20)) return 'Số người lớn từ 1 đến 20.';
    if (!(k >= 0 && k <= 10)) return 'Số trẻ em từ 0 đến 10.';
    if (rs.allergy.checked && !rs.allergyNote.value.trim()) return 'Vui lòng ghi rõ loại thực phẩm bị dị ứng để bếp chuẩn bị.';
  }
  return '';
}
function rsvpData(rs){
  const f = Object.fromEntries(new FormData(rs)), yes = f.attend === 'yes';
  const out = {name:f.name.trim(), phone:(f.phone||'').trim(), side:f.side, attend:f.attend, ...(group ? {grp:group.id} : {})};
  if (yes) Object.assign(out, {adults:+f.adults, kids:+f.kids, count:+f.adults + +f.kids, veg:!!f.veg, vegCount:f.veg ? +f.vegCount : 0,
    allergy:!!f.allergy, allergyNote:f.allergy ? (f.allergyNote||'').trim() : ''});
  else out.msg = (f.msg||'').trim();
  return out;
}

/* ---------- Một link – ba giai đoạn ---------- */
const STAGES = {before:'Trước cưới', today:'Ngày cưới', after:'Sau cưới'};
const dayOf = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/* ?stage=before|today|after để xem thử; mặc định tính theo giờ thực:
   "today" kéo dài từ ngày của sự kiện đầu tiên (VD: Lễ Vu Quy) đến hết ngày tiệc cưới */
function currentStage(){
  const forced = P.get('stage');
  if (STAGES[forced]) return forced;
  if (isPreview) return 'before';
  const times = [D.date, ...(D.events||[]).map(e => e.time)].map(x => new Date(x)).filter(x => !isNaN(x));
  if (!times.length) return 'before';
  const now = dayOf(new Date()), first = dayOf(new Date(Math.min(...times))), last = dayOf(new Date(Math.max(...times)));
  return now < first ? 'before' : now > last ? 'after' : 'today';
}
const stageUrl = s => { const u = new URL(location.href); u.searchParams.set('stage', s); return u.pathname.split('/').pop() + u.search + u.hash; };
/* Thanh chuyển giai đoạn: chỉ hiện trên thiệp demo để chủ thiệp xem thử */
const stageSwitch = cur => !isDemo || isPreview ? '' : `<nav class="stage-switch" aria-label="Xem thử giai đoạn"><small>Xem thử giai đoạn</small>
  <div>${Object.entries(STAGES).map(([k, n]) => `<a href="${esc(stageUrl(k))}" data-stage-link class="${k === cur ? 'on' : ''}">${n}</a>`).join('')}</div></nav>`;
/* Chuyển giai đoạn bằng location.replace → không chồng thêm lịch sử, nút Back về thẳng trang trước */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-stage-link]');
  if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
  e.preventDefault(); location.replace(a.href);
});

const fmtPhone = p => String(p).replace(/\D/g, '').replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3');
const ascii = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
/* Mã vé ngắn, ổn định theo thiệp + khách + bàn (để lễ tân đối chiếu) */
function ticketCode(){
  let h = 5381; for (const ch of `${id}|${guest}|${table}`) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return h.toString(36).toUpperCase().padStart(6, '0').slice(-6);
}

/* Giai đoạn 2 — ngày cưới: vé mời điện tử */
function ticketView(v){
  const ev = (D.events||[]).filter(e => e.title), main = v || ev[ev.length-1] || {};
  const start = new Date(main.time), welcome = isNaN(start) ? '' : new Date(+start - 30*6e4);
  const hm = d => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const hot = (D.hotlines||[]).filter(h => h.phone);
  return `<section class="tk-wrap">
    <div class="tk-hello reveal">${guest ? `Chào mừng <b>${esc(guest)}</b> 👋` : 'Chào mừng quý khách 👋'}<small>Hôm nay là ngày vui của ${esc(D.groom.nick)} &amp; ${esc(D.bride.nick)}</small></div>
    <article class="ticket reveal zoom" aria-label="Vé mời điện tử">
      <header class="tk-head"><small>Vé mời điện tử · ${esc(main.title || 'Tiệc cưới')}</small>
        <b>${esc(D.groom.nick)} &amp; ${esc(D.bride.nick)}</b><span>${fmtTime(main.time)}</span></header>
      <div class="tk-table">${table
        ? `<small>Bàn của bạn</small><b>${esc(table)}</b>`
        : `<small>Bàn tiệc</small><b class="na">—</b><em>Vui lòng báo tên tại quầy lễ tân để được hướng dẫn chỗ ngồi</em>`}</div>
      <div class="tk-cut" aria-hidden="true"></div>
      <div class="tk-qr"><div class="tk-qr-box" id="tkQr"></div><small>Mã check-in: <b>${ticketCode()}</b></small><em>Đưa mã này cho lễ tân khi đến sảnh</em></div>
      <div class="tk-cut" aria-hidden="true"></div>
      <ul class="tk-info">
        <li><i>📍</i><p><b>${esc(main.hall || main.place || '')}</b>${main.hall ? `<br>${esc(main.place)}` : ''}<br><span>${esc(main.address || '')}</span></p></li>
        ${welcome ? `<li><i>🕔</i><p>Đón khách từ <b>${hm(welcome)}</b> · Khai tiệc <b>${hm(start)}</b></p></li>` : ''}
      </ul>
      ${v ? `<div class="tk-acts"><a class="t-btn" target="_blank" rel="noopener" href="${esc(dirUrl(v))}">🧭 Dẫn đường</a>
        <button type="button" class="t-btn ghost" id="rideBtn">🚕 Đặt xe</button><button type="button" class="t-btn ghost" id="parkBtn">🅿️ Gửi xe</button></div>` : ''}
    </article>
    ${ev.length > 1 ? `<div class="card tk-sched reveal"><h3>Lịch trình</h3><ol>${ev.map(e => `<li class="${e === main ? 'main' : ''}"><time>${isNaN(new Date(e.time)) ? '' : hm(new Date(e.time))}</time><div><b>${esc(e.title)}</b><small>${esc(e.place)}</small></div></li>`).join('')}</ol></div>` : ''}
    ${hot.length ? `<div class="card tk-hot reveal"><h3>📞 Cần hỗ trợ? Gọi người nhà</h3>${hot.map(h => `<a class="tk-call" href="tel:${esc(String(h.phone).replace(/[^\d+]/g, ''))}"><span><b>${esc(h.name)}</b><small>${esc(h.role || '')}</small></span><em>${esc(fmtPhone(h.phone))}</em></a>`).join('')}</div>` : ''}
    <a class="tk-full reveal" href="${esc(stageUrl('before'))}">Xem thiệp mời đầy đủ →</a>
    ${stageSwitch('today')}
  </section>`;
}
function drawTicketQr(){
  const box = $('#tkQr'); if (!box) return;
  const text = ['WEDSTORY-CHECKIN', id, ticketCode(), ascii(guest) || 'KHACH', 'BAN:' + (ascii(table) || '-')].join('|');
  if (window.QRCode) new QRCode(box, {text, width:168, height:168, correctLevel: QRCode.CorrectLevel.M});
  else box.textContent = ticketCode();
}

/* Giai đoạn 3 — sau ngày cưới: thư cảm ơn + album kỷ niệm */
function thanksView(photos, dateStr){
  const g = esc(D.groom.nick), b = esc(D.bride.nick);
  const letter = (D.thanks || `Cảm ơn ${guest ? esc(guest) : 'bạn'} đã dành thời gian đến chung vui và gửi những lời chúc thật ấm áp trong ngày trọng đại của chúng mình.
Sự hiện diện và tình cảm của mọi người đã làm ngày cưới trở nên trọn vẹn hơn bao giờ hết. Chúng mình xin gửi lại vài khoảnh khắc kỷ niệm, mong bạn sẽ thích.
Hẹn gặp lại bạn ở tổ ấm nhỏ của chúng mình nhé!`).split('\n').filter(Boolean);
  return `<section class="ty-hero"><div class="bg" style="background-image:url('${esc(D.cover || photos[0] || '')}')"></div>
    <div class="in"><small>Thư cảm ơn từ cô dâu &amp; chú rể</small><div class="t-script ty-title">Thank you</div><p>${g} &amp; ${b}</p><span>${dateStr}</span></div></section>
  <section><article class="card ty-letter reveal"><p class="ty-to">Gửi ${guest ? esc(guest) : 'những người thân yêu'},</p>
    ${letter.map(p => `<p>${D.thanks ? esc(p) : p}</p>`).join('')}<p class="t-script ty-sign">${g} &amp; ${b}</p></article></section>
  ${photos.length ? `<section id="albumAll"><h2 class="t-title reveal">Album kỷ niệm</h2><div class="t-sub reveal">${photos.length} khoảnh khắc · chạm để xem, tải về làm kỷ niệm</div>
    <div class="album-all">${photos.map((p, i) => `<figure class="reveal zoom"><img loading="lazy" src="${esc(p)}" data-i="${i}" alt="Ảnh kỷ niệm ${i+1}">
      <a class="dl" href="${esc(p)}" download="${esc(photoName(p, i))}" target="_blank" rel="noopener" aria-label="Tải ảnh ${i+1}">⬇</a></figure>`).join('')}</div>
    <button type="button" class="t-btn" id="dlAll">⬇ Tải toàn bộ album (.zip)</button></section>` : ''}
  ${D.opts?.wishes !== false ? `<section><h2 class="t-title reveal">Lời chúc đã nhận</h2><div class="t-sub reveal">Cảm ơn những lời yêu thương</div><div class="wishes" id="wishes"></div></section>` : ''}
  <footer class="t-foot"><div class="t-script reveal">With love,</div>
    <div class="t-script reveal" style="font-size:2rem;margin-top:6px">${g} &amp; ${b}</div>
    <div class="t-brand">Thiệp được tạo bởi <a href="index.html" target="_blank">WEDSTORY</a> · <a href="mau-thiep.html" target="_blank">Tạo thiệp miễn phí</a></div>
    ${stageSwitch('after')}</footer>`;
}
const photoName = (p, i) => {
  const ext = ((String(p).match(/\.(webp|jpe?g|png|gif)(?:\?|$)/i) || [])[1] || 'jpg').toLowerCase();
  return `${ascii(D.groom.nick)}-${ascii(D.bride.nick)}-${pad(i+1)}.${ext}`.replace(/\s+/g, '');
};
/* Gom toàn bộ ảnh thành 1 file .zip (JSZip tải khi cần) */
async function downloadAll(btn){
  const photos = (D.photos||[]).filter(Boolean), label = btn.textContent;
  btn.disabled = true;
  try {
    if (!window.JSZip) await new Promise((ok, fail) => { const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'; s.onload = ok; s.onerror = fail; document.head.append(s); });
    const zip = new JSZip(); let n = 0, miss = 0;
    for (const [i, p] of photos.entries()) {
      btn.textContent = `Đang gom ảnh ${i+1}/${photos.length}…`;
      try { const r = await fetch(p); if (!r.ok) throw 0; zip.file(photoName(p, i), await r.blob()); n++; } catch { miss++; }
    }
    if (!n) throw new Error('empty');
    btn.textContent = 'Đang nén…';
    const url = URL.createObjectURL(await zip.generateAsync({type:'blob'}));
    const a = Object.assign(document.createElement('a'), {href:url, download:`album-cuoi-${ascii(D.groom.nick)}-${ascii(D.bride.nick)}.zip`.replace(/\s+/g, '')});
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    TH.toast(miss ? `Đã tải ${n} ảnh (${miss} ảnh không tải được, bạn bấm ⬇ trên từng ảnh nhé)` : `Đã tải ${n} ảnh kỷ niệm 💕`);
  } catch { TH.toast('Chưa tải được album, bạn bấm ⬇ trên từng ảnh để lưu nhé'); }
  btn.disabled = false; btn.textContent = label;
}

function openParking(v){
  const lines = (v.parking || 'Vui lòng liên hệ cô dâu chú rể hoặc lễ tân sảnh tiệc để được hướng dẫn gửi xe.').split('\n').filter(Boolean);
  const q = 'bãi giữ xe gần ' + [v.place, v.address].filter(Boolean).join(', ');
  TH.modal(`<div class="ride-modal"><h3>🅿️ Bãi đỗ &amp; hướng dẫn gửi xe</h3>
    <p class="ride-dest"><b>${esc(v.place)}</b><br>${esc(v.address)}</p>
    <ul class="park-list">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
    <a class="ride-opt" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}">Xem bãi đỗ xe gần sảnh trên bản đồ</a></div>`);
}

/* ---------- Hiệu ứng mở thiệp ---------- */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function heartBurst(from){
  const r = from.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('span'), a = (i / 14) * Math.PI * 2, dist = 90 + Math.random() * 70;
    h.className = 'heart-pop'; h.textContent = ['♥','❤','✦'][i % 3];
    h.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(a)*dist}px;--dy:${Math.sin(a)*dist}px;--r:${(Math.random()-.5)*120}deg;animation-delay:${Math.random()*.12}s`;
    document.body.append(h); setTimeout(()=>h.remove(), 1500);
  }
}
function confetti(){
  const box = document.createElement('div'); box.className = 'confetti'; box.setAttribute('aria-hidden','true');
  const cs = getComputedStyle(document.body), colors = [cs.getPropertyValue('--t-accent').trim(), '#ffffff', '#f6d58e', '#f4b6c2'];
  box.innerHTML = Array.from({length:70}, (_, i) => `<i style="left:${Math.random()*100}%;background:${colors[i%colors.length]};--w:${5+Math.random()*6}px;--h:${8+Math.random()*10}px;--dx:${(Math.random()-.5)*160}px;--rot:${360+Math.random()*720}deg;animation-duration:${2.6+Math.random()*2}s;animation-delay:${Math.random()*.9}s;border-radius:${i%3?'2px':'50%'}"></i>`).join('');
  document.body.append(box); setTimeout(()=>box.remove(), 6000);
}
function playIntro(){
  const h = $('#hero'); if (!h || !h.classList.contains('intro')) return;
  requestAnimationFrame(()=>h.classList.add('play'));
  if (!reduceMotion) setTimeout(confetti, 900);
}

/* ---------- Sự kiện ---------- */
function bind(photos){
  const env = $('#env');
  if (env) {
    const open = () => {
      if (env.classList.contains('opening')) return;
      env.classList.add('opening'); playMusic();
      if (reduceMotion) { env.classList.add('gone'); setTimeout(()=>{ env.remove(); playIntro(); }, 400); return; }
      heartBurst($('.env-seal'));
      $('#envelope').classList.add('open');
      setTimeout(()=>env.classList.add('zoom'), 1900);
      setTimeout(()=>{ env.classList.add('gone'); playIntro(); }, 2500);
      setTimeout(()=>env.remove(), 3600);
    };
    $('#openEnv').onclick = open;
    $('#envelope').onclick = open;
    $('#envelope').onkeydown = e => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open());
  } else if (!isPreview) playIntro();

  $('#musicBtn').onclick = () => (music?.on || (audioEl && !audioEl.paused)) ? stopMusic() : playMusic();

  // Lightbox: zoom bằng nút / lăn chuột / chụm 2 ngón, kéo để xem góc ảnh, toàn màn hình
  const lb = $('#lb'), stage = $('.lb-stage', lb), lbImg = $('img', lb); let cur = 0;
  const Z = {s:1, x:0, y:0}, MAXZ = 5;
  const lbCenter = () => { const r = stage.getBoundingClientRect(); return [r.left + r.width/2, r.top + r.height/2]; };
  const renderZ = anim => {
    lbImg.classList.toggle('anim', !!anim);
    lbImg.style.transform = `translate3d(${Z.x}px,${Z.y}px,0) scale(${Z.s})`;
    lb.classList.toggle('zoomed', Z.s > 1.001);
    $('.lb-zv', lb).textContent = Math.round(Z.s * 100) + '%';
  };
  // Giữ ảnh không bị kéo lệch ra ngoài khung
  const clampZ = () => {
    const r = stage.getBoundingClientRect();
    const mx = Math.max(0, (lbImg.offsetWidth * Z.s - r.width) / 2), my = Math.max(0, (lbImg.offsetHeight * Z.s - r.height) / 2);
    Z.x = Math.min(mx, Math.max(-mx, Z.x)); Z.y = Math.min(my, Math.max(-my, Z.y));
  };
  // Zoom quanh điểm (px, py) trên màn hình: điểm đó đứng yên dưới con trỏ / ngón tay
  const zoomTo = (ns, px, py, anim) => {
    ns = Math.min(MAXZ, Math.max(1, ns));
    const [cx, cy] = lbCenter();
    const dx = (px ?? cx) - cx, dy = (py ?? cy) - cy, k = ns / Z.s;
    Z.x = dx - (dx - Z.x) * k; Z.y = dy - (dy - Z.y) * k; Z.s = ns;
    if (ns === 1) Z.x = Z.y = 0;
    clampZ(); renderZ(anim);
  };
  const resetZ = anim => { Z.s = 1; Z.x = Z.y = 0; renderZ(anim); };
  const show = i => {
    cur = (i + photos.length) % photos.length; resetZ();
    lbImg.style.animation = 'none'; lbImg.offsetWidth; lbImg.style.animation = '';
    lbImg.src = photos[cur]; $('.lb-n', lb).textContent = `${cur+1} / ${photos.length}`; lb.classList.add('open');
  };
  const fsEl = () => document.fullscreenElement || document.webkitFullscreenElement;
  const exitFs = () => { try { (document.exitFullscreen || document.webkitExitFullscreen).call(document)?.catch?.(() => {}); } catch {} };
  const closeLb = () => { if (fsEl() === lb) exitFs(); lb.classList.remove('open'); resetZ(); };
  $$('.album img, .album-all img').forEach(im => im.onclick = () => show(+im.dataset.i));
  $('.lb-x', lb).onclick = closeLb;
  $('.lb-prev', lb).onclick = () => show(cur-1); $('.lb-next', lb).onclick = () => show(cur+1);
  $('.lb-zin', lb).onclick = () => zoomTo(Z.s * 1.5, null, null, true);
  $('.lb-zout', lb).onclick = () => zoomTo(Z.s / 1.5, null, null, true);
  const fsBtn = $('.lb-fs', lb);
  if (!(lb.requestFullscreen || lb.webkitRequestFullscreen)) fsBtn.hidden = true;
  fsBtn.onclick = () => {
    if (fsEl()) return exitFs();
    try { (lb.requestFullscreen || lb.webkitRequestFullscreen).call(lb)?.catch?.(() => {}); } catch {}
  };
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(t => document.addEventListener(t, () => { lb.classList.toggle('fs', fsEl() === lb); resetZ(); }));
  let noClickUntil = 0;
  lb.onclick = e => { if ((e.target === lb || e.target === stage) && Date.now() > noClickUntil) closeLb(); };
  document.onkeydown = e => {
    if (!lb.classList.contains('open')) return;
    if (e.key==='Escape') closeLb();
    if (e.key==='ArrowLeft') show(cur-1); if (e.key==='ArrowRight') show(cur+1);
    if (e.key==='+' || e.key==='=') zoomTo(Z.s * 1.5, null, null, true);
    if (e.key==='-') zoomTo(Z.s / 1.5, null, null, true);
    if (e.key==='0') resetZ(true);
  };

  // Máy tính: lăn chuột trên ảnh để zoom, giữ chuột kéo ảnh đang zoom, nhấp đúp để zoom nhanh
  lb.addEventListener('wheel', e => {
    e.preventDefault();
    if (e.target !== lbImg) return;
    const step = e.deltaMode ? e.deltaY * 33 : e.deltaY;
    zoomTo(Z.s * Math.exp(-step * 0.0015), e.clientX, e.clientY);
  }, {passive:false});
  let drag = null, lastTouch = 0;
  lbImg.addEventListener('mousedown', e => {
    if (e.button || Z.s <= 1) return;
    e.preventDefault();
    drag = {px:e.clientX, py:e.clientY, x:Z.x, y:Z.y, moved:false}; lb.classList.add('dragging');
  });
  addEventListener('mousemove', e => {
    if (!drag) return;
    Z.x = drag.x + e.clientX - drag.px; Z.y = drag.y + e.clientY - drag.py;
    if (Math.abs(e.clientX - drag.px) + Math.abs(e.clientY - drag.py) > 4) drag.moved = true;
    clampZ(); renderZ();
  });
  addEventListener('mouseup', () => {
    if (!drag) return;
    if (drag.moved) noClickUntil = Date.now() + 300;
    drag = null; lb.classList.remove('dragging');
  });
  lbImg.addEventListener('dblclick', e => {
    if (Date.now() - lastTouch < 800) return;   // điện thoại đã tự xử lý chạm đúp
    Z.s > 1 ? resetZ(true) : zoomTo(2.5, e.clientX, e.clientY, true);
  });

  // Điện thoại: chụm 2 ngón để zoom tại chỗ, 1 ngón kéo xem góc ảnh khi đang zoom.
  // Quẹt chuyển ảnh CHỈ chạy khi ảnh ở kích thước gốc (scale 1) và cả cử chỉ chưa từng có 2 ngón.
  let G = null, multi = false, lastTap = 0;
  const tDist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) || 1;
  const startPinch = ts => {
    const [cx, cy] = lbCenter(), a = ts[0], b = ts[1];
    if (Z.s <= 1) Z.x = Z.y = 0;   // bỏ phần lệch do đang quẹt dở
    G = {mode:'pinch', d:tDist(a, b), s:Z.s, x:Z.x, y:Z.y,
         mx:(a.clientX + b.clientX)/2 - cx, my:(a.clientY + b.clientY)/2 - cy};
  };
  const startPan = t => G = {mode:'pan', px:t.clientX, py:t.clientY, x:Z.x, y:Z.y, moved:false};
  lb.addEventListener('touchstart', e => {
    lastTouch = Date.now();
    if (e.target.closest('button')) return;
    const ts = e.touches;
    if (ts.length > 1) { multi = true; startPinch(ts); renderZ(); }
    else if (Z.s > 1) startPan(ts[0]);
    else if (!multi) G = {mode:'swipe', sx:ts[0].clientX, sy:ts[0].clientY, dx:0, dy:0, lock:null, moved:false};
  }, {passive:false});
  lb.addEventListener('touchmove', e => {
    if (!G) return;
    e.preventDefault();
    const ts = e.touches;
    if (G.mode === 'pinch' && ts.length > 1) {
      const [cx, cy] = lbCenter(), a = ts[0], b = ts[1];
      const ns = Math.min(MAXZ * 1.2, Math.max(.8, G.s * tDist(a, b) / G.d)), k = ns / G.s;
      const mx = (a.clientX + b.clientX)/2 - cx, my = (a.clientY + b.clientY)/2 - cy;
      Z.s = ns; Z.x = mx - (G.mx - G.x) * k; Z.y = my - (G.my - G.y) * k;
      renderZ();
    } else if (G.mode === 'pan') {
      const dx = ts[0].clientX - G.px, dy = ts[0].clientY - G.py;
      if (Math.abs(dx) + Math.abs(dy) > 8) G.moved = true;
      Z.x = G.x + dx; Z.y = G.y + dy;
      clampZ(); renderZ();
    } else if (G.mode === 'swipe') {
      G.dx = ts[0].clientX - G.sx; G.dy = ts[0].clientY - G.sy;
      if (Math.abs(G.dx) + Math.abs(G.dy) > 8) G.moved = true;
      if (!G.lock && G.moved) G.lock = Math.abs(G.dx) > Math.abs(G.dy) ? 'x' : 'y';
      if (G.lock === 'x') { Z.x = G.dx; renderZ(); }   // ảnh chạy theo ngón tay
    }
  }, {passive:false});
  // Chạm đúp vào ảnh: đang gốc thì zoom 2.5x tại chỗ chạm, đang zoom thì về gốc
  const doubleTap = (e, g) => {
    if (g.moved || multi || e.target !== lbImg) return false;
    const now = Date.now(), t = e.changedTouches[0];
    if (now - lastTap < 300) { lastTap = 0; Z.s > 1 ? resetZ(true) : zoomTo(2.5, t.clientX, t.clientY, true); return true; }
    lastTap = now; return false;
  };
  const touchEnd = e => {
    const ts = e.touches;
    if (ts.length > 1) { startPinch(ts); return; }
    if (ts.length === 1) {   // nhấc 1 trong 2 ngón: đang zoom thì chuyển sang kéo, không bao giờ quẹt
      if (Z.s > 1) { startPan(ts[0]); G.moved = true; } else G = {mode:'hold'};
      return;
    }
    // Đã nhấc hết ngón
    const g = G; G = null;
    if (!g) { multi = false; return; }
    if (g.mode === 'swipe' && !multi && Z.s === 1) {
      if (g.lock === 'x' && Math.abs(g.dx) > 50) show(cur + (g.dx < 0 ? 1 : -1));
      else if (g.moved) resetZ(true);
      else doubleTap(e, g);
    } else {
      if (g.moved || multi) noClickUntil = Date.now() + 400;
      if (!doubleTap(e, g)) {
        if (Z.s < 1.05) resetZ(true);   // chụm nhỏ hơn gốc thì bật về đúng kích thước gốc
        else { Z.s = Math.min(MAXZ, Z.s); clampZ(); renderZ(true); }
      }
    }
    multi = false;
  };
  lb.addEventListener('touchend', touchEnd);
  lb.addEventListener('touchcancel', touchEnd);
  lb.addEventListener('gesturestart', e => e.preventDefault());   // iOS: chặn zoom cả trang

  // RSVP: câu hỏi nối tiếp theo lựa chọn của khách
  const rs = $('#rsvp');
  if (rs) bindRsvp(rs);
  if (rs) rs.onsubmit = e => { e.preventDefault();
    const err = rsvpError(rs); $('#rsvpErr').hidden = !err; $('#rsvpErr').textContent = err || '';
    if (err) return;
    if (isPreview) return TH.toast('Đây là bản xem trước');
    const f = rsvpData(rs); rememberName(f.name); TH.guestbook.add(id, 'rsvp', f);
    if (f.attend === 'no' && f.msg) { TH.guestbook.add(id, 'wishes', {name:f.name, msg:f.msg}); renderWishes(); }
    renderSocial();
    const p = TH.rsvpParty(f);
    const note = f.attend === 'yes'
      ? `Đã ghi nhận ${p.adults} người lớn${p.kids ? ` · ${p.kids} trẻ em` : ''}${p.veg ? ` · ${p.veg} suất chay` : ''}. Rất mong được gặp bạn trong ngày vui!`
      : f.msg ? 'Lời chúc của bạn đã được gửi tới cô dâu chú rể 💌' : 'Cảm ơn bạn đã báo tin. Mong bạn gửi lời chúc nhé!';
    rs.innerHTML = `<div style="text-align:center;padding:10px"><div style="font-size:2.4rem">${f.attend==='yes'?'🥂':'💐'}</div><b>Cảm ơn ${esc(f.name)}!</b><p style="opacity:.8;margin-top:6px">${note}</p></div>`;
    if (f.attend === 'yes') hearts(18); };

  // Wishes
  const wf = $('#wishForm');
  if (wf) {
    const bindQuick = () => $$('#quick button').forEach(b => b.onclick = () => { wf.msg.value = b.textContent; wf.msg.focus(); });
    bindQuick();
    $('#suggestBtn').onclick = async () => {
      const btn = $('#suggestBtn'); btn.disabled = true; btn.textContent = '✨ Đang soạn…';
      const list = await TH.suggestWishes({groom:D.groom.nick, bride:D.bride.nick});
      $('#quick').innerHTML = list.map(s => `<button type="button" class="t-btn ghost sm suggest">${esc(s)}</button>`).join('');
      bindQuick(); btn.disabled = false; btn.textContent = '✨ Gợi ý khác';
    };
    const prev = $('#photoPrev'), setPhoto = src => { wishPhoto = src; prev.hidden = !src; $('img', prev).src = src || ''; };
    $('#wishPhoto').onchange = async e => { const file = e.target.files[0]; e.target.value = ''; if (!file) return;
      try { setPhoto(await TH.shrinkImage(file)); } catch { TH.toast('Không đọc được ảnh này, bạn thử ảnh khác nhé'); } };
    $('button', prev).onclick = () => setPhoto('');
    wf.onsubmit = e => { e.preventDefault(); if (isPreview) return TH.toast('Đây là bản xem trước');
      const f = Object.fromEntries(new FormData(wf)), name = rememberName(f.name);
      const ok = TH.guestbook.add(id, 'wishes', {name, msg:f.msg.trim(), ...(wishPhoto ? {photo:wishPhoto} : {})});
      if (!ok) return TH.toast('Ảnh quá lớn so với bộ nhớ, bạn thử gửi lại không kèm ảnh nhé');
      wf.msg.value = ''; setPhoto(''); if ($('#cheerName') && !$('#cheerName').value) $('#cheerName').value = name;
      renderWishes(); renderSocial(); hearts(12); TH.toast('Đã gửi lời chúc 💕'); }; }
  const ch = $('#cheerHeart'), cf = $('#cheerFire');
  if (ch) { ch.onclick = () => cheer('heart'); cf.onclick = () => cheer('fire'); }

  // Chế độ người lớn tuổi & đọc thiệp
  $('#seniorBtn').onclick = () => setSenior(!senior);
  const sp = $('#speakBtn');
  sp.onclick = () => {
    if (TH.speech.speaking()) { TH.speech.stop(); sp.classList.remove('on'); sp.textContent = '🔊 Đọc thiệp thành tiếng'; return; }
    if (TH.speech.speak(speechText(), {onend: () => { sp.classList.remove('on'); sp.textContent = '🔊 Đọc thiệp thành tiếng'; }})) {
      stopMusic(); sp.classList.add('on'); sp.textContent = '⏹ Dừng đọc'; }
  };

  // Nút đi nhanh tới tiệc (thiệp đầy đủ & vé mời)
  const v = venue();
  if ($('#rideBtn')) { $('#rideBtn').onclick = () => openRide(v); $('#parkBtn').onclick = () => openParking(v); }

  // Tự động chạy nội dung
  $('#autoBtn').onclick = () => tour.on || tour.timer ? tourStop() : tourStart();
  $('#speedBtn').onclick = cycleSpeed;
  updateProgress();

  // Album kỷ niệm (sau ngày cưới)
  const da = $('#dlAll'); if (da) da.onclick = () => downloadAll(da);
  const wb = $('#wishBtn'); if (wb) wb.onclick = () => $('#wishSec').scrollIntoView({behavior:'smooth'});

  // Gift
  [$('#openGift'), $('#giftBtn')].forEach(b => b && (b.onclick = openGift));
}

/* Thẻ QR mừng cưới — dùng trong hộp mừng cưới và nhánh "Không tham dự" của RSVP */
function giftCards(){
  const card = (who, g) => !g || !g.acc ? '' : `<div class="gift-card card" style="color:#333;background:#fff8f8">
    <b style="font-family:var(--t-font),cursive;font-size:1.7rem;color:var(--t-accent);font-weight:400">Mừng cưới ${who}</b>
    ${g.qr ? `<img src="${esc(g.qr)}" alt="QR">` : `<div class="qr-box" data-bank="${esc(g.bank)}" data-acc="${esc(g.acc)}" data-owner="${esc(g.owner)}"></div>`}
    <div>${esc(g.bank)}</div><div class="acc">${esc(g.acc)}</div><div style="font-size:.85rem;opacity:.8">${esc(g.owner)}</div>
    <button type="button" class="t-btn" style="margin-top:10px;padding:8px 16px;font-size:.85rem" data-copy="${esc(g.acc)}">Sao chép số tài khoản</button></div>`;
  return card('chú rể', D.gift?.groom) + card('cô dâu', D.gift?.bride);
}
function openGift(){
  hearts(20);
  const m = TH.modal(`<div class="gift-grid">${giftCards()}</div>`);
  m.querySelector('.modal-box').style.cssText = 'max-width:420px;max-height:90vh;overflow:auto;--t-accent:' + getComputedStyle(document.body).getPropertyValue('--t-accent');
  mountGift(m);
}
function mountGift(m){
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
/* ?grp=…: chỉ hiện lịch trình của nhóm khách được mời */
const group = TH.applyGroup(D, P.get("grp"));
render();
if (!isPreview && P.get('id') && !P.has('owner')) TH.guestbook.view(id);   // ?owner=1: chủ thiệp xem trước, không tính lượt xem

// Nhận dữ liệu trực tiếp từ trình chỉnh sửa
let pvJump = null;
addEventListener('message', e => {
  if (e.origin !== location.origin) return;
  // Trình chỉnh sửa đổi tab → cuộn khung xem trước tới phần tương ứng
  if (e.data?.type === 'th-scroll') { pvJump = {sel:e.data.sel, at:Date.now()}; const el = $(e.data.sel); if (el) scrollTo({top: el.getBoundingClientRect().top + scrollY - 20, behavior:'smooth'}); return; }
  if (e.data?.type !== 'th-preview') return;
  const y = scrollY; D = e.data.data; render();
  // Vừa đổi tab (<1,5s) → giữ khung ở phần tương ứng; còn lại giữ nguyên vị trí người dùng đang xem
  const el = pvJump && Date.now() - pvJump.at < 1500 && $(pvJump.sel);
  scrollTo({top: el ? el.getBoundingClientRect().top + scrollY - 20 : y, behavior:'instant'});
  $$('.reveal').forEach(el => el.classList.add('in'));
});
if (isPreview) parent.postMessage({type:'th-ready'}, location.origin);
})();

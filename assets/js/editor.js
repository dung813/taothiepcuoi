/* ============ Trình chỉnh sửa thiệp ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
$('#logo').insertAdjacentHTML('afterbegin', TH.LOGO);

let id = P.get('id');
let D = id && TH.invites.get(id);
if (!D) { id = TH.uid(); D = TH.defaultInvite(P.get('tpl') || 'hong-pastel'); history.replaceState(null, '', '?id=' + id); }
D.events = D.events || []; D.photos = D.photos || []; D.story = D.story || []; D.gift = D.gift || {groom:{}, bride:{}};
let dirty = false;

/* ---------- Tiện ích đường dẫn "a.b.0.c" ---------- */
const getP = (o, p) => p.split('.').reduce((x,k) => x?.[k], o);
const setP = (o, p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((x,k) => x[k] ??= {}, o)[last] = v; };

const f = (label, path, type='text', extra='') => `<div class="field"><label>${label}</label>${
  type === 'textarea' ? `<textarea data-p="${path}" ${extra}>${esc(getP(D,path))}</textarea>`
  : `<input type="${type}" data-p="${path}" value="${esc(getP(D,path))}" ${extra}>`}</div>`;
const imgField = (label, path) => `<div class="field"><label>${label}</label><div class="upload">
  <input type="url" data-p="${path}" value="${esc((getP(D,path)||'').startsWith('data:') ? '' : getP(D,path)||'')}" placeholder="Dán link ảnh hoặc tải lên →">
  <label class="btn btn-outline btn-sm">Tải lên<input type="file" accept="image/*" hidden data-up="${path}"></label></div>
  ${getP(D,path) ? `<div class="img-prev" style="background-image:url('${esc(getP(D,path))}')"></div>` : ''}</div>`;

/* ---------- Ngày giờ: chuỗi "YYYY-MM-DDTHH:MM" theo giờ máy ---------- */
const pad = n => String(n).padStart(2, '0');
const toLocal = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
const shiftDays = (iso, days) => { const d = new Date(iso); if (isNaN(d)) return iso; d.setDate(d.getDate() + days); return toLocal(d); };
/* Buổi tiệc chính: sự kiện có chữ "tiệc", không có thì lấy sự kiện cuối */
const mainEvent = () => D.events.find(e => /tiệc/i.test(e.title || '')) || D.events[D.events.length - 1];

const BANKS = ['Vietcombank','VietinBank','BIDV','Agribank','Techcombank','MBBank','ACB','VPBank','TPBank','Sacombank','VIB','HDBank','SHB','OCB','MSB','SeABank','Eximbank','LPBank','NamABank','BacABank','PVcomBank','VietABank','ABBANK','KienLongBank','Cake','Timo'];
const ascii = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

/* ---------- Các tab của thanh công cụ ---------- */
const TABS = [
  {k:'tpl',    ic:'🎨', name:'Mẫu & Màu sắc',        go:'Chọn mẫu & màu sắc',        pv:'#hero'},
  {k:'couple', ic:'💑', name:'Thông tin cặp đôi',    go:'Nhập thông tin cặp đôi',    pv:'.couple'},
  {k:'time',   ic:'📍', name:'Thời gian & Địa điểm', go:'Chọn thời gian & địa điểm', pv:'.events'},
  {k:'photos', ic:'🖼', name:'Hình ảnh & Album',     go:'Tải ảnh cưới & album',      pv:'.album'},
  {k:'gift',   ic:'🎁', name:'Mừng cưới & Lời mời',  go:'Mừng cưới & lời mời',       pv:'#giftSec'},
  {k:'more',   ic:'✨', name:'Khác',                  go:'Tuỳ chọn khác',              pv:'.timeline'}
];
let tab = (() => { try { return sessionStorage.getItem('ed_tab') || 'tpl'; } catch { return 'tpl'; } })();
if (!TABS.some(x => x.k === tab)) tab = 'tpl';

const BODY = {
  tpl: () => { const t = TH.findTemplate(D.tpl); return `
    <p class="hint">Chọn giao diện cho thiệp — nội dung bạn đã nhập được giữ nguyên khi đổi mẫu.</p>
    <div class="tpl-pick">${TH.TEMPLATES.map(x=>`<button data-tpl="${x.id}" class="${x.id===D.tpl?'on':''}" title="${x.name}">${TH.miniTpl(x,{groom:'A',bride:'B'})}<small>${x.name}${x.tier==='premium'?' ★':''}</small></button>`).join('')}</div>
    <div class="row"><div class="field"><label>Màu nhấn</label><input type="color" data-p="accent" value="${D.accent || t.accent}"></div>
    <div class="field"><label>Phông chữ tiêu đề</label><select data-p="font">${['','Great Vibes','Dancing Script','Parisienne','Playfair Display'].map(x=>`<option value="${x}" ${x===D.font?'selected':''}>${x||'Theo mẫu ('+t.font+')'}</option>`).join('')}</select></div></div>
    <button class="btn btn-ghost btn-sm" data-act="resetColor" style="justify-self:start">↺ Dùng màu mặc định của mẫu</button>`; },

  couple: () => `
    <div class="card-box"><b class="box-h">🤵 Chú rể</b>
      <div class="row">${f('Tên gọi (hiện to trên thiệp)','groom.nick','text','placeholder="VD: Minh Khôi"')}${f('Họ tên đầy đủ','groom.name','text','placeholder="VD: Nguyễn Minh Khôi"')}</div>
      <div class="row">${f('Bố','groom.father','text','placeholder="Ông …"')}${f('Mẹ','groom.mother','text','placeholder="Bà …"')}</div></div>
    <div class="card-box"><b class="box-h">👰 Cô dâu</b>
      <div class="row">${f('Tên gọi (hiện to trên thiệp)','bride.nick','text','placeholder="VD: Thu Hà"')}${f('Họ tên đầy đủ','bride.name','text','placeholder="VD: Lê Thu Hà"')}</div>
      <div class="row">${f('Bố','bride.father','text','placeholder="Ông …"')}${f('Mẹ','bride.mother','text','placeholder="Bà …"')}</div></div>`,

  time: () => { const m = mainEvent(), dt = (m?.time || D.date || '');
    const others = D.events.map((e, i) => ({e, i})).filter(x => x.e !== m);
    return `
    <div class="card-box"><b class="box-h">🥂 Tiệc cưới chính</b>
      <div class="row"><div class="field"><label>Ngày cưới</label><input type="date" data-q="date" value="${esc(dt.slice(0,10))}"></div>
        <div class="field"><label>Giờ khai tiệc</label><input type="time" data-q="time" value="${esc(dt.slice(11,16))}"></div></div>
      <div class="field"><label>Tên trung tâm tiệc cưới / nhà hàng</label><input data-q="place" value="${esc(m?.place || '')}" placeholder="VD: Trung tâm Hội nghị White Palace"></div>
      <div class="field"><label>Sảnh tiệc</label><input data-q="hall" value="${esc(m?.hall || '')}" placeholder="VD: Sảnh Hoa Hồng · Tầng 2"></div>
      <div class="field"><label>Địa chỉ sảnh tiệc</label><input data-q="address" value="${esc(m?.address || '')}" placeholder="Số nhà, đường, quận, thành phố"></div>
      <div class="field"><label>Link Google Maps (tuỳ chọn)</label><input type="url" data-q="map" value="${esc(m?.map || '')}" placeholder="https://maps.app.goo.gl/…"></div>
      <p class="hint">Đổi ngày cưới sẽ tự dời các nghi lễ khác theo cùng số ngày.</p></div>
    <b class="box-h">Các nghi lễ khác</b>
    ${others.map(({e, i}) => `<div class="item"><button class="rm" data-rm="events.${i}" title="Xoá" aria-label="Xoá sự kiện">×</button>
      <div class="row">${f('Tên sự kiện',`events.${i}.title`)}${f('Thời gian',`events.${i}.time`,'datetime-local')}</div>
      ${f('Địa điểm',`events.${i}.place`)}${f('Địa chỉ',`events.${i}.address`)}</div>`).join('') || '<p class="hint">Chưa có nghi lễ nào khác.</p>'}
    <button class="btn btn-outline btn-sm" data-add="events" style="justify-self:start">+ Thêm nghi lễ (Vu Quy, Thành Hôn…)</button>`; },

  photos: () => `
    ${imgField('Ảnh cưới đại diện (ảnh bìa)','cover')}
    <div class="field"><label>Album ảnh cưới (${D.photos.length} ảnh)</label>
      <div class="thumbs">${D.photos.map((p,i)=>`<div style="background-image:url('${esc(p)}')" class="${p === D.cover ? 'is-cover' : ''}">
        <button data-rm="photos.${i}" title="Xoá ảnh" aria-label="Xoá ảnh">×</button><button class="set-cover" data-cover="${i}" title="Đặt làm ảnh bìa">★</button></div>`).join('')}</div></div>
    <label class="drop-up"><input type="file" accept="image/*" multiple hidden id="photoFiles"><b>📤 Tải ảnh album lên</b><small>Chọn nhiều ảnh cùng lúc · tự nén cho nhẹ</small></label>
    <div class="upload"><input type="url" id="photoUrl" placeholder="Hoặc dán link ảnh online"><button class="btn btn-outline btn-sm" data-act="addPhoto">Thêm</button></div>
    <p class="hint">Bấm ★ trên ảnh để đặt làm ảnh bìa. Ảnh tải lên được lưu trong trình duyệt; để chia sẻ sang máy khác, nên dùng link ảnh online (Google Photos, Imgur…).</p>`,

  gift: () => `
    <div class="card-box"><b class="box-h">💌 Lời mời</b>${f('Lời mời','message','textarea')}${f('Câu trích dẫn','quote')}</div>
    <datalist id="bankList">${BANKS.map(b => `<option value="${b}">`).join('')}</datalist>
    ${['groom','bride'].map(k => `<div class="card-box"><b class="box-h">🎁 Mừng cưới ${k==='groom'?'chú rể':'cô dâu'}</b>
      <div class="gift-row"><div class="gift-fields">
        <div class="field"><label>Ngân hàng</label><input data-p="gift.${k}.bank" list="bankList" value="${esc(D.gift[k]?.bank || '')}" placeholder="VD: Vietcombank"></div>
        <div class="field"><label>Số tài khoản</label><input data-p="gift.${k}.acc" inputmode="numeric" value="${esc(D.gift[k]?.acc || '')}"></div>
        <div class="field"><label>Chủ tài khoản <button class="link-btn" data-owner="${k}">Lấy từ họ tên</button></label><input data-p="gift.${k}.owner" value="${esc(D.gift[k]?.owner || '')}" placeholder="VIET HOA KHONG DAU"></div>
      </div><div class="qr-prev" data-qr="${k}" aria-label="Mã QR xem trước"></div></div>
      <details class="mini-acc"><summary>Dùng ảnh QR riêng của ngân hàng (tuỳ chọn)</summary>${imgField('Ảnh mã QR',`gift.${k}.qr`)}</details></div>`).join('')}
    <p class="hint">Mã QR được tạo tự động theo chuẩn VietQR từ ngân hàng + số tài khoản. Hãy quét thử bằng app ngân hàng trước khi gửi thiệp.</p>`,

  more: () => `
    <details class="mini-acc" open><summary>💕 Chuyện tình yêu</summary><div class="body">
      ${D.story.map((s,i)=>`<div class="item"><button class="rm" data-rm="story.${i}" aria-label="Xoá mốc">×</button>
        <div class="row">${f('Mốc thời gian',`story.${i}.date`)}${f('Tiêu đề',`story.${i}.title`)}</div>${f('Nội dung',`story.${i}.text`,'textarea','style="min-height:70px"')}</div>`).join('')}
      <button class="btn btn-outline btn-sm" data-add="story" style="justify-self:start">+ Thêm mốc</button></div></details>
    <details class="mini-acc"><summary>🎵 Nhạc nền</summary><div class="body">
      <div class="field"><label>Nguồn nhạc</label><select data-p="music.type">
        <option value="builtin" ${D.music.type==='builtin'?'selected':''}>Hộp nhạc có sẵn (miễn phí bản quyền)</option>
        <option value="url" ${D.music.type==='url'?'selected':''}>Link file nhạc (.mp3)</option>
        <option value="none" ${D.music.type==='none'?'selected':''}>Không dùng nhạc</option></select></div>
      ${D.music.type==='url' ? f('Link file .mp3','music.url','url','placeholder="https://.../bai-hat.mp3"') : ''}
      <p class="hint">Nhạc phát khi khách bấm “Mở thiệp”. Chỉ dùng bài hát bạn có quyền sử dụng.</p></div></details>
    <details class="mini-acc"><summary>⚙️ Bật / tắt mục</summary><div class="body"><div class="toggles">${[['envelope','Phong bì mở thiệp'],['countdown','Đếm ngược'],['calendar','Lịch tháng'],['story','Chuyện tình'],['album','Album ảnh'],['rsvp','Xác nhận tham dự'],['wishes','Sổ lời chúc'],['gift','Hộp mừng cưới'],['petals','Hoa rơi']]
      .map(([k,l])=>`<label><input type="checkbox" data-opt="${k}" ${D.opts[k]!==false?'checked':''}>${l}</label>`).join('')}</div></div></details>`
};

/* ---------- Dựng bảng điều khiển ---------- */
function build(){
  const i = TABS.findIndex(x => x.k === tab), next = TABS[i + 1];
  const y = $('#panel').scrollTop;
  $('#panel').innerHTML = `
    <nav class="ed-tabs" role="tablist" aria-label="Các mục chỉnh sửa">${TABS.map((x, n) => `<button role="tab" aria-selected="${x.k === tab}" data-tab-k="${x.k}" class="${x.k === tab ? 'on' : ''}${n < i ? ' done' : ''}"><i>${x.ic}</i><span>${x.name}</span></button>`).join('')}</nav>
    <section class="ed-pane" role="tabpanel" aria-label="${TABS[i].name}">
      <h2 class="pane-h"><span>Bước ${i + 1}/${TABS.length}</span>${TABS[i].ic} ${TABS[i].name}</h2>
      ${BODY[tab]()}
    </section>
    <footer class="step-nav" aria-label="Điều hướng các bước">
      <div class="step-bar" aria-hidden="true"><i style="width:${(i + 1) / TABS.length * 100}%"></i></div>
      <div class="step-btns">
        <button class="btn btn-outline btn-sm step-back" ${i ? `data-go="${TABS[i-1].k}"` : 'disabled aria-disabled="true"'} title="${i ? 'Về bước ' + i + ': ' + TABS[i-1].name : 'Đang ở bước đầu tiên'}">← Quay lại</button>
        ${next ? `<button class="btn btn-primary step-next" data-go="${next.k}">Tiếp tục: ${next.go} →</button>`
               : `<button class="btn btn-primary step-next" data-act="finish">✓ Hoàn tất &amp; Mở thiệp</button>`}
      </div>
    </footer>`;
  $('#panel').scrollTop = y;
  if (tab === 'gift') ['groom','bride'].forEach(drawQr);
}
function goTab(k){
  tab = k; try { sessionStorage.setItem('ed_tab', k); } catch {}
  build(); $('#panel').scrollTop = 0;
  scrollPreview();
}
const scrollPreview = () => $('#pv').contentWindow.postMessage({type:'th-scroll', sel: TABS.find(x => x.k === tab).pv}, location.origin);

/* QR mừng cưới xem trước ngay trong thanh công cụ */
const qrTimers = {};
function drawQr(k){
  const box = $(`[data-qr="${k}"]`); if (!box) return;
  const g = D.gift[k] || {};
  if (!g.bank || !g.acc) { box.innerHTML = '<span>Nhập ngân hàng &amp; số tài khoản để tạo mã QR</span>'; return; }
  const img = new Image(); img.alt = 'QR mừng cưới';
  img.src = `https://img.vietqr.io/image/${encodeURIComponent(g.bank.toLowerCase().replace(/\s+/g,''))}-${encodeURIComponent(g.acc)}-qr_only.png?accountName=${encodeURIComponent(g.owner || '')}`;
  img.onerror = () => { box.innerHTML = ''; if (window.QRCode) new QRCode(box, {text:`${g.bank} ${g.acc} ${g.owner || ''}`, width:120, height:120}); box.insertAdjacentHTML('beforeend', '<small>Chưa nhận diện được ngân hàng — dùng QR thông tin</small>'); };
  box.innerHTML = ''; box.append(img);
}

/* ---------- Đồng bộ xem trước (real-time) & lưu tự động ---------- */
let pvTimer;
const push = () => { clearTimeout(pvTimer); pvTimer = setTimeout(() => $('#pv').contentWindow.postMessage({type:'th-preview', data:D}, location.origin), 120); };
const touch = (rebuild) => { dirty = true; $('#saveState').textContent = 'Đang lưu…'; if (rebuild) build(); push(); autosave(); };
let saveTimer;
const autosave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 800); };
function save(){ clearTimeout(saveTimer); if (TH.invites.save(id, D)) { dirty = false; $('#saveState').textContent = '✓ Đã lưu ' + new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); } }
addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'th-ready') { push(); setTimeout(scrollPreview, 400); } });
addEventListener('beforeunload', () => { if (dirty) save(); });
addEventListener('pagehide', () => { if (dirty) save(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) save(); });

/* Ô nhập nhanh của tiệc chính */
function setQuick(key, val){
  let m = mainEvent();
  if (!m) { m = {title:'Tiệc Cưới', time:D.date, place:'', address:'', map:''}; D.events.push(m); }
  if (key === 'date' && val) {
    const old = (m.time || D.date || '').slice(0, 10), days = old ? Math.round((new Date(val) - new Date(old)) / 864e5) : 0;
    if (days) { D.events.forEach(e => e.time = shiftDays(e.time, days)); D.date = shiftDays(D.date, days); }
    else { m.time = val + (m.time || 'T17:30').slice(10); D.date = m.time; }
    return true;   // các nghi lễ khác đổi ngày → dựng lại danh sách
  }
  if (key === 'time' && val) { m.time = (m.time || D.date).slice(0, 10) + 'T' + val; D.date = m.time; return false; }
  m[key] = val; return false;
}

/* ---------- Sự kiện nhập liệu ---------- */
const panel = $('#panel');
panel.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.q) { if (el.type !== 'date') touch(setQuick(el.dataset.q, el.value)); return; }
  const p = el.dataset.p; if (!p) return;
  setP(D, p, el.value); touch(false);
  const qk = p.match(/^gift\.(groom|bride)\.(bank|acc|owner)$/);
  if (qk) { clearTimeout(qrTimers[qk[1]]); qrTimers[qk[1]] = setTimeout(() => drawQr(qk[1]), 500); }
});
panel.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.q === 'date') touch(setQuick('date', el.value));
  if (el.dataset.p === 'music.type') { setP(D, 'music.type', el.value); touch(true); }
  if (el.dataset.opt) { D.opts[el.dataset.opt] = el.checked; touch(false); }
  if (el.dataset.up && el.files[0]) TH.readImage(el.files[0]).then(url => { setP(D, el.dataset.up, url); touch(true); });
  if (el.id === 'photoFiles' && el.files.length) Promise.all([...el.files].map(fl => TH.readImage(fl, 1000, .75))).then(urls => {
    D.photos.push(...urls); if (!D.cover) D.cover = urls[0]; touch(true); TH.toast(`Đã thêm ${urls.length} ảnh`); });
});
panel.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tabK) return goTab(b.dataset.tabK);
  if (b.dataset.go) return goTab(b.dataset.go);
  if (b.dataset.tpl) {
    /* Nếu vẫn đang dùng ảnh mẫu của mẫu cũ thì đổi sang bộ ảnh của mẫu mới; ảnh riêng của người dùng được giữ nguyên */
    const oldSet = TH.findTemplate(D.tpl).photos || [], nt = TH.findTemplate(b.dataset.tpl);
    const isSample = D.photos.every(p => oldSet.includes(p)) && (!D.cover || oldSet.includes(D.cover));
    if (isSample && nt.photos) { D.photos = nt.photos.slice(); D.cover = nt.photos[0]; }
    D.tpl = b.dataset.tpl; D.accent = ''; touch(true); return;
  }
  if (b.dataset.cover != null) { D.cover = D.photos[+b.dataset.cover]; touch(true); TH.toast('Đã đặt làm ảnh bìa'); return; }
  if (b.dataset.rm) { const [arr, i] = b.dataset.rm.split('.'); const [gone] = D[arr].splice(+i, 1); if (arr === 'photos' && gone === D.cover) D.cover = D.photos[0] || ''; touch(true); return; }
  if (b.dataset.owner) { const k = b.dataset.owner; e.preventDefault();
    D.gift[k] = D.gift[k] || {}; D.gift[k].owner = ascii(D[k].name || D[k].nick).toUpperCase(); touch(true); return; }
  if (b.dataset.add === 'events') { D.events.unshift({title:'Lễ Vu Quy', time:shiftDays(D.date, -1), place:'Tư gia nhà gái', address:'', map:''}); touch(true); }
  if (b.dataset.add === 'story') { D.story.push({date:'', title:'', text:''}); touch(true); }
  if (b.dataset.act === 'resetColor') { D.accent = ''; touch(true); }
  if (b.dataset.act === 'addPhoto') { const u = $('#photoUrl').value.trim(); if (u) { D.photos.push(u); if (!D.cover) D.cover = u; touch(true); } }
  if (b.dataset.act === 'finish') { save(); TH.toast('Đã lưu thiệp 💕'); setTimeout(() => $('#btnView').click(), 400); }
});

/* ---------- Thanh công cụ ---------- */
$('#btnView').onclick = () => { save(); location.href = TH.inviteUrl(id, null); };
$('#btnShare').onclick = () => { save(); TH.shareDialog(id, D); };
/* Công tắc Điện thoại / Máy tính — nhớ lựa chọn; sau khi khung đổi kích thước thì cuộn lại đúng phần đang sửa */
const setDev = dev => {
  $$('[data-dev]').forEach(x => { const on = x.dataset.dev === dev; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
  $('#stage').classList.toggle('desktop', dev === 'desktop');
  try { localStorage.setItem('ed_dev', dev); } catch {}
  setTimeout(scrollPreview, 450);
};
$$('[data-dev]').forEach(b => b.onclick = () => setDev(b.dataset.dev));
try { if (localStorage.getItem('ed_dev') === 'desktop') setDev('desktop'); } catch {}
$$('[data-tab]').forEach(b => b.onclick = () => { $$('[data-tab]').forEach(x=>x.classList.toggle('active', x===b)); document.body.classList.toggle('show-preview', b.dataset.tab==='preview'); push(); setTimeout(scrollPreview, 300); });

build(); save();
})();

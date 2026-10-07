/* ============ Trình chỉnh sửa thiệp ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
$('#logo').insertAdjacentHTML('afterbegin', TH.LOGO);

let id = P.get('id');
let D = id && TH.invites.get(id);
if (!D) { id = TH.uid(); D = TH.defaultInvite(P.get('template') || P.get('tpl') || 'hong-pastel'); history.replaceState(null, '', '?id=' + id); }
D.events = D.events || []; D.photos = D.photos || []; D.story = D.story || []; D.gift = D.gift || {groom:{}, bride:{}};
D.ov = D.ov || {}; D.layers = D.layers || [];
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
    <div class="field"><label>Phông chữ tiêu đề</label>${fontSelect('data-p="font"', D.font, 'Theo mẫu (' + t.font + ')')}</div></div>
    <div class="field"><label>Phông chữ nội dung</label>${fontSelect('data-p="fontBody"', D.fontBody, 'Theo mẫu (Be Vietnam Pro)')}</div>
    <div class="font-sample" style="--fa:${esc(TH.fontStack(D.font || t.font))};--fb:${esc(D.fontBody ? TH.fontStack(D.fontBody) : 'var(--f-body)')}"><b>${esc(D.groom.nick)} &amp; ${esc(D.bride.nick)}</b><span>Trân trọng kính mời quý khách đến dự lễ cưới</span></div>
    <button class="btn btn-ghost btn-sm" data-act="resetColor" style="justify-self:start">↺ Dùng màu mặc định của mẫu</button>
    <p class="hint">💡 Muốn đổi phông, cỡ chữ, màu hay vị trí của <b>từng dòng chữ / từng ảnh</b>? Bấm thẳng vào nó trên thiệp bên cạnh.</p>`; },

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
    <details class="mini-acc" open><summary>🪄 Chỉnh sửa tự do</summary><div class="body">
      <p class="hint">${Object.keys(D.ov).length} phần tử đã chỉnh · ${D.layers.length} chữ/ảnh thêm · ${Object.values(D.ov).filter(o => o.hide).length} phần tử đang ẩn</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" data-act="unhideAll">👁 Hiện lại mọi phần đã ẩn</button>
      <button class="btn btn-ghost btn-sm" data-act="resetFree">↺ Xoá mọi chỉnh sửa tự do</button></div></div></details>
    <details class="mini-acc"><summary>⚙️ Bật / tắt mục</summary><div class="body"><div class="toggles">${[['envelope','Phong bì mở thiệp'],['countdown','Đếm ngược'],['calendar','Lịch tháng'],['story','Chuyện tình'],['album','Album ảnh'],['rsvp','Xác nhận tham dự'],['wishes','Sổ lời chúc'],['gift','Hộp mừng cưới'],['petals','Hoa rơi']]
      .map(([k,l])=>`<label><input type="checkbox" data-opt="${k}" ${D.opts[k]!==false?'checked':''}>${l}</label>`).join('')}</div></div></details>`
};

/* ---------- Dựng bảng điều khiển ---------- */
function build(){
  const i = TABS.findIndex(x => x.k === tab), next = TABS[i + 1];
  const y = $('#panel').scrollTop;
  if (sel) { $('#panel').innerHTML = `
    <nav class="ed-tabs" role="tablist" aria-label="Các mục chỉnh sửa">${TABS.map(x => `<button role="tab" aria-selected="false" data-tab-k="${x.k}"><i>${x.ic}</i><span>${x.name}</span></button>`).join('')}</nav>
    <section class="ed-pane sel-pane" aria-label="Phần tử đang chọn">${selPane()}</section>`;
    $('#panel').scrollTop = sel._keepScroll ? y : 0; sel._keepScroll = true; return; }
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
  if (sel) { sel = null; pvPost({type:'th-select', key:null}); }
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
const pvPost = m => $('#pv').contentWindow.postMessage(m, location.origin);
const push = () => { clearTimeout(pvTimer); pvTimer = setTimeout(() => pvPost({type:'th-preview', data:D}), 120); };
const touch = (rebuild, noPush) => { dirty = true; $('#saveState').textContent = 'Đang lưu…'; if (rebuild) build(); if (!noPush) push(); autosave(); recordSoon(); };
let saveTimer;
const autosave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 800); };
function save(){ clearTimeout(saveTimer); if (TH.invites.save(id, D)) { dirty = false; $('#saveState').textContent = '✓ Đã lưu ' + new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); } }
addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'th-ready') { pvPost({type:'th-mode', edit:liveEdit}); push(); setTimeout(scrollPreview, 400); } });
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
  if (el.dataset.s) return selInput(el);
  if (el.dataset.q) { if (el.type !== 'date') touch(setQuick(el.dataset.q, el.value)); return; }
  const p = el.dataset.p; if (!p) return;
  setP(D, p, el.value); touch(false);
  const qk = p.match(/^gift\.(groom|bride)\.(bank|acc|owner)$/);
  if (qk) { clearTimeout(qrTimers[qk[1]]); qrTimers[qk[1]] = setTimeout(() => drawQr(qk[1]), 500); }
});
panel.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.simg && el.files[0]) return TH.readImage(el.files[0], 1400, .82).then(url => selImage(url));
  if (el.dataset.s && el.type === 'number') { const v = isNaN(+el.value) || el.value === '' ? +$(`.rng input[type=range][data-s="${el.dataset.s}"]`, panel).value : +el.value;
    el.value = fmtNum(Math.min(+el.max, Math.max(+el.min, v))); return selInput(el); }
  if (el.dataset.q === 'date') touch(setQuick('date', el.value));
  if (el.dataset.p === 'music.type') { setP(D, 'music.type', el.value); touch(true); }
  if (el.dataset.opt) { D.opts[el.dataset.opt] = el.checked; touch(false); }
  if (el.dataset.up && el.files[0]) TH.readImage(el.files[0]).then(url => { setP(D, el.dataset.up, url); touch(true); });
  if (el.id === 'photoFiles' && el.files.length) Promise.all([...el.files].map(fl => TH.readImage(fl, 1000, .75))).then(urls => {
    D.photos.push(...urls); if (!D.cover) D.cover = urls[0]; touch(true); TH.toast(`Đã thêm ${urls.length} ảnh`); });
});
panel.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (sel && selClick(b)) return;
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
  if (b.dataset.act === 'unhideAll') { Object.entries(D.ov).forEach(([k, o]) => { delete o.hide; if (!Object.keys(o).length) delete D.ov[k]; }); touch(true); TH.toast('Đã hiện lại các phần đã ẩn'); }
  if (b.dataset.act === 'resetFree' && confirm('Xoá mọi chỉnh sửa tự do (vị trí, phông, màu, chữ/ảnh thêm…)? Thông tin cặp đôi vẫn được giữ.')) { D.ov = {}; D.layers = []; touch(true); }
  if (b.dataset.act === 'addPhoto') { const u = $('#photoUrl').value.trim(); if (u) { D.photos.push(u); if (!D.cover) D.cover = u; touch(true); } }
  if (b.dataset.act === 'finish') { save(); TH.toast('Đã lưu thiệp 💕'); setTimeout(() => $('#btnView').click(), 400); }
});

/* ====================== Chỉnh sửa tự do kiểu Canva ======================
   Khách bấm trực tiếp vào chữ / ảnh trong khung xem trước (xem thiep-edit.js);
   bảng bên trái chuyển sang "phần tử đang chọn" để đổi phông, cỡ, màu, ảnh, vị trí… */
const ALL_FONTS = TH.FONTS.flatMap(g => g[2]);
document.head.append(Object.assign(document.createElement('link'), {rel:'stylesheet', href:TH.fontsHref(ALL_FONTS)}));
function fontSelect(attr, cur, defLabel){
  return `<select ${attr}><option value="">${esc(defLabel)}</option>${TH.FONTS.map(([g, , list]) => `<optgroup label="${g}">${list.map(n => `<option value="${n}" ${n === cur ? 'selected' : ''}>${n}</option>`).join('')}</optgroup>`).join('')}</select>`;
}
let sel = null;   // thông tin phần tử đang chọn (do khung xem trước gửi sang)
const SWATCH = () => [...new Set([D.accent || TH.findTemplate(D.tpl).accent, '#ffffff', '#2b2326', '#c9a45c', '#b23a48', '#e8a0ae', '#6b4f3a', '#1f3a5f', '#2d7a43'])];
const KIND = {text:'✏️ Chữ', image:'🖼 Hình ảnh', box:'▢ Khối'};
const fmtNum = x => +(+x).toFixed(2);
/* Thang đo cho từng thanh chỉnh: [bước nhỏ, bước lớn] cho nút −/+ và các vạch số bên dưới */
const SCALE = {
  fs:[1, 5, [8, 20, 40, 60, 80, 100, 120, 140]],
  ls:[.01, .05, [-.1, 0, .1, .2, .3, .4, .5, .6]],
  lh:[.05, .2, [.8, 1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6]],
  'img.px':[1, 10, [0, 25, 50, 75, 100]], 'img.py':[1, 10, [0, 25, 50, 75, 100]],
  'img.br':[1, 10, [40, 60, 80, 100, 120, 140, 160]], 'img.rad':[1, 10, [0, 25, 50, 75, 100, 150, 200]],
  sc:[.05, .25, [.2, .5, 1, 1.5, 2, 2.5, 3]], rot:[1, 15, [-180, -135, -90, -45, 0, 45, 90, 135, 180]],
  op:[.05, .1, [.05, .25, .5, .75, 1]]
};
const sgn = x => (x > 0 ? '+' : '−') + fmtNum(Math.abs(x));
function scaleCtl(k, label, min, max, step, val, unit){
  const [sm, bg, ticks] = SCALE[k] || [step, step * 10, [min, max]];
  const pos = t => (t - min) / (max - min);
  const nb = d => `<button type="button" class="nudge" data-snudge="${k}" data-d="${d}" title="${d > 0 ? 'Tăng' : 'Giảm'} ${fmtNum(Math.abs(d))}${unit}">${sgn(d)}</button>`;
  return `<div class="rng">
    <div class="rng-top"><label for="rn-${k}">${label}</label><span class="rng-num"><input type="number" id="rn-${k}" data-s="${k}" min="${min}" max="${max}" step="${step}" value="${fmtNum(val)}" inputmode="decimal"><i>${unit}</i></span></div>
    <div class="rng-ctl">${nb(-bg)}${nb(-sm)}
      <div class="rng-track"><input type="range" data-s="${k}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}">
        <div class="rng-scale" aria-hidden="true">${ticks.map(t => `<button type="button" tabindex="-1" data-stick="${k}" data-val="${t}" style="--p:${pos(t)}">${fmtNum(t)}</button>`).join('')}</div></div>
      ${nb(sm)}${nb(bg)}</div></div>`;
}
/* Đặt giá trị cho một thanh chỉnh (dùng cho nút −/+ và vạch số) */
function setScale(k, v){
  const r = $(`.rng input[type=range][data-s="${k}"]`, panel); if (!r) return;
  r.value = Math.min(+r.max, Math.max(+r.min, +(+v).toFixed(3)));
  selInput(r);
}
/* Nhấn giữ nút −/+ để tăng / giảm liên tục */
let nudgeT = 0;
const stopNudge = () => { clearTimeout(nudgeT); nudgeT = 0; };
panel.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-snudge]'); if (!b || !sel) return;
  e.preventDefault(); stopNudge();
  const k = b.dataset.snudge, d = +b.dataset.d;
  const once = () => { const r = $(`.rng input[type=range][data-s="${k}"]`, panel); if (r) setScale(k, +r.value + d); };
  once();
  const rep = delay => nudgeT = setTimeout(() => { once(); rep(70); }, delay);
  rep(420);
});
['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(t => addEventListener(t, stopNudge));

function selPane(){
  const s = sel, o = s.o || {}, cs = s.cs || {}, v = (k, d) => o[k] ?? cs[k] ?? d;
  const im = s.img || s.under, io = im?.o || {};
  const rng = (k, label, min, max, step, val, unit = '') => scaleCtl(k, label, min, max, step, val, unit);
  const tog = (k, ic, t) => `<button type="button" class="tg ${v(k) ? 'on' : ''}" data-stog="${k}" title="${t}" aria-pressed="${!!v(k)}">${ic}</button>`;
  const al = a => `<button type="button" class="tg ${v('ta', 'center') === a ? 'on' : ''}" data-sset="ta" data-val="${a}" title="Căn ${{left:'trái', center:'giữa', right:'phải', justify:'đều'}[a]}">${{left:'⇤', center:'≡', right:'⇥', justify:'☰'}[a]}</button>`;
  const curFont = o.ff || cs.ff;
  return `
  <div class="sel-head"><div><span>${KIND[s.kind]}${s.section ? ' · ' + esc(s.section) : ''}</span><b>${esc(s.label)}</b></div>
    <button class="btn btn-primary btn-sm" data-sact="done">✓ Xong</button></div>
  <p class="hint">Kéo để di chuyển · kéo chấm tròn để xoay / đổi kích thước · bấm đúp để sửa chữ · phím mũi tên để dịch từng chút.</p>
  ${s.kind === 'text' ? `
  <div class="card-box"><b class="box-h">Nội dung</b>
    <textarea data-s="text" rows="${Math.min(6, Math.max(2, Math.ceil((s.text || '').length / 34)))}">${esc(s.text)}</textarea>
    ${s.bound ? '<p class="hint">Đồng bộ với thông tin thiệp — sửa ở đây thì mọi chỗ hiện nội dung này đều đổi theo.</p>' : ''}</div>
  <div class="card-box"><b class="box-h">Phông chữ <small class="cur-font" style="font-family:${esc(TH.fontStack(curFont))}">${esc(curFont)}</small></b>
    <div class="font-grid">${TH.FONTS.map(([g, , list]) => `<small class="fg-h">${g}</small>${list.map(n => `<button type="button" data-sfont="${n}" class="${n === o.ff ? 'on' : ''}" style="font-family:${esc(TH.fontStack(n))}" title="${n}"><b>Aa</b><span>${n}</span></button>`).join('')}`).join('')}</div>
    ${o.ff ? '<button type="button" class="link-btn" data-sclear="ff" style="justify-self:start;float:none">↺ Dùng phông của mẫu</button>' : ''}</div>
  <div class="card-box"><b class="box-h">Kiểu chữ</b>
    ${rng('fs', 'Cỡ chữ', 8, 140, 1, v('fs', 16), 'px')}
    <div class="sw-row"><input type="color" data-s="color" value="${esc(v('color', '#333333'))}" title="Chọn màu bất kỳ">${SWATCH().map(c => `<button type="button" class="sw" data-scolor="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
    <div class="tg-row">${tog('b', '<b>B</b>', 'In đậm')}${tog('i', '<i>I</i>', 'In nghiêng')}${tog('u', '<u>U</u>', 'Gạch chân')}${tog('tt', 'AA', 'Viết hoa')}<span class="sep"></span>${['left', 'center', 'right', 'justify'].map(al).join('')}</div>
    ${rng('ls', 'Giãn chữ', -.1, .6, .01, fmtNum(v('ls', 0)), 'em')}
    ${rng('lh', 'Giãn dòng', .8, 2.6, .05, fmtNum(v('lh', 1.4)))}
    <div class="field"><label>Đổ bóng chữ</label><select data-s="sh">${[['', 'Không'], ['soft', 'Nhẹ'], ['strong', 'Đậm (dễ đọc trên ảnh)'], ['glow', 'Phát sáng trắng']].map(([k, n]) => `<option value="${k}" ${(o.sh || '') === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
  </div>` : ''}
  ${im ? `
  <div class="card-box"><b class="box-h">${s.img ? 'Ảnh' : 'Ảnh phía sau'}${im.bimg === 'cover' ? ' bìa' : ''}</b>
    <div class="img-prev" style="background-image:url('${esc(im.src)}');background-position:${io.px ?? 50}% ${io.py ?? 50}%"></div>
    <div class="upload"><label class="btn btn-primary btn-sm" style="flex:1;justify-content:center">📤 Tải ảnh khác lên<input type="file" accept="image/*" hidden data-simg="1"></label></div>
    <div class="upload"><input type="url" id="selImgUrl" placeholder="Hoặc dán link ảnh online"><button type="button" class="btn btn-outline btn-sm" data-sact="imgUrl">Dùng</button></div>
    ${D.photos.length ? `<small class="hint">Hoặc chọn từ album:</small><div class="thumbs pick">${D.photos.map((p, i) => `<button type="button" data-spick="${i}" style="background-image:url('${esc(p)}')" aria-label="Dùng ảnh ${i + 1}"></button>`).join('')}</div>` : ''}
    ${rng('img.px', 'Căn khung ngang', 0, 100, 1, io.px ?? 50, '%')}
    ${rng('img.py', 'Căn khung dọc', 0, 100, 1, io.py ?? 50, '%')}
    ${rng('img.br', 'Độ sáng', 40, 160, 1, io.br ?? 100, '%')}
    ${rng('img.rad', 'Bo góc', 0, 200, 1, io.rad ?? 0, 'px')}
    ${io.img ? '<button type="button" class="link-btn" data-sact="imgOrig" style="justify-self:start;float:none">↺ Dùng lại ảnh gốc</button>' : ''}
  </div>` : ''}
  <div class="card-box"><b class="box-h">Bố cục</b>
    ${rng('sc', 'Kích thước', .2, 3, .05, o.sc ?? 1, '×')}
    ${rng('rot', 'Xoay', -180, 180, 1, o.rot ?? 0, '°')}
    ${rng('op', 'Độ trong suốt', .05, 1, .05, o.op ?? 1)}
    <div class="btn-row">
      <button type="button" class="btn btn-outline btn-sm" data-sact="center" ${o.dx || o.dy || o.rot || (o.sc && o.sc !== 1) ? '' : 'disabled'}>⌖ Về vị trí gốc</button>
      ${s.layer ? `<button type="button" class="btn btn-outline btn-sm" data-sact="dup">⧉ Nhân bản</button><button type="button" class="btn btn-outline btn-sm danger" data-sact="del">🗑 Xoá</button>`
               : `<button type="button" class="btn btn-outline btn-sm" data-sact="hide">${o.hide ? '👁 Hiện lại' : '🚫 Ẩn đi'}</button>`}
      ${Object.keys(o).length ? '<button type="button" class="btn btn-ghost btn-sm" data-sact="reset">↺ Khôi phục mặc định</button>' : ''}
    </div></div>`;
}

/* Ghi một thay đổi thuộc tính → áp ngay vào khung xem trước, không dựng lại cả thiệp */
function setOv(key, patch){
  const o = {...(D.ov[key] || {})};
  Object.entries(patch).forEach(([k, v]) => v == null || v === '' ? delete o[k] : o[k] = v);
  Object.keys(o).length ? D.ov[key] = o : delete D.ov[key];
  pvPost({type:'th-ov-set', key, o:D.ov[key] || null});
  if (sel) [sel, sel.img, sel.under].forEach(x => { if (x?.key === key) x.o = D.ov[key] || {}; });
  touch(false, true);
}
const DEFAULTS = {sc:1, rot:0, op:1, 'img.br':100};
function selInput(el){
  const k = el.dataset.s;
  let raw = el.value;
  if (el.type === 'number') {          // ô số: bỏ qua khi đang gõ dở (VD: "-" hoặc trống), giới hạn trong khoảng cho phép
    if (raw === '' || isNaN(+raw)) return;
    raw = String(Math.min(+el.max, Math.max(+el.min, +raw)));
  }
  $$(`.rng [data-s="${k}"]`, panel).forEach(x => { if (x !== el) x.value = x.type === 'number' ? fmtNum(raw) : raw; });
  if (k === 'text') {
    if (sel.bound) { setP(D, sel.bound, raw); sel.text = raw; touch(false); }
    else if (sel.layer) { const l = D.layers.find(x => 'L:' + x.id === sel.key); if (l) { l.text = raw; touch(false); } }
    else setOv(sel.key, {text: raw});
    return;
  }
  if (k.startsWith('img.')) { const im = sel.img || sel.under, p = k.slice(4), val = +raw;
    if (p === 'px' || p === 'py') { const prev = $('.sel-pane .img-prev'); if (prev) prev.style.backgroundPosition = `${p === 'px' ? val : im.o?.px ?? 50}% ${p === 'py' ? val : im.o?.py ?? 50}%`; }
    return setOv(im.key, {[p]: val === DEFAULTS[k] ? null : val}); }
  if (k === 'color' || k === 'sh') return setOv(sel.key, {[k]: raw});
  const val = +raw;
  setOv(sel.key, {[k]: val === DEFAULTS[k] ? null : val});
}
function selImage(url){
  const im = sel?.img || sel?.under; if (!im) return;
  if (im.bimg) {
    const old = getP(D, im.bimg);
    setP(D, im.bimg, url);
    if (im.bimg.startsWith('photos.') && old === D.cover) D.cover = url;   // ảnh bìa trùng ảnh album → đổi theo
    im.src = url; touch(true);
  } else if (im.key.startsWith('L:')) { const l = D.layers.find(x => 'L:' + x.id === im.key); if (l) { l.img = url; im.src = url; touch(true); } }
  else { setOv(im.key, {img:url}); im.src = url; build(); }
  TH.toast('Đã đổi ảnh');
}
function selClick(b){
  const d = b.dataset;
  if (d.sfont) { setOv(sel.key, {ff: d.sfont}); $$('[data-sfont]', panel).forEach(x => x.classList.toggle('on', x === b));
    const cf = $('.cur-font', panel); if (cf) { cf.textContent = d.sfont; cf.style.fontFamily = TH.fontStack(d.sfont); } return true; }
  if (d.sclear) { setOv(sel.key, {[d.sclear]: null}); build(); return true; }
  if (d.scolor) { setOv(sel.key, {color: d.scolor}); const c = $('[data-s="color"]', panel); if (c) c.value = d.scolor; return true; }
  if (d.stog) { const cur = sel.o?.[d.stog] ?? sel.cs?.[d.stog]; setOv(sel.key, {[d.stog]: cur ? 0 : 1}); build(); return true; }
  if (d.sset) { setOv(sel.key, {[d.sset]: d.val}); build(); return true; }
  if (d.spick != null) { selImage(D.photos[+d.spick]); return true; }
  if (d.snudge) return true;   // đã xử lý ở pointerdown
  if (d.stick) { setScale(d.stick, d.val); return true; }
  const a = d.sact; if (!a) return false;
  if (a === 'done') { sel = null; pvPost({type:'th-select', key:null}); build(); if (matchMedia('(max-width:640px)').matches) $('[data-tab="preview"]').click(); }
  if (a === 'imgUrl') { const u = $('#selImgUrl').value.trim(); if (u) selImage(u); }
  if (a === 'imgOrig') { const im = sel.img || sel.under; setOv(im.key, {img:null}); build(); }
  if (a === 'center') { setOv(sel.key, {dx:null, dy:null, rot:null, sc:null}); build(); }
  if (a === 'hide') { setOv(sel.key, {hide: sel.o?.hide ? null : 1}); build(); }
  if (a === 'reset') { delete D.ov[sel.key]; sel.o = {}; pvPost({type:'th-ov-set', key:sel.key, o:null}); touch(true, true); }
  if (a === 'del' || a === 'dup') {
    const i = D.layers.findIndex(x => 'L:' + x.id === sel.key); if (i < 0) return true;
    if (a === 'del') { D.layers.splice(i, 1); delete D.ov[sel.key]; sel = null; touch(true); }
    else { const n = {...D.layers[i], id:TH.uid(), y:D.layers[i].y + 40}; D.layers.push(n);
      if (D.ov[sel.key]) D.ov['L:' + n.id] = {...D.ov[sel.key]};
      pvPost({type:'th-want', key:'L:' + n.id}); touch(false); }
  }
  return true;
}

/* ---------- Thêm chữ / ảnh mới ---------- */
const pending = {};
function addLayer(kind, img){
  const req = TH.uid(); pending[req] = {kind, img};
  if (matchMedia('(max-width:640px)').matches) $('[data-tab="preview"]').click();
  pvPost({type:'th-place', req});
}

/* ---------- Hoàn tác / làm lại ---------- */
const hist = {stack:[], i:-1};
function record(){
  const s = JSON.stringify(D);
  if (hist.stack[hist.i] === s) return;
  hist.stack = hist.stack.slice(0, hist.i + 1); hist.stack.push(s);
  if (hist.stack.length > 40) hist.stack.shift();
  hist.i = hist.stack.length - 1; updUndo();
}
let recTimer;
function recordSoon(){ clearTimeout(recTimer); recTimer = setTimeout(record, 400); }
function stepHist(dir){
  clearTimeout(recTimer); record();
  const n = hist.i + dir; if (n < 0 || n >= hist.stack.length) return;
  hist.i = n; D = JSON.parse(hist.stack[n]);
  sel = null; dirty = true; build(); push(); autosave(); updUndo();
  TH.toast(dir < 0 ? '↶ Đã hoàn tác' : '↷ Đã làm lại');
}
function updUndo(){ $('#undoBtn').disabled = hist.i <= 0; $('#redoBtn').disabled = hist.i >= hist.stack.length - 1; }
$('#undoBtn').onclick = () => stepHist(-1);
$('#redoBtn').onclick = () => stepHist(1);
addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey) || e.target.matches('input,textarea,select')) return;
  const k = e.key.toLowerCase();
  if (k === 'z') { e.preventDefault(); stepHist(e.shiftKey ? 1 : -1); }
  if (k === 'y') { e.preventDefault(); stepHist(1); }
});

/* ---------- Nhận tin từ khung xem trước ---------- */
addEventListener('message', e => {
  if (e.origin !== location.origin) return;
  const m = e.data || {};
  if (m.type === 'th-sel') {
    const prev = sel; sel = m.info;
    if (!sel) { if (prev) build(); return; }
    if (prev?.key === sel.key) sel._keepScroll = true;
    // Đang gõ / kéo thanh trượt trong bảng thì không dựng lại (tránh mất con trỏ)
    const ae = document.activeElement;
    if (prev?.key === sel.key && panel.contains(ae) && ae.matches('input,textarea,select')) return;
    build();
  }
  if (m.type === 'th-ov') { m.o ? D.ov[m.key] = m.o : delete D.ov[m.key]; if (sel?.key === m.key) sel.o = m.o || {}; touch(false, true); }
  if (m.type === 'th-bind') {
    const old = getP(D, m.path); setP(D, m.path, m.value);
    if (m.path.startsWith('photos.') && old === D.cover) D.cover = m.value;
    touch(!sel);
  }
  if (m.type === 'th-layer') {
    const i = D.layers.findIndex(x => x.id === m.id); if (i < 0) return;
    if (m.remove) { D.layers.splice(i, 1); delete D.ov['L:' + m.id]; sel = null; touch(true); }
    else { Object.assign(D.layers[i], m.patch); touch(false); }
  }
  if (m.type === 'th-placed' && pending[m.req]) {
    const {kind, img} = pending[m.req]; delete pending[m.req];
    const l = {id:TH.uid(), sec:m.sec, kind, x:m.x, y:m.y, ...(kind === 'img' ? {img} : {text:'Nhập chữ của bạn'})};
    D.layers.push(l);
    pvPost({type:'th-want', key:'L:' + l.id, edit: kind === 'text'});
    touch(false);
  }
  if (m.type === 'th-panel' && matchMedia('(max-width:640px)').matches) $('[data-tab="edit"]').click();
  if (m.type === 'th-undo') stepHist(-1);
  if (m.type === 'th-redo') stepHist(1);
});

/* ---------- Thanh "Sửa trực tiếp" trên khung xem trước ---------- */
let liveEdit = (() => { try { return localStorage.getItem('ed_live') !== '0'; } catch { return true; } })();
function setLive(on){
  liveEdit = on;
  $$('[data-mode]').forEach(b => { const x = (b.dataset.mode === 'edit') === on; b.classList.toggle('on', x); b.setAttribute('aria-pressed', x); });
  if (!on && sel) { sel = null; build(); }
  try { localStorage.setItem('ed_live', on ? '1' : '0'); } catch {}
  pvPost({type:'th-mode', edit:on});
}
$$('[data-mode]').forEach(b => b.onclick = () => setLive(b.dataset.mode === 'edit'));
$('#addText').onclick = () => { if (!liveEdit) setLive(true); addLayer('text'); };
$('#addImg').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  if (!liveEdit) setLive(true);
  TH.readImage(f, 900, .85).then(url => addLayer('img', url)); };
setLive(liveEdit);
if (!TH.store.get('liveHint')) { TH.store.set('liveHint', 1); setTimeout(() => TH.toast('Mẹo: bấm vào chữ hoặc ảnh trên thiệp để chỉnh sửa trực tiếp ✨'), 1200); }

/* ---------- Thanh công cụ ---------- */
$('#btnView').onclick = () => { save(); location.href = TH.inviteUrl(id, null); };
$('#btnShare').onclick = () => { save(); TH.shareDialog(id, D); };
/* Công tắc Điện thoại / Máy tính — nhớ lựa chọn; sau khi khung đổi kích thước thì cuộn lại đúng phần đang sửa */
/* Máy tính: iframe rộng 1280px (màn hình thật) rồi thu nhỏ vừa khung laptop */
const DESKTOP_W = 1280;
function fitPreview(){
  const ph = $('#stage .phone'), fr = $('#pv');
  if (!$('#stage').classList.contains('desktop')) { fr.style.removeProperty('--pv-scale'); fr.style.height = ''; return; }
  const cs = getComputedStyle(ph);
  const w = ph.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const h = ph.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const s = Math.min(1, w / DESKTOP_W);
  fr.style.setProperty('--pv-scale', s);
  fr.style.height = Math.round(h / s) + 'px';
}
new ResizeObserver(fitPreview).observe($('#stage .phone'));
const setDev = dev => {
  $$('[data-dev]').forEach(x => { const on = x.dataset.dev === dev; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on); });
  $('#stage').classList.toggle('desktop', dev === 'desktop');
  fitPreview();
  try { localStorage.setItem('ed_dev', dev); } catch {}
  setTimeout(() => { fitPreview(); scrollPreview(); }, 450);
};
$$('[data-dev]').forEach(b => b.onclick = () => setDev(b.dataset.dev));
try { if (localStorage.getItem('ed_dev') === 'desktop') setDev('desktop'); } catch {}
$$('[data-tab]').forEach(b => b.onclick = () => { $$('[data-tab]').forEach(x=>x.classList.toggle('active', x===b)); document.body.classList.toggle('show-preview', b.dataset.tab==='preview'); push(); setTimeout(scrollPreview, 300); });

build(); save(); record();
})();

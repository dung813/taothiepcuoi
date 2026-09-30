/* ============ Trình chỉnh sửa thiệp ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
$('#logo').insertAdjacentHTML('afterbegin', TH.LOGO);

let id = P.get('id');
let D = id && TH.invites.get(id);
if (!D) { id = TH.uid(); D = TH.defaultInvite(P.get('tpl') || 'hong-pastel'); history.replaceState(null, '', '?id=' + id); }
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
  ${getP(D,path) ? `<div style="height:80px;border-radius:10px;background:#eee url('${esc(getP(D,path))}') center/cover"></div>` : ''}</div>`;

/* ---------- Dựng bảng điều khiển ---------- */
function build(){
  const t = TH.findTemplate(D.tpl);
  const openSet = new Set($$('.acc[open]').map(d => d.dataset.k));
  if (!openSet.size) openSet.add('tpl');
  const sec = (k, title, body) => `<details class="acc" data-k="${k}" ${openSet.has(k)?'open':''}><summary>${title}</summary><div class="body">${body}</div></details>`;

  $('#panel').innerHTML =
  sec('tpl','🎨 Mẫu thiệp & màu sắc', `
    <div class="tpl-pick">${TH.TEMPLATES.map(x=>`<button data-tpl="${x.id}" class="${x.id===D.tpl?'on':''}" title="${x.name}">${TH.miniTpl(x,{groom:'A',bride:'B'})}<small>${x.name}${x.tier==='premium'?' ★':''}</small></button>`).join('')}</div>
    <div class="row"><div class="field"><label>Màu nhấn</label><input type="color" data-p="accent" value="${D.accent || t.accent}"></div>
    <div class="field"><label>Phông chữ tiêu đề</label><select data-p="font">${['','Great Vibes','Dancing Script','Parisienne','Playfair Display'].map(x=>`<option value="${x}" ${x===D.font?'selected':''}>${x||'Theo mẫu ('+t.font+')'}</option>`).join('')}</select></div></div>
    <button class="btn btn-ghost btn-sm" data-act="resetColor" style="justify-self:start">↺ Dùng màu mặc định của mẫu</button>`) +

  sec('couple','💑 Cô dâu & chú rể', `
    <b>Chú rể</b><div class="row">${f('Tên gọi','groom.nick')}${f('Họ tên đầy đủ','groom.name')}</div>
    <div class="row">${f('Bố','groom.father')}${f('Mẹ','groom.mother')}</div>
    <b>Cô dâu</b><div class="row">${f('Tên gọi','bride.nick')}${f('Họ tên đầy đủ','bride.name')}</div>
    <div class="row">${f('Bố','bride.father')}${f('Mẹ','bride.mother')}</div>`) +

  sec('time','💌 Ngày cưới & lời mời', `
    ${f('Ngày giờ cưới (dùng cho đếm ngược)','date','datetime-local')}
    ${f('Lời mời','message','textarea')}
    ${f('Câu trích dẫn','quote')}`) +

  sec('events','📍 Sự kiện & địa điểm', `
    ${D.events.map((e,i)=>`<div class="item"><button class="rm" data-rm="events.${i}" title="Xoá">×</button>
      <div class="row">${f('Tên sự kiện',`events.${i}.title`)}${f('Thời gian',`events.${i}.time`,'datetime-local')}</div>
      ${f('Địa điểm',`events.${i}.place`)}${f('Địa chỉ',`events.${i}.address`)}
      ${f('Link Google Maps (tuỳ chọn)',`events.${i}.map`,'url')}</div>`).join('')}
    <button class="btn btn-outline btn-sm" data-add="events">+ Thêm sự kiện</button>`) +

  sec('photos','🖼 Ảnh cưới', `
    ${imgField('Ảnh bìa','cover')}
    <div class="field"><label>Album (${D.photos.length} ảnh)</label>
      <div class="thumbs">${D.photos.map((p,i)=>`<div style="background-image:url('${esc(p)}')"><button data-rm="photos.${i}">×</button></div>`).join('')}</div></div>
    <div class="upload"><input type="url" id="photoUrl" placeholder="Dán link ảnh"><button class="btn btn-outline btn-sm" data-act="addPhoto">Thêm</button>
      <label class="btn btn-primary btn-sm">Tải nhiều ảnh<input type="file" accept="image/*" multiple hidden id="photoFiles"></label></div>
    <p class="hint">Ảnh tải lên được nén và lưu trong trình duyệt. Để chia sẻ thiệp sang máy khác, nên dùng link ảnh online (Google Photos, Imgur…).</p>`) +

  sec('story','💕 Chuyện tình yêu', `
    ${D.story.map((s,i)=>`<div class="item"><button class="rm" data-rm="story.${i}">×</button>
      <div class="row">${f('Mốc thời gian',`story.${i}.date`)}${f('Tiêu đề',`story.${i}.title`)}</div>${f('Nội dung',`story.${i}.text`,'textarea','style="min-height:70px"')}</div>`).join('')}
    <button class="btn btn-outline btn-sm" data-add="story">+ Thêm mốc</button>`) +

  sec('music','🎵 Nhạc nền', `
    <div class="field"><label>Nguồn nhạc</label><select data-p="music.type">
      <option value="builtin" ${D.music.type==='builtin'?'selected':''}>Hộp nhạc có sẵn (miễn phí bản quyền)</option>
      <option value="url" ${D.music.type==='url'?'selected':''}>Link file nhạc (.mp3)</option>
      <option value="none" ${D.music.type==='none'?'selected':''}>Không dùng nhạc</option></select></div>
    ${D.music.type==='url' ? f('Link file .mp3','music.url','url','placeholder="https://.../bai-hat.mp3"') : ''}
    <p class="hint">Nhạc phát khi khách bấm “Mở thiệp”. Chỉ dùng bài hát bạn có quyền sử dụng.</p>`) +

  sec('gift','🎁 Hộp mừng cưới', ['groom','bride'].map(k=>`<b>${k==='groom'?'Chú rể':'Cô dâu'}</b>
    <div class="row">${f('Ngân hàng',`gift.${k}.bank`)}${f('Số tài khoản',`gift.${k}.acc`)}</div>
    ${f('Chủ tài khoản',`gift.${k}.owner`)}${imgField('Ảnh mã QR (tuỳ chọn — để trống sẽ tự tạo)',`gift.${k}.qr`)}`).join('<hr style="border:none;border-top:1px dashed var(--line)">')) +

  sec('opts','⚙️ Bật / tắt mục', `<div class="toggles">${[['envelope','Phong bì mở thiệp'],['countdown','Đếm ngược'],['calendar','Lịch tháng'],['story','Chuyện tình'],['album','Album ảnh'],['rsvp','Xác nhận tham dự'],['wishes','Sổ lời chúc'],['gift','Hộp mừng cưới'],['petals','Hoa rơi']]
    .map(([k,l])=>`<label><input type="checkbox" data-opt="${k}" ${D.opts[k]!==false?'checked':''}>${l}</label>`).join('')}</div>`);
}

/* ---------- Đồng bộ xem trước ---------- */
let pvTimer;
const push = () => { clearTimeout(pvTimer); pvTimer = setTimeout(() => $('#pv').contentWindow.postMessage({type:'th-preview', data:D}, location.origin), 150); };
const touch = (rebuild) => { dirty = true; $('#saveState').textContent = 'Có thay đổi chưa lưu'; if (rebuild) build(); push(); autosave(); };
let saveTimer;
const autosave = () => { clearTimeout(saveTimer); saveTimer = setTimeout(save, 1200); };
function save(){ if (TH.invites.save(id, D)) { dirty = false; $('#saveState').textContent = '✓ Đã lưu ' + new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); } }
addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'th-ready') push(); });
addEventListener('beforeunload', e => { if (dirty) { save(); } });

/* ---------- Sự kiện nhập liệu ---------- */
const panel = $('#panel');
panel.addEventListener('input', e => {
  const p = e.target.dataset.p; if (!p) return;
  setP(D, p, e.target.value); touch(false);
});
panel.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.p === 'music.type') { setP(D, 'music.type', el.value); touch(true); }
  if (el.dataset.opt) { D.opts[el.dataset.opt] = el.checked; touch(false); }
  if (el.dataset.up && el.files[0]) TH.readImage(el.files[0]).then(url => { setP(D, el.dataset.up, url); touch(true); });
  if (el.id === 'photoFiles') Promise.all([...el.files].map(fl => TH.readImage(fl, 1000, .75))).then(urls => { D.photos.push(...urls); touch(true); TH.toast(`Đã thêm ${urls.length} ảnh`); });
});
panel.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.tpl) { D.tpl = b.dataset.tpl; D.accent = ''; touch(true); return; }
  if (b.dataset.rm) { const [arr, i] = b.dataset.rm.split('.'); D[arr].splice(+i, 1); touch(true); return; }
  if (b.dataset.add === 'events') { D.events.push({title:'Sự kiện mới', time:D.date, place:'', address:'', map:''}); touch(true); }
  if (b.dataset.add === 'story') { D.story.push({date:'', title:'', text:''}); touch(true); }
  if (b.dataset.act === 'resetColor') { D.accent = ''; touch(true); }
  if (b.dataset.act === 'addPhoto') { const u = $('#photoUrl').value.trim(); if (u) { D.photos.push(u); touch(true); } }
});

/* ---------- Thanh công cụ ---------- */
$('#btnView').onclick = () => { save(); open(TH.inviteUrl(id, null), '_blank'); };
$('#btnShare').onclick = () => { save(); TH.shareDialog(id, D); };
$$('[data-dev]').forEach(b => b.onclick = () => { $$('[data-dev]').forEach(x=>x.classList.toggle('active', x===b)); $('#stage').classList.toggle('desktop', b.dataset.dev==='desktop'); });
$$('[data-tab]').forEach(b => b.onclick = () => { $$('[data-tab]').forEach(x=>x.classList.toggle('active', x===b)); document.body.classList.toggle('show-preview', b.dataset.tab==='preview'); push(); });



build(); save();
})();

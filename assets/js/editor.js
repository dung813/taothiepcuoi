/* ============ Trình chỉnh sửa thiệp — bố cục kiểu Canva / Cinelove ============
   Trái : thanh biểu tượng → ngăn kéo (Thông tin, Văn bản, Hình ảnh, Trang trí, Hình dạng, Nền, Âm nhạc, Tiện ích, Mẫu, Hiệu ứng)
   Giữa : thiệp (iframe thiep.html?preview=1) — bấm trực tiếp để chọn / kéo / xoay / sửa chữ (xem thiep-edit.js),
          thu phóng, dải "Thay ảnh nhanh"
   Phải : bảng "Tuỳ chỉnh" của phần tử đang chọn (Kiểu chữ, Ảnh, Khoảng đệm, Đường viền, Đổ bóng, Vị trí, Hiệu ứng) */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const P = new URLSearchParams(location.search);
$('#logo').insertAdjacentHTML('afterbegin', TH.LOGO);

let id = P.get('id');
let D = id && TH.invites.get(id);
if (!D) { id = TH.uid(); D = TH.defaultInvite(P.get('template') || P.get('tpl') || 'hong-pastel'); history.replaceState(null, '', '?id=' + id); }
const normalize = () => {
  D.events = D.events || []; D.photos = D.photos || []; D.story = D.story || []; D.gift = D.gift || {groom:{}, bride:{}};
  D.ov = D.ov || {}; D.layers = D.layers || []; D.opts = D.opts || {}; D.music = D.music || {type:'builtin', url:''}; D.bg = D.bg || {};
};
normalize();
let dirty = false;
const isMobile = () => matchMedia('(max-width:900px)').matches;

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

/* ---------- Phông chữ: tải sẵn cả thư viện để xem trước trong danh sách ---------- */
const ALL_FONTS = TH.FONTS.flatMap(g => g[2]);
document.head.append(Object.assign(document.createElement('link'), {rel:'stylesheet', href:TH.fontsHref(ALL_FONTS)}));
const fontDD = (target, cur, def) => `<div class="fdd"><button type="button" class="fdd-btn" data-fdd="${target}" style="font-family:${esc(cur ? TH.fontStack(cur) : 'inherit')}">
  <span>${esc(cur || def)}</span><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></button></div>`;

/* ---------- Biểu tượng ---------- */
const SVG = p => `<svg viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC = {
  info:SVG('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
  text:SVG('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  photos:SVG('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
  stock:SVG('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/><path d="M19 3v4M17 5h4"/>'),
  shape:SVG('<circle cx="7.5" cy="7.5" r="3.5"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M17 4l3.5 6h-7zM4 20l16-16" stroke-dasharray="0"/>'),
  bg:SVG('<path d="M4 20L20 4M4 14L14 4M10 20L20 10M4 8l4-4M16 20l4-4"/>'),
  music:SVG('<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'),
  widgets:SVG('<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15l2 2 4-4"/>'),
  tpl:SVG('<rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/>'),
  fx:SVG('<path d="M4 20L16 8M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1zM19 11l.7 1.3 1.3.7-1.3.7L19 15l-.7-1.3L17 13l1.3-.7z"/>'),
  close:SVG('<path d="M6 6l12 12M18 6L6 18"/>'),
  dup:SVG('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  lock:SVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  unlock:SVG('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/>'),
  front:SVG('<rect x="8" y="8" width="12" height="12" rx="1.5" fill="currentColor" fill-opacity=".25"/><path d="M4 16V5a1 1 0 0 1 1-1h11"/>'),
  back:SVG('<rect x="4" y="4" width="12" height="12" rx="1.5"/><path d="M20 8v11a1 1 0 0 1-1 1H8" /><rect x="10" y="10" width="8" height="8" fill="currentColor" fill-opacity=".25" stroke="none"/>'),
  hide:SVG('<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 5 9 7a10 10 0 0 1-2.2 3.2M6.1 6.1C4 7.5 3 9.7 3 12c0 2 4 7 9 7 1.6 0 3-.4 4.3-1"/>'),
  show:SVG('<path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"/><circle cx="12" cy="12" r="3"/>'),
  del:SVG('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  reset:SVG('<path d="M4 4v6h6"/><path d="M20 12a8 8 0 0 0-14.9-4L4 10"/>'),
  play:SVG('<path d="M7 4l13 8-13 8z"/>'),
  flip:SVG('<path d="M12 3v18M8 7L3 12l5 5V7zM16 7l5 5-5 5V7z"/>'),
  center:SVG('<circle cx="12" cy="12" r="3"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>'),
  pen:SVG('<path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/>'),
  upload:SVG('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
  chevron:SVG('<path d="M9 6l6 6-6 6"/>')
};

/* ======================== NGĂN KÉO BÊN TRÁI ======================== */
const RAIL = [
  {k:'info',    name:'Thông tin'}, {k:'text', name:'Văn bản'}, {k:'photos', name:'Hình ảnh'}, {k:'stock', name:'Trang trí'},
  {k:'shape',   name:'Hình dạng'}, {k:'bg',   name:'Nền'},     {k:'music',  name:'Âm nhạc'},  {k:'widgets', name:'Tiện ích'},
  {k:'tpl',     name:'Mẫu'},       {k:'fx',   name:'Hiệu ứng'}
];
let drawer = (() => { try { return sessionStorage.getItem('ed_drawer') ?? 'info'; } catch { return 'info'; } })();
if (isMobile()) drawer = '';

const TEXT_ADD = [
  {cls:'h1', label:'Thêm tiêu đề', text:'Tiêu đề', o:{ff:'Great Vibes', fs:48}},
  {cls:'h2', label:'Thêm tiêu đề phụ', text:'TIÊU ĐỀ PHỤ', o:{ff:'Playfair Display', fs:20, ls:.2, tt:1}},
  {cls:'p',  label:'Thêm đoạn văn', text:'Nhập nội dung của bạn', o:{ff:'Be Vietnam Pro', fs:15}}
];
const COMBOS = [
  {text:'Save the Date', o:{ff:'Great Vibes', fs:46}}, {text:'WE ARE GETTING MARRIED', o:{ff:'Montserrat', fs:12, ls:.32}},
  {text:'Thank you', o:{ff:'Allura', fs:52}}, {text:'Trân trọng kính mời', o:{ff:'Charm', fs:30}},
  {text:'Our Wedding Day', o:{ff:'Corinthia', fs:56}}, {text:'囍', o:{fs:84, color:'#c0262d', b:1}},
  {text:'Mr & Mrs', o:{ff:'Playfair Display', fs:34, i:1}}, {text:'Forever & Always', o:{ff:'Dancing Script', fs:36}},
  {text:'Hẹn gặp bạn tại tiệc cưới!', o:{ff:'Quicksand', fs:17, b:1}}, {text:'Ngày chung đôi', o:{ff:'Ephesis', fs:46}},
  {text:'LOVE', o:{ff:'Bungee', fs:42, ls:.12}}, {text:'Happy Wedding', o:{ff:'Pacifico', fs:32}}
];
const EMOJI = ['💍','💐','🌸','🌹','🌷','🕊️','💒','🥂','❤️','💕','💌','🎀','✨','🌿','🍃','🦋','🔔','🎉','👰','🤵','💑','🌙','⭐','🍾'];
const SHAPE_LIST = [['rect','Chữ nhật'],['round','Bo góc'],['circle','Tròn'],['ring','Vòng tròn'],['line','Đường kẻ'],['arch','Cửa vòm'],['heart','Trái tim'],['star','Ngôi sao'],['tri','Tam giác'],['diamond','Hình thoi'],['hex','Lục giác']];
const BG_COLORS = ['#ffffff','#fffaf5','#fdf3f4','#fbeae6','#f6efe6','#f4ead8','#eef3ee','#eaf1f8','#f3eef8','#e9e4df','#2b2326','#1f2a3a'];
const BG_GRAD = ['linear-gradient(180deg,#ffffff,#fde8ee)', 'linear-gradient(160deg,#fdfbf7,#f3e7d3)', 'linear-gradient(180deg,#eef5f0,#ffffff)',
  'linear-gradient(160deg,#f6f0ff,#fff3f6)', 'radial-gradient(circle at 30% 20%,#ffffff,#f4e4d8)', 'linear-gradient(180deg,#fff7ec,#fbe3e8 60%,#e9e3f5)',
  'linear-gradient(135deg,#e8f1f8,#fdf6ee)', 'linear-gradient(180deg,#1f2a3a,#3b2f4a)'];
const WIDGETS = [['envelope','💌','Phong bì mở thiệp','Khách bấm mở phong bì trước khi xem thiệp'], ['countdown','⏳','Đếm ngược','Đếm ngày – giờ – phút đến ngày cưới'],
  ['calendar','📅','Lịch tháng','Lịch có đánh dấu ngày cưới'], ['story','💕','Chuyện tình yêu','Dòng thời gian các kỷ niệm'], ['album','🖼','Album ảnh','Lưới ảnh cưới, bấm để phóng to'],
  ['rsvp','✅','Xác nhận tham dự','Khách báo số người, ăn chay, dị ứng'], ['wishes','💬','Sổ lời chúc','Khách gửi lời chúc, ảnh, bắn tim'], ['gift','🎁','Hộp mừng cưới','Mã QR chuyển khoản cho cô dâu, chú rể'],
  ['petals','🌸','Hoa rơi','Cánh hoa rơi nhẹ trên nền thiệp']];
const ANIMS = [['','Không'],['fade','Hiện dần'],['up','Trượt lên'],['down','Trượt xuống'],['left','Từ trái'],['right','Từ phải'],['zoom','Phóng to'],['pop','Nảy'],
  ['spin','Xoay vào'],['blur','Mờ → rõ'],['flip','Lật'],['float','Bồng bềnh ∞'],['pulse','Nhịp tim ∞'],['swing','Đung đưa ∞'],['shine','Lấp lánh ∞']];

const DRAWERS = {
  info: () => `
    <details class="acc" data-pv=".sec-couple" open><summary>💑 Cặp đôi &amp; gia đình</summary><div class="body">${INFO.couple()}</div></details>
    <details class="acc" data-pv=".sec-events"><summary>📍 Thời gian &amp; địa điểm</summary><div class="body">${INFO.time()}</div></details>
    <details class="acc" data-pv="#giftSec"><summary>💌 Lời mời &amp; mừng cưới</summary><div class="body">${INFO.gift()}</div></details>
    <details class="acc" data-pv=".sec-story"><summary>💕 Chuyện tình yêu</summary><div class="body">${INFO.story()}</div></details>`,

  text: () => `
    <p class="hint">Chữ mới được đặt vào phần thiệp đang xem. Kích đúp vào chữ trên thiệp để sửa.</p>
    ${TEXT_ADD.map((t, i) => `<button type="button" class="add-text ${t.cls}" data-addtext="${i}">${t.label}</button>`).join('')}
    <h4 class="dr-h">Bộ chữ phối sẵn</h4>
    <div class="combo-grid">${COMBOS.map((c, i) => `<button type="button" data-combo="${i}" style="font-family:${esc(c.o.ff ? TH.fontStack(c.o.ff) : 'inherit')};${c.o.color ? 'color:' + c.o.color + ';' : ''}${c.o.tt ? 'text-transform:uppercase;' : ''}${c.o.ls ? 'letter-spacing:' + c.o.ls + 'em;' : ''}${c.o.b ? 'font-weight:700;' : ''}${c.o.i ? 'font-style:italic;' : ''}font-size:${Math.min(30, Math.max(11, c.o.fs * .5))}px">${esc(c.text)}</button>`).join('')}</div>`,

  photos: () => `
    <label class="drop-up"><input type="file" accept="image/*" multiple hidden id="photoFiles">${IC.upload}<b>Tải ảnh lên</b><small>Chọn nhiều ảnh cùng lúc · tự nén cho nhẹ</small></label>
    <div class="upload"><input type="url" id="photoUrl" placeholder="Hoặc dán link ảnh online"><button class="btn btn-outline btn-sm" data-act="addPhoto">Thêm</button></div>
    <h4 class="dr-h">Album ảnh cưới (${D.photos.length})</h4>
    <div class="ph-grid">${D.photos.map((p, i) => `<div class="ph ${p === D.cover ? 'is-cover' : ''}" style="background-image:url('${esc(p)}')">
      <div class="ph-acts"><button data-cover="${i}" title="Đặt làm ảnh bìa">★</button><button data-addimg="${i}" title="Đưa ảnh vào thiệp như một ảnh tự do">＋</button><button data-rm="photos.${i}" title="Xoá khỏi album">×</button></div>
      ${p === D.cover ? '<em>Ảnh bìa</em>' : ''}</div>`).join('')}</div>
    <p class="hint">★ đặt làm ảnh bìa · ＋ thêm ảnh tự do lên thiệp (kéo, xoay, bo góc được). Ảnh tải lên được lưu trong trình duyệt; để khách xem trên máy khác, nên dùng link ảnh online.</p>`,

  stock: () => `
    <h4 class="dr-h">Hoạ tiết (đổi màu được)</h4>
    <div class="deco-grid">${Object.keys(TH.EK_DECO).map(k => `<button type="button" data-deco="${k}" title="${TH.EK_DECO[k].name}" style="color:${esc(accent())}">${TH.EK_DECO[k].svg}</button>`).join('')}</div>
    <h4 class="dr-h">Biểu tượng cảm xúc</h4>
    <div class="emoji-grid">${EMOJI.map(e => `<button type="button" data-emoji="${e}">${e}</button>`).join('')}</div>`,

  shape: () => `
    <p class="hint">Hình dạng dùng làm khung, mảng màu nền chữ hay điểm nhấn. Đổi màu, viền, bo góc ở bảng Tuỳ chỉnh.</p>
    <div class="shape-grid">${SHAPE_LIST.map(([k, n]) => `<button type="button" data-shape="${k}" title="${n}"><i class="sp sp-${k}" style="${TH.EK_SHAPES[k] ? 'clip-path:' + TH.EK_SHAPES[k] : ''}"></i><small>${n}</small></button>`).join('')}</div>`,

  bg: () => `
    <h4 class="dr-h">Màu nền</h4>
    <div class="bg-grid">${BG_COLORS.map(c => `<button type="button" data-bgc="${c}" class="${D.bg.c === c && !D.bg.g && !D.bg.img ? 'on' : ''}" style="background:${c}" title="${c}"></button>`).join('')}
      <label class="bg-pick" title="Chọn màu bất kỳ"><input type="color" data-bgpick value="${esc(D.bg.c || TH.findTemplate(D.tpl).bg || '#ffffff')}">＋</label></div>
    <h4 class="dr-h">Dải màu</h4>
    <div class="bg-grid grad">${BG_GRAD.map(g => `<button type="button" data-bgg="${esc(g)}" class="${D.bg.g === g ? 'on' : ''}" style="background:${esc(g)}"></button>`).join('')}</div>
    <h4 class="dr-h">Ảnh nền</h4>
    ${D.bg.img ? `<div class="img-prev" style="background-image:url('${esc(D.bg.img)}')"></div>` : ''}
    <label class="btn btn-outline btn-sm" style="justify-content:center">${IC.upload} Tải ảnh nền lên<input type="file" accept="image/*" hidden data-bgup></label>
    <button type="button" class="btn btn-ghost btn-sm" data-act="bgReset">↺ Dùng nền mặc định của mẫu</button>
    <p class="hint">Muốn tô nền riêng cho một phần (VD: khối lời mời)? Bấm vào phần đó trên thiệp → mục <b>Kiểu chữ › Màu nền</b> hoặc <b>Đường viền</b>.</p>`,

  music: () => `
    <div class="field"><label>Nguồn nhạc</label><select data-p="music.type">
      <option value="builtin" ${D.music.type==='builtin'?'selected':''}>🎼 Hộp nhạc có sẵn (miễn phí bản quyền)</option>
      <option value="url" ${D.music.type==='url'?'selected':''}>🔗 Link file nhạc (.mp3)</option>
      <option value="none" ${D.music.type==='none'?'selected':''}>🔇 Không dùng nhạc</option></select></div>
    ${D.music.type==='url' ? f('Link file .mp3','music.url','url','placeholder="https://.../bai-hat.mp3"') : ''}
    <p class="hint">Nhạc phát khi khách bấm “Mở thiệp”. Khách có thể bật / tắt bằng nút 🎵 ở góc thiệp. Chỉ dùng bài hát bạn có quyền sử dụng.</p>`,

  widgets: () => `<div class="wg-list">${WIDGETS.map(([k, ic, n, d]) => `<label class="wg"><i>${ic}</i><span><b>${n}</b><small>${d}</small></span>
    <input type="checkbox" class="sw-in" data-opt="${k}" ${D.opts[k] !== false ? 'checked' : ''}></label>`).join('')}</div>`,

  tpl: () => { const t = TH.findTemplate(D.tpl); return `
    <p class="hint">Đổi mẫu giữ nguyên nội dung bạn đã nhập.</p>
    <div class="tpl-pick">${TH.TEMPLATES.map(x=>`<button data-tpl="${x.id}" class="${x.id===D.tpl?'on':''}" title="${x.name}">${TH.miniTpl(x,{groom:'A',bride:'B'})}<small>${x.name}${x.tier==='premium'?' ★':''}</small></button>`).join('')}</div>
    <h4 class="dr-h">Màu chủ đạo</h4>
    <div class="sw-row"><input type="color" data-p="accent" value="${D.accent || t.accent}">${['#c8506a','#b23a48','#c9a45c','#8a6d4b','#6a8a5a','#3f6e8c','#6b5ca5','#2b2326'].map(c => `<button type="button" class="sw" data-accent="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
    <button class="btn btn-ghost btn-sm" data-act="resetColor" style="justify-self:start">↺ Màu mặc định của mẫu</button>`; },

  fx: () => `
    <div class="wg-list">${[['petals','🌸','Hoa rơi','Cánh hoa rơi nhẹ khi khách xem thiệp'],['envelope','💌','Mở phong bì','Hiệu ứng mở phong bì, tim bay khi vào thiệp']]
      .map(([k, ic, n, d]) => `<label class="wg"><i>${ic}</i><span><b>${n}</b><small>${d}</small></span><input type="checkbox" class="sw-in" data-opt="${k}" ${D.opts[k] !== false ? 'checked' : ''}></label>`).join('')}</div>
    <h4 class="dr-h">Hiệu ứng xuất hiện</h4>
    ${sel ? animCtl() : '<p class="hint">👆 Bấm chọn một chữ / ảnh trên thiệp để gắn hiệu ứng xuất hiện khi khách cuộn tới.</p>'}`
};

const INFO = {
  couple: () => `
    <div class="card-box"><b class="box-h">🤵 Chú rể</b>
      ${f('Tên gọi (hiện to trên thiệp)','groom.nick','text','placeholder="VD: Minh Khôi"')}${f('Họ tên đầy đủ','groom.name','text','placeholder="VD: Nguyễn Minh Khôi"')}
      <div class="row">${f('Bố','groom.father','text','placeholder="Ông …"')}${f('Mẹ','groom.mother','text','placeholder="Bà …"')}</div></div>
    <div class="card-box"><b class="box-h">👰 Cô dâu</b>
      ${f('Tên gọi (hiện to trên thiệp)','bride.nick','text','placeholder="VD: Thu Hà"')}${f('Họ tên đầy đủ','bride.name','text','placeholder="VD: Lê Thu Hà"')}
      <div class="row">${f('Bố','bride.father','text','placeholder="Ông …"')}${f('Mẹ','bride.mother','text','placeholder="Bà …"')}</div></div>`,

  time: () => { const m = mainEvent(), dt = (m?.time || D.date || '');
    const others = D.events.map((e, i) => ({e, i})).filter(x => x.e !== m);
    return `
    <div class="card-box"><b class="box-h">🥂 Tiệc cưới chính</b>
      <div class="row"><div class="field"><label>Ngày cưới</label><input type="date" data-q="date" value="${esc(dt.slice(0,10))}"></div>
        <div class="field"><label>Giờ khai tiệc</label><input type="time" data-q="time" value="${esc(dt.slice(11,16))}"></div></div>
      <div class="field"><label>Trung tâm tiệc cưới / nhà hàng</label><input data-q="place" value="${esc(m?.place || '')}" placeholder="VD: White Palace"></div>
      <div class="field"><label>Sảnh tiệc</label><input data-q="hall" value="${esc(m?.hall || '')}" placeholder="VD: Sảnh Hoa Hồng · Tầng 2"></div>
      <div class="field"><label>Địa chỉ</label><input data-q="address" value="${esc(m?.address || '')}" placeholder="Số nhà, đường, quận, thành phố"></div>
      <div class="field"><label>Link Google Maps (tuỳ chọn)</label><input type="url" data-q="map" value="${esc(m?.map || '')}" placeholder="https://maps.app.goo.gl/…"></div>
      <p class="hint">Đổi ngày cưới sẽ tự dời các nghi lễ khác theo cùng số ngày.</p></div>
    ${others.map(({e, i}) => `<div class="item"><button class="rm" data-rm="events.${i}" title="Xoá" aria-label="Xoá sự kiện">×</button>
      ${f('Tên nghi lễ',`events.${i}.title`)}${f('Thời gian',`events.${i}.time`,'datetime-local')}
      ${f('Địa điểm',`events.${i}.place`)}${f('Địa chỉ',`events.${i}.address`)}</div>`).join('')}
    <button class="btn btn-outline btn-sm" data-add="events" style="justify-self:start">+ Thêm nghi lễ (Vu Quy, Thành Hôn…)</button>`; },

  gift: () => `
    ${f('Lời mời','message','textarea')}${f('Câu trích dẫn','quote')}
    <datalist id="bankList">${BANKS.map(b => `<option value="${b}">`).join('')}</datalist>
    ${['groom','bride'].map(k => `<div class="card-box"><b class="box-h">🎁 Mừng cưới ${k==='groom'?'chú rể':'cô dâu'}</b>
      <div class="gift-row"><div class="gift-fields">
        <div class="field"><label>Ngân hàng</label><input data-p="gift.${k}.bank" list="bankList" value="${esc(D.gift[k]?.bank || '')}" placeholder="VD: Vietcombank"></div>
        <div class="field"><label>Số tài khoản</label><input data-p="gift.${k}.acc" inputmode="numeric" value="${esc(D.gift[k]?.acc || '')}"></div>
        <div class="field"><label>Chủ tài khoản <button class="link-btn" data-owner="${k}">Lấy từ họ tên</button></label><input data-p="gift.${k}.owner" value="${esc(D.gift[k]?.owner || '')}" placeholder="VIET HOA KHONG DAU"></div>
      </div><div class="qr-prev" data-qr="${k}" aria-label="Mã QR xem trước"></div></div>
      <details class="mini-acc"><summary>Dùng ảnh QR riêng (tuỳ chọn)</summary>${imgField('Ảnh mã QR',`gift.${k}.qr`)}</details></div>`).join('')}
    <p class="hint">Mã QR tạo tự động theo chuẩn VietQR. Hãy quét thử bằng app ngân hàng trước khi gửi thiệp.</p>`,

  story: () => `
    ${D.story.map((s,i)=>`<div class="item"><button class="rm" data-rm="story.${i}" aria-label="Xoá mốc">×</button>
      <div class="row">${f('Mốc thời gian',`story.${i}.date`)}${f('Tiêu đề',`story.${i}.title`)}</div>${f('Nội dung',`story.${i}.text`,'textarea','style="min-height:70px"')}</div>`).join('')}
    <button class="btn btn-outline btn-sm" data-add="story" style="justify-self:start">+ Thêm mốc</button>`
};

function buildRail(){
  $('#rail').innerHTML = RAIL.map(x => `<button type="button" data-dr="${x.k}" class="${x.k === drawer ? 'on' : ''}" aria-pressed="${x.k === drawer}">${IC[x.k]}<span>${x.name}</span></button>`).join('');
}
let drBuiltAt = 0;   // mục mở sẵn khi dựng lại cũng phát sự kiện toggle → bỏ qua, chỉ cuộn khi người dùng tự mở
function buildDrawer(){
  const dr = $('#drawer'), x = RAIL.find(r => r.k === drawer);
  document.body.classList.toggle('drawer-open', !!x);
  if (!x) { dr.innerHTML = ''; return; }
  const y = $('.dr-body', dr)?.dataset.k === drawer ? $('.dr-body', dr).scrollTop : 0;
  const open = $$('.dr-body details[open]', dr).map(d => d.dataset.pv);
  dr.innerHTML = `<div class="dr-head"><b>${IC[x.k]}${x.name}</b><button type="button" class="ic-btn" data-act="closeDrawer" aria-label="Đóng">${IC.close}</button></div>
    <div class="dr-body" data-k="${drawer}">${DRAWERS[drawer]()}</div>`;
  const body = $('.dr-body', dr);
  if (open.length && drawer === 'info') $$('details', body).forEach(d => d.open = open.includes(d.dataset.pv));
  body.scrollTop = y;
  drBuiltAt = Date.now();
  ['groom','bride'].forEach(drawQr);
}
function openDrawer(k){
  drawer = drawer === k ? '' : k;
  try { sessionStorage.setItem('ed_drawer', drawer); } catch {}
  if (drawer) closeProps();
  buildRail(); buildDrawer();
}

/* QR mừng cưới xem trước */
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

/* ======================== BẢNG TUỲ CHỈNH BÊN PHẢI ======================== */
let sel = null;   // thông tin phần tử đang chọn (do khung xem trước gửi sang)
const accent = () => D.accent || TH.findTemplate(D.tpl).accent;
const SWATCH = () => [...new Set([accent(), '#ffffff', '#000000', '#2b2326', '#c9a45c', '#b23a48', '#e8a0ae', '#6b4f3a', '#1f3a5f', '#2d7a43'])];
const KIND = {text:'Chữ', image:'Hình ảnh', box:'Khối', shape:'Hình dạng', deco:'Hoạ tiết'};
const FILTERS = [['','Gốc',''],['warm','Ấm áp','sepia(.25) saturate(1.2) hue-rotate(-8deg)'],['cool','Mát','saturate(.9) hue-rotate(12deg) brightness(1.03)'],
  ['vintage','Cổ điển','sepia(.55) contrast(.9) brightness(1.05)'],['bw','Đen trắng','grayscale(1)'],['dreamy','Mơ màng','brightness(1.08) saturate(.85) contrast(.9)'],
  ['vivid','Rực rỡ','saturate(1.45) contrast(1.08)'],['fade','Phai màu','contrast(.8) brightness(1.1) saturate(.8)']];
const fmtNum = x => +(+x).toFixed(2);
const FS_LIST = [8,10,12,14,16,18,20,24,28,32,36,40,48,56,64,72,96,120];

/* Thang đo: [bước nhỏ, bước lớn (khi nhấn giữ), vạch số] */
const SCALE = {
  fs:[1, 5, [8, 20, 40, 60, 80, 100, 120, 140]],
  ls:[.01, .05, [-.1, 0, .2, .4, .6]], lh:[.05, .2, [.8, 1.2, 1.6, 2, 2.6]], pad:[1, 5, [0, 10, 20, 30, 40, 60]],
  'img.px':[1, 10, [0, 25, 50, 75, 100]], 'img.py':[1, 10, [0, 25, 50, 75, 100]],
  'img.br':[1, 10, [40, 70, 100, 130, 160]], 'img.ct':[1, 10, [50, 75, 100, 125, 150]], 'img.sat':[1, 10, [0, 50, 100, 150, 200]],
  rad:[1, 10, [0, 25, 50, 100, 150, 200]], bw:[1, 2, [0, 2, 4, 6, 8, 10, 12]],
  shb:[1, 5, [0, 10, 20, 30, 40]], shx:[1, 5, [-20, -10, 0, 10, 20]], shy:[1, 5, [-20, -10, 0, 10, 20]],
  sc:[.05, .25, [.2, .5, 1, 1.5, 2, 2.5, 3]], rot:[1, 15, [-180, -90, 0, 90, 180]], op:[.05, .1, [0, .25, .5, .75, 1]],
  dx:[1, 10, [-300, -150, 0, 150, 300]], dy:[1, 10, [-600, -300, 0, 300, 600]], w:[1, 10, [20, 100, 200, 300, 400]], h:[1, 10, [2, 100, 200, 300, 400]],
  ad:[.1, .5, [0, 1, 2, 3]], adur:[.1, .5, [.3, 1, 2, 3, 4]]
};
const DEFAULTS = {sc:1, rot:0, op:1, 'img.br':100, 'img.ct':100, 'img.sat':100, dx:0, dy:0, ad:0, adur:1};
function scaleCtl(k, label, min, max, step, val, unit = '', list = ''){
  const [sm, , ticks] = SCALE[k] || [step, step * 10, [min, max]];
  const pos = t => (t - min) / (max - min);
  return `<div class="rng">
    <div class="rng-top"><label for="rn-${k}">${label}</label>
      <div class="stepper"><button type="button" class="nudge" data-snudge="${k}" data-d="-1" title="Giảm ${fmtNum(sm)} · nhấn giữ để giảm nhanh">−</button>
        <input type="number" id="rn-${k}" data-s="${k}" min="${min}" max="${max}" step="${step}" value="${fmtNum(val)}" inputmode="decimal" ${list ? `list="${list}"` : ''}>
        <button type="button" class="nudge" data-snudge="${k}" data-d="1" title="Tăng ${fmtNum(sm)} · nhấn giữ để tăng nhanh">+</button>${unit ? `<i class="unit">${unit}</i>` : ''}</div></div>
    <div class="rng-track"><input type="range" data-s="${k}" min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${label}">
      <div class="rng-scale" aria-hidden="true">${ticks.map(t => `<button type="button" tabindex="-1" data-stick="${k}" data-val="${t}" style="--p:${pos(t)}">${fmtNum(t)}</button>`).join('')}</div></div></div>`;
}
const colorCtl = (k, label, val, clearable) => `<div class="clr"><span>${label}</span>
  <label class="clr-sw" style="--c:${esc(val || 'transparent')}"><input type="color" data-s="${k}" value="${esc(val || '#ffffff')}"></label>
  ${clearable && val ? `<button type="button" class="link-btn" data-sclear="${k}">Bỏ</button>` : ''}</div>`;

function animCtl(){
  const o = sel.o || {};
  return `<div class="anim-grid">${ANIMS.map(([k, n]) => `<button type="button" data-sanim="${k}" class="${(o.anim || '') === k ? 'on' : ''}"><i class="ap ap-${k || 'none'}">Aa</i><span>${n}</span></button>`).join('')}</div>
    ${o.anim ? `${scaleCtl('ad', 'Trễ', 0, 3, .1, o.ad ?? 0, 'giây')}${scaleCtl('adur', 'Thời lượng', .3, 4, .1, o.adur ?? 1, 'giây')}
    <button type="button" class="btn btn-outline btn-sm" data-sact="play">${IC.play} Xem lại hiệu ứng</button>` : ''}`;
}

let openSecs = new Set(['content', 'type', 'img', 'fill', 'g-type', 'g-free']);
const sec = (k, title, body) => `<details class="acc" data-sec="${k}" ${openSecs.has(k) ? 'open' : ''}><summary>${title}</summary><div class="body">${body}</div></details>`;

function propsPane(){
  const s = sel, o = s.o || {}, cs = s.cs || {}, v = (k, d) => o[k] ?? cs[k] ?? d;
  const im = s.img || s.under, io = im?.o || {};
  const tog = (k, ic, t) => `<button type="button" class="tg ${v(k) ? 'on' : ''}" data-stog="${k}" title="${t}" aria-pressed="${!!v(k)}">${ic}</button>`;
  const AL = {left:'<path d="M4 6h16M4 10h10M4 14h16M4 18h10"/>', center:'<path d="M4 6h16M7 10h10M4 14h16M7 18h10"/>', right:'<path d="M4 6h16M10 10h10M4 14h16M10 18h10"/>', justify:'<path d="M4 6h16M4 10h16M4 14h16M4 18h16"/>'};
  const al = a => `<button type="button" class="tg ${v('ta', 'center') === a ? 'on' : ''}" data-sset="ta" data-val="${a}" title="Căn ${{left:'trái', center:'giữa', right:'phải', justify:'đều'}[a]}">${SVG(AL[a])}</button>`;
  const act = (a, ic, t, cls = '') => `<button type="button" class="pa ${cls}" data-sact="${a}" title="${t}">${IC[ic]}<span>${t}</span></button>`;
  const text = s.kind === 'text', isBox = s.kind === 'box';
  return `
  <div class="props-head"><div class="ph-t"><small>${KIND[s.kind]}${s.section ? ' · ' + esc(s.section) : ''}</small><b>${esc(s.label)}</b></div>
    <button type="button" class="btn btn-primary btn-sm" data-sact="done">Xong</button></div>
  <div class="pa-row">
    ${s.kind !== 'box' ? act('dup', 'dup', 'Nhân bản') : ''}
    ${act('lock', o.lock ? 'lock' : 'unlock', o.lock ? 'Mở khoá' : 'Khoá', o.lock ? 'on' : '')}
    ${act('front', 'front', 'Lên trên')}${act('back', 'back', 'Xuống dưới')}
    ${s.layer ? act('del', 'del', 'Xoá', 'danger') : act('hide', o.hide ? 'show' : 'hide', o.hide ? 'Hiện' : 'Ẩn')}
    ${Object.keys(o).length && !s.layer ? act('reset', 'reset', 'Gốc') : ''}
  </div>
  ${o.lock ? '<p class="note">🔒 Phần tử đang khoá: không kéo, xoay hay sửa chữ được trên thiệp. Bấm “Mở khoá” để chỉnh.</p>' : ''}
  ${text ? `<p class="hint">Kích đúp vào văn bản trên thiệp để chỉnh sửa trực tiếp.</p>` : ''}
  ${text ? sec('content', 'Nội dung', `<textarea data-s="text" rows="${Math.min(6, Math.max(2, Math.ceil((s.text || '').length / 30)))}">${esc(s.text)}</textarea>
    ${s.bound ? '<p class="hint">Đồng bộ với thông tin thiệp — mọi chỗ hiện nội dung này đều đổi theo.</p>' : ''}`) : ''}
  ${text ? sec('type', 'Kiểu chữ', `
    <div class="tg-row">${tog('b', '<b>B</b>', 'In đậm')}${tog('i', '<i style="font-family:serif">I</i>', 'In nghiêng')}${tog('s', '<s>S</s>', 'Gạch ngang')}${tog('u', '<u>U</u>', 'Gạch chân')}${tog('tt', 'Aa', 'Viết hoa toàn bộ')}</div>
    <div class="line"><span>Căn chỉnh</span><div class="tg-row">${['left', 'center', 'right', 'justify'].map(al).join('')}</div></div>
    ${scaleCtl('fs', 'Cỡ chữ', 6, 140, 1, v('fs', 16), 'px', 'fsList')}
    <div class="line"><span>Phông chữ</span>${fontDD('sel', o.ff || cs.ff, 'Phông của mẫu')}</div>
    ${o.ff ? '<button type="button" class="link-btn" data-sclear="ff">↺ Dùng phông của mẫu</button>' : ''}
    <div class="line two">${colorCtl('color', 'Màu chữ', v('color', '#333333'))}${colorCtl('bgc', 'Màu nền', o.bgc || '', true)}</div>
    <div class="sw-row">${SWATCH().map(c => `<button type="button" class="sw" data-scolor="${c}" style="background:${c}" title="Màu chữ ${c}"></button>`).join('')}</div>
    ${scaleCtl('op', 'Trong suốt', 0, 1, .05, o.op ?? 1)}`) : ''}
  ${s.kind === 'shape' || s.kind === 'deco' ? sec('fill', s.kind === 'deco' ? 'Màu hoạ tiết' : 'Màu khối', `
    ${s.kind === 'deco' ? colorCtl('color', 'Màu', v('color', accent())) : s.shape === 'ring' ? colorCtl('bc', 'Màu vòng', o.bc || accent()) : colorCtl('bgc', 'Màu nền', o.bgc || accent())}
    <div class="sw-row">${SWATCH().map(c => `<button type="button" class="sw" data-sfill="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
    ${scaleCtl('op', 'Trong suốt', 0, 1, .05, o.op ?? 1)}`) : ''}
  ${im ? sec('img', s.img ? 'Ảnh' : 'Ảnh phía sau', `
    <div class="img-prev" style="background-image:url('${esc(im.src)}');background-position:${io.px ?? 50}% ${io.py ?? 50}%;filter:${esc((FILTERS.find(x => x[0] === (io.flt || ''))?.[2]) || 'none')}"></div>
    <div class="upload"><label class="btn btn-primary btn-sm" style="flex:1;justify-content:center">${IC.upload} Thay ảnh<input type="file" accept="image/*" hidden data-simg="1"></label>
      ${io.img ? '<button type="button" class="btn btn-outline btn-sm" data-sact="imgOrig">↺ Ảnh gốc</button>' : ''}</div>
    <div class="upload"><input type="url" id="selImgUrl" placeholder="Hoặc dán link ảnh online"><button type="button" class="btn btn-outline btn-sm" data-sact="imgUrl">Dùng</button></div>
    ${D.photos.length ? `<small class="hint">Chọn từ album:</small><div class="thumbs pick">${D.photos.map((p, i) => `<button type="button" data-spick="${i}" style="background-image:url('${esc(p)}')" aria-label="Dùng ảnh ${i + 1}"></button>`).join('')}</div>` : ''}
    <small class="hint">Bộ lọc:</small>
    <div class="flt-grid">${FILTERS.map(([k, n, css]) => `<button type="button" data-sflt="${k}" class="${(io.flt || '') === k ? 'on' : ''}"><i style="background-image:url('${esc(im.src)}');filter:${css || 'none'}"></i><span>${n}</span></button>`).join('')}</div>
    ${scaleCtl('img.br', 'Độ sáng', 40, 160, 1, io.br ?? 100, '%')}
    ${scaleCtl('img.ct', 'Tương phản', 50, 150, 1, io.ct ?? 100, '%')}
    ${scaleCtl('img.sat', 'Bão hoà màu', 0, 200, 1, io.sat ?? 100, '%')}
    ${scaleCtl('img.px', 'Căn khung ngang', 0, 100, 1, io.px ?? 50, '%')}
    ${scaleCtl('img.py', 'Căn khung dọc', 0, 100, 1, io.py ?? 50, '%')}`) : ''}
  ${isBox ? sec('fill', 'Màu', `<div class="line two">${colorCtl('bgc', 'Màu nền', o.bgc || cs.bgc || '', true)}${colorCtl('color', 'Màu chữ', v('color', '#333333'))}</div>${scaleCtl('op', 'Trong suốt', 0, 1, .05, o.op ?? 1)}`) : ''}
  ${sec('space', 'Khoảng đệm', `${scaleCtl('pad', 'Đệm trong', 0, 60, 1, v('pad', 0), 'px')}
    ${text ? scaleCtl('ls', 'Giãn chữ', -.1, .6, .01, fmtNum(v('ls', 0)), 'em') + scaleCtl('lh', 'Giãn dòng', .8, 2.6, .05, fmtNum(v('lh', 1.4))) : ''}`)}
  ${sec('border', 'Đường viền', `${scaleCtl('bw', 'Độ dày', 0, 12, 1, o.bw ?? 0, 'px')}
    ${o.bw ? `<div class="line"><span>Kiểu</span><div class="tg-row">${[['solid','━'],['dashed','┅'],['dotted','┈'],['double','═']].map(([k, ic]) => `<button type="button" class="tg ${(o.bs || 'solid') === k ? 'on' : ''}" data-sset="bs" data-val="${k}" title="${k}">${ic}</button>`).join('')}</div></div>
    ${colorCtl('bc', 'Màu viền', o.bc || accent())}` : ''}
    ${scaleCtl('rad', 'Bo góc', 0, 200, 1, o.rad ?? cs.rad ?? 0, 'px')}`)}
  ${sec('shadow', 'Đổ bóng', `<div class="tg-row wide">${[['', 'Không'], ['soft', 'Nhẹ'], ['strong', 'Đậm'], ['glow', 'Phát sáng']].map(([k, n]) => `<button type="button" class="tg ${(o.sh || '') === k && o.shb == null ? 'on' : ''}" data-sshadow="${k}">${n}</button>`).join('')}</div>
    <small class="hint">Tuỳ chỉnh:</small>
    ${colorCtl('shc', 'Màu bóng', o.shc || '#000000')}
    ${scaleCtl('shb', 'Độ nhoè', 0, 40, 1, o.shb ?? 10, 'px')}${scaleCtl('shx', 'Lệch ngang', -20, 20, 1, o.shx ?? 0, 'px')}${scaleCtl('shy', 'Lệch dọc', -20, 20, 1, o.shy ?? 3, 'px')}`)}
  ${sec('pos', 'Vị trí & kích thước', `
    ${s.layer && s.kind !== 'text' ? scaleCtl('w', 'Chiều rộng', 20, 500, 1, o.w ?? s.w, 'px') : ''}
    ${s.kind === 'shape' ? scaleCtl('h', 'Chiều cao', 2, 500, 1, o.h ?? s.h, 'px') : ''}
    ${scaleCtl('sc', 'Phóng to / thu nhỏ', .2, 3, .05, o.sc ?? 1, '×')}
    ${scaleCtl('rot', 'Xoay', -180, 180, 1, o.rot ?? 0, '°')}
    ${scaleCtl('dx', 'Dịch ngang', -300, 300, 1, o.dx ?? 0, 'px')}
    ${scaleCtl('dy', 'Dịch dọc', -600, 600, 1, o.dy ?? 0, 'px')}
    <div class="btn-row">${act('center', 'center', 'Về vị trí gốc')}${s.kind === 'image' || s.kind === 'deco' ? act('flip', 'flip', 'Lật ngang', o.flip ? 'on' : '') : ''}</div>`)}
  ${sec('anim', 'Hiệu ứng xuất hiện', animCtl())}`;
}

function globalPane(){
  const t = TH.findTemplate(D.tpl), hidden = Object.entries(D.ov).filter(([, o]) => o.hide);
  return `
  <div class="props-head"><div class="ph-t"><small>Tuỳ chỉnh</small><b>Toàn bộ thiệp</b></div></div>
  <div class="tip">${IC.pen}<p><b>Bấm vào chữ, ảnh hay bất kỳ phần nào trên thiệp</b> để tuỳ chỉnh. Kích đúp vào văn bản để sửa trực tiếp. Kéo để di chuyển, kéo chấm tròn để xoay / đổi cỡ.</p></div>
  ${sec('g-type', 'Phông chữ & màu', `
    <div class="line"><span>Phông tiêu đề</span>${fontDD('font', D.font, 'Theo mẫu (' + t.font + ')')}</div>
    <div class="line"><span>Phông nội dung</span>${fontDD('fontBody', D.fontBody, 'Theo mẫu (Be Vietnam Pro)')}</div>
    <div class="line"><span>Màu chủ đạo</span><label class="clr-sw" style="--c:${esc(accent())}"><input type="color" data-p="accent" value="${esc(accent())}"></label></div>
    <div class="sw-row">${['#c8506a','#b23a48','#c9a45c','#8a6d4b','#6a8a5a','#3f6e8c','#6b5ca5','#2b2326'].map(c => `<button type="button" class="sw" data-accent="${c}" style="background:${c}"></button>`).join('')}</div>`)}
  ${sec('g-free', `Chỉnh sửa tự do`, `
    <p class="hint">${Object.keys(D.ov).length} phần tử đã chỉnh · ${D.layers.length} chữ / ảnh / hình thêm · ${hidden.length} phần đang ẩn</p>
    ${hidden.length ? `<div class="hid-list">${hidden.map(([k]) => `<button type="button" data-unhide="${esc(k)}">${IC.show}<span>${esc(k.split('/').slice(-2).join(' › '))}</span></button>`).join('')}</div>
      <button class="btn btn-outline btn-sm" data-act="unhideAll">Hiện lại tất cả</button>` : ''}
    <button class="btn btn-ghost btn-sm" data-act="resetFree">↺ Xoá mọi chỉnh sửa tự do</button>`)}
  ${sec('g-keys', 'Phím tắt', `<ul class="keys"><li><kbd>Ctrl</kbd>+<kbd>Z</kbd> Hoàn tác</li><li><kbd>Ctrl</kbd>+<kbd>Y</kbd> Làm lại</li><li><kbd>Ctrl</kbd>+<kbd>D</kbd> Nhân bản</li>
    <li><kbd>Delete</kbd> Ẩn / xoá</li><li><kbd>←↑→↓</kbd> Dịch 1px (<kbd>Shift</kbd> 10px)</li><li><kbd>Enter</kbd> Sửa chữ · <kbd>Esc</kbd> Bỏ chọn</li><li><kbd>Ctrl</kbd>+<kbd>S</kbd> Lưu</li></ul>`)}`;
}
function buildProps(){
  const pr = $('#props'), keep = sel?._keep, y = pr.scrollTop;
  pr.innerHTML = `<div class="sheet-grip" title="Đóng"></div><datalist id="fsList">${FS_LIST.map(x => `<option value="${x}">`).join('')}</datalist>` + (sel ? propsPane() : globalPane());
  pr.scrollTop = keep ? y : 0;
  if (sel) sel._keep = true;
}
const build = () => { buildDrawer(); buildProps(); };
const closeProps = () => document.body.classList.remove('props-open');

/* ======================== ĐỒNG BỘ XEM TRƯỚC & LƯU ======================== */
let pvTimer;
const pvPost = m => $('#pv').contentWindow?.postMessage(m, location.origin);
const push = () => { clearTimeout(pvTimer); pvTimer = setTimeout(() => pvPost({type:'th-preview', data:D}), 120); };
const touch = (rebuild, noPush) => { dirty = true; setSaveState(); if (rebuild) build(); if (!noPush) push(); autosave(); recordSoon(); };
let autoOn = (() => { try { return localStorage.getItem('ed_autosave') !== '0'; } catch { return true; } })();
let saveTimer;
const autosave = () => { clearTimeout(saveTimer); if (autoOn) saveTimer = setTimeout(save, 800); };
let savedAt = '';
function setSaveState(){
  $('#saveState').textContent = dirty ? (autoOn ? 'Đang lưu…' : '● Chưa lưu') : savedAt ? '✓ Đã lưu ' + savedAt : '';
  $('#autoSave').innerHTML = `${SVG('<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>')}<span>Lưu tạm thời: <b>${autoOn ? 'Bật' : 'Tắt'}</b></span>`;
  $('#autoSave').classList.toggle('off', !autoOn);
}
function save(){ clearTimeout(saveTimer); if (TH.invites.save(id, D)) { dirty = false; savedAt = new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'}); setSaveState(); } }
addEventListener('beforeunload', e => { if (dirty) { save(); if (dirty) { e.preventDefault(); e.returnValue = ''; } } });
addEventListener('pagehide', () => { if (dirty && autoOn) save(); });
document.addEventListener('visibilitychange', () => { if (document.hidden && dirty && autoOn) save(); });
$('#autoSave').onclick = () => { autoOn = !autoOn; try { localStorage.setItem('ed_autosave', autoOn ? '1' : '0'); } catch {}
  if (autoOn && dirty) save(); setSaveState(); TH.toast(autoOn ? 'Đã bật lưu tạm thời tự động' : 'Đã tắt lưu tự động — nhớ bấm Ctrl+S hoặc Xuất bản để lưu'); };

/* Ô nhập nhanh của tiệc chính */
function setQuick(key, val){
  let m = mainEvent();
  if (!m) { m = {title:'Tiệc Cưới', time:D.date, place:'', address:'', map:''}; D.events.push(m); }
  if (key === 'date' && val) {
    const old = (m.time || D.date || '').slice(0, 10), days = old ? Math.round((new Date(val) - new Date(old)) / 864e5) : 0;
    if (days) { D.events.forEach(e => e.time = shiftDays(e.time, days)); D.date = shiftDays(D.date, days); }
    else { m.time = val + (m.time || 'T17:30').slice(10); D.date = m.time; }
    return true;
  }
  if (key === 'time' && val) { m.time = (m.time || D.date).slice(0, 10) + 'T' + val; D.date = m.time; return false; }
  m[key] = val; return false;
}

/* ======================== TUỲ CHỈNH PHẦN TỬ ======================== */
/* Ghi một thay đổi thuộc tính → áp ngay vào khung xem trước, không dựng lại cả thiệp */
function setOv(key, patch){
  const o = {...(D.ov[key] || {})};
  Object.entries(patch).forEach(([k, v]) => v == null || v === '' ? delete o[k] : o[k] = v);
  Object.keys(o).length ? D.ov[key] = o : delete D.ov[key];
  pvPost({type:'th-ov-set', key, o:D.ov[key] || null});
  if (sel) [sel, sel.img, sel.under].forEach(x => { if (x?.key === key) x.o = D.ov[key] || {}; });
  touch(false, true);
}
function selInput(el){
  const k = el.dataset.s;
  let raw = el.value;
  if (el.type === 'number') {          // ô số: bỏ qua khi đang gõ dở (VD: "-" hoặc trống), giới hạn trong khoảng cho phép
    if (raw === '' || isNaN(+raw)) return;
    raw = String(Math.min(+el.max, Math.max(+el.min, +raw)));
  }
  $$(`.rng [data-s="${k}"]`, $('#props')).forEach(x => { if (x !== el) x.value = x.type === 'number' ? fmtNum(raw) : raw; });
  if (el.type === 'color') { const sw = el.closest('.clr-sw'); if (sw) sw.style.setProperty('--c', raw); }
  if (k === 'text') {
    if (sel.bound) { setP(D, sel.bound, raw); sel.text = raw; touch(false); }
    else if (sel.layer) { const l = D.layers.find(x => 'L:' + x.id === sel.key); if (l) { l.text = raw; touch(false); } }
    else setOv(sel.key, {text: raw});
    return;
  }
  if (k.startsWith('img.')) { const im = sel.img || sel.under, p = k.slice(4), val = +raw;
    if (p === 'px' || p === 'py') { const prev = $('#props .img-prev'); if (prev) prev.style.backgroundPosition = `${p === 'px' ? val : im.o?.px ?? 50}% ${p === 'py' ? val : im.o?.py ?? 50}%`; }
    return setOv(im.key, {[p]: val === DEFAULTS[k] ? null : val}); }
  if (['color', 'bgc', 'bc', 'shc'].includes(k)) return setOv(sel.key, {[k]: raw});
  const val = +raw;
  if (k.startsWith('sh')) return setOv(sel.key, {[k]: val, sh: null});
  setOv(sel.key, {[k]: val === DEFAULTS[k] ? null : val});
}
function replaceImg(im, url){
  if (im.bimg) {
    const old = getP(D, im.bimg);
    setP(D, im.bimg, url);
    if (im.bimg.startsWith('photos.') && old === D.cover) D.cover = url;   // ảnh bìa trùng ảnh album → đổi theo
    im.src = url; touch(true);
  } else if (im.key.startsWith('L:')) { const l = D.layers.find(x => 'L:' + x.id === im.key); if (l) { l.img = url; im.src = url; touch(true); } }
  else { setOv(im.key, {img:url}); im.src = url; buildProps(); }
  TH.toast('Đã thay ảnh');
}
const selImage = url => { const im = sel?.img || sel?.under; if (im) replaceImg(im, url); };
/* Đặt giá trị cho một thanh chỉnh (nút −/+ và vạch số) */
function setScale(k, v){
  const r = $(`#props .rng input[type=range][data-s="${k}"]`); if (!r) return;
  r.value = Math.min(+r.max, Math.max(+r.min, +(+v).toFixed(3)));
  selInput(r);
}
/* Nhấn giữ −/+ : chạy liên tục, giữ lâu thì tăng bước lớn */
let nudgeT = 0;
const stopNudge = () => { clearTimeout(nudgeT); nudgeT = 0; };
document.addEventListener('pointerdown', e => {
  const b = e.target.closest('[data-snudge]'); if (!b || !sel) return;
  e.preventDefault(); stopNudge();
  const k = b.dataset.snudge, [sm, bg] = SCALE[k] || [1, 10], dir = +b.dataset.d;
  let n = 0;
  const once = () => { const r = $(`#props .rng input[type=range][data-s="${k}"]`); if (r) setScale(k, +r.value + dir * (n++ > 12 ? bg : sm)); };
  once();
  const rep = delay => nudgeT = setTimeout(() => { once(); rep(70); }, delay);
  rep(420);
});
['pointerup', 'pointercancel', 'blur'].forEach(t => addEventListener(t, stopNudge));

function propsClick(b){
  const d = b.dataset;
  if (d.scolor) { setOv(sel.key, {color: d.scolor}); syncColor('color', d.scolor); return true; }
  if (d.sfill) { const k = sel.kind === 'deco' ? 'color' : sel.shape === 'ring' ? 'bc' : 'bgc'; setOv(sel.key, {[k]: d.sfill}); syncColor(k, d.sfill); return true; }
  if (d.sclear) { setOv(sel.key, {[d.sclear]: null}); buildProps(); return true; }
  if (d.stog) { const cur = sel.o?.[d.stog] ?? sel.cs?.[d.stog]; setOv(sel.key, {[d.stog]: cur ? 0 : 1}); buildProps(); return true; }
  if (d.sset) { setOv(sel.key, {[d.sset]: d.val}); buildProps(); return true; }
  if (d.sshadow != null) { setOv(sel.key, {sh: d.sshadow || null, shb:null, shx:null, shy:null, shc:null}); buildProps(); return true; }
  if (d.sflt != null) { const im = sel.img || sel.under; setOv(im.key, {flt: d.sflt || null}); buildProps(); return true; }
  if (d.sanim != null) { setOv(sel.key, {anim: d.sanim || null}); if (d.sanim) setTimeout(() => pvPost({type:'th-play', key:sel.key}), 30); buildProps(); if (drawer === 'fx') buildDrawer(); return true; }
  if (d.spick != null) { selImage(D.photos[+d.spick]); return true; }
  if (d.snudge) return true;   // đã xử lý ở pointerdown
  if (d.stick) { setScale(d.stick, d.val); return true; }
  const a = d.sact; if (!a) return false;
  const o = sel.o || {};
  if (a === 'done') { sel = null; pvPost({type:'th-select', key:null}); closeProps(); buildProps(); }
  if (a === 'imgUrl') { const u = $('#selImgUrl').value.trim(); if (u) selImage(u); }
  if (a === 'imgOrig') { const im = sel.img || sel.under; setOv(im.key, {img:null}); buildProps(); }
  if (a === 'center') { setOv(sel.key, {dx:null, dy:null, rot:null, sc:null}); buildProps(); }
  if (a === 'flip') { setOv(sel.key, {flip: o.flip ? null : 1}); buildProps(); }
  if (a === 'hide') { setOv(sel.key, {hide: o.hide ? null : 1}); buildProps(); }
  if (a === 'lock') { setOv(sel.key, {lock: o.lock ? null : 1}); buildProps(); }
  if (a === 'front' || a === 'back') { const z = (o.z || 0) + (a === 'front' ? 1 : -1); setOv(sel.key, {z: z || null}); TH.toast(a === 'front' ? 'Đã đưa lên trên' : 'Đã đưa xuống dưới'); }
  if (a === 'play') pvPost({type:'th-play', key:sel.key});
  if (a === 'dup') pvPost({type:'th-dup', key:sel.key});
  if (a === 'reset') { delete D.ov[sel.key]; sel.o = {}; pvPost({type:'th-ov-set', key:sel.key, o:null}); touch(true, true); }
  if (a === 'del') { const i = D.layers.findIndex(x => 'L:' + x.id === sel.key); if (i >= 0) { D.layers.splice(i, 1); delete D.ov[sel.key]; sel = null; closeProps(); touch(true); } }
  return true;
}
const syncColor = (k, c) => { const i = $(`#props input[type=color][data-s="${k}"]`); if (i) { i.value = c; i.closest('.clr-sw')?.style.setProperty('--c', c); } };

/* ---------- Danh sách phông (dropdown) ---------- */
function openFontPop(btn){
  const was = btn.parentElement.querySelector('.fdd-pop');
  $$('.fdd-pop').forEach(p => p.remove());
  if (was) return;
  const target = btn.dataset.fdd, cur = btn.textContent.trim();
  const pop = document.createElement('div'); pop.className = 'fdd-pop';
  pop.innerHTML = `<input type="search" class="fdd-q" placeholder="Tìm phông chữ…" aria-label="Tìm phông chữ">
    <div class="fdd-list">${target !== 'sel' ? '<button type="button" data-fpick="" class="def">Theo mẫu</button>' : ''}${TH.FONTS.map(([g, , l]) => `<small>${g}</small>${l.map(n =>
      `<button type="button" data-fpick="${n}" class="${n === cur ? 'on' : ''}" style="font-family:${esc(TH.fontStack(n))}"><b>${n}</b><em>Trăm năm hạnh phúc</em></button>`).join('')}`).join('')}</div>`;
  pop.dataset.target = target;
  btn.parentElement.append(pop);
  /* Nổi trên mọi bảng (không bị khung gập/mở cắt mất): đặt theo vị trí nút, lật lên nếu sát đáy */
  const r = btn.getBoundingClientRect(), ph = Math.min(420, innerHeight * .7);
  pop.style.left = Math.max(8, Math.min(innerWidth - 288, r.right - 280)) + 'px';
  pop.style.top = (r.bottom + 6 + ph > innerHeight ? Math.max(8, r.top - 6 - ph) : r.bottom + 6) + 'px';
  const q = $('.fdd-q', pop); q.focus();
  q.oninput = () => { const s = ascii(q.value).toLowerCase(); $$('[data-fpick]', pop).forEach(b => b.hidden = !!s && !ascii(b.dataset.fpick).toLowerCase().includes(s)); };
  $('.on', pop)?.scrollIntoView({block:'center'});
}
function pickFont(target, name){
  $$('.fdd-pop').forEach(p => p.remove());
  if (target === 'sel') { setOv(sel.key, {ff: name || null}); buildProps(); return; }
  D[target] = name; touch(true);
}
document.addEventListener('click', e => { if (!e.target.closest('.fdd')) $$('.fdd-pop').forEach(p => p.remove()); });
document.addEventListener('scroll', e => { if (!e.target.closest?.('.fdd-pop')) $$('.fdd-pop').forEach(p => p.remove()); }, true);

/* ======================== SỰ KIỆN NHẬP LIỆU (ngăn kéo + bảng tuỳ chỉnh) ======================== */
const root = $('#ed');
root.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.s) return sel && selInput(el);
  if (el.matches('[data-bgpick]')) { D.bg = {c: el.value}; touch(false); return; }
  if (el.dataset.q) { if (el.type !== 'date') touch(setQuick(el.dataset.q, el.value)); return; }
  const p = el.dataset.p; if (!p) return;
  setP(D, p, el.value); touch(false);
  if (el.type === 'color') el.closest('.clr-sw')?.style.setProperty('--c', el.value);
  const qk = p.match(/^gift\.(groom|bride)\.(bank|acc|owner)$/);
  if (qk) { clearTimeout(qrTimers[qk[1]]); qrTimers[qk[1]] = setTimeout(() => drawQr(qk[1]), 500); }
});
root.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset.simg && el.files[0]) return TH.readImage(el.files[0], 1400, .82).then(url => selImage(url));
  if (el.dataset.s && el.type === 'number' && sel) { const v = isNaN(+el.value) || el.value === '' ? +$(`#props .rng input[type=range][data-s="${el.dataset.s}"]`).value : +el.value;
    el.value = fmtNum(Math.min(+el.max, Math.max(+el.min, v))); return selInput(el); }
  if (el.matches('[data-bgup]') && el.files[0]) return TH.readImage(el.files[0], 1600, .8).then(url => { D.bg = {img:url}; touch(true); });
  if (el.dataset.qslot != null && el.files[0]) { const s = slots[+el.dataset.qslot]; return TH.readImage(el.files[0], 1400, .82).then(url => replaceImg(s, url)); }
  if (el.dataset.q === 'date') touch(setQuick('date', el.value));
  if (el.dataset.p === 'music.type') { setP(D, 'music.type', el.value); touch(true); }
  if (el.dataset.opt) { D.opts[el.dataset.opt] = el.checked; touch(false); if (drawer) buildDrawer(); }
  if (el.dataset.up && el.files[0]) TH.readImage(el.files[0]).then(url => { setP(D, el.dataset.up, url); touch(true); });
  if (el.id === 'photoFiles' && el.files.length) Promise.all([...el.files].map(fl => TH.readImage(fl, 1000, .75))).then(urls => {
    D.photos.push(...urls); if (!D.cover) D.cover = urls[0]; touch(true); TH.toast(`Đã thêm ${urls.length} ảnh vào album`); });
});
root.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.dr) return openDrawer(d.dr);
  if (d.fdd) return openFontPop(b);
  if (d.fpick != null) return pickFont(b.closest('.fdd-pop').dataset.target, d.fpick);
  if (sel && b.closest('#props') && propsClick(b)) return;
  if (d.act === 'closeDrawer') return openDrawer(drawer);
  // Thêm chữ / hoạ tiết / hình dạng / ảnh
  if (d.addtext != null) { const t = TEXT_ADD[+d.addtext]; return addLayer({kind:'text', text:t.text, o:{...t.o}, edit:true}); }
  if (d.combo != null) { const c = COMBOS[+d.combo]; return addLayer({kind:'text', text:c.text, o:{...c.o}}); }
  if (d.emoji) return addLayer({kind:'text', text:d.emoji, o:{fs:56}});
  if (d.deco) return addLayer({kind:'deco', deco:d.deco, o:{color:accent()}});
  if (d.shape) return addLayer({kind:'shape', shape:d.shape, o:{}});
  if (d.addimg != null) return addLayer({kind:'img', img:D.photos[+d.addimg], o:{w:180, rad:12}});
  // Nền
  if (d.bgc) { D.bg = {c:d.bgc}; return touch(true); }
  if (d.bgg) { D.bg = {g:d.bgg}; return touch(true); }
  if (d.act === 'bgReset') { D.bg = {}; return touch(true); }
  if (d.accent) { D.accent = d.accent; return touch(true); }
  if (d.unhide) { setOv(d.unhide, {hide:null}); pvPost({type:'th-select', key:d.unhide}); return buildProps(); }
  if (d.tpl) {
    /* Nếu vẫn đang dùng ảnh mẫu của mẫu cũ thì đổi sang bộ ảnh của mẫu mới; ảnh riêng của người dùng được giữ nguyên */
    const oldSet = TH.findTemplate(D.tpl).photos || [], nt = TH.findTemplate(d.tpl);
    const isSample = D.photos.every(p => oldSet.includes(p)) && (!D.cover || oldSet.includes(D.cover));
    if (isSample && nt.photos) { D.photos = nt.photos.slice(); D.cover = nt.photos[0]; }
    D.tpl = d.tpl; D.accent = ''; touch(true); return;
  }
  if (d.cover != null) { D.cover = D.photos[+d.cover]; touch(true); TH.toast('Đã đặt làm ảnh bìa'); return; }
  if (d.rm) { const [arr, i] = d.rm.split('.'); const [gone] = D[arr].splice(+i, 1); if (arr === 'photos' && gone === D.cover) D.cover = D.photos[0] || ''; touch(true); return; }
  if (d.owner) { const k = d.owner; e.preventDefault();
    D.gift[k] = D.gift[k] || {}; D.gift[k].owner = ascii(D[k].name || D[k].nick).toUpperCase(); touch(true); return; }
  if (d.add === 'events') { D.events.unshift({title:'Lễ Vu Quy', time:shiftDays(D.date, -1), place:'Tư gia nhà gái', address:'', map:''}); touch(true); }
  if (d.add === 'story') { D.story.push({date:'', title:'', text:''}); touch(true); }
  if (d.act === 'resetColor') { D.accent = ''; touch(true); }
  if (d.act === 'unhideAll') { Object.entries(D.ov).forEach(([k, o]) => { delete o.hide; if (!Object.keys(o).length) delete D.ov[k]; }); touch(true); TH.toast('Đã hiện lại các phần đã ẩn'); }
  if (d.act === 'resetFree' && confirm('Xoá mọi chỉnh sửa tự do (vị trí, phông, màu, chữ/ảnh thêm…)? Thông tin cặp đôi vẫn được giữ.')) { D.ov = {}; D.layers = []; touch(true); }
  if (d.act === 'addPhoto') { const u = $('#photoUrl').value.trim(); if (u) { D.photos.push(u); if (!D.cover) D.cover = u; touch(true); } }
});
/* Mở một mục trong ngăn Thông tin → cuộn thiệp tới phần tương ứng; nhớ mục đang mở ở bảng Tuỳ chỉnh */
root.addEventListener('toggle', e => {
  const dt = e.target;
  if (dt.dataset?.pv && dt.open && Date.now() - drBuiltAt > 400) pvPost({type:'th-scroll', sel:dt.dataset.pv});
  if (dt.dataset?.sec) dt.open ? openSecs.add(dt.dataset.sec) : openSecs.delete(dt.dataset.sec);
}, true);

/* ---------- Thêm lớp mới (chữ, hoạ tiết, hình, ảnh) ---------- */
const pending = {};
function addLayer(spec){
  const req = TH.uid(); pending[req] = spec;
  if (!liveEdit) setLive(true);
  if (isMobile()) { drawer = ''; buildRail(); buildDrawer(); }
  pvPost({type:'th-place', req});
}
function pushLayer(l, o, select, editText){
  l.id = TH.uid(); D.layers.push(l);
  if (o && Object.keys(o).length) D.ov['L:' + l.id] = o;
  if (select) pvPost({type:'th-want', key:'L:' + l.id, edit:!!editText});
  touch(false);
}

/* ======================== HOÀN TÁC / LÀM LẠI ======================== */
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
  hist.i = n; D = JSON.parse(hist.stack[n]); normalize();
  sel = null; dirty = true; setSaveState(); build(); push(); autosave(); updUndo();
  TH.toast(dir < 0 ? '↶ Đã hoàn tác' : '↷ Đã làm lại');
}
function updUndo(){ $('#undoBtn').disabled = hist.i <= 0; $('#redoBtn').disabled = hist.i >= hist.stack.length - 1; }
$('#undoBtn').onclick = () => stepHist(-1);
$('#redoBtn').onclick = () => stepHist(1);
addEventListener('keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 's') { e.preventDefault(); save(); TH.toast('Đã lưu thiệp 💾'); return; }
  if (e.target.matches('input,textarea,select')) return;
  if (k === 'z') { e.preventDefault(); stepHist(e.shiftKey ? 1 : -1); }
  if (k === 'y') { e.preventDefault(); stepHist(1); }
});

/* ======================== NHẬN TIN TỪ KHUNG XEM TRƯỚC ======================== */
let slots = [];
addEventListener('message', e => {
  if (e.origin !== location.origin) return;
  const m = e.data || {};
  if (m.type === 'th-ready') { pvPost({type:'th-mode', edit:liveEdit, mobile:isMobile()}); push(); }
  if (m.type === 'th-sel') {
    const prev = sel; sel = m.info;
    if (sel && prev?.key === sel.key) sel._keep = true;
    if (!sel && isMobile()) closeProps();
    // Đang gõ / kéo thanh trượt trong bảng thì không dựng lại (tránh mất con trỏ)
    const ae = document.activeElement;
    if (sel && prev?.key === sel.key && $('#props').contains(ae) && ae.matches('input,textarea,select')) return;
    buildProps();
    if (drawer === 'fx' && prev?.key !== sel?.key) buildDrawer();
  }
  if (m.type === 'th-ov') { m.o ? D.ov[m.key] = m.o : delete D.ov[m.key]; if (sel?.key === m.key) sel.o = m.o || {}; touch(false, true); }
  if (m.type === 'th-bind') {
    const old = getP(D, m.path); setP(D, m.path, m.value);
    if (m.path.startsWith('photos.') && old === D.cover) D.cover = m.value;
    touch(false); if (drawer) buildDrawer();
  }
  if (m.type === 'th-layer') {
    const i = D.layers.findIndex(x => x.id === m.id); if (i < 0) return;
    if (m.remove) { D.layers.splice(i, 1); delete D.ov['L:' + m.id]; sel = null; touch(true); }
    else { Object.assign(D.layers[i], m.patch); touch(false); }
  }
  if (m.type === 'th-addlayer') { pushLayer({...m.layer}, m.o, m.select); TH.toast('Đã nhân bản'); }
  if (m.type === 'th-placed' && pending[m.req]) {
    const {kind, text, img, shape, deco, o, edit} = pending[m.req]; delete pending[m.req];
    const l = {sec:m.sec, kind, x:m.x, y:m.y};
    if (kind === 'text') l.text = text; if (kind === 'img') l.img = img; if (kind === 'shape') l.shape = shape; if (kind === 'deco') l.deco = deco;
    pushLayer(l, o, true, edit);
  }
  if (m.type === 'th-imgs') { slots = m.list || []; drawQuick(); }
  if (m.type === 'th-panel') { document.body.classList.add('props-open'); drawer = ''; buildRail(); buildDrawer(); }
  if (m.type === 'th-undo') stepHist(-1);
  if (m.type === 'th-redo') stepHist(1);
});

/* ======================== THAY ẢNH NHANH ======================== */
let quickOpen = (() => { try { return localStorage.getItem('ed_quick') !== '0'; } catch { return true; } })();
function drawQuick(){
  const q = $('#quick');
  q.classList.toggle('closed', !quickOpen);
  $('.quick-tg', q).innerHTML = `Thay ảnh nhanh <b>${slots.length}</b> ${SVG('<path d="M6 15l6-6 6 6"/>')}`;
  $('.quick-strip', q).innerHTML = slots.map((s, i) => `<div class="qs" data-qi="${i}" title="${esc(s.label)} — bấm để chọn, kéo ảnh từ máy thả vào để thay">
    <button type="button" class="qs-img" data-qsel="${i}" style="background-image:url('${esc(s.src)}')"></button>
    <label class="qs-up" title="Thay ảnh này">${IC.upload}<input type="file" accept="image/*" hidden data-qslot="${i}"></label><small>${esc(s.label)}</small></div>`).join('')
    || '<p class="hint">Thiệp chưa có ảnh nào.</p>';
}
$('#quick').addEventListener('click', e => {
  if (e.target.closest('.quick-tg')) { quickOpen = !quickOpen; try { localStorage.setItem('ed_quick', quickOpen ? '1' : '0'); } catch {} return drawQuick(); }
  const b = e.target.closest('[data-qsel]'); if (b) { if (!liveEdit) setLive(true); pvPost({type:'th-select', key:slots[+b.dataset.qsel].key}); }
  if (e.target.closest('.qs-nav')) $('.quick-strip').scrollBy({left: e.target.closest('.qs-nav').dataset.d * 300, behavior:'smooth'});
});
$('#quick').addEventListener('change', e => {
  const el = e.target; if (el.dataset.qslot == null || !el.files[0]) return;
  const s = slots[+el.dataset.qslot]; TH.readImage(el.files[0], 1400, .82).then(url => replaceImg(s, url));
});
/* Kéo ảnh từ máy thả thẳng vào ô */
$('#quick').addEventListener('dragover', e => { const t = e.target.closest('.qs'); if (!t) return; e.preventDefault(); $$('.qs.drop').forEach(x => x.classList.remove('drop')); t.classList.add('drop'); });
$('#quick').addEventListener('dragleave', e => e.target.closest('.qs')?.classList.remove('drop'));
$('#quick').addEventListener('drop', e => {
  const t = e.target.closest('.qs'); if (!t) return; e.preventDefault(); t.classList.remove('drop');
  const fl = [...e.dataTransfer.files].find(x => x.type.startsWith('image/')); if (!fl) return;
  TH.readImage(fl, 1400, .82).then(url => replaceImg(slots[+t.dataset.qi], url));
});

/* ======================== THANH TRÊN & KHUNG GIỮA ======================== */
/* Sửa trực tiếp / Xem thử */
let liveEdit = (() => { try { return localStorage.getItem('ed_live') !== '0'; } catch { return true; } })();
function setLive(on){
  liveEdit = on;
  $$('[data-mode]').forEach(b => { const x = (b.dataset.mode === 'edit') === on; b.classList.toggle('on', x); b.setAttribute('aria-pressed', x); });
  if (!on && sel) { sel = null; buildProps(); }
  try { localStorage.setItem('ed_live', on ? '1' : '0'); } catch {}
  pvPost({type:'th-mode', edit:on, mobile:isMobile()});
}
$$('[data-mode]').forEach(b => b.onclick = () => setLive(b.dataset.mode === 'edit'));

/* Điện thoại / Máy tính: máy tính dựng thiệp ở 1280px rồi thu nhỏ vừa khung */
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
  $$('[data-dev]').forEach(x => { const on = x.dataset.dev === dev; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
  $('#stage').classList.toggle('desktop', dev === 'desktop');
  fitPreview();
  try { localStorage.setItem('ed_dev', dev); } catch {}
  setTimeout(fitPreview, 400);
};
$$('[data-dev]').forEach(b => b.onclick = () => setDev(b.dataset.dev));
try { if (localStorage.getItem('ed_dev') === 'desktop' && !isMobile()) setDev('desktop'); } catch {}

/* Thu phóng khung thiệp */
let zoom = 1;
function setZoom(z){
  zoom = Math.min(2, Math.max(.4, +z.toFixed(2)));
  $('#stage .phone').style.zoom = zoom;
  $('#zoomVal').textContent = Math.round(zoom * 100) + '%';
}
$('#zoomIn').onclick = () => setZoom(zoom + .1);
$('#zoomOut').onclick = () => setZoom(zoom - .1);
$('#zoomVal').onclick = () => setZoom(1);
$('#frameWrap').addEventListener('wheel', e => { if (!e.ctrlKey) return; e.preventDefault(); setZoom(zoom - Math.sign(e.deltaY) * .1); }, {passive:false});

/* Menu ☰ */
$('#menuBtn').onclick = e => { e.stopPropagation(); const m = $('#menu'); m.hidden = !m.hidden; };
document.addEventListener('click', e => { if (!e.target.closest('#menu')) $('#menu').hidden = true; });
$('#menu').innerHTML = [['index.html','🏠','Trang chủ'],['mau-thiep.html','🎨','Kho mẫu thiệp'],['thiep-da-tao.html?mine=1','💌','Thiệp của tôi'],
  [`quan-ly.html?id=${id}`,'👥','Quản lý khách mời & RSVP']].map(([h, ic, n]) => `<a href="${h}"><i>${ic}</i>${n}</a>`).join('')
  + `<button type="button" id="mOpen"><i>🔗</i>Mở thiệp ở tab mới</button>`;
$('#mOpen').onclick = () => { save(); open(TH.inviteUrl(id, null), '_blank'); };

/* Xem trước: thiệp thật (có phong bì, hiệu ứng, nhạc) trong khung điện thoại / máy tính */
$('#btnPreview').onclick = () => {
  save();
  const url = `thiep.html?id=${encodeURIComponent(id)}&owner=1`;
  const ov = document.createElement('div'); ov.className = 'pv-modal';
  ov.innerHTML = `<div class="pv-bar"><div class="seg"><button type="button" class="on" data-pvd="phone">📱 Điện thoại</button><button type="button" data-pvd="desktop">💻 Máy tính</button></div>
    <button type="button" class="pv-x" aria-label="Đóng xem trước">${IC.close}</button></div>
    <div class="pv-frame pv-phone"><iframe src="${url}" title="Xem trước thiệp"></iframe></div>`;
  document.body.append(ov);
  const close = () => { ov.remove(); removeEventListener('keydown', esc_); };
  const esc_ = e => e.key === 'Escape' && close();
  addEventListener('keydown', esc_);
  $('.pv-x', ov).onclick = close;
  ov.onclick = e => { if (e.target === ov) close(); };
  $$('[data-pvd]', ov).forEach(b => b.onclick = () => { $$('[data-pvd]', ov).forEach(x => x.classList.toggle('on', x === b)); $('.pv-frame', ov).className = 'pv-frame pv-' + b.dataset.pvd; });
};
/* Xuất bản: lưu + hộp chia sẻ */
$('#btnShare').onclick = () => { save(); TH.shareDialog(id, D); };

/* Bảng tuỳ chỉnh trên điện thoại: vuốt / bấm thanh kéo để đóng */
$('#props').addEventListener('click', e => { if (e.target.closest('.sheet-grip')) { closeProps(); } });

buildRail(); build(); setSaveState(); save(); record(); setLive(liveEdit); drawQuick();
if (!TH.store.get('liveHint2')) { TH.store.set('liveHint2', 1); setTimeout(() => TH.toast('Bấm vào chữ hoặc ảnh trên thiệp để tuỳ chỉnh ✨'), 1200); }
})();

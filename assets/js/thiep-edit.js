/* ============ Chỉnh sửa tự do kiểu Canva ngay trên thiệp ============
   Dữ liệu:
   - D.ov[key]   : tuỳ chỉnh của từng phần tử (chữ, phông, cỡ, màu, nền, viền, bóng, vị trí, xoay,
                   ảnh thay thế, bộ lọc, hiệu ứng xuất hiện, khoá, thứ tự lớp, ẩn…)
   - D.layers[]  : chữ / ảnh / hình dạng khách tự thêm, gắn vào một phần (section) của thiệp
   Mỗi phần tử trong #app được gán khoá ổn định data-ek = "<phần>/<thẻ.lớp:thứ tự>/…" để
   tuỳ chỉnh vẫn đúng chỗ sau mỗi lần dựng lại giao diện.
   Chế độ sửa chỉ bật trong khung xem trước của trình chỉnh sửa (thiep.html?preview=1). */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$;
const isPreview = new URLSearchParams(location.search).has('preview');
const post = msg => parent !== window && parent.postMessage(msg, location.origin);

/* ---------- Khoá ổn định cho từng phần tử ---------- */
const VOLATILE = /^(reveal|in|left|right|zoom|on|off|open|show|playing|active|done|bump|gone|intro|play|me|ek-.*|is-.*)$/;
const sig = el => { const c = [...el.classList].find(x => !VOLATILE.test(x)); return el.tagName.toLowerCase() + (c ? '.' + c : ''); };
const SKIP = el => el.id === 'lb' || el.id === 'env' || el.classList.contains('ek-ui') || el.tagName === 'SCRIPT' || el.tagName === 'STYLE';

function mark(){
  const app = $('#app'); if (!app) return;
  const seen = {};
  const walk = (el, key) => {
    el.dataset.ek = key;
    if (el.tagName === 'svg' || el.tagName === 'SELECT' || el.tagName === 'IFRAME') return;
    const cnt = {};
    [...el.children].forEach(c => {
      if (SKIP(c) || c.classList.contains('ek-layer')) return;
      const s = sig(c), n = cnt[s] = (cnt[s] ?? -1) + 1;
      walk(c, key + '/' + s + (n ? ':' + n : ''));
    });
  };
  [...app.children].forEach((c, i) => {
    if (SKIP(c)) return;
    let k = c.id || [...c.classList].find(x => !VOLATILE.test(x)) || c.tagName.toLowerCase() + i;
    if (seen[k]) k += ':' + seen[k]++; else seen[k] = 1;
    c.dataset.ekSec = k;
    walk(c, k);
  });
  $$('.ek-layer', app).forEach(l => l.dataset.ek = 'L:' + l.dataset.lid);
}
const find = key => key && document.querySelector(`#app [data-ek="${CSS.escape(key)}"]`);

/* ---------- Áp tuỳ chỉnh lên một phần tử ---------- */
const SHADOW = {soft:'0 2px 10px rgba(0,0,0,.35)', strong:'0 3px 18px rgba(0,0,0,.75)', glow:'0 0 12px rgba(255,255,255,.95)'};
const BOX_SHADOW = {soft:'0 6px 18px rgba(0,0,0,.18)', strong:'0 14px 36px rgba(0,0,0,.4)', glow:'0 0 22px rgba(255,255,255,.95)'};
const FILTER = {warm:'sepia(.25) saturate(1.2) hue-rotate(-8deg)', cool:'saturate(.9) hue-rotate(12deg) brightness(1.03)', vintage:'sepia(.55) contrast(.9) brightness(1.05)',
  bw:'grayscale(1)', dreamy:'brightness(1.08) saturate(.85) contrast(.9)', vivid:'saturate(1.45) contrast(1.08)', fade:'contrast(.8) brightness(1.1) saturate(.8)'};
const isImg = el => el && (el.tagName === 'IMG' || /url\(/.test(el.style.backgroundImage || ''));
const imgSrc = el => el.tagName === 'IMG' ? el.getAttribute('src') : (el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)$/) || [])[1] || '';
const isText = el => !isImg(el) && textEditable(el);

function applyOne(el, o, edit){
  o = o || {};
  // Khôi phục trạng thái gốc (để áp lại nhiều lần khi đang kéo / chỉnh thanh trượt)
  if (el._os === undefined) el._os = el.getAttribute('style') || '';
  else el._os ? el.setAttribute('style', el._os) : el.removeAttribute('style');
  if (el._oh !== undefined && o.text == null) { el.innerHTML = el._oh; delete el._oh; }
  if (el._osrc !== undefined && el.tagName === 'IMG' && !o.img) { el.setAttribute('src', el._osrc); delete el._osrc; }
  el.classList.remove('ek-hidden', 'ek-locked');
  delete el.dataset.anim;
  const s = el.style;
  if (o.text != null && !el.dataset.b) { if (el._oh === undefined) el._oh = el.innerHTML; el.innerText = o.text; }
  if (o.img) {
    if (el.tagName === 'IMG') { if (el._osrc === undefined) el._osrc = el.getAttribute('src'); el.setAttribute('src', o.img); }
    else s.backgroundImage = `url('${o.img}')`;
  }
  // Chữ
  if (o.ff) { TH.loadFont(o.ff); s.fontFamily = TH.fontStack(o.ff); }
  if (o.fs) s.fontSize = o.fs + 'px';
  if (o.color) { s.color = o.color; s.webkitTextFillColor = o.color; }
  if (o.b != null) s.fontWeight = o.b ? '700' : '400';
  if (o.i != null) s.fontStyle = o.i ? 'italic' : 'normal';
  if (o.u != null || o.s != null) s.textDecoration = [o.u && 'underline', o.s && 'line-through'].filter(Boolean).join(' ') || 'none';
  if (o.tt != null) s.textTransform = o.tt ? 'uppercase' : 'none';
  if (o.ta) s.textAlign = o.ta;
  if (o.ls != null) s.letterSpacing = o.ls + 'em';
  if (o.lh) s.lineHeight = o.lh;
  // Khối: nền, khoảng đệm, viền, bóng
  if (o.bgc) s.backgroundColor = o.bgc;
  if (o.pad != null) s.padding = o.pad + 'px';
  if (o.bw) s.border = `${o.bw}px ${o.bs || 'solid'} ${o.bc || 'currentColor'}`;
  else if (o.bc && el.dataset.shape === 'ring') s.borderColor = o.bc;
  if (o.rad != null) s.borderRadius = o.rad + 'px';
  const text = isText(el);
  if (o.shb != null || o.shx != null || o.shy != null || o.shc) {
    const v = `${o.shx ?? 0}px ${o.shy ?? 3}px ${o.shb ?? 10}px ${o.shc || 'rgba(0,0,0,.45)'}`;
    text ? (s.textShadow = v) : (s.boxShadow = v);
  } else if (o.sh) text ? (s.textShadow = SHADOW[o.sh] || 'none') : (s.boxShadow = BOX_SHADOW[o.sh] || 'none');
  // Ảnh: bộ lọc, căn khung
  const f = [FILTER[o.flt], o.br != null && o.br !== 100 && `brightness(${o.br}%)`, o.ct != null && o.ct !== 100 && `contrast(${o.ct}%)`,
    o.sat != null && o.sat !== 100 && `saturate(${o.sat}%)`, o.blur && `blur(${o.blur}px)`].filter(Boolean).join(' ');
  if (f) s.filter = f;
  if (o.px != null || o.py != null) {
    const pos = `${o.px ?? 50}% ${o.py ?? 50}%`;
    el.tagName === 'IMG' ? (s.objectPosition = pos) : (s.backgroundPosition = pos);
  }
  if (o.w) s.width = o.w + 'px';
  if (o.h) s.height = o.h + 'px';
  if (o.op != null) s.opacity = o.op;
  // Vị trí, xoay, kích thước, thứ tự lớp
  if (o.dx || o.dy) {
    // Cộng dồn với translate sẵn có của mẫu (VD: nút cuộn đang căn giữa bằng translate:-50%)
    const base = getComputedStyle(el).translate;
    if (!base || base === 'none') s.translate = `${o.dx || 0}px ${o.dy || 0}px`;
    else { const [x, y = '0px'] = base.split(' '); s.translate = `calc(${x} + ${o.dx || 0}px) calc(${y} + ${o.dy || 0}px)`; }
  }
  if (o.rot) s.rotate = o.rot + 'deg';
  if (o.sc && o.sc !== 1) s.scale = o.sc;
  if (o.flip) s.scale = `${-(o.sc || 1)} ${o.sc || 1}`;
  if (o.z) { s.zIndex = 5 + o.z; if (getComputedStyle(el).position === 'static') s.position = 'relative'; }
  if (o.anim) { el.dataset.anim = o.anim; s.animationDelay = (o.ad || 0) + 's'; if (o.adur) s.animationDuration = o.adur + 's'; }
  if (o.lock && edit) el.classList.add('ek-locked');
  if (o.hide) edit ? el.classList.add('ek-hidden') : (s.display = 'none');
  if ((o.dx || o.dy || o.rot || o.sc || o.anim) && getComputedStyle(el).display === 'inline') s.display = 'inline-block';
}

/* ---------- Chữ / ảnh / hình dạng khách tự thêm ---------- */
/* Trái tim: đường cong tham số → đa giác (co giãn theo kích thước khung) */
const HEART = 'polygon(' + Array.from({length:48}, (_, i) => { const t = i / 48 * Math.PI * 2;
  const x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  return `${(50 + x * 3).toFixed(1)}% ${(45 - y * 3).toFixed(1)}%`; }).join(',') + ')';
const STAR = 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)';
const SHAPES = {heart:HEART, star:STAR, tri:'polygon(50% 0,100% 100%,0 100%)', diamond:'polygon(50% 0,100% 50%,50% 100%,0 50%)',
  hex:'polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)'};
TH.EK_SHAPES = SHAPES;
/* Hoạ tiết SVG (tô bằng currentColor → đổi màu bằng "Màu chữ") */
const leaf = (x, y, a, s = 1) => `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(9 * s).toFixed(1)}" ry="${(3.6 * s).toFixed(1)}" transform="rotate(${a.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="currentColor"/>`;
const branch = () => { let g = '<path d="M14 112C46 84 76 52 106 10" fill="none" stroke="currentColor" stroke-width="2"/>';
  for (let i = 1; i < 8; i++) { const t = i / 8, x = 14 + 92 * t, y = 112 - 102 * t + Math.sin(t * 3) * 6, a = -52 + (i % 2 ? -38 : 38);
    g += leaf(x + (i % 2 ? -6 : 6), y + (i % 2 ? -3 : 3), a, 1 - t * .35); } return g; };
const wreath = () => { let g = ''; for (let i = 0; i < 30; i++) { const th = i / 30 * Math.PI * 2, x = 60 + Math.cos(th) * 44, y = 60 + Math.sin(th) * 44;
  g += leaf(x, y, th * 180 / Math.PI + 90 + (i % 2 ? 28 : -28), .9); if (i % 5 === 0) g += `<circle cx="${(60 + Math.cos(th) * 52).toFixed(1)}" cy="${(60 + Math.sin(th) * 52).toFixed(1)}" r="2.4" fill="currentColor"/>`; } return g; };
const svg = (vb, body) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;
const DECO = {
  heart:{name:'Trái tim viền', svg:svg('0 0 100 90', '<path d="M50 84C20 62 6 46 6 28A21 21 0 0 1 50 17a21 21 0 0 1 44 11c0 18-14 34-44 56z" fill="none" stroke="currentColor" stroke-width="4"/>')},
  hearts:{name:'Đôi tim', svg:svg('0 0 120 90', '<path d="M42 80C18 62 6 50 6 34a17 17 0 0 1 36-8 17 17 0 0 1 36 8c0 16-12 28-36 46z" fill="currentColor"/><path d="M92 58C78 48 70 40 70 31a10 10 0 0 1 22-5 10 10 0 0 1 22 5c0 9-8 17-22 27z" fill="currentColor" opacity=".55"/>')},
  rings:{name:'Nhẫn cưới', svg:svg('0 0 120 90', '<circle cx="46" cy="52" r="28" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="74" cy="52" r="28" fill="none" stroke="currentColor" stroke-width="5"/><path d="M46 8l7 8-7 8-7-8z" fill="currentColor"/>')},
  divider:{name:'Đường phân cách', svg:svg('0 0 300 30', '<path d="M8 15h120M172 15h120" stroke="currentColor" stroke-width="1.6"/><path d="M150 4l11 11-11 11-11-11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="150" cy="15" r="3" fill="currentColor"/>')},
  flourish:{name:'Hoa văn uốn lượn', svg:svg('0 0 300 44', '<path d="M8 22c34-20 64-20 92 0s58 20 50 0-26-16-14-4M292 22c-34-20-64-20-92 0s-58 20-50 0 26-16 14-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="150" cy="22" r="3.5" fill="currentColor"/>')},
  corner:{name:'Khung góc', svg:svg('0 0 100 100', '<path d="M4 34V4h30M66 4h30v30M96 66v30H66M34 96H4V66" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="4" cy="4" r="3" fill="currentColor"/><circle cx="96" cy="96" r="3" fill="currentColor"/>')},
  frame:{name:'Khung đôi', svg:svg('0 0 100 130', '<rect x="3" y="3" width="94" height="124" rx="8" fill="none" stroke="currentColor" stroke-width="2"/><rect x="9" y="9" width="82" height="112" rx="5" fill="none" stroke="currentColor" stroke-width="1"/>')},
  arch:{name:'Khung vòm', svg:svg('0 0 100 140', '<path d="M4 136V50a46 46 0 0 1 92 0v86z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M11 136V52a39 39 0 0 1 78 0v84" fill="none" stroke="currentColor" stroke-width="1"/>')},
  sparkle:{name:'Lấp lánh', svg:svg('0 0 100 100', '<path d="M50 4C54 38 62 46 96 50 62 54 54 62 50 96 46 62 38 54 4 50 38 46 46 38 50 4z" fill="currentColor"/><path d="M84 10c1.5 7 3 8.5 10 10-7 1.5-8.5 3-10 10-1.5-7-3-8.5-10-10 7-1.5 8.5-3 10-10z" fill="currentColor" opacity=".6"/>')},
  branch:{name:'Cành lá', svg:svg('0 0 120 120', branch())},
  wreath:{name:'Vòng nguyệt quế', svg:svg('0 0 120 120', wreath())},
  dove:{name:'Chim bồ câu', svg:svg('0 0 120 90', '<path d="M8 52c18-4 30 2 40 12 6-20 22-40 52-46-10 12-14 22-14 30 10-2 18 0 26 6-14 2-22 8-28 18-8 12-22 16-38 12 6-4 8-8 8-12-14 2-30-4-46-20z" fill="currentColor"/>')}
};
TH.EK_DECO = DECO;
function renderLayers(D){
  $$('#app .ek-layer').forEach(l => l.remove());
  (D.layers || []).forEach(l => {
    const sec = document.querySelector(`#app > [data-ek-sec="${CSS.escape(l.sec)}"]`); if (!sec) return;
    const el = document.createElement(l.kind === 'img' ? 'img' : 'div');
    el.className = 'ek-layer'; el.dataset.lid = l.id;
    if (l.kind === 'img') { el.src = l.img; el.alt = ''; el.draggable = false; }
    else if (l.kind === 'shape') { el.classList.add('ek-shape'); el.dataset.shape = l.shape; if (SHAPES[l.shape]) el.style.clipPath = SHAPES[l.shape]; }
    else if (l.kind === 'deco') { el.classList.add('ek-deco'); el.dataset.deco = l.deco; el.innerHTML = DECO[l.deco]?.svg || ''; }
    else el.innerText = l.text || '';
    el.style.left = l.x + '%'; el.style.top = l.y + 'px';
    sec.append(el);
  });
}

/* ---------- Hiệu ứng xuất hiện: chạy khi phần tử cuộn vào màn hình ---------- */
let D = null, edit = false;
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('ek-play'); io.unobserve(e.target); }
}), {threshold:.15}) : null;
const play = el => { el.classList.remove('ek-play'); void el.offsetWidth; el.classList.add('ek-play'); };

function apply(data){
  D = data;
  mark();               // gán data-ek-sec cho các phần trước khi gắn lớp thêm
  renderLayers(D);
  mark();
  Object.entries(D.ov || {}).forEach(([k, o]) => { const el = find(k); if (el) applyOne(el, o, edit); });
  $$('#app [data-anim]').forEach(el => edit || !io ? el.classList.add('ek-play') : io.observe(el));
  if (isPreview) { postImgs(); if (edit) afterRender(); }
}
TH.ek = {apply};
if (!isPreview) return;

/* ======================================================================
   Phần dưới chỉ chạy trong khung xem trước của trình chỉnh sửa
   ====================================================================== */
let sel = null, selKey = null, under = null, underKey = null, editing = null, wantSel = null, wantEdit = false;
const ui = document.createElement('div'); ui.className = 'ek-ui';
ui.innerHTML = `<div class="ek-box" hidden><i class="ek-h rot" data-h="rot" title="Kéo để xoay"></i><i class="ek-h sc" data-h="sc" title="Kéo để phóng to / thu nhỏ"></i><em class="ek-size" hidden></em></div>
  <div class="ek-hov" hidden></div><i class="ek-guide v" hidden></i><i class="ek-guide h" hidden></i>
  <div class="ek-bar" hidden role="toolbar" aria-label="Công cụ chỉnh sửa"></div>
  <input type="file" accept="image/*" hidden class="ek-file">`;
document.body.append(ui);
const box = $('.ek-box', ui), bar = $('.ek-bar', ui), hov = $('.ek-hov', ui), file = $('.ek-file', ui), sizeTag = $('.ek-size', ui);
const guideV = $('.ek-guide.v', ui), guideH = $('.ek-guide.h', ui);

const BIND_NAME = {'groom.nick':'Tên chú rể', 'bride.nick':'Tên cô dâu', 'groom.name':'Họ tên chú rể', 'bride.name':'Họ tên cô dâu', quote:'Câu trích dẫn', message:'Lời mời', cover:'Ảnh bìa'};
const SEC_NAME = {hero:'Phần mở đầu', 'sec-couple':'Cặp đôi', 'sec-countdown':'Đếm ngược', 'sec-cal':'Lịch', 'sec-events':'Sự kiện', 'sec-story':'Chuyện tình',
  'sec-album':'Album', 'sec-rsvp':'Xác nhận tham dự', wishSec:'Sổ lời chúc', cheerSec:'Gửi niềm vui', giftSec:'Mừng cưới', 't-foot':'Lời cảm ơn'};
const SHAPE_NAME = {rect:'Hình chữ nhật', round:'Hình bo góc', circle:'Hình tròn', ring:'Vòng tròn', line:'Đường kẻ', heart:'Trái tim', star:'Ngôi sao', arch:'Cửa vòm', tri:'Tam giác', diamond:'Hình thoi', hex:'Lục giác'};
const INLINE = /^(B|I|EM|STRONG|SMALL|SPAN|BR|A|U)$/;
function textEditable(el){
  if (!el || el.matches('input,textarea,select,img,iframe,canvas,svg,.bg,.ek-shape,.ek-deco') || el.closest('#cd,#cdHero,#ticker,.cal-grid,.qr-box,.tk-qr-box,svg')) return false;
  if (el.classList.contains('ek-layer')) return true;
  let has = false;
  for (const n of el.childNodes) {
    if (n.nodeType === 3 && n.textContent.trim()) has = true;
    else if (n.nodeType === 1 && !INLINE.test(n.tagName)) return false;
  }
  return has;
}
const secOf = el => el.closest('#app > [data-ek-sec]')?.dataset.ekSec || '';
const imgLabel = x => BIND_NAME[x.dataset.bimg] || (x.dataset.bimg?.startsWith('photos.') ? 'Ảnh album ' + (+x.dataset.bimg.slice(7) + 1)
  : x.classList.contains('couple-photo') ? 'Ảnh cặp đôi' : x.classList.contains('ek-layer') ? 'Ảnh thêm' : 'Hình ảnh');
function info(el){
  const key = el.dataset.ek, cs = getComputedStyle(el), o = D.ov?.[key] || {};
  const img = isImg(el), text = !img && textEditable(el), layer = el.classList.contains('ek-layer'), shape = el.dataset.shape || '', deco = el.dataset.deco || '';
  const bound = el.dataset.b || '', txt = text ? el.innerText.trim() : '';
  const und = !img && (under?.isConnected ? under : find(underKey));
  const label = deco ? DECO[deco]?.name || 'Hoạ tiết' : shape ? SHAPE_NAME[shape] || 'Hình dạng' : img ? imgLabel(el) : BIND_NAME[bound] || (text ? `“${txt.slice(0, 26)}${txt.length > 26 ? '…' : ''}”` : 'Khối nội dung');
  const imgInfo = x => ({key:x.dataset.ek, bimg:x.dataset.bimg || '', src:imgSrc(x), isTag:x.tagName === 'IMG', o:D.ov?.[x.dataset.ek] || {}});
  const fsz = parseFloat(cs.fontSize);
  return {key, kind: deco ? 'deco' : shape ? 'shape' : img ? 'image' : text ? 'text' : 'box', label, section: SEC_NAME[secOf(el)] || '', layer, shape, bound, text: txt, o,
    img: img ? imgInfo(el) : null, under: und ? imgInfo(und) : null,
    w: Math.round(el.offsetWidth), h: Math.round(el.offsetHeight),
    cs: {ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fs: Math.round(fsz), color: rgbHex(cs.color),
         bgc: cs.backgroundColor === 'rgba(0, 0, 0, 0)' ? '' : rgbHex(cs.backgroundColor),
         b: +cs.fontWeight >= 600, i: cs.fontStyle === 'italic', u: /underline/.test(cs.textDecorationLine), s: /line-through/.test(cs.textDecorationLine),
         tt: cs.textTransform === 'uppercase', ta: cs.textAlign === 'start' ? 'left' : cs.textAlign,
         ls: +(parseFloat(cs.letterSpacing) / fsz || 0).toFixed(2), lh: +(parseFloat(cs.lineHeight) / fsz || 1.4).toFixed(2),
         pad: Math.round(parseFloat(cs.paddingTop)) || 0, rad: Math.round(parseFloat(cs.borderTopLeftRadius)) || 0,
         bw: Math.round(parseFloat(cs.borderTopWidth)) || 0, bc: rgbHex(cs.borderTopColor), op: +(+cs.opacity).toFixed(2)}};
}
const rgbHex = c => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return '#000000'; return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); };

/* Danh sách ô ảnh trên thiệp → dải "Thay ảnh nhanh" của trình chỉnh sửa */
function postImgs(){
  const list = $$('#app [data-ek]').filter(x => isImg(x) && !x.closest('.inv-backdrop') && !x.closest('#lb') && !x.closest('.lightbox'))
    .map(x => ({key:x.dataset.ek, src:imgSrc(x), label:imgLabel(x), bimg:x.dataset.bimg || '', layer:x.classList.contains('ek-layer') ? x.dataset.lid : ''}));
  post({type:'th-imgs', list});
}

/* ---------- Chọn phần tử ---------- */
function select(el, quiet){
  if (sel && sel !== el) sel.classList.remove('ek-sel');
  if (editing && editing !== el) commitText();
  sel = el; selKey = el?.dataset.ek || null;
  if (!el) { under = null; underKey = null; box.hidden = bar.hidden = true; if (!quiet) post({type:'th-sel', info:null}); return; }
  el.classList.add('ek-sel');
  drawBar(); place();
  post({type:'th-sel', info:info(el)});
}
const ICON = {
  text:'<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4"/></svg>',
  img:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/></svg>',
  dup:'<svg viewBox="0 0 24 24"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>',
  lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  unlock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>',
  up:'<svg viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke-dasharray="3 3"/><path d="M9 12l3-3 3 3M12 9v7"/></svg>',
  hide:'<svg viewBox="0 0 24 24"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A9.8 9.8 0 0 1 12 5c5 0 9 5 9 7a10 10 0 0 1-2.2 3.2M6.1 6.1C4 7.5 3 9.7 3 12c0 2 4 7 9 7 1.6 0 3-.4 4.3-1"/></svg>',
  show:'<svg viewBox="0 0 24 24"><path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  del:'<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  reset:'<svg viewBox="0 0 24 24"><path d="M4 4v6h6"/><path d="M20 12a8 8 0 0 0-14.9-4L4 10M4 12a8 8 0 0 0 14.9 4"/></svg>',
  panel:'<svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>'
};
function drawBar(){
  const i = info(sel), o = i.o;
  const btn = (act, ic, t, cls = '') => `<button type="button" data-act="${act}" class="${cls}" title="${t}">${ICON[ic]}<span>${t}</span></button>`;
  bar.innerHTML = [
    i.kind === 'text' && !o.lock ? btn('text', 'text', 'Sửa chữ') : '',
    i.kind === 'image' || i.under ? btn('img', 'img', 'Đổi ảnh') : '',
    btn('panel', 'panel', 'Tuỳ chỉnh', 'only-m'),
    i.kind !== 'box' ? btn('dup', 'dup', 'Nhân bản') : '',
    btn('lock', o.lock ? 'lock' : 'unlock', o.lock ? 'Mở khoá' : 'Khoá', o.lock ? 'on' : ''),
    sel.parentElement?.closest('#app [data-ek]') ? btn('up', 'up', 'Khung ngoài') : '',
    i.layer ? btn('del', 'del', 'Xoá', 'danger') : btn('hide', o.hide ? 'show' : 'hide', o.hide ? 'Hiện lại' : 'Ẩn'),
    D.ov?.[i.key] && !i.layer ? btn('reset', 'reset', 'Gốc') : ''
  ].join('');
  bar.hidden = false;
}
function place(){
  if (!sel || !sel.isConnected) { box.hidden = bar.hidden = true; return; }
  const r = sel.getBoundingClientRect();
  Object.assign(box.style, {left: r.left - 4 + 'px', top: r.top - 4 + 'px', width: r.width + 8 + 'px', height: r.height + 8 + 'px'});
  box.hidden = false; box.classList.toggle('locked', !!D.ov?.[selKey]?.lock);
  if (bar.hidden) return;
  const bw = bar.offsetWidth, bh = bar.offsetHeight;
  let top = r.top - bh - 44; if (top < 6) top = Math.min(innerHeight - bh - 6, r.bottom + 16);
  bar.style.left = Math.max(6, Math.min(innerWidth - bw - 6, r.left + r.width / 2 - bw / 2)) + 'px';
  bar.style.top = Math.max(6, top) + 'px';
}
(function loop(){ if (edit && sel) place(); requestAnimationFrame(loop); })();

/* Sau mỗi lần dựng lại: chọn lại đúng phần tử đang sửa */
function afterRender(){
  if (wantSel && find(wantSel)) { selKey = wantSel; wantSel = null; }
  const el = find(selKey);
  sel = null;
  if (el) { select(el, true); if (wantEdit) { wantEdit = false; startText(); } }
  else { box.hidden = bar.hidden = true; if (selKey) { selKey = null; post({type:'th-sel', info:null}); } }
}

/* ---------- Ghi thay đổi về trình chỉnh sửa ---------- */
function setOv(key, patch, live = true){
  D.ov = D.ov || {};
  const o = {...(D.ov[key] || {})};
  Object.entries(patch).forEach(([k, v]) => v == null || v === '' ? delete o[k] : o[k] = v);
  Object.keys(o).length ? D.ov[key] = o : delete D.ov[key];
  const el = find(key); if (el && live) applyOne(el, D.ov[key] || {}, true);
  post({type:'th-ov', key, o:D.ov[key] || null});
}

/* ---------- Sửa chữ tại chỗ ---------- */
function startText(){
  if (!sel || !textEditable(sel) || D.ov?.[selKey]?.lock) return;
  editing = sel; sel._before = sel.innerHTML;
  if (sel._oh === undefined && !sel.dataset.b && !sel.classList.contains('ek-layer')) sel._oh = sel.innerHTML;   // nội dung gốc của mẫu
  try { sel.contentEditable = 'plaintext-only'; } catch {}
  if (sel.contentEditable !== 'plaintext-only') sel.contentEditable = 'true';
  window.focus(); sel.focus();
  const r = document.createRange(); r.selectNodeContents(sel);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  bar.hidden = true;
}
function commitText(cancel){
  const el = editing; if (!el) return;
  editing = null; el.contentEditable = 'false'; el.removeAttribute('contenteditable');
  getSelection().removeAllRanges();
  const val = el.innerText.replace(/\n$/, '');
  if (cancel) { el.innerHTML = el._before; return; }
  if (el.innerHTML === el._before) { if (sel === el) drawBar(); return; }
  if (el.dataset.b) post({type:'th-bind', path:el.dataset.b, value:val.replace(/\n+/g, ' ').trim()});
  else if (el.classList.contains('ek-layer')) post({type:'th-layer', id:el.dataset.lid, patch:{text:val}});
  else { const orig = el._oh !== undefined ? (() => { const t = document.createElement('div'); t.innerHTML = el._oh; return t.innerText; })() : null;
    setOv(el.dataset.ek, {text: orig !== null && val === orig ? null : val}, false); }
  if (sel === el) { drawBar(); post({type:'th-sel', info:info(el)}); }
}

/* ---------- Đổi ảnh ---------- */
let imgTarget = null;
file.onchange = async () => {
  const f = file.files[0]; file.value = ''; if (!f || !imgTarget) return;
  try { const url = await TH.readImage(f, 1400, .82); replaceImg(imgTarget, url); } catch { TH.toast('Không đọc được ảnh này'); }
};
function replaceImg(el, url){
  if (el.dataset.bimg) post({type:'th-bind', path:el.dataset.bimg, value:url});
  else if (el.classList.contains('ek-layer')) post({type:'th-layer', id:el.dataset.lid, patch:{img:url}});
  else setOv(el.dataset.ek, {img:url});
}

/* ---------- Nhân bản: chữ / ảnh / hình của mẫu cũng nhân bản được (thành lớp mới) ---------- */
function duplicate(el){
  const sec = el.closest('#app > [data-ek-sec]'); if (!sec) return;
  const r = el.getBoundingClientRect(), sr = sec.getBoundingClientRect(), o = {...(D.ov?.[el.dataset.ek] || {})};
  delete o.dx; delete o.dy; delete o.lock; delete o.hide; delete o.text; delete o.img;
  const at = {sec:sec.dataset.ekSec, x:+((r.left + r.width / 2 - sr.left) / sr.width * 100 + 4).toFixed(1), y:Math.round(r.top + r.height / 2 - sr.top + 24)};
  let layer;
  if (el.classList.contains('ek-layer')) { const l = D.layers.find(x => x.id === el.dataset.lid); layer = {...l, ...at}; }
  else if (isImg(el)) layer = {kind:'img', img:imgSrc(el), ...at}, o.w = o.w || Math.min(260, Math.round(el.offsetWidth));
  else { const c = getComputedStyle(el);
    layer = {kind:'text', text:el.innerText.trim(), ...at};
    Object.assign(o, {ff: o.ff || c.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fs: o.fs || Math.round(parseFloat(c.fontSize)), color: o.color || rgbHex(c.color),
      ls: o.ls ?? +(parseFloat(c.letterSpacing) / parseFloat(c.fontSize) || 0).toFixed(2), tt: o.tt ?? (c.textTransform === 'uppercase' ? 1 : null), b: o.b ?? (+c.fontWeight >= 600 ? 1 : null)});
    if (!TH.FONTS.some(g => g[2].includes(o.ff))) delete o.ff; }
  Object.keys(o).forEach(k => o[k] == null && delete o[k]);
  post({type:'th-addlayer', layer, o, select:true});
}

/* ---------- Thao tác trên thanh công cụ nổi ---------- */
bar.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || !sel) return;
  const a = b.dataset.act, key = sel.dataset.ek, o = D.ov?.[key] || {};
  if (a === 'text') startText();
  if (a === 'img') { imgTarget = isImg(sel) ? sel : (under?.isConnected ? under : find(underKey)); if (imgTarget) file.click(); }
  if (a === 'panel') post({type:'th-panel'});
  if (a === 'dup') duplicate(sel);
  if (a === 'lock') { setOv(key, {lock: o.lock ? null : 1}); drawBar(); post({type:'th-sel', info:info(sel)}); TH.toast(o.lock ? 'Đã mở khoá' : '🔒 Đã khoá — không kéo / sửa nhầm được nữa'); }
  if (a === 'up') select(sel.parentElement.closest('#app [data-ek]'));
  if (a === 'hide') { setOv(key, {hide: o.hide ? null : 1}); drawBar(); post({type:'th-sel', info:info(sel)}); }
  if (a === 'del') { post({type:'th-layer', id:sel.dataset.lid, remove:true}); select(null); }
  if (a === 'reset') { D.ov && delete D.ov[key]; applyOne(sel, {}, true); post({type:'th-ov', key, o:null}); drawBar(); post({type:'th-sel', info:info(sel)}); }
});

/* ---------- Bấm / kéo / xoay / phóng to ---------- */
const pickable = t => t && !t.closest('.ek-ui') && t.closest('#app') && !t.closest('#lb') ? t.closest('[data-ek]') : null;
let drag = null;
addEventListener('pointerdown', e => {
  if (!edit || e.button > 0) return;
  const h = e.target.closest('.ek-h');
  if (h && sel) {
    e.preventDefault();
    if (D.ov?.[selKey]?.lock) return TH.toast('Phần tử đang khoá 🔒');
    const r = sel.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, o = D.ov?.[sel.dataset.ek] || {};
    drag = {mode:h.dataset.h, cx, cy, d0:Math.hypot(e.clientX - cx, e.clientY - cy) || 1, sc0:o.sc || 1, o:{...o}};
    h.setPointerCapture(e.pointerId); return;
  }
  if (e.target.closest('.ek-ui')) return;
  if (editing && editing.contains(e.target)) return;      // đang gõ chữ: để con trỏ hoạt động bình thường
  const el = pickable(e.target); if (!el) return;
  e.preventDefault();                                     // chặn focus ô nhập, bôi đen chữ
  if ((el === sel || sel?.contains(el) && e.target.closest('.ek-sel')) && !D.ov?.[selKey]?.lock) {
    const o = D.ov?.[sel.dataset.ek] || {};
    drag = {mode:'move', x:e.clientX, y:e.clientY, o:{...o}, moved:false, id:e.pointerId};
  }
}, true);
/* Đường gióng: hút vào giữa phần chứa khi kéo gần tâm */
function snapGuides(){
  const sec = sel.closest('#app > [data-ek-sec]'); if (!sec) return;
  const r = sel.getBoundingClientRect(), sr = sec.getBoundingClientRect();
  const cx = r.left + r.width / 2, scx = sr.left + sr.width / 2;
  let snapped = false;
  if (Math.abs(cx - scx) < 5 && (drag.o.dx || 0) !== 0) { drag.o.dx = Math.round(drag.o.dx + scx - cx); applyOne(sel, drag.o, true); snapped = true; }
  guideV.hidden = !snapped && Math.abs(cx - scx) > .5;
  if (!guideV.hidden) Object.assign(guideV.style, {left: scx + 'px', top: Math.max(0, sr.top) + 'px', height: Math.min(innerHeight, sr.bottom) - Math.max(0, sr.top) + 'px'});
}
addEventListener('pointermove', e => {
  if (!edit) return;
  if (!drag) {                                            // viền gợi ý khi rê chuột
    const el = e.pointerType === 'mouse' && pickable(e.target);
    if (el && el !== sel) { const r = el.getBoundingClientRect(); Object.assign(hov.style, {left:r.left + 'px', top:r.top + 'px', width:r.width + 'px', height:r.height + 'px'}); hov.hidden = false; }
    else hov.hidden = true;
    return;
  }
  const o = drag.o;
  if (drag.mode === 'move') {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!drag.moved) { drag.moved = true; sel.setPointerCapture?.(drag.id); sel.classList.add('ek-drag'); hov.hidden = true; bar.hidden = true; }
    let nx = Math.round((drag.o0dx ??= o.dx || 0) + dx), ny = Math.round((drag.o0dy ??= o.dy || 0) + dy);
    if (Math.abs(nx) < 6) nx = 0; if (Math.abs(ny) < 6) ny = 0;   // hút về vị trí gốc
    o.dx = nx; o.dy = ny;
    applyOne(sel, o, true); snapGuides();
    sizeTag.hidden = false; sizeTag.textContent = `x ${o.dx}  y ${o.dy}`;
    return;
  } else if (drag.mode === 'sc') {
    o.sc = Math.max(.2, Math.min(5, +(drag.sc0 * Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) / drag.d0).toFixed(2)));
    sizeTag.hidden = false; sizeTag.textContent = `${Math.round(o.sc * 100)}%`;
  } else if (drag.mode === 'rot') {
    let a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI + 90;
    a = ((Math.round(a) + 540) % 360) - 180;
    for (const s of [-180, -90, -45, 0, 45, 90, 180]) if (Math.abs(a - s) < 4 && !e.shiftKey) a = s;
    o.rot = a;
    sizeTag.hidden = false; sizeTag.textContent = `${a}°`;
  }
  applyOne(sel, o, true);
});
const endDrag = () => {
  if (!drag) return;
  const d = drag; drag = null; sel?.classList.remove('ek-drag');
  sizeTag.hidden = guideV.hidden = guideH.hidden = true;
  if (d.mode === 'move' && !d.moved) return;
  const {dx, dy, sc, rot} = d.o;
  setOv(sel.dataset.ek, {dx: dx || null, dy: dy || null, sc: sc && sc !== 1 ? sc : null, rot: rot || null}, false);
  drawBar(); post({type:'th-sel', info:info(sel)});
  suppressClick = Date.now() + 250;
};
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);

let suppressClick = 0;
addEventListener('click', e => {
  if (!edit || e.target.closest('.ek-ui')) return;
  if (editing && editing.contains(e.target)) return;
  if (!e.target.closest('#app')) return select(null);
  if (e.target.closest('#lb')) return;
  e.preventDefault(); e.stopPropagation();
  if (Date.now() < suppressClick) return;
  const el = pickable(e.target);
  if (!el) return select(null);
  // Ảnh nằm ngay dưới con trỏ (VD: ảnh bìa phía sau tên cô dâu chú rể) → cho phép đổi ảnh đó
  under = isImg(el) || el.classList.contains('ek-layer') ? null : document.elementsFromPoint(e.clientX, e.clientY).find(x => x !== el && x.closest('#app') && isImg(x) && x.dataset.ek) || null;
  underKey = under?.dataset.ek || null;
  if (el.dataset.ekSec && under) { const u = under; under = null; underKey = null; return select(u); }   // bấm vào nền của một phần → chọn luôn ảnh nền
  select(el);
}, true);
addEventListener('dblclick', e => {
  if (!edit || e.target.closest('.ek-ui')) return;
  const el = pickable(e.target); if (!el) return;
  e.preventDefault(); e.stopPropagation();
  if (el !== sel) select(el);
  if (textEditable(el)) startText();
  else if (isImg(el)) { imgTarget = el; file.click(); }
}, true);
/* Chặn submit form / mở link khi đang ở chế độ sửa */
addEventListener('submit', e => { if (edit) { e.preventDefault(); e.stopPropagation(); } }, true);

addEventListener('keydown', e => {
  if (!edit) return;
  if (editing) {
    if (e.key === 'Escape') { e.preventDefault(); commitText(true); }
    else if (e.key === 'Enter' && !e.shiftKey && editing.dataset.b) { e.preventDefault(); commitText(); }
    return;
  }
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (mod && k === 'z') { e.preventDefault(); post({type: e.shiftKey ? 'th-redo' : 'th-undo'}); return; }
  if (mod && k === 'y') { e.preventDefault(); post({type:'th-redo'}); return; }
  if (!sel || e.target.matches?.('input,textarea')) return;
  if (mod && k === 'd') { e.preventDefault(); duplicate(sel); return; }
  if (e.key === 'Escape') select(null);
  if (e.key === 'Enter' && textEditable(sel)) { e.preventDefault(); startText(); }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); $(`[data-act="${sel.classList.contains('ek-layer') ? 'del' : 'hide'}"]`, bar)?.click(); }
  const mv = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]}[e.key];
  if (mv && !D.ov?.[selKey]?.lock) { e.preventDefault(); const st = e.shiftKey ? 10 : 1, o = D.ov?.[sel.dataset.ek] || {};
    setOv(sel.dataset.ek, {dx: (o.dx || 0) + mv[0] * st || null, dy: (o.dy || 0) + mv[1] * st || null}); post({type:'th-sel', info:info(sel)}); }
});
addEventListener('focusout', e => { if (editing && e.target === editing) commitText(); });

/* ---------- Nhận lệnh từ trình chỉnh sửa ---------- */
function setEdit(on){
  edit = on;
  document.body.classList.toggle('ek-edit', on);
  if (!on) { commitText(); select(null, true); hov.hidden = true; }
  if (D) apply(D);
}
addEventListener('message', e => {
  if (e.origin !== location.origin) return;
  const m = e.data || {};
  if (m.type === 'th-mode') { document.body.classList.toggle('ek-mobile', !!m.mobile); setEdit(!!m.edit); }
  if (m.type === 'th-ov-set' && D) {         // trình chỉnh sửa đổi thuộc tính → áp ngay, không dựng lại cả thiệp
    D.ov = D.ov || {}; m.o ? D.ov[m.key] = m.o : delete D.ov[m.key];
    const el = find(m.key); if (el) applyOne(el, D.ov[m.key] || {}, edit);
    if (el && D.ov[m.key]?.anim) el.classList.add('ek-play');
    if (sel && sel.dataset.ek === m.key) drawBar();
    if (el && isImg(el)) postImgs();
  }
  if (m.type === 'th-play') { const el = find(m.key); if (el) play(el); }
  if (m.type === 'th-dup') { const el = find(m.key); if (el) duplicate(el); }
  if (m.type === 'th-select') { const el = find(m.key); if (el) { el.scrollIntoView({block:'center', behavior:'smooth'}); select(el); } else if (m.key == null) select(null); }
  if (m.type === 'th-want') { wantSel = m.key; wantEdit = !!m.edit; }
  if (m.type === 'th-place') {                 // tìm chỗ đặt chữ / ảnh mới: giữa màn hình đang xem
    const at = document.elementFromPoint(innerWidth / 2, innerHeight / 2);
    const sec = at?.closest('#app > [data-ek-sec]') || $('#app > section');
    if (!sec) return;
    const r = sec.getBoundingClientRect();
    post({type:'th-placed', req:m.req, sec:sec.dataset.ekSec, x:50, y:Math.round(Math.max(40, Math.min(r.height - 40, innerHeight / 2 - r.top)))});
  }
});
})();

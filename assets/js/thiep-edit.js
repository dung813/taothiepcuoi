/* ============ Chỉnh sửa tự do kiểu Canva ngay trên thiệp ============
   Dữ liệu:
   - D.ov[key]   : tuỳ chỉnh của từng phần tử (chữ, phông, cỡ, màu, vị trí, xoay, ảnh thay thế, ẩn…)
   - D.layers[]  : chữ / ảnh khách tự thêm, gắn vào một phần (section) của thiệp
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
const isImg = el => el && (el.tagName === 'IMG' || /url\(/.test(el.style.backgroundImage || ''));
const imgSrc = el => el.tagName === 'IMG' ? el.getAttribute('src') : (el.style.backgroundImage.match(/url\(["']?(.*?)["']?\)$/) || [])[1] || '';

function applyOne(el, o, edit){
  o = o || {};
  // Khôi phục trạng thái gốc (để áp lại nhiều lần khi đang kéo / chỉnh thanh trượt)
  if (el._os === undefined) el._os = el.getAttribute('style') || '';
  else el._os ? el.setAttribute('style', el._os) : el.removeAttribute('style');
  if (el._oh !== undefined && o.text == null) { el.innerHTML = el._oh; delete el._oh; }
  if (el._osrc !== undefined && el.tagName === 'IMG' && !o.img) { el.setAttribute('src', el._osrc); delete el._osrc; }
  el.classList.remove('ek-hidden');
  const s = el.style;
  if (o.text != null && !el.dataset.b) { if (el._oh === undefined) el._oh = el.innerHTML; el.innerText = o.text; }
  if (o.img) {
    if (el.tagName === 'IMG') { if (el._osrc === undefined) el._osrc = el.getAttribute('src'); el.setAttribute('src', o.img); }
    else s.backgroundImage = `url('${o.img}')`;
  }
  if (o.ff) { TH.loadFont(o.ff); s.fontFamily = TH.fontStack(o.ff); }
  if (o.fs) s.fontSize = o.fs + 'px';
  if (o.color) { s.color = o.color; s.webkitTextFillColor = o.color; }
  if (o.b != null) s.fontWeight = o.b ? '700' : '400';
  if (o.i != null) s.fontStyle = o.i ? 'italic' : 'normal';
  if (o.u != null) s.textDecoration = o.u ? 'underline' : 'none';
  if (o.tt != null) s.textTransform = o.tt ? 'uppercase' : 'none';
  if (o.ta) s.textAlign = o.ta;
  if (o.ls != null) s.letterSpacing = o.ls + 'em';
  if (o.lh) s.lineHeight = o.lh;
  if (o.sh) s.textShadow = SHADOW[o.sh] || 'none';
  if (o.op != null) s.opacity = o.op;
  if (o.rad != null) s.borderRadius = o.rad + 'px';
  if (o.br != null && o.br !== 100) s.filter = `brightness(${o.br}%)`;
  if (o.px != null || o.py != null) {
    const pos = `${o.px ?? 50}% ${o.py ?? 50}%`;
    el.tagName === 'IMG' ? (s.objectPosition = pos) : (s.backgroundPosition = pos);
  }
  if (o.dx || o.dy) {
    // Cộng dồn với translate sẵn có của mẫu (VD: nút cuộn đang căn giữa bằng translate:-50%)
    const base = getComputedStyle(el).translate;
    if (!base || base === 'none') s.translate = `${o.dx || 0}px ${o.dy || 0}px`;
    else { const [x, y = '0px'] = base.split(' '); s.translate = `calc(${x} + ${o.dx || 0}px) calc(${y} + ${o.dy || 0}px)`; }
  }
  if (o.rot) s.rotate = o.rot + 'deg';
  if (o.sc && o.sc !== 1) s.scale = o.sc;
  if (o.hide) edit ? el.classList.add('ek-hidden') : (s.display = 'none');
  if ((o.dx || o.dy || o.rot || o.sc) && getComputedStyle(el).display === 'inline') s.display = 'inline-block';
}

/* ---------- Chữ / ảnh khách tự thêm ---------- */
function renderLayers(D){
  $$('#app .ek-layer').forEach(l => l.remove());
  (D.layers || []).forEach(l => {
    const sec = document.querySelector(`#app > [data-ek-sec="${CSS.escape(l.sec)}"]`); if (!sec) return;
    const el = document.createElement(l.kind === 'img' ? 'img' : 'div');
    el.className = 'ek-layer'; el.dataset.lid = l.id;
    if (l.kind === 'img') { el.src = l.img; el.alt = ''; el.draggable = false; } else el.innerText = l.text || '';
    el.style.left = l.x + '%'; el.style.top = l.y + 'px';
    sec.append(el);
  });
}

let D = null, edit = false;
function apply(data){
  D = data;
  mark();               // gán data-ek-sec cho các phần trước khi gắn lớp thêm
  renderLayers(D);
  mark();
  Object.entries(D.ov || {}).forEach(([k, o]) => { const el = find(k); if (el) applyOne(el, o, edit); });
  if (edit) afterRender();
}
TH.ek = {apply};
if (!isPreview) return;

/* ======================================================================
   Phần dưới chỉ chạy trong khung xem trước của trình chỉnh sửa
   ====================================================================== */
let sel = null, selKey = null, under = null, underKey = null, editing = null, wantSel = null, wantEdit = false;
const ui = document.createElement('div'); ui.className = 'ek-ui';
ui.innerHTML = `<div class="ek-box" hidden><i class="ek-h rot" data-h="rot" title="Kéo để xoay"></i><i class="ek-h sc" data-h="sc" title="Kéo để phóng to / thu nhỏ"></i></div>
  <div class="ek-hov" hidden></div>
  <div class="ek-bar" hidden role="toolbar" aria-label="Công cụ chỉnh sửa"></div>
  <input type="file" accept="image/*" hidden class="ek-file">`;
document.body.append(ui);
const box = $('.ek-box', ui), bar = $('.ek-bar', ui), hov = $('.ek-hov', ui), file = $('.ek-file', ui);

const BIND_NAME = {'groom.nick':'Tên chú rể', 'bride.nick':'Tên cô dâu', 'groom.name':'Họ tên chú rể', 'bride.name':'Họ tên cô dâu', quote:'Câu trích dẫn', message:'Lời mời', cover:'Ảnh bìa'};
const SEC_NAME = {hero:'Phần mở đầu', 'sec-couple':'Cặp đôi', 'sec-countdown':'Đếm ngược', 'sec-cal':'Lịch', 'sec-events':'Sự kiện', 'sec-story':'Chuyện tình',
  'sec-album':'Album', 'sec-rsvp':'Xác nhận tham dự', wishSec:'Sổ lời chúc', cheerSec:'Gửi niềm vui', giftSec:'Mừng cưới', 't-foot':'Lời cảm ơn'};
const INLINE = /^(B|I|EM|STRONG|SMALL|SPAN|BR|A|U)$/;
function textEditable(el){
  if (!el || el.matches('input,textarea,select,img,iframe,canvas,svg,.bg') || el.closest('#cd,#cdHero,#ticker,.cal-grid,.qr-box,.tk-qr-box,svg')) return false;
  if (el.classList.contains('ek-layer')) return true;
  let has = false;
  for (const n of el.childNodes) {
    if (n.nodeType === 3 && n.textContent.trim()) has = true;
    else if (n.nodeType === 1 && !INLINE.test(n.tagName)) return false;
  }
  return has;
}
const secOf = el => el.closest('#app > [data-ek-sec]')?.dataset.ekSec || '';
function info(el){
  const key = el.dataset.ek, cs = getComputedStyle(el), o = D.ov?.[key] || {};
  const img = isImg(el), text = textEditable(el), layer = el.classList.contains('ek-layer');
  const bound = el.dataset.b || '', bimg = el.dataset.bimg || '';
  const sec = secOf(el), txt = text ? el.innerText.trim() : '';
  const und = !img && (under?.isConnected ? under : find(underKey));
  const label = BIND_NAME[bound] || BIND_NAME[bimg] || (img ? 'Hình ảnh' : text ? `“${txt.slice(0, 26)}${txt.length > 26 ? '…' : ''}”` : 'Khối nội dung');
  const imgInfo = x => ({key:x.dataset.ek, bimg:x.dataset.bimg || '', src:imgSrc(x), isTag:x.tagName === 'IMG', o:D.ov?.[x.dataset.ek] || {}});
  return {key, kind: img ? 'image' : text ? 'text' : 'box', label, section: SEC_NAME[sec] || '', layer, bound, text: txt, o,
    img: img ? imgInfo(el) : null, under: und ? imgInfo(und) : null,
    cs: {ff: cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(), fs: Math.round(parseFloat(cs.fontSize)), color: rgbHex(cs.color),
         b: +cs.fontWeight >= 600, i: cs.fontStyle === 'italic', u: /underline/.test(cs.textDecorationLine), tt: cs.textTransform === 'uppercase',
         ta: cs.textAlign, ls: parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize) || 0, lh: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 1.4}};
}
const rgbHex = c => { const m = c.match(/\d+(\.\d+)?/g); if (!m) return '#000000'; return '#' + m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); };

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
function drawBar(){
  const i = info(sel), btn = (act, ic, t) => `<button type="button" data-act="${act}" title="${t}">${ic}<span>${t}</span></button>`;
  bar.innerHTML = [
    i.kind === 'text' ? btn('text', '✏️', 'Sửa chữ') : '',
    i.kind === 'image' || i.under ? btn('img', '🖼', 'Đổi ảnh') : '',
    btn('panel', '🎨', 'Tuỳ chỉnh'),
    sel.parentElement?.closest('#app [data-ek]') ? btn('up', '⬆', 'Khung ngoài') : '',
    i.layer ? btn('del', '🗑', 'Xoá') : btn('hide', i.o.hide ? '👁' : '🚫', i.o.hide ? 'Hiện lại' : 'Ẩn'),
    D.ov?.[i.key] ? btn('reset', '↺', 'Gốc') : ''
  ].join('');
  bar.hidden = false;
}
function place(){
  if (!sel || !sel.isConnected) { box.hidden = bar.hidden = true; return; }
  const r = sel.getBoundingClientRect();
  Object.assign(box.style, {left: r.left - 4 + 'px', top: r.top - 4 + 'px', width: r.width + 8 + 'px', height: r.height + 8 + 'px'});
  box.hidden = false;
  const bw = bar.offsetWidth, bh = bar.offsetHeight;
  let top = r.top - bh - 40; if (top < 6) top = Math.min(innerHeight - bh - 6, r.bottom + 14);
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
  if (!sel || !textEditable(sel)) return;
  editing = sel; sel._before = sel.innerHTML;
  if (sel._oh === undefined && !sel.dataset.b && !sel.classList.contains('ek-layer')) sel._oh = sel.innerHTML;   // nội dung gốc của mẫu
  try { sel.contentEditable = 'plaintext-only'; } catch {}
  if (sel.contentEditable !== 'plaintext-only') sel.contentEditable = 'true';
  sel.focus();
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
  if (el.innerHTML === el._before) return;
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

/* ---------- Thao tác trên thanh công cụ nổi ---------- */
bar.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || !sel) return;
  const a = b.dataset.act, key = sel.dataset.ek;
  if (a === 'text') startText();
  if (a === 'img') { imgTarget = isImg(sel) ? sel : (under?.isConnected ? under : find(underKey)); if (imgTarget) file.click(); }
  if (a === 'panel') post({type:'th-panel'});
  if (a === 'up') select(sel.parentElement.closest('#app [data-ek]'));
  if (a === 'hide') { setOv(key, {hide: D.ov?.[key]?.hide ? null : 1}); drawBar(); }
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
    const r = sel.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, o = D.ov?.[sel.dataset.ek] || {};
    drag = {mode:h.dataset.h, cx, cy, d0:Math.hypot(e.clientX - cx, e.clientY - cy) || 1, sc0:o.sc || 1, o:{...o}};
    h.setPointerCapture(e.pointerId); return;
  }
  if (e.target.closest('.ek-ui')) return;
  if (editing && editing.contains(e.target)) return;      // đang gõ chữ: để con trỏ hoạt động bình thường
  const el = pickable(e.target); if (!el) return;
  e.preventDefault();                                     // chặn focus ô nhập, bôi đen chữ
  if (el === sel || sel?.contains(el) && e.target.closest('.ek-sel')) {
    const o = D.ov?.[sel.dataset.ek] || {};
    drag = {mode:'move', x:e.clientX, y:e.clientY, o:{...o}, moved:false, id:e.pointerId};
  }
}, true);
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
    if (!drag.moved) { drag.moved = true; sel.setPointerCapture?.(drag.id); sel.classList.add('ek-drag'); hov.hidden = true; }
    let nx = Math.round((drag.o0dx ??= o.dx || 0) + dx), ny = Math.round((drag.o0dy ??= o.dy || 0) + dy);
    if (Math.abs(nx) < 6) nx = 0; if (Math.abs(ny) < 6) ny = 0;   // hút về vị trí gốc
    o.dx = nx; o.dy = ny;
  } else if (drag.mode === 'sc') {
    o.sc = Math.max(.2, Math.min(5, +(drag.sc0 * Math.hypot(e.clientX - drag.cx, e.clientY - drag.cy) / drag.d0).toFixed(2)));
  } else if (drag.mode === 'rot') {
    let a = Math.atan2(e.clientY - drag.cy, e.clientX - drag.cx) * 180 / Math.PI + 90;
    a = ((Math.round(a) + 540) % 360) - 180;
    for (const s of [-180, -90, 0, 90, 180]) if (Math.abs(a - s) < 5 && !e.shiftKey) a = s;
    o.rot = a;
  }
  applyOne(sel, o, true);
});
const endDrag = () => {
  if (!drag) return;
  const d = drag; drag = null; sel?.classList.remove('ek-drag');
  if (d.mode === 'move' && !d.moved) return;
  const {dx, dy, sc, rot} = d.o;
  setOv(sel.dataset.ek, {dx: dx || null, dy: dy || null, sc: sc && sc !== 1 ? sc : null, rot: rot || null}, false);
  post({type:'th-sel', info:info(sel)});
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
  under = isImg(el) ? null : document.elementsFromPoint(e.clientX, e.clientY).find(x => x !== el && x.closest('#app') && isImg(x) && x.dataset.ek) || null;
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
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); post({type: e.shiftKey ? 'th-redo' : 'th-undo'}); return; }
  if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); post({type:'th-redo'}); return; }
  if (!sel || e.target.matches?.('input,textarea')) return;
  if (e.key === 'Escape') select(null);
  if (e.key === 'Enter' && textEditable(sel)) { e.preventDefault(); startText(); }
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); $(`[data-act="${sel.classList.contains('ek-layer') ? 'del' : 'hide'}"]`, bar)?.click(); }
  const mv = {ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1]}[e.key];
  if (mv) { e.preventDefault(); const st = e.shiftKey ? 10 : 1, o = D.ov?.[sel.dataset.ek] || {};
    setOv(sel.dataset.ek, {dx: (o.dx || 0) + mv[0] * st || null, dy: (o.dy || 0) + mv[1] * st || null}); }
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
  if (m.type === 'th-mode') setEdit(!!m.edit);
  if (m.type === 'th-ov-set' && D) {         // trình chỉnh sửa đổi thuộc tính → áp ngay, không dựng lại cả thiệp
    D.ov = D.ov || {}; m.o ? D.ov[m.key] = m.o : delete D.ov[m.key];
    const el = find(m.key); if (el) applyOne(el, D.ov[m.key] || {}, edit);
    if (sel && sel.dataset.ek === m.key) drawBar();
  }
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

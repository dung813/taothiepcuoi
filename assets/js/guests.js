/* ============ Danh sách khách mời (gói VIP): tải file lên → chỉnh sửa → gửi link thiệp riêng cho từng khách ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const fold = s => String(s ?? '').normalize('NFD').replace(/\p{Mn}/gu, '').replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
const slug = s => fold(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* ---------- Gói VIP ----------
   Bản tĩnh: trạng thái VIP lưu theo từng thiệp trong trình duyệt, mở bằng mã kích hoạt gửi cho khách sau khi thanh toán.
   Tạo mã cho khách: mở console trên site, chạy TH.plan.codeFor('<id thiệp>') (id nằm trên URL trang quản lý).
   Khi có backend: thay isVip / activate bằng API kiểm tra đơn hàng — mã tạo ở trình duyệt thì ai đọc code cũng tạo được. */
const SALT = 'wedstory-vip-2026';
const hash = s => { let h = 5381; for (const ch of s) h = (h * 33 + ch.charCodeAt(0)) >>> 0; return h; };
// Mã thử — CHỈ dùng được khi chạy trên máy (localhost), lên tên miền thật thì vô hiệu
const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
const DEV_CODE = 'VIP-TEST2026', DEV_ACC_CODE = 'VIPACC-TEST2026';
const mail = () => String(TH.store.get('user')?.email || '').trim().toLowerCase();
const short = s => hash(SALT + '|' + s).toString(36).toUpperCase().padStart(6, '0').slice(-6);
/* Hai loại VIP:
   - theo thiệp (plan_<id>): mã VIP-XXXXXX, chỉ mở thiệp đó;
   - theo tài khoản (vipAccounts = [email]): mã VIPACC-XXXXXX gắn với email, mở mọi thiệp khi đăng nhập email đó. */
TH.plan = {
  key: id => 'plan_' + id,
  accountVip: () => !!mail() && TH.store.get('vipAccounts', []).includes(mail()),
  isVip: id => TH.DEMO || TH.store.get(TH.plan.key(id), {}).tier === 'vip' || TH.plan.accountVip(),   // bản demo: mở cho mọi người
  codeFor: id => 'VIP-' + short(id),
  accountCodeFor: email => 'VIPACC-' + short('acc|' + String(email).trim().toLowerCase()),
  /* Trả về 'invite' | 'account' | 'login' (mã tài khoản nhưng chưa đăng nhập) | '' (sai mã) */
  activate(id, code){
    const c = String(code || '').toUpperCase().replace(/\s+/g, '');
    if (c.startsWith('VIPACC-')) {
      if (!mail()) return 'login';
      if (c !== TH.plan.accountCodeFor(mail()) && !(isLocal && c === DEV_ACC_CODE)) return '';
      TH.store.set('vipAccounts', [...new Set([...TH.store.get('vipAccounts', []), mail()])]);
      return 'account';
    }
    if (c !== TH.plan.codeFor(id) && !(isLocal && c === DEV_CODE)) return '';
    TH.store.set(TH.plan.key(id), {tier:'vip', at:Date.now()});
    return 'invite';
  }
};

/* SheetJS: chỉ tải khi cần đọc / xuất Excel */
let xlsxP;
TH.loadXlsx = () => xlsxP ||= window.XLSX ? Promise.resolve() : new Promise((ok, fail) => { const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'; s.onload = ok; s.onerror = () => { xlsxP = null; s.remove(); fail(); }; document.head.append(s); });

/* ---------- Lưu trữ: guests_<id> = {list:[khách], msg:'lời mời tuỳ chỉnh'} — tách khỏi thiệp để không lọt vào link chia sẻ ---------- */
TH.guestList = {
  key: id => 'guests_' + id,
  get: id => ({list:[], msg:'', ...TH.store.get(TH.guestList.key(id), {})}),
  put: (id, v) => TH.store.set(TH.guestList.key(id), v)
};

const BOM = String.fromCharCode(0xFEFF), BAD_CHAR = String.fromCharCode(0xFFFD);   // ký tự đầu file UTF-8 (để Excel nhận đúng dấu) / ký tự lỗi giải mã
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// 0912 345 678 · +84 912… · 84912… · 912345678 (Excel làm mất số 0 đầu) → 0912345678
const normPhone = s => { let p = String(s ?? '').replace(/[^\d+]/g, '');
  if (p.startsWith('+84')) p = '0' + p.slice(3); else if (/^84\d{9}$/.test(p)) p = '0' + p.slice(2); else if (/^[1-9]\d{8}$/.test(p)) p = '0' + p;
  return p.replace(/\+/g, ''); };
const okPhone = p => /^0\d{9,10}$/.test(p);
const VIA = {zalo:'Zalo', sms:'SMS', email:'Email'};
const ICO = {zalo:'💬', sms:'📱', email:'📧'};
const canVia = (g, v) => v === 'email' ? EMAIL.test(g.email) : okPhone(g.phone);
const bestVia = g => okPhone(g.phone) ? 'zalo' : EMAIL.test(g.email) ? 'email' : 'zalo';
const reachable = g => okPhone(g.phone) || EMAIL.test(g.email);
const mk = (o = {}) => { const g = {id:'k' + TH.uid(), name:'', phone:'', email:'', grp:'', note:'', via:'', sent:0, sentVia:'', ...o}; g.via = g.via || bestVia(g); return g; };

/* ---------- Đọc file ---------- */
const parseCsv = text => {
  if (text.startsWith(BOM)) text = text.slice(1);
  const first = text.split(/\r?\n/, 1)[0];
  const d = ['\t', ';', ','].map(c => [c, first.split(c).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; continue; }
    if (c === '"') q = true;
    else if (c === d) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
};
const readFile = async file => {
  const ext = file.name.split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'ods'].includes(ext)) {
    await TH.loadXlsx();
    const wb = XLSX.read(await file.arrayBuffer(), {type:'array'});
    return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, raw:false, defval:''});
  }
  if (['csv', 'txt', 'tsv'].includes(ext)) {
    const buf = await file.arrayBuffer();
    let text = new TextDecoder('utf-8').decode(buf);
    if (text.includes(BAD_CHAR)) text = new TextDecoder('windows-1258').decode(buf);   // CSV Excel cũ trên Windows (không phải UTF-8)
    return parseCsv(text);
  }
  throw new Error('type');
};

/* Nhận diện cột theo tiêu đề (không dấu, không phân biệt hoa thường) */
const COLS = [
  ['name',  'Họ tên',     /^(ho (va )?ten|ten|ten khach( moi)?|khach( moi)?|nguoi nhan|name|full ?name|guest( name)?)$/],
  ['phone', 'Điện thoại', /(dien thoai|sdt|so dt|phone|mobile|zalo|di dong|lien he)/],
  ['email', 'Email',      /(e-?mail|gmail|thu dien tu)/],
  ['grp',   'Nhóm',       /^(nhom|nhom khach|group|moi quan he|quan he)$/],
  ['side',  'Bên',        /^(ben|phia|khach ben|ben nha)$/],
  ['note',  'Ghi chú',    /(ghi chu|note|chu thich)/]
];
const fromRows = raw => {
  const rows = raw.map(r => r.map(c => String(c ?? '').replace(/^="(.*)"$/, '$1').trim())).filter(r => r.some(Boolean));
  let hi = -1, map = {};
  for (let i = 0; i < Math.min(5, rows.length) && hi < 0; i++) {   // dòng tiêu đề nằm trong 5 dòng đầu
    const m = {};
    rows[i].forEach((c, j) => { const f = fold(c), col = COLS.find(([k, , re]) => !(k in m) && re.test(f)); if (col) m[col[0]] = j; });
    if ('name' in m) { hi = i; map = m; }
  }
  let skipped = 0;
  const list = (hi >= 0 ? rows.slice(hi + 1) : rows).map(r => {
    let o;
    if (hi >= 0) o = Object.fromEntries(Object.entries(map).map(([k, j]) => [k, r[j] || '']));
    else {   // không có tiêu đề: đoán theo nội dung từng ô
      o = {};
      r.forEach(c => {
        if (!o.email && EMAIL.test(c)) o.email = c;
        else if (!o.phone && !/\p{L}/u.test(c) && okPhone(normPhone(c))) o.phone = c;
        else if (!o.name && /\p{L}/u.test(c)) o.name = c;
      });
    }
    const name = (o.name || '').replace(/\s+/g, ' ').trim();
    if (!name) { skipped++; return null; }
    const side = fold(o.side), grpText = (o.grp || '').trim() || (/gai/.test(side) ? 'Khách nhà gái' : /trai/.test(side) ? 'Khách nhà trai' : '');
    return mk({name, phone:normPhone(o.phone), email:(o.email || '').trim().toLowerCase(), note:(o.note || '').trim(), grpText});
  }).filter(Boolean);
  return {list, skipped, cols: hi >= 0 ? COLS.filter(([k]) => k in map).map(([, n]) => n) : null};
};

const saveBlob = (blob, name) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); };
const toCsv = rows => BOM + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
const go = href => { const a = Object.assign(document.createElement('a'), {href, rel:'noopener'}); if (/^https?:/.test(href)) a.target = '_blank'; document.body.append(a); a.click(); a.remove(); };

const DEFAULT_MSG = 'Trân trọng kính mời {ten} đến dự lễ cưới của {chure} & {codau} vào lúc {ngay}.\nSự hiện diện của bạn là niềm vinh hạnh của gia đình chúng mình 💕\nXem thiệp mời: {link}';
const KEYS = [['ten', 'Tên khách'], ['chure', 'Chú rể'], ['codau', 'Cô dâu'], ['ngay', 'Ngày giờ'], ['link', 'Link thiệp']];
const HINT = {
  zalo:'Lời mời được sao chép sẵn và Zalo mở đúng cuộc trò chuyện — bạn chỉ cần dán (Ctrl+V / giữ để dán) rồi bấm Gửi.',
  sms:'Mở ứng dụng Tin nhắn với nội dung soạn sẵn (dùng tốt nhất trên điện thoại).',
  email:'Mở ứng dụng email với tiêu đề và nội dung soạn sẵn.'
};

/* ---------- Khu vực quản lý danh sách ---------- */
TH.adminGuests = (root, id, D, {onGroups} = {}) => {
  const S = TH.guestList.get(id);
  const save = () => TH.guestList.put(id, S);
  const sel = new Set();
  let q = '', filter = 'all';

  const groups = () => D.groups || [];
  const grpName = gid => groups().find(x => x.id === gid)?.name || '';
  const find = k => S.list.find(g => g.id === k);
  const rsvpMap = () => { const m = new Map(); TH.guestbook.get(id).rsvp.forEach(r => { const k = fold(r.name); if (!m.has(k)) m.set(k, r); }); return m; };
  const subject = () => `Thiệp mời cưới ${D.groom.nick} & ${D.bride.nick}`;
  // Ngày giờ theo nhóm của khách: nhóm chỉ dự Lễ Vu Quy thì lời mời ghi giờ Lễ Vu Quy
  const dateOf = g => { const c = {events:D.events, groups:D.groups, date:D.date}; TH.applyGroup(c, g.grp); const d = new Date(c.date);
    return isNaN(d) ? '' : d.toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', weekday:'long', day:'2-digit', month:'2-digit', year:'numeric'}); };
  const fill = (g, link) => { let t = S.msg || DEFAULT_MSG; if (!t.includes('{link}')) t += '\n{link}';
    return t.replace(/\{(ten|chure|codau|ngay|link)\}/g, (_, k) => ({ten:g.name, chure:D.groom.nick, codau:D.bride.nick, ngay:dateOf(g), link})[k]); };
  // Nén dữ liệu thiệp một lần cho cả loạt link (nén lại cho từng khách sẽ rất chậm với vài trăm khách)
  const linker = () => { const packed = TH.packInvite(D);
    return g => TH.inviteUrl(id, null, g.name, {grp: groups().some(x => x.id === g.grp) ? g.grp : ''}) + (packed ? '#d=' + packed : ''); };

  const visible = rs => { const k = fold(q);
    return S.list.filter(g => (!k || fold(`${g.name} ${g.phone} ${g.email} ${grpName(g.grp)}`).includes(k)) &&
      (filter === 'all' || (filter === 'unsent' && !g.sent) || (filter === 'sent' && g.sent) || (filter === 'rsvp' && rs.has(fold(g.name))) || (filter === 'nocontact' && !reachable(g)))); };

  const status = (g, r) => (g.sent ? `<span class="pill sent">Đã gửi · ${VIA[g.sentVia] || 'Tự động'} ${new Date(g.sent).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}</span>` : '<span class="pill wait">Chưa gửi</span>')
    + (r ? ` <span class="pill ${r.attend}">${r.attend === 'yes' ? '✓ Sẽ đến' : '✗ Không đến'}</span>` : '');
  const row = (g, rs, r = rs.get(fold(g.name))) => `<tr data-k="${g.id}" class="${sel.has(g.id) ? 'on' : ''}">
    <td><input type="checkbox" data-sel ${sel.has(g.id) ? 'checked' : ''} aria-label="Chọn ${esc(g.name)}"></td>
    <td><input data-f="name" value="${esc(g.name)}" placeholder="Nhập tên khách" class="${g.name ? '' : 'bad'}" aria-label="Tên khách"></td>
    <td><input data-f="phone" value="${esc(g.phone)}" inputmode="tel" placeholder="Thêm SĐT" class="${g.phone && !okPhone(g.phone) ? 'bad' : ''}" aria-label="Điện thoại"></td>
    <td><input data-f="email" value="${esc(g.email)}" type="email" placeholder="Thêm email" class="${g.email && !EMAIL.test(g.email) ? 'bad' : ''}" aria-label="Email"></td>
    <td><select data-f="grp" aria-label="Nhóm"><option value="">— Không nhóm —</option>${groups().map(x => `<option value="${x.id}" ${x.id === g.grp ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></td>
    <td><select data-f="via" class="${canVia(g, g.via) ? '' : 'bad'}" aria-label="Gửi qua">${Object.entries(VIA).map(([k, n]) => `<option value="${k}" ${k === g.via ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
    <td class="gl-st">${status(g, r)}</td>
    <td class="gl-act"><button class="ic-btn" data-act="copy" title="Sao chép link mời riêng" aria-label="Sao chép link">🔗</button><button class="ic-btn" data-act="send1" title="Gửi cho khách này" aria-label="Gửi">📨</button><button class="ic-btn" data-act="del" title="Xoá khách" aria-label="Xoá">🗑</button></td></tr>`;

  const drawLock = () => {
    root.innerHTML = `<div class="gl-lock">
      <div class="gl-lock-ico">👑</div>
      <h4>Tính năng dành cho gói Tự tạo VIP</h4>
      <ul><li>Tải lên danh sách khách từ Excel / CSV — tự nhận cột Tên, SĐT, Email, Nhóm</li>
        <li>Chỉnh sửa, tìm kiếm, gán nhóm khách ngay trên bảng</li>
        <li>Gửi link thiệp mời riêng có tên từng khách qua Zalo, SMS hoặc Email</li>
        <li>Theo dõi ai đã được gửi, ai đã xác nhận tham dự · xuất Excel kèm link</li></ul>
      <a class="btn btn-primary btn-sm" href="bang-gia.html">👑 Nâng cấp VIP – 199.000đ</a>
      <form class="gl-code"><span class="muted">Đã thanh toán?</span><input name="c" required placeholder="Mã kích hoạt, VD: VIP-AB12CD" aria-label="Mã kích hoạt VIP"><button class="btn btn-outline btn-sm">Kích hoạt</button></form>
    </div>`;
    $('.gl-code', root).onsubmit = e => { e.preventDefault();
      const r = TH.plan.activate(id, e.target.elements.c.value);
      if (r === 'login') return TH.openAuth('login'), TH.toast('Đây là mã VIP tài khoản — hãy đăng nhập trước rồi nhập lại mã');
      if (!r) return TH.toast('Mã kích hoạt không đúng — kiểm tra lại giúp bạn nhé');
      TH.toast(r === 'account' ? '👑 Tài khoản của bạn đã là VIP — mọi thiệp đều được mở khoá' : '🎉 Đã kích hoạt gói VIP cho thiệp này');
      if (r === 'account') setTimeout(() => location.reload(), 900);   // tải lại để header hiện huy hiệu VIP
      else draw(); };
  };

  const ACCEPT = '.xlsx,.xls,.ods,.csv,.txt';
  const draw = () => {
    if (!TH.plan.isVip(id)) return drawLock();
    const has = S.list.length;
    root.innerHTML = `
    <div class="gl-tools">
      <label class="btn btn-primary btn-sm gl-up">⬆ Tải lên danh sách<input type="file" accept="${ACCEPT}" hidden></label>
      <button class="btn btn-outline btn-sm" data-act="sample">⬇ File mẫu</button>
      <button class="btn btn-outline btn-sm" data-act="add">+ Thêm khách</button>
      ${has ? `<span class="gl-sp"></span><input type="search" class="gl-q" data-act="q" value="${esc(q)}" placeholder="Tìm tên, SĐT, email, nhóm…" aria-label="Tìm khách">
      <select class="gl-f" data-act="filter" aria-label="Lọc">${[['all', 'Tất cả'], ['unsent', 'Chưa gửi'], ['sent', 'Đã gửi'], ['rsvp', 'Đã phản hồi'], ['nocontact', 'Thiếu SĐT / email']]
        .map(([k, n]) => `<option value="${k}" ${k === filter ? 'selected' : ''}>${n}</option>`).join('')}</select>` : ''}
    </div>
    ${has ? `<div class="ksum gl-sum"></div>
      <div class="table-wrap gl-wrap"><table class="tbl gl-tbl"><thead><tr><th><input type="checkbox" data-act="all" aria-label="Chọn tất cả"></th><th>Tên khách</th><th>Điện thoại / Zalo</th><th>Email</th><th>Nhóm</th><th>Gửi qua</th><th>Trạng thái</th><th></th></tr></thead><tbody></tbody></table></div>
      <div class="gl-bulk"></div>`
    : `<label class="gl-drop"><input type="file" accept="${ACCEPT}" hidden><i>📄</i><b>Kéo thả file danh sách khách vào đây</b>
        <span>hoặc bấm để chọn file Excel (.xlsx, .xls) hoặc .csv</span><span>Nên có các cột: <b>Họ tên</b> · Điện thoại/Zalo · Email · Nhóm — không có tiêu đề cũng được</span></label>`}
    <details class="gl-msg" ${S.msg ? 'open' : ''}><summary>✏️ Lời mời gửi kèm link (tuỳ chỉnh được)</summary>
      <textarea data-act="msg" rows="4" aria-label="Lời mời">${esc(S.msg || DEFAULT_MSG)}</textarea>
      <div class="gl-keys"><span class="muted">Chèn:</span>${KEYS.map(([k, n]) => `<button type="button" class="chip" data-act="key" data-key="{${k}}">${n}</button>`).join('')}
        <button type="button" class="btn btn-ghost btn-sm" data-act="msg-reset">Khôi phục mặc định</button></div></details>`;
    paint();
  };

  const paintSum = (rs = rsvpMap()) => { const L = S.list;
    $('.gl-sum', root).innerHTML = [['Tổng khách', L.length], ['Có SĐT / Zalo', L.filter(g => okPhone(g.phone)).length], ['Có email', L.filter(g => EMAIL.test(g.email)).length],
      ['Đã gửi', L.filter(g => g.sent).length], ['Đã phản hồi', L.filter(g => rs.has(fold(g.name))).length]].map(([l, v]) => `<div><small>${l}</small><b>${v}</b></div>`).join(''); };
  const paint = () => {
    if (!TH.plan.isVip(id) || !S.list.length !== !$('.gl-tbl', root)) return draw();   // chuyển giữa trạng thái trống / có khách
    if (!S.list.length) return;
    const rs = rsvpMap(), shown = visible(rs);
    [...sel].forEach(k => find(k) || sel.delete(k));
    paintSum(rs);
    $('.gl-tbl tbody', root).innerHTML = shown.map(g => row(g, rs)).join('') || '<tr><td colspan="8" class="muted">Không có khách phù hợp bộ lọc.</td></tr>';
    paintSel(shown);
  };
  /* Chỉ cập nhật phần liên quan tới ô chọn: thanh thao tác + ô "chọn tất cả" (không vẽ lại bảng) */
  const paintSel = (shown = visible(rsvpMap())) => {
    const all = $('[data-act=all]', root); all.checked = shown.length > 0 && shown.every(g => sel.has(g.id)); all.indeterminate = !all.checked && shown.some(g => sel.has(g.id));
    $$('.gl-tbl tbody tr[data-k]', root).forEach(tr => { const on = sel.has(tr.dataset.k); tr.classList.toggle('on', on); $('[data-sel]', tr).checked = on; });
    const todo = S.list.filter(g => !g.sent && reachable(g)).length;
    $('.gl-bulk', root).innerHTML = `<span>${sel.size ? `Đã chọn <b>${sel.size}</b> khách` : `<b>${todo}</b> khách chưa được gửi thiệp`}</span>
      <button class="btn btn-primary btn-sm" data-act="send" ${sel.size || todo ? '' : 'disabled'}>📨 ${sel.size ? `Gửi cho ${sel.size} khách đã chọn` : `Gửi cho ${todo} khách chưa gửi`}</button>
      ${sel.size ? `<button class="btn btn-outline btn-sm" data-act="unmark">↺ Đánh dấu chưa gửi</button><button class="btn btn-ghost btn-sm" data-act="delsel" style="color:#b33">🗑 Xoá đã chọn</button><button class="btn btn-ghost btn-sm" data-act="clearsel">Bỏ chọn</button>` : ''}
      <span class="gl-sp"></span><button class="btn btn-outline btn-sm" data-act="export">⬇ Xuất Excel kèm link riêng</button>`;
  };

  /* Cập nhật tại chỗ sau khi sửa một ô — không vẽ lại cả dòng để con trỏ không bị mất khi bấm Tab sang ô kế */
  const fixRow = (tr, g) => {
    $('[data-f=name]', tr).classList.toggle('bad', !g.name);
    $('[data-f=phone]', tr).classList.toggle('bad', !!g.phone && !okPhone(g.phone));
    $('[data-f=email]', tr).classList.toggle('bad', !!g.email && !EMAIL.test(g.email));
    const v = $('[data-f=via]', tr); v.value = g.via; v.classList.toggle('bad', !canVia(g, g.via));
    $('.gl-st', tr).innerHTML = status(g, rsvpMap().get(fold(g.name)));
  };

  /* ---------- Nhập file ---------- */
  const linkGroups = list => {
    TH.ensureEventIds(D); let made = 0;
    list.forEach(g => { const n = g.grpText; delete g.grpText; if (!n) return;
      let gr = groups().find(x => fold(x.name) === fold(n));
      if (!gr) { D.groups = groups(); gr = {id:'g' + TH.uid(), name:n, events:(D.events || []).map(e => e.id), guests:''}; D.groups.push(gr); made++; }
      g.grp = gr.id; });
    if (made) { TH.invites.save(id, D); onGroups?.(); }
    return made;
  };
  const importFile = async file => {
    if (!file) return;
    let rows;
    try { rows = await readFile(file); }
    catch (e) { TH.toast(e?.message === 'type' ? 'Chỉ hỗ trợ file Excel (.xlsx, .xls) hoặc .csv' : 'Không đọc được file — kiểm tra lại định dạng hoặc kết nối mạng'); return; }
    const res = fromRows(rows);
    if (!res.list.length) return TH.toast('Không tìm thấy tên khách nào trong file');
    preview(file.name, res);
  };
  const preview = (fname, res) => {
    const keyOf = g => fold(g.name) + '|' + g.phone, dedupe = (list, seen) => list.filter(g => { const k = keyOf(g); if (seen.has(k)) return false; seen.add(k); return true; });
    const uniq = dedupe(res.list, new Set()), fresh = dedupe(res.list, new Set(S.list.map(keyOf)));
    const n = res.list.length, dup = n - fresh.length, noC = res.list.filter(g => !reachable(g)).length;
    const m = TH.modal(`<div class="gl-imp-box"><h3 class="gl-mh">Đọc được ${n} khách từ file</h3>
      <p class="muted">${esc(fname)} · ${res.cols ? 'Nhận diện cột: ' + res.cols.join(', ') : 'File không có dòng tiêu đề — đã tự nhận tên, SĐT, email theo nội dung'}</p>
      <div class="gl-imp"><span><b>${res.list.filter(g => okPhone(g.phone)).length}</b> có SĐT / Zalo</span><span><b>${res.list.filter(g => EMAIL.test(g.email)).length}</b> có email</span>
        ${noC ? `<span class="warn">${noC} khách thiếu SĐT &amp; email</span>` : ''}${dup ? `<span>${dup} khách trùng — sẽ bỏ qua</span>` : ''}${res.skipped ? `<span>${res.skipped} dòng không có tên — bỏ qua</span>` : ''}</div>
      <div class="table-wrap"><table class="tbl"><tr><th>Tên</th><th>Điện thoại</th><th>Email</th><th>Nhóm</th></tr>
        ${res.list.slice(0, 6).map(g => `<tr><td>${esc(g.name)}</td><td>${esc(g.phone)}</td><td>${esc(g.email)}</td><td>${esc(g.grpText)}</td></tr>`).join('')}</table></div>
      ${n > 6 ? `<p class="muted" style="margin-top:6px">… và ${n - 6} khách khác</p>` : ''}
      <div class="gl-mbtn"><button class="btn btn-primary btn-sm" data-imp="add" ${fresh.length ? '' : 'disabled'}>${fresh.length ? `Thêm ${fresh.length} khách vào danh sách` : 'Không có khách mới'}</button>
        ${S.list.length ? `<button class="btn btn-outline btn-sm" data-imp="replace">Thay thế toàn bộ (${S.list.length} → ${uniq.length} khách)</button>` : ''}</div></div>`);
    m.querySelector('.modal-box').style.maxWidth = '620px';
    $('.gl-imp-box', m).onclick = e => { const b = e.target.closest('[data-imp]'); if (!b) return;
      if (b.dataset.imp === 'replace' && !confirm(`Thay toàn bộ ${S.list.length} khách hiện có bằng danh sách mới? Trạng thái "đã gửi" của danh sách cũ sẽ mất.`)) return;
      const list = b.dataset.imp === 'add' ? fresh : uniq, made = linkGroups(list);
      S.list = b.dataset.imp === 'add' ? [...S.list, ...list] : list; sel.clear(); q = ''; filter = 'all'; save();
      TH.closeModal(); draw();
      TH.toast(`Đã nhập ${list.length} khách${made ? ` · tạo thêm ${made} nhóm khách` : ''}`);
    };
  };

  /* ---------- Gửi thiệp ----------
     Gửi tự động qua máy chủ: đặt TH.SEND_API = 'https://…/send' (nhận POST {invite, subject, items:[{guest, name, channel, to, link, message}]},
     trả 2xx khi đã nhận). Chưa có máy chủ thì gửi lần lượt từng khách qua Zalo / SMS / Email ngay trên máy này. */
  const deliver = (g, via, msg) => {
    if (via === 'zalo') { navigator.clipboard?.writeText(msg).catch(() => {}); go('https://zalo.me/' + g.phone); TH.toast('Đã sao chép lời mời — dán vào khung chat Zalo rồi bấm Gửi'); }
    if (via === 'sms') go(`sms:${g.phone}${/iPhone|iPad|iPod/.test(navigator.userAgent) ? '&' : '?'}body=${encodeURIComponent(msg)}`);
    if (via === 'email') go(`mailto:${g.email}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(msg)}`);
  };
  const mark = (g, via) => { g.sent = Date.now(); g.sentVia = via; save(); paint(); };

  const sendFlow = list => {
    const targets = list.filter(reachable), miss = list.length - targets.length;
    if (!targets.length) return TH.toast('Các khách đã chọn chưa có SĐT hoặc email hợp lệ');
    if (miss) TH.toast(`Bỏ qua ${miss} khách chưa có SĐT / email`);
    const url = linker(); let i = 0, done = 0;
    const m = TH.modal('<div class="gl-sw"></div>'); m.querySelector('.modal-box').style.maxWidth = '560px';
    const box = $('.gl-sw', m);
    const step = () => {
      if (i >= targets.length) {
        box.innerHTML = `<div class="gl-done"><div>🎉</div><h3 class="gl-mh">Hoàn tất!</h3><p>Đã gửi thiệp cho <b>${done}</b>/${targets.length} khách.</p><button class="btn btn-primary btn-sm" data-sw="close">Đóng</button></div>`; return;
      }
      const g = targets[i], msg = fill(g, url(g));
      box.innerHTML = `<div class="gl-prog"><span>Khách <b>${i + 1}</b>/${targets.length}</span><span>Đã gửi ${done}</span></div>
        <div class="gl-bar"><i style="width:${i / targets.length * 100}%"></i></div>
        ${TH.SEND_API && i === 0 && targets.length > 1 ? `<button class="btn btn-primary btn-sm gl-auto" data-sw="auto">⚡ Gửi tự động cho cả ${targets.length} khách qua máy chủ</button><p class="muted gl-or">— hoặc gửi lần lượt từng khách —</p>` : ''}
        <h3 class="gl-mh">${esc(g.name)}</h3>
        <p class="muted">${[g.phone, g.email, grpName(g.grp)].filter(Boolean).map(esc).join(' · ')}${g.sent ? ' · <span class="warn">đã gửi trước đó</span>' : ''}</p>
        <label class="gl-lbl">Lời mời sẽ gửi (sửa riêng cho khách này được)<textarea rows="5" data-sw="msg">${esc(msg)}</textarea></label>
        <div class="gl-ch">${Object.keys(VIA).map(v => `<button class="btn ${v === g.via ? 'btn-primary' : 'btn-outline'} btn-sm" data-sw="${v}" ${canVia(g, v) ? '' : 'disabled'}>${ICO[v]} Gửi qua ${VIA[v]}</button>`).join('')}</div>
        <p class="hint gl-hint">${HINT[g.via]}</p>
        <div class="gl-nav"><button class="btn btn-ghost btn-sm" data-sw="prev" ${i ? '' : 'disabled'}>← Khách trước</button><button class="btn btn-ghost btn-sm" data-sw="skip">Bỏ qua →</button></div>`;
    };
    box.onclick = async e => {
      const b = e.target.closest('[data-sw]'); if (!b || b.disabled) return;
      const act = b.dataset.sw;
      if (act === 'close') return TH.closeModal();
      if (act === 'prev') { i--; return step(); }
      if (act === 'skip') { i++; return step(); }
      if (act === 'auto') {
        b.disabled = true; b.textContent = 'Đang gửi…';
        const rest = targets.slice(i);
        try {
          const items = rest.map(g => { const l = url(g); return {guest:g.id, name:g.name, channel:g.via, to:g.via === 'email' ? g.email : g.phone, link:l, message:fill(g, l)}; });
          const res = await fetch(TH.SEND_API, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({invite:id, subject:subject(), items})});
          if (!res.ok) throw new Error(res.status);
          const now = Date.now(); rest.forEach(g => { g.sent = now; g.sentVia = 'auto'; }); save(); paint();
          done += rest.length; i = targets.length; step();
        } catch { TH.toast('Máy chủ gửi không phản hồi — bạn có thể gửi lần lượt bên dưới'); b.disabled = false; b.textContent = '⚡ Thử gửi tự động lại'; }
        return;
      }
      if (VIA[act]) {
        const g = targets[i];
        deliver(g, act, $('[data-sw=msg]', box).value);
        if (!g.sent) done++;
        mark(g, act); i++; step();
      }
    };
    step();
  };

  /* ---------- Xuất Excel kèm link riêng (dùng cho Gmail mail-merge, Zalo OA, SMS brandname…) ---------- */
  const exportList = async () => {
    const url = linker(), rs = rsvpMap();
    const head = ['STT', 'Tên khách', 'Điện thoại', 'Email', 'Nhóm', 'Gửi qua', 'Link thiệp riêng', 'Lời mời', 'Đã gửi lúc', 'Phản hồi'];
    const rows = S.list.map((g, i) => { const l = url(g), r = rs.get(fold(g.name));
      return [i + 1, g.name, g.phone, g.email, grpName(g.grp), VIA[g.via], l, fill(g, l), g.sent ? new Date(g.sent).toLocaleString('vi-VN') : '', r ? (r.attend === 'yes' ? 'Sẽ đến' : 'Không đến') : '']; });
    const base = `khach-moi-${slug(D.groom.nick)}-${slug(D.bride.nick)}`;
    try {
      await TH.loadXlsx();
      const ws = XLSX.utils.aoa_to_sheet([head, ...rows]);
      ws['!cols'] = [5, 24, 13, 26, 20, 8, 60, 60, 18, 11].map(wch => ({wch}));
      const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Khách mời');
      XLSX.writeFile(wb, base + '.xlsx');
    } catch {   // mất mạng: xuất CSV (="0912…" để Excel giữ số 0 đầu)
      saveBlob(new Blob([toCsv([head, ...rows.map(r => r.map((c, j) => j === 2 && c ? `="${c}"` : c))])], {type:'text/csv;charset=utf-8'}), base + '.csv');
    }
  };

  /* ---------- Sự kiện ---------- */
  root.addEventListener('input', e => { if (e.target.dataset.act === 'q') { q = e.target.value; paint(); } });
  root.addEventListener('change', e => {
    const t = e.target, tr = t.closest('tr[data-k]');
    if (t.type === 'file') { importFile(t.files[0]); t.value = ''; return; }
    if (t.dataset.act === 'filter') { filter = t.value; paint(); return; }
    if (t.dataset.act === 'msg') { S.msg = t.value.trim() === DEFAULT_MSG ? '' : t.value; save(); return; }
    if (t.dataset.act === 'all') { const shown = visible(rsvpMap()); shown.forEach(g => t.checked ? sel.add(g.id) : sel.delete(g.id)); paintSel(shown); return; }
    if (!tr) return;
    const g = find(tr.dataset.k);
    if (t.hasAttribute('data-sel')) { t.checked ? sel.add(g.id) : sel.delete(g.id); paintSel(); return; }
    const f = t.dataset.f; if (!f) return;
    let v = t.value.trim();
    if (f === 'name') v = v.replace(/\s+/g, ' ');
    if (f === 'phone') v = v && normPhone(v);
    if (f === 'email') v = v.toLowerCase();
    g[f] = v; if (t.tagName === 'INPUT') t.value = v;
    if ((f === 'phone' || f === 'email') && !canVia(g, g.via)) g.via = bestVia(g);
    save(); fixRow(tr, g); paintSum();
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT' || b.tagName === 'TEXTAREA') return;
    const act = b.dataset.act, g = find(b.closest('tr[data-k]')?.dataset.k);
    if (act === 'sample') saveBlob(new Blob([toCsv([['STT', 'Họ tên', 'Điện thoại', 'Email', 'Nhóm', 'Ghi chú'],
      [1, 'Cô Ba Hạnh', '="0912345678"', '', 'Họ hàng nhà gái', ''], [2, 'Anh Tuấn & Người thương', '="0987654321"', 'tuan@gmail.com', 'Bạn bè & đồng nghiệp', 'Bạn đại học']])], {type:'text/csv;charset=utf-8'}), 'mau-danh-sach-khach-moi.csv');
    if (act === 'add') { S.list.unshift(mk()); save(); q = ''; filter = 'all'; draw(); $('.gl-tbl tbody [data-f=name]', root)?.focus(); }
    if (act === 'copy') navigator.clipboard.writeText(TH.inviteUrl(id, D, g.name, {grp: groups().some(x => x.id === g.grp) ? g.grp : ''}))
      .then(() => TH.toast(`Đã sao chép link mời ${g.name}`), () => TH.toast('Trình duyệt chặn sao chép — hãy dùng nút 📨'));
    if (act === 'send1') { if (!g.name) return TH.toast('Nhập tên khách trước đã'); sendFlow([g]); }
    if (act === 'del' && (!g.name || confirm(`Xoá "${g.name}" khỏi danh sách?`))) { S.list = S.list.filter(x => x !== g); sel.delete(g.id); save(); paint(); }
    if (act === 'send') sendFlow(sel.size ? S.list.filter(x => sel.has(x.id) && x.name) : S.list.filter(x => !x.sent && x.name));
    if (act === 'unmark') { S.list.forEach(x => { if (sel.has(x.id)) { x.sent = 0; x.sentVia = ''; } }); save(); paint(); }
    if (act === 'delsel' && confirm(`Xoá ${sel.size} khách đã chọn?`)) { S.list = S.list.filter(x => !sel.has(x.id)); sel.clear(); save(); paint(); }
    if (act === 'clearsel') { sel.clear(); paintSel(); }
    if (act === 'export') exportList();
    if (act === 'key') { const ta = $('[data-act=msg]', root); ta.setRangeText(b.dataset.key, ta.selectionStart, ta.selectionEnd, 'end'); ta.focus(); S.msg = ta.value; save(); }
    if (act === 'msg-reset') { S.msg = ''; save(); $('[data-act=msg]', root).value = DEFAULT_MSG; TH.toast('Đã khôi phục lời mời mặc định'); }
  });
  // Kéo thả file vào cả khu vực
  root.addEventListener('dragover', e => { if (!TH.plan.isVip(id) || !e.dataTransfer.types.includes('Files')) return; e.preventDefault(); root.classList.add('gl-over'); });
  root.addEventListener('dragleave', e => { if (!root.contains(e.relatedTarget)) root.classList.remove('gl-over'); });
  root.addEventListener('drop', e => { if (!e.dataTransfer.files.length || !TH.plan.isVip(id)) return; e.preventDefault(); root.classList.remove('gl-over'); importFile(e.dataTransfer.files[0]); });

  draw();
  return {refresh: paint};
};
})();

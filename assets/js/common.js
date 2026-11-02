/* ============ Dùng chung: header, footer, hiệu ứng, lưu trữ ============ */
(function(){
const TH = window.TH;
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
TH.$ = $; TH.$$ = $$;
TH.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
TH.fmtDate = d => { const x = new Date(d); return isNaN(x) ? '' : x.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'}); };
TH.qs = k => new URLSearchParams(location.search).get(k);

const LOGO = `<svg viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="19" fill="#fdf3f4" stroke="#c8506a" stroke-width="1.5"/><path d="M20 29s-8-4.8-8-10.2A4.6 4.6 0 0 1 20 16a4.6 4.6 0 0 1 8 2.8C28 24.2 20 29 20 29z" fill="#c8506a"/></svg>`;
const ICON = {
  fb:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/></svg>',
  ig:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  tt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.4 1.7 3.9 4 4v3.2c-1.5 0-2.8-.4-4-1.2V15a6 6 0 1 1-6-6v3.3a2.7 2.7 0 1 0 2.7 2.7V3H16z"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg>'
};
TH.LOGO = LOGO;

/* Hotline & Zalo tư vấn — đổi số thật tại đây */
TH.HOTLINE = '0389507128'; TH.HOTLINE_TEXT = '0389 507 128'; TH.ZALO = 'https://zalo.me/' + TH.HOTLINE;
/* Thông tin liên hệ dùng chung: footer, trang Liên hệ, trang Dịch vụ trọn gói đều đọc từ đây (qua data-c="…") */
TH.CONTACT = {email:'wedstoryok@gmail.com', hotline:TH.HOTLINE, hotlineText:TH.HOTLINE_TEXT, zalo:TH.ZALO, address:'Hà Nội, Việt Nam',
  hours:['Thứ 2 – Thứ 7: 8:00 – 22:30', 'Chủ nhật & ngày lễ: 9:00 – 21:00'], hoursShort:'T2–T7: 8:00–22:30, CN: 9:00–21:00'};

/* Bản demo trình bày: mọi người dùng được toàn bộ tính năng VIP. Đặt false khi bán thật để quay về kiểm tra tài khoản VIP. */
TH.DEMO = true;
TH.isVip = () => { if (TH.DEMO) return true; const u = TH.store.get('user'); return !!u && TH.store.get('vipAccounts', []).includes(String(u.email || '').trim().toLowerCase()); };

// So khớp trang cho menu: chấp nhận cả /bang-gia.html, /bang-gia (Vercel cleanUrls) và /
const pageKey = p => (p.split(/[?#]/)[0].split('/').pop() || 'index').replace(/.html$/, '');
const NAV_ALIAS = {'bai-viet':'cam-nang'};

const NAV = [
  ['index.html','Trang chủ'],
  ['mau-thiep.html','Mẫu thiệp'],
  ['bang-gia.html','Bảng giá'],
  ['cam-nang.html','Cẩm nang'],
  ['dich-vu-tron-goi.html','Tạo thiệp trọn gói <span class="hot">HOT</span>','nav-hl']
];

function header(){
  const page = NAV_ALIAS[pageKey(location.pathname)] || pageKey(location.pathname);
  const user = TH.store.get('user');
  const el = document.createElement('header');
  el.className = 'header';
  el.innerHTML = `<div class="container">
    <a href="index.html" class="logo" aria-label="WEDSTORY – Trang chủ">${LOGO}<span class="brand">WED<em>STORY</em></span></a>
    <nav class="nav">${NAV.map(([h,t,c])=>`<a href="${h}" class="${c||''} ${pageKey(h)===page?'active':''}"${pageKey(h)===page?' aria-current="page"':''}>${t}</a>`).join('')}</nav>
    <div class="header-actions">
      ${user ? `<a href="thiep-da-tao.html?mine=1" class="btn btn-ghost btn-sm">👋 ${TH.esc(user.name)}${TH.isVip() ? ' <span class="vip-tag">VIP</span>' : ''}</a><button class="btn btn-ghost btn-sm" data-logout>Đăng xuất</button>`
             : `<button class="btn btn-ghost btn-sm" data-auth="login">Đăng nhập</button><button class="btn btn-primary btn-sm" data-auth="register">Đăng ký</button>`}
      <button class="burger" aria-label="Menu"><span></span></button>
    </div></div>`;
  document.body.prepend(el);
  $('.burger', el).onclick = () => document.body.classList.toggle('menu-open');
  $$('.nav a', el).forEach(a => a.onclick = () => document.body.classList.remove('menu-open'));
  addEventListener('scroll', () => el.classList.toggle('scrolled', scrollY > 10), {passive:true});
  $$('[data-auth]', el).forEach(b => b.onclick = () => openAuth(b.dataset.auth));
  const lo = $('[data-logout]', el); if (lo) lo.onclick = () => { TH.store.del('user'); location.reload(); };
}

function footer(){
  const el = document.createElement('footer');
  el.className = 'footer';
  el.innerHTML = `<div class="container"><div class="footer-grid">
    <div><a href="index.html" class="logo" aria-label="WEDSTORY – Trang chủ">${LOGO}<span class="brand">WED<em>STORY</em></span></a>
      <p style="font-size:.92rem;max-width:300px">Nền tảng tạo thiệp cưới online miễn phí — đẹp, hiện đại và đầy cảm xúc. Kể câu chuyện tình yêu của bạn theo cách riêng.</p>
      <div class="socials"><a href="#" data-soon aria-label="Facebook">${ICON.fb}</a><a href="#" data-soon aria-label="Instagram">${ICON.ig}</a><a href="#" data-soon aria-label="TikTok">${ICON.tt}</a></div></div>
    <div><h4>Sản phẩm</h4><ul>
      <li><a href="mau-thiep.html">Mẫu thiệp</a></li><li><a href="thiep-da-tao.html">Thiệp khách hàng</a></li>
      <li><a href="dich-vu-tron-goi.html">Thiết kế trọn gói</a></li><li><a href="bang-gia.html">Bảng giá</a></li>
      <li><a href="lien-he.html">Chương trình đối tác</a></li></ul></div>
    <div><h4>Cẩm nang</h4><ul>${TH.POSTS.slice(0,5).map(p=>`<li><a href="bai-viet.html?slug=${p.slug}">${TH.esc(p.title.length>38?p.title.slice(0,38)+'…':p.title)}</a></li>`).join('')}</ul></div>
    <div><h4>Hỗ trợ &amp; chính sách</h4><ul>
      <li><a href="lien-he.html" class="ft-contact">Liên hệ với chúng tôi →</a></li>
      <li><a href="chinh-sach.html#bao-mat">Chính sách bảo mật</a></li><li><a href="chinh-sach.html#dieu-khoan">Điều khoản dịch vụ</a></li>
      <li><a href="chinh-sach.html#thanh-toan">Thanh toán &amp; hoàn tiền</a></li><li><a href="chinh-sach.html#noi-dung">Chính sách nội dung</a></li>
      <li><a href="mailto:${TH.CONTACT.email}" data-c="email">${TH.CONTACT.email}</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} WEDSTORY. Mọi quyền được bảo lưu.</span><span>Làm bằng ❤ tại Việt Nam</span></div></div>`;
  document.body.append(el);
  const top = document.createElement('button');
  top.className = 'to-top'; top.innerHTML = ICON.up; top.setAttribute('aria-label','Lên đầu trang');
  top.onclick = () => scrollTo({top:0});
  document.body.append(top);
  addEventListener('scroll', () => top.classList.toggle('show', scrollY > 600), {passive:true});
}

/* ---------- Storage (localStorage). Thay bằng API/Firebase khi có backend ---------- */
TH.store = {
  get(k, d=null){ try { const v = localStorage.getItem('th_'+k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem('th_'+k, JSON.stringify(v)); return true; } catch { TH.toast('Bộ nhớ trình duyệt đã đầy'); return false; } },
  del(k){ try { localStorage.removeItem('th_'+k); } catch {} }
};

/* ---------- Thư viện phông chữ (Google Fonts, có dấu tiếng Việt) — tải khi cần ---------- */
TH.FONTS = [
  ['Chữ ký & bay bướm', 'cursive', ['Great Vibes','Dancing Script','Pinyon Script','Allura','Alex Brush','Corinthia','Imperial Script','Ephesis','Charm','Pacifico','Lobster']],
  ['Có chân sang trọng', 'serif', ['Playfair Display','Cormorant Garamond','Lora','EB Garamond','Prata','Noto Serif','Merriweather']],
  ['Không chân hiện đại', 'sans-serif', ['Be Vietnam Pro','Montserrat','Quicksand','Nunito','Josefin Sans','Lexend','Roboto','Oswald']],
  ['Vui nhộn', 'cursive', ['Patrick Hand','Comfortaa','Mali','Itim','Pattaya','Baloo 2','Bungee']]
];
/* Phông chỉ có một độ đậm → không xin thêm 700 (Google trả lỗi nếu xin độ đậm không có) */
const ONE_WEIGHT = new Set(['Great Vibes','Allura','Alex Brush','Imperial Script','Ephesis','Pinyon Script','Parisienne','Pacifico','Lobster','Prata','Patrick Hand','Itim','Pattaya','Bungee']);
/* Font cũ không có dấu tiếng Việt -> font thay thế; chuỗi dự phòng an toàn theo loại font */
const FONT_ALIAS = {'Parisienne':'Pinyon Script'};
const FALLBACK = {cursive:"'Dancing Script','Brush Script MT',cursive", serif:"'Times New Roman',Georgia,serif",
  'sans-serif':"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif"};
TH.fixFont = f => FONT_ALIAS[f] || f;
TH.fontFallback = f => { const g = TH.FONTS.find(x => x[2].includes(f)); return FALLBACK[g ? g[1] : /Playfair|Garamond|Serif/.test(f) ? 'serif' : 'cursive']; };
TH.fontStack = name => { name = TH.fixFont(name); return `'${name}',${TH.fontFallback(name)}`; };
TH.fontsHref = names => 'https://fonts.googleapis.com/css2?' + names.map(n => 'family=' + n.replace(/ /g, '+') + (ONE_WEIGHT.has(n) ? '' : ':wght@400;700')).join('&') + '&display=swap';
const fontsLoaded = new Set();
TH.loadFont = (...names) => {
  const todo = names.filter(n => n && !fontsLoaded.has(n) && TH.FONTS.some(g => g[2].includes(n)));
  if (!todo.length) return;
  todo.forEach(n => fontsLoaded.add(n));
  document.head.append(Object.assign(document.createElement('link'), {rel:'stylesheet', href:TH.fontsHref(todo)}));
};

/* ---------- Toast & modal ---------- */
TH.toast = msg => {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
};
TH.modal = (html, cls = '') => {
  let m = $('#th-modal');
  if (!m) { m = document.createElement('div'); m.id = 'th-modal'; m.className = 'modal';
    m.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true"><button class="modal-close" aria-label="Đóng"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="modal-body"></div></div>'; document.body.append(m);
    m.onclick = e => { if (e.target === m || e.target.closest('.modal-close')) m.classList.remove('open'); }; }
  const box = $('.modal-box', m); box.className = 'modal-box ' + cls; box.style.cssText = '';   // mỗi lần mở là một hộp thoại "sạch"
  $('.modal-body', m).innerHTML = html; m.classList.add('open'); return m;
};
TH.closeModal = () => { const m = $('#th-modal'); if (m) m.classList.remove('open'); };

function openAuth(mode){
  const reg = mode === 'register';
  const m = TH.modal(`<h3 style="font-size:1.6rem;margin-bottom:6px">${reg?'Tạo tài khoản':'Chào mừng trở lại'}</h3>
    <p style="color:var(--muted);margin-bottom:20px">${reg?'Miễn phí, chỉ mất 30 giây.':'Đăng nhập để quản lý thiệp của bạn.'}</p>
    <form class="form-grid" style="grid-template-columns:1fr">
      ${reg?'<div class="field"><label>Họ tên</label><input name="name" required></div>':''}
      <div class="field"><label>Email</label><input name="email" type="email" required></div>
      <div class="field"><label>Mật khẩu</label><input name="pw" type="password" minlength="6" required></div>
      <button class="btn btn-primary" style="justify-content:center">${reg?'Đăng ký':'Đăng nhập'}</button>
      <p style="text-align:center;font-size:.9rem;color:var(--muted)">${reg?'Đã có tài khoản?':'Chưa có tài khoản?'} <a href="#" data-sw style="color:var(--rose);font-weight:600">${reg?'Đăng nhập':'Đăng ký'}</a></p>
    </form>`);
  $('[data-sw]', m).onclick = e => { e.preventDefault(); openAuth(reg?'login':'register'); };
  $('form', m).onsubmit = e => {
    e.preventDefault(); const f = new FormData(e.target);
    const email = f.get('email'); const name = f.get('name') || email.split('@')[0];
    TH.store.set('user', {name, email}); TH.closeModal(); TH.toast('Xin chào ' + name + '!'); setTimeout(() => location.reload(), 700);
  };
}
TH.openAuth = openAuth;

/* ---------- Mini preview của mẫu thiệp ---------- */
const DECO = {
  petal: c => `<svg class="deco" style="top:-10px;right:-10px;width:90px" viewBox="0 0 100 100"><g fill="${c}" opacity=".55"><ellipse cx="60" cy="30" rx="18" ry="9" transform="rotate(30 60 30)"/><ellipse cx="80" cy="55" rx="14" ry="7" transform="rotate(-20 80 55)"/><ellipse cx="45" cy="60" rx="10" ry="5" transform="rotate(60 45 60)"/></g></svg><svg class="deco" style="bottom:-10px;left:-10px;width:80px;transform:rotate(180deg)" viewBox="0 0 100 100"><g fill="${c}" opacity=".45"><ellipse cx="60" cy="30" rx="18" ry="9" transform="rotate(30 60 30)"/><ellipse cx="80" cy="55" rx="14" ry="7"/></g></svg>`,
  leaf: c => `<svg class="deco" style="top:0;left:0;width:100%" viewBox="0 0 200 60" fill="none" stroke="${c}" stroke-width="1.5" opacity=".7"><path d="M0 30 Q50 0 100 30 T200 30"/><path d="M30 18q8-12 18-6-6 12-18 6zM90 28q8-12 18-6-6 12-18 6zM150 18q8-12 18-6-6 12-18 6z" fill="${c}" opacity=".5"/></svg>`,
  gold: c => `<div class="deco" style="inset:10px;border:1px solid ${c};border-radius:6px"></div><div class="deco" style="inset:16px;border:1px solid ${c};opacity:.5;border-radius:4px"></div>`,
  hy:   c => `<div class="deco" style="top:12px;font-size:2.2rem;color:${c};font-family:'Noto Serif SC','Songti SC','SimSun',serif;opacity:.9">囍</div><div class="deco" style="inset:10px;border:2px solid ${c};border-radius:8px;opacity:.6"></div>`,
  wave: c => `<svg class="deco" style="bottom:0;left:0;width:100%" viewBox="0 0 200 40"><path d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20 V40 H0z" fill="${c}" opacity=".3"/><path d="M0 28 Q25 15 50 28 T100 28 T150 28 T200 28 V40 H0z" fill="${c}" opacity=".35"/></svg>`,
  star: c => `<div class="deco" style="inset:0;background-image:radial-gradient(${c} 1px,transparent 1.5px);background-size:22px 22px;opacity:.35"></div>`,
  line: c => `<div class="deco" style="top:20%;left:50%;width:1px;height:28px;background:${c}"></div><div class="deco" style="bottom:18%;left:50%;width:1px;height:28px;background:${c}"></div>`
};
TH.miniTpl = (t, o={}) => {
  const d = o.date ? new Date(o.date) : new Date(Date.now()+60*864e5);
  const src = o.photo === undefined ? t.thumb : o.photo;
  const photo = src ? `<div class="tm-photo" style="background-image:url('${src}')"></div>` : '';
  return `<div class="tpl-mini" style="background:${t.bg};color:${t.fg}">${(DECO[t.deco]||DECO.line)(t.accent)}
    ${photo}<div class="tm-top">Save the date</div>
    <div class="tm-names" style="font-family:${TH.fontStack(t.font)}">${TH.esc(o.groom||'Minh Khôi')}<span class="tm-amp" style="color:${t.accent}">&amp;</span>${TH.esc(o.bride||'Thu Hà')}</div>
    <div class="tm-date">${String(d.getDate()).padStart(2,'0')} · ${String(d.getMonth()+1).padStart(2,'0')} · ${d.getFullYear()}</div></div>`;
};
/* ---------- Thả tim mẫu thiệp ----------
   Số tim gốc cố định theo từng mẫu (≈5,5% lượt xem + độ lệch theo id → vài trăm đến ~2.000);
   mỗi máy chỉ thả được 1 tim / mẫu, lưu ở localStorage để F5 không mất và không spam được. */
const likedSet = () => TH.store.get('likedTpl', {});
const baseLikes = t => { let h = 0; for (const c of t.id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return Math.round(t.views * .055) + h % 140; };
TH.tplLikes = t => baseLikes(t) + (likedSet()[t.id] ? 1 : 0);
const likeBtn = t => { const on = !!likedSet()[t.id];
  return `<button type="button" class="like-btn${on ? ' on' : ''}" data-like="${t.id}" aria-pressed="${on}" aria-label="${on ? 'Bỏ thả tim' : 'Thả tim'} mẫu ${t.name}" title="${on ? 'Bạn đã thả tim mẫu này' : 'Thả tim mẫu này'}">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3.1 4.5 6.9 4.5c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.8 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z"/></svg>
    <span>${TH.tplLikes(t).toLocaleString('vi-VN')}</span></button>`; };
document.addEventListener('click', e => {
  const b = e.target.closest('[data-like]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  const t = TH.findTemplate(b.dataset.like), liked = likedSet(), on = !liked[t.id];
  if (on) liked[t.id] = Date.now(); else delete liked[t.id];
  TH.store.set('likedTpl', liked);
  // Cập nhật mọi thẻ của mẫu này trên trang (trang chủ có thể hiện cùng mẫu ở nhiều chỗ)
  $$(`[data-like="${t.id}"]`).forEach(x => {
    x.classList.toggle('on', on); x.setAttribute('aria-pressed', on);
    x.setAttribute('aria-label', `${on ? 'Bỏ thả tim' : 'Thả tim'} mẫu ${t.name}`);
    $('span', x).textContent = TH.tplLikes(t).toLocaleString('vi-VN');
    x.classList.remove('pop'); void x.offsetWidth; if (on) x.classList.add('pop');
  });
});

/* ---------- Khung thẻ mẫu: Hệ thống 20 mẫu độc bản, mỗi mẫu 1 kiểu bắt mắt & màu sắc riêng biệt ----------
   Chuẩn Photo-Centric theo web mẫu zenlove.me:
   1. hong-pastel:   Song ảnh thảo mộc (botanical-dual)
   2. vuon-xanh:     Polaroid kraft & hoa khô (polaroid-tape)
   3. hoang-kim:     Phong bì rêu ô-liu đồng nội (envelope-olive)
   4. song-hy:       Cổng vòm đỏ cung đình Song Hỷ (imperial-red-arch)
   5. bien-xanh:     Cổng vòm xanh biển sâu & nguyệt quế (slate-navy-arch)
   6. oai-huong:     Phong bì tím mận & oải hương (envelope-lavender)
   7. giay-kraft:    Dải phim triptych nâu đất (filmstrip-triptych)
   8. dem-sao:       Cổng vòm lục bảo hoàng gia (royal-green-arch)
   9. mau-don:       Phong bì nhung đỏ rượu & hoa mẫu đơn (envelope-burgundy)
   10. toi-gian-trang: Tạp chí thời trang editorial INVITÉ (fashion-editorial)
   11. hoang-hon:    Toàn cảnh hoàng hôn điện ảnh (cinematic-script)
   12. co-dien:      Salon cổ điển khung vàng & đèn chùm (baroque-chandelier)
   13. nang-vang:    Mái vòm lịch cưới hoàng kim (arch-calendar)
   14. tiec-vuon:    Bộ ba ảnh dọc dây leo hoa hồng (triptych-floral)
   15. rung-thong:   Rừng thông huyền bí xanh rêu đậm (pine-forest)
   16. thanh-lich:   Phong bì san hô đất nung (envelope-terracotta)
   17. la-non:       Giấy xé thủ công & băng keo chéo (torn-paper-craft)
   18. ngay-nang:    Dải phim photobooth Hàn Quốc 4 ô (photobooth-strip)
   19. be-kem:       Tranh cuộn thủy mặc hạc vàng Song Hỷ (crane-traditional)
   20. anh-bac:      Ban công cổ điển Pháp & Studio Noir (french-balcony-noir) */

const ddmmyyyy = d => `${String(d.getDate()).padStart(2,'0')} · ${String(d.getMonth()+1).padStart(2,'0')} · ${d.getFullYear()}`;

TH.frameTpl = (t, o = {}) => {
  const d = o.date ? new Date(o.date) : new Date(Date.now() + 60*864e5);
  const src = o.photo === undefined ? t.thumb : o.photo;
  const groom = TH.esc(o.groom || 'Minh Khôi');
  const bride = TH.esc(o.bride || 'Thu Hà');
  const photos = t.photos || [src, src, src, src];
  const ff = `style="--ff:${TH.fontStack(t.font)}"`;

  // 1. MẪU 1: HỒNG PASTEL - Song ảnh thảo mộc
  if (t.id === 'hong-pastel') {
    const p1 = photos[0] || src, p2 = photos[1] || src;
    return `<div class="fr fr-botanical-dual" ${ff}>
      <div class="fr-bot-top"><span class="fr-bot-leaf">🌿</span><span class="fr-tag">WEDDING INVITATION</span></div>
      <div class="fr-bot-pair">
        <div class="fr-bot-item groom">
          <div class="fr-photo" style="background-image:url('${p1}')"></div>
          <div class="fr-bot-info"><small>Trưởng Nam</small><b>${groom}</b></div>
        </div>
        <div class="fr-bot-bar"></div>
        <div class="fr-bot-item bride">
          <div class="fr-photo" style="background-image:url('${p2}')"></div>
          <div class="fr-bot-info"><small>Út Nữ</small><b>${bride}</b></div>
        </div>
      </div>
      <div class="fr-date">${ddmmyyyy(d)}</div>
    </div>`;
  }

  // 2. MẪU 2: KHU VƯỜN XANH - Polaroid kraft & hoa khô
  if (t.id === 'vuon-xanh') {
    return `<div class="fr fr-polaroid-tape" ${ff}>
      <div class="fr-pol-top">
        <span class="fr-tag">THE WEDDING OF</span>
        <div class="fr-names-script">${groom} <i>&amp;</i> ${bride}</div>
      </div>
      <div class="fr-pol-frame">
        <span class="fr-tape" aria-hidden="true"></span>
        <div class="fr-photo" style="background-image:url('${src}')"></div>
        <div class="fr-pol-sprig" aria-hidden="true">
          <svg viewBox="0 0 50 50"><path d="M10 40 Q25 25 35 10" stroke="#7A6855" stroke-width="1.6" fill="none"/><circle cx="35" cy="10" r="3.2" fill="#B38F6D"/><circle cx="28" cy="18" r="2.8" fill="#997554"/><circle cx="20" cy="27" r="2.8" fill="#B38F6D"/></svg>
        </div>
        <div class="fr-seal gold fr-pol-seal" aria-hidden="true"><span>♥</span></div>
      </div>
      <div class="fr-date">${ddmmyyyy(d)}</div>
    </div>`;
  }

  // 3. MẪU 3: HOÀNG KIM - Phong bì rêu ô-liu đồng nội
  if (t.id === 'hoang-kim') {
    return `<div class="fr fr-envelope-olive" ${ff}>
      <div style="display:flex;justify-content:space-between;align-items:center;z-index:5"><span class="fr-tag" style="color:#2E4733">SAVE OUR DATE</span></div>
      <div class="fr-env-card">
        <div class="fr-photo-wrap"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-env-pocket"><div class="fr-seal gold" aria-hidden="true"><span>🌿</span></div></div>
      </div>
      <div style="text-align:center;z-index:5">
        <div class="fr-name-line">${groom}</div>
        <div class="fr-name-line">${bride}</div>
      </div>
    </div>`;
  }

  // 4. MẪU 4: SONG HỶ ĐỎ - Cổng vòm đỏ cung đình Song Hỷ
  if (t.id === 'song-hy') {
    return `<div class="fr fr-imperial-red-arch" ${ff}>
      <div class="fr-arch-header-red">
        <span class="fr-arch-welcome">CUNG HỶ TÂN HÔN</span>
        <div class="fr-arch-family">
          <div class="fr-arch-col"><small>Trưởng Nam</small><b>${groom}</b></div>
          <div class="fr-arch-hy">囍</div>
          <div class="fr-arch-col"><small>Út Nữ</small><b>${bride}</b></div>
        </div>
        <span style="font:600 2cqw var(--f-body);letter-spacing:.25em;color:#f6e3a5;margin-top:1.5cqw">TRĂM NĂM HẠNH PHÚC</span>
      </div>
      <div class="fr-arch-window"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
    </div>`;
  }

  // 5. MẪU 5: BIỂN XANH - Cổng vòm xanh biển sâu & nguyệt quế
  if (t.id === 'bien-xanh') {
    return `<div class="fr fr-slate-navy-arch" ${ff}>
      <div class="fr-arch-header-navy">
        <div class="fr-navy-crest">⚓</div>
        <span class="fr-navy-title">THE WEDDING CELEBRATION</span>
        <div class="fr-arch-family" style="margin-top:1cqw">
          <div class="fr-arch-col"><small>Chú rể</small><b>${groom}</b></div>
          <div style="font-size:3.5cqw;color:#79B2D9">&amp;</div>
          <div class="fr-arch-col"><small>Cô dâu</small><b>${bride}</b></div>
        </div>
      </div>
      <div class="fr-arch-window"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
    </div>`;
  }

  // 6. MẪU 6: OẢI HƯƠNG - Phong bì tím mận & oải hương
  if (t.id === 'oai-huong') {
    return `<div class="fr fr-envelope-lavender" ${ff}>
      <div style="display:flex;justify-content:space-between;align-items:center;z-index:5"><span class="fr-tag" style="color:#553A70">WEDDING INVITATION</span></div>
      <div class="fr-env-card">
        <div class="fr-photo-wrap"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-env-pocket"><div class="fr-seal purple" aria-hidden="true"><span>💐</span></div></div>
      </div>
      <div style="text-align:center;z-index:5">
        <div class="fr-name-line">${groom}</div>
        <div class="fr-name-line">${bride}</div>
      </div>
    </div>`;
  }

  // 7. MẪU 7: GIẤY KRAFT - Dải phim triptych nâu đất
  if (t.id === 'giay-kraft') {
    const s1 = photos[1] || src, s2 = photos[2] || src, s3 = photos[3] || src;
    return `<div class="fr fr-filmstrip-triptych" ${ff}>
      <div style="text-align:center"><span class="fr-tag-light">WEDDING INVITATION</span></div>
      <div class="fr-film-main"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
      <div class="fr-film-banner">
        <div class="fr-names-script" style="color:#222">${groom} <i>&amp;</i> ${bride}</div>
        <div class="fr-date-mini">${ddmmyyyy(d)}</div>
      </div>
      <div class="fr-film-strip">
        <div class="fr-film-thumb" style="background-image:url('${s1}')"></div>
        <div class="fr-film-thumb" style="background-image:url('${s2}')"></div>
        <div class="fr-film-thumb" style="background-image:url('${s3}')"></div>
      </div>
    </div>`;
  }

  // 8. MẪU 8: ĐÊM ĐẦY SAO - Cổng vòm lục bảo hoàng gia
  if (t.id === 'dem-sao') {
    return `<div class="fr fr-royal-green-arch" ${ff}>
      <div class="fr-arch-header-green">
        <span class="fr-arch-welcome">WELCOME TO OUR WEDDING</span>
        <div class="fr-arch-family">
          <div class="fr-arch-col"><small>Trưởng Nam</small><b>${groom}</b></div>
          <div class="fr-arch-hy">囍</div>
          <div class="fr-arch-col"><small>Út Nữ</small><b>${bride}</b></div>
        </div>
        <span class="fr-arch-motto">LOVE NEVER FAILS</span>
      </div>
      <div class="fr-arch-window"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
    </div>`;
  }

  // 9. MẪU 9: MẪU ĐƠN - Phong bì nhung đỏ rượu & hoa mẫu đơn
  if (t.id === 'mau-don') {
    return `<div class="fr fr-envelope-burgundy" ${ff}>
      <div style="display:flex;justify-content:space-between;align-items:center;z-index:5"><span class="fr-tag">SAVE THE DATE</span></div>
      <div class="fr-env-card">
        <div class="fr-photo-wrap"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-floral-sprig" aria-hidden="true">
          <svg viewBox="0 0 50 70" fill="none"><path d="M25 65 Q20 30 5 10" stroke="#4A5847" stroke-width="2"/><circle cx="10" cy="18" r="8" fill="#8B1E2B" opacity=".9"/><circle cx="6" cy="14" r="5" fill="#D65866" opacity=".8"/><circle cx="22" cy="30" r="7" fill="#751622" opacity=".9"/><path d="M12 28 Q2 32 8 45" fill="#586B52" opacity=".8"/></svg>
        </div>
        <div class="fr-env-pocket"><div class="fr-seal gold" aria-hidden="true"><span>💍</span></div></div>
      </div>
      <div style="text-align:center;z-index:5">
        <div class="fr-name-line">${groom}</div>
        <div class="fr-name-line">${bride}</div>
      </div>
    </div>`;
  }

  // 10. MẪU 10: TRẮNG TINH KHÔI - Tạp chí thời trang editorial INVITÉ
  if (t.id === 'toi-gian-trang') {
    return `<div class="fr fr-fashion-editorial" ${ff}>
      <div class="fr-mag-head">
        <div class="fr-mag-title">INVITATION</div>
        <div class="fr-mag-issue">ISSUE 26</div>
      </div>
      <div class="fr-mag-photo-box">
        <div class="fr-photo" style="background-image:url('${src}')"></div>
        <div class="fr-mag-badge">${ddmmyyyy(d)}</div>
      </div>
      <div class="fr-mag-bottom">
        <div class="fr-mag-names">${groom} &amp; ${bride}</div>
        <div style="font:600 2cqw var(--f-body);letter-spacing:.1em">SPECIAL DAY</div>
      </div>
    </div>`;
  }

  // 11. MẪU 11: HOÀNG HÔN - Toàn cảnh hoàng hôn điện ảnh
  if (t.id === 'hoang-hon') {
    return `<div class="fr fr-cinematic-script" ${ff}>
      <div class="fr-photo" style="background-image:url('${src}')"></div>
      <div class="fr-cine-overlay"></div>
      <div class="fr-cine-content">
        <div class="fr-cine-script">Our Love Begins</div>
        <div class="fr-cine-names">${groom} <i>&amp;</i> ${bride}</div>
        <div class="fr-date-light">${ddmmyyyy(d)}</div>
      </div>
    </div>`;
  }

  // 12. MẪU 12: CỔ ĐIỂN CHÂU ÂU - Salon cổ điển khung vàng & đèn chùm
  if (t.id === 'co-dien') {
    return `<div class="fr fr-baroque-chandelier" ${ff}>
      <div class="fr-baroque-border">
        <svg class="fr-baroque-corner fr-corner-tl" viewBox="0 0 40 40" fill="currentColor"><path d="M0 0 H40 V10 H10 V40 H0 Z"/></svg>
        <svg class="fr-baroque-corner fr-corner-tr" viewBox="0 0 40 40" fill="currentColor"><path d="M0 0 H40 V10 H10 V40 H0 Z"/></svg>
        <svg class="fr-baroque-corner fr-corner-bl" viewBox="0 0 40 40" fill="currentColor"><path d="M0 0 H40 V10 H10 V40 H0 Z"/></svg>
        <svg class="fr-baroque-corner fr-corner-br" viewBox="0 0 40 40" fill="currentColor"><path d="M0 0 H40 V10 H10 V40 H0 Z"/></svg>
        <div class="fr-chandelier-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v4M8 6h8M6 10c0 4 6 7 6 7s6-3 6-7M9 10v4M15 10v4M12 17v5"/></svg></div>
        <div class="fr-baroque-names">${groom} &amp; ${bride}</div>
        <div class="fr-baroque-photo-wrap"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div style="font:600 2.2cqw var(--f-body);letter-spacing:.2em;color:#96783C">${ddmmyyyy(d)}</div>
      </div>
    </div>`;
  }

  // 13. MẪU 13: NẮNG VÀNG - Mái vòm lịch cưới hoàng kim
  if (t.id === 'nang-vang') {
    return `<div class="fr fr-arch-calendar" ${ff}>
      <div class="fr-cal-arch"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
      <div class="fr-cal-bottom">
        <div class="fr-cal-names">${groom} &amp; ${bride}</div>
        <div class="fr-cal-grid">
          <span class="fr-cal-day-head">T2</span><span class="fr-cal-day-head">T3</span><span class="fr-cal-day-head">T4</span><span class="fr-cal-day-head">T5</span><span class="fr-cal-day-head">T6</span><span class="fr-cal-day-head">T7</span><span class="fr-cal-day-head">CN</span>
          <span>01</span><span>02</span><span>03</span><span>04</span><span class="fr-cal-day special">05</span><span>06</span><span>07</span>
          <span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span>
        </div>
        <div style="font:600 2cqw var(--f-body);letter-spacing:.18em;color:#A07428">SAVE THE DATE · ${ddmmyyyy(d)}</div>
      </div>
    </div>`;
  }

  // 14. MẪU 14: TIỆC VƯỜN - Bộ ba ảnh dọc dây leo hoa hồng
  if (t.id === 'tiec-vuon') {
    const s1 = photos[0] || src, s2 = photos[1] || src, s3 = photos[2] || src;
    return `<div class="fr fr-triptych-floral" ${ff}>
      <div class="fr-floral-garland">🌸 🌿 🌸</div>
      <div class="fr-trip-title">Save the Date</div>
      <div class="fr-trip-names">${groom} &amp; ${bride}</div>
      <div class="fr-trip-grid">
        <div class="fr-trip-col"><div class="fr-photo" style="background-image:url('${s1}')"></div></div>
        <div class="fr-trip-col"><div class="fr-photo" style="background-image:url('${s2}')"></div></div>
        <div class="fr-trip-col"><div class="fr-photo" style="background-image:url('${s3}')"></div></div>
      </div>
      <div class="fr-date" style="color:#8B4553">${ddmmyyyy(d)}</div>
    </div>`;
  }

  // 15. MẪU 15: RỪNG THÔNG - Rừng thông huyền bí xanh rêu đậm
  if (t.id === 'rung-thong') {
    return `<div class="fr fr-pine-forest" ${ff}>
      <div class="fr-pine-top">
        <div class="fr-pine-needle">🌲</div>
        <div class="fr-pine-tag">THE WEDDING CELEBRATION</div>
      </div>
      <div class="fr-pine-names">${groom} &amp; ${bride}</div>
      <div class="fr-pine-photo-frame"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
      <div class="fr-date" style="color:#D4AF37">${ddmmyyyy(d)}</div>
    </div>`;
  }

  // 16. MẪU 16: THANH LỊCH - Phong bì san hô đất nung
  if (t.id === 'thanh-lich') {
    return `<div class="fr fr-envelope-terracotta" ${ff}>
      <div style="display:flex;justify-content:space-between;align-items:center;z-index:5"><span class="fr-tag" style="color:#9C4635">WEDDING DAY</span></div>
      <div class="fr-env-card">
        <div class="fr-photo-wrap"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-env-pocket"><div class="fr-seal white" aria-hidden="true"><span>🌸</span></div></div>
      </div>
      <div style="text-align:center;z-index:5">
        <div class="fr-name-line">${groom}</div>
        <div class="fr-name-line">${bride}</div>
      </div>
    </div>`;
  }

  // 17. MẪU 17: LÁ NON - Giấy xé thủ công & băng keo chéo
  if (t.id === 'la-non') {
    return `<div class="fr fr-torn-paper-craft" ${ff}>
      <div class="fr-torn-sheet">
        <span class="fr-tape-diag-tl" aria-hidden="true"></span>
        <span class="fr-tape-diag-br" aria-hidden="true"></span>
        <div style="text-align:center"><span class="fr-tag" style="color:#4B6B4D">NATURAL BOTANICAL</span></div>
        <div class="fr-names-script" style="color:#2F4A32;text-align:center">${groom} <i>&amp;</i> ${bride}</div>
        <div class="fr-torn-photo"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-date" style="color:#4B6B4D">${ddmmyyyy(d)}</div>
      </div>
    </div>`;
  }

  // 18. MẪU 18: NGÀY NẮNG - Dải phim photobooth Hàn Quốc 4 ô
  if (t.id === 'ngay-nang') {
    const s1 = photos[0] || src, s2 = photos[1] || src, s3 = photos[2] || src, s4 = photos[3] || src;
    return `<div class="fr fr-photobooth-strip" ${ff}>
      <div class="fr-booth-card">
        <div class="fr-booth-header">${groom} &amp; ${bride}</div>
        <div class="fr-booth-grid">
          <div class="fr-booth-item" style="background-image:url('${s1}')"></div>
          <div class="fr-booth-item" style="background-image:url('${s2}')"></div>
          <div class="fr-booth-item" style="background-image:url('${s3}')"></div>
          <div class="fr-booth-item" style="background-image:url('${s4}')"></div>
        </div>
        <div class="fr-booth-footer"><span>PHOTOBOOTH</span><span>${ddmmyyyy(d)}</span></div>
      </div>
    </div>`;
  }

  // 19. MẪU 19: BE KEM - Tranh cuộn thủy mặc hạc vàng Song Hỷ
  if (t.id === 'be-kem') {
    return `<div class="fr fr-crane-traditional" ${ff}>
      <div class="fr-crane-header">
        <span class="fr-tag" style="color:#8E1920">THIỆP BÁO HỶ</span>
        <span class="fr-crane-hy">囍</span>
      </div>
      <div class="fr-crane-names">${groom} &amp; ${bride}</div>
      <div class="fr-crane-frame"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
      <div class="fr-date" style="color:#8E1920">${ddmmyyyy(d)}</div>
    </div>`;
  }

  // 20. MẪU 20: ÁNH BẠC - Ban công cổ điển Pháp & Studio Noir
  if (t.id === 'anh-bac') {
    return `<div class="fr fr-french-balcony-noir" ${ff}>
      <div class="fr-balcony-arch">
        <div class="fr-balcony-title">HAPPY WEDDING</div>
        <div class="fr-balcony-names">${groom} &amp; ${bride}</div>
        <div class="fr-balcony-photo"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
        <div class="fr-date" style="color:#59544F;margin-top:2cqw">${ddmmyyyy(d)}</div>
      </div>
    </div>`;
  }

  // Fallback an toàn
  return `<div class="fr fr-polaroid-tape" ${ff}>
    <div class="fr-pol-frame"><div class="fr-photo" style="background-image:url('${src}')"></div></div>
    <div class="fr-names-script" style="text-align:center">${groom} &amp; ${bride}</div>
  </div>`;
};
/* Nhãn Hot (4 mẫu nhiều lượt xem nhất) / Mới (4 mẫu thêm gần nhất) */
TH.tplBadge = t => {
  const hot = [...TH.TEMPLATES].sort((a, b) => b.views - a.views).slice(0, 4).some(x => x.id === t.id);
  if (hot) return '<span class="tpl-badge hot">🔥 Hot</span>';
  return TH.TEMPLATES.slice(-4).some(x => x.id === t.id) ? '<span class="tpl-badge new">✨ Mới</span>' : '';
};

TH.tplCard = t => `<article class="tpl-card reveal" data-cat="${t.cat}" data-tpl="${t.id}">
  <div class="tpl-thumb"><span class="tier ${t.tier}">${t.tier==='premium'?'PREMIUM':'BASIC'}</span>${TH.tplBadge(t)}${TH.frameTpl(t, t.couple)}
    <span class="tpl-peek" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>Xem mẫu</span></div>
  <a class="card-link" href="thiep.html?template=${t.id}" aria-label="Xem mẫu ${t.name}"></a>
  <div class="tpl-info"><h3>${t.name}</h3><div class="tpl-stats">${likeBtn(t)}<small title="Lượt xem">👁 ${t.views.toLocaleString('vi-VN')}</small></div></div></article>`;

/* ---------- Xem trước "sống": thiệp thật thu nhỏ trong thẻ mẫu, tự lướt từ trên xuống ----------
   Máy tính: rê chuột vào thẻ. Điện thoại: thẻ nằm giữa màn hình. Mỗi lúc chỉ chạy 1 thẻ cho nhẹ máy. */
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const PV_W = 390;   // dựng thiệp ở bề rộng điện thoại rồi thu nhỏ vừa khung
/* Tự cuộn cửa sổ của iframe; hết trang thì dừng một nhịp rồi quay lại đầu. Trả về hàm dừng. */
TH.autoScroll = (frame, pxPerSec = 120) => {
  let raf = 0, last = 0, y = 0, hold = performance.now() + 700, stopped = false;
  const step = now => {
    if (stopped) return;
    const w = frame.contentWindow, doc = w?.document?.documentElement;
    if (doc) {
      const max = doc.scrollHeight - w.innerHeight, dt = Math.min(64, now - (last || now));
      if (now > hold) {
        y += pxPerSec * dt / 1000;
        if (y >= max) { y = max; hold = now + 1600; w.scrollTo({top:y, behavior:'instant'}); y = -1; }
        else if (y < 0) { y = 0; w.scrollTo({top:0, behavior:'smooth'}); hold = now + 900; }
        else w.scrollTo({top:y, behavior:'instant'});   // 'instant': trang đặt scroll-behavior:smooth, mỗi khung hình sẽ tự huỷ nhau
      }
    }
    last = now; raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => { stopped = true; cancelAnimationFrame(raf); };
};
let live = null;   // {card, box, stop}
function stopLive(){
  if (!live) return;
  const {card, box, stop} = live; live = null;
  stop?.(); card.classList.remove('is-live');
  box.classList.remove('ready'); setTimeout(() => box.remove(), 300);
}
function startLive(card){
  if (live?.card === card || reduceMotion()) return;
  stopLive();
  const thumb = $('.tpl-thumb', card), id = card.dataset.tpl; if (!thumb || !id) return;
  const box = document.createElement('div'); box.className = 'tpl-live'; box.setAttribute('aria-hidden', 'true');
  const s = thumb.clientWidth / PV_W;
  box.innerHTML = `<iframe src="thiep.html?template=${encodeURIComponent(id)}&preview=1&lite=1" tabindex="-1" loading="eager" title=""
    style="width:${PV_W}px;height:${Math.ceil(thumb.clientHeight / s)}px;transform:scale(${s})"></iframe><i class="tpl-live-bar"><b></b></i>`;
  thumb.append(box); card.classList.add('is-live');
  const fr = $('iframe', box), me = live = {card, box, stop:null};
  fr.onload = () => setTimeout(() => {
    if (live !== me) return;
    box.classList.add('ready');
    me.stop = TH.autoScroll(fr, 150);
    // thanh tiến độ ở đáy thẻ
    const bar = $('.tpl-live-bar b', box);
    const tick = () => { if (live !== me) return; const w = fr.contentWindow, d = w.document.documentElement;
      bar.style.width = Math.min(100, w.scrollY / Math.max(1, d.scrollHeight - w.innerHeight) * 100) + '%'; requestAnimationFrame(tick); };
    tick();
  }, 350);
}
const hoverable = matchMedia('(hover:hover) and (pointer:fine)');
let hoverT = 0;
document.addEventListener('pointerover', e => {
  if (!hoverable.matches) return;
  const card = e.target.closest('.tpl-card[data-tpl]'); if (!card || card.contains(e.relatedTarget)) return;
  clearTimeout(hoverT); hoverT = setTimeout(() => startLive(card), 180);
});
document.addEventListener('pointerout', e => {
  if (!hoverable.matches) return;
  const card = e.target.closest('.tpl-card[data-tpl]'); if (!card || card.contains(e.relatedTarget)) return;
  clearTimeout(hoverT); if (live?.card === card) stopLive();
});
/* Điện thoại: thẻ chiếm phần lớn màn hình (gần giữa) thì tự chạy */
const cardIO = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
  if (hoverable.matches) return;
  es.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio >= .75) { clearTimeout(hoverT); hoverT = setTimeout(() => startLive(e.target), 400); }
    else if (live?.card === e.target) stopLive();
  });
}, {threshold:[0, .75, 1], rootMargin:'-12% 0px -12% 0px'}) : null;
TH.watchCards = (root = document) => { if (cardIO) $$('.tpl-card[data-tpl]', root).forEach(c => cardIO.observe(c)); };

/* ---------- Cửa sổ chi tiết mẫu (bấm vào thẻ) ---------- */
const loadQR = () => window.QRCode ? Promise.resolve() : new Promise((ok, fail) => {
  const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  s.onload = ok; s.onerror = fail; document.head.append(s); });
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
TH.openTpl = (id, push = true) => {
  const t = TH.TEMPLATES.find(x => x.id === id); if (!t) return;
  stopLive(); TH.closeTpl(false);
  const liveUrl = new URL(`thiep.html?template=${encodeURIComponent(t.id)}`, location.href).href;
  const reviews = TH.tplReviews ? TH.tplReviews(t) : [];
  const users = Math.round(t.views * .062);
  const credits = `<div class="tc-half"><div class="tc-spacer"></div>
    <p class="tc-title">${TH.esc(t.name)}</p><p class="tc-sub">Cảm nhận &amp; lời chúc</p>
    ${reviews.map(r => r.kind === 'review'
      ? `<div class="tc-item"><span class="tc-stars" aria-label="${r.stars} sao">${stars(r.stars)}</span><q>${TH.esc(r.text)}</q><small>— ${TH.esc(r.who)} · ${TH.esc(r.city)}</small></div>`
      : `<div class="tc-item wish"><span class="tc-tag">💌 Lời chúc</span><q>${TH.esc(r.text)}</q><small>— ${TH.esc(r.who)}</small></div>`).join('')}
    <p class="tc-end">Đã có <b>${users.toLocaleString('vi-VN')}</b> cặp đôi chọn mẫu này</p><p class="tc-fin">♥</p></div>`;
  const m = document.createElement('div');
  m.className = 'tm-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Mẫu thiệp ' + t.name);
  m.innerHTML = `<div class="tm-box">
    <button type="button" class="tm-x" aria-label="Đóng">×</button>
    <div class="tm-top-stats">${likeBtn(t)}<span class="tm-views" title="Lượt xem"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>${t.views.toLocaleString('vi-VN')}</span></div>
    <div class="tm-preview">
      <div class="tm-phone"><div class="tm-static">${TH.miniTpl(t, t.couple)}</div><iframe src="thiep.html?template=${encodeURIComponent(t.id)}&preview=1&lite=1" title="Xem trước mẫu ${TH.esc(t.name)}"></iframe></div>
      <p class="tm-hint" id="tmHint">▶ Đang tự lướt · chạm vào thiệp để tự xem</p></div>
    <div class="tm-info">
      <div><span class="tier ${t.tier}">${t.tier === 'premium' ? 'PREMIUM' : 'BASIC'}</span><small class="tm-cat">${TH.esc(t.cat)}</small></div>
      <h3 class="tm-name">${TH.esc(t.name)}</h3>
      <ul class="tm-feats">
        <li><b>Chuyên nghiệp:</b> Thiết kế đẹp mắt, phù hợp nhiều phong cách</li>
        <li><b>Dễ dàng:</b> Chỉnh sửa trực quan như Canva, không cần kinh nghiệm</li>
        <li><b>Tiện lợi:</b> Chia sẻ ngay qua Zalo, Facebook, Messenger hoặc tin nhắn</li>
        <li><b>Tối ưu:</b> Hiển thị tốt trên mọi thiết bị, có chế độ chữ lớn cho ông bà</li></ul>
      <div class="tm-acts"><a class="btn btn-outline" href="thiep.html?template=${encodeURIComponent(t.id)}">Xem trực tiếp</a>
        <a class="btn btn-primary tm-use" href="editor.html?template=${encodeURIComponent(t.id)}">Dùng mẫu này</a></div>
      <div class="tm-qr"><div class="tm-qr-box" aria-label="Mã QR xem mẫu trên điện thoại"></div><small>Quét mã QR để xem trên điện thoại</small></div>
    </div>
    <aside class="tm-credits" aria-label="Cảm nhận và lời chúc"><div class="tc-head">🎬 Cảm nhận từ các cặp đôi</div>
      <div class="tc-roll"><div class="tc-track" style="--dur:${Math.max(36, reviews.length * 6.5)}s">${credits}${credits.replace('class="tc-half"', 'class="tc-half" aria-hidden="true"')}</div></div>
      <p class="tc-note">Rê chuột vào để dừng đọc</p></aside>
  </div>`;
  document.body.append(m); document.body.classList.add('tm-open');
  requestAnimationFrame(() => m.classList.add('show'));
  const back = document.activeElement;
  m._back = back;
  $('.tm-x', m).focus();
  // Thiệp trong cửa sổ: tự lướt; khách chạm / lăn chuột trong thiệp thì dừng để tự xem
  const fr = $('iframe', m);
  fr.onload = () => setTimeout(() => {
    if (!m.isConnected) return;
    $('.tm-phone', m).classList.add('ready');
    if (reduceMotion()) { $('#tmHint', m).textContent = 'Cuộn trong thiệp để xem'; return; }
    m._stop = TH.autoScroll(fr, 85);
    const pause = () => { if (!m._stop) return; m._stop(); m._stop = null; $('#tmHint', m).innerHTML = '⏸ Bạn đang tự xem · <button type="button" class="link-btn" id="tmResume">Tự lướt tiếp</button>'; };
    ['wheel', 'pointerdown', 'touchstart', 'keydown'].forEach(ev => fr.contentWindow.addEventListener(ev, pause, {passive:true}));
    m.addEventListener('click', e => { if (e.target.id === 'tmResume') { m._stop = TH.autoScroll(fr, 85); $('#tmHint', m).textContent = '▶ Đang tự lướt · chạm vào thiệp để tự xem'; } });
  }, 300);
  loadQR().then(() => new QRCode($('.tm-qr-box', m), {text:liveUrl, width:150, height:150, correctLevel:QRCode.CorrectLevel.M})).catch(() => { $('.tm-qr-box', m).innerHTML = '<small>Không tải được mã QR</small>'; });
  m.addEventListener('click', e => { if (e.target === m || e.target.closest('.tm-x')) TH.closeTpl(); });
  m.addEventListener('keydown', e => {
    if (e.key === 'Escape') TH.closeTpl();
    if (e.key === 'Tab') {   // giữ phím Tab trong cửa sổ
      const f = $$('a[href],button:not([disabled]),iframe', m).filter(x => x.offsetParent !== null);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  if (push) history.pushState({tpl:t.id}, '', '#mau=' + t.id);
};
TH.closeTpl = (pop = true) => {
  const m = $('.tm-modal'); if (!m) return;
  m._stop?.(); m.classList.remove('show'); document.body.classList.remove('tm-open');
  setTimeout(() => m.remove(), 250);
  m._back?.focus?.();
  if (pop && history.state?.tpl) history.back();
};
addEventListener('popstate', () => {
  const id = location.hash.startsWith('#mau=') ? location.hash.slice(5) : '';
  if (id) TH.openTpl(id, false); else TH.closeTpl(false);
});
/* Bấm thẻ → mở cửa sổ chi tiết (giữ Ctrl/Cmd hoặc chuột giữa vẫn mở trang thiệp ở tab mới) */
document.addEventListener('click', e => {
  const a = e.target.closest('.tpl-card .card-link'); if (!a || e.ctrlKey || e.metaKey || e.shiftKey || e.button) return;
  e.preventDefault(); TH.openTpl(a.closest('.tpl-card').dataset.tpl);
});
TH.openTplFromHash = () => { if (location.hash.startsWith('#mau=')) TH.openTpl(location.hash.slice(5), false); };

/* ---------- Hiệu ứng: reveal, count-up, FAQ ---------- */
TH.reveal = (root=document) => {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {threshold:.12});
  $$('.reveal:not(.in)', root).forEach(el => io.observe(el));
};
function countUp(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '', t0 = performance.now();
    const step = now => { const p = Math.min((now-t0)/1600,1), v = Math.floor(end*(1-Math.pow(1-p,3)));
      el.textContent = v.toLocaleString('vi-VN') + suf; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), {threshold:.5});
  $$('[data-count]').forEach(el => io.observe(el));
}
TH.faq = (el, list) => {
  el.innerHTML = list.map(([q,a]) => `<div class="faq-item reveal"><button class="faq-q">${q}</button><div class="faq-a"><p>${a}</p></div></div>`).join('');
  $$('.faq-q', el).forEach(b => b.onclick = () => {
    const it = b.parentElement, a = it.querySelector('.faq-a'), open = it.classList.toggle('open');
    a.style.maxHeight = open ? a.scrollHeight + 'px' : 0;
  });
};

/* ---------- Cánh hoa rơi (canvas) ---------- */
TH.petals = (count=18, colors=['#f4b6c2','#f9d3db','#eaa0b0']) => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('canvas'); c.id = 'petals'; document.body.append(c);
  const x = c.getContext('2d'); let W, H;
  const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; rs(); addEventListener('resize', rs);
  const P = Array.from({length:count}, () => ({x:Math.random()*W, y:Math.random()*H, s:6+Math.random()*8, vy:.5+Math.random(), vx:Math.random()-.5, r:Math.random()*6, vr:(Math.random()-.5)*.03, c:colors[Math.floor(Math.random()*colors.length)]}));
  (function loop(){
    x.clearRect(0,0,W,H);
    P.forEach(p => { p.y += p.vy; p.x += p.vx + Math.sin(p.y/50)*.4; p.r += p.vr;
      if (p.y > H+20) { p.y = -20; p.x = Math.random()*W; }
      x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.c; x.globalAlpha = .75;
      x.beginPath(); x.ellipse(0,0,p.s,p.s/2,0,0,Math.PI*2); x.fill(); x.restore(); });
    requestAnimationFrame(loop);
  })();
};

/* ---------- Khởi tạo ---------- */
/* Điền thông tin liên hệ từ TH.CONTACT vào các phần tử data-c / data-zalo / data-hotline */
TH.fillContact = (root = document) => {
  const C = TH.CONTACT;
  $$('[data-c]', root).forEach(el => {
    const k = el.dataset.c;
    if (k === 'email') { el.textContent = C.email; if (el.tagName === 'A') el.href = 'mailto:' + C.email; }
    else if (k === 'hotline') { el.textContent = C.hotlineText; if (el.tagName === 'A') el.href = 'tel:' + C.hotline; }
    else if (k === 'zalo') { if (el.tagName === 'A') el.href = C.zalo; }
    else if (k === 'hours') el.innerHTML = C.hours.map(TH.esc).join('<br>');
    else if (C[k] != null) el.textContent = C[k];
  });
  $$('[data-zalo]', root).forEach(a => a.href = C.zalo);
  $$('[data-hotline]', root).forEach(s => s.textContent = C.hotlineText);
};
/* Link mạng xã hội chưa có trang: không nhảy về đầu trang, báo đang cập nhật */
document.addEventListener('click', e => { if (e.target.closest('[data-soon]')) { e.preventDefault(); TH.toast('Trang mạng xã hội đang được cập nhật'); } });
TH.initPage = (opts={}) => {
  if (!opts.bare) { header(); footer(); }
  TH.fillContact();
  TH.reveal(); countUp();
};
})();

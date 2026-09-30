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

const NAV = [
  ['index.html','Trang chủ'],
  ['mau-thiep.html','Mẫu thiệp'],
  ['cam-nang.html','Cẩm nang'],
  ['thiep-da-tao.html','Thiệp đã tạo'],
  ['bang-gia.html','Bảng giá'],
  ['lien-he.html','Liên hệ'],
  ['bang-gia.html#tron-goi','Tạo thiệp trọn gói','nav-hl']
];

function header(){
  const page = location.pathname.split('/').pop() || 'index.html';
  const user = TH.store.get('user');
  const el = document.createElement('header');
  el.className = 'header';
  el.innerHTML = `<div class="container">
    <a href="index.html" class="logo">${LOGO}<span>Thiệp Hồng</span></a>
    <nav class="nav">${NAV.map(([h,t,c])=>`<a href="${h}" class="${c||''} ${h===page||(page.startsWith('bai-viet')&&h==='cam-nang.html')?'active':''}">${t}</a>`).join('')}</nav>
    <div class="header-actions">
      ${user ? `<a href="thiep-da-tao.html?mine=1" class="btn btn-ghost btn-sm">👋 ${TH.esc(user.name)}</a><button class="btn btn-ghost btn-sm" data-logout>Đăng xuất</button>`
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
    <div><a href="index.html" class="logo">${LOGO}<span>Thiệp Hồng</span></a>
      <p style="font-size:.92rem;max-width:300px">Nền tảng tạo thiệp cưới online miễn phí — đẹp, hiện đại và đầy cảm xúc. Kể câu chuyện tình yêu của bạn theo cách riêng.</p>
      <div class="socials"><a href="#" aria-label="Facebook">${ICON.fb}</a><a href="#" aria-label="Instagram">${ICON.ig}</a><a href="#" aria-label="TikTok">${ICON.tt}</a></div></div>
    <div><h4>Sản phẩm</h4><ul>
      <li><a href="mau-thiep.html">Mẫu thiệp</a></li><li><a href="thiep-da-tao.html">Thiệp khách hàng</a></li>
      <li><a href="bang-gia.html#tron-goi">Thiệp trọn gói</a></li><li><a href="bang-gia.html">Bảng giá</a></li>
      <li><a href="lien-he.html">Chương trình đối tác</a></li></ul></div>
    <div><h4>Cẩm nang</h4><ul>${TH.POSTS.slice(0,5).map(p=>`<li><a href="bai-viet.html?slug=${p.slug}">${TH.esc(p.title.length>38?p.title.slice(0,38)+'…':p.title)}</a></li>`).join('')}</ul></div>
    <div><h4>Chính sách</h4><ul>
      <li><a href="chinh-sach.html#bao-mat">Chính sách bảo mật</a></li><li><a href="chinh-sach.html#dieu-khoan">Điều khoản dịch vụ</a></li>
      <li><a href="chinh-sach.html#thanh-toan">Thanh toán &amp; hoàn tiền</a></li><li><a href="chinh-sach.html#noi-dung">Chính sách nội dung</a></li>
      <li><a href="lien-he.html">hello@thiephong.vn</a></li></ul></div>
  </div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} Thiệp Hồng. Mọi quyền được bảo lưu.</span><span>Làm bằng ❤ tại Việt Nam</span></div></div>`;
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

/* ---------- Toast & modal ---------- */
TH.toast = msg => {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.append(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
};
TH.modal = html => {
  let m = $('#th-modal');
  if (!m) { m = document.createElement('div'); m.id = 'th-modal'; m.className = 'modal'; m.innerHTML = '<div class="modal-box"><button class="modal-close">&times;</button><div class="modal-body"></div></div>'; document.body.append(m);
    m.onclick = e => { if (e.target === m || e.target.classList.contains('modal-close')) m.classList.remove('open'); }; }
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
  hy:   c => `<div class="deco" style="top:12px;font-size:2.2rem;color:${c};font-family:serif;opacity:.9">囍</div><div class="deco" style="inset:10px;border:2px solid ${c};border-radius:8px;opacity:.6"></div>`,
  wave: c => `<svg class="deco" style="bottom:0;left:0;width:100%" viewBox="0 0 200 40"><path d="M0 20 Q25 5 50 20 T100 20 T150 20 T200 20 V40 H0z" fill="${c}" opacity=".3"/><path d="M0 28 Q25 15 50 28 T100 28 T150 28 T200 28 V40 H0z" fill="${c}" opacity=".35"/></svg>`,
  star: c => `<div class="deco" style="inset:0;background-image:radial-gradient(${c} 1px,transparent 1.5px);background-size:22px 22px;opacity:.35"></div>`,
  line: c => `<div class="deco" style="top:20%;left:50%;width:1px;height:28px;background:${c}"></div><div class="deco" style="bottom:18%;left:50%;width:1px;height:28px;background:${c}"></div>`
};
TH.miniTpl = (t, o={}) => {
  const d = o.date ? new Date(o.date) : new Date(Date.now()+60*864e5);
  const photo = o.photo ? `<div class="tm-photo" style="background-image:url('${o.photo}')"></div>` : '';
  return `<div class="tpl-mini" style="background:${t.bg};color:${t.fg}">${(DECO[t.deco]||DECO.line)(t.accent)}
    ${photo}<div class="tm-top">Save the date</div>
    <div class="tm-names" style="font-family:'${t.font}',serif">${TH.esc(o.groom||'Minh Khôi')}<span class="tm-amp" style="color:${t.accent}">&amp;</span>${TH.esc(o.bride||'Thu Hà')}</div>
    <div class="tm-date">${String(d.getDate()).padStart(2,'0')} · ${String(d.getMonth()+1).padStart(2,'0')} · ${d.getFullYear()}</div></div>`;
};
TH.tplCard = t => `<article class="tpl-card reveal" data-cat="${t.cat}">
  <div class="tpl-thumb"><span class="tier ${t.tier}">${t.tier==='premium'?'PREMIUM':'BASIC'}</span>${TH.miniTpl(t)}
    <div class="overlay"><a class="btn btn-primary btn-sm" href="editor.html?tpl=${t.id}">Dùng mẫu này</a><a class="btn btn-outline btn-sm" href="thiep.html?demo=${t.id}" target="_blank">Xem trước</a></div></div>
  <div class="tpl-info"><h3>${t.name}</h3><small>👁 ${t.views.toLocaleString('vi-VN')}</small></div></article>`;

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
TH.initPage = (opts={}) => {
  if (!opts.bare) { header(); footer(); }
  TH.reveal(); countUp();
};
})();

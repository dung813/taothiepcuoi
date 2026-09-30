/* ============ Logic từng trang ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$;

const postCard = (p, featured) => `<a href="bai-viet.html?slug=${p.slug}" class="post-card reveal ${featured?'post-featured':''}">
  <div class="post-cover" style="background:linear-gradient(135deg,${p.cover[0]},${p.cover[1]})"><h4>${p.coverText}</h4></div>
  <div class="post-body"><div class="post-meta"><span class="cat">${p.cat}</span><span>⏱ ${p.read} phút đọc</span><span>${TH.fmtDate(p.date)}</span></div>
  <h3>${TH.esc(p.title)}</h3><p>${TH.esc(p.excerpt)}</p><span class="more">Đọc tiếp →</span></div></a>`;

const showCard = s => { const t = TH.findTemplate(s.tpl);
  const q = new URLSearchParams({demo:s.tpl, g:s.groom, b:s.bride, d:s.date});
  return `<a class="show-card" href="thiep.html?${q}" target="_blank"><div class="tpl-thumb">${TH.miniTpl(t,s)}</div>
  <div class="meta"><b>${s.groom} &amp; ${s.bride}</b><small>${TH.fmtDate(s.date)} · ${t.name}</small></div></a>`; };

/* ---------- Trang chủ ---------- */
TH.pageHome = () => {
  TH.initPage();
  const [a,b] = [TH.TEMPLATES[0], TH.TEMPLATES[3]];
  $('#ph1').innerHTML = TH.miniTpl(a, {photo:TH.PHOTOS[0]});
  $('#ph2').innerHTML = TH.miniTpl(b, {groom:'Đức Anh', bride:'Phương Linh', photo:TH.PHOTOS[1]});
  $('#hotTpl').innerHTML = [...TH.TEMPLATES].sort((x,y)=>y.views-x.views).slice(0,8).map(TH.tplCard).join('');
  const cards = TH.SHOWCASE.map(showCard).join('');
  $('#showTrack').innerHTML = cards + cards;
  $('#homePosts').innerHTML = TH.POSTS.slice(0,3).map(p=>postCard(p)).join('');
  TH.faq($('#faq'), TH.FAQ);
  TH.reveal(); TH.petals(14);
};

/* ---------- Mẫu thiệp ---------- */
TH.pageTemplates = () => {
  TH.initPage();
  let cat = 'Tất cả', tier = 'all', sort = 'hot', q = '';
  $('#cats').innerHTML = TH.TEMPLATE_CATS.map(c=>`<button class="chip ${c===cat?'active':''}" data-c="${c}">${c}</button>`).join('');
  const render = () => {
    let list = TH.TEMPLATES.filter(t => (cat==='Tất cả'||t.cat===cat) && (tier==='all'||t.tier===tier) && t.name.toLowerCase().includes(q));
    list.sort(sort==='hot' ? (a,b)=>b.views-a.views : (a,b)=>a.name.localeCompare(b.name,'vi'));
    $('#grid').innerHTML = list.length ? list.map(TH.tplCard).join('') : '<p class="empty">Không tìm thấy mẫu phù hợp.</p>';
    $('#count').textContent = list.length + ' mẫu';
    TH.reveal($('#grid'));
  };
  $('#cats').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; $$('#cats .chip').forEach(x=>x.classList.toggle('active', x===b)); render(); };
  $('#tier').onchange = e => { tier = e.target.value; render(); };
  $('#sort').onchange = e => { sort = e.target.value; render(); };
  $('#q').oninput = e => { q = e.target.value.trim().toLowerCase(); render(); };
  render();
};

/* ---------- Cẩm nang ---------- */
TH.pageGuide = () => {
  TH.initPage();
  let cat = TH.qs('cat') || 'Tất cả', q = '', page = 1; const PER = 6;
  $('#cats').innerHTML = TH.POST_CATS.map(c=>`<button class="chip ${c===cat?'active':''}" data-c="${c}">${c}</button>`).join('');
  const render = () => {
    const list = TH.POSTS.filter(p => (cat==='Tất cả'||p.cat===cat) && (p.title+p.excerpt).toLowerCase().includes(q));
    const showFeatured = cat==='Tất cả' && !q && page===1 && list.length;
    $('#featured').innerHTML = showFeatured ? postCard(list[0], true) : '';
    const rest = showFeatured ? list.slice(1) : list;
    const pages = Math.max(1, Math.ceil(rest.length/PER)); page = Math.min(page, pages);
    $('#posts').innerHTML = rest.length ? rest.slice((page-1)*PER, page*PER).map(p=>postCard(p)).join('') : (showFeatured ? '' : '<p class="empty">Không có bài viết phù hợp.</p>');
    $('#pager').innerHTML = pages > 1 ? Array.from({length:pages},(_,i)=>`<button class="chip ${i+1===page?'active':''}" data-p="${i+1}">${i+1}</button>`).join('') : '';
    TH.reveal();
  };
  $('#cats').onclick = e => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; page = 1; $$('#cats .chip').forEach(x=>x.classList.toggle('active', x===b)); render(); };
  $('#pager').onclick = e => { const b = e.target.closest('[data-p]'); if (!b) return; page = +b.dataset.p; render(); scrollTo({top:$('#cats').offsetTop-100}); };
  $('#q').oninput = e => { q = e.target.value.trim().toLowerCase(); page = 1; render(); };
  render();
};

/* ---------- Bài viết ---------- */
TH.pageArticle = () => {
  TH.initPage();
  const p = TH.findPost(TH.qs('slug'));
  if (!p) { $('#article').innerHTML = '<div class="article-hero"><h1>Không tìm thấy bài viết</h1><a class="btn btn-primary" href="cam-nang.html">Về trang Cẩm nang</a></div>'; return; }
  document.title = p.title + ' – Thiệp Hồng';
  const tmp = document.createElement('div'); tmp.innerHTML = p.body;
  const heads = $$('h2[id]', tmp);
  $('#article').innerHTML = `<div class="article-hero"><div class="crumbs"><a href="index.html">Trang chủ</a> / <a href="cam-nang.html">Cẩm nang</a> / ${p.cat}</div>
    <h1>${TH.esc(p.title)}</h1><div class="post-meta" style="justify-content:center"><span class="cat">${p.cat}</span><span>⏱ ${p.read} phút đọc</span><span>${TH.fmtDate(p.date)}</span></div></div>
    <div class="post-cover" style="border-radius:22px;aspect-ratio:21/9;background:linear-gradient(135deg,${p.cover[0]},${p.cover[1]});margin-bottom:34px"><h4 style="font-size:3.4rem">${p.coverText}</h4></div>
    ${heads.length>1?`<nav class="toc"><b>Mục lục</b>${heads.map(h=>`<a href="#${h.id}">${h.textContent}</a>`).join('')}</nav>`:''}
    <div class="article-body">${p.body}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin:40px 0;padding-top:24px;border-top:1px solid var(--line)"><b style="margin-right:8px">Chia sẻ:</b>
      <a class="chip" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}">Facebook</a>
      <button class="chip" id="copyLink">Sao chép liên kết</button></div>`;
  $('#copyLink').onclick = () => navigator.clipboard.writeText(location.href).then(()=>TH.toast('Đã sao chép liên kết'));
  $('#related').innerHTML = TH.POSTS.filter(x=>x.slug!==p.slug).sort((a,b)=>(b.cat===p.cat)-(a.cat===p.cat)).slice(0,3).map(x=>postCard(x)).join('');
  const bar = $('.progress');
  addEventListener('scroll', () => { const h = document.documentElement; bar.style.width = (h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%'; }, {passive:true});
  TH.reveal();
};

/* ---------- Thiệp đã tạo ---------- */
TH.pageShowcase = () => {
  TH.initPage();
  const mine = TH.store.get('invites', {});
  const ids = Object.keys(mine).sort((a,b)=>(mine[b].updated||0)-(mine[a].updated||0));
  $('#mine').innerHTML = ids.length ? ids.map(id => { const d = mine[id], t = TH.findTemplate(d.tpl);
    return `<div class="show-card reveal" style="width:auto"><div class="tpl-thumb">${TH.miniTpl(t,{groom:d.groom.nick||d.groom.name,bride:d.bride.nick||d.bride.name,date:d.date,photo:d.cover})}</div>
      <div class="meta"><b>${TH.esc((d.groom.nick||d.groom.name)+' & '+(d.bride.nick||d.bride.name))}</b><small>${TH.fmtDate(d.date)}</small>
      <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap"><a class="btn btn-primary btn-sm" href="editor.html?id=${id}">Sửa</a><a class="btn btn-outline btn-sm" target="_blank" href="thiep.html?id=${id}">Xem</a><a class="btn btn-outline btn-sm" href="quan-ly.html?id=${id}">Quản lý</a></div></div></div>`; }).join('')
    : `<div class="empty">Bạn chưa tạo thiệp nào. <a href="mau-thiep.html" style="color:var(--rose);font-weight:600">Chọn mẫu để bắt đầu →</a></div>`;
  $('#gallery').innerHTML = TH.SHOWCASE.map(s => showCard(s).replace('class="show-card"','class="show-card reveal" style="width:auto"')).join('');
  TH.reveal();
};

/* ---------- Bảng giá ---------- */
TH.pagePricing = () => {
  TH.initPage();
  const PLANS = [
    {name:'Cơ bản', desc:'Đủ dùng cho hầu hết cặp đôi', m:0, feats:[['Mẫu thiệp BASIC',1],['Nhạc nền, album 12 ảnh',1],['Bản đồ, đếm ngược',1],['Xác nhận tham dự & lời chúc',1],['Tên khách mời riêng',1],['Mẫu PREMIUM',0],['Ẩn logo Thiệp Hồng',0],['Thống kê nâng cao & xuất CSV',0]]},
    {name:'Premium', desc:'Nổi bật và riêng tư hơn', m:199000, hot:1, feats:[['Tất cả tính năng gói Cơ bản',1],['Toàn bộ mẫu PREMIUM',1],['Album không giới hạn + video',1],['Ẩn logo Thiệp Hồng',1],['Hộp mừng cưới hiệu ứng',1],['Thống kê nâng cao & xuất CSV',1],['Lưu trữ thiệp 2 năm',1],['Tên miền riêng',0]]},
    {name:'Trọn gói', desc:'Chúng tôi làm giúp từ A–Z', m:599000, feats:[['Tất cả tính năng Premium',1],['Nhà thiết kế làm thiệp giúp bạn',1],['Thiết kế theo yêu cầu riêng',1],['Tên miền riêng (.com/.vn)',1],['Chỉnh sửa không giới hạn',1],['Hỗ trợ ưu tiên 24/7',1],['Lưu trữ trọn đời',1],['Bàn giao trong 48 giờ',1]]}
  ];
  let yearly = false;
  const vnd = n => n.toLocaleString('vi-VN') + 'đ';
  const render = () => $('#plans').innerHTML = PLANS.map((p,i) => {
    const price = yearly && p.m ? Math.round(p.m*0.8/1000)*1000 : p.m;
    return `<div class="plan reveal in ${p.hot?'hot':''}" ${i===2?'id="tron-goi"':''}>${p.hot?'<span class="ribbon">Phổ biến nhất</span>':''}
      <h3>${p.name}</h3><p class="desc">${p.desc}</p>
      <div class="old">${yearly&&p.m?vnd(p.m):''}</div><div class="price">${p.m?vnd(price):'0đ'} <small>${p.m?'/ thiệp':'mãi mãi'}</small></div>
      <ul>${p.feats.map(([f,ok])=>`<li class="${ok?'':'no'}">${f}</li>`).join('')}</ul>
      <button class="btn ${p.hot?'btn-primary':'btn-outline'}" data-plan="${i}">${p.m?'Chọn gói '+p.name:'Bắt đầu miễn phí'}</button></div>`; }).join('');
  render();
  $('#sw').onclick = () => { yearly = !yearly; $('#sw').classList.toggle('on', yearly); render(); };
  $('#plans').onclick = e => { const b = e.target.closest('[data-plan]'); if (!b) return; const p = PLANS[+b.dataset.plan];
    if (!p.m) { location.href = 'mau-thiep.html'; return; }
    TH.modal(`<h3 style="font-size:1.5rem;margin-bottom:8px">Đăng ký gói ${p.name}</h3><p style="color:var(--muted);margin-bottom:18px">Để lại thông tin, chúng tôi sẽ liên hệ hướng dẫn thanh toán trong 30 phút.</p>
      <form class="form-grid" style="grid-template-columns:1fr" id="planForm"><div class="field"><label>Họ tên</label><input required name="n"></div><div class="field"><label>Số điện thoại / Zalo</label><input required name="p" pattern="[0-9 +]{9,}"></div>
      <button class="btn btn-primary" style="justify-content:center">Gửi đăng ký</button></form>`);
    $('#planForm').onsubmit = ev => { ev.preventDefault(); TH.closeModal(); TH.toast('Đã nhận đăng ký, cảm ơn bạn!'); };
  };
  TH.faq($('#faq'), [
    ['Gói trả phí tính theo tháng hay theo thiệp?','Tính theo từng thiệp và chỉ thanh toán một lần. Thiệp được lưu trữ theo thời hạn của gói.'],
    ['Tôi có thể nâng cấp sau khi đã tạo thiệp miễn phí không?','Có. Toàn bộ nội dung được giữ nguyên khi nâng cấp.'],
    ['Có hoàn tiền không?','Hoàn tiền 100% trong 7 ngày nếu bạn chưa gửi thiệp cho khách mời.'],
    ['Thanh toán bằng cách nào?','Chuyển khoản ngân hàng, ví điện tử hoặc thẻ quốc tế.']]);
  TH.reveal();
  if (location.hash === '#tron-goi') setTimeout(()=>$('#tron-goi').scrollIntoView({block:'center'}), 200);
};

/* ---------- Liên hệ ---------- */
TH.pageContact = () => {
  TH.initPage();
  $('#contactForm').onsubmit = e => {
    e.preventDefault(); const f = Object.fromEntries(new FormData(e.target));
    const inbox = TH.store.get('contact', []); inbox.push({...f, at:Date.now()}); TH.store.set('contact', inbox);
    e.target.reset(); TH.toast('Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.');
  };
};
})();

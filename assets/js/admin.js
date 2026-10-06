/* ============ Trang quản lý: sự kiện & nhóm khách, sơ đồ bàn tiệc ============ */
(function(){
const TH = window.TH, $ = TH.$, $$ = TH.$$, esc = TH.esc;
const copy = (text, msg = 'Đã sao chép') => navigator.clipboard.writeText(text).then(() => TH.toast(msg), () => prompt('Sao chép thủ công:', text));
const toLocal = s => { const d = new Date(s); return isNaN(d) ? '' : new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); };
const fmt = s => { const d = new Date(s); return isNaN(d) ? 'Chưa đặt giờ' : d.toLocaleString('vi-VN', {hour:'2-digit', minute:'2-digit', weekday:'short', day:'2-digit', month:'2-digit'}); };

/* ---------- 1. Sự kiện & nhóm khách mời ---------- */
const EVENT_PRESETS = [
  {key:'vuquy',  label:'Lễ Vu Quy (nhà gái)',    ev:{title:'Lễ Vu Quy', place:'Tư gia nhà gái', side:'bride', hour:9}},
  {key:'thanhhon', label:'Lễ Thành Hôn (nhà trai)', ev:{title:'Lễ Thành Hôn', place:'Tư gia nhà trai', side:'groom', hour:11}},
  {key:'baohy',  label:'Tiệc Báo Hỷ',            ev:{title:'Tiệc Báo Hỷ', place:'Nhà hàng tiệc cưới', side:'both', hour:18}}
];
const SIDES = {bride:'Nhà gái', groom:'Nhà trai', both:'Chung'};
const guessSide = e => e.side || (/vu quy/i.test(e.title) ? 'bride' : /thành hôn/i.test(e.title) ? 'groom' : 'both');

TH.adminEvents = (root, id, D) => {
  if (TH.ensureEventIds(D)) TH.invites.save(id, D);
  D.groups = D.groups || [];
  const save = () => TH.invites.save(id, D);

  const draw = () => {
    root.innerHTML = `
    <div class="ev-list">${D.events.map((e, i) => `<div class="ev-card" data-ev="${e.id}">
      <div class="ev-head"><span class="ev-no">${i + 1}</span><input class="ev-title" data-f="title" value="${esc(e.title)}" aria-label="Tên sự kiện">
        <select data-f="side" aria-label="Bên tổ chức">${Object.entries(SIDES).map(([k, n]) => `<option value="${k}" ${guessSide(e) === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <button class="ic-btn" data-act="del-ev" title="Xoá sự kiện" aria-label="Xoá sự kiện">🗑</button></div>
      <div class="ev-grid">
        <label>Thời gian<input type="datetime-local" data-f="time" value="${toLocal(e.time)}"></label>
        <label>Địa điểm<input data-f="place" value="${esc(e.place || '')}"></label>
        <label class="wide">Địa chỉ<input data-f="address" value="${esc(e.address || '')}"></label>
      </div></div>`).join('') || '<p class="muted">Chưa có sự kiện nào.</p>'}</div>
    <div class="preset-row"><span class="muted">Thêm nhanh:</span>${EVENT_PRESETS.map(p => `<button class="btn btn-outline btn-sm" data-act="add-ev" data-p="${p.key}">+ ${p.label}</button>`).join('')}</div>

    <h4 class="sub-h">Nhóm khách mời <small>— mỗi nhóm chỉ thấy lịch trình của các buổi được chọn</small></h4>
    <div class="grp-list">${D.groups.map(g => groupCard(g)).join('') || `<div class="empty-box"><p>Chưa có nhóm khách nào.</p>
      <button class="btn btn-primary btn-sm" data-act="seed-grp">✨ Tạo 3 nhóm gợi ý theo sự kiện</button></div>`}</div>
    <button class="btn btn-outline btn-sm" data-act="add-grp">+ Thêm nhóm khách</button>`;
  };

  const groupCard = g => {
    const names = (g.guests || '').split('\n').map(s => s.trim()).filter(Boolean);
    return `<div class="grp-card" data-grp="${g.id}">
      <div class="ev-head"><input class="ev-title" data-g="name" value="${esc(g.name)}" aria-label="Tên nhóm"><button class="ic-btn" data-act="del-grp" title="Xoá nhóm" aria-label="Xoá nhóm">🗑</button></div>
      <div class="grp-evs">${D.events.map(e => `<label class="tag-chk"><input type="checkbox" data-gev="${e.id}" ${(g.events || []).includes(e.id) ? 'checked' : ''}><span>${esc(e.title)} · ${fmt(e.time)}</span></label>`).join('')}</div>
      ${(g.events || []).length ? '' : '<p class="warn">⚠️ Chưa chọn buổi nào — khách nhóm này sẽ thấy toàn bộ lịch trình.</p>'}
      <label class="grp-names">Tên khách trong nhóm (mỗi dòng một người) — để tạo link mời riêng
        <textarea data-g="guests" rows="3" placeholder="Cô Ba Hạnh&#10;Chú Tư Minh">${esc(g.guests || '')}</textarea></label>
      <div class="grp-links">
        <button class="btn btn-primary btn-sm" data-act="copy-grp">🔗 Sao chép link nhóm</button>
        ${names.length ? `<button class="btn btn-outline btn-sm" data-act="copy-all">📋 Sao chép ${names.length} link riêng</button>` : ''}
      </div>
      ${names.length ? `<ul class="guest-links">${names.map(n => `<li><span>${esc(n)}</span><button class="btn btn-ghost btn-sm" data-act="copy-one" data-name="${esc(n)}">Sao chép link</button></li>`).join('')}</ul>` : ''}
    </div>`;
  };

  const linkFor = (g, guest) => TH.inviteUrl(id, D, guest, {grp: g.id});
  const evOf = el => D.events.find(e => e.id === el.closest('[data-ev]')?.dataset.ev);
  const grpOf = el => D.groups.find(g => g.id === el.closest('[data-grp]')?.dataset.grp);

  root.addEventListener('change', e => {
    const t = e.target, ev = evOf(t), g = grpOf(t);
    if (ev && t.dataset.f) { ev[t.dataset.f] = t.value; save(); if (t.dataset.f === 'title' || t.dataset.f === 'time') draw(); return; }
    if (g && t.dataset.gev) { g.events = t.checked ? [...new Set([...(g.events || []), t.dataset.gev])] : (g.events || []).filter(x => x !== t.dataset.gev); save(); draw(); return; }
    if (g && t.dataset.g) { g[t.dataset.g] = t.value; save(); if (t.dataset.g === 'guests') draw(); }
  });
  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    const act = b.dataset.act, g = grpOf(b);
    if (act === 'add-ev') {
      const p = EVENT_PRESETS.find(x => x.key === b.dataset.p).ev, base = new Date(D.date); base.setHours(p.hour, 0, 0, 0);
      D.events.push({id:'ev' + TH.uid(), title:p.title, place:p.place, side:p.side, address:'', map:'', time: isNaN(base) ? '' : toLocal(base)});
      save(); draw(); TH.toast(`Đã thêm ${p.title}`);
    }
    if (act === 'del-ev') { const ev = evOf(b); if (!confirm(`Xoá "${ev.title}"?`)) return;
      D.events = D.events.filter(x => x !== ev); D.groups.forEach(gr => gr.events = (gr.events || []).filter(x => x !== ev.id)); save(); draw(); }
    if (act === 'seed-grp') {
      const pick = re => D.events.filter(ev => re.test(ev.title)).map(ev => ev.id);
      const party = pick(/tiệc|báo hỷ/i);
      D.groups.push(
        {id:'g' + TH.uid(), name:'Họ hàng nhà gái', events:[...pick(/vu quy/i), ...party], guests:''},
        {id:'g' + TH.uid(), name:'Họ hàng nhà trai', events:[...pick(/thành hôn/i), ...party], guests:''},
        {id:'g' + TH.uid(), name:'Bạn bè & đồng nghiệp', events:party, guests:''});
      save(); draw();
    }
    if (act === 'add-grp') { D.groups.push({id:'g' + TH.uid(), name:'Nhóm khách mới', events:D.events.map(x => x.id), guests:''}); save(); draw(); }
    if (act === 'del-grp' && confirm(`Xoá nhóm "${g.name}"? Link đã gửi cho nhóm này sẽ hiện toàn bộ lịch trình.`)) { D.groups = D.groups.filter(x => x !== g); save(); draw(); }
    if (act === 'copy-grp') copy(linkFor(g), `Đã sao chép link nhóm "${g.name}"`);
    if (act === 'copy-one') copy(linkFor(g, b.dataset.name), `Đã sao chép link mời ${b.dataset.name}`);
    if (act === 'copy-all') copy((g.guests || '').split('\n').map(s => s.trim()).filter(Boolean).map(n => `${n}: ${linkFor(g, n)}`).join('\n'), 'Đã sao chép toàn bộ link của nhóm');
  });
  draw();
};

/* ---------- 2. Sơ đồ bàn tiệc (kéo – thả, hoặc chạm để chọn rồi chạm bàn trên điện thoại) ---------- */
const TABLE_TYPES = {round:{label:'Bàn tròn', seats:10}, long:{label:'Bàn dài', seats:12}};

TH.adminSeating = (root, id, D, groupsName = () => '') => {
  const key = 'seat_' + id;
  const S = TH.store.get(key, {tables:[], at:{}});
  const save = () => TH.store.set(key, S);
  let picked = null;   // khách đang được chọn (chế độ chạm)

  const guests = () => TH.guestbook.get(id).rsvp.filter(r => r.attend === 'yes')
    .map(r => ({key:r.uid || `${r.at}|${r.name}`, name:r.name, n:TH.rsvpParty(r).total || 1, grp:groupsName(r.grp), r}));
  const used = t => guests().filter(g => S.at[g.key] === t.id).reduce((s, g) => s + g.n, 0);
  const nextNo = () => S.tables.reduce((m, t) => Math.max(m, t.no || 0), 0) + 1;

  const seatsSvg = (t, filled) => {
    if (t.type === 'long') {
      const half = Math.ceil(t.seats / 2);
      const dot = (i, top) => `<i class="${i < filled ? 'on' : ''}" style="left:${((i % half) + .5) / half * 100}%;top:${top}"></i>`;
      return `<div class="tb-shape long">${Array.from({length:t.seats}, (_, i) => dot(i, i < half ? '-9px' : 'calc(100% - 5px)')).join('')}<b>${String(t.no).padStart(2, '0')}</b></div>`;
    }
    return `<div class="tb-shape round">${Array.from({length:t.seats}, (_, i) => { const a = i / t.seats * 2 * Math.PI - Math.PI / 2;
      return `<i class="${i < filled ? 'on' : ''}" style="left:${50 + 58 * Math.cos(a)}%;top:${50 + 58 * Math.sin(a)}%"></i>`; }).join('')}<b>${String(t.no).padStart(2, '0')}</b></div>`;
  };
  const chip = g => `<li class="g-chip${picked === g.key ? ' picked' : ''}" draggable="true" data-g="${g.key}" tabindex="0" title="Kéo vào bàn, hoặc chạm để chọn rồi chạm vào bàn">
    <span class="nm">${esc(g.name)}</span><span class="n">${g.n} người</span>${g.grp ? `<small>${esc(g.grp)}</small>` : ''}</li>`;

  const draw = () => {
    const all = guests(), free = all.filter(g => !S.tables.some(t => t.id === S.at[g.key]));
    const seated = all.length ? all.filter(g => !free.includes(g)).reduce((s, g) => s + g.n, 0) : 0;
    const total = all.reduce((s, g) => s + g.n, 0), cap = S.tables.reduce((s, t) => s + t.seats, 0);
    root.innerHTML = `
    <div class="seat-sum"><span>Đã xếp <b>${seated}/${total}</b> người</span><span><b>${S.tables.length}</b> bàn · sức chứa <b>${cap}</b> chỗ</span>
      ${cap < total ? `<span class="warn">Thiếu ${total - cap} chỗ</span>` : ''}
      <span class="seat-add"><button class="btn btn-outline btn-sm" data-act="add" data-type="round">+ Bàn tròn 10 người</button><button class="btn btn-outline btn-sm" data-act="add" data-type="long">+ Bàn dài 12 người</button></span></div>
    <div class="seat-wrap">
      <aside class="seat-pool drop" data-drop="pool"><h4>Khách chưa xếp bàn <span>${free.length}</span></h4>
        ${all.length ? '' : '<p class="muted">Chưa có khách xác nhận “Sẽ tham dự”.</p>'}
        <ul>${free.map(chip).join('')}</ul>${free.length || !all.length ? '' : '<p class="muted">🎉 Tất cả khách đã có bàn.</p>'}</aside>
      <div class="seat-tables">${S.tables.map(t => { const u = used(t), pct = Math.round(u / t.seats * 100);
        const st = u > t.seats ? 'over' : u === t.seats ? 'full' : u >= t.seats * .8 ? 'near' : '';
        return `<section class="tb drop ${st}" data-drop="${t.id}" aria-label="${esc(t.name)}">
          <header><input value="${esc(t.name)}" data-rename="${t.id}" aria-label="Tên bàn">
            <select data-seats="${t.id}" aria-label="Số chỗ">${[6, 8, 10, 12, 14, 16, 20].map(n => `<option ${n === t.seats ? 'selected' : ''}>${n}</option>`).join('')}</select>
            <button class="ic-btn" data-act="del" data-t="${t.id}" title="Xoá bàn" aria-label="Xoá bàn">×</button></header>
          ${seatsSvg(t, Math.min(u, t.seats))}
          <div class="tb-fill"><b>${esc(t.name)}: ${u}/${t.seats} người</b>${u > t.seats ? ` <em>quá ${u - t.seats}</em>` : ''}<i style="width:${Math.min(100, pct)}%"></i></div>
          <ul>${all.filter(g => S.at[g.key] === t.id).map(g => chip(g).replace('</li>', `<button class="mini" data-act="ticket" data-g="${g.key}" title="Sao chép link vé có số bàn">🎟</button></li>`)).join('')}</ul>
        </section>`; }).join('') || '<div class="empty-box"><p>Chưa có bàn nào — thêm bàn tròn hoặc bàn dài ở trên.</p></div>'}</div>
    </div>`;
  };

  const assign = (gk, target) => {
    if (!gk) return;
    if (target === 'pool') delete S.at[gk]; else S.at[gk] = target;
    picked = null; save(); draw();
  };

  root.addEventListener('dragstart', e => { const c = e.target.closest('.g-chip'); if (!c) return;
    e.dataTransfer.setData('text/plain', c.dataset.g); e.dataTransfer.effectAllowed = 'move'; c.classList.add('dragging'); });
  root.addEventListener('dragend', e => e.target.closest?.('.g-chip')?.classList.remove('dragging'));
  root.addEventListener('dragover', e => { const d = e.target.closest('.drop'); if (!d) return; e.preventDefault(); $$('.drop.hover', root).forEach(x => x !== d && x.classList.remove('hover')); d.classList.add('hover'); });
  root.addEventListener('dragleave', e => { const d = e.target.closest('.drop'); if (d && !d.contains(e.relatedTarget)) d.classList.remove('hover'); });
  root.addEventListener('drop', e => { const d = e.target.closest('.drop'); if (!d) return; e.preventDefault(); assign(e.dataTransfer.getData('text/plain'), d.dataset.drop); });

  root.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b?.dataset.act === 'add') { const ty = TABLE_TYPES[b.dataset.type], no = nextNo();
      S.tables.push({id:'t' + TH.uid(), no, name:'Bàn ' + String(no).padStart(2, '0'), type:b.dataset.type, seats:ty.seats}); save(); draw(); return; }
    if (b?.dataset.act === 'del') { const t = S.tables.find(x => x.id === b.dataset.t);
      if (!confirm(`Xoá ${t.name}? Khách ở bàn này sẽ trở về danh sách chưa xếp.`)) return;
      S.tables = S.tables.filter(x => x !== t); Object.keys(S.at).forEach(k => S.at[k] === t.id && delete S.at[k]); save(); draw(); return; }
    if (b?.dataset.act === 'ticket') { e.stopPropagation();
      const g = guests().find(x => x.key === b.dataset.g), t = S.tables.find(x => x.id === S.at[g.key]);
      copy(TH.inviteUrl(id, D, g.name, {table:String(t.no).padStart(2, '0'), grp:g.r.grp}), `Đã sao chép link vé của ${g.name} (bàn ${t.no})`); return; }
    if (e.target.closest('input,select,button')) return;
    // Chế độ chạm: chọn khách → chạm vào bàn (hoặc vùng "chưa xếp")
    const c = e.target.closest('.g-chip');
    if (c) { picked = picked === c.dataset.g ? null : c.dataset.g; draw(); if (picked) TH.toast('Chạm vào bàn muốn xếp khách này'); return; }
    const d = e.target.closest('.drop'); if (d && picked) assign(picked, d.dataset.drop);
  });
  root.addEventListener('keydown', e => { const c = e.target.closest('.g-chip'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); c.click(); } });
  root.addEventListener('change', e => {
    const t = e.target;
    if (t.dataset.rename) { const tb = S.tables.find(x => x.id === t.dataset.rename); tb.name = t.value.trim() || tb.name; save(); draw(); }
    if (t.dataset.seats) { S.tables.find(x => x.id === t.dataset.seats).seats = +t.value; save(); draw(); }
  });
  draw();
  return {refresh: draw};
};
})();

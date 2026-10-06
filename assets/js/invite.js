/* ============ Mô hình dữ liệu thiệp cưới ============ */
(function(){
const TH = window.TH;

TH.uid = () => Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4);

TH.defaultInvite = (tpl='hong-pastel') => {
  const d = new Date(Date.now() + 75*864e5); d.setHours(11,0,0,0);
  const iso = x => new Date(x - x.getTimezoneOffset()*6e4).toISOString().slice(0,16);
  const d2 = new Date(d); d2.setHours(17,30);
  const d0 = new Date(d); d0.setDate(d.getDate()-1); d0.setHours(9,0);
  const photos = TH.findTemplate(tpl).photos || TH.PHOTOS;
  return {
    tpl, accent:'', font:'',
    groom:{name:'Nguyễn Minh Khôi', nick:'Minh Khôi', father:'Ông Nguyễn Văn Hải', mother:'Bà Trần Thị Lan'},
    bride:{name:'Lê Thu Hà', nick:'Thu Hà', father:'Ông Lê Quang Vinh', mother:'Bà Phạm Thị Mai'},
    date: iso(d),
    message:'Trân trọng kính mời quý khách đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của quý khách là niềm vinh hạnh lớn lao cho hai gia đình.',
    quote:'Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.',
    events:[
      {title:'Lễ Vu Quy', time: iso(d0), place:'Tư gia nhà gái', address:'12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh', map:''},
      {title:'Lễ Thành Hôn', time: iso(d), place:'Tư gia nhà trai', address:'45 Lê Lợi, Quận 3, TP. Hồ Chí Minh', map:''},
      {title:'Tiệc Cưới', time: iso(d2), place:'Trung tâm Hội nghị Tiệc cưới', hall:'Sảnh Hoa Hồng · Tầng 2', address:'88 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh', map:'', lat:'', lng:'',
        parking:'Xe máy: gửi miễn phí tại hầm B1, lối vào bên phải sảnh chính.\nÔ tô: bãi đỗ phía sau tòa nhà (khoảng 40 chỗ), có bảo vệ hướng dẫn.\nĐi taxi/xe công nghệ: chọn điểm đón trả trước cổng chính để thuận tiện nhất.'}
    ],
    cover: photos[0],
    photos: photos.slice(0),
    story:[
      {date:'2021', title:'Lần đầu gặp gỡ', text:'Một buổi chiều mưa ở quán cà phê nhỏ, hai người lạ ngồi chung bàn vì hết chỗ.'},
      {date:'2023', title:'Chính thức hẹn hò', text:'Sau hai năm làm bạn, anh lấy hết can đảm để nói lời thương.'},
      {date:'2026', title:'Lời cầu hôn', text:'Dưới bầu trời Đà Lạt đầy sao, cô ấy đã nói “Đồng ý”.'}
    ],
    music:{type:'builtin', url:''},
    /* Người nhà hỗ trợ khách trong ngày cưới (hiện trên vé mời điện tử) */
    hotlines:[
      {name:'Anh Tuấn', role:'Anh trai chú rể · Nhà trai', phone:'0901234567'},
      {name:'Chị Hạnh', role:'Chị gái cô dâu · Nhà gái', phone:'0907654321'}
    ],
    /* Thư cảm ơn sau ngày cưới — để trống thì dùng lời cảm ơn mặc định */
    thanks:'',
    gift:{
      groom:{bank:'Vietcombank', acc:'0123456789', owner:'NGUYEN MINH KHOI', qr:''},
      bride:{bank:'Techcombank', acc:'9876543210', owner:'LE THU HA', qr:''}
    },
    opts:{countdown:true, calendar:true, story:true, album:true, rsvp:true, wishes:true, gift:true, petals:true, envelope:true}
  };
};

/* Thiệp demo của một mẫu: dùng đúng cặp đôi, gia đình và ngày cưới gắn với mẫu đó (xem COUPLES trong data.js) */
TH.sampleInvite = tpl => {
  const d = TH.defaultInvite(tpl), t = TH.findTemplate(tpl);
  if (!t.family) return d;
  d.groom = {...t.family.groom}; d.bride = {...t.family.bride};
  const day = t.couple.date, prev = new Date(day + 'T00:00'); prev.setDate(prev.getDate() - 1);
  const prevDay = `${prev.getFullYear()}-${String(prev.getMonth()+1).padStart(2,'0')}-${String(prev.getDate()).padStart(2,'0')}`;
  d.date = day + 'T11:00';
  [prevDay + 'T09:00', day + 'T11:00', day + 'T17:30'].forEach((x, i) => { if (d.events[i]) d.events[i].time = x; });
  const owner = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toUpperCase();
  d.gift.groom.owner = owner(d.groom.name); d.gift.bride.owner = owner(d.bride.name);
  return d;
};

/* Chuẩn hoá một phản hồi RSVP (kể cả bản cũ chỉ có `count`) → số suất ăn cho nhà hàng */
TH.rsvpParty = r => {
  if (r.attend !== 'yes') return {adults:0, kids:0, total:0, veg:0, normal:0, allergy:''};
  const adults = Math.max(0, parseInt(r.adults ?? r.count ?? 1, 10) || 0), kids = Math.max(0, parseInt(r.kids, 10) || 0);
  const total = adults + kids, veg = r.veg ? Math.min(total, Math.max(0, parseInt(r.vegCount, 10) || 0)) : 0;
  return {adults, kids, total, veg, normal: total - veg, allergy: r.allergy ? String(r.allergyNote || '').trim() || 'Có dị ứng (chưa ghi rõ)' : ''};
};

/* Lưu trữ cục bộ */
TH.invites = {
  all: () => TH.store.get('invites', {}),
  get: id => TH.invites.all()[id],
  save(id, data){ const all = TH.invites.all(); all[id] = {...data, updated:Date.now()}; return TH.store.set('invites', all); },
  remove(id){ const all = TH.invites.all(); delete all[id]; TH.store.set('invites', all); }
};

/* RSVP & lời chúc — localStorage (thay bằng API khi có backend) */
TH.guestbook = {
  key: id => 'gb_' + id,
  get: id => ({views:0, rsvp:[], wishes:[], cheers:[], ...TH.store.get(TH.guestbook.key(id), {})}),
  put(id, gb){ return TH.store.set(TH.guestbook.key(id), gb); },
  add(id, type, item){ const gb = TH.guestbook.get(id); gb[type] = [{...item, at:Date.now()}, ...(gb[type] || [])]; return TH.guestbook.put(id, gb) === false ? null : gb; },
  view(id){ const gb = TH.guestbook.get(id); gb.views++; TH.guestbook.put(id, gb); }
};

/* Đường dẫn chia sẻ: đóng gói dữ liệu vào URL (#d=) để mở được trên máy khác mà không cần server.
   Ảnh tải lên từ máy (data:) quá lớn nên được lược bỏ — hãy dùng link ảnh online nếu muốn chia sẻ. */
TH.packInvite = data => {
  const strip = v => typeof v === 'string' && v.startsWith('data:') ? '' : v;
  const d = JSON.parse(JSON.stringify(data));
  d.cover = strip(d.cover); d.photos = (d.photos||[]).map(strip).filter(Boolean);
  if (d.gift) ['groom','bride'].forEach(k => d.gift[k] && (d.gift[k].qr = strip(d.gift[k].qr)));
  if (d.music) d.music.url = strip(d.music.url);
  delete d.updated;
  return window.LZString ? LZString.compressToEncodedURIComponent(JSON.stringify(d)) : '';
};
TH.unpackInvite = s => { try { return JSON.parse(LZString.decompressFromEncodedURIComponent(s)); } catch { return null; } };
TH.hasLocalImages = data => [data.cover, ...(data.photos||[]), data.gift?.groom?.qr, data.gift?.bride?.qr].some(v => typeof v === 'string' && v.startsWith('data:'));

TH.inviteUrl = (id, data, guest) => {
  const base = new URL('thiep.html', location.href);
  base.searchParams.set('id', id);
  if (guest) base.searchParams.set('to', guest);
  const packed = data ? TH.packInvite(data) : '';
  return base.href + (packed ? '#d=' + packed : '');
};

/* Nén ảnh tải lên */
TH.readImage = (file, max=1200, q=.8) => new Promise((ok, fail) => {
  const r = new FileReader();
  r.onload = () => { const img = new Image(); img.onload = () => {
    const s = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = img.width*s; c.height = img.height*s;
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', q)); };
    img.onerror = fail; img.src = r.result; };
  r.onerror = fail; r.readAsDataURL(file);
});

/* Nhạc hộp nhạc tự tạo bằng WebAudio — không cần file nhạc, không lo bản quyền */
TH.MusicBox = class {
  constructor(){ this.on = false; }
  start(){
    if (this.on) return; this.on = true;
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
    this.ctx = this.ctx || new A(); this.ctx.resume();
    this.gain = this.ctx.createGain(); this.gain.gain.value = .12; this.gain.connect(this.ctx.destination);
    // Giai điệu gốc, nhịp 3/4 nhẹ nhàng (C major)
    const N = {C4:261.6,D4:293.7,E4:329.6,F4:349.2,G4:392,A4:440,B4:493.9,C5:523.3,D5:587.3,E5:659.3,G5:784};
    const mel = ['E4','G4','C5','B4','G4','E4','F4','A4','D5','C5','A4','F4','G4','B4','D5','C5','B4','G4','E4','G4','C5','E5','D5','C5','A4','C5','E5','D5','B4','G4','C5','-','-'];
    const bass = ['C4','F4','G4','C4','A4','F4','G4','C4'];
    let i = 0; const beat = .42;
    const tone = (f, t, dur, vol, type='sine') => { const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t+.02); g.gain.exponentialRampToValueAtTime(.0001, t+dur);
      o.connect(g); g.connect(this.gain); o.start(t); o.stop(t+dur+.05); };
    let next = this.ctx.currentTime + .1;
    const sched = () => {
      while (next < this.ctx.currentTime + 1) {
        const n = mel[i % mel.length];
        if (n !== '-') { tone(N[n], next, 1.6, .5, 'triangle'); tone(N[n]*2, next, .8, .08); }
        if (i % 3 === 0) tone(N[bass[Math.floor(i/3) % bass.length]]/2, next, 2.2, .35);
        next += beat; i++;
      }
    };
    sched(); this.timer = setInterval(sched, 250);
  }
  stop(){ this.on = false; clearInterval(this.timer); if (this.gain) { const g = this.gain; g.gain.setTargetAtTime(0, this.ctx.currentTime, .2); setTimeout(()=>g.disconnect(), 800); } }
};
/* ---------- Hộp thoại chia sẻ (dùng chung với trang quản lý) ---------- */
function shareDialog(id, D){
  const m = TH.modal(`<h3 style="font-size:1.5rem;margin-bottom:6px">Chia sẻ thiệp cưới</h3>
    <p class="hint" style="margin-bottom:14px">Nhập tên khách để tạo lời mời riêng — thiệp sẽ hiện “Kính mời: [tên]”.</p>
    <div class="field" style="margin-bottom:10px"><label>Tên khách mời</label><input id="gName" placeholder="VD: Anh Tuấn & Người thương"></div>
    <div class="field"><label>Đường dẫn</label><textarea id="gLink" readonly style="min-height:80px;font-size:.8rem"></textarea></div>
    ${TH.hasLocalImages(D) ? '<p class="hint" style="color:#b25;margin-top:6px">⚠ Thiệp có ảnh tải lên từ máy: ảnh đó sẽ không hiển thị khi mở trên máy khác. Hãy dùng link ảnh online.</p>' : ''}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">
      <button class="btn btn-primary btn-sm" id="gCopy">Sao chép</button>
      <a class="btn btn-outline btn-sm" id="gFb" target="_blank">Facebook</a>
      <a class="btn btn-outline btn-sm" id="gMs" target="_blank">Messenger</a>
      <a class="btn btn-outline btn-sm" id="gSms">SMS</a>
      <button class="btn btn-outline btn-sm" id="gNative">Zalo / khác…</button></div>
    <div id="gQr" style="width:150px;margin:0 auto"></div>`);
  m.querySelector('.modal-box').style.maxWidth = '520px';
  const upd = () => {
    const url = TH.inviteUrl(id, D, document.querySelector('#gName').value.trim()); document.querySelector('#gLink').value = url;
    const txt = `Trân trọng kính mời bạn đến dự lễ cưới của ${D.groom.nick} & ${D.bride.nick}: ${url}`;
    document.querySelector('#gFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    document.querySelector('#gMs').href = 'fb-messenger://share/?link=' + encodeURIComponent(url);
    document.querySelector('#gSms').href = 'sms:?&body=' + encodeURIComponent(txt);
    document.querySelector('#gNative').onclick = () => navigator.share ? navigator.share({title:'Thiệp cưới', text:txt, url}).catch(()=>{}) : navigator.clipboard.writeText(txt).then(()=>TH.toast('Đã sao chép lời mời — dán vào Zalo nhé'));
    const q = document.querySelector('#gQr'); q.innerHTML = '';
    if (window.QRCode) try { new QRCode(q, {text:url, width:150, height:150, correctLevel:QRCode.CorrectLevel.L}); } catch { q.innerHTML = '<p class="hint">Link quá dài để tạo QR.</p>'; }
  };
  document.querySelector('#gName').oninput = upd; upd();
  document.querySelector('#gCopy').onclick = () => navigator.clipboard.writeText(document.querySelector('#gLink').value).then(()=>TH.toast('Đã sao chép đường dẫn'));
}
TH.shareDialog = shareDialog;
})();

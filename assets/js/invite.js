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

/* Mỗi sự kiện cần id cố định để nhóm khách tham chiếu (sự kiện thêm từ trình chỉnh sửa chưa có id) */
TH.ensureEventIds = d => { let changed = false;
  (d.events || []).forEach(e => { if (!e.id) { e.id = 'ev' + TH.uid(); changed = true; } });
  return changed; };
/* Lọc lịch trình theo nhóm khách (?grp=): khách chỉ thấy các buổi họ được mời */
TH.applyGroup = (d, grpId) => {
  const g = grpId && (d.groups || []).find(x => x.id === grpId);
  if (!g) return null;
  const evs = (d.events || []).filter(e => (g.events || []).includes(e.id));
  if (!evs.length) return g;
  d.events = evs;
  const main = evs.find(e => /tiệc|báo hỷ/i.test(e.title)) || evs[evs.length - 1];
  if (main?.time) d.date = main.time;
  return g;
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
  add(id, type, item){ const gb = TH.guestbook.get(id); gb[type] = [{uid:TH.uid(), ...item, at:Date.now()}, ...(gb[type] || [])]; return TH.guestbook.put(id, gb) === false ? null : gb; },
  view(id){ const gb = TH.guestbook.get(id); gb.views++; TH.guestbook.put(id, gb); }
};

/* Đường dẫn chia sẻ: đóng gói dữ liệu vào URL (#d=) để mở được trên máy khác mà không cần server.
   Ảnh tải lên từ máy (data:) quá lớn nên được lược bỏ — hãy dùng link ảnh online nếu muốn chia sẻ.
   Bản v2 (đánh dấu "~" ở đầu) nén gọn hơn: tên trường -> mã ngắn, chữ mẫu có sẵn -> số thứ tự, ảnh mẫu -> "@".
   PK_KEYS và PK_TEXTS CHỈ ĐƯỢC THÊM VÀO CUỐI, không sửa/xoá/đổi thứ tự — link đã gửi dựa vào vị trí. */
const PK_KEYS = ["tpl","accent","font","groom","name","nick","father","mother","bride","date","message","quote","events","title","time","place","address","map","hall","lat","lng","parking","cover","photos","story","text","music","type","url","hotlines","role","phone","thanks","gift","bank","acc","owner","qr","opts","countdown","calendar","album","rsvp","wishes","petals","envelope","id","groups","side","guests"];
const PK_TEXTS = [
  "Nguyễn Minh Khôi",
  "Ông Nguyễn Văn Hải",
  "Bà Trần Thị Lan",
  "Ông Lê Quang Vinh",
  "Bà Phạm Thị Mai",
  "Trân trọng kính mời quý khách đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện của quý khách là niềm vinh hạnh lớn lao cho hai gia đình.",
  "Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.",
  "Tư gia nhà gái",
  "12 Nguyễn Trãi, Quận 1, TP. Hồ Chí Minh",
  "Tư gia nhà trai",
  "45 Lê Lợi, Quận 3, TP. Hồ Chí Minh",
  "Trung tâm Hội nghị Tiệc cưới",
  "Sảnh Hoa Hồng · Tầng 2",
  "88 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh",
  "Xe máy: gửi miễn phí tại hầm B1, lối vào bên phải sảnh chính.\nÔ tô: bãi đỗ phía sau tòa nhà (khoảng 40 chỗ), có bảo vệ hướng dẫn.\nĐi taxi/xe công nghệ: chọn điểm đón trả trước cổng chính để thuận tiện nhất.",
  "Lần đầu gặp gỡ",
  "Một buổi chiều mưa ở quán cà phê nhỏ, hai người lạ ngồi chung bàn vì hết chỗ.",
  "Chính thức hẹn hò",
  "Sau hai năm làm bạn, anh lấy hết can đảm để nói lời thương.",
  "Dưới bầu trời Đà Lạt đầy sao, cô ấy đã nói “Đồng ý”.",
  "Anh trai chú rể · Nhà trai",
  "Chị gái cô dâu · Nhà gái",
  "NGUYEN MINH KHOI",
  "Ông Đỗ Văn Khải",
  "Bà Phạm Thị Thanh",
  "Ông Ngô Quang Định",
  "Bà Lý Thị Hương",
  "Ông Hoàng Văn Phúc",
  "Bà Trần Thị Duyên",
  "Ông Lâm Hữu Tài",
  "Bà Nguyễn Thị Diệu",
  "Ông Lê Minh Châu",
  "Ông Vũ Văn Thành",
  "Bà Hoàng Thị Thu",
  "Trần Quang Huy",
  "Ông Trần Văn Bình",
  "Bà Nguyễn Thị Hoa",
  "Ông Phạm Đức Toàn",
  "Bà Lê Thị Hằng",
  "TRAN QUANG HUY",
  "Huỳnh Quốc Bảo",
  "Ông Huỳnh Văn Lợi",
  "Ông Tô Minh Đức",
  "Bà Phan Thị Hà",
  "HUYNH QUOC BAO",
  "Bùi Trọng Hiếu",
  "Ông Bùi Văn Thịnh",
  "Bà Đặng Thị Xuân",
  "Ông Mai Xuân Trường",
  "Bà Cao Thị Lụa",
  "BUI TRONG HIEU",
  "Ông Vũ Đình Lâm",
  "Bà Nguyễn Thị Hạnh",
  "Ông Hồ Văn Nghĩa",
  "Bà Trần Thị Bích",
  "Nguyễn Đức Thắng",
  "Ông Nguyễn Văn Tâm",
  "Bà Trịnh Thị Loan",
  "Đặng Phương Linh",
  "Ông Đặng Quốc Hùng",
  "Bà Bùi Thị Liên",
  "NGUYEN DUC THANG",
  "DANG PHUONG LINH",
  "Phạm Duy Khánh",
  "Ông Phạm Văn Quý",
  "Bà Hà Thị Oanh",
  "Đinh Lan Hương",
  "Ông Đinh Công Thành",
  "PHAM DUY KHANH",
  "DINH LAN HUONG",
  "toi-gian-trang",
  "Trịnh Thành Long",
  "Ông Trịnh Văn Hòa",
  "Bà Phùng Thị Mến",
  "Lương Ngọc Ánh",
  "Ông Lương Đức Hậu",
  "Bà Đào Thị Ngọc",
  "TRINH THANH LONG",
  "LUONG NGOC ANH",
  "Ông Võ Hữu Nghĩa",
  "Bà Châu Thị Lệ",
  "Ông Dương Văn Tấn",
  "Ông Đặng Văn Tiến",
  "Bà Ngô Thị Yến",
  "Kiều Quỳnh Chi",
  "Ông Kiều Minh Tuấn",
  "Bà Phạm Thị Quỳnh",
  "KIEU QUYNH CHI",
  "Ông Lý Văn Sang",
  "Bà Tạ Thị Hồng",
  "Ông Thái Thanh Bình",
  "Bà Nguyễn Thị Trúc",
  "Cao Hoàng Hiệp",
  "Ông Cao Văn Thắng",
  "Bà Doãn Thị Hoài",
  "Ông Lưu Đức Mạnh",
  "Bà Tăng Thị Hiền",
  "CAO HOANG HIEP",
  "Ông Hà Đình Phong",
  "Bà Lại Thị Nguyệt",
  "Ông Quách Văn Hưng",
  "Bà Mạc Thị Yến",
  "Ông Ngô Gia Bảo",
  "Bà Từ Thị Tuyết",
  "Đoàn Tuyết Mai",
  "Ông Đoàn Văn Kiên",
  "Bà Lâm Thị Hoa",
  "DOAN TUYET MAI",
  "Ông Tạ Văn Biển",
  "Bà Nông Thị Hải",
  "Chu Thùy Trang",
  "Ông Chu Minh Khang",
  "Bà Vương Thị Thủy",
  "CHU THUY TRANG",
  "Ông Mạc Văn Cường",
  "Bà Đàm Thị Thu",
  "Tôn Hồng Nhung",
  "Ông Tôn Thất Hòa",
  "Bà Phạm Thị Nhàn",
  "TON HONG NHUNG",
  "Nguyễn Khắc Việt",
  "Ông Nguyễn Khắc Hiếu",
  "Bà Lê Thị Minh",
  "Ông Trần Văn Thuận",
  "Bà Hoàng Thị Mận",
  "NGUYEN KHAC VIET",
  "Phan Hoàng Nam",
  "Ông Phan Thanh Sơn",
  "Trương Khánh Vy",
  "Ông Trương Văn Lộc",
  "Bà Huỳnh Thị Ngọc",
  "PHAN HOANG NAM",
  "TRUONG KHANH VY"
];
const PK_IMG = 'assets/img/mau/';
const pkCode = i => String.fromCharCode(65 + i % 26) + (i >= 26 ? Math.floor(i / 26) - 1 : '');   // A..Z, A0..Z0, A1..
const K2C = Object.fromEntries(PK_KEYS.map((k, i) => [k, pkCode(i)])), C2K = Object.fromEntries(PK_KEYS.map((k, i) => [pkCode(i), k]));
const T2I = new Map(PK_TEXTS.map((t, i) => [t, i]));
const encStr = v => T2I.has(v) ? '§' + T2I.get(v).toString(36) : v.startsWith(PK_IMG) ? '@' + v.slice(PK_IMG.length) : /^[§@!]/.test(v) ? '!' + v : v;
const decStr = v => v[0] === '§' ? PK_TEXTS[parseInt(v.slice(1), 36)] ?? '' : v[0] === '@' ? PK_IMG + v.slice(1) : v[0] === '!' ? v.slice(1) : v;
const encKey = k => K2C[k] || (k in C2K || k[0] === '_' ? '_' + k : k);
const decKey = k => k[0] === '_' ? k.slice(1) : C2K[k] || k;
const pkMap = (v, fk, fs) => Array.isArray(v) ? v.map(x => pkMap(x, fk, fs))
  : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [fk(k), pkMap(x, fk, fs)]))
  : typeof v === 'string' ? fs(v) : v;
TH.packInvite = data => {
  const strip = v => typeof v === 'string' && v.startsWith('data:') ? '' : v;
  const d = JSON.parse(JSON.stringify(data));
  d.cover = strip(d.cover); d.photos = (d.photos||[]).map(strip).filter(Boolean);
  if (d.gift) ['groom','bride'].forEach(k => d.gift[k] && (d.gift[k].qr = strip(d.gift[k].qr)));
  if (d.music) d.music.url = strip(d.music.url);
  if (d.groups) d.groups = d.groups.map(({guests, ...g}) => g);   // không để lộ danh sách tên khách trong link
  Object.values(d.ov || {}).forEach(o => { if (strip(o.img) === '') delete o.img; });
  if (d.layers) d.layers = d.layers.filter(l => strip(l.img) !== '');
  if (d.bg) d.bg.img = strip(d.bg.img);
  delete d.updated;
  return window.LZString ? '~' + LZString.compressToEncodedURIComponent(JSON.stringify(pkMap(d, encKey, encStr))) : '';
};
TH.unpackInvite = s => { try {
  if (s[0] !== '~') return JSON.parse(LZString.decompressFromEncodedURIComponent(s));   // link cũ (v1)
  return pkMap(JSON.parse(LZString.decompressFromEncodedURIComponent(s.slice(1))), decKey, decStr);
} catch { return null; } };
TH.hasLocalImages = data => [data.cover, ...(data.photos||[]), data.gift?.groom?.qr, data.gift?.bride?.qr,
  ...Object.values(data.ov || {}).map(o => o.img), ...(data.layers || []).map(l => l.img), data.bg?.img].some(v => typeof v === 'string' && v.startsWith('data:'));

TH.inviteUrl = (id, data, guest, extra = {}) => {
  const base = new URL('thiep.html', location.href);
  base.searchParams.set('id', id);
  if (guest) base.searchParams.set('to', guest);
  Object.entries(extra).forEach(([k, v]) => v != null && v !== '' && base.searchParams.set(k, v));   // grp, table…
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
/* ---------- Ảnh QR để tải về: thẻ có tên cô dâu chú rể + mã QR lớn, in thiệp giấy hay gửi Zalo đều quét được ---------- */
TH.qrCard = async (url, D, guest) => {
  const box = document.createElement('div');
  new QRCode(box, {text:url, width:880, height:880, correctLevel:QRCode.CorrectLevel.L});
  const qr = box.querySelector('canvas');
  const W = 1080, H = 1400, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), t = TH.findTemplate(D.tpl), accent = D.accent || t.accent, font = TH.fixFont(D.font || t.font);
  try { await Promise.all([document.fonts.load(`80px '${font}'`), document.fonts.load("600 34px 'Be Vietnam Pro'"), document.fonts.load("500 32px 'Be Vietnam Pro'")]); } catch {}
  x.fillStyle = '#fffaf8'; x.fillRect(0, 0, W, H);
  x.strokeStyle = accent; x.lineWidth = 3; x.strokeRect(28, 28, W - 56, H - 56);
  x.textAlign = 'center'; x.fillStyle = '#7a6a70';
  x.font = "600 30px 'Be Vietnam Pro',sans-serif"; x.fillText(guest ? `KÍNH MỜI: ${guest.toUpperCase()}` : 'THIỆP CƯỚI', W / 2, 120);
  x.fillStyle = accent; x.font = `86px '${font}',${TH.fontFallback(font)}`;
  x.fillText(`${D.groom.nick} & ${D.bride.nick}`, W / 2, 220, W - 120);
  const dt = new Date(D.date);
  if (!isNaN(dt)) { x.fillStyle = '#7a6a70'; x.font = "500 32px 'Be Vietnam Pro',sans-serif"; x.fillText(dt.toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit', year:'numeric'}), W / 2, 280); }
  x.fillStyle = '#fff'; x.fillRect(80, 330, 920, 920);
  x.imageSmoothingEnabled = false; x.drawImage(qr, 100, 350, 880, 880);
  x.fillStyle = '#2b2226'; x.font = "600 34px 'Be Vietnam Pro',sans-serif"; x.fillText('Quét mã để xem thiệp mời', W / 2, 1310);
  return c;
};

/* ---------- Hộp thoại chia sẻ (dùng chung với trang quản lý) ----------
   Link gửi đi là link trực tiếp của website (dữ liệu nén sau #d=) — không qua dịch vụ rút gọn,
   vì Zalo chặn các tên miền rút gọn như tinyurl.com. */
function shareDialog(id, D){
  const m = TH.modal(`<h3 style="font-size:1.5rem;margin-bottom:6px">Chia sẻ thiệp cưới</h3>
    <p class="hint" style="margin-bottom:14px">Nhập tên khách để tạo lời mời riêng — thiệp sẽ hiện “Kính mời: [tên]”.</p>
    <div class="field" style="margin-bottom:14px"><label>Tên khách mời</label><input id="gName" placeholder="VD: Anh Tuấn & Người thương"></div>
    <div class="share-opt">
      <b class="share-opt-h">① Gửi link qua Zalo / Facebook</b>
      <input id="gLink" readonly aria-label="Link thiệp">
      <button class="btn btn-primary btn-sm" id="gCopy" style="width:100%">Sao chép link gửi Zalo/Facebook</button>
      <p class="share-safe">🔒 Link trực tiếp an toàn, tương thích 100% với Zalo &amp; Messenger</p>
      <div class="share-btns">
        <button class="btn btn-outline btn-sm" id="gNative">Zalo / khác…</button>
        <a class="btn btn-outline btn-sm" id="gFb" target="_blank">Facebook</a>
        <a class="btn btn-outline btn-sm" id="gMs" target="_blank">Messenger</a>
        <a class="btn btn-outline btn-sm" id="gSms">SMS</a></div>
    </div>
    <div class="share-opt share-qr">
      <b class="share-opt-h">② Mã QR — quét là xem được ngay</b>
      <div id="gQr"></div>
      <button class="btn btn-outline btn-sm" id="gQrDl">⬇ Tải ảnh QR</button>
      <p class="hint">Gửi ảnh QR qua Zalo hoặc in lên thiệp giấy.</p>
    </div>
    ${TH.hasLocalImages(D) ? '<p class="hint" style="color:#b25;margin-top:10px">⚠ Thiệp có ảnh tải lên từ máy: ảnh đó sẽ không hiển thị khi mở trên máy khác. Hãy dùng link ảnh online.</p>' : ''}`);
  m.querySelector('.modal-box').style.maxWidth = '520px';
  const $m = s => m.querySelector(s);
  let url = '', timer;
  const guest = () => $m('#gName').value.trim();
  const drawQr = () => {
    const q = $m('#gQr'); q.innerHTML = '';
    if (!window.QRCode) { q.innerHTML = '<p class="hint">Chưa tải được thư viện QR.</p>'; return; }
    try { new QRCode(q, {text:url, width:220, height:220, correctLevel:QRCode.CorrectLevel.L}); }
    catch { q.innerHTML = '<p class="hint">Nội dung thiệp quá dài để tạo mã QR — hãy rút bớt chữ.</p>'; }
  };
  const upd = () => {
    url = TH.inviteUrl(id, D, guest());
    $m('#gLink').value = url;
    const txt = `Trân trọng kính mời bạn đến dự lễ cưới của ${D.groom.nick} & ${D.bride.nick}: ${url}`;
    $m('#gFb').href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    $m('#gMs').href = 'fb-messenger://share/?link=' + encodeURIComponent(url);
    $m('#gSms').href = 'sms:?&body=' + encodeURIComponent(txt);
    $m('#gNative').onclick = () => navigator.share ? navigator.share({title:'Thiệp cưới', text:txt, url}).catch(()=>{}) : navigator.clipboard.writeText(txt).then(()=>TH.toast('Đã sao chép lời mời — dán vào Zalo nhé'));
    clearTimeout(timer); timer = setTimeout(drawQr, 250);   // vẽ lại QR khi ngừng gõ tên
  };
  $m('#gName').oninput = upd; upd(); drawQr();
  $m('#gLink').onfocus = e => e.target.select();
  $m('#gCopy').onclick = () => navigator.clipboard.writeText(url).then(() => TH.toast('Đã sao chép link — dán vào Zalo/Facebook để gửi nhé!'), () => prompt('Sao chép thủ công:', url));
  $m('#gQrDl').onclick = async () => {
    if (!window.QRCode) return TH.toast('Chưa tải được thư viện QR');
    try {
      const c = await TH.qrCard(url, D, guest());
      const slug = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
      const a = Object.assign(document.createElement('a'), {href:c.toDataURL('image/png'), download:`qr-thiep-cuoi-${slug(D.groom.nick)}-${slug(D.bride.nick)}${guest() ? '-' + slug(guest()) : ''}.png`});
      document.body.append(a); a.click(); a.remove();
      TH.toast('Đã tải ảnh QR');
    } catch { TH.toast('Nội dung thiệp quá dài để tạo mã QR'); }
  };
}
TH.shareDialog = shareDialog;
})();

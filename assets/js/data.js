/* ============ Dữ liệu mẫu thiệp & cẩm nang ============ */
window.TH = window.TH || {};

/* Bộ ảnh của từng mẫu: assets/img/mau/mau-N/01.webp… (đã nén WebP) + thumb.webp cho thẻ xem trước */
const SET = (n, count) => ({
  photos: Array.from({length:count}, (_, i) => `assets/img/mau/mau-${n}/${String(i+1).padStart(2,'0')}.webp`),
  thumb: `assets/img/mau/mau-${n}/thumb.webp`
});

/* Ảnh mặc định khi không xác định được mẫu */
TH.PHOTOS = SET(1, 6).photos;

/* Mỗi mẫu = một bộ theme. Trang thiệp (thiep.html) đọc theme để dựng giao diện. */
TH.TEMPLATES = [
  {id:'hong-pastel',  name:'Hồng Pastel',      tier:'basic',   cat:'Lãng mạn',   bg:'linear-gradient(160deg,#fde8ec,#fff6f3)', fg:'#8a3149', accent:'#d9738a', font:'Great Vibes',         deco:'petal',  views:18420, ...SET(1,6)},
  {id:'vuon-xanh',    name:'Khu Vườn Xanh',    tier:'basic',   cat:'Tối giản',   bg:'linear-gradient(160deg,#e8f1ea,#fbfdf9)', fg:'#2f5a3e', accent:'#7aa586', font:'Dancing Script',      deco:'leaf',   views:12980, ...SET(2,6)},
  {id:'hoang-kim',    name:'Hoàng Kim',        tier:'premium', cat:'Sang trọng', bg:'linear-gradient(160deg,#1f1a17,#3a2e25)', fg:'#e9cf8f', accent:'#c9a45c', font:'Playfair Display',    deco:'gold',   views:25110, ...SET(3,7)},
  {id:'song-hy',      name:'Song Hỷ Đỏ',       tier:'premium', cat:'Truyền thống',bg:'linear-gradient(160deg,#8e1b22,#b9302f)', fg:'#ffe3a8', accent:'#f2c25b', font:'Playfair Display',   deco:'hy',     views:30240, ...SET(4,6)},
  {id:'bien-xanh',    name:'Biển Xanh',        tier:'basic',   cat:'Tối giản',   bg:'linear-gradient(160deg,#e3f0f7,#fbfeff)', fg:'#1f4d6b', accent:'#5d9bc4', font:'Parisienne',          deco:'wave',   views:9870, ...SET(5,7)},
  {id:'oai-huong',    name:'Oải Hương',        tier:'premium', cat:'Lãng mạn',   bg:'linear-gradient(160deg,#ece6f6,#fbf9ff)', fg:'#4d3a78', accent:'#9b87c9', font:'Great Vibes',         deco:'petal',  views:14550, ...SET(6,6)},
  {id:'giay-kraft',   name:'Giấy Kraft',       tier:'basic',   cat:'Vintage',    bg:'linear-gradient(160deg,#eadbc5,#f7efe2)', fg:'#5b4130', accent:'#a67c52', font:'Dancing Script',      deco:'leaf',   views:11200, ...SET(7,6)},
  {id:'dem-sao',      name:'Đêm Đầy Sao',      tier:'premium', cat:'Sang trọng', bg:'linear-gradient(160deg,#0f1834,#26345f)', fg:'#f3e7c9', accent:'#d9bb74', font:'Parisienne',          deco:'star',   views:21760, ...SET(8,5)},
  {id:'mau-don',      name:'Mẫu Đơn',          tier:'premium', cat:'Truyền thống',bg:'linear-gradient(160deg,#fbe4e1,#fff8f2)', fg:'#8d2b3a', accent:'#c9485b', font:'Playfair Display',   deco:'petal',  views:17330, ...SET(9,6)},
  {id:'toi-gian-trang',name:'Trắng Tinh Khôi', tier:'basic',   cat:'Tối giản',   bg:'linear-gradient(160deg,#ffffff,#f4f1ee)', fg:'#2b2226', accent:'#8c7b75', font:'Playfair Display',    deco:'line',   views:15840, ...SET(10,9)},
  {id:'hoang-hon',    name:'Hoàng Hôn',        tier:'premium', cat:'Lãng mạn',   bg:'linear-gradient(160deg,#fbd3c0,#fdeee0)', fg:'#8a3b24', accent:'#e0805b', font:'Great Vibes',         deco:'star',   views:13290, ...SET(11,8)},
  {id:'co-dien',      name:'Cổ Điển Châu Âu',  tier:'basic',   cat:'Vintage',    bg:'linear-gradient(160deg,#f1ebe1,#fcfaf5)', fg:'#3e3a33', accent:'#9b8a6a', font:'Parisienne',          deco:'gold',   views:10420, ...SET(12,7)},
  {id:'nang-vang',    name:'Nắng Vàng',        tier:'premium', cat:'Sang trọng', bg:'linear-gradient(160deg,#f7ead2,#fffaf0)', fg:'#6b4a1f', accent:'#c99a4b', font:'Playfair Display',    deco:'gold',   views:16480, ...SET(13,7)},
  {id:'tiec-vuon',    name:'Tiệc Vườn',        tier:'basic',   cat:'Lãng mạn',   bg:'linear-gradient(160deg,#e6efe0,#fbfdf7)', fg:'#3b5a33', accent:'#8fb07c', font:'Great Vibes',         deco:'leaf',   heroPos:'top', /* ảnh bìa có bảng tên ở giữa → đặt chữ lên trên */   views:12140, ...SET(14,7)},
  {id:'rung-thong',   name:'Rừng Thông',       tier:'premium', cat:'Vintage',    bg:'linear-gradient(160deg,#2c3a2e,#46594a)', fg:'#f1e9d6', accent:'#c7b483', font:'Parisienne',          deco:'leaf',   views:14730, ...SET(15,8)},
  {id:'thanh-lich',   name:'Thanh Lịch',       tier:'basic',   cat:'Tối giản',   bg:'linear-gradient(160deg,#f3f3f1,#ffffff)', fg:'#33302e', accent:'#a39d96', font:'Dancing Script',      deco:'line',   views:11360, ...SET(16,6)},
  {id:'la-non',       name:'Lá Non',           tier:'basic',   cat:'Tối giản',   bg:'linear-gradient(160deg,#edf3ea,#fcfdfb)', fg:'#3f5642', accent:'#93ad8f', font:'Playfair Display',    deco:'leaf',   views:10650, ...SET(17,7)},
  {id:'ngay-nang',    name:'Ngày Nắng',        tier:'basic',   cat:'Lãng mạn',   bg:'linear-gradient(160deg,#fdeee4,#f4f9ee)', fg:'#6e4a35', accent:'#e39b78', font:'Dancing Script',      deco:'petal',  views:9940,  ...SET(18,9)},
  {id:'be-kem',       name:'Be Kem',           tier:'premium', cat:'Vintage',    bg:'linear-gradient(160deg,#f2e6dc,#fcf7f2)', fg:'#6a4a43', accent:'#c98a86', font:'Great Vibes',         deco:'petal',  views:13870, ...SET(19,9)},
  {id:'anh-bac',      name:'Ánh Bạc',          tier:'premium', cat:'Sang trọng', bg:'linear-gradient(160deg,#16181f,#2e323d)', fg:'#eef0f4', accent:'#b9c0cc', font:'Playfair Display',    deco:'star',   views:19620, ...SET(20,6)}
];

/* Cặp đôi mẫu của từng mẫu thiệp: hiển thị trên thẻ xem trước và trong trang thiệp demo.
   Mẫu nào có ảnh in sẵn tên/ngày (bảng chào mừng, Save the Date…) thì phải ghi đúng như trong ảnh.
   [tên chú rể, họ, tên cô dâu, họ, ngày cưới, bố chú rể, mẹ chú rể, bố cô dâu, mẹ cô dâu] */
const COUPLES = {
  'song-hy':       ['Quang Huy',  'Trần',   'Mai Anh',     'Phạm',   '2026-01-18', 'Trần Văn Bình',    'Nguyễn Thị Hoa',  'Phạm Đức Toàn',   'Lê Thị Hằng'],
  'hoang-kim':     ['Tuấn Kiệt',  'Lê',     'Bảo Ngọc',    'Vũ',     '2026-02-22', 'Lê Minh Châu',     'Đỗ Thị Nga',      'Vũ Văn Thành',    'Hoàng Thị Thu'],
  'dem-sao':       ['Đức Thắng',  'Nguyễn', 'Phương Linh', 'Đặng',   '2026-12-12', 'Nguyễn Văn Tâm',   'Trịnh Thị Loan',  'Đặng Quốc Hùng',  'Bùi Thị Liên'],
  'anh-bac':       ['Hoàng Nam',  'Phan',   'Khánh Vy',    'Trương', '2026-11-21', 'Phan Thanh Sơn',   'Võ Thị Kim',      'Trương Văn Lộc',  'Huỳnh Thị Ngọc'],
  'hong-pastel':   ['Minh Quân',  'Đỗ',     'Thảo My',     'Ngô',    '2026-03-08', 'Đỗ Văn Khải',      'Phạm Thị Thanh',  'Ngô Quang Định',  'Lý Thị Hương'],
  'vuon-xanh':     ['Mẫn',        'Hoàng Văn','Hoà',       'Lâm Thị','2026-09-20', 'Hoàng Văn Phúc',   'Trần Thị Duyên',  'Lâm Hữu Tài',     'Nguyễn Thị Diệu'], // theo bảng Save the Date trong ảnh mau-2/04
  'bien-xanh':     ['Quốc Bảo',   'Huỳnh',  'Hà My',       'Tô',     '2026-06-20', 'Huỳnh Văn Lợi',    'Lê Thị Ánh',      'Tô Minh Đức',     'Phan Thị Hà'],
  'oai-huong':     ['Trọng Hiếu', 'Bùi',    'Thùy Dung',   'Mai',    '2026-05-17', 'Bùi Văn Thịnh',    'Đặng Thị Xuân',   'Mai Xuân Trường', 'Cao Thị Lụa'],
  'giay-kraft':    ['Anh Dũng',   'Vũ',     'Bích Ngọc',   'Hồ',     '2026-09-26', 'Vũ Đình Lâm',      'Nguyễn Thị Hạnh', 'Hồ Văn Nghĩa',    'Trần Thị Bích'],
  'mau-don':       ['Duy Khánh',  'Phạm',   'Lan Hương',   'Đinh',   '2026-01-04', 'Phạm Văn Quý',     'Hà Thị Oanh',     'Đinh Công Thành', 'Vũ Thị Lan'],
  'toi-gian-trang':['Thành Long', 'Trịnh',  'Ngọc Ánh',    'Lương',  '2026-07-11', 'Trịnh Văn Hòa',    'Phùng Thị Mến',   'Lương Đức Hậu',   'Đào Thị Ngọc'],
  'hoang-hon':     ['Hữu Phước',  'Võ',     'Cẩm Ly',      'Dương',  '2026-08-15', 'Võ Hữu Nghĩa',     'Châu Thị Lệ',     'Dương Văn Tấn',   'Lê Thị Cẩm'],
  'co-dien':       ['Tiến Đạt',   'Đặng',   'Quỳnh Chi',   'Kiều',   '2026-10-24', 'Đặng Văn Tiến',    'Ngô Thị Yến',     'Kiều Minh Tuấn',  'Phạm Thị Quỳnh'],
  'nang-vang':     ['Văn Hậu',    'Lý',     'Trúc Mai',    'Thái',   '2026-09-05', 'Lý Văn Sang',      'Tạ Thị Hồng',     'Thái Thanh Bình', 'Nguyễn Thị Trúc'],
  'tiec-vuon':     ['Hoàng Hiệp', 'Cao',    'Thủy Tiên',   'Lưu',    '2026-10-05', 'Cao Văn Thắng',    'Doãn Thị Hoài',   'Lưu Đức Mạnh',    'Tăng Thị Hiền'],  // theo bảng Welcome trong ảnh mau-14
  'rung-thong':    ['Đình Trọng', 'Hà',     'Yến Nhi',     'Quách',  '2026-11-07', 'Hà Đình Phong',    'Lại Thị Nguyệt',  'Quách Văn Hưng',  'Mạc Thị Yến'],
  'thanh-lich':    ['Gia Huy',    'Ngô',    'Tuyết Mai',   'Đoàn',   '2026-03-29', 'Ngô Gia Bảo',      'Từ Thị Tuyết',    'Đoàn Văn Kiên',   'Lâm Thị Hoa'],
  'la-non':        ['Hải Đăng',   'Tạ',     'Thùy Trang',  'Chu',    '2026-05-31', 'Tạ Văn Biển',      'Nông Thị Hải',    'Chu Minh Khang',  'Vương Thị Thủy'],
  'ngay-nang':     ['Việt Anh',   'Mạc',    'Hồng Nhung',  'Tôn',    '2026-07-25', 'Mạc Văn Cường',    'Đàm Thị Thu',     'Tôn Thất Hòa',    'Phạm Thị Nhàn'],
  'be-kem':        ['Khắc Việt',  'Nguyễn', 'Thu Thảo',    'Trần',   '2026-12-27', 'Nguyễn Khắc Hiếu', 'Lê Thị Minh',     'Trần Văn Thuận',  'Hoàng Thị Mận']
};
TH.TEMPLATES.forEach(t => { const c = COUPLES[t.id]; if (!c) return;
  t.couple = {groom:c[0], bride:c[2], date:c[4]};
  t.family = {
    groom:{name:`${c[1]} ${c[0]}`, nick:c[0], father:'Ông ' + c[5], mother:'Bà ' + c[6]},
    bride:{name:`${c[3]} ${c[2]}`, nick:c[2], father:'Ông ' + c[7], mother:'Bà ' + c[8]}
  };
});
TH.TEMPLATE_CATS = ['Tất cả','Lãng mạn','Tối giản','Sang trọng','Truyền thống','Vintage'];
TH.findTemplate = id => TH.TEMPLATES.find(t => t.id === id) || TH.TEMPLATES[0];

/* Cảm nhận của các cặp đôi đã dùng mẫu & lời chúc của khách — chạy như danh đề phim trong cửa sổ chi tiết mẫu.
   Mỗi mẫu lấy một bộ cố định (theo id) nên mở lại vẫn thấy đúng các dòng cũ. */
const REVIEWS = [
  ['Ngọc Anh & Đức Huy', 'Hà Nội', 'Mẫu đẹp hơn cả mong đợi, họ hàng ai mở thiệp cũng khen. Chỉnh sửa rất dễ, 20 phút là xong!'],
  ['Thu Trang & Minh Tuấn', 'TP. Hồ Chí Minh', 'Phần xác nhận tham dự giúp tụi mình đếm khách chính xác, nhà hàng chuẩn bị vừa đủ bàn.'],
  ['Hải Yến & Quốc Bảo', 'Đà Nẵng', 'Ông bà mình dùng chế độ chữ lớn và nghe đọc thiệp, cảm động lắm luôn.'],
  ['Phương Thảo & Gia Khánh', 'Cần Thơ', 'Gửi qua Zalo có tên riêng từng khách, bạn bè bảo trông rất chuyên nghiệp.'],
  ['Mai Linh & Trọng Nghĩa', 'Hải Phòng', 'Nhạc nền + hiệu ứng mở phong bì làm khách nào cũng xem tới cuối thiệp.'],
  ['Khánh Linh & Văn Đức', 'Huế', 'Mã QR mừng cưới tiện cho khách ở xa, tụi mình nhận được nhiều lời chúc dễ thương.'],
  ['Bảo Trâm & Hoàng Long', 'Nha Trang', 'Đổi phông chữ, kéo thả ảnh y như Canva. Không biết thiết kế vẫn làm được.'],
  ['Diệu Linh & Anh Khoa', 'Bắc Ninh', 'Album ảnh cưới hiển thị nét, khách vào xem lại nhiều lần sau ngày cưới.'],
  ['Thanh Hương & Đình Phúc', 'Vũng Tàu', 'Đếm ngược ngày cưới ngay trang đầu, cả nhà háo hức theo từng ngày.'],
  ['Kim Ngân & Thành Đạt', 'Quảng Ninh', 'Màu sắc tinh tế, in ảnh màn hình đăng Facebook cũng rất đẹp.'],
  ['Hồng Nhung & Quang Vinh', 'Đà Lạt', 'Khách bấm chỉ đường tới nhà hàng một chạm, không ai bị lạc đường.'],
  ['Lan Chi & Tuấn Anh', 'Thanh Hoá', 'Tiết kiệm được cả triệu tiền in thiệp giấy mà vẫn sang trọng.']
];
const WISHES = [
  ['Cô Hạnh', 'Chúc hai con trăm năm hạnh phúc, đầu bạc răng long!'], ['Anh Tuấn', 'Thiệp xinh quá, hẹn gặp hai bạn ở tiệc nhé 🥂'],
  ['Chị Ngọc', 'Chúc mừng hạnh phúc! Sớm có thiên thần nhỏ nha 👶'], ['Bạn thân Hà', 'Cuối cùng cũng chờ được ngày này, mãi yêu nhau như hôm nay nhé 💕'],
  ['Nhóm lớp 12A1', 'Cả lớp sẽ có mặt đông đủ, chúc hai bạn mãi là một đôi!'], ['Đồng nghiệp Minh', 'Chúc mừng đám cưới, thiệp online tiện ghê, mở là thấy đường đi luôn.'],
  ['Bác Tư', 'Chúc hai cháu thuận vợ thuận chồng, tát biển Đông cũng cạn.'], ['Em Vy', 'Ảnh cưới đẹp như phim luôn, chúc anh chị hạnh phúc!'],
  ['Anh Long', 'Ở xa không về kịp, gửi chút quà qua mã QR nhé. Chúc mừng hai em!'], ['Chị Thảo', 'Trăm năm tình viên mãn, bạc đầu nghĩa phu thê 💐']
];
TH.tplReviews = t => {
  let h = 0; for (const c of t.id) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const pick = (arr, n) => Array.from({length:n}, (_, i) => arr[(h + i * 7) % arr.length]).filter((x, i, a) => a.indexOf(x) === i);
  const rv = pick(REVIEWS, 6).map(([who, city, text], i) => ({kind:'review', who, city, text, stars: (h + i) % 5 === 3 ? 4 : 5}));
  const ws = pick(WISHES, 5).map(([who, text]) => ({kind:'wish', who, text}));
  return rv.flatMap((r, i) => ws[i] ? [r, ws[i]] : [r]);
};

/* Thiệp mẫu “khách hàng đã tạo” để trưng bày */
TH.SHOWCASE = [
  {groom:'Minh Khôi', bride:'Thu Hà',    date:'2026-10-18', tpl:'hong-pastel'},
  {groom:'Quốc Bảo',  bride:'Ngọc Anh',  date:'2026-11-08', tpl:'hoang-kim'},
  {groom:'Đức Anh',   bride:'Phương Linh',date:'2026-12-20', tpl:'song-hy'},
  {groom:'Mẫn',       bride:'Hoà',       date:'2026-09-20', tpl:'vuon-xanh'}, // album mẫu này có bảng Save the Date ghi Mẫn – Hoà
  {groom:'Hoàng Nam', bride:'Bảo Trân',  date:'2027-01-10', tpl:'dem-sao'},
  {groom:'Gia Huy',   bride:'Khánh Vy',  date:'2026-11-29', tpl:'oai-huong'},
  {groom:'Thành Đạt', bride:'Hải Yến',   date:'2026-12-06', tpl:'mau-don'},
  {groom:'Việt Hùng', bride:'Thảo My',   date:'2027-02-14', tpl:'bien-xanh'},
  {groom:'Anh Tuấn',  bride:'Diệu Linh', date:'2026-10-11', tpl:'giay-kraft'},
  {groom:'Trung Kiên',bride:'Hồng Nhung',date:'2027-03-08', tpl:'hoang-hon'}
];

/* ============ Cẩm nang ============ */
TH.POST_CATS = ['Tất cả','Hướng dẫn','Kiến thức','Kinh nghiệm','So sánh'];
TH.POSTS = [
{
  slug:'huong-dan-tao-thiep-cuoi-online',
  title:'Tạo thiệp cưới online từ A đến Z chỉ với 7 bước',
  cat:'Hướng dẫn', read:9, date:'2026-09-20', cover:['#c8506a','#e89aa9'], coverText:'7 bước',
  excerpt:'Từ chọn mẫu, điền thông tin, thêm ảnh đến gửi thiệp cho từng khách — quy trình đầy đủ để có tấm thiệp online chỉn chu trong một buổi tối.',
  body:`
<p>Thiệp cưới online giúp bạn tiết kiệm chi phí in ấn, gửi được cho bạn bè ở xa và cập nhật thông tin bất cứ lúc nào. Dưới đây là quy trình bảy bước mà bạn có thể làm theo ngay trên WEDSTORY.</p>
<h2 id="b1">Bước 1: Chọn mẫu phù hợp phong cách đám cưới</h2>
<p>Hãy bắt đầu từ tông màu và không khí của ngày cưới. Cưới ngoài trời hợp với các mẫu xanh lá, tối giản; tiệc nhà hàng sang trọng hợp với tông đen – vàng; lễ gia tiên hợp với mẫu đỏ song hỷ.</p>
<ul><li>Xem trước mẫu trên cả điện thoại lẫn máy tính.</li><li>Ưu tiên mẫu có đủ các mục bạn cần: lịch trình, bản đồ, album, hộp mừng cưới.</li></ul>
<h2 id="b2">Bước 2: Điền thông tin cô dâu, chú rể</h2>
<p>Nhập họ tên, tên gọi thân mật, tên bố mẹ hai bên. Kiểm tra kỹ chính tả và dấu tiếng Việt — đây là lỗi phổ biến nhất khiến thiệp mất điểm.</p>
<h2 id="b3">Bước 3: Thiết lập thời gian và địa điểm</h2>
<p>Thêm riêng lễ vu quy, lễ thành hôn và tiệc cưới nếu tổ chức nhiều buổi. Dán liên kết Google Maps để khách mở chỉ đường chỉ với một chạm.</p>
<h2 id="b4">Bước 4: Thêm ảnh cưới và câu chuyện tình yêu</h2>
<p>Chọn 1 ảnh bìa thật đẹp và 6–12 ảnh cho album. Viết vài dòng về lần đầu gặp gỡ, lời cầu hôn — khách mời rất thích đọc phần này.</p>
<h2 id="b5">Bước 5: Chọn nhạc nền</h2>
<p>Một bản nhạc không lời nhẹ nhàng hoặc bài hát kỷ niệm của hai bạn sẽ khiến thiệp có hồn hơn. Nên chọn đoạn nhạc có âm lượng vừa phải.</p>
<h2 id="b6">Bước 6: Bật xác nhận tham dự và hộp mừng cưới</h2>
<p>Tính năng xác nhận tham dự (RSVP) giúp bạn biết trước số khách để đặt bàn. Hộp mừng cưới với mã QR giúp khách ở xa gửi lời chúc và quà mừng thuận tiện.</p>
<h2 id="b7">Bước 7: Cá nhân hoá tên khách và gửi đi</h2>
<p>Dùng tính năng “tên khách mời” để tạo đường dẫn riêng cho từng người, ví dụ “Kính mời: Anh Tuấn &amp; Người thương”. Sau đó gửi qua Zalo, Messenger hoặc SMS.</p>
<blockquote>Mẹo: Gửi thử cho chính mình trước để kiểm tra hiển thị và âm thanh trên điện thoại.</blockquote>`
},
{
  slug:'thiep-cuoi-online-la-gi',
  title:'Thiệp cưới online là gì? Ưu điểm, hạn chế và cách dùng đúng',
  cat:'Kiến thức', read:7, date:'2026-09-12', cover:['#6b8f71','#a8c3a0'], coverText:'Thiệp online',
  excerpt:'Hiểu rõ thiệp cưới điện tử hoạt động ra sao, khi nào nên dùng và cách kết hợp với thiệp giấy để vừa tiện lợi vừa giữ được lễ nghĩa.',
  body:`
<p>Thiệp cưới online (thiệp điện tử, thiệp web) là một trang web nhỏ chứa toàn bộ thông tin đám cưới: tên cô dâu chú rể, thời gian, địa điểm, album ảnh, bản đồ và các tính năng tương tác. Khách mời chỉ cần mở đường dẫn là xem được, không cần cài ứng dụng.</p>
<h2 id="uu-diem">Ưu điểm nổi bật</h2>
<ul>
<li><b>Tiết kiệm:</b> Không tốn phí in ấn, vận chuyển.</li>
<li><b>Nhanh chóng:</b> Gửi cho hàng trăm người chỉ trong vài phút.</li>
<li><b>Sinh động:</b> Có nhạc, hiệu ứng, ảnh cưới, video.</li>
<li><b>Dễ cập nhật:</b> Đổi giờ, đổi địa điểm mà không phải in lại.</li>
<li><b>Tương tác:</b> Khách gửi lời chúc, xác nhận tham dự, mừng cưới online.</li>
</ul>
<h2 id="han-che">Hạn chế cần lưu ý</h2>
<p>Với ông bà, cô chú lớn tuổi, thiệp giấy trao tận tay vẫn thể hiện sự trân trọng hơn. Một số người không quen mở đường dẫn lạ.</p>
<h2 id="ket-hop">Cách kết hợp thông minh</h2>
<table><tr><th>Đối tượng</th><th>Hình thức gợi ý</th></tr>
<tr><td>Ông bà, họ hàng lớn tuổi</td><td>Thiệp giấy trao tận tay</td></tr>
<tr><td>Bạn bè, đồng nghiệp</td><td>Thiệp online kèm tên riêng</td></tr>
<tr><td>Người ở xa</td><td>Thiệp online + gọi điện báo tin</td></tr></table>
<blockquote>Thiệp online không thay thế sự chân thành. Một lời nhắn riêng kèm đường dẫn luôn tốt hơn gửi hàng loạt.</blockquote>`
},
{
  slug:'gui-thiep-cuoi-qua-zalo',
  title:'Gửi thiệp cưới qua Zalo sao cho lịch sự và tinh tế',
  cat:'Kinh nghiệm', read:8, date:'2026-09-05', cover:['#3d7bb8','#8fbbe0'], coverText:'Qua Zalo',
  excerpt:'Những nguyên tắc nhỏ giúp lời mời qua tin nhắn không bị coi là “mời cho có”, kèm mẫu tin nhắn cho từng đối tượng.',
  body:`
<p>Mời cưới qua tin nhắn đã trở nên phổ biến, nhưng cách gửi quyết định khách cảm thấy được tôn trọng hay không.</p>
<h2 id="nguyen-tac">5 nguyên tắc vàng</h2>
<ol>
<li><b>Nhắn riêng từng người</b>, tránh gửi vào nhóm đông người.</li>
<li><b>Chào hỏi trước</b>, hỏi thăm vài câu rồi mới gửi thiệp.</li>
<li><b>Dùng đường dẫn có tên khách</b> để thể hiện sự quan tâm.</li>
<li><b>Gửi sớm 2–3 tuần</b> để khách sắp xếp thời gian.</li>
<li><b>Nhắc lại nhẹ nhàng</b> 1–2 ngày trước lễ cưới.</li>
</ol>
<h2 id="mau-tin">Mẫu tin nhắn tham khảo</h2>
<h3>Gửi bạn thân</h3>
<blockquote>“Ê, cuối cùng tụi mình cũng về chung một nhà rồi nè! Ngày 18/10 nhất định phải có mặt nha, thiếu mày là không vui đâu. Thiệp đây: [đường dẫn]”</blockquote>
<h3>Gửi đồng nghiệp, cấp trên</h3>
<blockquote>“Dạ em chào anh/chị. Em xin phép báo tin vui: em sẽ tổ chức lễ cưới vào ngày 18/10. Em rất mong anh/chị dành chút thời gian đến chung vui cùng gia đình em ạ. Thiệp mời: [đường dẫn]”</blockquote>
<h2 id="tranh">Những điều nên tránh</h2>
<ul><li>Chỉ gửi đường dẫn trơn, không một lời nhắn.</li><li>Gửi quá sát ngày.</li><li>Gắn thẻ hàng loạt trên mạng xã hội thay cho lời mời.</li></ul>`
},
{
  slug:'loi-moi-cuoi-theo-vai-ve',
  title:'Gợi ý lời mời cưới online theo từng vai vế khách mời',
  cat:'Kinh nghiệm', read:7, date:'2026-08-28', cover:['#b0773f','#e3bf8a'], coverText:'Lời mời',
  excerpt:'Cách xưng hô và văn phong khác nhau khi mời họ hàng, thầy cô, sếp, đồng nghiệp hay bạn bè — kèm các mẫu câu có thể dùng ngay.',
  body:`
<p>Một lời mời đúng vai vế giúp khách cảm thấy được coi trọng. Dưới đây là gợi ý văn phong cho từng nhóm khách.</p>
<h2 id="ho-hang">Họ hàng, người lớn tuổi</h2>
<p>Dùng văn phong trang trọng, xưng “con/cháu”, nhắc tên bố mẹ để người nhận dễ nhận ra.</p>
<blockquote>“Con kính mời bác đến dự lễ thành hôn của con và … Sự hiện diện của bác là niềm vinh hạnh cho gia đình con.”</blockquote>
<h2 id="thay-co">Thầy cô</h2>
<blockquote>“Em kính mời thầy/cô đến chung vui trong ngày trọng đại của em. Em rất mong được gặp lại thầy/cô.”</blockquote>
<h2 id="cong-so">Cấp trên, đồng nghiệp</h2>
<blockquote>“Trân trọng kính mời anh/chị đến dự tiệc cưới của em. Rất mong anh/chị sắp xếp thời gian đến chung vui cùng chúng em.”</blockquote>
<h2 id="ban-be">Bạn bè</h2>
<blockquote>“Ngày vui của tụi mình sẽ trọn vẹn hơn khi có bạn. Hẹn gặp nhau ở tiệc cưới nhé!”</blockquote>
<h2 id="luu-y">Lưu ý chung</h2>
<ul><li>Ghi rõ giờ đón khách và giờ khai tiệc.</li><li>Nếu tiệc chỉ dành cho một người, hãy ghi tên khách cụ thể thay vì “và gia đình”.</li></ul>`
},
{
  slug:'so-sanh-cach-lam-thiep-cuoi',
  title:'Thiệp giấy, thiệp ảnh hay thiệp web: nên chọn loại nào?',
  cat:'So sánh', read:9, date:'2026-08-15', cover:['#4d3a78','#9b87c9'], coverText:'So sánh',
  excerpt:'Đặt các hình thức thiệp cưới phổ biến lên bàn cân về chi phí, thời gian, trải nghiệm khách mời và độ trang trọng.',
  body:`
<p>Mỗi hình thức thiệp đều có chỗ đứng riêng. Bảng dưới đây giúp bạn quyết định nhanh.</p>
<table>
<tr><th>Tiêu chí</th><th>Thiệp giấy</th><th>Thiệp ảnh (PNG/JPG)</th><th>Thiệp web</th></tr>
<tr><td>Chi phí</td><td>Cao</td><td>Thấp</td><td>Miễn phí – thấp</td></tr>
<tr><td>Thời gian làm</td><td>1–2 tuần</td><td>1–2 giờ</td><td>30 phút</td></tr>
<tr><td>Chỉnh sửa sau khi gửi</td><td>Không</td><td>Phải gửi lại</td><td>Cập nhật tức thì</td></tr>
<tr><td>Bản đồ, nhạc, album</td><td>Không</td><td>Không</td><td>Có</td></tr>
<tr><td>Xác nhận tham dự</td><td>Không</td><td>Không</td><td>Có</td></tr>
<tr><td>Độ trang trọng</td><td>Rất cao</td><td>Trung bình</td><td>Cao (nếu gửi khéo)</td></tr>
</table>
<h2 id="tieu-chi">Tiêu chí chọn nền tảng thiệp web</h2>
<ul>
<li>Kho mẫu đa dạng, có cả phong cách truyền thống lẫn hiện đại.</li>
<li>Trình chỉnh sửa trực quan, xem trước ngay khi sửa.</li>
<li>Hỗ trợ tên khách mời riêng, nhạc nền, bản đồ, album.</li>
<li>Có RSVP, sổ lời chúc, hộp mừng cưới.</li>
<li>Tốc độ tải nhanh trên 4G, hiển thị tốt trên mọi điện thoại.</li>
</ul>
<h2 id="ket-luan">Kết luận</h2>
<p>Cách phổ biến nhất hiện nay: in một lượng nhỏ thiệp giấy cho người lớn tuổi và dùng thiệp web cho phần lớn khách mời còn lại.</p>`
},
{
  slug:'chuan-bi-dam-cuoi-checklist',
  title:'Checklist chuẩn bị đám cưới 6 tháng: không bỏ sót việc gì',
  cat:'Kinh nghiệm', read:10, date:'2026-08-02', cover:['#c9a45c','#ecd49b'], coverText:'Checklist',
  excerpt:'Lịch trình chuẩn bị theo từng mốc thời gian, từ chọn ngày, đặt tiệc, chụp ảnh đến gửi thiệp và tổng duyệt.',
  body:`
<h2 id="6-thang">6 tháng trước</h2>
<ul><li>Thống nhất ngân sách và quy mô.</li><li>Xem ngày, chọn địa điểm tổ chức.</li><li>Lập danh sách khách mời sơ bộ.</li></ul>
<h2 id="4-thang">4 tháng trước</h2>
<ul><li>Đặt studio chụp ảnh cưới, trang phục.</li><li>Chọn dịch vụ trang trí, MC, ban nhạc.</li></ul>
<h2 id="2-thang">2 tháng trước</h2>
<ul><li>Hoàn thiện thiệp cưới online, in thiệp giấy số lượng nhỏ.</li><li>Đặt nhẫn cưới, lên kịch bản buổi lễ.</li></ul>
<h2 id="3-tuan">3 tuần trước</h2>
<ul><li>Gửi thiệp cho khách mời.</li><li>Theo dõi danh sách xác nhận tham dự để chốt số bàn.</li></ul>
<h2 id="1-tuan">1 tuần trước</h2>
<ul><li>Tổng duyệt, xác nhận lại với các nhà cung cấp.</li><li>Nhắc khách qua tin nhắn kèm đường dẫn bản đồ.</li></ul>
<blockquote>Hãy chừa ra ít nhất một ngày nghỉ ngơi trước lễ cưới — cô dâu chú rể tươi tắn là điều quan trọng nhất.</blockquote>`
}
];
TH.findPost = slug => TH.POSTS.find(p => p.slug === slug);

TH.FAQ = [
  ['Thiệp cưới online là gì?','Là một trang web nhỏ chứa thông tin đám cưới của bạn: tên, thời gian, địa điểm, ảnh cưới, bản đồ, nhạc nền. Khách chỉ cần mở đường dẫn trên điện thoại hoặc máy tính.'],
  ['Tạo thiệp trên WEDSTORY có mất phí không?','Gói Cơ bản hoàn toàn miễn phí với đầy đủ tính năng chính. Các gói trả phí mở khoá mẫu Premium, tên miền riêng, bỏ logo và thống kê nâng cao.'],
  ['Tôi có thể chỉnh sửa thiệp sau khi đã gửi không?','Có. Mọi thay đổi được cập nhật ngay trên đường dẫn cũ, khách mời không cần nhận lại thiệp mới.'],
  ['Làm sao gửi thiệp có tên riêng từng khách?','Trong trang quản lý thiệp, nhập tên khách mời để tạo đường dẫn riêng. Khi mở thiệp, khách sẽ thấy dòng “Kính mời: [tên khách]”.'],
  ['Thiệp có hiển thị tốt trên điện thoại không?','Tất cả mẫu được thiết kế ưu tiên điện thoại và hiển thị đẹp trên máy tính bảng, máy tính.'],
  ['Hộp mừng cưới hoạt động thế nào?','Bạn tải lên mã QR ngân hàng hoặc ví điện tử. Khách bấm “Mừng cưới” để xem mã QR, sao chép số tài khoản và gửi lời chúc.']
];

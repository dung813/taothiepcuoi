/* ============ Tiện ích cho trang thiệp: hiệu ứng canvas, đọc thiệp, gợi ý lời chúc, đặt xe ============ */
(function(){
const TH = window.TH;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Hiệu ứng canvas: bắn tim & pháo hoa ---------- */
TH.FX = (() => {
  let cv, ctx, W = 0, H = 0, dpr = 1, parts = [], rockets = [], raf = 0;
  const setup = () => {
    if (cv) return;
    cv = document.createElement('canvas'); cv.className = 'fx-canvas'; cv.setAttribute('aria-hidden', 'true');
    document.body.append(cv); ctx = cv.getContext('2d');
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener('resize', size);
  };
  const heartPath = (x, y, s) => {
    ctx.beginPath(); ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3);
    ctx.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s);
    ctx.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3);
    ctx.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); ctx.fill();
  };
  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    rockets = rockets.filter(r => {
      r.x += r.vx; r.y += r.vy; r.vy += .06;
      ctx.globalAlpha = 1; ctx.fillStyle = r.color; ctx.beginPath(); ctx.arc(r.x, r.y, 2.4, 0, 7); ctx.fill();
      ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(r.x - r.vx * 2, r.y - r.vy * 2, 1.8, 0, 7); ctx.fill();
      if (r.vy >= -1 || r.y <= r.ty) { burst(r.x, r.y, r.colors); return false; }
      return true;
    });
    parts = parts.filter(p => {
      p.life -= p.decay; if (p.life <= 0) return false;
      p.vx *= p.drag; p.vy = p.vy * p.drag + p.g; p.x += p.vx + (p.sway ? Math.sin(p.life * 12 + p.phase) * p.sway : 0); p.y += p.vy;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.4)); ctx.fillStyle = p.color;
      if (p.heart) heartPath(p.x, p.y, p.size);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (p.life * .6 + .4), 0, 7); ctx.fill(); }
      return true;
    });
    ctx.globalAlpha = 1;
    raf = parts.length || rockets.length ? requestAnimationFrame(loop) : 0;
    if (!raf) ctx.clearRect(0, 0, W, H);
  };
  const run = () => { if (!raf) raf = requestAnimationFrame(loop); };
  const burst = (x, y, colors) => {
    const n = reduceMotion ? 26 : 64;
    for (let i = 0; i < n; i++) { const a = Math.random() * Math.PI * 2, sp = 1.5 + Math.random() * 3.8;
      parts.push({x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: .045, drag: .975, size: 1.6 + Math.random() * 1.6,
        life: 1, decay: .011 + Math.random() * .01, color: colors[i % colors.length]}); }
  };
  return {
    hearts(colors = ['#e35d74', '#ff8fab', '#ffb3c6', '#ffffff']){
      setup(); const n = reduceMotion ? 10 : 34;
      for (let i = 0; i < n; i++) parts.push({heart: true, x: W * (.2 + Math.random() * .6), y: H + 10 + Math.random() * 80,
        vx: (Math.random() - .5) * 1.2, vy: -(3 + Math.random() * 3.5), g: .012, drag: .995, size: 14 + Math.random() * 16,
        sway: .6 + Math.random(), phase: Math.random() * 6, life: 1, decay: .006 + Math.random() * .005, color: colors[i % colors.length]});
      run();
    },
    fireworks(colors = ['#ffd166', '#ef476f', '#ffffff', '#f4b6c2', '#c9a45c']){
      setup(); const n = reduceMotion ? 1 : 4;
      for (let i = 0; i < n; i++) setTimeout(() => {
        const x = W * (.2 + Math.random() * .6);
        rockets.push({x, y: H, vx: (Math.random() - .5) * 1.5, vy: -(8 + Math.random() * 3), ty: H * (.18 + Math.random() * .25),
          color: '#fff6d5', colors: [colors[i % colors.length], colors[(i + 2) % colors.length], '#ffffff']}); run();
      }, i * 280);
    }
  };
})();

/* ---------- Đọc thiệp thành tiếng (Web Speech API) ---------- */
TH.speech = {
  supported: 'speechSynthesis' in window,
  speaking: () => TH.speech.supported && (speechSynthesis.speaking || speechSynthesis.pending),
  stop(){ if (TH.speech.supported) speechSynthesis.cancel(); },
  /* Đọc từng câu một để tránh lỗi Chrome tự ngắt khi đọc đoạn dài */
  speak(text, {onend} = {}){
    if (!TH.speech.supported) { TH.toast('Trình duyệt này chưa hỗ trợ đọc thành tiếng'); return false; }
    speechSynthesis.cancel();
    const voice = speechSynthesis.getVoices().find(v => /^vi/i.test(v.lang));
    const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
    parts.forEach((s, i) => { const u = new SpeechSynthesisUtterance(s);
      u.lang = 'vi-VN'; u.rate = .9; if (voice) u.voice = voice;
      if (i === parts.length - 1) u.onend = u.onerror = () => onend && onend();
      speechSynthesis.speak(u); });
    if (!voice) TH.toast('Máy chưa cài giọng đọc tiếng Việt — giọng có thể chưa chuẩn');
    return true;
  }
};
if (TH.speech.supported) speechSynthesis.getVoices(); // nạp sẵn danh sách giọng

/* ---------- Gợi ý lời chúc ----------
   Tạo ngay trên trình duyệt từ kho câu mẫu, cá nhân hoá theo tên cô dâu chú rể.
   Muốn dùng AI thật: thay hàm này bằng lời gọi tới API phía server, giữ nguyên kiểu trả về (Promise<string[]>). */
TH.suggestWishes = async ({groom = 'chú rể', bride = 'cô dâu'} = {}) => {
  const g = groom, b = bride;
  const pool = [
    `Chúc ${g} và ${b} trăm năm hạnh phúc, đầu bạc răng long, mãi yêu thương nhau như ngày đầu.`,
    `Mừng ngày chung đôi của ${g} & ${b}! Chúc hai bạn luôn là bến bình yên của nhau trên mọi chặng đường.`,
    `Chúc tổ ấm nhỏ của ${g} và ${b} luôn ngập tràn tiếng cười, sớm đón thêm thành viên mới đáng yêu nhé!`,
    `Hạnh phúc không phải là tìm được người hoàn hảo, mà là cùng nhau vun đắp mỗi ngày. Chúc ${g} & ${b} thật viên mãn!`,
    `Chúc mừng ${b} đã tìm được bờ vai vững chãi, chúc ${g} đã tìm được nụ cười bình yên. Mãi hạnh phúc nhé hai bạn!`,
    `Một chương mới thật đẹp đã bắt đầu. Chúc ${g} và ${b} cùng nhau viết tiếp câu chuyện tình thật ngọt ngào.`,
    `Chúc hai bạn bách niên giai lão, gia đình hoà thuận, sự nghiệp hanh thông, vạn sự như ý.`,
    `Từ hôm nay, mọi niềm vui được nhân đôi, mọi nỗi buồn được chia nửa. Chúc ${g} & ${b} hạnh phúc trọn đời!`,
    `Chúc đôi uyên ương ${g} – ${b} luôn nắm chặt tay nhau, cùng đi qua bốn mùa mưa nắng.`,
    `Thương nhau là duyên, giữ được nhau là phận. Chúc ${g} và ${b} trọn duyên vẹn phận, ấm êm mãi mãi.`,
    `Chúc hai bạn có một đám cưới thật vui, một tuần trăng mật thật ngọt và một cuộc đời thật nhiều yêu thương!`,
    `Gửi ${g} & ${b}: chúc hai bạn luôn kiên nhẫn, bao dung và dành cho nhau những điều dịu dàng nhất.`
  ];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  await new Promise(r => setTimeout(r, 350)); // nhịp "đang soạn" cho tự nhiên
  return pool.slice(0, 4);
};

/* ---------- Nén ảnh đính kèm lời chúc (lưu gọn trong localStorage) ---------- */
TH.shrinkImage = (file, max = 640, q = .72) => new Promise((ok, fail) => {
  if (!file || !/^image\//.test(file.type)) return fail(new Error('not-image'));
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => { const k = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/jpeg', q)); };
  img.onerror = () => { URL.revokeObjectURL(url); fail(new Error('decode')); };
  img.src = url;
});

/* ---------- Tìm toạ độ từ địa chỉ (OpenStreetMap Nominatim) ---------- */
TH.geocode = async address => {
  if (!address) return null;
  const key = 'th_geo_' + address;
  try { const c = sessionStorage.getItem(key); if (c) return JSON.parse(c); } catch {}
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&q=' + encodeURIComponent(address));
    const j = await r.json(); if (!j[0]) return null;
    const p = {lat: +j[0].lat, lng: +j[0].lon};
    try { sessionStorage.setItem(key, JSON.stringify(p)); } catch {}
    return p;
  } catch { return null; }
};

/* ---------- Đặt xe: mở app Grab/Be, không có app thì mở trang web ----------
   Link mở app (deep link) của các hãng có thể thay đổi — chỉnh tại đây nếu cần. */
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
TH.RIDES = {
  grab: {
    name: 'Grab',
    app: d => 'grab://open?screenType=BOOKING' + (d.lat ? `&dropOffLatitude=${d.lat}&dropOffLongitude=${d.lng}` : '') + '&dropOffName=' + encodeURIComponent(d.name) + '&dropOffAddress=' + encodeURIComponent(d.address),
    store: isIOS ? 'https://apps.apple.com/vn/app/grab-taxi-ride-hailing-app/id647268330' : 'https://play.google.com/store/apps/details?id=com.grabtaxi.passenger',
    web: 'https://www.grab.com/vn/transport/'
  },
  be: {
    name: 'Be',
    app: null, // Be chưa công bố deep link đặt sẵn điểm đến → sao chép địa chỉ rồi mở trang Be
    store: null,
    web: 'https://be.com.vn/'
  }
};
TH.rideTo = (key, dest) => {
  const p = TH.RIDES[key]; if (!p) return;
  const full = `${dest.name}, ${dest.address}`;
  navigator.clipboard?.writeText(full).then(() => TH.toast(`Đã sao chép địa chỉ — dán vào ô "Điểm đến" trên ${p.name}`)).catch(() => {});
  if (!isMobile || !p.app) { window.open(p.web, '_blank', 'noopener'); return; }
  let left = false; const onHide = () => { left = true; };
  document.addEventListener('visibilitychange', onHide, {once: true});
  location.href = p.app(dest);
  setTimeout(() => { document.removeEventListener('visibilitychange', onHide); if (!left && document.visibilityState === 'visible') location.href = p.store || p.web; }, 1600);
};
})();

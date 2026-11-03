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

/* ---------- Trợ lý Google Gemini AI: Sáng tác lời chúc & Cá nhân hoá thiệp cưới ---------- */
TH.geminiApiKey = atob('QVEuQWI4Uk42TGNKYlpZUXBkNmVCeldTUHBGUUFEUWdTRU8zeHhWM1VCanVtY3JPSVFaalE=');

/**
 * TỰ ĐỘNG NHẬN DIỆN & PHÂN TÍCH THÔNG MINH BẰNG GEMINI AI:
 * Đọc hiểu ngữ cảnh khách mời (VD: "Anh Nguyễn Văn A - Trưởng phòng Kinh doanh", "Thằng Tùng béo bạn cấp 3")
 * Tự động phân loại, suy luận vai vế, điều chỉnh mức độ trang trọng/gần gũi và sinh lời mời + thông điệp chính xác.
 */
TH.analyzeAndGenerateAiInvitation = async ({
  guestContext = '',
  groom = 'chú rể',
  bride = 'cô dâu',
  notes = ''
} = {}) => {
  const context = (guestContext || '').trim() || 'Bạn thân thiết';

  const systemInstruction = `Bạn là chuyên gia tâm lý ngôn từ và trợ lý AI cao cấp của nền tảng thiệp cưới thông minh WedStory.
Người dùng sẽ cung cấp một đoạn thông tin/mô tả tự do về khách mời (ví dụ: "Anh Nguyễn Văn A - Trưởng phòng Kinh doanh", "Thằng Tùng béo bạn cấp 3", "Bác Ba - Trưởng họ bên nội", "Chị Mai đồng nghiệp phòng Kế toán"...).

NHIỆM VỤ CỦA BẠN:
1. TỰ ĐỘNG ĐỌC HIỂU & PHÂN TÍCH:
   - Tự nhận diện vai vế, mối quan hệ (Cấp trên/Sếp, Đối tác VIP, Bạn thân, Bậc tiền bối/Họ hàng lớn tuổi, Bạn cấp 3/Đại học, Anh chị em...).
   - Tự động quyết định văn phong:
     + Cấp trên / Sếp / Đối tác: Trang trọng, lịch thiệp, tôn kính, trân trọng sự dìu dắt và đồng hành.
     + Bạn thân / Bạn lầy lội / Bạn cấp 3: Thân mật, hài hước, dí dỏm, xưng tụi mình/hai đứa, rủ quẩy hết mình, không câu nệ.
     + Họ hàng lớn tuổi / Bác Cô Chú: Kính cẩn, lễ phép, xưng cháu/con, báo tin hỷ và kính mời các bậc tiền bối đến ban phúc lành.
     + Đồng nghiệp: Lịch thiệp, ấm áp, văn minh, gắn kết.
   - Xưng hô chuẩn xác theo tên/danh xưng được cung cấp trong mô tả.

2. TRẢ VỀ DUY NHẤT MỘT KHỐI JSON HỢP LỆ:
{
  "detectedCategory": "Nhóm đối tượng nhận diện được",
  "detectedTone": "Giọng điệu văn phong đã chọn",
  "analysis": "1 câu giải thích ngắn gọn về cách AI phân tích ngữ cảnh",
  "quote": "Câu thông điệp mở đầu ngắn gọn (1-2 câu)",
  "message": "Nội dung lời mời chính trên thiệp (khoảng 2-4 câu)"
}`;

  const prompt = `${systemInstruction}

THÔNG TIN ĐẦU VÀO:
- Mô tả khách mời: "${context}"
- Cô dâu & Chú rể: ${groom} & ${bride}
${notes ? `- Ghi chú thêm: "${notes}"` : ''}

Hãy tự động phân tích ngữ cảnh và tạo kết quả JSON:`;

  const models = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${TH.geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        let clean = text.trim();
        if (clean.includes('```json')) clean = clean.split('```json')[1].split('```')[0].trim();
        else if (clean.includes('```')) clean = clean.split('```')[1].split('```')[0].trim();
        try {
          const parsed = JSON.parse(clean);
          if (parsed.message) {
            return {
              detectedCategory: parsed.detectedCategory || 'Khách mời',
              detectedTone: parsed.detectedTone || 'Tự nhiên & Chuẩn mực',
              analysis: parsed.analysis || `Đã nhận diện ngữ cảnh cho: "${context}"`,
              message: parsed.message.replace(/^["“]|["”]$/g, '').trim(),
              quote: (parsed.quote || '').replace(/^["“]|["”]$/g, '').trim(),
              group: parsed.detectedCategory || 'Khách mời'
            };
          }
        } catch (_) {}
      }
    } catch (_) {}
  }

  // Fallback offline thông minh tự động nhận diện
  return TH.detectContextFallback(context, groom, bride);
};

/**
 * Tự động phân tích ngữ cảnh khi offline
 */
TH.detectContextFallback = (context = '', groom = 'chú rể', bride = 'cô dâu') => {
  const c = context.toLowerCase();

  if (c.includes('sếp') || c.includes('trưởng phòng') || c.includes('giám đốc') || c.includes('quản lý') || c.includes('leader') || c.includes('boss') || c.includes('chủ tịch') || c.includes('đối tác') || c.includes('khách hàng') || c.includes('vip')) {
    return {
      detectedCategory: '💼 Cấp trên / Đối tác & Khách quý',
      detectedTone: 'Trang trọng, lịch thiệp & Tôn kính',
      analysis: `Nhận diện ngữ cảnh cấp trên / lãnh đạo từ "${context}". Áp dụng văn phong lịch thiệp, tôn kính và bày tỏ lòng biết ơn sự dìu dắt trong công việc.`,
      quote: `Trân quý sự gắn kết và vinh hạnh được đón tiếp Quý lãnh đạo, Quý đối tác trong ngày trọng đại của chúng tôi.`,
      message: `Sự chỉ bảo, đồng hành và giúp đỡ của ${context} trong suốt thời gian qua là niềm vinh hạnh to lớn cho chúng tôi. Trân trọng kính mời đến dự buổi tiệc chung vui để cùng nâng ly chúc mừng cho khởi đầu mới của ${groom} & ${bride}.`,
      group: 'Cấp trên / Đối tác'
    };
  }

  if (c.includes('thằng') || c.includes('con') || c.includes('béo') || c.includes('còi') || c.includes('bạn thân') || c.includes('nối khố') || c.includes('cấp 3') || c.includes('cấp ba') || c.includes('cấp 2') || c.includes('đại học') || c.includes('sinh viên') || c.includes('học sinh') || c.includes('quẩy') || c.includes('lầy') || c.includes('ruột')) {
    const isClassmate = c.includes('cấp 3') || c.includes('cấp ba') || c.includes('đại học') || c.includes('học sinh') || c.includes('sinh viên');
    return {
      detectedCategory: isClassmate ? '🎓 Bạn học (Cấp 3 / Đại học)' : '👭 Bạn thân / Bạn nối khố',
      detectedTone: 'Thân mật, hài hước & Tự nhiên',
      analysis: `Nhận diện bạn bè thân thiết từ "${context}". Áp dụng xưng hô thân mật "tụi mình / hai đứa", hẹn quẩy hết mình và không câu nệ khách sáo.`,
      quote: isClassmate
        ? `Thanh xuân có nhau chung lối, ngày chung đôi có nhau chứng kiến!`
        : `Tình bạn diệu kỳ nhất là cùng chứng kiến nhau bước vào ngày hạnh phúc nhất.`,
      message: `Tụi mình sắp về chung một nhà rồi! Ngày vui nhất của ${groom} & ${bride} không thể nào trọn vẹn nếu thiếu đi sự có mặt của ${context}. Nhớ lên đồ thật đẹp, chuẩn bị chiếc bụng đói và đến quẩy hết mình cùng tụi mình nhé! 🥂💕`,
      group: isClassmate ? 'Bạn học' : 'Bạn thân'
    };
  }

  if (c.includes('bác') || c.includes('cô') || c.includes('chú') || c.includes('ông') || c.includes('bà') || c.includes('họ') || c.includes('trưởng') || c.includes('nội') || c.includes('ngoại') || c.includes('dòng họ')) {
    return {
      detectedCategory: '🏡 Họ hàng lớn tuổi (Bậc tiền bối)',
      detectedTone: 'Lễ phép, kính cẩn & Đầm ấm gia phong',
      analysis: `Nhận diện bậc tiền bối / họ hàng từ "${context}". Áp dụng văn phong kính cẩn, xưng cháu lễ phép theo đúng truyền thống gia phong.`,
      quote: `Ơn sâu dưỡng dục sinh thành, phước lành con cháu sum vầy trăm năm.`,
      message: `Chúng cháu xin kính cẩn báo tin lễ thành hôn và trân trọng kính mời ${context} cùng toàn thể gia đình đến dự bữa cơm thân mật chung vui cùng hai họ. Sự hiện diện và lời chúc phúc của các bậc tiền bối là niềm phúc lành và hạnh phúc lớn lao cho chặng đường tương lai của chúng cháu.`,
      group: 'Họ hàng lớn tuổi'
    };
  }

  if (c.includes('đồng nghiệp') || c.includes('công ty') || c.includes('phòng') || c.includes('team') || c.includes('cơ quan')) {
    return {
      detectedCategory: '💼 Đồng nghiệp / Cơ quan',
      detectedTone: 'Lịch thiệp, ấm áp & Trang nhã',
      analysis: `Nhận diện đồng nghiệp từ "${context}". Áp dụng văn phong lịch sự, hòa đồng và trân quý tình đồng nghiệp.`,
      quote: `Trân quý sự gắn kết và sẻ chia của Quý đồng nghiệp trong ngày vui trọng đại.`,
      message: `Sự đồng hành và những khoảnh khắc gắn kết cùng ${context} là kỷ niệm thật đẹp đối với chúng tôi. Trân trọng kính mời đến dự buổi tiệc thành hôn để cùng chia sẻ niềm hạnh phúc và chúc phúc cho tổ ấm mới của ${groom} & ${bride}.`,
      group: 'Đồng nghiệp'
    };
  }

  return {
    detectedCategory: '💌 Khách mời trân quý',
    detectedTone: 'Chân thành & Ấm áp',
    analysis: `Nhận diện thông tin khách mời: "${context}". Áp dụng văn phong chân thành, đầm ấm và lịch thiệp.`,
    quote: `Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.`,
    message: `Trân trọng kính mời ${context} đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện và lời chúc phúc của quý vị là niềm vinh hạnh to lớn cho đôi uyên ương ${groom} & ${bride} trên hành trình xây đắp tổ ấm mới.`,
    group: 'Khách mời'
  };
};

/**
 * Cá nhân hoá Lời mời theo nhóm (backward compatibility)
 */
TH.generateAiInvitation = async ({
  guestGroup = 'Bạn thân',
  groom = 'chú rể',
  bride = 'cô dâu',
  tone = 'Tự nhiên & Chuẩn mực theo nhóm',
  notes = ''
} = {}) => {
  return TH.analyzeAndGenerateAiInvitation({
    guestContext: guestGroup,
    groom,
    bride,
    notes: tone ? `${tone}. ${notes}` : notes
  });
};


/**
 * Mẫu lời mời và trích dẫn chuẩn mực cho từng nhóm khi offline
 */
TH.getFallbackInvitation = (guestGroup = '', groom = 'chú rể', bride = 'cô dâu') => {
  const g = guestGroup.toLowerCase();
  if (g.includes('thân') || g.includes('nối khố') || g.includes('ruột')) {
    return {
      group: guestGroup,
      quote: `Tình bạn diệu kỳ nhất là cùng chứng kiến nhau bước vào ngày hạnh phúc nhất.`,
      message: `Tụi mình sắp về chung một nhà rồi! Ngày trọng đại nhất của hai đứa sẽ không thể trọn vẹn nếu thiếu đi sự có mặt của bạn. Hãy đến chung vui, nâng ly chúc mừng và quẩy hết mình cùng tụi mình nhé! 🥂💕`
    };
  }
  if (g.includes('đồng nghiệp') || g.includes('sếp') || g.includes('công ty') || g.includes('cơ quan')) {
    return {
      group: guestGroup,
      quote: `Trân quý sự gắn kết và hiện diện của Quý đồng nghiệp trong ngày trọng đại của chúng tôi.`,
      message: `Sự đồng hành và ủng hộ của Quý anh/chị và đồng nghiệp trong công việc lẫn cuộc sống là niềm vinh hạnh lớn của chúng tôi. Trân trọng kính mời anh/chị đến tham dự buổi tiệc cưới để cùng chia sẻ niềm vui và nâng ly chúc phúc cho tổ ấm mới của ${groom} & ${bride}.`
    };
  }
  if (g.includes('họ hàng') || g.includes('lớn tuổi') || g.includes('bác') || g.includes('cô') || g.includes('chú') || g.includes('ông') || g.includes('bà')) {
    return {
      group: guestGroup,
      quote: `Ơn sâu dưỡng dục sinh thành, phước lành con cháu sum vầy trăm năm.`,
      message: `Chúng cháu xin kính cẩn báo tin lễ thành hôn và trân trọng kính mời Bác, Cô, Chú cùng toàn thể gia đình đến dự bữa cơm thân mật chung vui cùng hai họ. Sự hiện diện và lời chúc phúc của các bậc tiền bối là niềm phúc lành và hạnh phúc lớn lao cho chặng đường tương lai của chúng cháu.`
    };
  }
  if (g.includes('cấp 3') || g.includes('đại học') || g.includes('học sinh') || g.includes('sinh viên') || g.includes('bạn học')) {
    return {
      group: guestGroup,
      quote: `Thanh xuân có nhau chung lối, ngày chung đôi có nhau chúc mừng.`,
      message: `Từ những năm tháng thanh xuân cùng ngồi trên ghế nhà trường, nay hai đứa mình đã cùng nhau bước sang một trang mới của cuộc đời. Rất mong được gặp lại những gương mặt thân thương ngày ấy, cùng ôn lại kỷ niệm và chứng kiến khoảnh khắc chung đôi của tụi mình!`
    };
  }
  if (g.includes('đối tác') || g.includes('khách quý') || g.includes('vip')) {
    return {
      group: guestGroup,
      quote: `Trân trọng sự đồng hành và vinh hạnh được đón tiếp Quý khách quý.`,
      message: `Sự hiện diện của Quý khách là niềm vinh dự to lớn đối với gia đình và hai chúng tôi. Kính mời Quý khách bớt chút thời gian quý báu đến tham dự buổi tiệc thành hôn, cùng sẻ chia khoảnh khắc hạnh phúc và đón nhận sự đón tiếp chu đáo nhất từ gia đình chúng tôi.`
    };
  }
  if (g.includes('anh') || g.includes('chị') || g.includes('em') || g.includes('gia đình')) {
    return {
      group: guestGroup,
      quote: `Tình thân gia đình là điểm tựa ấm áp nhất cho ngày chung đôi.`,
      message: `Tụi em chuẩn bị bước sang một chặng đường mới! Ngày vui của tụi em sẽ ấm áp và ý nghĩa hơn rất nhiều khi có sự hiện diện của anh chị em thân yêu trong gia đình. Cùng về chung vui và nâng ly chúc mừng cho hai đứa nhé!`
    };
  }
  return {
    group: guestGroup,
    quote: `Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.`,
    message: `Trân trọng kính mời quý khách đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện và lời chúc phúc của quý vị là niềm vinh hạnh to lớn cho đôi uyên ương ${groom} & ${bride} trên hành trình xây đắp tổ ấm mới.`
  };
};

TH.generateAiWish = async ({
  guestName = '',
  relationship = 'Bạn thân',
  tone = 'Chân thành & Ấm áp',
  groom = 'chú rể',
  bride = 'cô dâu'
} = {}) => {
  const name = (guestName || '').trim() || 'Người bạn';
  const rel = (relationship || '').trim() || 'bạn bè';
  const prompt = `Bạn là trợ lý AI thông minh của WedStory. Hãy sáng tác duy nhất 1 lời chúc cưới ý nghĩa, chân thành, tự nhiên (khoảng 2-3 câu) từ "${name}" gửi đến cô dâu chú rể ${groom} & ${bride}.
Mối quan hệ với cô dâu chú rể: "${rel}".
Phong cách mong muốn: "${tone}".
Xưng hô phù hợp đúng vai vế, đính kèm 1-2 emoji ngọt ngào (như 🥂, 💕, ✨). Chỉ trả về nội dung lời chúc, không thêm tiêu đề hay ngoặc kép.`;

  const models = ['gemini-3.5-flash', 'gemini-3-flash-preview', 'gemini-3.8-flash'];
  for (const m of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${TH.geminiApiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        let cleaned = text.trim();
        if (cleaned.startsWith('"') && cleaned.endsWith('"')) cleaned = cleaned.slice(1, -1).trim();
        if (cleaned.startsWith('“') && cleaned.endsWith('”')) cleaned = cleaned.slice(1, -1).trim();
        return cleaned;
      }
    } catch (_) {}
  }
  return `Chúc hai bạn ${groom} & ${bride} trăm năm hạnh phúc, một đời an yên, cùng nhau nắm tay vượt qua mọi thăng trầm và xây đắp một tổ ấm thật viên mãn! 💕🥂`;
};

/* ---------- Gợi ý lời chúc (hỗ trợ cả AI và mẫu nhanh) ---------- */
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
  await new Promise(r => setTimeout(r, 300));
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

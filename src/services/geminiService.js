import { GoogleGenAI } from '@google/genai';

/**
 * Lấy Gemini API Key từ biến môi trường (hỗ trợ Vite import.meta.env, process.env hoặc fallback)
 */
const getApiKey = () => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (_) {
    // Không chạy trong môi trường Vite ESM
  }

  try {
    if (typeof process !== 'undefined' && process?.env?.VITE_GEMINI_API_KEY) {
      return process.env.VITE_GEMINI_API_KEY;
    }
  } catch (_) {
    // Không chạy trong môi trường Node.js
  }

  // Khóa API dự phòng cấu hình theo yêu cầu
  return (typeof atob === 'function' 
    ? atob('QVEuQWI4Uk42TGNKYlpZUXBkNmVCeldTUHBGUUFEUWdTRU8zeHhWM1VCanVtY3JPSVFaalE=') 
    : Buffer.from('QVEuQWI4Uk42TGNKYlpZUXBkNmVCeldTUHBGUUFEUWdTRU8zeHhWM1VCanVtY3JPSVFaalE=', 'base64').toString());
};

const API_KEY = getApiKey();
const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODELS = ['gemini-3-flash-preview', 'gemini-3.8-flash'];

// Khởi tạo instance GoogleGenAI SDK
let aiInstance = null;
const getAIClient = () => {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiInstance;
};

/**
 * Tạo lời chúc cưới tự động bằng Google Gemini AI (model: gemini-3.5-flash)
 * @param {Object} options
 * @param {string} options.guestName - Tên của khách mời (VD: Minh Quân, Chị Lan, v.v.)
 * @param {string} options.relationship - Mối quan hệ (VD: Bạn thân, Đồng nghiệp, Họ hàng...)
 * @param {string} [options.tone] - Phong cách (VD: Ấm áp chân thành, Hài hước vui nhộn, Trang trọng...)
 * @param {string} [options.brideGroomNames] - Tên cô dâu chú rể (VD: Quang & Mai)
 * @returns {Promise<string>} Lời chúc mừng đám cưới tinh tế và giàu cảm xúc
 */
export async function generateWeddingWish({
  guestName = '',
  relationship = 'Bạn thân',
  tone = 'Chân thành & Ấm áp',
  brideGroomNames = 'cô dâu chú rể',
} = {}) {
  const name = guestName.trim() || 'Người bạn';
  const rel = relationship.trim() || 'bạn bè';

  const systemInstruction = `Bạn là trợ lý AI thông minh chuyên sáng tác lời chúc đám cưới cho nền tảng thiệp cưới trực tuyến WedStory.
Nhiệm vụ của bạn là viết một lời chúc cưới độc đáo, ý nghĩa, tự nhiên và giàu cảm xúc dựa trên thông tin được cung cấp.`;

  const prompt = `${systemInstruction}

Thông tin khách mời & đám cưới:
- Tên khách mời gửi lời chúc: "${name}"
- Mối quan hệ với cô dâu/chú rể: "${rel}"
- Phong cách / Giọng điệu: "${tone}"
- Tên cô dâu chú rể (nếu có): "${brideGroomNames}"

Yêu cầu cụ thể:
1. Độ dài vừa vặn: từ 2 đến 4 câu văn mượt mà, sâu sắc hoặc dí dỏm tuỳ theo mối quan hệ và phong cách.
2. Xưng hô chuẩn mực theo đúng mối quan hệ "${rel}" (ví dụ bạn thân thì xưng hô thân mật, đồng nghiệp thì lịch thiệp ấm áp, họ hàng thì chúc phúc viên mãn, vui tươi).
3. Đính kèm 1-2 emoji phù hợp (như 💍, 🥂, 💕, ✨).
4. Chỉ trả về nội dung lời chúc duy nhất, không thêm tiêu đề, không để dấu ngoặc kép bọc ngoài và không kèm lời giải thích rườm rà.`;

  const ai = getAIClient();

  try {
    // Ưu tiên chạy với model gemini-3.5-flash thế hệ 3
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
    });

    if (response?.text) {
      return cleanWishText(response.text);
    }
    throw new Error('Không nhận được nội dung từ Gemini AI.');
  } catch (error) {
    console.warn(`Lỗi khi gọi model ${PRIMARY_MODEL}:`, error?.message || error);

    // Thử fallback sang các model dự phòng trong hệ Gemini 3.x
    for (const fallbackModel of FALLBACK_MODELS) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: fallbackModel,
          contents: prompt,
        });

        if (fallbackResponse?.text) {
          return cleanWishText(fallbackResponse.text);
        }
      } catch (fallbackError) {
        console.warn(`Lỗi khi gọi model dự phòng ${fallbackModel}:`, fallbackError?.message);
      }
    }

    // Dự phòng thông minh nếu mất kết nối hoặc hết quota
    return getSmartFallbackWish(name, rel);
  }
}

/**
 * Tự động phân tích ngữ cảnh khách mời và sinh lời mời thiệp cưới cá nhân hoá bằng Google Gemini AI
 * Người dùng chỉ cần nhập một đoạn mô tả ngắn (VD: "Anh Nguyễn Văn A - Trưởng phòng Kinh doanh" hoặc "Thằng Tùng béo bạn cấp 3")
 * AI sẽ tự động đọc hiểu đối tượng, vai vế, suy luận mức độ trang trọng/gần gũi và sinh văn phong chuẩn xác.
 * @param {Object} options
 * @param {string} options.guestContext - Thông tin ngữ cảnh khách mời nhập tự do
 * @param {string} [options.groomName] - Tên chú rể
 * @param {string} [options.brideName] - Tên cô dâu
 * @param {string} [options.customNotes] - Ghi chú thêm
 * @returns {Promise<{message: string, quote: string, detectedCategory: string, detectedTone: string, analysis: string}>}
 */
export async function generateSmartPersonalizedInvitation({
  guestContext = '',
  groomName = 'chú rể',
  brideName = 'cô dâu',
  customNotes = '',
} = {}) {
  const context = (guestContext || '').trim() || 'Bạn thân thiết';
  const groom = groomName.trim() || 'chú rể';
  const bride = brideName.trim() || 'cô dâu';

  const systemInstruction = `Bạn là chuyên gia tâm lý ngôn từ và trợ lý AI cao cấp của nền tảng thiệp cưới thông minh WedStory.
Người dùng sẽ cung cấp một đoạn thông tin/mô tả tự do về khách mời (ví dụ: "Anh Nguyễn Văn A - Trưởng phòng Kinh doanh", "Thằng Tùng béo bạn cấp 3", "Bác Ba - Trưởng họ bên nội", "Chị Mai đồng nghiệp", "Bé Lan em gái kết nghĩa"...).

NHIỆM VỤ CỦA BẠN:
1. ĐỌC HIỂU & PHÂN LOẠI TỰ ĐỘNG (Không cần người dùng chọn):
   - Nhận diện vai vế, mối quan hệ, cấp bậc xã hội hoặc độ thân mật (Ví dụ: Cấp trên/Sếp, Đối tác VIP, Bạn thân lầy lội, Bậc tiền bối/Họ hàng lớn tuổi, Bạn bè học chung thanh xuân, Anh chị em...).
   - Tự động điều chỉnh mức độ trang trọng hoặc gần gũi:
     + Nếu là Cấp trên / Sếp / Đối tác: Văn phong lịch thiệp, trang nhã, kính trọng, trân quý sự dìu dắt và đồng hành trong công việc.
     + Nếu là Bạn thân / Bạn lầy lội / Bạn cấp 3: Văn phong trẻ trung, dí dỏm, thân mật ("tụi mình", "hai đứa", hẹn lên đồ quẩy hết mình, không câu nệ khách sáo).
     + Nếu là Họ hàng lớn tuổi / Bác Cô Chú: Văn phong lễ phép, cung kính, kính cẩn báo tin hỷ và kính mời các bậc tiền bối đến ban phúc lành.
     + Nếu là Đồng nghiệp: Lịch thiệp, ấm áp, văn minh, gắn kết.
   - Tự động xưng hô chuẩn xác theo tên/danh xưng được cung cấp trong thông tin.

2. SOẠN THẢO THIỆP CƯỚI:
   - "detectedCategory": Tên nhóm đối tượng AI tự phân loại (ví dụ: "Cấp trên / Sếp", "Bạn thân cấp 3", "Họ hàng lớn tuổi (Trưởng bối)", "Đồng nghiệp", "Đối tác").
   - "detectedTone": Giọng điệu đã chọn (ví dụ: "Trang trọng, lịch thiệp và tôn kính", "Thân mật, hài hước và gần gũi").
   - "analysis": 1 câu ngắn giải thích cách AI đọc hiểu ngữ cảnh và lý do chọn văn phong này.
   - "quote": Câu thông điệp mở đầu ngắn gọn (1-2 câu) in trên đầu thiệp cưới.
   - "message": Nội dung lời mời chính trên thiệp cưới (2-4 câu) mượt mà, giàu cảm xúc, đúng chuẩn mực vai vế.

ĐỊNH DẠNG TRẢ VỀ:
Trả về DUY NHẤT một khối JSON hợp lệ dạng:
{
  "detectedCategory": "Nhóm đối tượng nhận diện",
  "detectedTone": "Giọng điệu văn phong",
  "analysis": "1 câu phân tích ngữ cảnh ngắn",
  "quote": "Nội dung câu quote mở đầu",
  "message": "Nội dung lời mời chính trên thiệp"
}`;

  const prompt = `${systemInstruction}

THÔNG TIN ĐẦU VÀO TỪ NGƯỜI DÙNG:
- Thông tin khách mời: "${context}"
- Cô dâu & Chú rể: ${groom} & ${bride}
${customNotes ? `- Ghi chú thêm: "${customNotes}"` : ''}

Hãy tự động phân tích ngữ cảnh và tạo kết quả JSON:`;

  const ai = getAIClient();

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
    });

    if (response?.text) {
      const parsed = parseSmartInvitationJson(response.text, context, groom, bride);
      if (parsed) return parsed;
    }
    throw new Error('Không nhận được nội dung hợp lệ từ Gemini AI.');
  } catch (error) {
    console.warn(`Lỗi khi gọi model ${PRIMARY_MODEL}:`, error?.message || error);

    for (const fallbackModel of FALLBACK_MODELS) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: fallbackModel,
          contents: prompt,
        });

        if (fallbackResponse?.text) {
          const parsed = parseSmartInvitationJson(fallbackResponse.text, context, groom, bride);
          if (parsed) return parsed;
        }
      } catch (fallbackError) {
        console.warn(`Lỗi khi gọi model dự phòng ${fallbackModel}:`, fallbackError?.message);
      }
    }

    // Fallback thông minh offline tự phân tích ngữ cảnh
    return detectContextAndGetFallback(context, groom, bride);
  }
}

/**
 * Trích xuất JSON từ phản hồi AI thông minh
 */
function parseSmartInvitationJson(rawText, context, groom, bride) {
  try {
    let clean = rawText.trim();
    if (clean.includes('```json')) {
      clean = clean.split('```json')[1].split('```')[0].trim();
    } else if (clean.includes('```')) {
      clean = clean.split('```')[1].split('```')[0].trim();
    }
    const data = JSON.parse(clean);
    if (data.message) {
      return {
        detectedCategory: data.detectedCategory || 'Khách quý',
        detectedTone: data.detectedTone || 'Tự nhiên & Chuẩn mực',
        analysis: data.analysis || `Đã nhận diện ngữ cảnh cho: "${context}"`,
        message: cleanWishText(data.message),
        quote: cleanWishText(data.quote || ''),
        group: data.detectedCategory || 'Khách mời',
      };
    }
  } catch (_) {}
  return null;
}

/**
 * Tự động phân tích ngữ cảnh từ chuỗi text khi offline hoặc lỗi mạng
 */
export function detectContextAndGetFallback(context = '', groom = 'chú rể', bride = 'cô dâu') {
  const c = context.toLowerCase();

  // 1. Nhận diện Sếp / Cấp trên / Đối tác
  if (c.includes('sếp') || c.includes('trưởng phòng') || c.includes('giám đốc') || c.includes('quản lý') || c.includes('leader') || c.includes('boss') || c.includes('chủ tịch') || c.includes('đối tác') || c.includes('khách hàng') || c.includes('vip')) {
    return {
      detectedCategory: '💼 Cấp trên / Đối tác & Khách quý',
      detectedTone: 'Trang trọng, lịch thiệp & Tôn kính',
      analysis: `Nhận diện ngữ cảnh cấp trên / lãnh đạo từ "${context}". Áp dụng xưng hô tôn kính và bày tỏ sự biết ơn đối với sự đồng hành trong công việc.`,
      quote: `Trân quý sự gắn kết và vinh hạnh được đón tiếp Quý lãnh đạo, Quý đồng nghiệp trong ngày trọng đại của chúng tôi.`,
      message: `Sự chỉ bảo, đồng hành và giúp đỡ của ${context} trong suốt thời gian qua là niềm vinh hạnh to lớn cho chúng tôi. Trân trọng kính mời đến dự buổi tiệc chung vui để cùng nâng ly chúc mừng cho khởi đầu mới của ${groom} & ${bride}.`,
      group: 'Cấp trên / Đối tác'
    };
  }

  // 2. Nhận diện Bạn thân / Bạn lầy lội / Bạn cấp 3
  if (c.includes('thằng') || c.includes('con') || c.includes('béo') || c.includes('còi') || c.includes('bạn thân') || c.includes('nối khố') || c.includes('cấp 3') || c.includes('cấp ba') || c.includes('cấp 2') || c.includes('đại học') || c.includes('sinh viên') || c.includes('học sinh') || c.includes('quẩy') || c.includes('lầy') || c.includes('ruột')) {
    const isClassmate = c.includes('cấp 3') || c.includes('cấp ba') || c.includes('đại học') || c.includes('học sinh') || c.includes('sinh viên');
    return {
      detectedCategory: isClassmate ? '🎓 Bạn học (Cấp 3 / Đại học)' : '👭 Bạn thân / Bạn nối khố',
      detectedTone: 'Thân mật, hài hước & Tự nhiên',
      analysis: `Nhận diện bạn bè thân thiết từ "${context}". Áp dụng xưng hô thân mật "tụi mình / hai đứa", không câu nệ khách sáo.`,
      quote: isClassmate
        ? `Thanh xuân có nhau chung lối, ngày chung đôi có nhau chứng kiến!`
        : `Tình bạn diệu kỳ nhất là cùng chứng kiến nhau bước vào ngày hạnh phúc nhất.`,
      message: `Tụi mình sắp về chung một nhà rồi! Ngày vui nhất của ${groom} & ${bride} không thể nào trọn vẹn nếu thiếu đi sự có mặt của ${context}. Nhớ lên đồ thật đẹp, chuẩn bị chiếc bụng đói và đến quẩy hết mình cùng tụi mình nhé! 🥂💕`,
      group: isClassmate ? 'Bạn học' : 'Bạn thân'
    };
  }

  // 3. Nhận diện Họ hàng lớn tuổi / Bác Cô Chú
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

  // 4. Nhận diện Đồng nghiệp công ty
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

  // 5. Mặc định tự nhiên
  return {
    detectedCategory: '💌 Khách mời trân quý',
    detectedTone: 'Chân thành & Ấm áp',
    analysis: `Nhận diện thông tin khách mời: "${context}". Áp dụng văn phong chân thành, đầm ấm và lịch thiệp.`,
    quote: `Yêu nhau không phải là nhìn nhau, mà là cùng nhau nhìn về một hướng.`,
    message: `Trân trọng kính mời ${context} đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Sự hiện diện và lời chúc phúc của quý vị là niềm vinh hạnh to lớn cho đôi uyên ương ${groom} & ${bride} trên hành trình xây đắp tổ ấm mới.`,
    group: 'Khách mời'
  };
}

/**
 * Sinh lời mời thiệp cưới theo nhóm (backward compatibility)
 */
export async function generatePersonalizedInvitation({
  guestGroup = 'Bạn thân',
  groomName = 'chú rể',
  brideName = 'cô dâu',
  tone = 'Tự nhiên & Chuẩn mực theo nhóm',
  customNotes = '',
} = {}) {
  return generateSmartPersonalizedInvitation({
    guestContext: guestGroup,
    groomName,
    brideName,
    customNotes: tone ? `${tone}. ${customNotes}` : customNotes,
  });
}


/**
 * Lời mời và trích dẫn dự phòng thông minh theo đúng nhóm khách mời khi offline
 */
export function getSmartFallbackInvitation(guestGroup, groom, bride) {
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
}

/**
 * Xử lý làm sạch chuỗi văn bản trả về từ AI
 */
function cleanWishText(text) {
  let cleaned = text.trim();
  // Bỏ dấu ngoặc kép nếu AI bọc toàn bộ chuỗi
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  if (cleaned.startsWith('“') && cleaned.endsWith('”')) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

/**
 * Lời chúc dự phòng tinh tế dựa theo vai vế khách mời khi offline hoặc lỗi mạng
 */
function getSmartFallbackWish(name, relationship) {
  const relLower = relationship.toLowerCase();
  if (relLower.includes('thân')) {
    return `Chúc hai bạn trăm năm hạnh phúc, mãi giữ được nụ cười rạng rỡ và sự ngọt ngào như ngày đầu. Mừng cho ngày trọng đại của đôi bạn thân yêu nhất! 💕🥂`;
  }
  if (relLower.includes('đồng nghiệp') || relLower.includes('công ty')) {
    return `Chúc mừng hạnh phúc hai bạn! Chúc mái ấm mới luôn tràn ngập tiếng cười, sự nghiệp thăng hoa và cùng nhau xây đắp tương lai viên mãn. ✨💐`;
  }
  if (relLower.includes('họ hàng') || relLower.includes('gia đình') || relLower.includes('anh') || relLower.includes('chị')) {
    return `Chúc hai cháu / hai em trăm năm tình viên mãn, bạc đầu nghĩa phu thê. Gia đình êm ấm, thuận hoà và sớm đón quý tử! 💍💖`;
  }
  return `Chúc hai bạn trăm năm hạnh phúc, vạn sự như ý, cùng nhau nắm tay đi qua mọi chặng đường ngọt ngào của cuộc sống! 🥂🎉`;
}

export default {
  generateWeddingWish,
  generatePersonalizedInvitation,
  generateSmartPersonalizedInvitation,
  getSmartFallbackInvitation,
  detectContextAndGetFallback,
};


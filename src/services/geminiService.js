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
};

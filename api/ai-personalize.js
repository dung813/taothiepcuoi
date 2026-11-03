// /api/ai-personalize.js  —  Vercel Serverless Function & Local Endpoint
// Nhận danh sách khách mời, gọi Gemini AI để cá nhân hoá lời mời, trả về JSON.
import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // Xử lý CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Dùng POST.' });
  }

  // ── Đọc API key ──────────────────────────────────────────────────────────────
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Thiếu GEMINI_API_KEY trong biến môi trường.' });
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Body JSON không hợp lệ.' });
  }

  const { guests = [], groom = 'Chú rể', bride = 'Cô dâu', coupleSlug = '' } = body;

  if (!Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'Trường "guests" phải là mảng không rỗng.' });
  }

  if (guests.length > 200) {
    return res.status(400).json({ error: 'Tối đa 200 khách / lần gọi để tránh timeout.' });
  }

  // ── Tạo slug (không dấu, gạch ngang) ─────────────────────────────────────────
  const toSlug = (s) =>
    String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

  // ── Xây dựng prompt ───────────────────────────────────────────────────────────
  const guestLines = guests
    .map((g, i) => {
      const name = String(g.name || '').trim();
      const group = String(g.group || g.grp || '').trim();
      const salutation = String(g.salutation || g.xungHo || '').trim();
      const note = String(g.note || '').trim();
      return `${i + 1}. Tên: "${name}" | Nhóm: "${group || 'Không rõ'}" | Xưng hô gợi ý: "${salutation}" | Ghi chú: "${note}"`;
    })
    .join('\n');

  const prompt = `Bạn là trợ lý AI viết lời mời đám cưới bằng tiếng Việt cho nền tảng thiệp cưới Wedstory.
Đám cưới của cô dâu & chú rể: ${groom} & ${bride}.

Danh sách khách mời cần tạo lời mời:
${guestLines}

Quy tắc viết lời mời theo nhóm:
- "Họ hàng" hoặc "Gia đình" (ông, bà, cô, dì, chú, bác, anh, chị): phong cách trang trọng, kính cẩn, dùng từ xưng hô tôn kính như "Kính thưa", "Trân trọng kính mời".
- "Bạn thân" hoặc "Bạn bè": phong cách gần gũi, vui tươi, lầy lội hoặc hài hước nhẹ nhàng, ấm áp.
- "Đồng nghiệp", "Công ty" hoặc "Đối tác": phong cách lịch sự, nhã nhặn, chuyên nghiệp nhưng thân tình.
- Nhóm khác hoặc không rõ: lịch thiệp, ấm áp và chân thành.

Yêu cầu output:
Chỉ trả về ĐÚNG MỘT MẢNG JSON hợp lệ, KHÔNG thêm bất kỳ giải thích, text mở đầu hay kết thúc nào khác.
Mỗi phần tử đại diện cho một khách mời theo thứ tự:
[
  {
    "index": 1,
    "name": "Tên khách",
    "salutation": "Câu xưng hô (Ví dụ: Kính thưa Bác Ba / Chào bạn thân Tùng / Gửi anh Minh)",
    "message": "Lời nhắn cá nhân hóa 2-3 câu ngắn gọn, ý nghĩa, có nhắc niềm vui ngày cưới của ${groom} & ${bride}",
    "guest_slug": "slug-khong-dau-cua-ten-khach"
  }
]`;

  // ── Gọi Gemini API ────────────────────────────────────────────────────────────
  const ai = new GoogleGenAI({ apiKey });
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash', 'gemini-1.5-flash'];
  let rawText = '';
  let lastError = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });
      if (response?.text) {
        rawText = response.text;
        break;
      }
    } catch (err) {
      lastError = err;
      console.warn(`Lỗi khi gọi model ${model}:`, err.message || err);
    }
  }

  if (!rawText) {
    return res.status(502).json({
      error: 'Không thể kết nối Gemini AI. ' + (lastError?.message || 'Không có phản hồi.'),
    });
  }

  let aiData;
  try {
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    aiData = JSON.parse(cleaned);

    if (!Array.isArray(aiData)) {
      if (aiData && typeof aiData === 'object' && Array.isArray(aiData.guests)) {
        aiData = aiData.guests;
      } else {
        throw new Error('AI không trả về mảng JSON hợp lệ.');
      }
    }
  } catch (err) {
    console.error('Lỗi khi parse JSON từ Gemini:', err, 'Raw:', rawText);
    return res.status(502).json({ error: 'Lỗi định dạng dữ liệu từ AI: ' + err.message });
  }

  // ── Ghép kết quả với dữ liệu gốc ─────────────────────────────────────────────
  const result = guests.map((g, i) => {
    const aiItem = aiData.find((a) => a.index === i + 1) || aiData[i] || {};
    const name = String(g.name || '').trim();
    const group = String(g.group || g.grp || '').trim();
    const guestSlug = aiItem.guest_slug || toSlug(name) || `khach-${i + 1}`;

    const prettyUrl = coupleSlug
      ? `https://wedstory.vn/dam-cuoi-${coupleSlug}/${guestSlug}`
      : `https://wedstory.vn/dam-cuoi/${guestSlug}`;

    return {
      name,
      group,
      salutation: aiItem.salutation || (g.salutation ? `Kính gửi ${g.salutation}` : `Kính gửi ${name}`),
      message: aiItem.message || `Trân trọng kính mời bạn đến chung vui trong ngày trọng đại của ${groom} & ${bride}.`,
      guest_slug: guestSlug,
      couple_slug: coupleSlug,
      pretty_url: prettyUrl,
    };
  });

  return res.status(200).json(result);
}

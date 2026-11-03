import React, { useState } from 'react';
import {
  generateWeddingWish,
  generatePersonalizedInvitation,
  generateSmartPersonalizedInvitation,
} from '../services/geminiService.js';

/**
 * Component Trợ lý AI WedStory:
 * 1. TỰ ĐỘNG nhận diện & phân tích ngữ cảnh để sinh lời mời thiệp cưới (Cô dâu - Chú rể)
 *    - Bỏ chọn nhóm thủ công, AI tự suy luận đối tượng & điều chỉnh văn phong
 * 2. Soạn lời chúc đám cưới cá nhân hoá (Khách mời)
 * Tích hợp Google Gemini 3.5 Flash
 */
export const AIAssistantWish = ({
  initialName = '',
  brideGroomNames = 'Cô dâu & Chú rể',
  onApplyWish = null,
  onApplyInvitation = null,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('invitation'); // 'invitation' | 'wish'

  // State cho Tự động nhận diện ngữ cảnh & sinh lời mời (Chính)
  const [guestContext, setGuestContext] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [generatedInvitation, setGeneratedInvitation] = useState(null);

  // State cho Soạn lời chúc (Phụ)
  const [guestName, setGuestName] = useState(initialName);
  const [relationship, setRelationship] = useState('Bạn thân');
  const [wishTone, setWishTone] = useState('Chân thành & Ấm áp');
  const [generatedWish, setGeneratedWish] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Gợi ý nhanh 1-chạm
  const quickSuggestions = [
    { label: '💼 Anh Minh - Trưởng phòng', text: 'Anh Nguyễn Văn A - Trưởng phòng Kinh doanh' },
    { label: '👭 Tùng béo bạn cấp 3', text: 'Thằng Tùng béo bạn cấp 3' },
    { label: '🏡 Bác Ba - Trưởng họ', text: 'Bác Ba - Trưởng họ bên nội' },
    { label: '🌸 Chị Lan đồng nghiệp', text: 'Chị Lan đồng nghiệp Marketing' },
    { label: '🤝 Đối tác VIP', text: 'Đối tác chiến lược VIP công ty' },
  ];

  // Xử lý tạo lời mời tự động phân tích ngữ cảnh bằng Gemini AI
  const handleGenerateSmartInvitation = async (contextToUse) => {
    const ctx = (typeof contextToUse === 'string' ? contextToUse : guestContext).trim();
    if (!ctx) {
      setErrorMsg('Vui lòng nhập tên, chức vụ hoặc mối quan hệ của khách mời!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    try {
      const groom = brideGroomNames.split('&')[0]?.trim() || 'Chú rể';
      const bride = brideGroomNames.split('&')[1]?.trim() || 'Cô dâu';

      const res = await generateSmartPersonalizedInvitation({
        guestContext: ctx,
        groomName: groom,
        brideName: bride,
        customNotes,
      });

      setGeneratedInvitation(res);
      // Nếu có callback áp dụng tự động lên thiệp
      if (onApplyInvitation && res) {
        onApplyInvitation(res);
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối với Gemini AI lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tạo lời chúc mừng cưới
  const handleGenerateWish = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    try {
      const wish = await generateWeddingWish({
        guestName,
        relationship,
        tone: wishTone,
        brideGroomNames,
      });
      setGeneratedWish(wish);
      if (onApplyWish && wish) {
        onApplyWish(wish);
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối với Gemini AI lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div
      className={`ai-assistant-card ${className}`}
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fdf8f6 100%)',
        border: '1px solid #f0d5ce',
        borderRadius: '18px',
        padding: '22px 20px',
        boxShadow: '0 8px 24px rgba(184, 80, 66, 0.08)',
        fontFamily: 'inherit',
        color: '#332724',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: '580px',
        margin: '0 auto 20px',
      }}
    >
      {/* Header trợ lý AI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>✨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.08rem', fontWeight: 700, color: '#9b382d' }}>
              AI Tự Động Nhận Diện Lời Mời
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7a6864' }}>
              Gemini 3.5 Flash · Phân tích ngữ cảnh &amp; tự chọn văn phong
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            background: 'linear-gradient(90deg, #b85042, #e07a5f)',
            color: '#fff',
            padding: '3px 8px',
            borderRadius: '12px',
            fontWeight: 600,
            letterSpacing: '0.3px',
          }}
        >
          Tự động 100%
        </span>
      </div>

      {/* Tabs chuyển đổi chế độ */}
      <div style={{ display: 'flex', background: '#f5ebe8', borderRadius: '10px', padding: '3px', marginBottom: '16px', gap: '4px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('invitation')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'invitation' ? '#ffffff' : 'transparent',
            color: activeTab === 'invitation' ? '#9b382d' : '#735f5a',
            fontWeight: activeTab === 'invitation' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'invitation' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          💌 Tự Động Phân Tích Lời Mời
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('wish')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'wish' ? '#ffffff' : 'transparent',
            color: activeTab === 'wish' ? '#9b382d' : '#735f5a',
            fontWeight: activeTab === 'wish' ? 700 : 500,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'wish' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          💬 Soạn lời chúc cưới
        </button>
      </div>

      {/* TAB 1: TỰ ĐỘNG PHÂN TÍCH NGỮ CẢNH VÀ SINH LỜI MỜI (CHÍNH) */}
      {activeTab === 'invitation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#574844' }}>
                Nhập tên, chức danh hoặc mối quan hệ bất kỳ:
              </label>
              <small style={{ color: '#b85042', fontWeight: 600, fontSize: '0.78rem' }}>AI tự đọc hiểu ngữ cảnh</small>
            </div>
            <textarea
              rows={2}
              placeholder="Ví dụ: 'Anh Nguyễn Văn A - Trưởng phòng Kinh doanh', hoặc 'Thằng Tùng béo bạn cấp 3'..."
              value={guestContext}
              onChange={(e) => setGuestContext(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1.5px solid #d8a69d',
                fontSize: '0.9rem',
                lineHeight: 1.45,
                boxSizing: 'border-box',
                backgroundColor: '#fff',
                color: '#332724',
              }}
            />
          </div>

          {/* Gợi ý chạm nhanh 1-touch */}
          <div>
            <small style={{ display: 'block', fontSize: '0.76rem', color: '#7a6864', fontWeight: 600, marginBottom: '6px' }}>
              💡 Gợi ý thử nhanh 1-chạm:
            </small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {quickSuggestions.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setGuestContext(s.text);
                    handleGenerateSmartInvitation(s.text);
                  }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '5px 10px',
                    borderRadius: '20px',
                    border: '1px solid #e0c8c2',
                    background: '#fff',
                    color: '#6b524c',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: '4px', color: '#6b5752' }}>
              Ghi chú thêm cho AI (tuỳ chọn):
            </label>
            <input
              type="text"
              placeholder="VD: Nhắc thêm kỷ niệm vui, xưng hô hai cháu với Bác..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #d8c2bd',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => handleGenerateSmartInvitation()}
            disabled={isLoading}
            style={{
              marginTop: '4px',
              padding: '12px 18px',
              borderRadius: '9px',
              border: 'none',
              background: isLoading ? '#c9a8a2' : 'linear-gradient(135deg, #b85042 0%, #a23a2d 100%)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(184, 80, 66, 0.25)',
            }}
          >
            {isLoading ? '⏳ Gemini AI đang phân tích ngữ cảnh...' : '✨ AI Phân Tích & Tự Động Tạo Lời Mời'}
          </button>

          {/* Vùng hiển thị kết quả phân tích & lời mời */}
          {generatedInvitation && (
            <div
              style={{
                marginTop: '14px',
                padding: '14px 16px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.5px solid #e8cfc9',
                boxShadow: '0 3px 12px rgba(184, 80, 66, 0.05)',
              }}
            >
              {/* Thẻ phân tích nhận diện của AI */}
              <div
                style={{
                  background: '#fff7f5',
                  border: '1px solid #f2d0c8',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9b382d', textTransform: 'uppercase' }}>
                    🏷️ AI Nhận Diện: {generatedInvitation.detectedCategory || generatedInvitation.group}
                  </span>
                  <span style={{ fontSize: '10px', background: '#fde8e4', color: '#9b382d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                    Tự Động Phân Loại
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#574844', marginBottom: '4px' }}>
                  <b>🎭 Văn phong:</b> {generatedInvitation.detectedTone || 'Tự nhiên & Chuẩn mực'}
                </div>
                {generatedInvitation.analysis && (
                  <div style={{ fontSize: '0.78rem', color: '#7a625d', fontStyle: 'italic' }}>
                    💡 <b>Phân tích:</b> {generatedInvitation.analysis}
                  </div>
                )}
              </div>

              {generatedInvitation.quote && (
                <div style={{ marginBottom: '10px' }}>
                  <small style={{ fontSize: '0.72rem', color: '#887470', fontWeight: 600 }}>THÔNG ĐIỆP MỞ ĐẦU (QUOTE):</small>
                  <p style={{ margin: '3px 0 0', fontStyle: 'italic', fontSize: '0.88rem', color: '#4a3d3a', background: '#fff9f8', padding: '8px 10px', borderRadius: '6px' }}>
                    “{generatedInvitation.quote}”
                  </p>
                </div>
              )}

              <div>
                <small style={{ fontSize: '0.72rem', color: '#887470', fontWeight: 600 }}>LỜI MỜI CHÍNH TRÊN THIỆP:</small>
                <p style={{ margin: '3px 0 10px', fontSize: '0.92rem', lineHeight: 1.6, color: '#2c211e', background: '#fff9f8', padding: '10px 12px', borderRadius: '6px' }}>
                  {generatedInvitation.message}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {onApplyInvitation && (
                  <button
                    type="button"
                    onClick={() => onApplyInvitation(generatedInvitation)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '7px',
                      border: 'none',
                      background: '#9b382d',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>👁️</span> Áp dụng lên thiệp xem trước
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyText(`“${generatedInvitation.quote}”\n\n${generatedInvitation.message}`)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: '1px solid #d8c2bd',
                    background: '#faf6f5',
                    color: '#574844',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✅ Đã sao chép' : '📋 Sao chép'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOẠN LỜI CHÚC CƯỚI (PHỤ) */}
      {activeTab === 'wish' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
              Tên của bạn (khách mời)
            </label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Ví dụ: Hoàng Long, Chị Thuỳ Dung..."
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d8c2bd',
                fontSize: '0.92rem',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
              Mối quan hệ với cô dâu / chú rể
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d8c2bd',
                fontSize: '0.92rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="Bạn thân">👭 Bạn thân thiết</option>
              <option value="Đồng nghiệp">💼 Đồng nghiệp / Công ty</option>
              <option value="Họ hàng">🏡 Họ hàng / Người thân</option>
              <option value="Bạn học cũ">🎓 Bạn thời học sinh / Sinh viên</option>
              <option value="Anh / Chị / Em">🌸 Anh / Chị / Em</option>
              <option value="Người lớn / Bác / Cô / Chú">👴 Bác / Cô / Chú / Người lớn tuổi</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
              Phong cách lời chúc
            </label>
            <select
              value={wishTone}
              onChange={(e) => setWishTone(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d8c2bd',
                fontSize: '0.92rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="Chân thành & Ấm áp">💖 Chân thành &amp; Ấm áp</option>
              <option value="Hài hước & Dí dỏm">😄 Hài hước &amp; Dí dỏm</option>
              <option value="Lãng mạn & Ngọt ngào">🌹 Lãng mạn &amp; Ngọt ngào</option>
              <option value="Trang trọng & Lịch sự">🎩 Trang trọng &amp; Lịch thiệp</option>
              <option value="Ngắn gọn & Súc tích">⚡ Ngắn gọn &amp; Ý nghĩa</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateWish}
            disabled={isLoading}
            style={{
              marginTop: '4px',
              padding: '12px 18px',
              borderRadius: '9px',
              border: 'none',
              background: isLoading ? '#c9a8a2' : 'linear-gradient(135deg, #b85042 0%, #a23a2d 100%)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(184, 80, 66, 0.25)',
            }}
          >
            {isLoading ? '⏳ Gemini AI đang sáng tác...' : '✨ Sáng Tác Lời Chúc (Gemini AI)'}
          </button>

          {/* Vùng hiển thị kết quả lời chúc */}
          {generatedWish && (
            <div
              style={{
                marginTop: '14px',
                padding: '14px 16px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1.5px dashed #d8a69d',
              }}
            >
              <p
                style={{
                  margin: '0 0 12px',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  fontStyle: 'italic',
                  color: '#332724',
                }}
              >
                "{generatedWish}"
              </p>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {onApplyWish && (
                  <button
                    type="button"
                    onClick={() => onApplyWish(generatedWish)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '7px',
                      border: 'none',
                      background: '#b85042',
                      color: '#fff',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    💌 Điền vào sổ lưu bút
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleCopyText(generatedWish)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '7px',
                    border: '1px solid #d8c2bd',
                    background: '#faf6f5',
                    color: '#574844',
                    fontSize: '0.82rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✅ Đã sao chép' : '📋 Sao chép'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thông báo lỗi */}
      {errorMsg && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '8px',
            fontSize: '0.85rem',
            border: '1px solid #ffcdd2',
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
};

export default AIAssistantWish;

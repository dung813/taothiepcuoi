import React, { useState } from 'react';
import { generateWeddingWish } from '../services/geminiService.js';

/**
 * Component Trợ lý AI sáng tác lời chúc cưới thông minh
 * Tích hợp Google Gemini 2.5 Flash
 */
export const AIAssistantWish = ({
  initialName = '',
  brideGroomNames = 'Cô dâu & Chú rể',
  onApplyWish = null,
  className = '',
}) => {
  const [guestName, setGuestName] = useState(initialName);
  const [relationship, setRelationship] = useState('Bạn thân');
  const [tone, setTone] = useState('Chân thành & Ấm áp');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedWish, setGeneratedWish] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  // Danh sách các mối quan hệ phổ biến
  const relationships = [
    { value: 'Bạn thân', label: '👭 Bạn thân thiết' },
    { value: 'Đồng nghiệp', label: '💼 Đồng nghiệp / Công ty' },
    { value: 'Họ hàng', label: '🏡 Họ hàng / Người thân' },
    { value: 'Bạn học cũ', label: '🎓 Bạn thời học sinh / Sinh viên' },
    { value: 'Anh / Chị / Em', label: '🌸 Anh / Chị / Em' },
    { value: 'Người lớn / Bác / Cô / Chú', label: '👴 Bác / Cô / Chú / Người lớn tuổi' },
  ];

  // Các phong cách lời chúc
  const tones = [
    { value: 'Chân thành & Ấm áp', label: '💖 Chân thành & Ấm áp' },
    { value: 'Hài hước & Dí dỏm', label: '😄 Hài hước & Vui vẻ' },
    { value: 'Trang trọng & Lịch sự', label: '🎩 Trang trọng & Lịch thiệp' },
    { value: 'Ngắn gọn & Súc tích', label: '⚡ Ngắn gọn & Ý nghĩa' },
  ];

  // Xử lý tạo lời chúc từ Gemini
  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    try {
      const wish = await generateWeddingWish({
        guestName,
        relationship,
        tone,
        brideGroomNames,
      });
      setGeneratedWish(wish);
    } catch (err) {
      setErrorMsg('Không thể kết nối với AI lúc này. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sao chép vào clipboard
  const handleCopy = () => {
    if (!generatedWish) return;
    navigator.clipboard?.writeText(generatedWish);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // Đưa lời chúc trực tiếp vào form thiệp cưới
  const handleApply = () => {
    if (onApplyWish && generatedWish) {
      onApplyWish(generatedWish);
    }
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
        maxWidth: '560px',
        margin: '0 auto 20px',
      }}
    >
      {/* Header trợ lý AI */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>✨</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#9b382d' }}>
              Trợ lý AI Soạn Lời Chúc Cưới
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7a6864' }}>
              Cá nhân hoá theo tên & mối quan hệ của bạn
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
            fontWeight: 500,
            letterSpacing: '0.3px',
          }}
        >
          Gemini 3.5 Flash
        </span>
      </div>

      {/* Form nhập liệu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Tên khách mời */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
            Tên của bạn
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ví dụ: Hoàng Long, Chị Thuỳ Dung..."
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '9px',
              border: '1px solid #d8c2bd',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
            }}
          />
        </div>

        {/* Mối quan hệ */}
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
              borderRadius: '9px',
              border: '1px solid #d8c2bd',
              fontSize: '0.92rem',
              outline: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#fff',
              cursor: 'pointer',
            }}
          >
            {relationships.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {/* Phong cách lời chúc */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
            Phong cách mong muốn
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {tones.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => setTone(t.value)}
                style={{
                  padding: '7px 8px',
                  borderRadius: '7px',
                  border: tone === t.value ? '1.5px solid #b85042' : '1px solid #e5d4cf',
                  background: tone === t.value ? '#fcf0ed' : '#ffffff',
                  color: tone === t.value ? '#9b382d' : '#574844',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  fontWeight: tone === t.value ? 600 : 400,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Nút bấm gọi AI tạo lời chúc */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isLoading}
          style={{
            marginTop: '6px',
            padding: '11px 18px',
            borderRadius: '9px',
            border: 'none',
            background: isLoading
              ? '#c9a8a2'
              : 'linear-gradient(135deg, #b85042 0%, #a23a2d 100%)',
            color: '#fff',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(184, 80, 66, 0.25)',
            transition: 'opacity 0.2s ease',
          }}
        >
          {isLoading ? (
            <>
              <span className="ai-spin" style={{ display: 'inline-block', animation: 'spin 1s infinite linear' }}>
                ⏳
              </span>
              <span>Gemini AI đang sáng tác lời chúc...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Tạo Lời Chúc Bằng AI</span>
            </>
          )}
        </button>

        {errorMsg && (
          <p style={{ margin: '4px 0 0', color: '#c0392b', fontSize: '0.82rem' }}>
            {errorMsg}
          </p>
        )}
      </div>

      {/* Vùng hiển thị kết quả lời chúc */}
      {generatedWish && (
        <div
          style={{
            marginTop: '16px',
            padding: '14px 16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1.5px dashed #d8a69d',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9b382d' }}>
              💌 Lời chúc được tạo riêng cho bạn:
            </span>
          </div>

          <p
            style={{
              margin: '0 0 12px 0',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              color: '#3d302c',
              fontStyle: 'italic',
            }}
          >
            "{generatedWish}"
          </p>

          {/* Các nút hành động */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {onApplyWish && (
              <button
                type="button"
                onClick={handleApply}
                style={{
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  background: '#9b382d',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>✍️</span> Dùng lời chúc này
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              style={{
                padding: '7px 12px',
                borderRadius: '7px',
                border: '1px solid #d8c2bd',
                background: '#faf6f5',
                color: '#574844',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>{copied ? '✅' : '📋'}</span>
              <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>

            <button
              type="button"
              onClick={handleGenerate}
              style={{
                padding: '7px 12px',
                borderRadius: '7px',
                border: '1px solid #d8c2bd',
                background: '#faf6f5',
                color: '#574844',
                fontSize: '0.82rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                marginLeft: 'auto',
              }}
            >
              <span>🔄</span> Đổi câu khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistantWish;

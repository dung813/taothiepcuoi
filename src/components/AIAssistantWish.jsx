import React, { useState } from 'react';
import { generateWeddingWish, generatePersonalizedInvitation } from '../services/geminiService.js';

/**
 * Component Trợ lý AI WedStory:
 * 1. Tự động cá nhân hoá nội dung lời mời thiệp cưới theo nhóm khách mời (Cô dâu - Chú rể)
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

  // State cho Cá nhân hoá lời mời thiệp cưới (Chính)
  const [selectedGroup, setSelectedGroup] = useState('Bạn thân');
  const [customGroup, setCustomGroup] = useState('');
  const [invitationTone, setInvitationTone] = useState('Tự nhiên & Chuẩn mực theo nhóm');
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

  // Danh sách các nhóm khách mời chuẩn mực
  const guestGroups = [
    { value: 'Bạn thân', label: '👭 Bạn thân / Bạn nối khố', desc: 'Thân mật, hóm hỉnh, ấm áp' },
    { value: 'Đồng nghiệp & Sếp', label: '💼 Đồng nghiệp / Sếp', desc: 'Lịch thiệp, trang trọng' },
    { value: 'Họ hàng lớn tuổi (Bác, Cô, Chú)', label: '🏡 Họ hàng lớn tuổi', desc: 'Lễ phép, cung kính, đầm ấm gia phong' },
    { value: 'Bạn cấp 3 / Đại học', label: '🎓 Bạn cấp 3 / Đại học', desc: 'Thanh xuân, hoài niệm' },
    { value: 'Đối tác & Khách quý', label: '🤝 Đối tác & Khách quý', desc: 'Trang nhã, đẳng cấp' },
    { value: 'Anh / Chị / Em', label: '🌸 Anh / Chị / Em', desc: 'Gần gũi, ngọt ngào tình thân' },
  ];

  // Xử lý tạo lời mời thiệp cưới cá nhân hoá bằng Gemini AI
  const handleGenerateInvitation = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setCopied(false);

    const grp = customGroup.trim() || selectedGroup;
    try {
      const res = await generatePersonalizedInvitation({
        guestGroup: grp,
        groomName: brideGroomNames.split('&')[0]?.trim() || 'Chú rể',
        brideName: brideGroomNames.split('&')[1]?.trim() || 'Cô dâu',
        tone: invitationTone,
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
              Trợ lý Gemini AI WedStory
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#7a6864' }}>
              Cá nhân hoá lời mời thiệp cưới theo nhóm đối tượng
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
          Gemini 3.5 Flash
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
          💌 Cá nhân hoá lời mời thiệp
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

      {/* TAB 1: CÁ NHÂN HOÁ LỜI MỜI THEO NHÓM KHÁCH MỜI */}
      {activeTab === 'invitation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: '#574844' }}>
              1. Chọn Nhóm khách mời gửi thiệp:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
              {guestGroups.map((grp) => (
                <button
                  type="button"
                  key={grp.value}
                  onClick={() => {
                    setSelectedGroup(grp.value);
                    setCustomGroup('');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '9px',
                    border: selectedGroup === grp.value && !customGroup ? '1.5px solid #b85042' : '1px solid #e5d4cf',
                    background: selectedGroup === grp.value && !customGroup ? '#fdf2ef' : '#ffffff',
                    color: selectedGroup === grp.value && !customGroup ? '#9b382d' : '#453733',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontWeight: selectedGroup === grp.value && !customGroup ? 700 : 500 }}>{grp.label}</span>
                  <small style={{ fontSize: '10px', opacity: 0.75 }}>{grp.desc}</small>
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Hoặc tự nhập nhóm khác (VD: CLB Cầu lông, Team Marketing...)"
              value={customGroup}
              onChange={(e) => setCustomGroup(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px', color: '#574844' }}>
              2. Văn phong / Giọng điệu mong muốn:
            </label>
            <select
              value={invitationTone}
              onChange={(e) => setInvitationTone(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #d8c2bd',
                fontSize: '0.88rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="Tự nhiên & Chuẩn mực theo nhóm">✨ Tự động theo chuẩn văn phong nhóm (Khuyên dùng)</option>
              <option value="Thân mật, vui vẻ & Hóm hỉnh">😄 Thân mật, vui tươi &amp; Hóm hỉnh</option>
              <option value="Lễ phép, kính cẩn & Đầm ấm gia phong">👵 Lễ phép, kính cẩn &amp; Chuẩn truyền thống</option>
              <option value="Trang trọng, lịch thiệp & Tôn quý">🎩 Trang trọng, lịch thiệp &amp; Đẳng cấp</option>
              <option value="Lãng mạn, tinh tế & Cảm xúc">🌹 Lãng mạn, sâu lắng &amp; Tinh tế</option>
              <option value="Ngắn gọn, súc tích & Tinh gọn">⚡ Ngắn gọn, súc tích &amp; Tinh tế</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '4px', color: '#574844' }}>
              Ghi chú thêm cho AI (tuỳ chọn):
            </label>
            <input
              type="text"
              placeholder="VD: Nhắc lại thời sinh viên, xưng hô hai cháu với Bác..."
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
            onClick={handleGenerateInvitation}
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
            {isLoading ? '⏳ Gemini AI đang soạn thảo lời mời...' : '✨ Gemini AI Tạo Lời Mời Cá Nhân Hoá'}
          </button>

          {/* Vùng hiển thị kết quả lời mời */}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#9b382d' }}>
                  📜 Lời mời dành riêng cho: {generatedInvitation.group}
                </span>
                <span style={{ fontSize: '10px', background: '#fde8e4', color: '#9b382d', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>
                  Đã cá nhân hoá
                </span>
              </div>

              {generatedInvitation.quote && (
                <div style={{ marginBottom: '8px' }}>
                  <small style={{ fontSize: '0.72rem', color: '#887470', fontWeight: 600 }}>THÔNG ĐIỆP MỞ ĐẦU (QUOTE):</small>
                  <p style={{ margin: '2px 0 0', fontStyle: 'italic', fontSize: '0.88rem', color: '#4a3d3a', background: '#fff9f8', padding: '8px', borderRadius: '6px' }}>
                    “{generatedInvitation.quote}”
                  </p>
                </div>
              )}

              <div>
                <small style={{ fontSize: '0.72rem', color: '#887470', fontWeight: 600 }}>LỜI MỜI CHÍNH TRÊN THIỆP:</small>
                <p style={{ margin: '2px 0 10px', fontSize: '0.92rem', lineHeight: 1.6, color: '#2c211e', background: '#fff9f8', padding: '10px', borderRadius: '6px' }}>
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
                fontSize: '0.88rem',
                backgroundColor: '#fff',
                cursor: 'pointer',
              }}
            >
              <option value="Chân thành & Ấm áp">💖 Chân thành &amp; Ấm áp</option>
              <option value="Hài hước & Dí dỏm">😄 Hài hước &amp; Dí dỏm</option>
              <option value="Trang trọng & Lịch sự">🎩 Trang trọng &amp; Lịch thiệp</option>
              <option value="Ngắn gọn & Súc tích">⚡ Ngắn gọn &amp; Ý nghĩa</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateWish}
            disabled={isLoading}
            style={{
              marginTop: '6px',
              padding: '11px 18px',
              borderRadius: '9px',
              border: 'none',
              background: isLoading ? '#c9a8a2' : 'linear-gradient(135deg, #b85042 0%, #a23a2d 100%)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(184, 80, 66, 0.25)',
            }}
          >
            {isLoading ? '⏳ Gemini AI đang sáng tác lời chúc...' : '✨ Tạo Lời Chúc Bằng AI'}
          </button>

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
              <p style={{ margin: '0 0 10px 0', fontSize: '0.95rem', lineHeight: 1.6, color: '#3d302c', fontStyle: 'italic' }}>
                "{generatedWish}"
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {onApplyWish && (
                  <button
                    type="button"
                    onClick={() => onApplyWish(generatedWish)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: '7px',
                      border: 'none',
                      background: '#9b382d',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✍️ Dùng lời chúc này
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleCopyText(generatedWish)}
                  style={{
                    padding: '7px 12px',
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

      {errorMsg && (
        <p style={{ margin: '8px 0 0', color: '#c0392b', fontSize: '0.82rem' }}>
          {errorMsg}
        </p>
      )}
    </div>
  );
};

export default AIAssistantWish;

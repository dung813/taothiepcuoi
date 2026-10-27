import React from 'react';
import { BaseLayoutCardProps } from '../types';

/**
 * Layout 5: Envelope & Wax Seal Element (Phong cách ZenLove)
 * Phong bì thư nhung gập chữ V + Con dấu sáp 3D dập nổi + Bức ảnh trồi lên khi hover
 * (Đúng thiết kế mẫu "Mộng Thư", "Song Hỷ - Hồng Liên" trên ZenLove).
 */
export const EnvelopeSealCard: React.FC<BaseLayoutCardProps> = ({
  template,
  onPreview,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { couple, images, styling, badge } = template;
  const bgColor = styling.bgColor || 'bg-[#FAF3F0]';
  const envBg = (template as any).envelopeColor || '#7A1C24';
  const sColor = styling.sealColor || '#B82835';
  const mono = styling.sealMonogram || (template as any).sealMonogram || '囍';
  const envText = (template as any).envelopeText || 'CHẠM ĐỂ MỞ THIỆP';
  const likes = (template as any).likes || 312;

  return (
    <div
      onClick={() => onPreview?.(template)}
      className={`group relative [aspect-ratio:1000/1470] w-full ${bgColor} overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer p-4 flex flex-col justify-between border border-stone-200/60 select-none`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between z-30">
        {badge ? (
          <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        ) : (
          <span className="text-[9px] font-light tracking-[0.25em] uppercase text-stone-500">
            {template.tagline || 'SAVE THE DATE'}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200 shadow-xs">
            ❤️ {likes}
          </span>
          <button
            type="button"
            aria-label="Yêu thích"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(template.id);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-white text-stone-400 hover:text-rose-500 border border-stone-200'
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* The Inner Invitation Photo Card - Peeks & Slides Up on Hover */}
      <div className="relative w-full h-[66%] rounded-xl bg-white p-2 shadow-md transition-transform duration-500 ease-out group-hover:-translate-y-4 z-10">
        <div className="relative h-[80%] w-full rounded-lg overflow-hidden bg-stone-100 shadow-inner">
          <img
            src={images.main}
            alt={`${couple.groom} & ${couple.bride}`}
            loading="lazy"
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="text-center pt-1.5">
          <h4 className="font-serif italic text-base text-stone-800">
            {couple.groom} &amp; {couple.bride}
          </h4>
        </div>
      </div>

      {/* Realistic Physical Envelope Flap & Pocket */}
      <div
        className="relative z-20 -mx-4 -mb-4 pt-6 pb-4 px-4 rounded-b-2xl shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex flex-col items-center transition-colors duration-300"
        style={{ backgroundColor: envBg }}
      >
        {/* The 3D Wax Seal right at apex of envelope */}
        <div className="absolute -top-5 flex items-center justify-center">
          <div
            className="relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-500 group-hover:scale-110 shadow-[0_4px_10px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: sColor }}
          >
            <div className="absolute inset-1 rounded-full border border-white/20" />
            <span className="font-serif text-[11px] font-bold text-amber-100 uppercase tracking-wider drop-shadow">
              {mono}
            </span>
          </div>
        </div>

        {/* Stamped Date on Envelope */}
        <div className="mt-2 text-center text-amber-100/90">
          <p className="text-[10px] font-light tracking-[0.25em] uppercase">
            {couple.dateFormatted}
          </p>
          <p className="text-[9px] font-serif italic text-amber-200 mt-0.5">
            {envText}
          </p>
        </div>

        {/* Hover Action Pill */}
        <div className="mt-2 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="rounded-full bg-white text-stone-900 px-4 py-1 text-[11px] font-semibold tracking-wider uppercase shadow-md hover:bg-stone-100 transition"
          >
            Xem mẫu
          </button>
        </div>
      </div>
    </div>
  );
};

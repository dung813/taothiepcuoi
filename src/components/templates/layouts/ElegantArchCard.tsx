import React from 'react';
import { BaseLayoutCardProps } from '../types';

/**
 * Layout 2: The Elegant Arch (Phong cách ZenLove)
 * Ảnh cưới được uốn cong vòm kiến trúc ở nửa trên.
 * Nửa dưới là khối lịch ngày cưới dạng tem chữ nhật và typography nghệ thuật.
 */
export const ElegantArchCard: React.FC<BaseLayoutCardProps> = ({
  template,
  onPreview,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { couple, images, styling, badge } = template;
  const bgColor = styling.bgColor || 'bg-[#FDF6F4]';
  const displayTitle = (template as any).displayTitle || 'Save our date';
  const likes = (template as any).likes || 135;

  return (
    <div
      onClick={() => onPreview?.(template)}
      className={`group relative [aspect-ratio:1000/1470] w-full ${bgColor} overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer p-4 flex flex-col justify-between border border-stone-200/60 select-none`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between z-20">
        {badge ? (
          <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        ) : (
          <span className="font-serif italic text-base text-stone-500">
            {displayTitle}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
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

      {/* Architectural Arch Shape Photo Container */}
      <div className="relative w-full h-[58%] rounded-t-[120px] sm:rounded-t-[140px] overflow-hidden shadow-inner ring-1 ring-black/5 bg-stone-100 my-2">
        <img
          src={images.main}
          alt={`${couple.groom} & ${couple.bride}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Lower Typography: Couple Names & Calendar Block (Zenlove Style) */}
      <div className="flex flex-col items-center justify-center text-center">
        <h3 className="font-serif italic text-2xl sm:text-3xl font-normal text-stone-800 leading-tight">
          {couple.groom} &amp; {couple.bride}
        </h3>

        {/* Calendar Box Stamp */}
        <div className="mt-1.5 flex items-center justify-center gap-3 border-y border-stone-300/60 py-1 px-4 text-stone-700">
          <span className="text-[10px] font-light uppercase tracking-wider">{couple.dayOfWeek || 'Chủ Nhật'}</span>
          <span className="font-serif text-xl font-semibold text-stone-900 border-x border-stone-300/60 px-3">
            {couple.dateFormatted.split('.')[0] || '14'}
          </span>
          <span className="text-[10px] font-light uppercase tracking-wider">2026</span>
        </div>

        <p className="text-[9px] font-light tracking-[0.2em] uppercase text-stone-400 mt-1">
          {couple.location}
        </p>

        {/* Hover Action Pill */}
        <div className="mt-2 opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="rounded-full bg-stone-900 text-white px-4 py-1.5 text-[11px] font-medium tracking-wider uppercase shadow-md hover:bg-stone-800 transition"
          >
            Xem mẫu
          </button>
        </div>
      </div>
    </div>
  );
};

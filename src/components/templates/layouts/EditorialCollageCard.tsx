import React from 'react';
import { BaseLayoutCardProps } from '../types';

/**
 * Layout 3: Editorial Filmstrip & Collage (Phong cách ZenLove)
 * Ảnh chính lớn phía trên + tên cô dâu chú rể ở giữa + dải 3 ảnh Polaroid chân thẻ thiệp
 * (Đúng thiết kế Card 1 rất bắt mắt từ trang mẫu ZenLove).
 */
export const EditorialCollageCard: React.FC<BaseLayoutCardProps> = ({
  template,
  onPreview,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { couple, images, styling, badge } = template;
  const bgColor = styling.bgColor || 'bg-[#FAF6F0]';
  const likes = (template as any).likes || 154;

  const strip1 = (template as any).images.strip1 || images.secondary || images.main;
  const strip2 = (template as any).images.strip2 || images.tertiary || images.main;
  const strip3 = (template as any).images.strip3 || images.main;

  return (
    <div
      onClick={() => onPreview?.(template)}
      className={`group relative [aspect-ratio:1000/1470] w-full ${bgColor} overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer p-3.5 flex flex-col justify-between border border-stone-200/60 select-none`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-2">
        {badge ? (
          <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        ) : (
          <span className="text-[9px] font-light tracking-[0.25em] uppercase text-stone-400">
            SAVE THE DATE
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-stone-600 border border-stone-200">
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

      {/* Main Top Photograph */}
      <div className="relative w-full h-[54%] rounded-xl overflow-hidden shadow-xs ring-1 ring-black/5 bg-stone-100">
        <img
          src={images.main}
          alt={`${couple.groom} & ${couple.bride}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Middle Typography Banner */}
      <div className="text-center py-1.5 bg-white rounded-lg my-1 shadow-xs border border-stone-200/50">
        <h3 className="font-serif italic text-xl sm:text-2xl font-normal text-stone-800">
          {couple.groom} &amp; {couple.bride}
        </h3>
        <p className="text-[9px] font-mono tracking-widest uppercase text-stone-500">
          {couple.dateFormatted}
        </p>
      </div>

      {/* Dải 3 Ảnh Polaroid Mini Ở Chân Thẻ */}
      <div className="grid grid-cols-3 gap-1.5 w-full">
        <div className="aspect-square rounded-lg overflow-hidden border border-white shadow-xs">
          <img src={strip1} alt="Film 1" className="h-full w-full object-cover" />
        </div>
        <div className="aspect-square rounded-lg overflow-hidden border border-white shadow-xs">
          <img src={strip2} alt="Film 2" className="h-full w-full object-cover" />
        </div>
        <div className="aspect-square rounded-lg overflow-hidden border border-white shadow-xs">
          <img src={strip3} alt="Film 3" className="h-full w-full object-cover" />
        </div>
      </div>

      {/* Hover Action Pill */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPreview?.(template);
          }}
          className="rounded-full bg-stone-900 text-white px-5 py-2 text-xs font-semibold tracking-wider uppercase shadow-xl pointer-events-auto hover:bg-stone-800 transition"
        >
          Xem mẫu
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { BaseLayoutCardProps } from '../types';

/**
 * Layout 4: Modern Minimalist Studio (Phong cách ZenLove)
 * Ảnh chân dung Studio tươi sáng + Khoảng thở Passepartout viền trắng + Calligraphy nghệ thuật
 * (Giống mẫu "Save The Date" & "Welcome to our wedding" của ZenLove).
 */
export const ModernMinimalistCard: React.FC<BaseLayoutCardProps> = ({
  template,
  onPreview,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { couple, images, styling, badge } = template;
  const bgColor = styling.bgColor || 'bg-white';
  const displayTitle = (template as any).displayTitle || 'Save The Date';
  const likes = (template as any).likes || 187;

  return (
    <div
      onClick={() => onPreview?.(template)}
      className={`group relative [aspect-ratio:1000/1470] w-full ${bgColor} overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.15)] transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer p-5 flex flex-col justify-between border border-stone-200/60 select-none`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        {badge ? (
          <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        ) : (
          <span className="text-[9px] font-light tracking-[0.3em] uppercase text-stone-400">
            WEDSTORY ATELIER
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
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
              isFavorite ? 'bg-rose-500 text-white' : 'text-stone-300 hover:text-rose-500'
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Central Portrait Photograph framed by white passepartout */}
      <div className="relative my-2 flex-1 w-full rounded-xl overflow-hidden shadow-xs ring-1 ring-black/5 bg-stone-100">
        <img
          src={images.main}
          alt={`${couple.groom} & ${couple.bride}`}
          loading="lazy"
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-103"
        />
      </div>

      {/* Bottom Calligraphy & Typography */}
      <div className="text-center pt-2">
        <h2 className="font-serif italic text-2xl sm:text-3xl text-stone-900 leading-tight">
          {displayTitle}
        </h2>
        <h3 className="font-serif text-base text-stone-700 uppercase tracking-widest font-normal mt-1">
          {couple.groom} &amp; {couple.bride}
        </h3>
        <p className="text-[10px] font-light tracking-[0.25em] uppercase text-stone-400 mt-1">
          {couple.dateFormatted}
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

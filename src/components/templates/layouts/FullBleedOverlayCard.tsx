import React from 'react';
import { BaseLayoutCardProps } from '../types';

/**
 * Layout 1: Full Bleed Overlay (Phong cách ZenLove)
 * Ảnh cưới tràn viền kết hợp typography lớn nghệ thuật đè trực tiếp lên ảnh
 * (như mẫu "and happily ever after", "Our Love Begins", "We got married!").
 */
export const FullBleedOverlayCard: React.FC<BaseLayoutCardProps> = ({
  template,
  onPreview,
  onSelect,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const { couple, images, styling, badge, name } = template;
  const gradientClass = styling.gradientOverlay || 'from-stone-950/85 via-stone-950/25 to-black/20';
  const displayTitle = (template as any).displayTitle || 'and happily ever after';
  const titleFont = (template as any).titleFont || 'script';
  const likes = (template as any).likes || 148;

  return (
    <div
      onClick={() => onPreview?.(template)}
      className="group relative [aspect-ratio:1000/1470] w-full overflow-hidden rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 ease-in-out transform hover:-translate-y-2 cursor-pointer bg-stone-900 select-none border border-black/5"
    >
      {/* Background Wedding Photograph */}
      <img
        src={images.main}
        alt={`${couple.groom} & ${couple.bride}`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Cinematic Gradient Overlays */}
      <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass}`} />
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

      {/* Top Badges & Likes */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-3.5">
        {badge ? (
          <span className="rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
            {badge}
          </span>
        ) : <span />}

        <div className="flex items-center gap-1.5">
          <span className="rounded-full bg-black/35 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-white flex items-center gap-1">
            ❤️ {likes}
          </span>
          <button
            type="button"
            aria-label="Yêu thích"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(template.id);
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-md transition-all ${
              isFavorite ? 'bg-rose-500 text-white' : 'bg-black/30 text-white/80 hover:bg-white hover:text-rose-500'
            }`}
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Dramatic Center/Bottom Typography */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 text-center text-white pb-6">
        {titleFont === 'script' ? (
          <h2 className="font-serif italic text-4xl sm:text-5xl text-white font-normal leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] px-2 -rotate-3">
            {displayTitle}
          </h2>
        ) : (
          <h2 className="font-serif text-3xl sm:text-4xl text-amber-100 font-light tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] uppercase">
            {displayTitle}
          </h2>
        )}

        <div className="mt-3 pt-3 border-t border-white/20 flex flex-col items-center">
          <h3 className="font-serif text-lg sm:text-xl font-normal tracking-wide text-white drop-shadow">
            {couple.groom} &amp; {couple.bride}
          </h3>
          <p className="text-[10px] font-light tracking-[0.25em] uppercase text-white/85 mt-1">
            {couple.dateFormatted}
          </p>
        </div>

        {/* Hover Action Pill */}
        <div className="mt-3 opacity-0 transform translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 flex justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(template);
            }}
            className="rounded-full bg-white text-stone-900 px-5 py-2 text-xs font-semibold tracking-wider uppercase shadow-xl hover:bg-stone-100 transition"
          >
            Xem mẫu
          </button>
        </div>
      </div>
    </div>
  );
};

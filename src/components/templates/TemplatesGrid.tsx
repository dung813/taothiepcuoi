import React, { useState, useMemo } from 'react';
import { WeddingTemplate, LayoutType } from './types';
import { mockTemplates as defaultTemplates } from './mockTemplates';
import { FullBleedOverlayCard } from './layouts/FullBleedOverlayCard';
import { ElegantArchCard } from './layouts/ElegantArchCard';
import { EditorialCollageCard } from './layouts/EditorialCollageCard';
import { ModernMinimalistCard } from './layouts/ModernMinimalistCard';
import { EnvelopeSealCard } from './layouts/EnvelopeSealCard';

interface TemplatesGridProps {
  templates?: WeddingTemplate[];
  onSelectTemplate?: (template: WeddingTemplate) => void;
  className?: string;
}

type FilterLayout = 'all' | LayoutType;

export const TemplatesGrid: React.FC<TemplatesGridProps> = ({
  templates = defaultTemplates,
  onSelectTemplate,
  className = '',
}) => {
  // State for filtering & searching
  const [selectedLayout, setSelectedLayout] = useState<FilterLayout>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'newest'>('popular');
  const [selectedTier, setSelectedTier] = useState<'all' | 'basic' | 'premium'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['tpl-01-crepuscule', 'tpl-05-florence-arch']));
  
  // State for Live Fullscreen Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<WeddingTemplate | null>(null);

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter & sort logic
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((t) => {
        // Layout filter
        if (selectedLayout !== 'all' && t.layoutType !== selectedLayout) {
          return false;
        }
        // Tier filter
        if (selectedTier !== 'all' && t.tier !== selectedTier) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = t.name.toLowerCase().includes(q) || (t.vietnameseName && t.vietnameseName.toLowerCase().includes(q));
          const matchCouple = `${t.couple.groom} ${t.couple.bride}`.toLowerCase().includes(q);
          const matchLocation = t.couple.location.toLowerCase().includes(q);
          const matchCategory = t.category.toLowerCase().includes(q);
          if (!matchName && !matchCouple && !matchLocation && !matchCategory) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.views - a.views;
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'vi');
        if (sortBy === 'newest') return (b.badge === 'MỚI' ? 1 : 0) - (a.badge === 'MỚI' ? 1 : 0);
        return 0;
      });
  }, [templates, selectedLayout, selectedTier, searchQuery, sortBy]);

  // Layout switcher tabs metadata
  const layoutTabs: { id: FilterLayout; label: string; count: number }[] = [
    { id: 'all', label: 'Tất cả', count: templates.length },
    { id: 'full-bleed', label: 'Full Bleed Overlay', count: templates.filter((t) => t.layoutType === 'full-bleed').length },
    { id: 'arch', label: 'The Elegant Arch', count: templates.filter((t) => t.layoutType === 'arch').length },
    { id: 'collage', label: 'Editorial Collage', count: templates.filter((t) => t.layoutType === 'collage').length },
    { id: 'minimalist', label: 'Modern Minimalist', count: templates.filter((t) => t.layoutType === 'minimalist').length },
    { id: 'envelope', label: 'Envelope & Seal', count: templates.filter((t) => t.layoutType === 'envelope').length },
  ];

  // Dynamic Layout Renderer
  const renderCard = (template: WeddingTemplate) => {
    const props = {
      key: template.id,
      template,
      onPreview: (tpl: WeddingTemplate) => setPreviewTemplate(tpl),
      onSelect: (tpl: WeddingTemplate) => onSelectTemplate?.(tpl),
      isFavorite: favorites.has(template.id),
      onToggleFavorite: handleToggleFavorite,
    };

    switch (template.layoutType) {
      case 'full-bleed':
        return <FullBleedOverlayCard {...props} />;
      case 'arch':
        return <ElegantArchCard {...props} />;
      case 'collage':
        return <EditorialCollageCard {...props} />;
      case 'minimalist':
        return <ModernMinimalistCard {...props} />;
      case 'envelope':
        return <EnvelopeSealCard {...props} />;
      default:
        return <FullBleedOverlayCard {...props} />;
    }
  };

  return (
    <section className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 ${className}`}>
      {/* Header section with refined editorial typography */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[11px] font-medium tracking-[0.35em] uppercase text-stone-400">
          WEDSTORY DESIGN COLLECTION
        </span>
        <h2 className="mt-2 text-3xl sm:text-4xl font-serif font-normal text-stone-900 tracking-tight">
          Bộ Sưu Tập Mẫu Thiệp Mới
        </h2>
        <p className="mt-3 text-sm text-stone-500 font-light leading-relaxed">
          Tập trung vào nhiếp ảnh nghệ thuật (photo-centric), bố cục thanh lịch và typography tinh tế. 
          Không viền thô, không nền chói — tôn vinh trọn vẹn câu chuyện tình yêu của hai bạn.
        </p>
      </div>

      {/* Control Bar: Layout Tabs */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2 pb-4 mb-6">
        {layoutTabs.map((tab) => {
          const isActive = selectedLayout === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedLayout(tab.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-stone-200/80 text-stone-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Search, Tier, and Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/60">
        {/* Search input */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="7" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên mẫu, tên cặp đôi, địa điểm..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-white rounded-xl border border-stone-200/80 text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2.5">
          {/* Tier filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as any)}
            className="text-xs bg-white px-3 py-2 rounded-xl border border-stone-200/80 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
          >
            <option value="all">Tất cả gói</option>
            <option value="basic">Gói Basic</option>
            <option value="premium">Gói Premium</option>
          </select>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs bg-white px-3 py-2 rounded-xl border border-stone-200/80 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="newest">Mới nhất</option>
            <option value="name">Tên A – Z</option>
          </select>
        </div>
      </div>

      {/* Results Count & Active Filter Information */}
      <div className="flex items-center justify-between text-xs text-stone-500 mb-6 px-1">
        <span>
          Đang hiển thị <b>{filteredTemplates.length}</b> / {templates.length} mẫu thiệp
        </span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-stone-400 hover:text-stone-700 underline text-xs"
          >
            Xóa tìm kiếm
          </button>
        )}
      </div>

      {/* The 20 Templates Grid */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {filteredTemplates.map((template) => renderCard(template))}
        </div>
      ) : (
        <div className="py-20 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
          <p className="text-sm text-stone-500 font-light">Không tìm thấy mẫu thiệp nào phù hợp.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedLayout('all');
              setSelectedTier('all');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-stone-800 underline font-medium"
          >
            Đặt lại tất cả bộ lọc
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULLSCREEN PREVIEW MODAL */}
      {/* ========================================================= */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              aria-label="Đóng xem trước"
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-stone-700 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {/* Left: The Card Preview Component */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 bg-stone-100 flex items-center justify-center overflow-y-auto">
              <div className="w-full max-w-[320px] shadow-xl rounded-2xl md:rounded-3xl overflow-hidden">
                {renderCard(previewTemplate)}
              </div>
            </div>

            {/* Right: Template Details & Action */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-medium tracking-wider uppercase text-stone-600">
                    {previewTemplate.category}
                  </span>
                  <span className="text-xs text-stone-400">
                    👁 {previewTemplate.views.toLocaleString('vi-VN')} lượt xem
                  </span>
                </div>

                <h3 className="text-2xl font-serif font-normal text-stone-900">
                  {previewTemplate.name}
                </h3>
                {previewTemplate.vietnameseName && (
                  <p className="text-xs text-stone-500 font-light mt-0.5">
                    {previewTemplate.vietnameseName}
                  </p>
                )}

                <div className="mt-6 space-y-3 border-y border-stone-100 py-4 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span className="text-stone-400">Cấu trúc Base Layout:</span>
                    <span className="font-medium uppercase tracking-wider text-stone-800">
                      {previewTemplate.layoutType}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span className="text-stone-400">Cặp đôi mẫu:</span>
                    <span className="font-medium">
                      {previewTemplate.couple.groom} &amp; {previewTemplate.couple.bride}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span className="text-stone-400">Ngày cưới:</span>
                    <span className="font-medium">{previewTemplate.couple.dateFormatted}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span className="text-stone-400">Địa điểm:</span>
                    <span className="font-medium text-right truncate max-w-[200px]">
                      {previewTemplate.couple.location}
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <span className="text-[10px] font-medium uppercase tracking-widest text-stone-400">
                    Đặc điểm thiết kế:
                  </span>
                  <ul className="mt-2 space-y-1 text-xs text-stone-600 list-disc list-inside font-light">
                    <li>Ảnh chụp chất lượng cao, tỉ lệ dọc chuẩn điện thoại</li>
                    <li>Phân cấp typography: Tiêu đề serif sang trọng, sans mỏng hiện đại</li>
                    <li>Không viền thô, bảng màu nền pastel trung tính thanh lịch</li>
                  </ul>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    onSelectTemplate?.(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 rounded-full bg-stone-900 py-3 px-6 text-xs font-medium tracking-wider uppercase text-white hover:bg-stone-800 transition shadow-md"
                >
                  Sử dụng mẫu này
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleFavorite(previewTemplate.id);
                  }}
                  className="rounded-full border border-stone-200 py-3 px-5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition flex items-center justify-center gap-1.5"
                >
                  <svg
                    className={`h-4 w-4 ${
                      favorites.has(previewTemplate.id) ? 'fill-rose-500 text-rose-500' : 'fill-none stroke-current'
                    }`}
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>{favorites.has(previewTemplate.id) ? 'Đã thích' : 'Yêu thích'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

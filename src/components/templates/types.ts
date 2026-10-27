export type LayoutType = 
  | 'full-bleed' 
  | 'arch' 
  | 'collage' 
  | 'minimalist' 
  | 'envelope';

export interface CoupleInfo {
  groom: string;
  bride: string;
  date: string;              // ISO date format YYYY-MM-DD
  dateFormatted: string;     // E.g. "OCTOBER 24, 2026" or "24 . 10 . 2026"
  dayOfWeek?: string;        // E.g. "THỨ BẢY" or "SATURDAY"
  location: string;          // E.g. "Amanoi Resort, Ninh Thuận"
  city?: string;             // E.g. "Ninh Thuận"
  coordinates?: string;      // E.g. "11.7058° N, 109.1837° E"
}

export interface TemplateImages {
  main: string;              // Primary high-res photo URL
  secondary?: string;        // Secondary photo for collage/envelope
  tertiary?: string;         // Detail shot for collage (rings, flowers, etc.)
  alt?: string;
}

export interface TemplateStyling {
  bgColor: string;           // E.g. "bg-stone-50", "bg-[#FDFBF7]", "bg-[#F8F9FA]"
  textColor: string;         // Main text color class e.g. "text-stone-900" or "text-white"
  subtextColor?: string;      // Muted info color class e.g. "text-stone-500" or "text-white/80"
  accentColor?: string;       // Hex or CSS color for highlights e.g. "#A38F78"
  fontSerifClass?: string;   // Custom serif class or default "font-serif"
  fontSansClass?: string;    // Custom sans class or default "font-sans"
  gradientOverlay?: string;  // For full-bleed cards (e.g. "from-stone-950/85 via-stone-950/30 to-black/20")
  archBorderColor?: string;  // Subtle arch outline
  sealColor?: string;        // Hex for wax seal (e.g. "#7B2D26", "#8F764F", "#3B4E3E", "#A06B52")
  sealMonogram?: string;     // Monogram text for wax seal (e.g. "H & M")
  aspectRatio?: string;      // "aspect-[3/4]" (default) or "aspect-[9/16]"
}

export interface WeddingTemplate {
  id: string;
  name: string;              // E.g. "L'Amour Crépuscule"
  vietnameseName?: string;   // E.g. "Ánh Chiều Lãng Mạn"
  layoutType: LayoutType;
  category: string;          // "Tối giản" | "Editorial" | "Cổ điển" | "Lãng mạn" | "Mộc mạc"
  tier?: 'basic' | 'premium';
  badge?: 'HOT' | 'MỚI' | 'SIGNATURE' | 'PHỔ BIẾN';
  views: number;
  tagline?: string;          // E.g. "SAVE THE DATE", "THE WEDDING CELEBRATION"
  couple: CoupleInfo;
  images: TemplateImages;
  styling: TemplateStyling;
}

export interface BaseLayoutCardProps {
  template: WeddingTemplate;
  onPreview?: (template: WeddingTemplate) => void;
  onSelect?: (template: WeddingTemplate) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (templateId: string) => void;
}

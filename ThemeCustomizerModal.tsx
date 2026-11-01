import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Check,
  Image as ImageIcon,
  Sliders,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ThemeSettings,
  CURATED_WALLPAPERS,
  saveThemeSettings,
} from '../utils/themeManager';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ThemeSettings;
  onUpdateSettings: (settings: ThemeSettings) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onUpdateSettings,
}) => {
  const [settings, setSettings] = useState<ThemeSettings>(currentSettings);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleSelectWallpaper = (url: string, name: string, sizeMb: number) => {
    const updated: ThemeSettings = {
      ...settings,
      wallpaperEnabled: true,
      wallpaperUrl: url,
      wallpaperName: name,
      wallpaperSizeMb: sizeMb,
      overlayOpacity: 0.05, // mờ 5%
    };
    setSettings(updated);
    saveThemeSettings(updated);
    onUpdateSettings(updated);
  };

  const handleToggleEnabled = (enabled: boolean) => {
    const updated: ThemeSettings = {
      ...settings,
      wallpaperEnabled: enabled,
      overlayOpacity: 0.05,
    };
    setSettings(updated);
    saveThemeSettings(updated);
    onUpdateSettings(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadNotice(null);

    const sizeInMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));

    // Check maximum 4096MB limit
    if (sizeInMb > 4096) {
      setUploadError(`File ảnh vượt quá giới hạn tối đa 4096MB (${sizeInMb} MB). Vui lòng chọn ảnh dưới 4096MB.`);
      return;
    }

    if (sizeInMb < 20) {
      setUploadNotice(`Ảnh có dung lượng ${sizeInMb} MB (khuyến nghị chuẩn từ 20MB đến 4096MB để đạt độ nét Ultra-HD). Hệ thống đã áp dụng thành công!`);
    } else {
      setUploadNotice(`Đã tải thành công ảnh nền chất lượng cao: ${sizeInMb} MB (nằm trong chuẩn 20MB - 4096MB).`);
    }

    const objectUrl = URL.createObjectURL(file);
    const updated: ThemeSettings = {
      ...settings,
      wallpaperEnabled: true,
      wallpaperUrl: objectUrl,
      wallpaperName: file.name.slice(0, 24),
      wallpaperSizeMb: sizeInMb,
      overlayOpacity: 0.05,
    };
    setSettings(updated);
    saveThemeSettings(updated);
    onUpdateSettings(updated);
  };

  const scrollHorizontally = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-purple-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Giao Diện & Hình Nền Chủ Đề</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                  Lớp mờ 5% tinh tế
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Tùy chỉnh hình nền sắc nét (20MB - 4096MB) & lớp phủ mờ trong suốt 5%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200/80 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Wallpaper Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 block">
                Bật hình nền chủ đề toàn màn hình
              </span>
              <span className="text-[11px] text-slate-500 block">
                Áp dụng hình nền chất lượng cao và làm mờ 5% giao diện (kể cả ô mục lục).
              </span>
            </div>
            <button
              onClick={() => handleToggleEnabled(!settings.wallpaperEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                settings.wallpaperEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          {/* Curated Wallpapers with Horizontal Scroll ("kéo thanh ngang ở chủ đề") */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                <span>Kho Ảnh Nền Ultra-HD Chủ Đề (Kéo Thanh Ngang)</span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollHorizontally('left')}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Cuộn sang trái"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollHorizontally('right')}
                  className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                  title="Cuộn sang phải"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Horizontal Scroll Bar */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-3 pb-3 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-slate-100 snap-x"
              style={{ scrollBehavior: 'smooth' }}
            >
              {CURATED_WALLPAPERS.map((wp) => {
                const isSelected = settings.wallpaperUrl === wp.url && settings.wallpaperEnabled;
                return (
                  <div
                    key={wp.id}
                    onClick={() => handleSelectWallpaper(wp.url, wp.name, wp.approxSizeMb)}
                    className={`shrink-0 w-60 rounded-2xl border-2 cursor-pointer transition-all overflow-hidden snap-start group relative ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-300 shadow-md scale-[1.01]'
                        : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="h-28 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={wp.url}
                        alt={wp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* 80% opacity simulated overlay */}
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px]" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[9px] font-bold">
                        ~{wp.approxSizeMb} MB
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3 bg-white">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{wp.name}</h4>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5">
                        <span>{wp.category}</span>
                        <span className="font-semibold text-emerald-600">Độ nét cao</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upload Custom Wallpaper (20MB to 4096MB) */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Tải Ảnh Nền Tùy Chọn (Hỗ Trợ 20MB Đến 4096MB)</span>
            </label>

            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 hover:bg-slate-50 transition-colors text-center space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 mx-auto shadow-sm transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Chọn tệp ảnh nền từ thiết bị</span>
              </button>
              <div className="text-[11px] text-slate-500">
                <span>Hỗ trợ tệp ảnh PNG, JPG, WEBP • Khung dung lượng: </span>
                <strong className="text-indigo-700">20MB – 4096MB (4GB)</strong>
              </div>

              {settings.wallpaperSizeMb && (
                <div className="text-[11px] font-mono font-bold text-slate-700 bg-white inline-block px-3 py-1 rounded-lg border border-slate-200">
                  Dung lượng ảnh hiện tại: {settings.wallpaperSizeMb} MB
                </div>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{uploadNotice}</span>
              </div>
            )}
          </div>

          {/* Opacity Specification Rule Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs space-y-1.5 text-indigo-950">
            <div className="font-extrabold flex items-center gap-1.5 text-indigo-900">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Quy Chuẩn Hiển Thị Mờ 80% (Frosted Opacity)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-indigo-800">
              Khi bật hình nền, toàn bộ giao diện bài thi, các thẻ học tập và đặc biệt <strong>ô mục lục (Bảng câu hỏi)</strong> đều được làm mờ đúng chuẩn <strong>80% (opacity 0.80)</strong> kèm hiệu ứng làm mờ nhẹ (backdrop-blur), bảo đảm hình nền hiện rõ nét mà chữ và câu hỏi vẫn sáng rõ 100%.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="text-xs text-slate-500 font-medium truncate max-w-xs">
            Đang áp dụng: <strong className="text-slate-800">{settings.wallpaperName}</strong>
          </div>
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Áp Dụng & Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

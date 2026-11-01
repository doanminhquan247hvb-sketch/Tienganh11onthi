import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  FileQuestion,
  Sparkles,
  BarChart3,
  Users,
  Settings,
  Flame,
  Award,
  Trash2,
  CheckCircle2,
  ChevronDown,
  FileText,
  Zap,
  Database,
  Sliders,
  Grid,
} from 'lucide-react';
import { StudentProfile } from '../types';
import { getEloTier, getTierColor } from '../utils/elo';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  profile: StudentProfile;
  isParentMode: boolean;
  onToggleParentMode: (isParent: boolean) => void;
  onResetData: () => void;
  onOpenThemeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  isParentMode,
  onToggleParentMode,
  onResetData,
  onOpenThemeModal,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const studentElo = profile.elo ?? 1300;
  const studentTier = getEloTier(studentElo);
  const tierColor = getTierColor(studentTier);

  const navItems = [
    { id: 'dashboard', label: 'Trang chủ', icon: BarChart3 },
    { id: 'exam_generator', label: 'Tạo đề thi thử', icon: FileQuestion },
    { id: 'question_bank', label: 'Ngân hàng câu hỏi', icon: Database },
    { id: 'word_form', label: 'Word Form 8 từ', icon: FileText },
    { id: 'units', label: 'Ôn theo Unit', icon: BookOpen },
    { id: 'vocabulary', label: 'Từ vựng & Flashcards', icon: Sparkles },
    { id: 'grammar', label: 'Ngữ pháp', icon: GraduationCap },
    { id: 'ai_tutor', label: 'Gia sư AI 11', icon: Sparkles },
    { id: 'minigame', label: 'Ghép hình 6x6', icon: Grid },
    { id: 'iq_arena', label: 'Đấu trường IQ (+16 ELO)', icon: Flame },
    { id: 'mistakes', label: 'Sửa lỗi & Kế hoạch', icon: Award },
    { id: 'parent', label: 'Phụ huynh', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs">
      {/* Top Banner Notice for AI & Global Success Alignment */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-indigo-100 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="bg-indigo-700/80 text-white font-semibold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
            Global Success 11
          </span>
          <span className="hidden sm:inline">
            Hệ thống ôn thi Tiếng Anh THPT chuẩn chương trình Bộ GD&ĐT • Tích hợp Gia sư AI thông minh
          </span>
          <span className="sm:hidden">Ôn thi Tiếng Anh 11 Global Success</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[11px] border border-amber-300/30">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>{studentElo} ELO • Hạng {studentTier}</span>
          </div>
          <div className="h-3 w-px bg-indigo-700 hidden sm:block"></div>
          <div className="hidden md:flex items-center gap-1.5 text-amber-300 font-medium text-[11px]">
            <Flame className="w-3.5 h-3.5 fill-amber-300" />
            <span>Chuỗi 5 ngày học</span>
          </div>
          <div className="h-3 w-px bg-indigo-700 hidden sm:block"></div>
          <button
            onClick={() => onToggleParentMode(!isParentMode)}
            className={`text-[11px] px-2 py-0.5 rounded-full transition-colors flex items-center gap-1 font-medium ${
              isParentMode
                ? 'bg-amber-400 text-amber-950 font-bold'
                : 'bg-indigo-700/60 hover:bg-indigo-700 text-indigo-200'
            }`}
          >
            <Users className="w-3 h-3" />
            {isParentMode ? 'Đang ở Cổng Phụ huynh' : 'Chuyển sang Phụ huynh'}
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent tracking-tight">
                  English Master 11
                </span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded-md">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Ôn thi Giữa kì • Cuối kì • THPT</p>
            </div>
          </div>

          {/* Desktop Nav Items with Horizontal Scrollbar */}
          <div className="hidden lg:flex items-center max-w-2xl overflow-x-auto py-2 px-1 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-slate-100 snap-x">
            <nav className="flex items-center space-x-1.5 shrink-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all snap-start ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200/60 font-bold'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User Profile / Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Theme & Wallpaper Button */}
            {onOpenThemeModal && (
              <button
                type="button"
                onClick={onOpenThemeModal}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-purple-200 hover:border-purple-400 bg-purple-50 hover:bg-purple-100/80 text-purple-700 transition-all flex items-center gap-1.5 shadow-2xs text-xs font-bold"
                title="Tùy chỉnh màu chủ đề & hình nền mờ 80% (Hỗ trợ 20MB - 4096MB)"
              >
                <Sliders className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline">Hình nền (Mờ 80%)</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-gray-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/40 transition-all text-left shadow-2xs"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {profile.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-gray-800 leading-tight">{profile.name}</div>
                  <div className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{studentElo} ELO • {studentTier}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 px-4 z-50 text-xs">
                  <div className="pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-gray-900 text-sm">{profile.name}</p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">
                        {studentTier}
                      </span>
                    </div>
                    <p className="text-gray-500">{profile.grade} • {studentElo} ELO (Thang 0-2000)</p>
                    <div className="mt-2 bg-indigo-50 text-indigo-800 p-2 rounded-lg flex items-center justify-between">
                      <span className="font-medium text-[11px]">Mã liên kết phụ huynh:</span>
                      <code className="font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                        {profile.pairingCode}
                      </code>
                    </div>
                  </div>

                  <div className="py-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onSelectTab('dashboard');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-gray-700 font-medium"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      Tiến độ học tập cá nhân
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onToggleParentMode(true);
                        onSelectTab('parent');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-gray-700 font-medium"
                    >
                      <Users className="w-4 h-4 text-purple-600" />
                      Mở Cổng theo dõi cho Phụ huynh
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowResetConfirm(true);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa dữ liệu & Đặt lại (Quyền riêng tư)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav Scrollbar */}
        <div className="lg:hidden flex overflow-x-auto py-2 space-x-1.5 no-scrollbar border-t border-gray-100">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Xóa toàn bộ dữ liệu học tập?</h3>
              <p className="text-xs text-gray-500">
                Theo chính sách bảo mật quyền riêng tư của học sinh, hành động này sẽ xóa lịch sử bài thi, phân tích lỗi sai và đưa ứng dụng về trạng thái mặc định.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 font-semibold text-white text-xs shadow-md shadow-red-200"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

import React from 'react';
import {
  Trophy,
  Flame,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Brain,
  HelpCircle,
  FileQuestion,
  Users,
} from 'lucide-react';
import { StudentProfile, UserExamSubmission, UnitInfo } from '../types';
import { GLOBAL_SUCCESS_UNITS, PRESET_EXAMS } from '../data/curriculum';

interface StudyDashboardProps {
  profile: StudentProfile;
  recentSubmissions: UserExamSubmission[];
  onNavigateTab: (tab: string) => void;
  onStartExam: (title: string, presetId: string) => void;
}

export const StudyDashboard: React.FC<StudyDashboardProps> = ({
  profile,
  recentSubmissions,
  onNavigateTab,
  onStartExam,
}) => {
  const latestSubmission = recentSubmissions[0];
  const studyHours = (profile.totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Kỳ ôn thi Giữa kì & Cuối kì THPT</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Chào mừng trở lại, <span className="text-amber-300">{profile.name}</span>!
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Hôm nay bạn muốn ôn tập phần nào? Gia sư AI đã chuẩn bị sẵn bộ đề thi thử bám sát chương trình{' '}
            <strong className="text-white">Global Success 11</strong> giúp bạn tự tin đạt điểm {profile.targetScore}+.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('exam_generator')}
              className="py-3 px-5 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <FileQuestion className="w-4 h-4 text-indigo-600" />
              <span>Tạo Đề Thi Thử Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onNavigateTab('ai_tutor')}
              className="py-3 px-5 rounded-2xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
            >
              <Brain className="w-4 h-4 text-amber-300" />
              <span>Hỏi Gia Sư AI (Cô Lan)</span>
            </button>
          </div>
        </div>

        {/* Decorative background art */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-600/30 to-transparent pointer-events-none hidden md:block" />
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 4 Key Metrics Bar including ELO */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: ELO Rating */}
        <div className="p-5 rounded-3xl bg-white border border-indigo-200/90 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span className="text-indigo-900 font-extrabold flex items-center gap-1">
              <span>Điểm ELO Học Lực</span>
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              ⚡
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 flex items-baseline gap-1.5">
            <span>{profile.elo ?? 1300}</span>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Hạng {profile.elo && profile.elo < 500 ? 'A0' : profile.elo && profile.elo < 1000 ? 'A1' : profile.elo && profile.elo < 1300 ? 'A2' : profile.elo && profile.elo < 1500 ? 'B1' : profile.elo && profile.elo < 1700 ? 'B2' : 'B2+'}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 font-medium">
            Khởi điểm 1300 • Thang 0-2000
          </div>
        </div>

        {/* Metric 2: Average Score */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Điểm trung bình</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {profile.averageScore}
            <span className="text-xs font-normal text-gray-400">/10</span>
          </div>
          <div className="text-[11px] text-green-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mục tiêu: {profile.targetScore}/10
          </div>
        </div>

        {/* Metric 3: Completed Tests */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Bài thi hoàn thành</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {profile.completedTestsCount}
            <span className="text-xs font-normal text-gray-400"> đề</span>
          </div>
          <div className="text-[11px] text-indigo-600 font-semibold">
            Giữa kì & Chuyên đề
          </div>
        </div>

        {/* Metric 4: Study Time */}
        <div className="p-5 rounded-3xl bg-white border border-gray-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold">
            <span>Thời gian học</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900">
            {studyHours}
            <span className="text-xs font-normal text-gray-400"> giờ</span>
          </div>
          <div className="text-[11px] text-purple-600 font-semibold">
            {profile.totalStudyMinutes} phút tích lũy
          </div>
        </div>
      </div>

      {/* Special Highlights Bar: Word Form 8 words & Midterm Exam */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner 1: Đề thi Giữa Kì Chuẩn Ma Trận Mới */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 font-black text-[10px] uppercase tracking-wider inline-block">
              Chuẩn Đề Giữa Kì 11 Mới (10 điểm)
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Đề Thi Giữa Kì I (40 câu - 45 phút)
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              • 30 câu trắc nghiệm (7,5đ): 4 phát âm/nhấn âm, 18 câu thường, 3 câu sắp xếp, 3 câu bài đọc, 2 câu tư vấn<br />
              • 4 câu chia thì (1,0đ) + 4 câu Word Form 8 từ bảng (1,0đ) + 2 câu sắp xếp Modal Verbs (0,5đ).
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-amber-300 font-bold">
              ⚡ Tự động tính điểm ELO
            </span>
            <button
              onClick={() => onStartExam('Đề thi thử Giữa kì I (Chuẩn 40 câu ma trận mới)', 'exam-midterm-1')}
              className="py-2 px-4 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Vào thi ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Banner 2: Word Form 8 Từ Bảng */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 to-slate-900 text-white flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-2">
            <span className="px-2.5 py-1 rounded-full bg-purple-300 text-purple-950 font-black text-[10px] uppercase tracking-wider inline-block">
              Trọng tâm 8 từ trên bảng
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              Word Form: Danh - Động - Tính - Trạng
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Ôn tập 4 dạng từ của 8 từ: <strong>exhibition, efficient, sustain, renewable, interact, security, organize, advantage</strong> kèm bài tập tự luyện và mẹo nhận diện đuôi từ.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs text-purple-300 font-bold">
              Có sẵn trong đề thi Giữa kì
            </span>
            <button
              onClick={() => onNavigateTab('word_form')}
              className="py-2 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span>Mở Word Form 8 từ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Exam & Weak Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Quick Exam Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
              <FileQuestion className="w-5 h-5 text-indigo-600" />
              Đề Thi Trọng Tâm Bạn Nên Làm Ngay
            </h2>
            <button
              onClick={() => onNavigateTab('exam_generator')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PRESET_EXAMS.slice(0, 6).map((exam) => (
              <div
                key={exam.id}
                className="p-5 rounded-3xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {exam.examType === 'midterm'
                        ? 'Đề Giữa Kì'
                        : exam.examType === 'final'
                        ? 'Đề Cuối Kì'
                        : 'Kiểm tra nhanh'}
                    </span>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {exam.durationMinutes} phút
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {exam.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">
                    {exam.questionCount} câu • Chuẩn THPT
                  </span>
                  <button
                    onClick={() => onStartExam(exam.title, exam.id)}
                    className="py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-1"
                  >
                    Bắt đầu thi
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Units Progress Matrix */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                  Lộ Trình 10 Unit - Tiếng Anh 11 Global Success
                </h3>
                <p className="text-xs text-gray-500">
                  Chọn Unit để học từ vựng flashcards và lý thuyết ngữ pháp
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('units')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                Mở chi tiết
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {GLOBAL_SUCCESS_UNITS.map((unit) => (
                <button
                  key={unit.number}
                  onClick={() => onNavigateTab('units')}
                  className="p-3 rounded-2xl border border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition-all group"
                >
                  <div className="text-xs font-black text-indigo-600 group-hover:scale-105 transition-transform">
                    Unit {unit.number}
                  </div>
                  <div className="text-[11px] font-bold text-gray-800 truncate mt-0.5">
                    {unit.title}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                    {unit.vietnameseTitle}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Weak Topics (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Weak Topics Alert */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-white rounded-3xl border border-purple-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-purple-900 font-extrabold text-xs uppercase tracking-wider">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>Gia Sư AI Phân Tích Điểm Yếu</span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Dựa vào các bài thi gần đây, đây là 3 chủ đề bạn hay bị nhầm lẫn nhất:
            </p>

            <div className="space-y-2">
              {profile.weakTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-white border border-purple-100 shadow-2xs flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                    !
                  </span>
                  <div className="text-xs">
                    <div className="font-bold text-gray-900">{topic}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Cần xem lại công thức & luyện 10 câu</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab('mistakes')}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Tạo Lịch Ôn Tập Khắc Phục</span>
            </button>
          </div>

          {/* Recent Exam History */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                Lịch Sử Làm Bài Gần Nhất
              </h3>
            </div>

            <div className="space-y-3">
              {recentSubmissions.slice(0, 3).map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 max-w-[160px]">
                    <div className="font-bold text-gray-800 truncate">{sub.examTitle}</div>
                    <div className="text-[10px] text-gray-500">
                      {sub.correctCount}/{sub.totalQuestions} câu đúng
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-600">
                      {sub.scoreOutOf10}
                    </span>
                    <span className="text-[10px] text-gray-400">/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Parent Portal card */}
          <div className="p-5 rounded-3xl bg-indigo-900 text-white space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Dành Cho Phụ Huynh
              </span>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {profile.pairingCode}
              </span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Phụ huynh có thể theo dõi biểu đồ tiến bộ, thời gian học và nhận xét từ gia sư AI qua cổng phụ huynh an toàn.
            </p>
            <button
              onClick={() => onNavigateTab('parent')}
              className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors"
            >
              Mở Cổng Phụ Huynh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

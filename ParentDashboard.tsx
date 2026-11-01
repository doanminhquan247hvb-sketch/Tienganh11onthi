import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Clock,
  BookOpen,
  Trophy,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Share2,
  Printer,
  Copy,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StudentProfile, UserExamSubmission } from '../types';
import { getEloTier, getTierNameVi } from '../utils/elo';

interface ParentDashboardProps {
  profile: StudentProfile;
  submissions: UserExamSubmission[];
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  profile,
  submissions,
}) => {
  const [pairingInput, setPairingInput] = useState<string>(profile.pairingCode);
  const [isLinked, setIsLinked] = useState<boolean>(true);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const studentElo = profile.elo ?? 1300;
  const studentTier = getEloTier(studentElo);
  const tierName = getTierNameVi(studentTier);

  const totalMinutes = profile.totalStudyMinutes;
  const hours = (totalMinutes / 60).toFixed(1);
  const avgScore = profile.averageScore;
  const testCount = profile.completedTestsCount;

  // Recent 5 scores for trend line
  const recentScores = [...submissions].reverse().slice(-5);

  const handleCopyReport = () => {
    const reportText = `[BÁO CÁO TIẾN ĐỘ HỌC TẬP TIẾNG ANH 11 - GLOBAL SUCCESS]
Học sinh: ${profile.name} (${profile.grade})
Điểm ELO học lực: ${studentElo}/2000 (Xếp hạng ${studentTier} - ${tierName})
Mục tiêu điểm số: ${profile.targetScore}/10
Điểm trung bình hiện tại: ${profile.averageScore}/10
Tổng số bài kiểm tra đã hoàn thành: ${profile.completedTestsCount} đề
Tổng thời gian tự học: ${hours} giờ (${totalMinutes} phút)

Chuyên đề trọng tâm Word Form 8 từ bảng: Đã hoàn thành ôn tập Danh - Động - Tính - Trạng.

Chủ đề học tốt:
${profile.strongTopics.map((s) => `• ${s}`).join('\n')}

Chủ đề cần gia đình và thầy cô hỗ trợ củng cố:
${profile.weakTopics.map((w) => `• ${w}`).join('\n')}

Đánh giá: Học sinh duy trì phong độ học tập đều đặn, đã cải thiện kĩ năng làm bài trắc nghiệm nhanh.`;

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleLinkAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (pairingInput.trim().toUpperCase() === profile.pairingCode) {
      setIsLinked(true);
    } else {
      alert('Mã ghép nối không chính xác. Vui lòng kiểm tra lại mã trên tài khoản của học sinh.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Privacy & Authorization Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
            <ShieldCheck className="w-4 h-4" />
            Cổng Phụ Huynh Bảo Mật • Quyền Riêng Tư Học Sinh
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Theo Dõi Tiến Trình Học Tiếng Anh 11 Của Con
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-xl leading-relaxed">
            Xem thời gian ôn luyện thực tế, kết quả thi thử giữa kì & cuối kì, các chuyên đề còn yếu để cùng đồng hành giúp con tự tin đạt điểm cao.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleCopyReport}
            className="py-2.5 px-4 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-md"
          >
            {copiedReport ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedReport ? 'Đã sao chép báo cáo!' : 'Sao chép báo cáo Zalo'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/15"
          >
            <Printer className="w-4 h-4" />
            <span>In báo cáo</span>
          </button>
        </div>
      </div>

      {/* Account Pairing Verification Banner */}
      {!isLinked ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-xs text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Liên Kết Tài Khoản Của Con</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Để bảo vệ thông tin cá nhân của học sinh, phụ huynh cần nhập Mã Ghép Nối hiển thị trên ứng dụng của con.
          </p>
          <form onSubmit={handleLinkAccount} className="space-y-3">
            <input
              type="text"
              placeholder="Nhập mã, ví dụ: EM11-8629"
              value={pairingInput}
              onChange={(e) => setPairingInput(e.target.value)}
              className="w-full text-center py-3 px-4 rounded-xl border border-gray-300 font-mono font-bold text-sm uppercase tracking-wider"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md"
            >
              Xác Nhận & Xem Kết Quả
            </button>
          </form>
        </div>
      ) : (
        <>
          {/* Student Info Bar */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-gray-900">{profile.name}</h2>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {profile.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Mã ghép nối: <strong className="font-mono text-gray-700">{profile.pairingCode}</strong> • Trạng thái: Đã xác thực
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-gray-400">Mục tiêu học tập</div>
              <div className="text-lg font-black text-indigo-600">{profile.targetScore}/10 điểm</div>
            </div>
          </div>

          {/* 4 Performance Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Điểm trung bình</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-gray-900">{avgScore}</div>
              <div className="text-[11px] text-green-600 font-semibold">
                Đạt 91% so với mục tiêu
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Thời gian tự học</span>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-black text-gray-900">{hours} giờ</div>
              <div className="text-[11px] text-purple-600 font-semibold">
                ~{totalMinutes} phút làm bài & học từ
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Đề thi hoàn thành</span>
                <BookOpen className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-3xl font-black text-gray-900">{testCount}</div>
              <div className="text-[11px] text-indigo-600 font-semibold">
                Bao gồm Giữa kì & 15 phút
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-gray-400 text-xs">
                <span>Xu hướng tiến bộ</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600">+1.0</div>
              <div className="text-[11px] text-emerald-600 font-semibold">
                Tăng từ 8.0 lên 9.0 điểm
              </div>
            </div>
          </div>

          {/* Progress Chart & Strength/Weakness Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Progress Trend (7 cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900">
                    Biểu Đồ Tiến Bộ Theo Bài Kiểm Tra
                  </h3>
                  <p className="text-xs text-gray-500">
                    Theo dõi sự thay đổi điểm số qua các lần làm đề thi thử
                  </p>
                </div>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  Đang tiến bộ tốt
                </span>
              </div>

              {/* Simple Clean Bar Chart Representation */}
              <div className="pt-6 space-y-4">
                <div className="h-48 flex items-end justify-between gap-4 border-b border-gray-200 pb-2 px-2">
                  {recentScores.map((sub, idx) => {
                    const heightPct = Math.round((sub.scoreOutOf10 / 10) * 100);
                    return (
                      <div key={sub.id} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-xs font-black text-indigo-600 opacity-90 group-hover:scale-110 transition-transform">
                          {sub.scoreOutOf10}
                        </span>
                        <div
                          className="w-full max-w-[42px] rounded-t-xl bg-gradient-to-t from-indigo-600 to-purple-500 transition-all group-hover:opacity-90 shadow-2xs"
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[10px] text-gray-500 truncate w-full text-center">
                          Lần {idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 px-2">
                  <span>Bài thi đầu tiên</span>
                  <span>Bài thi gần nhất</span>
                </div>
              </div>

              {/* Notification Box */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Thông báo gửi phụ huynh:</span>
                </div>
                <p className="text-amber-800 leading-relaxed">
                  Con đã hoàn thành đề thi Giữa kì I với kết quả 9.0/10. Con đã nắm rất chắc từ vựng và ngữ âm, cần duy trì làm thêm 1 đề mỗi tuần trước kì thi chính thức.
                </p>
              </div>
            </div>

            {/* Right: Weakness & Pre-exam Plan (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Weak Topics */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  Chủ Đề Con Cần Củng Cố Thêm
                </h3>

                <div className="space-y-2.5">
                  {profile.weakTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl border border-rose-100 bg-rose-50/40 text-xs space-y-1"
                    >
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        {topic}
                      </div>
                      <p className="text-[11px] text-gray-500 pl-3.5">
                        Hay mắc lỗi ở câu trắc nghiệm dạng vận dụng
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Thế Mạnh Nổi Bật Của Con
                </h3>

                <div className="space-y-2">
                  {profile.strongTopics.map((st, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl border border-green-100 bg-green-50/40 text-xs font-bold text-green-900 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Exam Countdown Plan */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100 p-6 space-y-3">
                <div className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Lịch Ôn Tập Gợi Ý Cho Gia Đình
                </div>
                <div className="text-xs text-gray-700 space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-indigo-100/60">
                    <span className="font-semibold">Thứ 3 & Thứ 5:</span>
                    <span>15 phút ôn Flashcard từ vựng</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-indigo-100/60">
                    <span className="font-semibold">Thứ 7:</span>
                    <span>Làm 1 bài thi thử 45 phút</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold">Chủ nhật:</span>
                    <span>Hỏi Gia sư AI chữa các câu sai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Clock,
  Layers,
  CheckCircle,
  AlertCircle,
  BookOpen,
  ArrowRight,
  Zap,
  Target,
  RefreshCw,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Question, ExamCategoryMode, GradeLevel, BookSeries } from '../types';
import { getStoredQuestionBank } from '../services/storage';
import {
  generateExamWithDeduplication,
  clearUsedQuestionFingerprints,
  getUsedQuestionFingerprints,
  generateRandomizedMidtermExam,
  generateBoard8WordFormExam,
  generateUnit123VocabularyExam,
} from '../utils/examEngine';
import { MIDTERM_STANDARD_40_QUESTIONS } from '../data/midtermExamData';
import { PRESET_EXAMS } from '../data/curriculum';
import { WORD_FORM_QUIZ_QUESTIONS } from '../data/wordFormBank';

interface ExamGeneratorProps {
  onStartExam: (
    title: string,
    questions: Question[],
    durationMinutes: number | null,
    configSummary: string,
    mode?: ExamCategoryMode,
    examCode?: string
  ) => void;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({ onStartExam }) => {
  // Top-level View: 'presets' (Kho đề có sẵn) vs 'custom' (Tạo đề theo yêu cầu)
  const [activeView, setActiveView] = useState<'presets' | 'custom'>('presets');
  const [presetFilter, setPresetFilter] = useState<'all' | 'midterm' | 'unit_test' | 'topic'>('all');

  // Practice Mode selection (3 independent modes + combined)
  const [selectedMode, setSelectedMode] = useState<ExamCategoryMode>('multiple_choice');

  // Education Level & Grade
  const [grade, setGrade] = useState<GradeLevel>(11);
  const [bookSeries, setBookSeries] = useState<BookSeries>('Global Success');

  // Question Count depending on mode
  // Trắc nghiệm: 20, 25, 40, 50
  // Word Form: 5, 7, 10, 12
  // Chia thì: 10, 12, 15, 20
  // Combined: 40
  const [mcqCount, setMcqCount] = useState<number>(20);
  const [wordFormCount, setWordFormCount] = useState<number>(5);
  const [tensesCount, setTensesCount] = useState<number>(10);
  const [combinedCount, setCombinedCount] = useState<number>(40);

  // Time limit (minutes, or null for untimed)
  const [durationMinutes, setDurationMinutes] = useState<number | null>(45);

  // Difficulty
  const [difficulty, setDifficulty] = useState<'basic' | 'medium' | 'advanced' | 'mixed'>('mixed');

  // Deduplication toggle
  const [deduplicate, setDeduplicate] = useState<boolean>(true);

  // Empty pool warning modal state
  const [poolDepletedModal, setPoolDepletedModal] = useState<{
    show: boolean;
    availableCount: number;
    requestedCount: number;
    pendingAction: () => void;
  } | null>(null);

  // AI generation loading
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Stats on used fingerprints
  const usedCount = getUsedQuestionFingerprints().size;

  const getActiveQuestionCount = (): number => {
    switch (selectedMode) {
      case 'multiple_choice':
        return mcqCount;
      case 'word_form':
        return wordFormCount;
      case 'tenses':
        return tensesCount;
      case 'combined':
        return combinedCount;
    }
  };

  const handleLaunchPreset = (presetId: string) => {
    if (presetId === 'exam-midterm-1') {
      const pool = getStoredQuestionBank();
      const generated = generateRandomizedMidtermExam(pool);
      const summary = `Đề thi Giữa kì I Chuẩn ma trận mới • 40 câu ngẫu nhiên 100% • 45 phút • 30 Trắc nghiệm (7.5đ) + 4 Thì (1.0đ) + 4 Word Form (1.0đ) + 2 Modal Verbs (0.5đ) • Tính điểm ELO`;
      onStartExam(
        'Đề thi thử Giữa kì I (Chuẩn 40 câu ma trận mới - Ngẫu nhiên 100%)',
        generated.questions,
        45,
        summary,
        'combined',
        generated.examCode
      );
      return;
    }

    if (presetId === 'exam-wordform-8') {
      onStartExam(
        'Bài kiểm tra chuyên sâu 8 từ Word Form (Danh - Động - Tính - Trạng)',
        WORD_FORM_QUIZ_QUESTIONS,
        15,
        '8 câu Word Form từ bảng • 15 phút • Trừ điểm ký tự chuẩn',
        'word_form',
        'ENG-WF-8WORDS'
      );
      return;
    }

    const pool = getStoredQuestionBank();
    const preset = PRESET_EXAMS.find((p) => p.id === presetId) || PRESET_EXAMS[0];

    let selected: Question[] = [];
    if (preset.id === 'exam-quick-tenses') {
      selected = pool.filter((q) => q.questionType === 'tenses' || q.questionType === 'tense_form' || q.topic?.toLowerCase().includes('tense')).slice(0, 15);
    } else if (preset.id === 'exam-quick-stress') {
      selected = pool.filter((q) => q.questionType === 'stress' || q.questionType === 'pronunciation').slice(0, 15);
    } else if (preset.id === 'exam-pron-stress-32') {
      const pr = pool.filter((q) => q.questionType === 'pronunciation').slice(0, 16);
      const st = pool.filter((q) => q.questionType === 'stress').slice(0, 16);
      selected = [...pr, ...st];
    } else if (preset.id === 'exam-modal-tenses-17') {
      const tn = pool.filter((q) => q.questionType === 'tenses' || q.questionType === 'tense_form').slice(0, 9);
      const mv = pool.filter((q) => q.questionType === 'modal_verb_order' || q.topic?.toLowerCase().includes('modal')).slice(0, 8);
      selected = [...tn, ...mv];
    } else if (preset.id === 'exam-midterm-2') {
      const u123 = pool.filter((q) => [1, 2, 3].includes(q.unit));
      selected = u123.slice(0, 40);
    } else {
      const eligible = pool.filter((q) => preset.units.includes(q.unit));
      selected = eligible.length >= preset.questionCount ? eligible.slice(0, preset.questionCount) : eligible;
      if (selected.length < preset.questionCount) {
        const others = pool.filter((q) => !selected.some((s) => s.id === q.id));
        selected = [...selected, ...others.slice(0, preset.questionCount - selected.length)];
      }
    }

    onStartExam(
      preset.title,
      selected,
      preset.durationMinutes,
      `${preset.title} • ${selected.length} câu • Thang điểm 10 & ELO`,
      'multiple_choice',
      preset.id.toUpperCase()
    );
  };

  const handleLaunchExam = (forceAllowRecycle = false) => {
    setAiError(null);
    const count = getActiveQuestionCount();

    // If Standard Midterm 40 questions is requested in combined mode
    if (selectedMode === 'combined' && count === 40 && grade === 11) {
      const pool = getStoredQuestionBank();
      const generated = generateRandomizedMidtermExam(pool);
      const summary = `Đề thi Giữa kì I Chuẩn ma trận mới • 40 câu ngẫu nhiên 100% • ${
        durationMinutes ? `${durationMinutes} phút` : 'Không giới hạn thời gian'
      } • 30 Trắc nghiệm (7.5đ) + 4 Thì (1.0đ) + 4 Word Form (1.0đ) + 2 Modal Verbs (0.5đ) • Tính điểm ELO`;
      onStartExam(
        'Đề thi thử Giữa kì I (Chuẩn 40 câu ma trận mới - Ngẫu nhiên 100%)',
        generated.questions,
        durationMinutes,
        summary,
        'combined',
        generated.examCode
      );
      return;
    }

    const pool = getStoredQuestionBank();
    const result = generateExamWithDeduplication({
      mode: selectedMode,
      questionCount: count,
      grade,
      bookSeries,
      difficulty,
      deduplicate: forceAllowRecycle ? false : deduplicate,
      pool,
    });

    if (result.isPoolDepleted && deduplicate && !forceAllowRecycle) {
      // Prompt user with option to reuse or clear memory
      setPoolDepletedModal({
        show: true,
        availableCount: result.availableCount,
        requestedCount: count,
        pendingAction: () => handleLaunchExam(true),
      });
      return;
    }

    let modeNameVi = 'Trắc nghiệm ABCD';
    if (selectedMode === 'word_form') modeNameVi = 'Word Form (Biến đổi từ loại)';
    else if (selectedMode === 'tenses') modeNameVi = 'Chia thì tiếng Anh';
    else if (selectedMode === 'combined') modeNameVi = 'Đề kết hợp các dạng bài';

    const summary = `${modeNameVi} • Lớp ${grade} (${bookSeries}) • ${result.questions.length} câu • ${
      durationMinutes ? `${durationMinutes} phút` : 'Không giới hạn thời gian'
    } • Chấm điểm theo thang điểm 10 & ELO`;

    onStartExam(
      result.title,
      result.questions,
      durationMinutes,
      summary,
      selectedMode,
      result.examCode
    );
  };

  const handleLaunchBoard8WordForm = (count: number) => {
    const generated = generateBoard8WordFormExam(count);
    const duration = count <= 7 ? 10 : 15;
    const summary = `Chuyên đề 8 từ Word Form bảng lớp học • ${count} câu • ${duration} phút • Thang điểm 10 • Áp dụng thuật toán trừ lỗi ký tự`;
    onStartExam(
      generated.title,
      generated.questions,
      duration,
      summary,
      'word_form',
      generated.examCode
    );
  };

  const handleLaunchUnit123Vocab = (count: number) => {
    const pool = getStoredQuestionBank();
    const generated = generateUnit123VocabularyExam(count, pool);
    const duration = count <= 20 ? 15 : count <= 30 ? 25 : 40;
    const summary = `Chuyên đề Trắc nghiệm Từ vựng Unit 1, 2, 3 • ${count} câu • ${duration} phút • Thang điểm 10 • Xáo trộn 100% ABCD`;
    onStartExam(
      generated.title,
      generated.questions,
      duration,
      summary,
      'multiple_choice',
      generated.examCode
    );
  };

  const handleResetDeduplication = () => {
    clearUsedQuestionFingerprints();
    alert('Đã xóa lịch sử câu hỏi đã làm! Bạn có thể làm lại toàn bộ kho đề mà không bị trùng lặp lại.');
    setPoolDepletedModal(null);
  };

  const topicScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollTopics = (direction: 'left' | 'right') => {
    if (topicScrollRef.current) {
      const amount = direction === 'left' ? -350 : 350;
      topicScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Target className="w-3.5 h-3.5" />
          <span>Hệ thống luyện thi thông minh THCS & THPT</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Tạo Đề Thi & Bài Tập Tự Luyện
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Tùy chọn 3 dạng bài tập độc lập (Trắc nghiệm ABCD, Word Form, Chia thì) hoặc Đề thi chuẩn Giữa kì / Cuối kì. Tự động chấm điểm thang 10, phát hiện lỗi ký tự và cập nhật ELO.
        </p>
      </div>

      {/* Top View Selector: Kho Đề Tuyển Chọn vs Tự Tạo Đề */}
      <div className="flex items-center justify-center">
        <div className="p-1 rounded-2xl bg-slate-200/80 border border-slate-300/80 inline-flex gap-1.5 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveView('presets')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
              activeView === 'presets'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kho Đề Tuyển Chọn ({PRESET_EXAMS.length} Đề Có Sẵn)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('custom')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
              activeView === 'custom'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tự Tạo Đề Theo Dạng Bài (ABCD / Word Form / Thì)</span>
          </button>
        </div>
      </div>

      {/* THANH KÉO NGANG CHỦ ĐỀ LUYỆN THI (HORIZONTAL TOPIC CAROUSEL) */}
      <div className="bg-white/85 backdrop-blur-md rounded-2xl border border-indigo-100 p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Chủ đề & Chuyên đề trọng tâm</span>
              <span className="text-[10px] text-indigo-600 font-semibold lowercase bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                kéo thanh ngang để xem thêm
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollTopics('left')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 transition-colors"
              title="Kéo sang trái"
            >
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => scrollTopics('right')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 text-slate-600 transition-colors"
              title="Kéo sang phải"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Track */}
        <div
          ref={topicScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent snap-x"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Item 1: Word Form 8 từ */}
          <div className="min-w-[280px] sm:min-w-[310px] p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/80 shrink-0 snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1.5">
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Chuyên Đề Hot</span>
                <span>8 Từ Trong Bảng</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                Word Form 8 Từ (5, 7, 10, 12 câu)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Biến đổi Danh - Động - Tính - Trạng chuẩn thang 10 & trừ lỗi ký tự.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {[5, 7, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleLaunchBoard8WordForm(cnt)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-2xs transition-all hover:scale-105"
                >
                  {cnt} câu
                </button>
              ))}
            </div>
          </div>

          {/* Item 2: Trắc nghiệm Unit 1-2-3 Vocab */}
          <div className="min-w-[280px] sm:min-w-[320px] p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-200/80 shrink-0 snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-indigo-800 mb-1.5">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">Từ Vựng Cốt Lõi</span>
                <span>Unit 1, 2, 3</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                Trắc Nghiệm Từ Vựng Unit 1, 2, 3
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Bộ từ vựng phong phú: thế hệ, thành phố thông minh, sức khỏe.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              {[15, 20, 25, 30, 40].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleLaunchUnit123Vocab(cnt)}
                  className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-2xs transition-all hover:scale-105"
                >
                  {cnt} câu
                </button>
              ))}
            </div>
          </div>

          {/* Item 3: Phát âm & Trọng âm 32 câu */}
          <div className="min-w-[260px] sm:min-w-[280px] p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/80 shrink-0 snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 mb-1.5">
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">32 Câu Chuẩn</span>
                <span>Pronunciation</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                16 Câu Phát Âm + 16 Trọng Âm
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Đề luyện ngữ âm toàn diện Unit 1, 2, 3 với gạch chân từ khác biệt.
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleLaunchPreset('exam-pron-stress-32')}
                className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>Bắt đầu thi (32 câu)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Item 4: Chia thì & Modal verbs 17 câu */}
          <div className="min-w-[260px] sm:min-w-[280px] p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-200/80 shrink-0 snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 mb-1.5">
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">17 Câu Ngữ Pháp</span>
                <span>Tenses & Modal</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                9 Câu Thì + 8 Modal Verbs
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Rèn luyện must, have to, should, ought to và thì quá khứ/hoàn thành.
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleLaunchPreset('exam-modal-tenses-17')}
                className="w-full py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>Bắt đầu thi (17 câu)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Item 5: Đề thi giữa kì I 40 câu */}
          <div className="min-w-[260px] sm:min-w-[290px] p-4 rounded-xl bg-gradient-to-br from-rose-500/10 to-red-500/10 border border-rose-200/80 shrink-0 snap-start flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold text-rose-800 mb-1.5">
                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">Chuẩn Ma Trận</span>
                <span>Ngẫu Nhiên 100%</span>
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-snug">
                Đề Thi Thử Giữa Kì I (40 câu)
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                30 ABCD (7.5đ) + 4 Thì (1.0đ) + 4 Word Form (1.0đ) + 2 Modal (0.5đ).
              </p>
            </div>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => handleLaunchPreset('exam-midterm-1')}
                className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <span>Làm đề Giữa Kì I (40 câu)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW 1: PRESET EXAMS CATALOG */}
      {activeView === 'presets' && (
        <div className="space-y-6">
          {/* HAI KHỐI CHUYÊN ĐỀ ĐẶC BIỆT THEO YÊU CẦU: WORD FORM 8 TỪ & TRẮC NGHIỆM TỪ VỰNG UNIT 1,2,3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* CARD 1: ĐỀ THI CHUYÊN ĐỀ WORD FORM 8 TỪ ĐÃ HỌC */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border-2 border-emerald-400/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Chuyên Đề Word Form 8 Từ Đã Học
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    10 - 15 phút
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Đề Thi Biến Đổi Từ Loại (8 Từ Trên Bảng)
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Luyện tập các dạng Danh từ, Động từ, Tính từ, Trạng từ của 8 từ: <em>exhibit, efficient, sustain, renew, interact, secure, organize, advantage</em>. Chấm điểm theo thang điểm 10, phát hiện và trừ điểm lỗi từng ký tự theo quy định.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Chọn số lượng câu làm bài:
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 7, 10, 12].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleLaunchBoard8WordForm(cnt)}
                      className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold text-xs transition-all border border-emerald-200 text-center shadow-2xs hover:shadow-emerald-200"
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  * 5-7 câu: sai 1 chữ trừ 0.3đ • 10-12 câu: sai 1 chữ trừ 0.15đ
                </div>
              </div>
            </div>

            {/* CARD 2: ĐỀ THI TRẮC NGHIỆM TỪ VỰNG UNIT 1, 2, 3 */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border-2 border-indigo-400/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    Chuyên Đề Trắc Nghiệm Từ Vựng
                  </span>
                  <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    15 - 40 phút
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  Đề Thi Trắc Nghiệm Từ Vựng Unit 1, 2, 3
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ngân hàng câu hỏi trắc nghiệm từ vựng đa dạng bao gồm Unit 1 (Healthy Life), Unit 2 (Generation Gap), và Unit 3 (Smart Cities). Mỗi câu đúng 10/N điểm, tự động xáo trộn câu và đáp án.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Chọn số lượng câu làm bài:
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[15, 20, 25, 30, 40].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => handleLaunchUnit123Vocab(cnt)}
                      className="py-2 px-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white font-extrabold text-xs transition-all border border-indigo-200 text-center shadow-2xs hover:shadow-indigo-200"
                    >
                      {cnt} câu
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-slate-500 italic">
                  * 4 lựa chọn A, B, C, D • Đảo ngẫu nhiên 100% • Thang điểm 10
                </div>
              </div>
            </div>
          </div>

          {/* Preset Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lọc theo thể loại đề thi:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Tất cả đề thi' },
                { id: 'midterm', label: 'Đề Giữa Kì I' },
                { id: 'unit_test', label: 'Chuyên đề Unit (1, 2, 3)' },
                { id: 'topic', label: 'Kiểm tra 15p & Word Form' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setPresetFilter(filter.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    presetFilter === filter.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRESET_EXAMS.filter((exam) => {
              if (presetFilter === 'all') return true;
              return exam.examType === presetFilter;
            }).map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {exam.examType === 'midterm'
                        ? 'Đề Thi Giữa Kì'
                        : exam.examType === 'final'
                        ? 'Đề Thi Cuối Kì'
                        : exam.examType === 'unit_test'
                        ? 'Chuyên Đề Unit'
                        : 'Kiểm Tra Chuyên Sâu'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {exam.durationMinutes} phút
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {exam.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">
                    {exam.questionCount} câu • Chuẩn thang 10
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLaunchPreset(exam.id)}
                    className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-2xs group-hover:shadow-indigo-200"
                  >
                    <span>Làm bài ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: CUSTOM GENERATOR CARD */}
      {activeView === 'custom' && (
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Step 1: Mode Selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">
            Bước 1: Chọn dạng bài tập luyện thi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Mode 1: Trắc nghiệm ABCD */}
            <button
              type="button"
              onClick={() => setSelectedMode('multiple_choice')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedMode === 'multiple_choice'
                  ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">1. Trắc nghiệm ABCD</div>
              <div className="text-xs text-slate-500 mt-1">
                4 lựa chọn A, B, C, D • Tự động đảo thứ tự • Không lộ đáp án • 20, 25, 40, 50 câu.
              </div>
              {selectedMode === 'multiple_choice' && (
                <div className="absolute top-3 right-3 text-indigo-600">
                  <CheckCircle className="w-4 h-4 fill-indigo-600 text-white" />
                </div>
              )}
            </button>

            {/* Mode 2: Word Form */}
            <button
              type="button"
              onClick={() => setSelectedMode('word_form')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedMode === 'word_form'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">2. Word Form (Từ loại)</div>
              <div className="text-xs text-slate-500 mt-1">
                Danh - Động - Tính - Trạng • Nhóm từ CARE, DEVELOP, PLEASE, SAFE... • Trừ 0.3đ hoặc 0.15đ/lỗi.
              </div>
              {selectedMode === 'word_form' && (
                <div className="absolute top-3 right-3 text-emerald-600">
                  <CheckCircle className="w-4 h-4 fill-emerald-600 text-white" />
                </div>
              )}
            </button>

            {/* Mode 3: Chia thì */}
            <button
              type="button"
              onClick={() => setSelectedMode('tenses')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedMode === 'tenses'
                  ? 'border-sky-600 bg-sky-50/70 ring-2 ring-sky-500/20'
                  : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center mb-3">
                <Clock className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">3. Chia thì tiếng Anh</div>
              <div className="text-xs text-slate-500 mt-1">
                Hiện tại, Quá khứ, Tương lai, Hoàn thành • Nhận diện dấu hiệu • 10, 12, 15, 20 câu.
              </div>
              {selectedMode === 'tenses' && (
                <div className="absolute top-3 right-3 text-sky-600">
                  <CheckCircle className="w-4 h-4 fill-sky-600 text-white" />
                </div>
              )}
            </button>

            {/* Mode 4: Combined */}
            <button
              type="button"
              onClick={() => setSelectedMode('combined')}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                selectedMode === 'combined'
                  ? 'border-purple-600 bg-purple-50/70 ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-purple-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <Layers className="w-5 h-5" />
              </div>
              <div className="font-bold text-sm text-slate-900">4. Đề kết hợp / Giữa kì</div>
              <div className="text-xs text-slate-500 mt-1">
                Chuẩn 40 câu (30 TN 7.5đ + 4 Thì 1.0đ + 4 Word Form 1.0đ + 2 Modal 0.5đ).
              </div>
              {selectedMode === 'combined' && (
                <div className="absolute top-3 right-3 text-purple-600">
                  <CheckCircle className="w-4 h-4 fill-purple-600 text-white" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Grade & Book Series */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Khối lớp & Cấp học
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g as GradeLevel)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    grade === g
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 mt-1.5">
              {grade <= 9 ? 'Cấp Trung học Cơ sở (THCS)' : 'Cấp Trung học Phổ thông (THPT)'}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Bộ sách giáo khoa
            </label>
            <select
              value={bookSeries}
              onChange={(e) => setBookSeries(e.target.value as BookSeries)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Global Success">Global Success (Bộ Giáo dục & Đào tạo)</option>
              <option value="Friends Plus">Friends Plus</option>
              <option value="i-Learn Smart World">i-Learn Smart World</option>
              <option value="Chung">Bộ sách Chung / Tổng hợp</option>
            </select>
          </div>
        </div>

        {/* Step 3: Question Count depending on selected mode */}
        <div className="pt-2 border-t border-slate-100">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
            Bước 2: Chọn số lượng câu hỏi
          </label>

          {selectedMode === 'multiple_choice' && (
            <div className="grid grid-cols-4 gap-3">
              {[20, 25, 40, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setMcqCount(num)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    mcqCount === num
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg font-extrabold">{num} câu</div>
                  <div className="text-[11px] text-slate-500">{(10 / num).toFixed(2)}đ / câu</div>
                </button>
              ))}
            </div>
          )}

          {selectedMode === 'word_form' && (
            <div>
              <div className="grid grid-cols-4 gap-3">
                {[5, 7, 10, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setWordFormCount(num)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      wordFormCount === num
                        ? 'border-emerald-600 bg-emerald-50 font-bold text-emerald-900 ring-1 ring-emerald-500'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-lg font-extrabold">{num} câu</div>
                    <div className="text-[11px] text-slate-500">{(10 / num).toFixed(2)}đ / câu</div>
                  </button>
                ))}
              </div>
              <div className="mt-2.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-900 leading-relaxed">
                <strong>Quy tắc chấm điểm Word Form:</strong>
                {wordFormCount === 5 || wordFormCount === 7 ? (
                  <span> Đề {wordFormCount} câu: mỗi câu {(10 / wordFormCount).toFixed(2)}đ. Sai 1 chữ cái trừ 0.3đ. Sai từ 2 chữ cái trở lên: trừ 0.3đ × số chữ cái sai.</span>
                ) : (
                  <span> Đề {wordFormCount} câu: mỗi câu {(10 / wordFormCount).toFixed(2)}đ. Sai 1 chữ cái trừ 0.15đ. Sai từ 2 chữ cái trở lên: trừ 0.15đ × số chữ cái sai.</span>
                )}
                <span> Không cho điểm âm từng câu.</span>
              </div>
            </div>
          )}

          {selectedMode === 'tenses' && (
            <div className="grid grid-cols-4 gap-3">
              {[10, 12, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setTensesCount(num)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    tensesCount === num
                      ? 'border-sky-600 bg-sky-50 font-bold text-sky-900 ring-1 ring-sky-500'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-lg font-extrabold">{num} câu</div>
                  <div className="text-[11px] text-slate-500">{(10 / num).toFixed(2)}đ / câu</div>
                </button>
              ))}
            </div>
          )}

          {selectedMode === 'combined' && (
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Đề thi chuẩn ma trận 40 câu (Thang điểm 10)</span>
                <span className="text-purple-700">30 câu trắc nghiệm (7.5đ) + 4 câu chia thì (1.0đ) + 4 câu Word Form 8 từ (1.0đ) + 2 câu sắp xếp Modal verbs (0.5đ).</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-extrabold text-sm shrink-0">
                40 câu
              </span>
            </div>
          )}
        </div>

        {/* Step 4: Duration & Deduplication */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          {/* Duration */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Thời gian làm bài
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: '15p', val: 15 },
                { label: '20p', val: 20 },
                { label: '30p', val: 30 },
                { label: '45p', val: 45 },
                { label: 'Không hẹn', val: null },
              ].map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setDurationMinutes(t.val)}
                  className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                    durationMinutes === t.val
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deduplication Switch */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Tính năng chống trùng lặp câu hỏi
            </label>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Không lặp lại câu đã thi</div>
                  <div className="text-[11px] text-slate-500">Đã lưu {usedCount} câu hỏi trong bộ nhớ</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={deduplicate}
                onChange={(e) => setDeduplicate(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Kết quả bài làm sẽ tự động cộng/trừ điểm ELO theo bảng chuẩn</span>
          </div>

          <button
            type="button"
            onClick={() => handleLaunchExam(false)}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Bắt đầu làm bài thi</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Empty Pool Warning Modal */}
      {poolDepletedModal?.show && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Thông báo kho câu hỏi</h3>
                <p className="text-xs text-slate-500">Tính năng chống trùng lặp đang được bật</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn yêu cầu tạo đề gồm <strong>{poolDepletedModal.requestedCount} câu</strong>, nhưng trong kho chỉ còn{' '}
              <strong>{poolDepletedModal.availableCount} câu hỏi mới chưa làm</strong>.
            </p>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="font-semibold text-slate-800">Bạn muốn tiếp tục thế nào?</div>
              <p>• <strong>Làm lại cả câu đã từng làm:</strong> Hệ thống sẽ trộn câu mới với các câu cũ để đủ số lượng.</p>
              <p>• <strong>Xóa lịch sử trùng lặp:</strong> Làm mới lại toàn bộ kho đề từ đầu.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetDeduplication}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Xóa lịch sử & Làm mới
              </button>
              <button
                type="button"
                onClick={() => {
                  poolDepletedModal.pendingAction();
                  setPoolDepletedModal(null);
                }}
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Tiếp tục tạo đề
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

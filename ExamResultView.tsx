import React, { useState } from 'react';
import {
  Trophy,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Volume2,
  Share2,
} from 'lucide-react';
import { UserExamSubmission, Question } from '../types';
import { speakEnglish } from '../utils/speech';
import { getStandardAnswerDisplay } from '../utils/answerFormatter';
import { FormattedText } from './FormattedText';

interface ExamResultViewProps {
  submission: UserExamSubmission;
  onRetakeExam: () => void;
  onGoHome: () => void;
  onRemediateMistakes: (wrongQuestions: Question[]) => void;
}

export const ExamResultView: React.FC<ExamResultViewProps> = ({
  submission,
  onRetakeExam,
  onGoHome,
  onRemediateMistakes,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('wrong');
  const [expandedExplanations, setExpandedExplanations] = useState<{ [qId: string]: boolean }>({});
  const [aiCustomExplanations, setAiCustomExplanations] = useState<{ [qId: string]: string }>({});
  const [loadingAiExpl, setLoadingAiExpl] = useState<{ [qId: string]: boolean }>({});

  const {
    examTitle,
    scoreOutOf10,
    correctCount,
    totalQuestions,
    durationSecondsSpent,
    answers,
    questions,
    categoryBreakdown,
    unitBreakdown,
  } = submission;

  const minutesSpent = Math.floor(durationSecondsSpent / 60);
  const secondsSpent = durationSecondsSpent % 60;
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  // Grade classification
  let gradeBadge = { label: 'Xuất sắc', color: 'from-amber-400 to-yellow-500', text: 'text-amber-950' };
  if (scoreOutOf10 < 5.0) {
    gradeBadge = { label: 'Cần cố gắng', color: 'from-red-400 to-rose-500', text: 'text-white' };
  } else if (scoreOutOf10 < 6.5) {
    gradeBadge = { label: 'Trung bình', color: 'from-orange-400 to-amber-500', text: 'text-white' };
  } else if (scoreOutOf10 < 8.0) {
    gradeBadge = { label: 'Khá', color: 'from-blue-400 to-indigo-500', text: 'text-white' };
  } else if (scoreOutOf10 < 9.0) {
    gradeBadge = { label: 'Giỏi', color: 'from-emerald-400 to-teal-500', text: 'text-white' };
  }

  const wrongQuestions = questions.filter((q) => {
    const detail = submission.gradingDetails?.find((d) => d.questionId === q.id);
    if (detail !== undefined) return !detail.isCorrect;
    const stdInfo = getStandardAnswerDisplay(q);
    const userVal = (answers[q.id] || '').trim().toLowerCase();
    return userVal !== stdInfo.wordOnly.toLowerCase() && userVal !== q.correctAnswer.trim().toLowerCase();
  });

  const toggleExpand = (qId: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const requestAiDeepExplanation = async (q: Question) => {
    if (aiCustomExplanations[q.id] || loadingAiExpl[q.id]) return;

    setLoadingAiExpl((prev) => ({ ...prev, [q.id]: true }));
    try {
      const stdInfo = getStandardAnswerDisplay(q);
      const response = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          selectedAnswer: answers[q.id] || 'Chưa chọn',
          correctAnswer: stdInfo.fullDisplay,
          topic: `${q.topic} (Unit ${q.unit})`,
        }),
      });

      const data = await response.json();
      if (data.success && data.explanation) {
        setAiCustomExplanations((prev) => ({ ...prev, [q.id]: data.explanation }));
        setExpandedExplanations((prev) => ({ ...prev, [q.id]: true }));
      }
    } catch (e) {
      console.error('Error fetching deep explanation', e);
    } finally {
      setLoadingAiExpl((prev) => ({ ...prev, [q.id]: false }));
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const detail = submission.gradingDetails?.find((d) => d.questionId === q.id);
    const isCorrect = detail !== undefined
      ? detail.isCorrect
      : (() => {
          const stdInfo = getStandardAnswerDisplay(q);
          const userVal = (answers[q.id] || '').trim().toLowerCase();
          return userVal === stdInfo.wordOnly.toLowerCase() || userVal === q.correctAnswer.trim().toLowerCase();
        })();
    if (filterMode === 'wrong') return !isCorrect;
    if (filterMode === 'correct') return isCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Hero Score Card */}
      <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-950 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r ${gradeBadge.color} ${gradeBadge.text}`}>
              {gradeBadge.label}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Kết Quả Bài Thi Tiếng Anh 11
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm max-w-lg">
              {examTitle} • Hoàn thành trong {minutesSpent} phút {secondsSpent} giây
            </p>
          </div>

          {/* Big Score Display */}
          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-8 py-5 rounded-3xl border border-white/15">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-white bg-clip-text text-transparent">
                {scoreOutOf10}
              </div>
              <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider mt-1">
                Thang điểm 10
              </div>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">
                {correctCount}
                <span className="text-sm font-normal text-indigo-300">/{totalQuestions}</span>
              </div>
              <div className="text-[11px] text-indigo-200 font-semibold uppercase tracking-wider mt-1">
                {accuracy}% Chính xác
              </div>
            </div>
          </div>
        </div>

        {/* Action Row */}
        <div className="relative z-10 pt-6 mt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onRetakeExam}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm lại đề này
            </button>
            <button
              onClick={onGoHome}
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors border border-white/10"
            >
              Trang chủ
            </button>
          </div>

          {wrongQuestions.length > 0 && (
            <button
              onClick={() => onRemediateMistakes(wrongQuestions)}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/40 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Tạo bài luyện tập cho {wrongQuestions.length} câu làm sai</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ELO Rating Update Card */}
      {submission.eloChange && (
        <div className="bg-white rounded-3xl border-2 border-indigo-200/80 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center font-black shadow-md shadow-amber-200 shrink-0">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-900">
                    Cập Nhật Điểm ELO & Xếp Hạng Học Lực
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    Hệ thống ELO 0 - 2000
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {submission.eloChange.tierNameVi}
                </p>
              </div>
            </div>

            {/* Elo Delta Pill */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="text-right">
                <div className="text-[11px] text-gray-400 font-semibold">Điểm ELO mới</div>
                <div className="text-2xl font-black text-gray-900">
                  {submission.eloChange.newElo}
                  <span className="text-xs text-gray-400 font-normal"> / 2000</span>
                </div>
              </div>

              <div
                className={`py-2 px-3.5 rounded-2xl font-black text-sm flex items-center gap-1 shadow-xs ${
                  submission.eloChange.delta >= 0
                    ? 'bg-emerald-500 text-white shadow-emerald-200'
                    : 'bg-rose-500 text-white shadow-rose-200'
                }`}
              >
                <span>{submission.eloChange.delta >= 0 ? `+${submission.eloChange.delta}` : submission.eloChange.delta}</span>
                <span className="text-[10px] uppercase font-bold">ELO</span>
              </div>
            </div>
          </div>

          {/* Elo Progress explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Hạng trước khi thi:</span>
              <div className="font-extrabold text-gray-800 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-black text-xs">
                  {submission.eloChange.oldTier}
                </span>
                <span>({submission.eloChange.oldElo} ELO)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Hạng hiện tại:</span>
              <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-xs">
                  {submission.eloChange.newTier}
                </span>
                <span>({submission.eloChange.newElo} ELO)</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
              <span className="text-[10px] font-bold text-amber-700 uppercase">Cơ chế tính ELO:</span>
              <div className="font-bold text-amber-950 text-xs">
                {scoreOutOf10} điểm {submission.eloChange.oldElo >= 1000 && submission.eloChange.delta > 0 ? '• Đã giảm 12% điểm cộng (mốc ≥1000 ELO)' : '• Khung điểm chuẩn'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-600" />
            Phân tích theo Dạng câu hỏi
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryBreakdown).map(([cat, stat]) => {
              if (!stat) return null;
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700 capitalize">
                      {cat === 'pronunciation'
                        ? 'Phát âm'
                        : cat === 'stress'
                        ? 'Trọng âm'
                        : cat === 'grammar'
                        ? 'Ngữ pháp'
                        : cat === 'vocabulary'
                        ? 'Từ vựng'
                        : cat === 'error_identification'
                        ? 'Tìm lỗi sai'
                        : cat === 'sentence_transformation'
                        ? 'Viết lại câu'
                        : cat === 'reading'
                        ? 'Đọc hiểu'
                        : cat}
                    </span>
                    <span className="text-gray-500">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unit Breakdown */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            Phân tích theo Unit (SGK 11)
          </h3>
          <div className="space-y-3">
            {Object.entries(unitBreakdown).map(([unit, stat]) => {
              if (!stat) return null;
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={unit} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-700">Unit {unit}</span>
                    <span className="text-gray-500">
                      {stat.correct}/{stat.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct >= 80 ? 'bg-indigo-600' : pct >= 50 ? 'bg-purple-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question by Question Detailed Review */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Chi Tiết Từng Câu Hỏi & Lời Giải Thích
            </h3>
            <p className="text-xs text-gray-500">
              Xem lại đáp án, giải thích song ngữ Anh - Việt và nhờ Gia sư AI giải đáp
            </p>
          </div>

          {/* Filter toggle */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold self-start">
            <button
              onClick={() => setFilterMode('wrong')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'wrong'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Câu sai ({wrongQuestions.length})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Tất cả ({totalQuestions})
            </button>
            <button
              onClick={() => setFilterMode('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filterMode === 'correct'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Câu đúng ({correctCount})
            </button>
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">Không có câu hỏi nào trong mục này</p>
            <p className="text-xs text-gray-500">Chúc mừng bạn đã hoàn thành bài thi với kết quả tốt!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredQuestions.map((q, idx) => {
              const originalIdx = questions.findIndex((item) => item.id === q.id) + 1;
              const userAns = answers[q.id];
              const detail = submission.gradingDetails?.find((d) => d.questionId === q.id);
              const stdInfo = getStandardAnswerDisplay(q);
              const isCorrect = detail !== undefined
                ? detail.isCorrect
                : (userAns?.trim().toLowerCase() === stdInfo.wordOnly.toLowerCase());
              const isExpanded = !!expandedExplanations[q.id];
              const aiExpl = aiCustomExplanations[q.id];
              const isLoadingExpl = !!loadingAiExpl[q.id];

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-4 ${
                    isCorrect
                      ? 'border-green-200 bg-green-50/20'
                      : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  {/* Top Status */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-gray-100 text-gray-800 font-extrabold text-xs flex items-center justify-center">
                        #{originalIdx}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        Unit {q.unit} • {q.topic}
                      </span>
                      <button
                        onClick={() => speakEnglish(q.question)}
                        className="p-1 text-gray-400 hover:text-indigo-600"
                        title="Nghe câu hỏi"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                          {detail?.scoreAwarded !== undefined && (
                            <span className="text-[10px] text-green-700">+{detail.scoreAwarded}đ</span>
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          <XCircle className="w-3.5 h-3.5" /> Sai (Bạn làm: {userAns || 'Chưa làm'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="text-sm font-semibold text-gray-900 whitespace-pre-line leading-relaxed">
                    <FormattedText text={q.question} />
                  </div>

                  {/* Options List for MCQ OR Text Answer Review for Word Form / Tenses */}
                  {q.options && q.options.length > 0 && q.questionType !== 'word_form' && q.questionType !== 'tenses' && q.questionType !== 'tense_form' ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, i) => {
                          const optKey = ['A', 'B', 'C', 'D'][i] || opt.slice(0, 1).toUpperCase();
                          const isTargetCorrect = (stdInfo.letter === optKey) || (q.correctAnswer.toUpperCase() === optKey);
                          const isChosen = (userAns || '').toUpperCase() === optKey;

                          let optClass = 'bg-white border-slate-200 text-slate-700';
                          if (isTargetCorrect) {
                            optClass = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold ring-2 ring-emerald-200';
                          } else if (isChosen && !isCorrect) {
                            optClass = 'bg-rose-100 border-rose-400 text-rose-950 line-through';
                          }

                          return (
                            <div
                              key={optKey}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 ${optClass}`}
                            >
                              <span className="font-extrabold shrink-0">{optKey}.</span>
                              <span>
                                <FormattedText text={opt.replace(/^[A-D]\.\s*/, '')} />
                              </span>
                              {isTargetCorrect && (
                                <span className="ml-auto text-[10px] font-black uppercase text-emerald-700 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explicit Standard Answer Banner */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 px-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-semibold">Đáp án chuẩn:</span>
                          <span className="font-mono font-extrabold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                            {stdInfo.wordOnly} {stdInfo.letter ? `(${stdInfo.letter})` : ''}
                          </span>
                        </div>
                        {!isCorrect && userAns && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span>Bạn đã chọn:</span>
                            <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-200 line-through">
                              {userAns}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Word Form & Tenses Text Input Review */
                    <div className="bg-white rounded-xl border border-slate-200 p-3.5 text-xs space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Câu trả lời của bạn:</span>
                          <span
                            className={`font-mono font-bold px-2.5 py-1 rounded-lg text-xs ${
                              isCorrect
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800 line-through'
                            }`}
                          >
                            {userAns || '(Chưa điền)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">Đáp án chuẩn:</span>
                          <span className="font-mono font-extrabold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs shadow-2xs">
                            {stdInfo.wordOnly}
                          </span>
                        </div>
                      </div>

                      {/* Word Form character errors diff */}
                      {q.questionType === 'word_form' && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span>
                              Từ gốc: <strong className="font-mono text-emerald-800">{q.targetWord || 'từ gốc'}</strong>
                            </span>
                            {detail?.charErrors !== undefined && detail.charErrors > 0 && (
                              <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold">
                                Sai {detail.charErrors} chữ (-{detail.penalty}đ)
                              </span>
                            )}
                          </div>
                          {detail && (
                            <span className="font-semibold text-indigo-700">
                              {detail.feedbackVi}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tense Signal if available */}
                      {(q.questionType === 'tenses' || q.questionType === 'tense_form') && q.signalWords && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <span>Dấu hiệu nhận biết thì: <strong>{q.signalWords}</strong> ({q.tenseName})</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Explanation Toggle & Content */}
                  <div className="pt-2 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(q.id)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" /> Thu gọn lời giải
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" /> Xem giải thích chi tiết
                          </>
                        )}
                      </button>

                      {/* Ask AI Tutor for Deep Analysis */}
                      <button
                        onClick={() => requestAiDeepExplanation(q)}
                        disabled={isLoadingExpl}
                        className="text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span>
                          {isLoadingExpl ? 'Gia sư AI đang phân tích...' : 'Gia sư AI giải thích sâu & mẹo nhớ'}
                        </span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs space-y-2.5">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>Lời giải (Tiếng Việt):</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{q.explanationVi}</p>

                        {q.explanationEn && (
                          <div className="pt-2 border-t border-gray-100 text-gray-600 italic">
                            <span className="font-semibold not-italic text-gray-800">English note: </span>
                            {q.explanationEn}
                          </div>
                        )}

                        {/* AI Deep Tutor output if requested */}
                        {aiExpl && (
                          <div className="mt-3 p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-2">
                            <div className="font-extrabold text-xs flex items-center gap-1.5 text-purple-900">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              <span>Gợi ý từ Cô Lan (Gia sư AI Tiếng Anh 11):</span>
                            </div>
                            <div className="text-xs leading-relaxed whitespace-pre-line text-purple-900">
                              {aiExpl}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

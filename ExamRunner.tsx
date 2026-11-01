import React, { useState, useEffect } from 'react';
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Send,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit3,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, UserExamSubmission, QuestionType, QuestionGradingDetail } from '../types';
import { speakEnglish } from '../utils/speech';
import { scoreWordFormAnswer, scoreMidtermWordFormAnswer } from '../utils/wordFormScorer';
import { markQuestionFingerprintsAsUsed } from '../utils/examEngine';
import { getStandardAnswerDisplay } from '../utils/answerFormatter';
import { FormattedText } from './FormattedText';
import { getStoredThemeSettings, ThemeSettings } from '../utils/themeManager';

interface ExamRunnerProps {
  examTitle: string;
  questions: Question[];
  durationMinutes: number | null;
  configSummary: string;
  onFinishExam: (submission: UserExamSubmission) => void;
  onExit: () => void;
}

export const ExamRunner: React.FC<ExamRunnerProps> = ({
  examTitle,
  questions,
  durationMinutes,
  configSummary,
  onFinishExam,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [flagged, setFlagged] = useState<{ [questionId: string]: boolean }>({});

  // Timer: if durationMinutes is null, we count up; if number, we count down
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    durationMinutes !== null ? durationMinutes * 60 : 0
  );
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState<boolean>(false);
  const [fontSizeLevel, setFontSizeLevel] = useState<number>(1);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => getStoredThemeSettings());

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) setThemeSettings(e.detail);
    };
    window.addEventListener('em11_theme_updated', handleThemeChange);
    return () => window.removeEventListener('em11_theme_updated', handleThemeChange);
  }, []);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);

      if (durationMinutes !== null) {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [durationMinutes]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim().length > 0).length;
  const totalQuestions = questions.length;
  const isStandardMidterm =
    totalQuestions === 40 &&
    (examTitle.includes('40 câu') ||
     examTitle.toLowerCase().includes('giữa kì') ||
     examTitle.toLowerCase().includes('midterm'));

  const handleSelectOption = (optKey: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optKey,
    }));
  };

  const handleTextAnswerChange = (val: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: val,
    }));
  };

  const toggleFlag = (qId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleFinalSubmit = () => {
    let totalScore = 0;
    let correctCount = 0;
    const gradingDetails: QuestionGradingDetail[] = [];
    const categoryStats: {
      [key in QuestionType]?: { correct: number; total: number; pointsEarned?: number; maxPoints?: number };
    } = {};
    const unitStats: { [unit: number]: { correct: number; total: number } } = {};

    // In all regular tests (MCQ 20, 25, 40, 50; Word Form 5, 7, 10, 12; Tenses 10, 12, 15, 20):
    // Each question is worth EXACTLY 10 / N so that N/N correct yields 10.0 scale precisely!
    const defaultMaxPerQuestion = 10 / totalQuestions;

    questions.forEach((q) => {
      const userAns = (answers[q.id] || '').trim();
      const isWordForm = q.questionType === 'word_form';
      const isTense = q.questionType === 'tenses' || q.questionType === 'tense_form';

      let isCorrect = false;
      let scoreAwarded = 0;
      let maxScore = (isStandardMidterm && q.points !== undefined) ? q.points : defaultMaxPerQuestion;
      let feedbackVi = q.explanationVi;
      let charErrors: number | undefined = undefined;
      let penalty: number | undefined = undefined;
      const stdInfo = getStandardAnswerDisplay(q);
      const cleanStdWord = stdInfo.wordOnly;
      const fullStdDisplay = stdInfo.fullDisplay;

      if (isWordForm) {
        if (isStandardMidterm) {
          // Midterm Word Form: Mỗi câu 0.25đ, sai 1 chữ trừ 0.05đ, trừ hết 0.25đ thì ngưng (tối thiểu 0đ)
          const wfResult = scoreMidtermWordFormAnswer(userAns, cleanStdWord || q.correctAnswer, q.acceptableAnswers);
          scoreAwarded = wfResult.scoreAwarded;
          maxScore = 0.25;
          charErrors = wfResult.charErrors;
          penalty = wfResult.penalty;
          feedbackVi = wfResult.feedbackVi;
          isCorrect = wfResult.isCorrect;
        } else {
          // Word Form đơn:
          // 5 & 7 câu: 1 lỗi = -0.3đ; >=2 lỗi = -0.3 * charErrors
          // 10 & 12 câu: 1 lỗi = -0.15đ; >=2 lỗi = -0.15 * charErrors
          const wfResult = scoreWordFormAnswer(userAns, cleanStdWord || q.correctAnswer, totalQuestions, q.acceptableAnswers);
          scoreAwarded = wfResult.score;
          maxScore = wfResult.maxPossible;
          charErrors = wfResult.charErrors;
          penalty = wfResult.penalty;
          feedbackVi = wfResult.feedbackVi;
          isCorrect = wfResult.isCorrect;
        }
      } else if (isTense) {
        // Check normalized text: either the conjugated word or raw answer or option letter
        const stripPunct = (s: string) => s.toLowerCase().replace(/[.,;!?]+$/g, '').replace(/\s+/g, ' ').trim();
        const cleanUser = stripPunct(userAns);
        const cleanCorrect = stripPunct(q.correctAnswer);
        const cleanClean = stripPunct(cleanStdWord);
        const cleanExpected = q.expectedTextAnswer ? stripPunct(q.expectedTextAnswer) : '';
        const acceptable = (q.acceptableAnswers || []).map((a) => stripPunct(a));
        const userUpper = userAns.trim().toUpperCase();
        const stdLetter = stdInfo.letter?.toUpperCase();

        isCorrect =
          cleanUser === cleanCorrect ||
          cleanUser === cleanClean ||
          (!!cleanExpected && cleanUser === cleanExpected) ||
          acceptable.includes(cleanUser) ||
          (!!stdLetter && userUpper === stdLetter) ||
          (q.correctAnswer.trim().toUpperCase() === userUpper);

        scoreAwarded = isCorrect ? maxScore : 0;
        feedbackVi = isCorrect
          ? `Chính xác! ${q.explanationVi}`
          : `Chưa đúng. Đáp án chuẩn là "${cleanStdWord}". ${q.explanationVi}`;
      } else {
        // Multiple choice ABCD or Sentence Transformation / Modal Verb Rewrite
        const stripPunct = (s: string) => s.toLowerCase().replace(/[.,;!?]+$/g, '').replace(/\s+/g, ' ').trim();
        const normUser = userAns.trim();
        const normUserUpper = normUser.toUpperCase();
        const normCorrectUpper = q.correctAnswer.trim().toUpperCase();
        const cleanUser = stripPunct(userAns);
        const cleanStd = stripPunct(cleanStdWord);
        const cleanExpected = q.expectedTextAnswer ? stripPunct(q.expectedTextAnswer) : '';
        const acceptable = (q.acceptableAnswers || []).map((a) => stripPunct(a));
        const stdLetter = stdInfo.letter?.toUpperCase();

        isCorrect =
          normUserUpper === normCorrectUpper ||
          (!!stdLetter && normUserUpper === stdLetter) ||
          (!!cleanStd && cleanUser === cleanStd) ||
          (!!cleanExpected && cleanUser === cleanExpected) ||
          acceptable.includes(cleanUser);

        scoreAwarded = isCorrect ? maxScore : 0;
        feedbackVi = isCorrect
          ? `Chính xác! ${q.explanationVi}`
          : `Chưa đúng. Đáp án đúng là ${fullStdDisplay}. ${q.explanationVi}`;
      }

      if (isCorrect) correctCount++;
      totalScore += scoreAwarded;

      gradingDetails.push({
        questionId: q.id,
        question: q,
        userAnswer: userAns,
        correctAnswer: cleanStdWord,
        isCorrect,
        scoreAwarded: parseFloat(scoreAwarded.toFixed(2)),
        maxScore: parseFloat(maxScore.toFixed(2)),
        charErrors,
        penalty,
        feedbackVi,
      });

      // Stats
      if (!categoryStats[q.questionType]) {
        categoryStats[q.questionType] = { correct: 0, total: 0, pointsEarned: 0, maxPoints: 0 };
      }
      categoryStats[q.questionType]!.total += 1;
      categoryStats[q.questionType]!.maxPoints = (categoryStats[q.questionType]!.maxPoints || 0) + maxScore;
      if (isCorrect) categoryStats[q.questionType]!.correct += 1;
      categoryStats[q.questionType]!.pointsEarned = (categoryStats[q.questionType]!.pointsEarned || 0) + scoreAwarded;

      if (!unitStats[q.unit]) {
        unitStats[q.unit] = { correct: 0, total: 0 };
      }
      unitStats[q.unit]!.total += 1;
      if (isCorrect) unitStats[q.unit]!.correct += 1;
    });

    // Bound final score strictly in [0, 10]
    // If all questions are correct in pure MCQ / Tenses, guarantee 10.0 precisely
    const rawScore = (correctCount === totalQuestions && !questions.some((q) => q.questionType === 'word_form'))
      ? 10
      : totalScore;
    const finalScore = Math.min(10, Math.max(0, Math.round(rawScore * 100) / 100));

    // Register questions as used for deduplication
    markQuestionFingerprintsAsUsed(questions);

    if (finalScore >= 8.0) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }

    const submission: UserExamSubmission = {
      id: `sub-${Date.now()}`,
      examId: `exam-${Date.now()}`,
      examCode: questions[0]?.id ? `ENG-${Date.now().toString().slice(-6)}` : 'ENG-TEST',
      examTitle,
      mode: 'multiple_choice',
      grade: questions[0]?.grade || 11,
      timestamp: Date.now(),
      durationSecondsSpent: secondsElapsed,
      totalQuestions,
      correctCount,
      scoreOutOf10: finalScore,
      answers,
      questions,
      gradingDetails,
      categoryBreakdown: categoryStats,
      unitBreakdown: unitStats,
    };

    onFinishExam(submission);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'word_form':
        return 'Word Form (Biến đổi từ)';
      case 'tenses':
      case 'tense_form':
        return 'Chia thì động từ';
      case 'pronunciation':
        return 'Ngữ âm • Phát âm';
      case 'stress':
        return 'Ngữ âm • Trọng âm';
      case 'reading':
        return 'Đọc hiểu văn bản';
      case 'grammar':
        return 'Ngữ pháp';
      case 'vocabulary':
        return 'Từ vựng';
      default:
        return 'Trắc nghiệm ABCD';
    }
  };

  const textSizes = ['text-sm sm:text-base', 'text-base sm:text-lg', 'text-lg sm:text-xl'];
  const isInputQuestion =
    !currentQuestion?.options ||
    currentQuestion.options.length === 0 ||
    currentQuestion.questionType === 'word_form' ||
    currentQuestion.questionType === 'tenses' ||
    currentQuestion.questionType === 'tense_form';

  const isWallpaperActive = themeSettings.wallpaperEnabled && !!themeSettings.wallpaperUrl;

  return (
    <div className={`min-h-screen flex flex-col font-sans relative ${isWallpaperActive ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background Wallpaper with 80% opacity overlay */}
      {isWallpaperActive && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src={themeSettings.wallpaperUrl}
            alt="Theme Wallpaper"
            className="w-full h-full object-cover"
          />
          {/* Mờ đi 5% lớp phủ nền */}
          <div className="absolute inset-0 bg-slate-950/5 backdrop-blur-[1px]" />
        </div>
      )}

      {/* Top Bar with Timer and Progress */}
      <header className={`sticky top-0 z-40 border-b px-4 sm:px-6 py-3 shadow-xs relative ${
        isWallpaperActive
          ? 'bg-white/85 backdrop-blur-md border-white/30'
          : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsExitConfirmOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-semibold flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {examTitle}
              </h2>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>Câu {currentIndex + 1} / {totalQuestions}</span>
                <span>•</span>
                <span>Đã làm: {answeredCount}/{totalQuestions}</span>
              </div>
            </div>
          </div>

          {/* Timer and Controls */}
          <div className="flex items-center gap-3">
            {/* Font scaling */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setFontSizeLevel((prev) => Math.max(0, prev - 1))}
                className="p-1 rounded text-slate-600 hover:text-indigo-600 hover:bg-white text-xs font-bold"
                title="Giảm cỡ chữ"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeLevel((prev) => Math.min(2, prev + 1))}
                className="p-1 rounded text-slate-600 hover:text-indigo-600 hover:bg-white text-xs font-bold"
                title="Tăng cỡ chữ"
              >
                A+
              </button>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-extrabold border ${
                durationMinutes !== null && secondsRemaining < 300
                  ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>
                {durationMinutes !== null
                  ? formatTime(secondsRemaining)
                  : `${formatTime(secondsElapsed)} (Tự do)`}
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="py-1.5 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Nộp bài</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1 mt-2.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full transition-all duration-300"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question Area */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className={`${isWallpaperActive ? 'bg-white/85 backdrop-blur-md border border-white/60 shadow-md' : 'bg-white border border-slate-200 shadow-xs'} rounded-3xl p-6 sm:p-8 space-y-5`}>
            {/* Section Header if available */}
            {currentQuestion.sectionTitle && (
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-xs font-extrabold flex items-center justify-between">
                <span>{currentQuestion.sectionTitle}</span>
                <span className="text-[10px] bg-indigo-200/60 px-2 py-0.5 rounded text-indigo-800 font-bold">
                  {currentQuestion.points ? `${currentQuestion.points} điểm/câu` : `${(10 / totalQuestions).toFixed(2)}đ/câu`}
                </span>
              </div>
            )}

            {/* Question Header & Meta */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                  Câu {currentIndex + 1}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                  Lớp {currentQuestion.grade} • Unit {currentQuestion.unit}
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {getQuestionTypeLabel(currentQuestion.questionType)}
                </span>
                {currentQuestion.targetWord && (
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Từ gốc: {currentQuestion.targetWord.toUpperCase()}
                  </span>
                )}
                {currentQuestion.tenseName && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                    Thì: {currentQuestion.tenseName}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakEnglish(currentQuestion.question)}
                  className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Phát âm câu hỏi bằng tiếng Anh"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                    flagged[currentQuestion.id]
                      ? 'bg-amber-100 text-amber-800 font-bold'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="Đánh dấu xem lại sau"
                >
                  <Flag className="w-4 h-4 fill-current" />
                  <span className="hidden sm:inline">
                    {flagged[currentQuestion.id] ? 'Đã đánh dấu' : 'Đánh dấu'}
                  </span>
                </button>
              </div>
            </div>

            {/* Reading Passage if applicable */}
            {currentQuestion.passage && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed max-h-56 overflow-y-auto space-y-2">
                <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                  <span>Đoạn văn đọc hiểu:</span>
                </div>
                <p className="whitespace-pre-line">{currentQuestion.passage}</p>
              </div>
            )}

            {/* Question Text */}
            <div className={`font-semibold text-slate-900 leading-relaxed ${textSizes[fontSizeLevel]}`}>
              <p className="whitespace-pre-line">
                <FormattedText text={currentQuestion.question} />
              </p>
            </div>

            {/* Answer Area: Dual Mode (Viết chữ / Điền từ trực tiếp & Trắc nghiệm ABCD) */}
            <div className="pt-3 space-y-4">
              {/* Text Input Box ("Viết chữ") */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-indigo-600" />
                    <span>Viết chữ / Điền từ / Viết lại câu trực tiếp:</span>
                  </span>
                  <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    Tùy chọn: Nhập vắn tắt hoặc câu đầy đủ
                  </span>
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={
                    currentQuestion.questionType === 'word_form'
                      ? `Nhập dạng từ đúng của [${currentQuestion.targetWord || 'từ gốc'}]...`
                      : currentQuestion.questionType === 'tenses' || currentQuestion.questionType === 'tense_form'
                      ? 'Nhập dạng đúng của động từ chia thì...'
                      : currentQuestion.questionType === 'modal_verb_order' || currentQuestion.questionType === 'sentence_transformation'
                      ? 'Viết lại câu ngắn dùng Modal Verb (must, have to, should, ought to, mustn\'t...)'
                      : 'Nhập đáp án hoặc câu trả lời bằng chữ...'
                  }
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleTextAnswerChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
                />
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Lưu ý: Hệ thống tự động chuẩn hóa chữ hoa/thường & khoảng trắng.</span>
                  {currentQuestion.questionType === 'word_form' && (
                    <span className="text-emerald-700 font-medium">
                      {isStandardMidterm
                        ? 'Word Form giữa kì: 0.25đ/câu • Sai 1 chữ trừ 0.05đ'
                        : 'Word Form đơn: Trừ điểm theo ký tự sai (0.30đ / 0.15đ)'}
                    </span>
                  )}
                </div>
              </div>

              {/* MCQ ABCD Options if available */}
              {currentQuestion.options && currentQuestion.options.length >= 2 && (
                <div className="space-y-2.5 pt-1">
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide">
                    Hoặc chọn lựa chọn trắc nghiệm A, B, C, D:
                  </label>
                  <div className="space-y-2.5">
                    {currentQuestion.options.map((optText, i) => {
                      const optKey = ['A', 'B', 'C', 'D'][i] || optText.slice(0, 1).toUpperCase();
                      const rawOptText = optText.replace(/^[A-D]\.\s*/, '').trim();
                      const isSelected =
                        answers[currentQuestion.id] === optKey ||
                        answers[currentQuestion.id]?.trim().toLowerCase() === rawOptText.toLowerCase();

                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => handleSelectOption(optKey)}
                          className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-start gap-3.5 ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold shadow-xs ring-2 ring-indigo-200'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-800'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                            }`}
                          >
                            {optKey}
                          </span>
                          <span className={`text-xs sm:text-sm pt-0.5 leading-snug ${isSelected ? 'font-bold' : 'font-medium'}`}>
                            <FormattedText text={rawOptText} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Prev / Next Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              Câu trước
            </button>

            <span className="text-xs text-slate-500 font-medium">
              Câu {currentIndex + 1} trên {totalQuestions}
            </span>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
              >
                Câu tiếp theo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
              >
                Nộp bài thi
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Question Navigator Palette (Ô Mục Lục) */}
        <div className="lg:col-span-4">
          <div className={`${isWallpaperActive ? 'bg-white/80 backdrop-blur-md border border-white/60 shadow-xl' : 'bg-white/90 backdrop-blur-sm border border-slate-200 shadow-xs'} rounded-3xl p-5 space-y-5 sticky top-20`}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Bảng Câu Hỏi (Mục Lục)
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">
                  Mờ 80%
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {answeredCount}/{totalQuestions} đã làm
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" />
                <span>Đã làm</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                <span>Đánh dấu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-slate-300 bg-slate-100 inline-block" />
                <span>Chưa làm</span>
              </div>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-80 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id] && answers[q.id].trim().length > 0;
                const isFlagged = !!flagged[q.id];
                const isCurrent = idx === currentIndex;

                let btnClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (isAnswered) {
                  btnClass = 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold';
                }
                if (isFlagged) {
                  btnClass = 'bg-amber-400 text-amber-950 border-amber-500 font-bold';
                }
                if (isCurrent) {
                  btnClass += ' ring-2 ring-indigo-500 ring-offset-2';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-xl border text-xs flex items-center justify-center transition-all relative ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Submit Block */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="w-full py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Hoàn thành & Nộp bài
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
              <Send className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Bạn có chắc chắn muốn nộp bài?</h3>
              <p className="text-xs text-slate-500">
                Sau khi nộp, hệ thống sẽ chấm điểm chi tiết theo thang 10, phân tích lỗi ký tự Word Form và cập nhật điểm ELO.
              </p>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 text-xs">
              <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-slate-500">Đã trả lời</div>
                <div className="text-base font-extrabold text-indigo-600">
                  {answeredCount} / {totalQuestions}
                </div>
              </div>
              <div className="text-center p-2 bg-white rounded-xl border border-slate-100">
                <div className="text-slate-500">Chưa trả lời</div>
                <div className={`text-base font-extrabold ${totalQuestions - answeredCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {totalQuestions - answeredCount} câu
                </div>
              </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>Bạn vẫn còn {totalQuestions - answeredCount} câu chưa làm. Bạn vẫn có thể tiếp tục làm bài.</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 text-xs"
              >
                Tiếp tục làm
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  handleFinalSubmit();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold text-white text-xs shadow-md"
              >
                Xác nhận nộp bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {isExitConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900">Rời khỏi bài thi?</h4>
              <p className="text-xs text-slate-500">
                Các câu trả lời hiện tại sẽ không được lưu vào bảng điểm nếu bạn thoát ngay lúc này.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsExitConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Ở lại làm tiếp
              </button>
              <button
                onClick={onExit}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs"
              >
                Rời khỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

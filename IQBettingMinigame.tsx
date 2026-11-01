import React, { useState, useEffect } from 'react';
import {
  Zap,
  Award,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  ShieldAlert,
  ArrowRight,
  Brain,
  Clock,
  Play,
  Sparkles,
} from 'lucide-react';
import { Question, StudentProfile } from '../types';
import { getStoredQuestionBank, saveStudentProfile } from '../services/storage';
import { getEloTier } from '../utils/elo';

interface IQBettingMinigameProps {
  profile: StudentProfile;
  onRefreshProfile: () => void;
}

export const IQBettingMinigame: React.FC<IQBettingMinigameProps> = ({
  profile,
  onRefreshProfile,
}) => {
  const [questionsPool, setQuestionsPool] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Game Status: 'idle' (Lobby) | 'playing' | 'won' | 'lost'
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [eloDelta, setEloDelta] = useState<number>(0);

  // 5 Minutes (300 seconds) countdown timer
  const TOTAL_TIME_SECONDS = 300;
  const [timeLeft, setTimeLeft] = useState<number>(TOTAL_TIME_SECONDS);

  // Target score to win
  const TARGET_SCORE = 20;

  // Helper to check if a specific option is correct (Handles 'A', 'A. text', 'text' variants perfectly)
  const isOptionCorrect = (opt: string, correctAnswer: string): boolean => {
    if (!opt || !correctAnswer) return false;

    const cleanOpt = opt.trim().toLowerCase();
    const cleanCorrect = correctAnswer.trim().toLowerCase();

    // Exact string equality
    if (cleanOpt === cleanCorrect) return true;

    // Compare single letter prefixes (e.g. 'A' vs 'A. ...' or 'A')
    const optPrefix = opt.trim().substring(0, 1).toUpperCase();
    const correctPrefix = correctAnswer.trim().substring(0, 1).toUpperCase();

    if (['A', 'B', 'C', 'D'].includes(correctPrefix) && cleanCorrect.length <= 2) {
      if (optPrefix === correctPrefix) return true;
    }

    // Compare content without 'A.', 'B.', 'C.', 'D.' prefix
    const optTextWithoutLetter = opt.replace(/^[A-D][.\s:)]+/i, '').trim().toLowerCase();
    const correctTextWithoutLetter = correctAnswer.replace(/^[A-D][.\s:)]+/i, '').trim().toLowerCase();

    if (optTextWithoutLetter && correctTextWithoutLetter) {
      if (optTextWithoutLetter === correctTextWithoutLetter) return true;
    }

    if (optTextWithoutLetter === cleanCorrect) return true;

    return false;
  };

  // Prepare questions pool with verified options & answers
  const prepareQuestions = () => {
    const rawBank = getStoredQuestionBank();
    const validMcqQuestions = rawBank.filter((q) => {
      if (!q.question || !q.correctAnswer || !Array.isArray(q.options) || q.options.length < 2) {
        return false;
      }
      // Ensure at least 1 option satisfies isOptionCorrect
      const hasMatchingOption = q.options.some((opt) => isOptionCorrect(opt, q.correctAnswer));
      return hasMatchingOption;
    });

    const shuffled = [...validMcqQuestions].sort(() => 0.5 - Math.random());
    setQuestionsPool(shuffled);
  };

  useEffect(() => {
    prepareQuestions();
  }, []);

  // Start round
  const handleStartGame = () => {
    prepareQuestions();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setEloDelta(0);
    setGameStatus('playing');
  };

  // 5 Minutes Countdown Timer Effect
  useEffect(() => {
    if (gameStatus !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOutLoss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  const currentQuestion = questionsPool[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isAnswered || gameStatus !== 'playing' || !currentQuestion) return;

    const correct = isOptionCorrect(opt, currentQuestion.correctAnswer);

    setSelectedOption(opt);
    setIsAnswered(true);
    setIsCorrect(correct);

    let nextScore = score;
    let nextStreak = streak;

    if (correct) {
      nextScore = score + 1;
      nextStreak = streak + 1;
    } else {
      nextScore = Math.max(0, score - 2); // Min score 0, khong bi am
      nextStreak = 0;
    }

    setScore(nextScore);
    setStreak(nextStreak);

    // Check Win Condition (du 20 diem)
    if (nextScore >= TARGET_SCORE) {
      handleWinGame();
    }
  };

  const handleWinGame = () => {
    setGameStatus('won');
    const winReward = 16; // Cong +16 ELO
    setEloDelta(winReward);

    const oldElo = profile.elo ?? 1300;
    const newElo = Math.min(2000, oldElo + winReward);
    const newTier = getEloTier(newElo);

    const updatedProfile: StudentProfile = {
      ...profile,
      elo: newElo,
      eloHistory: [
        {
          timestamp: Date.now(),
          oldElo,
          newElo,
          delta: winReward,
          score: TARGET_SCORE,
          examTitle: 'Đấu Trường IQ Cao Nhất (Thắng Đặt Cược 20 Điểm)',
          tier: newTier,
        },
        ...(profile.eloHistory || []),
      ],
    };

    saveStudentProfile(updatedProfile);
    onRefreshProfile();
  };

  const handleTimeOutLoss = () => {
    setGameStatus('lost');
    const lossPenalty = -20; // Tru -20 ELO
    setEloDelta(lossPenalty);

    const oldElo = profile.elo ?? 1300;
    const newElo = Math.max(0, oldElo + lossPenalty);
    const newTier = getEloTier(newElo);

    const updatedProfile: StudentProfile = {
      ...profile,
      elo: newElo,
      eloHistory: [
        {
          timestamp: Date.now(),
          oldElo,
          newElo,
          delta: lossPenalty,
          score: score,
          examTitle: 'Đấu Trường IQ Cao Nhất (Hết 5 phút đặt cược ELO)',
          tier: newTier,
        },
        ...(profile.eloHistory || []),
      ],
    };

    saveStudentProfile(updatedProfile);
    onRefreshProfile();
  };

  const handleLoseGame = () => {
    setGameStatus('lost');
    const lossPenalty = -20;
    setEloDelta(lossPenalty);

    const oldElo = profile.elo ?? 1300;
    const newElo = Math.max(0, oldElo + lossPenalty);
    const newTier = getEloTier(newElo);

    const updatedProfile: StudentProfile = {
      ...profile,
      elo: newElo,
      eloHistory: [
        {
          timestamp: Date.now(),
          oldElo,
          newElo,
          delta: lossPenalty,
          score: score,
          examTitle: 'Đấu Trường IQ Cao Nhất (Bỏ cuộc Đặt Cược ELO)',
          tier: newTier,
        },
        ...(profile.eloHistory || []),
      ],
    };

    saveStudentProfile(updatedProfile);
    onRefreshProfile();
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= questionsPool.length) {
      const shuffled = [...questionsPool].sort(() => 0.5 - Math.random());
      setQuestionsPool(shuffled);
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render question text with UNDERLINED blanks and target root words
  const renderFormattedQuestion = (questionText: string) => {
    if (!questionText) return null;

    // Split text by blanks or parentheses e.g. "___", "_______", "(WORD)"
    const parts = questionText.split(/(_+|\([A-Z\s,/-]+\))/g);

    return (
      <span className="leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith('_')) {
            return (
              <u
                key={idx}
                className="font-black text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border-b-2 border-indigo-600 underline decoration-indigo-600 decoration-2 underline-offset-4 mx-1 inline-block"
              >
                &nbsp;&nbsp;{part}&nbsp;&nbsp;
              </u>
            );
          }
          if (part.startsWith('(') && part.endsWith(')')) {
            return (
              <u
                key={idx}
                className="font-black text-purple-800 bg-purple-100/80 px-2 py-0.5 rounded border border-purple-300 underline decoration-purple-600 decoration-2 underline-offset-2 mx-1 inline-block"
              >
                {part}
              </u>
            );
          }
          return <span key={idx}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header Banner Arena */}
      <div className="bg-gradient-to-r from-amber-600 via-purple-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            Đấu Trường IQ Cao Nhất • Đặt Cược ELO (5 Phút)
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Đạt 20 Điểm Trong 5 Phút Nhận Ngay +16 ELO
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
            Áp dụng các câu hỏi <strong>Trắc nghiệm (A, B, C, D)</strong>. Đúng <strong>+1 điểm</strong>, Sai <strong>-2 điểm (không âm)</strong>. Thắng nhận +16 ELO, Hết giờ/Thua trừ -20 ELO.
          </p>
        </div>

        {/* Status / Timer Header Cards */}
        {gameStatus === 'playing' ? (
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
              <div className="text-[10px] uppercase font-bold text-amber-200">Thời gian còn lại</div>
              <div className="text-2xl font-black text-amber-300 font-mono flex items-center justify-center gap-1">
                <Clock className="w-5 h-5 animate-spin" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
              <div className="text-[10px] uppercase font-bold text-amber-200">Điểm hiện tại</div>
              <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>{score}</span>
                <span className="text-xs text-amber-200 font-normal">/ {TARGET_SCORE}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/15 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/20">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Thưởng Thắng</div>
              <div className="text-xl font-black text-emerald-300 font-mono">+16 ELO</div>
              <div className="text-[10px] text-rose-300">Thua / Hết giờ: -20 ELO</div>
            </div>
          </div>
        )}
      </div>

      {/* IDLE LOBBY STATE */}
      {gameStatus === 'idle' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-200">
            <Brain className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl font-black text-slate-900">
              Sẵn sàng bước vào Đấu Trường IQ?
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có <strong>5 phút (300 giây)</strong> để hoàn thành thử thách đạt <strong>20 điểm</strong>. Mỗi câu trả lời đúng cộng +1 điểm, sai trừ -2 điểm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold">
              ⏱️ Thời gian: 5 Phút
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold">
              🎯 Mục tiêu: 20 Điểm
            </div>
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 font-semibold">
              ⚡ Thưởng: +16 ELO
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartGame}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-200 flex items-center gap-2 mx-auto transition-transform hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>🚀 BẮT ĐẦU TRẬN ĐẤU (5 PHÚT)</span>
          </button>
        </div>
      )}

      {/* PLAYING STATE */}
      {gameStatus === 'playing' && (
        <>
          {/* Progress Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-purple-600" />
                Tiến độ 20 điểm IQ Arena (Thời gian còn: {formatTime(timeLeft)})
              </span>
              <span className="text-indigo-600 font-mono">{Math.round((score / TARGET_SCORE) * 100)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (score / TARGET_SCORE) * 100)}%` }}
              />
            </div>
          </div>

          {/* Main Question Card Area */}
          {currentQuestion && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    Câu {currentIndex + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 uppercase">
                    {currentQuestion.topic || 'Trắc nghiệm Tiếng Anh 11'}
                  </span>
                </div>
                {streak > 1 && (
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Chuỗi đúng {streak} câu!
                  </span>
                )}
              </div>

              {/* Question Text with Clear Formatting & Underline */}
              <div className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {renderFormattedQuestion(currentQuestion.question)}
                </h2>
                {currentQuestion.passage && (
                  <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-200 max-h-48 overflow-y-auto">
                    {currentQuestion.passage}
                  </div>
                )}
              </div>

              {/* MCQ Options A, B, C, D */}
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isOptCorrect = isOptionCorrect(opt, currentQuestion.correctAnswer);
                  const isUserSelected = selectedOption === opt;

                  let optStyle = 'bg-slate-50 text-slate-800 hover:bg-indigo-50/60 border-slate-200 hover:border-indigo-300';
                  let badgeStyle = 'bg-slate-200 text-slate-700';

                  if (isAnswered) {
                    if (isOptCorrect) {
                      optStyle = 'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-300 font-bold';
                      badgeStyle = 'bg-emerald-600 text-white font-black';
                    } else if (isUserSelected && !isOptCorrect) {
                      optStyle = 'bg-rose-50 text-rose-950 border-rose-400 font-bold';
                      badgeStyle = 'bg-rose-600 text-white font-black';
                    } else {
                      optStyle = 'bg-slate-50 text-slate-400 border-slate-200 opacity-50';
                      badgeStyle = 'bg-slate-100 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 ${badgeStyle}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="font-semibold leading-normal">{opt}</span>
                      </div>

                      {isAnswered && isOptCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đáp án đúng
                        </span>
                      )}
                      {isAnswered && isUserSelected && !isOptCorrect && (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-300 shrink-0">
                          <XCircle className="w-4 h-4 text-rose-600" /> Lựa chọn của bạn
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Navigation */}
              {isAnswered && (
                <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-in">
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3 ${
                      isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 text-xs">
                      <div className="font-black text-sm">
                        {isCorrect ? 'Chính xác! (+1 điểm)' : 'Chưa đúng! (-2 điểm)'}
                      </div>
                      {currentQuestion.explanationVi && (
                        <p className="text-slate-700 leading-relaxed">
                          💡 <strong>Giải thích chi tiết:</strong> {currentQuestion.explanationVi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleLoseGame}
                      className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      Bỏ cuộc & Trừ -20 ELO
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-200 flex items-center gap-2"
                    >
                      <span>Câu tiếp theo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* VICTORY MODAL (+16 ELO) */}
      {gameStatus === 'won' && (
        <div className="bg-gradient-to-b from-emerald-900 to-indigo-950 rounded-3xl p-8 text-white shadow-2xl text-center space-y-6 border border-emerald-500/30">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-400/40 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300">
              🎉 CHIẾN THẮNG XUẤT SẮC!
            </h2>
            <p className="text-sm text-emerald-100 max-w-md mx-auto">
              Chúc mừng bạn đã xuất sắc cán mốc <strong>20 điểm IQ Arena</strong> trong thời gian 5 phút! Bạn nhận được phần thưởng ELO xứng đáng.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/30 text-emerald-300 font-mono font-black text-xl">
            <Zap className="w-6 h-6 fill-amber-400 text-amber-400" />
            <span>+16 ELO Đã cộng vào Hồ sơ!</span>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 font-black"
            >
              <RotateCcw className="w-4 h-4" />
              Chơi lại trận IQ mới (5 phút)
            </button>
          </div>
        </div>
      )}

      {/* DEFEAT MODAL (-20 ELO) */}
      {gameStatus === 'lost' && (
        <div className="bg-gradient-to-b from-rose-950 to-slate-900 rounded-3xl p-8 text-white shadow-2xl text-center space-y-6 border border-rose-500/30">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-400/40">
            <ShieldAlert className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-rose-400">
              TRẬN ĐẤU KẾT THÚC
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              {timeLeft <= 0
                ? 'Đã hết 5 phút thời gian làm bài mà chưa đạt đủ 20 điểm. Hệ thống đã trừ ELO theo quy định.'
                : 'Bạn đã dừng cuộc chơi khi chưa đạt đủ 20 điểm. Hệ thống đã trừ ELO theo quy định đặt cược.'}
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-rose-400/30 text-rose-300 font-mono font-black text-xl">
            <span>-20 ELO</span>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-lg flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Thử sức lại trận mới (5 phút)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

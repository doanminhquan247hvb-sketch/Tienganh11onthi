import React, { useState } from 'react';
import {
  AlertTriangle,
  Sparkles,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BookOpen,
  Brain,
  HelpCircle,
} from 'lucide-react';
import { UserExamSubmission, Question, RemediationPlan } from '../types';
import { getRemediationPlan, saveRemediationPlan } from '../services/storage';
import { getStandardAnswerDisplay } from '../utils/answerFormatter';
import { FormattedText } from './FormattedText';

interface MistakesAndRemediationProps {
  submissions: UserExamSubmission[];
  studentName: string;
}

export const MistakesAndRemediation: React.FC<MistakesAndRemediationProps> = ({
  submissions,
  studentName,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [remediationPlan, setRemediationPlan] = useState<RemediationPlan | null>(getRemediationPlan());
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [showAnswerResult, setShowAnswerResult] = useState<{ [qId: string]: boolean }>({});

  // Gather all unique wrong questions from submissions
  const allMistakes: Array<{ question: Question; chosen: string; submissionTitle: string }> = [];
  const seenQIds = new Set<string>();

  submissions.forEach((sub) => {
    sub.questions.forEach((q) => {
      const chosen = sub.answers[q.id];
      const detail = sub.gradingDetails?.find((d) => d.questionId === q.id);
      const isWrong = detail !== undefined
        ? !detail.isCorrect
        : (chosen && chosen.trim().toLowerCase() !== q.correctAnswer.trim().toLowerCase());

      if (chosen && isWrong && !seenQIds.has(q.id)) {
        seenQIds.add(q.id);
        allMistakes.push({
          question: q,
          chosen,
          submissionTitle: sub.examTitle,
        });
      }
    });
  });

  const handleGeneratePlan = async () => {
    if (allMistakes.length === 0) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-mistakes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          mistakes: allMistakes.slice(0, 8).map((m) => ({
            topic: m.question.topic,
            unit: m.question.unit,
            question: m.question.question,
            chosen: m.chosen,
            correctAnswer: m.question.correctAnswer,
          })),
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setRemediationPlan(data.data);
        saveRemediationPlan(data.data);
      }
    } catch (e) {
      console.error('Error generating remediation plan', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptionSelect = (qId: string, optKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optKey }));
    setShowAnswerResult((prev) => ({ ...prev, [qId]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
          <Brain className="w-3.5 h-3.5" />
          Phân tích chuyên sâu & khắc phục lỗ hổng
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          Sổ Tay Lỗi Sai & Kế Hoạch Ôn Tập Cấp Tốc
        </h1>
        <p className="text-amber-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
          Tập hợp các câu hỏi bạn đã làm sai trong các bài kiểm tra gần đây. Gia sư AI sẽ phân tích nguyên nhân nhầm lẫn và thiết kế lộ trình ôn tập khắc phục.
        </p>
      </div>

      {/* AI Analysis Trigger */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">
              Tổng số lỗi sai cần khắc phục: {allMistakes.length} câu
            </h2>
            <p className="text-xs text-gray-500">
              Nhấn nút để AI phân tích nguyên nhân và tạo bài tập luyện bù
            </p>
          </div>

          <button
            onClick={handleGeneratePlan}
            disabled={isAnalyzing || allMistakes.length === 0}
            className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-200 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isAnalyzing ? 'Đang phân tích dữ liệu...' : 'AI Phân Tích Lỗi & Lập Kế Hoạch'}</span>
          </button>
        </div>

        {/* Remediation Plan Display if exists */}
        {remediationPlan && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-6">
            {/* Summary */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/60 text-indigo-950 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Brain className="w-4 h-4" /> Đánh giá từ Gia sư AI:
              </span>
              <p className="text-xs leading-relaxed font-medium">
                {remediationPlan.summary}
              </p>
            </div>

            {/* Weak topics & study tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">Chủ đề cần ưu tiên ôn:</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  {remediationPlan.weakTopics?.map((wt, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      <span>{wt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase">Mẹo làm bài tránh bẫy:</h4>
                <ul className="space-y-1 text-xs text-gray-700">
                  {remediationPlan.studyTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Schedule */}
            {remediationPlan.schedule && remediationPlan.schedule.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Lịch Ôn Cấp Tốc Trước Kì Thi
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {remediationPlan.schedule.map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/40 space-y-1">
                      <div className="text-xs font-bold text-purple-900">{item.day}</div>
                      <div className="text-[11px] font-semibold text-gray-800">{item.focus}</div>
                      <div className="text-[10px] text-gray-500">{item.action}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Targeted Practice Questions */}
            {remediationPlan.practiceQuestions && remediationPlan.practiceQuestions.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Bài Tập Luyện Bù Do AI Sinh Tức Thì ({remediationPlan.practiceQuestions.length} câu)
                </h4>

                <div className="space-y-4">
                  {remediationPlan.practiceQuestions.map((q, idx) => {
                    const chosen = userAnswers[q.id];
                    const hasSubmitted = !!showAnswerResult[q.id];

                    return (
                      <div key={q.id} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3">
                        <div className="text-xs font-bold text-indigo-700">
                          Câu luyện tập #{idx + 1}
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-900">
                          {q.question}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {q.options.map((opt, i) => {
                            const optKey = ['A', 'B', 'C', 'D'][i];
                            const isCorrect = q.correctAnswer === optKey;
                            const isSelected = chosen === optKey;

                            let btnClass = 'border-gray-200 hover:border-gray-300 text-gray-800';
                            if (hasSubmitted) {
                              if (isCorrect) btnClass = 'border-green-500 bg-green-50 text-green-950 font-bold';
                              else if (isSelected) btnClass = 'border-red-500 bg-red-50 text-red-950 line-through';
                            }

                            return (
                              <button
                                key={optKey}
                                onClick={() => handleOptionSelect(q.id, optKey)}
                                disabled={hasSubmitted}
                                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 ${btnClass}`}
                              >
                                <span className="font-bold shrink-0">{optKey}.</span>
                                <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                              </button>
                            );
                          })}
                        </div>

                        {hasSubmitted && (
                          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700 leading-relaxed">
                            <span className="font-bold text-indigo-900">Giải thích: </span>
                            {q.explanationVi}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Raw Mistake Review List */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-gray-900">
          Danh Sách Các Câu Đã Từng Làm Sai ({allMistakes.length})
        </h3>

        {allMistakes.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-gray-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
            <h4 className="text-sm font-bold text-gray-800">Không có câu sai nào!</h4>
            <p className="text-xs text-gray-500">
              Bạn chưa có câu làm sai nào trong các bài kiểm tra gần đây. Hãy tiếp tục làm đề thi thử để kiểm tra phong độ nhé.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {allMistakes.map((m, idx) => (
              <div
                key={m.question.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-gray-900">
                      Unit {m.question.unit} • {m.question.topic}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400">{m.submissionTitle}</span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-gray-900 leading-relaxed">
                  <FormattedText text={m.question.question} />
                </div>

                {(() => {
                  const stdInfo = getStandardAnswerDisplay(m.question);
                  return (
                    <div className="flex items-center gap-4 text-xs font-semibold flex-wrap">
                      <span className="text-red-600 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Bạn chọn: {m.chosen}
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đáp án chuẩn: {stdInfo.wordOnly} {stdInfo.letter ? `(${stdInfo.letter})` : ''}
                      </span>
                    </div>
                  );
                })()}

                <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-600 leading-relaxed">
                  {m.question.explanationVi}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

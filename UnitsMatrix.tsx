import React from 'react';
import {
  BookOpen,
  ArrowRight,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { GLOBAL_SUCCESS_UNITS, INITIAL_QUESTION_BANK } from '../data/curriculum';
import { Question } from '../types';

interface UnitsMatrixProps {
  onStartUnitExam: (unitNumber: number, title: string, questions: Question[]) => void;
  onOpenVocabulary: () => void;
  onOpenGrammar: () => void;
}

export const UnitsMatrix: React.FC<UnitsMatrixProps> = ({
  onStartUnitExam,
  onOpenVocabulary,
  onOpenGrammar,
}) => {
  const handleLaunchUnitQuiz = (unitNum: number, unitTitle: string) => {
    let unitQuestions = INITIAL_QUESTION_BANK.filter((q) => q.unit === unitNum);
    if (unitQuestions.length < 5) {
      unitQuestions = INITIAL_QUESTION_BANK.slice(0, 15);
    }

    onStartUnitExam(
      unitNum,
      `Kiểm tra nhanh Unit ${unitNum}: ${unitTitle}`,
      unitQuestions
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          Chương trình Tiếng Anh 11 - Global Success
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Hệ Thống 10 Unit Toàn Năm Học
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Học kì 1 (Unit 1 – Unit 5) • Học kì 2 (Unit 6 – Unit 10)
        </p>
      </div>

      {/* Grid of 10 Units */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {GLOBAL_SUCCESS_UNITS.map((unit) => (
          <div
            key={unit.number}
            className="p-6 rounded-3xl bg-white border border-gray-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-indigo-600 text-white">
                  Unit {unit.number}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  Học kì {unit.semester}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-gray-900">{unit.title}</h3>
                <h4 className="text-xs font-medium text-indigo-600 mt-0.5">
                  {unit.vietnameseTitle}
                </h4>
              </div>

              {/* Grammar focus */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                <div className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5 uppercase">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trọng tâm ngữ pháp:</span>
                </div>
                <p className="text-xs font-semibold text-indigo-950">
                  {unit.grammarFocus}
                </p>
                <p className="text-[11px] text-gray-500 line-clamp-2">
                  {unit.grammarDescription}
                </p>
              </div>

              {/* Vocab Tags */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Từ vựng nổi bật:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {unit.vocabularyTopics.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-purple-50 text-purple-800 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenVocabulary}
                  className="text-xs font-bold text-gray-600 hover:text-indigo-600"
                >
                  Từ vựng
                </button>
                <span className="text-gray-300">•</span>
                <button
                  onClick={onOpenGrammar}
                  className="text-xs font-bold text-gray-600 hover:text-indigo-600"
                >
                  Lý thuyết
                </button>
              </div>

              <button
                onClick={() => handleLaunchUnitQuiz(unit.number, unit.title)}
                className="py-2 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Làm bài tập Unit {unit.number}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

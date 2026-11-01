import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  RotateCw,
  Search,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Filter,
  CheckCircle2,
  XCircle,
  Trophy,
} from 'lucide-react';
import { GLOBAL_SUCCESS_UNITS } from '../data/curriculum';
import { COMPREHENSIVE_VOCABULARY_FLASHCARDS } from '../data/expandedVocabulary';
import { Flashcard } from '../types';
import { speakEnglish } from '../utils/speech';

export const VocabularyHub: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [flippedCards, setFlippedCards] = useState<{ [id: string]: boolean }>({});
  const [masteredWords, setMasteredWords] = useState<{ [id: string]: boolean }>({});

  // Mini Vocab Quiz Mode
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizQuestions, setQuizQuestions] = useState<Array<{ card: Flashcard; options: string[]; correctMeaning: string }>>([]);
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<string | null>(null);

  const toggleFlip = (id: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleMastered = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMasteredWords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCards = COMPREHENSIVE_VOCABULARY_FLASHCARDS.filter((card) => {
    const matchesUnit = selectedUnit === 'all' || card.unit === selectedUnit;
    const matchesQuery =
      card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.vietnameseMeaning.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesUnit && matchesQuery;
  });

  const startVocabQuiz = () => {
    const pool = selectedUnit === 'all'
      ? COMPREHENSIVE_VOCABULARY_FLASHCARDS
      : COMPREHENSIVE_VOCABULARY_FLASHCARDS.filter((c) => c.unit === selectedUnit);

    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, 5);

    const questions = shuffled.map((card) => {
      // Pick 3 random decoy meanings
      const decoys = COMPREHENSIVE_VOCABULARY_FLASHCARDS
        .filter((c) => c.id !== card.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((c) => c.vietnameseMeaning);

      const options = [card.vietnameseMeaning, ...decoys].sort(() => 0.5 - Math.random());
      return {
        card,
        options,
        correctMeaning: card.vietnameseMeaning,
      };
    });

    setQuizQuestions(questions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizSelectedAnswer(null);
    setIsQuizActive(true);
  };

  const handleQuizAnswer = (option: string) => {
    if (quizSelectedAnswer !== null) return;
    setQuizSelectedAnswer(option);

    const currentQ = quizQuestions[quizIndex];
    if (option === currentQ.correctMeaning) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const nextQuizQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((prev) => prev + 1);
      setQuizSelectedAnswer(null);
    } else {
      // Quiz finished
      setQuizIndex(quizQuestions.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Từ vựng trọng tâm Global Success 11
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Kho Từ Vựng & Flashcard Thông Minh
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Ghi nhớ từ vựng qua phát âm chuẩn bản xứ, phiên âm quốc tế IPA, ví dụ thực tế và kiểm tra nhanh.
          </p>
        </div>

        <button
          onClick={startVocabQuiz}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span>Kiểm Tra Nhanh 5 Từ Vựng</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-3xl border border-gray-200 p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Tìm từ vựng (tiếng Anh hoặc nghĩa tiếng Việt)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Unit selector badges */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUnit === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả ({COMPREHENSIVE_VOCABULARY_FLASHCARDS.length})
            </button>
            <button
              onClick={() => setSelectedUnit(1)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUnit === 1
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Unit 1 (Sức khỏe - 26 từ)
            </button>
            <button
              onClick={() => setSelectedUnit(2)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUnit === 2
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
            >
              Unit 2 (Thế hệ & Modal Verbs - 22 từ)
            </button>
            <button
              onClick={() => setSelectedUnit(3)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedUnit === 3
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
              }`}
            >
              Unit 3 (Đô thị tương lai - 21 từ)
            </button>
            {GLOBAL_SUCCESS_UNITS.slice(3).map((u) => (
              <button
                key={u.number}
                onClick={() => setSelectedUnit(u.number)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedUnit === u.number
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unit {u.number}
              </button>
            ))}
          </div>
        </div>

        {/* Quick summary line */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 flex-wrap gap-2">
          <span>
            Đang hiển thị <strong>{filteredCards.length}</strong> từ vựng chuẩn SGK Global Success 11 kèm phát âm IPA & ví dụ song ngữ.
          </span>
          <span className="text-indigo-600 font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Nhấp vào thẻ để lật mặt xem nghĩa tiếng Việt & cụm từ collocations
          </span>
        </div>
      </div>

      {/* Flashcards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((card) => {
          const isFlipped = !!flippedCards[card.id];
          const isMastered = !!masteredWords[card.id];

          return (
            <div
              key={card.id}
              onClick={() => toggleFlip(card.id)}
              className="group relative cursor-pointer min-h-[220px] rounded-3xl perspective-1000"
            >
              <div
                className={`w-full h-full rounded-3xl border-2 transition-all duration-300 p-6 flex flex-col justify-between shadow-xs ${
                  isFlipped
                    ? 'bg-indigo-900 border-indigo-700 text-white shadow-md'
                    : isMastered
                    ? 'bg-emerald-50/50 border-emerald-300 text-gray-900'
                    : 'bg-white border-gray-200 hover:border-indigo-300 text-gray-900'
                }`}
              >
                {!isFlipped ? (
                  // Front Face: English Word, Phonetics, Audio
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        Unit {card.unit} • {card.partOfSpeech}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            speakEnglish(card.word);
                          }}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Nghe phát âm chuẩn"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => toggleMastered(card.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isMastered ? 'text-emerald-600 font-bold' : 'text-gray-300 hover:text-emerald-500'
                          }`}
                          title="Đã thuộc từ này"
                        >
                          <CheckCircle className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {card.word}
                      </h3>
                      <p className="text-xs font-mono text-gray-500 mt-0.5">{card.phonetic}</p>
                    </div>

                    <div className="pt-2 text-xs text-gray-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Chạm để xem nghĩa & ví dụ</span>
                    </div>
                  </div>
                ) : (
                  // Back Face: Vietnamese Meaning, Examples, Collocations
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20 text-indigo-200">
                        {card.partOfSpeech}
                      </span>
                      <RotateCw className="w-3.5 h-3.5 text-indigo-300" />
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-amber-300">
                        {card.vietnameseMeaning}
                      </h4>
                      <p className="text-xs text-indigo-200 mt-1 italic">
                        "{card.exampleEn}"
                      </p>
                      <p className="text-[11px] text-gray-300 mt-0.5">
                        → {card.exampleVi}
                      </p>
                    </div>

                    {card.collocations && card.collocations.length > 0 && (
                      <div className="pt-2 border-t border-indigo-800 text-[11px] text-indigo-200">
                        <span className="font-bold text-white">Cụm hay gặp: </span>
                        {card.collocations.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vocab Quiz Modal */}
      {isQuizActive && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            {quizIndex < quizQuestions.length ? (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-extrabold text-xs">
                      Câu {quizIndex + 1} / {quizQuestions.length}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      Điểm: {quizScore}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsQuizActive(false)}
                    className="text-xs text-gray-400 hover:text-gray-700"
                  >
                    Đóng
                  </button>
                </div>

                <div className="text-center space-y-2 py-2">
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-wider">
                    Nghĩa tiếng Việt của từ:
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-2xl font-black text-gray-900">
                      {quizQuestions[quizIndex].card.word}
                    </h3>
                    <button
                      onClick={() => speakEnglish(quizQuestions[quizIndex].card.word)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs font-mono text-gray-500">
                    {quizQuestions[quizIndex].card.phonetic}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {quizQuestions[quizIndex].options.map((opt, i) => {
                    const isSelected = quizSelectedAnswer === opt;
                    const isCorrect = opt === quizQuestions[quizIndex].correctMeaning;

                    let btnClass = 'border-gray-200 hover:border-indigo-300 text-gray-800';
                    if (quizSelectedAnswer !== null) {
                      if (isCorrect) btnClass = 'border-green-500 bg-green-50 text-green-900 font-bold';
                      else if (isSelected) btnClass = 'border-red-500 bg-red-50 text-red-900 font-bold';
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(opt)}
                        className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs font-semibold transition-all flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSelectedAnswer !== null && (
                          <span>
                            {isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : isSelected ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : null}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizSelectedAnswer !== null && (
                  <button
                    onClick={nextQuizQuestion}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    {quizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
                  </button>
                )}
              </>
            ) : (
              // Quiz Complete Summary
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-gray-900">
                  Hoàn Thành Bài Kiểm Tra Từ Vựng!
                </h3>
                <p className="text-sm text-gray-600">
                  Bạn trả lời đúng <strong className="text-indigo-600 font-black">{quizScore}</strong> / {quizQuestions.length} từ vựng.
                </p>
                <button
                  onClick={() => setIsQuizActive(false)}
                  className="py-3 px-6 rounded-2xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Xong
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

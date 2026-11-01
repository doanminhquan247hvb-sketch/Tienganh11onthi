import React, { useState } from 'react';
import {
  FileText,
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  BookOpen,
  Image as ImageIcon,
  RotateCw,
  Search,
} from 'lucide-react';
import { BOARD_8_WORDS, WORD_FORM_QUIZ_QUESTIONS } from '../data/wordFormBank';
import { WordFormEntry, Question } from '../types';
import { speakEnglish } from '../utils/speech';
import { generateBoard8WordFormExam } from '../utils/examEngine';

interface WordFormHubProps {
  onStartWordFormExam?: (questions: Question[]) => void;
}

export const WordFormHub: React.FC<WordFormHubProps> = ({ onStartWordFormExam }) => {
  const [activeSubTab, setActiveSubTab] = useState<'table' | 'quiz' | 'rules'>('table');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWord, setSelectedWord] = useState<WordFormEntry | null>(BOARD_8_WORDS[0]);

  // Quiz State for practice
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [showResults, setShowResults] = useState<boolean>(false);

  const filteredWords = BOARD_8_WORDS.filter(
    (w) =>
      w.baseWord.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.vietnameseMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.noun.words.some((n) => n.toLowerCase().includes(searchQuery.toLowerCase())) ||
      w.adjective.words.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectAnswer = (qId: string, optionKey: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionKey }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    WORD_FORM_QUIZ_QUESTIONS.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  const handleStartExamWithCount = (count: 5 | 7 | 10 | 12) => {
    if (onStartWordFormExam) {
      const exam = generateBoard8WordFormExam(count);
      onStartWordFormExam(exam.questions);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner with Classroom Board Reference */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
              <Sparkles className="w-4 h-4" />
              Chuyên đề Word Form Giữa Kì 11
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              8 Từ Word Form Trọng Tâm (Danh - Động - Tính - Trạng)
            </h1>
            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              Hệ thống hóa đầy đủ 4 dạng từ (Noun, Verb, Adjective, Adverb) của 8 từ vựng trên bảng lớp học: 
              <strong className="text-white"> exhibition, efficient, sustain, renewable, interact, security, organize, advantage</strong>.
            </p>

            {/* Quick Exam Launcher Buttons for 5, 7, 10, 12 Questions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-amber-300">
                Tạo đề thi ngay (chọn số câu):
              </span>
              {[5, 7, 10, 12].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleStartExamWithCount(cnt as 5 | 7 | 10 | 12)}
                  className="px-3 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-sm hover:scale-105"
                >
                  {cnt} câu
                </button>
              ))}
            </div>
          </div>

          {/* Blackboard Image Thumbnail Preview */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 flex items-center gap-3 shrink-0">
            <img
              src="/public/assets/aistudio/image_018ca93f.png"
              alt="Bảng từ vựng 8 từ lớp học"
              className="w-16 h-24 object-cover rounded-xl border border-white/30 shadow-md"
            />
            <div className="text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> Ghi chú trên bảng
              </span>
              <p className="text-[11px] text-indigo-200 max-w-[120px]">
                8 từ gốc xuất hiện trực tiếp trong đề thi giữa kì
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveSubTab('table')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'table'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Bảng 8 Từ (Danh - Động - Tính - Trạng)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Kiểm Tra Nhanh 8 Từ ({WORD_FORM_QUIZ_QUESTIONS.length} câu)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Mẹo Nhận Biết Vị Trí Từ Trong Câu</span>
        </button>
      </div>

      {/* SUB-TAB 1: BẢNG 8 TỪ CHI TIẾT */}
      {activeSubTab === 'table' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <span className="text-xs text-gray-500 hidden sm:inline">
              Hiển thị {filteredWords.length} / 8 từ vựng
            </span>
          </div>

          {/* Cards for the 8 words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-gray-200 hover:border-indigo-300 p-6 shadow-xs space-y-4 transition-all"
              >
                {/* Header of Word Card */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-black text-xs flex items-center justify-center">
                      #{item.boardOrder}
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">
                        {item.baseWord}
                      </h3>
                      <p className="text-xs text-indigo-600 font-medium">
                        {item.vietnameseMeaning}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => speakEnglish(item.baseWord)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Nghe phát âm"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Parts of Speech Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Noun */}
                  <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider block">
                      Danh từ (Noun)
                    </span>
                    <div className="font-bold text-gray-900">
                      {item.noun.words.join(', ')}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {item.noun.meaningVi}
                    </div>
                  </div>

                  {/* Verb */}
                  <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1">
                    <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider block">
                      Động từ (Verb)
                    </span>
                    <div className="font-bold text-gray-900">
                      {item.verb.words.join(', ')}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {item.verb.meaningVi}
                    </div>
                  </div>

                  {/* Adjective */}
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wider block">
                      Tính từ (Adj)
                    </span>
                    <div className="font-bold text-gray-900">
                      {item.adjective.words.join(', ')}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {item.adjective.meaningVi}
                    </div>
                  </div>

                  {/* Adverb */}
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 space-y-1">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-wider block">
                      Trạng từ (Adv)
                    </span>
                    <div className="font-bold text-gray-900">
                      {item.adverb.words.join(', ')}
                    </div>
                    <div className="text-[11px] text-gray-500 line-clamp-1">
                      {item.adverb.meaningVi}
                    </div>
                  </div>
                </div>

                {/* Example sentence */}
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1 text-xs">
                  <div className="text-[11px] font-bold text-gray-700">Ví dụ chuẩn ngữ cảnh:</div>
                  <div className="italic text-gray-800">"{item.sampleSentence}"</div>
                  <div className="text-[11px] text-indigo-700 font-semibold pt-1">
                    Cụm từ hay gặp: {item.collocations.join(' • ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BÀI TẬP KIỂM TRA 8 TỪ WORD FORM */}
      {activeSubTab === 'quiz' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Luyện Tập Word Form: 8 Câu Hỏi Trực Tiếp Từ 8 Từ Trên Bảng
              </h3>
              <p className="text-xs text-gray-500">
                Mỗi câu tương ứng với 0,25 điểm chuẩn theo cấu trúc đề thi giữa kì
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowResults(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Chấm Điểm Ngay
              </button>
            </div>
          </div>

          {showResults && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Kết quả bài kiểm tra 8 từ Word Form:
                </div>
                <div className="text-lg font-black text-indigo-900">
                  Đúng {calculateQuizScore()} / {WORD_FORM_QUIZ_QUESTIONS.length} câu ({(calculateQuizScore() * 0.25).toFixed(2)} / 2.0 điểm)
                </div>
              </div>
              <button
                onClick={() => {
                  setUserAnswers({});
                  setShowResults(false);
                }}
                className="py-1.5 px-3 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
              >
                Làm lại
              </button>
            </div>
          )}

          <div className="space-y-6">
            {WORD_FORM_QUIZ_QUESTIONS.map((q, idx) => {
              const selected = userAnswers[q.id];
              const isCorrect = selected === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-2xl border border-gray-200 bg-gray-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-700">
                      Câu {idx + 1}: {q.topic}
                    </span>
                    {showResults && (
                      <span className={`font-bold flex items-center gap-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {isCorrect ? 'Đúng (+0.25đ)' : `Sai (Đáp án: ${q.correctAnswer})`}
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                    {q.question}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                    {q.options.map((opt, i) => {
                      const optKey = ['A', 'B', 'C', 'D'][i];
                      const isChosen = selected === optKey;
                      const isTargetCorrect = q.correctAnswer === optKey;

                      let btnStyle = 'border-gray-200 hover:border-indigo-300 bg-white text-gray-800';
                      if (isChosen) {
                        btnStyle = 'border-indigo-600 bg-indigo-600 text-white font-bold';
                      }
                      if (showResults) {
                        if (isTargetCorrect) {
                          btnStyle = 'border-green-500 bg-green-50 text-green-950 font-bold';
                        } else if (isChosen && !isTargetCorrect) {
                          btnStyle = 'border-red-500 bg-red-50 text-red-950 line-through';
                        }
                      }

                      return (
                        <button
                          key={optKey}
                          onClick={() => handleSelectAnswer(q.id, optKey)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${btnStyle}`}
                        >
                          <span className="font-extrabold">{optKey}.</span>
                          <span>{opt.replace(/^[A-D]\.\s*/, '')}</span>
                        </button>
                      );
                    })}
                  </div>

                  {showResults && (
                    <div className="p-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 leading-relaxed">
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

      {/* SUB-TAB 3: QUY TẮC & MẸO LÀM BÀI WORD FORM */}
      {activeSubTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h3 className="text-base font-extrabold text-gray-900">
            Mẹo Xác Định Danh - Động - Tính - Trạng Trong Đề Thi THPT
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-700">
            {/* Rule 1: Danh từ */}
            <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
              <h4 className="font-black text-indigo-950 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs">
                  N
                </span>
                1. Dấu hiệu cần điền DANH TỪ (Noun)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-gray-800">
                <li>Đứng đầu câu làm chủ ngữ: <strong>[Noun] + Verb...</strong></li>
                <li>Sau mạo từ (a, an, the), từ chỉ định (this, that, these, those), từ chỉ số lượng (many, some).</li>
                <li>Sau tính từ sở hữu: my, your, our, their, his, her, its.</li>
                <li>Sau tính từ: <strong>Adjective + [Noun]</strong> (vd: sustainable energy).</li>
                <li>Sau giới từ: in, on, at, of, with...</li>
                <li>Đuôi danh từ hay gặp: <em>-tion (exhibition), -ity (security), -ment, -ance/ence, -er/or (organizer).</em></li>
              </ul>
            </div>

            {/* Rule 2: Tính từ */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
              <h4 className="font-black text-emerald-950 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-xs">
                  Adj
                </span>
                2. Dấu hiệu cần điền TÍNH TỪ (Adjective)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-gray-800">
                <li>Đứng trước danh từ để bổ nghĩa: <strong>[Adj] + Noun</strong> (vd: renewable resources).</li>
                <li>Sau động từ to be: <strong>S + be + [Adj]</strong>.</li>
                <li>Sau các động từ nối (Linking verbs): look, seem, feel, taste, smell, become, get.</li>
                <li>Sau trạng từ chỉ mức độ: very, extremely, quite + [Adj].</li>
                <li>Đuôi tính từ hay gặp: <em>-able (renewable, sustainable), -ive (interactive), -ent (efficient), -ous (advantageous).</em></li>
              </ul>
            </div>

            {/* Rule 3: Trạng từ */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-2">
              <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-600 text-white flex items-center justify-center text-xs">
                  Adv
                </span>
                3. Dấu hiệu cần điền TRẠNG TỪ (Adverb)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-gray-800">
                <li>Bổ nghĩa cho động từ thường: <strong>Verb + [Adv]</strong> hoặc <strong>[Adv] + Verb</strong> (vd: run efficiently).</li>
                <li>Bổ nghĩa cho tính từ: <strong>[Adv] + Adj</strong> (vd: highly sustainable).</li>
                <li>Bổ nghĩa cho cả câu (thường đứng đầu câu có dấu phẩy): <strong>[Adv], S + V...</strong></li>
                <li>Đuôi trạng từ phổ biến nhất: <em>Adj + -ly = Adv (efficiently, securely, sustainably).</em></li>
              </ul>
            </div>

            {/* Rule 4: Động từ */}
            <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2">
              <h4 className="font-black text-purple-950 text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-xs">
                  V
                </span>
                4. Dấu hiệu cần điền ĐỘNG TỪ (Verb)
              </h4>
              <ul className="space-y-1.5 list-disc list-inside leading-relaxed text-gray-800">
                <li>Đứng sau chủ ngữ trong câu: <strong>S + [Verb] + O...</strong></li>
                <li>Sau động từ khuyết thiếu (modal verbs): must, can, should, ought to + [V-nguyên thể].</li>
                <li>Sau trợ động từ trong câu phủ định/nghi vấn: don't, doesn't, didn't + [V].</li>
                <li>Sau to-infinitive: to + [V].</li>
                <li>Đuôi động từ hay gặp: <em>-ize/-ise (organize), -ate, -en, -ify.</em></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

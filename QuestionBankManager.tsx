import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Plus,
  Filter,
  Download,
  Upload,
  Sparkles,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';
import { Question, QuestionType, GradeLevel, BookSeries } from '../types';
import { FormattedText } from './FormattedText';
import {
  getStoredQuestionBank,
  addCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  resetQuestionBankToDefault,
  exportQuestionsToJSON,
  exportQuestionsToCSV,
  importQuestionsFromJSON,
  importQuestionsFromCSV,
} from '../services/storage';

interface QuestionBankManagerProps {
  onRefreshBank?: () => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ onRefreshBank }) => {
  const [questions, setQuestions] = useState<Question[]>(() => getStoredQuestionBank());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  // Modals
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGenType, setAiGenType] = useState<string>('word_form');
  const [aiGenGrade, setAiGenGrade] = useState<number>(11);
  const [aiGenCount, setAiGenCount] = useState<number>(5);
  const [aiError, setAiError] = useState<string | null>(null);

  // Notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const reloadData = () => {
    const data = getStoredQuestionBank();
    setQuestions(data);
    onRefreshBank?.();
  };

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      // Keyword
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchQ = q.question.toLowerCase().includes(term);
        const matchA = q.correctAnswer.toLowerCase().includes(term);
        const matchT = (q.targetWord || '').toLowerCase().includes(term);
        const matchTopic = (q.topic || '').toLowerCase().includes(term);
        if (!matchQ && !matchA && !matchT && !matchTopic) return false;
      }

      // Grade
      if (selectedGrade !== 'all') {
        const qGrade = q.grade ?? 11;
        if (selectedGrade === 'thcs') {
          if (qGrade < 6 || qGrade > 9) return false;
        } else if (selectedGrade === 'thpt') {
          if (qGrade < 10 || qGrade > 12) return false;
        } else if (qGrade !== Number(selectedGrade)) {
          return false;
        }
      }

      // Type
      if (selectedType !== 'all') {
        if (selectedType === 'word_form' && q.questionType !== 'word_form') return false;
        if (selectedType === 'tenses' && q.questionType !== 'tenses' && q.questionType !== 'tense_form') return false;
        if (selectedType === 'multiple_choice' && !['multiple_choice', 'grammar', 'vocabulary', 'pronunciation', 'stress', 'reading'].includes(q.questionType)) return false;
      }

      // Book series
      if (selectedSeries !== 'all' && q.bookSeries !== selectedSeries) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [questions, searchTerm, selectedGrade, selectedType, selectedSeries, selectedDifficulty]);

  // Statistics
  const stats = useMemo(() => {
    const total = questions.length;
    const wf = questions.filter((q) => q.questionType === 'word_form').length;
    const tenses = questions.filter((q) => q.questionType === 'tenses' || q.questionType === 'tense_form').length;
    const mcq = total - wf - tenses;
    return { total, wf, tenses, mcq };
  }, [questions]);

  // Handle Export
  const handleExportJSON = () => {
    const jsonStr = exportQuestionsToJSON(filteredQuestions);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngan-hang-cau-hoi-tieng-anh-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất thành công ${filteredQuestions.length} câu hỏi ra file JSON!`);
  };

  const handleExportCSV = () => {
    const csvStr = exportQuestionsToCSV(filteredQuestions);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngan-hang-cau-hoi-tieng-anh-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Đã xuất thành công ${filteredQuestions.length} câu hỏi ra file CSV!`);
  };

  // Handle Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        const res = importQuestionsFromJSON(content);
        if (res.success) {
          reloadData();
          showToast(`Nhập dữ liệu thành công! Đã thêm/cập nhật ${res.count} câu hỏi.`);
        } else {
          showToast(res.error || 'Lỗi khi nhập file JSON', 'error');
        }
      } else if (file.name.endsWith('.csv')) {
        const res = importQuestionsFromCSV(content);
        if (res.success) {
          reloadData();
          showToast(`Nhập dữ liệu thành công! Đã thêm/cập nhật ${res.count} câu hỏi.`);
        } else {
          showToast(res.error || 'Lỗi khi nhập file CSV', 'error');
        }
      } else {
        showToast('Vui lòng chọn file định dạng .json hoặc .csv', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  // Delete
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      deleteCustomQuestion(id);
      reloadData();
      showToast('Đã xóa câu hỏi.');
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('Khôi phục toàn bộ ngân hàng câu hỏi chuẩn mặc định (bao gồm đầy đủ Word Form, Chia thì, Trắc nghiệm)?')) {
      resetQuestionBankToDefault();
      reloadData();
      showToast('Đã khôi phục ngân hàng câu hỏi chuẩn thành công!');
    }
  };

  // AI Question Generation
  const handleGenerateAIQuestions = async () => {
    setIsAiGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/generate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: '1',
          examType: aiGenType,
          units: [1, 2, 3],
          difficulty: 'medium',
          questionCount: aiGenCount,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !Array.isArray(data.questions)) {
        throw new Error(data.error || 'Không thể tạo câu hỏi lúc này');
      }

      // Add to store
      data.questions.forEach((q: Question) => {
        addCustomQuestion({
          ...q,
          id: `ai-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          grade: aiGenGrade as any,
          bookSeries: 'Global Success',
        });
      });

      reloadData();
      setShowAiModal(false);
      showToast(`Đã thêm ${data.questions.length} câu hỏi mới do Gemini AI tạo vào ngân hàng!`);
    } catch (err: any) {
      setAiError(err.message || 'Lỗi khi gọi AI');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700'
              : 'bg-rose-900/90 text-rose-100 border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.text}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950 uppercase tracking-wider">
                Ngân hàng đề thi
              </span>
              <span className="text-indigo-200 text-xs">Cấp THCS & THPT • Lớp 6 - 12</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Quản lý Ngân hàng câu hỏi</h1>
            <p className="text-indigo-200 text-sm mt-1 max-w-2xl">
              Hệ thống lưu trữ độc lập các dạng bài Trắc nghiệm ABCD, Word Form và Chia thì. Hỗ trợ thêm mới, chỉnh sửa, lọc dữ liệu, xuất/nhập file JSON & CSV và AI mở rộng đề thi.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <div className="text-center px-3 py-1">
              <div className="text-2xl font-extrabold text-amber-300">{stats.total}</div>
              <div className="text-[11px] text-indigo-100 font-medium">Tổng câu hỏi</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <div className="text-2xl font-extrabold text-emerald-300">{stats.wf}</div>
              <div className="text-[11px] text-indigo-100 font-medium">Word Form</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <div className="text-2xl font-extrabold text-sky-300">{stats.tenses}</div>
              <div className="text-[11px] text-indigo-100 font-medium">Chia thì</div>
            </div>
            <div className="text-center px-3 py-1 border-l border-white/10">
              <div className="text-2xl font-extrabold text-purple-300">{stats.mcq}</div>
              <div className="text-[11px] text-indigo-100 font-medium">Trắc nghiệm</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi, từ gốc (CARE, DEVELOP...), đáp án hoặc chủ đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm câu hỏi
            </button>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              AI Tạo câu hỏi
            </button>

            <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

            {/* Export buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={handleExportJSON}
                title="Xuất file JSON"
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-white rounded transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                JSON
              </button>
              <button
                onClick={handleExportCSV}
                title="Xuất file CSV"
                className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-white rounded transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>

            {/* Import file */}
            <label className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập file</span>
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <button
              onClick={handleReset}
              title="Khôi phục ngân hàng chuẩn ban đầu"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Bộ lọc:
          </span>

          {/* Grade filter */}
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả lớp (6 - 12)</option>
            <option value="thcs">Cấp THCS (Lớp 6 - 9)</option>
            <option value="thpt">Cấp THPT (Lớp 10 - 12)</option>
            <option value="6">Lớp 6</option>
            <option value="7">Lớp 7</option>
            <option value="8">Lớp 8</option>
            <option value="9">Lớp 9</option>
            <option value="10">Lớp 10</option>
            <option value="11">Lớp 11 (Chuẩn Global Success)</option>
            <option value="12">Lớp 12</option>
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả dạng bài</option>
            <option value="word_form">Word Form (Biến đổi từ)</option>
            <option value="tenses">Chia thì tiếng Anh</option>
            <option value="multiple_choice">Trắc nghiệm ABCD</option>
          </select>

          {/* Book Series filter */}
          <select
            value={selectedSeries}
            onChange={(e) => setSelectedSeries(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Tất cả bộ sách</option>
            <option value="Global Success">Global Success (Bộ GD&ĐT)</option>
            <option value="Friends Plus">Friends Plus</option>
            <option value="i-Learn Smart World">i-Learn Smart World</option>
            <option value="Chung">Bộ sách Chung / Tổng hợp</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Mọi độ khó</option>
            <option value="basic">Cơ bản (Nhận biết)</option>
            <option value="medium">Trung bình (Thông hiểu)</option>
            <option value="advanced">Nâng cao (Vận dụng)</option>
          </select>

          {(selectedGrade !== 'all' || selectedType !== 'all' || selectedSeries !== 'all' || selectedDifficulty !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedGrade('all');
                setSelectedType('all');
                setSelectedSeries('all');
                setSelectedDifficulty('all');
                setSearchTerm('');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-medium ml-auto flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Bỏ lọc
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Hiển thị {filteredQuestions.length} trên tổng số {questions.length} câu hỏi</span>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
          <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Không tìm thấy câu hỏi phù hợp</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc bỏ các bộ lọc để xem toàn bộ ngân hàng câu hỏi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredQuestions.map((q, idx) => {
            const isWf = q.questionType === 'word_form';
            const isTense = q.questionType === 'tenses' || q.questionType === 'tense_form';

            return (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 p-4 transition-all shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-bold text-slate-500">#{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Lớp {q.grade}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
                      Unit {q.unit}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700">
                      {q.bookSeries}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold uppercase ${
                        isWf
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isTense
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isWf ? 'Word Form' : isTense ? 'Chia thì' : 'Trắc nghiệm'}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 italic">{q.topic}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setEditingQuestion(q)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      title="Sửa câu hỏi"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="text-sm font-medium text-slate-900 mb-2 leading-relaxed">
                  <FormattedText text={q.question} />
                </div>

                {/* Specific details */}
                {isWf && q.targetWord && (
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="text-xs text-slate-500">Từ gốc cần biến đổi:</span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono font-bold text-xs tracking-wider border border-emerald-300">
                      {q.targetWord}
                    </span>
                  </div>
                )}

                {isTense && (
                  <div className="mb-2.5 flex flex-wrap items-center gap-2 text-xs">
                    {q.tenseName && (
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-semibold border border-sky-200">
                        Thì: {q.tenseName}
                      </span>
                    )}
                    {q.signalWords && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                        Dấu hiệu: {q.signalWords}
                      </span>
                    )}
                  </div>
                )}

                {/* MCQ Options */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {q.options.map((opt, oIdx) => {
                      const letter = opt.slice(0, 1).toUpperCase();
                      const isCorrect = letter === q.correctAnswer.toUpperCase();
                      return (
                        <div
                          key={oIdx}
                          className={`text-xs px-2.5 py-1.5 rounded-md flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-100/80 text-emerald-900 font-semibold border border-emerald-300'
                              : 'text-slate-700'
                          }`}
                        >
                          <span>
                            <FormattedText text={opt} />
                          </span>
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Correct Answer & Explanation */}
                <div className="bg-slate-50/80 rounded-lg p-2.5 text-xs space-y-1 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Đáp án chuẩn:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {q.correctAnswer}
                    </span>
                    {q.acceptableAnswers && q.acceptableAnswers.length > 1 && (
                      <span className="text-slate-500 text-[11px]">
                        (Chấp nhận: {q.acceptableAnswers.join(', ')})
                      </span>
                    )}
                  </div>
                  {q.explanationVi && (
                    <div className="text-slate-600">
                      <span className="font-medium text-slate-700">Giải thích: </span>
                      {q.explanationVi}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Create Modal */}
      {(isCreating || editingQuestion) && (
        <QuestionEditorModal
          initial={editingQuestion}
          onSave={(saved) => {
            if (editingQuestion) {
              updateCustomQuestion(saved);
              showToast('Đã cập nhật câu hỏi!');
            } else {
              addCustomQuestion(saved);
              showToast('Đã thêm câu hỏi mới vào ngân hàng!');
            }
            reloadData();
            setIsCreating(false);
            setEditingQuestion(null);
          }}
          onClose={() => {
            setIsCreating(false);
            setEditingQuestion(null);
          }}
        />
      )}

      {/* AI Generate Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">AI Tạo thêm câu hỏi</h3>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Sử dụng mô hình Gemini 3.8 Flash để tự động biên soạn các câu hỏi chuẩn chương trình tiếng Anh phổ thông và nạp trực tiếp vào ngân hàng.
            </p>

            {aiError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{aiError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dạng câu hỏi cần tạo:</label>
                <select
                  value={aiGenType}
                  onChange={(e) => setAiGenType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="word_form">Word Form (Biến đổi danh/động/tính/trạng từ)</option>
                  <option value="tenses">Chia thì tiếng Anh (Các thì cơ bản đến nâng cao)</option>
                  <option value="multiple_choice">Trắc nghiệm ABCD (Ngữ âm, ngữ pháp, từ vựng)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Khối lớp:</label>
                  <select
                    value={aiGenGrade}
                    onChange={(e) => setAiGenGrade(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value={6}>Lớp 6 (THCS)</option>
                    <option value={7}>Lớp 7 (THCS)</option>
                    <option value={8}>Lớp 8 (THCS)</option>
                    <option value={9}>Lớp 9 (THCS)</option>
                    <option value={10}>Lớp 10 (THPT)</option>
                    <option value={11}>Lớp 11 (THPT)</option>
                    <option value={12}>Lớp 12 (THPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số lượng câu:</label>
                  <select
                    value={aiGenCount}
                    onChange={(e) => setAiGenCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  >
                    <option value={5}>5 câu</option>
                    <option value={8}>8 câu</option>
                    <option value={10}>10 câu</option>
                    <option value={15}>15 câu</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isAiGenerating}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGenerateAIQuestions}
                disabled={isAiGenerating}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Bắt đầu tạo
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Modal for Creating / Editing Question
const QuestionEditorModal: React.FC<{
  initial: Question | null;
  onSave: (q: Question) => void;
  onClose: () => void;
}> = ({ initial, onSave, onClose }) => {
  const isEdit = !!initial;
  const [grade, setGrade] = useState<GradeLevel>(initial?.grade || 11);
  const [bookSeries, setBookSeries] = useState<BookSeries>(initial?.bookSeries || 'Global Success');
  const [unit, setUnit] = useState<number>(initial?.unit || 1);
  const [topic, setTopic] = useState<string>(initial?.topic || 'Word Form');
  const [questionType, setQuestionType] = useState<QuestionType>(initial?.questionType || 'word_form');
  const [difficulty, setDifficulty] = useState<'basic' | 'medium' | 'advanced'>(initial?.difficulty || 'medium');
  const [questionText, setQuestionText] = useState<string>(initial?.question || '');
  const [correctAnswer, setCorrectAnswer] = useState<string>(initial?.correctAnswer || '');
  const [targetWord, setTargetWord] = useState<string>(initial?.targetWord || '');
  const [tenseName, setTenseName] = useState<string>(initial?.tenseName || '');
  const [signalWords, setSignalWords] = useState<string>(initial?.signalWords || '');
  const [explanationVi, setExplanationVi] = useState<string>(initial?.explanationVi || '');

  // Options for MCQ
  const [optionA, setOptionA] = useState<string>(initial?.options?.[0] || 'A. ');
  const [optionB, setOptionB] = useState<string>(initial?.options?.[1] || 'B. ');
  const [optionC, setOptionC] = useState<string>(initial?.options?.[2] || 'C. ');
  const [optionD, setOptionD] = useState<string>(initial?.options?.[3] || 'D. ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || !correctAnswer.trim()) {
      alert('Vui lòng điền nội dung câu hỏi và đáp án đúng.');
      return;
    }

    const options =
      questionType === 'multiple_choice' || questionType === 'pronunciation' || questionType === 'stress'
        ? [optionA, optionB, optionC, optionD]
        : [];

    const finalQ: Question = {
      id: initial?.id || `custom-q-${Date.now()}`,
      grade,
      level: grade >= 10 ? 'THPT' : 'THCS',
      bookSeries,
      unit,
      topic,
      questionType,
      difficulty,
      question: questionText.trim(),
      options,
      correctAnswer: correctAnswer.trim(),
      targetWord: targetWord.trim() || undefined,
      tenseName: tenseName.trim() || undefined,
      signalWords: signalWords.trim() || undefined,
      explanationVi: explanationVi.trim() || 'Lời giải chi tiết',
    };

    onSave(finalQ);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            {isEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Grade, Book, Unit, Type */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Khối lớp:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {[6, 7, 8, 9, 10, 11, 12].map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bộ sách:</label>
              <select
                value={bookSeries}
                onChange={(e) => setBookSeries(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="Global Success">Global Success</option>
                <option value="Friends Plus">Friends Plus</option>
                <option value="i-Learn Smart World">i-Learn Smart World</option>
                <option value="Chung">Bộ sách Chung</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit:</label>
              <input
                type="number"
                min={1}
                max={12}
                value={unit}
                onChange={(e) => setUnit(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Dạng câu hỏi:</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="word_form">Word Form (Biến đổi từ)</option>
                <option value="tenses">Chia thì tiếng Anh</option>
                <option value="multiple_choice">Trắc nghiệm ABCD</option>
                <option value="pronunciation">Phát âm</option>
                <option value="stress">Trọng âm</option>
              </select>
            </div>
          </div>

          {/* Row 2: Topic & Difficulty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chủ đề (Topic):</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="VD: Word Form - Care, Thì Quá khứ đơn..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Độ khó:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="basic">Cơ bản (Nhận biết)</option>
                <option value="medium">Trung bình (Thông hiểu)</option>
                <option value="advanced">Nâng cao (Vận dụng)</option>
              </select>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nội dung câu hỏi (sử dụng _______ để biểu thị chỗ trống):
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="VD: She always drives _______ (CARE) in bad weather."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Type specific fields */}
          {questionType === 'word_form' && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Từ gốc trong ngoặc (Root Word):
              </label>
              <input
                type="text"
                value={targetWord}
                onChange={(e) => setTargetWord(e.target.value)}
                placeholder="VD: CARE, DEVELOP, PLEASE, SAFE..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 uppercase font-mono"
              />
            </div>
          )}

          {questionType === 'tenses' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên thì:</label>
                <input
                  type="text"
                  value={tenseName}
                  onChange={(e) => setTenseName(e.target.value)}
                  placeholder="VD: Present Perfect, Past Simple..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dấu hiệu nhận biết:</label>
                <input
                  type="text"
                  value={signalWords}
                  onChange={(e) => setSignalWords(e.target.value)}
                  placeholder="VD: since yesterday, look!..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          )}

          {/* MCQ Options */}
          {(questionType === 'multiple_choice' || questionType === 'pronunciation' || questionType === 'stress') && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <label className="block font-semibold text-slate-700">4 Lựa chọn A, B, C, D:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  placeholder="A. ..."
                  className="p-2 bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  placeholder="B. ..."
                  className="p-2 bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={optionC}
                  onChange={(e) => setOptionC(e.target.value)}
                  placeholder="C. ..."
                  className="p-2 bg-white border border-slate-200 rounded-md"
                />
                <input
                  type="text"
                  value={optionD}
                  onChange={(e) => setOptionD(e.target.value)}
                  placeholder="D. ..."
                  className="p-2 bg-white border border-slate-200 rounded-md"
                />
              </div>
            </div>
          )}

          {/* Correct Answer */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Đáp án chuẩn (Với trắc nghiệm: nhập A/B/C/D. Với Word Form/Chia thì: nhập từ chuẩn):
            </label>
            <input
              type="text"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="VD: carefully, has worked, hoặc A"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono font-semibold"
              required
            />
          </div>

          {/* Explanation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Lời giải chi tiết tiếng Việt:</label>
            <textarea
              rows={2}
              value={explanationVi}
              onChange={(e) => setExplanationVi(e.target.value)}
              placeholder="Giải thích vì sao chọn đáp án này, vị trí ngữ pháp hoặc dấu hiệu nhận biết..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              {isEdit ? 'Lưu thay đổi' : 'Thêm vào ngân hàng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

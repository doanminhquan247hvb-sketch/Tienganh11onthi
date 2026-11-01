import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Grid,
  Lightbulb,
  Clock,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Move,
} from 'lucide-react';
import { Question } from '../types';

interface ImagePuzzleMinigameProps {
  onStartExamFromHint?: (questions: Question[]) => void;
}

interface PuzzleTile {
  id: number;
  currentPos: number;
  correctPos: number;
}

export const ImagePuzzleMinigame: React.FC<ImagePuzzleMinigameProps> = ({ onStartExamFromHint }) => {
  // 9 user uploaded vertical images
  const verticalImages = [
    {
      id: 'img-1',
      name: 'Ảnh dọc Hàn Thuyên 1',
      url: '/public/assets/aistudio/1792156078288_706890774353951918_1312636740976533334_cb1680c7b837a32d4ee1961aff2839bb_f57dc788.jpg',
    },
    {
      id: 'img-2',
      name: 'Ảnh dọc Hàn Thuyên 2',
      url: '/public/assets/aistudio/1792156080028_706890774353951918_1312636740976533334_2822381f3d4e16084a8dfd91eeb39af6_042b3276.jpg',
    },
    {
      id: 'img-3',
      name: 'Ảnh dọc Hàn Thuyên 3',
      url: '/public/assets/aistudio/1792156080568_706890774353951918_1312636740976533334_c1c3d23301dae0a8cbcd7c2ad630967a_65a7427d.jpg',
    },
    {
      id: 'img-4',
      name: 'Ảnh dọc Hàn Thuyên 4',
      url: '/public/assets/aistudio/1792835238572_706890774353951918_1312636740976533334_04f4da968881684f965c6a61acdc5f24_f66963f7.jpg',
    },
    {
      id: 'img-5',
      name: 'Ảnh dọc Hàn Thuyên 5',
      url: '/public/assets/aistudio/1792835237896_706890774353951918_1312636740976533334_444fde17f7077e92730f9e41079c7e36_8c17f6ad.jpg',
    },
    {
      id: 'img-6',
      name: 'Ảnh dọc Hàn Thuyên 6',
      url: '/public/assets/aistudio/1792835237712_706890774353951918_1312636740976533334_69256ef8c019a97b25cd390e64f5e4bd_e7b8d576.jpg',
    },
    {
      id: 'img-7',
      name: 'Ảnh dọc Hàn Thuyên 7',
      url: '/public/assets/aistudio/image_cd117c31.png',
    },
    {
      id: 'img-8',
      name: 'Ảnh dọc Hàn Thuyên 8',
      url: '/public/assets/aistudio/image_a84863d8.png',
    },
    {
      id: 'img-9',
      name: 'Ảnh dọc Hàn Thuyên 9',
      url: '/public/assets/aistudio/image_62244c18.png',
    },
  ];

  const [selectedImage, setSelectedImage] = useState<string>(verticalImages[0].url);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 6x6 grid = 36 tiles
  const gridSize = 6;
  const totalTiles = gridSize * gridSize; // 36

  const [tiles, setTiles] = useState<PuzzleTile[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [movesCount, setMovesCount] = useState<number>(0);

  // 30 seconds timer state for popup question
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(true);
  const [activeQuestionModal, setActiveQuestionModal] = useState<{
    question: Question;
    userAnswer: string;
    isCorrect?: boolean;
  } | null>(null);

  // Bank of grammar/word form questions
  const hintQuestionPool: Question[] = [
    {
      id: 'hint-wf-1',
      grade: 11,
      unit: 3,
      questionType: 'word_form',
      topic: 'Word Form - Smart City',
      question: 'The new urban infrastructure is designed to be highly __________. (SUSTAIN)',
      correctAnswer: 'sustainable',
      options: ['sustain', 'sustainable', 'sustainability', 'sustainably'],
      explanationVi: 'Sau động từ to be "is" và trạng từ "highly" cần một tính từ (adjective): sustainable.'
    },
    {
      id: 'hint-ts-1',
      grade: 11,
      unit: 1,
      questionType: 'tenses',
      topic: 'Chia thì - Present Perfect',
      question: 'Hoa has eaten much more healthily since she (move) __________ to the eco-city last summer.',
      correctAnswer: 'moved',
      options: ['moves', 'moved', 'has moved', 'moving'],
      explanationVi: 'Cấu trúc mệnh đề chỉ thời gian với since: S + Present Perfect + since + S + Past Simple (moved).'
    },
    {
      id: 'hint-wf-2',
      grade: 11,
      unit: 2,
      questionType: 'word_form',
      topic: 'Word Form - Generation Gap',
      question: 'There is often a lack of __________ between parents and teenagers in modern families. (COMMUNICATE)',
      correctAnswer: 'communication',
      options: ['communicate', 'communicative', 'communication', 'communicator'],
      explanationVi: 'Sau giới từ "of" và mạo từ "a lack of" cần điền một danh từ (noun): communication.'
    },
    {
      id: 'hint-ts-2',
      grade: 11,
      unit: 3,
      questionType: 'tenses',
      topic: 'Chia thì - Present Simple',
      question: 'The new pedestrian walkway along the river (look) __________ very modern and picturesque.',
      correctAnswer: 'looks',
      options: ['looks', 'looked', 'is looking', 'has looked'],
      explanationVi: 'Diễn tả trạng thái hiển nhiên ở hiện tại với chủ ngữ số ít "The new pedestrian walkway" -> dùng thì hiện tại đơn (looks).'
    },
    {
      id: 'hint-wf-3',
      grade: 11,
      unit: 1,
      questionType: 'word_form',
      topic: 'Word Form - Health',
      question: 'Regular physical activity is __________ for maintaining a healthy lifestyle. (BENEFIT)',
      correctAnswer: 'beneficial',
      options: ['benefit', 'beneficial', 'beneficially', 'benefits'],
      explanationVi: 'Sau động từ to be "is" cần một tính từ (adjective): beneficial.'
    },
    {
      id: 'hint-ts-3',
      grade: 11,
      unit: 2,
      questionType: 'tenses',
      topic: 'Chia thì - Past Simple',
      question: 'My grandparents (live) __________ in a traditional extended family when they were young.',
      correctAnswer: 'lived',
      options: ['live', 'lived', 'were living', 'had lived'],
      explanationVi: 'Trạng ngữ chỉ thời gian trong quá khứ "when they were young" -> dùng thì quá khứ đơn (lived).'
    },
    {
      id: 'hint-wf-4',
      grade: 11,
      unit: 3,
      questionType: 'word_form',
      topic: 'Word Form - Technology',
      question: 'Smart sensors help cities monitor traffic and manage waste more __________ (EFFICIENT).',
      correctAnswer: 'efficiently',
      options: ['efficient', 'efficiency', 'efficiently', 'inefficient'],
      explanationVi: 'Bổ nghĩa cho động từ thường "manage" cần một trạng từ (adverb): efficiently.'
    },
    {
      id: 'hint-ts-4',
      grade: 11,
      unit: 1,
      questionType: 'tenses',
      topic: 'Chia thì - Future Simple',
      question: 'In the year 2050, most vehicles in smart cities (run) __________ on electricity or solar power.',
      correctAnswer: 'will run',
      options: ['run', 'ran', 'will run', 'are running'],
      explanationVi: 'Dự đoán tương lai với mốc thời gian "In the year 2050" -> dùng thì tương lai đơn (will run).'
    },
  ];

  // Initialize puzzle with current selected image
  const initPuzzle = (imgUrl: string) => {
    const initialTiles: PuzzleTile[] = Array.from({ length: totalTiles }, (_, index) => ({
      id: index,
      currentPos: index,
      correctPos: index,
    }));

    const shuffled = [...initialTiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i].currentPos, shuffled[j].currentPos] = [shuffled[j].currentPos, shuffled[i].currentPos];
    }

    shuffled.sort((a, b) => a.currentPos - b.currentPos);
    setTiles(shuffled);
    setDraggedIndex(null);
    setIsCompleted(false);
    setMovesCount(0);
    setSecondsLeft(30);
    setIsTimerActive(true);
    setActiveQuestionModal(null);
  };

  useEffect(() => {
    initPuzzle(selectedImage);
  }, [selectedImage]);

  // 30 seconds timer effect
  useEffect(() => {
    if (!isTimerActive || isCompleted || activeQuestionModal !== null) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          const randomQ = hintQuestionPool[Math.floor(Math.random() * hintQuestionPool.length)];
          setActiveQuestionModal({
            question: randomQ,
            userAnswer: '',
            isCorrect: undefined,
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, isCompleted, activeQuestionModal]);

  // HTML5 Drag and Drop handlers (kéo thả đúng 1 ô kế bên: trái, phải, lên, xuống)
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (isCompleted) return;
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || isCompleted) return;

    // Strict 1-tile adjacent check (lên, xuống, trái, phải)
    const row1 = Math.floor(draggedIndex / gridSize);
    const col1 = draggedIndex % gridSize;
    const row2 = Math.floor(dropIndex / gridSize);
    const col2 = dropIndex % gridSize;

    const isAdjacent =
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2);

    if (!isAdjacent) {
      setDraggedIndex(null);
      return; // Chỉ cho phép kéo sang đúng 1 ô kế bên!
    }

    const newTiles = [...tiles];
    const pos1 = newTiles[draggedIndex].currentPos;
    const pos2 = newTiles[dropIndex].currentPos;

    newTiles[draggedIndex].currentPos = pos2;
    newTiles[dropIndex].currentPos = pos1;

    newTiles.sort((a, b) => a.currentPos - b.currentPos);
    setTiles(newTiles);
    setDraggedIndex(null);
    setMovesCount((prev) => prev + 1);

    const checkWin = newTiles.every((t) => t.currentPos === t.correctPos);
    if (checkWin) {
      setIsCompleted(true);
      setIsTimerActive(false);
    }
  };

  // Submit answer for 30-second popup question
  const handleSubmitPopupAnswer = () => {
    if (!activeQuestionModal) return;
    const isCorrect =
      activeQuestionModal.userAnswer.trim().toLowerCase() ===
      activeQuestionModal.question.correctAnswer.trim().toLowerCase();

    setActiveQuestionModal((prev) => (prev ? { ...prev, isCorrect } : null));

    setTimeout(() => {
      if (isCorrect) {
        const wrongTile = tiles.find((t) => t.currentPos !== t.correctPos);
        if (wrongTile) {
          const correctSpotTile = tiles.find((t) => t.correctPos === wrongTile.correctPos);
          if (correctSpotTile) {
            const tempPos = wrongTile.currentPos;
            wrongTile.currentPos = correctSpotTile.currentPos;
            correctSpotTile.currentPos = tempPos;
            const sorted = [...tiles].sort((a, b) => a.currentPos - b.currentPos);
            setTiles(sorted);
            if (sorted.every((t) => t.currentPos === t.correctPos)) {
              setIsCompleted(true);
              setIsTimerActive(false);
            }
          }
        }
      } else {
        const newTiles = [...tiles];
        const idx1 = Math.floor(Math.random() * newTiles.length);
        const idx2 = Math.floor(Math.random() * newTiles.length);
        const temp = newTiles[idx1].currentPos;
        newTiles[idx1].currentPos = newTiles[idx2].currentPos;
        newTiles[idx2].currentPos = temp;
        newTiles.sort((a, b) => a.currentPos - b.currentPos);
        setTiles(newTiles);
      }
      setActiveQuestionModal(null);
      setSecondsLeft(30);
    }, 1200);
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const amount = direction === 'left' ? -250 : 250;
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            <Move className="w-4 h-4 animate-pulse" />
            Minigame Kéo Thả 6x6 (Độ Mờ 0%)
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Kéo Thả Mảnh Ghép Trái/Phải/Lên/Xuống • Hỏi Đáp Mỗi 30 Giây
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
            Dùng chuột <strong>kéo và thả</strong> các mảnh ghép qua lại (trái, phải, lên, xuống) để sắp xếp hoàn chỉnh bức tranh 6x6. Cứ mỗi 30 giây trả lời câu hỏi để nhận gợi ý tự động!
          </p>
        </div>

        <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl text-center">
              <div className="text-[10px] text-indigo-200">Đếm ngược</div>
              <div className="text-lg font-black text-amber-300 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>{secondsLeft}s</span>
              </div>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-3 py-2 rounded-xl text-center">
              <div className="text-[10px] text-indigo-200">Bước kéo</div>
              <div className="text-lg font-black text-amber-300 font-mono">{movesCount}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => initPuzzle(selectedImage)}
            className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5" />
            Xáo trộn lại hình này
          </button>
        </div>
      </div>

      {/* THANH CUỘN TRỤC NGANG CHỌN 6 HÌNH ẢNH DỌC */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <span>Chọn hình ảnh dọc (Kéo thanh ngang để quản lý 6 ảnh)</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollThumbnails('left')}
              className="p-1 rounded-lg border border-slate-200 hover:bg-indigo-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollThumbnails('right')}
              className="p-1 rounded-lg border border-slate-200 hover:bg-indigo-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnail Track */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent snap-x"
        >
          {verticalImages.map((img) => {
            const isSelected = selectedImage === img.url;
            return (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`min-w-[100px] sm:min-w-[120px] cursor-pointer rounded-xl border-2 transition-all overflow-hidden snap-start relative group ${
                  isSelected ? 'border-indigo-600 ring-2 ring-indigo-300 scale-105' : 'border-slate-200 hover:border-indigo-300'
                }`}
              >
                <div className="h-28 w-full bg-slate-900 relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-indigo-900/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-1.5 bg-white text-center">
                  <span className="text-[10px] font-bold text-slate-800 truncate block">{img.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Puzzle Board 6x6 Container with Drag and Drop */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md flex flex-col items-center space-y-5">
        <div className="flex items-center justify-between w-full max-w-md px-2 text-xs font-bold text-slate-700">
          <span>Bảng Kéo Thả Trái/Phải/Lên/Xuống 6x6 (Độ Mờ Ảnh: 0%)</span>
          <span className={isCompleted ? 'text-emerald-600 font-black' : 'text-indigo-600'}>
            {isCompleted ? '🎉 Đã hoàn thành xuất sắc!' : 'Kéo thả các ô để sắp xếp đúng...'}
          </span>
        </div>

        {/* 6x6 Grid Container for Drag and Drop */}
        <div className="grid grid-cols-6 gap-0.5 w-full max-w-[420px] aspect-[3/4] bg-slate-900 p-2 rounded-2xl shadow-inner relative">
          {tiles.map((tile, index) => {
            const isCorrectPosition = tile.currentPos === tile.correctPos;
            const isDragged = draggedIndex === index;

            let isAdjacentToDragged = false;
            if (draggedIndex !== null && draggedIndex !== index) {
              const r1 = Math.floor(draggedIndex / gridSize);
              const c1 = draggedIndex % gridSize;
              const r2 = Math.floor(index / gridSize);
              const c2 = index % gridSize;
              isAdjacentToDragged = (Math.abs(r1 - r2) === 1 && c1 === c2) || (Math.abs(c1 - c2) === 1 && r1 === r2);
            }

            const row = Math.floor(tile.correctPos / gridSize);
            const col = tile.correctPos % gridSize;
            const bgPosX = (col / (gridSize - 1)) * 100;
            const bgPosY = (row / (gridSize - 1)) * 100;

            return (
              <div
                key={tile.id}
                draggable={!isCompleted}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative cursor-grab active:cursor-grabbing overflow-hidden rounded-[2px] transition-all border ${
                  isDragged
                    ? 'opacity-40 scale-95 border-amber-400 ring-2 ring-amber-400 z-20'
                    : isAdjacentToDragged
                    ? 'ring-2 ring-amber-300 border-amber-300 scale-[1.02] z-10'
                    : isCorrectPosition && isCompleted
                    ? 'border-emerald-500'
                    : 'border-slate-700/40 hover:border-indigo-400'
                }`}
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${bgPosX}% ${bgPosY}%`,
                }}
              >
                <div className="absolute top-0.5 left-0.5 bg-black/70 text-white font-mono text-[7px] px-0.5 rounded pointer-events-none">
                  {tile.id + 1}
                </div>
              </div>
            );
          })}
        </div>

        {isCompleted && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2 w-full max-w-md animate-bounce">
            <h3 className="text-sm font-black text-emerald-800 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Chúc mừng bạn đã hoàn thành bức tranh dọc 6x6 bằng cách kéo thả!
            </h3>
            <p className="text-xs text-emerald-700">
              Hoàn thành với {movesCount} lần kéo thả và giữ nguyên độ nét 0% của ảnh.
            </p>
          </div>
        )}
      </div>

      {/* 30-Second Question Modal Popup */}
      {activeQuestionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-indigo-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Thử Thách 30 Giây • Word Form & Chia Thì
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Đúng: Khớp 1 ô | Sai: Đảo 1 ô
              </span>
            </div>

            <p className="text-sm font-bold text-slate-900 leading-snug">
              {activeQuestionModal.question.question}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeQuestionModal.question.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    setActiveQuestionModal((prev) => (prev ? { ...prev, userAnswer: opt } : null))
                  }
                  className={`p-3 rounded-xl text-xs font-bold text-left border transition-all ${
                    activeQuestionModal.userAnswer === opt
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSubmitPopupAnswer}
                disabled={!activeQuestionModal.userAnswer}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-black shadow-md transition-all"
              >
                Nộp đáp án
              </button>

              {activeQuestionModal.isCorrect === true && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Chính xác! Đang khớp mảnh...
                </span>
              )}
              {activeQuestionModal.isCorrect === false && (
                <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Chưa chính xác! Sẽ bị đảo 1 ô.
                </span>
              )}
            </div>

            {activeQuestionModal.isCorrect === true && activeQuestionModal.question.explanationVi && (
              <p className="text-xs text-slate-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                💡 <strong>Giải thích:</strong> {activeQuestionModal.question.explanationVi}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

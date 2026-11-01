import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StudyDashboard } from './components/StudyDashboard';
import { ExamGenerator } from './components/ExamGenerator';
import { ExamRunner } from './components/ExamRunner';
import { ExamResultView } from './components/ExamResultView';
import { VocabularyHub } from './components/VocabularyHub';
import { GrammarHub } from './components/GrammarHub';
import { AITutorChat } from './components/AITutorChat';
import { MistakesAndRemediation } from './components/MistakesAndRemediation';
import { ParentDashboard } from './components/ParentDashboard';
import { UnitsMatrix } from './components/UnitsMatrix';
import { WordFormHub } from './components/WordFormHub';
import { QuestionBankManager } from './components/QuestionBankManager';
import { ImagePuzzleMinigame } from './components/ImagePuzzleMinigame';
import { IQBettingMinigame } from './components/IQBettingMinigame';
import {
  StudentProfile,
  UserExamSubmission,
  Question,
  ExamCategoryMode,
} from './types';
import {
  getStudentProfile,
  saveStudentProfile,
  getExamSubmissions,
  saveExamSubmission,
  clearAllUserData,
  DEFAULT_STUDENT_PROFILE,
  getStoredQuestionBank,
} from './services/storage';
import { PRESET_EXAMS } from './data/curriculum';
import { WORD_FORM_QUIZ_QUESTIONS } from './data/wordFormBank';
import { generateRandomizedMidtermExam } from './utils/examEngine';
import { getStoredThemeSettings, ThemeSettings } from './utils/themeManager';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<StudentProfile>(getStudentProfile());
  const [submissions, setSubmissions] = useState<UserExamSubmission[]>(getExamSubmissions());
  const [isParentMode, setIsParentMode] = useState<boolean>(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => getStoredThemeSettings());
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleThemeUpdate = (e: any) => {
      if (e.detail) setThemeSettings(e.detail);
    };
    window.addEventListener('em11_theme_updated', handleThemeUpdate);
    return () => window.removeEventListener('em11_theme_updated', handleThemeUpdate);
  }, []);

  // Active Exam state
  const [activeExam, setActiveExam] = useState<{
    isActive: boolean;
    title: string;
    questions: Question[];
    durationMinutes: number | null;
    configSummary: string;
    mode?: ExamCategoryMode;
    examCode?: string;
  } | null>(null);

  // Active Completed Exam Result state
  const [activeResult, setActiveResult] = useState<UserExamSubmission | null>(null);

  const refreshData = () => {
    setProfile(getStudentProfile());
    setSubmissions(getExamSubmissions());
  };

  const handleStartExam = (
    title: string,
    questions: Question[],
    durationMinutes: number | null,
    configSummary: string,
    mode?: ExamCategoryMode,
    examCode?: string
  ) => {
    setActiveResult(null);
    setActiveExam({
      isActive: true,
      title,
      questions,
      durationMinutes,
      configSummary,
      mode,
      examCode,
    });
  };

  const handlePresetExamLaunch = (title: string, presetId: string) => {
    if (presetId === 'exam-midterm-1') {
      const pool = getStoredQuestionBank();
      const randomizedMidterm = generateRandomizedMidtermExam(pool);
      handleStartExam(
        'Đề thi thử học kì I (Chuẩn 40 câu ma trận - Ngẫu nhiên 100%)',
        randomizedMidterm.questions,
        45,
        '40 câu ngẫu nhiên 100% | 45 phút | 30 Trắc nghiệm (7.5đ) + 4 Chia thì (1.0đ) + 4 Word Form (1.0đ) + 2 Modal Verbs (0.5đ)',
        'combined',
        randomizedMidterm.examCode
      );
      return;
    }

    if (presetId === 'exam-wordform-8') {
      handleStartExam(
        'Bài kiểm tra 8 từ Word Form (Danh - Động - Tính - Trạng)',
        WORD_FORM_QUIZ_QUESTIONS,
        15,
        '8 câu Word Form trọng tâm | 15 phút',
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

    handleStartExam(
      preset.title,
      selected,
      preset.durationMinutes,
      `${preset.title} | ${selected.length} câu | Thang điểm 10 & ELO`,
      'multiple_choice',
      preset.id.toUpperCase()
    );
  };

  const handleFinishExam = (submission: UserExamSubmission) => {
    saveExamSubmission(submission);
    refreshData();
    setActiveExam(null);
    setActiveResult(submission);
  };

  const handleRemediateMistakes = (wrongQuestions: Question[]) => {
    handleStartExam(
      `Bài luyện tập khắc phục ${wrongQuestions.length} câu làm sai`,
      wrongQuestions,
      Math.max(10, Math.ceil(wrongQuestions.length * 1.5)),
      `Đề luyện câu sai | ${wrongQuestions.length} câu`
    );
  };

  const handleResetData = () => {
    clearAllUserData();
    refreshData();
    setActiveExam(null);
    setActiveResult(null);
    setCurrentTab('dashboard');
  };

  // If in an active exam, render the full-screen exam runner
  if (activeExam?.isActive) {
    return (
      <ExamRunner
        examTitle={activeExam.title}
        questions={activeExam.questions}
        durationMinutes={activeExam.durationMinutes}
        configSummary={activeExam.configSummary}
        onFinishExam={handleFinishExam}
        onExit={() => setActiveExam(null)}
      />
    );
  }

  // If viewing exam result
  if (activeResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setActiveResult(null);
            setCurrentTab(tab);
          }}
          profile={profile}
          isParentMode={isParentMode}
          onToggleParentMode={(isParent) => {
            setIsParentMode(isParent);
            if (isParent) {
              setActiveResult(null);
              setCurrentTab('parent');
            }
          }}
          onResetData={handleResetData}
        />
        <main className="flex-1 pb-16">
          <ExamResultView
            submission={activeResult}
            onRetakeExam={() => {
              const isMidterm =
                activeResult.examTitle.toLowerCase().includes('giữa kỉ') ||
                activeResult.totalQuestions === 40;
              if (isMidterm) {
                const pool = getStoredQuestionBank();
                const randomizedMidterm = generateRandomizedMidtermExam(pool);
                handleStartExam(
                  'Đề thi thử học kì I (Chuẩn 40 câu ma trận - Ngẫu nhiên 100%)',
                  randomizedMidterm.questions,
                  45,
                  '40 câu ngẫu nhiên 100% | 45 phút | 30 Trắc nghiệm (7.5đ) + 4 Chia thì (1.0đ) + 4 Word Form (1.0đ) + 2 Modal Verbs (0.5đ)',
                  'combined',
                  randomizedMidterm.examCode
                );
              } else {
                handleStartExam(
                  activeResult.examTitle,
                  activeResult.questions,
                  Math.round(activeResult.durationSecondsSpent / 60) || 45,
                  activeResult.examTitle
                );
              }
            }}
            onGoHome={() => {
              setActiveResult(null);
              setCurrentTab('dashboard');
            }}
            onRemediateMistakes={handleRemediateMistakes}
          />
        </main>
      </div>
    );
  }

  const isWallpaperActive = themeSettings.wallpaperEnabled && !!themeSettings.wallpaperUrl;

  return (
    <div className={`min-h-screen flex flex-col font-sans text-gray-900 relative ${isWallpaperActive ? 'bg-slate-950' : 'bg-slate-50'}`}>
      {/* Background Wallpaper with 5% opacity overlay */}
      {isWallpaperActive && (         <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src={themeSettings.wallpaperUrl}
            alt="Theme Wallpaper"
            className="w-full h-full object-cover"
          />
          {/* Mờ 5% lớp phủ nền */}
          <div className="absolute inset-0 bg-slate-950/5 backdrop-blur-[1px]" />
        </div>
      )}

      <Navbar

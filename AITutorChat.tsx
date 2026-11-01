import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Volume2,
  Copy,
  Check,
  Bot,
  User,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { speakEnglish } from '../utils/speech';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

const QUICK_PROMPTS = [
  'Cô ơi, hướng dẫn em cách phân biệt Quá khứ đơn và Hiện tại hoàn thành',
  'Khi nào dùng must và khi nào dùng have to trong đề thi Unit 2?',
  'Chữa giúp em đoạn văn ngắn về thành phố tương lai (Unit 3)',
  'Cách làm dạng bài câu chẻ Cleft sentence không bị bẫy (Unit 8)',
  'Quy tắc phát âm đuôi -ed và đuôi -s/es dễ nhớ nhất',
];

export const AITutorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      text: 'Chào em! Cô là Cô Lan - Gia sư AI Tiếng Anh 11 của em. Em đang gặp khó khăn ở chuyên đề ngữ pháp nào, cần giải thích câu hỏi trong đề thi hay muốn cô chữa bài viết đoạn văn ngắn? Cứ hỏi cô nhé!',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tutor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.reply) {
        throw new Error(data.error || 'Không nhận được phản hồi từ gia sư AI');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error', err);
      const errorMessage: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        role: 'assistant',
        text: `Rất tiếc, đã có lỗi kết nối với Gia sư AI (${err.message || 'Lỗi server'}). Em hãy thử hỏi lại hoặc chọn một câu hỏi gợi ý bên dưới nhé!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-200 shrink-0">
          <Bot className="w-8 h-8" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-gray-900">Cô Lan • Gia Sư AI Tiếng Anh 11</h1>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              Trực tuyến
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chuyên gia giải đáp ngữ pháp, từ vựng Global Success 11, phương pháp làm bài thi và luyện kỹ năng viết.
          </p>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>Câu hỏi gợi ý nhanh:</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="py-1.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/70 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xs h-[520px] flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-1.5">
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-2xs ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-tr-xs'
                        : 'bg-gray-50 border border-gray-200/80 text-gray-800 rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {!isUser && (
                    <div className="flex items-center gap-2 pl-2 text-gray-400">
                      <button
                        onClick={() => speakEnglish(msg.text)}
                        className="hover:text-indigo-600 transition-colors p-1"
                        title="Nghe cô đọc"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-indigo-600 transition-colors p-1"
                        title="Sao chép nội dung"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-3xl bg-gray-50 border border-gray-200 rounded-tl-xs flex items-center gap-2 text-xs text-gray-500 font-medium">
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]" />
                <span>Cô Lan đang soạn câu trả lời cho em...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
          <input
            type="text"
            placeholder="Nhập câu hỏi ngữ pháp, câu trắc nghiệm cần giải thích, hoặc đoạn văn cần chữa..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-2xl border border-gray-300 bg-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium disabled:opacity-50"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputValue.trim() || isLoading}
            className="py-3 px-5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

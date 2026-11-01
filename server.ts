import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with user-agent header
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Generate Custom Exam aligned with Global Success 11
app.post('/api/generate-exam', async (req, res) => {
  try {
    const {
      semester = '1',
      examType = 'midterm', // midterm | final | unit_test | topic
      units = [1, 2, 3],
      difficulty = 'medium', // basic | medium | advanced
      questionCount = 15,
      topics = [],
    } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server. Bạn có thể sử dụng ngân hàng đề mẫu có sẵn!',
      });
    }

    const unitListStr = Array.isArray(units) ? units.join(', ') : units;
    const prompt = `Bạn là chuyên gia ra đề thi Tiếng Anh 11 của Bộ GD&ĐT Việt Nam theo chương trình sách giáo khoa Tiếng Anh 11 - Global Success.
Hãy tạo ${questionCount} câu hỏi trắc nghiệm ôn thi Tiếng Anh 11 với các thông số sau:
- Học kì: ${semester}
- Loại đề: ${examType} (vd: Giữa kì, Cuối kì, Ôn tập)
- Phạm vi kiến thức: Unit ${unitListStr} Global Success 11
- Độ khó: ${difficulty} (basic: nhận biết/thông hiểu, medium: vận dụng, advanced: vận dụng cao)
${topics.length ? `- Chủ đề trọng tâm: ${topics.join(', ')}` : ''}

Cấu trúc các câu hỏi cần bao quát chuẩn đề thi THPT:
1. Phát âm / Trọng âm (Pronunciation & Word Stress)
2. Từ vựng & Ngữ pháp (Grammar & Vocabulary của các Unit tương ứng)
3. Tìm lỗi sai (Error Identification)
4. Câu đồng nghĩa / Viết lại câu (Sentence Transformation / Closest in meaning)
5. Hoặc câu hỏi đọc hiểu / điền từ ngắn.

Hãy trả về định dạng JSON thuần túy theo đúng schema mảng các câu hỏi:
Mỗi câu hỏi có:
- id: string
- unit: số unit (1-10)
- topic: tên chủ đề ngữ pháp/từ vựng (vd: "Thì Quá khứ đơn vs Hiện tại hoàn thành", "Modal Verbs", "Cleft Sentences", "Word Stress")
- questionType: "pronunciation" | "stress" | "grammar" | "vocabulary" | "error_identification" | "sentence_transformation" | "reading"
- question: nội dung câu hỏi (tiếng Anh)
- options: mảng 4 phương án [A, B, C, D] (với tiền tố "A. ...", "B. ...", "C. ...", "D. ...")
- correctAnswer: "A" | "B" | "C" | "D"
- explanationEn: giải thích ngắn gọn bằng tiếng Anh vì sao đáp án đúng và vì sao các đáp án khác sai
- explanationVi: giải thích chi tiết, sư phạm, dễ hiểu bằng tiếng Việt cho học sinh lớp 11`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia giáo dục và biên soạn đề thi tiếng Anh THPT Việt Nam (Global Success 11). Hãy trả về JSON chuẩn xác, câu hỏi chính xác ngữ pháp, bám sát sách giáo khoa, không có markdown rác.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              unit: { type: Type.INTEGER },
              topic: { type: Type.STRING },
              questionType: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctAnswer: { type: Type.STRING },
              explanationEn: { type: Type.STRING },
              explanationVi: { type: Type.STRING },
            },
            required: ['id', 'unit', 'topic', 'questionType', 'question', 'options', 'correctAnswer', 'explanationVi'],
          },
        },
      },
    });

    const questionsJson = JSON.parse(response.text || '[]');
    res.json({ success: true, questions: questionsJson });
  } catch (error: any) {
    console.error('Error generating exam:', error);
    res.status(500).json({
      error: error.message || 'Lỗi khi tạo đề thi bằng AI. Vui lòng thử lại hoặc chọn bộ đề chuẩn có sẵn.',
    });
  }
});

// API: Detailed Question Explanation by AI Tutor
app.post('/api/explain-question', async (req, res) => {
  try {
    const { question, options, selectedAnswer, correctAnswer, topic } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server.',
      });
    }

    const prompt = `Học sinh lớp 11 vừa làm câu hỏi Tiếng Anh Global Success 11 sau:
- Câu hỏi: "${question}"
- Các lựa chọn: ${JSON.stringify(options)}
- Học sinh đã chọn: ${selectedAnswer}
- Đáp án đúng: ${correctAnswer}
- Chủ đề: ${topic || 'English 11'}

Hãy đóng vai Thầy/Cô gia sư AI Tiếng Anh 11 tận tình, giải thích chi tiết cho học sinh:
1. Đánh giá câu trả lời của học sinh (đúng hay sai và vì sao học sinh hay mắc bẫy chọn nhầm đáp án này).
2. Phân tích chi tiết ngữ pháp / từ vựng cốt lõi liên quan trong chương trình Tiếng Anh 11 Global Success.
3. Dịch nghĩa hoàn chỉnh câu hỏi sang tiếng Việt.
4. Mẹo nhớ nhanh (Exam tip / Memory trick) để không bị sai lại trong bài kiểm tra giữa kì / cuối kì.
5. Cung cấp 1 câu ví dụ tương tự để học sinh tự luyện tập.

Trả về kết quả bằng tiếng Việt thân thiện, rõ ràng, định dạng dễ đọc (có tiêu đề mục rõ ràng).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là Cô Lan - Gia sư AI Tiếng Anh 11 Global Success giỏi, sư phạm, ấm áp, động viên học sinh.',
      },
    });

    res.json({
      success: true,
      explanation: response.text,
    });
  } catch (error: any) {
    console.error('Error explaining question:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi giải thích câu hỏi' });
  }
});

// API: Analyze Mistakes & Generate Personalized Remediation Plan
app.post('/api/analyze-mistakes', async (req, res) => {
  try {
    const { mistakes, studentName = 'Học sinh' } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server.',
      });
    }

    if (!mistakes || mistakes.length === 0) {
      return res.json({
        success: true,
        analysis: 'Học sinh đã làm đúng tất cả các câu hỏi! Phong độ rất xuất sắc.',
        weakTopics: [],
        remediationPlan: [],
      });
    }

    const prompt = `Phân tích kết quả bài kiểm tra Tiếng Anh 11 Global Success của bạn ${studentName}.
Danh sách ${mistakes.length} câu làm sai:
${JSON.stringify(mistakes, null, 2)}

Hãy phân tích:
1. Nhận diện các lỗ hổng kiến thức chính (Weak Topics), ví dụ: Thì Quá khứ đơn vs Hiện tại hoàn thành (Unit 1), Động từ khuyết thiếu (Unit 2), Câu chẻ Cleft sentence (Unit 8), Từ vựng chủ đề ASEAN (Unit 4),...
2. Nhận xét tổng quan và chỉ ra nguyên nhân hay sai (do vội vàng, nhầm cấu trúc, hay hổng từ vựng).
3. Đề xuất kế hoạch ôn tập cấp tốc 3 ngày hoặc 7 ngày trước kì thi.
4. Tạo 3 câu bài tập trắc nghiệm mới toanh đúng các điểm yếu trên để học sinh luyện tập phục hồi ngay lập tức.

Trả về định dạng JSON:
{
  "summary": "Nhận xét tổng quan sư phạm",
  "weakTopics": ["Chủ đề 1", "Chủ đề 2"],
  "studyTips": ["Mẹo 1", "Mẹo 2", "Mẹo 3"],
  "schedule": [
    {"day": "Ngày 1", "focus": "Ôn tập...", "action": "..."},
    {"day": "Ngày 2", "focus": "Luyện đề...", "action": "..."}
  ],
  "practiceQuestions": [
    {
      "id": "rem-1",
      "question": "...",
      "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
      "correctAnswer": "A",
      "explanationVi": "..."
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing mistakes:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi phân tích lỗi sai' });
  }
});

// API: AI Tutor Chat (Interactive Q&A for Grade 11 English)
app.post('/api/tutor-chat', async (req, res) => {
  try {
    const { message, chatHistory = [] } = req.body;

    if (!ai) {
      return res.status(503).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên server.',
      });
    }

    const systemInstruction = `Bạn là Cô Lan - Gia sư AI Tiếng Anh lớp 11 chuyên sâu chương trình Global Success của Bộ Giáo dục & Đào tạo Việt Nam.
Nhiệm vụ của bạn:
- Giải thích các chuyên đề ngữ pháp Lớp 11 (Tenses, Gerunds & Participles, Modal Verbs, Cleft Sentences, Linking Verbs, To-infinitive clauses, Phrasal verbs, Stress rules).
- Dịch và giải nghĩa từ vựng từ Unit 1 đến Unit 10 Global Success.
- Chữa bài viết đoạn văn ngắn (Writing), chỉ ra lỗi ngữ pháp và viết lại câu tự nhiên hơn.
- Luôn trả lời ân cần, rõ ràng bằng tiếng Việt kèm ví dụ tiếng Anh chuẩn xác, khuyến khích học sinh học tập tự tin.`;

    const contents = [];
    if (Array.isArray(chatHistory)) {
      for (const item of chatHistory) {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      success: true,
      reply: response.text,
    });
  } catch (error: any) {
    console.error('Error in tutor chat:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi gửi tin nhắn cho Gia sư AI' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const portNumber = Number(PORT);
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${portNumber}`);
  });
}

startServer();

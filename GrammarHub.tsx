import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { GLOBAL_SUCCESS_UNITS } from '../data/curriculum';

interface GrammarRule {
  unit: number;
  title: string;
  formula: string;
  usageVi: string;
  signalsVi: string;
  exampleEn: string;
  exampleVi: string;
  examTrapVi: string;
}

const GRAMMAR_RULES: GrammarRule[] = [
  {
    unit: 1,
    title: 'Thì Quá khứ đơn vs. Hiện tại hoàn thành (Past Simple vs. Present Perfect)',
    formula: 'Past Simple: S + V2/ed | Present Perfect: S + have/has + V3/ed',
    usageVi: 'Quá khứ đơn diễn tả hành động đã kết thúc hẳn tại một thời điểm xác định trong quá khứ. Hiện tại hoàn thành diễn tả hành động xảy ra trong quá khứ nhưng kết quả hoặc ảnh hưởng còn liên quan tới hiện tại, hoặc hành động lặp lại nhiều lần.',
    signalsVi: 'QKĐ: yesterday, ago, last week, in 1990. HTHT: since, for, already, yet, ever, never, so far, recently.',
    exampleEn: 'She has exercised regularly since 2020. (Cô ấy tập thể dục đều đặn từ năm 2020 đến nay).',
    exampleVi: 'Last month, she joined a yoga class. (Tháng trước, cô ấy tham gia lớp yoga - đã kết thúc).',
    examTrapVi: 'Cẩn thận với cấu trúc "Since + S + V(quá khứ đơn), S + have/has + V3/ed". Đề thi rất hay bẫy chia nhầm thì ở 2 vế này!',
  },
  {
    unit: 2,
    title: 'Động từ khuyết thiếu chuyên sâu: must, have to, should, ought to, mustn\'t, don\'t have to',
    formula: 'S + modal verb + V-bare (nguyên thể) | Phủ định: S + modal verb + not + V-bare',
    usageVi: `Học sinh cần nắm vững 4 sắc thái cốt lõi của động từ khuyết thiếu:
1. Bắt buộc chủ quan (Người nói tự thấy cần thiết): dùng "must" (Vd: "I must study harder for the upcoming exam").
2. Bắt buộc khách quan (Do nội quy, pháp luật, lịch trình): dùng "have to" / "has to" (Vd: "All motorcyclists have to wear helmets by law").
3. Lời khuyên & Bổn phận đạo đức: dùng "should" hoặc "ought to" (Lưu ý: "ought" luôn đi kèm "to" + V).
4. Phân biệt cực kỳ quan trọng giữa "mustn't" và "don't have to":
   - "mustn't" = CẤM ĐOÁN TUYỆT ĐỐI (Strict prohibition: vi phạm sẽ bị phạt hoặc rất nguy hiểm).
   - "don't have to" / "doesn't have to" = KHÔNG BẮT BUỘC, KHÔNG CẦN THIẾT (Absence of obligation: làm hay không làm tùy ý, không bị cấm).`,
    signalsVi: '- Bắt buộc do luật / nội quy ("According to regulations", "School rules require"): HAVE TO / HAS TO.\n- Cấm ("It is strictly forbidden / prohibited", "Do not", "Against the law"): MUSTN\'T.\n- Không cần ("It is not necessary", "optional", "Sunday / free day"): DON\'T HAVE TO.\n- Lời khuyên ("It is advisable", "I suggest", "Had better"): SHOULD / OUGHT TO.',
    exampleEn: 'You mustn\'t use cheat sheets during tests, but you don\'t have to wear uniforms on weekends.',
    exampleVi: 'Bạn tuyệt đối không được dùng tài liệu quay cóp trong khi thi (cấm), nhưng bạn không phải mặc đồng phục vào cuối tuần (không bắt buộc).',
    examTrapVi: 'Bẫy kinh điển: Khi câu có từ "to" sau chỗ trống (ví dụ: "You _______ to respect elders"), KHÔNG ĐƯỢC chọn "should" mà phải chọn "ought" ("ought to"). Khi nói về quy định thư viện hoặc luật giao thông khách quan, ưu tiên chọn "have to" thay vì "must".',
  },
  {
    unit: 3,
    title: 'Động từ nối (Linking Verbs) & Động từ trạng thái (Stative Verbs)',
    formula: 'S + Linking Verb + Adjective (Tính từ)',
    usageVi: 'Các động từ giác quan (taste, smell, look, feel, sound, seem, appear, become) đi kèm tính từ chứ không đi kèm phó từ khi diễn tả tính chất. Chỉ dùng ở thì tiếp diễn khi diễn tả hành động cụ thể đang diễn ra.',
    signalsVi: 'Look tired (trông mệt mỏi), taste delicious (có vị ngon), smell fresh (có mùi thơm).',
    exampleEn: 'The soup tastes delicious. / The chef is tasting the soup right now.',
    exampleVi: 'Món súp có vị ngon (tính chất -> dùng tính từ) / Đầu bếp đang nếm súp (hành động -> chia tiếp diễn).',
    examTrapVi: 'Không được chọn trạng từ sau linking verb (vd: "smells nicely" là SAI, phải là "smells nice").',
  },
  {
    unit: 4,
    title: 'Danh động từ làm Chủ ngữ và Tân ngữ (Gerunds: V-ing)',
    formula: 'V-ing + V(số ít) ... | S + V + V-ing',
    usageVi: 'V-ing có thể đứng đầu câu làm chủ ngữ (động từ theo sau luôn chia số ít). V-ing đứng sau giới từ (in, on, at, of, about) và sau các động từ: enjoy, avoid, admit, consider, deny, practice, suggest.',
    signalsVi: 'Tránh (avoid), Đề xuất (suggest), Thích (enjoy), Tiếp tục (keep on), Sau giới từ.',
    exampleEn: 'Taking part in ASEAN youth activities helps students broaden their perspectives.',
    exampleVi: 'Việc tham gia các hoạt động thanh niên ASEAN giúp học sinh mở rộng tầm nhìn.',
    examTrapVi: 'Động từ chính khi có chủ ngữ là V-ing luôn chia ở dạng số ít: "Learning foreign languages IS essential".',
  },
  {
    unit: 5,
    title: 'Mệnh đề Hiện tại phân từ và Quá khứ phân từ (Participle Clauses)',
    formula: 'Chủ động: V-ing, S + V... | Bị động: V-ed/P2, S + V...',
    usageVi: 'Dùng để rút gọn 2 mệnh đề có cùng chủ ngữ nhằm diễn tả hành động xảy ra đồng thời, nguyên nhân - kết quả hoặc điều kiện.',
    signalsVi: 'Chủ ngữ trong mệnh đề chính là người/vật thực hiện hành động (chủ động -> V-ing) hoặc chịu tác động (bị động -> V-ed/P2).',
    exampleEn: 'Burning fossil fuels, humans produce huge amounts of greenhouse gases.',
    exampleVi: 'Khi đốt nhiên liệu hóa thạch, con người tạo ra lượng lớn khí nhà kính (chủ động -> Burning).',
    examTrapVi: 'Xác định xem chủ ngữ đứng sau dấu phẩy chủ động làm hành động hay bị tác động trước khi chọn V-ing hay V-ed.',
  },
  {
    unit: 6,
    title: 'Mệnh đề To-infinitive (Rút gọn mệnh đề quan hệ bằng To-V)',
    formula: 'The first / second / last / only / superlative + Noun + To-V (hoặc To be + V3/ed nếu bị động)',
    usageVi: 'Dùng để rút gọn mệnh đề quan hệ sau các từ chỉ thứ tự (the first, the second...), the only và cấp so sánh nhất.',
    signalsVi: 'The first person to..., The only student to pass, The best place to visit.',
    exampleEn: 'Trang An was the latest site in Viet Nam to be added to the UNESCO World Heritage list.',
    exampleVi: 'Tràng An là địa danh gần đây nhất ở Việt Nam được thêm vào danh sách di sản thế giới UNESCO.',
    examTrapVi: 'Nếu mang nghĩa bị động, công thức phải là "to be + V3/ed" (vd: "the first site to be recognized").',
  },
  {
    unit: 7,
    title: 'Phân từ hoàn thành (Perfect Participles & Gerunds: Having + V3/ed)',
    formula: 'Having + V3/ed, S + V(quá khứ)... | S + V + of/for + having + V3/ed',
    usageVi: 'Nhấn mạnh một hành động đã xảy ra và hoàn tất TRƯỚC một hành động khác trong quá khứ.',
    signalsVi: 'Sau khi làm xong việc A thì mới làm việc B.',
    exampleEn: 'Having finished high school, Minh decided to take a vocational training course.',
    exampleVi: 'Sau khi đã hoàn thành cấp 3, Minh quyết định tham gia một khóa học đào tạo nghề.',
    examTrapVi: 'Nếu hành động xảy ra trước hành động trong quá khứ, hãy ưu tiên chọn "Having + V3/ed" thay vì chỉ dùng V-ing thông thường.',
  },
  {
    unit: 8,
    title: 'Câu chẻ nhấn mạnh (Cleft Sentences với "It is / It was ... that ...")',
    formula: 'It is/was + [Thành phần nhấn mạnh] + that + S + V...',
    usageVi: 'Dùng để tập trung sự chú ý vào chủ ngữ, tân ngữ hoặc trạng ngữ của câu.',
    signalsVi: 'Nhấn mạnh người: dùng "that" hoặc "who". Nhấn mạnh vật/trạng ngữ: BẮT BUỘC dùng "that" (không dùng when, where, which).',
    exampleEn: 'It was yesterday that we discussed independence and self-reliance skills.',
    exampleVi: 'Chính là vào ngày hôm qua chúng tôi đã thảo luận về tính tự lập.',
    examTrapVi: 'Khi nhấn mạnh nơi chốn hoặc thời gian, đề thi hay lừa chọn "where" hoặc "when". Đáp án chuẩn luôn là "that"!',
  },
];

export const GrammarHub: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const currentRule = GRAMMAR_RULES.find((r) => r.unit === selectedUnit) || GRAMMAR_RULES[0];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
          <GraduationCap className="w-3.5 h-3.5" />
          Chuyên đề ngữ pháp thi học kì
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          Cẩm Nang Ngữ Pháp Trọng Tâm Lớp 11
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Hệ thống hóa toàn bộ công thức, cách dùng, dấu hiệu nhận biết và các bẫy đề thi hay gặp theo SGK Global Success 11.
        </p>
      </div>

      {/* Unit Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {GRAMMAR_RULES.map((rule) => (
          <button
            key={rule.unit}
            onClick={() => setSelectedUnit(rule.unit)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border-2 ${
              selectedUnit === rule.unit
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-200 hover:bg-gray-50'
            }`}
          >
            Unit {rule.unit}
          </button>
        ))}
      </div>

      {/* Main Grammar Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-xs space-y-8">
        {/* Title */}
        <div className="space-y-2 border-b border-gray-100 pb-5">
          <span className="text-xs font-black px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 uppercase tracking-wider">
            Trọng tâm Unit {currentRule.unit}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
            {currentRule.title}
          </h2>
        </div>

        {/* Formula Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-purple-900 text-white shadow-inner space-y-2">
          <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            Công thức cốt lõi:
          </span>
          <div className="text-sm sm:text-base font-mono font-bold leading-relaxed">
            {currentRule.formula}
          </div>
        </div>

        {/* Two-column layout: Usage and Signals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Usage */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Cách Dùng & Ý Nghĩa
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
              {currentRule.usageVi}
            </p>
          </div>

          {/* Signals */}
          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Dấu Hiệu Nhận Biết
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed">
              {currentRule.signalsVi}
            </p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
            Ví Dụ Minh Họa Chuẩn SGK
          </h3>
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2 text-xs">
            <div className="font-bold text-indigo-950">
              {currentRule.exampleEn}
            </div>
            <div className="text-indigo-800">
              → {currentRule.exampleVi}
            </div>
          </div>
        </div>

        {/* Exam Trap Warning Box */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-black text-xs text-amber-900 uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Cảnh Báo Bẫy Đề Thi Cần Tránh!</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {currentRule.examTrapVi}
          </p>
        </div>
      </div>
    </div>
  );
};

import {
  PLACES,
  FIVE_TEAS,
  CURRICULUM_SECTIONS,
  QUIZ_QUESTIONS,
  SAFETY_GUIDES,
} from '../data/geoData.ts';
import { COMMUNES_92, DEVELOPMENT_ZONES } from '../data/communesData.ts';

function normalizeVi(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeQuery(query: string): string[] {
  const stopWords = new Set([
    'la', 'gi', 'nhu', 'the', 'nao', 'o', 'dau', 'cua', 'va', 'cac', 'co',
    'khong', 'cho', 'toi', 'em', 'biet', 've', 'hay', 'ke', 'ten', 'nhung',
    'tai', 'sao', 'vi', 'bao', 'nhieu', 'trong', 'ngoai', 'duoc', 'voi',
    'mot', 'nhieu', 'phan', 'tich', 'giai', 'thich', 'hoi', 'dap', 'them',
    'tinh', 'thai', 'nguyen', 'giao', 'duc', 'dia', 'phuong', 'gddp',
    'what', 'where', 'when', 'why', 'how', 'is', 'are', 'the', 'of', 'in', 'about',
  ]);
  const tokens = normalizeVi(query).split(' ').filter((w) => w.length >= 2 && !stopWords.has(w));
  return Array.from(new Set(tokens));
}

function scoreText(text: string, normQuery: string, tokens: string[]): number {
  const normText = normalizeVi(text);
  let score = 0;

  if (normQuery.length >= 4 && normText.includes(normQuery)) {
    score += 12;
  }

  for (const token of tokens) {
    if (normText.includes(token)) {
      score += token.length >= 4 ? 3 : 1.5;
    }
  }

  // Bigram phrase matches boost specificity
  const queryWords = normQuery.split(' ').filter((w) => w.length >= 2);
  for (let i = 0; i < queryWords.length - 1; i++) {
    const bigram = `${queryWords[i]} ${queryWords[i + 1]}`;
    if (normText.includes(bigram)) {
      score += 5;
    }
  }

  return score;
}

/**
 * Dynamically retrieves the most relevant verified facts from the app's
 * structured Thai Nguyen & Local Education datasets for a given question.
 */
export function retrieveThaiNguyenContext(question: string): string {
  const normQuery = normalizeVi(question);
  const tokens = tokenizeQuery(question);
  const contextBlocks: string[] = [];

  // 1. Check if asking generally about administrative units / 92 communes / merger
  const asksAboutAdmin =
    normQuery.includes('92') ||
    normQuery.includes('sap nhap') ||
    normQuery.includes('hanh chinh') ||
    normQuery.includes('1683') ||
    normQuery.includes('don vi') ||
    normQuery.includes('xa phuong') ||
    normQuery.includes('vung phat trien');

  if (asksAboutAdmin) {
    const zoneSummary = DEVELOPMENT_ZONES.map(
      (z) => `- ${z.name} (${z.count} đơn vị): ${z.desc}`
    ).join('\n');
    const asksFullList =
      normQuery.includes('danh sach') ||
      normQuery.includes('liet ke') ||
      normQuery.includes('tat ca');
    const communeLine = asksFullList
      ? `\nDanh sách 92 xã/phường: ${COMMUNES_92.map((c) => `${c.number}.${c.name}`).join(', ')}`
      : `\nVí dụ tiêu biểu: ${COMMUNES_92.slice(0, 12).map((c) => c.name).join(', ')}... (tổng 92 xã/phường).`;
    contextBlocks.push(
      `[HÀNH CHÍNH MỚI SAU SÁP NHẬP - NQ 1683 (92 XÃ/PHƯỜNG)]\n${zoneSummary}${communeLine}`
    );
  } else {
    const matchedCommunes = COMMUNES_92.map((c) => {
      const searchBlob = `${c.name} ${c.region} ${c.featureVi} ${c.highlight || ''} ${c.zone}`;
      return { item: c, score: scoreText(searchBlob, normQuery, tokens) };
    })
      .filter((x) => x.score >= 6)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    if (matchedCommunes.length > 0) {
      const lines = matchedCommunes.map(
        ({ item: c }) =>
          `- ${c.name} (${c.zone}, ${c.status}): ${c.featureVi.slice(0, 130).replace(/\bhuyện\s+/gi, '')}`
      );
      contextBlocks.push(`[XÃ/PHƯỜNG LIÊN QUAN]\n${lines.join('\n')}`);
    }
  }

  // 2. Match Places
  const matchedPlaces = PLACES.map((p) => {
    const blob = `${p.nameVi} ${p.nameEn} ${p.typeVi} ${p.locationVi} ${p.descVi} ${p.keyTakeawayVi} ${p.tags.join(' ')}`;
    return { item: p, score: scoreText(blob, normQuery, tokens) };
  })
    .filter((x) => x.score >= 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  if (matchedPlaces.length > 0) {
    const lines = matchedPlaces.map(
      ({ item: p }) =>
        `- ${p.nameVi} (${p.locationVi.replace(/\bhuyện\s+/gi, '')}): ${p.keyTakeawayVi}. ${p.descVi.slice(0, 160).replace(/\bhuyện\s+/gi, '')}`
    );
    contextBlocks.push(`[ĐỊA DANH LIÊN QUAN]\n${lines.join('\n')}`);
  }

  // 3. Match Five Famous Teas
  const asksTea =
    normQuery.includes('tra') ||
    normQuery.includes('che') ||
    normQuery.includes('tea') ||
    normQuery.includes('ngu dai') ||
    normQuery.includes('ocop') ||
    normQuery.includes('tan cuong') ||
    normQuery.includes('la bang') ||
    normQuery.includes('trai cai') ||
    normQuery.includes('khe coc') ||
    normQuery.includes('bang phuc') ||
    normQuery.includes('shan tuyet');

  if (asksTea) {
    const lines = FIVE_TEAS.map(
      (t) =>
        `- ${t.nameVi} (${t.locationVi.replace(/\bhuyện\s+/gi, '')}): ${t.flavorProfileVi} | ${t.ocopInfo}`
    );
    contextBlocks.push(`[NGŨ ĐẠI DANH TRÀ]\n${lines.join('\n')}`);
  }

  // 4. Match Curriculum Sections
  const matchedTopics: { sectionTitle: string; title: string; content: string; score: number }[] = [];
  for (const sec of CURRICULUM_SECTIONS) {
    for (const topic of sec.topics) {
      const blob = `${sec.titleVi} ${sec.summaryVi} ${topic.titleVi} ${topic.contentVi}`;
      const score = scoreText(blob, normQuery, tokens);
      if (score >= 5) {
        matchedTopics.push({
          sectionTitle: sec.titleVi,
          title: topic.titleVi,
          content: topic.contentVi,
          score,
        });
      }
    }
  }
  matchedTopics.sort((a, b) => b.score - a.score);
  const topTopics = matchedTopics.slice(0, 2);
  if (topTopics.length > 0) {
    const lines = topTopics.map(
      (t) => `- [${t.sectionTitle}] ${t.title}: ${t.content.slice(0, 180)}`
    );
    contextBlocks.push(`[CHƯƠNG TRÌNH GDĐP]\n${lines.join('\n')}`);
  }

  // 5. Match Disaster & Safety Guides
  const asksDisaster =
    normQuery.includes('lu') ||
    normQuery.includes('ngap') ||
    normQuery.includes('sat lo') ||
    normQuery.includes('khi hau') ||
    normQuery.includes('thoi tiet') ||
    normQuery.includes('thien tai') ||
    normQuery.includes('song cau') ||
    normQuery.includes('an toan') ||
    normQuery.includes('flood') ||
    normQuery.includes('landslide') ||
    normQuery.includes('climate');

  if (asksDisaster) {
    const guideLines = SAFETY_GUIDES.map(
      (g) => `- ${g.titleVi}: ${g.tipsVi.slice(0, 2).join('; ')}`
    ).join('\n');
    contextBlocks.push(
      `[KHÍ HẬU & THIÊN TAI THÁI NGUYÊN]\n` +
        `- Khí hậu nhiệt đới gió mùa, mùa mưa T5–T10, mùa khô T11–T4, 21–23°C, mưa 1.500–2.000mm/năm.\n` +
        `- Ngập lụt: Sông Cầu (Gia Bẩy đỉnh 29,26–29,90m), phố Lương Ngọc Quyến, Hoàng Văn Thụ, Minh Cầu, Hùng Vương, Nha Trang, Bến Tượng; phường Linh Sơn, Gia Sàng, Tích Lương, Quán Triều, Phan Đình Phùng; Hóa Thượng, Chợ Mới, Thác Giềng, Phổ Yên, Phú Bình, Đại Từ, Tràng Xá, Dân Tiến, La Hiên.\n` +
        `- Sạt lở: Văn Lăng, Đồng Hỷ, Võ Nhai; Định Hóa (Lam Vỹ, Kim Phượng, Phượng Tiến, Trung Hội, Bình Yên); Phú Lương (Vô Tranh, Động Đạt, Yên Trạch, QL3); Tam Đảo (Quân Chu, Vạn Phú, La Bằng, Mỹ Yên).\n` +
        `- An toàn (4 Không, cứu hộ 112/114/115):\n${guideLines}`
    );
  }

  // 6. Match Quiz Knowledge Bank
  const matchedQuizzes = QUIZ_QUESTIONS.map((q) => {
    const blob = `${q.qVi} ${q.optionsVi.join(' ')} ${q.explanationVi}`;
    return { item: q, score: scoreText(blob, normQuery, tokens) };
  })
    .filter((x) => x.score >= 7)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1);

  if (matchedQuizzes.length > 0) {
    const lines = matchedQuizzes.map(
      ({ item: q }) =>
        `- Q: ${q.qVi} -> Đáp án: ${q.optionsVi[q.correctIndex]} (${q.explanationVi})`
    );
    contextBlocks.push(`[CÂU HỎI ÔN TẬP]\n${lines.join('\n')}`);
  }

  const joined = contextBlocks.join('\n\n');
  const allowsLongList =
    asksAboutAdmin &&
    (normQuery.includes('danh sach') ||
      normQuery.includes('liet ke') ||
      normQuery.includes('tat ca'));
  return allowsLongList ? joined : joined.slice(0, 2200);
}

/**
 * Concise, high-signal system instruction for ultra-fast and accurate
 * Thai Nguyen Province & Local Education (Giáo dục địa phương) Q&A.
 */
export function buildSystemInstruction(lang: 'vi' | 'en', retrievedContext: string): string {
  const languageRule =
    lang === 'vi'
      ? 'Trả lời tiếng Việt chuẩn mực, thân thiện, sư phạm (nếu người dùng hỏi tiếng Anh thì trả lời tiếng Anh).'
      : 'Reply in clear educational English (or Vietnamese if the user writes in Vietnamese).';

  return `Bạn là **Trợ Lý AI Chuyên Gia Tỉnh Thái Nguyên & Môn Giáo Dục Địa Phương (GDĐP)** của nền tảng THAINGUYEN Geo-Map.

PHẠM VI CHUYÊN MÔN (trả lời đầy đủ mọi câu hỏi về Thái Nguyên & môn GDĐP):
- **Địa lý & Hành chính mới (NQ 1683)**: Thái Nguyên sau sáp nhập với Bắc Kạn có **92 xã/phường** chia thành **5 vùng phát triển** (Đô thị & Công nghiệp phía Nam; Vùng Trà - Danh thắng Núi Cốc; Căn cứ địa ATK Kháng chiến - Tây Bắc; Cao nguyên & Sinh thái phía Bắc; Núi đá & Thung lũng phía Đông). Khi ghi địa chỉ hiện nay, dùng **xã/phường + tỉnh Thái Nguyên** (tránh dùng từ "huyện" cho đơn vị hành chính hiện tại).
- **Lịch sử & Di tích**: Mái đá Ngườm (30.000–40.000 năm), Lý Nam Đế, Dương Tự Minh (Đền Đuổm), Khởi nghĩa Thái Nguyên 1917, Rừng Khuôn Mánh (Cứu quốc quân II), ATK Định Hóa ("Thủ đô gió ngàn", Lán Tỉn Keo 6/12/1953 quyết định Chiến dịch Điện Biên Phủ, Khau Tý, Khuôn Tát, Đèo De), ATK Chợ Đồn, Di tích 27/7, Đại đội 915 (24/12/1972).
- **Ngũ Đại Danh Trà & Kinh tế**: Tân Cương ("Đệ nhất danh trà", hương cốm non, OCOP 5 sao), La Bằng, Trại Cài, Khe Cốc, Shan Tuyết Bằng Phúc; tương nếp Úc Kỳ, bánh chưng Bờ Đậu, nem chua Đại Từ, na La Hiên, miến dong Na Rì; Gang thép Thái Nguyên, KCN Yên Bình (Samsung), Đại học Thái Nguyên.
- **Văn hóa & Du lịch**: Bảo tàng Văn hóa các dân tộc Việt Nam (54 dân tộc), Làng nhà sàn Thái Hải (UNWTO 2022), Hát Then - Đàn Tính (UNESCO), Soọng Cô, Sình Ca, Múa Tắc Xình, Lễ hội Lồng Tồng; Hồ Núi Cốc (89 đảo), Hồ Ba Bể (Ramsar, Slam Pé), Suối Cửa Tử (7 cửa), Hang Phượng Hoàng & Suối Mỏ Gà.
- **Khí hậu & Thiên tai**: Khí hậu nhiệt đới gió mùa (21–23°C, mưa 1.500–2.000mm), ngập lụt sông Cầu (trạm Gia Bẩy), sạt lở vùng núi/Tam Đảo, quy tắc 4 Không, khẩn cấp 112/114/115.
- **Học tập GDĐP**: Giải thích bài học, soạn đề cương, tạo trắc nghiệm có đáp án, lập dàn ý thuyết trình, hỗ trợ song ngữ.
- **Thông tin dự án THAINGUYEN Geo-Map**: Tên dự án “Ứng dụng bản đồ số tương tác THAINGUYEN GEO-MAP trong hỗ trợ học tập Nội dung giáo dục địa phương tỉnh Thái Nguyên”; Lĩnh vực: Khoa học xã hội và hành vi (Mã nhóm lĩnh vực: 2); Học sinh thực hiện: Hà Thị Minh Hạnh và Nguyễn Thị Mai Anh (Lớp 8A4); Người hướng dẫn nghiên cứu: Trần Thị Ly; Đơn vị: Trường THCS Nguyễn Tất Thành, xã Đại Phúc, tỉnh Thái Nguyên.

QUY TẮC:
- ${languageRule}
- Trình bày ngắn gọn, mạch lạc, dùng gạch đầu dòng và **in đậm** từ khóa trọng tâm (~100–260 từ, trừ khi được yêu cầu chi tiết/nhiều câu hỏi).
- Ưu tiên số liệu trong mục [DỮ LIỆU HỆ THỐNG] bên dưới nếu có.
- Nếu câu hỏi hoàn toàn không liên quan Thái Nguyên/GDĐP, lịch sự nhắc phạm vi chuyên môn và gợi ý 2 chủ đề về Thái Nguyên.
${retrievedContext ? `\n[DỮ LIỆU HỆ THỐNG]\n${retrievedContext}` : ''}`;
}

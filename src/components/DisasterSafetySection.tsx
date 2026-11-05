import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  Mountain,
  ShieldCheck,
  CloudRain,
  PhoneCall,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  ExternalLink,
  Volume2,
  Maximize2,
  Film,
  Zap,
  Droplets,
  HeartHandshake
} from 'lucide-react';
import { SAFETY_GUIDES, PLACES } from '../data/geoData';
import { speechService } from '../utils/speech';

interface DisasterSafetySectionProps {
  lang: 'vi' | 'en';
  onNavigateToPlace: (placeId: string) => void;
}

export const DisasterSafetySection: React.FC<DisasterSafetySectionProps> = ({
  lang,
  onNavigateToPlace,
}) => {
  const [openGuideId, setOpenGuideId] = useState<string>('flood');
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null);

  const disasterPlaces = PLACES.filter((p) => p.category === 'disaster');

  const emergencyContacts = [
    { number: '112', labelVi: 'Yêu cầu Cứu nạn Khẩn cấp Toàn quốc', labelEn: 'National Search & Rescue' },
    { number: '114', labelVi: 'Cứu hỏa & Cứu nạn cứu hộ', labelEn: 'Firefighting & Emergency Rescue' },
    { number: '115', labelVi: 'Cấp cứu Y tế Đô thị & Nông thôn', labelEn: 'Medical Ambulance' },
  ];

  const handleSpeak = (text: string, speakLang: 'vi' | 'en') => {
    speechService.speak(text, speakLang);
  };

  return (
    <div id="section-disaster" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 scroll-mt-20">
      {/* 1. Tiêu đề chuẩn Google Sites: 03. Khí hậu và nơi có ngập lụt, sạt lở / 03. Climate and Areas Prone to Flooding and Landslides */}
      <div className="space-y-1 border-b border-stone-200 pb-4">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          03. Khí hậu và nơi có ngập lụt, sạt lở
        </h2>
        <h3 className="text-lg sm:text-xl font-medium text-stone-600">
          03. Climate and Areas Prone to Flooding and Landslides
        </h3>
      </div>

      {/* 2. Hai ảnh trên cùng cạnh nhau (Khớp chuẩn xác ảnh tham khảo: Sạt lở đất & Ngập lụt TTXVN) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Ảnh trái: Sạt lở đất */}
        <div className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-xs flex flex-col group">
          <div
            className="rounded-2xl overflow-hidden bg-stone-100 aspect-16/10 cursor-pointer relative"
            onClick={() => setActiveModalImage('/assets/aistudio/unnamed_012bcdbf.jpg')}
          >
            <img
              src="/assets/aistudio/unnamed_012bcdbf.jpg"
              alt="Hiện trường sạt lở đất đá nghiêm trọng tại Thái Nguyên"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 italic mt-2.5 text-center px-2">
            Hiện trường sạt lở taluy dương và sườn núi do mưa lớn kéo dài tại vùng núi Thái Nguyên
          </p>
        </div>

        {/* Ảnh phải: Ngập lụt sông Cầu - TTXVN */}
        <div className="bg-white rounded-3xl p-3 border border-stone-200/90 shadow-xs flex flex-col group">
          <div
            className="rounded-2xl overflow-hidden bg-stone-100 aspect-16/10 cursor-pointer relative"
            onClick={() => setActiveModalImage('/assets/aistudio/unnamed_48f9016c.jpg')}
          >
            <img
              src="/assets/aistudio/unnamed_48f9016c.jpg"
              alt="Toàn cảnh ngập lụt sâu dọc lưu vực sông Cầu Thái Nguyên - TTXVN"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
            <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xs text-stone-500 italic mt-2.5 text-center px-2">
            Ngập lụt diện rộng tại các khu dân cư và phường ven sông Cầu khi lũ dâng cao (Ảnh: TTXVN)
          </p>
        </div>
      </div>

      {/* 3. Khối nội dung song ngữ 2 cột chuẩn xác theo ảnh người dùng cung cấp */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        {/* CỘT TRÁI: TIẾNG VIỆT */}
        <div className="space-y-6 text-stone-800 text-sm leading-relaxed pr-0 md:pr-4">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-bold uppercase tracking-wider text-[#116149] bg-emerald-50 px-3 py-1 rounded-full">
              Phiên bản Tiếng Việt
            </span>
            <button
              onClick={() =>
                handleSpeak(
                  'Thái Nguyên mang khí hậu nhiệt đới gió mùa có mùa đông lạnh, với hai mùa rõ rệt là mùa mưa và mùa khô...',
                  'vi'
                )
              }
              className="text-xs text-[#116149] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Nghe đọc</span>
            </button>
          </div>

          <div className="space-y-3">
            <p>
              <strong className="text-[#116149] font-bold">Thái Nguyên</strong> mang khí hậu nhiệt đới gió mùa có mùa đông lạnh, với hai mùa rõ rệt là mùa mưa (tháng 5 đến tháng 10) và mùa khô (tháng 11 đến tháng 4 năm sau). Lượng mưa trung bình năm từ 1.500 – 2.000 mm, tập trung chủ yếu vào mùa hè với các đợt mưa lớn dồn dập.
            </p>
            <p>
              Do đặc thù địa hình lòng chảo, đồi núi dốc bao quanh và hệ thống sông Cầu, sông Công chảy qua, tỉnh thường xuyên đối mặt với hiểm họa ngập úng đô thị diện rộng, lũ ống, lũ quét và sạt lở sườn dốc:
            </p>
          </div>

          {/* 1. Khu vực có nguy cơ ngập lụt cao nhất */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-blue-900 flex items-center gap-2">
              <span>🌊</span>
              <span>1. Các khu vực có nguy cơ ngập lụt cao nhất</span>
            </h4>
            <div className="space-y-2 text-stone-700">
              <p>
                <strong>Khu vực trung tâm và vùng trũng ven sông Cầu:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Thành phố Thái Nguyên (quanh cầu Gia Bẩy, Gia Sàng, Đồng Bẩm...):</strong> Là nơi chịu ảnh hưởng nặng nề nhất mỗi khi có mưa lớn diện rộng và thượng nguồn xả lũ. Mực nước sông Cầu tại trạm thủy văn Gia Bẩy từng ghi nhận vượt mốc lịch sử (đạt đỉnh tới <strong>29,26m – 29,90m</strong>, vượt báo động 3 tới 2,9m), làm ngập sâu hàng loạt tuyến phố huyết mạch (Lương Ngọc Quyến, Hoàng Văn Thụ, Minh Cầu, Hùng Vương, Nha Trang, Bến Tượng) và cô lập hoàn toàn các phường ven sông (Linh Sơn, Gia Sàng, Tích Lương, Quán Triều, Phan Đình Phùng - khu vực Túc Duyên, cầu sắt chung cư Tiến Bộ).
                </li>
                <li>
                  <strong>Hóa Thượng, Đồng Hỷ và các vùng hạ lưu:</strong> Ghi nhận lượng mưa cực lớn trên 500mm, nước lũ từ thượng nguồn dồn về nhanh gây ngập úng diện rộng.
                </li>
              </ul>
              <p className="pt-1">
                <strong>Thượng nguồn sông Cầu & lưu vực miền núi:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Các vùng trũng thấp ven sông qua khu vực <strong>Chợ Mới, Thác Giềng</strong>: Thủy văn thường xuyên vượt báo động 3 khi mưa lũ kéo dài, gây ngập sâu và chia cắt giao thông cục bộ.
                </li>
                <li>
                  Các vùng trũng ven sông phía Nam (<strong>TP. Phổ Yên, Phú Bình, Đại Từ</strong>) và miền núi (<strong>Tràng Xá, Dân Tiến, La Hiên - Võ Nhai</strong>) thường xuyên bị cô lập do ngầm tràn ngập sâu.
                </li>
              </ul>
            </div>
          </div>

          {/* 2. Khu vực có nguy cơ sạt lở đất cao nhất */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-amber-900 flex items-center gap-2">
              <span>⛰️</span>
              <span>2. Các khu vực có nguy cơ sạt lở đất cao nhất</span>
            </h4>
            <ul className="space-y-2.5 list-disc pl-5 text-stone-700">
              <li>
                <strong>Vùng miền núi và đồi dốc Thái Nguyên (Văn Lăng, Đồng Hỷ, Định Hóa, Võ Nhai...):</strong> Địa hình đồi núi dốc đứng, cấu trúc đất phong hóa bở rời. Sau các đợt mưa dầm dài ngày, liên kết đất suy giảm nghiêm trọng dẫn đến sạt lở đất đá vùi lấp nhà cửa và cắt đứt giao thông (điển hình như các khu vực tái định cư tại <strong>xã Văn Lăng</strong> từng phải khẩn cấp di dời dân cư).
              </li>
              <li>
                <strong>Định Hóa:</strong> Các xã có địa hình dốc đứng như <span className="text-amber-800 font-medium underline underline-offset-2">Lam Vỹ</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Kim Phượng</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Phượng Tiến</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Trung Hội</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Bình Yên</span>.
              </li>
              <li>
                <strong>Phú Lương:</strong> Khu vực thuộc các xã <span className="text-amber-800 font-medium underline underline-offset-2">Vô Tranh</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Động Đạt</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Yên Trạch</span>, và dọc tuyến Quốc lộ 3 (thị trấn Đu sau sáp nhập xã Phấn Mễ).
              </li>
              <li>
                <strong>Đại Từ:</strong> Các xã ven sườn đông dãy núi Tam Đảo như <span className="text-amber-800 font-medium underline underline-offset-2">Xã Quân Chu</span> (sáp nhập thị trấn Quân Chu và xã Quân Chu), <span className="text-amber-800 font-medium underline underline-offset-2">Xã Vạn Phú</span> (sáp nhập từ Ký Phú, Vạn Thọ, Văn Yên), <span className="text-amber-800 font-medium underline underline-offset-2">Xã La Bằng</span>, <span className="text-amber-800 font-medium underline underline-offset-2">Xã Mỹ Yên</span>.
              </li>
              <li>
                <strong>Vùng đèo dốc và sườn đồi phía Bắc:</strong> Các tuyến đường giao thông liên xã, liên vùng uốn lượn ven sườn núi cao có nguy cơ rất cao xảy ra sạt lở taluy dương, đất đá sụt trượt và lăn đá tảng xuống lòng đường.
              </li>
            </ul>
          </div>

          {/* 3. Nguy cơ tại các điểm du lịch nổi tiếng */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-emerald-900 flex items-center gap-2">
              <span>🧭</span>
              <span>3. Nguy cơ tại các địa điểm du lịch nổi tiếng</span>
            </h4>
            <ul className="space-y-2 list-disc pl-5 text-stone-700">
              <li>
                <strong>Khu du lịch Hồ Núi Cốc (Đại Từ / Phổ Yên / TP. Thái Nguyên):</strong> Mực nước hồ điều tiết lớn; các vùng sườn đồi quanh hồ hoặc đường dẫn vào khu du lịch có thể xảy ra sạt lở nhỏ khi mưa dầm kéo dài; các khe suối đổ về hồ tiềm ẩn nguy cơ lũ quét cục bộ.
              </li>
              <li>
                <strong>Khu di tích lịch sử ATK Định Hóa:</strong> Bao quanh bởi núi rừng và khe suối nhỏ. Nguy cơ lớn nhất là sạt lở đất sườn đồi ở các tuyến đường giao thông liên khu di tích và lũ quét bất ngờ trên các con suối nhỏ khi có mưa lượng trút xuống lớn trong thời gian ngắn.
              </li>
              <li>
                <strong>Các vùng du lịch sinh thái, cộng đồng và đồi chè (Tân Cương, Võ Nhai, Định Hóa):</strong> Các đồi chè bậc thang hoặc sườn đồi dốc tại Tân Cương và vùng cao Võ Nhai dễ bị xói mòn, sạt lở mặt đất; các tuyến đường đèo lên vùng cao dễ bị sạt lở taluy gây chia cắt khách tham quan.
              </li>
            </ul>
          </div>

          {/* 4. Thống kê thiên tai lũ lụt & sạt lở lịch sử */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-2">
            <h5 className="font-black text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Dữ liệu thực tế thiên tai lũ lụt & sạt lở đất lịch sử tại Thái Nguyên</span>
            </h5>
            <ul className="space-y-1.5 list-disc pl-4 text-rose-900 leading-relaxed">
              <li>Mực nước sông Cầu đạt đỉnh <strong>29,90m</strong> (vượt báo động 3 tới 2,9m), khiến gần <strong>50 xã, phường</strong> của Thái Nguyên ngập sâu trong biển nước; nhiều khu vực như Võ Nhai, Tràng Xá, Dân Tiến, Trại Cau, Nam Hòa, Quan Triều, Phan Đình Phùng bị cô lập hoàn toàn.</li>
              <li>Báo cáo ghi nhận gần <strong>1.000 vị trí sạt lở taluy dương</strong>, nhiều tuyến giao thông huyết mạch bị tê liệt; hàng chục điểm trường học, bệnh viện và trạm y tế bị ngập sâu làm hư hỏng thiết bị dạy học và y tế.</li>
              <li>Tổng thiệt hại ước tính lên tới hơn <strong>2.120 tỷ đồng</strong>, ảnh hưởng đến khoảng <strong>200.000 hộ dân</strong> và gây ra những tổn thất nặng nề về người, hoa màu, gia súc.</li>
            </ul>
          </div>
        </div>

        {/* CỘT PHẢI: ENGLISH */}
        <div className="space-y-6 text-stone-800 text-sm leading-relaxed border-t md:border-t-0 md:border-l border-stone-200 pt-6 md:pt-0 md:pl-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-3 py-1 rounded-full">
              English Translation
            </span>
            <button
              onClick={() =>
                handleSpeak(
                  'Thai Nguyen has a tropical monsoon climate with cold winters and two distinct seasons: the rainy season and the dry season...',
                  'en'
                )
              }
              className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="font-extrabold text-base text-stone-900">
              Climate and Areas at Risk of Flooding and Landslides in Thai Nguyen
            </h4>
            <p>
              Thai Nguyen has a tropical monsoon climate with cold winters and two distinct seasons: the rainy season (May to October) and the dry season (November to April of the following year). Annual average precipitation ranges from 1,500 to 2,000 mm, concentrated heavily in summer torrential downpours.
            </p>
            <p>
              Due to its basin-like topography, surrounding steep mountains, and major hydrological networks (Cau River, Cong River), the province frequently suffers from extensive urban floods, flash floods, and hillside slope failures:
            </p>
          </div>

          {/* Section 1 Flooding (EN) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-blue-900 flex items-center gap-2">
              <span>1. Areas at Highest Risk of Flooding</span>
              <span>🌊</span>
            </h4>
            <div className="space-y-2 text-stone-700">
              <p>
                <strong>Downtown Center & Low-Lying Cau River Floodplains:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  <strong>Thai Nguyen City Center (Gia Bay Bridge, Gia Sang, Dong Bam...):</strong> Hardest-hit whenever upstream dams discharge water during widespread storms. The Cau River level at Gia Bay hydrological station surged past historic peaks (reaching <strong>29.26m – 29.90m</strong>, 2.9m above Alarm Level 3), submerging vital downtown thoroughfares (Luong Ngoc Quyen, Hoang Van Thu, Minh Cau, Nha Trang) and isolating riverside wards (Linh Son, Gia Sang, Tich Luong, Quan Trieu, Phan Dinh Phung - Tuc Duyen area).
                </li>
                <li>
                  <strong>Hoa Thuong, Dong Hy & Downstream Areas:</strong> Recorded extreme precipitation exceeding 500mm, with rapid upstream runoff causing widespread inundation.
                </li>
              </ul>
              <p className="pt-1">
                <strong>Upstream Cau River & Mountain Basins:</strong>
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Low-lying riverside zones along <strong>Cho Moi, Thac Gieng</strong>: Frequently surpass Alarm Level 3 during monsoon rains, severing transport corridors.
                </li>
                <li>
                  Southern lowlands (<strong>Pho Yen City, Phu Binh, Dai Tu</strong>) and highland communes (<strong>Trang Xa, Dan Tien, La Hien - Vo Nhai</strong>) are frequently isolated by submerged spillways.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2 Landslides (EN) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-amber-900 flex items-center gap-2">
              <span>2. Areas at Highest Risk of Landslides and Flash Floods</span>
              <span>⛰️</span>
            </h4>
            <ul className="space-y-2.5 list-disc pl-5 text-stone-700">
              <li>
                <strong>Mountainous and Steep-Slope Areas (Van Lang, Dong Hy, Dinh Hoa, Vo Nhai...):</strong> Steep terrain with weathered, loose soil. Prolonged soakings severely degrade shear strength, triggering catastrophic slope collapses (e.g. resettlement villages in <strong>Van Lang Commune</strong> had to be urgently evacuated).
              </li>
              <li>
                <strong>Dinh Hoa:</strong> Steep communes including <span className="font-medium text-amber-800">Lam Vy, Kim Phuong, Phuong Tien, Trung Hoi, Binh Yen</span>.
              </li>
              <li>
                <strong>Phu Luong:</strong> Areas across <span className="font-medium text-amber-800">Vo Tranh, Dong Dat, Yen Trach</span> communes, and along National Highway 3 (Du township following Phan Me merger).
              </li>
              <li>
                <strong>Dai Tu:</strong> Tam Dao eastern foothill communes including <span className="font-medium text-amber-800">Quan Chu Commune</span> (merger of township and commune), <span className="font-medium text-amber-800">Van Phu Commune</span> (merger of Ky Phu, Van Tho, Van Yen), <span className="font-medium text-amber-800">La Bang</span>, and <span className="font-medium text-amber-800">My Yen</span>.
              </li>
              <li>
                <strong>Northern Mountain Passes and Hillslopes:</strong> High-altitude inter-communal roads winding along steep mountain flanks face high risks of road-cut slope failures and falling boulders.
              </li>
            </ul>
          </div>

          {/* Section 3 Tourism Hazards (EN) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-extrabold text-base text-emerald-900 flex items-center gap-2">
              <span>3. Hazards at Famous Tourist Destinations</span>
              <span>🧭</span>
            </h4>
            <ul className="space-y-2 list-disc pl-5 text-stone-700">
              <li>
                <strong>Nui Coc Lake Ecotourism Area:</strong> High reservoir retention volume; lakeside hillslopes and access roads risk minor landslides during extended rains, while feeding streams pose localized flash flood risks.
              </li>
              <li>
                <strong>ATK Dinh Hoa Historical Relic Complex:</strong> Encircled by rugged mountains and stream ravines. Main hazards involve hillside failures along inter-site roads and sudden flash floods during intense localized downpours.
              </li>
              <li>
                <strong>Ecotourism, Tea Hills & Highland Communities (Tan Cuong, Vo Nhai, Dinh Hoa):</strong> Terraced tea hills on steep gradients are vulnerable to topsoil erosion; mountain pass roads risk cut-slope collapses, disrupting tourist transport.
              </li>
            </ul>
          </div>

          {/* Section 4 Historic Statistics (EN) */}
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-950 space-y-2">
            <h5 className="font-black text-rose-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Verified Historical Flood & Landslide Data in Thai Nguyen</span>
            </h5>
            <ul className="space-y-1.5 list-disc pl-4 text-rose-900 leading-relaxed">
              <li>Cau River floodwaters peaked at <strong>29.90m</strong> (2.9m over Alarm 3), submerging nearly <strong>50 communes and wards</strong>; regions like Vo Nhai, Trang Xa, Dan Tien, Trai Cau, Nam Hoa, Quan Trieu, and Phan Dinh Phung were entirely isolated.</li>
              <li>Official assessments documented nearly <strong>1,000 road-cut landslide spots</strong>, paralyzing traffic, while dozens of schools, hospitals, and clinics were deeply inundated.</li>
              <li>Total estimated damages exceeded <strong>2,120 billion VND</strong>, impacting over <strong>200,000 households</strong> with severe losses in lives, agriculture, and livestock.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. VIDEO HOẠT HỌA GIÁO DỤC: KỸ NĂNG AN TOÀN SAU LŨ & TINH THẦN CỘNG ĐỒNG */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-rose-700" />
                <span>Phim Hoạt Họa Kỹ Năng Sống GDĐP</span>
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
                Video Tư Liệu Thực Tế
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-stone-900">
              {lang === 'vi'
                ? 'An Toàn Sau Lũ Lụt & Phục Hồi Đời Sống Cộng Đồng Thái Nguyên'
                : 'Post-Flood Safety Protocols & Community Revival in Thai Nguyen'}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600">
              {lang === 'vi'
                ? 'Phim hoạt họa giáo dục mô phỏng trận lũ lịch sử trạm Gia Bảy vượt đỉnh 1959 và các kỹ năng sống phòng tránh tai nạn thương tâm sau thiên tai.'
                : 'Educational animation simulating the historic Gia Bay flood and crucial safety rules for post-disaster recovery.'}
            </p>
          </div>
        </div>

        {/* Video Player */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 rounded-2xl overflow-hidden bg-black shadow-md border border-stone-800">
            <video
              controls
              playsInline
              preload="metadata"
              className="w-full h-auto max-h-[480px] object-contain mx-auto"
              src="/assets/aistudio/1793870393051_8353142396705516183_8353142396705516183_7dbfa757.mp4"
            >
              Trình duyệt của bạn không hỗ trợ thẻ video.
            </video>
          </div>

          {/* 4 Nguyên Tắc Vàng Từ Video */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1">
                <span>⭐</span>
                <span>4 Nguyên Tắc Vàng An Toàn Sau Lũ</span>
              </h4>
              <p className="text-xs text-amber-950 font-medium italic">
                "Nước lũ rút, hiểm nguy chưa dứt. Chủ động an toàn, để Thái Nguyên sớm ngày hồi sinh!"
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-amber-700">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>1. Tuyệt đối không bật điện khi còn ẩm ướt</span>
                </div>
                <p className="text-stone-600 pl-5 leading-relaxed">
                  Ổ cắm, đường dây bị ngâm nước lũ sông Cầu sẽ chập cháy, điện giật tử vong. Phải chờ thợ điện lực kiểm tra an toàn từng nhánh và hong khô toàn bộ thiết bị.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-blue-700">
                  <Droplets className="w-4 h-4 shrink-0" />
                  <span>2. Khử khuẩn nguồn nước – Ăn chín uống sôi</span>
                </div>
                <p className="text-stone-600 pl-5 leading-relaxed">
                  Không uống nước giếng hoặc bể ngầm đã bị nước lũ tràn ngập (vi khuẩn tả, lỵ nguy hiểm). Cần nạo vét bùn, đánh phèn, khử khuẩn bằng Cloramin B và đun sôi trước khi dùng.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>3. Tránh xa mép đê, bờ kè có nguy cơ sụt lún</span>
                </div>
                <p className="text-stone-600 pl-5 leading-relaxed">
                  Đất ven đê, taluy no nước có thể sạt lở bất kỳ lúc nào. Học sinh tuyệt đối không ra mép sông câu cá, vớt củi hay lại gần dây điện đứt chìm trong bùn.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-emerald-700">
                  <HeartHandshake className="w-4 h-4 shrink-0" />
                  <span>4. Nước rút đến đâu cạo bùn đến đó</span>
                </div>
                <p className="text-stone-600 pl-5 leading-relaxed">
                  Không đổ bùn xuống cống làm tắc hệ thống thoát nước thành phố; rắc vôi bột úp chum vại phòng dịch sốt xuất huyết; chung tay dọn dẹp nhà người già neo đơn và trường lớp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TƯ LIỆU ẢNH THỰC TẾ THIÊN TAI THÁI NGUYÊN (Trích xuất từ Hồ sơ Kỹ thuật) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full inline-block">
            Hình Ảnh Thực Tế Hiện Trường
          </span>
          <h4 className="text-lg sm:text-xl font-extrabold text-stone-900">
            Tư Liệu Ảnh Hiện Trường Ngập Lụt Sông Cầu & Sạt Lở Đất Đá Thái Nguyên
          </h4>
          <p className="text-xs text-stone-600">
            Ảnh chụp thực tế từ các cơ quan thông tấn và hồ sơ cảnh báo thiên tai tỉnh Thái Nguyên
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Ảnh 1: Toàn cảnh ngập lụt sông Cầu - Cầu Gia Bẩy */}
          <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-xs flex flex-col group">
            <div
              className="rounded-2xl overflow-hidden bg-stone-100 cursor-pointer relative aspect-16/10"
              onClick={() => setActiveModalImage('/assets/aistudio/ngap_lut_song_cau_gia_bay.png')}
            >
              <img
                src="/assets/aistudio/ngap_lut_song_cau_gia_bay.png"
                alt="Toàn cảnh ngập lụt lịch sử lưu vực sông Cầu - Cầu Gia Bẩy (TP. Thái Nguyên)"
                className="w-full h-full object-cover group-hover:scale-101 transition-transform"
              />
              <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
              <div className="absolute bottom-2 left-2 bg-blue-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                Sông Cầu - Cầu Gia Bẩy (TP. Thái Nguyên)
              </div>
            </div>
            <p className="text-xs text-stone-700 font-semibold text-center mt-2.5 px-2">
              Toàn cảnh lưu vực sông Cầu ngập trắng vượt mốc lịch sử tại khu vực Cầu Gia Bẩy (TP. Thái Nguyên)
            </p>
          </div>

          {/* Ảnh 2: Sạt lở taluy đường đèo miền núi */}
          <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-xs flex flex-col group">
            <div
              className="rounded-2xl overflow-hidden bg-stone-100 cursor-pointer relative aspect-16/10"
              onClick={() => setActiveModalImage('/assets/aistudio/sat_lo_taluy_dat_da.png')}
            >
              <img
                src="/assets/aistudio/sat_lo_taluy_dat_da.png"
                alt="Hiện trường sạt lở đất đá mái taluy dương đè sập đường giao thông miền núi Thái Nguyên"
                className="w-full h-full object-cover group-hover:scale-101 transition-transform"
              />
              <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
              <div className="absolute bottom-2 left-2 bg-amber-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                Sạt lở taluy dương mái dốc miền núi
              </div>
            </div>
            <p className="text-xs text-stone-700 font-semibold text-center mt-2.5 px-2">
              Sạt lở đất đá taluy dương mái dốc nghiêm trọng làm tê liệt các tuyến giao thông đèo dốc
            </p>
          </div>
        </div>
      </div>

      {/* 4. Infographic Poster Posters (Khớp ảnh người dùng cung cấp) */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#116149] bg-emerald-50 px-3 py-1 rounded-full inline-block">
            Tư Liệu Trực Quan Sinh Động
          </span>
          <h4 className="text-lg sm:text-xl font-extrabold text-stone-900">
            Infographic Khí Hậu & Tổng Quan Không Gian Địa Lý Thái Nguyên
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Poster 1: Khí hậu Thái Nguyên - Trong lành - Mát mẻ - Tươi đẹp quanh năm */}
          <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-xs flex flex-col group">
            <div
              className="rounded-2xl overflow-hidden bg-stone-100 cursor-pointer relative"
              onClick={() => setActiveModalImage('/assets/aistudio/image_e4be71b2.png')}
            >
              <img
                src="/assets/aistudio/image_e4be71b2.png"
                alt="Infographic Khí Hậu Thái Nguyên - Trong lành Mát mẻ Tươi đẹp quanh năm"
                className="w-full h-auto object-cover group-hover:scale-101 transition-transform"
              />
              <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xs text-stone-600 font-semibold text-center mt-2.5 px-2">
              Infographic Khí Hậu Thái Nguyên: 4 mùa, nhiệt độ 21–23°C, lượng mưa 1.500–2.000 mm/năm
            </p>
          </div>

          {/* Poster 2: Bản đồ Tỉnh Thái Nguyên sau sáp nhập & các điểm du lịch */}
          <div className="bg-white rounded-3xl p-3 border border-stone-200 shadow-xs flex flex-col group">
            <div
              className="rounded-2xl overflow-hidden bg-stone-100 cursor-pointer relative"
              onClick={() => setActiveModalImage('/assets/aistudio/image_ca330ac5.png')}
            >
              <img
                src="/assets/aistudio/image_ca330ac5.png"
                alt="Bản đồ Tỉnh Thái Nguyên - Hai vùng đất Một hành trình Vạn trải nghiệm"
                className="w-full h-auto object-cover group-hover:scale-101 transition-transform"
              />
              <div className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xs text-stone-600 font-semibold text-center mt-2.5 px-2">
              Bản đồ quy hoạch & danh thắng liên kết du lịch: ATK Định Hóa, Hồ Núi Cốc, Tân Cương, Ba Bể
            </p>
          </div>
        </div>
      </div>

      {/* 5. Các điểm nguy cơ trọng điểm trên bản đồ số */}
      <div className="space-y-4 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full inline-block mb-1">
              Điểm Ghim Tọa Độ GPS
            </span>
            <h4 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>{lang === 'vi' ? 'Các Điểm Nguy Cơ Trọng Điểm Tại Thái Nguyên' : 'Critical Hazard Zones in Thai Nguyen'}</span>
            </h4>
          </div>
          <span className="text-xs text-stone-500 italic">
            {lang === 'vi' ? 'Bấm vào thẻ để xem vị trí trên Bản đồ tương tác' : 'Click card to highlight on Interactive Map'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {disasterPlaces.map((hazard) => (
            <div
              key={hazard.id}
              onClick={() => onNavigateToPlace(hazard.id)}
              className="p-4 rounded-2xl bg-stone-50/80 hover:bg-white border border-rose-200 shadow-2xs hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: hazard.color }}
                  >
                    {lang === 'vi' ? hazard.typeVi : hazard.typeEn}
                  </span>
                  <MapPin className="w-4 h-4 text-rose-500 group-hover:scale-125 transition-transform" />
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-stone-900 group-hover:text-rose-700 transition-colors">
                  {lang === 'vi' ? hazard.nameVi : hazard.nameEn}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                  📍 {lang === 'vi' ? hazard.locationVi : hazard.locationEn}
                </p>
                <p className="text-xs text-stone-700 mt-1.5 line-clamp-2">
                  {lang === 'vi' ? hazard.descVi : hazard.descEn}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] font-bold text-rose-700">
                <span>{lang === 'vi' ? 'Xem tọa độ & cảnh báo' : 'Locate on Map'}</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Quy tắc ứng phó & Cẩm nang an toàn mùa mưa lũ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#116149] bg-emerald-50 px-3 py-1 rounded-full inline-block mb-1">
            {lang === 'vi' ? 'Cẩm Nang Kỹ Năng Sống Cho Học Sinh' : 'Student Life-Survival Handbook'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900">
            {lang === 'vi'
              ? 'Quy Tắc Ứng Phó & Phòng Tránh Tai Nạn Mùa Mưa Lũ'
              : 'Safety Protocols & Accident Prevention Rules'}
          </h3>
        </div>

        <div className="space-y-3">
          {SAFETY_GUIDES.map((guide) => {
            const isOpen = openGuideId === guide.id;
            return (
              <div
                key={guide.id}
                className="rounded-2xl border border-stone-200 overflow-hidden shadow-2xs"
              >
                <button
                  onClick={() => setOpenGuideId(isOpen ? '' : guide.id)}
                  className="w-full p-4 text-left flex items-center justify-between bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      {guide.id === 'flood' ? <Waves className="w-4 h-4" /> : <Mountain className="w-4 h-4" />}
                    </div>
                    <span className="font-bold text-sm text-stone-900">
                      {lang === 'vi' ? guide.titleVi : guide.titleEn}
                    </span>
                  </div>

                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white space-y-2.5 border-t border-stone-100">
                    {(lang === 'vi' ? guide.tipsVi : guide.tipsEn).map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <CheckCircle2 className="w-4 h-4 text-[#116149] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. Đường dây nóng khẩn cấp */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>{lang === 'vi' ? 'Đường dây nóng Khẩn cấp' : 'Emergency Hotlines'}</span>
          </div>
          <h4 className="text-lg font-black text-stone-900">
            {lang === 'vi' ? 'Số Điện Thoại Cứu Hộ Khi Có Thiên Tai' : 'Emergency Contact Assistance'}
          </h4>
          <p className="text-xs text-stone-500 max-w-md">
            {lang === 'vi'
              ? 'Học sinh hãy ghi nhớ các đầu số khẩn cấp sau để gọi ngay khi gặp nguy hiểm ngập lụt, sạt lở.'
              : 'Memorize these emergency numbers to call immediately in flood or landslide emergencies.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {emergencyContacts.map((c) => (
            <a
              key={c.number}
              href={`tel:${c.number}`}
              className="px-5 py-3 rounded-2xl bg-rose-50/60 hover:bg-rose-100 border border-rose-200 text-center transition-colors min-w-[120px] shadow-2xs"
            >
              <div className="text-2xl font-black text-rose-700 font-mono">{c.number}</div>
              <div className="text-[11px] text-stone-700 font-semibold mt-0.5">{lang === 'vi' ? c.labelVi : c.labelEn}</div>
            </a>
          ))}
        </div>
      </div>

      {/* Modal Phóng To Ảnh */}
      {activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setActiveModalImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2">
            <img
              src={activeModalImage}
              alt="Ảnh phóng to chi tiết"
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
            <button
              onClick={() => setActiveModalImage(null)}
              className="absolute top-4 right-4 bg-black/70 hover:bg-black text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { BookOpen, GraduationCap, MapPin, School, Users } from 'lucide-react';

interface ProjectAuthorsSectionProps {
  lang: 'vi' | 'en';
}

export const ProjectAuthorsSection: React.FC<ProjectAuthorsSectionProps> = ({ lang }) => {
  const isVi = lang === 'vi';

  const students = [
    {
      index: '01',
      initials: 'MH',
      name: 'Hà Thị Minh Hạnh',
      className: isVi ? 'Lớp 8A4' : 'Class 8A4',
      school: isVi
        ? 'Trường THCS Nguyễn Tất Thành, xã Đại Phúc'
        : 'Nguyen Tat Thanh Secondary School, Dai Phuc Commune',
      role: isVi ? 'Học sinh dự thi · Tác giả dự án' : 'Student Researcher · Co-Author',
    },
    {
      index: '02',
      initials: 'MA',
      name: 'Nguyễn Thị Mai Anh',
      className: isVi ? 'Lớp 8A4' : 'Class 8A4',
      school: isVi
        ? 'Trường THCS Nguyễn Tất Thành, xã Đại Phúc'
        : 'Nguyen Tat Thanh Secondary School, Dai Phuc Commune',
      role: isVi ? 'Học sinh dự thi · Tác giả dự án' : 'Student Researcher · Co-Author',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Section Heading */}
      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-[#116149]">
          {isVi ? 'THÔNG TIN DỰ ÁN & NHÓM TÁC GIẢ' : 'PROJECT INFORMATION & AUTHORS'}
        </span>
        <h2 className="text-2xl font-extrabold text-stone-900 mt-0.5">
          {isVi ? 'Tác Giả Thực Hiện Dự Án' : 'Project Authors & Research Supervisor'}
        </h2>
      </div>

      {/* Single-elevation editorial container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {/* Project Title Header Band */}
        <div className="bg-[#116149] text-white px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-emerald-100/90">
            <span>{isVi ? 'Dự án Khoa học Kỹ thuật' : 'Science & Engineering Research Project'}</span>
            <span aria-hidden="true">·</span>
            <span>{isVi ? 'Mã nhóm lĩnh vực: 2' : 'Category Code: 2'}</span>
            <span aria-hidden="true">·</span>
            <span>
              {isVi
                ? 'Lĩnh vực: Khoa học xã hội và hành vi'
                : 'Field: Social and Behavioral Sciences'}
            </span>
          </div>

          <h3 className="mt-3 text-xl sm:text-2xl font-extrabold leading-snug tracking-tight text-white max-w-4xl">
            {isVi
              ? '“Ứng dụng bản đồ số tương tác THAINGUYEN GEO-MAP trong hỗ trợ học tập Nội dung giáo dục địa phương tỉnh Thái Nguyên”'
              : '“Applying the Interactive Digital Map THAINGUYEN GEO-MAP to Support Learning Local Education Content in Thai Nguyen Province”'}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-50/95">
            <div className="flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-200 shrink-0" />
              <span className="font-semibold">
                {isVi
                  ? 'Trường THCS Nguyễn Tất Thành, xã Đại Phúc, tỉnh Thái Nguyên'
                  : 'Nguyen Tat Thanh Secondary School, Dai Phuc Commune, Thai Nguyen Province'}
              </span>
            </div>
          </div>
        </div>

        {/* Authors & Mentor Grid (whitespace + hairline dividers, no nested boxed cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Student Authors (2 columns on desktop) */}
          <div className="lg:col-span-2 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
              <Users className="w-4 h-4 text-[#116149]" />
              <span>
                {isVi ? 'Học sinh thực hiện dự án (02 tác giả)' : 'Student Authors (02 Researchers)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {students.map((student) => (
                <div key={student.index} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#eaf5ef] border border-[#116149]/15 flex items-center justify-center shrink-0">
                    <span className="text-sm font-extrabold text-[#116149] tracking-tight">
                      {student.initials}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#116149]">
                      {student.index}. {student.role}
                    </div>
                    <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 leading-snug">
                      {student.name}
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-stone-600">
                      <p className="font-semibold text-stone-800">{student.className}</p>
                      <p className="text-xs text-stone-500 leading-relaxed">{student.school}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Supervisor */}
          <div className="p-6 sm:p-8 bg-stone-50/50">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500 mb-6">
              <GraduationCap className="w-4 h-4 text-[#116149]" />
              <span>{isVi ? 'Người hướng dẫn nghiên cứu' : 'Research Supervisor'}</span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                <GraduationCap className="w-6 h-6 text-amber-800" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-amber-800">
                  {isVi ? 'Giáo viên hướng dẫn' : 'Faculty Advisor'}
                </div>
                <h4 className="text-lg font-extrabold text-stone-900 mt-0.5 leading-snug">
                  Trần Thị Ly
                </h4>
                <div className="mt-2 space-y-1 text-xs text-stone-600 leading-relaxed">
                  <p className="font-semibold text-stone-800">
                    {isVi ? 'Người hướng dẫn nghiên cứu' : 'Project Research Mentor'}
                  </p>
                  <p className="text-stone-500">
                    {isVi
                      ? 'Trường THCS Nguyễn Tất Thành, xã Đại Phúc'
                      : 'Nguyen Tat Thanh Secondary School, Dai Phuc Commune'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Unboxed Metadata Footer Bar */}
        <div className="px-6 py-4 sm:px-8 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span className="inline-flex items-center gap-1.5 font-semibold text-stone-800">
              <BookOpen className="w-3.5 h-3.5 text-[#116149]" />
              {isVi ? 'Lĩnh vực: Khoa học xã hội và hành vi' : 'Field: Social & Behavioral Sciences'}
            </span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>{isVi ? 'Mã nhóm lĩnh vực: 2' : 'Category Code: 2'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-[#116149]" />
            <span>
              {isVi ? 'Xã Đại Phúc, tỉnh Thái Nguyên' : 'Dai Phuc Commune, Thai Nguyen Province'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

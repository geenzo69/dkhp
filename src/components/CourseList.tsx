"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Calendar, Clock, ArrowUp, ArrowDown, X, Info } from "lucide-react";
import Card from "./Card";
import { HocPhan, LopHocPhan } from "@/util/course";
import { formatTkb } from "@/util/format";

function SiSoDisplay({ current, total }: { current: number; total: number }) {
    const [effect, setEffect] = useState<"up" | "down" | null>(null);
    const prevValue = useRef(current);

    useEffect(() => {
        if (current > prevValue.current) {
            setEffect("up");
            const timer = setTimeout(() => setEffect(null), 2000);
            return () => clearTimeout(timer);
        } else if (current < prevValue.current) {
            setEffect("down");
            const timer = setTimeout(() => setEffect(null), 2000);
            return () => clearTimeout(timer);
        }
        prevValue.current = current;
    }, [current]);

    const percent = Math.min(100, Math.max(0, (current / total) * 100));

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1 w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${
                        percent >= 90 ? "bg-red-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            <div className="relative flex items-center gap-1">
                <span
                    className={`text-[10px] font-bold transition-colors duration-300 ${
                        effect === "up"
                            ? "text-emerald-600 scale-110"
                            : effect === "down"
                              ? "text-red-500 scale-110"
                              : "text-slate-500"
                    }`}
                >
                    {current}/{total}
                </span>
                {effect === "up" && (
                    <ArrowUp
                        size={10}
                        className="text-emerald-500 animate-bounce absolute -right-3"
                    />
                )}
                {effect === "down" && (
                    <ArrowDown
                        size={10}
                        className="text-red-400 animate-bounce absolute -right-3"
                    />
                )}
            </div>
        </div>
    );
}

interface CourseListProps {
    courses: HocPhan[] | null;
    isLoading: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    registeredHP: { course: HocPhan; group: LopHocPhan }[];
    onOpenModal: (course: HocPhan) => void;
    onRemoveCourse: (courseId: string) => void;
}

export default function CourseList({
    courses,
    isLoading,
    searchTerm,
    setSearchTerm,
    registeredHP,
    onOpenModal,
    onRemoveCourse,
}: CourseListProps) {
    const filteredCourses = courses
        ? courses.filter(
              (c) =>
                  c.dkmh_tu_dien_hoc_phan_ten_vn
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                  c.dkmh_tu_dien_hoc_phan_ma
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
          )
        : [];

    return (
        <div className="xl:col-span-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Đăng ký học phần
                    </h2>
                </div>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded shadow-sm text-sm w-full md:w-64 focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card title="Danh sách học phần mở" icon={Calendar}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Học phần
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Chi tiết lịch
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Sĩ số
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                    Lựa chọn
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative">
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                      <tr key={i} className="animate-pulse">
                                          <td className="px-6 py-5">
                                              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                                              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                                          </td>
                                          <td className="px-6 py-5">
                                              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                              <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                                          </td>
                                          <td className="px-6 py-5">
                                              <div className="h-1.5 bg-slate-100 rounded-full w-24"></div>
                                          </td>
                                          <td className="px-6 py-5 text-right">
                                              <div className="h-8 bg-slate-100 rounded w-20 ml-auto"></div>
                                          </td>
                                      </tr>
                                  ))
                                : filteredCourses.map((course) => {
                                      const registration = registeredHP.find(
                                          (r) =>
                                              r.course.dkmh_tu_dien_hoc_phan_ma ===
                                              course.dkmh_tu_dien_hoc_phan_ma,
                                      );
                                      const isFromAPI =
                                          course.trang_thai_dang_ky === 1;
                                      const active = !!registration || isFromAPI;

                                      const teacherName =
                                          course.dkmh_tu_dien_giang_vien_ten_vn ||
                                          "Đang cập nhật";

                                      let displayGroup = "";
                                      if (registration) {
                                          displayGroup = `Nhóm ${registration.group.dkmh_nhom_hoc_phan_ma}`;
                                      } else if (isFromAPI) {
                                          displayGroup = `Nhóm ${course.dkmh_nhom_hoc_phan_ma || "?"}`;
                                      }

                                      return (
                                          <tr
                                              key={course.key}
                                              className={`hover:bg-slate-50/80 transition-colors ${active ? "bg-blue-50/30" : ""}`}
                                          >
                                              <td className="px-6 py-5">
                                                  <div className="font-bold text-slate-700 text-sm leading-tight mb-1">
                                                      {course.dkmh_tu_dien_hoc_phan_ten_vn}
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                      <span className="text-[10px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 border">
                                                          {course.dkmh_tu_dien_hoc_phan_ma}
                                                      </span>
                                                      <span className="text-[10px] font-bold text-[#3f6ad8] uppercase tracking-tighter">
                                                          {course.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                                                      </span>
                                                  </div>
                                              </td>
                                              <td className="px-6 py-5">
                                                  {active ? (
                                                      <>
                                                          <div className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5 leading-tight">
                                                              <Clock size={12} className="shrink-0" /> 
                                                              <span>{formatTkb(registration?.group.dkmh_tu_dien_lop_hoc_phan_tkb || course.dkmh_tu_dien_lop_hoc_phan_tkb)}</span>
                                                          </div>
                                                          <div className="text-[10px] text-[#3f6ad8] mt-1.5 uppercase tracking-tighter font-black flex items-center gap-1">
                                                              {displayGroup} •{" "}
                                                              {(() => {
                                                                  const groupData =
                                                                      registration?.group ||
                                                                      course.data_nhom_hp.find(
                                                                          (g) =>
                                                                              g.dkmh_nhom_hoc_phan_ma ===
                                                                              course.dkmh_nhom_hoc_phan_ma,
                                                                      );
                                                                  return (
                                                                      groupData
                                                                          ?.data?.[0]
                                                                          ?.gv?.[0]
                                                                          ?.dkmh_tu_dien_giang_vien_ten_vn ||
                                                                      teacherName
                                                                  );
                                                              })()}
                                                          </div>
                                                      </>
                                                  ) : (
                                                      <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic flex items-center gap-1">
                                                          <Search size={10} /> Chưa chọn nhóm
                                                      </div>
                                                  )}
                                              </td>
                                              <td className="px-6 py-5">
                                                  {(() => {
                                                      const group =
                                                          registration?.group ||
                                                          course.data_nhom_hp.find(
                                                              (g) =>
                                                                  g.dkmh_nhom_hoc_phan_ma ===
                                                                  course.dkmh_nhom_hoc_phan_ma,
                                                          ) ||
                                                          course.data_nhom_hp[0];
                                                      if (!group) return <span className="text-[10px] text-slate-400">N/A</span>;
                                                      const current =
                                                          group.dkmh_tu_dien_lop_hoc_phan_si_so -
                                                          group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai;
                                                      return (
                                                          <SiSoDisplay
                                                              current={current}
                                                              total={
                                                                  group.dkmh_tu_dien_lop_hoc_phan_si_so
                                                              }
                                                              key={`${group.key}-${current}`}
                                                          />
                                                      );
                                                  })()}
                                              </td>
                                              <td className="px-6 py-5">
                                                  <div className="flex items-center justify-end gap-2">
                                                      {active && (
                                                          <button
                                                              onClick={() => onOpenModal(course)}
                                                              className="text-[10px] font-black uppercase text-slate-400 hover:text-[#3f6ad8] transition-colors p-2 rounded-lg hover:bg-slate-100"
                                                              title="Xem các nhóm khác của học phần này"
                                                          >
                                                              <Info size={16} />
                                                          </button>
                                                      )}
                                                      {registration && (
                                                          <button
                                                              onClick={() => onRemoveCourse(course.dkmh_tu_dien_hoc_phan_ma)}
                                                              className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                                              title="Bỏ chọn học phần này"
                                                          >
                                                              <X size={16} />
                                                          </button>
                                                      )}
                                                      {!registration && !isFromAPI && (
                                                          <button
                                                              onClick={() => onOpenModal(course)}
                                                              className="border-2 border-[#3f6ad8] text-[#3f6ad8] px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-[#3f6ad8] hover:text-white transition-all active:scale-95 shadow-sm"
                                                          >
                                                              Chọn nhóm
                                                          </button>
                                                      )}
                                                      {isFromAPI && (
                                                          <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest border border-slate-200">
                                                              Đã đăng ký
                                                          </span>
                                                      )}
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

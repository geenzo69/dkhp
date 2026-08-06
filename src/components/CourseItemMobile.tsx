"use client";

import { useApp } from "@/providers/AppContext";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import { formatTkb, getCourseColor } from "@/util/format";
import { BookOpen, CheckCircle2, Clock, Info, Search, Users, X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { SiSoDisplay, getTeacherName, getClassroomName } from "./CourseItem";

export default function CourseItemMobile({
    course,
    setSelectedCourseForModal,
}: {
    course: Course;
    setSelectedCourseForModal: Dispatch<SetStateAction<Course | null>>;
}) {
    const { notify, addLog, setPlannedCourses, plannedCourses } = useApp();

    const registration = plannedCourses.find(
        (r) => r.course.dkmh_tu_dien_hoc_phan_ma === course.dkmh_tu_dien_hoc_phan_ma,
    );
    const isFromAPI = course.trang_thai_dang_ky === 1;
    const active = !!registration || isFromAPI;

    let displayGroup = "";
    if (registration) {
        displayGroup = `Nhóm ${registration.group.dkmh_nhom_hoc_phan_ma}`;
    } else if (isFromAPI) {
        displayGroup = `Nhóm ${course.dkmh_nhom_hoc_phan_ma || "?"}`;
    }

    const group =
        registration?.group ||
        course.data_nhom_hp.find(
            (g) => g.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma,
        ) ||
        course.data_nhom_hp[0];

    const currentSiso = group
        ? group.dkmh_tu_dien_lop_hoc_phan_si_so - group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai
        : 0;
    const totalSiso = group ? group.dkmh_tu_dien_lop_hoc_phan_si_so : 0;

    const courseColors = getCourseColor(course.dkmh_tu_dien_hoc_phan_ma);

    return (
        <div
            className={`rounded-xl border p-4 shadow-sm transition-all hover:shadow-md ${
                active
                    ? "border-blue-100 bg-blue-50/70"
                    : "border-slate-100 bg-white"
            }`}
        >
            {/* Header info */}
            <div className="flex items-start gap-3">
                <div
                    style={{ 
                        backgroundColor: active ? courseColors.solidBg : courseColors.softBg,
                        color: active ? '#ffffff' : courseColors.solidBg
                    }}
                    className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg`}
                >
                    {isFromAPI ? <CheckCircle2 size={16} /> : <BookOpen size={16} />}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 
                        style={{ color: courseColors.softText }}
                        className="text-sm font-black leading-snug break-words"
                    >
                        {course.dkmh_tu_dien_hoc_phan_ten_vn}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span 
                            style={{
                                color: courseColors.softText,
                                backgroundColor: courseColors.softBg,
                                borderColor: courseColors.softBorder,
                            }}
                            className="rounded border px-2 py-0.5 text-[10px] font-black shadow-sm"
                        >
                            {course.dkmh_tu_dien_hoc_phan_ma}
                        </span>
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-tight text-[#3f6ad8]">
                            {course.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                        </span>
                    </div>
                </div>
            </div>

            {/* Separator line */}
            <hr className="my-3 border-dashed border-slate-200" />

            {/* Group/Schedule Details */}
            <div className="space-y-2">
                {active ? (
                    <>
                        <div className="flex items-start gap-2 text-[11px] font-bold leading-relaxed text-slate-600">
                            <Clock size={13} className="mt-0.5 shrink-0 text-[#3f6ad8]" />
                            <span>
                                {formatTkb(
                                    registration?.group.dkmh_tu_dien_lop_hoc_phan_tkb ||
                                        course.dkmh_tu_dien_lop_hoc_phan_tkb,
                                )}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                            <span className="rounded bg-white px-2 py-1 text-[#3f6ad8] shadow-sm ring-1 ring-blue-100">
                                {displayGroup}
                            </span>
                            <span className="rounded bg-white px-2 py-1 text-[#3f6ad8] shadow-sm ring-1 ring-blue-100">
                                Phòng: {getClassroomName(course, registration)}
                            </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                            <span className="rounded bg-slate-100 px-2 py-1 text-slate-500">
                                {getTeacherName(course, registration)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="inline-flex items-center gap-2 rounded bg-slate-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Search size={12} /> Chưa chọn nhóm
                    </div>
                )}

                {/* Sĩ Số indicator */}
                {active && (group ? (
                    <div className="mt-2 pt-1">
                        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <Users size={12} />
                            Sĩ số
                        </div>
                        <SiSoDisplay
                            current={currentSiso}
                            total={totalSiso}
                            key={`${group.key}-${currentSiso}`}
                        />
                    </div>
                ) : (
                    <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Không có nhóm khả dụng
                    </div>
                ))}
            </div>

            {/* Actions row */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                {active && (
                    <button
                        onClick={() => {
                            setSelectedCourseForModal(course);
                        }}
                        className="flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#3f6ad8]"
                        title="Xem các nhóm khác / Đổi nhóm"
                    >
                        <Info size={16} />
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider">Xem/Đổi nhóm</span>
                    </button>
                )}
                {registration && (
                    <button
                        onClick={() => {
                            const removed = plannedCourses.find(
                                (r) => r.course.dkmh_tu_dien_hoc_phan_ma === course.dkmh_tu_dien_hoc_phan_ma,
                            );
                            setPlannedCourses(
                                plannedCourses.filter(
                                    (r) => r.course.dkmh_tu_dien_hoc_phan_ma !== course.dkmh_tu_dien_hoc_phan_ma,
                                ),
                            );
                            addLog(`Đã gỡ: ${removed?.course.dkmh_tu_dien_hoc_phan_ten_vn}`, "warning");
                        }}
                        className="flex items-center justify-center rounded-lg border border-red-100 bg-red-50 p-2.5 text-red-500 transition-colors hover:bg-red-100"
                        title="Bỏ chọn học phần này"
                    >
                        <X size={16} />
                        <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider">Bỏ chọn</span>
                    </button>
                )}
                {!registration && !isFromAPI && (
                    <button
                        onClick={() => {
                            if (
                                plannedCourses.some(
                                    (r) =>
                                        r.course.dkmh_tu_dien_hoc_phan_ma ===
                                        course.dkmh_tu_dien_hoc_phan_ma,
                                )
                            ) {
                                notify("Bạn đã đăng ký học phần này rồi!", "warning");
                                return;
                            }
                            setSelectedCourseForModal(course);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#3f6ad8] py-2.5 px-4 text-xs font-black uppercase tracking-widest text-white shadow-sm shadow-blue-100 transition-all hover:bg-[#3458b6] active:scale-95"
                    >
                        <Search size={14} />
                        Chọn nhóm
                    </button>
                )}
                {isFromAPI && (
                    <span className="rounded bg-emerald-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-200">
                        Đã đăng ký
                    </span>
                )}
            </div>
        </div>
    );
}

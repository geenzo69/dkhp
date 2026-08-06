"use client";

import { useApp } from "@/providers/AppContext";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import { formatTkb, getCourseColor } from "@/util/format";
import { ArrowDown, ArrowUp, BookOpen, CheckCircle2, Clock, Info, Search, Users, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

export function SiSoDisplay({ current, total }: { current: number; total: number }) {
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
                    className={`h-full transition-all duration-1000 ${percent >= 90 ? "bg-red-500" : "bg-emerald-500"
                        }`}
                    style={{ width: `${percent}%` }}
                ></div>
            </div>
            <div className="relative flex items-center gap-1">
                <span
                    className={`text-[10px] font-bold transition-colors duration-300 ${effect === "up"
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

export function getTeacherName(
    course: Course,
    registration: { group: LopHocPhan } | undefined
) {
    const groupData =
        registration?.group ||
        course.data_nhom_hp.find(
            (group) =>
                group.dkmh_nhom_hoc_phan_ma ===
                course.dkmh_nhom_hoc_phan_ma,
        );

    return (
        groupData?.data?.[0]?.gv?.[0]?.dkmh_tu_dien_giang_vien_ten_vn ||
        course.dkmh_tu_dien_giang_vien_ten_vn ||
        "Đang cập nhật"
    );
}

export function getClassroomName(
    course: Course,
    registration: { group: LopHocPhan } | undefined
) {
    const groupData =
        registration?.group ||
        course.data_nhom_hp.find(
            (group) =>
                group.dkmh_nhom_hoc_phan_ma ===
                course.dkmh_nhom_hoc_phan_ma,
        );

    if (!groupData?.data) return "Đang cập nhật";
    const rooms = Array.from(
        new Set(
            groupData.data
                .map((d) => d.dkmh_tu_dien_phong_hoc_ten?.trim())
                .filter(Boolean)
        )
    );
    return rooms.length > 0 ? rooms.join(", ") : "Đang cập nhật";
}

export default function CourseItem({
    course,
    setSelectedCourseForModal
}: {
    course: Course,
    setSelectedCourseForModal: Dispatch<SetStateAction<Course | null>>;
}) {
    const { notify, addLog, setPlannedCourses, plannedCourses } = useApp();

    const registration = plannedCourses.find(
        (r) =>
            r.course.dkmh_tu_dien_hoc_phan_ma ===
            course.dkmh_tu_dien_hoc_phan_ma,
    );
    const isFromAPI =
        course.trang_thai_dang_ky === 1;
    const active = !!registration || isFromAPI;

    let displayGroup = "";
    if (registration) {
        displayGroup = `Nhóm ${registration.group.dkmh_nhom_hoc_phan_ma}`;
    } else if (isFromAPI) {
        displayGroup = `Nhóm ${course.dkmh_nhom_hoc_phan_ma || "?"}`;
    }

    const courseColors = getCourseColor(course.dkmh_tu_dien_hoc_phan_ma);

    return (
        <tr className="group">
            <td 
                className={`rounded-l-lg border-y border-l px-5 py-5 shadow-sm transition-all group-hover:shadow-md ${
                    active
                        ? "border-blue-100 bg-blue-50/70"
                        : "border-slate-100 bg-white"
                }`}
            >
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
                    <div className="min-w-0">
                        <div 
                            style={{ color: courseColors.softText }}
                            className="mb-1 text-sm font-black leading-snug"
                        >
                            {course.dkmh_tu_dien_hoc_phan_ten_vn}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span 
                                style={{
                                    color: courseColors.softText,
                                    backgroundColor: courseColors.softBg,
                                    borderColor: courseColors.softBorder,
                                }}
                                className="rounded border px-2 py-1 text-[10px] font-black shadow-sm"
                            >
                                {course.dkmh_tu_dien_hoc_phan_ma}
                            </span>
                            <span className="rounded bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-tight text-[#3f6ad8]">
                                {course.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                            </span>
                        </div>
                    </div>
                </div>
            </td>
            <td 
                className={`border-y px-5 py-5 shadow-sm transition-all group-hover:shadow-md ${
                    active
                        ? "border-blue-100 bg-blue-50/70"
                        : "border-slate-100 bg-white"
                }`}
            >
                {active ? (
                    <>
                        <div className="flex items-start gap-2 text-[11px] font-bold leading-relaxed text-slate-600">
                            <Clock size={13} className="mt-0.5 shrink-0 text-[#3f6ad8]" />
                            <span>{formatTkb(registration?.group.dkmh_tu_dien_lop_hoc_phan_tkb || course.dkmh_tu_dien_lop_hoc_phan_tkb)}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                            <span className="rounded bg-white px-2 py-1 text-[#3f6ad8] shadow-sm ring-1 ring-blue-100">
                                {displayGroup}
                            </span>
                            <span className="rounded bg-white px-2 py-1 text-[#3f6ad8] shadow-sm ring-1 ring-blue-100">
                                Phòng: {getClassroomName(course, registration)}
                            </span>
                            <span className="rounded bg-slate-100 px-2 py-1 text-slate-500">
                                {getTeacherName(course, registration)}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="inline-flex items-center gap-2 rounded bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <Search size={12} /> Chưa chọn nhóm
                    </div>
                )}
            </td>
            <td 
                className={`border-y px-5 py-5 shadow-sm transition-all group-hover:shadow-md ${
                    active
                        ? "border-blue-100 bg-blue-50/70"
                        : "border-slate-100 bg-white"
                }`}
            >
                <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Users size={12} />
                    Sĩ số
                </div>
                {active ? (() => {
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
                })() : (
                    <span className="text-[10px] text-slate-400 font-bold">—</span>
                )}
            </td>
            <td 
                className={`rounded-r-lg border-y border-r px-5 py-5 shadow-sm transition-all group-hover:shadow-md ${
                    active
                        ? "border-blue-100 bg-blue-50/70"
                        : "border-slate-100 bg-white"
                }`}
            >
                <div className="flex items-center justify-end gap-2">
                    {active && (
                        <button
                            onClick={() => {
                                setSelectedCourseForModal(course);
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white hover:text-[#3f6ad8]"
                            title="Xem các nhóm khác / Đổi nhóm"
                        >
                            <Info size={16} />
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
                                addLog(
                                    `Đã gỡ: ${removed?.course.dkmh_tu_dien_hoc_phan_ten_vn}`,
                                    "warning",
                                );
                            }}
                            className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100"
                            title="Bỏ chọn học phần này"
                        >
                            <X size={16} />
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
                            className="rounded-lg bg-[#3f6ad8] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-blue-100 transition-all hover:bg-[#3458b6] active:scale-95"
                        >
                            Chọn nhóm
                        </button>
                    )}
                    {isFromAPI && (
                        <span className="rounded bg-emerald-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-200">
                            Đã đăng ký
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}

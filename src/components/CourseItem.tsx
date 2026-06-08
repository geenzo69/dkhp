"use client";

import { useApp } from "@/providers/AppContext";
import Course from "@/types/Course";
import { formatTkb } from "@/util/format";
import { ArrowDown, ArrowUp, Clock, Info, Search, X } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

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

    return (
        <tr
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
                                    course.dkmh_tu_dien_giang_vien_ten_vn ||
                                    "Đang cập nhật"
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
                            onClick={() => (course: Course) => {
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
                            className="text-[10px] font-black uppercase text-slate-400 hover:text-[#3f6ad8] transition-colors p-2 rounded-lg hover:bg-slate-100"
                            title="Xem các nhóm khác của học phần này"
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
                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
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
}
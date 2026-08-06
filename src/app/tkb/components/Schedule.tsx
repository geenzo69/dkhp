"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calendar, Clock, Info, Sparkles } from "lucide-react";
import { useApp } from "@/providers/AppContext";
import { getCourseColor } from "@/util/format";
import ScheduleGeneratorModal from "@/components/ScheduleGeneratorModal";

const DAYS = [
    { label: "Thứ 2", value: 2 },
    { label: "Thứ 3", value: 3 },
    { label: "Thứ 4", value: 4 },
    { label: "Thứ 5", value: 5 },
    { label: "Thứ 6", value: 6 },
    { label: "Thứ 7", value: 7 },
    { label: "Chủ Nhật", value: 8 },
];

const PERIODS = Array.from({ length: 13 }, (_, index) => index + 1);

interface ParsedSlot {
    id: string;
    day: number;
    startPeriod: number;
    endPeriod: number;
    courseName: string;
    groupCode: string | null;
    weeks: string;
    color: string;
    isRegistered: boolean;
    courseCode: string;
}

function parseBlocks(
    tkb: string | null | undefined,
): { day: number; start: number; end: number; weeks: string }[] {
    if (!tkb || !tkb.includes("_")) return [];

    const blocks: { day: number; start: number; end: number; weeks: string }[] =
        [];

    tkb.split(" ").forEach((segment) => {
        const [weeks, idxStr] = segment.split("_");
        if (!weeks || !idxStr) return;

        const daily: Record<number, number[]> = {};
        idxStr
            .split(";")
            .map((n) => parseInt(n))
            .filter((n) => !Number.isNaN(n))
            .sort((a, b) => a - b)
            .forEach((n) => {
                const day = Math.floor((n - 1) / 13) + 2;
                const period = ((n - 1) % 13) + 1;
                daily[day] = [...(daily[day] || []), period];
            });

        Object.entries(daily).forEach(([dayStr, periods]) => {
            const day = parseInt(dayStr);
            const sorted = periods.sort((a, b) => a - b);
            let start = sorted[0];

            for (let i = 0; i < sorted.length; i++) {
                if (
                    i === sorted.length - 1 ||
                    sorted[i + 1] !== sorted[i] + 1
                ) {
                    blocks.push({ day, start, end: sorted[i], weeks });
                    if (i < sorted.length - 1) start = sorted[i + 1];
                }
            }
        });
    });

    return blocks;
}

function ScheduleSkeleton() {
    return (
        <div
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300"
            aria-busy="true"
        >
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#3f6ad8]" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        Thời khóa biểu tổng hợp
                    </h3>
                </div>
                <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed min-w-250">
                    <thead>
                        <tr>
                            <th className="w-16 py-3 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase text-slate-400">
                                Tiết
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day.value}
                                    className="py-3 bg-slate-100 border border-slate-200 text-[11px] font-black uppercase text-slate-600"
                                >
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {PERIODS.map((period) => (
                            <tr key={period} className="h-14">
                                <td className="bg-slate-50 border border-slate-100 text-center text-[10px] font-bold text-slate-400">
                                    {period}
                                </td>
                                {DAYS.map((day) => {
                                    const showBlock =
                                        (day.value + period) % 5 === 0 ||
                                        (day.value === 4 && period % 4 === 0);

                                    return (
                                        <td
                                            key={`${day.value}-${period}`}
                                            className="border border-slate-100 p-2"
                                        >
                                            {showBlock && (
                                                <div className="h-8 rounded bg-slate-200/80 animate-pulse" />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-6 items-center">
                <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                <div className="ml-auto h-3 w-56 rounded bg-slate-200 animate-pulse" />
            </div>
        </div>
    );
}

export default function Schedule() {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const { plannedCourses, courses, isLoadingCourses } = useApp();

    const allBlocks = useMemo(() => {
        const list: ParsedSlot[] = [];
        const colors = [
            "bg-blue-600",
            "bg-emerald-600",
            "bg-amber-600",
            "bg-purple-600",
            "bg-pink-600",
            "bg-indigo-600",
            "bg-rose-600",
            "bg-cyan-600",
        ];
        let colorIdx = 0;

        const plannedCourseIds = new Set(plannedCourses.map((p) => p.course.dkmh_tu_dien_hoc_phan_ma));

        courses
            ?.filter((course) => course.trang_thai_dang_ky === 1 && !plannedCourseIds.has(course.dkmh_tu_dien_hoc_phan_ma))
            .forEach((course) => {
                parseBlocks(course.dkmh_tu_dien_lop_hoc_phan_tkb).forEach(
                    (block, index) => {
                        list.push({
                            id: `reg-${course.dkmh_tu_dien_hoc_phan_ma}-${index}`,
                            day: block.day,
                            startPeriod: block.start,
                            endPeriod: block.end,
                            courseName: course.dkmh_tu_dien_hoc_phan_ten_vn,
                            groupCode: course.dkmh_nhom_hoc_phan_ma,
                            weeks: block.weeks,
                            color: "bg-slate-600",
                            isRegistered: true,
                            courseCode: course.dkmh_tu_dien_hoc_phan_ma,
                        });
                    },
                );
            });

        plannedCourses.forEach(({ course, group }) => {
            const color = colors[colorIdx % colors.length];
            colorIdx++;

            parseBlocks(group.dkmh_tu_dien_lop_hoc_phan_tkb).forEach(
                (block, index) => {
                    list.push({
                        id: `chosen-${course.dkmh_tu_dien_hoc_phan_ma}-${index}`,
                        day: block.day,
                        startPeriod: block.start,
                        endPeriod: block.end,
                        courseName: course.dkmh_tu_dien_hoc_phan_ten_vn,
                        groupCode: group.dkmh_nhom_hoc_phan_ma,
                        weeks: block.weeks,
                        color,
                        isRegistered: false,
                        courseCode: course.dkmh_tu_dien_hoc_phan_ma,
                    });
                },
            );
        });

        return list;
    }, [plannedCourses, courses]);

    const getOccupyingBlock = (day: number, period: number) =>
        allBlocks.find(
            (block) =>
                block.day === day &&
                period > block.startPeriod &&
                period <= block.endPeriod,
        );

    const getStarters = (day: number, period: number) =>
        allBlocks.filter(
            (block) => block.day === day && block.startPeriod === period,
        );

    if (isLoadingCourses) {
        return <ScheduleSkeleton />;
    }

    if (allBlocks.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center animate-in fade-in duration-500">
                <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Thời khóa biểu trống
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#3f6ad8]" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        Thời khóa biểu tổng hợp
                    </h3>
                </div>
                <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="flex items-center gap-1.5 rounded-lg bg-[#3f6ad8] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-blue-100 hover:bg-[#3458b6] transition-all active:scale-95 cursor-pointer"
                >
                    <Sparkles size={12} />
                    Xếp lịch tự động
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed min-w-250">
                    <thead>
                        <tr>
                            <th className="w-16 py-3 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase text-slate-400">
                                Tiết
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day.value}
                                    className="py-3 bg-slate-100 border border-slate-200 text-[11px] font-black uppercase text-slate-600"
                                >
                                    {day.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="isolate">
                        {PERIODS.map((period) => (
                            <tr key={period} className="h-14">
                                <td className="bg-slate-50 border border-slate-100 text-center text-[10px] font-bold text-slate-400">
                                    {period}
                                </td>
                                {DAYS.map((day) => {
                                    if (getOccupyingBlock(day.value, period)) {
                                        return null;
                                    }

                                    const starters = getStarters(
                                        day.value,
                                        period,
                                    );

                                    if (starters.length === 0) {
                                        return (
                                            <td
                                                key={`${day.value}-${period}`}
                                                className="border border-slate-100"
                                            />
                                        );
                                    }

                                    const rowSpan = Math.max(
                                        ...starters.map(
                                            (block) =>
                                                block.endPeriod -
                                                block.startPeriod +
                                                1,
                                        ),
                                    );

                                    return (
                                        <td
                                            key={`${day.value}-${period}`}
                                            rowSpan={rowSpan}
                                            className="border border-slate-100 p-0 relative"
                                            style={{
                                                height: `${rowSpan * 3.5}rem`,
                                            }}
                                        >
                                            <div className="absolute inset-0 flex">
                                                {starters.map((block) => {
                                                     const courseColors = getCourseColor(block.courseCode);
                                                     return (
                                                         <div
                                                             key={block.id}
                                                             onMouseEnter={() =>
                                                                 setHoveredId(
                                                                     block.id,
                                                                 )
                                                             }
                                                             onMouseLeave={() =>
                                                                 setHoveredId(null)
                                                             }
                                                             style={{
                                                                 backgroundColor: courseColors.solidBg,
                                                                 borderColor: courseColors.solidBorder,
                                                                 color: courseColors.solidText,
                                                             }}
                                                             className={`flex-1 p-2.5 flex flex-col justify-start relative transition-all duration-200 cursor-pointer border-r border-white/5 last:border-r-0 ${
                                                                 hoveredId &&
                                                                 hoveredId !==
                                                                     block.id
                                                                     ? "opacity-30 scale-[0.98] blur-[1px]"
                                                                     : "opacity-100 scale-100 z-10 shadow-lg"
                                                             }`}
                                                         >
                                                             <div className="text-[10px] font-black leading-tight uppercase mb-auto">
                                                                 {block.courseName}
                                                             </div>
                                                             <div className="mt-2 space-y-1">
                                                                 {block.groupCode && (
                                                                     <div className="text-[8px] font-black bg-white/20 text-white w-fit px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                         Nhóm{" "}
                                                                         {
                                                                             block.groupCode
                                                                         }
                                                                     </div>
                                                                 )}
                                                                 <div className="flex items-center gap-1.5 text-[8px] font-black bg-black/10 w-fit px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                                     <Clock
                                                                         size={8}
                                                                     />
                                                                     {
                                                                         block.startPeriod
                                                                     }
                                                                     -
                                                                     {
                                                                         block.endPeriod
                                                                     }
                                                                 </div>
                                                                 <div className="flex items-center gap-1.5 text-[8px] font-black bg-black/10 w-fit px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                                     <Calendar
                                                                         size={8}
                                                                     />
                                                                     Tuần{" "}
                                                                     {block.weeks}
                                                                 </div>
                                                                 {block.isRegistered && (
                                                                     <div className="text-[7px] font-black bg-white/20 text-white w-fit px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                         Đã đăng ký
                                                                     </div>
                                                                 )}
                                                             </div>
                                                             {starters.length >
                                                                 1 && (
                                                                 <div className="absolute top-1 right-1 opacity-50">
                                                                     <AlertTriangle
                                                                         size={10}
                                                                     />
                                                                 </div>
                                                             )}
                                                         </div>
                                                     );
                                                 })}
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-slate-50 border-t flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#3f6ad8]" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                        Mỗi học phần có màu sắc nhận diện riêng
                    </span>
                </div>
                <div className="flex items-center gap-2 ml-auto text-slate-400">
                    <Info size={12} />
                    <span className="text-[9px] font-bold italic">
                        Rê chuột vào buổi học để làm nổi bật buổi đó.
                    </span>
                </div>
            </div>
        </div>

        {isGeneratorOpen && (
            <ScheduleGeneratorModal
                onClose={() => setIsGeneratorOpen(false)}
            />
        )}
        </>
    );
}

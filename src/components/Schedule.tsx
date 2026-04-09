"use client";

import { useMemo, useState } from "react";
import { HocPhan, LopHocPhan } from "@/util/course";
import { Calendar, Clock, MapPin, AlertTriangle, Info } from "lucide-react";

interface ScheduleProps {
    registeredHP: { course: HocPhan; group: LopHocPhan }[];
    apiRegisteredCourses: HocPhan[] | null;
}

const DAYS = [
    { label: "Thứ 2", value: 2 },
    { label: "Thứ 3", value: 3 },
    { label: "Thứ 4", value: 4 },
    { label: "Thứ 5", value: 5 },
    { label: "Thứ 6", value: 6 },
    { label: "Thứ 7", value: 7 },
    { label: "Chủ Nhật", value: 8 },
];

const PERIODS = Array.from({ length: 13 }, (_, i) => i + 1);

interface ParsedSlot {
    id: string;
    day: number;
    startPeriod: number;
    endPeriod: number;
    courseName: string;
    weeks: string;
    color: string;
    isRegistered: boolean;
}

function parseBlocks(
    tkb: string | null | undefined,
): { day: number; start: number; end: number; weeks: string }[] {
    if (!tkb || !tkb.includes("_")) return [];
    const blocks: { day: number; start: number; end: number; weeks: string }[] =
        [];
    const segments = tkb.split(" ");
    segments.forEach((seg) => {
        const [weeks, idxStr] = seg.split("_");
        if (!weeks || !idxStr) return;
        const indices = idxStr
            .split(";")
            .map((n) => parseInt(n))
            .filter((n) => !isNaN(n))
            .sort((a, b) => a - b);
        const daily: Record<number, number[]> = {};
        indices.forEach((n) => {
            const d = Math.floor((n - 1) / 13) + 2;
            const p = ((n - 1) % 13) + 1;
            if (!daily[d]) daily[d] = [];
            daily[d].push(p);
        });
        Object.entries(daily).forEach(([dStr, periods]) => {
            const d = parseInt(dStr);
            const sorted = periods.sort((a, b) => a - b);
            let start = sorted[0];
            for (let i = 0; i < sorted.length; i++) {
                if (
                    i === sorted.length - 1 ||
                    sorted[i + 1] !== sorted[i] + 1
                ) {
                    blocks.push({ day: d, start, end: sorted[i], weeks });
                    if (i < sorted.length - 1) start = sorted[i + 1];
                }
            }
        });
    });
    return blocks;
}

export default function Schedule({
    registeredHP,
    apiRegisteredCourses,
}: ScheduleProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

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

        apiRegisteredCourses
            ?.filter((c) => c.trang_thai_dang_ky === 1)
            .forEach((course) => {
                const blocks = parseBlocks(
                    course.dkmh_tu_dien_lop_hoc_phan_tkb,
                );
                blocks.forEach((b, i) => {
                    list.push({
                        id: `reg-${course.dkmh_tu_dien_hoc_phan_ma}-${i}`,
                        day: b.day,
                        startPeriod: b.start,
                        endPeriod: b.end,
                        courseName: course.dkmh_tu_dien_hoc_phan_ten_vn,
                        weeks: b.weeks,
                        color: "bg-slate-600",
                        isRegistered: true,
                    });
                });
            });

        registeredHP.forEach(({ course, group }) => {
            const blocks = parseBlocks(group.dkmh_tu_dien_lop_hoc_phan_tkb);
            const color = colors[colorIdx % colors.length];
            colorIdx++;
            blocks.forEach((b, i) => {
                list.push({
                    id: `chosen-${course.dkmh_tu_dien_hoc_phan_ma}-${i}`,
                    day: b.day,
                    startPeriod: b.start,
                    endPeriod: b.end,
                    courseName: course.dkmh_tu_dien_hoc_phan_ten_vn,
                    weeks: b.weeks,
                    color,
                    isRegistered: false,
                });
            });
        });

        return list;
    }, [registeredHP, apiRegisteredCourses]);

    const getOccupyingBlock = (day: number, period: number) => {
        return allBlocks.find(
            (b) =>
                b.day === day &&
                period > b.startPeriod &&
                period <= b.endPeriod,
        );
    };

    const getStarters = (day: number, period: number) => {
        return allBlocks.filter(
            (b) => b.day === day && b.startPeriod === period,
        );
    };

    if (allBlocks.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center mt-8 animate-in fade-in duration-500">
                <Calendar className="mx-auto text-slate-200 mb-2" size={32} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Thời khóa biểu trống
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-8 transition-all duration-300">
            <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#3f6ad8]" />
                    <h3 className="font-bold text-slate-700 uppercase tracking-tight text-sm">
                        Thời khóa biểu tổng hợp
                    </h3>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse table-fixed min-w-[1000px]">
                    <thead>
                        <tr>
                            <th className="w-16 py-3 bg-slate-100 border border-slate-200 text-[10px] font-black uppercase text-slate-400">
                                {" "}
                                Tiết{" "}
                            </th>
                            {DAYS.map((day) => (
                                <th
                                    key={day.value}
                                    className="py-3 bg-slate-100 border border-slate-200 text-[11px] font-black uppercase text-slate-600"
                                >
                                    {" "}
                                    {day.label}{" "}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="isolate">
                        {PERIODS.map((period) => (
                            <tr key={period} className="h-14">
                                <td className="bg-slate-50 border border-slate-100 text-center text-[10px] font-bold text-slate-400">
                                    {" "}
                                    {period}{" "}
                                </td>
                                {DAYS.map((day) => {
                                    if (getOccupyingBlock(day.value, period))
                                        return null;

                                    const starters = getStarters(
                                        day.value,
                                        period,
                                    );
                                    if (starters.length === 0)
                                        return (
                                            <td
                                                key={`${day.value}-${period}`}
                                                className="border border-slate-100"
                                            ></td>
                                        );

                                    const rowSpan = Math.max(
                                        ...starters.map(
                                            (b) =>
                                                b.endPeriod - b.startPeriod + 1,
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
                                                {starters.map((block) => (
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
                                                        className={`
                                                            flex-1 ${block.color} text-white p-2.5 flex flex-col justify-start relative transition-all duration-200 cursor-pointer border-r border-white/5 last:border-r-0
                                                            ${hoveredId && hoveredId !== block.id ? "opacity-30 scale-[0.98] blur-[1px]" : "opacity-100 scale-100 z-10 shadow-lg"}
                                                        `}
                                                    >
                                                        <div className="text-[10px] font-black leading-tight uppercase mb-auto">
                                                            {block.courseName}
                                                        </div>
                                                        <div className="mt-2 space-y-1">
                                                            <div className="flex items-center gap-1.5 text-[8px] font-black bg-black/10 w-fit px-1.5 py-0.5 rounded backdrop-blur-sm">
                                                                <Clock
                                                                    size={8}
                                                                />{" "}
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
                                                                />{" "}
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
                                                ))}
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
                    <div className="w-3 h-3 bg-slate-600 rounded"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                        Đã đăng ký (API)
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-600 rounded"></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">
                        Đang chọn (Dự kiến)
                    </span>
                </div>
                <div className="flex items-center gap-2 ml-auto text-slate-400">
                    <Info size={12} />
                    <span className="text-[9px] font-bold italic">
                        Rê chuột vào buổi học để làm nổi bật buổi đó và làm mờ
                        các buổi khác.
                    </span>
                </div>
            </div>
        </div>
    );
}

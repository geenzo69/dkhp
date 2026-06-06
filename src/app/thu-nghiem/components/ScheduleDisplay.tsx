"use client";

import { ChevronLeft, ChevronRight, Check, CalendarDays } from "lucide-react";

interface Slot {
    day: number;
    dayName: string;
    start: number;
    end: number;
}

interface GroupSchedule {
    id: string;
    slots: Slot[];
}

interface CourseData {
    maHocPhan: string;
    tenHocPhan: string;
    soTinChi: number;
    lichHoc: string[][];
}

interface ScheduleResult {
    course: CourseData;
    group: GroupSchedule;
}

const DAY_NAMES: Record<number, string> = {
    2: "T2",
    3: "T3",
    4: "T4",
    5: "T5",
    6: "T6",
    7: "T7",
    8: "CN",
};

interface ScheduleDisplayProps {
    generatedSchedules: ScheduleResult[][];
    currentScheduleIndex: number;
    onScheduleIndexChange: (index: number) => void;
}

export default function ScheduleDisplay({
    generatedSchedules,
    currentScheduleIndex,
    onScheduleIndexChange,
}: ScheduleDisplayProps) {
    return (
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
            <div className="flex items-center gap-2 w-full">
                <CalendarDays size={18} className="text-[#3f6ad8]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                    Thời khóa biểu khả thi
                </h2>
            </div>

            <div className="p-5 space-y-4 w-full">
                {generatedSchedules.length === 0 ? (
                    <div className="rounded border border-dashed border-slate-200 p-10 text-center">
                        <CalendarDays size={34} className="mx-auto mb-3 text-slate-200" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                            Nhấn tạo TKB để sinh phương án
                        </p>
                    </div>
                ) : (
                    <div>
                        {/* Navigation */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                            <button
                                onClick={() =>
                                    onScheduleIndexChange(Math.max(0, currentScheduleIndex - 1))
                                }
                                disabled={currentScheduleIndex === 0}
                                className="flex items-center justify-center rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-40 p-2 transition-all"
                            >
                                <ChevronLeft size={18} className="text-slate-700" />
                            </button>

                            <div className="flex-1 text-center">
                                <p className="text-sm font-black text-slate-700">
                                    Phương án {currentScheduleIndex + 1} / {generatedSchedules.length}
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    onScheduleIndexChange(
                                        Math.min(generatedSchedules.length - 1, currentScheduleIndex + 1)
                                    )
                                }
                                disabled={currentScheduleIndex === generatedSchedules.length - 1}
                                className="flex items-center justify-center rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-40 p-2 transition-all"
                            >
                                <ChevronRight size={18} className="text-slate-700" />
                            </button>
                        </div>

                        {/* Current Schedule */}
                        {generatedSchedules[currentScheduleIndex] && (() => {
                            const schedule = generatedSchedules[currentScheduleIndex];

                            // Tạo map để track các tiết liên tiếp của cùng 1 course-day
                            const courseRanges: Record<
                                string,
                                { item: ScheduleResult; start: number; end: number; colorIdx: number }[]
                            > = {};

                            const colors = [
                                "bg-blue-50 border-l-4 border-l-blue-400",
                                "bg-purple-50 border-l-4 border-l-purple-400",
                                "bg-pink-50 border-l-4 border-l-pink-400",
                                "bg-green-50 border-l-4 border-l-green-400",
                                "bg-yellow-50 border-l-4 border-l-yellow-400",
                                "bg-indigo-50 border-l-4 border-l-indigo-400",
                            ];

                            // Tạo mapping (day, period) -> (range, colorIdx) để tìm color nhanh
                            const periodColorMap: Record<
                                string,
                                { range: any; colorIdx: number } | null
                            > = {};

                            schedule.forEach((item, itemIdx) => {
                                item.group.slots.forEach((slot) => {
                                    const key = `${slot.day}`;
                                    if (!courseRanges[key]) {
                                        courseRanges[key] = [];
                                    }
                                    const colorIdx = itemIdx % colors.length;
                                    const range = {
                                        item,
                                        start: slot.start,
                                        end: slot.end,
                                        colorIdx,
                                    };
                                    courseRanges[key].push(range);

                                    // Map tất cả periods từ start -> end với color này
                                    for (let p = slot.start; p <= slot.end; p++) {
                                        const periodKey = `${slot.day}-${p}`;
                                        periodColorMap[periodKey] = { range, colorIdx };
                                    }
                                });
                            });

                            return (
                                <div className="rounded-lg border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-b">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                                                Thời khóa biểu
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lịch biểu */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr>
                                                    <th className="bg-slate-100 p-2 text-center text-[10px] font-black text-slate-600 border w-15">
                                                        Tiết
                                                    </th>
                                                    {[2, 3, 4, 5, 6, 7, 8].map((day) => (
                                                        <th
                                                            key={day}
                                                            className="bg-slate-100 p-2 text-center text-[10px] font-black text-slate-600 border"
                                                        >
                                                            {DAY_NAMES[day] || `D${day}`}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Array.from({ length: 13 }, (_, i) => i + 1).map((period) => (
                                                    <tr key={period}>
                                                        <td className="bg-slate-50 p-2 text-center text-[9px] font-bold text-slate-600 border">
                                                            {period}
                                                        </td>
                                                        {[2, 3, 4, 5, 6, 7, 8].map((day) => {
                                                            const periodKey = `${day}-${period}`;
                                                            const courseInfo = periodColorMap[periodKey];
                                                            const dayRanges = courseRanges[`${day}`] || [];
                                                            const startingItems = dayRanges.filter(
                                                                (r) => r.start === period
                                                            );

                                                            // Nếu có content ở tiết này (bắt đầu course)
                                                            if (startingItems.length > 0) {
                                                                return (
                                                                    <td
                                                                        key={`${day}-${period}`}
                                                                        className={`${colors[startingItems[0].colorIdx]} border p-1 text-[8px] align-top font-bold text-slate-700`}
                                                                        style={{ height: "48px" }}
                                                                    >
                                                                        {startingItems.map((range, idx) => (
                                                                            <div
                                                                                key={`${range.item.course.maHocPhan}-${range.item.group.id}`}
                                                                                title={`${range.item.course.maHocPhan} - ${range.item.course.tenHocPhan} (${range.item.group.id})\nTiết ${range.start}-${range.end}`}
                                                                            >
                                                                                <div className="font-bold text-center">
                                                                                    {range.item.course.maHocPhan}
                                                                                </div>
                                                                                <div className="text-[7px] text-slate-600 text-center">
                                                                                    Tiết {range.start}-{range.end}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </td>
                                                                );
                                                            }

                                                            // Nếu nằm giữa range, render trống nhưng cùng màu
                                                            if (courseInfo) {
                                                                return (
                                                                    <td
                                                                        key={`${day}-${period}`}
                                                                        className={`${colors[courseInfo.colorIdx]} border`}
                                                                        style={{ height: "48px" }}
                                                                    />
                                                                );
                                                            }

                                                            // Nếu không có course, render ô trống
                                                            return (
                                                                <td
                                                                    key={`${day}-${period}`}
                                                                    className="border bg-white"
                                                                    style={{ height: "48px" }}
                                                                />
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Danh sách chi tiết */}
                                    <div className="border-t bg-slate-50 p-3">
                                        <p className="text-xs font-bold text-slate-600 mb-2">Chi tiết:</p>
                                        <div className="space-y-1">
                                            {schedule.map(({ course, group }: ScheduleResult, idx) => (
                                                <div
                                                    key={`${course.maHocPhan}-${group.id}`}
                                                    className="text-[9px] text-slate-700"
                                                >
                                                    <span
                                                        className={`inline-block w-2 h-2 rounded mr-2 ${colors[idx % colors.length].split(" ")[0]}`}
                                                    ></span>
                                                    <span className="font-bold">{course.maHocPhan}</span>
                                                    <span className="text-slate-500">
                                                        {" "}-{" "}
                                                        {group.slots
                                                            .map((s) => `${s.dayName} (${s.start}-${s.end})`)
                                                            .join(", ")}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}

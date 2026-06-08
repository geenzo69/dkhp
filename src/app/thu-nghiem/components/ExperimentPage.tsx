"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import User from "@/types/User";
import {
    CalendarDays,
    Check,
    FlaskConical,
    Loader2,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import getCourse from "../actions/getCourse";
import { useApp } from "@/providers/AppContext";
import ScheduleDisplay from "./ScheduleDisplay";

interface ExperimentPageProps {
    initialUser: User | null;
}

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

/**
 * Parse lichHoc format vào GroupSchedule[]
 * lichHoc là mảng 2D: mỗi phần tử là 1 nhóm, chứa mảng các ngày
 * Mỗi string ngày có format: "2/12-------" 
 *   - Ký tự đầu = thứ (2=T2, 3=T3, ..., 8=CN)
 *   - Dấu "/" phân tách
 *   - 13 ký tự tiếp theo = các tiết (1-13), "-" = trống
 */
function parseLichHoc(lichHoc: string[][]): GroupSchedule[] {
    return lichHoc.map((groupDays, groupIndex) => {
        const slots: Slot[] = [];

        groupDays.forEach((dayStr) => {
            if (!dayStr || !dayStr.includes("/")) return;

            const [dayPart, periodPart] = dayStr.split("/");
            const day = parseInt(dayPart);

            if (isNaN(day) || day < 2 || day > 8) return;

            const dayName = DAY_NAMES[day] || `D${day}`;
            const periods: number[] = [];

            // Duyệt qua 13 tiết
            for (let i = 0; i < Math.min(periodPart.length, 13); i++) {
                if (periodPart[i] !== "-") {
                    periods.push(i + 1); // tiết 1-13
                }
            }

            if (periods.length > 0) {
                const start = Math.min(...periods);
                const end = Math.max(...periods);
                slots.push({ day, dayName, start, end });
            }
        });

        return {
            id: `G${groupIndex}`,
            slots,
        };
    });
}

/**
 * Kiểm tra xung đột giữa hai tập slots
 */
function hasSlotConflict(slotsA: Slot[], slotsB: Slot[]): boolean {
    return slotsA.some(
        (slotA) =>
            slotsB.some(
                (slotB) =>
                    slotA.day === slotB.day &&
                    slotA.start <= slotB.end &&
                    slotB.start <= slotA.end,
            ),
    );
}

/**
 * Sinh tất cả phương án thời khóa biểu không trùng lịch
 * Sử dụng backtracking để duyệt tất cả các tổ hợp nhóm
 */
function generateSchedules(courses: CourseData[]): ScheduleResult[][] {
    const coursesWithGroups = courses.map((course) => ({
        ...course,
        groups: parseLichHoc(course.lichHoc),
    }));

    const results: ScheduleResult[][] = [];

    const backtrack = (courseIndex: number, current: ScheduleResult[]) => {
        if (courseIndex === coursesWithGroups.length) {
            results.push([...current]);
            return;
        }

        const course = coursesWithGroups[courseIndex];
        for (const group of course.groups) {
            const hasConflict = current.some((item) =>
                hasSlotConflict(item.group.slots, group.slots),
            );

            if (!hasConflict) {
                current.push({ course, group });
                backtrack(courseIndex + 1, current);
                current.pop();
            }
        }
    };

    backtrack(0, []);
    return results;
}

export default function ExperimentPage({ initialUser }: ExperimentPageProps) {
    const { notify } = useApp();
    
    const [keyword, setKeyword] = useState("");
    const [selectedCourses, setSelectedCourses] = useState<{
        maHocPhan: string,
        tenHocPhan: string,
        soTinChi: number,
        lichHoc: string[][]
    }[]>([]);
    const [generatedSchedules, setGeneratedSchedules] = useState<ScheduleResult[][]>([]);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(0);

    const { execute, isExecuting } = useAction(getCourse, {
        onError: ({ error }) => {
            if (error.serverError) {
                notify(error.serverError, "error");
            } else if (error.validationErrors) {
                const messages = Object.values(error.validationErrors)
                    .flatMap((err: any) =>
                        Array.isArray(err) ? err : err?._errors ?? []
                    )
                    .join(", ");
                notify(messages || "Validation error!", "error");
            } else {
                notify("Đã có lỗi xảy ra", "error");
            }
        },
        onSuccess: ({ data }) => {
            if (!data) {
                return;
            }

            setSelectedCourses([
                ...selectedCourses || [],
                data
            ]);
        }
    });

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={initialUser || undefined}
            />

            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Thử nghiệm
                    </h1>
                    <p className="text-sm text-slate-500">
                        Nhập mã học phần, thêm vào danh sách và sinh các thời
                        khóa biểu khả thi.
                    </p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <section className="xl:col-span-5 space-y-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Search size={18} className="text-[#3f6ad8]" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                                    Học phần
                                </h2>
                            </div>

                            <div className="flex gap-3">
                                <input
                                    value={keyword}
                                    onChange={(event) =>
                                        setKeyword(event.target.value)
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") execute({ id: keyword });
                                    }}
                                    className="min-w-0 flex-1 rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#3f6ad8]"
                                    placeholder="VD: CT112, CT176, TN010..."
                                />
                                <button
                                    onClick={() => execute({ id: keyword })}
                                    disabled={!keyword.trim() || isExecuting}
                                    className="flex items-center justify-center rounded bg-[#3f6ad8] px-4 text-white transition-all hover:bg-[#3458b6] disabled:opacity-50"
                                >
                                    {isExecuting ? (
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />
                                    ) : (
                                        <Search size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                                    Danh sách chọn
                                </h2>
                                <button
                                    onClick={() => {
                                        const schedules = generateSchedules(selectedCourses);
                                        setGeneratedSchedules(schedules);
                                        setCurrentScheduleIndex(0);
                                        setHasGenerated(true);
                                    }}
                                    disabled={selectedCourses.length === 0}
                                    className="rounded bg-emerald-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-400 disabled:opacity-40"
                                >
                                    Tạo TKB
                                </button>
                            </div>

                            <div className="space-y-3">
                                {selectedCourses.map((course) => (
                                    <div
                                        key={course.maHocPhan}
                                        className="flex items-center justify-between gap-3 rounded bg-slate-50 border border-slate-100 p-3"
                                    >
                                        <div>
                                            <p className="text-xs font-black text-slate-800">
                                                {course.maHocPhan} - {course.tenHocPhan}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setSelectedCourses(
                                                    selectedCourses.filter(
                                                        (item) =>
                                                            item.maHocPhan !==
                                                            course.maHocPhan,
                                                    ),
                                                );
                                                setHasGenerated(false);
                                                setCurrentScheduleIndex(0);
                                            }}
                                            className="text-slate-300 transition-colors hover:text-red-500"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                {selectedCourses.length === 0 && (
                                    <div className="rounded border border-dashed border-slate-200 p-8 text-center">
                                        <FlaskConical
                                            size={28}
                                            className="mx-auto mb-2 text-slate-200"
                                        />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                                            Chưa có học phần
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="xl:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {!hasGenerated ? (
                            <ScheduleDisplay
                                generatedSchedules={[]}
                                currentScheduleIndex={0}
                                onScheduleIndexChange={() => {}}
                            />
                        ) : generatedSchedules.length === 0 ? (
                            <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
                                <div className="flex items-center gap-2 w-full">
                                    <CalendarDays size={18} className="text-[#3f6ad8]" />
                                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                                        Thời khóa biểu khả thi
                                    </h2>
                                </div>
                                <div className="rounded bg-red-50 p-5 text-sm font-bold text-red-600 w-full">
                                    Không có phương án nào khả thi cho các học phần này.
                                </div>
                            </div>
                        ) : (
                            <ScheduleDisplay
                                generatedSchedules={generatedSchedules}
                                currentScheduleIndex={currentScheduleIndex}
                                onScheduleIndexChange={setCurrentScheduleIndex}
                            />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}

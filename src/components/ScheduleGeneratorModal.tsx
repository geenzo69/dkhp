"use client";

import { useApp } from "@/providers/AppContext";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import { checkTkbConflict, getCourseColor } from "@/util/format";
import {
    AlertTriangle,
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Sparkles,
    X,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";

interface ScheduleGeneratorModalProps {
    onClose: () => void;
}

const DAYS = [
    { label: "T2", value: 2 },
    { label: "T3", value: 3 },
    { label: "T4", value: 4 },
    { label: "T5", value: 5 },
    { label: "T6", value: 6 },
    { label: "T7", value: 7 },
    { label: "CN", value: 8 },
];

const PERIODS = Array.from({ length: 13 }, (_, idx) => idx + 1);

function parseTkbBlocks(
    tkb: string | null | undefined,
): { day: number; start: number; end: number }[] {
    if (!tkb || !tkb.includes("_")) return [];

    const blocks: { day: number; start: number; end: number }[] = [];

    tkb.split(" ").forEach((segment) => {
        const [_, idxStr] = segment.split("_");
        if (!idxStr) return;

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
                    blocks.push({ day, start, end: sorted[i] });
                    if (i < sorted.length - 1) start = sorted[i + 1];
                }
            }
        });
    });

    return blocks;
}

export default function ScheduleGeneratorModal({
    onClose,
}: ScheduleGeneratorModalProps) {
    const { notify, addLog, setPlannedCourses, courses } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    
    // Selector modal overlay states
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [courseSearchTerm, setCourseSearchTerm] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 10);
        return () => clearTimeout(timer);
    }, []);

    // List of courses in system
    const listCourses = useMemo(() => courses || [], [courses]);

    // Track which courses are added (only registered courses selected by default)
    const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        listCourses.forEach((c) => {
            initial[c.dkmh_tu_dien_hoc_phan_ma] = c.trang_thai_dang_ky === 1;
        });
        return initial;
    });

    // Track group preference: courseCode -> "auto" or specific group key
    const [groupPreferences, setGroupPreferences] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        listCourses.forEach((c) => {
            if (c.trang_thai_dang_ky === 1) {
                // Locked to database group
                const regGroup = c.data_nhom_hp.find(
                    (g) => g.dkmh_nhom_hoc_phan_ma === c.dkmh_nhom_hoc_phan_ma
                );
                initial[c.dkmh_tu_dien_hoc_phan_ma] = regGroup ? regGroup.key : "auto";
            } else {
                initial[c.dkmh_tu_dien_hoc_phan_ma] = "auto";
            }
        });
        return initial;
    });

    // Temporary editor states for the selector modal overlay (so changes can be discarded on cancel)
    const [tempSelectedCourses, setTempSelectedCourses] = useState<Record<string, boolean>>({});
    const [tempGroupPreferences, setTempGroupPreferences] = useState<Record<string, string>>({});

    const [activeScheduleIndex, setActiveScheduleIndex] = useState(0);

    // List of active courses in the main view
    const selectedCoursesList = useMemo(() => {
        return listCourses.filter((c) => selectedCourses[c.dkmh_tu_dien_hoc_phan_ma]);
    }, [listCourses, selectedCourses]);

    // Combinations solver using group preferences
    const validSchedules = useMemo(() => {
        const activeCourses = selectedCoursesList;
        if (activeCourses.length === 0) return [];

        const results: { course: Course; group: LopHocPhan }[][] = [];

        function helper(courseIndex: number, currentCombination: { course: Course; group: LopHocPhan }[]) {
            if (courseIndex === activeCourses.length) {
                results.push([...currentCombination]);
                return;
            }

            const course = activeCourses[courseIndex];
            const courseCode = course.dkmh_tu_dien_hoc_phan_ma;
            const pref = groupPreferences[courseCode] || "auto";

            // If "auto", evaluate all groups. If specific key, evaluate only that group.
            const groupsToTry = pref === "auto"
                ? course.data_nhom_hp
                : course.data_nhom_hp.filter((g) => g.key === pref);

            for (const group of groupsToTry) {
                // Check conflicts with current combination
                const hasConflict = currentCombination.some(({ group: selectedGroup }) =>
                    checkTkbConflict(
                        selectedGroup.dkmh_tu_dien_lop_hoc_phan_tkb,
                        group.dkmh_tu_dien_lop_hoc_phan_tkb
                    )
                );

                if (!hasConflict) {
                    currentCombination.push({ course, group });
                    helper(courseIndex + 1, currentCombination);
                    currentCombination.pop();
                }
            }
        }

        helper(0, []);
        return results;
    }, [selectedCoursesList, groupPreferences]);

    // Reset pagination when combos change
    useEffect(() => {
        setActiveScheduleIndex(0);
    }, [validSchedules.length]);

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 200);
    };

    const handleApplySchedule = () => {
        const schedule = validSchedules[activeScheduleIndex];
        if (!schedule) return;

        const newPlanned = schedule
            .filter((item) => item.course.trang_thai_dang_ky !== 1)
            .map((item) => ({
                course: item.course,
                group: item.group,
            }));

        setIsOpen(false);
        setTimeout(() => {
            setPlannedCourses(newPlanned);
            addLog(`Đã xếp lịch tự động thành công với ${newPlanned.length} môn học mới.`, "success");
            notify("Đã áp dụng thời khóa biểu được chọn!", "success");
            onClose();
        }, 200);
    };

    // Open selector modal and initialize temporary states
    const handleOpenSelector = () => {
        setTempSelectedCourses({ ...selectedCourses });
        setTempGroupPreferences({ ...groupPreferences });
        setCourseSearchTerm("");
        setShowSelectorModal(true);
    };

    // Save selector changes
    const handleConfirmSelector = () => {
        setSelectedCourses(tempSelectedCourses);
        setGroupPreferences(tempGroupPreferences);
        setShowSelectorModal(false);
    };

    // Filter available courses list by search term (no gating, if empty, lists all)
    const filteredCoursesList = useMemo(() => {
        if (!courseSearchTerm) return listCourses;
        return listCourses.filter(
            (c) =>
                c.dkmh_tu_dien_hoc_phan_ten_vn.toLowerCase().includes(courseSearchTerm.toLowerCase()) ||
                c.dkmh_tu_dien_hoc_phan_ma.toLowerCase().includes(courseSearchTerm.toLowerCase())
        );
    }, [listCourses, courseSearchTerm]);

    const toggleTempCourseSelection = (courseCode: string) => {
        setTempSelectedCourses((prev) => {
            const current = !!prev[courseCode];
            const next = !current;
            return {
                ...prev,
                [courseCode]: next,
            };
        });
        
        // Initialize default choice to "auto" if added
        setTempGroupPreferences((prev) => {
            if (!prev[courseCode]) {
                return { ...prev, [courseCode]: "auto" };
            }
            return prev;
        });
    };

    const setTempPreference = (courseCode: string, preference: string) => {
        setTempGroupPreferences((prev) => ({
            ...prev,
            [courseCode]: preference,
        }));
    };

    // Calculate timetable preview slots for selected schedule index
    const previewSlots = useMemo(() => {
        const currentSchedule = validSchedules[activeScheduleIndex] || [];
        const slots: { day: number; start: number; end: number; label: string; bg: string; text: string }[] = [];

        currentSchedule.forEach(({ course, group }) => {
            const colors = getCourseColor(course.dkmh_tu_dien_hoc_phan_ma);
            const blocks = parseTkbBlocks(group.dkmh_tu_dien_lop_hoc_phan_tkb);
            blocks.forEach((block) => {
                slots.push({
                    day: block.day,
                    start: block.start,
                    end: block.end,
                    label: `${course.dkmh_tu_dien_hoc_phan_ten_vn} (${group.dkmh_nhom_hoc_phan_ma})`,
                    bg: colors.solidBg,
                    text: colors.solidText,
                });
            });
        });

        return slots;
    }, [validSchedules, activeScheduleIndex]);

    const isSlotOccupied = (day: number, period: number) => {
        return previewSlots.find((s) => s.day === day && period >= s.start && period <= s.end);
    };

    const getSlotDetails = (day: number, period: number) => {
        return previewSlots.find((s) => s.day === day && s.start === period);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-200 ${
                    isOpen ? "opacity-100" : "opacity-0"
                }`}
                onClick={handleClose}
            ></div>

            {/* Modal Content */}
            <div
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden relative z-10 flex flex-col h-[90vh] transition-all duration-200 ${
                    isOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 translate-y-4 md:translate-y-0"
                }`}
            >
                {/* Header */}
                <div className="bg-[#3f6ad8] p-6 text-white relative shrink-0">
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <Sparkles size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                            Tính năng xếp lịch
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold">Xếp thời khóa biểu tự động</h2>
                    <div className="flex items-center gap-4 mt-3 text-sm opacity-90 font-medium">
                        <span>Hệ thống tự động giải quyết lịch trùng</span>
                    </div>
                </div>

                {/* Body (Visual Grid on top, control bar in the middle) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
                    {/* Control Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm shrink-0">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-0.5">
                                Các phương án thời khóa biểu
                            </h3>
                            {validSchedules.length > 0 ? (
                                <span className="text-sm font-black text-[#3f6ad8]">
                                    Phương án {activeScheduleIndex + 1} trên {validSchedules.length}
                                </span>
                            ) : (
                                <span className="text-sm font-black text-amber-600 flex items-center gap-1.5 animate-pulse">
                                    <AlertTriangle size={14} /> Nhấn nút bên phải để chọn môn xếp lịch
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleOpenSelector}
                                className="flex items-center gap-1.5 bg-[#3f6ad8] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#3458b6] transition-all cursor-pointer shadow-sm shadow-blue-100 active:scale-95 animate-bounce"
                            >
                                <Plus size={12} /> Chọn môn & nhóm
                            </button>

                            {validSchedules.length > 1 && (
                                <div className="flex items-center gap-1.5 border-l pl-3 border-slate-200">
                                    <button
                                        disabled={activeScheduleIndex === 0}
                                        onClick={() => setActiveScheduleIndex((prev) => prev - 1)}
                                        className="p-1.5 rounded-lg border bg-white border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={activeScheduleIndex === validSchedules.length - 1}
                                        onClick={() => setActiveScheduleIndex((prev) => prev + 1)}
                                        className="p-1.5 rounded-lg border bg-white border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Compact Calendar Grid Box */}
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 shadow-sm p-4 overflow-x-auto min-h-[350px]">
                        <table className="w-full min-w-[650px] border-collapse table-fixed text-left text-xs text-slate-500">
                            <thead>
                                <tr>
                                    <th className="w-12 text-[9px] font-black uppercase text-slate-400 text-center pb-2">
                                        Tiết
                                    </th>
                                    {DAYS.map((d) => (
                                        <th
                                            key={d.value}
                                            className="text-[10px] font-black uppercase text-slate-600 text-center pb-2 border-b"
                                        >
                                            {d.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PERIODS.map((period) => (
                                    <tr key={period} className="h-9">
                                        <td className="text-center text-[9px] font-bold text-slate-300 border-r pr-2 bg-slate-50/20">
                                            {period}
                                        </td>
                                        {DAYS.map((day) => {
                                            if (isSlotOccupied(day.value, period)) {
                                                const slot = getSlotDetails(day.value, period);
                                                if (!slot) return null;

                                                const rowSpan = slot.end - slot.start + 1;
                                                return (
                                                    <td
                                                        key={`${day.value}-${period}`}
                                                        rowSpan={rowSpan}
                                                        style={{
                                                            backgroundColor: slot.bg,
                                                            color: slot.text,
                                                            borderColor: slot.bg,
                                                        }}
                                                        className="border p-1 relative overflow-hidden align-middle select-none transition-all duration-350 border-r border-white/5 animate-in fade-in"
                                                    >
                                                        <div className="text-[8px] font-black leading-tight uppercase line-clamp-2 text-center">
                                                            {slot.label}
                                                        </div>
                                                    </td>
                                                );
                                            }

                                            return (
                                                <td
                                                    key={`${day.value}-${period}`}
                                                    className="border border-slate-100/60 p-0"
                                                />
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-slate-50 flex items-center justify-between shrink-0">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest cursor-pointer"
                    >
                        Hủy bỏ
                    </button>
                    {validSchedules.length > 0 && (
                        <button
                            onClick={handleApplySchedule}
                            className="px-8 py-2.5 rounded text-sm font-bold text-white shadow-lg transition-all uppercase tracking-widest active:scale-95 bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 cursor-pointer"
                        >
                            Áp dụng phương án này
                        </button>
                    )}
                </div>
            </div>

            {/* SEPARATE OVERLAY MODAL: COURSE & GROUP SELECTOR */}
            {showSelectorModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    {/* Nested Backdrop */}
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-in fade-in duration-200"
                        onClick={() => setShowSelectorModal(false)}
                    ></div>

                    {/* Selector Dialog Panel */}
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                        {/* Selector Header */}
                        <div className="bg-[#3f6ad8] p-5 text-white relative flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2.5">
                                <BookOpen size={18} />
                                <h3 className="font-bold text-base">Cấu hình học phần xếp lịch</h3>
                            </div>
                            <button
                                onClick={() => setShowSelectorModal(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Search filter input (Always visible, doesn't gate courses) */}
                        <div className="p-4 bg-slate-50 border-b border-slate-150 shrink-0">
                            <div className="relative">
                                <Search
                                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                                    size={14}
                                />
                                <input
                                    type="text"
                                    placeholder="Bộ lọc môn học nhanh..."
                                    value={courseSearchTerm}
                                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-8 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#3f6ad8] transition-all"
                                />
                            </div>
                        </div>

                        {/* Selector Body (Lists all system courses with group single-select) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/20">
                            {filteredCoursesList.length === 0 ? (
                                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                                    Không tìm thấy học phần nào khớp bộ lọc.
                                </div>
                            ) : (
                                filteredCoursesList.map((c) => {
                                    const code = c.dkmh_tu_dien_hoc_phan_ma;
                                    const isChecked = !!tempSelectedCourses[code];
                                    const isReg = c.trang_thai_dang_ky === 1;
                                    const activePref = tempGroupPreferences[code] || "auto";
                                    const colors = getCourseColor(code);

                                    return (
                                        <div
                                            key={code}
                                            style={{ borderColor: isChecked ? colors.softBorder : "" }}
                                            className={`rounded-xl border p-4 transition-all shadow-sm flex flex-col gap-3 ${
                                                isChecked ? "bg-white border" : "bg-white/40 opacity-70 border-slate-100"
                                            }`}
                                        >
                                            {/* Course identity row with checkbox to select/deselect course */}
                                            <div className="flex items-center justify-between gap-4">
                                                <label className="flex items-start gap-3 cursor-pointer flex-1 select-none">
                                                    <input
                                                        type="checkbox"
                                                        disabled={isReg} // Locked database registration
                                                        checked={isChecked}
                                                        onChange={() => toggleTempCourseSelection(code)}
                                                        className="mt-1 h-4.5 w-4.5 rounded border-slate-300 text-[#3f6ad8] focus:ring-[#3f6ad8] cursor-pointer"
                                                    />
                                                    <div className="min-w-0">
                                                        <span
                                                            style={{ color: isChecked ? colors.softText : "" }}
                                                            className="block text-xs font-black leading-snug break-words"
                                                        >
                                                            {c.dkmh_tu_dien_hoc_phan_ten_vn}
                                                        </span>
                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span
                                                                style={
                                                                    isChecked
                                                                        ? {
                                                                              color: colors.softText,
                                                                              backgroundColor: colors.softBg,
                                                                              borderColor: colors.softBorder,
                                                                          }
                                                                        : {}
                                                                }
                                                                className="rounded border px-1.5 py-0.5 text-[8px] font-black"
                                                            >
                                                                {code}
                                                            </span>
                                                            <span className="text-[9px] font-bold text-slate-400">
                                                                {c.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                                                            </span>
                                                            {isReg && (
                                                                <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 rounded font-black uppercase tracking-tight">
                                                                    Đã đăng ký (Khóa)
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                            </div>

                                            {/* Mutually exclusive Group Selection buttons (only shown if course is checked) */}
                                            {isChecked && (
                                                <div className="pt-2 border-t border-slate-100 space-y-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                                                        Lựa chọn nhóm xếp lịch
                                                    </span>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {/* Tự động (Auto) peer option */}
                                                        <button
                                                            disabled={isReg}
                                                            onClick={() => setTempPreference(code, "auto")}
                                                            className={`rounded border text-[9px] font-black px-2.5 py-1 transition-all uppercase tracking-tighter cursor-pointer ${
                                                                activePref === "auto"
                                                                    ? "bg-indigo-50 border-indigo-200 text-[#3f6ad8] font-black shadow-sm"
                                                                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                                            } ${isReg ? "cursor-not-allowed opacity-40" : ""}`}
                                                        >
                                                            Tự động chọn
                                                        </button>

                                                        {/* Individual Mutually Exclusive groups */}
                                                        {c.data_nhom_hp.map((g) => {
                                                            const isGroupActive = activePref === g.key;
                                                            return (
                                                                <button
                                                                    key={g.key}
                                                                    disabled={isReg}
                                                                    onClick={() => setTempPreference(code, g.key)}
                                                                    className={`rounded border text-[9px] font-black px-2.5 py-1 transition-all uppercase tracking-tighter cursor-pointer ${
                                                                        isGroupActive
                                                                            ? "bg-indigo-50 border-indigo-200 text-[#3f6ad8] font-black shadow-sm"
                                                                            : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                                                                    } ${isReg ? "cursor-not-allowed opacity-90" : ""}`}
                                                                >
                                                                    Nhóm {g.dkmh_nhom_hoc_phan_ma}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Selector Footer */}
                        <div className="p-4 border-t bg-slate-50 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setShowSelectorModal(false)}
                                className="px-5 py-2 rounded text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-wider cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={handleConfirmSelector}
                                className="px-6 py-2 rounded text-xs font-bold text-white bg-[#3f6ad8] hover:bg-[#3458b6] transition-colors uppercase tracking-wider shadow-md cursor-pointer"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

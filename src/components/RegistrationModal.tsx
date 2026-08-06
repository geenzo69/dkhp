"use client";

import { X, Clock, Users, BookOpen, CheckCircle2, AlertTriangle, MapPin } from "lucide-react";
import { formatTkb, checkTkbConflict, checkGroupConflict, parsePeriodsFromString } from "@/util/format";
import { useState, useEffect } from "react";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import { useApp } from "@/providers/AppContext";

interface RegistrationModalProps {
    course: Course;
    onClose: () => void;
    onConfirm: (group: LopHocPhan) => void;
}

export default function RegistrationModal({
    course,
    onClose,
    onConfirm,
}: RegistrationModalProps) {
    const { plannedCourses, courses } = useApp();
    const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(() => {
        const planned = plannedCourses.find(
            (r) => r.course.dkmh_tu_dien_hoc_phan_ma === course.dkmh_tu_dien_hoc_phan_ma
        );
        if (planned) return planned.group.key;

        if (course.trang_thai_dang_ky === 1) {
            const apiGroup = course.data_nhom_hp.find(
                (g) => g.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma
            );
            if (apiGroup) return apiGroup.key;
        }

        return null;
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsOpen(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const selectedGroup = course.data_nhom_hp.find(
        (g) => g.key === selectedGroupKey,
    );

    const handleClose = () => {
        setIsOpen(false);
        setTimeout(onClose, 200);
    };

    const handleConfirm = () => {
        if (selectedGroup) {
            setIsOpen(false);
            setTimeout(() => onConfirm(selectedGroup), 200);
        }
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
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh] transition-all duration-200 ${
                    isOpen 
                        ? "opacity-100 scale-100 translate-y-0" 
                        : "opacity-0 scale-95 translate-y-4 md:translate-y-0"
                }`}
            >
                {/* Header */}
                <div className="bg-[#3f6ad8] p-6 text-white relative">
                    <button
                        onClick={handleClose}
                        className="absolute right-4 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                            Chi tiết đăng ký
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold">
                        {course.dkmh_tu_dien_hoc_phan_ten_vn}
                    </h2>
                    <div className="flex items-center gap-4 mt-3 text-sm opacity-90 font-medium">
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                            {course.dkmh_tu_dien_hoc_phan_ma}
                        </span>
                        <span>•</span>
                        <span>
                            {course.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">
                        Chọn nhóm học phần
                    </h3>

                    <div className="grid gap-3">
                        {course.data_nhom_hp.map((group) => {
                            const isSelected = selectedGroupKey === group.key;
                            const isFull =
                                group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai <=
                                0;

                            let hasConflict = plannedCourses.some(
                                (r) =>
                                    r.course.dkmh_tu_dien_hoc_phan_ma !== course.dkmh_tu_dien_hoc_phan_ma &&
                                    checkGroupConflict(r.group, group)
                            );

                            if (!hasConflict) {
                                hasConflict = courses.some((c) => {
                                    if (c.trang_thai_dang_ky !== 1 || c.dkmh_tu_dien_hoc_phan_ma === course.dkmh_tu_dien_hoc_phan_ma) {
                                        return false;
                                    }
                                    const registeredGroup = c.data_nhom_hp?.find(
                                        (g) => g.dkmh_nhom_hoc_phan_ma === c.dkmh_nhom_hoc_phan_ma
                                    );
                                    if (registeredGroup) {
                                        return checkGroupConflict(registeredGroup, group);
                                    }
                                    return checkTkbConflict(c.dkmh_tu_dien_lop_hoc_phan_tkb, group.dkmh_tu_dien_lop_hoc_phan_tkb);
                                });
                            }

                            const isOriginal = course.trang_thai_dang_ky === 1 &&
                                group.dkmh_nhom_hoc_phan_ma === course.dkmh_nhom_hoc_phan_ma;
                            const isDisable = !isOriginal && hasConflict;

                            return (
                                <button
                                    key={group.key}
                                    disabled={isDisable}
                                    onClick={() =>
                                        setSelectedGroupKey(group.key)
                                    }
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                                        isSelected
                                            ? "border-[#3f6ad8] bg-blue-50/50 shadow-md"
                                            : isDisable
                                              ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                                              : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-sm font-bold ${isSelected ? "text-[#3f6ad8]" : "text-slate-700"}`}
                                            >
                                                Nhóm{" "}
                                                {group.dkmh_nhom_hoc_phan_ma}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2
                                                    size={16}
                                                    className="text-[#3f6ad8]"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-y-2 gap-x-4">
                                            <div className="flex items-center gap-1.5 text-xs text-[#3f6ad8] font-bold">
                                                <Users size={12} />
                                                <span>
                                                    GV:{" "}
                                                    {group.data?.[0]?.gv?.[0]
                                                        ?.dkmh_tu_dien_giang_vien_ten_vn ||
                                                        "Đang cập nhật"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                                <Users size={12} />
                                                <span
                                                    className={
                                                        isFull
                                                            ? "text-red-500 font-bold"
                                                            : ""
                                                    }
                                                >
                                                    Còn{" "}
                                                    {
                                                        group.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai
                                                    }
                                                    /
                                                    {
                                                        group.dkmh_tu_dien_lop_hoc_phan_si_so
                                                    }{" "}
                                                    chỗ
                                                </span>
                                            </div>
                                            {hasConflict && (
                                                <div className="flex items-center gap-1.5 text-xs text-red-500 font-bold">
                                                    <AlertTriangle size={12} />
                                                    <span>Trùng lịch</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 space-y-1.5 border-t border-slate-100/80 pt-2.5">
                                            {group.data?.map((slot, idx) => {
                                                const dayLabel = slot.dkmh_thu_trong_tuan_ma === 8 ? "Chủ Nhật" : `Thứ ${slot.dkmh_thu_trong_tuan_ma}`;
                                                const formattedPeriod = formatPeriods(slot.tiet_hoc);
                                                const formattedWeeks = formatWeeksRange(slot.tuan_hoc);
                                                return (
                                                    <div key={slot.key || idx} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 bg-slate-50/50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                                                        <div className="font-bold text-[#3f6ad8] min-w-[70px]">
                                                            {dayLabel}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-slate-700">
                                                            <Clock size={11} className="text-slate-400" />
                                                            <span className="font-semibold">{formattedPeriod}</span>
                                                        </div>
                                                        {slot.dkmh_tu_dien_phong_hoc_ten && (
                                                            <div className="flex items-center gap-1 text-slate-700">
                                                                <MapPin size={11} className="text-emerald-500" />
                                                                <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100">
                                                                    {slot.dkmh_tu_dien_phong_hoc_ten}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {formattedWeeks && (
                                                            <div className="text-[10px] text-slate-400 font-medium ml-auto">
                                                                Tuần: {formattedWeeks}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                                            Mã lớp:{" "}
                                            {
                                                group.dkmh_tu_dien_lop_hoc_phan_lop_ma
                                            }
                                        </div>
                                    </div>

                                    <div
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                            isSelected
                                                ? "bg-[#3f6ad8] border-[#3f6ad8]"
                                                : "border-slate-200 group-hover:border-slate-300"
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-white" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-slate-50 flex items-center justify-between">
                    <button
                        onClick={handleClose}
                        className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        disabled={!selectedGroupKey}
                        onClick={handleConfirm}
                        className={`px-8 py-2.5 rounded text-sm font-bold text-white shadow-lg transition-all uppercase tracking-widest active:scale-95 ${
                            selectedGroupKey
                                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
                                : "bg-slate-300 cursor-not-allowed"
                        }`}
                    >
                        Xác nhận chọn
                    </button>
                </div>
            </div>
        </div>
    );
}

function getClassroomNameForGroup(group: LopHocPhan): string {
    if (!group?.data) return "Đang cập nhật";
    const rooms = Array.from(
        new Set(
            group.data
                .map((d) => d.dkmh_tu_dien_phong_hoc_ten?.trim())
                .filter(Boolean)
        )
    );
    return rooms.length > 0 ? rooms.join(", ") : "Đang cập nhật";
}

function formatWeeksRange(weeks: number[]): string {
    if (!weeks || weeks.length === 0) return "";
    const sorted = [...weeks].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === end + 1) {
            end = sorted[i];
        } else {
            ranges.push(start === end ? `${start}` : `${start}-${end}`);
            start = sorted[i];
            end = sorted[i];
        }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(", ");
}

function formatPeriods(tietHoc: string): string {
    if (!tietHoc) return "";
    const periods = parsePeriodsFromString(tietHoc);
    if (periods.length === 0) return tietHoc;
    const start = periods[0];
    const end = periods[periods.length - 1];
    return start === end ? `Tiết ${start}` : `Tiết ${start}-${end}`;
}

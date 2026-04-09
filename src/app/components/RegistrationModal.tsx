"use client";

import { X, Clock, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { HocPhan, LopHocPhan } from "../util/course";
import { useState } from "react";

interface RegistrationModalProps {
    course: HocPhan;
    onClose: () => void;
    onConfirm: (group: LopHocPhan) => void;
}

export default function RegistrationModal({
    course,
    onClose,
    onConfirm,
}: RegistrationModalProps) {
    const [selectedGroupKey, setSelectedGroupKey] = useState<string | null>(
        null,
    );

    const selectedGroup = course.data_nhom_hp.find(
        (g) => g.key === selectedGroupKey,
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[#3f6ad8] p-6 text-white relative">
                    <button
                        onClick={onClose}
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

                            return (
                                <button
                                    key={group.key}
                                    disabled={isFull}
                                    onClick={() =>
                                        setSelectedGroupKey(group.key)
                                    }
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                                        isSelected
                                            ? "border-[#3f6ad8] bg-blue-50/50 shadow-md"
                                            : isFull
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
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <Clock size={12} />
                                                <span>
                                                    {
                                                        group.dkmh_tu_dien_lop_hoc_phan_tkb
                                                    }
                                                </span>
                                            </div>
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
                        onClick={onClose}
                        className="px-6 py-2.5 rounded text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors uppercase tracking-widest"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        disabled={!selectedGroupKey}
                        onClick={() =>
                            selectedGroup && onConfirm(selectedGroup)
                        }
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

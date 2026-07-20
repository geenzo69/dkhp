"use client";

import { X, Clock, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { formatTkb } from "@/util/format";
import { useState } from "react";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";

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
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="mc-panel bg-mc-stone w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-mc-stone-dark p-6 text-white relative border-b-4 border-black">
                    <button
                        onClick={onClose}
                        className="mc-button absolute right-4 top-4 w-8 h-8 flex items-center justify-center text-white"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 flex items-center justify-center mc-item-slot bg-mc-stone">
                            <BookOpen size={20} />
                        </div>
                        <span className="text-[10px] font-minecraft uppercase mc-text-shadow text-gray-300">
                            Chi tiết đăng ký
                        </span>
                    </div>
                    <h2 className="text-xl font-minecraft mc-text-shadow">
                        {course.dkmh_tu_dien_hoc_phan_ten_vn}
                    </h2>
                    <div className="flex items-center gap-4 mt-3 text-[10px] font-minecraft mc-text-shadow">
                        <span className="bg-black/40 px-2 py-0.5 text-gray-300">
                            {course.dkmh_tu_dien_hoc_phan_ma}
                        </span>
                        <span>•</span>
                        <span className="text-mc-gold">
                            {course.dkmh_tu_dien_hoc_phan_so_tin_chi} Tín chỉ
                        </span>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    <h3 className="text-[10px] font-minecraft text-gray-700 uppercase mc-text-shadow mb-2">
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
                                    className={`w-full text-left p-4 mc-item-slot flex items-center justify-between group ${
                                        isSelected
                                            ? "border-4 border-mc-diamond bg-white/20"
                                            : isFull
                                              ? "opacity-60 cursor-not-allowed"
                                              : "hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span
                                                className={`text-sm font-minecraft mc-text-shadow ${isSelected ? "text-mc-diamond" : "text-white"}`}
                                            >
                                                Nhóm{" "}
                                                {group.dkmh_nhom_hoc_phan_ma}
                                            </span>
                                            {isSelected && (
                                                <CheckCircle2
                                                    size={16}
                                                    className="text-mc-diamond"
                                                />
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-y-2 gap-x-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-minecraft text-gray-300 mc-text-shadow">
                                                <Clock size={12} />
                                                <span>
                                                    {formatTkb(group.dkmh_tu_dien_lop_hoc_phan_tkb)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-minecraft text-mc-diamond mc-text-shadow">
                                                <Users size={12} />
                                                <span>
                                                    GV:{" "}
                                                    {group.data?.[0]?.gv?.[0]
                                                        ?.dkmh_tu_dien_giang_vien_ten_vn ||
                                                        "Đang cập nhật"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-minecraft text-gray-300 mc-text-shadow">
                                                <Users size={12} />
                                                <span
                                                    className={
                                                        isFull
                                                            ? "text-mc-redstone"
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
                                        <div className="mt-2 text-[10px] text-gray-400 font-minecraft uppercase mc-text-shadow">
                                            Mã lớp:{" "}
                                            {
                                                group.dkmh_tu_dien_lop_hoc_phan_lop_ma
                                            }
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t-4 border-black bg-mc-stone-dark flex items-center justify-between">
                    <button
                        onClick={onClose}
                        className="mc-button px-6 py-2.5 text-[10px] font-minecraft text-white uppercase mc-text-shadow"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        disabled={!selectedGroupKey}
                        onClick={() =>
                            selectedGroup && onConfirm(selectedGroup)
                        }
                        className={`mc-button px-8 py-2.5 text-[10px] font-minecraft text-white uppercase mc-text-shadow ${
                            selectedGroupKey
                                ? "!bg-mc-grass"
                                : "opacity-50 cursor-not-allowed"
                        }`}
                    >
                        Xác nhận chọn
                    </button>
                </div>
            </div>
        </div>
    );
}

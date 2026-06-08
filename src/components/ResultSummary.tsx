"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppContext";
import { useAction } from "next-safe-action/hooks";
import registerCourse from "@/app/actions/registerCourse";
import { useState } from "react";

export default function ResultSummary() {
    const { notify, addLog, setPlannedCourses, plannedCourses, courses } = useApp();
    const [showScheduleUI, setShowScheduleUI] = useState(false);

    const { execute, isExecuting } = useAction(registerCourse, {
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

            notify("Đăng ký học phần thành công!");
        }
    });

    return (
        <div className="bg-linear-to-br from-[#3f6ad8] to-[#2c4a96] rounded-xl p-6 text-white shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6">
                Kết quả tạm tính
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                    <p className="text-2xl font-black">{courses.length + plannedCourses.length}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">
                        Môn học
                    </p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                    <p className="text-2xl font-black">{courses.map((v) => v.dkmh_tu_dien_hoc_phan_so_tin_chi).reduce((a, b) => a + b, 0)}</p>
                    <p className="text-[10px] font-bold uppercase opacity-60">
                        Tín chỉ
                    </p>
                </div>
            </div>

            <div className="space-y-3 mb-8 max-h-48 overflow-y-auto scrollbar-hide text-left">
                {
                    <>
                        {courses
                            ?.filter((c) => c.trang_thai_dang_ky === 1)
                            .map((course) => (
                                <div
                                    key={`api-${course.dkmh_tu_dien_hoc_phan_ma}`}
                                    className="flex flex-col gap-1 bg-emerald-500/20 py-2 px-3 rounded text-[11px] border border-emerald-500/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate font-bold text-emerald-100">
                                            {
                                                course.dkmh_tu_dien_hoc_phan_ten_vn
                                            }
                                        </span>
                                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                            Đã đăng ký
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] opacity-60 text-emerald-100">
                                        <span className="font-bold">
                                            Nhóm {course.dkmh_nhom_hoc_phan_ma}
                                        </span>
                                        <span>•</span>
                                        <span>
                                            {
                                                course.dkmh_tu_dien_hoc_phan_so_tin_chi
                                            }{" "}
                                            TC
                                        </span>
                                    </div>
                                </div>
                            ))}

                        {plannedCourses.map(({ course, group }) => (
                            <div
                                key={course.dkmh_tu_dien_hoc_phan_ma}
                                className="flex flex-col gap-1 bg-white/5 py-2 px-3 rounded text-[11px]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate font-bold text-white/90">
                                        {course.dkmh_tu_dien_hoc_phan_ten_vn}
                                    </span>
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
                                        className="text-white/40 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] opacity-60">
                                    <span className="bg-white/20 px-1 rounded font-bold">
                                        Nhóm {group.dkmh_nhom_hoc_phan_ma}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {
                                            course.dkmh_tu_dien_hoc_phan_so_tin_chi
                                        }{" "}
                                        TC
                                    </span>
                                </div>
                            </div>
                        ))}
                    </>
                }
                {/* {!isLoading && allRegisteredCount === 0 && (
                    <p className="text-xs opacity-40 text-center py-4 italic">
                        Chưa chọn môn học nào
                    </p>
                )} */}
            </div>

            {plannedCourses.length > 0 && (
                <div className="space-y-4">
                    {!showScheduleUI ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={async () => {
                                    if (
                                        plannedCourses.length === 0 ||
                                        isExecuting
                                    )
                                        return;

                                    addLog("Hệ thống: Đang gửi yêu cầu đăng ký học phần...", "info");

                                    const data = plannedCourses.map((r) => ({
                                        dkmh_tu_dien_hoc_phan_ma: r.course.dkmh_tu_dien_hoc_phan_ma,
                                        dkmh_nhom_hoc_phan_ma: r.group.dkmh_nhom_hoc_phan_ma,
                                    }));

                                    execute(data);
                                }}
                                disabled={isExecuting}
                                aria-busy={isExecuting}
                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded shadow-lg shadow-emerald-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-500/60 disabled:hover:bg-emerald-500/60 disabled:active:scale-100"
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
                                        Đang đăng ký...
                                    </>
                                ) : (
                                    "Đăng ký ngay"
                                )}
                            </button>
                            <button
                                className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded shadow-lg shadow-amber-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95"
                            >
                                Lên lịch tự động
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                                Chọn thời gian đăng ký
                            </p>
                            {/* <input
                                type="datetime-local"
                                value={scheduleTime}
                                onChange={(e) =>
                                    setScheduleTime(e.target.value)
                                }
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-hidden focus:border-white/40"
                            /> */}
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider"
                                >
                                    Xác nhận lịch
                                </button>
                                <button
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

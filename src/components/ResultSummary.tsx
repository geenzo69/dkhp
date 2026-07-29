"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppContext";
import { useAction } from "next-safe-action/hooks";
import registerCourse from "@/app/actions/registerCourse";
import { useState, useEffect } from "react";
import createSchedule from "@/app/actions/createSchedule";
import getScheduleAction from "@/app/tu-dong-dang-ky/actions/getSchedule";
import deleteScheduleAction from "@/app/actions/deleteSchedule";

export default function ResultSummary() {
    const { notify, addLog, setPlannedCourses, plannedCourses, courses, isLoadingCourses } = useApp();
    const [showScheduleUI, setShowScheduleUI] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [hasExistingSchedule, setHasExistingSchedule] = useState(false);

    const { execute: checkSchedule } = useAction(getScheduleAction, {
        onSuccess: ({ data }) => {
            if (data?.time) {
                setHasExistingSchedule(true);
            } else {
                setHasExistingSchedule(false);
            }
        }
    });

    const { execute: executeDelete, isExecuting: isDeleting } = useAction(deleteScheduleAction, {
        onError: ({ error }) => {
            notify(getActionErrorMessage(error), "error");
        },
        onSuccess: () => {
            notify("Đã hủy lịch đăng ký tự động thành công!", "success");
            addLog("Hệ thống: Đã xóa lịch đăng ký tự động.", "warning");
            checkSchedule();
        }
    });

    useEffect(() => {
        checkSchedule();
    }, []);
    const selectedCoursesData = plannedCourses.map((r) => ({
        dkmh_tu_dien_hoc_phan_ma: r.course.dkmh_tu_dien_hoc_phan_ma,
        dkmh_nhom_hoc_phan_ma: r.group.dkmh_nhom_hoc_phan_ma,
    }));

    const { execute: register, isExecuting: isRegister } = useAction(registerCourse, {
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

            notify("Đăng ký học phần thành công!", "success");
        }
    });

    const { execute: schedule, isExecuting: isSchedule } = useAction(createSchedule, {
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

            notify("Lên kế hoạch thành công!", "success");
            setShowScheduleUI(false);
            checkSchedule();
        }
    });

    return (
        <div className="bg-linear-to-br from-[#3f6ad8] to-[#2c4a96] rounded-xl p-6 text-white shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-6">
                Kết quả tạm tính
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                    <p className="text-2xl font-black">
                        {isLoadingCourses ? (
                            <span className="inline-block h-8 w-12 bg-white/20 rounded animate-pulse" />
                        ) : (
                            courses.filter((c) => c.trang_thai_dang_ky === 1).length + plannedCourses.length
                        )}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-60">
                        Môn học
                    </p>
                </div>
                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                    <p className="text-2xl font-black">
                        {isLoadingCourses ? (
                            <span className="inline-block h-8 w-12 bg-white/20 rounded animate-pulse" />
                        ) : (
                            courses.filter((c) => c.trang_thai_dang_ky === 1).reduce((sum, c) => sum + c.dkmh_tu_dien_hoc_phan_so_tin_chi, 0) +
                            plannedCourses.reduce((sum, p) => sum + p.course.dkmh_tu_dien_hoc_phan_so_tin_chi, 0)
                        )}
                    </p>
                    <p className="text-[10px] font-bold uppercase opacity-60">
                        Tín chỉ
                    </p>
                </div>
            </div>

            <div className="space-y-3 mb-8 max-h-48 overflow-y-auto scrollbar-hide text-left">
                {isLoadingCourses ? (
                    <div className="space-y-3 animate-pulse">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div key={`summary-skeleton-${index}`} className="flex flex-col gap-2 bg-white/5 py-2 px-3 rounded">
                                <div className="h-4 w-32 bg-white/20 rounded" />
                                <div className="h-3 w-20 bg-white/10 rounded" />
                            </div>
                        ))}
                    </div>
                ) : (
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
                )}
            </div>

            {plannedCourses.length > 0 && (
                <div className="space-y-4">
                    {!showScheduleUI ? (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={async () => {
                                    if (
                                        plannedCourses.length === 0 ||
                                        isRegister
                                    )
                                        return;

                                    addLog("Hệ thống: Đang gửi yêu cầu đăng ký học phần...", "info");

                                    register(selectedCoursesData);
                                }}
                                disabled={isRegister}
                                aria-busy={isRegister}
                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded shadow-lg shadow-emerald-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-500/60 disabled:hover:bg-emerald-500/60 disabled:active:scale-100"
                            >
                                {isRegister ? (
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
                            {hasExistingSchedule ? (
                                <button
                                    onClick={() => {
                                        if (confirm("Bạn có chắc chắn muốn hủy lịch đăng ký tự động đã hẹn?")) {
                                            executeDelete();
                                        }
                                    }}
                                    disabled={isDeleting}
                                    className="bg-red-500 hover:bg-red-400 text-white font-bold py-4 rounded shadow-lg shadow-red-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95 disabled:bg-red-500/60 disabled:cursor-wait"
                                >
                                    {isDeleting ? "Đang hủy..." : "Hủy lịch hẹn"}
                                </button>
                            ) : (
                                <button
                                    onClick={(() => {
                                        setShowScheduleUI(true);
                                    })}
                                    className="bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded shadow-lg shadow-amber-900/20 transition-all uppercase text-[10px] tracking-wider active:scale-95"
                                >
                                    Lên lịch tự động
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            aria-busy={isSchedule}
                            className={`bg-white/5 p-4 rounded-lg border border-white/10 space-y-3 animate-in fade-in zoom-in-95 duration-200 ${
                                isSchedule ? "animate-pulse opacity-80" : ""
                            }`}
                        >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                                Chọn thời gian đăng ký
                            </p>
                            <input
                                type="datetime-local"
                                value={scheduleTime}
                                disabled={isSchedule}
                                onChange={(e) =>
                                    setScheduleTime(e.target.value)
                                }
                                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-hidden focus:border-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        if (isSchedule) {
                                            return;
                                        }

                                        if (!scheduleTime) {
                                            notify("Vui lòng chọn thời gian đăng ký!", "warning");
                                            return;
                                        }

                                        addLog("Hệ thống: Đang lên lịch đăng ký tự động...", "info");
                                        schedule({
                                            data: selectedCoursesData,
                                            time: scheduleTime
                                        })
                                    }}
                                    disabled={isSchedule || !scheduleTime}
                                    className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider disabled:cursor-not-allowed disabled:bg-amber-500/60 disabled:hover:bg-amber-500/60"
                                >
                                    {isSchedule ? (
                                        <>
                                            <Loader2
                                                size={14}
                                                className="animate-spin"
                                            />
                                            Đang lên lịch...
                                        </>
                                    ) : (
                                        "Xác nhận lịch"
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        if (isSchedule) {
                                            return;
                                        }

                                        setShowScheduleUI(false);
                                    }}
                                    disabled={isSchedule}
                                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-60"
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

function getActionErrorMessage(error: any) {
    if (error.serverError) {
        return error.serverError;
    }
    if (error.validationErrors) {
        const messages = Object.values(error.validationErrors)
            .flatMap((err: any) =>
                Array.isArray(err) ? err : err?._errors ?? []
            )
            .join(", ");
        return messages || "Validation error!";
    }
    return "Đã có lỗi xảy ra";
}

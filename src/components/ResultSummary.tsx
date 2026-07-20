"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useApp } from "@/providers/AppContext";
import { useAction } from "next-safe-action/hooks";
import registerCourse from "@/app/actions/registerCourse";
import { useState } from "react";
import createSchedule from "@/app/actions/createSchedule";

export default function ResultSummary() {
    const { notify, addLog, setPlannedCourses, plannedCourses, courses } = useApp();
    const [showScheduleUI, setShowScheduleUI] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
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
        }
    });

    return (
        <div className="mc-panel bg-mc-stone p-6 text-white">
            <h3 className="text-[10px] font-minecraft uppercase mc-text-shadow mb-6">
                Kết quả tạm tính
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="mc-item-slot p-4 text-center">
                    <p className="text-2xl font-minecraft mc-text-shadow">{courses.length + plannedCourses.length}</p>
                    <p className="text-[10px] font-minecraft uppercase text-gray-300 mt-2">
                        Môn học
                    </p>
                </div>
                <div className="mc-item-slot p-4 text-center">
                    <p className="text-2xl font-minecraft mc-text-shadow text-mc-gold">{courses.map((v) => v.dkmh_tu_dien_hoc_phan_so_tin_chi).reduce((a, b) => a + b, 0)}</p>
                    <p className="text-[10px] font-minecraft uppercase text-gray-300 mt-2">
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
                                    className="flex flex-col gap-1 mc-item-slot py-2 px-3 text-[11px]"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="truncate font-bold text-mc-grass mc-text-shadow">
                                            {
                                                course.dkmh_tu_dien_hoc_phan_ten_vn
                                            }
                                        </span>
                                        <span className="text-[9px] bg-mc-grass text-white px-1.5 py-0.5 font-minecraft uppercase mc-text-shadow">
                                            Đã đăng ký
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-300 font-minecraft">
                                        <span>
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
                                className="flex flex-col gap-1 mc-item-slot py-2 px-3 text-[11px]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate font-bold text-white mc-text-shadow">
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
                                        className="text-gray-400 hover:text-mc-redstone"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-300 font-minecraft">
                                    <span className="bg-black/40 px-1">
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
                                className="flex items-center justify-center gap-2 mc-button !bg-mc-grass text-white py-4 uppercase text-[10px] font-minecraft mc-text-shadow disabled:cursor-not-allowed disabled:opacity-60"
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
                            <button
                                onClick={(() => {
                                    setShowScheduleUI(true);
                                })}
                                className="mc-button !bg-mc-gold text-white py-4 uppercase text-[10px] font-minecraft mc-text-shadow"
                            >
                                Lên lịch tự động
                            </button>
                        </div>
                    ) : (
                        <div
                            aria-busy={isSchedule}
                            className={`mc-item-slot p-4 space-y-3 ${
                                isSchedule ? "opacity-80" : ""
                            }`}
                        >
                            <p className="text-[10px] font-minecraft uppercase text-gray-300 mc-text-shadow">
                                Chọn thời gian đăng ký
                            </p>
                            <input
                                type="datetime-local"
                                value={scheduleTime}
                                disabled={isSchedule}
                                onChange={(e) =>
                                    setScheduleTime(e.target.value)
                                }
                                className="w-full bg-black/40 border-2 border-black px-3 py-2 text-sm text-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 font-minecraft"
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
                                    className="flex items-center justify-center gap-2 mc-button !bg-mc-gold text-white py-2.5 text-[10px] font-minecraft uppercase mc-text-shadow disabled:cursor-not-allowed disabled:opacity-60"
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
                                    className="mc-button !bg-mc-stone-dark text-white py-2.5 text-[10px] font-minecraft uppercase mc-text-shadow disabled:cursor-not-allowed disabled:opacity-60"
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

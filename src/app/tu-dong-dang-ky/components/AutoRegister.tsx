"use client";

import { useApp } from "@/providers/AppContext";
import {
    AlertCircle,
    Gauge,
    Loader2,
    Play,
    Timer,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import getScheduleAction from "../actions/getSchedule";
import deleteScheduleAction from "@/app/actions/deleteSchedule";

interface ScheduledEntry {
    dkmh_tu_dien_hoc_phan_ma: string;
    dkmh_nhom_hoc_phan_ma: string;
}

function formatScheduleTime(time: string) {
    const match = time.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );

    if (!match) {
        return time;
    }

    const [, year, month, day, hour, minute, second] = match;

    return `${day}/${month}/${year}, ${hour}:${minute}:${second || "00"}`;
}

export default function AutoRegister() {
    const { courses, isLoadingCourses, refetchCourses, notify, addLog } = useApp();
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>(
        [],
    );
    const [scheduleTime, setScheduleTime] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { execute: executeSchedule, isExecuting: isLoadingSchedule } =
        useAction(getScheduleAction, {
            onError: ({ error }) => {
                setErrorMessage(getActionErrorMessage(error));
                setIsInitialLoading(false);
            },
            onSuccess: ({ data }) => {
                setErrorMessage("");

                if (!data) {
                    setScheduledEntries([]);
                    setScheduleTime("");
                    setIsInitialLoading(false);
                    return;
                }

                setScheduledEntries(data.data || []);
                setScheduleTime(data.time || "");
                refetchCourses();
                setIsInitialLoading(false);
            },
        });

    const { execute: executeDelete, isExecuting: isDeleting } = useAction(
        deleteScheduleAction,
        {
            onError: ({ error }) => {
                notify(getActionErrorMessage(error), "error");
            },
            onSuccess: () => {
                notify("Đã xóa lịch đăng ký học phần thành công!", "success");
                addLog("Hệ thống: Đã xóa lịch đăng ký tự động.", "warning");
                executeSchedule();
            },
        }
    );

    useEffect(() => {
        executeSchedule();
    }, []);

    const scheduledCourses = useMemo(() => {
        if (courses.length === 0) return [];

        return scheduledEntries.map((entry, index) => {
            const course = courses.find(
                (item) =>
                    item.dkmh_tu_dien_hoc_phan_ma ===
                    entry.dkmh_tu_dien_hoc_phan_ma,
            );
            const group = course?.data_nhom_hp.find(
                (item) =>
                    item.dkmh_nhom_hoc_phan_ma === entry.dkmh_nhom_hoc_phan_ma,
            );

            return {
                key: entry.dkmh_tu_dien_hoc_phan_ma,
                code: entry.dkmh_tu_dien_hoc_phan_ma,
                name: course?.dkmh_tu_dien_hoc_phan_ten_vn ||
                    "Chưa tìm thấy học phần",
                groupCode: entry.dkmh_nhom_hoc_phan_ma,
                priority: index + 1,
                credits: course?.dkmh_tu_dien_hoc_phan_so_tin_chi,
                remainingSlots: group?.dkmh_tu_dien_lop_hoc_phan_si_so_con_lai,
                status: !course
                    ? "Không tìm thấy học phần"
                    : !group
                      ? "Không tìm thấy nhóm"
                      : "Sẵn sàng",
            };
        });
    }, [courses, scheduledEntries]);

    const isLoading = isInitialLoading || isLoadingSchedule || isLoadingCourses;
    const displayTime = scheduleTime
        ? formatScheduleTime(scheduleTime)
        : "--:--";
    const totalCredits = scheduledCourses.reduce(
        (total, course) => total + (course.credits || 0),
        0,
    );

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <section className="xl:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                            Hàng đợi học phần
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Lấy lịch hẹn trước, sau đó tải danh sách học
                            phần để đối chiếu mã học phần và nhóm.
                        </p>
                    </div>
                    <button
                        onClick={() => executeSchedule()}
                        disabled={isLoading}
                        className="flex items-center gap-2 rounded bg-[#3f6ad8] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-100 disabled:cursor-not-allowed disabled:bg-blue-300"
                    >
                        {isLoading ? (
                            <Loader2
                                size={14}
                                className="animate-spin"
                            />
                        ) : (
                            <Play size={14} />
                        )}
                        Tải lại
                    </button>
                </div>

                <div className="divide-y divide-slate-100">
                    {errorMessage && (
                        <div className="p-5 flex items-center gap-3 text-sm font-bold text-red-500">
                            <AlertCircle size={18} />
                            {errorMessage}
                        </div>
                    )}

                    {!errorMessage && isLoading && (
                        <div className="divide-y divide-slate-100 animate-pulse">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={`queue-skeleton-${index}`} className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded bg-slate-200" />
                                        <div>
                                            <div className="h-4 w-48 bg-slate-200 rounded mb-2" />
                                            <div className="h-3 w-32 bg-slate-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-20 bg-slate-100 rounded" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!errorMessage &&
                        !isLoading &&
                        scheduledCourses.length === 0 && (
                            <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                                Chưa có học phần trong lịch hẹn
                            </div>
                        )}

                    {!errorMessage &&
                        !isLoading &&
                        scheduledCourses.map((item) => (
                            <div
                                key={item.key}
                                className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded bg-blue-50 text-[#3f6ad8] flex items-center justify-center font-black text-sm">
                                        {item.priority}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-800">
                                            {item.code} - {item.name}
                                        </p>
                                        <p className="text-xs font-bold text-slate-400 mt-1">
                                            Nhóm {item.groupCode}
                                            {typeof item.credits ===
                                                "number" && (
                                                    <> • {item.credits} TC</>
                                                )}
                                            {typeof item.remainingSlots ===
                                                "number" && (
                                                    <>
                                                        {" "}
                                                        • Còn{" "}
                                                        {
                                                            item.remainingSlots
                                                        }{" "}
                                                        chỗ
                                                    </>
                                                )}
                                        </p>
                                    </div>
                                </div>
                                <span className="w-fit rounded bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    {item.status}
                                </span>
                            </div>
                        ))}
                </div>
            </section>

            <aside className="xl:col-span-4 space-y-6">
                <div className="bg-linear-to-br from-[#3f6ad8] to-[#2c4a96] rounded-xl p-6 text-white shadow-xl">
                    <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                            <Timer size={18} className="mb-3" />
                            <p className="text-base font-black leading-tight break-words">
                                {isLoading ? (
                                    <span className="inline-block h-5 w-28 bg-white/20 rounded animate-pulse" />
                                ) : (
                                    displayTime
                                )}
                            </p>
                            <p className="text-[10px] font-bold uppercase opacity-60">
                                Lịch hẹn
                            </p>
                        </div>
                        <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                            <Gauge size={18} className="mb-3" />
                            <p className="text-2xl font-black">
                                {isLoading ? (
                                    <span className="inline-block h-8 w-12 bg-white/20 rounded animate-pulse" />
                                ) : (
                                    totalCredits
                                )}
                            </p>
                            <p className="text-[10px] font-bold uppercase opacity-60">
                                Tín chỉ
                            </p>
                        </div>
                    </div>
                    
                    {!isLoading && scheduleTime && (
                        <button
                            onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa lịch đăng ký tự động đã hẹn?")) {
                                    executeDelete();
                                }
                            }}
                            disabled={isDeleting}
                            className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold py-2.5 rounded text-[10px] uppercase tracking-wider transition-all active:scale-95 disabled:bg-red-500/60 disabled:cursor-wait"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang xóa...
                                </>
                            ) : (
                                "Xóa lịch hẹn"
                            )}
                        </button>
                    )}
                </div>
            </aside>
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
                Array.isArray(err) ? err : err?._errors ?? [],
            )
            .join(", ");

        return messages || "Validation error!";
    }

    return "Đã có lỗi xảy ra";
}

"use client";

import getCourses from "@/app/actions/getCourses";
import Header from "@/components/Header";
import Course from "@/types/Course";
import User from "@/types/User";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Gauge,
    Loader2,
    Play,
    ShieldCheck,
    Timer,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useMemo, useState } from "react";
import getScheduleAction from "../actions/getSchedule";

interface AutoRegisterPageProps {
    initialUser: User | null;
}

interface ScheduledEntry {
    dkmh_tu_dien_hoc_phan_ma: string;
    dkmh_nhom_hoc_phan_ma: string;
}

export default function AutoRegisterPage({
    initialUser,
}: AutoRegisterPageProps) {
    const [scheduledEntries, setScheduledEntries] = useState<ScheduledEntry[]>(
        [],
    );
    const [courses, setCourses] = useState<Course[]>([]);
    const [scheduleTime, setScheduleTime] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const { execute: executeCourses, isExecuting: isLoadingCourses } =
        useAction(getCourses, {
            onError: ({ error }) => {
                setErrorMessage(getActionErrorMessage(error));
            },
            onSuccess: ({ data }) => {
                setCourses(data || []);
            },
        });

    const { execute: executeSchedule, isExecuting: isLoadingSchedule } =
        useAction(getScheduleAction, {
            onError: ({ error }) => {
                setErrorMessage(getActionErrorMessage(error));
            },
            onSuccess: ({ data }) => {
                setErrorMessage("");

                if (!data) {
                    setScheduledEntries([]);
                    setScheduleTime("");
                    return;
                }

                setScheduledEntries(data.data || []);
                setScheduleTime(data.time || "");
                executeCourses();
            },
        });

    useEffect(() => {
        executeSchedule();
    }, []);

    const scheduledCourses = useMemo(() => {
        return scheduledEntries.map((entry, index) => {
            const course = courses.find(
                (item) =>
                    item.dkmh_tu_dien_hoc_phan_ma ===
                    entry.dkmh_tu_dien_hoc_phan_ma,
            );
            const group = course?.data_nhom_hp.find(
                (item) =>
                    item.dkmh_nhom_hoc_phan_ma ===
                    entry.dkmh_nhom_hoc_phan_ma,
            );

            return {
                key: `${entry.dkmh_tu_dien_hoc_phan_ma}-${entry.dkmh_nhom_hoc_phan_ma}-${index}`,
                code: entry.dkmh_tu_dien_hoc_phan_ma,
                name:
                    course?.dkmh_tu_dien_hoc_phan_ten_vn ||
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

    const isLoading = isLoadingSchedule || isLoadingCourses;
    const displayTime = scheduleTime
        ? new Date(scheduleTime).toLocaleString("vi-VN")
        : "--:--";
    const totalCredits = scheduledCourses.reduce(
        (total, course) => total + (course.credits || 0),
        0,
    );
    const logs = [
        scheduleTime
            ? `Lịch hẹn: ${displayTime}`
            : "Chưa có thời gian hẹn đăng ký",
        `Học phần: ${scheduledEntries.length}`,
        `Khóa học đã tải: ${courses.length}`,
    ];

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header user={initialUser || undefined} />

            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Tự động đăng ký
                    </h1>
                    <p className="text-sm text-slate-500">
                        Màn hình hiển thị lịch hẹn đăng ký và các học phần đã
                        được lưu.
                    </p>
                </div>

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
                                <div className="p-8 text-center text-xs font-black uppercase tracking-widest text-slate-400">
                                    Đang tải dữ liệu...
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
                                        {displayTime}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase opacity-60">
                                        Lịch hẹn
                                    </p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                    <Gauge size={18} className="mb-3" />
                                    <p className="text-2xl font-black">
                                        {totalCredits}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase opacity-60">
                                        Tín chỉ
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-5 text-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} />
                                <h2 className="text-xs font-black uppercase tracking-widest">
                                    Log dữ liệu
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {logs.map((log) => (
                                    <p
                                        key={log}
                                        className="text-[11px] font-mono text-slate-300"
                                    >
                                        {log}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
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

"use client";

import { Clock } from "lucide-react";

interface ScheduledJobsProps {
    cronJobs: any[];
}

export default function ScheduledJobs({ cronJobs }: ScheduledJobsProps) {
    if (cronJobs.length === 0) return null;

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-amber-100 text-left">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={16} />
                </div>
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                    Hẹn giờ đăng ký
                </h3>
            </div>
            <div className="space-y-3">
                {cronJobs.map((job: any) => (
                    <div
                        key={job.jobId}
                        className="p-3 bg-amber-50/50 rounded-lg border border-amber-100 flex flex-col gap-2"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-700">
                                Trạng thái: {job.enabled ? "Đang chờ" : "Tạm dừng"}
                            </span>
                            <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded font-black uppercase">
                                Schedule
                            </span>
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                            Kích hoạt vào: {job.schedule.hours[0]}:
                            {job.schedule.minutes[0]?.toString().padStart(2, "0")}{" "}
                            ngày {job.schedule.mdays[0]}/{job.schedule.months[0]}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

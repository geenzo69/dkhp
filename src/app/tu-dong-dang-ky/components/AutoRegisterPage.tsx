"use client";

import Header from "@/components/Header";
import User from "@/types/User";
import {
    CheckCircle2,
    Clock,
    Gauge,
    Play,
    ShieldCheck,
    Timer,
} from "lucide-react";

interface AutoRegisterPageProps {
    initialUser: User | null;
}

const mockQueue = [
    {
        code: "CT112",
        name: "Mạng máy tính",
        group: "01",
        priority: 1,
        status: "Sẵn sàng",
    },
    {
        code: "CT176",
        name: "Lập trình hướng đối tượng",
        group: "03",
        priority: 2,
        status: "Theo dõi sĩ số",
    },
    {
        code: "TN010",
        name: "Xác suất thống kê",
        group: "02",
        priority: 3,
        status: "Chờ mở cổng",
    },
];

const mockLogs = [
    "08:00:00 - Khởi tạo phiên đăng ký thử nghiệm",
    "08:00:04 - Kiểm tra token và lịch học hiện tại",
    "08:00:07 - Ưu tiên CT112 nhóm 01 vì còn 12 chỗ",
    "08:00:11 - Chưa gửi đăng ký vì đang dùng dữ liệu mock",
];

export default function AutoRegisterPage({
    initialUser,
}: AutoRegisterPageProps) {
    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={initialUser}
                isUserLoading={false}
                onLoginClick={() => {
                    window.location.href = "/login";
                }}
            />

            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Tự động đăng ký
                    </h1>
                    <p className="text-sm text-slate-500">
                        Màn hình mô phỏng luồng hẹn giờ, ưu tiên học phần và
                        kiểm tra điều kiện trước khi gửi đăng ký.
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
                                    Mock data, chưa gọi API thật.
                                </p>
                            </div>
                            <button className="flex items-center gap-2 rounded bg-[#3f6ad8] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-blue-100">
                                <Play size={14} />
                                Chạy thử
                            </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {mockQueue.map((item) => (
                                <div
                                    key={item.code}
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
                                                Nhóm {item.group}
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
                                    <p className="text-2xl font-black">
                                        07:58
                                    </p>
                                    <p className="text-[10px] font-bold uppercase opacity-60">
                                        Đếm ngược
                                    </p>
                                </div>
                                <div className="bg-white/10 p-4 rounded-lg border border-white/10">
                                    <Gauge size={18} className="mb-3" />
                                    <p className="text-2xl font-black">42ms</p>
                                    <p className="text-[10px] font-bold uppercase opacity-60">
                                        Độ trễ mock
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-700">
                                    Điều kiện
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {[
                                    "Không trùng lịch hiện tại",
                                    "Không vượt giới hạn tín chỉ",
                                    "Ưu tiên nhóm còn chỗ",
                                ].map((item) => (
                                    <div
                                        key={item}
                                        className="flex items-center gap-2 text-xs font-bold text-slate-500"
                                    >
                                        <CheckCircle2
                                            size={15}
                                            className="text-emerald-500"
                                        />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-xl p-5 text-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} />
                                <h2 className="text-xs font-black uppercase tracking-widest">
                                    Log thử nghiệm
                                </h2>
                            </div>
                            <div className="space-y-2">
                                {mockLogs.map((log) => (
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

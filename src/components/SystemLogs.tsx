"use client";

import { History, Info } from "lucide-react";
import Card from "./Card";
import { useApp } from "@/providers/AppContext";

export default function SystemLogs() {
    const { logs } = useApp();

    return (
        <Card title="Nhật ký hệ thống" icon={History} color="#f7b924">
            <div className="p-4 space-y-4 max-h-75 overflow-y-auto">
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex gap-3 text-xs leading-relaxed animate-in slide-in-from-left-2 duration-300 text-left"
                        >
                            <span className="text-slate-400 font-mono shrink-0 font-bold">
                                [{log.time}]
                            </span>
                            <span
                                className={`font-semibold ${
                                    log.type === "error"
                                        ? "text-red-500"
                                        : log.type === "success"
                                          ? "text-emerald-600"
                                          : log.type === "warning"
                                            ? "text-amber-500"
                                            : "text-[#3f6ad8]"
                                }`}
                            >
                                {log.message}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <Info size={24} className="mx-auto text-slate-200 mb-2" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            Chưa có hoạt động
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

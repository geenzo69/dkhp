"use client";

import { History, Info } from "lucide-react";
import Card from "./Card";
import { useApp } from "@/providers/AppContext";

export default function SystemLogs() {
    const { logs } = useApp();

    return (
        <Card title="Nhật ký hệ thống" icon={History} color="#f7b924">
            <div className="p-4 space-y-4 max-h-75 overflow-y-auto mc-item-slot bg-black/60 m-4 border-none shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
                {logs.length > 0 ? (
                    logs.map((log) => (
                        <div
                            key={log.id}
                            className="flex gap-3 text-xs leading-relaxed text-left"
                        >
                            <span className="text-gray-400 font-minecraft shrink-0 mc-text-shadow">
                                [{log.time}]
                            </span>
                            <span
                                className={`font-minecraft mc-text-shadow ${
                                    log.type === "error"
                                        ? "text-mc-redstone"
                                        : log.type === "success"
                                          ? "text-mc-grass"
                                          : log.type === "warning"
                                            ? "text-mc-gold"
                                            : "text-mc-diamond"
                                }`}
                            >
                                {log.message}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <Info size={24} className="mx-auto text-gray-500 mb-2" />
                        <p className="text-[10px] font-minecraft text-gray-400 uppercase mc-text-shadow">
                            Chưa có hoạt động
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}

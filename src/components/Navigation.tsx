"use client";

import { CalendarDays, Home, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
    { href: "/", label: "Đăng ký học phần", icon: Home },
    { href: "/tkb", label: "Thời khóa biểu", icon: CalendarDays },
    { href: "/tu-dong-dang-ky", label: "Tự động đăng ký", icon: Zap }
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="flex gap-1 overflow-x-auto pb-3 lg:pb-0">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = pathname === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex h-10 shrink-0 items-center gap-2 rounded px-3 text-[10px] font-black uppercase tracking-wider transition-all ${
                            isActive
                                ? "bg-[#3f6ad8] text-white shadow-md shadow-blue-100"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                    >
                        <Icon size={15} />
                        <span>{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
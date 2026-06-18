"use client";

import { logout } from "@/app/login/actions/logout";
import User from "@/types/User";
import {
    CalendarDays,
    ChevronDown,
    FlaskConical,
    Home,
    LogOut,
    User as UserIcon,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header({
    user,
}: {
    user?: User
}) {
    const pathname = usePathname();
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const tabs = [
        { href: "/", label: "Đăng ký học phần", icon: Home },
        { href: "/tkb", label: "Thời khóa biểu", icon: CalendarDays },
        { href: "/tu-dong-dang-ky", label: "Tự động đăng ký", icon: Zap },
        { href: "/thu-nghiem", label: "Thử nghiệm", icon: FlaskConical },
    ];

    const renderAccount = () => {
        if (user) {
            return (
                <div className="relative flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold leading-none">
                            {user.sys_hoten}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            {user.sys_manguoidung}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Mở menu tài khoản"
                        aria-expanded={isAccountMenuOpen}
                        onClick={() =>
                            setIsAccountMenuOpen((isOpen) => !isOpen)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-transparent bg-slate-100 text-[#3f6ad8] transition-all hover:border-[#3f6ad8]"
                    >
                        <UserIcon size={20} />
                    </button>
                    <ChevronDown
                        size={14}
                        className={`hidden text-slate-400 transition-transform sm:block ${
                            isAccountMenuOpen ? "rotate-180" : ""
                        }`}
                    />

                    {isAccountMenuOpen && (
                        <div className="absolute right-0 top-12 z-50 w-44 rounded border border-slate-200 bg-white p-1 shadow-lg">
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                                >
                                    <LogOut size={15} />
                                    Đăng xuất
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <button
                onClick={() => {
                    window.location.href = "/login";
                }}
                className="bg-[#3f6ad8] hover:bg-[#3458b6] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
            >
                Đăng nhập
            </button>
        );
    };

    return (
        <header className="bg-white shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between px-4 md:px-6 z-30 sticky top-0 border-b">
            <div className="flex h-16 items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" height={32} width={32} />
                    <span className="font-black text-xl tracking-tighter text-[#3f6ad8]">
                        DKHP
                    </span>
                </div>

                <div className="flex lg:hidden">{renderAccount()}</div>
            </div>

            {
                user && (
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
                )
            }

            <div className="hidden lg:flex items-center gap-4">
                {renderAccount()}
            </div>
        </header>
    );
}

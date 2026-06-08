"use client";

import User from "@/types/User";
import {
    CalendarDays,
    FlaskConical,
    Home,
    User as UserIcon,
    Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({
    user,
}: {
    user?: User
}) {
    const pathname = usePathname();
    const tabs = [
        { href: "/", label: "Đăng ký học phần", icon: Home },
        { href: "/tkb", label: "Thời khóa biểu", icon: CalendarDays },
        { href: "/tu-dong-dang-ky", label: "Tự động đăng ký", icon: Zap },
        { href: "/thu-nghiem", label: "Thử nghiệm", icon: FlaskConical },
    ];

    const renderAccount = () => {
        // if (!isUserLoading) {
        //     return (
        //         <div className="flex items-center gap-3 animate-pulse">
        //             <div className="text-right hidden sm:block">
        //                 <div className="h-3 w-24 bg-slate-100 rounded mb-1"></div>
        //                 <div className="h-2 w-16 bg-slate-50 rounded ml-auto"></div>
        //             </div>
        //             <div className="w-10 h-10 rounded-full bg-slate-100"></div>
        //         </div>
        //     );
        // }

        if (user) {
            return (
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold leading-none">
                            {user.sys_hoten}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                            {user.sys_manguoidung}
                        </p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#3f6ad8] border-2 border-transparent hover:border-[#3f6ad8] transition-all">
                        <UserIcon size={20} />
                    </button>
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

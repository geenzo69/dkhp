"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { UserInfo } from "./Login";

interface HeaderProps {
    user: UserInfo | null;
    isUserLoading: boolean;
    onLoginClick: () => void;
}

export default function Header({
    user,
    isUserLoading,
    onLoginClick,
}: HeaderProps) {
    return (
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-6 z-30 sticky top-0 border-b">
            <div className="flex items-center gap-10">
                <div className="flex items-center gap-2">
                    <span className="font-black text-xl tracking-tighter text-slate-800">
                        CTU<span className="text-[#3f6ad8]">DKHP</span>
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isUserLoading ? (
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="text-right hidden sm:block">
                            <div className="h-3 w-24 bg-slate-100 rounded mb-1"></div>
                            <div className="h-2 w-16 bg-slate-50 rounded ml-auto"></div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                    </div>
                ) : user ? (
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-bold leading-none">
                                {user.sys_hoten}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">
                                {user.sys_manguoidung}
                            </p>
                        </div>
                        <div className="relative group">
                            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#3f6ad8] border-2 border-transparent group-hover:border-[#3f6ad8] transition-all">
                                <UserIcon size={20} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={onLoginClick}
                        className="bg-[#3f6ad8] hover:bg-[#3458b6] text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all shadow-md active:scale-95"
                    >
                        Đăng nhập
                    </button>
                )}
            </div>
        </header>
    );
}

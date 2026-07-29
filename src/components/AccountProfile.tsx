"use client";

import User from "@/types/User";
import { ChevronDown, LogOut, UserIcon } from "lucide-react";
import { useState } from "react";
import { logout } from "@/app/login/actions/logout";

export default function AccountProfile({
    user
}: {
    user?: User
}) {
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

    if (!user) {
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
    }

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
                className={`hidden text-slate-400 transition-transform sm:block ${isAccountMenuOpen ? "rotate-180" : ""
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
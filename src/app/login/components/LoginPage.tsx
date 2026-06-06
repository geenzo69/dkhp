"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/providers/AppContext";
import { useAction } from "next-safe-action/hooks";
import Login from "../actions/Login";

export default function LoginPage() {
    const router = useRouter();
    const { addLog, notify } = useApp();
    const [mssv, setMSSV] = useState("");
    const [password, setPassword] = useState("");

    const { isExecuting, execute } = useAction(Login, {
        onError: ({ error }) => {
            if (error.serverError) {
                notify(error.serverError, "error");
            } else if (error.validationErrors) {
                const messages = Object.values(error.validationErrors)
                    .flatMap((err: any) =>
                        Array.isArray(err) ? err : err?._errors ?? []
                    )
                    .join(", ");
                notify(messages || "Validation error!", "error");
            } else {
                notify("Đã có lỗi xảy ra", "error");
            }
        },
        onSuccess: ({ data }) => {
            addLog("Đăng nhập thành công!", "success");

            notify("Chào mừng bạn trở lại!", "success");
            router.push("/");
            router.refresh();
        }
    });

    return (
        <main className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex items-center justify-center px-6 py-10">
            <section className="w-full max-w-sm">
                <Link
                    href="/"
                    className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-[#3f6ad8]"
                >
                    <ArrowLeft size={16} />
                    Quay lại
                </Link>

                <div className="overflow-hidden rounded bg-white shadow-2xl border-t-8 border-[#3f6ad8]">
                    <div className="p-8">
                        <div className="mb-8 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-100 bg-blue-50 text-[#3f6ad8]">
                                <User size={24} />
                            </div>
                            <h1 className="text-lg font-black uppercase tracking-widest text-slate-800">
                                Đăng nhập
                            </h1>
                            <p className="mt-1 text-[10px] font-bold uppercase italic tracking-tighter text-slate-400">
                                Hệ thống thông tin sinh viên
                            </p>
                        </div>

                        <form className="space-y-5">
                            <div>
                                <label
                                    htmlFor="mssv"
                                    className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400"
                                >
                                    Mã số sinh viên
                                </label>
                                <input
                                    id="mssv"
                                    type="text"
                                    required
                                    autoFocus
                                    value={mssv}
                                    disabled={isExecuting}
                                    className="w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#3f6ad8] disabled:opacity-50"
                                    placeholder="Nhập MSSV..."
                                    onChange={(event) =>
                                        setMSSV(event.target.value.toUpperCase())
                                    }
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400"
                                >
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    disabled={isExecuting}
                                    className="w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-[#3f6ad8] disabled:opacity-50"
                                    placeholder="••••••••"
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                />
                            </div>

                            <button
                                disabled={isExecuting}
                                type="button"
                                onClick={() => execute({ mssv, password })}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-[#3f6ad8] py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#3458b6] disabled:cursor-wait disabled:opacity-70"
                            >
                                {isExecuting ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="animate-spin"
                                        />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    "Đăng nhập"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </main>
    );
}

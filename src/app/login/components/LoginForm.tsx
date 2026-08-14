"use client";

import { useApp } from "@/providers/AppContext";
import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Login from "../actions/Login";

export default function LoginForm() {
    const router = useRouter();
    const { addLog, notify } = useApp();
    const [mssv, setMssv] = useState("");
    const [password, setPassword] = useState("");

    const handleLoginError = ({ error }: any) => {
        if (error.serverError) {
            notify(error.serverError, "error");
        } else if (error.validationErrors) {
            const messages = Object.values(error.validationErrors)
                .flatMap((validationError: any) =>
                    Array.isArray(validationError)
                        ? validationError
                        : validationError?._errors ?? []
                )
                .join(", ");
            notify(messages || "Validation error!", "error");
        } else {
            notify("Đã có lỗi xảy ra", "error");
        }
    };

    const handleLoginSuccess = () => {
        addLog("Đăng nhập thành công!", "success");
        notify("Chào mừng bạn trở lại!", "success");
        router.push("/");
        router.refresh();
    };

    const { isExecuting, execute } = useAction(Login, {
        onError: handleLoginError,
        onSuccess: handleLoginSuccess,
    });

    return (
        <form
            className="space-y-5"
            onSubmit={(event) => {
                event.preventDefault();
                if (!isExecuting) {
                    execute({ mssv, password });
                }
            }}
        >
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
                    className="w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-[#3f6ad8] disabled:opacity-50"
                    placeholder="Nhập MSSV..."
                    onChange={(event) =>
                        setMssv(event.target.value.toUpperCase())
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
                    className="w-full rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-[#3f6ad8] disabled:opacity-50"
                    placeholder="••••••••"
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                />
            </div>

            <button
                disabled={isExecuting}
                type="submit"
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
    );
}
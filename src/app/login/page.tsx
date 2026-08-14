import { ArrowLeft, Link, User } from "lucide-react";
import LoginForm from "./components/LoginForm";

export default function Page() {
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

                        <LoginForm />
                    </div>
                </div>
            </section>
        </main>
    );
}

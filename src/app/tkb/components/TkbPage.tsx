"use client";

import Header from "@/components/Header";
import User from "@/types/User";
import { HocPhan } from "@/util/course";
import { useApp } from "@/providers/AppContext";
import Schedule from "./Schedule";

interface TkbPageProps {
    initialUser: User | null;
    initialCourses: HocPhan[] | null;
}

export default function TkbPage({ initialUser, initialCourses }: TkbPageProps) {
    const { plannedCourses } = useApp();

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={initialUser}
                isUserLoading={false}
                onLoginClick={() => {
                    window.location.href = "/login";
                }}
            />

            <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
                <div className="mb-6 flex flex-col gap-2">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        Thời khóa biểu
                    </h1>
                    <p className="text-sm text-slate-500">
                        Tổng hợp các học phần đã đăng ký và những lớp đang chọn.
                    </p>
                </div>

                <Schedule
                    registeredHP={plannedCourses}
                    apiRegisteredCourses={initialCourses}
                />
            </main>
        </div>
    );
}

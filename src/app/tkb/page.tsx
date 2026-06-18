import Header from "@/components/Header";
import Schedule from "./components/Schedule";
import { getUser } from "@/util/authentication";
import { redirect } from "next/navigation";

export default async function Page() {
    let user;

    try {
        user = await getUser();

        if (!user) {
            redirect("/login");
        }
    } catch(err) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-[#f1f4f6] text-slate-700 font-sans flex flex-col">
            <Header
                user={user || undefined}
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

                <Schedule />
            </main>
        </div>
        
    );
}

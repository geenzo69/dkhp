import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserInfo } from "@/util/authentication";
import Header from "@/components/Header";
import Schedule from "./components/Schedule";
import getCourses from "../actions/getCourses";

export default async function Page() {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;

    let user = null;
    let initialCourses = null;

    if (authToken) {
        try {
            const decoded = jwt.decode(authToken) as jwt.JwtPayload;
            if (decoded?.user_info) {
                user = await getUserInfo(decoded.user_info);
                if (user) {
                    initialCourses = await getCourses();
                }
            }
        } catch (error) {
            console.error("Error loading schedule page:", error);
        }
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

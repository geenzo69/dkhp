import { registerCourses } from "@/app/util/course";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { authToken, data } = body;

        if (!authToken || !data) {
            return NextResponse.json({ msg: "Thiếu thông tin đăng ký" }, { status: 400 });
        }

        // We need to bypass the cookie-based registerCourses if possible or pass the token manually
        // Let's modify registerCourses to accept a token explicitly or create a specialized version
        
        const res = await fetch("https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`
            },
            body: JSON.stringify({
                dkmh_tu_dien_hoat_dong_dao_tao_ma: "CQ",
                data: data
            })
        });

        const json = await res.json();
        
        // If CTU returns an error or message is not OK, return an error status
        // so that cron-job.org knows it failed and can retry
        if (!res.ok || json.msg !== "OK") {
            return NextResponse.json(json, { status: 500 });
        }

        return NextResponse.json(json);
    } catch (error: any) {
        return NextResponse.json({ msg: error.message || "Lỗi máy chủ" }, { status: 500 });
    }
}

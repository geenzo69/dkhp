"use server";

import action from "@/util/safe-action";
import { cookies } from "next/headers";
import z from "zod";

const registerCourse = action.inputSchema(z.array(z.object({
    dkmh_tu_dien_hoc_phan_ma: z.string(),
    dkmh_nhom_hoc_phan_ma: z.string()
}))).action(async ({ parsedInput }) => {
    const cookieStore = await cookies();

    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                dkmh_tu_dien_hoat_dong_dao_tao_ma: "CQ",
                data: parsedInput,
            }),
        },
    );

    if (!res.ok) {
        throw new Error("Đã có lỗi kết nối đến máy chủ");
    }

    const json = await res.json();

    if (json.msg != "OK") {
        throw new Error("Đăng ký thất bại");
    }

    return true;
});

export default registerCourse;
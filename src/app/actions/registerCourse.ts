"use server";

import { getUser, getValidDkhpToken } from "@/util/authentication";
import action from "@/util/safe-action";
import z from "zod";

const registerCourse = action.inputSchema(z.array(z.object({
    dkmh_tu_dien_hoc_phan_ma: z.string(),
    dkmh_nhom_hoc_phan_ma: z.string()
}))).action(async ({ parsedInput }) => {
    const dkmhToken = await getValidDkhpToken();

    if (!dkmhToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const user = await getUser(undefined, dkmhToken);

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${dkmhToken}`,
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
        throw new Error(json.msg);
    }

    return true;
});

export default registerCourse;

"use server";

import { getDkhpUser, getValidDkhpToken } from "@/util/authentication";
import action from "@/util/safe-action";
import z from "zod";

const registerCourse = action.inputSchema(z.array(z.object({
    dkmh_tu_dien_hoc_phan_ma: z.string(),
    dkmh_nhom_hoc_phan_ma: z.string(),
    isSwap: z.boolean().optional()
}))).action(async ({ parsedInput }) => {
    const dkmhToken = await getValidDkhpToken();

    if (!dkmhToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const user = getDkhpUser(dkmhToken);

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const registrations = parsedInput.filter((item) => !item.isSwap);
    const swaps = parsedInput.filter((item) => item.isSwap);

    // Register new courses
    if (registrations.length > 0) {
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
                    data: registrations.map((r) => ({
                        dkmh_tu_dien_hoc_phan_ma: r.dkmh_tu_dien_hoc_phan_ma,
                        dkmh_nhom_hoc_phan_ma: r.dkmh_nhom_hoc_phan_ma,
                    })),
                }),
            },
        );

        if (!res.ok) {
            throw new Error("Đã có lỗi kết nối đến máy chủ khi đăng ký học phần");
        }

        const json = await res.json();
        if (json.msg !== "OK") {
            throw new Error(json.msg);
        }
    }

    // Swap groups for already registered courses
    for (const swap of swaps) {
        const res = await fetch(
            "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/doinhomhocphan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dkmhToken}`,
                },
                body: JSON.stringify({
                    dkmh_tu_dien_hoc_phan_ma: swap.dkmh_tu_dien_hoc_phan_ma,
                    dkmh_nhom_hoc_phan_ma: swap.dkmh_nhom_hoc_phan_ma,
                }),
            },
        );

        if (res.status !== 200) {
            let errorMsg = "Đã có lỗi xảy ra hoặc lỗi kết nối đến máy chủ";
            try {
                const json = await res.json();
                errorMsg = json.msg || errorMsg;
            } catch {}
            throw new Error(`Đổi nhóm học phần ${swap.dkmh_tu_dien_hoc_phan_ma} thất bại: ${errorMsg}`);
        }
    }

    return true;
});

export default registerCourse;

"use server";

import { getDkhpTokenStatus, getUser } from "@/util/authentication";
import action from "@/util/safe-action";
import { createSchedule, getSchedule } from "@/util/schedule";
import { cookies } from "next/headers";
import z from "zod";

const createScheduleAction = action.inputSchema(z.object({
    data: z.array(z.object({
        dkmh_tu_dien_hoc_phan_ma: z.string(),
        dkmh_nhom_hoc_phan_ma: z.string()
    })),
    time: z.string(),
    useDkhpToken: z.boolean().optional()
})).action(async ({ parsedInput }) => {
    const { data, time, useDkhpToken } = parsedInput;
    const user = await getUser();
    const cookieStore = await cookies();
    
    const authToken = cookieStore.get("auth_token")?.value;

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const existing = await getSchedule();
    if (existing) {
        throw new Error("Lịch hẹn đăng ký học phần đã tồn tại! Vui lòng xóa lịch cũ trước.");
    }

    try {
        const dkhpTokenStatus = useDkhpToken ? await getDkhpTokenStatus() : undefined;
        const token = useDkhpToken ? dkhpTokenStatus?.token : authToken;

        if (!token) {
            throw new Error("Bạn phải đăng nhập!");
        }

        if (useDkhpToken && (!dkhpTokenStatus?.expiresAt || new Date(time).getTime() > dkhpTokenStatus.expiresAt)) {
            throw new Error("Thời gian đã chọn nằm ngoài thời hạn của dkhp_token.");
        }

        await createSchedule({
            token,
            tokenMode: useDkhpToken ? "dkhp" : "auth",
            label: user.sys_manguoidung,
            data: data,
            time: time
        });
    } catch(err: any) {
        throw new Error(err);
    }

    return true;
});

export default createScheduleAction;

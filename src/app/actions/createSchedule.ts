"use server";

import { getUser } from "@/util/authentication";
import action from "@/util/safe-action";
import { createSchedule } from "@/util/schedule";
import { cookies } from "next/headers";
import z from "zod";

const createScheduleAction = action.inputSchema(z.object({
    data: z.array(z.object({
        dkmh_tu_dien_hoc_phan_ma: z.string(),
        dkmh_nhom_hoc_phan_ma: z.string()
    })),
    time: z.string()
})).action(async ({ parsedInput }) => {
    const { data, time } = parsedInput;
    const user = await getUser();
    const cookieStore = await cookies();
    
    const authToken = cookieStore.get("auth_token")?.value;

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    try {
        await createSchedule({
            token: authToken,
            data: data,
            time: time
        });
    } catch(err: any) {
        throw new Error(err);
    }

    return true;
});

export default createScheduleAction;
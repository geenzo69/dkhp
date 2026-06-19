"use server";

import { getUser } from "@/util/authentication";
import action from "@/util/safe-action";
import { getSchedule } from "@/util/schedule";
import z from "zod";

const getScheduleAction = action.action(async ({ parsedInput }) => {
    const user = await getUser();

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const schedule = await getSchedule();

    if (!schedule) {
        return;
    }

    let body;

    try {
        body = JSON.parse(schedule.body || "");
    } catch(err: any) {
        throw new Error(err);
    }

    const data = body.data.data;
    const time = body.data.time;

    return {
        data,
        time
    }
});

export default getScheduleAction;
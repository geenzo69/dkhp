"use server";

import action from "@/util/safe-action";
import { deleteSchedule } from "@/util/schedule";

const deleteScheduleAction = action.action(async () => {
    try {
        await deleteSchedule();
        return true;
    } catch(err: any) {
        throw new Error(err.message || err);
    }
});

export default deleteScheduleAction;

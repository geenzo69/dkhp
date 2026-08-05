"use server";

import { getDkhpTokenStatus } from "@/util/authentication";
import action from "@/util/safe-action";

const getDkhpTokenStatusAction = action.action(async () => {
    const status = await getDkhpTokenStatus();

    return {
        hasToken: status.hasToken,
        expiresAt: status.expiresAt,
    };
});

export default getDkhpTokenStatusAction;

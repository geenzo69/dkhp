"use server";

import action from "@/util/safe-action";
import { getUser } from "@/util/authentication";

const getCurrentUser = action.action(async () => {
    const user = await getUser();
    return user || null;
});

export default getCurrentUser;

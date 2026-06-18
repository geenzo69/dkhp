"use server";

import action from "@/util/safe-action";
import {
    getSavedCredentials,
    getToken,
    setAuthCookie,
} from "@/util/authentication";

const reLogin = action.action(async () => {
    const credentials = await getSavedCredentials();

    if (!credentials) {
        throw new Error("Thông tin đăng nhập đã hết hạn hoặc không hợp lệ.");
    }

    const token = await getToken(credentials.mssv, credentials.password);
    await setAuthCookie(credentials.mssv, credentials.password, token);

    return true;
});

export default reLogin;

"use server";

import action from "@/util/safe-action";
import z from "zod";
import { getToken, setAuthCookie } from "@/util/authentication";

const Login = action.inputSchema(z.object({
    mssv: z.string(),
    password: z.string()
})).action(async ({ parsedInput }) => {
    const { mssv, password } = parsedInput;

    if (!mssv || !password) {
        throw new Error("Bạn phải cung cấp MSSV và mật khẩu!");
    }

    const token = await getToken(mssv, password);
    await setAuthCookie(mssv, password, token);

    return true;
});

export default Login;

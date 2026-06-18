"use server";

import action from "@/util/safe-action";
import z from "zod";
import jwt from "jsonwebtoken";
import zlib from "zlib";
import { cookies } from "next/headers";
import User from "@/types/User";
import { getToken } from "@/util/authentication";

const Login = action.inputSchema(z.object({
    mssv: z.string(),
    password: z.string()
})).action(async ({ parsedInput }) => {
    const { mssv, password } = parsedInput;

    if (!mssv || !password) {
        throw new Error("Bạn phải cung cấp MSSV và mật khẩu!");
    }

    const token = await getToken(mssv, password);

    try {
        const decoded = jwt.decode(token) as any;
        if (!decoded || !decoded.user_info) {
            throw new Error("Token trả về từ API hoặc web này đã lỗi thời!");
        }

        const buffer = Buffer.from(decoded.user_info, "base64");
        const decompressed = zlib.inflateSync(buffer);
        const userInfo = JSON.parse(decompressed.toString("utf-8")) as User;

        const cookieStore = await cookies();
        cookieStore.set("auth_token", token, {
            expires: new Date(decoded.exp * 1000),
            path: "/",
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return true;
    } catch (error) {
        console.error("Lỗi xử lý thông tin người dùng:", error);
        throw new Error("Đã có lỗi khi cố gắng lấy thông tin người dùng!");
    }
});

export default Login;
"use server";

import Course from "@/types/Course";
import action from "@/util/safe-action";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getUserInfo } from "@/util/authentication";

const getCourses = action.action(async ({ parsedInput }) => {
    const cookieStore = await cookies();

    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const decoded = jwt.decode(authToken) as jwt.JwtPayload;
    let user;
    if (decoded && decoded.user_info) {
        user = (await getUserInfo(decoded.user_info)) || undefined;
    }

    if (!user) {
        throw new Error("Cookie của bạn lỏ rồi!");
    }

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/hocphandadangky",
        {
            next: {
                revalidate: 60,
                tags: [`COURSES/${user.sys_manguoidung}`]
            },
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`,
            },
        },
    );

    if (!res.ok) return null;

    const json = await res.json();

    if (json.msg != "OK") {
        return null;
    }

    return json.data.data as Course[];
});

export default getCourses;
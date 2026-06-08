"use server";

import Course from "@/types/Course";
import action from "@/util/safe-action";
import { cookies } from "next/headers";

const getCourses = action.action(async ({ parsedInput }) => {
    const cookieStore = await cookies();

    const authToken = cookieStore.get("auth_token")?.value;

    if (!authToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/hocphandadangky",
        {
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
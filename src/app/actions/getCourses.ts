"use server";

import Course from "@/types/Course";
import action from "@/util/safe-action";
import { getDKMHToken, getUser } from "@/util/authentication";
import { cookies } from "next/headers";

const getCourses = action.action(async () => {
    const user = await getUser();

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const dkmhToken = await getDKMHToken();

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/hocphandadangky",
        {
            next: {
                revalidate: 60,
                tags: [`COURSES/${user.sys_manguoidung}`]
            },
            method: "POST",
            headers: {
                Authorization: `Bearer ${dkmhToken}`,
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
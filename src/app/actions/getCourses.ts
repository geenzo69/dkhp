"use server";

import Course from "@/types/Course";
import action from "@/util/safe-action";
import { getUser, getValidDkhpToken } from "@/util/authentication";

const getCourses = action.action(async () => {
    const dkmhToken = await getValidDkhpToken();

    if (!dkmhToken) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const user = await getUser(undefined, dkmhToken);

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const res = await fetch(
        "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/hocphandadangky",
        {
            cache: "no-store",
            method: "POST",
            headers: {
                Authorization: `Bearer ${dkmhToken}`,
            },
        },
    );

    let data;
    try {
        data = await res.json();
    } catch(err) {
        console.error(err);
        throw new Error("Lỗi khi xử lý dữ liệu từ máy chủ!");
    }

    if (data.msg != "OK") {
        throw new Error(data.msg);
    }

    return data.data.data as Course[];
});

export default getCourses;

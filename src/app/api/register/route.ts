import { getToken, getUser } from "@/util/authentication";
import { decode, JwtPayload, verify } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { sendReportEmail, CourseResult } from "@/util/email";
import User from "@/types/User";
import zlib from "zlib";

const secret = process.env.DKHP_SECRET || "";

interface RegisterRequestBody {
    dkmh_tu_dien_hoat_dong_dao_tao_ma?: string;
    data?: {
        token?: string;
        tokenMode?: "auth" | "dkhp";
        data?: {
            dkmh_tu_dien_hoc_phan_ma: string;
            dkmh_nhom_hoc_phan_ma: string;
        }[];
        time?: string;
    };
}

export async function POST(request: Request) {
    let mssv;
    let registrationData: { dkmh_tu_dien_hoc_phan_ma: string; dkmh_nhom_hoc_phan_ma: string }[] = [];
    let scheduleData: any = null;
    let authToken: string | undefined = undefined;
    let dkmhToken: string | undefined = undefined;
    let user: User | undefined;

    try {
        let body: RegisterRequestBody;
        try {
            body = (await request.json()) as RegisterRequestBody;
            scheduleData = body.data;
            registrationData = scheduleData?.data || [];
        } catch (e) {
            return NextResponse.json(
                { msg: "Định dạng JSON yêu cầu không hợp lệ" },
                { status: 400 },
            );
        }

        const scheduleToken = scheduleData?.token;
        const tokenMode = scheduleData?.tokenMode === "dkhp" ? "dkhp" : "auth";

        if (!scheduleToken || !registrationData?.length) {
            return NextResponse.json(
                { msg: "Thiếu thông tin đăng ký" },
                { status: 400 },
            );
        }

        if (tokenMode === "dkhp") {
            const scheduledDkmhToken = scheduleToken;
            dkmhToken = scheduledDkmhToken;
            if (!isDkmhTokenValid(scheduledDkmhToken)) {
                throw new Error("dkhp_token đã hết hạn");
            }

            user = getUserFromDkmhToken(scheduledDkmhToken);
            if (user) {
                mssv = user.sys_manguoidung;
            }
        } else {
            const scheduledAuthToken = scheduleToken;
            authToken = scheduledAuthToken;

            try {
                const payload = decode(scheduledAuthToken) as JwtPayload;
                if (payload?.mssv) {
                    mssv = payload.mssv;
                }
            } catch {}

            const tokenData = await getValidDkmhToken(scheduledAuthToken);
            const refreshedDkmhToken = tokenData.dkmhToken;
            dkmhToken = refreshedDkmhToken;
            mssv = tokenData.mssv;

            try {
                user = await getUser(scheduledAuthToken, refreshedDkmhToken);
            } catch {}

            if (!user) {
                user = getUserFromDkmhToken(refreshedDkmhToken);
            }
        }

        if (!user) {
            return NextResponse.json(
                { msg: "Không thể lấy thông tin sinh viên" },
                { status: 401 },
            );
        }

        if (!dkmhToken) {
            return NextResponse.json(
                { msg: "Thiếu token đăng ký học phần" },
                { status: 400 },
            );
        }

        const registrationDkmhToken = dkmhToken;

        const res = await fetch(
            "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${registrationDkmhToken}`,
                },
                body: JSON.stringify({
                    dkmh_tu_dien_hoat_dong_dao_tao_ma:
                        body.dkmh_tu_dien_hoat_dong_dao_tao_ma || "CQ",
                    data: registrationData,
                }),
            },
        );

        const json = await res.json();

        const resultDataList = Array.isArray(json.data) ? json.data : [];
        const resultMap = new Map<string, { trang_thai: string; ly_do?: string }>();
        resultDataList.forEach((item: any) => {
            if (item?.dkmh_tu_dien_hoc_phan_ma) {
                resultMap.set(item.dkmh_tu_dien_hoc_phan_ma, {
                    trang_thai: item.trang_thai,
                    ly_do: item.ly_do
                });
            }
        });

        const detailedResults: CourseResult[] = registrationData.map((item) => {
            const resItem = resultMap.get(item.dkmh_tu_dien_hoc_phan_ma);
            return {
                ma_hp: item.dkmh_tu_dien_hoc_phan_ma,
                nhom_hp: item.dkmh_nhom_hoc_phan_ma,
                trang_thai: resItem?.trang_thai || "fail",
                ly_do: resItem?.ly_do
            };
        });

        if (!res.ok || json.msg !== "OK") {
            const errorMsg = json.msg || "Lỗi đăng ký học phần";
            const failedResults = detailedResults.map(r => ({
                ...r,
                trang_thai: r.trang_thai === "success" ? "success" : "fail",
                ly_do: r.ly_do || errorMsg
            }));
            try {
                await sendReportEmail(user, failedResults, errorMsg);
            } catch (mailErr) {
                console.error("Lỗi gửi mail báo thất bại:", mailErr);
            }
            return NextResponse.json(json, { status: 500 });
        }

        revalidateTag(`COURSES/${mssv}`, {
            expire: 3600
        });

        try {
            await sendReportEmail(user, detailedResults, undefined);
        } catch (mailErr) {
            console.error("Lỗi gửi mail báo thành công:", mailErr);
        }

        return NextResponse.json(json);
    } catch (error: any) {
        const errorMsg = error.message || "Lỗi máy chủ không xác định";

        if (mssv && mssv !== "sinhvien" && registrationData.length > 0) {
            if (!user && authToken) {
                try {
                    user = await getUser(authToken);
                } catch {}
            }
            const failedResults: CourseResult[] = registrationData.map((item) => ({
                ma_hp: item.dkmh_tu_dien_hoc_phan_ma,
                nhom_hp: item.dkmh_nhom_hoc_phan_ma,
                trang_thai: "fail",
                ly_do: errorMsg
            }));
            if (user) {
                try {
                    await sendReportEmail(user, failedResults, errorMsg);
                } catch (mailErr) {
                    console.error("Lỗi gửi mail báo lỗi hệ thống:", mailErr);
                }
            }
        }

        return NextResponse.json(
            { msg: errorMsg },
            { status: 500 },
        );
    }
}

async function getValidDkmhToken(authToken: string) {
    const payload = verify(authToken, secret, {
        algorithms: ["HS256"],
        ignoreExpiration: true,
    }) as JwtPayload;

    if (
        typeof payload.mssv !== "string" ||
        typeof payload.password !== "string"
    ) {
        throw new Error("Token đăng ký không hợp lệ");
    }

    const mssv = payload.mssv;
    const password = Buffer.from(payload.password, "base64").toString("utf-8");

    revalidateTag(`user/${mssv}/${password}`, {
        expire: 3600
    });
    const refreshedDkmhToken = await getToken(mssv, password);

    return {
        dkmhToken: refreshedDkmhToken,
        mssv,
    };
}

function getUserFromDkmhToken(dkmhToken: string) {
    const decodedToken = decode(dkmhToken) as JwtPayload | null;

    if (!decodedToken || typeof decodedToken.user_info !== "string") {
        return;
    }

    const buffer = Buffer.from(decodedToken.user_info.trim(), "base64");
    const decompressed = zlib.inflateSync(buffer);

    return JSON.parse(decompressed.toString("utf-8")) as User;
}

function isDkmhTokenValid(dkmhToken: string) {
    const decodedToken = decode(dkmhToken) as JwtPayload | null;

    return !!decodedToken?.exp && Date.now() < decodedToken.exp * 1000;
}

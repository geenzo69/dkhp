import { generateToken, getToken } from "@/util/authentication";
import { decode, JwtPayload, verify } from "jsonwebtoken";
import { updateTag } from "next/cache";
import { NextResponse } from "next/server";

const secret = process.env.DKHP_SECRET || "";

interface RegisterRequestBody {
    dkmh_tu_dien_hoat_dong_dao_tao_ma?: string;
    data?: {
        token?: string;
        data?: {
            dkmh_tu_dien_hoc_phan_ma: string;
            dkmh_nhom_hoc_phan_ma: string;
        }[];
        time?: string;
    };
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as RegisterRequestBody;
        const scheduleData = body.data;
        const authToken = scheduleData?.token;
        const registrationData = scheduleData?.data;

        if (!authToken || !registrationData?.length) {
            return NextResponse.json(
                { msg: "Thiếu thông tin đăng ký" },
                { status: 400 },
            );
        }

        const { dkmhToken, mssv } = await getValidDkmhToken(authToken);

        const res = await fetch(
            "https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${dkmhToken}`,
                },
                body: JSON.stringify({
                    dkmh_tu_dien_hoat_dong_dao_tao_ma:
                        body.dkmh_tu_dien_hoat_dong_dao_tao_ma || "CQ",
                    data: registrationData,
                }),
            },
        );

        const json = await res.json();

        if (!res.ok || json.msg !== "OK") {
            return NextResponse.json(json, { status: 500 });
        }

        updateTag(`COURSES/${mssv}`);

        return NextResponse.json(json);
    } catch (error: any) {
        return NextResponse.json(
            { msg: error.message || "Lỗi máy chủ" },
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
        typeof payload.password !== "string" ||
        typeof payload.token !== "string"
    ) {
        throw new Error("Token đăng ký không hợp lệ");
    }

    const mssv = payload.mssv;
    const password = Buffer.from(payload.password, "base64").toString("utf-8");

    if (isJwtPayloadValid(payload) && isDkmhTokenValid(payload.token)) {
        return {
            dkmhToken: payload.token,
            mssv,
        };
    }

    updateTag(`user/${mssv}/${password}`);
    const refreshedDkmhToken = await getToken(mssv, password);
    generateToken(mssv, password, refreshedDkmhToken);

    return {
        dkmhToken: refreshedDkmhToken,
        mssv,
    };
}

function isDkmhTokenValid(dkmhToken: string) {
    const decodedToken = decode(dkmhToken) as JwtPayload | null;

    return isJwtPayloadValid(decodedToken);
}

function isJwtPayloadValid(payload: JwtPayload | null) {
    if (!payload?.exp) {
        return false;
    }

    return Date.now() < payload.exp * 1000;
}

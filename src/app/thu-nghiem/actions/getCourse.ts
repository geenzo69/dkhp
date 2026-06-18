"use server";

import action from "@/util/safe-action";
import z from "zod";
import { cookies } from "next/headers";
import { getDKMHToken, getUser } from "@/util/authentication";

const getCourse = action.inputSchema(z.object({
    id: z.string()
})).action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    const user = await getUser();

    if (!user) {
        throw new Error("Bạn phải đăng nhập!");
    }

    const dkmhToken = await getDKMHToken();

    if (!id) {
        throw new Error("Bạn phải cung cấp mã học phần!");
    }

    const date = new Date();

    const maxNam = date.getMonth() > 7 ? date.getFullYear() : date.getFullYear() - 1;

    try {
        const data = await get(maxNam - 1, 1, id, dkmhToken);

        return data;
    } catch(err: any) {
        throw new Error(err.message);
    }
});

async function get(nam: number, hk: number, id: string, authToken: string, data?: {
    maHocPhan: string,
    tenHocPhan: string,
    soTinChi: number,
    lichHoc: string[][]
}) {
    const date = new Date();

    const maxNam = date.getMonth() > 7 ? date.getFullYear() : date.getFullYear() - 1;

    if (nam > maxNam) {
        return data;
    }

    const res = await fetch(`https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/danhmuchocphan?dkmh_tu_dien_nien_khoa_nam_hoc=${nam}&dkmh_tu_dien_hoc_ky_ma=${hk}&dkmh_tu_dien_hoc_phan_ma=${id}`, {
        next: {
            revalidate: 3600
        },
        headers: {
            Authorization: `Bearer ${authToken}`
        }
    });

    if (!res.ok) {
        throw new Error("Đã có lỗi trong khi lấy dữ liệu!");
    }

    try {
        const json = await res.json();

        if (!json.data.hoc_phan_info) {
            throw new Error("Học phần này không tồn tại");
        }

        const current = Object.values(
            (json.data.data as any[]).reduce<Record<string, string[]>>((acc, item) => {
                const rawKey = item.dkmh_nhom_hoc_phan_ma;
                const parsedKey = Number(rawKey);
        
                if (!Number.isInteger(parsedKey) || item.dkmh_thu_trong_tuan_ma == 0) {
                    return acc;
                }
        
                const key = String(rawKey);
        
                acc[key] ??= [];
                acc[key].push(`${item.dkmh_thu_trong_tuan_ma}/${item.tiet_hoc}`);
        
                return acc;
            }, {})
        );
        const existed = new Set((data?.lichHoc || []).map(item => JSON.stringify(item)));

        return get(hk == 3 ? nam + 1 : nam, hk == 3 ? 1 : hk + 1, id, authToken, {
            maHocPhan: id,
            tenHocPhan: data?.tenHocPhan || json.data.hoc_phan_info.dkmh_tu_dien_hoc_phan_ten_vn,
            soTinChi: data?.soTinChi || json.data.hoc_phan_info.dkmh_tu_dien_hoc_phan_so_tin_chi,
            lichHoc: [
                ...data?.lichHoc || [],
                ...current.filter(item => {
                    const key = JSON.stringify(item);
    
                    if (existed.has(key)) return false;
    
                    existed.add(key);
                    return true;
                }),
            ]
        });
    } catch (err) {
        console.log(err)
        throw new Error("Máy chủ trả về dữ liệu không hợp lệ!");
    }
}

export default getCourse;
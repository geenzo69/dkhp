"use server";

import { cookies } from "next/headers";

export interface LopHocPhan {
    key: string;
    dkmh_tu_dien_lop_hoc_phan_si_so: number;
    dkmh_tu_dien_lop_hoc_phan_si_so_con_lai: number;
    dkmh_tu_dien_hoc_phan_ten_vn: string;
    dkmh_nhom_hoc_phan_ma: string;
    dkmh_tu_dien_hoc_phan_so_tin_chi: number;
    tuan_hoc: number[];
    dkmh_tu_dien_lop_hoc_phan_tkb: string;
    dkmh_tu_dien_lop_hoc_phan_lop_ma: string;
    trang_thai_thao_tac: {
      disabled_chon_nhom: number;
      cho_phep_dang_ky: number;
      trang_thai: string;
    };
    data: LichHoc[];
}

export interface LichHoc {
    key: string;
    dkmh_tu_dien_hoc_phan_ma: string;
    dkmh_thu_trong_tuan_ma: number;
    tuan_hoc: number[];
    dkmh_tu_dien_tiet_hoc_stt: number;
    tiet_hoc: string;
    gv: GiangVien[];
    dkmh_tu_dien_phong_hoc_ten: string;
}

export interface GiangVien {
    dkmh_tu_dien_giang_vien_ten_vn: string;
    dkmh_tu_dien_giang_vien_email: string;
}

export interface NhomHocPhanOption {
    value: string;
    label: string;
    tkb: string;
}

export interface ThongTinGiangVienNhom {
    [key: string]: GiangVien[];
}

export interface HocPhan {
    key: number;
    dkmh_tu_dien_hoc_phan_ma: string;
    dkmh_tu_dien_hoc_phan_ten_vn: string;
    dkmh_nhom_hoc_phan_ma: string | null;
    dkmh_tu_dien_hoc_phan_so_tin_chi: number;
    dkmh_tu_dien_lop_hoc_phan_tkb: string | null;
    dkmh_tu_dien_giang_vien_ten_vn: string | null;
    dkmh_tu_dien_giang_vien_email: string | null;
    dkmh_tu_dien_hoc_phan_ma_bac_dao_tao: string;
    trang_thai_dang_ky: number;
    dang_ky_du_phong: number;
    cho_phep_trung_lich: number;
    trang_thai_dang_ky_du_phong: number;
    cho_phep_dang_ky_du_phong: number;
    thuoc_khht: number;
    dkmh_rut_hoc_phan: string | null;
    khong_dang_ky_hoc_phan: number;
    thong_tin_giang_vien: ThongTinGiangVienNhom;
    nhom_hp: NhomHocPhanOption[];
    data_nhom_hp: LopHocPhan[];
}

export async function getCourses() {
    const Cookies = await cookies();

    if (!Cookies.get("auth_token")?.value) return;

    const res = await fetch("https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/hocphandadangky", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${Cookies.get("auth_token")?.value}`
        }
    });

    if (!res.ok) return null;

    const json = await res.json();

    if (json.msg != "OK") {
        return null;
    }

    return json.data.data as HocPhan[];
}

export async function registerCourses(data: { dkmh_tu_dien_hoc_phan_ma: string, dkmh_nhom_hoc_phan_ma: string }[]) {
    const Cookies = await cookies();
    const token = Cookies.get("auth_token")?.value;

    if (!token) return { success: false, msg: "Phiên đăng nhập hết hạn" };

    const res = await fetch("https://dkmhback.ctu.edu.vn/api/v1/dangkyhocphan/sinhvien/dangkyhocphan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            dkmh_tu_dien_hoat_dong_dao_tao_ma: "CQ",
            data: data
        })
    });

    if (!res.ok) return { success: false, msg: "Đã có lỗi kết nối đến máy chủ" };

    const json = await res.json();

    if (json.msg !== "OK") {
        return { success: false, msg: json.msg || "Đăng ký thất bại" };
    }

    return { success: true, msg: "Đăng ký thành công" };
}
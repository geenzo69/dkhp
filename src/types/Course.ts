import Lecturer from "./Lecturer";
import LopHocPhan from "./LopHocPhan";

export default interface Course {
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
    thong_tin_giang_vien: {
        [key: string]: Lecturer[];
    };
    nhom_hp: {
        value: string;
        label: string;
        tkb: string;
    }[];
    data_nhom_hp: LopHocPhan[];
}
import Lecturer from "./Lecturer";

export default interface LopHocPhan {
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
    data: {
        key: string;
        dkmh_tu_dien_hoc_phan_ma: string;
        dkmh_thu_trong_tuan_ma: number;
        tuan_hoc: number[];
        dkmh_tu_dien_tiet_hoc_stt: number;
        tiet_hoc: string;
        gv: Lecturer[];
        dkmh_tu_dien_phong_hoc_ten: string;
    }[];
}
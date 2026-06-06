export default interface User {
    sys_manguoidung: string;
    sys_hoten: string;
    sys_malop: string;
    sys_hiendien: string | null;
    sys_mahedt: string;
    sys_khoahoc: number;
    sys_namhocvao: number;
    sys_manganh: string;
    sys_tennganh: string;
    sys_madonvi: string;
    sys_tendonvi: string;
    sys_namhocht: number;
    sys_hockyht: number;
    sys_sotuanhk: number;
    sys_hoatdongdaotao: string;
    sys_sohockydaotao: number;
    sys_tcmaxhockychinh: number;
    sys_tcmaxhockyhe: number;
    sys_tcmaxhockychinh_hockycuoi: number;
    sys_tcmaxhockyhe_hockycuoi: number;
    sys_sotinchidat: number;
    sys_ngaysinh: string;
    sys_gioitinh: string;
    sys_email: string;
    sys_makhoi: string;
    permission_level: number;
}
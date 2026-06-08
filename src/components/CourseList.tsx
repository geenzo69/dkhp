"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Calendar } from "lucide-react";
import Card from "./Card";
import RegistrationModal from "./RegistrationModal";
import { useAction } from "next-safe-action/hooks";
import { useApp } from "@/providers/AppContext";
import getCourses from "@/app/actions/getCourses";
import CourseItem from "./CourseItem";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";

export default function CourseList() {
    const { notify, addLog, setPlannedCourses, plannedCourses, courses, setCourses } = useApp();
    const [searchTerm, setSearchTerm] = useState("");

    const { execute, isExecuting } = useAction(getCourses, {
        onError: ({ error }) => {
            if (error.serverError) {
                notify(error.serverError, "error");
            } else if (error.validationErrors) {
                const messages = Object.values(error.validationErrors)
                    .flatMap((err: any) =>
                        Array.isArray(err) ? err : err?._errors ?? []
                    )
                    .join(", ");
                notify(messages || "Validation error!", "error");
            } else {
                notify("Đã có lỗi xảy ra", "error");
            }
        },
        onSuccess: ({ data }) => {
            if (!data) {
                return;
            }

            setCourses(data);
        }
    });

    const filteredCourses = courses
        ? courses.filter(
            (c) =>
                c.dkmh_tu_dien_hoc_phan_ten_vn
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                c.dkmh_tu_dien_hoc_phan_ma
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()),
        )
        : [];
    const [selectedCourseForModal, setSelectedCourseForModal] =
        useState<Course | null>(null);
    const skeletonRows = Array.from({ length: 5 });

    useEffect(() => {
        execute()
    }, []);

    const handleConfirmRegistration = (group: LopHocPhan) => {
        if (!selectedCourseForModal) return;
    
        const conflict = plannedCourses.find(
            (r) =>
                r.group.dkmh_tu_dien_lop_hoc_phan_tkb ===
                group.dkmh_tu_dien_lop_hoc_phan_tkb,
        );
        if (conflict) {
            addLog(
                `Trùng lịch: ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} vs ${conflict.course.dkmh_tu_dien_hoc_phan_ten_vn}`,
                "error",
            );
            notify(
                `Lịch học đã bị trùng với môn ${conflict.course.dkmh_tu_dien_hoc_phan_ten_vn}!`,
                "error",
            );
            return;
        }
    
        setPlannedCourses([
            ...plannedCourses,
            { course: selectedCourseForModal, group },
        ]);
        addLog(
            `Đã đăng ký: ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} (Nhóm ${group.dkmh_nhom_hoc_phan_ma})`,
            "info",
        );
        notify(
            `Đã chọn học phần ${selectedCourseForModal.dkmh_tu_dien_hoc_phan_ten_vn} thành công!`,
            "success",
        );
        setSelectedCourseForModal(null);
    };

    return (
        <div className="xl:col-span-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        Đăng ký học phần
                    </h2>
                </div>
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm môn học..."
                        className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded shadow-sm text-sm w-full md:w-64 focus:ring-2 focus:ring-[#3f6ad8] focus:border-transparent outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card title="Danh sách học phần mở" icon={Calendar}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Học phần
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Chi tiết lịch
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Sĩ số
                                </th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">
                                    Lựa chọn
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative" aria-busy={isExecuting}>
                            {isExecuting
                                ? skeletonRows.map((_, index) => (
                                    <tr key={`course-skeleton-${index}`} className="animate-pulse">
                                        <td className="px-6 py-5">
                                            <div className="h-4 w-48 rounded bg-slate-200 mb-2"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-20 rounded bg-slate-100 border border-slate-100"></div>
                                                <div className="h-3 w-14 rounded bg-blue-100"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                                                <div className="h-3 w-36 rounded bg-slate-200"></div>
                                            </div>
                                            <div className="h-3 w-28 rounded bg-blue-100 mt-2"></div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 rounded-full bg-slate-200"></div>
                                                <div className="h-3 w-9 rounded bg-slate-200"></div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-end">
                                                <div className="h-9 w-24 rounded bg-slate-200"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                : filteredCourses.map((course) => <CourseItem key={course.key} setSelectedCourseForModal={setSelectedCourseForModal} course={course} />)}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedCourseForModal && (
                <RegistrationModal
                    course={selectedCourseForModal}
                    onClose={() => setSelectedCourseForModal(null)}
                    onConfirm={handleConfirmRegistration}
                />
            )}
        </div>
    );
}

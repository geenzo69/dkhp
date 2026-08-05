"use client";

import { useState } from "react";
import { Search, Calendar, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import Card from "./Card";
import RegistrationModal from "./RegistrationModal";
import ScheduleGeneratorModal from "./ScheduleGeneratorModal";
import { useApp } from "@/providers/AppContext";
import CourseItem from "./CourseItem";
import CourseItemMobile from "./CourseItemMobile";
import Course from "@/types/Course";
import LopHocPhan from "@/types/LopHocPhan";
import { checkTkbConflict } from "@/util/format";

export default function CourseList() {
    const { notify, addLog, setPlannedCourses, plannedCourses, courses, isLoadingCourses } = useApp();
    const [searchTerm, setSearchTerm] = useState("");
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

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
    const selectedCourseCode =
        selectedCourseForModal?.dkmh_tu_dien_hoc_phan_ma;
    const latestSelectedCourseForModal = selectedCourseCode
        ? courses.find(
            (course) =>
                course.dkmh_tu_dien_hoc_phan_ma === selectedCourseCode,
        ) || selectedCourseForModal
        : null;
    const skeletonRows = Array.from({ length: 5 });

    const handleConfirmRegistration = (group: LopHocPhan) => {
        if (!latestSelectedCourseForModal) return;

        const selectedCourse = latestSelectedCourseForModal;
    
        let conflictCourse: Course | undefined;

        const plannedConflict = plannedCourses.find(
            (r) =>
                r.course.dkmh_tu_dien_hoc_phan_ma !== selectedCourse.dkmh_tu_dien_hoc_phan_ma &&
                checkTkbConflict(r.group.dkmh_tu_dien_lop_hoc_phan_tkb, group.dkmh_tu_dien_lop_hoc_phan_tkb)
        );
        if (plannedConflict) {
            conflictCourse = plannedConflict.course;
        } else {
            const registeredConflict = courses.find(
                (c) =>
                    c.trang_thai_dang_ky === 1 &&
                    c.dkmh_tu_dien_hoc_phan_ma !== selectedCourse.dkmh_tu_dien_hoc_phan_ma &&
                    checkTkbConflict(c.dkmh_tu_dien_lop_hoc_phan_tkb, group.dkmh_tu_dien_lop_hoc_phan_tkb)
            );
            if (registeredConflict) {
                conflictCourse = registeredConflict;
            }
        }

        if (conflictCourse) {
            addLog(
                `Trùng lịch: ${selectedCourse.dkmh_tu_dien_hoc_phan_ten_vn} vs ${conflictCourse.dkmh_tu_dien_hoc_phan_ten_vn}`,
                "error",
            );
            notify(
                `Lịch học đã bị trùng với môn ${conflictCourse.dkmh_tu_dien_hoc_phan_ten_vn}!`,
                "error",
            );
            return;
        }
    
        const existingIndex = plannedCourses.findIndex(
            (r) => r.course.dkmh_tu_dien_hoc_phan_ma === selectedCourse.dkmh_tu_dien_hoc_phan_ma
        );

        let newPlannedCourses;
        const isEdit = existingIndex > -1;
        if (isEdit) {
            newPlannedCourses = [...plannedCourses];
            newPlannedCourses[existingIndex] = { course: selectedCourse, group };
        } else {
            newPlannedCourses = [
                ...plannedCourses,
                { course: selectedCourse, group },
            ];
        }

        setPlannedCourses(newPlannedCourses);
        addLog(
            isEdit
                ? `Đã đổi sang Nhóm ${group.dkmh_nhom_hoc_phan_ma}: ${selectedCourse.dkmh_tu_dien_hoc_phan_ten_vn}`
                : `Đã đăng ký: ${selectedCourse.dkmh_tu_dien_hoc_phan_ten_vn} (Nhóm ${group.dkmh_nhom_hoc_phan_ma})`,
            "info",
        );
        notify(
            isEdit
                ? `Đã đổi sang nhóm ${group.dkmh_nhom_hoc_phan_ma} thành công!`
                : `Đã chọn học phần ${selectedCourse.dkmh_tu_dien_hoc_phan_ten_vn} thành công!`,
            "success",
        );
        setSelectedCourseForModal(null);
    };

    return (
        <div className="xl:col-span-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800">
                        Đăng ký học phần
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                        {filteredCourses.length} học phần khả dụng
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full md:w-auto">
                    <button
                        onClick={() => setIsGeneratorOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg bg-[#3f6ad8] px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-sm shadow-blue-100 transition-all hover:bg-[#3458b6] active:scale-95 cursor-pointer"
                    >
                        <Sparkles size={12} />
                        Xếp TKB tự động
                    </button>
                    <div className="relative w-full md:w-80">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                        />
                        <input
                            type="text"
                            placeholder="Tìm kiếm môn học..."
                            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all placeholder:text-slate-300 focus:border-transparent focus:ring-2 focus:ring-[#3f6ad8]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card title="Danh sách học phần mở" icon={Calendar}>
                <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span className="inline-flex items-center gap-2">
                            <BookOpen size={14} />
                            Danh sách môn
                        </span>
                        <span className="inline-flex items-center gap-2">
                            <CheckCircle2 size={14} />
                            Đã chọn: {plannedCourses.length}
                        </span>
                    </div>
                </div>

                {/* DESKTOP VIEW */}
                <div className="hidden md:block overflow-x-auto bg-slate-50/30 p-3">
                    <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left">
                        <thead>
                            <tr>
                                <th className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Học phần
                                </th>
                                <th className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Chi tiết lịch
                                </th>
                                <th className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Sĩ số
                                </th>
                                <th className="px-5 py-2 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    Lựa chọn
                                </th>
                            </tr>
                        </thead>
                        <tbody className="relative" aria-busy={isLoadingCourses}>
                            {isLoadingCourses
                                ? skeletonRows.map((_, index) => (
                                    <tr key={`course-skeleton-desktop-${index}`} className="animate-pulse">
                                        <td className="rounded-l-lg bg-white px-5 py-5">
                                            <div className="h-4 w-48 rounded bg-slate-200 mb-2"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-20 rounded bg-slate-100 border border-slate-100"></div>
                                                <div className="h-3 w-14 rounded bg-blue-100"></div>
                                            </div>
                                        </td>
                                        <td className="bg-white px-5 py-5">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-3 w-3 rounded-full bg-slate-200"></div>
                                                <div className="h-3 w-36 rounded bg-slate-200"></div>
                                            </div>
                                            <div className="h-3 w-28 rounded bg-blue-100 mt-2"></div>
                                        </td>
                                        <td className="bg-white px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-1.5 w-16 rounded-full bg-slate-200"></div>
                                                <div className="h-3 w-9 rounded bg-slate-200"></div>
                                            </div>
                                        </td>
                                        <td className="rounded-r-lg bg-white px-5 py-5">
                                            <div className="flex items-center justify-end">
                                                <div className="h-9 w-24 rounded bg-slate-200"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                                : filteredCourses.map((course) => (
                                    <CourseItem
                                        key={course.key}
                                        setSelectedCourseForModal={setSelectedCourseForModal}
                                        course={course}
                                    />
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE VIEW */}
                <div className="block md:hidden bg-slate-50/30 p-3 space-y-4">
                    {isLoadingCourses
                        ? skeletonRows.map((_, index) => (
                            <div key={`course-skeleton-mobile-${index}`} className="animate-pulse rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-slate-200 shrink-0"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-3/4 rounded bg-slate-200 mb-2"></div>
                                        <div className="flex gap-2">
                                            <div className="h-5 w-16 rounded bg-slate-100 border border-slate-100"></div>
                                            <div className="h-5 w-14 rounded bg-blue-100"></div>
                                        </div>
                                    </div>
                                </div>
                                <hr className="my-3 border-dashed border-slate-200" />
                                <div className="space-y-3">
                                    <div className="h-3 w-5/6 rounded bg-slate-200"></div>
                                    <div className="flex gap-2">
                                        <div className="h-5 w-16 rounded bg-slate-200"></div>
                                        <div className="h-5 w-24 rounded bg-slate-200"></div>
                                    </div>
                                    <div className="pt-2">
                                        <div className="h-2 w-1/3 rounded bg-slate-200 mb-2"></div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full"></div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end pt-3 border-t border-slate-100">
                                    <div className="h-9 w-24 rounded bg-slate-200"></div>
                                </div>
                            </div>
                        ))
                        : filteredCourses.map((course) => (
                            <CourseItemMobile
                                key={course.key}
                                setSelectedCourseForModal={setSelectedCourseForModal}
                                course={course}
                            />
                        ))}
                </div>
            </Card>

            {latestSelectedCourseForModal && (
                <RegistrationModal
                    course={latestSelectedCourseForModal}
                    onClose={() => setSelectedCourseForModal(null)}
                    onConfirm={handleConfirmRegistration}
                />
            )}

            {isGeneratorOpen && (
                <ScheduleGeneratorModal
                    onClose={() => setIsGeneratorOpen(false)}
                />
            )}
        </div>
    );
}

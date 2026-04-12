// Dữ liệu mock các lớp trong Khoa
// Demo chính: 48K14.1
export const FACULTY_CLASSES = [
  { id: "48K14.1", tenLop: "48K14.1", gvcn: "Nguyễn Văn Sơn" },
  { id: "48K14.2", tenLop: "48K14.2", gvcn: "Nguyễn Thị Uyên Nhi" },
  { id: "48K21.1", tenLop: "48K21.1", gvcn: "Cao Thị Nhâm" },
  { id: "48K21.2", tenLop: "48K21.2", gvcn: "Cao Thị Nhâm" },
  { id: "48K05",   tenLop: "48K05",   gvcn: "Nguyễn Văn Nam" },
  { id: "49K14.1", tenLop: "49K14.1", gvcn: "Trần Hoàng Hiếu" },
  { id: "49K14.2", tenLop: "49K14.2", gvcn: "Trần Hoàng Hiếu" },
  { id: "49K21.1", tenLop: "49K21.1", gvcn: "Nguyễn Thành Thủy" },
  { id: "49K21.2", tenLop: "49K21.2", gvcn: "Nguyễn Thành Thủy" },
  { id: "49K05",   tenLop: "49K05",   gvcn: "Trần Thị Thu Thảo" },
];

// LS keys cho trạng thái phê duyệt của Khoa
export const FACULTY_APPROVED_KEY = "facultyApprovedClasses";
// LS key dùng để gvcn submit điểm (mock: chúng ta tự set)
export const GVCN_SUBMITTED_KEY  = "gvcnSubmittedClasses"; // set { classId: true }

// Danh sách lớp demo mặc định đã được GVCN duyệt
export const DEFAULT_GVCN_SUBMITTED = {
  "48K14.1": true,
  "48K21.1": true,
  "49K14.1": true,
  "49K14.2": true,
  "49K21.2": true,
  "49K05":   true,
};
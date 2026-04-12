// Danh sách Khoa
export const PCTSV_FACULTIES = [
  { id: "cntt", name: "Khoa Công nghệ thông tin" },
  { id: "kt",   name: "Khoa Kinh tế" },
  { id: "tcnh", name: "Khoa Tài chính - Ngân hàng" },
  { id: "qtkd", name: "Khoa Quản trị kinh doanh" },
  { id: "ktqt", name: "Khoa Kinh tế quốc tế" },
  { id: "luat", name: "Khoa Luật" },
  { id: "tkth", name: "Khoa Thống kê - Tin học" },
];

// Danh sách lớp toàn trường
// Thêm: khoaPrefix (dùng cho filter Khóa), gvcn (giảng viên chủ nhiệm)
export const PCTSV_CLASSES = [
  // cntt
  { id: "22K14.1", tenLop: "22K14.1", khoaId: "cntt", khoaPrefix: "22K", gvcn: "Nguyễn Thị Ly Na",      canBoKhoa: "Nguyễn Thị Ly Na" },
  { id: "22K14.2", tenLop: "22K14.2", khoaId: "cntt", khoaPrefix: "22K", gvcn: "Phạm Văn Đức",           canBoKhoa: "Nguyễn Thị Ly Na" },
  { id: "02K21.1", tenLop: "02K21.1", khoaId: "cntt", khoaPrefix: "02K", gvcn: "Nguyễn Tố Quốc",         canBoKhoa: "Nguyễn Tố Quốc"  },
  // kt
  { id: "01K21.2", tenLop: "01K21.2", khoaId: "kt",   khoaPrefix: "01K", gvcn: "Trần Minh Luân",         canBoKhoa: "Nguyễn Tố Quốc"  },
  { id: "01K05",   tenLop: "01K05",   khoaId: "kt",   khoaPrefix: "01K", gvcn: "Nguyễn Văn Nam",         canBoKhoa: "Nguyễn Văn Nam"   },
  // tcnh
  { id: "32K14.1", tenLop: "32K14.1", khoaId: "tcnh", khoaPrefix: "32K", gvcn: "Trần Thị Ly",            canBoKhoa: "Trần Thị Ly"      },
  { id: "32K14.2", tenLop: "32K14.2", khoaId: "tcnh", khoaPrefix: "32K", gvcn: "Vũ Hoàng Anh",           canBoKhoa: "Trần Thị Ly"      },
  // qtkd
  { id: "21K21.1", tenLop: "21K21.1", khoaId: "qtkd", khoaPrefix: "21K", gvcn: "Lê Thị Lan Anh",        canBoKhoa: "Lê Thị Lan Anh"   },
  { id: "21K21.2", tenLop: "21K21.2", khoaId: "qtkd", khoaPrefix: "21K", gvcn: "Nguyễn Hoàng Phúc",     canBoKhoa: "Lê Thị Lan Anh"   },
  { id: "21K05",   tenLop: "21K05",   khoaId: "qtkd", khoaPrefix: "21K", gvcn: "Trịnh Văn Ngọc",        canBoKhoa: "Lê Thị Lan Anh"   },
  // ktqt
  { id: "11K14.1", tenLop: "11K14.1", khoaId: "ktqt", khoaPrefix: "11K", gvcn: "Phạm Văn Hùng",         canBoKhoa: "Phạm Văn Hùng"    },
  { id: "11K14.2", tenLop: "11K14.2", khoaId: "ktqt", khoaPrefix: "11K", gvcn: "Đinh Thị Lan",           canBoKhoa: "Phạm Văn Hùng"    },
  // luat
  { id: "41K21.1", tenLop: "41K21.1", khoaId: "luat", khoaPrefix: "41K", gvcn: "Trịnh Thị Mai",          canBoKhoa: "Trịnh Thị Mai"    },
  { id: "41K21.2", tenLop: "41K21.2", khoaId: "luat", khoaPrefix: "41K", gvcn: "Bùi Thị Thúy Hà",       canBoKhoa: "Trịnh Thị Mai"    },
  // tkth — linked với HomeroomClassScoreBoard / FacultyClassScoreBoard
  { id: "48K14.1", tenLop: "48K14.1", khoaId: "tkth", khoaPrefix: "48K", gvcn: "Nguyễn Văn Sơn",        canBoKhoa: "Nguyễn Văn Sơn"   },
  { id: "48K14.2", tenLop: "48K14.2", khoaId: "tkth", khoaPrefix: "48K", gvcn: "Nguyễn Thị Uyên Nhi",   canBoKhoa: "Nguyễn Văn Sơn"   },
  { id: "48K21.1", tenLop: "48K21.1", khoaId: "tkth", khoaPrefix: "48K", gvcn: "Cao Thị Nhâm",           canBoKhoa: "Nguyễn Văn Sơn"   },
  { id: "48K21.2", tenLop: "48K21.2", khoaId: "tkth", khoaPrefix: "48K", gvcn: "Cao Thị Nhâm",           canBoKhoa: "Nguyễn Văn Sơn"   },
  { id: "48K05",   tenLop: "48K05",   khoaId: "tkth", khoaPrefix: "48K", gvcn: "Nguyễn Văn Nam",         canBoKhoa: "Nguyễn Văn Sơn"   },
];

// LS key — Phê duyệt ở cấp PCTSV
export const PCTSV_APPROVED_KEY = "pctsvApprovedClasses";

// LS key — Khoa đã duyệt từ facultyStaff (tái sử dụng key hiện có)
export const FACULTY_APPROVED_KEY = "facultyApprovedClasses";
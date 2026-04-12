const StudentAffairsStaffHome = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Phòng Công tác Sinh viên
            </h2>
            <p className="text-base font-medium text-orange-600">Nhân viên PCTSV</p>
            <p className="text-sm text-gray-500 max-w-md">
              Chức năng đang được phát triển. Vui lòng quay lại sau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAffairsStaffHome;
const StudentAffairsLeaderHome = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Phòng Công tác Sinh viên
            </h2>
            <p className="text-base font-medium text-rose-600">Lãnh đạo PCTSV</p>
            <p className="text-sm text-gray-500 max-w-md">
              Chức năng đang được phát triển. Vui lòng quay lại sau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAffairsLeaderHome;
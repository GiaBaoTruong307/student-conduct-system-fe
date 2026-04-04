const ImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  const isObject = typeof imageUrl === "object";
  const src = isObject ? imageUrl.url : imageUrl;
  const description = isObject ? imageUrl.description : null;
  const date = isObject ? imageUrl.date : null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-3 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer shadow-lg font-bold text-xl z-10"
        >
          ×
        </button>

        {/* Ảnh */}
        <img
          src={src}
          alt="Xem ảnh phóng to"
          className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
        />

        {/* Thông tin minh chứng */}
        {(description || date) && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-4 w-full text-white text-sm space-y-1.5">
            {description && (
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="break-words min-w-0">{description}</span>
              </div>
            )}
            {date && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{date}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
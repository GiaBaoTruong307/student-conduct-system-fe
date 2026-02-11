const ImageViewer = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-out animate-fade-in"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] animate-scale-in">
        <img
          src={imageUrl}
          alt="Xem ảnh phóng to"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-white text-gray-800 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer shadow-lg font-bold text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ImageViewer;

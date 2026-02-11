const ScoreItem = ({
  item,
  itemKey,
  isEditing,
  displayScore,
  currentImages,
  onScoreChange,
  onUploadClick,
  onImageClick,
  onRemoveImage,
  fileInputRef,
  onImageUpload,
}) => {
  return (
    <tr className="border-t border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 border-r border-gray-300">
        <div className="flex gap-3">
          <span className="font-semibold text-gray-700 flex-shrink-0 italic w-6"></span>
          <div className="text-sm text-gray-700 whitespace-pre-line break-words">
            <span className="mr-1">-</span>
            {item.description}
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center border-r border-gray-300">
        {item.maxScore}
      </td>
      <td className="px-4 py-3 text-center border-r border-gray-300">
        {item.note ? (
          <span className="text-gray-400 italic text-xs">-</span>
        ) : isEditing ? (
          <input
            type="number"
            min="0"
            max={item.maxScore}
            value={displayScore}
            onChange={(e) =>
              onScoreChange(itemKey, e.target.value, item.maxScore)
            }
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-[#3d2f6b] focus:border-transparent"
            placeholder="0"
          />
        ) : displayScore !== "" ? (
          displayScore
        ) : (
          ""
        )}
      </td>
      <td className="px-4 py-3 text-center border-r border-gray-300">
        {item.reviewerScore !== null && item.reviewerScore !== undefined
          ? item.reviewerScore
          : ""}
      </td>
      <td className="px-4 py-3">
        {item.note ? (
          <span className="text-xs text-gray-500 italic">{item.note}</span>
        ) : (
          <div className="space-y-2">
            {isEditing && (
              <div>
                <button
                  onClick={() => onUploadClick(itemKey)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  {item.proof}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => onImageUpload(e, itemKey)}
                  className="hidden"
                />
              </div>
            )}

            {currentImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {currentImages.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative group">
                    <img
                      src={img}
                      alt={`Preview ${imgIdx + 1}`}
                      className={`w-16 h-16 object-cover rounded border border-gray-300 ${
                        !isEditing
                          ? "cursor-pointer hover:opacity-80 transition-opacity"
                          : ""
                      }`}
                      onClick={() => onImageClick(img)}
                    />
                    {isEditing && (
                      <button
                        onClick={() => onRemoveImage(itemKey, imgIdx)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-sm font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ScoreItem;

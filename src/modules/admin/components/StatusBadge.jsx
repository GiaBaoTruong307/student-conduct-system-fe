const StatusBadge = ({ startDate, endDate }) => {
  const now = new Date();
  const started = startDate && new Date(startDate) <= now;
  const ended   = endDate   && new Date(endDate)   <= now;

  if (ended)   return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Đã kết thúc</span>;
  if (started) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Đang diễn ra</span>;
  return         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Sắp diễn ra</span>;
};

export default StatusBadge;
export const StatCard = ({ title, value, color, trend, dateRange }) => (
  <div className="bg-white overflow-hidden shadow-lg rounded-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className={`rounded-full p-2 ${color.bg}`}>
          {title === "Artworks" && "🎨"}
          {title === "Artists" && "👨‍🎨"}
          {title === "Exhibitions" && "🏛️"}
          {title === "Sales" && "💰"}
          {title === "Revenue" && "💵"}
        </div>
      </div>
      <p className={`mt-3 text-3xl font-semibold ${color.text}`}>
        {title === "Revenue" ? `$${value?.toLocaleString() || 0}` : value || 0}
      </p>
      {trend && (
        <div
          className={`mt-2 text-sm ${
            trend.value >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% from last{" "}
          {dateRange}
        </div>
      )}
    </div>
  </div>
);

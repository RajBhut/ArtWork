import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.font.family = "Inter, system-ui, sans-serif";
ChartJS.defaults.responsive = true;
ChartJS.defaults.maintainAspectRatio = false;

// Dummy data constants
const dummyStats = {
  artworks: 142,
  artists: 37,
  exhibitions: 12,
  sales: 89,
  revenue: 156750,
  artworksTrend: { value: 12.5 },
  artistsTrend: { value: 8.3 },
  exhibitionsTrend: { value: -2.1 },
  salesTrend: { value: 15.7 },
  revenueTrend: { value: 23.4 },
};

const dummyActivity = [
  {
    id: 1,
    type: "sale",
    title: "Abstract Harmony",
    artist: "Sarah Chen",
    price: 2500,
    date: "2024-03-24",
    image: "/images/art1.jpg",
  },
  {
    id: 2,
    type: "exhibition",
    title: "Modern Perspectives",
    artist: "Various Artists",
    date: "2024-03-22",
    image: "/images/exhibition1.jpg",
  },
  {
    id: 3,
    type: "new_artwork",
    title: "Ocean Dreams",
    artist: "Michael Torres",
    price: 1800,
    date: "2024-03-21",
    image: "/images/art2.jpg",
  },
];

const dummySalesData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  values: [4500, 3500, 6000, 5200, 4800, 7500, 8200],
};

const StatCard = ({ title, value, color, trend, dateRange }) => (
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
        {title === "Revenue" ? `₹${value?.toLocaleString() || 0}` : value || 0}
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

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(0, 0, 0, 0.1)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const isMounted = useRef(true);
  const [stats, setStats] = useState({
    artworks: 0,
    artists: 0,
    exhibitions: 0,
    sales: 0,
    revenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("week");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [
      {
        label: "Sales",
        data: [],
        borderColor: "rgb(59, 130, 246)",
        tension: 0.1,
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const controller = new AbortController();
    isMounted.current = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [statsRes, activityRes, salesRes] = await Promise.all([
          api.get("/dashboard/stats", {
            signal: controller.signal,
          }),
          api.get("/dashboard/activity", {
            signal: controller.signal,
          }),
          api.get(`/dashboard/sales-chart?range=${dateRange}`, {
            signal: controller.signal,
          }),
        ]);

        if (!isMounted.current) return;

        if (statsRes.data) {
          setStats(statsRes.data);
        }

        if (activityRes.data) {
          setRecentActivity(activityRes.data);
        }

        if (salesRes.data) {
          setSalesData({
            labels: salesRes.data.labels,
            datasets: [
              {
                label: "Sales",
                data: salesRes.data.values,
                borderColor: "rgb(59, 130, 246)",
                tension: 0.1,
                fill: false,
              },
            ],
          });
        }
      } catch (err) {
        if (!isMounted.current) return;
        console.error("Dashboard data fetch error:", err);
        setError(err.message);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [dateRange]);

  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await api.post(
        "/reports/generate",
        { type: "dashboard", dateRange },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `dashboard-report-${new Date().toISOString()}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (err) {
      console.error("Report generation error:", err);
      alert("Failed to generate report. Please try again later.");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Welcome back, {user?.name || "User"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                isGeneratingReport ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isGeneratingReport ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Artworks"
            value={stats.artworks}
            color={{ bg: "bg-blue-100", text: "text-blue-600" }}
            trend={stats.artworksTrend}
            dateRange={dateRange}
          />
          <StatCard
            title="Artists"
            value={stats.artists}
            color={{ bg: "bg-indigo-100", text: "text-indigo-600" }}
            trend={stats.artistsTrend}
            dateRange={dateRange}
          />
          <StatCard
            title="Exhibitions"
            value={stats.exhibitions}
            color={{ bg: "bg-purple-100", text: "text-purple-600" }}
            trend={stats.exhibitionsTrend}
            dateRange={dateRange}
          />
          <StatCard
            title="Sales"
            value={stats.sales}
            color={{ bg: "bg-green-100", text: "text-green-600" }}
            trend={stats.salesTrend}
            dateRange={dateRange}
          />
          <StatCard
            title="Revenue"
            value={stats.revenue}
            color={{ bg: "bg-emerald-100", text: "text-emerald-600" }}
            trend={stats.revenueTrend}
            dateRange={dateRange}
          />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sales Chart */}
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-xl font-medium text-gray-900 mb-4">
              Sales Overview
            </h2>
            <div className="h-64">
              <Line data={salesData} options={chartOptions} redraw={false} />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-medium text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={activity.image}
                          alt={activity.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/fallback-image.jpg";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {activity.title} by {activity.artist}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {activity.type === "sale" &&
                            `Sold for ₹${
                              activity.price?.toLocaleString() || 0
                            }`}
                          {activity.type === "exhibition" &&
                            "New exhibition opened"}
                          {activity.type === "new_artwork" &&
                            `New artwork added - ₹${
                              activity.price?.toLocaleString() || 0
                            }`}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">
                  No recent activity to display
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

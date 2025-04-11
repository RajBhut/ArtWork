const express = require("express");
const router = express.Router();
const auth = require("../../config/auth.js");
const Sale = require("../../model/Sale.js");
const Artwork = require("../../model/Artwork.js");
const Artist = require("../../model/Artist.js");
const Exhibition = require("../../model/Exhibition.js");

// @route   GET api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    // Get count of artworks
    const artworksCount = await Artwork.countDocuments();

    // Get count of artists
    const artistsCount = await Artist.countDocuments();

    // Get count of exhibitions
    const exhibitionsCount = await Exhibition.countDocuments();

    // Get sales statistics
    const salesStats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]);

    // Calculate trends (mocked for now - could be implemented with time-range queries)
    // In a real app, you would calculate these based on previous period data
    const artworksTrend = { value: 12.5 };
    const artistsTrend = { value: 8.3 };
    const exhibitionsTrend = { value: -2.1 };
    const salesTrend = { value: 15.7 };
    const revenueTrend = { value: 23.4 };

    const stats = {
      artworks: artworksCount,
      artists: artistsCount,
      exhibitions: exhibitionsCount,
      sales: salesStats.length > 0 ? salesStats[0].count : 0,
      revenue: salesStats.length > 0 ? salesStats[0].revenue : 0,
      artworksTrend,
      artistsTrend,
      exhibitionsTrend,
      salesTrend,
      revenueTrend,
    };

    res.json(stats);
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET api/dashboard/activity
// @desc    Get recent activity for dashboard
// @access  Private
router.get("/activity", auth, async (req, res) => {
  try {
    const recentSales = await Sale.find()
      .sort({ date: -1 })
      .limit(5)
      .populate({
        path: "artwork",
        select: "title artist image price",
        populate: { path: "artist", select: "name" },
      })
      .populate("buyer", "name");

    const recentArtworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("artist", "name");

    // Get recent exhibitions
    const recentExhibitions = await Exhibition.find()
      .sort({ startDate: -1 })
      .limit(3);

    const activities = [
      ...recentSales
        .filter((sale) => sale.artwork && sale.artwork.title) // Filter out null/undefined artworks
        .map((sale) => ({
          id: sale._id,
          type: "sale",
          title: sale.artwork?.title || "Untitled Artwork",
          artist: sale.artwork?.artist?.name || "Unknown Artist",
          price: sale.price || 0,
          date: sale.date || new Date(),
          image: sale.artwork?.image || "/images/fallback-image.jpg",
        })),
      ...recentArtworks
        .filter((artwork) => artwork.title) // Filter out null/undefined artworks
        .map((artwork) => ({
          id: artwork._id,
          type: "new_artwork",
          title: artwork.title || "Untitled Artwork",
          artist: artwork.artist?.name || "Unknown Artist",
          price: artwork.price || 0,
          date: artwork.createdAt || new Date(),
          image: artwork.image || "/images/fallback-image.jpg",
        })),
      ...recentExhibitions
        .filter((exhibition) => exhibition.title) // Filter out null/undefined exhibitions
        .map((exhibition) => ({
          id: exhibition._id,
          type: "exhibition",
          title: exhibition.title || "Untitled Exhibition",
          artist: "Various Artists",
          date: exhibition.startDate || new Date(),
          image: exhibition.imageUrl || "/images/fallback-image.jpg",
        })),
    ];

    // Sort activities by date
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json(activities);
  } catch (err) {
    console.error("Dashboard activity error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   GET api/dashboard/sales-chart
// @desc    Get sales chart data by time range
// @access  Private
router.get("/sales-chart", auth, async (req, res) => {
  const { range } = req.query;
  let dateFormat;
  let groupBy;
  let startDate = new Date();
  let labels = [];

  try {
    switch (range) {
      case "week":
        // Last 7 days
        startDate.setDate(startDate.getDate() - 7);
        dateFormat = "%a"; // Abbreviated day name
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };

        // Generate labels for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        }
        break;

      case "month":
        startDate.setDate(startDate.getDate() - 30);
        dateFormat = "%d";
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };

        for (let i = 4; i >= 0; i--) {
          const weekNumber = 5 - i;
          labels.push(`Week ${weekNumber}`);
        }
        break;

      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        dateFormat = "%b";
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };

        // Generate labels for last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          labels.push(date.toLocaleDateString("en-US", { month: "short" }));
        }
        break;

      default:
        // Default to week
        startDate.setDate(startDate.getDate() - 7);
        dateFormat = "%a";
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };

        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        }
    }

    // Aggregate sales data
    const salesData = await Sale.aggregate([
      {
        $match: {
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          total: { $sum: "$price" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create values array matching the labels array
    let values = Array(labels.length).fill(0);

    if (range === "week") {
      salesData.forEach((item) => {
        const date = new Date(item._id);
        const dayIndex = 6 - ((new Date().getDay() - date.getDay() + 7) % 7);
        if (dayIndex >= 0 && dayIndex < 7) {
          values[dayIndex] = item.total;
        }
      });
    } else if (range === "month") {
      salesData.forEach((item) => {
        const date = new Date(item._id);
        const dayDiff = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.floor(dayDiff / 7);
        if (weekIndex >= 0 && weekIndex < 5) {
          values[weekIndex] += item.total;
        }
      });
    } else if (range === "year") {
      salesData.forEach((item) => {
        const [year, month] = item._id.split("-");
        const monthIndex =
          11 - ((new Date().getMonth() - parseInt(month) + 1 + 12) % 12);
        if (monthIndex >= 0 && monthIndex < 12) {
          values[monthIndex] = item.total;
        }
      });
    }

    res.json({ labels, values });
  } catch (err) {
    console.error("Sales chart error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// @route   POST api/dashboard/report
// @desc    Generate dashboard report
// @access  Private
router.post("/report", auth, async (req, res) => {
  try {
    // In a real implementation, you would generate a PDF report here
    // For now, we'll just return a success message

    res.json({ message: "Report generation not implemented yet" });
  } catch (err) {
    console.error("Report generation error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;

const express = require("express");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");
const Sale = require("../../model/Sale.js");
const Artwork = require("../../model/Artwork.js");
const Artist = require("../../model/Artist.js");
const Exhibition = require("../../model/Exhibition.js");
const auth = require("../../config/auth.js");

const router = express.Router();

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

router.post("/generate", auth, async (req, res) => {
  try {
    const { type, dateRange } = req.body;
    const doc = new jsPDF();

    // Set font
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ArtLab Dashboard Report", 20, 20);

    // Add report metadata
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${formatDate(new Date())}`, 20, 30);
    doc.text(`Date Range: ${dateRange}`, 20, 40);

    // Fetch dashboard statistics
    const stats = await getDashboardStats();
    const activities = await getRecentActivities();
    const salesData = await getSalesData(dateRange);

    // Add statistics section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Key Statistics", 20, 60);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    let y = 70;
    const statsData = [
      { label: "Total Artworks", value: stats.artworks },
      { label: "Total Artists", value: stats.artists },
      { label: "Total Exhibitions", value: stats.exhibitions },
      { label: "Total Sales", value: stats.sales },
      { label: "Total Revenue", value: formatCurrency(stats.revenue) },
    ];

    statsData.forEach((stat) => {
      doc.text(`${stat.label}: ${stat.value}`, 20, y);
      y += 10;
    });

    // Add recent activity section
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Recent Activity", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 10;

    activities.forEach((activity) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      let activityText = "";
      switch (activity.type) {
        case "sale":
          activityText = `Sale: ${activity.title} by ${
            activity.artist
          } - ${formatCurrency(activity.price)}`;
          break;
        case "exhibition":
          activityText = `Exhibition: ${activity.title} - ${formatDate(
            activity.date
          )}`;
          break;
        case "new_artwork":
          activityText = `New Artwork: ${activity.title} by ${
            activity.artist
          } - ${formatCurrency(activity.price)}`;
          break;
      }

      doc.text(activityText, 20, y);
      y += 10;
    });

    // Add sales data section
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Sales Overview", 20, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 10;

    salesData.labels.forEach((label, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.text(`${label}: ${formatCurrency(salesData.values[index])}`, 20, y);
      y += 10;
    });

    // Save the PDF
    const filePath = path.join(__dirname, "dashboard-report.pdf");
    doc.save(filePath);

    // Send the file and clean up
    res.download(
      filePath,
      `dashboard-report-${new Date().toISOString()}.pdf`,
      (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Error generating report");
        }
        fs.unlinkSync(filePath);
      }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).send("Failed to generate report");
  }
});

// Helper function to get dashboard statistics
async function getDashboardStats() {
  try {
    const artworksCount = await Artwork.countDocuments();
    const artistsCount = await Artist.countDocuments();
    const exhibitionsCount = await Exhibition.countDocuments();

    const salesStats = await Sale.aggregate([
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
    ]);

    return {
      artworks: artworksCount,
      artists: artistsCount,
      exhibitions: exhibitionsCount,
      sales: salesStats.length > 0 ? salesStats[0].count : 0,
      revenue: salesStats.length > 0 ? salesStats[0].revenue : 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}

// Helper function to get recent activities
async function getRecentActivities() {
  try {
    const recentSales = await Sale.find()
      .sort({ date: -1 })
      .limit(5)
      .populate({
        path: "artwork",
        select: "title artist image price",
        populate: { path: "artist", select: "name" },
      });

    const recentArtworks = await Artwork.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("artist", "name");

    const recentExhibitions = await Exhibition.find()
      .sort({ startDate: -1 })
      .limit(3);

    const activities = [
      ...recentSales.map((sale) => ({
        type: "sale",
        title: sale.artwork?.title || "Untitled Artwork",
        artist: sale.artwork?.artist?.name || "Unknown Artist",
        price: sale.price || 0,
        date: sale.date,
      })),
      ...recentArtworks.map((artwork) => ({
        type: "new_artwork",
        title: artwork.title || "Untitled Artwork",
        artist: artwork.artist?.name || "Unknown Artist",
        price: artwork.price || 0,
        date: artwork.createdAt,
      })),
      ...recentExhibitions.map((exhibition) => ({
        type: "exhibition",
        title: exhibition.title || "Untitled Exhibition",
        date: exhibition.startDate,
      })),
    ];

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    throw error;
  }
}

// Helper function to get sales data
async function getSalesData(dateRange) {
  try {
    let startDate = new Date();
    let groupBy;

    switch (dateRange) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        break;
      case "month":
        startDate.setDate(startDate.getDate() - 30);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
    }

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

    return {
      labels: salesData.map((item) => item._id),
      values: salesData.map((item) => item.total),
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    throw error;
  }
}

module.exports = router;

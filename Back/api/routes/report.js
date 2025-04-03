const express = require("express");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { type, dateRange } = req.body;

    // Generate PDF
    const doc = new jsPDF();
    doc.text("Dashboard Report", 10, 10);
    doc.text(`Type: ${type}`, 10, 20);
    doc.text(`Date Range: ${dateRange}`, 10, 30);

    const filePath = path.join(__dirname, "dashboard-report.pdf");
    doc.save(filePath);

    // Send file
    res.download(
      filePath,
      `dashboard-report-${new Date().toISOString()}.pdf`,
      (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).send("Error generating report");
        }
        // Remove file after sending
        fs.unlinkSync(filePath);
      }
    );
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).send("Failed to generate report");
  }
});

module.exports = router;

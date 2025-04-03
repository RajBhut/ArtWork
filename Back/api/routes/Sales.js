const express = require("express");
const router = express.Router();
const auth = require("../../config/auth.js");
const Sale = require("../../model/Sale.js");
const Artwork = require("../../model/Artwork.js");
const { v4: uuidv4 } = require("uuid");

// @route   GET api/sales
// @desc    Get all sales
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const sales = await Sale.find().populate("artwork").sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error("Get sales error:", err);
    res.status(500).json({
      message: "Error fetching sales",
      error: err.message,
    });
  }
});

// @route   POST api/sales
// @desc    Create a sale
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    console.log(req.body);
    const {
      artworkId,
      buyerName,
      buyerEmail,
      buyerPhone,
      shippingAddress,
      paymentMethod,
      price,
      saleDate,
    } = req.body;

    // Validate required fields
    if (!artworkId || !buyerName || !price || !paymentMethod) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Check if artwork exists and is available
    const artworkDoc = await Artwork.findById(artworkId);
    if (!artworkDoc) {
      return res.status(404).json({
        message: "Artwork not found",
      });
    }

    if (artworkDoc.status !== "available") {
      return res.status(400).json({
        message: "Artwork is not available for sale",
      });
    }

    const commission = 0.1 * price;

    const sale = new Sale({
      artwork: artworkId,
      buyer: buyerName,
      price,
      paymentMethod,
      paymentStatus: "completed",
      commission,
      transactionId: uuidv4(),
      date: saleDate || new Date(),
      buyerEmail,
      buyerPhone,
      shippingAddress,
    });

    // Save sale
    await sale.save();

    // Update artwork status
    await Artwork.findByIdAndUpdate(artworkId, { status: "sold" });

    // Populate artwork details before sending response
    const populatedSale = await Sale.findById(sale._id).populate("artwork");

    res.status(201).json(populatedSale);
  } catch (err) {
    console.error("Create sale error:", err);
    res.status(500).json({
      message: "Error creating sale",
      error: err.message,
    });
  }
});

// @route   PUT api/sales/:id
// @desc    Update a sale
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const sale = await Sale.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate("artwork");

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (err) {
    console.error("Update sale error:", err);
    res.status(500).json({
      message: "Error updating sale",
      error: err.message,
    });
  }
});

// @route   DELETE api/sales/:id
// @desc    Delete a sale
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    // Update artwork status back to available
    await Artwork.findByIdAndUpdate(sale.artwork, { status: "available" });

    await Sale.findByIdAndDelete(req.params.id);
    res.json({ message: "Sale removed successfully" });
  } catch (err) {
    console.error("Delete sale error:", err);
    res.status(500).json({
      message: "Error deleting sale",
      error: err.message,
    });
  }
});

// @route   GET api/sales/stats
// @desc    Get sales statistics
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const totalSales = await Sale.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(totalSales[0]);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../config/auth.js");
const Artwork = require("../../model/Artwork.js");

// @route   GET api/artworks
// @desc    Get all artworks
// @access  Public
router.get("/", async (req, res) => {
  try {
    const artworks = await Artwork.find().populate("artist");
    res.json(artworks);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/artworks/:id
// @desc    Get artwork by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const artwork = await Artwork.findById(req.params.id).populate("artist");
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }
    res.json(artwork);
  } catch (err) {
    console.error("Get artwork error:", err);
    res.status(500).json({
      message: "Error fetching artwork",
      error: err.message,
    });
  }
});

// @route   POST api/artworks
// @desc    Create an artwork
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { title, artist, description, price, imageUrl, category } = req.body;
    const artwork = new Artwork({
      title,
      artist,
      description,
      price,
      imageUrl,
      category,
    });
    await artwork.save();
    res.json(artwork);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/artworks/:id
// @desc    Update artwork
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const artwork = await Artwork.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(artwork);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/artworks/:id
// @desc    Delete artwork
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    // Check if artwork exists
    const artwork = await Artwork.findById(req.params.id);
    if (!artwork) {
      return res.status(404).json({ message: "Artwork not found" });
    }

    await Artwork.findByIdAndDelete(req.params.id);

    res.json({ message: "Artwork removed successfully" });
  } catch (err) {
    console.error("Delete artwork error:", err);
    res.status(500).json({
      message: "Error deleting artwork",
      error: err.message,
    });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const auth = require("../../config/auth.js");
const Exhibition = require("../../model/Exhibition.js");
const Artwork = require("../../model/Artwork.js");

// @route   GET api/exhibitions
// @desc    Get all exhibitions
// @access  Public
router.get("/", async (req, res) => {
  try {
    const exhibitions = await Exhibition.find().populate("artworks");
    res.json(exhibitions);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   GET api/exhibitions/:id
// @desc    Get a single exhibition by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id)
      .populate("artworks")
      .select("title description startDate endDate imageUrl artworks");

    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    res.json(exhibition);
  } catch (err) {
    console.error("Error fetching exhibition:", err);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/exhibitions/:id/artworks
// @desc    Get all artworks for a specific exhibition
// @access  Public
router.get("/:id/artworks", async (req, res) => {
  try {
    const exhibition = await Exhibition.findById(req.params.id);
    if (!exhibition) {
      return res.status(404).json({ message: "Exhibition not found" });
    }

    const artworks = await Artwork.find({ _id: { $in: exhibition.artworks } })
      .populate("artist", "name")
      .select(
        "title description dimensions medium price imageUrl artist createdAt"
      );

    res.json(artworks);
  } catch (err) {
    console.error("Error fetching exhibition artworks:", err);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/exhibitions
// @desc    Create an exhibition
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, startDate, endDate, artworks, imageUrl } =
      req.body;
    const exhibition = new Exhibition({
      title,
      description,
      startDate,
      endDate,
      artworks,
      imageUrl,
    });
    await exhibition.save();
    res.json(exhibition);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/exhibitions/:id
// @desc    Update exhibition
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const exhibition = await Exhibition.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(exhibition);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/exhibitions/:id
// @desc    Delete exhibition
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await Exhibition.findByIdAndDelete(req.params.id);
    res.json({ message: "Exhibition removed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;

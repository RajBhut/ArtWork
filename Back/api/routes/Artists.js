const express = require("express");
const router = express.Router();
const auth = require("../../config/auth.js");
const Artist = require("../../model/Artist.js");

// @route   GET api/artists
// @desc    Get all artists
// @access  Public
router.get("/", async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   POST api/artists
// @desc    Create an artist
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { name, bio, imageUrl, contact } = req.body;
    const artist = new Artist({
      name,
      bio,
      imageUrl,
      contact,
    });
    await artist.save();
    res.json(artist);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/artists/:id
// @desc    Update artist
// @access  Private
router.put("/:id", auth, async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(artist);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/artists/:id
// @desc    Delete artist
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    await Artist.findOneAndDelete(req.params.id);
    res.json({ message: "Artist removed" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;

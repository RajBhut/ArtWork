const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    category: {
      type: String,
      required: true,
    },
    medium: String,
    dimensions: {
      height: Number,
      width: Number,
      unit: String,
    },
    year: Number,
    status: {
      type: String,
      enum: ["available", "sold", "exhibition"],
      default: "available",
    },
    tags: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artwork", artworkSchema);

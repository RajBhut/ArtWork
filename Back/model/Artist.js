const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    contact: {
      email: String,
      phone: String,
      website: String,
    },
    specialization: [String],
    achievements: [
      {
        title: String,
        year: Number,
        description: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", artistSchema);

const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    artwork: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artwork",
      required: true,
    },
    buyer: { type: String, required: true },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    commission: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Calculate total amount including commission
saleSchema.virtual("totalAmount").get(function () {
  return this.price + this.commission;
});

module.exports = mongoose.model("Sale", saleSchema);

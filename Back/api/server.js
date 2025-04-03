const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
dotenv.config();

const app = express();

// Connect Database
connectDB();
const allowedOrigins = [
  "http://localhost:5173", // Vite default
  "http://localhost:3000", // React default
  "http://127.0.0.1:5173",
  // Add your production domain when ready
];
// Middleware
app.use(morgan("dev"));
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `CORS policy does not allow access from the specified origin: ${origin}`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());
// Routes
app.use("/api/auth", require("./routes/auth.js"));
app.use("/api/artworks", require("./routes/Artworks.js"));
app.use("/api/artists", require("./routes/Artists.js"));
app.use("/api/exhibitions", require("./routes/Exhibitions.js"));
app.use("/api/sales", require("./routes/sales.js"));
app.use("/api/dashboard", require("./routes/deshbord.js"));
app.use("/api/reports", require("./routes/report.js"));
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

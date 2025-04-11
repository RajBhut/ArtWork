const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const auth = require("../../config/auth.js"); // Make sure this path is correct
const Artist = require("../../model/Artist.js");

// Cookie options
const cookieOptions = {
  httpOnly: true, // Cannot be accessed by client-side JavaScript
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Check if email already exists
    const existingArtist = await Artist.findOne({ "contact.email": email });
    if (existingArtist) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Create new artist
    const artist = new Artist({
      name,
      contact: { email },
      password,
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    artist.password = await bcrypt.hash(password, salt);

    // Save artist to database
    await artist.save();

    // Create JWT payload
    const payload = {
      user: {
        id: artist.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;

        // Set the token as cookie
        res.cookie("token", token, cookieOptions);

        // Send response
        res.json({
          message: "User registered successfully",
          user: {
            id: artist._id,
            name: artist.name,
            email: artist.contact.email,
          },
        });
      }
    );
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Validate the request
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const artist = await Artist.findOne({ "contact.email": email });

    if (!artist) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, artist.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      user: {
        id: artist.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;

        // Set token as cookie
        res.cookie("token", token, cookieOptions);

        // Send response
        res.json({
          message: "Login successful",
          user: {
            id: artist._id,
            name: artist.name,
            email: artist.contact.email,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    // req.user.id comes from the auth middleware
    const user = await Artist.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/auth/logout
// @desc    Logout user
// @access  Public
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

module.exports = router;

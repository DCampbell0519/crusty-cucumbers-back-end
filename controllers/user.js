const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const verifyToken = require("../middleware/verify-token.js");

// Here we are protecting as route ensuring a user must be logged in to access any data
router.get("/", verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, "username");

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    console.log("testing testing");
    const user = await User.findById(req.user._id);

    console.log("User:", user);
    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Here a user must be logged in and they can only access their own data
// View other community profiles
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    // console.log(req.user)
    if (req.user._id !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

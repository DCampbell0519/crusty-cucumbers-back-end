const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const verifyToken = require("../middleware/verify-token.js");

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
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      req.body,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found '})
    }

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router;

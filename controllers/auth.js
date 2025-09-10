const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const saltRounds = 12;

router.post("/sign-up", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (userInDatabase) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const user = await User.create({
      username: req.body.username,
      hashedPassword: bcrypt.hashSync(req.body.password, saltRounds),
      email: req.body.email,
      favoriteMovieQuote: req.body.favoriteMovieQuote,
      bio: req.body.bio,
      age: req.body.age,
      profilePhoto: req.body.profilePhoto,
    });

    const payload = { username: user.username, _id: user._id };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });

    if (!userInDatabase) {
      return res
        .status(409)
        .json({ error: "Invalid Credentials, user does not exist" });
    }

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      userInDatabase.hashedPassword
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    const payload = {
      username: userInDatabase.username,
      _id: userInDatabase._id,
    };

    const token = jwt.sign({ payload }, process.env.JWT_SECRET);

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/sign-out", (req, res) => {
  res.json("You have successfully logged out");
});

module.exports = router;

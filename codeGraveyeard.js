// If/when we decide to add a community page, to view other users' profiles
// router.get("/:userId", verifyToken, async (req, res) => {
//   try {
//     if (req.user._id !== req.params.userId) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     const user = await User.findById(req.params.userId);

//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.json({ user });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
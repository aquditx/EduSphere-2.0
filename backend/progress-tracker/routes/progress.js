const express = require("express");
const router = express.Router();

let progressCollection;

router.setCollection = (collection) => {
  progressCollection = collection;
};

router.post("/", async (req, res) => {
  try {
    const { userId, course } = req.body;

    await progressCollection.updateOne(
      { userId, course },
      { $set: req.body },
      { upsert: true }
    );

    res.json({ message: "Progress saved or updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save progress" });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const result = await progressCollection
      .find({ userId: req.params.userId })
      .toArray();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;

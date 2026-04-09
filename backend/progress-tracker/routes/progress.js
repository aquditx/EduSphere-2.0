const express = require("express");
const router = express.Router();

let progressCollection;

// Middleware to ensure DB exists
const checkDB = (req, res, next) => {
  if (!progressCollection) {
    return res.status(503).json({ error: "Database not initialized" });
  }
  next();
};

// Inject Mongo collection
router.setCollection = (collection) => {
  progressCollection = collection;
};

//  GET /progress
router.get("/", checkDB, async (req, res) => {
  try {
    const { userId, courseId } = req.query;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    const result = await progressCollection.findOne({ userId, courseId });

    res.json(
      result || {
        userId,
        courseId,
        completedLessons: [],
        lessonTimes: {},
        quizResults: {},
        lastLessonId: null,
        lastUpdated: null,
      }
    );
  } catch (err) {
    console.error(`[GET PROGRESS ERROR]: ${err.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

//  POST /progress/complete
router.post("/complete", checkDB, async (req, res) => {
  try {
    const { userId, courseId, lessonId, nextLessonId, timeWatched } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const update = {
      $addToSet: { completedLessons: lessonId },
      $set: {
        lastLessonId: nextLessonId || lessonId,
        lastUpdated: new Date(),
      },
    };

    if (timeWatched !== undefined) {
      update.$set[`lessonTimes.${lessonId}`] = timeWatched;
    }

    await progressCollection.updateOne(
      { userId, courseId },
      update,
      { upsert: true }
    );

    res.json({ success: true, message: "Lesson marked complete" });
  } catch (err) {
    console.error(`[COMPLETE ERROR]: ${err.message}`);
    res.status(500).json({ error: "Failed to update completion" });
  }
});

router.post("/watch", checkDB, async (req, res) => {
  try {
    const { userId, courseId, lessonId, timeWatched } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (timeWatched === undefined || timeWatched < 0) {
      return res.status(400).json({ error: "Invalid watch time" });
    }

    const existing = await progressCollection.findOne({ userId, courseId });
    const prevTime = existing?.lessonTimes?.[lessonId] || 0;

    await progressCollection.updateOne(
      { userId, courseId },
      {
        $set: {
          [`lessonTimes.${lessonId}`]: Math.max(prevTime, timeWatched),
          lastLessonId: lessonId,
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true, message: "Watch time synced" });
  } catch (err) {
    console.error(`[WATCH ERROR]: ${err.message}`);
    res.status(500).json({ error: "Failed to save watch time" });
  }
});


router.post("/quiz", checkDB, async (req, res) => {
  try {
    const { userId, courseId, lessonId, score, answers } = req.body;

    if (!userId || !courseId || !lessonId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (typeof score !== "number") {
      return res.status(400).json({ error: "Invalid quiz score" });
    }

    await progressCollection.updateOne(
      { userId, courseId },
      {
        $set: {
          [`quizResults.${lessonId}`]: {
            score,
            answers: answers || [],
            submittedAt: new Date(),
          },
          lastUpdated: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ success: true, score, message: "Quiz result saved" });
  } catch (err) {
    console.error(`[QUIZ ERROR]: ${err.message}`);
    res.status(500).json({ error: "Failed to save quiz result" });
  }
});

module.exports = router;
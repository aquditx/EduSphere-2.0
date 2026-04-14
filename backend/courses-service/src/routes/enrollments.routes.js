import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { listEnrollments } from '../controllers/enrollments.controller.js';

const router = express.Router();

// GET /enrollments?userId=X — caller must be authed; defaults to req.user.
router.get('/', requireAuth, listEnrollments);

export default router;

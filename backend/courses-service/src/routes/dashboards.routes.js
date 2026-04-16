import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  studentDashboard,
  instructorDashboard,
  adminDashboard,
} from '../controllers/dashboards.controller.js';

const router = express.Router();

router.get('/student', requireAuth, requireRole('student'), studentDashboard);
router.get('/instructor', requireAuth, requireRole('instructor', 'admin'), instructorDashboard);
router.get('/admin', requireAuth, requireRole('admin'), adminDashboard);

export default router;

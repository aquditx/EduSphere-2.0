import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  listTeachers,
  getTeacher,
  getTeacherByUserId,
  applyToTeach,
  updateTeacher,
  reviewApplication,
  listApplications,
} from '../controllers/teachers.controller.js';

const router = express.Router();

// Public
router.get('/', listTeachers);
router.get('/by-user/:userId', getTeacherByUserId);
router.get('/:id', getTeacher);

// Authenticated
router.post('/apply', requireAuth, applyToTeach);
router.patch('/:id', requireAuth, requireRole('instructor', 'admin'), updateTeacher);

// Admin
router.get('/applications/list', requireAuth, requireRole('admin'), listApplications);
router.post('/applications/:id/review', requireAuth, requireRole('admin'), reviewApplication);

export default router;

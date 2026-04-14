import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} from '../controllers/courses.controller.js';
import { listReviews, submitReview } from '../controllers/reviews.controller.js';
import { enroll } from '../controllers/enrollments.controller.js';

const router = express.Router();

// Public
router.get('/', listCourses);
router.get('/:id', getCourse);
router.get('/:courseId/reviews', listReviews);

// Authenticated — instructors create/edit their own; admins can edit any.
router.post('/', requireAuth, requireRole('instructor', 'admin'), createCourse);
router.patch('/:id', requireAuth, requireRole('instructor', 'admin'), updateCourse);
router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), deleteCourse);

// Students enroll & review
router.post('/:id/enroll', requireAuth, requireRole('student'), enroll);
router.post('/:courseId/reviews', requireAuth, requireRole('student'), submitReview);

export default router;

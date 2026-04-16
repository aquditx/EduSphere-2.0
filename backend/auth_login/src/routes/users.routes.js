import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import {
  listUsers,
  getUserById,
  updateUser,
  getProfile,
  updateProfile,
} from '../controllers/users.controller.js';

const router = express.Router();

// Public — anyone can view a user's public profile (used for instructor pages)
router.get('/:id/profile', getProfile);

// Authenticated — self-view and admin actions
router.get('/', authMiddleware, listUsers);
router.get('/:id', authMiddleware, getUserById);
router.patch('/:id', authMiddleware, updateUser);
router.patch('/:id/profile', authMiddleware, updateProfile);

export default router;

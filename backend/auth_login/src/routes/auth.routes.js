import express from 'express';
import authMiddleware from '../middleware/auth.middleware.js';
import { register, login, validateToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/validate', validateToken);
router.get('/protected', authMiddleware, (req, res) => {
  res.json({
    message: 'Protected route accessed',
    user: req.user
  });
});

export default router;

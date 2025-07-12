import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserBan,
  moderateQuestion,
  moderateAnswer,
  sendAlert,
  getModerationQueue
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Validation middleware
const alertValidation = [
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Alert title must be between 5 and 100 characters'),
  body('message')
    .isLength({ min: 10, max: 500 })
    .withMessage('Alert message must be between 10 and 500 characters')
];

const moderationValidation = [
  body('reason')
    .isLength({ min: 10, max: 200 })
    .withMessage('Moderation reason must be between 10 and 200 characters')
];

const questionModerationValidation = [
  body('status')
    .isIn(['active', 'closed', 'duplicate', 'off-topic'])
    .withMessage('Invalid status'),
  body('reason')
    .isLength({ min: 10, max: 200 })
    .withMessage('Moderation reason must be between 10 and 200 characters')
];

// Routes
router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', moderationValidation, toggleUserBan);
router.put('/questions/:id/moderate', questionModerationValidation, moderateQuestion);
router.put('/answers/:id/moderate', moderationValidation, moderateAnswer);
router.post('/alerts', alertValidation, sendAlert);
router.get('/moderation-queue', getModerationQueue);

export default router; 
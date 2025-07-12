import express from 'express';
import { body } from 'express-validator';
import {
  getAnswers,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  getAnswer
} from '../controllers/answerController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const answerValidation = [
  body('content')
    .isLength({ min: 20 })
    .withMessage('Answer must be at least 20 characters long')
];

const voteValidation = [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either upvote or downvote')
];

// Public routes
router.get('/question/:questionId', getAnswers);
router.get('/:id', getAnswer);

// Protected routes
router.post('/question/:questionId', auth, answerValidation, createAnswer);
router.put('/:id', auth, answerValidation, updateAnswer);
router.delete('/:id', auth, deleteAnswer);
router.post('/:id/vote', auth, voteValidation, voteAnswer);

export default router; 
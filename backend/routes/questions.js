import express from 'express';
import { body } from 'express-validator';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  acceptAnswer
} from '../controllers/questionController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const questionValidation = [
  body('title')
    .isLength({ min: 10, max: 300 })
    .withMessage('Title must be between 10 and 300 characters'),
  body('description')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long'),
  body('tags')
    .isArray({ min: 1, max: 5 })
    .withMessage('Must provide 1-5 tags'),
  body('tags.*')
    .isLength({ min: 2, max: 20 })
    .withMessage('Each tag must be between 2 and 20 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Tags can only contain letters, numbers, and hyphens')
];

const voteValidation = [
  body('voteType')
    .isIn(['upvote', 'downvote'])
    .withMessage('Vote type must be either upvote or downvote')
];

const acceptAnswerValidation = [
  body('answerId')
    .isMongoId()
    .withMessage('Invalid answer ID')
];

// Public routes
router.get('/', getQuestions);
router.get('/:id', getQuestion);

// Protected routes
router.post('/', auth, questionValidation, createQuestion);
router.put('/:id', auth, questionValidation, updateQuestion);
router.delete('/:id', auth, deleteQuestion);
router.post('/:id/vote', auth, voteValidation, voteQuestion);
router.post('/:id/accept-answer', auth, acceptAnswerValidation, acceptAnswer);

export default router; 
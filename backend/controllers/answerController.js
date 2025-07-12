import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Get answers for a question
// @route   GET /api/questions/:questionId/answers
// @access  Public
export const getAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { sort = 'votes' } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'votes':
        sortOption = { voteCount: -1, createdAt: -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { voteCount: -1, createdAt: -1 };
    }

    const answers = await Answer.find({ question: questionId })
      .populate('author', 'username avatar reputation')
      .populate('comments')
      .sort(sortOption);

    res.json(answers);
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create answer
// @route   POST /api/questions/:questionId/answers
// @access  Private
export const createAnswer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionId } = req.params;
    const { content } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user already answered this question
    const existingAnswer = await Answer.findOne({
      question: questionId,
      author: req.user._id
    });

    if (existingAnswer) {
      return res.status(400).json({ message: 'You have already answered this question' });
    }

    const answer = new Answer({
      content,
      author: req.user._id,
      question: questionId
    });

    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Update user's answer count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { answersCount: 1 }
    });

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: question.author,
        sender: req.user._id,
        type: 'answer',
        title: 'New Answer',
        message: `${req.user.username} answered your question "${question.title}"`,
        question: question._id,
        answer: answer._id,
        link: `/questions/${question._id}`
      });
    }

    // Populate author info
    await answer.populate('author', 'username avatar reputation');

    res.status(201).json({
      message: 'Answer created successfully',
      answer
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update answer
// @route   PUT /api/answers/:id
// @access  Private
export const updateAnswer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check ownership or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { content } = req.body;
    answer.content = content;
    await answer.save();

    await answer.populate('author', 'username avatar reputation');

    res.json({
      message: 'Answer updated successfully',
      answer
    });
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete answer
// @route   DELETE /api/answers/:id
// @access  Private
export const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check ownership or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Remove answer from question
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    // If this was the accepted answer, remove it
    const question = await Question.findById(answer.question);
    if (question.acceptedAnswer && question.acceptedAnswer.toString() === answer._id.toString()) {
      question.acceptedAnswer = null;
      await question.save();
    }

    // Delete associated notifications
    await Notification.deleteMany({ answer: answer._id });

    await answer.deleteOne();

    // Update user's answer count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { answersCount: -1 }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vote on answer
// @route   POST /api/answers/:id/vote
// @access  Private
export const voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is voting on their own answer
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own answer' });
    }

    await answer.addVote(req.user._id, voteType);

    res.json({
      message: 'Vote recorded successfully',
      voteCount: answer.voteCount
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single answer
// @route   GET /api/answers/:id
// @access  Public
export const getAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate('question', 'title')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      });

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    res.json(answer);
  } catch (error) {
    console.error('Get answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
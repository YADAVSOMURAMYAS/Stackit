import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { validationResult } from 'express-validator';

// @desc    Get all questions
// @route   GET /api/questions
// @access  Public
export const getQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'newest', 
      tag, 
      search,
      status = 'active'
    } = req.query;

    const query = { status };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filter
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }

    // Sorting
    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'votes':
        sortOption = { voteCount: -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'unanswered':
        query.answers = { $size: 0 };
        sortOption = { createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation joinedAt')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username avatar reputation'
        }
      })
      .populate('acceptedAnswer')
      .populate('moderatedBy', 'username');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment views
    question.views += 1;
    await question.save();

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create question
// @route   POST /api/questions
// @access  Private
export const createQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, tags } = req.body;

    const question = new Question({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase()),
      author: req.user._id
    });

    await question.save();

    // Update user's question count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { questionsCount: 1 }
    });

    // Populate author info
    await question.populate('author', 'username avatar reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update question
// @route   PUT /api/questions/:id
// @access  Private
export const updateQuestion = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check ownership or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, tags } = req.body;

    question.title = title || question.title;
    question.description = description || question.description;
    question.tags = tags ? tags.map(tag => tag.toLowerCase()) : question.tags;

    await question.save();

    await question.populate('author', 'username avatar reputation');

    res.json({
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete question
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check ownership or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete associated answers
    await Answer.deleteMany({ question: question._id });

    // Delete associated notifications
    await Notification.deleteMany({ question: question._id });

    await question.deleteOne();

    // Update user's question count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { questionsCount: -1 }
    });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vote on question
// @route   POST /api/questions/:id/vote
// @access  Private
export const voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is voting on their own question
    if (question.author.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot vote on your own question' });
    }

    await question.addVote(req.user._id, voteType);

    res.json({
      message: 'Vote recorded successfully',
      voteCount: question.voteCount
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Accept answer
// @route   POST /api/questions/:id/accept-answer
// @access  Private
export const acceptAnswer = async (req, res) => {
  try {
    const { answerId } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check ownership
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Unaccept previous answer if exists
    if (question.acceptedAnswer) {
      const previousAnswer = await Answer.findById(question.acceptedAnswer);
      if (previousAnswer) {
        await previousAnswer.unacceptAnswer();
      }
    }

    // Accept new answer
    await answer.acceptAnswer(req.user._id);
    question.acceptedAnswer = answerId;
    await question.save();

    // Create notification
    await Notification.create({
      recipient: answer.author,
      sender: req.user._id,
      type: 'accept',
      title: 'Answer Accepted',
      message: `Your answer to "${question.title}" has been accepted!`,
      question: question._id,
      answer: answer._id,
      link: `/questions/${question._id}`
    });

    res.json({
      message: 'Answer accepted successfully',
      acceptedAnswer: answerId
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
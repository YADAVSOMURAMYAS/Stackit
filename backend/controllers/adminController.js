import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import Tag from '../models/Tag.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalTags = await Tag.countDocuments();
    
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const pendingQuestions = await Question.countDocuments({ status: 'active' });
    const acceptedAnswers = await Answer.countDocuments({ isAccepted: true });

    // Recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username email joinedAt');

    const recentQuestions = await Question.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author createdAt');

    res.json({
      stats: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalTags,
        bannedUsers,
        pendingQuestions,
        acceptedAnswers
      },
      recentActivity: {
        users: recentUsers,
        questions: recentQuestions
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, banned } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (banned === 'true') query.isBanned = true;
    if (banned === 'false') query.isBanned = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Admin
export const toggleUserBan = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    user.isBanned = !user.isBanned;
    user.bannedBy = req.user._id;
    user.bannedAt = user.isBanned ? new Date() : null;
    user.banReason = user.isBanned ? reason : null;

    await user.save();

    // Create notification
    if (user.isBanned) {
      await Notification.create({
        recipient: user._id,
        sender: req.user._id,
        type: 'alert',
        title: 'Account Banned',
        message: `Your account has been banned. Reason: ${reason}`,
        link: '/contact'
      });
    }

    res.json({
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Toggle user ban error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Moderate question
// @route   PUT /api/admin/questions/:id/moderate
// @access  Admin
export const moderateQuestion = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.status = status;
    question.isModerated = true;
    question.moderatedBy = req.user._id;
    question.moderatedAt = new Date();
    question.moderationReason = reason;

    await question.save();

    // Create notification for question author
    await Notification.create({
      recipient: question.author,
      sender: req.user._id,
      type: 'moderation',
      title: 'Question Moderated',
      message: `Your question "${question.title}" has been ${status}. Reason: ${reason}`,
      question: question._id,
      link: `/questions/${question._id}`
    });

    res.json({
      message: 'Question moderated successfully',
      question
    });
  } catch (error) {
    console.error('Moderate question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Moderate answer
// @route   PUT /api/admin/answers/:id/moderate
// @access  Admin
export const moderateAnswer = async (req, res) => {
  try {
    const { reason } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.isModerated = true;
    answer.moderatedBy = req.user._id;
    answer.moderatedAt = new Date();
    answer.moderationReason = reason;

    await answer.save();

    // Create notification for answer author
    await Notification.create({
      recipient: answer.author,
      sender: req.user._id,
      type: 'moderation',
      title: 'Answer Moderated',
      message: `Your answer has been moderated. Reason: ${reason}`,
      answer: answer._id,
      link: `/questions/${answer.question}`
    });

    res.json({
      message: 'Answer moderated successfully',
      answer
    });
  } catch (error) {
    console.error('Moderate answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Send platform alert
// @route   POST /api/admin/alerts
// @access  Admin
export const sendAlert = async (req, res) => {
  try {
    const { title, message } = req.body;

    // Get all users
    const users = await User.find({ isBanned: false });

    // Create notifications for all users
    const notifications = users.map(user => ({
      recipient: user._id,
      sender: req.user._id,
      type: 'alert',
      title,
      message,
      link: '/'
    }));

    await Notification.insertMany(notifications);

    res.json({
      message: `Alert sent to ${users.length} users successfully`
    });
  } catch (error) {
    console.error('Send alert error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get moderation queue
// @route   GET /api/admin/moderation-queue
// @access  Admin
export const getModerationQueue = async (req, res) => {
  try {
    const { type = 'questions', page = 1, limit = 20 } = req.query;

    let query = {};
    if (type === 'questions') {
      query = { status: 'active' };
    } else if (type === 'answers') {
      query = { isModerated: false };
    }

    let items, total;
    if (type === 'questions') {
      items = await Question.find(query)
        .populate('author', 'username')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      total = await Question.countDocuments(query);
    } else {
      items = await Answer.find(query)
        .populate('author', 'username')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      total = await Answer.countDocuments(query);
    }

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
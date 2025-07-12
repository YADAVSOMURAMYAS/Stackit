import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  voteCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'duplicate', 'off-topic'],
    default: 'active'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: {
    type: Date
  },
  moderationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Calculate vote count
questionSchema.methods.calculateVoteCount = function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
};

// Check if user has voted
questionSchema.methods.hasUserVoted = function(userId) {
  const hasUpvoted = this.votes.upvotes.includes(userId);
  const hasDownvoted = this.votes.downvotes.includes(userId);
  return { hasUpvoted, hasDownvoted };
};

// Add vote
questionSchema.methods.addVote = function(userId, voteType) {
  if (voteType === 'upvote') {
    // Remove from downvotes if exists
    this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
    // Add to upvotes if not already there
    if (!this.votes.upvotes.includes(userId)) {
      this.votes.upvotes.push(userId);
    }
  } else if (voteType === 'downvote') {
    // Remove from upvotes if exists
    this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
    // Add to downvotes if not already there
    if (!this.votes.downvotes.includes(userId)) {
      this.votes.downvotes.push(userId);
    }
  }
  
  this.voteCount = this.calculateVoteCount();
  return this.save();
};

// Remove vote
questionSchema.methods.removeVote = function(userId) {
  this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
  this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
  this.voteCount = this.calculateVoteCount();
  return this.save();
};

export default mongoose.model('Question', questionSchema); 
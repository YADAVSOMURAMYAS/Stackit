import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
answerSchema.methods.calculateVoteCount = function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
};

// Check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  const hasUpvoted = this.votes.upvotes.includes(userId);
  const hasDownvoted = this.votes.downvotes.includes(userId);
  return { hasUpvoted, hasDownvoted };
};

// Add vote
answerSchema.methods.addVote = function(userId, voteType) {
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
answerSchema.methods.removeVote = function(userId) {
  this.votes.upvotes = this.votes.upvotes.filter(id => !id.equals(userId));
  this.votes.downvotes = this.votes.downvotes.filter(id => !id.equals(userId));
  this.voteCount = this.calculateVoteCount();
  return this.save();
};

// Accept answer
answerSchema.methods.acceptAnswer = function(userId) {
  this.isAccepted = true;
  this.acceptedAt = new Date();
  this.acceptedBy = userId;
  return this.save();
};

// Unaccept answer
answerSchema.methods.unacceptAnswer = function() {
  this.isAccepted = false;
  this.acceptedAt = null;
  this.acceptedBy = null;
  return this.save();
};

export default mongoose.model('Answer', answerSchema); 
import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
commentSchema.methods.calculateVoteCount = function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
};

// Check if user has voted
commentSchema.methods.hasUserVoted = function(userId) {
  const hasUpvoted = this.votes.upvotes.includes(userId);
  const hasDownvoted = this.votes.downvotes.includes(userId);
  return { hasUpvoted, hasDownvoted };
};

// Add vote
commentSchema.methods.addVote = function(userId, voteType) {
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

export default mongoose.model('Comment', commentSchema); 
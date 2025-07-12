const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String, 
    required: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    }
  ],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  answers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Answer",
    }
  ],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Answer",
    default: null,
  },
  votes: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);

const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  votes: {
    type: Number,
    default: 0,
  },
  voters: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // tracks users who have voted
    }
  ]
}, { timestamps: true }); // adds createdAt and updatedAt

module.exports = mongoose.model("Answer", answerSchema);

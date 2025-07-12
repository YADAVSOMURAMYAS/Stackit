const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true,
  },
  read: {
    type: Boolean,
    required: true,
    default: false, 
  },
  date: {
    type: Date,
    default: Date.now, 
  },
});

module.exports = mongoose.model("Notification", notificationSchema);

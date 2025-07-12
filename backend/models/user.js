const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
  role:{
    type:String,
    enum:["Admin","Student"],
    required: true
  },
  notifications: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification", 
  },
},{ timestamps: true });

module.exports = mongoose.model("User",userSchema);
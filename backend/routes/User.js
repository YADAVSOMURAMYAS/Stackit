const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Test route
router.get('/test', (req, res) => {
    res.json({ message: "User route working" });
});

// Add user to DB
router.post('/add', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    res.status(201).json({ message: 'User added!', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

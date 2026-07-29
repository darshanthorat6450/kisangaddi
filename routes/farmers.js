const express = require('express');
const router = express.Router();
const Farmer = require('../models/Farmer');

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, village, address, password, location } = req.body;

    const existing = await Farmer.findOne({ mobile });
    if (existing) return res.status(400).json({ message: 'Mobile number already registered!' });

    const farmer = new Farmer({ name, mobile, village, address, password, location });
    await farmer.save();
    res.status(201).json({ message: 'Farmer registered! 🌾', farmer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { mobile, password } = req.body;
    const farmer = await Farmer.findOne({ mobile });
    if (!farmer) return res.status(404).json({ message: 'Mobile number not registered!' });

    const match = await farmer.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Wrong password!' });

    res.json({ message: 'Login successful! 🌾', farmer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET ALL FARMERS
// ─────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const farmers = await Farmer.find().select('-password');
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET SINGLE FARMER
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.params.id).select('-password');
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// ─────────────────────────────────────────
// CREATE BOOKING
// ─────────────────────────────────────────
router.post('/create', async (req, res) => {
  try {
    const {
      farmer, driver, pickupLocation, dropLocation,
      cropType, estimatedWeight, estimatedPrice, distanceKm
    } = req.body;

    const booking = new Booking({
      farmer, driver, pickupLocation, dropLocation,
      cropType, estimatedWeight, estimatedPrice,
      distanceKm: distanceKm || 0
    });

    await booking.save();

    // Populate for response
    const populated = await Booking.findById(booking._id)
      .populate('farmer', 'name mobile village')
      .populate('driver', 'name mobile vehicleType vehicleNumber pricePerKm');

    res.status(201).json({ message: 'Booking created successfully! 📦', booking: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET ALL BOOKINGS
// ─────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('farmer', 'name mobile village')
      .populate('driver', 'name mobile vehicleType vehicleNumber pricePerKm')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET BOOKINGS BY FARMER
// ─────────────────────────────────────────
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const bookings = await Booking.find({ farmer: req.params.farmerId })
      .populate('driver', 'name mobile vehicleType vehicleNumber pricePerKm')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET BOOKINGS BY DRIVER
// ─────────────────────────────────────────
router.get('/driver/:driverId', async (req, res) => {
  try {
    const bookings = await Booking.find({ driver: req.params.driverId })
      .populate('farmer', 'name mobile village')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// UPDATE BOOKING STATUS
// ─────────────────────────────────────────
router.patch('/status/:bookingId', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = status;
    if (status === 'accepted') booking.acceptedAt = Date.now();
    if (status === 'picked') booking.pickedAt = Date.now();
    if (status === 'delivered') booking.deliveredAt = Date.now();

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('farmer', 'name mobile')
      .populate('driver', 'name mobile vehicleType');

    res.json({ message: 'Booking status updated ✅', booking: populated });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
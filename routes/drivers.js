const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// ─────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, vehicleType, vehicleNumber, password, pricePerKm, speciality } = req.body;

    const existing = await Driver.findOne({ mobile });
    if (existing) return res.status(400).json({ message: 'Mobile number already registered!' });

    const driver = new Driver({
      name, mobile, vehicleType, vehicleNumber, password,
      pricePerKm: pricePerKm || 15,
      speciality: speciality || ''
    });

    await driver.save();
    res.status(201).json({ message: 'Driver registered! 🚜', driver });
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
    const driver = await Driver.findOne({ mobile });
    if (!driver) return res.status(404).json({ message: 'Mobile number not registered!' });

    const match = await driver.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Wrong password!' });

    res.json({ message: 'Login successful! 🚜', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET ALL DRIVERS
// ─────────────────────────────────────────
router.get('/all', async (req, res) => {
  try {
    const drivers = await Driver.find().select('-password');
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET NEARBY DRIVERS (within X km of a location)
// ─────────────────────────────────────────
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 50, vehicleType } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng query params required' });
    }

    const allDrivers = await Driver.find({ isOnline: true }).select('-password');

    // Haversine distance filter
    function haversine(la1, lo1, la2, lo2) {
      const R = 6371;
      const dLa = (la2 - la1) * Math.PI / 180;
      const dLo = (lo2 - lo1) * Math.PI / 180;
      const a = Math.sin(dLa/2)**2 + Math.cos(la1*Math.PI/180) * Math.cos(la2*Math.PI/180) * Math.sin(dLo/2)**2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    let nearby = allDrivers
      .filter(d => d.currentLocation && d.currentLocation.lat != null && d.currentLocation.lng != null)
      .map(d => ({
        ...d.toObject(),
        distanceFromFarmer: haversine(+lat, +lng, d.currentLocation.lat, d.currentLocation.lng)
      }))
      .filter(d => d.distanceFromFarmer <= +radius)
      .sort((a, b) => a.distanceFromFarmer - b.distanceFromFarmer);

    // Filter by vehicle type if provided
    if (vehicleType) {
      nearby = nearby.filter(d => d.vehicleType === vehicleType);
    }

    // Remove password from response
    nearby = nearby.map(d => { const {password, ...rest} = d; return rest; });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// GET SINGLE DRIVER
// ─────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id).select('-password');
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// ✅ UPDATE DRIVER LOCATION (called every few seconds when online)
// ─────────────────────────────────────────
router.patch('/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      {
        currentLocation: { lat: latitude, lng: longitude, updatedAt: new Date() },
        isOnline: true
      },
      { new: true }
    ).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ success: true, driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// ✅ UPDATE DRIVER SETTINGS (price, vehicle, speciality)
// ─────────────────────────────────────────
router.patch('/:id/settings', async (req, res) => {
  try {
    const { pricePerKm, vehicleType, vehicleNumber, speciality } = req.body;

    const updateFields = {};
    if (pricePerKm !== undefined) updateFields.pricePerKm = pricePerKm;
    if (vehicleType !== undefined) updateFields.vehicleType = vehicleType;
    if (vehicleNumber !== undefined) updateFields.vehicleNumber = vehicleNumber;
    if (speciality !== undefined) updateFields.speciality = speciality;

    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Settings updated! ✅', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// ✅ UPDATE DRIVER ONLINE STATUS
// ─────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { isOnline },
      { new: true }
    ).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: `Driver is now ${isOnline ? 'Online 🟢' : 'Offline ⚫'}`, driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ─────────────────────────────────────────
// ✅ UPDATE TRIP ROUTE
// ─────────────────────────────────────────
router.patch('/:id/trip-route', async (req, res) => {
  try {
    const { from, to, fromLat, fromLng, toLat, toLng } = req.body;
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { tripRoute: { from, to, fromLat, fromLng, toLat, toLng } },
      { new: true }
    ).select('-password');

    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    res.json({ message: 'Trip route saved! 🗺️', driver });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
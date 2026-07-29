const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const DriverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['Mini Tempo', 'Truck', 'Tractor'],
    required: true
  },
  vehicleNumber: {
    type: String,
    trim: true
  },

  // ✅ NEW: Price per KM set by driver
  pricePerKm: {
    type: Number,
    default: 15,
    min: 5,
    max: 200
  },

  // ✅ NEW: Driver speciality (e.g. "Onion trips", "Long distance")
  speciality: {
    type: String,
    trim: true,
    default: ''
  },

  // ✅ NEW: Current GPS location (updated every few seconds when online)
  currentLocation: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    updatedAt: { type: Date, default: null }
  },

  // ✅ NEW: Online/Offline status
  isOnline: {
    type: Boolean,
    default: false
  },

  // ✅ NEW: Trip route driver has set
  tripRoute: {
    from: { type: String, default: '' },
    to: { type: String, default: '' },
    fromLat: { type: Number, default: null },
    fromLng: { type: Number, default: null },
    toLat: { type: Number, default: null },
    toLng: { type: Number, default: null }
  },

  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
DriverSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Driver', DriverSchema);
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  pickupLocation: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  dropLocation: {
    address: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },

  // ✅ NEW: Distance in KM (calculated by frontend using Haversine)
  distanceKm: {
    type: Number,
    default: 0
  },

  cropType: {
    type: String,
    required: true
  },
  estimatedWeight: {
    type: Number,
    required: true
  },
  estimatedPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'picked', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  pickedAt: Date,
  deliveredAt: Date
});

module.exports = mongoose.model('Booking', BookingSchema);
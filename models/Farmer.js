const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FarmerSchema = new mongoose.Schema({
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
  village: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },

  // ✅ Farmer's default location (set from profile)
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
FarmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password for login
FarmerSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Farmer', FarmerSchema);
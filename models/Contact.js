const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    default: "",
    trim: true,
  },
  address: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  pincode: {
    type: String,
    default: "",
    trim: true,
  },
  message: {
    type: String,
    default: "",
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Contact", ContactSchema);

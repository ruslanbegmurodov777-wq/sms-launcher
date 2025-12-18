const { validationResult } = require('express-validator');
const Phone = require('../models/Phone');

// Get all phone numbers for user
exports.getPhones = async (req, res) => {
  try {
    const phones = await Phone.find({ user: req.userId }).sort({ createdAt: -1 });
    res.json({ phones });
  } catch (error) {
    console.error('GetPhones error:', error);
    res.status(500).json({ message: 'Error fetching phone numbers' });
  }
};

// Add new phone number
exports.addPhone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, number } = req.body;

    // Normalize phone number (remove spaces, keep + and digits)
    const normalizedNumber = number.replace(/[\s\-()]/g, '');

    const phone = new Phone({
      user: req.userId,
      name: name.trim(),
      number: normalizedNumber
    });

    await phone.save();
    res.status(201).json({ message: 'Phone number added', phone });
  } catch (error) {
    console.error('AddPhone error:', error);
    res.status(500).json({ message: 'Error adding phone number' });
  }
};

// Delete phone number
exports.deletePhone = async (req, res) => {
  try {
    const phone = await Phone.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!phone) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    res.json({ message: 'Phone number deleted' });
  } catch (error) {
    console.error('DeletePhone error:', error);
    res.status(500).json({ message: 'Error deleting phone number' });
  }
};

// Update phone number
exports.updatePhone = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, number } = req.body;
    const normalizedNumber = number.replace(/[\s\-()]/g, '');

    const phone = await Phone.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { name: name.trim(), number: normalizedNumber },
      { new: true }
    );

    if (!phone) {
      return res.status(404).json({ message: 'Phone number not found' });
    }

    res.json({ message: 'Phone number updated', phone });
  } catch (error) {
    console.error('UpdatePhone error:', error);
    res.status(500).json({ message: 'Error updating phone number' });
  }
};

const express = require('express');
const { body } = require('express-validator');
const phoneController = require('../controllers/phoneController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const phoneValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Contact name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('number')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[\d\s\-()]{7,20}$/)
    .withMessage('Please enter a valid phone number')
];

// Routes
router.get('/', phoneController.getPhones);
router.post('/', phoneValidation, phoneController.addPhone);
router.put('/:id', phoneValidation, phoneController.updatePhone);
router.delete('/:id', phoneController.deletePhone);

module.exports = router;

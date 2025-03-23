const { check } = require('express-validator');

exports.validateCreateUser = [
  check('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required'),
  check('email')
    .trim()
    .isEmail()
    .withMessage('Please include a valid email'),
  check('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  check('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
];

exports.validateUpdateUser = [
  check('name')
    .optional()
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name cannot be empty'),
  check('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please include a valid email'),
  check('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Role must be either user or admin')
]; 
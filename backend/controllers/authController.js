const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 409, 'Email already registered.');
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    logger.info(`New user registered: ${email}`);
    return successResponse(res, 201, 'Registration successful', {
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const token = signToken(user._id);

    logger.info(`User logged in: ${email}`);
    return successResponse(res, 200, 'Login successful', {
      token,
      user: user.toPublicJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/profile
const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, 200, 'Profile fetched', req.user.toPublicJSON());
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getProfile };

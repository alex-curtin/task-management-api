const express = require('express');

const authController = require('../controllers/authController');
const { catchErrors } = require('./helpers');

const router = express.Router();

router.post(
  '/signup',
  authController.signupValidators,
  catchErrors(authController.validateSignup),
  catchErrors(authController.signup),
  catchErrors(authController.signin)
);

router.post(
  '/signin',
  authController.signinValidators,
  catchErrors(authController.validateSignin),
  catchErrors(authController.signin)
);

module.exports = router;

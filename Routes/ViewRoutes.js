const express = require('express');
const viewController = require('../controllers/ViewController');
const authController = require('../controllers/AuthController');
const bookingsController = require('../controllers/BookingController');

const router = express.Router();

router.get(
    '/',
    bookingsController.createBookingCheckout,
    authController.isLoggedIn,
    viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get(
    '/login',
    viewController.redirect,
    authController.isLoggedIn,
    viewController.getLoginForm
);
router.get(
    '/signup',
    viewController.redirect,
    authController.isLoggedIn,
    viewController.getSignupForm
);
router.get(
    '/forgot-password',
    viewController.redirect,
    authController.isLoggedIn,
    viewController.getForgotPasswordForm
);
router.get(
    '/reset-password/:token',
    viewController.redirect,
    authController.isLoggedIn,
    viewController.getResetPasswordForm
);
router.get('/me', authController.protectRoute, viewController.getAccount);
router.get('/my-bookings', authController.protectRoute, viewController.getMyBookings);
// router.post('/update-account', authController.protectRoute, viewController.updateAccount);
module.exports = router;

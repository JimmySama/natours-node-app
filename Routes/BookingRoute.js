const express = require('express');
const bookingController = require('../controllers/BookingController');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.use(authController.protectRoute);
router.get('/checkout/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrictRoute('admin', 'leader'));
router.route('/').get(bookingController.getAllBookings).post(bookingController.createBooking);
router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);
module.exports = router;

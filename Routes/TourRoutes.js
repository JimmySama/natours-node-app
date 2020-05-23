const express = require('express');
const tourController = require('../controllers/TourController');
const authController = require('../controllers/AuthController');
// const reviewController = require('../controllers/ReviewController');
const reviewRouter = require('./ReviewRoute');

const router = express.Router();

//Express Nested Router
router.use('/:tourId/reviews', reviewRouter);
// router.param('id', tourController.checkId);
router.route('/top-5-cheap').get(tourController.aliasTopFiveCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
    .route('/monthly-plan/:year')
    .get(
        authController.protectRoute,
        authController.restrictRoute('admin', 'leader'),
        tourController.getMonthlyPlan
    );
router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protectRoute,
        authController.restrictRoute('admin', 'leader'),
        tourController.addSingleTour
    );
router
    .route('/:id')
    .get(tourController.getSingleTour)
    .patch(
        authController.protectRoute,
        authController.restrictRoute('admin', 'leader'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateSingleTour
    )
    .delete(
        authController.protectRoute,
        authController.restrictRoute('admin', 'leader'),
        tourController.deleteSingleTour
    );

//Simple Nested Route Implementation
// POST /tour/:tourId/reviews
// GET /tour/:tourId/reviews
// GET /tour/:tourId/reviews/:reviewId

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protectRoute,
//         authController.restrictRoute('user'),
//         reviewController.addSingleReview
//     );

module.exports = router;

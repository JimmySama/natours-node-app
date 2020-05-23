const express = require('express');
const reviewController = require('../controllers/ReviewController');
const authorController = require('../controllers/AuthController');

const router = express.Router({ mergeParams: true }); //To get Other router's params

router.use(authorController.protectRoute);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authorController.restrictRoute('user'),
        reviewController.setTourUserIds,
        reviewController.addSingleReview
    );
router
    .route('/:id')
    .get(reviewController.getSingleReview)
    .patch(authorController.restrictRoute('admin', 'user'), reviewController.updateReview)
    .delete(authorController.restrictRoute('admin', 'user'), reviewController.deleteReview);

module.exports = router;

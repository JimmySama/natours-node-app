const Review = require('../models/ReviewModel');
const factory = require('./HandlerFactory');

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (request, response, next) => {
    if (!request.body.tour) {
        request.body.tour = request.params.tourId;
    }
    if (!request.body.user) {
        request.body.user = request.user.id;
    }
    next();
};
exports.getSingleReview = factory.getOne(Review);
exports.addSingleReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

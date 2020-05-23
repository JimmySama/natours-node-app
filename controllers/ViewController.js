const Tour = require('../models/TourModel');
// const User = require('../models/UserModel');
const CatchError = require('../utils/CatchError');
const ErrorHandler = require('../utils/ErrorHandler');
const Bookings = require('../models/BookingModel');

exports.getOverview = CatchError(async (request, response, next) => {
    //Get all tours data
    const tours = await Tour.find();
    response.status(200).render('overview', {
        title: 'Exciting tours for adventurous people',
        tours,
    });
});

exports.getTour = CatchError(async (request, response, next) => {
    const tour = await Tour.findOne({ slug: request.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user',
    });
    if (!tour) {
        return next(new ErrorHandler('No tour found!', 404));
    }
    response.status(200).render('tour', {
        title: tour.name,
        tour,
    });
});

exports.getLoginForm = (request, response) => {
    response.status(200).render('login', {
        title: 'Login',
    });
};
exports.getSignupForm = (request, response) => {
    response.status(200).render('signup', {
        title: 'Signup',
    });
};
exports.getForgotPasswordForm = (request, response) => {
    response.status(200).render('forgotPassword', {
        title: 'Forgot Password',
    });
};

exports.getResetPasswordForm = (request, response) => {
    response.status(200).render('resetPassword', {
        title: 'Reset Password',
        token: request.params.token,
    });
};

exports.getAccount = (request, response) => {
    response.status(200).render('account', {
        title: 'Profile',
    });
};
exports.redirect = CatchError(async (request, response, next) => {
    if (request.cookies.token) {
        return response.redirect('/');
    }
    next();
});

exports.getMyBookings = CatchError(async (request, response, next) => {
    //get all bookings
    const bookings = await Bookings.find({ user: request.user.id });
    //get all tourids
    const tourIds = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIds } });

    response.status(200).render('overview', {
        title: 'Bookings',
        tours,
    });
});
// exports.updateAccount = CatchError(async (request, response, next) => {
//     const updatedUser = await User.findByIdAndUpdate(
//         request.user.id,
//         {
//             name: request.body.name,
//             email: request.body.email,
//         },
//         {
//             new: true,
//             runValidators: true,
//         }
//     );
//     response.status(200).render('account', {
//         title: 'Profile',
//         user: updatedUser,
//     });
// });

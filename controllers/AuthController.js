const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const CatchError = require('../utils/CatchError');
const ErrorHandler = require('../utils/ErrorHandler');
const Mailer = require('../utils/Mail');

const signToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};
const createSendToken = (user, statusCode, response) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    response.cookie('token', token, cookieOptions);

    //remove password from output like POST or PATCH
    user.password = undefined;
    response.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};
exports.signup = CatchError(async (request, response, next) => {
    // const newUser = await User.create(request.body);
    const newUser = await User.create({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
        passwordConfirm: request.body.passwordConfirm,
        passwordChangedAt: request.body.passwordChangedAt,
        role: request.body.role,
        active: request.body.active,
        confirmation: request.body.confirmation,
    });
    const confirmationToken = newUser.createPasswordResetToken();
    const url = `${request.protocol}://${request.get('host')}/api/v1/users/confirmation/${
        newUser.id
    }/${confirmationToken}`;
    // console.log(url);
    await new Mailer(newUser, url).sendWelcome();
    response.status(200).json({
        status: 'success',
        message: 'Confirmation email is successfully sent',
    });
    // createSendToken(newUser, 201, response);
});
exports.confirmation = CatchError(async (request, response, next) => {
    const user = await User.findByIdAndUpdate(request.params.id, { confirmation: true });

    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }
    response.cookie('token', token, cookieOptions);

    //remove password from output like POST or PATCH

    response.status(200).render('confirmation', {
        title: 'Confirmation',
    });
});
exports.login = CatchError(async (request, response, next) => {
    const { email, password } = request.body;
    //CHECK EMAIL & PASSWORD EMPTY OR NOT
    if (!email || !password) {
        return next(new ErrorHandler('Please fill email and password', 400));
    }
    //Take user with email
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next(new ErrorHandler('Email or password is incorrect', 401));
    }
    createSendToken(user, 200, response);
});

exports.logout = (request, response) => {
    response.cookie('token', 'Loggedout', {
        expires: new Date(Date.now() + 1 * 1000),
        httpOnly: true,
    });
    response.status(200).json({ status: 'success' });
};

exports.protectRoute = CatchError(async (request, response, next) => {
    //Check token exist in header
    let token;
    if (request.headers.authorization && request.headers.authorization.startsWith('Bearer')) {
        token = request.headers.authorization.split(' ')[1];
    } else if (request.cookies.token) {
        // eslint-disable-next-line prefer-destructuring
        token = request.cookies.token;
    }
    if (!token) {
        return next(new ErrorHandler('Please login!', 401));
    }
    //Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //Check user exist, user can be deleted after logining and token should be invalid
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new ErrorHandler('This user is no longer existed', 401));
    }

    //Check user update password after login or token
    if (currentUser.changedPassword(decoded.iat)) {
        return next(new ErrorHandler('User recently changed password, please login again', 401));
    }

    request.user = currentUser;
    response.locals.user = currentUser;
    next();
});

exports.isLoggedIn = async (request, response, next) => {
    if (request.cookies.token) {
        try {
            //Verification token
            const decoded = await promisify(jwt.verify)(
                request.cookies.token,
                process.env.JWT_SECRET
            );

            //Check user exist, user can be deleted after logining and token should be invalid
            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            //Check user update password after login or token
            if (currentUser.changedPassword(decoded.iat)) {
                return next();
            }
            //log in user
            response.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};

exports.restrictRoute = (...roles) => {
    return (request, response, next) => {
        // console.log(request.user.role);
        if (!roles.includes(request.user.role)) {
            return next(new ErrorHandler('Permission denied!', 403));
        }
        next();
    };
};

exports.forgotPassword = CatchError(async (request, response, next) => {
    //Get user email address
    const user = await User.findOne({ email: request.body.email });
    if (!user) {
        return next(new ErrorHandler('Invalid email address', 404));
    }
    //Generate random token (not JWT)
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false,
    });
    const resetURL = `${request.protocol}://${request.get('host')}/reset-password/${resetToken}`;
    //send email

    // const message = `To change your password to ${resetURL}`;
    try {
        // await Mailer({
        //     email: user.email,
        //     subject: 'Upgrade your password ( this mail will exprire in 10 min )',
        //     message,
        // });

        await new Mailer(user, resetURL).sendPasswordReset();

        response.status(200).json({
            status: 'success',
            message: 'Forgot password email successfully sent',
        });
    } catch (error) {
        user.passwordResetExpire = undefined;
        user.passwordResetToken = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new ErrorHandler('There was an error sending email', 500));
        // console.log(error);
    }
});
exports.resetPassword = CatchError(async (request, response, next) => {
    //Get user based on token
    const hashedToken = crypto.createHash('sha256').update(request.params.token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() },
    });

    //If token has expired, send eror
    if (!user) {
        return next(
            new ErrorHandler(
                'Token is invalid or has expired, please fill email again to get new email',
                400
            )
        );
    }
    //If not, set new password
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    //Log the user in, send JWT token
    createSendToken(user, 200, response);
});

exports.updatePassword = CatchError(async (request, response, next) => {
    //Get User from collection
    const user = await User.findById(request.user._id).select('+password');

    //check password correct
    if (!(await user.checkPassword(request.body.passwordCurrent, user.password))) {
        return next(new ErrorHandler('Current password is incorrect', 401));
    }

    //password correct, update password
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    await user.save();
    //log user in and send JWT
    createSendToken(user, 200, response);
});

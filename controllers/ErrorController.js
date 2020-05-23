const fs = require('fs');
const ErrorHandler = require('../utils/ErrorHandler');

const handleCastError = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`;
    return new ErrorHandler(message, 400);
};
const handleDuplicateError = (error) => {
    const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0].replace(/"/g, '');

    const message = `The value : ${value} is already exists. Please try another one`;
    return new ErrorHandler(message, 400);
};
const handleValidationError = (error) => {
    const errors = Object.values(error.errors)
        .map((cur) => cur.message)
        .join('. ');

    const message = `Invalid input data: ${errors}`;
    return new ErrorHandler(message, 400);
};
const handleJsonWebTokenError = () => new ErrorHandler('Invalid token, please login again!', 401);
const handleTokenExpiredError = () => new ErrorHandler('Token expired, please login again!', 401);

const sendDevError = (error, request, response) => {
    if (request.originalUrl.startsWith('/api')) {
        return response.status(error.statusCode).json({
            status: error.status,
            message: error.message,
            error: error,
            stack: error.stack,
        });
    }
    console.error(error);
    response.status(error.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: error.message,
    });
};
const sendProError = (error, request, response) => {
    if (request.originalUrl.startsWith('/api')) {
        if (error.isOperational) {
            return response.status(error.statusCode).json({
                status: error.status,
                message: error.message,
            });
        }
        fs.writeFile(
            './log.txt',
            `Error: ${new Date().toISOString()} \n ${JSON.stringify(error)}`,
            'utf-8',
            () => {
                console.error('Something went wrong');
            }
        );
        console.error(error);
        return response.status(500).json({
            status: 'Error',
            message: 'Something went wrong!',
        });
    }
    //
    if (error.isOperational) {
        return response.status(error.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: error.message,
        });
    }
    fs.writeFile(
        './log.txt',
        `Error: ${new Date().toISOString()} \n ${JSON.stringify(error)}`,
        'utf-8',
        () => {
            console.error('Something went wrong');
        }
    );
    console.error(error);
    return response.status(error.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Server Error',
    });
};

module.exports = (error, request, response, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendDevError(error, request, response);
    } else if (process.env.NODE_ENV === 'production') {
        let errorObj = error;
        if (errorObj.name === 'CastError') {
            errorObj = handleCastError(errorObj);
        }
        if (errorObj.code === 11000) {
            errorObj = handleDuplicateError(errorObj);
        }

        if (errorObj.name === 'ValidationError') {
            errorObj = handleValidationError(errorObj);
        }
        if (errorObj.name === 'JsonWebTokenError') {
            errorObj = handleJsonWebTokenError();
        }
        if (errorObj.name === 'TokenExpiredError') {
            errorObj = handleTokenExpiredError();
        }
        sendProError(errorObj, request, response);
    }
};

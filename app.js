const path = require('path');
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const tourRouter = require('./Routes/TourRoutes');
const userRouter = require('./Routes/UserRoutes');
const reviewRouter = require('./Routes/ReviewRoute');
const bookingRouter = require('./Routes/BookingRoute');

const ErrorHandler = require('./utils/ErrorHandler');
const GlobalErrorHandler = require('./controllers/ErrorController');
const viewRouter = require('./Routes/ViewRoutes');

const app = express();
//Defining template
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
//Global Middlewares
//Set static file access
app.use(express.static(path.join(__dirname, 'public')));
//Set Security HTTP headers
app.use(helmet());

//Set Development logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

//Set Request limit from same IP
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests, please try again in an hour',
});
app.use('/api', limiter);

//Set body parser to get data from request body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
//Set data sanitizer to prevent NoSQL injection
app.use(mongoSanitize());
//Set data sanitizer to prevent XSS injection
app.use(xss());

//Set prevention of parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsAverage',
            'ratingsQuantity',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

//Test middleware
app.use((request, response, next) => {
    request.requestTime = new Date().toISOString();
    // console.log(request.headers);
    // console.log(request.cookies);
    next();
});

//routes
//render
app.use('/', viewRouter);
//api

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//invalid route
app.all('*', (request, response, next) => {
    next(new ErrorHandler(`cannot find ${request.originalUrl} on the server!`, 404));
});

app.use(GlobalErrorHandler);
//Server

module.exports = app;

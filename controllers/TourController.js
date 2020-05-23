const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/TourModel');
const CatchError = require('../utils/CatchError');
const factory = require('./HandlerFactory');
const ErrorHandler = require('../utils/ErrorHandler');

const multerStorage = multer.memoryStorage();
const multerFilter = (request, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new ErrorHandler('Please upload only image', 400), false);
    }
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = CatchError(async (request, response, next) => {
    if (!request.files.imageCover || !request.files.images) return next();

    //Image Cover
    request.body.imageCover = `tour-${request.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(request.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${request.body.imageCover}`);

    //images
    request.body.images = [];
    await Promise.all(
        request.files.images.map(async (file, index) => {
            const filename = `tour-${request.params.id}-${Date.now()}-${index + 1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);
            request.body.images.push(filename);
        })
    );

    next();
});
exports.aliasTopFiveCheap = (request, response, next) => {
    request.query.limit = '5';
    request.query.sort = 'price,-ratingsAverage';

    next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getSingleTour = factory.getOne(Tour, { path: 'reviews' });
exports.addSingleTour = factory.createOne(Tour);
exports.updateSingleTour = factory.updateOne(Tour);
exports.deleteSingleTour = factory.deleteOne(Tour);

exports.getTourStats = CatchError(async (request, response, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                // _id: null,
                // _id: null,
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: -1 },
        },
        // {
        //     $match: { _id: { $ne: 'EASY' } },
        // },
    ]);

    response.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = CatchError(async (request, response, next) => {
    const year = request.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                totTour: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: {
                month: '$_id',
            },
        },
        {
            $project: {
                _id: 0,
            },
        },
        {
            $sort: { totTour: -1 },
        },
        // {
        //     $limit: 3,
        // },
    ]);

    response.status(200).json({
        status: 'success',
        results: plan.length,
        data: {
            plan,
        },
    });
});

// '/tours-within/:distance/center/:latlng/unit/:unit'
// '/tours-within/322/center/40,50/unit/mi'
exports.getToursWithin = CatchError(async (request, response, next) => {
    const { distance, latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) {
        next(new ErrorHandler('Please provide latitude & longitude', 400));
    }

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    response.status(200).json({
        status: 'success',
        result: tours.length,
        data: {
            data: tours,
        },
    });
});

exports.getDistances = CatchError(async (request, response, next) => {
    const { latlng, unit } = request.params;
    const [lat, lng] = latlng.split(',');
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
    if (!lat || !lng) {
        next(new ErrorHandler('Please provide latitude & longitude', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
            },
        },
        {
            $project: {
                distance: 1,
                name: 1,
            },
        },
    ]);

    response.status(200).json({
        status: 'success',
        data: {
            data: distances,
        },
    });
});

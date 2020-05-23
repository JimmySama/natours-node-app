const CatchError = require('../utils/CatchError');
const ErrorHandler = require('../utils/ErrorHandler');
const APIFeatures = require('../utils/APIFeatures');

exports.createOne = (Model) =>
    CatchError(async (request, response, next) => {
        // const newTour = new Tour({});
        // newTour.save();
        const doc = await Model.create(request.body);
        response.status(201).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.deleteOne = (Model) =>
    CatchError(async (request, response, next) => {
        const doc = await Model.findByIdAndDelete(request.params.id);
        if (!doc) {
            return next(new ErrorHandler('No document found', 404));
        }
        response.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    CatchError(async (request, response, next) => {
        const doc = await Model.findByIdAndUpdate(request.params.id, request.body, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            return next(new ErrorHandler('No document found', 404));
        }
        response.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getOne = (Model, populateOption) =>
    CatchError(async (request, response, next) => {
        let query = Model.findById(request.params.id);
        if (populateOption) {
            query = query.populate(populateOption);
        }
        const doc = await query;

        if (!doc) {
            return next(new ErrorHandler('No document found', 404));
        }
        response.status(200).json({
            status: 'success',
            data: {
                data: doc,
            },
        });
    });

exports.getAll = (Model) =>
    CatchError(async (request, response, next) => {
        //Nested Route for reviews
        let filter = {};
        if (request.params.tourId) filter = { tour: request.params.tourId };

        //Execute Query
        const Features = new APIFeatures(Model.find(filter), request.query)
            .filter()
            .sort()
            .select()
            .paginate();
        // const doc = await Features.query.explain();
        const doc = await Features.query;

        //Send Response
        response.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });

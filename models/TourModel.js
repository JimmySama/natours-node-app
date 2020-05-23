const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./UserModel');

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            minlength: [10, 'A tour name must have at least 10 characters'],
            maxlength: [40, 'A tour name must have at most 40 characters'],
            // validate: [validator.isAlpha, 'Tour name must only contain characters'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            trim: true,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty must be either easy or medium or difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating must be at most 5'],
            set: (value) => Math.round(value * 10) / 10,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    return value < this.price;
                },
                message: 'Discount ({VALUE}) must be lower than actual price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        description: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a imageCover'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            //GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);
//Indexing
//Single Field Index
// tourSchema.index({ price: 1 });
//Multi Field Index
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
//Document Middleware
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});
// tourSchema.pre('save', async function (next) {
//     const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises);
//     next();
// });

// tourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

//Query Middleware
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    next();
});
tourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});
// tourSchema.post(/^find/, function (doc, next) {
//     console.log(doc);
//     next();
// });

//Aggregation Middleware
// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     console.log(this.pipeline());
//     next();
// });
tourSchema.virtual('durationWeek').get(function () {
    return this.duration / 7;
});
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id',
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

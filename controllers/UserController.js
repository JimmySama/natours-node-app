const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/UserModel');
const CatchError = require('../utils/CatchError');
const ErrorHandler = require('../utils/ErrorHandler');
const factory = require('./HandlerFactory');

// const multerStorage = multer.diskStorage({
//     destination: (request, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (request, file, cb) => {
//         const extension = file.mimetype.split('/')[1];
//         cb(null, `user-${request.user.id}-${Date.now()}.${extension}`);
//     },
// });
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
exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = CatchError(async (request, response, next) => {
    if (!request.file) return next();
    request.file.filename = `user-${request.user.id}-${Date.now()}.jpeg`;

    await sharp(request.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${request.file.filename}`);
    next();
});

const filter = (body, ...allowedFields) => {
    const newObj = {};
    Object.keys(body).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = body[el];
        }
    });
    return newObj;
};
exports.getAllUsers = factory.getAll(User);

exports.updateUserProfile = CatchError(async (request, response, next) => {
    // console.log(request.file);
    // console.log(request.body);
    //Password not allowed
    if (request.body.password || request.body.passwordConfirm) {
        return next(new ErrorHandler("You can't update password in here.", 400));
    }

    //update data
    const filteredBody = filter(request.body, 'name', 'email');
    if (request.file) {
        filteredBody.photo = request.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(request.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    response.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.deactivateAccount = CatchError(async (request, response, next) => {
    await User.findByIdAndUpdate(request.user.id, { active: false });
    response.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getCurrentUser = (request, response, next) => {
    request.params.id = request.user.id;
    next();
};
exports.getSingleUser = factory.getOne(User);
exports.updateSingleUser = factory.updateOne(User);
exports.deleteSingleUser = factory.deleteOne(User);

const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please tell us your email'],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide valid email'],
    },
    password: {
        type: String,
        required: [true, 'Password must be filled'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            validator: function (value) {
                return value === this.password;
            },
            message: 'Passwords do not match',
        },
    },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'guide', 'leader', 'admin'],
        default: 'user',
    },
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    confirmation: {
        type: Boolean,
        default: false,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    //Only run the password update or create
    if (!this.isModified('password')) return next();

    //hash password
    this.password = await bcrypt.hash(this.password, 12);
    //Delete confirm password
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    //this points current query
    this.find({ active: { $ne: false } });
    next();
});
userSchema.methods.checkPassword = async function (password, hashPassword) {
    return await bcrypt.compare(password, hashPassword);
};

userSchema.methods.changedPassword = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(changedTimeStamp, JWTTimeStamp);
        return JWTTimeStamp < changedTimeStamp;
    }
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;
    // console.log(resetToken, this.passwordResetToken);
    return resetToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;

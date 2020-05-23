const express = require('express');

const userController = require('../controllers/UserController');
const authController = require('../controllers/AuthController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.get('/confirmation/:id/:token', authController.confirmation);

//Protect route
router.use(authController.protectRoute);

router.get('/me', userController.getCurrentUser, userController.getSingleUser);
router.patch('/update-password', authController.updatePassword);
router.patch(
    '/update-profile',
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUserProfile
);
router.delete('/deactivation', userController.deactivateAccount);

router.use(authController.restrictRoute('admin'));
router.route('/').get(userController.getAllUsers);

router
    .route('/:id')
    .get(userController.getSingleUser)
    .patch(userController.updateSingleUser)
    .delete(userController.deleteSingleUser);

module.exports = router;

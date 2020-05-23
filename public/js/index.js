/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { forgotPassword, resetPassword } from './password';
import { displayMap } from './mapbox';
import { updateAccount } from './account';
import { bookTour } from './stripe';

//DOMS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const forgotPasswordForm = document.querySelector('.form--forgotPassword');
const resetPasswordForm = document.querySelector('.form--resetPassword');
const logoutBtn = document.querySelector('.nav__el--logout');
const profileForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');

const checkOutBtn = document.getElementById('check-out-btn');
//DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('login-btn').textContent = 'Processing...';
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        await login(email, password);
        document.getElementById('login-btn').textContent = 'Login';
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('signup-btn').textContent = 'Processing..';
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        await signup(name, email, password, passwordConfirm);
        document.getElementById('signup-btn').textContent = 'Sign up';
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('forgot-password-btn').textContent = 'Processing..';

        const email = document.getElementById('email').value;
        await forgotPassword(email);
        document.getElementById('forgot-password-btn').textContent = 'Send';
    });
}

if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.getElementById('reset-password-btn').textContent = 'Processing..';
        console.log(document.getElementById('token').value);
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        await resetPassword(password, passwordConfirm, document.getElementById('token').value);
        document.getElementById('reset-password-btn').textContent = 'Update';
    });
}
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        console.log(document.getElementById('photo').files[0]);
        // console.log(form);
        await updateAccount(form, 'profile');
    });
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating....';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateAccount({ passwordCurrent, password, passwordConfirm }, 'password');
        document.querySelector('.btn--save-password').textContent = 'Save password';
    });
}

if (checkOutBtn) {
    checkOutBtn.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        const { tourid } = e.target.dataset;
        await bookTour(tourid);
        e.target.textContent = 'Book tour now';
    });
}

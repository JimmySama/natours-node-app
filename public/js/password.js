/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/forgot-password',
            data: {
                email,
            },
        });

        if (result.data.status === 'success') {
            showAlert('success', result.data.message);
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

export const resetPassword = async (password, passwordConfirm, token) => {
    try {
        const result = await axios({
            method: 'PATCH',
            url: `http://127.0.0.1:3000/api/v1/users/reset-password/${token}`,
            data: {
                password,
                passwordConfirm,
            },
        });

        if (result.data.status === 'success') {
            showAlert('success', 'Password updated successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

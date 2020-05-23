/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
    try {
        const result = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm,
            },
        });

        if (result.data.status === 'success') {
            showAlert('success', result.data.message);
            window.setTimeout(() => {
                location.reload(true);
            }, 5000);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

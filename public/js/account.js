/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
//type : password or profile
export const updateAccount = async (data, type) => {
    try {
        const url =
            type === 'password'
                ? ' http://127.0.0.1:3000/api/v1/users/update-password/'
                : 'http://127.0.0.1:3000/api/v1/users/update-profile';
        const result = await axios({
            method: 'PATCH',
            url,
            data,
        });
        if (result.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated successfully!`);
            location.reload(true);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

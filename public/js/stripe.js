/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_nsanZnV470i9Jd6CV2f8MmTd00JDT6S7NK');

export const bookTour = async (tourId) => {
    try {
        //get checkout session
        const session = await axios(`
    http://127.0.0.1:3000/api/v1/bookings/checkout/${tourId}
    `);
        console.log(session);
        //create checkout form and charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
};

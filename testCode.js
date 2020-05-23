// app.get('/', (request, response) => {
//     // response.status(200).send('Hello from server');
//     response.status(200).json({ name: 'Natours', type: 'Node app' });
// });

// app.post('/', (request, response) => {
//     response.send('You post it');
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getSingleTour);
// app.post('/api/v1/tours', addSingleTour);
// app.patch('/api/v1/tours/:id', updateSingleTour);
// app.delete('/api/v1/tours/:id', deleteSingleTour);

// app.use((request, response, next) => {
//     console.log('Hello from middleware');
//     next();
// });

// if (!tour) {
//     return response.status(404).json({
//         status: 'fail',
//         message: 'Invalid Id',
//     });
// }

// const fs = require('fs');
// const Tour = require('../models/TourModel');

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkId = (request, response, next, value) => {
//     // console.log(value);
//     if (value * 1 > tours.length - 1) {
//         return response.status(404).json({
//             status: 'fail',
//             message: 'Invalid Id',
//         });
//     }
//     next();
// };
// exports.getAllTours = (request, response) => {
//     response.status(200).json({
//         status: 'success',
//         requestedAt: request.requestTime,
//         results: tours.length,
//         data: {
//             tours,
//         },
//     });
// };

// exports.getSingleTour = (request, response) => {
//     const id = request.params.id * 1;
//     const tour = tours.find((el) => el.id === id);

//     response.status(200).json({
//         status: 'success',
//         data: {
//             tour,
//         },
//     });
// };

// exports.checkBody = (request, response, next) => {
//     if (!request.body.name || !request.body.price) {
//         return response.status(400).json({
//             status: 'fail',
//             message: 'Missing name or price',
//         });
//     }
//     next();
// };
// exports.addSingleTour = (request, response) => {
//     const newId = tours[tours.length - 1].id + 1;
//     const newTours = Object.assign({ id: newId }, request.body);
//     tours.push(newTours);
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
//         response.status(201).json({
//             status: 'success',
//             data: {
//                 tours: newTours,
//             },
//         });
//     });
// };

// exports.updateSingleTour = (request, response) => {
//     response.status(200).json({
//         status: 'success',
//         data: {
//             tour: 'Updated tour',
//         },
//     });
// };

// exports.deleteSingleTour = (request, response) => {
//     response.status(204).json({
//         status: 'success',
//         data: null,
//     });
// };

// const tours = await Tour.find().where('difficulty').equals('easy');
//duration: { gt: '5' }

// if (request.query.page) {
//     const numTours = await Tour.countDocuments();
//     if (skip >= numTours) throw new Error('Page not found');
// }

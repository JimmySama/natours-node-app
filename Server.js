const mongoose = require('mongoose');

const dotenv = require('dotenv');
//Handling uncaught exceptions ( Synchronous )
process.on('uncaughtException', (err) => {
    console.log('Server Error...');
    console.log(err.name, err.message);

    process.exit(1);
});
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
// const DB = process.env.DATABASE;

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        // console.log(con.connections);
        console.log('Database connection successful!');
    });

// console.log(app.get('env'));

// console.log(process.env);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running from port ${port}...`);
});

//Handling unhandled rejections ( Asynchronous )
process.on('unhandledRejection', (err) => {
    console.log('Server Error...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

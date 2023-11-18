const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/Fauget_database")


const express = require('express');
const app = express();
const session = require('express-session');

app.use(session(
    {
        secret: 'key',
        resave: false,
        saveUninitialized: true,
        cookie:{
            maxAge:6000000
        }
    }));

const path = require('path');
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, '/public/img')));
app.use('/CSS', express.static(path.join(__dirname, '/public/CSS')));
app.use('/js', express.static(path.join(__dirname, '/public/js')));
app.use('/img', express.static(path.join(__dirname, '/public/productImages')));


const userRoute = require('./routes/userRoute');
app.use('/', userRoute);

const adminRoute = require('./routes/adminRoute');
app.use('/', adminRoute);




app.listen(3000, () => {
    console.log("Server started");

})
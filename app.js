const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

var app = express();
const port = process.env.PORT || 3000;

//middleware for body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(passport.initialize());

//config for jwt-strategy
require('./strategies/jsonWtStrategy')(passport);


//bring all routes
const auth = require('./routes/api/auth');
const profile = require('./routes/api/profile');
const question = require('./routes/api/questions');

//mongodb configuration

const { mongourl } = require('./setup/myUrl');


// console.log('mongourl : ',mongourl);

mongoose.connect(mongourl)
        .then( () => console.log('mongo connected successfully'))
        .catch( err => console.log(`err : ${err}`));



//@type    -  GET
//@route   -  /api
//@desc    -  just for testing
//@access  -  PUBLIC
app.get('/' , (req,res) => {
    res.send('hey there , big stack')
});


// actual routes
//@type    -  POST
//@route   -  /api/auth
//@desc    -  authentication purpose
//@access  -  PUBLIC
app.use('/api/auth',auth);

//@type    -  GET
//@route   -  /api/profile
//@desc    -  to user profile
//@access  -  PRIVATE
app.use('/api/profile',profile);


//@type    -  GET
//@route   -  /api/question
//@desc    -  to question
//@access  -  PRIVATE
app.use('/api/questions',question);

app.listen(port , () => console.log(`app is running at port ${port}`));
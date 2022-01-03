const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


var app = express();
const port = process.env.PORT || 3000;

//middleware for body-parser
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


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
app.use('/api',profile);


//@type    -  GET
//@route   -  /api/question
//@desc    -  to question
//@access  -  PRIVATE
app.use('/api',question);

app.listen(port , () => console.log(`app is running at port ${port}`));
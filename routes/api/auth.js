const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const jsonwt = require('jsonwebtoken');
const key = require('../../setup/myUrl').secret;
const router = express.Router();



//@type    -  GET
//@route   -  /api/auth
//@desc    -  for authentication
router.get('/auth', (req,res) => {
    res.json({
        msg:'landing in authentication route successfully'
    });
});


//Import schema for person to Register
const Person = require('../../models/Person');


//@type    -  POST
//@route   -  /api/auth/register
//@desc    -  for registration of users
//@access   -  PUBLIC
router.post('/register' , (req,res) => {
    Person.findOne( {email: req.body.email})
          .then(person => {
              if(person){
                  return res.status(400).json({
                      emailError : 'Email already registered in our system'
                  });
              }else{
                  const newPerson = new Person({
                      name:req.body.name,
                      email:req.body.email,
                      password:req.body.password
                  });

                  //Encrypt password using bcrypt
                   bcrypt.genSalt(10 , (err,salt) => {
                       bcrypt.hash( newPerson.password ,salt, (err , hash) => {
                           if(err) throw err;
                           newPerson.password = hash;
                           newPerson.save()
                                    .then( person =>  res.json(person))
                                    .catch( err => console.log(err));
                           
                       });
                   });
                  console.log(newPerson);
                //   return res.json(newPerson)
              }
          })
          .catch( err => console.log(err));
});


//@type    -  POST
//@route   -  /api/auth/login
//@desc    -  for login of users
//@acess   -  PUBLIC
router.post('/login',(req,res) => {
    const email = req.body.email;
    const password = req.body.password;

    Person.findOne({email})
          .then( person => {
              if(!person){
                  return res.status(404).json({
                      loginerr:'user not found with this email'
                  })
              }
              bcrypt.compare(password, person.password )
                    .then( result => {
                        if(result){
                            // return res.json({
                            //     msg:'user logged in sucesfully',
                            //     user:person
                            // });
                            //TODO:user payload and create token for user
                            const payload = {
                                id:person.id,
                                name:person.name,
                                email:person.email
                            }
                            jsonwt.sign( payload ,
                                         key ,
                                        { expiresIn: 24 * 3600},
                                        (err,token) => {
                                            if(err) throw err;
                                           return res.json({
                                                sucsess:true,
                                                token : 'Bearer ' + token
                                            })
                                        });
                        }else{
                        return res.status(400).json({
                            msg:'incorrect password'
                        });
                    }
                    })
                    .catch(err => console.log(err));      

          })
          .catch(err => console.log(err));
})


//@type    -  POST
//@route   -  /api/auth/profile
//@desc    -  for serving user profile
//@access   -  PRIVATE

router.get('/profile' ,passport.authenticate('jwt',{session:false}), 
(req,res) => {
    const user = req.user;
    res.json({
       id : user.id,
       name: user.name,
       email:user.email,
       profilepic:user.profilepic
    });
    console.log(req.user);
})

module.exports = router;
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
//@acess   -  PUBLIC

router.post('/register' , (req,res) => {
    Person.findOne( {email: req.body.email})
          .then(person => {
              if(person){
                  return res.status(400).json({
                      emailError : 'Email already registered in out system'
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
                            return res.json({
                                msg:'user logged in sucesfully',
                                user:person
                            });
                        }
                        return res.status(400).json({
                            msg:'incorrect password'
                        });
                    })
                    .catch(err => console.log(err));      

          })
          .catch(err => console.log(err));
})

module.exports = router;
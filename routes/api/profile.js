const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

//load person model
const Person = require("../../models/Person");

//load person model
const Profile = require("../../models/Profile");

//@type    -  GET
//@route   -  /api/profile
//@desc    -  a route for personal user profile
//@access   -  PRIVATE

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
      console.log('id ',req.user.id);
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (!profile) {
          return res.status(404).json({
            error: "user profile not found",
          });
        }
        return res.json(profile);
      })
      .catch((err) => console.log("got some error in profile : ", err));
  }
);

//@type    -  POST
//@route   -  /api/profile
//@desc    -  a route for updating/saving perosnal user profile
//@access   -  PRIVATE

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const profileValues = {};
    profileValues.user = req.user.id;
    if (req.body.username) profileValues.username = req.body.username;
    if (req.body.website) profileValues.website = req.body.website;
    if (req.body.country) profileValues.country = req.body.country;
    if (req.body.portfolio) profileValues.portfolio = req.body.portfolio;

    if (req.body.languages && typeof req.body.languages !== undefined) {
      profileValues.languages = req.body.languages.split(",");
    }
    // console.log(req.body);

    //getting social links
    profileValues.social = {}
    if (req.body.youtube) profileValues.social.youtube = req.body.youtube;
    if (req.body.instagram) profileValues.social.instagram = req.body.instagram;
    if (req.body.linkedin) profileValues.social.linkedin = req.body.linkedin;

    //database operations
    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        if (profile) {
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileValues },
            { new: true }
          ).then((profile) => {
              res.json(profile)
                 .catch((err) => console.log("problem in update", err));
            }).catch((err) => console.log("problem in error ", err));
        }else{
            Profile.findOne( { username: profileValues.username } )
                    .then( profile => {
                        //username already exist
                        if(profile){
                            res.status(400).json({ msg:'username already in used'});
                        }else{
                            //save user
                            new Profile(profileValues)
                            .save()
                            .then( profile => res.json(profile))
                            .catch( err => console.log('error in saving profilevalues:',err));
                        }
                    })
                    // .catch( err => console.log('error in finding username ',err));
        }
      }).catch((err) => console.log("problem in ferching error:", err));
  }
);


//@type    -  GET
//@route   -  /api/profile/:username
//@desc    -  a route for getting user profile based on USERNAME
//@access   -  PUBLIC
router.get('/:username',(req, res) => {
        Profile.findOne({ username :req.params.username})
               .populate('user',['name','profilepic'])
               .then(profile => {
                   if(!profile){
                        return res.status(404).json({msg:'user not found'});
                    }
                    res.json(profile);

               })
               .catch(err => console.log('error in fetching profile based on userprofile',err));
});

//@type    -  GET
//@route   -  /api/profile/everyone
//@desc    -  a route for getting user profile of everyone
//@access   -  PUBLIC

router.get('/find/everyone',(req, res) => {
    Profile.find()
           .populate('user',['name','profilepic'])
           .then(profile => {
               if(!profile){
                    return res.status(404).json({msg:'not profiles was found'});
                }
                res.json(profile);

           })
           .catch(err => console.log('error in fetching all profiles based on userprofile',err));
});



//@type    -  DELETE
//@route   -  /api/profile/
//@desc    -  a route for deleting user profile based on _ID
//@access   -  PRIVATE
router.delete('/',
              passport.authenticate('jwt',{session : false}),
              (req, res) => {
                 Profile.findOne({ user: req.user.id}).then().catch()
                 Profile.findOneAndRemove( { user: req.user.id } )
                        .then( () => {
                            Person.findOneAndRemove( {_id: req.user.id} )
                                  .then(() => res.json({success : 'deleted successfully'}))
                                  .catch(err => console.log());
                        })
                        .catch(err => console.log('error while deleting the profile:',err));
              });


//@type    -  POST
//@route   -  /api/profile/workrole
//@desc    -  a route for work profile of person
//@access   -  PRIVATE
router.post('/workrole',
              passport.authenticate('jwt',{session : false}),
              (req, res) => {
                 Profile.findOne({user: req.user.id})
                        .then( profile => {
                            //aasignment
                            const workrole = {
                                role: req.body.role,
                                company: req.body.company,
                                country: req.body.country,
                                from: req.body.from,
                                to: req.body.to,
                                current: req.body.current,
                                details: req.body.details,
                            };

                            profile.workrole.unshift(workrole);
                            profile.save()
                                   .then(() => res.json({success:'workrole updated successfully'}))
                                   .catch(err => 
                                    console.error('Workrole: error in saving profile',err));

                        })
                        .catch( err => console.log('Workrole:error in finding profile',err));
              });



//@type    -  DELETE
//@route   -  /api/profile/workrole/:w_id
//@desc    -  a route for deleting a specific workrole
//@access   -  PRIVATE
router.delete('/workrole/:w_id',
              passport.authenticate('jwt',{session : false}),
              (req, res) => {
                const w_id = req.params.w_id;
                Profile.findOne({ user: req.user.id})
                       .then( profile => {
                         if(profile){
                           const removethis = profile.workrole
                                                     .map( items => items.id)
                                                     .indexOf(w_id);
                           profile.workrole.splice(removethis,1);
                           profile.save()
                                  .then( profile => {
                                    res.json({
                                      success:'workrole deleted successfully',
                                      profile:profile
                                    })
                                  })
                                  .catch( err => console.log('InDeleteWorkRole: error in saving profile ',err));

                         }
                       })
                       .catch(err => console.log('InDeleteWorkRole: error in finding profile ',err));
              });



module.exports = router;

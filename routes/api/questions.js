const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const router = express.Router();

//load person model
const Person = require("../../models/Person");

//load person model
const Profile = require("../../models/Profile");

//load Question model
const Question = require("../../models/Question");
const { route } = require("./profile");


//@type    -  POST
//@route   -  /api/questions
//@desc    -  a route for submitting questions
//@access   -  PRIVATE
router.post('/',
            passport.authenticate('jwt', { session:false } ),
            (req,res) => {
                const newQuestion = new Question({
                    textone:req.body.textone,
                    texttwo:req.body.texttwo,
                    user:req.user.id,
                    name:req.body.name
                });
                newQuestion.save()
                           .then( question => res.json(question))
                           .catch( err => console.log('InQestionRoute:error in saving new question ',err));
            });


//@type    -  GET
//@route   -  /api/questions
//@desc    -  a route for showing all questions
//@access   -  PUBLIC
router.get('', (req, res) => {
    Question.find()
            .sort({date:'desc'})
            .then( questions => {
                if(!questions){
                    return res.json({msg: 'there is know questions to show'});
                }else{
                    res.json(questions);
                }
            })
            .catch( err => console.log('InAllQuestions: error in getting all questions ',err))
});


//@type    -  POST
//@route   -  /api/questions/answers/:id
//@desc    -  a route for submitting answers for questions
//@access   -  PRILVATE
router.post('/answers/:id' , 
             passport.authenticate('jwt',{session:false}),
             (req,res) => {
                 Question.findById(req.params.id)
                         .then( question => {
                             const newAnswer = {
                                 user:req.user.id,
                                 text:req.body.text,
                                 name:req.user.name
                             };
                             question.answers.unshift(newAnswer);
                             question.totalAns++;
                             question.save()
                                     .then( question => res.json({
                                         msg:'answer added successfully',
                                         question:question
                                     }))
                                     .catch( err => console.log('InAnswers: error in saving questions again :',err))
                         })
                         .catch(err => console.log('InAnswers: error in finding questions ',err));
             });

//@type    -  POST
//@route   -  /api/questions/upvote/:id
//@desc    -  a route for upvoting answers
//@access   -  PRILVATE
router.post('/upvote/:id',
             passport.authenticate('jwt',{ session:false }),
             (req, res) => {
                 Profile.findOne({user:req.user.id})
                        .then( profile => {
                            Question.findById(req.params.id)
                                    .then( question => {
                                        if(question.upvotes.filter(upvote => 
                                                 upvote.user.toString() === req.user.id.toString()).length > 0){
                                                        return res.status(400).json({
                                                            msg:'user already upvoted to this question'
                                                        });
                                                 }
                                        question.upvotes.unshift({user:req.user.id});
                                        question.save()
                                                .then(question => res.json(question))
                                                .catch( err => console.log('InUpvote: error in saving question ',err))
                                    })
                                    .catch( err => console.log('error in finding question ',err))
                        })
                        .catch(err => console.log('InUpvote:error in finding profile :',err));
             });



//TODO:
// Removing Upvoting
//Deleting question
//Deleting all Questions
//like to an answers


module.exports = router;
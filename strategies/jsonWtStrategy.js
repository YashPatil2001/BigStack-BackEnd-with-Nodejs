const JwtStrategy = require('passport-jwt').Strategy;
const  ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const Person = require('../models/Person');
const key = require('../setup/myUrl').secret;


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = key;


module.exports = passport => {
    
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        Person.findById(jwt_payload.id, (err, person) => {
            if (err) {
                return done(err, false);
            }
            if (person) {
                return done(null, person);
            } 
    
            return done(null, false);
                // or you could create a new account
        });
    }));
    
}


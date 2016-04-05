var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var configAuth = require('./auth');
var flash    = require('connect-flash');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});


passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local-login', new LocalStrategy({
     // by default, local strategy uses username and password, we will override with email
     usernameField : 'username',
     passwordField : 'password',
     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
 },
 function(req, username, password, done) {

     // asynchronous
     process.nextTick(function() {
         User.findOne({ 'local.username' :  username }, function(err, user) {
             // if there are any errors, return the error
             if (err)
                 return done(err);

             // if no user is found, return the message
             if (!user)
                 return done(null, false, { message: 'No user found.' });

             if (!user.validPassword(password))
                 return done(null, false, {message: 'Wrong password.'});

             // all is well, return user
             else
                 return done(null, user);
         });
     });

 }));

 // =========================================================================
 // LOCAL SIGNUP ============================================================
 // =========================================================================
 passport.use('local-signup', new LocalStrategy({
     // by default, local strategy uses username and password, we will override with email
     usernameField : 'username',
     passwordField : 'password',
     passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
 },
 function(req, username, password, done) {
    console.log('inside local-signup');
     // asynchronous
     process.nextTick(function() {

         //  Whether we're signing up or connecting an account, we'll need
         //  to know if the email address is in use.
         User.findOne({'local.username': username}, function(err, existingUser) {

             // if there are any errors, return the error
             if (err)
                 return done(err);

             // check to see if there's already a user with that email
             if (existingUser)
                 return done(null, false, {message: 'That username is already taken.'});

             //  If we're logged in, we're connecting a new local account.
             if(req.user) {
               console.log('Already logged in.')

                 var user            = req.user;
                 user.local.username   = username;
                 user.local.password = user.generateHash(password);
                 user.save(function(err) {
                     if (err)
                         throw err;
                     return done(null, user);
                 });
             }
             //  We're not logged in, so we're creating a brand new user.
             else {
                 // create the user

                 var newUser            = new User();

                 newUser.local.username    = username;
                 newUser.local.password = newUser.generateHash(password);


                 newUser.save(function(err) {
                     if (err)
                         throw err;

                     return done(null, newUser);
                 });
             }

         });
     });

 }));

passport.use(new GoogleStrategy({

        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL,
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({
                    'google.id': profile.id
                }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.google.token) {
                            user.google.token = token;
                            user.google.name = profile.displayName;
                            user.google.email = profile.emails[0].value; // pull the first email

                            user.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, user);
                            });
                        }

                        return done(null, user);
                    } else {
                        var newUser = new User();

                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user = req.user; // pull the user out of the session

                user.google.id = profile.id;
                user.google.token = token;
                user.google.name = profile.displayName;
                user.google.email = profile.emails[0].value; // pull the first email

                user.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, user);
                });

            }

        });

    }));

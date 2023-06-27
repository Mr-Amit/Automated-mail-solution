// import all the things we need  
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const mongoose = require('mongoose')
const User = require('../models/User')


module.exports = function (passport) {
  // console.log('always');
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
        accessType: 'offline',
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        // console.log({ accessToken, refreshToken });
        // console.log('always');

        try {
          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value,
            email: profile.emails[0].value,
            accessToken
          }
          // console.log({newUser});
          //find the user in our database 
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            await User.updateOne({ _id: user._id }, { $set: { accessToken } })
            done(null, user)
          } else {
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  })
}
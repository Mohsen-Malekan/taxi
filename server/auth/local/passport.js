import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

function localAuthenticate(User, mobile, password, done) {
  User.findOne({
    mobile : mobile.toLowerCase()
  }).exec()
    .then(user => {
      if(!user) {
        return done(null, false, {
          message : 'This mobile is not registered.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if(authError) {
          return done(authError);
        }
        if(!authenticated) {
          return done(null, false, { message : 'This password is not correct.' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

export function setup(User/*, config*/) {
  passport.use(new LocalStrategy({
    usernameField : 'mobile',
    passwordField : 'password' // this is the virtual field on the model
  }, function(mobile, password, done) {
    return localAuthenticate(User, mobile, password, done);
  }));
}

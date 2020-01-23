const passport = require('passport');
const { ExtractJwt, Strategy: JWTStrategy } = require("passport-jwt");
const { Strategy: LocalStrategy } = require('passport-local');
const User = require('../models/user');
const Bcrypt = require('bcryptjs');
const SECRET_SIGNING_KEY = 'super_duper_secret'

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},
  function (req, email, password, next) {
    return User.Find(req.db)(email, password)
      .then(user => {
        if (!user || !Bcrypt.compareSync(password, user.password)) {
          return next(null, false, { status: 401, message: 'Incorrect email or password.' });
        }

        return next(null, user, {
          message: 'Logged In Successfully'
        });
      })
      .catch(err => {
        return next(err);
      });
  }
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_SIGNING_KEY,
  passReqToCallback: true
},
  function (req, jwtPayload, cb) {
    req.user_id = jwtPayload._id;
    return cb(null, jwtPayload);
  }
));

module.exports = {
  SECRET_SIGNING_KEY
};
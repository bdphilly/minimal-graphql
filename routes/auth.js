const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/user');
const Bcrypt = require('bcryptjs');
const { SECRET_SIGNING_KEY } = require('../middlewares/passport');

router.post('/login', loginUser);

router.post('/signup', async function (req, res, next) {
  const { db, body } = req;
  const { email, password } = body;
  const resp = await User.Find(db)(email);

  if (!email || !password) {
    return res.status(400).send("missing required payload");
  }

  // user already exists
  if (resp !== null) {
    var err = new Error('A user with this email address already exists.');
    err.status = 409;
    return next(err);
  }

  try {
    const hashedPassword = Bcrypt.hashSync(password, 10);
    const user = await User.Insert(db)(email, hashedPassword);
  } catch (err) {
    return res.status(500).send({ "an error has occurred": err });
  }

  loginUser(req, res, next);
});

function loginUser(req, res, next) {
  return passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: info ? info.message : 'Login failed',
        user: user
      });
    }

    req.login(user, { session: false }, (err) => {
      if (err) {
        res.send(err);
      }

      const passwordStrippedUser = User.StripSensitive(user);
      const token = jwt.sign(passwordStrippedUser, SECRET_SIGNING_KEY);

      return res.json({ user: passwordStrippedUser, token });
    });
  })(req, res);
};

module.exports = router;
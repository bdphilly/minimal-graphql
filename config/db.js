const monk = require('monk');
const db = monk('localhost/twitterclone')

const mountDbOnRequest = function (req, res, next) {
  createIndicies(db);
  req.db = db;
  next();
};

const createIndicies = function (db) {
  db.get('users').createIndex('email');
  db.get('messages').createIndex('userId');
}

module.exports = mountDbOnRequest;
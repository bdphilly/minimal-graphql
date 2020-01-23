const Find = (db) => (email) => {
  const collection = db.get('users');

  return collection.findOne({ email });
}

const Insert = (db) => (email, password) => {
  const collection = db.get('users');

  return collection.insert({
    email,
    password
  });
}

const StripSensitive = (user) => {
  const stripped =  {
    ...user
  };

  delete stripped.password;

  return stripped;
};

module.exports = {
  Find,
  Insert,
  StripSensitive
}


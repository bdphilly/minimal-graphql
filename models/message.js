const GetCollection = (db) => {
  return db.get('messages');
}

const Insert = db => (userId, text) => {

  if (!userId || !text) {
    return new Error("missing params!");
  }

  return GetCollection(db).insert({
    userId,
    text,
    timestamp: new Date()
  });
}

const FindByUserId = db => (userId) => {
  const collection = db.get('messages');

  return GetCollection(db).find({
    userId: userId
  });
}

const Edit = db => (_id, text) => {
  const collection = db.get('messages');

  return GetCollection(db).findOneAndUpdate({ _id }, { $set: { text }});
}

const DeleteById = db => (_id) => {
  const collection = db.get('messages');

  return GetCollection(db).findOneAndDelete({ _id });
}

module.exports = {
  FindByUserId,
  Insert,
  Edit,
  DeleteById
}


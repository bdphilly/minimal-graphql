const { buildSchema } = require('graphql');
const express_graphql = require('express-graphql');
const Message = require('../../models/message');
const subscriptionsEndpoint = `ws://localhost:${process.env.PORT}/subscriptions`;
const { PubSub } = require('graphql-subscriptions');
 
const pubsub = new PubSub();
const MESSAGE_EVENT = 'message_event';

const schema = buildSchema(`
  type Query {
    messages(userId: String): [Message]
  },
  type Mutation {
    newMessage(text: String!): Message
    deleteMessage(id: String!): Message
    editMessage(id: String!, text: String!): Message
  }
  type Subscription {
    message: MessageSubscription
  }
  type Message {
    _id: String
    text: String
    userId: String
  }
  type MessageSubscription {
    mutation: String
    data: Message
  }
`);

const getMessages = (params, req) => {
  return Message.FindByUserId(req.db)(params.userId);
};

const newMessage = (params, req) => {
  pubsub.publish(MESSAGE_EVENT, {
    message: {
      mutation: 'New',
      data: params
    }
  });
  return Message.Insert(req.db)(req.user_id, params.text);
};

const editMessage = (params, req) => {
  pubsub.publish(MESSAGE_EVENT, {
    message: {
      mutation: 'Edit',
      data: params
    }
  });
  return Message.Edit(req.db)(params.id, params.text);
};

const deleteMessage = (params, req) => {
  pubsub.publish(MESSAGE_EVENT, {
    message: {
      mutation: 'Delete',
      data: params
    }
  });
  return Message.DeleteById(req.db)(params.id);
};

// Note: Other resolvers are fn(). The subscription is an object
const subscription = {
  message: {
    subscribe() {
      return pubsub.asyncIterator(MESSAGE_EVENT);
    }
  }
};

const rootValue = ({
  messages: getMessages,
  newMessage,
  deleteMessage,
  editMessage,
  subscription,
});

const setupGraphQL = express_graphql(({
  schema,
  rootValue: rootValue,
  graphiql: true,
  subscriptionsEndpoint
}));

module.exports = {
  setupGraphQL,
  schema
};
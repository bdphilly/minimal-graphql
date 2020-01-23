# Minimal GraphQL Messaging API

## Requirements:
- Node v10
- npm
- mongodb

## Running Locally
- install dependencies: `npm install`
- start mongodb: `mongod`
- run server: `npm run dev`

## Routes

|url|method|Parameters|response|
|---|---|---|---|
|http://localhost:4000/auth/signup|POST|- **email**: string - **password**: string|`Status Code: 409` if account already exists. If successful, same response as login.|
|http://localhost:4000/auth/login|POST|- **email**: string - **password**: string|`Status Code: 400` if bad credentials. Success: **user**: object,  **token**: string|


### Authenticating
- This API is using JWT's. Login/Signup to retrieve a token. Then pass your token as an `Authorization: Bearer {{TOKEN}}` header.

## GraphQL Queries

- To test: Use GraphQL BETA feature in Postman. [Learn More](https://blog.getpostman.com/2019/06/18/postman-v7-2-supports-graphql/)
- Set any random text and set your user id (which you get from previous step) in the `graphql variables` section.

### Getting Messages [GET]
```
query getMessages($userID: String!) {
  messages(userId: $userID) {
    ... on Message {
      text
      _id
      userId
    }
  }
}
```

### New Message [POST]
```
mutation newMessage($text: String!) {
  newMessage(text: $text) {
    ... on Message {
      text
      _id
    }
  }
}
```

### Edit Message [POST]
```
mutation editMessage($id: String!, $text: String!) {
  editMessage(id: $id, text: $text) {
    ... on Message {
      text
      _id
    }
  }
}
```

### Delete Message
```
mutation deleteMessage($id: String!) {
  deleteMessage(id: $id) {
    ... on Message {
      text
      _id
    }
  }
}
```

## Thoughts:
- The authentication uses standard REST routes. The JWT is checked at the node middleware layer via Passport and a future improvement would be to handle user specific authorization via GraphQL, if scopes/permissions were added to the token.
- Opportunities for nesting data as the number of models grow. It wasn't clear how to optimize both mongodb queries as well as GraphQL queries. Led me to `dataloader` which seems to be the consensus to handle the n+1 problem when nesting in GraphQL.
- I tried to setup subscriptions in GraphQL via a websocket subscription server using `subscriptions-transport-ws` but I'm still new to GraphQL and not familiar with the best way to test this shy of making a client and troubleshooting. Need to explore more graphql debug tools.

Future Improvements:
- Avoiding N+1 queries with https://github.com/graphql/dataloader
- Pagination on messages
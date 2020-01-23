const express = require('express');
const auth = require('./routes/auth');
const passport = require('passport');
const bodyParser = require('body-parser'); 
const mountDb = require('./config/db');
const { setupGraphQL, schema } = require('./middlewares/graphql/schema');
const loggingMiddleware = require('./middlewares/logging');
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');

require('./middlewares/passport');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(mountDb);
app.use(loggingMiddleware);

// Routes
app.use('/auth', auth);
app.use('/graphql', passport.authenticate('jwt', { session: false }), setupGraphQL);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.json({ f_error: err });
});

// Mount the express server onto http server so we can setup a subscription server
const webServer = createServer(app);
webServer.listen(process.env.PORT, () => {
  console.log(`Express GraphQL Server is now running on http://localhost:${process.env.PORT}`);

  // Set up the WebSocket for handling GraphQL subscriptions.
  new SubscriptionServer({
      execute,
      subscribe,
      schema,
      onConnect: (params, socket) => {
        // TODO: need to test connections and subscriptions
        console.log('new connection!');
        return true;
      }
  }, {
      server: webServer,
      path: '/subscriptions',
  });
});
const loggingMiddleware = (req, res, next) => {
  console.log('server starting!');
  next();
}

module.exports = loggingMiddleware;
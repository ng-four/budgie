// Session Creation
exports.createSession = function(request, response, user_id) {
  return request.session.regenerate(function() {
    request.session.user = user_id;
    response.status(202).json({
      id: user_id
    });
  });
};

// Login Checks
var isLoggedIn = function(request) {
  return request.session ? !!request.session.user : false;
};

var isLoggedOut = function(request) {
  return !isLoggedIn(request);
};

// Reroute based on Auth status
exports.checkUser = function(request, response, next) {
  if (isLoggedOut(request)) {
    response.sendStatus(401);
  } else {
    next();
  }
};

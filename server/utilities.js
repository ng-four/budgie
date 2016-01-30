var jwt = require('jwt-simple');


exports.createToken = function(request, response, user_id){
  var payload = {'user_id': user_id};
  var secret = "xyz";

  var token = jwt.encode(payload, secret);
  response.set('token', token).json({token: token});
};

exports.checkToken = function(request, response, next){
  console.log(request.headers['x-access-token']);
  var secret = "xyz";

  if(!request.headers['x-access-token']) {
    response.sendStatus(500);
  }

  var decodedToken = jwt.decode(request.headers['x-access-token'], secret);
  request.user = {};
  request.user.id = decodedToken.user_id;
  next();
};

// exports.createSession = function(request, response, user_id) {
//   return request.session.regenerate(function() {
//     request.session.user = user_id;
//     response.status(202).json({
//       id: user_id
//     });
//   });
// };
//
// // Login Checks
// var isLoggedIn = function(request) {
//   return request.session ? !!request.session.user : false;
// };
//
// var isLoggedOut = function(request) {
//   return !isLoggedIn(request);
// };
//
// // Reroute based on Auth status
// exports.checkUser = function(request, response, next) {
//   if (isLoggedOut(request)) {
//     response.sendStatus(401);
//   } else {
//     next();
//   }
// };

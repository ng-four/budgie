angular.module('login.controller', [])
.controller('LoginController', function(AuthServices, $location, $timeout, $state){

  var login = this;

  login.submit = function() {
    var user = {
      email: login.email,
      password: login.password
    };

    AuthServices.submitLogin(user)
    .then(function(token){
      if(token){
        $("#loginModal").modal("hide");
        $location.path('/main/expense');
      } else {
        console.log("Error Authenticating User");
        login.email = '';
        login.password = '';
        login.isInvalid = true;
      }
    }, function(error){
      console.log("Erroring");
      $location.path('/landing/login');
      throw error;
    });

  };

});

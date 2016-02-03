angular.module('login.controller', [])
.controller('LoginController', function(AuthServices, $location, $timeout, $state){

	var login = this;

	login.submit = function() {
		$("#loginModal").modal("hide");
		var user = {
			email: login.email,
			password: login.password
		};

		AuthServices.submitLogin(user)
		.then(function(token){
      if(token){
        $location.path('/main/expense');
      } else {
        console.log("Error Authenticating User");
      }
    }, function(error){
      console.log("Erroring");
      $location.path('/landing/login');
      throw error;
    });

	};

});

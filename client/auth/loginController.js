angular.module('login.controller', [])
.controller('LoginController', function(AuthServices, $location, $timeout, $state){

	var login = this;

	login.submit = function() {
		var user = {
			email: login.email,
			password: login.password
		};

		console.log("login.submit called with ", user);

		AuthServices.submitLogin(user)
			.then(function(resp){
				console.log(resp);
				var changePath = function(){
					$state.go('main.profile');
				}
				$timeout(changePath, 3000);
				
			}, function(error){
				throw error;
			})

	}
	
})

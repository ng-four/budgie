angular.module('login.controller', [])
.controller('LoginController', function(AuthServices, $location, $timeout, $state){

	var login = this;

	login.submit = function() {
		var user = {
			email: login.email,
			password: login.password
		};

		AuthServices.submitLogin(user)
			.then(function(resp){
				console.log(resp);
				var changePath = function(){
					//$state.go('main.profile');
					console.log('logged in; trying to redirect to main/profile');
					$location.path('/main/profile');
				}
				$timeout(changePath, 1000);
				
			}, function(error){
				throw error;
			})

	}
	
})

angular.module('signup.controller', [])
.controller('SignupController', function($location, AuthServices){

	var signup = this;

	signup.submit = function() {

		var userData = {
			email: signup.email,
			password: signup.password,
			full_name: signup.full_name,
			monthly_limit: signup.monthly_limit,
			savings_goal: signup.savings_goal
		}

		console.log("called signup.submit with ", userData);

		AuthServices.submitNewUser(userData)
			.then(function(resp){
				console.log("resp in submit in signup controller", resp);
				//var changePath = function(){
					$location.path('/main/profile');  
				//}
				//setTimeout(changePath, 3000); //  all of this is just temporary till promises are squared away
			}, function(error){
				throw error;
			})
	}
	
})
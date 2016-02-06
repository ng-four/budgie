angular.module('signup.controller', [])
.controller('SignupController', function($location, AuthServices){


	var signup = this;

	signup.submit = function() {
		
		var userData = {
			email: signup.email,
			password: signup.password,
			full_name: signup.full_name,
			monthly_limit: signup.monthly_limit,
			savings_goal: signup.savings_goal,
			total_savings: signup.total_savings
		};

		console.log("called signup.submit with ", userData);

		AuthServices.submitNewUser(userData)
    .then(function(token){
      if(token){
      	$("#loginModal").modal("hide");
        $location.path('/main/expense');
      } else {
        console.log("Error Creating User");
				signup.email = '';
        signup.password = '';
				signup.full_name = '';
				signup.monthly_limit = '';
				signup.savings_goal = '';
				signup.total_savings = '';
        signup.isInvalid = true;
      }
    }, function(error){
      console.log("Erroring");
      $location.path('/landing/login');
      throw error;
    });


			// .then(function(resp){
			// 	console.log("resp in submit in signup controller", resp);
			// 	//var changePath = function(){
			// 		$location.path('/main/profile');
			// 	//}
			// 	//setTimeout(changePath, 3000); //  all of this is just temporary till promises are squared away
			// }, function(error){
			// 	throw error;
			// });
	};

});

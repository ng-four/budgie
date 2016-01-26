angular.module('main.controller', [])
.controller('MainController', function(AuthServices, ProfileServices, $state){

	var main = this;

	main.checkLoginStatus = function(){
		ProfileServices.getProfileData()
			.then(function(success){
				console.log('user (re)authenicated. loading main.expense');
				$state.transitionTo('main.expense');
			}, function(error){
				console.log("user not logged in but budgieID still in local storage");
				if(AuthServices.isAuth()){
					AuthServices.logOut();
				}
			});
	}


			
})

//
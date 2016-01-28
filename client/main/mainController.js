angular.module('main.controller', [])
.controller('MainController', function(AuthServices, ProfileServices, $state, $location){

	$state.transitionTo('main.expense');
	$location.path('/main/expense');
			
})

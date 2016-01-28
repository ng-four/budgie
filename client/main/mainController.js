angular.module('main.controller', [])
.controller('MainController', function(AuthServices, ProfileServices, $state){

	$state.transitionTo('main.expense');
			
})

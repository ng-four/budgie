angular.module('main.controller', [])
.controller('MainController', function($state){
	$state.transitionTo('main.expense');	
})

//
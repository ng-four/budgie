angular.module('main.controller', [])
.controller('MainController', function(AuthServices, ProfileServices, $state, $location){
  var main = this;

	$state.transitionTo('main.expense');
	$location.path('/main/expense');

  main.logout = function(){
    AuthServices.logOut();
  };
});

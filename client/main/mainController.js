angular.module('main.controller', [])
.controller('MainController', function(AuthServices, ProfileServices, $state, $location){
  var main = this;

  main.logout = function(){
    AuthServices.logOut();
  };

  var checkAuth = function(){
  	if(!AuthServices.isAuth()){
  		AuthServices.logOut();
  	}
  }

  checkAuth();
  $state.transitionTo('main.expense');
  $location.path('/main/expense');

});

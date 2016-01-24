angular.module('auth.service', [])  
.factory('AuthServices', function($http, $location, $window) {

	var submitNewUser = function(userData) {
/* format for userData object:
	{
		email:  
		password: 
		full_name:
		monthly_limit:
		savings_goal:
	}
*/
		return $http({
			method: 'POST',			
		 	url: '/signup', 
			data: userData
		}).then(function(resp) {
			console.log("resp in submitNewUser ", resp);
			$window.localStorage.setItem('budgieID', resp.data.sessionID);  // MAKE SURE IT'S CORRECT
			return resp.data;   
		}, function(error) {
  			console.error('Sign up ERROR!!! ', error); 
		})
	};

	var submitLogin = function(userData){
/* format for userData object:
	{
		email:  
		password: 
	}
*/
		return $http({
			method: 'POST',
			url: '/login',
			data: userData
		}).then(function(resp) {
			$window.localStorage.setItem('budgieID', resp.data.sessionID);   // MAKE SURE IT'S CORRECT
			return resp.data;  
		}).catch(function(error) {
  			console.error('Sign in ERROR!!!', error);  								
		})
	};

	var isAuth = function () {
    	return !!$window.localStorage.getItem('budgieID');
  	};

  	var logOut = function () {
    	$window.localStorage.removeItem('budgieID');
    	$location.path('/');
  	};

	return {
		submitNewUser: submitNewUser,
		submitLogin: submitLogin,
		isAuth: isAuth,
		logOut: logOut
	};
})
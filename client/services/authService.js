angular.module('auth.service', [])  
.factory('AuthServices', function($http, $location, $window) {

	var submitNewUser = function(userData) {
		return $http({
			method: 'POST',			
		 	url: '/signup', 
			data: userData
		}).then(function(resp) {
			console.log("resp in submitNewUser ", resp);
			$window.localStorage.setItem('budgieID', resp.data.id); 
			return resp.data;   
		}, function(error) {
  			console.error('Sign up ERROR!!! ', error); 
		})
	};

	var submitLogin = function(userData){
		return $http({
			method: 'POST',
			url: '/login',
			data: userData
		}).then(function(resp) {
			$window.localStorage.setItem('budgieID', resp.data.id); 

			//the not-redirecting problem is clearly an async/promises issue...

			console.log('trying to redirect to main/profile in AuthServices');
			$location.path('/main/expense');



			return resp.data;  
		}).catch(function(error) {
  			console.error('Sign in ERROR!!!', error);  								
		})
	};

	var isAuth = function () {
    	return !!$window.localStorage.getItem('budgieID');  
  	};

  	var logOut = function () {
  		console.log('logOut called in AuthServices');
    	
    	return $http({
    		method: 'GET',
    		url: '/logout',
    	}).then(function(resp){
    		$window.localStorage.removeItem('budgieID'); 
    		$location.path('/landing/login');
    	}, function(error) {
    		throw error;
    	}); 	
  	};

	return {
		submitNewUser: submitNewUser,
		submitLogin: submitLogin,
		isAuth: isAuth,
		logOut: logOut,
	};
})
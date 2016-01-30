angular.module('auth.service', [])
.factory('AuthServices', function($http, $location, $window) {

	var submitNewUser = function(userData) {
		return $http({
			method: 'POST',
		 	url: '/signup',
			data: userData
		}).then(function(resp) {
			console.log("resp in submitNewUser ", resp);
			$window.localStorage.setItem('budgieID', resp.data.token);
			return resp.data;
		}, function(error) {
  			console.error('Sign up ERROR!!! ', error);
		});
	};

	var submitLogin = function(userData){
		return $http({
			method: 'POST',
			url: '/login',
			data: userData
		}).then(function(resp) {
      console.log('this is resp in submitLogin', resp);
			$window.localStorage.setItem('budgieID', resp.data.token);
			$location.path('/main/expense');
			return resp.data;
		}).catch(function(error) {
  			console.error('Sign in ERROR!!!', error);
        window.localStorage.removeItem('budgieID');
        $location.path('/landing/login');
		});
	};

	var isAuth = function () {
  	return !!$window.localStorage.getItem('budgieID');
	};

	var logOut = function () {
		console.log('logOut called in AuthServices');
    $window.localStorage.removeItem('budgieID');
    $location.path('/landing/login');
	};

	return {
		submitNewUser: submitNewUser,
		submitLogin: submitLogin,
		isAuth: isAuth,
		logOut: logOut,
	};
});

angular.module('budgie', ['ui.router', 'starter.controllers'])
  .config(function($stateProvider, $urlRouterProvider, $httpProvider){

  $httpProvider.interceptors.push('AttachTokens');

  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'SignUpCtrl'
  })

  .state('expense', {
    url: '/expense',
    templateUrl: 'templates/tab-expense.html',
    authenticate: true,
    controller: 'ExpenseCtrl'
  })

  .state('income', {
    url: '/income',
    templateUrl: 'templates/tab-income.html',
    authenticate: true,
    controller: 'IncomeCtrl'
  })

  .state('today', {
    url: '/today',
    templateUrl: 'templates/tab-today.html',
    authenticate: true,
    controller: 'TodayCtrl'
  })

  .state('newsfeed', {
    url: '/newsfeed',
    templateUrl: 'templates/tab-newsfeed.html',
    authenticate: true,
    controller: 'NewsfeedCtrl'
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/expense');

})
.factory('AttachTokens', function () {
  var attach = {
    request: function (object) {
      var jwt = window.localStorage.getItem('budgieID');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.factory('AuthServices', function($http, $location, $rootScope) {

  var submitNewUser = function(userData) {
		return $http({
			method: 'POST',
			url: 'https://budgie-alpha.herokuapp.com/signup',
			data: userData
		}).then(function(resp) {
			window.localStorage.setItem('budgieID', resp.data.token);
			return resp.data.token;
		}, function(error) {
  			console.error('Sign up ERROR!!! ', error);
		});
	};

	var checkSignin = function(userData){

		return $http({
			method: 'POST',
			url: 'https://budgie-alpha.herokuapp.com/login',
			data: userData
		}).then(function(resp) {
			window.localStorage.setItem('budgieID', resp.data.token);
			return resp.data.token;
		}, function(error) {
  			console.error('Sign in ERROR!!!', error);
        window.localStorage.removeItem('budgieID');
        $location.path('/login');
		});
	};

	var isAuth = function () {
    	return !!window.localStorage.getItem('budgieID');
  	};

	var signOut = function () {
  	window.localStorage.removeItem('budgieID');
  	$location.path('/login');
	};

	return {
		submitNewUser: submitNewUser,
		checkSignin: checkSignin,
		isAuth: isAuth,
		signOut: signOut
	};
})


.run(function ($rootScope, $location, AuthServices, $state) {
  AuthServices.checkSignin()
	.then(
    function(success){},
    function(error){
    if(AuthServices.isAuth()){
		  AuthServices.logOut();
    }
	});

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {

    console.log("rootScope user", $rootScope.user);
    if (toState.authenticate && !AuthServices.isAuth()) {
      $location.path('/login');
    }
  	if(toState.name === 'expense'){
  		$location.path('/expense');
  	}
  	if(toState.name === 'login'){
  		if(AuthServices.isAuth()){
  			$location.path('/expense');
  		} else {
  			$location.path('/login');
  		}
  	}
  });
});

// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'ionic-material'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $httpProvider, $urlRouterProvider) {

  $httpProvider.interceptors.push('AttachTokens');

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
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

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.expense', {
    url: '/expense',
    views: {
      'tab-expense': {
        templateUrl: 'templates/tab-expense.html',
        authenticate: true,
        controller: 'ExpenseCtrl'
      }
    }
  })

  .state('tab.income', {
    url: '/income',
    views: {
      'tab-income': {
        templateUrl: 'templates/tab-income.html',
        authenticate: true,
        controller: 'IncomeCtrl'
      }
    }
  })

  .state('tab.today', {
    url: '/today',
    views: {
      'tab-today': {
        templateUrl: 'templates/tab-today.html',
        authenticate: true,
        controller: 'TodayCtrl'
      }
    }
  })

  .state('tab.newsfeed', {
    url: '/newsfeed',
    views: {
      'tab-newsfeed': {
        templateUrl: 'templates/tab-newsfeed.html',
        authenticate: true,
        controller: 'NewsfeedCtrl'
      }
    }
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

.run(function ($rootScope, $location, AuthServices) {
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
      e.preventDefault();
      $location.path('/login');
    }
  	if(toState.name === 'tab'){
      e.preventDefault();
  		$location.path('/tab/expense');
  	}
  	if(toState.name === 'login'){
  		if(AuthServices.isAuth()){
        e.preventDefault();
  			$location.path('/tab/expense');
  		} else {
        // e.preventDefault();
  			$location.path('/login');
  		}
  	}
  });
});

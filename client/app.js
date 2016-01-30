angular.module('budgie', [
	'main.controller',
	'expense.controller',
	'profile.controller',
	'history.controller',
	'learn.controller',
	'stocks.controller',
	'login.controller',
	'signup.controller',
	'landing.controller',
	'auth.service',
	'profile.service',
	'expense.service',
	'goal.service',
	'learn.service',
	'map.service',
	'ui.router',
	'ngSanitize',
	'ngCsv',
	'ngCsvDropbox'])
  .config(function($stateProvider, $urlRouterProvider, $httpProvider){

  $httpProvider.interceptors.push('AttachTokens');

	$stateProvider
		.state('main', {
			url: '/main',
			templateUrl: './main/main.html',
			controller: 'MainController as main',
			authenticate: true
		})
      	.state('main.expense', {
       		url: '/expense',
        	templateUrl: './main/expense/expense.html',
        	controller: 'ExpenseController as expense',
        	authenticate: true
      	})
      	.state('main.profile', {
      		url: '/profile',
      		templateUrl: './main/profile/profile.html',
      		controller: 'ProfileController as profile',
      		authenticate: true
      	})
        .state('main.history', {
        	url: '/history',
        	templateUrl: './main/history/history.html',
        	controller: 'HistoryController as history',
        	authenticate: true
      	})
		.state('main.learn', {
			url: '/learn',
			templateUrl: './main/learn/learn.html',
			controller: 'LearnController as learn',
			authenticate: true
		})
		.state('main.stocks', {
			url: '/stocks',
			templateUrl: './main/stocks/stocks.html',
			controller: 'StocksController as stocks',
			authenticate: true
		})
		.state('landing', {
			url: '/landing',
			templateUrl: './auth/landing.html',
			controller: 'LandingController as landing'
		})
		.state('landing.login', {
			url: '/login',
			templateUrl: './auth/login.html',
			controller: 'LoginController as login'
		})
		.state('landing.signup', {
			url: '/signup',
			templateUrl: './auth/signup.html',
			controller: 'SignupController as signup'
		});

		$urlRouterProvider.otherwise('/main/expense');
	//  $httpProvider.interceptors.push('AttachSession');   // commented out till we get Auth set up

})


.factory('AttachTokens', function () {
  var attach = {
    request: function (object) {
      var jwt = window.localStorage.getItem('budgieID');
      if (jwt !== 'undefined' && jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})


.run(function ($rootScope, $location, AuthServices, ProfileServices) {
  ProfileServices.getProfileData()
	.then(function(success){
	}, function(error){
		if(AuthServices.isAuth()){
			AuthServices.logOut();
		}
	});

  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
    if (toState.authenticate && !AuthServices.isAuth()) {
      $location.path('/landing/login');
    }
  	if(toState.name === 'main'){						//redirects to handle routing edge cases
  		$location.path('/main/expense');
  	}
  	if(toState.name === 'landing'){
  		if(AuthServices.isAuth()){
  			$location.path('/main/expense');
  		} else {
  			$location.path('/landing/login');
  		}
  	}
  	if((toState.name === 'landing.login' && AuthServices.isAuth()) ||
  	   (toState.name === 'landing.signup' && AuthServices.isAuth()))
  		{
  			$location.path('/main/expense');
  		}
  });
});

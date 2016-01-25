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
	'ui.router'])
  .config(function($stateProvider, $urlRouterProvider, $httpProvider){

	$stateProvider
		.state('main', {
			url: '/',
			templateUrl: './main/main.html',
			controller: 'MainController as main'
		})
      	.state('main.expense', {
       		url: '/expense',
        	templateUrl: './main/expense/expense.html',
        	controller: 'ExpenseController as expense'
      	})
      	.state('main.profile', {
      		url: '/profile',
      		templateUrl: './main/profile/profile.html',
      		controller: 'ProfileController as profile'
      	})
        .state('main.history', {
        	url: '/history',
        	templateUrl: './main/history/history.html',
        	controller: 'HistoryController as history'

      	})
		.state('main.learn', {
			url: '/learn',
			templateUrl: './main/learn/learn.html',
			controller: 'LearnController as learn'
		})
		.state('main.stocks', {
			url: '/stocks',
			templateUrl: './main/stocks/stocks.html',
			controller: 'StocksController as stocks'
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

		$urlRouterProvider.otherwise('//expense');
		
	//  $httpProvider.interceptors.push('AttachSession');   // commented out till we get Auth set up

})
/*
.factory('AttachSession', function ($window) {
  var attach = {
    request: function (object) {
      var sess = $window.localStorage.getItem('budgieID');    // tbd based on what is returned by server
      if (sess) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
*/
.run(function ($rootScope, $location, AuthServices) {
  $rootScope.$on('$stateChangeStart', function (e, toState, toParams, fromState, fromParams) {
    if (toState.authenticate && !AuthServices.isAuth()) {
      e.preventDefault();
      $location.path('/');          //   might need to change to landing/login
    }
  });
});

angular.module('budgie', [
	'main.controller',
	'expense.controller',
	'profile.controller',
	'history.controller',
	'learn.controller',
	'stocks.controller',
	'login.controller',
	'signup.controller',
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
		.state('login', {
			url: '/login',
			templateUrl: './auth/login.html',
			controller: 'LoginController as login'
		})
		.state('signup', {
			url: '/signup',
			templateUrl: './auth/signup.html',
			controller: 'SignupController as signup'
		});

		$urlRouterProvider.otherwise('/');
		
	//  $httpProvider.interceptors.push('AttachTokens');   // commented out till we get Auth set up

})
angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, AuthServices, $location) {
  $scope.input = {};
  $scope.input.email = "";
  $scope.input.password = "";

  $scope.submit = function() {
    var user = {
      email: $scope.input.email,
      password: $scope.input.password
    };
    console.log("user", user);
    AuthServices.checkSignin(user)
    .then(function(token){
      console.log('this is the token in the .then function', token);
      if(token){
        console.log("this is the $location.path", $location.path('/expense'));
        $location.path('/expense');
      } else {
        console.log("Error Authenticating User");
      }
    }, function(error){
      console.log("Erroring");
      $location.path('/login');
      throw error;
    });
  };
})


.controller('SignUpCtrl', function($scope, AuthServices, $location) {
  $scope.input = {};
  $scope.input.full_name = "";
  $scope.input.email = "";
  $scope.input.password = "";
  $scope.input.monthly_limit;
  $scope.input.savings_goal;
  $scope.input.total_savings;
  $scope.submit = function() {
		var userData = {
			email: $scope.input.email,
			password: $scope.input.password,
			full_name: $scope.input.full_name,
			monthly_limit: $scope.input.monthly_limit,
			savings_goal: $scope.input.savings_goal,
			total_savings: $scope.input.total_savings
		};
		console.log("called signup.submit with ", userData);
		AuthServices.submitNewUser(userData)
    .then(function(token){
      if(token){
        $location.path('/expense');
      } else {
        console.log("Error Creating User");
      }
    }, function(error){
      console.log("Erroring");
      $location.path('/login');
      throw error;
    });
	};
})

.controller('ExpenseCtrl', function($scope, $http, $timeout) {
  $scope.input = {};
  $scope.input.name = "";
  $scope.input.time = "";
  $scope.input.category = "";
  $scope.input.notes = "";

  $scope.submitted = false;

  $scope.addExpense = function(){
		var spentDate = moment();
    var entered = moment(JSON.stringify($scope.input.time).slice(1, 21), moment.ISO_8601);
		var hours = entered.hour();
		var minutes = entered.minute();
		spentDate.hour(Number(hours));
		spentDate.minute(Number(minutes));

		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');

    return $http({
      method: "POST",
      url: "https://budgie-alpha.herokuapp.com/expenses",
      data: {
        'amount':$scope.input.amount,
        'name':$scope.input.name,
        'category':$scope.input.category,
        'spent_date':spentDate,
        'notes':$scope.input.notes
      }
    }).then(function(resp){
      $scope.submitted = true;
      $timeout(function(){
        $scope.submitted = false;
      }, 1000);
    }, function(error){
      console.error(error);
    });
	};
})

.controller('IncomeCtrl', function($scope, $http, $timeout) {
  $scope.input = {};
  $scope.input.amount = {};
  $scope.input.name = "";
  $scope.input.time = "";
  $scope.input.category = "";
  $scope.input.notes = "";

  $scope.submitted = false;

  $scope.addIncome = function(){
		var spentDate = moment();
    var entered = moment(JSON.stringify($scope.input.time).slice(1, 21), moment.ISO_8601);
		var hours = entered.hour();
		var minutes = entered.minute();
		spentDate.hour(Number(hours));
		spentDate.minute(Number(minutes));

		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');

    return $http({
      method: "POST",
      url: "https://budgie-alpha.herokuapp.com/incomes",
      data: {
        'amount':$scope.input.amount,
        'name':$scope.input.name,
        'category':$scope.input.category,
        'income_date':spentDate,
        'notes':$scope.input.notes,

      }
    }).then(function(resp){
      $scope.submitted = true;
      $timeout(function(){
        $scope.submitted = false;
      }, 1000);
    }, function(error){
      console.error(error);
    });
	};
})

.controller('TodayCtrl', function($scope, $http){
  $scope.$on('$stateChangeSuccess', function(e){
    return $http({
      method: 'GET',
      url: 'https://budgie-alpha.herokuapp.com/expenses/1',
    }).then(function(expenses){
      return $http({
        method: 'GET',
        url: 'https://budgie-alpha.herokuapp.com/incomes/1'
      }).then(function(incomes){
        $scope.expensesData = expenses.data;
        console.log("these are the expenses", $scope.expensesData);
        $scope.incomesData = incomes.data;
      }).then(function(){
        return $http({
          method:'GET',
          url:'https://budgie-alpha.herokuapp.com/user'
        }).then(function(resp){
          console.log("this is user profile data in TodayCtrl!!!", resp.data);
          $scope.profile_total_savings = resp.data.total_savings;
          $scope.profile_monthly_limit = resp.data.monthly_limit;
        });
      });
    });
  });
})

.controller('NewsfeedCtrl', function($scope, $http){
  $scope.getTweets = function() {
    return $http({
      method: 'GET',
      url: 'https://budgie-alpha.herokuapp.com/learn',
    }).then(function(resp) {
      return resp.data.statuses;
    }, function(error) {
      console.error("loadTweets threw error.");
    });
  };

  $scope.tweetsArr = [];
  $scope.loadTweets = function() {
    console.log("profile.loadProfile called ");
    $scope.getTweets()
    .then(function(resp){
      console.log("this is resp in loadTweets", resp);
      $scope.tweetsArr = resp.slice();
    }, function(error){
      console.error("loadTweets threw error.");
    });
  };
});

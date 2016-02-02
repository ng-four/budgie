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
      if(token){
        $location.path('/tabs/expense');
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
      url: "http://localhost:8000/expenses",
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
      url: "http://localhost:8000/incomes",
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

// .controller('TodayCtrl', function($scope, $http) {
//   $scope.$on('$ionicView.enter', function(e) {
//     return $http({
//       method: 'GET',
//       url: 'http://localhost:8000/expenses/1',
//     }).then(function(expenses) {
//       return $http({
//         method: 'GET',
//         url: 'http://localhost:8000/incomes/1',
//       }).then(function(incomes) {
//
//         // TODO: Loop through nboth lists and add item type
//         // color by itemtype
//         $scope.all = incomes.data.concat(expenses.data);
//         console.log("this is the wholeistic list of expenses/incomes", $scope.all);
//
//
//
//       }, function(error) {
//         console.error('Get Income ERROR!!! ', error);
//       });
//     }, function(error) {
//       console.error('Get Expense ERROR!!! ', error);
//     });
//   });
// });
.controller('TodayCtrl', function($scope, $http){
  $scope.$on('$ionicView.enter', function(e){
    return $http({
      method: 'GET',
      url: 'http://localhost:8000/expenses/1',
    }).then(function(expenses){
      return $http({
        method: 'GET',
        url: 'http://localhost:8000/incomes/1'
      }).then(function(incomes){
        $scope.expensesData = expenses.data;
        console.log("these are the expenses", $scope.expensesData);
        $scope.incomesData = incomes.data;
      });
    });
  });
})

.controller('NewsfeedCtrl', function($scope, $http){
  $scope.getTweets = function() {
    return $http({
      method: 'GET',
      url: 'http://localhost:8000/learn',
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

angular.module('expense.service', [])
.factory('ExpenseServices', function($http, $location, $window) {

 var submitNewExpense = function(expenseData) {
   return $http({
     method: 'POST',
     url: '/expenses',
     data: expenseData
   }).then(function(resp) {
     console.log("resp in submitNewExpense ", resp);
     return resp.data;
   }, function(error) {
       console.error('Add Expense ERROR!!! ', error);
   });
 };


 var getExpensesForDays = function(days){
   return $http({
     method: 'GET',
     url: '/expenses/' + days,
   }).then(function(resp) {
     console.log("resp in getExpensesForDays ", resp);
     return resp.data;
   }, function(error) {
     console.error('Add Expense ERROR!!! ', error);
   });
 };

 var deleteExpense = function(id){
   return $http({
     method: 'DELETE',
     url: '/expenses/' + id,
   }).then(function(resp) {
     console.log("resp in deleteExpense ", resp);
     return resp.data;
   }, function(error) {
     console.error('Add Expense ERROR!!! ', error);
   });
 };

 return {
   submitNewExpense: submitNewExpense,
   getExpensesForDays: getExpensesForDays,
   deleteExpense: deleteExpense,
 };
});

angular.module('expense.service', [])
.factory('ExpenseServices', function($http, $location, $window) {

 var submitNewExpense = function(expenseData, inputType) {
   if(inputType === "income"){
     expenseData.income_date = expenseData.spent_date;
   }
   console.log("this is the url, that is being used", ('/'+inputType+"s"));
   return $http({
     method: 'POST',
     url: '/'+inputType+"s",
     data: expenseData
   }).then(function(resp) {
    //  console.log("resp in submitNewExpense ", resp);
     return resp.data;
   }, function(error) {
       console.error('Submit Expense ERROR!!! ', error);
   });
 };



 var getExpensesForDays = function(days){
   return $http({
     method: 'GET',
     url: '/expenses/' + days,
   }).then(function(resp) {
    //  console.log("resp in getExpensesForDays ", resp);
     return resp.data;
   }, function(error) {
     console.error('Get Expense ERROR!!! ', error);
   });
 };

 var deleteExpense = function(id, inputType){
   if(inputType === "income"){
     expenseData.income_date = expenseData.spent_date;
   }
   return $http({
     method: 'DELETE',
     url: '/'+inputType+"s/"+id,
   }).then(function(resp) {
     console.log("resp in deleteExpense ", resp);
     return resp.data;
   }, function(error) {
     console.error('Delete Expense ERROR!!! ', error);
   });
 };

 var getIncomesForDays = function(days){ //in refactor add to financeService
   return $http({
     method: 'GET',
     url: '/incomes/' + days,
   }).then(function(resp) {
    //  console.log("resp in getExpensesForDays ", resp);
     return resp.data;
   }, function(error) {
     console.error('Get Income ERROR!!! ', error);
   });
 };

 return {
   submitNewExpense: submitNewExpense,
   getExpensesForDays: getExpensesForDays,
   getIncomesForDays: getIncomesForDays,
   deleteExpense: deleteExpense,
 };
});

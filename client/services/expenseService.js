angular.module('expense.service', [])
.factory('ExpenseServices', function($http, $location, $window, $q, $timeout) {

  var geocoder = new google.maps.Geocoder();

 var submitNewExpense = function(expenseData, inputType) {
  console.log('expenseData ', expenseData);
  if(inputType === "income"){
     expenseData.income_date = expenseData.spent_date;
   }
    return $http({
      method: 'POST',
      url: '/'+inputType+"s",
      data: expenseData
    }).then(function(resp) {

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
     return resp.data;
   }, function(error) {
     console.error('Get Expense ERROR!!! ', error);
   });
 };

 var deleteExpense = function(id, inputType){
   return $http({
     method: 'DELETE',
     url: '/'+inputType+"s/"+id,
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
     console.error('Delete Expense ERROR!!! ', error);
   });
 };

 var editExpense = function(id, expenseData, inputType) {
console.log('----', expenseData, inputType);
   if(inputType === "income"){
     expenseData.income_date = expenseData.spent_date;
   }
   var url = '/'+inputType+"s/"+id;
   console.log(url);
   // console.log("this is the url, that is being used", ('/'+inputType+"s"));
   return $http({
     method: 'PUT',
     url: '/'+inputType+"s/"+id,
     data: expenseData
   }).then(function(resp) {
     console.log("resp in editExpense ", resp);
     return resp.data;
   }, function(error) {
       console.error('Edit Expense ERROR!!! ', error);
   });
 };

 var getIncomesForDays = function(days){ //in refactor add to financeService
   return $http({
     method: 'GET',
     url: '/incomes/' + days,
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
     console.error('Get Income ERROR!!! ', error);
   });
 };

 var updateExpense = function(newLimit) {
    return $http({
      method: 'PUT',
      url: '/monthly_limit',
      data: {'monthly_limit': newLimit}
    }).then(function(resp){
      return resp;
    }, function(error){
      throw error;
    });
};

 return {
   submitNewExpense: submitNewExpense,
   getExpensesForDays: getExpensesForDays,
   editExpense: editExpense,
   getIncomesForDays: getIncomesForDays,
   deleteExpense: deleteExpense,
   updateExpense: updateExpense,
 };
});

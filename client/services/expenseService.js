angular.module('expense.service', [])
.factory('ExpenseServices', function($http, $location, $window, $q, $timeout) {

  var geocoder = new google.maps.Geocoder();

 var submitNewExpense = function(expenseData, inputType) { //Post request allowing a user to submit a new expense/income
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

 var getExpensesForDays = function(days){ //Get request to retrieve a users expenses for a specific number of days
   return $http({
     method: 'GET',
     url: '/expenses/' + days,
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
     console.error('Get Expense ERROR!!! ', error);
   });
 };

 var deleteExpense = function(id, inputType){ //Delete request to delete a specific expense of a users
   return $http({
     method: 'DELETE',
     url: '/'+inputType+"s/"+id,
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
     console.error('Delete Expense ERROR!!! ', error);
   });
 };

 var editExpense = function(id, expenseData, inputType) { //Put request to edit a specific users expense/income
   if(inputType === "income"){
     expenseData.income_date = expenseData.spent_date;
   }
   var url = '/'+inputType+"s/"+id;
   return $http({
     method: 'PUT',
     url: '/'+inputType+"s/"+id,
     data: expenseData
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
       console.error('Edit Expense ERROR!!! ', error);
   });
 };

 var getIncomesForDays = function(days){ //Get request to retrieve a users incomes for a specific number of days
   return $http({
     method: 'GET',
     url: '/incomes/' + days,
   }).then(function(resp) {
     return resp.data;
   }, function(error) {
     console.error('Get Income ERROR!!! ', error);
   });
 };

 var updateExpense = function(newLimit) { //Put request to change a users monthly limit
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

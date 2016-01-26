angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, $http){
	var history = this;
	history.expenseTable = [];
	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous'];

	(function(){
		ExpenseServices.getExpensesForDays(10000)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);
			history.expenseTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			var checkedDay = false, checkedWeek = false, checkedMonth = false;
		});
	})();

	history.removeRow = function(idx, id){
		history.expenseTable.splice(idx, 1);
		ExpenseServices.deleteExpense(id);
	};

})

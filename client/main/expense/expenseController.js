angular.module('expense.controller', [])
.controller('ExpenseController', function(){
	var expense = this;

	expense.expenseTable = [];

	expense.addExpense = function(){
		expense.expenseTable.push({'amount':amount.value, 'expense':expenseItem.value, 'category':category.value, 'time':time.value, 'notes':notes.value});
		console.log("This is expenseTable", expense.expenseTable);
	};

	expense.removeRow = function(idx){
		expense.expenseTable.splice(idx, 1);
	};
})

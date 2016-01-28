angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, $http, $filter, $timeout){
	var history = this;
	history.expenseTable = [];
	history.incomeTable = [];
	history.allTable = [];


	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous'];

	(function(){
		ExpenseServices.getExpensesForDays(10000)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);
			history.expenseTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			//var checkedDay = false, checkedWeek = false, checkedMonth = false;
		});
	})();

	(function(){
		ExpenseServices.getIncomesForDays(10000)
		.then(function(resp){
			console.log("this is the response in get INCOMES ForDays", resp);
			history.incomeTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			//var checkedDay = false, checkedWeek = false, checkedMonth = false;
		});
	})();

	history.combineTables = function() {
		history.expenseTable.forEach(function(item){
			item.inputType = 'expense';
			history.allTable.push(item);
		});
		history.incomeTable.forEach(function(item){
			item.inputType = 'income';
			history.allTable.push(item);
		});
		console.log("allTable array ", history.allTable);
	}

	$timeout(history.combineTables, 500);

	history.removeRow = function(idx, id, inputType){
		if(inputType === 'expense'){
			history.expenseTable.splice(idx, 1);
			ExpenseServices.deleteExpense(id, inputType);
		} else if (inputType === 'income'){
			history.incomeTable.splice(idx,1);
			ExpenseServices.deleteExpense(id, inputType);
		}
		
	};

	history.cat = 'spent_date';
    history.reverse = true;
    var orderBy = $filter('orderBy');

	history.sortBy = function(cat){
		history.cat = cat;
		history.allTable = orderBy(history.allTable, cat, history.reverse);
		history.reverse = (history.cat === cat) ? !history.reverse : false;	

	}

})

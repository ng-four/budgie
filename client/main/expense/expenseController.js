angular.module('expense.controller', [])
.controller('ExpenseController', function(ExpenseServices){
	var expense = this;




	expense.expenseTable = [];

	expense.addExpense = function(){
		ExpenseServices.submitNewExpense({'amount':amount.value, 'expense':expenseItem.value, 'category':category.value, 'time':time.value, 'notes':notes.value})
		.then(function(resp){
			expense.expenseTable.push({'amount':amount.value, 'expense':expenseItem.value, 'category':category.value, 'time':time.value, 'notes':notes.value});
			console.log("This is expenseTable", expense.expenseTable);
		});


	};

	expense.removeRow = function(idx){
		expense.expenseTable.splice(idx, 1);
	};

	var dataProgressBar = {
		labels: [''],
		series: [[43],[7]] //first array is how much we have left to get to the goal, the second array is how much weve saved so far.
	};
	var optionsProgressBar = {
		reverseData: true,
		horizontalBars: true,
		stackBars: true,
		fullWidth: true,
		seriesBarDistance: 0,
		height: "20px",
		low: 0,
		high: 50, //price of goal
		axisX: {
			showLabel: false,
			showGrid: false
		},
		axisY: {
			showLabel: false,
			showGrid: false,
		}
	};

	var dataDailyDonutChart = {
    series: [10, 20, 50, 20, 5, 50, 15], //expense amount per category
    labels: ["food", "rent", "transport", "entertainment", "education", "bills"] //catergory name
  };
  var optionsDailyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataWeeklyDonutChart = {
    series: [10, 20, 50, 20, 5, 50, 15], //expense amount per category
    labels: ["food", "rent", "transport", "entertainment", "education", "bills"] //catergory name
  };
  var optionsWeeklyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataMonthlyDonutChart = {
    series: [10, 20, 50, 20, 5, 50, 15], //expense amount per category
    labels: ["food", "rent", "transport", "entertainment", "education", "bills"] //catergory name
  };
  var optionsMonthlyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataWeeklyLineChart = {
		labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
		series: [[12, 9, 7, 8, 5, 11, 6]] //daily expenditure total values
	};
	var optionsWeeklyLineChart = {
		fullWidth: true,
		chartPadding: {
			right: 40
		}
	};

	new Chartist.Bar('#progressBarChart', dataProgressBar, optionsProgressBar);
	new Chartist.Pie('#dailyDonutChart', dataDailyDonutChart, optionsDailyDonutChart);
	new Chartist.Pie('#weeklyDonutChart', dataWeeklyDonutChart, optionsWeeklyDonutChart);
	new Chartist.Pie('#monthlyDonutChart', dataMonthlyDonutChart, optionsMonthlyDonutChart);
	new Chartist.Line('#weeklyExpenditureLineChart', dataWeeklyLineChart, optionsWeeklyLineChart);
})

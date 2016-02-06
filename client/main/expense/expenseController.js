angular.module('expense.controller', []) //Controller for the expense view of Budgie
.controller('ExpenseController', function(ExpenseServices, MapServices, ProfileServices, AuthServices, $http, $timeout, $scope){
	var expense = this;
	expense.location; //Location variable for Google Maps feature
	expense.inputType = 'expense'; //inputType to specify input is an expense for Google Maps feature
	expense.categoryType = 'Food & Drink'; //Initializes ng-model on category dropdown to "Food & Drink"
	expense.expenseTable = []; //Storage array for expense response objects that have been posted for the current day
	expense.incomeTable = []; //Storage array for income response objects that have been posted for the current day
	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous']; //The possible categories users can assign to expense they input
	var dailyArr = [0,0,0,0,0,0,0,0,0,0,0,0]; //A placeholder array to keep track of expense amounts for the current day based on specified categories
	var weeklyArr = [0,0,0,0,0,0,0,0,0,0,0,0]; //A placeholder array to keep track of expense amounts for the current week based on specified categories
	var monthlyArr = [0,0,0,0,0,0,0,0,0,0,0,0]; //A placeholder array to keep track of expense amounts for the current month based on specified categories
	var monthlyLineArr = [], monthlyDaysArr = [], lastMonthArr = []; //Three arrays to keep track of data for the monthly line chart on the expense view
																																	//monthlyLineArr keeps track of the current months total expenditure per day
																																	//monthlyDaysArr keeps track of the current days in the current month and the expense view uses this as the basis of the x-axis on the monthly line chart
																																	//lastMonthArr keeps track of last months total expenditure per day

	expense.init = function(){						//Function that runs upon every initialization of the ExpenseController
		ExpenseServices.getExpensesForDays(64) //Performs a request to via ExpenseServices to get expense data for the past 64 days
		.then(function(resp){
			ExpenseServices.getIncomesForDays(64) //Upon success, a request via ExpenseServices to get income data for the past 64 days is performed
			.then(function(incomes){
				var today = moment().format("DD"); //Uses moment.js to get current day
				for(var i=0; i<incomes.length; i++){
					var day = incomes[i].income_date.slice(8,10);
					if(day === today){ //checks to see if the current expense's date is that of todays
						incomes[i].format = moment(incomes[i].income_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
						expense.incomeTable.push(incomes[i]); //Pushes each daily income with properly formated date to expense.incomeTable array
					}else{
						break;
					}
				}
			});

		var today = moment().format("DD"); //Again, uses moment.js to get current day
		for(var i=0; i<resp.length; i++){ //Iterates over the expense data for the past 64 days
			var day = resp[i].spent_date.slice(8,10); //the specific day for the current expense from our iteration
			if(day === today){ //checks to see if the current expense's date is that of todays
				resp[i].format = moment(resp[i].spent_date, 'YYYY-MM-DD HH:mm:ss').from(moment()); //converts spent date of current expense from our iteration into a human-readable time-difference
				expense.expenseTable.push(resp[i]); //the current expense with the human-readable time difference is now pushed into the expense.expenseTable array
				var category = resp[i].category;
				var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1; //assigns the index of the current expense's category within the categories array to a variable
				dailyArr[index] += Number(resp[i].amount); //uses the index variable to properly increment a specific categories monetary value within the dailyArr array
			}else{
				break;
			}
		}

		var thisWeek = moment().format("w"); //Uses moment.js to get current week
		for(var j=0; j<resp.length; j++){ //Iterates over the expense data for the past 64 days
			var week = moment(resp[j].spent_date, 'YYYY-MM-DD HH:mm:ss').format("w"); //the specific week for the current expense from our iteration
			if(week === thisWeek){ //checks to see if the current expense's date is that of one from the current weeks
				var category = resp[j].category;
				var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1; //assigns the index of the current expense's category within the categories array to a variable
				weeklyArr[index] += Number(resp[j].amount); //uses the index variable to properly increment a specific categories monetary value within the weeklyArr
			}else{
				break;
			}
		}

		var thisMonth = moment().format("M"); //Uses moment.js to get the current month
		var lastMonth = moment().subtract(1, 'months').format("M"); //Uses moment.js to get last month
		var daysInThisMonth = moment().daysInMonth(); //Uses moment.js to get the number of days in the current month
		for(var a = 0; a<daysInThisMonth; a++){ //Iterates over the number of days in the current month
			monthlyLineArr.push(null); //Creates the appropriate number of placeholders within the monthlyLineArr array
			lastMonthArr.push(null); //Creates the appropriate number of placeholders within the lastMonthArr array
			monthlyDaysArr.push(a + 1); //Establishes the monthlyDaysArr as an array of numbers representative of each day in the current month
		}

		for(var k=0; k<resp.length; k++){ //Iterates over the expense data the past 64 days
			var month = moment(resp[k].spent_date, 'YYYY-MM-DD HH:mm:ss').format("M"); //the specific month for the current expense from our iteration
			var category = resp[k].category;
			var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1; //assigns the index of the current expense's category within the categories array to a variable
			if(month === thisMonth){ //checks to see if the current expense's date is that one from the current months
				monthlyArr[index] += Number(resp[k].amount); //uses the index variable to properly increment a specific categories monetary value within the monthlyArr
				monthlyLineArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount; //increments the proper day placeholder within monthlyLineArr with the monetary value
			}else if(month === lastMonth){ //checks to see if the current expense's date is that one from last months
				lastMonthArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount; //increments the proper day placeholder within lastMonthArr with the monetary value
			}
		}
			expense.renderGraphs(); //calls the renderGraphs function from below to create the initial expense view graphs
		});
	};
	expense.init(); //calls the above function right when the ExpenseController instantiates

	expense.changeExpense = function() { //functionality to toggle between entering an expense/income in the expense views form
		expense.editExpenseClicked = !expense.editExpenseClicked;
	};

	expense.editClick = function (idx, id) { //function to allow users to edit expenses from the expense table
		expense.newIndex = idx;
		expense.newId = id;
		expense.oldAmount = expense.expenseTable[idx].amount;
		expense.newAmount = expense.expenseTable[idx].amount;
		expense.newExpenseItem = expense.expenseTable[idx].name;
		expense.newCategory = expense.expenseTable[idx].category;
		expense.newNotes = expense.expenseTable[idx].notes;
		expense.newSpentDate = new Date(expense.expenseTable[idx].spent_date);
		expense.newLocation = expense.expenseTable[idx].location;
	};

	expense.editRow = function(idx, id, inputType){ //function to post users edits for expenses/incomes to database
		expense.newLocation = $('#newlocation').val();
		var jstime = new Date(expense.newSpentDate);
		var hour = jstime.getHours();
		var minute = jstime.getMinutes();
		jstime = jstime.toISOString().slice(0, 16);
		var spentDate = moment(jstime, moment.ISO_8601);
		spentDate.hour(hour);
		spentDate.minute(minute);
		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');
		var expenseData = { //creating a new expenseData object with users edits
			'name': expense.newExpenseItem,
			'amount':expense.newAmount,
			'category':expense.newCategory,
			'notes':expense.newNotes,
			'spent_date':spentDate,
			'location':expense.newLocation
		};
		ExpenseServices.editExpense(id, expenseData, inputType) //posts users edits to database via ExpenseServices
		.then(function(resp){
			if (resp) {
				$("#editModal").modal("hide"); //Edit modal disappears after edit is successful on backend
				expense.updateChartData(expense.newCategory, expense.newAmount - expense.oldAmount); //Updates charts data arrays from above
				expense.renderGraphs(); //Re-renders graphs on expense view based on the users edits
			} else{
				expense.isModalInvalid = true;
				console.error('error in editExpense', resp);
			}
		});
	};

	expense.addExpense = function(){ //function for a user to add an expense
		expense.location = $('#location').val();
		var spentDate = moment();
		var hours = time.value.split(':')[0];
		var minutes = time.value.split(':')[1];
		spentDate.hour(Number(hours));
		spentDate.minute(Number(minutes));
		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');
		//expenseData is an object of all the information for the users expense he/she just inputted
		var expenseData = {'amount':amount.value, 'name':expenseItem.value, 'category':expense.categoryType, 'spent_date':spentDate, 'notes':notes.value, 'location':expense.location};
		if(expenseData.location){ //checks if the user entered a location upon inputting their expense
			MapServices.getGeoCode(expenseData.location) //Google Maps functionality for geocode data generation
			.then(function(resp) {
				expenseData.latlng = JSON.stringify({lat: resp.lat(), lng: resp.lng()}); //Establishing latitude and longitude for users location input
				postExpense(expenseData, expense.inputType); //calls postExpense function below
			});
		} else {
			postExpense(expenseData, expense.inputType); //calls postExpense function below
		}
	};

	var postExpense = function(expObj, expType){ //Posts users expense data to the database based on the expenseData object from above and whether or not it is an expense/income
		ExpenseServices.submitNewExpense(expObj, expType) //Posting to database via ExpenseServices
		.then(function(resp){
			if (resp) {
				resp.format = moment(resp.spent_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
				if(expType === 'expense'){ //Checks if user input was an expense
					expense.expenseTable.push(resp); //Adds expenseData object to expenseTable
					expense.updateChartData(resp.category, resp.amount); //Updates charts data arrays from above
					expense.renderGraphs(); //Re-renders graphs on expense view based on the users edits
				}else if(expType === 'income'){ //Checks if user input was an income
					expense.incomeTable.push(resp); //Adds expenseData object to incomeTable (since it is an income)
				}
			} else {
				expense.isInvalid = true;
				console.error('error in posting expense', resp);
			}
		});
	};



	expense.removeRow = function(idx, id, inputType){ //removes a users expense/income from the expenseTable or incomeTable
		if(inputType === 'expense'){ //Checks if user is removing an expense
			expense.updateChartData(expense.expenseTable[idx].category, expense.expenseTable[idx].amount*-1); //Updates charts data arrays from above
			expense.renderGraphs(); //Re-renders graphs on expense view based on users removal action
			expense.expenseTable.splice(idx, 1);
			ExpenseServices.deleteExpense(id, inputType); //Removes this data from database via ExpenseServices
		}else if(inputType === 'income'){ //Checks if user is removing an income
			expense.incomeTable.splice(idx, 1);
			ExpenseServices.deleteExpense(id, inputType); //Removes this data from database via ExpenseServices
			expense.renderGraphs(); //Re-renders graphs on expense view based on users removal action
		}
	};

	var dataDailyDonutChart = { //Data for the daily donut chart
		series : dailyArr, //expense amount per category
		labels : categories //category name
	};
	var optionsDailyDonutChart = {
		donut: true,
		showLabel: true,
		donutWidth: 32,
		// width: 300,
		height: 200,
		plugins: [Chartist.plugins.tooltip({
			currency: "$",
			appendToBody: true
		})]
	};

	var dataWeeklyDonutChart = { //Data for the weekly donut chart
		series: weeklyArr, //expense amount per category
		labels: categories //category name
	};
	var optionsWeeklyDonutChart = {
		donut: true,
		showLabel: true,
		donutWidth: 32,
		// width: 300,
		height: 200,
		plugins: [Chartist.plugins.tooltip({
			currency: "$",
			appendToBody: true
		})]
	};

	var dataMonthlyDonutChart = { //Data for the monthly donut chart
		series: monthlyArr, //expense amount per category
		labels: categories //category name
	};
	var optionsMonthlyDonutChart = {
		donut: true,
		showLabel: true,
		donutWidth: 32,
		// width: 300,
		height: 200,
		plugins: [Chartist.plugins.tooltip({
			currency: "$",
			appendToBody: true
		})]
	};

	var dataMonthlyLineChart = { //Data for the monthly line chart
		labels: monthlyDaysArr,
		series: [monthlyLineArr,lastMonthArr] //daily expenditure total values
	};

	expense.updateChartData = function(category, amount){ //functionality to instantly update chart data upon user edits
		var index = categories.indexOf(category);
		dailyArr[index] += amount;
		weeklyArr[index] += amount;
		monthlyArr[index] += amount;
		var today = Number(moment().format("DD"));
		var todayIndex = monthlyDaysArr.indexOf(today);
		monthlyLineArr[todayIndex] += amount;
	};

	// var dailyDonut, weeklyDonut, monthlyDonut, monthlyLine, dailyChart;




	expense.renderGraphs = function(){ //function to render visuals of users finances
		console.log("renderGraphs is being called!!");
		var domCategories = ["dailyDonutChart", "weeklyDonutChart", "monthlyDonutChart", "monthlyLineChart"];
		// For each div with #id
		// Remove chartist classnames and delete child nodes
		// Rebuild new chartist variables on processed divs
		// if(expense.dailyDonut !== undefined){
			for(var i = 0; i<domCategories.length; i++){
				var currentCat = document.getElementById(domCategories[i]);
				console.log("these are currentCats", currentCat);
				currentCat.innerHTML = '';
			}
		// }

		if(dailyArr.reduce(function(a, b){ return a + b; }) > 0) {
			expense.dailyDonut = new Chartist.Pie('#dailyDonutChart', dataDailyDonutChart, optionsDailyDonutChart);
			jQuery('#dailyDonutChart').append('<p class="donut-chart-label" ng-show="expense.dailyDonut">Daily</p>');
		} else {
			expense.dailyDonut = undefined;
			jQuery('#dailyDonutChart').append('<p class="donut-chart-label" ng-hide="expense.dailyDonut">No Expenses Today</p>');
		}
		if(weeklyArr.reduce(function(a, b){ return a + b; }) > 0){
			expense.weeklyDonut = new Chartist.Pie('#weeklyDonutChart', dataWeeklyDonutChart, optionsWeeklyDonutChart);
			jQuery('#weeklyDonutChart').append('<p class="donut-chart-label" ng-show="expense.weeklyDonut">Weekly</p>');
		} else {
			expense.weeklyDonut = undefined;
			jQuery('#weeklyDonutChart').append('<p class="donut-chart-label" ng-hide="expense.weeklyDonut">No Expenses This Week</p>');
		}
		if(monthlyArr.reduce(function(a, b){ return a + b; }) > 0){
			expense.monthlyDonut = new Chartist.Pie('#monthlyDonutChart', dataMonthlyDonutChart, optionsMonthlyDonutChart);
			jQuery('#monthlyDonutChart').append('<p class="donut-chart-label" ng-show="expense.monthlyDonut">Monthly</p>');
		} else {
			expense.monthlyDonut = undefined;
			jQuery('#monthlyDonutChart').append('<p class="donut-chart-label" ng-hide="expense.monthlyDonut">No Expenses This Month</p>');
		}


		if(expense.dailyDonut !== undefined){
			expense.dailyDonut.on('draw', function(data) { //animation for dailyDonut chart
				if(data.type === 'slice') {
					var pathLength = data.element._node.getTotalLength();
					data.element.attr({
						'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
					});
					var animationDefinition = {
						'stroke-dashoffset': {
							id: 'anim' + data.index,
							dur: 300,
							from: -pathLength + 'px',
							to:  '0px',
							easing: Chartist.Svg.Easing.easeOutQuint,
							fill: 'freeze'
						}
					};
					if(data.index !== 0) {
						animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
					}
					data.element.attr({
						'stroke-dashoffset': -pathLength + 'px'
					});
					data.element.animate(animationDefinition, false);
				}
			});
		}
	if(expense.weeklyDonut !== undefined){
		expense.weeklyDonut.on('draw', function(data) { //animation for weeklyDonut chart
			if(data.type === 'slice') {
				var pathLength = data.element._node.getTotalLength();
				data.element.attr({
					'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
				});
				var animationDefinition = {
					'stroke-dashoffset': {
						id: 'anim' + data.index,
						dur: 300,
						from: -pathLength + 'px',
						to:  '0px',
						easing: Chartist.Svg.Easing.easeOutQuint,
						fill: 'freeze'
					}
				};
				if(data.index !== 0) {
					animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
				}
				data.element.attr({
					'stroke-dashoffset': -pathLength + 'px'
				});
				data.element.animate(animationDefinition, false);
			}
		});
	}
	if(expense.monthlyDonut !== undefined){
		expense.monthlyDonut.on('draw', function(data) { //animation for monthlyDonut chart
			if(data.type === 'slice') {
				var pathLength = data.element._node.getTotalLength();
				data.element.attr({
					'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
				});
				var animationDefinition = {
					'stroke-dashoffset': {
						id: 'anim' + data.index,
						dur: 300,
						from: -pathLength + 'px',
						to:  '0px',
						easing: Chartist.Svg.Easing.easeOutQuint,
						fill: 'freeze'
					}
				};
				if(data.index !== 0) {
					animationDefinition['stroke-dashoffset'].begin = 'anim' + (data.index - 1) + '.end';
				}
				data.element.attr({
					'stroke-dashoffset': -pathLength + 'px'
				});
				data.element.animate(animationDefinition, false);
			}
		});
	}

		ProfileServices.getProfileData().then(function(response){
			var avgLimit = (response.monthly_limit)/(moment().daysInMonth());
			var optionsMonthlyLineChart = {
				fullWidth: true,
				chartPadding: {
					right: 40
				},
				showArea: true,
				height: '350px',
				plugins: [Chartist.plugins.tooltip({
					currency: "$",
					appendToBody: true
				}),
				Chartist.plugins.ctThreshold({
					threshold: avgLimit
				})]
			};
			expense.monthlyLine = new Chartist.Line('#monthlyLineChart', dataMonthlyLineChart, optionsMonthlyLineChart);
			expense.monthlyLine.on('draw', function(data) {
				if(data.type === 'grid') {
					if(data.index === 0){
						data.element.addClass("axis");
					}
				}
			});



		var seq = 0,
		delays = 10,
		durations = 300;

		// Once the chart is fully created we reset the sequence
		expense.monthlyLine.on('created', function() {
			seq = 0;
		});

		// On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations
		expense.monthlyLine.on('draw', function(data) {
			seq++;

			if(data.type === 'line') {
				data.element.animate({
					opacity: {
						begin: seq * delays + 1000,
						dur: durations,
						from: 0,
						to: 1
					}
				});
			} else if(data.type === 'label' && data.axis === 'x') {
				data.element.animate({
					y: {
						begin: seq * delays,
						dur: durations,
						from: data.y + 100,
						to: data.y,
						easing: 'easeOutQuart'
					}
				});
			} else if(data.type === 'label' && data.axis === 'y') {
				data.element.animate({
					x: {
						begin: seq * delays,
						dur: durations,
						from: data.x - 100,
						to: data.x,
						easing: 'easeOutQuart'
					}
				});
			} else if(data.type === 'point') {
				data.element.animate({
					x1: {
						begin: seq * delays,
						dur: durations,
						from: data.x - 10,
						to: data.x,
						easing: 'easeOutQuart'
					},
					x2: {
						begin: seq * delays,
						dur: durations,
						from: data.x - 10,
						to: data.x,
						easing: 'easeOutQuart'
					},
					opacity: {
						begin: seq * delays,
						dur: durations,
						from: 0,
						to: 1,
						easing: 'easeOutQuart'
					}
				});
			} else if(data.type === 'grid') {
				var pos1Animation = {
					begin: seq * delays,
					dur: durations,
					from: data[data.axis.units.pos + '1'] - 30,
					to: data[data.axis.units.pos + '1'],
					easing: 'easeOutQuart'
				};

				var pos2Animation = {
					begin: seq * delays,
					dur: durations,
					from: data[data.axis.units.pos + '2'] - 100,
					to: data[data.axis.units.pos + '2'],
					easing: 'easeOutQuart'
				};

				var animations = {};
				animations[data.axis.units.pos + '1'] = pos1Animation;
				animations[data.axis.units.pos + '2'] = pos2Animation;
				animations['opacity'] = {
					begin: seq * delays,
					dur: durations,
					from: 0,
					to: 1,
					easing: 'easeOutQuart'
				};

				data.element.animate(animations);
			}
		});
		});
	};



	/* --------    GOOGLE PLACES AUTOCOMPLETE   --------------*/

	var options = {
		types : [],
	};
	var location = document.getElementById('location');
	$scope.gPlace = new google.maps.places.Autocomplete(location, options);
	google.maps.event.addDomListener(location, 'keydown', function(e) {
		console.log('keydown!!!');
		//var pac = $('.pac-container');
		// pac.each(function( index ) {
		// console.log( index + ": " + $( this ).text() );
		// });
		if (e.keyCode == 13 || e.keyCode == 9) {
			if($('#location:visible').length){
				for(var key in $scope.gPlace.gm_bindings_.types){
					if(Number(key) >= 0){
						expense.location = $scope.gPlace.gm_bindings_.types[key].Rd.U[0].j[0];
						$('#location').innerText = expense.location;
					}
				}
				console.log("enter pressed or tab pressed ");
				e.preventDefault();
			}
		}
	});
	google.maps.event.addDomListener(location, 'mouseout', function(e) {
		console.log('mouseout!!!');
		if($('#location').length){
			console.log('length ',$('#location').length)
			for(key in $scope.gPlace.gm_bindings_.types){
				if(Number(key) >= 0){
					expense.location = $scope.gPlace.gm_bindings_.types[key].Rd.U[0].j[0];
					$('#location').innerText == expense.location;
					console.log('expense.location ', expense.location);
				}
			}
		}
	});

	var checkAuth = function(){
  	if(!AuthServices.isAuth()){
  		AuthServices.logOut();
  	  }
    }

  checkAuth();
});

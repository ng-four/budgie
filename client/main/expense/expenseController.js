angular.module('expense.controller', [])
.controller('ExpenseController', function(ExpenseServices, MapServices, $http, $timeout, $scope){

	var expense = this;

	expense.location;
    expense.inputType = 'expense';
	expense.categoryType = 'Food & Drink';

	expense.expenseTable = [];
	expense.incomeTable = [];
	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous'];
	var dailyArr = [0,0,0,0,0,0,0,0,0,0,0,0];
	var weeklyArr = [0,0,0,0,0,0,0,0,0,0,0,0];
	var monthlyArr = [0,0,0,0,0,0,0,0,0,0,0,0];


	var monthlyLineArr = [], monthlyDaysArr = [], lastMonthArr = [];

	var startDay;
	var startWeek;
	var startMonth;

	(function(){
		ExpenseServices.getExpensesForDays(64)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);

			ExpenseServices.getIncomesForDays(64)
			.then(function(incomes){
				var today = moment().format("DD");
				for(var i=0; i<incomes.length; i++){
					var day = incomes[i].income_date.slice(8,10);
					if(day === today){
						incomes[i].format = moment(incomes[i].income_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
						expense.incomeTable.push(incomes[i]);
					}else{
						break;
					}
				}
			});

			var today = moment().format("DD");
			console.log("this is today", today);
			for(var i=0; i<resp.length; i++){
				var day = resp[i].spent_date.slice(8,10);
				console.log("this is day in for loop", day);
				if(day === today){
					resp[i].format = moment(resp[i].spent_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
					console.log("moment difference as .format", resp[i].format);
					expense.expenseTable.push(resp[i]);
					var category = resp[i].category;
					var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
					dailyArr[index] += Number(resp[i].amount);
				}else{
					break;
				}
			}

			var thisWeek = moment().format("w");
			for(var j=0; j<resp.length; j++){
				var week = moment(resp[j].spent_date, 'YYYY-MM-DD HH:mm:ss').format("w");
				if(week === thisWeek){
					var category = resp[j].category;
					var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
					weeklyArr[index] += Number(resp[j].amount);
				}else{
					break;
				}
			}

			var thisMonth = moment().format("M");
			var lastMonth = moment().subtract(1, 'months').format("M");
			var daysInThisMonth = moment().daysInMonth();
			for(var a = 0; a<daysInThisMonth; a++){
				monthlyLineArr.push(null);
				lastMonthArr.push(null);
				monthlyDaysArr.push(a + 1);
			}

			for(var k=0; k<resp.length; k++){
				var month = moment(resp[k].spent_date, 'YYYY-MM-DD HH:mm:ss').format("M");
				var category = resp[k].category;
				var index = categories.indexOf(category) > -1 ? categories.indexOf(category) : categories.length - 1;
				if(month === thisMonth){
					monthlyArr[index] += Number(resp[k].amount);
					monthlyLineArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount;
				}else if(month === lastMonth){
					lastMonthArr[resp[k].spent_date.slice(8,10) - 1] += resp[k].amount;
				}
			}

			console.log("this is dailyArr!!!!", dailyArr);
			console.log("this is weeklyArr!!!!", weeklyArr);
			console.log("this is monthlyArr!!!!", monthlyArr);
			console.log("this is monthlyLineArr!!!!", monthlyLineArr);
			console.log("this is lastMonthArr!!!!", lastMonthArr);

			expense.renderGraphs();
		});
	})();

	expense.changeExpense = function() {
		expense.editExpenseClicked = !expense.editExpenseClicked;
	};

	expense.editClick = function (idx, id) {
		expense.newIndex = idx;
		expense.newId = id;
		expense.oldAmount = expense.expenseTable[idx].amount;
		expense.newAmount = expense.expenseTable[idx].amount;
		expense.newExpenseItem = expense.expenseTable[idx].name;
		expense.newCategory = expense.expenseTable[idx].category;
		expense.newNotes = expense.expenseTable[idx].notes;
		expense.newSpentDate = new Date(expense.expenseTable[idx].spent_date);
		// expense.newLocation = expense.expenseTable[idx].location;
	};

	expense.editRow = function(idx, id, inputType){
		console.log('index', idx);
		console.log('id', id);
		console.log('inputType', inputType);

		var jstime = new Date(expense.newSpentDate);
		console.log('jstime', jstime);

		var hour = jstime.getHours();
		console.log('hour', hour);

		var minute = jstime.getMinutes();
		console.log('minute', minute);

		jstime = jstime.toISOString().slice(0, 16);

		var spentDate = moment(jstime, moment.ISO_8601);
		spentDate.hour(hour);
		spentDate.minute(minute);
		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');
		console.log('spentDate', spentDate);

		var expenseData = {
			'name': expense.newExpenseItem,
			'amount':expense.newAmount,
			'category':expense.newCategory,
			'notes':expense.newNotes,
			'spent_date':spentDate,
			// 'location':expense.newLocation
		};

		ExpenseServices.editExpense(id, expenseData, inputType)
		.then(function(resp){
			if (resp) {
				$("#editModal").modal("hide");
				console.log('success in editExpense', resp);
				expense.updateChartData(expense.newCategory, expense.newAmount - expense.oldAmount);
				expense.renderGraphs();
			} else{
				expense.isModalInvalid = true;
				console.error('error in editExpense', resp);
			}
		});
	};

	expense.addExpense = function(){

		expense.location = $('#location').val();

		console.log('expense.location in add expense ', expense.location);


		var spentDate = moment();

		console.log(time.value);

		var hours = time.value.split(':')[0];
		var minutes = time.value.split(':')[1];

		spentDate.hour(Number(hours));
		spentDate.minute(Number(minutes));

		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');

		console.log("this is spentDate in string format", spentDate);
		console.log("this is hours and minutes", hours, minutes);
        console.log("This is the amount going to the server", {'amount':amount.value, 'name':expenseItem.value, 'category':expense.categoryType, 'spent_date':spentDate, 'notes':notes.value, 'location':expense.location});

        var expenseData = {'amount':amount.value, 'name':expenseItem.value, 'category':expense.categoryType, 'spent_date':spentDate, 'notes':notes.value, 'location':expense.location};

        if(expenseData.location){
        	MapServices.getGeoCode(expenseData.location)
        	.then(function(resp) {
        		expenseData.latlng = JSON.stringify({lat: resp.lat(), lng: resp.lng()});
        		postExpense(expenseData, expense.inputType);
        	});
        } else {
        	console.log("expenseData ", expenseData);
        	postExpense(expenseData, expense.inputType);
        }
	};

	var postExpense = function(expObj, expType){
		ExpenseServices.submitNewExpense(expObj, expType)
		.then(function(resp){
			if (resp) {
				resp.format = moment(resp.spent_date, 'YYYY-MM-DD HH:mm:ss').from(moment());
				if(expType === 'expense'){
					expense.expenseTable.push(resp);
					console.log("This is expenseTable resp", resp);
					expense.updateChartData(resp.category, resp.amount);
					expense.renderGraphs();
				}else if(expType === 'income'){
					expense.incomeTable.push(resp);
					console.log("This is incomeTable", expense.incomeTable);
				}
			} else {
				// expense.isInvalid = true;
				console.error('error in posting expense', resp);
			}
		});
	};

	expense.removeRow = function(idx, id, inputType){
		console.log("inside removeRow based on income removal");
		console.log("the idx and id and inputType inside removeRow", idx, id, inputType);
		if(inputType === 'expense'){
			expense.updateChartData(expense.expenseTable[idx].category, expense.expenseTable[idx].amount*-1);
			expense.renderGraphs();
			expense.expenseTable.splice(idx, 1);
			console.log('THIS IS EXPENSETABLE!!!!!!! ON LINE 207', expense.expenseTable[idx]);
			ExpenseServices.deleteExpense(id, inputType);
		}else if(inputType === 'income'){
			expense.incomeTable.splice(idx, 1);
			ExpenseServices.deleteExpense(id, inputType);
			expense.renderGraphs();
		}
	};

	var dataDailyDonutChart = {
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
			appendToBody: true,
			class: 'donutpointerdataclass'
		})]
  };

	var dataWeeklyDonutChart = {
    series: weeklyArr, //expense amount per category
    labels: categories //category name
  };
  var optionsWeeklyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataMonthlyDonutChart = {
    series: monthlyArr, //expense amount per category
    labels: categories //category name
  };
  var optionsMonthlyDonutChart = {
    donut: true,
    showLabel: true,
    donutWidth: 32,
    // width: 300,
    height: 200
  };

	var dataMonthlyLineChart = {
		labels: monthlyDaysArr,
		series: [monthlyLineArr,lastMonthArr] //daily expenditure total values
	};
	var optionsMonthlyLineChart = {
		fullWidth: true,
		chartPadding: {
			right: 40
		},
		showArea: true,
		height: '350px',
		plugins: [Chartist.plugins.tooltip({
			appendToBody: true,
			class: 'pointerdataclass'
		})]
	};

	var dataDailyBarChart = {
		labels: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    series: [
      [3, 2, 9, 5, 4, 6, 4]
    ]
	};
	var optionsDailyBarChart = {
		fullWidth: true,
		seriesBarDistance: 10
	};

	expense.getNotes = function(note){
		console.log("note in modal ", note);
	};

	expense.updateChartData = function(category, amount){
		var index = categories.indexOf(category);
		dailyArr[index] += amount;
		weeklyArr[index] += amount;
		monthlyArr[index] += amount;
	};



	var dailyDonut, weeklyDonut, monthlyDonut, monthlyLine, dailyChart;

	expense.renderGraphs = function(){
		console.log("renderGraphs is being called!!");
		var domCategories = ["dailyDonutChart", "weeklyDonutChart", "monthlyDonutChart", "monthlyLineChart"];

		if(dailyDonut !== undefined){
		for(var i = 0; i<domCategories.length; i++){
			var currentCat = document.getElementById(domCategories[i]);
			currentCat.innerHTML = '';
		}
	}
		// For each div with #id
			// Remove chartist classnames and delete child nodes
		// Rebuild new chartist variables on processed divs
		dailyDonut = new Chartist.Pie('#dailyDonutChart', dataDailyDonutChart, optionsDailyDonutChart);
		weeklyDonut = new Chartist.Pie('#weeklyDonutChart', dataWeeklyDonutChart, optionsWeeklyDonutChart);
		monthlyDonut = new Chartist.Pie('#monthlyDonutChart', dataMonthlyDonutChart, optionsMonthlyDonutChart);
		monthlyLine = new Chartist.Line('#monthlyLineChart', dataMonthlyLineChart, optionsMonthlyLineChart);
	};





	/* --------    GOOGLE PLACES AUTOCOMPLETE (REFACTOR INTO DIRECTIVE LATER) --------------*/

			var options = {
                types : [],
            };

            var location = document.getElementById('location');
            $scope.gPlace = new google.maps.places.Autocomplete(location, options);
            google.maps.event.addDomListener(location, 'keydown', function(e) {
            	console.log('keydown!!!');
    //         	var pac = $('.pac-container');
    //         	pac.each(function( index ) {
  		// 			console.log( index + ": " + $( this ).text() );
				// });
    			if (e.keyCode == 13 || e.keyCode == 9) {
    				if($('#location:visible').length){
    					for(key in $scope.gPlace.gm_bindings_.types){
    						if(Number(key) >= 0){
    							expense.location = $scope.gPlace.gm_bindings_.types[key].Rd.U[0].j[0];
    							$('#location').innerText == expense.location;
    						}
    					}
    					console.log("enter pressed or tab pressed ");
        				e.preventDefault();
        			}
    			}
			});
});

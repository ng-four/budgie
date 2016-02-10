angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, AuthServices, MapServices, $filter, $timeout, $q){

	var history = this;

	history.dates = "7";  // default view
	history.expenseTable = [];
	history.incomeTable = [];
	history.allTable = [];
	history.locCount = 0;

	history.filterDates = function(days){ //Allows user to filter history table based on time durations
		loadHistoryView(days);
	};

	var loadHistoryView = function(days){ //Uses expense services to show the users expense/income history
		days = days || 7;
		history.expenseTable = [];
		history.incomeTable = [];
		history.allTable = [];
		ExpenseServices.getExpensesForDays(days) //Gets user's expenses
			.then(function(resp){
				history.expenseTable = resp;
			}, function(error){
				AuthServices.logOut();
				throw error;
			}).then(function(resp){
				ExpenseServices.getIncomesForDays(days) //Gets user's incomes
					.then(function(incomeresp){
					history.incomeTable = incomeresp;
			}).then(function(resp){
				history.combineTables()
					.then(function(resp){
						renderMap(); //Renders map to show location markers for user's expenses
				});
			});
		});
	};

	history.combineTables = function() { //Function to combine user's expenses and incomes in the view
		var deferred3 = $q.defer();

		history.expenseTable.forEach(function(item){
			if(item.geocode) {
				history.locCount++;
			}
			item.inputType = 'expense';
			history.allTable.push(item);
		});
		history.incomeTable.forEach(function(item){
			item.inputType = 'income';
			history.allTable.push(item);
		});

		deferred3.resolve();
		return deferred3.promise;
	};

	history.removeRow = function(idx, id, inputType){ //Allows the user to delete an expense/income
		if(inputType === 'expense'){
			history.allTable.splice(idx, 1);
			ExpenseServices.deleteExpense(id, inputType);
		} else if (inputType === 'income'){
			history.allTable.splice(idx,1);
			ExpenseServices.deleteExpense(id, inputType);
		}
	};

	history.cat = 'spent_date';
    history.reverse = true;
    var orderBy = $filter('orderBy');

	history.sortBy = function(cat){ //Allows the user to sort through their finance history
		history.cat = cat;
		history.allTable = orderBy(history.allTable, cat, history.reverse);
		history.reverse = (history.cat === cat) ? !history.reverse : false;
	};


	history.editClick = function (idx, id, inputType) { //Allows the user to edit an expense/income from their history
		history.newIndex = idx;
		history.newId = id;
		history.inputType = inputType;
		history.newAmount = history.allTable[idx].amount;
		history.newExpenseItem = history.allTable[idx].name;
		history.newCategory = history.allTable[idx].category;
		history.newLocation = history.allTable[idx].location;
		history.newNotes = history.allTable[idx].notes;
		if (inputType === 'expense') {
			history.newSpentDate = new Date(history.allTable[idx].spent_date);
		}
		if (inputType === 'income') {
			history.newSpentDate = new Date(history.allTable[idx].income_date);
		}
	};

	history.editRow = function(idx, id, inputType){ //Submits the edited historical information
		history.newLocation = $('#newlocation').val();

		inputType = history.allTable[idx].inputType;

		var jstime = new Date(history.newSpentDate);
		var hour = jstime.getHours();
		var minute = jstime.getMinutes();

		jstime = jstime.toISOString().slice(0, 16);

		var spentDate = moment(jstime, moment.ISO_8601);

		spentDate.hour(hour);
		spentDate.minute(minute);
		spentDate = spentDate.format('YYYY-MM-DD HH:mm:ss');

		var data = {
			name: history.newExpenseItem,
			amount: history.newAmount,
			category: history.newCategory,
			notes: history.newNotes,
			spent_date: spentDate,
			location: history.newLocation,
		};

		if(data.location){ //checks if the user entered a location upon inputting their expense
			MapServices.getGeoCode(data.location) //Google Maps functionality for geocode data generation
			.then(function(resp) {
				data.latlng = JSON.stringify({lat: resp.lat(), lng: resp.lng()}); //Establishing latitude and longitude for users location input
				ExpenseServices.editExpense(id, data, inputType)
					.then(function(resp){
					loadHistoryView(history.dates);
				});
			});
		} else {
			ExpenseServices.editExpense(id, data, inputType)
				.then(function(resp){
					loadHistoryView(history.dates);
			});
		}
	};

	/*--------  MAP FUNCTIONS  -------------*/

	var mapCanvas, map, bounds;

	var createMap = function(){ //creates the Google Map
		var deferred = $q.defer();

		mapCanvas = $('#map_canvas')[0];
		MapServices.makeMap(mapCanvas)
			.then(function(newMap){
				map = newMap;
				bounds = new google.maps.LatLngBounds();
			});	

		deferred.resolve();
   		return deferred.promise;
	};

	var geocodes = [];

	var addMarkers = function(){ //Adds markers to show locations of expenses	
		var deferred2 = $q.defer();

		for(var j = 0; j < history.allTable.length; j++){
   			if(history.allTable[j].geocode){
   				var latlng = JSON.parse(history.allTable[j].geocode);
   				if(geocodes.indexOf(latlng.lat + "" + latlng.lng) >= 0) {
   					latlng.lat += ((Math.random() -.5) / 300);
   					latlng.lng += ((Math.random() -.5) / 300);
   				}
   				history.allTable[j].latlng = latlng;
   				(function(j) {
   					MapServices.renderMarker(history.allTable[j], map, bounds);
   				})(j);
   				geocodes.push(latlng.lat + "" + latlng.lng);
   			}
   		}
   		geocodes = [];
   		deferred2.resolve();
   		return deferred2.promise;
    };

 	var renderMap = function(){ //Renders the Google Map 
 		$timeout(createMap, 200).then(function(){
 			addMarkers()
 			.then(function(){
 				MapServices.setBounds(map, bounds);
 			});	
 		});
 	};

   	loadHistoryView(history.dates);

});

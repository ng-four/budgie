angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, AuthServices, MapServices, $http, $filter, $timeout, $q, $scope){
	
	var history = this;
	history.expenseTable = [];
	history.incomeTable = [];
	history.allTable = [];

	//this.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

	var categories = ['Education','Travel','Food & Drink','Rent','Household','Transport','Payments','Entertainment','Shopping','Healthcare','Tax','Miscellaneous'];

	(function(){
		ExpenseServices.getExpensesForDays(10000)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);
			history.expenseTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			//var checkedDay = false, checkedWeek = false, checkedMonth = false;
		}, function(error){
			console.log("getExpenses threw error in HistoryController, logging out... ");
			AuthServices.logOut();
			throw error;
		});
	})();

	(function(){
		ExpenseServices.getIncomesForDays(10000)
		.then(function(resp){
			history.incomeTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			//var checkedDay = false, checkedWeek = false, checkedMonth = false;
		});
	})();

	history.combineTables = function() {
		history.expenseTable.forEach(function(item){
			item.inputType = 'expense';

			console.log('item.name, item.location in expenseTable ', item.name, item.location);     // for testing

			history.allTable.push(item);
		});
		history.incomeTable.forEach(function(item){
			item.inputType = 'income';

			console.log('item.name, item.location in incomeTable ', item.name, item.location);		// for testing

			history.allTable.push(item);
		});
	};

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
	};

	var mapCanvas = $('#map_canvas')[0];
	var map = MapServices.makeMap(mapCanvas);

	var bounds = new google.maps.LatLngBounds();

	var addMarkers = function(){

	for(var j = 0; j < history.allTable.length; j++){
		
   		if(history.allTable[j].location){

   			var loc = history.allTable[j].location;
   			console.log("loc ", loc);

   			var deferred = $q.defer();
   		(function(loc,j) {	
   			console.log("loc in promise workaround ", loc);
   			console.log("j in promise workaround ", j);
   			MapServices.getGeoCode(loc, j)
   				.then(function(result){
   					console.log("j in for loop for GeoCode ", j);
   					console.log("result in for loop for GeoCode ", result);
   					console.log("history.allTable[j] in for loop ", history.allTable[j]);
   					history.allTable[j].latlng = {lat: result.lat(), lng: result.lng()};
   				}).then(function(result2){
   					console.log("result2 in chained promise ", result2);
   					MapServices.renderMarker(history.allTable[j], map, bounds);
   				});

   				deferred.resolve();
   			})(loc,j);
   		}
   		
   	}
   	
   }

   	var setBounds = function(){
   		MapServices.setBounds(map, bounds);
   	}

   	$timeout(addMarkers, 1000);
   	$timeout(setBounds, 2000);

});




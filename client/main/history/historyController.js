angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, AuthServices, $http, $filter, $timeout){
	
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


});



angular.module('map.controller', [])
  .controller('MapController', function(ExpenseServices, AuthServices, $scope, $timeout) {

  $scope.expenseTable = [];
	$scope.incomeTable = [];
	$scope.allTable = [];

  	(function(){
		ExpenseServices.getExpensesForDays(10000)
		.then(function(resp){
			console.log("this is the response in getExpensesForDays", resp);
			$scope.expenseTable = resp;
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
			console.log("this is the response in get INCOMES ForDays", resp);
			$scope.incomeTable = resp;
			var firstDate = new Date(resp[0].spent_date);
			//var checkedDay = false, checkedWeek = false, checkedMonth = false;
		});
	})();

	$scope.combineTables = function() {
		$scope.expenseTable.forEach(function(item){
			item.inputType = 'expense';
			$scope.allTable.push(item);
		});
		$scope.incomeTable.forEach(function(item){
			item.inputType = 'income';
			$scope.allTable.push(item);
		});
		console.log("allTable array ", $scope.allTable);
	};

	$timeout($scope.combineTables, 500);

  var i = .000002
  var lati = 34.0210487;
  var longi = -118.4922354;

  var mapCanvas = $('#map_canvas')[0];

var setLongLat = function(){
  for(var j = 0; j < $scope.allTable.length; j++){
   		i+= .0002;
   		$scope.allTable[j].lati = lati+=i;
   		$scope.allTable[j].longi = longi+=i;

   		$scope.allTable[j].latlng = new google.maps.LatLng(lati+=i, longi+=i);	

   };
}
$timeout(setLongLat,500);


  var map = new google.maps.Map(mapCanvas, {
    zoom: 15,
    center: {lat: 34.0210487, lng: -118.4922354}
  });

  var bounds = new google.maps.LatLngBounds();


  var renderMarkers = function () {
  $scope.allTable.forEach(function(item){
  	console.log(item);

  	date = item.spent_date || "";

  	var contentString = '<div id="content">'+
      '<div id="bodyContent">'+
      '<p style="color: black">' + item.name + '</p>'+
       '<p style="color: black">' + item.category + '</p>'+
      '<p style="color: black">$' + item.amount + '</p>'+
      '<p style="color: black">' + date + '</p>'+
      '</div>'+
      '</div>';

  	var infowindow = new google.maps.InfoWindow({
    	content: contentString
  	});

  	console.log("item.latlng", item.latlng);

  	var marker = new google.maps.Marker({
    	position: {lat: item.lati, lng: item.longi},
    	map: map,
    	title: item.name
  	});

  	marker.addListener('mouseover', function() {
    	infowindow.open(map, marker);
  	});
  	marker.addListener('mouseout', function() {
    	infowindow.close(map, marker);
  	});

  	bounds.extend(item.latlng);

  });
};

$timeout(renderMarkers, 1000);

var setBounds = function(){  
  map.fitBounds(bounds);
}

$timeout(setBounds, 1500);
  
});

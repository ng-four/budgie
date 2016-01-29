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


});

angular.module('appMaps', ['uiGmapgoogle-maps'])
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
	}

	$timeout($scope.combineTables, 500);

    $scope.map = {
      center: {
        latitude: 34.0210487,
        longitude: -118.4922354
      },
      zoom: 15,
      bounds: {}
    };
    $scope.options = {
      scrollwheel: false
    };

    var createMarker = function(i, bounds, transaction, idKey) {
      var lat_min = bounds.southwest.latitude,
        lat_range = bounds.northeast.latitude - lat_min,
        lng_min = bounds.southwest.longitude,
        lng_range = bounds.northeast.longitude - lng_min;

      if (idKey == null) {
        idKey = "id";
      }

      var latitude = lat_min + (Math.random() * lat_range);
      var longitude = lng_min + (Math.random() * lng_range);
      var transMarker = {
        latitude: latitude,
        longitude: longitude,
        title: transaction.name,
        idKey: transaction.id,
        id: transaction.id,
        amount: transaction.amount,
        spent_date: transaction.spent_date,
        category: transaction.category,
        notes: transaction.notes,
        options: {label: transaction.name}

      };

     // transMarker[idKey] = i;
      
      return transMarker;
    };

    $scope.allMarkers = [];

    $scope.showData = function(markerData){
    	console.log('marker info ', markerData);
    }
    // Get the bounds from the map once it's loaded
    $scope.$watch(function() {
      return $scope.map.bounds;
    }, function(nv, ov) {
      // Only need to regenerate once
      if (!ov.southwest && nv.southwest) {
        var markers = [];
        for (var i = 0; i < $scope.allTable.length; i++) {
          markers.push(createMarker(i, $scope.map.bounds, $scope.allTable[i]))
        }
        // console.log('markers ', markers);
        $scope.allMarkers = markers;
      }
    }, true);
  });

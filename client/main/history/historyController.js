angular.module('history.controller', [])
.controller('HistoryController', function(ExpenseServices, AuthServices, MapServices, $http, $filter, $timeout, $q,$scope){

	var history = this;

	history.dates = "7";  // default view
	history.expenseTable = [];
	history.incomeTable = [];
	history.allTable = [];

	history.filterDates = function(days){
		loadHistoryView(days);
	}

	var loadHistoryView = function(days){
		days = days || 7;
		history.expenseTable = [];
		history.incomeTable = [];
		history.allTable = [];
		ExpenseServices.getExpensesForDays(days)
			.then(function(resp){
				history.expenseTable = resp;
				if(resp[0].spent_date){
					var firstDate = new Date(resp[0].spent_date);
				}
			}, function(error){
				console.log("getExpenses threw error in HistoryController, logging out... ");
				AuthServices.logOut();
				throw error;
			}).then(function(resp){
				ExpenseServices.getIncomesForDays(days)
					.then(function(incomeresp){
					history.incomeTable = incomeresp;
					if(incomeresp.spent_date){						// code breaks if there's no income entered yet
						var firstDate = new Date(incomeresp[0].spent_date);
					}
			}).then(function(resp){
				history.combineTables();
				})
				.then(function(resp){
					renderMap();
			});
		})
	}

	history.combineTables = function() {
		history.expenseTable.forEach(function(item){
			item.inputType = 'expense';
			history.allTable.push(item);
		});
		history.incomeTable.forEach(function(item){
			item.inputType = 'income';
			history.allTable.push(item);
		});
	};

	history.removeRow = function(idx, id, inputType){
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

	history.sortBy = function(cat){
		history.cat = cat;
		history.allTable = orderBy(history.allTable, cat, history.reverse);
		history.reverse = (history.cat === cat) ? !history.reverse : false;
	};


	history.editClick = function (idx, id, inputType) {
		console.log("idx, id, inputType ", idx, id, inputType);
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
	}

	history.editRow = function(idx, id, inputType){
		history.newLocation = $('#newlocation').val();
		console.log('history.newLocation in edit row call', history.newLocation);

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
		}

		ExpenseServices.editExpense(id, data, inputType)
			.then(function(resp){
				loadHistoryView(history.dates);
			})
	};

	/*--------  MAP FUNCTIONS  -------------*/

	var mapCanvas, map, bounds;

	var createMap = function(){
		mapCanvas = $('#map_canvas')[0];
		map = MapServices.makeMap(mapCanvas);
		bounds = new google.maps.LatLngBounds();
	}

	var addMarkers = function(){
		for(var j = 0; j < history.allTable.length; j++){
   			if(history.allTable[j].geocode){
   				var latlng = JSON.parse(history.allTable[j].geocode);
   				history.allTable[j].latlng = latlng;
   				(function(j) {
   					MapServices.renderMarker(history.allTable[j], map, bounds);
   				})(j);
   			}
   		}
    }

 	var renderMap = function(){
 		$timeout(createMap,200);
 		$timeout(addMarkers,600);
 		$timeout(setBounds, 1000);
 	}

   	var setBounds = function(){
   		MapServices.setBounds(map, bounds);
   	}

   	loadHistoryView(history.dates);

/* --------    GOOGLE PLACES AUTOCOMPLETE (REFACTOR INTO DIRECTIVE LATER)  --------------*/

   		var options = {
                types : [],
            };

            var location = document.getElementById('newlocation');
            $scope.gPlace2 = new google.maps.places.Autocomplete(location, options);
            google.maps.event.addDomListener(location, 'keydown', function(e) {
    		// var pac = $('.pac-container');
    				// pac.each(function( index ) {
  					// console.log( index + ": " + $( this ).text() );
				// });
				console.log('keyydown!!!');
    			if (e.keyCode == 13 || e.keyCode == 9) {
    				console.log("enter pressed or tab pressed ");
    				if($('#newlocation:visible').length){
    					for(key in $scope.gPlace2.gm_bindings_.types){
    						if(Number(key) >= 0){
    							history.newLocation = $scope.gPlace2.gm_bindings_.types[key].Rd.U[0].j[0];
    						}
    					}
        				e.preventDefault();
        			}
    			}

			});

			google.maps.event.addDomListener(location, 'mouseout', function(e) {
            	console.log('mouseout!!!');
            	if($('#newlocation').length){
            		console.log('length ',$('#newlocation').length)
            		for(key in $scope.gPlace2.gm_bindings_.types){
    						if(Number(key) >= 0){
    							history.newLocation = $scope.gPlace2.gm_bindings_.types[key].Rd.U[0].j[0];
    							$('#newlocation').innerText == history.newLocation;
    							console.log('history.newLocation ', history.newLocation);
    						}
    					}
    				}

            });

});

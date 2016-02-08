angular.module('map.service', [])
  .factory('MapServices', function($http, $location, $window, $q) {

  	var makeMap = function(mapCanvas) {
  		var map = new google.maps.Map(mapCanvas, {
    		zoom: 15,
    		center: {lat: 34.0210487, lng: -118.4922354},
        scrollwheel: false
  		});
  		return map;
  	}

    var geocoder = new google.maps.Geocoder();

  	var getGeoCode = function(address){

  		var deferred = $q.defer();
  		
    	var geocodeOptions = {
      		address: address
    	};

    	geocoder.geocode(geocodeOptions, function(results, status) {
      		if ( status !== google.maps.GeocoderStatus.OK ) {
      			console.log("Geocoder failed!!! ", status);
        		//deferred.reject('Geocoder failed due to: ' + status);
      		}
      		deferred.resolve(results[0].geometry.location);	
    	});

    	return deferred.promise;  // need to call lat() and lng()

  	}

  	var renderMarker = function(transaction, map, bounds){
  		var date = transaction.spent_date || "";

  		var contentString = '<div id="content">'+
      		'<div id="bodyContent">'+
      		'<p style="color: black">' + transaction.name + '</p>'+
       		'<p style="color: black">' + transaction.location + '</p>'+
      		'<p style="color: black">$' + transaction.amount + '</p>'+
      		'<p style="color: black">' + date + '</p>'+
      		'</div>'+
      		'</div>';

  		var infowindow = new google.maps.InfoWindow({
    		content: contentString
  		});

      var icons = {
        "Food & Drink": "assets/google/forkknife.png", // "assets/google/purple-dot.png", 
        "Entertainment": "assets/google/arts.png",
        "Education": "assets/google/graduation.png",
        "Travel": "assets/google/plane.png",
        "Rent": "assets/google/homegardenbusiness.png",
        "Household": "assets/google/grocerystore.png",
        "Transport": "assets/google/cargreen.png",
        "Payments": "assets/google/dollar.png",
        "Shopping": "assets/google/cart.png",
        "Healthcare": "assets/google/redcross.png",
        "Tax": "assets/google/dollar.png",
        "Miscellaneous": "assets/google/miscpin.png"
      };

  		var marker = new google.maps.Marker({
    		position: transaction.latlng, 
    		map: map,
    		title: transaction.name,
        icon: icons[transaction.category]
  		});

  		marker.addListener('mouseover', function() {
    		infowindow.open(map, marker);
  		});

  		marker.addListener('mouseout', function() {
    		infowindow.close(map, marker);
  		});

  		var ll = new google.maps.LatLng(transaction.latlng);
  		
  		bounds.extend(ll);
  	}

  	var setBounds = function(map, bounds){
  		map.fitBounds(bounds);
  	}


  return {
  	makeMap: makeMap,
  	getGeoCode: getGeoCode,
  	renderMarker: renderMarker,
  	setBounds: setBounds

  }
});
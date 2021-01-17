// Global variables
// initialize the map
var map = L.map('map', {zoomControl:false}).fitWorld();
// new L.Control.Zoom({position: 'bottomleft'}).addTo(map);
var lng = 0;
var lat = 0;
var area = 0;
var country = "";
var capital = "";
var currency = "";
var issTimeoutID;
var issMarker;
var issCircle;
var locationMarker;
var bounds;
var issIcon = L.icon({
    iconUrl: '././media/img/iss.png',
    iconSize: [60, 60],
    iconAnchor: [30, 30],
    popupAnchor: [-3, 16]
});

var locationIcon = L.icon({
    iconUrl: '././media/img/location.png',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -10]
});

var polyStyle = {
    "color": "violet",
    "weight": 5,
    "opacity": 0.9
};

// Initialize the map with user location and specifies accuracy in pop up window on the map
function loadMap(){
    // load a tile layer
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}',
        {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,  Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 20,
        id: 'mapbox/dark-v10',
  //       style: 'mapbox://styles/romancevic/ckjbckcml0k2n19ted911sr0h', // style URL
        tileSize: 512,
        zoomOffset: -1,

        accessToken: 'pk.eyJ1Ijoicm9tYW5jZXZpYyIsImEiOiJja2oydWticHE1YWxlMzFxanhwZWY0cXV2In0.8SvxMB7LG3xmbsig-XnR_Q'

        }).addTo(map);

  //      mapboxgl.accessToken = 'pk.eyJ1Ijoicm9tYW5jZXZpYyIsImEiOiJja2oydWticHE1YWxlMzFxanhwZWY0cXV2In0.8SvxMB7LG3xmbsig-XnR_Q';
  //          var map = new mapboxgl.map({
  //              container: 'map', // container id
  //              style: 'mapbox://styles/romancevic/ckjbckcml0k2n19ted911sr0h', // style URL
  //              center: [-74.5, 40], // starting position [lng, lat]
  //              zoom: 9 // starting zoom
  //          });

//  mapbox://styles/mapbox/streets-v11
//mapbox://styles/mapbox/outdoors-v11
//mapbox://styles/mapbox/light-v10
//mapbox://styles/mapbox/dark-v10
//mapbox://styles/mapbox/satellite-v9
//mapbox://styles/mapbox/satellite-streets-v11
//mapbox://styles/mapbox/navigation-preview-day-v4
//mapbox://styles/mapbox/navigation-preview-night-v4
//mapbox://styles/mapbox/navigation-guidance-day-v4
//mapbox://styles/mapbox/navigation-guidance-night-v4


    // Location found handler
    function onLocationFound(e) {
        //console.log(e);

        $.ajax({
            url: "libs/php/getUserCountryCode.php",
            type: 'POST',
            dataType: 'json',
            data: {
                lat: e['latlng']['lat'],
                lng: e['latlng']['lng']
            },
            success: function(result){
                //console.log(result);

              	setFlag(result['data']);

                $.ajax({
                    url: "libs/php/getCountryInfo.php",
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        country: result['data'],
                        lang: 'en'
                    },
                    success: function(result){
                        //console.log(result);
                        if(result.status.code == 200){
                           setCountryInfo(result);
                        }
                    },
                    error: function(jqXHR, textStatus, errorThrown){
                        alert(`#1 ${textStatus} error in country info`);
                    }
                });
            },
            error: function(jqXHR, textStatus, errorThrown){
                alert(`#2 ${textStatus} error in country info`);
            }
        });
    }

    // Error handler
    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    map.locate({setView: false, maxZoom: 16});
};

function setCountryInfo(result) {
    console.log()

    showInfoBtn();
    $('#continent').html(result['data'][0]['continent']);
    capital = result['data'][0]['capital'];
    currency = result['data'][0]['currencyCode'];
    country = result['data'][0]['isoAlpha3'];
  	setCountry(result['data'][0]['countryName'])
    $('#capital').html(capital);
    $('#languages').html(result['data'][0]['languages']);
    $('#population').html(formatPopulation(result['data'][0]['population']));
    lng = (result['data'][0]['north'] + result['data'][0]['south']) / 2;
    lat = (result['data'][0]['east'] + result['data'][0]['west']) / 2;
    $('#area').html(`${formatArea(result['data'][0]['areaInSqKm'])} km<sup>2</sup>`);
    getGeoJson();
    callGeolocation(lng, lat);
}

// Handles map click event
function onMapClick(e) {

	$('.loadingCountry').show();

    $.ajax({
        url: "libs/php/getUserCountryCode.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: e['latlng']['lat'],
            lng: e['latlng']['lng']
        },
        success: function(result){
            //console.log(result);
            setFlag(result['data']);
            $.ajax({
                url: "libs/php/getCountryInfo.php",
                type: 'POST',
                dataType: 'json',
                data: {
                    country: result['data'],
                    lang: 'en'
                },
                success: function(result){

                	if(result.data[0].countryName == $('#country-name').text()) {

                		$('.loadingCountry').hide();

                		return false;
                	}
                    //console.log(result);
                    if(result.status.code == 200){
                       setCountryInfo(result);
                    }
                },
                error: function(jqXHR, textStatus, errorThrown){
                    alert(`${textStatus} error in user country info`);
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`#3 ${textStatus} error in country info`);
        }
    });
}

map.on('click', onMapClick);

// Handles country selection option event
$('#selectCountry').change(function(){

	$('.loadingCountry').show();

    showInfoBtn();
    emptyTable('#table2');
    stopISS();
    $.ajax({
        url: "libs/php/getCountryInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            country: $('#selectCountry').val(),
            lang: 'en'
        },
        success: function(result){

        	if(result.data[0].countryName == $('#country-name').text()) {

        		$('.loadingCountry').hide();

        		return false;
        	}

            //console.log(result);
            if(result.status.code == 200){
               setFlag($('#selectCountry').val());
               setCountryInfo(result);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`#4 ${textStatus} error in country info`);
        }
    });
});

// info modal button trigger handler
$('#infoModal').on('shown.bs.modal', function () {
    $('#myInput').trigger('focus');
  });

function callGeolocation(lng, lat) {
    $.ajax({
        url: "libs/php/getGeolocation.php",
        type: 'POST',
        dataType: 'json',
        data: {
            q: (lng).toString() + ',' + (lat).toString(),
            lang: 'en'
        },
        success: function(result){

            //console.log(result);

            if(result.status.code == 200){
                $('#currency').html(currency);
                getWeatherData();
                getExchangeRateData();
                getISSData();
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`${textStatus} error in geolocation`);
        }
    });
}

// handles ISS tracking mode
$('#btnISS').click(function() {
    if($('#btnISS').html() === 'Track ISS'){
        hideInfoBtn();
        trackISS();
    $('#btnISS').html('Stop ISS');
    }else {
        stopISS();
        $('#btnISS').html('Track ISS');
        map.locate({setView: true, maxZoom: 5});
    }
});

// Updates map with specified latitude and longitude(west subtracted from east)
function updateMarker(lng, lat){
	//console.log(lng, lat)
    if(locationMarker != undefined){
        map.removeLayer(locationMarker);
    }
    locationMarker = L.marker([lng, lat], {icon: locationIcon}).addTo(map);
    $('.loadingCountry').hide();
};


// handles ISS tracking on the map updating it every 3 sec with custom marker
function trackISS () {
    $.ajax({
        url: "libs/php/getIssPosition.php",
        type: 'GET',
        dataType: 'json',
        success: function(result){
            //console.log(result);
            if(result){
                updateISSMarker(result['latitude'],
                result['longitude']);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`Error in ISS pos: ${textStatus} ${errorThrown} ${jqXHR}`);
        }
    });
     issTimeoutID = setTimeout(trackISS, 3000);
}

// ISS marker and circle update function
function updateISSMarker(lat, lon) {
    if(issMarker != undefined && issCircle != undefined){
        map.removeLayer(issMarker);
        map.removeLayer(issCircle);
    }
    issMarker = new L.marker([lat, lon], {icon: issIcon}).addTo(map);
    issCircle = new L.circle([lat, lon], {color: 'gray', opacity: .5}).addTo(map);

    map.flyTo([lat, lon], zoomOffset=5, animate=true);
}

// stops ISS tracking on map
function stopISS() {
    clearTimeout(issTimeoutID);
}

// get current weather open weather api
function getWeatherData(){
    $.ajax({
        url: "libs/php/getWeather.php",
        type: 'POST',
        dataType: 'json',
        data: {
            q: capital
        },
        success: function(result){
            if(result.cod == 200){
                //console.log(result);
                $('#temperature').html(`${Math.floor(parseFloat(result['main']['temp']) - 273.15)} <sup>o</sup>C`);
                $('#humidity').html(`${result['main']['humidity']} %`);
                $('#pressure').html(`${result['main']['pressure']} hPa`);
                lng = result['coord']['lon'];
                lat = result['coord']['lat'];
                updateMarker(result['coord']['lat'], result['coord']['lon']);
            } else {
            	$('.loadingCountry').hide();
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`Error in weather: ${textStatus} : ${errorThrown} : ${jqXHR}`);
        }
    });
}

// get exchange rate open exchange rate api
function getExchangeRateData() {
	return false;
    $.ajax({
        url: "libs/php/getExchangeRate.php",
        type: 'GET',
        dataType: 'json',
        success: function(result){
            if(result){
                //console.log(result);
                $('#exchangeTitle').html(`USD/${currency} XR:`);
                $('#exchangeRate').html(result['rates'][currency]);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`Error in exchange: ${textStatus} ${errorThrown} ${jqXHR}`);
        }
    });
}

// get iss pass data from n2yo api
function getISSData() {
	return false;
    $.ajax({
        url: "libs/php/getIssData.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: lat,
            lng: lng
        },
        success: function(result){
            if(result['passes']){
                //console.log(result);
                $('#issPass').html(`Predicted ISS passes for next 10 days over ${capital}`);
                if(result['passes']){
                    result['passes'].forEach(function (d) {
                        var date = new Date(d['startUTC']*1000);
                        $('#table2').append('<tr><th>' + "<img src='././media/img/iss.svg'></img>" + '</th><td>' + date.toString() + '</td></tr>');
                    }
                    );
                }else {
                    $('#issPass').html(`No visible ISS passes over ${capital} in next 10 days`);
                }
            }else {
                $('#issPass').html(`No visible ISS passes over ${capital} in next 10 days`);
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`Error in iss data: ${textStatus} : ${errorThrown} : ${jqXHR}`);
        }
    });
}

  // get specific country border data from geojson file
function getGeoJson() {
    console.log({
        iso3: 'it',
        country: country
    });

    console.log(`http://api.geonames.org/countryInfoJSON?formatted=true&lang=it&country=${country}&username=Romancevic&style=full`)

    console.log('Hello')

    $.ajax({
        url: "libs/php/getCountryPolygon.php",
        type: 'POST',
        dataType: 'json',
        data: {
            iso3: 'it',
            country: country
        },
        success: function(result){
            console.log(result.data.border);
            if(result){
                if (result.data.countryInfo.geonames.length > 0) {
                    if(bounds != undefined){
                        map.removeLayer(bounds);
                    }
                    bounds = L.geoJSON(result.data.border, {style: polyStyle}).addTo(map);
                    map.flyToBounds(bounds.getBounds(), {
                        animate: true,
                        duration: 2.5
                    });
                    locationMarker.bindPopup(`Capital: ${capital}`).openPopup();
                } else {
                    alert('Данные для данного места не найдены!')
                }
            }
        },
        error: function(jqXHR, textStatus, errorThrown){
            alert(`Error in geojson: ${textStatus} ${errorThrown} ${jqXHR}`);
        }
    });
}

function emptyTable(tabID) {
    $(tabID).empty();
}

function startTime() {
    $('#date-time').html(`Date: ${new Date().toLocaleString()}`);
    setTimeout(startTime, 1000);
}

function showInfoBtn() {
    $('#btnInfo').css("display", "block");
}

function hideInfoBtn() {
    $('#btnInfo').css("display", "none");
}

function formatPopulation(num){
    let pop = parseInt(num);
    if(pop/1000000 > 1){
        return `${(pop/1000000).toFixed(2)} mln`;
    }else if(pop/1000 > 1){
        return `${(pop/1000).toFixed(2)} k`;
    }else {
        return `${pop.toFixed()}`;
    }
}

function formatArea(num){
    let area = Number(num).toPrecision();
    if(area/1000000 > 1){
        return `${(area/1000000).toFixed(2)} mln`;
    }else if(area/1000 > 1) {
        return `${(area/1000).toFixed(2)} k`
    }else {
        return `${area}`;
    }
}

function setCountry(countryName) {
    $('#country-name').html(countryName);
}

function setFlag(iso2code) {
    $('#country-flag').html(`<img src="https://www.countryflags.io/${iso2code}/shiny/64.png"></img>`);
}

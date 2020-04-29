'use strict';

const navBtn = document.getElementById('navigation');
const name = document.getElementById('name');
const address = document.getElementById('address');
const summary = document.getElementById('summary');
const rtLength = document.getElementById('rtLength');
const filterBtn = document.getElementById("FilterBtn");
const checkbox  = document.getElementById("filters");
const rtLengthCB = document.getElementById("routeLength");
const rtDistanceCB = document.getElementById("routeDistance");
const rtDistanceInput = document.getElementById("routeDistanceInput");
const rtLengthInput = document.getElementById("routeLengthInput");
const searchFiltersBtn = document.getElementById("searchFilters");
const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('searchbutton');

searchBtn.addEventListener('click', searchClick);
filterBtn.addEventListener('click', filterClick);
searchFiltersBtn.addEventListener('click', filterSearch);


let currentPos = null;
let markerCoord = [];

// Insert the Leaflet map into the map div
const map = L.map('mapid');

// Creating a layerGroup where markers are put
const layerGroup = L.layerGroup().addTo(map);

// Function for setting the map view
function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 14);
}

// Function for finding the current position of the user
function getPos(pos) {
  currentPos = pos.coords;
  showMap(currentPos);
  addMarker(currentPos, 'Olet tässä.');
  let apiUrl = "http://lipas.cc.jyu.fi/api/sports-places?closeToLon=" +
      currentPos.longitude + "&closeToLat=" + currentPos.latitude +
      "&closeToDistanceKm=100&pageSize=100&typeCodes=4405&page=";
  findTrails(apiUrl);
}

// Error function in the case that geolocation fails
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

/* Function for adding markers into the map
 * A marker will be added into the map with a popup text
 * and a popup function that when executed will display
 * the clicked markers information.
 */
function addMarker(crd, text, data) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(layerGroup).
      bindPopup(`<b>${text}</b>`).
      on('click', function(popup) {
        console.log(data);
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        summary.innerHTML = '';
        rtLength.innerHTML = '';
        markerCoord = [{
          lat: data.location.coordinates.wgs84.lat,
          lon: data.location.coordinates.wgs84.lon
        }];
        navigate(currentPos);
        if (check(data.properties.infoFi)) {
          summary.innerHTML = data.properties.infoFi;
        }

        if (check(data.properties.routeLengthKm)) {
          rtLength.innerHTML = 'Patikointireitin pituus on ' +
              data.properties.routeLengthKm + ' km';
        }
      });
}

// Function for null/undefined checking
function check(data) {
  if (data != undefined) {
    return true;
  } else {
    return false;
  }
}

// Finding the users location
navigator.geolocation.getCurrentPosition(getPos, error);

// The map will use openstreetmap as its base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

/* Function for navigating to the targeted place
 * This function is binded to a button that will open google maps
 * and set the starting point as your location and the ending point
 * as the location you have selected from the map.
 */
function navigate(currentPos) {
  navBtn.addEventListener('click', navClick);

  function navClick(evt) {
    window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${currentPos.latitude},${currentPos.longitude}&destination=${markerCoord[0].lat},${markerCoord[0].lon}&travelmode=driving`);
  }
}
//-------------------------patikointivalinnat.js-----------------------------//
function filterClick() {
  checkbox.style.display = "block";
}

function routeFilters() {
  if (rtLengthCB.checked == true) {
    rtLengthInput.style.display ="block";
  } else {
    rtLengthInput.style.display ="none";
  }

  if(rtDistanceCB.checked == true) {
    rtDistanceInput.style.display ="block";
  } else {
    rtDistanceInput.style.display ="none";
  }
}

function filterSearch() {
  layerGroup.clearLayers();
  if(rtLengthCB.checked == true && rtDistanceCB.checked == false) {
    //haetaan pelkästään lenkin pituuden mukaan
  } else if (rtLengthCB.checked == true && rtDistanceCB.checked == true) {
    // haetaan molempien mukaan
  } else if (rtLengthCB.checked == false && rtDistanceCB.checked == true) {
    //haetaan pelkästään etäisyyden mukaan
    const rtDist = rtDistanceInput.value;
    let apiUrl = "http://lipas.cc.jyu.fi/api/sports-places?closeToLon=" +
        currentPos.longitude + "&closeToLat=" + currentPos.latitude +
        "&closeToDistanceKm="+ rtDist + "&pageSize=100&typeCodes=4405&page=";
    findTrails(apiUrl);
  }
}

/* Function for searching trails with keywords.
 */
function searchClick() {
  console.log('haku nappi painettu');
  layerGroup.clearLayers();
  addMarker(currentPos, 'olet tässä');
  let keyword = keywordInput.value;
  console.log("keyword on ",typeof keyword, keyword);
  let apiUrl;

  if (keyword != '') {
    console.log('keyword tyyppi on', typeof keyword, 'keyword on ', keyword);
    apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?&pageSize=100&typeCodes=4405&searchString=' +
        keyword + '&page=';
  }
  findTrails(apiUrl);
}
//-------------------------Fetching data from Lipas-----------------------------//

// We use a proxyUrl to allow CORS (Cross-origin resource sharing)
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrlId = 'http://lipas.cc.jyu.fi/api/sports-places/';

/* Fetching the type of sports activity we want to use (hiking)
 * The result will be an id which we will use in the next fetch
 */
function findTrails(url) {
  console.log('url osoite on ', url);
  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl + url + i).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      for (let i = data.length - 1; i > 0; i--) {
        // Executing the fetching of individual trails
        findInfo(data[i]);
      }
      document.querySelector('pre').innerHTML = JSON.stringify(data, null, 2);
    }).catch(function(error) {
      console.log('Error: ' + error);
    });
  }
}

// Fetching the trail info with the id that was obtained
function findInfo(data) {
  fetch(proxyUrl + targetUrlId + data.sportsPlaceId).
      then(function(response) {
        return response.json();
      }).then(function(data) {
    const coords = {
      latitude: data.location.coordinates.wgs84.lat,
      longitude: data.location.coordinates.wgs84.lon,
    };
    // Adding a marker to the map with the correct location
    addMarker(coords, data.name, data);
  });
}

//------------------------------------------------------------------------------//

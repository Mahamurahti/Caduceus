'use strict';
//----------------------------DECLARING ELEMENTS-------------------------------//

const navBtn = document.getElementById('navigation');
const resetBtn = document.getElementById('reset');
const name = document.getElementById('name');
const address = document.getElementById('address');
const summary = document.getElementById('summary');
const rtLength = document.getElementById('rtLength');
const filters = document.getElementById('filters');
const rtLengthCB = document.getElementById('routeLength');
const rtDistanceCB = document.getElementById('routeDistance');
const rtDistanceInput = document.getElementById('routeDistanceInput');
const rtLengthInput = document.getElementById('routeLengthInput');
const searchFiltersBtn = document.getElementById('searchFilters');
const keywordInput = document.getElementById('keyword');
const searchBtn = document.getElementById('searchbutton');
const info = document.getElementById('info');
const tutorial = document.getElementById('tutorial');
const loadingIcon = document.getElementById("juttu");
const loadingScreen = document.getElementById("loadingScreen");

//---------------------------------VARIABLES-----------------------------------//
let lastTrail = 0;
let countdown;
//---------------------------------MAP MARKERS---------------------------------//
const redIcon = L.divIcon({
  className: 'red-icon',
  iconSize: [20, 20],
  iconAnchor: [12, 1],
});
const brownIcon = L.divIcon({
  className: 'brown-icon',
  iconSize: [20, 20],
  iconAnchor: [15, 1],
});
// -----------------------------EVENT LISTENERS--------------------------------//
// Event listener for clicking the search button
searchBtn.addEventListener('click', searchClick);

// Event listener for clicking the search filters button
searchFiltersBtn.addEventListener('click', filterSearch);

// Clearing all data and restarting the search around the current position
resetBtn.addEventListener('click', function(evt) {
  layerGroup.clearLayers();
  layerGroupPath.clearLayers();
  navigator.geolocation.getCurrentPosition(getPosAndSurroundings, error);
  info.style.display = 'none';
  tutorial.style.display = 'block';
});
//-----------------------------------------------------------------------------//


let currentPos = null;
let markerCoord = [];
// Inserting the Leaflet map into the map div
const map = L.map('mapid');

// Creating a layerGroup where markers are put
const layerGroup = L.layerGroup().addTo(map);

// Creating a layerGroup where paths are put
const layerGroupPath = L.layerGroup().addTo(map);

// Function for setting the map view
function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 8);
}

//----------------------FINDING THE CURRENT USER POSITION----------------------//
// Function for finding the current position of the user
function getPosAndSurroundings(pos) {
  currentPos = pos.coords;
  showMap(currentPos);
  addMarker(currentPos, 'Olet tässä.', null, redIcon);
  let apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?closeToLon=' +
      currentPos.longitude + '&closeToLat=' + currentPos.latitude +
      '&closeToDistanceKm=100&pageSize=100&typeCodes=4405&page=';
  findTrails(apiUrl);
}

// Error function in the case that geolocation fails
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Finding the users location
navigator.geolocation.getCurrentPosition(getPosAndSurroundings, error);
//-----------------------------------------------------------------------------//

//----------------------------ADDING MARKER TO THE MAP-------------------------//
/* Function for adding markers into the map
 * A marker will be added into the map with a popup text
 * and a popup function that when executed will display
 * the clicked markers information.
 */
function addMarker(crd, text, data, icon) {
  try {
    if(data.sportsPlaceId == lastTrail) {
      console.log("Homma valmis");
        window.setTimeout(finishedLoading, 3000);
    }
  } catch {
    console.log("Tyhjä");
  }

  L.marker([crd.latitude, crd.longitude], {icon: icon}).
      addTo(layerGroup).
      bindPopup(`<b>${text}</b>`).
      on('click', function(popup) {
        try{
          console.log(data);
          info.style.display = 'block';
          tutorial.style.display = 'none';

          // Displaying info about the route
          name.innerHTML = data.name;
          address.innerHTML = data.location.address;
          summary.innerHTML = '';
          rtLength.innerHTML = '';
          markerCoord = [
            {
              lat: data.location.coordinates.wgs84.lat,
              lon: data.location.coordinates.wgs84.lon,
            }];
          /* Adding an event listener to each individual markers navigate button,
           * so that the user can see the route which has to be taken to the
           * destination. Opens Google Maps.
           */
          navigate(currentPos);
          if (check(data.properties.infoFi)) {
            summary.innerHTML = data.properties.infoFi;
          }

          if (check(data.properties.routeLengthKm)) {
            rtLength.innerHTML = 'Patikointireitin pituus on ' +
                data.properties.routeLengthKm + ' km';
          }

          /* Adding a visible path on the map.
           * The route can be very buggy, but it is a fault in the API, not the code
           * since majority of the routes display normal paths and only a minority
           * display a zig zaggy path which make no sense.
           */
          addPath(data);

        } catch{
          console.log("Ei voida lisätä elementtejä markeriin.");
          info.style.display = 'none';
          tutorial.style.display = 'block';
          layerGroupPath.clearLayers();
        }
      });
}

// Function for null/undefined checking in the addMarker function
function check(data) {
  if (data !== undefined) {
    return true;
  } else {
    return false;
  }
}

// The map will use openstreetmap as its base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//-----------------------------------------------------------------------------//

//---------------------------------DRAW PATH-----------------------------------//
// Function for adding a path to the marker
function addPath(data) {
  layerGroupPath.clearLayers();

  let latlngs = [];

  // Fetching the path coordinates from the data
  for(let i = 0; i < 500; i++){
    for(let j = 0; j < 500; j++){
      if(data.location.geometries.features[j] !== undefined){
        if(data.location.geometries.features[j].geometry.coordinates[i] !== undefined){
          latlngs[i] = data.location.geometries.features[j].geometry.coordinates[i];
          // Sorting the coordinates, since they are reversed in the data
          latlngs[i].sort(function(a,b){
            return b - a;
          });
        }
      }
    }
  }
  // For Debugging
  /*
  console.log('Features length', data.location.geometries.features.length);
  for(let i = 0; i <= data.location.geometries.features.length - 1; i++){
    console.log('Coordinate length', data.location.geometries.features[i].geometry.coordinates.length);
  }
  console.log('Latlngs', latlngs);
   */

  // Drawing the path on the map. We use an antPath library for this.
  let path = L.polyline.antPath(latlngs,{"delay":1400,"dashArray":[20,30],"weight":5,"color":"red","paused":false,"reverse":false}
  ).addTo(layerGroupPath);
  map.fitBounds(path.getBounds());
}


//------------------------------DRAW CIRCLE------------------------------------//
// Drawing a circle if the user has defined a search radius
function drawCircle(currentPos) {
    addMarker(currentPos, 'Olet tässä', null, redIcon);
    let circle = L.circle([currentPos.latitude, currentPos.longitude], {
    color: 'brown',
    fillColor: '#734e03',
    fillOpacity: 0.1,
    radius: rtDistanceInput.value * 1000
  }).addTo(layerGroup);
}
//-----------------------------------------------------------------------------//

//-------------------------REMOVE ROUTE INFO-----------------------------------//
//removes route info and shows tutorial if user clicks the map
map.on('click', function() {
  info.style.display = 'none';
  tutorial.style.display = 'block';
  layerGroupPath.clearLayers();
});

//-----------------------------------------------------------------------------//

//-------------------------------NAVIGATE BUTTON-------------------------------//
/* Function for navigating to the targeted place
 * This function is binded to a button that will open google maps
 * and set the starting point as your location and the ending point
 * as the location you have selected from the map.
 */
function navigate(currentPos) {
  navBtn.addEventListener('click', navClick);

  // Opening Google maps to navigate to the target location
  function navClick(evt) {
    window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${currentPos.latitude},${currentPos.longitude}&destination=${markerCoord[0].lat},${markerCoord[0].lon}&travelmode=driving`);
  }
}
//-----------------------------------------------------------------------------//

//--------------------------FILTERING THE SEARCH-------------------------------//
// Displaying the search filters after clicking. If clicked again, hides them.
function filterClick() {
  if (filters.style.display === 'none') {
    filters.style.display = 'block';
  } else {
    filters.style.display = 'none';
    rtLengthCB.checked = false;
    rtDistanceCB.checked = false;
    rtLengthInput.style.display = 'none';
    rtDistanceInput.style.display = 'none';
  }
}

// Checking if the search filter checkboxes are on and displaying options accordingly
function routeFilters() {
  if (rtLengthCB.checked === true) {
    rtLengthInput.style.display = 'block';
  } else {
    rtLengthInput.style.display = 'none';
  }

  if (rtDistanceCB.checked === true) {
    rtDistanceInput.style.display = 'block';
  } else {
    rtDistanceInput.style.display = 'none';
  }
}

// Searching for trails with filters
function filterSearch() {

  layerGroupPath.clearLayers();
  layerGroup.clearLayers();

  // Searching only with Route length filter
  if (rtLengthCB.checked === true && rtDistanceCB.checked === false) {
    if (Number.isInteger(+rtLengthInput.value) && keywordInput.value == "") {
      console.log('On numero');
      let apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?pageSize=100&typeCodes=4405&page=';
      findTrails(apiUrl);
    } else if (Number.isInteger(+rtLengthInput.value) && keywordInput.value != "") {
      findCity(keywordInput.value);
    }
    else  {
      alert('Anna reitin pituus ja etäisyys numeroina!');
      console.log("Pelkkä pituus");
    }
  }
  // Searching only with route distance filter
  else if (rtLengthCB.checked === false && rtDistanceCB.checked === true) {
    if(keywordInput.value != "") {
      alert("Et voi etsiä kaupungista tietyllä säteellä");
    } else {
      if (Number.isInteger(+rtDistanceInput.value)) {
        let apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?closeToLon=' +
            currentPos.longitude + '&closeToLat=' + currentPos.latitude +
            '&closeToDistanceKm=' + rtDistanceInput.value +
            '&pageSize=100&typeCodes=4405&page=';
        findTrails(apiUrl);
        drawCircle(currentPos);
      } else {
        alert('Anna reitin pituus ja etäisyys numeroina!');
        console.log("Pelkkä etäisyys");
      }
    }
  }
  // Searching with both filters
  else if (rtLengthCB.checked === true && rtDistanceCB.checked === true) {
    if(keywordInput.value !="") {
      alert("Et voi etsiä kaupungista tietyllä säteellä!");
    } else {
      if (Number.isInteger(+rtDistanceInput.value) &&
          Number.isInteger(+rtLengthInput.value)) {
        let apiUrl = 'http://lipas.cc.jyu.fi/api/sports-places?closeToLon=' +
            currentPos.longitude + '&closeToLat=' + currentPos.latitude +
            '&closeToDistanceKm=' + rtDistanceInput.value +
            '&pageSize=100&typeCodes=4405&page=';
        findTrails(apiUrl);
        drawCircle(currentPos);
      } else {
        alert('Anna reitin pituus ja etäisyys numeroina!');
        console.log("Molemmat: etäisyys sekä pituus");
      }
    }
  }
}

//-----------------------------------------------------------------------------//

// Function for searching trails with keywords.
function searchClick() {
  console.log('Haku nappia painettu');
  layerGroupPath.clearLayers();
  layerGroup.clearLayers();
  addMarker(currentPos, 'Olet tässä', null, redIcon);
  let keyword = keywordInput.value;
  findCity(keyword);
}

function loading() {
  clearTimeout(countdown);
  loadingIcon.style.visibility = "visible";
  loadingScreen.style.visibility ="visible";
}

function finishedLoading() {
  loadingIcon.style.visibility = "hidden";
  loadingScreen.style.visibility ="hidden";
}
//-------------------------FETCHING DATA FROM LIPAS----------------------------//
// We use a proxyUrl to allow CORS (Cross-origin resource sharing)
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrlId = 'http://lipas.cc.jyu.fi/api/sports-places/';

/* Fetching the type of sports activity we want to use (hiking)
 * The result will be an id which we will use in the next fetch
 */
function findTrails(url) {
  loading();
  // First for-loop to cycle throught the pages (7 pages)
  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl + url + i).
        then(function(response) {
          return response.json();
        }).then(function(data) {
      for (let i = data.length - 1; i > 0; i--) {
        // Executing the fetching of individual trails
        lastTrail = data[i].sportsPlaceId;
        findInfo(data[i].sportsPlaceId);
      }
      document.querySelector('pre').innerHTML = JSON.stringify(data, null,
          2);
    }).catch(function(error) {
      console.log('Error: ' + error);
    });
  }
}

//fetching Trails from certain cities using different API
function findCity(city) {
  fetch(`https://bridge.buddyweb.fr/api/hikingtrails/hikingtrails?kunta=` + city).
      then(function(response) {
        return response.json();
      }).then(function(cityTrails) {
        for(let i = 0; i < cityTrails.length; i++) {
          lastTrail = cityTrails[i].sportsplaceid;
          console.log("Haetaan reittiä ", cityTrails[i].sportsplaceid);
          findInfo(cityTrails[i].sportsplaceid);
        }
  })
}
// Fetching the trail info with the id that was obtained
function findInfo(data) {
  loading();
  fetch(proxyUrl + targetUrlId + data).
      then(function(response) {
        return response.json();
      }).then(function(data) {
        clearTimeout(countdown);
        try {
          if (rtLengthCB.checked && rtLengthInput.value <
              data.properties.routeLengthKm) {
            console.log("Reitti riittävän pitkä, reitti on ",
                data.sportsPlaceId);
            const coords = {
              latitude: data.location.coordinates.wgs84.lat,
              longitude: data.location.coordinates.wgs84.lon,
            };
            // Adding a marker to the map with the correct location of the trail
            addMarker(coords, data.name, data, brownIcon);

          } else if (!rtLengthCB.checked) {
            const coords = {
              latitude: data.location.coordinates.wgs84.lat,
              longitude: data.location.coordinates.wgs84.lon,
            };
            // Adding a marker to the map with the correct location of the trail
            addMarker(coords, data.name, data, brownIcon);
          } else {
            if (data.sportsPlaceId == lastTrail) {
              console.log("Valmis");
              finishedLoading();
            }
          }
          countdown = setTimeout(finishedLoading, 1000);
        } catch {
          console.warn("Virhe, aikaa 10 sek ennen kuin lataus loppuu");
          countdown = setTimeout(finishedLoading, 10000);
        }
  });
}
//-----------------------------------------------------------------------------//

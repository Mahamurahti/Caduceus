'use strict';

const navBtn = document.getElementById("navigation");
const navLink = document.getElementById("navLink");

const name = document.getElementById('name');
const address = document.getElementById('address');
const summary = document.getElementById('summary');

let currentPos = null;

// Insert the Leaflet map into the map div
const map = L.map('mapid');

// Function for setting the map view
function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 14);
}

// Function for finding the current position of the user
function getPos(pos) {
  currentPos = pos.coords;
  showMap(currentPos);
  addMarker(currentPos, 'Olet tässä.');
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
      addTo(map).
      bindPopup(`<b>${text}</b>`).
      openPopup().
      on('popupopen', function(popup) {
        console.log(data);
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        navigate(currentPos, crd);
        if(data.properties.infoFi != undefined){
          summary.innerHTML = data.properties.infoFi;
        }
      });
  console.log(data);
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
 * as the location you have selected from the map
 */
function navigate(currentPos, crd) {
  navBtn.addEventListener('click', navClick);
  function navClick(evt) {
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${currentPos.latitude},${currentPos.longitude}&destination=${crd.latitude},${crd.longitude}&travelmode=driving`);
  }
}
//-------------------------Fetching data from Lipas-----------------------------//

// We use a proxyUrl to allow CORS (Cross-origin resource sharing)
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrlType = 'http://lipas.cc.jyu.fi/api/sports-places?typeCodes=4405',
    targetUrlId = 'http://lipas.cc.jyu.fi/api/sports-places/';

/* Fetching the type of sports activity we want to use (hiking)
 * The result will be an id which we will use in the next fetch
 */
fetch(proxyUrl + targetUrlType).then(function(response) {
  return response.json();
}).then(function(data) {
  console.log(data);
  for (let i = 0; i < data.length; i++) {
    // Executing the fetching of individual trails
    findInfo(data[i]);
  }
  document.querySelector('pre').innerHTML = JSON.stringify(data, null, 2);
}).catch(function(error) {
  console.log('Error: ' + error);
});

// Fetching the trail info with the id that was obtained
function findInfo(data) {
  fetch(proxyUrl + targetUrlId + data.sportsPlaceId).
      then(function(response) {
        return response.json();
      }).then(function(data) {
        console.log(data);
        const coords = {
          latitude: data.location.coordinates.wgs84.lat,
          longitude: data.location.coordinates.wgs84.lon,
        };
        // Adding a marker to the map with the correct location
        addMarker(coords,data.name, data)
  })
}
//------------------------------------------------------------------------------//

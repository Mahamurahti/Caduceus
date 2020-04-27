'use strict';

const navBtn = document.getElementById('navigation');
const name = document.getElementById('name');
const address = document.getElementById('address');
const summary = document.getElementById('summary');
const rtLength = document.getElementById('rtLength');

let currentPos = null;
var markerGroup;

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
  findTrails();
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
  markerGroup = L.layerGroup().addTo(map);
  L.marker([crd.latitude, crd.longitude]).
      addTo(markerGroup).
      bindPopup(`<b>${text}</b>`).
      on('click', function(popup) {
        console.log(data);
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        summary.innerHTML = '';
        rtLength.innerHTML = '';

        if (check(data.properties.infoFi)) {
          summary.innerHTML = data.properties.infoFi;
        }

        if (check(data.properties.routeLengthKm)) {
          rtLength.innerHTML = 'reitin pituus on ' +
              data.properties.routeLengthKm + ' km';
        }
        navigate(currentPos, crd);
      });
}

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
 * as the location you have selected from the map
 */
function navigate(currentPos, crd) {
  navBtn.addEventListener('click', navClick);

  function navClick(evt) {
    window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${currentPos.latitude},${currentPos.longitude}&destination=${crd.latitude},${crd.longitude}&travelmode=driving`);
  }
}

//-------------------------Fetching data from Lipas-----------------------------//

// We use a proxyUrl to allow CORS (Cross-origin resource sharing)
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrlId = 'http://lipas.cc.jyu.fi/api/sports-places/';

/* Fetching the type of sports activity we want to use (hiking)
 * The result will be an id which we will use in the next fetch
 */

function findTrails() {
  for (let i = 1; i < 7; i++) {

    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?closeToLon=${currentPos.longitude}&closeToLat=${currentPos.latitude}&page=${i}&closeToDistanceKm=100&typeCodes=4405`).
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

    if (check(data.location.coordinates.wgs84.lat) &&
        check(data.location.coordinates.wgs84.lon)) {
      const coords = {
        latitude: data.location.coordinates.wgs84.lat,
        longitude: data.location.coordinates.wgs84.lon,
      };
      // Adding a marker to the map with the correct location
      addMarker(coords, data.name, data);
    }



  });

}
//------------------------------------------------------------------------------//

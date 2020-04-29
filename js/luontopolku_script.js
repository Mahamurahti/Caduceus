'use strict';

const name = document.getElementById('name');
const address = document.getElementById('address');
const city = document.getElementById('city');
const length = document.getElementById('length');
const summary = document.getElementById('summary');
const navigate = document.getElementById('navigate');
const proxyUrl = `https://cors-anywhere.herokuapp.com/`;
const searchButton = document.getElementById('searchbutton');
const resetButton = document.getElementById('reset');
const input = document.getElementById('input');

const blueIcon = L.divIcon({className: 'blue-icon',
  iconSize: [30, 30],
  iconAnchor: [1, 30]});
const greenIcon = L.divIcon({className: 'green-icon',
  iconSize: [30, 30],
  iconAnchor: [1, 30]
});

let myLocation = null;
const map = L.map('map');

//Layer group created for the markers
const LayerGroup = L.layerGroup().addTo(map);

//Using openstreetmap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

searchButton.addEventListener('click', function() {
  searchByKeyword();
});

resetButton.addEventListener('click', function() {
  LayerGroup.clearLayers();
  addMarker(myLocation, 'Olen tässä', blueIcon);
  searchNature();
});


//Function sets the map view
function showMap() {
  map.setView([myLocation.latitude, myLocation.longitude], 13);
}

//Function locates the user
function userLocation(pos) {
  myLocation = pos.coords;
  showMap(myLocation);
  addMarker(myLocation, 'Olen tässä', blueIcon);
  searchNature();
}

//Function adds marker on the map
function addMarker(crd, teksti, icon, data) {
  L.marker([crd.latitude, crd.longitude], {icon: icon}).
      addTo(LayerGroup).
      bindPopup(teksti).
      on('click', function() {
        document.getElementById('info').style.visibility = 'visible';
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        city.innerHTML = data.location.city.name;
        if (data.properties.routeLengthKm != null) {
          length.innerHTML = 'Luontoreitin pituus on ' +
              data.properties.routeLengthKm + ' km.';
        }
        if (data.properties.infoFi != null) {
          summary.innerHTML = data.properties.infoFi;
        }
        navigate.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${myLocation.latitude}, ${myLocation.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      });
}

//Function starts if geolocation search fails
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//Start geolocation search
navigator.geolocation.watchPosition(userLocation, error);

/*Function for fetching sport places by type code for nature trails (4404)
*Shows nature trails within 100km radius from user location
* First for-loop is for showing all search results. Data is in paginated format and thus can show maximum 100 search results per pager. */
function searchNature() {

  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?closeToLon=${myLocation.longitude}&closeToLat=${myLocation.latitude}&closeToDistanceKm=100&typeCodes=4404&pageSize=100&page=${i}`).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      console.log(data);

      for (let j = 0; j < data.length; j++) {
        findTrail(data[j]);
      }

    }).catch(function(error) {
      console.log(error);
    });
  }
}

//Function fetches nature trail information
function findTrail(data) {
  fetch(proxyUrl +
      `http://lipas.cc.jyu.fi/api/sports-places/${data.sportsPlaceId}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {

    const coords = {
      latitude: data.location.coordinates.wgs84.lat,
      longitude: data.location.coordinates.wgs84.lon,
    };
    const teksti = `
              <p style="font-weight: bold">${data.name} </p>
              <p>${data.location.address} <br> ${data.location.city.name}</p>
            `;
    addMarker(coords, teksti, greenIcon, data);
  });
}

//Function for searching nature tarils by user input keuword
function searchByKeyword() {

  LayerGroup.clearLayers();
  addMarker(myLocation, 'Olet tässä', blueIcon);
  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?searchString=${input.value}&typeCodes=4404&pageSize=100&page=${i}`).
        then(function(response) {
          return response.json();
        }).then(function(data) {

      console.log(data);

      for (let j = 0; j < data.length; j++) {
        findTrail(data[j]);
      }

    }).catch(function(error) {
      console.log(error);
    });
  }

}















'use strict';

const name = document.getElementById('name');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');
const navigate = document.getElementById('navigate');
const proxyUrl = `https://cors-anywhere.herokuapp.com/`;

const searchButton = document.getElementById('searchbutton');
const input = document.getElementById('input');

const blueIcon = L.divIcon({className: 'blue-icon'});
const greenIcon = L.divIcon({className: 'green-icon'});

let myLocation = null;
const map = L.map('map');
const LayerGroup = L.layerGroup().addTo(map);


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

searchButton.addEventListener('click', function() {
  searchCity();

});

function showMap(crd) {
  map.setView([myLocation.latitude, myLocation.longitude], 13);
}

function userLocation(pos) {
  myLocation = pos.coords;
 showMap(myLocation)
  addMarker(myLocation, 'Olen tässä', blueIcon);
  searchNature();
}

navigator.geolocation.watchPosition(userLocation, error);


function searchNature() {

  for (let i = 1; i < 7; i++) {
    fetch(proxyUrl +
        `http://lipas.cc.jyu.fi/api/sports-places?closeToLon=${myLocation.longitude}&closeToLat=${myLocation.latitude}&closeToDistanceKm=50&typeCodes=4404&pageSize=100&page=${i}`).
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

function findTrail(data, crd) {
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
              <h3>${data.name}</h3>
              <h4>${data.location.address}</h4>
              <br>
              <p>${data.location.city.name}</p>

            `;
    addMarker(coords, teksti, greenIcon, data);
  });
}

function searchCity() {

  LayerGroup.clearLayers();
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

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addMarker(crd, teksti, icon, data) {
  L.marker([crd.latitude, crd.longitude], {icon: icon}).
      addTo(LayerGroup).
      bindPopup(teksti).
      on('click', function() {
        document.getElementById('info').style.visibility='visible';
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        city.innerHTML = data.location.city.name;
        summary.innerHTML = data.properties.infoFi;
        navigate.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${myLocation.latitude}, ${myLocation.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      });
}











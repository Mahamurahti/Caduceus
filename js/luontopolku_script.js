'use strict';

const name = document.getElementById('name');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');
const navigate = document.getElementById('navigate');

/*const searchButton = document.getElementById('searchButton');
const input = document.getElementById('input');
input.addEventListener('keyup',searchNatureTrail); */

let myLocation = null;
const map = L.map('map');


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);


function userLocation(pos) {
  myLocation = pos.coords;
  searchNatureTrail(myLocation);
  map.setView([myLocation.latitude, myLocation.longitude], 13);
  addMarker(myLocation, 'Olen tässä');
}


function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

//Search location
navigator.geolocation.getCurrentPosition(userLocation, error);

/*Fetching sports places by typeCodes, where 4404 is a code for nature trails */
let proxyUrl = `https://cors-anywhere.herokuapp.com/`,
    targetUrl = `http://lipas.cc.jyu.fi/api/sports-places?typeCodes=4404`;

fetch(proxyUrl + targetUrl).
    then(function(response) {
      return response.json();
    }).then(function(data) {

  console.log(data);

  for (let i = 0; i < data.length; i++) {
    searchNatureTrail(data[i]);
  }
});

function searchNatureTrail(data) {
  fetch(proxyUrl + `http://lipas.cc.jyu.fi/api/sports-places/${data.sportsPlaceId}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {
    console.log(data);

    const coordinates = {
      latitude: data.location.coordinates.wgs84.lat,
      longitude: data.location.coordinates.wgs84.lon

    };

    const teksti = `
            <h3>${data.name}</h3>
            <h4>${data.location.address}</h4>
            <br>
            <p>${data.location.city.name}</p>

          `;

    addMarker(coordinates, teksti, data);

  });
}

/*searchButton.addEventListener('click', function(){
  searchNatureTrail();
}); */

function addMarker(crd, teksti, data) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup(teksti).
      openPopup().
      on('click', function() {
        name.innerHTML = data.name;
        address.innerHTML = data.location.address;
        city.innerHTML = data.location.city.name;
        summary.innerHTML = data.properties.infoFi;
        navigate.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${myLocation.latitude}, ${myLocation.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      });
}
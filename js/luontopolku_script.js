'use strict';

const name = document.getElementById('name');
const difficulty = document.getElementById('difflevel');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');


const searchButton = document.getElementById('searchButton');
const input = document.getElementById('input');
input.addEventListener('keyup',searchNatureTrail);

let myLocation = null;

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Asetukset paikkatiedon hakua varten (valinnainen)
const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};


function userLocation(pos) {
  myLocation = pos.coords;

  // Tulostetaan paikkatiedot konsoliin
  console.log('Your current position is:');
  console.log(`Latitude : ${myLocation.latitude}`);
  console.log(`Longitude: ${myLocation.longitude}`);
  console.log(`More or less ${myLocation.accuracy} meters.`);

  // Käytetään leaflet.js -kirjastoa näyttämään sijainti kartalla (https://leafletjs.com/)
  map.setView([myLocation.latitude, myLocation.longitude], 13);

}

searchButton.addEventListener('click', function(){
  searchNatureTrail();
});


function searchNatureTrail() {
  fetch (`https://citynature.eu/api/wp/v2/places?cityid=5&lat=${input.value}`).
      then(function(result) {
        return result.json();
      }).then(function(natureTrails) {
    console.log(natureTrails);


  })
}

function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(userLocation, error, options);
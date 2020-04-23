'use strict';

const name = document.getElementById('name');
const difficulty = document.getElementById('difflevel');
const address = document.getElementById('address');
const city = document.getElementById('city');
const summary = document.getElementById('summary');


const searchButton = document.getElementById('searchButton');
const input = document.getElementById('input');

let myLocation = null;

const map = L.map('map');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let proxyURL = `https://cors-anywhere.herokuapp.com/`,
    targetURL = `http://lipas.cc.jyu.fi/api/sports-place-types?lang=fi`
fetch(proxyURL + targetURL).
then(function(response) {
  return response.json();
}).then(function(data) {

  console.log(data);
  //for loop

});

function searchNatureTrail(data) {
  fetch (`http://lipas.cc.jyu.fi/api/sports-places/${data.}`).
      then(function(response) {
        return response.json();
      }).then(function(data) {
    console.log(data);


  })
}






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

/*searchButton.addEventListener('click', function(){
  searchNatureTrail();
}); */


function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(userLocation, error);

function addMarker(crd, text, data) {
  L.marker([crd.latitude, crd.longitude]).
      addTo(map).
      bindPopup(text).
      openPopup().
      on('click', function() {
        name.innerHTML = trail.title;
        address.innerHTML = latauspiste.AddressInfo.AddressLine1;
        kaupunki.innerHTML = latauspiste.AddressInfo.Town;
        lisatiedot.innerHTML = latauspiste.AddressInfo.AccessComments;
        navigoi.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&origin=${paikka.latitude}, ${paikka.longitude}&destination=${crd.latitude}, ${crd.longitude}`;
      })

  ;


}
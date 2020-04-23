'use strict';

const name = document.getElementById("name");
const address = document.getElementById("address");
let currentPos = null;

const map = L.map('mapid');

function showMap(crd) {
  map.setView([crd.latitude, crd.longitude], 14);
}

function getPos(pos){
  currentPos = pos.coords;
  showMap(currentPos);
  addMarker(currentPos);
}

function error(err){
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

function addMarker(crd, data){
  L.marker([crd.latitude, crd.longitude]).addTo(map).bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();;
  console.log(data);
}

navigator.geolocation.getCurrentPosition(getPos, error);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

//------------------------------------------------------------------------------//
let proxyUrl = 'https://cors-anywhere.herokuapp.com/',
    targetUrl = 'http://lipas.cc.jyu.fi/api/sports-place-types?lang=fi';
fetch(proxyUrl + targetUrl)
.then(function(response) {
  return response.json();
})
.then(function(data) {
  console.table(data);
  document.querySelector("pre").innerHTML = JSON.stringify(data, null, 2);
  return data;
})
.catch(function(error) {
  console.log('Error: ' + error);
});
//------------------------------------------------------------------------------//
